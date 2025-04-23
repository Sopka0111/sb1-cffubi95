import React, { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import Papa from 'papaparse';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface OnTimePerformanceChartProps {
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut';
  isExpanded?: boolean;
}

interface PerformanceData {
  date: string;
  'Planned Runs': number;
  matchedRuns: number;
  onTimeRunsBell: number;
  OnTimeByDay: string;
  onTimeRunsPlanned: number;
  unmatched: number;
  'UnMatched%': string;
}

const OnTimePerformanceChart: React.FC<OnTimePerformanceChartProps> = ({ 
  chartType = 'line',
  isExpanded = false 
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<'up' | 'down'>('up');
  const [average, setAverage] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await new Promise<PerformanceData[]>((resolve, reject) => {
          Papa.parse('/data/route_performance.csv', {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const parsedData = results.data
                .filter((row: any) => row.date && row.OnTimeByDay)
                .map((row: any) => ({
                  date: row.date,
                  'Planned Runs': parseInt(row['Planned Runs']),
                  matchedRuns: parseInt(row.matchedRuns),
                  onTimeRunsBell: parseInt(row.onTimeRunsBell),
                  OnTimeByDay: row.OnTimeByDay.replace('%', ''),
                  onTimeRunsPlanned: parseInt(row.onTimeRunsPlanned),
                  unmatched: parseInt(row.unmatched),
                  'UnMatched%': row['UnMatched%']
                }));
              resolve(parsedData);
            },
            error: (error) => reject(error)
          });
        });

        setData(result);
        calculateTrendAndAverage(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateStr: string): string => {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTrendAndAverage = (performanceData: PerformanceData[]) => {
    const percentages = performanceData.map(d => parseFloat(d.OnTimeByDay));
    const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    setAverage(avg);

    const lastTwo = percentages.slice(-2);
    setTrend(lastTwo[1] >= lastTwo[0] ? 'up' : 'down');
  };

  const createChart = () => {
    if (!chartRef.current || !data.length) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartType === 'pie' || chartType === 'doughnut') {
      const onTimePercentage = parseFloat(data[data.length - 1].OnTimeByDay);
      const latePercentage = 100 - onTimePercentage;

      chartInstance.current = new Chart(ctx, {
        type: chartType,
        data: {
          labels: ['On Time', 'Late'],
          datasets: [{
            data: [onTimePercentage, latePercentage],
            backgroundColor: [
              'rgba(147, 51, 234, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: [
              'rgb(147, 51, 234)',
              'rgb(239, 68, 68)'
            ],
            borderWidth: 1,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: chartType === 'doughnut' ? '75%' : undefined,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
                font: { size: 11 }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  const count = Math.round((value / 100) * data[data.length - 1].matchedRuns);
                  return [
                    ` ${value.toFixed(1)}% (${count} routes)`,
                    ` of ${data[data.length - 1].matchedRuns} total routes`
                  ];
                }
              }
            }
          }
        }
      });

      if (chartType === 'doughnut') {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const centerX = chartRef.current.width / 2;
        const centerY = chartRef.current.height / 2;
        
        ctx.font = "bold 24px 'Inter'";
        ctx.fillStyle = '#111827';
        ctx.fillText(`${onTimePercentage.toFixed(1)}%`, centerX, centerY);
        
        ctx.font = "12px 'Inter'";
        ctx.fillStyle = '#6B7280';
        ctx.fillText('On Time', centerX, centerY + 24);
        
        ctx.restore();
      }
    } else {
      const targetPercentage = 95;
      const dates = data.map(d => formatDate(d.date));
      const percentages = data.map(d => parseFloat(d.OnTimeByDay));

      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

      chartInstance.current = new Chart(ctx, {
        type: chartType,
        data: {
          labels: dates,
          datasets: [
            {
              label: 'On-Time Performance',
              data: percentages,
              backgroundColor: chartType === 'bar' ? 'rgba(99, 102, 241, 0.8)' : gradient,
              borderColor: '#6366f1',
              fill: chartType === 'line',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: chartType === 'line' ? 4 : 0,
              pointHoverRadius: chartType === 'line' ? 6 : 0,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: '#6366f1',
              pointBorderWidth: 2
            },
            {
              label: 'Target',
              data: Array(dates.length).fill(targetPercentage),
              borderColor: '#e11d48',
              borderDash: [5, 5],
              borderWidth: 1,
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 8,
                padding: 15,
                font: { size: 11 }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  return ` ${value.toFixed(1)}%`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                font: { size: 11 },
                maxRotation: 0
              }
            },
            y: {
              grid: { color: 'rgba(243, 244, 246, 0.8)' },
              ticks: {
                font: { size: 11 },
                callback: (value) => `${value}%`
              },
              min: Math.min(...percentages) * 0.95,
              max: Math.max(targetPercentage, Math.max(...percentages)) * 1.05
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    if (!chartRef.current || !data.length) return;
    
    const timer = setTimeout(() => {
      createChart();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [isExpanded, chartType, data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">On-Time Performance</h2>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{average.toFixed(1)}%</span>
            <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {trend === 'up' ? '+2.3%' : '-2.3%'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={isExpanded ? 'h-[400px]' : 'h-[300px]'}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default OnTimePerformanceChart;