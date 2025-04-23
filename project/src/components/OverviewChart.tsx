import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';

interface OverviewChartProps {
  chartType: 'bar' | 'line' | 'pie';
  isExpanded: boolean;
}

const OverviewChart: React.FC<OverviewChartProps> = ({ chartType, isExpanded }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const createChart = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Overview data is simplified, expanded view shows more detail
    const data = isExpanded ? {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'On-Time Performance',
        data: [85, 88, 82, 87, 89, 91, 86, 84, 88, 90, 87, 89],
        backgroundColor: ['#9333ea', '#d946ef', '#ec4899', '#f43f5e', '#fb7185', '#fda4af'],
        borderColor: '#9333ea'
      }, {
        label: 'Route Efficiency',
        data: [75, 78, 76, 79, 82, 85, 83, 80, 82, 84, 86, 88],
        backgroundColor: ['#3b82f6', '#60a5fa', '#93c5fd'],
        borderColor: '#3b82f6'
      }]
    } : {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Performance',
        data: [85, 89, 86, 89],
        backgroundColor: ['#9333ea', '#3b82f6', '#ec4899', '#f43f5e'],
        borderColor: '#9333ea'
      }]
    };

    const config: ChartConfiguration = {
      type: chartType,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: !isExpanded,
        aspectRatio: 1.56,
        animation: {
          duration: 300
        },
        layout: {
          padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
          }
        },
        plugins: {
          legend: {
            display: isExpanded,
            position: 'bottom',
            labels: {
              boxWidth: isExpanded ? 12 : 8,
              padding: isExpanded ? 15 : 8,
              font: {
                size: isExpanded ? 12 : 10
              }
            }
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            padding: 10,
            titleFont: {
              size: isExpanded ? 14 : 12
            },
            bodyFont: {
              size: isExpanded ? 13 : 11
            }
          }
        },
        scales: chartType !== 'pie' ? {
          x: {
            display: true,
            grid: {
              display: isExpanded,
              drawBorder: false,
              color: '#e2e8f0'
            },
            ticks: {
              display: true,
              font: {
                size: isExpanded ? 12 : 10
              },
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            display: true,
            grid: {
              display: isExpanded,
              drawBorder: false,
              color: '#e2e8f0'
            },
            ticks: {
              display: true,
              font: {
                size: isExpanded ? 12 : 10
              },
              callback: (value) => `${value}%`
            },
            min: 0,
            max: 100
          }
        } : undefined
      }
    };

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, config);
  };

  useEffect(() => {
    if (!chartRef.current) return;
    
    const timer = setTimeout(() => {
      createChart(chartRef.current!);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [isExpanded, chartType]);

  return (
    <div className="w-full h-full">
      <canvas 
        ref={chartRef} 
        style={{ 
          width: '100%', 
          height: isExpanded ? '100%' : 'auto'
        }} 
      />
    </div>
  );
};

export default OverviewChart;