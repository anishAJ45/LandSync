import React, { useState } from 'react';
import { SpatialConflictRecord } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Send,
  Scale,
  Building,
  Waves,
  Zap,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { spatialService } from '../../services/spatialService';

interface SpatialConflictModalProps {
  conflict: SpatialConflictRecord | null;
  onClose: () => void;
  onResolved: () => void;
}

export const SpatialConflictModal: React.FC<SpatialConflictModalProps> = ({
  conflict,
  onClose,
  onResolved
}) => {
  const [resolutionStatus, setResolutionStatus] = useState<'Resolved' | 'Disputed' | 'Notice Issued'>('Resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!conflict) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setError('Please provide administrative resolution notes or reference notice number.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await spatialService.resolveSpatialConflict(conflict.conflict_id, resolutionStatus, resolutionNotes);
      onResolved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update conflict resolution');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-blue-950 flex items-center gap-2">
                Spatial Conflict & Encroachment Adjudication
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-rose-100 text-rose-800 border border-rose-200">
                  {conflict.conflict_id}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Statutory Dispute Resolution & Revenue Notice Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Conflict Details Grid */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 text-sm">{conflict.conflict_type}</div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                {conflict.severity.toUpperCase()} SEVERITY
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Parcel</span>
                <span className="font-mono font-bold text-blue-950">{conflict.parcel_id}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Overlapping Entity</span>
                <span className="font-semibold text-slate-800">{conflict.overlapping_entity}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Encroachment Extent</span>
                <span className="font-bold text-rose-700">{conflict.encroachment_extent_sqm} sq.m</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Detection Date</span>
                <span className="font-semibold text-slate-700">{conflict.detection_date}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Current Status</span>
                <span className="font-bold text-amber-700">{conflict.status}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900">Conflict Details: </span>
              {conflict.description}
            </div>
          </div>

          {/* Adjudication Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Resolution / Administrative Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Resolved', 'Notice Issued', 'Disputed'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setResolutionStatus(s)}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                      resolutionStatus === s
                        ? 'bg-blue-950 text-white border-blue-950 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Adjudication Orders & Inspector Findings
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter revenue officer order number, field survey findings, eviction schedule, or regularisation remarks..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Record Adjudication Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
