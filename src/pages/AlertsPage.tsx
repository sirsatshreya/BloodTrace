import React, { useState } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Check, 
  Filter, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useBloodTrace } from '../context/BloodTraceContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { AlertSeverity } from '../types/bloodTrace';

export const AlertsPage: React.FC<{
  onOpenExcursionReview: (unitId: string) => void;
}> = ({ onOpenExcursionReview }) => {
  const { notifications, acknowledgeAlert, resolveAlert, setActiveTab, setSelectedUnitIdForTracking, currentUser } = useBloodTrace();

  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState<string>('');

  const filteredAlerts = notifications.filter(alert => {
    if (severityFilter === 'all') return true;
    return alert.severity === severityFilter;
  });

  const handleTrackUnit = (unitId: string) => {
    setSelectedUnitIdForTracking(unitId);
    setActiveTab('tracking');
  };

  const handleConfirmResolve = (alertId: string) => {
    if (!resolutionText.trim()) return;
    resolveAlert(alertId, resolutionText);
    setResolvingAlertId(null);
    setResolutionText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BellRing className="w-5 h-5 text-red-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Alerts & Supply Chain Exception Center</h2>
            <p className="text-xs text-slate-500">
              Audit trail of temperature violations, custody verification gates, and near-expiry warnings
            </p>
          </div>
        </div>

        {/* Severity Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          {(['all', 'critical', 'warning', 'info', 'resolved'] as const).map(sev => {
            const count = sev === 'all' ? notifications.length : notifications.filter(n => n.severity === sev).length;
            const isSelected = severityFilter === sev;
            return (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                  isSelected ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No alerts in this category</h3>
            <p className="text-xs text-slate-400 mt-1">All cold-chain events and units operating nominally</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`bg-white p-5 rounded-xl border transition-all ${
                alert.severity === 'critical'
                  ? 'border-red-300 shadow-xs bg-red-50/20'
                  : alert.severity === 'warning'
                  ? 'border-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge type="severity" value={alert.severity} />
                    <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {alert.id}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                    {alert.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                    <span className="font-mono">
                      Timestamp: {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    {alert.category && (
                      <span className="font-medium text-slate-600">Category: {alert.category}</span>
                    )}
                    {alert.isAcknowledged ? (
                      <span className="text-emerald-700 font-medium">
                        ✓ Acknowledged by {alert.acknowledgedBy || 'Staff'}
                      </span>
                    ) : (
                      <span className="text-red-700 font-semibold animate-pulse">
                        ● Pending Acknowledgment
                      </span>
                    )}
                  </div>

                  {alert.resolutionNote && (
                    <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                      <strong className="text-slate-900">Resolution Signed: </strong>
                      {alert.resolutionNote}
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  {alert.unitId && (
                    <button
                      onClick={() => handleTrackUnit(alert.unitId!)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <span>Inspect Unit ({alert.unitId})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {alert.unitId && alert.severity === 'critical' && (
                    <button
                      onClick={() => onOpenExcursionReview(alert.unitId!)}
                      className="px-3 py-1 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors"
                    >
                      Clinical Review
                    </button>
                  )}

                  {!alert.isAcknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.severity !== 'resolved' && (
                    <button
                      onClick={() => setResolvingAlertId(alert.id)}
                      className="px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg"
                    >
                      Resolve Alert
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Resolve Box */}
              {resolvingAlertId === alert.id && (
                <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                  <label className="block text-xs font-semibold text-slate-800">
                    Resolution Note & Action Taken *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={resolutionText}
                      onChange={e => setResolutionText(e.target.value)}
                      placeholder="e.g. Cold storage door was resealed. Temperature verified safe at 4.2°C."
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                    <button
                      onClick={() => handleConfirmResolve(alert.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
                    >
                      Save Resolution
                    </button>
                    <button
                      onClick={() => setResolvingAlertId(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
