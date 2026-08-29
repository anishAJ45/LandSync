import React, { useState } from 'react';
import { LandAnomaly, AnomalyReviewStatus } from '../../types';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, FileQuestion, ArrowRight } from 'lucide-react';

interface Props {
  anomaly: LandAnomaly;
  onReview?: (anomalyId: string, status: AnomalyReviewStatus, note: string) => Promise<void>;
  canReview?: boolean;
}

export const AnomalyBadge: React.FC<Props> = ({ anomaly, onReview, canReview = false }) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<AnomalyReviewStatus>('RESOLVED');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status: AnomalyReviewStatus) => {
    switch (status) {
      case 'RESOLVED':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Resolved' };
      case 'UNDER_REVIEW':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Under Review' };
      case 'ACTION_REQUESTED':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Action Requested' };
      case 'DISMISSED':
        return { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Dismissed' };
      case 'DETECTED':
      default:
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Detected' };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'HIGH':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'MEDIUM':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'LOW':
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const statusBadge = getStatusBadge(anomaly.review_status);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onReview) return;
    setLoading(true);
    try {
      await onReview(anomaly.anomaly_id, selectedStatus, note || 'Review recorded by officer.');
      setIsReviewing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id={`anomaly-item-${anomaly.anomaly_id}`}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-blue-950">{anomaly.anomaly_id}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${getSeverityColor(anomaly.severity)}`}>
            {anomaly.severity}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {anomaly.anomaly_type.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
            {statusBadge.label}
          </span>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
            Anomaly Score: {anomaly.anomaly_score}/100
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Field & Expected</span>
          <div className="font-bold text-slate-900 mt-0.5">{anomaly.field_name}</div>
          <div className="text-slate-600 font-mono text-[11px] mt-0.5">{anomaly.expected_value}</div>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Observed Variance</span>
          <div className="font-bold text-rose-700 mt-0.5">{anomaly.observed_value}</div>
        </div>
      </div>

      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">
        {anomaly.explanation}
      </p>

      {anomaly.review_note && (
        <div className="mt-2.5 text-xs bg-blue-50/60 p-2.5 rounded-lg text-blue-950 border border-blue-100">
          <span className="font-bold text-blue-900">Officer Review Note:</span> {anomaly.review_note}
          {anomaly.reviewed_by && (
            <span className="text-blue-600 text-[11px] block mt-0.5">— {anomaly.reviewed_by} ({new Date(anomaly.reviewed_at || '').toLocaleDateString()})</span>
          )}
        </div>
      )}

      {canReview && !isReviewing && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => setIsReviewing(true)}
            className="text-xs font-bold px-3 py-1.5 bg-blue-950 text-white rounded-lg hover:bg-blue-900 transition-colors"
          >
            Review & Adjudicate Anomaly
          </button>
        </div>
      )}

      {isReviewing && (
        <form onSubmit={handleSubmitReview} className="mt-3 pt-3 border-t border-slate-200 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Update Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as AnomalyReviewStatus)}
                className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
              >
                <option value="RESOLVED">Resolved (Reconciled / Corrected)</option>
                <option value="UNDER_REVIEW">Under Review (Field Survey Ordered)</option>
                <option value="ACTION_REQUESTED">Action Requested (Citizen Clarification)</option>
                <option value="DISMISSED">Dismissed (False Positive)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Review Remarks</label>
              <input
                type="text"
                placeholder="Enter justification remarks..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsReviewing(false)}
              className="text-xs px-3 py-1 text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="text-xs px-3 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700"
            >
              {loading ? 'Saving...' : 'Save Decision'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
