import React, { useEffect, useRef } from 'react';
import { Signal } from 'lucide-react';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

const LiveGPSCoverageChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    Papa.parse('/data/gps-coverage.csv', {
      download: true,
      header: true,
      complete: (result) => {
        const data = result.data as any[];
        const latestData = data[data.length - 1];
        
        const total = parseInt(latestData.total_vehicles);
        const active = parseInt(latestData.gps_active);
        const inactive = parseInt(latestData.gps_inactive);
        const error = parseInt(latestData.gps_error);
        
        const coverage = (active / total * 100).toFixed(1);

        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current?.getContext('2d');
        if (!ctx) return;

        // Create gradient fills for each segment
        const activeGradient = ctx.createLinearGradient(0, 0, 0, 100);
        activeGradient.addColorStop(0, 'rgba(34, 197, 94, 0.9)');
        activeGradient.addColorStop(1, 'rgba(34, 197, 94, 0.6)');

        const inactiveGradient = ctx.createLinearGradient(0, 0, 0, 100);
        inactiveGradient.addColorStop(0, 'rgba(234, 179, 8, 0.9)');
        inactiveGradient.addColorStop(1, 'rgba(234, 179, 8, 0.6)');

        const errorGradient = ctx.createLinearGradient(0, 0, 0, 100);
        errorGradient.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
        errorGradient.addColorStop(1, 'rgba(239, 68, 68, 0.6)');

        chartInstanceRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Active', 'Inactive', 'Error'],
            datasets: [{
              data: [active, inactive, error],
              backgroundColor: [activeGradient, inactiveGradient, errorGradient],
              borderColor: [
                'rgba(34, 197, 94, 1)',
                'rgba(234, 179, 8, 1)',
                'rgba(239, 68, 68, 1)'
              ],
              borderWidth: 1.5,
              circumference: 180,
              rotation: 270,
              spacing: 2,
              borderRadius: 4
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
                bottom: 15,
                left: 0
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
                  family: "'Inter', system-ui, sans-serif",
                  weight: '600'
                },
                bodyFont: {
                  size: 11,
                  family: "'Inter', system-ui, sans-serif"
                },
                padding: 8,
                callbacks: {
                  title: (tooltipItems) => {
                    const status = tooltipItems[0].label;
                    return `GPS Status: ${status}`;
                  },
                  label: (context) => {
                    const value = context.raw as number;
                    const percentage = ((value / total) * 100).toFixed(1);
                    const lines = [
                      `${value} vehicles (${percentage}%)`,
                      `Total fleet: ${total} vehicles`
                    ];
                    
                    switch (context.label) {
                      case 'Active':
                        lines.push('✓ Transmitting GPS data');
                        break;
                      case 'Inactive':
                        lines.push('! No signal received');
                        break;
                      case 'Error':
                        lines.push('⚠ GPS malfunction');
                        break;
                    }
                    
                    return lines;
                  }
                }
              }
            }
          }
        });

        // Add center text and metrics
        ctx.save();
        ctx.textAlign = 'center';
        
        // Coverage percentage
        const centerX = chartRef.current.width / 2;
        const centerY = chartRef.current.height / 2 - 15;
        
        ctx.font = "bold 24px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = parseFloat(coverage) >= 95 ? '#22c55e' : 
                       parseFloat(coverage) >= 85 ? '#eab308' : '#ef4444';
        ctx.fillText(`${coverage}%`, centerX, centerY);
        
        // Label
        ctx.font = "500 11px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = '#6B7280';
        ctx.fillText('Coverage', centerX, centerY + 20);

        // Mini KPI summary
        const summaryY = chartRef.current.height - 25;
        const spacing = 50;

        // Total
        ctx.textAlign = 'center';
        ctx.font = "500 10px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = '#6B7280';
        ctx.fillText('Total', centerX - spacing, summaryY);
        ctx.font = "600 12px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = '#111827';
        ctx.fillText(total.toString(), centerX - spacing, summaryY + 15);

        // With GPS
        ctx.font = "500 10px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = '#6B7280';
        ctx.fillText('With GPS', centerX, summaryY);
        ctx.font = "600 12px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = '#22c55e';
        ctx.fillText(active.toString(), centerX, summaryY + 15);

        // Missing
        ctx.font = "500 10px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = '#6B7280';
        ctx.fillText('Missing', centerX + spacing, summaryY);
        ctx.font = "600 12px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = '#ef4444';
        ctx.fillText((inactive + error).toString(), centerX + spacing, summaryY + 15);

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
          <Signal size={13} className="text-purple-600 flex-shrink-0" />
          <h3 className="font-medium text-[11px] text-purple-600">Live GPS Coverage</h3>
        </div>
      </div>
      <div className="h-[118px]">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default LiveGPSCoverageChart;