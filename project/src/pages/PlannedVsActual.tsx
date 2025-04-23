import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Filter, Calendar, ChevronDown, ArrowUpRight,
  Download, Bus, School, MapPin, TrendingUp, TrendingDown
} from 'lucide-react';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface RoutePerformance {
  date: string;
  Planned_Runs: number;
  matchedRuns: number;
  onTimeRunsBell: number;
  OnTimeByDay: string;
  onTimeRunsPlanned: number;
  unmatched: number;
  'UnMatched%': string;
}

const PlannedVsActual: React.FC = () => {
  const [timeRange, setTimeRange] = useState('1W');
  const [selectedDepot, setSelectedDepot] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<RoutePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down'>('up');
  const [averagePerformance, setAveragePerformance] = useState(0);

  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const donutChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartInstance = useRef<Chart | null>(null);
  const donutChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        Papa.parse('/data/route_performance.csv', {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data as RoutePerformance[];
            setPerformanceData(data);

            // Calculate trend and average
            const percentages = data.map(d => parseFloat(d.OnTimeByDay));
            const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
            setAveragePerformance(avg);

            const lastTwo = percentages.slice(-2);
            setTrend(lastTwo[1] >= lastTwo[0] ? 'up' : 'down');

            createCharts(data);
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load performance data');
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }
      if (donutChartInstance.current) {
        donutChartInstance.current.destroy();
      }
    };
  }, []);

  const createCharts = (data: RoutePerformance[]) => {
    if (lineChartRef.current && donutChartRef.current) {
      // Line Chart
      const lineCtx = lineChartRef.current.getContext('2d');
      if (lineCtx) {
        if (lineChartInstance.current) {
          lineChartInstance.current.destroy();
        }

        const dates = data.map(d => format(new Date(
          parseInt(d.date.substring(0, 4)),
          parseInt(d.date.substring(4, 6)) - 1,
          parseInt(d.date.substring(6, 8))
        ), 'MMM d'));

        lineChartInstance.current = new Chart(lineCtx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [
              {
                label: 'Actual Performance',
                data: data.map(d => parseFloat(d.OnTimeByDay)),
                borderColor: '#9333ea',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Target',
                data: Array(dates.length).fill(95),
                borderColor: '#dc2626',
                borderDash: [5, 5],
                borderWidth: 1,
                pointRadius: 0,
                fill: false
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                align: 'end',
                labels: {
                  boxWidth: 8,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  padding: 15,
                  font: { size: 11 }
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
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
                grid: { display: false },
                ticks: {
                  font: { size: 11 },
                  maxRotation: 0
                }
              },
              y: {
                min: Math.min(...data.map(d => parseFloat(d.OnTimeByDay))) * 0.95,
                max: 100,
                ticks: {
                  font: { size: 11 },
                  callback: (value) => `${value}%`
                },
                grid: {
                  color: 'rgba(243, 244, 246, 0.8)'
                }
              }
            }
          }
        });
      }

      // Donut Chart
      const donutCtx = donutChartRef.current.getContext('2d');
      if (donutCtx) {
        if (donutChartInstance.current) {
          donutChartInstance.current.destroy();
        }

        const latestData = data[data.length - 1];
        const onTimePercentage = parseFloat(latestData.OnTimeByDay);
        const latePercentage = 100 - onTimePercentage;

        donutChartInstance.current = new Chart(donutCtx, {
          type: 'doughnut',
          data: {
            labels: ['On Time', 'Late'],
            datasets: [{
              data: [onTimePercentage, latePercentage],
              backgroundColor: [
                'rgba(147, 51, 234, 0.8)',
                'rgba(239, 68, 68, 0.8)'
              ],
              borderWidth: 0,
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 8,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  padding: 15,
                  font: { size: 11 }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number;
                    const count = Math.round((value / 100) * latestData.matchedRuns);
                    return [
                      ` ${value.toFixed(1)}% (${count} routes)`,
                      ` of ${latestData.matchedRuns} total routes`
                    ];
                  }
                }
              }
            }
          }
        });

        // Add center text
        donutCtx.save();
        donutCtx.textAlign = 'center';
        donutCtx.textBaseline = 'middle';
        
        const centerX = donutChartRef.current.width / 2;
        const centerY = donutChartRef.current.height / 2;
        
        donutCtx.font = "bold 24px 'Inter'";
        donutCtx.fillStyle = '#111827';
        donutCtx.fillText(`${onTimePercentage.toFixed(1)}%`, centerX, centerY);
        
        donutCtx.font = "12px 'Inter'";
        donutCtx.fillStyle = '#6B7280';
        donutCtx.fillText('On Time', centerX, centerY + 24);
        
        donutCtx.restore();
      }
    }
  };

  const handleExport = () => {
    const csvContent = Papa.unparse(performanceData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `planned-vs-actual-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] pt-16 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] pt-16 bg-gray-50">
      <div className="h-full overflow-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-purple-600 flex items-center gap-2">
                <Clock size={24} />
                Planned vs Actual
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Compare planned routes with actual performance metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download size={16} />
                Export Data
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Bus size={16} />
                <span className="text-sm font-medium">Total Routes</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {performanceData[performanceData.length - 1]?.Planned_Runs}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Planned for today
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Clock size={16} />
                <span className="text-sm font-medium">On-Time Performance</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {averagePerformance.toFixed(1)}%
                </span>
                <div className={`flex items-center gap-1 ${
                  trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {trend === 'up' ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  <span className="text-sm font-medium">
                    {trend === 'up' ? '+2.3%' : '-2.3%'}
                  </span>
                </div>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                7-day average
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin size={16} />
                <span className="text-sm font-medium">Matched Routes</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {performanceData[performanceData.length - 1]?.matchedRuns}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Successfully tracked
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <School size={16} />
                <span className="text-sm font-medium">Bell Time Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">94.8%</div>
              <div className="mt-1 text-sm text-gray-500">
                Arrivals within window
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Performance Trend</h2>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 rounded-md">
                    <Filter size={14} />
                    Filters
                    <ChevronDown size={14} />
                  </button>

                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                    <Calendar size={14} />
                    {timeRange}
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
              <div className="h-[300px]">
                <canvas ref={lineChartRef} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Current Performance</h2>
              <div className="h-[300px]">
                <canvas ref={donutChartRef} />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Detailed Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matched</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performanceData.map((day, index) => (
                    <tr key={day.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(
                          parseInt(day.date.substring(0, 4)),
                          parseInt(day.date.substring(4, 6)) - 1,
                          parseInt(day.date.substring(6, 8))
                        ), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.Planned_Runs}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.matchedRuns}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.onTimeRunsBell}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.OnTimeByDay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(day.OnTimeByDay) >= 95
                            ? 'bg-green-100 text-green-800'
                            : parseFloat(day.OnTimeByDay) >= 85
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {parseFloat(day.OnTimeByDay) >= 95
                            ? 'Excellent'
                            : parseFloat(day.OnTimeByDay) >= 85
                            ? 'Good'
                            : 'Needs Improvement'
                          }
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannedVsActual;