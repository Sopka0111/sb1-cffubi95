import React, { useEffect, useRef, useState } from 'react';
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { Chart } from 'chart.js/auto';
import Papa from 'papaparse';

type ChartType = 'line' | 'bar' | 'pie';

interface PerformanceData {
  date: string;
  onTimeRunsBell: number;
  matchedRuns: number;
  onTimePct: number;
}

const OnTimeBellWidget: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [chartType, setChartType] = useState<ChartType>('line');

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/route_performance.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData: PerformanceData[] = results.data
              .filter((row: any) => row.date && row.onTimeRunsBell && row.matchedRuns)
              .map((row: any) => ({
                date: row.date,
                onTimeRunsBell: parseInt(row.onTimeRunsBell),
                matchedRuns: parseInt(row.matchedRuns),
                onTimePct: (parseInt(row.onTimeRunsBell) / parseInt(row.matchedRuns)) * 100
              }));

            createChart(parsedData);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          }
        });
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    };

    loadData();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartType]);

  const formatDate = (dateStr: string) => {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const createChart = (data: PerformanceData[]) => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const formattedDates = data.map(d => formatDate(d.date));

    chartInstance.current = new Chart(ctx, {
      type: chartType,
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'On-Time to Bell',
          data: data.map(d => d.onTimePct),
          borderColor: '#DCC7F7',
          backgroundColor: chartType === 'line' ? '#DCC7F7' : 
                         chartType === 'bar' ? 'rgba(220, 199, 247, 0.8)' : 
                         ['#DCC7F7', '#EC407A'],
          borderWidth: 2,
          pointBackgroundColor: '#EC407A',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.6,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleFont: {
              size: 12,
              family: "'Inter', system-ui, sans-serif"
            },
            bodyFont: {
              size: 12,
              family: "'Inter', system-ui, sans-serif"
            },
            padding: 8,
            callbacks: {
              label: (context) => {
                return `On-Time to Bell: ${context.parsed.y.toFixed(2)}%`;
              }
            }
          }
        },
        scales: chartType !== 'pie' ? {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 5,
              font: {
                size: 10,
                family: "'Inter', system-ui, sans-serif"
              }
            }
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 25,
              callback: (value) => `${value}%`,
              font: {
                size: 10,
                family: "'Inter', system-ui, sans-serif"
              }
            },
            grid: {
              color: 'rgba(243, 244, 246, 0.8)'
            }
          }
        } : undefined
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3" style={{ width: '246px', height: '154.33px' }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">On-Time Performance to Bell</h3>
          <p className="text-sm text-gray-600">Calculated vs. Bell Time</p>
        </div>
        <div className="flex border border-gray-200 rounded overflow-hidden">
          <button 
            className={`p-1 ${chartType === 'line' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-500'}`}
            onClick={() => setChartType('line')}
            title="Line Chart"
          >
            <LineChart size={14} />
          </button>
          <button 
            className={`p-1 ${chartType === 'bar' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-500'}`}
            onClick={() => setChartType('bar')}
            title="Bar Chart"
          >
            <BarChart size={14} />
          </button>
          <button 
            className={`p-1 ${chartType === 'pie' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-500'}`}
            onClick={() => setChartType('pie')}
            title="Pie Chart"
          >
            <PieChart size={14} />
          </button>
        </div>
      </div>
      <div className="h-[90px]">
        <canvas 
          ref={chartRef}
          aria-label="On-Time Performance to Bell chart"
          role="img"
        />
      </div>
    </div>
  );
};

export default OnTimeBellWidget;