import React from 'react';
import { StateReadinessReport } from '../../types';
import { Gauge, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface StateReadinessScoreProps {
  report: StateReadinessReport;
  onOpenAudit?: () => void;
}

export const StateReadinessScore: React.FC<StateReadinessScoreProps> = ({
  report,
  onOpenAudit
}) => {
  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'DEPLOYMENT_READY':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'CONFIGURED':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'PARTIALLY_CONFIGURED':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const factorKeys = Object.keys(report.factor_scores);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-teal-800" />
            <h3 className="font-extrabold text-slate-900 text-base">
              National Scalability & State Readiness Index
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates data model completeness, unit conversion accuracy, API connector health, and legal compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-teal-900 to-emerald-950 text-white px-4 py-2 rounded-2xl shadow-sm">
            <span className="text-2xl font-black text-emerald-400">{report.overall_score}</span>
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-teal-200 leading-tight">
              <div>Overall</div>
              <div>Score / 100</div>
            </div>
          </div>

          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase border flex items-center gap-1.5 ${getBadgeColor(
              report.readiness_level
            )}`}
          >
            <ShieldCheck className="w-4 h-4" />
            {report.readiness_level.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Factor Breakdown Grid */}
      <div className="mt-6">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
          Readiness Evaluation Factors ({factorKeys.length} Dimensions)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {factorKeys.map((key) => {
            const factor = report.factor_scores[key];
            return (
              <div
                key={key}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{factor.factor_name}</span>
                    <span className="font-black text-teal-900 text-xs">{factor.score}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${
                        factor.score >= 90
                          ? 'bg-emerald-600'
                          : factor.score >= 75
                          ? 'bg-teal-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                    {factor.details}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                  <span>Weight: {factor.weight}%</span>
                  <span className="text-emerald-700">{factor.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations & Audit */}
      {report.recommendations && report.recommendations.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-teal-50/60 border border-teal-200/80">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-teal-900 mb-2">
            <Sparkles className="w-4 h-4 text-teal-700" />
            <span>State Configuration Verification Highlights</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {report.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-teal-700 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
