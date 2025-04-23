import React, { useState } from 'react';
import { 
  Sparkles, Check, AlertTriangle, ChevronDown, ChevronUp, 
  Filter, Calendar, Bus, School, Users, Settings2, X
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import * as Select from '@radix-ui/react-select';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import * as Tooltip from '@radix-ui/react-tooltip';
import { toast } from 'sonner';
import TripTieringChart from '../components/TripTieringChart';

interface Route {
  id: string;
  status: 'Active' | 'Pending';
  capacity: number;
  consistency: number;
  optimized?: boolean;
  previousTier?: string;
  newTier?: string;
  depot?: string;
  type?: string[];
  daysOfWeek?: string[];
  isTrustedDriver?: boolean;
}

interface TieringFilters {
  timeWindow: string;
  capacityRange: { min: string; max: string };
  consistencyThreshold: string;
  routeStatus: string;
  depots: string[];
  routeTypes: string[];
  daysOfWeek: string[];
  excludeTrustedDrivers: boolean;
  showAdvancedFilters: boolean;
}

const DEPOTS = ['North Garage', 'South Garage', 'East Garage', 'West Garage'];
const ROUTE_TYPES = ['SPED', 'General Ed', 'Activity', 'Field Trip'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const initialRoutes: Route[] = [
  { 
    id: 'A-123', 
    status: 'Active', 
    capacity: 85, 
    consistency: 92,
    depot: 'North Garage',
    type: ['General Ed'],
    daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
    isTrustedDriver: true
  },
  { 
    id: 'B-456', 
    status: 'Pending', 
    capacity: 73, 
    consistency: 88,
    depot: 'South Garage',
    type: ['SPED'],
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  { 
    id: 'C-789', 
    status: 'Active', 
    capacity: 91, 
    consistency: 95,
    depot: 'East Garage',
    type: ['Activity', 'Field Trip'],
    daysOfWeek: ['Tuesday', 'Thursday']
  }
];

const initialFilters: TieringFilters = {
  timeWindow: 'All Times',
  capacityRange: { min: '', max: '' },
  consistencyThreshold: '',
  routeStatus: 'Active',
  depots: [],
  routeTypes: [],
  daysOfWeek: [],
  excludeTrustedDrivers: false,
  showAdvancedFilters: false
};

export default function TieringModule() {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [filters, setFilters] = useState<TieringFilters>(initialFilters);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showOptimizedAlert, setShowOptimizedAlert] = useState(false);
  const [optimizationStats, setOptimizationStats] = useState<{
    improved: number;
    unchanged: number;
    degraded: number;
  } | null>(null);
  const [showTierBreakPreview, setShowTierBreakPreview] = useState(false);

  const handleFilterChange = (key: keyof TieringFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filterRoutes = (routes: Route[]): Route[] => {
    return routes.filter(route => {
      const matchesTimeWindow = filters.timeWindow === 'All Times' || true;
      const matchesCapacity = (
        (!filters.capacityRange.min || route.capacity >= parseInt(filters.capacityRange.min)) &&
        (!filters.capacityRange.max || route.capacity <= parseInt(filters.capacityRange.max))
      );
      const matchesConsistency = !filters.consistencyThreshold || 
        route.consistency >= parseInt(filters.consistencyThreshold);
      const matchesStatus = filters.routeStatus === 'All' || 
        route.status === filters.routeStatus;
      const matchesDepot = filters.depots.length === 0 || 
        (route.depot && filters.depots.includes(route.depot));
      const matchesType = filters.routeTypes.length === 0 || 
        (route.type && route.type.some(t => filters.routeTypes.includes(t)));
      const matchesDays = filters.daysOfWeek.length === 0 ||
        (route.daysOfWeek && route.daysOfWeek.some(d => filters.daysOfWeek.includes(d)));
      const matchesTrustedDriver = !filters.excludeTrustedDrivers || !route.isTrustedDriver;

      return matchesTimeWindow && matchesCapacity && matchesConsistency && 
        matchesStatus && matchesDepot && matchesType && matchesDays && matchesTrustedDriver;
    });
  };

  const handleOptimizeRoutes = () => {
    setIsOptimizing(true);
    const filteredRoutes = filterRoutes(routes);

    setTimeout(() => {
      const optimizedRoutes = routes.map(route => {
        if (!filteredRoutes.find(r => r.id === route.id)) return route;

        const capacityImprovement = Math.random() * 5;
        const consistencyImprovement = Math.random() * 3;

        return {
          ...route,
          optimized: true,
          previousTier: getTier(route.capacity, route.consistency),
          capacity: Math.min(100, route.capacity + capacityImprovement),
          consistency: Math.min(100, route.consistency + consistencyImprovement),
          newTier: getTier(
            Math.min(100, route.capacity + capacityImprovement),
            Math.min(100, route.consistency + consistencyImprovement)
          )
        };
      });

      const stats = optimizedRoutes.reduce(
        (acc, route) => {
          if (!route.optimized) return acc;
          if (!route.previousTier || !route.newTier) return acc;

          const tierValue = (tier: string) => 
            tier === 'Tier 1' ? 1 : tier === 'Tier 2' ? 2 : 3;

          const prevValue = tierValue(route.previousTier);
          const newValue = tierValue(route.newTier);

          if (newValue < prevValue) acc.improved++;
          else if (newValue === prevValue) acc.unchanged++;
          else acc.degraded++;

          return acc;
        },
        { improved: 0, unchanged: 0, degraded: 0 }
      );

      setOptimizationStats(stats);
      setRoutes(optimizedRoutes);
      setIsOptimizing(false);
      setShowOptimizedAlert(true);

      toast.success('Routes optimized successfully', {
        description: `${stats.improved} improved · ${stats.unchanged} unchanged · ${stats.degraded} need attention`
      });

      setTimeout(() => {
        setShowOptimizedAlert(false);
      }, 5000);
    }, 2000);
  };

  const getTier = (capacity: number, consistency: number): string => {
    const score = (capacity + consistency) / 2;
    if (score >= 90) return 'Tier 1';
    if (score >= 80) return 'Tier 2';
    return 'Tier 3';
  };

  const getAppliedFiltersCount = () => {
    let count = 0;
    if (filters.timeWindow !== 'All Times') count++;
    if (filters.capacityRange.min || filters.capacityRange.max) count++;
    if (filters.consistencyThreshold) count++;
    if (filters.routeStatus !== 'Active') count++;
    if (filters.depots.length) count++;
    if (filters.routeTypes.length) count++;
    if (filters.daysOfWeek.length) count++;
    if (filters.excludeTrustedDrivers) count++;
    return count;
  };

  return (
    <div className="h-[calc(100vh-4rem)] pt-16 bg-gray-50">
      <div className="h-full overflow-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-purple-600">Route Tiering Module</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and optimize route assignments and capacity</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTierBreakPreview(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <AlertTriangle size={16} className="text-amber-500" />
                Preview Tier Breaks
              </button>
              <button 
                onClick={handleOptimizeRoutes}
                disabled={isOptimizing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isOptimizing
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white`}
              >
                {isOptimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Optimize Routes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optimization Alert */}
          {showOptimizedAlert && optimizationStats && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 flex items-start gap-3">
              <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <h3 className="text-sm font-medium text-green-800">Routes successfully optimized</h3>
                <p className="text-sm text-green-600 mt-1">
                  {optimizationStats.improved} routes improved, {optimizationStats.unchanged} unchanged, 
                  {optimizationStats.degraded > 0 && (
                    <span className="text-amber-600"> {optimizationStats.degraded} need attention</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Applied Filters */}
          {getAppliedFiltersCount() > 0 && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              {filters.timeWindow !== 'All Times' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">
                  <Calendar size={12} />
                  {filters.timeWindow}
                  <button 
                    onClick={() => handleFilterChange('timeWindow', 'All Times')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.depots.map(depot => (
                <span key={depot} className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">
                  <Bus size={12} />
                  {depot}
                  <button 
                    onClick={() => handleFilterChange('depots', filters.depots.filter(d => d !== depot))}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="space-y-4">
              {/* Basic Filters */}
              <div className="grid grid-cols-4 gap-6">
                {/* Time Window */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Window</label>
                  <select
                    value={filters.timeWindow}
                    onChange={(e) => handleFilterChange('timeWindow', e.target.value)}
                    className="w-full h-9 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option>All Times</option>
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Custom</option>
                  </select>
                </div>

                {/* Capacity Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Min"
                      value={filters.capacityRange.min}
                      onChange={(e) => handleFilterChange('capacityRange', { 
                        ...filters.capacityRange, 
                        min: e.target.value 
                      })}
                      className="w-full h-9 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="text-sm text-gray-500">to</span>
                    <input
                      type="text"
                      placeholder="Max"
                      value={filters.capacityRange.max}
                      onChange={(e) => handleFilterChange('capacityRange', {
                        ...filters.capacityRange,
                        max: e.target.value
                      })}
                      className="w-full h-9 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Consistency Threshold */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consistency Threshold
                  </label>
                  <input
                    type="text"
                    placeholder="Enter threshold %"
                    value={filters.consistencyThreshold}
                    onChange={(e) => handleFilterChange('consistencyThreshold', e.target.value)}
                    className="w-full h-9 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Route Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route Status</label>
                  <select
                    value={filters.routeStatus}
                    onChange={(e) => handleFilterChange('routeStatus', e.target.value)}
                    className="w-full h-9 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option>Active</option>
                    <option>Pending</option>
                    <option>All</option>
                  </select>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={() => handleFilterChange('showAdvancedFilters', !filters.showAdvancedFilters)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  {filters.showAdvancedFilters ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  Advanced Filters
                </button>
              </div>

              {/* Advanced Filters */}
              {filters.showAdvancedFilters && (
                <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-6">
                  {/* Depot Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Depot / Garage
                    </label>
                    <div className="space-y-2">
                      {DEPOTS.map(depot => (
                        <label key={depot} className="flex items-center gap-2">
                          <Checkbox.Root
                            checked={filters.depots.includes(depot)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleFilterChange('depots', [...filters.depots, depot]);
                              } else {
                                handleFilterChange('depots', filters.depots.filter(d => d !== depot));
                              }
                            }}
                            className="h-4 w-4 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            <Checkbox.Indicator>
                              <Check size={12} className="text-indigo-600" />
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                          <span className="text-sm text-gray-700">{depot}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Route Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Route Type
                    </label>
                    <div className="space-y-2">
                      {ROUTE_TYPES.map(type => (
                        <label key={type} className="flex items-center gap-2">
                          <Checkbox.Root
                            checked={filters.routeTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleFilterChange('routeTypes', [...filters.routeTypes, type]);
                              } else {
                                handleFilterChange('routeTypes', filters.routeTypes.filter(t => t !== type));
                              }
                            }}
                            className="h-4 w-4 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            <Checkbox.Indicator>
                              <Check size={12} className="text-indigo-600" />
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Days of Week */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days of Week
                    </label>
                    <div className="space-y-2">
                      {DAYS_OF_WEEK.map(day => (
                        <label key={day} className="flex items-center gap-2">
                          <Checkbox.Root
                            checked={filters.daysOfWeek.includes(day)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleFilterChange('daysOfWeek', [...filters.daysOfWeek, day]);
                              } else {
                                handleFilterChange('daysOfWeek', filters.daysOfWeek.filter(d => d !== day));
                              }
                            }}
                            className="h-4 w-4 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            <Checkbox.Indicator>
                              <Check size={12} className="text-indigo-600" />
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                          <span className="text-sm text-gray-700">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Options
                    </label>
                    <div className="space-y-4">
                      <label className="flex items-center gap-2">
                        <Switch.Root
                          checked={filters.excludeTrustedDrivers}
                          onCheckedChange={(checked) => 
                            handleFilterChange('excludeTrustedDrivers', checked)
                          }
                          className={`${
                            filters.excludeTrustedDrivers ? 'bg-indigo-600' : 'bg-gray-200'
                          } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                        >
                          <Switch.Thumb 
                            className={`${
                              filters.excludeTrustedDrivers ? 'translate-x-5' : 'translate-x-1'
                            } h-3 w-3 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch.Root>
                        <span className="text-sm text-gray-700">Exclude Trusted Drivers</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trip Tiering Timeline */}
          <div className="mb-6">
            <TripTieringChart 
              selectedDepot={filters.depots[0]} 
              onTripClick={(trip) => {
                toast.info(`Selected trip ${trip.id}`, {
                  description: `${trip.startTime} - ${trip.endTime} on ${trip.vehicle}`
                });
              }} 
            />
          </div>

          {/* Routes Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consistency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depot</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filterRoutes(routes).map((route) => {
                    const currentTier = getTier(route.capacity, route.consistency);
                    const isImproved = route.optimized && route.previousTier && 
                      getTier(route.capacity, route.consistency) !== route.previousTier;

                    return (
                      <tr key={route.id} className={`
                        hover:bg-gray-50 transition-colors
                        ${route.optimized ? 'bg-green-50/30' : ''}
                      `}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{route.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            route.status === 'Active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {route.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {route.capacity.toFixed(1)}%
                            {route.optimized && (
                              <span className="text-green-600 ml-1">↑</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {route.consistency.toFixed(1)}%
                            {route.optimized && (
                              <span className="text-green-600 ml-1">↑</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              currentTier === 'Tier 1' 
                                ? 'bg-indigo-100 text-indigo-800'
                                : currentTier === 'Tier 2'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {currentTier}
                            </span>
                            {isImproved && (
                              <span className="text-xs text-green-600">
                                from {route.previousTier}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{route.depot}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            {route.type?.map(type => (
                              <span key={type} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {type}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                          <button>Edit</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tier Break Preview Modal */}
          <Dialog.Root open={showTierBreakPreview} onOpenChange={setShowTierBreakPreview}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] bg-white rounded-lg shadow-xl">
                <div className="p-6">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Tier Break Preview
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-gray-500">
                    The following routes may break their current tier based on the selected criteria
                  </Dialog.Description>

                  <div className="mt-6">
                    {/* Add tier break preview content */}
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowTierBreakPreview(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </div>
  );
}