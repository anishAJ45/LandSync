import React from 'react';
import { SpatialRiskScore } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  Info,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

interface SpatialRiskCardProps {
  riskScore: SpatialRiskScore | null;
  loading?: boolean;
}

export const SpatialRiskCard: React.FC<SpatialRiskCardProps> = ({
  riskScore,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="p-4 bg-white rounded-xl border border-slate-200 animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-28 bg-slate-100 rounded" />
      </div>
    );
  }

  if (!riskScore) {
    return null;
  }

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
      case 'high':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-800',
          border: 'border-rose-200',
          gauge: 'text-rose-600',
          badge: 'bg-rose-600 text-white'
        };
      case 'moderate':
      case 'medium':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          gauge: 'text-amber-500',
          badge: 'bg-amber-500 text-white'
        };
      default:
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-800',
          border: 'border-emerald-200',
          gauge: 'text-emerald-500',
          badge: 'bg-emerald-600 text-white'
        };
    }
  };

  const style = getRiskColor(riskScore.risk_level);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs ${riskScore.risk_score > 50 ? 'bg-rose-600' : 'bg-blue-900'}`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              Composite Spatial Risk Engine
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${style.badge}`}>
                {riskScore.risk_level.toUpperCase()} RISK ({riskScore.risk_score}/100)
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              Multi-factor AI assessment across Zoning, Restrictions, Satellite & Permissions
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4 text-xs">
        {/* Score & Factors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Main Circular / Bar Metric */}
          <div className={`p-4 rounded-xl border ${style.border} ${style.bg} text-center space-y-1`}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Spatial Risk Index
            </div>
            <div className={`text-4xl font-extrabold ${style.gauge} tracking-tight`}>
              {riskScore.risk_score}
              <span className="text-sm font-semibold text-slate-400">/100</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-700">
              Assessed on {riskScore.calculated_at}
            </div>
          </div>

          {/* Breakdown progress bars */}
          <div className="md:col-span-2 space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-700">
                <span>Zoning & Land Use Conformity (25%)</span>
                <span>{riskScore.factors_breakdown.zoning_conformity}/25</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full"
                  style={{ width: `${(riskScore.factors_breakdown.zoning_conformity / 25) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-700">
                <span>Statutory Restriction Zone Clearance (25%)</span>
                <span>{riskScore.factors_breakdown.restriction_zone_clearance}/25</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${(riskScore.factors_breakdown.restriction_zone_clearance / 25) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-700">
                <span>Satellite Change & Temporal Stability (20%)</span>
                <span>{riskScore.factors_breakdown.satellite_change_stability}/20</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-600 rounded-full"
                  style={{ width: `${(riskScore.factors_breakdown.satellite_change_stability / 20) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-700">
                <span>Environmental & Flood Hazard Resilience (15%)</span>
                <span>{riskScore.factors_breakdown.environmental_resilience}/15</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-600 rounded-full"
                  style={{ width: `${(riskScore.factors_breakdown.environmental_resilience / 15) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-700">
                <span>Building Sanction & Setback Compliance (15%)</span>
                <span>{riskScore.factors_breakdown.building_compliance}/15</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(riskScore.factors_breakdown.building_compliance / 15) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plain Language Explainability */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            AI Explainable Spatial Summary
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed pl-5">
            {riskScore.explainable_summary}
          </p>
        </div>

        {/* Recommended Statutory Actions */}
        {riskScore.recommended_actions && riskScore.recommended_actions.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-blue-950 uppercase tracking-wider">
              Recommended Statutory Actions
            </div>
            <div className="space-y-1">
              {riskScore.recommended_actions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-white border border-slate-200 flex items-center gap-2 text-[11px] text-slate-700"
                >
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
