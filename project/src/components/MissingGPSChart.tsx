import React, { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import Papa from 'papaparse';

interface MissingGPSChartProps {
  chartType: 'bar' | 'line' | 'area';
  isExpanded: boolean;
}

interface CSVData {
  date: string;
  unmatched: number;
  'UnMatched%': number;
}

const MissingGPSChart: React.FC<MissingGPSChartProps> = ({ isExpanded }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [trend, setTrend] = useState<'up' | 'down'>('up');

  useEffect(() => {
    Papa.parse('/data/route_performance.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data
          .filter((row: any) => row.date && row.unmatched && row['UnMatched%'])
          .map((row: any) => ({
            date: row.date,
            unmatched: parseInt(row.unmatched),
            'UnMatched%': parseFloat(row['UnMatched%'].replace('%', ''))
          }));

        const lastTwo = parsedData.slice(-2);
        if (lastTwo.length === 2) {
          setTrend(lastTwo[1]['UnMatched%'] <= lastTwo[0]['UnMatched%'] ? 'down' : 'up');
        }

        setCsvData(parsedData);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      }
    });
  }, []);

  const createChart = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !csvData.length) return;

    const dashboardData = !isExpanded ? csvData.slice(-4) : csvData;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: dashboardData.map(d => {
          const date = new Date(
            parseInt(d.date.substring(0, 4)),
            parseInt(d.date.substring(4, 6)) - 1,
            parseInt(d.date.substring(6, 8))
          );
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        }),
        datasets: [{
          label: 'Missing GPS %',
          data: dashboardData.map(d => d['UnMatched%']),
          borderColor: '#d946ef', // Pink line color
          backgroundColor: 'rgba(217, 70, 239, 0.1)', // Pink background with opacity
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#3b82f6', // Blue dots
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointStyle: 'circle',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 8,
            right: 8,
            bottom: 32,
            left: 8
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            align: 'center',
            labels: {
              boxWidth: 6,
              boxHeight: 6,
              padding: 15,
              font: {
                size: 10,
                family: "'Inter', system-ui, sans-serif"
              },
              color: '#6B7280', // Updated to match other charts
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            padding: 8,
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
                return ` ${value.toFixed(1)}%`;
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
              display: true,
              font: {
                size: 10,
                family: "'Inter', system-ui, sans-serif"
              },
              color: '#9CA3AF',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 4,
              padding: 4
            }
          },
          y: {
            display: true,
            grid: {
              display: true,
              drawBorder: false,
              color: 'rgba(243, 244, 246, 0.8)'
            },
            ticks: {
              display: true,
              font: {
                size: 10,
                family: "'Inter', system-ui, sans-serif"
              },
              color: '#9CA3AF',
              callback: (value) => `${value}%`,
              maxTicksLimit: 5,
              padding: 4
            },
            min: 0,
            max: 10,
            beginAtZero: true
          }
        }
      }
    };

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, config);
  };

  useEffect(() => {
    if (!chartRef.current || !csvData.length) return;
    
    const timer = setTimeout(() => {
      createChart(chartRef.current!);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [isExpanded, csvData]);

  return (
    <div className="relative h-[220px] mt-2 w-full">
      <canvas ref={chartRef} className="w-full h-full" />
    </div>
  );
};

export default MissingGPSChart;