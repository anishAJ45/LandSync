import React, { useState } from 'react';
import { RiskSignal } from '../../types';
import { AlertCircle, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Info, Check } from 'lucide-react';

interface Props {
  signal: RiskSignal;
  onResolve?: (signalId: number, note: string) => Promise<void>;
  canResolve?: boolean;
}

export const RiskSignalCard: React.FC<Props> = ({ signal, onResolve, canResolve = false }) => {
  const [isResolving, setIsResolving] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: AlertCircle };
      case 'HIGH':
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle };
      case 'MEDIUM':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Info };
      case 'LOW':
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: Info };
    }
  };

  const badge = getSeverityBadge(signal.severity);
  const Icon = badge.icon;

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onResolve) return;
    setLoading(true);
    try {
      await onResolve(signal.id, note || 'Resolved by authorized officer.');
      setIsResolving(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id={`risk-signal-card-${signal.id}`}
      className={`rounded-xl border p-4 transition-all duration-200 ${
        signal.is_resolved
          ? 'bg-slate-50/70 border-slate-200 opacity-80'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg border shrink-0 ${badge.bg} ${badge.border}`}>
            <Icon className={`w-4 h-4 ${badge.text}`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">{signal.signal_name}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${badge.bg} ${badge.text} ${badge.border}`}>
                {signal.severity}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {signal.signal_type.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{signal.description}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase font-bold text-slate-400">Risk Weight</div>
          <div className="text-sm font-black text-rose-600">+{signal.risk_points} pts</div>
          <div className="text-[11px] font-medium text-slate-500">{signal.confidence}% confidence</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <span>Source: <strong className="text-slate-700 font-semibold">{signal.source}</strong></span>
          <span>Logged: <strong className="text-slate-700 font-semibold">{new Date(signal.created_at).toLocaleDateString()}</strong></span>
        </div>

        {signal.is_resolved ? (
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved {signal.resolved_by ? `by ${signal.resolved_by}` : ''}</span>
          </div>
        ) : (
          canResolve && (
            <div>
              {!isResolving ? (
                <button
                  type="button"
                  onClick={() => setIsResolving(true)}
                  className="px-3 py-1 bg-blue-50 text-blue-900 font-semibold rounded-lg hover:bg-blue-100 transition-colors text-xs border border-blue-200"
                >
                  Resolve Signal
                </button>
              ) : (
                <form onSubmit={handleResolveSubmit} className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Enter resolution notes..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required
                    className="text-xs px-2.5 py-1 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-950 w-48"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
                  >
                    {loading ? 'Saving...' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResolving(false)}
                    className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          )
        )}
      </div>

      {signal.resolution_note && (
        <div className="mt-2 text-xs bg-slate-100/80 p-2 rounded text-slate-700 border border-slate-200">
          <strong className="font-semibold text-slate-900">Resolution Note:</strong> {signal.resolution_note}
        </div>
      )}
    </div>
  );
};
