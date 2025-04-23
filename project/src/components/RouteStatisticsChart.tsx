import React, { useEffect, useRef } from 'react';
import { Route } from 'lucide-react';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

const RouteStatisticsChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    Papa.parse('/data/route-statistics.csv', {
      download: true,
      header: true,
      complete: (result) => {
        const data = result.data as any[];
        
        // Get only the latest date's data
        const latestDate = data[data.length - 1].date;
        const latestData = data.filter(row => row.date === latestDate);
        
        // Sort by on-time percentage
        const sortedRoutes = latestData
          .sort((a, b) => parseFloat(b.on_time_percentage) - parseFloat(a.on_time_percentage));
        
        const displayRoutes = [
          ...sortedRoutes.slice(0, 3),  // Top 3
          ...sortedRoutes.slice(-2)     // Last 2
        ];

        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current?.getContext('2d');
        if (!ctx) return;

        // Create gradients for bars
        const gradients = displayRoutes.map((_, index) => {
          const gradient = ctx.createLinearGradient(0, 0, 200, 0);
          if (index < 3) {
            gradient.addColorStop(0, 'rgba(147, 51, 234, 0.9)');  // Purple
            gradient.addColorStop(1, 'rgba(236, 72, 153, 0.9)');  // Pink
          } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.9)');   // Red
            gradient.addColorStop(1, 'rgba(248, 113, 113, 0.9)'); // Light red
          }
          return gradient;
        });

        chartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: displayRoutes.map(route => route.route_id.slice(-3)),
            datasets: [{
              data: displayRoutes.map(route => parseFloat(route.on_time_percentage)),
              backgroundColor: gradients,
              borderWidth: 0,
              borderRadius: 4,
              barThickness: 8,
              categoryPercentage: 0.8
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: 15,
                right: 10,
                bottom: 5,
                left: 10
              }
            },
            plugins: {
              legend: {
                display: false
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
                  title: (items) => `Route ${items[0].label}`,
                  label: (context) => {
                    const value = context.raw as number;
                    return `On-Time: ${value.toFixed(1)}%`;
                  }
                }
              }
            },
            scales: {
              x: {
                display: true,
                grid: {
                  display: false,
                  drawBorder: false
                },
                ticks: {
                  font: {
                    size: 10,
                    family: "'Inter', system-ui, sans-serif"
                  },
                  color: '#6B7280',
                  maxTicksLimit: 5,
                  padding: 4
                },
                min: 80,
                max: 100
              },
              y: {
                display: true,
                grid: {
                  display: false,
                  drawBorder: false
                },
                ticks: {
                  font: {
                    size: 10,
                    family: "'Inter', system-ui, sans-serif",
                    weight: '500'
                  },
                  color: '#6B7280',
                  padding: 4
                }
              }
            }
          }
        });

        // Add performance indicators
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const avgTop3 = displayRoutes.slice(0, 3)
          .reduce((acc, route) => acc + parseFloat(route.on_time_percentage), 0) / 3;
        const avgLast2 = displayRoutes.slice(-2)
          .reduce((acc, route) => acc + parseFloat(route.on_time_percentage), 0) / 2;
        
        ctx.font = "600 12px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = '#22c55e';
        ctx.fillText(`${avgTop3.toFixed(1)}%`, 15, 5);
        
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`${avgLast2.toFixed(1)}%`, chartRef.current.width - 50, 5);
        
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
      <div className="flex items-center px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <Route size={13} className="text-purple-600 flex-shrink-0" />
          <span className="font-medium text-[11px] text-purple-600 truncate">Route Performance</span>
        </div>
      </div>
      <div className="h-[118px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default RouteStatisticsChart;