import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { 
  BarChart, 
  PieChart, 
  LineChart, 
  AreaChart
} from 'lucide-react';
import KeyMetricsChart from './components/KeyMetricsChart';
import MissingGPSChart from './components/MissingGPSChart';
import OnTimePercentageChart from './components/OnTimePercentageChart';
import ChartModal from './components/ChartModal';
import SlackTimeChart from './components/SlackTimeChart';
import ChronicMissedStopsChart from './components/ChronicMissedStopsChart';
import FuelEfficiencyChart from './components/FuelEfficiencyChart';
import DriverPerformanceChart from './components/DriverPerformanceChart';
import LiveGPSCoverageChart from './components/LiveGPSCoverageChart';
import RouteStatisticsChart from './components/RouteStatisticsChart';
import AlertsWidget from './components/AlertsWidget';
import TasksWidget from './components/TasksWidget';
import Navbar from './components/Navbar';
import TieringModule from './pages/TieringModule';
import PlannedVsActual from './pages/PlannedVsActual';
import IncidentTracking from './pages/IncidentTracking';
import { Toaster } from 'sonner';

function App() {
  const [myKeyMetricsChartType, setMyKeyMetricsChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [missingGPSChartType, setMissingGPSChartType] = useState<'bar' | 'line' | 'area'>('line');
  const [onTimeChartType, setOnTimeChartType] = useState<'line' | 'bar' | 'pie' | 'doughnut'>('pie');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<{
    type: 'my-key-metrics' | 'missing-gps' | 'plan-vs-actual';
    title: string;
  } | null>(null);

  const openModal = (type: 'my-key-metrics' | 'missing-gps' | 'plan-vs-actual', title: string) => {
    setActiveModal({ type, title });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveModal(null);
  };

  return (
    <BrowserRouter>
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <Navbar />
        <Toaster position="top-right" />

        <Routes>
          <Route path="/" element={
            <main className="pt-16">
              <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50">
                <div className="flex-1 overflow-hidden">
                  <div className="h-full max-w-[1400px] mx-auto px-6 py-6 flex flex-col">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '296.33px' }}>
                        <KeyMetricsChart chartType={myKeyMetricsChartType} isExpanded={false} />
                      </div>

                      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '296.33px' }}>
                        <div className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h2 className="text-base font-semibold text-purple-600">Missing GPS</h2>
                              <p className="text-sm font-medium text-gray-600 mt-0.5">Real-Time Tracking Gaps</p>
                              <p className="text-xs text-gray-500 mt-0.5">Shows the percentage and count of vehicles with missing GPS signals, updated every 5 minutes.</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex border border-gray-200 rounded overflow-hidden">
                                <button 
                                  className={`p-1 ${missingGPSChartType === 'bar' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-500'}`}
                                  onClick={() => setMissingGPSChartType('bar')}
                                  title="Bar Chart"
                                >
                                  <BarChart size={14} />
                                </button>
                                <button 
                                  className={`p-1 ${missingGPSChartType === 'line' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-500'}`}
                                  onClick={() => setMissingGPSChartType('line')}
                                  title="Line Chart"
                                >
                                  <LineChart size={14} />
                                </button>
                                <button 
                                  className={`p-1 ${missingGPSChartType === 'area' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-500'}`}
                                  onClick={() => setMissingGPSChartType('area')}
                                  title="Area Chart"
                                >
                                  <AreaChart size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div style={{ height: '230px' }}>
                            <MissingGPSChart chartType={missingGPSChartType} isExpanded={false} />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '296.33px' }}>
                        <div className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h2 className="text-base font-semibold text-purple-600">On Time Performance</h2>
                              <p className="text-sm font-medium text-gray-600 mt-0.5">Timeliness Overview</p>
                              <p className="text-xs text-gray-500 mt-0.5">Displays on time performance metrics with real-time updates and trend analysis for the current month.</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex border border-gray-200 rounded overflow-hidden">
                                <button 
                                  className={`p-1 ${onTimeChartType === 'pie' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-500'}`}
                                  onClick={() => setOnTimeChartType('pie')}
                                  title="Pie Chart"
                                >
                                  <PieChart size={14} />
                                </button>
                                <button 
                                  className={`p-1 ${onTimeChartType === 'doughnut' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-500'}`}
                                  onClick={() => setOnTimeChartType('doughnut')}
                                  title="Doughnut Chart"
                                >
                                  <PieChart size={14} />
                                </button>
                                <button 
                                  className={`p-1 ${onTimeChartType === 'bar' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-500'}`}
                                  onClick={() => setOnTimeChartType('bar')}
                                  title="Bar Chart"
                                >
                                  <BarChart size={14} />
                                </button>
                                <button 
                                  className={`p-1 ${onTimeChartType === 'line' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-500'}`}
                                  onClick={() => setOnTimeChartType('line')}
                                  title="Line Chart"
                                >
                                  <LineChart size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div style={{ height: '230px' }}>
                            <OnTimePercentageChart chartType={onTimeChartType} isExpanded={false} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-4 mt-4">
                      <div className="col-span-1">
                        <RouteStatisticsChart />
                      </div>
                      <div className="col-span-1">
                        <SlackTimeChart />
                      </div>
                      <div className="col-span-1">
                        <ChronicMissedStopsChart />
                      </div>
                      <div className="col-span-1">
                        <LiveGPSCoverageChart />
                      </div>
                      <div className="col-span-1">
                        <FuelEfficiencyChart />
                      </div>
                      <div className="col-span-1">
                        <DriverPerformanceChart />
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-4 mt-4">
                      <div className="col-span-4">
                        <AlertsWidget />
                      </div>
                      <div className="col-span-2">
                        <TasksWidget />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          } />

          <Route path="/planned-vs-actual" element={<PlannedVsActual />} />
          <Route path="/incidents" element={<IncidentTracking />} />
          <Route path="/tiering" element={<TieringModule />} />
        </Routes>

        {modalOpen && activeModal && (
          <ChartModal
            isOpen={modalOpen}
            onClose={closeModal}
            title={activeModal.title}
            type={activeModal.type}
            data={[]}
            trend="up"
            average={85}
            dateRange={{ start: '20250310', end: '20250321' }}
          >
            {activeModal.type === 'my-key-metrics' && (
              <KeyMetricsChart chartType={myKeyMetricsChartType} isExpanded={true} />
            )}
            {activeModal.type === 'missing-gps' && (
              <MissingGPSChart chartType={missingGPSChartType} isExpanded={true} />
            )}
            {activeModal.type === 'plan-vs-actual' && (
              <OnTimePercentageChart chartType={onTimeChartType} isExpanded={true} />
            )}
          </ChartModal>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;