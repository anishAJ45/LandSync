import React from 'react';
import { ShieldCheck, AlertTriangle, XOctagon } from 'lucide-react';

interface ConfidenceMeterProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  score,
  label,
  size = 'md',
  showLevel = true,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  const getLevelDetails = () => {
    if (clampedScore >= 90) {
      return {
        level: 'HIGH CONFIDENCE',
        color: 'text-emerald-700',
        barColor: 'bg-emerald-600',
        bgTrack: 'bg-emerald-100',
        badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        icon: ShieldCheck,
      };
    }
    if (clampedScore >= 75) {
      return {
        level: 'REVIEW RECOMMENDED',
        color: 'text-amber-700',
        barColor: 'bg-amber-500',
        bgTrack: 'bg-amber-100',
        badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
        icon: AlertTriangle,
      };
    }
    if (clampedScore >= 50) {
      return {
        level: 'SIGNIFICANT DIFFERENCES',
        color: 'text-orange-700',
        barColor: 'bg-orange-500',
        bgTrack: 'bg-orange-100',
        badgeBg: 'bg-orange-50 border-orange-200 text-orange-800',
        icon: AlertTriangle,
      };
    }
    return {
      level: 'CRITICAL REVIEW REQUIRED',
      color: 'text-rose-700',
      barColor: 'bg-rose-600',
      bgTrack: 'bg-rose-100',
      badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: XOctagon,
    };
  };

  const details = getLevelDetails();
  const Icon = details.icon;

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${details.barColor}`}
            style={{ width: `${clampedScore}%` }}
          />
        </div>
        <span className={`text-xs font-bold font-mono ${details.color}`}>
          {clampedScore}%
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-600">
            {label || 'AI Match Confidence Score'}
          </span>
          {showLevel && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${details.badgeBg}`}
            >
              <Icon className="w-3 h-3" />
              {details.level}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-lg font-bold font-mono tracking-tight ${details.color}`}>
            {clampedScore}
          </span>
          <span className="text-xs text-slate-500 font-mono">/100</span>
        </div>
      </div>
      <div className={`w-full h-2.5 rounded-full overflow-hidden ${details.bgTrack}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${details.barColor}`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
    </div>
  );
};
