import React, { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import Papa from 'papaparse';

interface OnTimePercentageChartProps {
  chartType: 'line' | 'bar' | 'pie' | 'doughnut';
  isExpanded: boolean;
}

interface CSVData {
  date: string;
  'Planned Runs': number;
  matchedRuns: number;
  onTimeRunsBell: number;
  OnTimeByDay: string;
  onTimeRunsPlanned: number;
  unmatched: number;
  'UnMatched%': string;
}

const OnTimePercentageChart: React.FC<OnTimePercentageChartProps> = ({ chartType, isExpanded }) => {
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
          .filter((row: any) => row.date && row['Planned Runs'] && row.OnTimeByDay)
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

        const lastTwo = parsedData.slice(-2);
        if (lastTwo.length === 2) {
          const prevPercent = parseFloat(lastTwo[0].OnTimeByDay);
          const currPercent = parseFloat(lastTwo[1].OnTimeByDay);
          setTrend(currPercent >= prevPercent ? 'up' : 'down');
        }

        setCsvData(parsedData);
      }
    });
  }, []);

  const createChart = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !csvData.length) return;

    const latestData = csvData[csvData.length - 1];
    const onTimePercentage = parseFloat(latestData.OnTimeByDay);
    const latePercentage = 100 - onTimePercentage;

    const config: ChartConfiguration = {
      type: chartType === 'doughnut' ? 'doughnut' : chartType === 'pie' ? 'pie' : chartType,
      data: chartType === 'line' || chartType === 'bar' ? {
        labels: csvData.map(d => {
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
          label: 'On Time %',
          data: csvData.map(d => ({
            x: d.date,
            y: parseFloat(d.OnTimeByDay)
          })),
          backgroundColor: 'rgba(147, 51, 234, 0.2)',
          borderColor: 'rgb(147, 51, 234)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      } : {
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
        layout: {
          padding: {
            top: 8,
            right: 8,
            bottom: 24,
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
              color: '#6B7280',
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            enabled: true,
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
              title: (items) => {
                if (chartType === 'line' || chartType === 'bar') {
                  const date = items[0].raw as { x: string };
                  return new Date(
                    parseInt(date.x.substring(0, 4)),
                    parseInt(date.x.substring(4, 6)) - 1,
                    parseInt(date.x.substring(6, 8))
                  ).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  });
                }
                return items[0].label;
              },
              label: (context) => {
                if (chartType === 'line' || chartType === 'bar') {
                  const value = (context.raw as { y: number }).y;
                  return ` ${value.toFixed(1)}% ${context.dataset.label}`;
                }
                const value = context.raw as number;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                const count = Math.round((value / 100) * latestData.matchedRuns);
                return [
                  ` ${percentage}% (${count} routes)`,
                  ` of ${latestData.matchedRuns} total routes`
                ];
              }
            }
          }
        },
        scales: chartType === 'line' || chartType === 'bar' ? {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 10,
                family: "'Inter', system-ui, sans-serif"
              },
              color: '#6B7280',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6
            }
          },
          y: {
            grid: {
              color: 'rgba(243, 244, 246, 0.8)'
            },
            ticks: {
              font: {
                size: 10,
                family: "'Inter', system-ui, sans-serif"
              },
              color: '#6B7280',
              callback: (value) => `${value}%`,
              maxTicksLimit: 5
            },
            min: Math.floor(Math.min(...csvData.map(d => parseFloat(d.OnTimeByDay))) * 0.95),
            max: Math.ceil(Math.max(...csvData.map(d => parseFloat(d.OnTimeByDay))) * 1.05)
          }
        } : undefined,
        cutout: chartType === 'doughnut' ? '75%' : undefined
      }
    };

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, config);

    if (chartType === 'doughnut') {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const centerX = canvas.width / 2;
      const centerY = (canvas.height - 32) / 2;
      
      ctx.font = "600 24px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = '#111827';
      ctx.fillText(`${onTimePercentage.toFixed(1)}%`, centerX, centerY);
      
      ctx.font = "12px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = '#6B7280';
      ctx.fillText('On Time', centerX, centerY + 24);
      
      ctx.restore();
    }
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
  }, [isExpanded, chartType, csvData]);

  return (
    <div className="h-[220px] mt-2 w-full flex items-center justify-center">
      <canvas ref={chartRef} className="w-full h-full" />
    </div>
  );
};

export default OnTimePercentageChart;