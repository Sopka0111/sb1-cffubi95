import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import DetailedView from './DetailedView';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type: 'my-key-metrics' | 'missing-gps' | 'plan-vs-actual';
  data: any;
  trend: 'up' | 'down';
  average: number;
  dateRange: { start: string; end: string };
}

const ChartModal: React.FC<ChartModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  type,
  data,
  trend,
  average = 0,
  dateRange
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleExport = () => {
    // Implementation for exporting data
    const csvContent = "data:text/csv;charset=utf-8," + 
      data.map((row: any) => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-50 rounded-xl shadow-2xl flex flex-col animate-scale-in"
        style={{ width: '90vw', height: '90vh', maxWidth: '1400px', maxHeight: '900px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">Detailed performance analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Download size={16} />
              Export Data
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="h-[400px]">
                {children}
              </div>
            </div>
            
            <div className="lg:row-span-2">
              <DetailedView
                type={type}
                data={data}
                trend={trend}
                average={average}
                dateRange={dateRange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartModal;