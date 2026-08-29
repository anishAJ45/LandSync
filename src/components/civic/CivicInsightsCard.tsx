import React from 'react';
import { CivicInsight } from '../../types';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileWarning
} from 'lucide-react';

interface CivicInsightsCardProps {
  insights: CivicInsight[];
}

export const CivicInsightsCard: React.FC<CivicInsightsCardProps> = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getInsightIcon = (type: string, severity: string) => {
    if (severity === 'CRITICAL' || severity === 'HIGH') return <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />;
    if (severity === 'WARNING' || severity === 'MEDIUM') return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
    if (severity === 'POSITIVE' || type === 'INFRASTRUCTURE_OPPORTUNITY') return <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />;
    return <Info className="w-5 h-5 text-blue-600 shrink-0" />;
  };

  const getInsightStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-50/70 border-rose-200 text-rose-950';
      case 'WARNING':
      case 'MEDIUM':
        return 'bg-amber-50/70 border-amber-200 text-amber-950';
      default:
        return 'bg-blue-50/60 border-blue-200 text-blue-950';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">Cross-Layer Civic & Governance Intelligence</h3>
          <p className="text-xs text-slate-500">
            Automated correlation between Land Registry, Municipal Tax, GIS Cadastre & Utility Grids
          </p>
        </div>
      </div>

      <div className="space-y-3 my-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-xl border flex items-start gap-3 transition ${getInsightStyle(
              insight.severity
            )}`}
          >
            {getInsightIcon(insight.insight_type, insight.severity)}
            <div className="space-y-1 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs sm:text-sm">{insight.title}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase self-start sm:self-auto ${
                    insight.severity === 'CRITICAL'
                      ? 'bg-rose-200 text-rose-900'
                      : insight.severity === 'WARNING'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-blue-200 text-blue-900'
                  }`}
                >
                  {insight.severity} Priority
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{insight.description}</p>
              {insight.recommended_action && (
                <div className="pt-2 mt-1 border-t border-black/5 flex items-center gap-1.5 text-xs font-semibold">
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  <span>Recommendation: {insight.recommended_action}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
