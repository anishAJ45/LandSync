import React from 'react';
import { ConsistencyLevel } from '../../types';
import { Sparkles, ShieldAlert, CheckCircle, ArrowRightCircle } from 'lucide-react';

interface ExplainableSummaryCardProps {
  summary: string;
  score: number;
  level: ConsistencyLevel;
  criticalCount: number;
  majorCount: number;
  minorCount: number;
}

export const ExplainableSummaryCard: React.FC<ExplainableSummaryCardProps> = ({
  summary,
  score,
  level,
  criticalCount,
  majorCount,
  minorCount,
}) => {
  const getRecommendation = () => {
    if (criticalCount > 0) {
      return {
        action: 'Mandatory Officer Field Hearing & Title Verification',
        detail: 'Critical survey or ownership conflicts prevent automated approval. Issue physical hearing notice to applicant and adjoining owners.',
        badgeBg: 'bg-rose-100 text-rose-900 border-rose-200',
      };
    }
    if (majorCount > 0) {
      return {
        action: 'Cadastral DGPS Resurvey & Reconciliation',
        detail: 'Significant area variance detected between spatial GIS polygon and Revenue Patta. Dispatch surveyor for boundary check.',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
      };
    }
    if (minorCount > 0) {
      return {
        action: 'Expedited Review with Identity Note',
        detail: 'Data is highly consistent with minor phonetic/initials variation. Ready for officer attestation with standard identity endorsement.',
        badgeBg: 'bg-sky-100 text-sky-900 border-sky-200',
      };
    }
    return {
      action: 'Expedited Automated Endorsement',
      detail: 'Complete harmonic alignment confirmed across all departmental registers. Zero discrepancies found.',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    };
  };

  const rec = getRecommendation();

  return (
    <div id="explainable-summary-card" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      {/* Official AI Decision-Support Disclaimer Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-900">Land Intelligence Decision-Support Engine</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          <ShieldAlert className="w-3 h-3 text-amber-600" />
          Decision-Support Tool — Not Automatic Legal Decision
        </span>
      </div>

      {/* Synthesis Narrative */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Explainable Verification Synthesis
        </h4>
        <p className="text-sm text-slate-800 leading-relaxed bg-indigo-50/30 rounded-xl p-4 border border-indigo-100/60 font-normal">
          {summary}
        </p>
      </div>

      {/* Recommended Officer Action */}
      <div className="pt-3 border-t border-slate-100">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          System Recommended Officer Action
        </h4>
        <div className={`p-3.5 rounded-xl border ${rec.badgeBg} flex items-start gap-3`}>
          <ArrowRightCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm block">{rec.action}</span>
            <span className="text-xs opacity-90 mt-0.5 block">{rec.detail}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
