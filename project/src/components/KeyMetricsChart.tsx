import React, { useEffect, useRef } from 'react';
import { 
  Users, 
  Bus, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { Chart } from 'chart.js/auto';

interface KeyMetricsChartProps {
  chartType: 'bar' | 'line' | 'pie';
  isExpanded: boolean;
}

const KeyMetricsChart: React.FC<KeyMetricsChartProps> = () => {
  const studentsChartRef = useRef<HTMLCanvasElement>(null);
  const routesChartRef = useRef<HTMLCanvasElement>(null);
  const stopsChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const createSparkline = (canvas: HTMLCanvasElement, data: { value: number; date: string }[], color: string, lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid') => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, `${color}20`);
      gradient.addColorStop(1, `${color}05`);

      const borderDashConfig = {
        solid: [],
        dashed: [4, 4],
        dotted: [2, 2]
      };

      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(d => d.date),
          datasets: [{
            data: data.map(d => d.value),
            borderColor: color,
            backgroundColor: gradient,
            borderWidth: 1.5,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: color,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 1.5,
            borderDash: borderDashConfig[lineStyle]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: 0 },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              titleFont: { size: 10 },
              bodyFont: { size: 10 },
              padding: 6,
              displayColors: false,
              callbacks: {
                label: (context) => {
                  return ` ${context.parsed.y.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    };

    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const studentsData = dates.map(date => ({
      date,
      value: 24000 + Math.floor(Math.random() * 1000)
    }));

    const routesData = dates.map(date => ({
      date,
      value: 800 + Math.floor(Math.random() * 100)
    }));

    const stopsData = dates.map(date => ({
      date,
      value: 5000 + Math.floor(Math.random() * 1000)
    }));

    const charts: Chart[] = [];

    if (studentsChartRef.current) {
      charts.push(createSparkline(studentsChartRef.current, studentsData, '#9333ea', 'solid'));
    }
    if (routesChartRef.current) {
      charts.push(createSparkline(routesChartRef.current, routesData, '#ec4899', 'dashed'));
    }
    if (stopsChartRef.current) {
      charts.push(createSparkline(stopsChartRef.current, stopsData, '#6366f1', 'dotted'));
    }

    return () => charts.forEach(chart => chart.destroy());
  }, []);

  return (
    <div className="widget-container">
      <div className="widget-header">
        <div>
          <h2 className="text-base font-semibold text-purple-600">Overview</h2>
          <p className="text-sm font-medium text-gray-600 mt-0.5">Transportation Overview</p>
          <p className="text-xs text-gray-500 mt-0.5">Shows real-time metrics and trends for the current month.</p>
        </div>
      </div>
      
      <div className="widget-content">
        <div className="space-y-1">
          <div className="metric-row">
            <div className="flex items-start gap-2">
              <div className="metric-icon bg-purple-50">
                <Users size={16} className="text-purple-600" />
              </div>
              <div className="metric-content">
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-gray-900">24,563</span>
                  <div className="flex items-center gap-0.5 text-emerald-600">
                    <TrendingUp size={12} />
                    <span className="text-xs font-medium">+2.4%</span>
                  </div>
                </div>
                <p className="metric-label">Students Assigned</p>
                <p className="metric-subtext">105 New, 65 Updated</p>
              </div>
            </div>
            <div className="sparkline-container">
              <canvas ref={studentsChartRef} />
            </div>
          </div>

          <div className="metric-row">
            <div className="flex items-start gap-2">
              <div className="metric-icon bg-pink-50">
                <Bus size={16} className="text-pink-600" />
              </div>
              <div className="metric-content">
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-gray-900">845</span>
                  <div className="flex items-center gap-0.5 text-red-600">
                    <TrendingDown size={12} />
                    <span className="text-xs font-medium">-1.2%</span>
                  </div>
                </div>
                <p className="metric-label">Planned Routes</p>
                <p className="metric-subtext">8 Updated, 1 Ended</p>
              </div>
            </div>
            <div className="sparkline-container">
              <canvas ref={routesChartRef} />
            </div>
          </div>

          <div className="metric-row">
            <div className="flex items-start gap-2">
              <div className="metric-icon bg-indigo-50">
                <MapPin size={16} className="text-indigo-600" />
              </div>
              <div className="metric-content">
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-gray-900">5,566</span>
                  <div className="flex items-center gap-0.5 text-emerald-600">
                    <TrendingUp size={12} />
                    <span className="text-xs font-medium">+3.8%</span>
                  </div>
                </div>
                <p className="metric-label">Planned Stops</p>
                <p className="metric-subtext">14 New, 1 Updated</p>
              </div>
            </div>
            <div className="sparkline-container">
              <canvas ref={stopsChartRef} />
            </div>
          </div>

          <div className="mt-1 pt-1 border-t border-gray-100">
            <div className="flex items-start gap-1.5">
              <AlertCircle size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-[13px] text-gray-600 leading-tight">
                Overall positive trends with increased assignments (+2.4%) and stops (+3.8%). Routes need attention (-1.2%).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyMetricsChart;