import React, { useEffect, useRef } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

const DriverPerformanceChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    Papa.parse('/data/driver-performance.csv', {
      download: true,
      header: true,
      complete: (result) => {
        const data = result.data as any[];
        
        // Calculate average ratings
        const ratings = data.map(row => parseFloat(row.rating));
        const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        
        // Prepare data for radar chart
        const latestRecord = data[data.length - 1];
        const metrics = [
          parseFloat(latestRecord.safety_score) / 20, // Scale down to 0-5
          parseFloat(latestRecord.on_time_score) / 20,
          parseFloat(latestRecord.route_completion) / 20,
          parseFloat(latestRecord.rating)
        ];

        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current?.getContext('2d');
        if (!ctx) return;

        chartInstanceRef.current = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: ['🛡️ Safety', '⏱️ Time', '📦 Routes', '⭐ Rating'],
            datasets: [{
              data: metrics,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              pointBackgroundColor: '#ffffff',
              pointBorderColor: 'rgba(99, 102, 241, 0.9)',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
              borderWidth: 1.5,
              pointRadius: 2
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
            scales: {
              r: {
                angleLines: {
                  display: true,
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                pointLabels: {
                  color: 'rgba(255, 255, 255, 0.7)',
                  font: {
                    size: 8,
                    family: "'Inter', system-ui, sans-serif"
                  }
                },
                ticks: {
                  display: false,
                  maxTicksLimit: 5
                },
                min: 0,
                max: 5,
                beginAtZero: true
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
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number;
                    return ` ${value.toFixed(1)} / 5`;
                  }
                }
              }
            }
          }
        });

        // Update the displayed average rating
        const ratingElement = document.getElementById('average-rating');
        if (ratingElement) {
          ratingElement.textContent = avgRating.toFixed(1);
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-purple-600/40 to-indigo-600/40 backdrop-blur-sm rounded-lg shadow overflow-hidden" style={{ height: '154.33px' }}>
      <div className="p-3">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={14} className="text-white/90 flex-shrink-0" />
            <h3 className="font-medium text-xs text-white/90">Driver Performance</h3>
          </div>
        </div>
        <div className="text-xl font-bold text-white/90 mb-0.5">4.7</div>
        <div className="text-[10px] text-white/60">Average rating</div>
        <div className="h-[70px] mt-1">
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
};

export default DriverPerformanceChart;