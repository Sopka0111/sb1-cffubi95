import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

const ChronicMissedStopsChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    Papa.parse('/data/missed-stops.csv', {
      download: true,
      header: true,
      complete: (result) => {
        const data = result.data as any[];
        
        // Group by school zone and calculate total misses
        const zoneMisses = data.reduce((acc: { [key: string]: number }, row) => {
          const zone = row.school_zone;
          acc[zone] = (acc[zone] || 0) + parseInt(row.missed_count);
          return acc;
        }, {});

        const labels = Object.keys(zoneMisses);
        const values = Object.values(zoneMisses);
        const total = values.reduce((a, b) => a + b, 0);

        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current?.getContext('2d');
        if (!ctx) return;

        chartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels.map(label => label.replace('Zone ', '')),
            datasets: [{
              data: values,
              backgroundColor: [
                'rgba(147, 51, 234, 0.8)',  // Purple
                'rgba(236, 72, 153, 0.8)',  // Pink
                'rgba(99, 102, 241, 0.8)'   // Indigo
              ],
              borderWidth: 0,
              borderRadius: 4,
              maxBarThickness: 20,
              barPercentage: 0.8
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: 20,
                right: 25,
                bottom: 5,
                left: 15
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
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
                callbacks: {
                  title: (items) => `Zone ${items[0].label}`,
                  label: (context) => {
                    const value = context.raw as number;
                    const percentage = ((value / total) * 100).toFixed(1);
                    return [
                      `${value} missed stops`,
                      `${percentage}% of total misses`
                    ];
                  }
                }
              }
            },
            scales: {
              x: {
                display: true,
                grid: {
                  display: false
                },
                ticks: {
                  maxTicksLimit: 6,
                  font: {
                    size: 10,
                    family: "'Inter', system-ui, sans-serif"
                  },
                  color: '#6B7280'
                },
                suggestedMin: 0,
                suggestedMax: Math.max(...values) * 1.2
              },
              y: {
                display: true,
                grid: {
                  display: false
                },
                ticks: {
                  font: {
                    size: 11,
                    family: "'Inter', system-ui, sans-serif",
                    weight: '500'
                  },
                  color: '#6B7280',
                  padding: 8
                }
              }
            }
          }
        });

        // Add total indicator
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = "600 18px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = '#111827';
        ctx.fillText(total.toString(), 15, 15);
        ctx.font = "500 10px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = '#6B7280';
        ctx.fillText('Total Misses', 15, 35);
        ctx.restore();
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '154.33px' }}>
      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-purple-600 flex-shrink-0" />
          <h3 className="font-medium text-xs text-purple-600">Chronic Missed Stops</h3>
        </div>
      </div>
      <div className="h-[118px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default ChronicMissedStopsChart;