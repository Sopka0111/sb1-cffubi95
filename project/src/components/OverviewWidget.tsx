import React, { useEffect, useRef } from 'react';
import { Users, Route, MapPin, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Chart } from 'chart.js/auto';

interface SparklineData {
  value: number;
  date: string;
}

interface MetricConfig {
  id: string;
  label: string;
  value: string;
  subtext: string;
  icon: keyof typeof iconComponents;
  sparkline: {
    data: SparklineData[];
    trend: 'up' | 'down';
    percentage: string;
    color: string;
  };
}

const iconComponents = {
  users: Users,
  route: Route,
  'map-pin': MapPin
};

const iconColors = {
  users: {
    bg: 'bg-purple-50',
    text: 'text-purple-600'
  },
  route: {
    bg: 'bg-pink-50',
    text: 'text-pink-600'
  },
  'map-pin': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600'
  }
};

const defaultConfig: MetricConfig[] = [
  {
    id: 'students',
    label: 'Students Assigned Transportation',
    value: '24,563',
    subtext: '(105 New, 65 Updated, 40 Ended)',
    icon: 'users',
    sparkline: {
      data: Array.from({ length: 7 }, (_, i) => ({
        value: 24000 + Math.floor(Math.random() * 1000),
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })),
      trend: 'up',
      percentage: '+2.4%',
      color: '#9333ea'
    }
  },
  {
    id: 'routes',
    label: 'Planned Routes',
    value: '845',
    subtext: '(8 Updated, 1 Ended)',
    icon: 'route',
    sparkline: {
      data: Array.from({ length: 7 }, (_, i) => ({
        value: 800 + Math.floor(Math.random() * 100),
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })),
      trend: 'up',
      percentage: '+1.8%',
      color: '#ec4899'
    }
  },
  {
    id: 'stops',
    label: 'Planned Stops',
    value: '5,566',
    subtext: '(14 New, 1 Updated, 3 Ended)',
    icon: 'map-pin',
    sparkline: {
      data: Array.from({ length: 7 }, (_, i) => ({
        value: 5200 + Math.floor(Math.random() * 400),
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })),
      trend: 'up',
      percentage: '+3.8%',
      color: '#6366f1'
    }
  }
];

const OverviewWidget: React.FC = () => {
  const sparklineRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const chartInstances = useRef<Chart[]>([]);

  useEffect(() => {
    chartInstances.current.forEach(chart => chart.destroy());
    chartInstances.current = [];

    defaultConfig.forEach((metric, index) => {
      const canvas = sparklineRefs.current[index];
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const gradient = ctx.createLinearGradient(0, 0, 0, 40);
      gradient.addColorStop(0, `${metric.sparkline.color}20`);
      gradient.addColorStop(1, `${metric.sparkline.color}05`);

      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: metric.sparkline.data.map(d => d.date),
          datasets: [{
            data: metric.sparkline.data.map(d => d.value),
            borderColor: metric.sparkline.color,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: metric.sparkline.color,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            pointHitRadius: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 2,
              right: 2,
              bottom: 2,
              left: 2
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              titleFont: {
                size: 11,
                family: "'Inter', system-ui, sans-serif"
              },
              bodyFont: {
                size: 11,
                family: "'Inter', system-ui, sans-serif"
              },
              padding: 8,
              displayColors: false,
              callbacks: {
                label: (context) => {
                  return ` ${context.parsed.y.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            x: {
              display: false
            },
            y: {
              display: false,
              min: Math.min(...metric.sparkline.data.map(d => d.value)) * 0.95,
              max: Math.max(...metric.sparkline.data.map(d => d.value)) * 1.05
            }
          }
        }
      });

      chartInstances.current.push(chart);
    });

    return () => {
      chartInstances.current.forEach(chart => chart.destroy());
      chartInstances.current = [];
    };
  }, []);

  return (
    <div className="widget-container">
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-purple-600">Overview</h3>
        <p className="text-sm font-medium text-gray-600 mt-0.5">Key Transportation Metrics</p>
        <p className="text-xs text-gray-500 mt-0.5">Real-time monitoring of student assignments, routes, and stops for March 2025.</p>
      </div>
      
      <div className="p-3 space-y-4 flex-1">
        {defaultConfig.map((metric, index) => {
          const IconComponent = iconComponents[metric.icon];
          const iconStyle = iconColors[metric.icon];

          return (
            <div key={metric.id} className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${iconStyle.bg} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent size={16} className={iconStyle.text} />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900">{metric.value}</span>
                    <div className={`flex items-center gap-0.5 ${
                      metric.sparkline.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {metric.sparkline.trend === 'up' ? (
                        <TrendingUp size={14} />
                      ) : (
                        <TrendingDown size={14} />
                      )}
                      <span className="text-xs font-medium">{metric.sparkline.percentage}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700">{metric.label}</p>
                    <p className="text-xs text-gray-500">{metric.subtext}</p>
                  </div>
                </div>
              </div>
              <div className="w-28 h-12">
                <canvas
                  ref={el => sparklineRefs.current[index] = el}
                  className="w-full h-full"
                />
              </div>
            </div>
          );
        })}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-medium text-gray-900">Summary</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Overall transportation metrics show positive trends with a {defaultConfig[0].sparkline.percentage} increase in student assignments. 
                Route efficiency has improved by {defaultConfig[1].sparkline.percentage}, while stop coverage expanded by {defaultConfig[2].sparkline.percentage}. 
                Key areas requiring attention include 3 routes with timing adjustments and 2 zones needing capacity rebalancing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewWidget;