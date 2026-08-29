import React, { useState } from 'react';
import { VerificationAlert, AlertSeverity } from '../../types';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, ShieldCheck, MessageSquare, X } from 'lucide-react';
import { verificationService } from '../../services/verificationService';

interface AlertsListProps {
  alerts: VerificationAlert[];
  verificationId: string;
  onAlertResolved?: (updatedAlert: VerificationAlert) => void;
}

export const AlertsList: React.FC<AlertsListProps> = ({ alerts, verificationId, onAlertResolved }) => {
  const [activeAlert, setActiveAlert] = useState<VerificationAlert | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNRESOLVED' | 'RESOLVED'>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'UNRESOLVED') return !a.is_resolved;
    if (filter === 'RESOLVED') return a.is_resolved;
    return true;
  });

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0" />;
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
      case 'LOW':
      case 'INFO':
      default:
        return <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />;
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-orange-100 text-orange-800 border border-orange-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-sky-100 text-sky-800 border border-sky-200">LOW</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700">INFO</span>;
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAlert) return;

    try {
      setIsSubmitting(true);
      const res = await verificationService.resolveAlert(
        verificationId,
        activeAlert.id,
        resolutionRemarks || 'Verified and resolved during officer cross-record review.'
      );
      if (onAlertResolved && res.alert) {
        onAlertResolved(res.alert);
      }
      setActiveAlert(null);
      setResolutionRemarks('');
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="verification-alerts-list" className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Intelligence Discrepancy Alerts</h3>
          <p className="text-xs text-slate-500">
            Actionable verification findings requiring official scrutiny and remediation.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('UNRESOLVED')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filter === 'UNRESOLVED' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({alerts.filter((a) => !a.is_resolved).length})
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filter === 'RESOLVED' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolved ({alerts.filter((a) => a.is_resolved).length})
          </button>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-8 text-center">
          <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-emerald-900">No Discrepancy Alerts</h4>
          <p className="text-xs text-emerald-700 max-w-md mx-auto mt-1">
            All cross-record comparisons for this parcel have been verified without outstanding critical conflicts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              id={`alert-card-${alert.id}`}
              className={`rounded-xl border p-4 transition-all ${
                alert.is_resolved
                  ? 'bg-slate-50/75 border-slate-200 opacity-80'
                  : alert.severity === 'CRITICAL'
                  ? 'bg-rose-50/40 border-rose-200'
                  : alert.severity === 'HIGH'
                  ? 'bg-orange-50/30 border-orange-200'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">{alert.title}</span>
                      {getSeverityBadge(alert.severity)}
                      <span className="text-[11px] font-mono text-slate-500 uppercase">
                        {alert.alert_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{alert.description}</p>

                    {alert.is_resolved && (
                      <div className="mt-2 pt-2 border-t border-slate-200/75 text-xs text-emerald-800 bg-emerald-50 rounded-lg p-2.5 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold block">
                            Resolved by {alert.resolved_by_name || 'Officer'} on{' '}
                            {new Date(alert.resolved_at || alert.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-slate-600 mt-0.5 block italic">
                            &quot;{alert.resolved_remarks || 'Verified during official review.'}&quot;
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {!alert.is_resolved && (
                  <button
                    onClick={() => {
                      setActiveAlert(alert);
                      setResolutionRemarks('');
                    }}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Resolve Alert
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Alert Modal */}
      {activeAlert && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {getSeverityIcon(activeAlert.severity)}
                <h3 className="text-base font-bold text-slate-900">Resolve Verification Alert</h3>
              </div>
              <button
                onClick={() => setActiveAlert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-bold text-slate-900 block">{activeAlert.title}</span>
              <p className="text-xs text-slate-600">{activeAlert.description}</p>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Officer Findings / Resolution Remarks
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionRemarks}
                  onChange={(e) => setResolutionRemarks(e.target.value)}
                  placeholder="e.g. Identity verified through certified Aadhaar copy; minor initial order variation accepted under state rules."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveAlert(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
