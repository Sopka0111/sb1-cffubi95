import React, { useEffect, useRef } from 'react';
import { Gauge } from 'lucide-react';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

const FuelEfficiencyChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    Papa.parse('/data/fuel-efficiency.csv', {
      download: true,
      header: true,
      complete: (result) => {
        const data = result.data as any[];
        
        // Calculate daily averages and efficiency ratings
        const dailyData = data.reduce((acc: any, row) => {
          const date = row.date;
          if (!acc[date]) {
            acc[date] = {
              costs: [],
              efficiencies: [],
              ratings: []
            };
          }
          acc[date].costs.push(parseFloat(row.total_cost));
          acc[date].efficiencies.push(parseFloat(row.cost_per_mile));
          acc[date].ratings.push(row.efficiency_rating);
          return acc;
        }, {});

        const labels = Object.keys(dailyData);
        const avgCosts = labels.map(date => {
          const costs = dailyData[date].costs;
          return costs.reduce((a: number, b: number) => a + b, 0) / costs.length;
        });

        // Calculate efficiency trends
        const efficiencyTrends = labels.map(date => {
          const ratings = dailyData[date].ratings;
          const ratingCounts = ratings.reduce((acc: any, rating: string) => {
            acc[rating] = (acc[rating] || 0) + 1;
            return acc;
          }, {});
          return {
            date,
            counts: ratingCounts,
            dominant: Object.entries(ratingCounts)
              .sort(([,a]: any, [,b]: any) => b - a)[0][0]
          };
        });

        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current?.getContext('2d');
        if (!ctx) return;

        const gradient = ctx.createLinearGradient(0, 0, 0, 70);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)');

        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels.map(date => new Date(date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [{
              label: 'Average Cost',
              data: avgCosts,
              borderColor: 'rgba(255, 255, 255, 0.7)',
              backgroundColor: gradient,
              fill: true,
              tension: 0.4,
              pointRadius: 2,
              pointHoverRadius: 4,
              pointBackgroundColor: 'rgba(255, 255, 255, 0.9)',
              pointBorderColor: 'rgba(236, 72, 153, 0.9)',
              borderWidth: 1.5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: 2,
                right: 2,
                bottom: 0,
                left: 2
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
                  title: (tooltipItems) => {
                    const date = new Date(tooltipItems[0].label);
                    return date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    });
                  },
                  label: (context) => {
                    const value = context.raw as number;
                    const index = context.dataIndex;
                    const date = labels[index];
                    const trend = efficiencyTrends[index];
                    
                    return [
                      `Cost: $${value.toFixed(2)} per route`,
                      `Efficiency: ${trend.dominant}`,
                      `Routes analyzed: ${dailyData[date].costs.length}`
                    ];
                  },
                  labelTextColor: (context) => {
                    const index = context.dataIndex;
                    const trend = efficiencyTrends[index];
                    return trend.dominant === 'Excellent' ? '#10B981' :
                           trend.dominant === 'Good' ? '#60A5FA' :
                           '#F59E0B';
                  }
                }
              }
            },
            scales: {
              x: {
                display: false
              },
              y: {
                display: false
              }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            }
          }
        });
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-pink-500/40 to-purple-600/40 backdrop-blur-sm rounded-lg shadow overflow-hidden" style={{ height: '154.33px' }}>
      <div className="p-3">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <Gauge size={14} className="text-white/90 flex-shrink-0" />
            <h3 className="font-medium text-xs text-white/90">Fuel Efficiency</h3>
          </div>
        </div>
        <div className="text-xl font-bold text-white/90 mb-0.5">$432</div>
        <div className="text-[10px] text-white/60">Average cost per route</div>
        <div className="h-[70px] mt-1">
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
};

export default FuelEfficiencyChart;