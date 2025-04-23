import React from 'react';
import { Table, ArrowUp, ArrowDown, AlertTriangle, Clock, Calendar, FileText } from 'lucide-react';

interface DetailedViewProps {
  type: 'my-key-metrics' | 'missing-gps' | 'plan-vs-actual';
  data: any; // We'll type this properly based on the specific chart data
  trend: 'up' | 'down';
  average: number;
  dateRange: { start: string; end: string };
}

const DetailedView: React.FC<DetailedViewProps> = ({ type, data, trend, average = 0, dateRange }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(
      parseInt(dateStr.substring(0, 4)),
      parseInt(dateStr.substring(4, 6)) - 1,
      parseInt(dateStr.substring(6, 8))
    );
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderMetricsTable = () => {
    switch (type) {
      case 'my-key-metrics':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planned Runs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matched Runs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Time Runs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unmatched</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(row.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.plannedRuns}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.matchedRuns}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.onTimeRunsBell}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.UnMatched}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'missing-gps':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Missing GPS Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Missing GPS %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(row.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.unmatched}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row['UnMatched%']}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        row['UnMatched%'] > 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {row['UnMatched%'] > 5 ? 'High' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'plan-vs-actual':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Time to Plan %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Time to Bell %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row: any, index: number) => {
                  const plannedPercent = (row.onTimeRunsPlanned / row.Planned_Runs) * 100;
                  const bellPercent = (row.onTimeRunsBell / row.matchedRuns) * 100;
                  const difference = bellPercent - plannedPercent;
                  
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(row.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plannedPercent.toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bellPercent.toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          difference > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {difference > 0 ? '+' : ''}{difference.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
    }
  };

  const renderSummaryCards = () => {
    const getFormattedAverage = () => {
      return typeof average === 'number' ? `${average.toFixed(1)}%` : 'N/A';
    };

    const cards = {
      'my-key-metrics': [
        {
          title: 'Average Performance',
          value: getFormattedAverage(),
          icon: trend === 'up' ? ArrowUp : ArrowDown,
          color: trend === 'up' ? 'text-green-500' : 'text-red-500'
        },
        {
          title: 'Total Routes',
          value: data[0]?.plannedRuns || 0,
          icon: Table,
          color: 'text-blue-500'
        },
        {
          title: 'Date Range',
          value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`,
          icon: Calendar,
          color: 'text-purple-500'
        }
      ],
      'missing-gps': [
        {
          title: 'Average Missing Rate',
          value: getFormattedAverage(),
          icon: trend === 'down' ? ArrowDown : ArrowUp,
          color: trend === 'down' ? 'text-green-500' : 'text-red-500'
        },
        {
          title: 'Alert Status',
          value: average > 5 ? 'Action Required' : 'Normal',
          icon: AlertTriangle,
          color: average > 5 ? 'text-red-500' : 'text-green-500'
        },
        {
          title: 'Monitoring Period',
          value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`,
          icon: Clock,
          color: 'text-purple-500'
        }
      ],
      'plan-vs-actual': [
        {
          title: 'Average On-Time Rate',
          value: getFormattedAverage(),
          icon: trend === 'up' ? ArrowUp : ArrowDown,
          color: trend === 'up' ? 'text-green-500' : 'text-red-500'
        },
        {
          title: 'Performance Status',
          value: average >= 90 ? 'Excellent' : average >= 80 ? 'Good' : 'Needs Improvement',
          icon: FileText,
          color: average >= 90 ? 'text-green-500' : average >= 80 ? 'text-yellow-500' : 'text-red-500'
        },
        {
          title: 'Analysis Period',
          value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`,
          icon: Calendar,
          color: 'text-purple-500'
        }
      ]
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {cards[type].map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${card.color} bg-opacity-10`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSummaryCards()}
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Detailed Analysis</h3>
        </div>
        {renderMetricsTable()}
      </div>
    </div>
  );
};

export default DetailedView;