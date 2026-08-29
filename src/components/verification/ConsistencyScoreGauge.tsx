import React from 'react';
import { ConsistencyLevel } from '../../types';
import { CheckCircle, AlertTriangle, AlertOctagon, ShieldCheck, TrendingDown, Info } from 'lucide-react';

interface ConsistencyScoreGaugeProps {
  score: number;
  level: ConsistencyLevel;
  totalRecords: number;
  matches: number;
  minorDifferences: number;
  majorMismatches: number;
  criticalMismatches: number;
  className?: string;
}

export const ConsistencyScoreGauge: React.FC<ConsistencyScoreGaugeProps> = ({
  score,
  level,
  totalRecords,
  matches,
  minorDifferences,
  majorMismatches,
  criticalMismatches,
  className = '',
}) => {
  const getScoreColor = () => {
    if (score >= 90) return { stroke: '#10b981', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-700', label: 'High Consistency' };
    if (score >= 75) return { stroke: '#0284c7', bg: 'bg-sky-50 text-sky-800 border-sky-200', text: 'text-sky-700', label: 'Good Consistency' };
    if (score >= 50) return { stroke: '#f59e0b', bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'text-amber-700', label: 'Moderate Consistency' };
    return { stroke: '#ef4444', bg: 'bg-rose-50 text-rose-800 border-rose-200', text: 'text-rose-700', label: 'Low Consistency (Review Required)' };
  };

  const color = getScoreColor();
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div id="consistency-score-gauge" className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${className}`}>
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Circular Progress Gauge */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-100"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke={color.stroke}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{score}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">out of 100</span>
          </div>
        </div>

        {/* Score Details & Penalty Breakdown */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Overall Consistency Score
              </h4>
              <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {score >= 75 ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                ) : score >= 50 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                ) : (
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                )}
                {color.label}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${color.bg}`}>
              {level.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <span className="text-xs text-slate-500 block font-medium">Exact Matches</span>
              <span className="text-sm font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                {matches} fields
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <span className="text-xs text-slate-500 block font-medium">Minor Variations</span>
              <span className="text-sm font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                {minorDifferences} (-{minorDifferences * 5} pts)
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <span className="text-xs text-slate-500 block font-medium">Major Mismatches</span>
              <span className="text-sm font-bold text-orange-700 flex items-center gap-1 mt-0.5">
                <TrendingDown className="w-3.5 h-3.5 text-orange-600" />
                {majorMismatches} (-{majorMismatches * 15} pts)
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <span className="text-xs text-slate-500 block font-medium">Critical Conflicts</span>
              <span className="text-sm font-bold text-rose-700 flex items-center gap-1 mt-0.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                {criticalMismatches} (-{criticalMismatches * 25} pts)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
