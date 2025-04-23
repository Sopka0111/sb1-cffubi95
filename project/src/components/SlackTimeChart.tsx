import React, { useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

const SlackTimeChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    Papa.parse('/data/slack-time.csv', {
      download: true,
      header: true,
      complete: (result) => {
        const data = result.data as any[];
        
        // Count routes by rating and calculate average minutes
        const metrics = data.reduce((acc: { 
          [key: string]: { 
            count: number; 
            totalMinutes: number; 
            avgMinutes: number;
          }
        }, row) => {
          if (!row.Rating) return acc;
          
          const rating = row.Rating;
          const minutes = Math.abs(parseFloat(row.minutes || '0'));
          
          if (!acc[rating]) {
            acc[rating] = { 
              count: 0, 
              totalMinutes: 0, 
              avgMinutes: 0
            };
          }
          
          acc[rating].count += 1;
          acc[rating].totalMinutes += minutes;
          acc[rating].avgMinutes = acc[rating].totalMinutes / acc[rating].count;
          
          return acc;
        }, {});

        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current?.getContext('2d');
        if (!ctx) return;

        const total = 157; // Total routes

        chartInstanceRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Surplus', 'Optimal', 'Insufficient'],
            datasets: [{
              data: [59, 45, 53],
              backgroundColor: [
                'rgba(0, 128, 15, 0.85)',
                'rgba(0, 123, 255, 0.85)',
                'rgba(138, 43, 226, 0.85)'
              ],
              borderColor: [
                'rgba(0, 128, 15, 1)',
                'rgba(0, 123, 255, 1)',
                'rgba(138, 43, 226, 1)'
              ],
              borderWidth: 1,
              offset: 4,
              borderRadius: 4,
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            layout: {
              padding: {
                top: 15,
                right: 0,
                bottom: 5,
                left: 0
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'right',
                align: 'center',
                labels: {
                  boxWidth: 8,
                  boxHeight: 8,
                  padding: 12,
                  font: {
                    size: 11,
                    family: "'Inter', system-ui, sans-serif",
                    weight: '500'
                  },
                  color: '#6B7280',
                  usePointStyle: true,
                  pointStyle: 'circle'
                }
              },
              tooltip: {
                enabled: true,
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
                  title: (items) => {
                    const label = items[0].label;
                    const status = {
                      'Surplus': 'Extra Time Available',
                      'Optimal': 'Well Balanced',
                      'Insufficient': 'Time Deficit'
                    }[label] || label;
                    return status;
                  },
                  label: (context) => {
                    const value = context.raw as number;
                    const label = context.label as string;
                    const percentage = ((value / total) * 100).toFixed(1);
                    const avgMinutes = Math.abs(metrics[label]?.avgMinutes || 0).toFixed(1);
                    
                    return [
                      `${value} routes (${percentage}%)`,
                      `Average: ${avgMinutes} minutes ${label === 'Surplus' ? 'extra' : label === 'Insufficient' ? 'short' : ''}`
                    ];
                  }
                }
              }
            }
          }
        });

        // Add center text
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const centerX = chartRef.current.width / 2 - 20;
        const centerY = chartRef.current.height / 2;
        
        ctx.font = "600 16px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = '#111827';
        ctx.fillText(total.toString(), centerX, centerY - 8);
        
        ctx.font = "500 10px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = '#6B7280';
        ctx.fillText('Total Routes', centerX, centerY + 8);
        
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
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-[#8A2BE2] flex-shrink-0" />
          <h3 className="font-medium text-[11px] text-[#8A2BE2]">Slack Time Analysis</h3>
        </div>
      </div>
      <div className="h-[118px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default SlackTimeChart;