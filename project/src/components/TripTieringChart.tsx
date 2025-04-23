import React, { useState } from 'react';
import { 
  ChevronDown, ChevronUp, Clock, AlertTriangle, Bus, Target, 
  TrendingUp, AlertCircle, ExternalLink, ArrowRight, Bell
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Dialog from '@radix-ui/react-dialog';

interface BellTime {
  school: string;
  time: string;
  type: 'arrival' | 'dismissal';
}

interface Trip {
  id: string;
  routeId: string;
  startTime: string;
  endTime: string;
  duration: number;
  conflict: boolean;
  depot: string;
  vehicle: string;
  deadheadTime?: number;
  nextTripId?: string;
  slackTime?: number;
  slackStatus?: 'optimal' | 'surplus' | 'insufficient';
  bellTime?: BellTime;
  bellTimeStatus?: 'on-time' | 'early' | 'late';
  bellTimeDeviation?: number;
}

interface TripPair {
  fromTrip: Trip;
  toTrip: Trip;
  slackTime: number;
  status: 'optimal' | 'surplus' | 'insufficient';
}

const HOURS = Array.from({ length: 24 }, (_, i) => 
  `${String(i).padStart(2, '0')}:00`
);

const BELL_TIMES: BellTime[] = [
  { school: 'High School A', time: '07:45', type: 'arrival' },
  { school: 'Middle School B', time: '08:15', type: 'arrival' },
  { school: 'Elementary C', time: '08:45', type: 'arrival' },
  { school: 'High School A', time: '14:45', type: 'dismissal' },
  { school: 'Middle School B', time: '15:15', type: 'dismissal' },
  { school: 'Elementary C', time: '15:45', type: 'dismissal' }
];

const SAMPLE_TRIPS: Trip[] = [
  {
    id: 'T1',
    routeId: 'A-123',
    startTime: '07:00',
    endTime: '07:40',
    duration: 40,
    conflict: false,
    depot: 'North Garage',
    vehicle: 'Bus 101',
    deadheadTime: 15,
    nextTripId: 'T2',
    slackTime: 30,
    slackStatus: 'optimal',
    bellTime: { school: 'High School A', time: '07:45', type: 'arrival' },
    bellTimeStatus: 'on-time',
    bellTimeDeviation: 5
  },
  {
    id: 'T2',
    routeId: 'A-123',
    startTime: '14:30',
    endTime: '15:20',
    duration: 50,
    conflict: false,
    depot: 'North Garage',
    vehicle: 'Bus 101',
    deadheadTime: 20,
    slackTime: 45,
    slackStatus: 'surplus',
    bellTime: { school: 'Middle School B', time: '15:15', type: 'dismissal' },
    bellTimeStatus: 'late',
    bellTimeDeviation: -5
  },
  {
    id: 'T3',
    routeId: 'B-456',
    startTime: '08:00',
    endTime: '08:50',
    duration: 50,
    conflict: true,
    depot: 'South Garage',
    vehicle: 'Bus 102',
    deadheadTime: 10,
    slackTime: 10,
    slackStatus: 'insufficient',
    bellTime: { school: 'Elementary C', time: '08:45', type: 'arrival' },
    bellTimeStatus: 'early',
    bellTimeDeviation: 15
  }
];

interface TripTieringChartProps {
  selectedDepot?: string;
  onTripClick?: (trip: Trip) => void;
}

interface TierImpactStats {
  vehiclesBefore: number;
  vehiclesAfter: number;
  slackSavings: number;
  tierBreakers: number;
  potentialSavings: number;
}

export default function TripTieringChart({ selectedDepot, onTripClick }: TripTieringChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredTrip, setHoveredTrip] = useState<Trip | null>(null);
  const [showTierBreakModal, setShowTierBreakModal] = useState(false);

  const filteredTrips = selectedDepot 
    ? SAMPLE_TRIPS.filter(trip => trip.depot === selectedDepot)
    : SAMPLE_TRIPS;

  const timeToX = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60 + minutes) * 2;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getSlackTimeColor = (status: Trip['slackStatus']) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-500';
      case 'surplus':
        return 'bg-yellow-500';
      case 'insufficient':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getBellTimeColor = (status: Trip['bellTimeStatus']) => {
    switch (status) {
      case 'on-time': return 'bg-green-500';
      case 'early': return 'bg-yellow-500';
      case 'late': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getBellTimeMarker = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60 + minutes) * 2;
  };

  const getTierImpactStats = (): TierImpactStats => {
    const vehiclesBefore = new Set(SAMPLE_TRIPS.map(t => t.vehicle)).size;
    const slackSavings = SAMPLE_TRIPS.reduce((acc, trip) => 
      acc + (trip.slackTime || 0), 0);
    const tierBreakers = SAMPLE_TRIPS.filter(t => t.conflict).length;
    const potentialSavings = Math.floor(vehiclesBefore * 0.15);
    
    return {
      vehiclesBefore,
      vehiclesAfter: vehiclesBefore - potentialSavings,
      slackSavings,
      tierBreakers,
      potentialSavings
    };
  };

  const stats = getTierImpactStats();

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="flex items-center gap-2 text-gray-600">
              <Bus size={16} />
              <span>Vehicles Before</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {stats.vehiclesBefore}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 text-gray-600">
              <Target size={16} />
              <span>Optimized Target</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-indigo-600 flex items-center gap-2">
              <span>≤ {stats.vehiclesAfter}</span>
              <span className="text-sm font-medium text-green-600">
                (-{stats.potentialSavings})
              </span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={16} />
              <span>Slack Savings</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-600">
              {Math.floor(stats.slackSavings / 60)}h {stats.slackSavings % 60}m
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 text-gray-600">
              <AlertTriangle size={16} />
              <span>Tier Breakers</span>
            </div>
            <button
              onClick={() => setShowTierBreakModal(true)}
              className="mt-1 flex items-center gap-2 text-2xl font-bold text-red-600 hover:text-red-700"
            >
              {stats.tierBreakers}
              <ExternalLink size={16} className="mt-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">Trip Timeline</h3>
            {filteredTrips.some(trip => trip.conflict) && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                <AlertTriangle size={12} />
                Conflicts Detected
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Bus size={14} />
                <span className="text-xs font-medium">Total Vehicles</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{stats.vehiclesBefore}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Target size={14} />
                <span className="text-xs font-medium">Target Count</span>
              </div>
              <div className="text-xl font-bold text-indigo-600">≤ {stats.vehiclesAfter}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <AlertTriangle size={14} />
                <span className="text-xs font-medium">Conflicts</span>
              </div>
              <div className="text-xl font-bold text-red-600">{stats.tierBreakers}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <TrendingUp size={14} />
                <span className="text-xs font-medium">Optimal Pairs</span>
              </div>
              <div className="text-xl font-bold text-green-600">{SAMPLE_TRIPS.filter(t => t.slackStatus === 'optimal').length}</div>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <div className="w-32 flex-shrink-0" />
            <div className="flex-1 relative">
              <div className="absolute inset-0 flex">
                {HOURS.map((hour, i) => (
                  <div
                    key={hour}
                    className="flex-1 border-l border-gray-200 first:border-l-0"
                  >
                    <span className="absolute -top-6 text-xs text-gray-500" style={{ left: i === 0 ? 0 : -12 }}>
                      {hour}
                    </span>
                  </div>
                ))}
                {BELL_TIMES.map((bellTime, index) => (
                  <div
                    key={`${bellTime.school}-${bellTime.type}`}
                    className="absolute top-0 flex flex-col items-center"
                    style={{ left: getBellTimeMarker(bellTime.time) }}
                  >
                    <div className="h-full border-l border-purple-200 border-dashed" />
                    <Tooltip.Provider>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <div className={`-mt-8 p-1 rounded-full ${
                            bellTime.type === 'arrival' ? 'bg-purple-100' : 'bg-indigo-100'
                          }`}>
                            <Bell size={12} className={
                              bellTime.type === 'arrival' ? 'text-purple-600' : 'text-indigo-600'
                            } />
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm"
                            sideOffset={5}
                          >
                            <div className="font-medium">{bellTime.school}</div>
                            <div className="text-gray-300 text-xs">
                              {bellTime.type === 'arrival' ? 'Arrival' : 'Dismissal'} @ {bellTime.time}
                            </div>
                            <Tooltip.Arrow className="fill-gray-900" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="flex items-center gap-2">
                <div className="w-32 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-900">{trip.vehicle}</span>
                  <div className="text-xs text-gray-500">{trip.routeId}</div>
                </div>
                <div className="flex-1 h-8 relative">
                  {trip.bellTime && (
                    <div 
                      className={`absolute h-6 ${getBellTimeColor(trip.bellTimeStatus)} opacity-20`}
                      style={{
                        left: getBellTimeMarker(trip.bellTime.time) - 10,
                        width: '20px',
                        top: '4px'
                      }}
                    />
                  )}
                  
                  {trip.nextTripId && trip.slackTime && trip.slackStatus && (
                    <div 
                      className={`absolute h-1 ${getSlackTimeColor(trip.slackStatus)} opacity-50`}
                      style={{
                        left: timeToX(trip.endTime),
                        width: trip.slackTime * 2,
                        top: '8px'
                      }}
                    />
                  )}
                  
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <div
                          className={`absolute h-6 rounded-full cursor-pointer transition-colors ${
                            trip.conflict 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : trip.bellTimeStatus === 'on-time'
                              ? 'bg-green-500 hover:bg-green-600'
                              : trip.bellTimeStatus === 'early'
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                          style={{
                            left: timeToX(trip.startTime),
                            width: trip.duration * 2,
                            top: '4px'
                          }}
                          onMouseEnter={() => setHoveredTrip(trip)}
                          onMouseLeave={() => setHoveredTrip(null)}
                          onClick={() => onTripClick?.(trip)}
                        />
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm"
                          sideOffset={5}
                        >
                          <div className="font-medium">{trip.routeId}</div>
                          <div className="text-gray-300 text-xs">
                            {trip.startTime} - {trip.endTime}
                            <br />
                            Duration: {formatDuration(trip.duration)}
                            {trip.bellTime && (
                              <div className={`mt-1 flex items-center gap-1 ${
                                trip.bellTimeStatus === 'on-time' ? 'text-green-300' :
                                trip.bellTimeStatus === 'early' ? 'text-yellow-300' :
                                'text-red-300'
                              }`}>
                                <Bell size={12} />
                                {trip.bellTime.school} {trip.bellTime.type}
                                <br />
                                {trip.bellTimeDeviation > 0 
                                  ? `${trip.bellTimeDeviation}m early`
                                  : `${Math.abs(trip.bellTimeDeviation)}m late`
                                }
                              </div>
                            )}
                            {trip.slackTime && (
                              <div className={`mt-1 flex items-center gap-1 ${
                                trip.slackStatus === 'optimal' ? 'text-green-300' :
                                trip.slackStatus === 'surplus' ? 'text-yellow-300' :
                                'text-red-300'
                              }`}>
                                <Clock size={12} />
                                Slack: {formatDuration(trip.slackTime)}
                              </div>
                            )}
                            {trip.conflict && (
                              <div className="text-red-300 mt-1 flex items-center gap-1">
                                <AlertTriangle size={12} />
                                Scheduling Conflict
                              </div>
                            )}
                          </div>
                          <Tooltip.Arrow className="fill-gray-900" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>On Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Early</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell size={12} className="text-purple-600" />
                  <span>Bell Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 opacity-50" />
                  <span>Optimal Slack</span>
                </div>
              </div>
              <div className="text-xs">
                Click on any trip to view details
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog.Root open={showTierBreakModal} onOpenChange={setShowTierBreakModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <Dialog.Title className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500" />
                Tier Break Analysis
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-500">
                {stats.tierBreakers} potential tier breaks detected. Review and resolve these conflicts before proceeding with optimization.
              </Dialog.Description>

              <div className="mt-6 space-y-4">
                {SAMPLE_TRIPS.filter(t => t.conflict).map(trip => (
                  <div key={trip.id} className="flex items-start gap-4 p-4 bg-red-50 rounded-lg">
                    <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {trip.vehicle} - Route {trip.routeId}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {trip.startTime} - {trip.endTime}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
                          Insufficient Slack Time
                        </span>
                        <ArrowRight size={12} className="text-gray-400" />
                        <span className="text-gray-600">
                          Needs {Math.abs(trip.slackTime || 0)} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowTierBreakModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Resolve All
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}