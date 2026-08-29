import React from 'react';
import { CivicServiceScore } from '../../types';
import {
  Award,
  Zap,
  Droplet,
  Navigation,
  Radio,
  Receipt,
  CheckCircle2,
  Waves,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface CivicServiceScoreCardProps {
  scoreData: CivicServiceScore | null;
}

export const CivicServiceScoreCard: React.FC<CivicServiceScoreCardProps> = ({ scoreData }) => {
  if (!scoreData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Civic Infrastructure Readiness</h3>
            <p className="text-xs text-slate-500">Composite Readiness & Service Index</p>
          </div>
        </div>
      </div>
    );
  }

  const score = scoreData.civic_service_score;
  const grade = scoreData.readiness_grade || (score >= 85 ? 'A+' : score >= 70 ? 'A' : score >= 55 ? 'B' : 'C');

  const getScoreColor = (sc: number) => {
    if (sc >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (sc >= 65) return 'text-blue-900 bg-blue-50 border-blue-300';
    if (sc >= 50) return 'text-amber-800 bg-amber-50 border-amber-300';
    return 'text-rose-600 bg-rose-50 border-rose-300';
  };

  const getScoreBarColor = (sc: number) => {
    if (sc >= 80) return 'bg-emerald-500';
    if (sc >= 65) return 'bg-blue-500';
    if (sc >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-800 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-lg">Civic Service Readiness Score</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-100 text-teal-900 border border-teal-300">
                Grade {grade}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Weighted index across 6 core civic & utility dimensions
            </p>
          </div>
        </div>

        {/* Big Score Dial */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className={`px-4 py-2 rounded-2xl border flex items-baseline gap-1.5 ${getScoreColor(score)}`}>
            <span className="text-3xl font-black font-mono">{score}</span>
            <span className="text-xs font-bold opacity-70">/100</span>
          </div>
        </div>
      </div>

      {/* Progress Bars for Dimensional Breakdown */}
      <div className="my-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Road Access */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-slate-600" />
              <span>Road Access (25%)</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{scoreData.breakdown.road_access_score}/100</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreBarColor(scoreData.breakdown.road_access_score)}`}
              style={{ width: `${scoreData.breakdown.road_access_score}%` }}
            />
          </div>
        </div>

        {/* Water Connection */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-blue-800" />
              <span>Water Grid (20%)</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{scoreData.breakdown.water_score}/100</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreBarColor(scoreData.breakdown.water_score)}`}
              style={{ width: `${scoreData.breakdown.water_score}%` }}
            />
          </div>
        </div>

        {/* Electricity */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-700" />
              <span>Electricity (20%)</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{scoreData.breakdown.electricity_score}/100</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreBarColor(scoreData.breakdown.electricity_score)}`}
              style={{ width: `${scoreData.breakdown.electricity_score}%` }}
            />
          </div>
        </div>

        {/* Drainage & Sewerage */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-teal-800" />
              <span>Drainage/UGD (15%)</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{scoreData.breakdown.drainage_sewerage_score}/100</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreBarColor(scoreData.breakdown.drainage_sewerage_score)}`}
              style={{ width: `${scoreData.breakdown.drainage_sewerage_score}%` }}
            />
          </div>
        </div>

        {/* Telecom & Digital */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-indigo-700" />
              <span>Telecom & 5G (10%)</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{scoreData.breakdown.telecom_score}/100</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreBarColor(scoreData.breakdown.telecom_score)}`}
              style={{ width: `${scoreData.breakdown.telecom_score}%` }}
            />
          </div>
        </div>

        {/* Tax Compliance */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tax Compliance (10%)</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{scoreData.breakdown.tax_compliance_score}/100</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreBarColor(scoreData.breakdown.tax_compliance_score)}`}
              style={{ width: `${scoreData.breakdown.tax_compliance_score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Summary Interpretation */}
      <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-100 text-xs text-teal-950 flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-800 shrink-0" />
        <span>
          <strong>Overall Assessment:</strong> {scoreData.summary}
        </span>
      </div>
    </div>
  );
};
