import React, { useState } from 'react';
import { AlertTriangle, Bell, Clock, MapPin, Bus, AlertCircle, ExternalLink, CheckCircle2, X } from 'lucide-react';

interface Alert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
  actions: {
    primary: {
      label: string;
      onClick: () => void;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
}

const AlertsWidget = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      type: 'critical',
      title: 'GPS Signal Loss',
      description: 'Multiple vehicles reporting GPS signal issues in Zone B',
      time: '2 min ago',
      icon: MapPin,
      actions: {
        primary: {
          label: 'View Affected Vehicles',
          onClick: () => window.location.href = '/gps-matching/vehicles'
        },
        secondary: {
          label: 'Dismiss',
          onClick: () => handleDismissAlert(1)
        }
      }
    },
    {
      id: 2,
      type: 'warning',
      title: 'Route Delay',
      description: 'Route 123 is running 15 minutes behind schedule',
      time: '5 min ago',
      icon: Clock,
      actions: {
        primary: {
          label: 'View Route Details',
          onClick: () => window.location.href = '/route-analysis'
        },
        secondary: {
          label: 'Notify School',
          onClick: () => handleNotifySchool(2)
        }
      }
    },
    {
      id: 3,
      type: 'info',
      title: 'Vehicle Maintenance',
      description: 'Bus #456 scheduled for maintenance check',
      time: '10 min ago',
      icon: Bus,
      actions: {
        primary: {
          label: 'View Schedule',
          onClick: () => handleViewMaintenance(3)
        }
      }
    },
    {
      id: 4,
      type: 'warning',
      title: 'Coverage Gap',
      description: 'Potential coverage gap detected in North district',
      time: '15 min ago',
      icon: AlertCircle,
      actions: {
        primary: {
          label: 'Review Coverage',
          onClick: () => window.location.href = '/route-analysis'
        },
        secondary: {
          label: 'Assign Backup',
          onClick: () => handleAssignBackup(4)
        }
      }
    }
  ]);

  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);

  const handleDismissAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const handleNotifySchool = (id: number) => {
    console.log('Notifying school about alert:', id);
  };

  const handleViewMaintenance = (id: number) => {
    console.log('Viewing maintenance for alert:', id);
  };

  const handleAssignBackup = (id: number) => {
    console.log('Assigning backup for alert:', id);
  };

  const handleAlertClick = (id: number) => {
    setExpandedAlert(expandedAlert === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm" style={{ height: '237.34px' }}>
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-purple-600" />
            <h2 className="text-base font-semibold text-gray-900">Active Alerts</h2>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-600 rounded-full">
            {alerts.length} New
          </span>
        </div>

        <div className="mt-4 space-y-3 flex-1 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`group flex flex-col gap-2 p-3 rounded-lg transition-colors ${
                alert.type === 'critical' 
                  ? 'bg-red-50 hover:bg-red-100' 
                  : alert.type === 'warning'
                  ? 'bg-amber-50 hover:bg-amber-100'
                  : 'bg-blue-50 hover:bg-blue-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  alert.type === 'critical' 
                    ? 'bg-red-100 text-red-600' 
                    : alert.type === 'warning'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  <alert.icon size={14} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <button 
                      onClick={() => handleAlertClick(alert.id)}
                      className="text-sm font-medium text-gray-900 text-left hover:underline"
                    >
                      {alert.title}
                    </button>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{alert.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{alert.description}</p>
                </div>
              </div>

              <div className={`flex items-center gap-2 pt-1 ${
                expandedAlert === alert.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              } transition-opacity`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert.actions.primary.onClick();
                  }}
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                    alert.type === 'critical'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : alert.type === 'warning'
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {alert.actions.primary.label}
                  <ExternalLink size={12} />
                </button>

                {alert.actions.secondary && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert.actions.secondary!.onClick();
                    }}
                    className="px-2 py-1 text-xs font-medium text-gray-700 hover:text-gray-900"
                  >
                    {alert.actions.secondary.label}
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismissAlert(alert.id);
                  }}
                  className="ml-auto p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/50"
                  title="Dismiss"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsWidget;