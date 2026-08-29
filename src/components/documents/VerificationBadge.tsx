import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { DocumentVerificationStatus, MatchType, MismatchSeverity } from '../../types';

interface VerificationBadgeProps {
  status: DocumentVerificationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const config = (() => {
    switch (status) {
      case 'VERIFIED':
        return {
          label: 'AI Verified & Validated',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
        };
      case 'MISMATCH_FOUND':
        return {
          label: 'Discrepancy Detected',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
        };
      case 'REVIEW_REQUIRED':
        return {
          label: 'Officer Review Required',
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          icon: AlertCircle,
          iconColor: 'text-orange-600',
        };
      case 'FAILED':
        return {
          label: 'Verification Failed',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: XCircle,
          iconColor: 'text-rose-600',
        };
      case 'PENDING':
      default:
        return {
          label: 'OCR In Progress',
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: Clock,
          iconColor: 'text-slate-600',
        };
    }
  })();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2',
  }[size];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-tight ${config.bg} ${sizeClasses}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: MismatchSeverity | string }> = ({ severity }) => {
  const config = (() => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300 font-semibold';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-medium';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200 font-normal';
      case 'INFO':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-normal';
    }
  })();

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] uppercase tracking-wider border ${config}`}>
      {severity}
    </span>
  );
};

export const MatchTypeBadge: React.FC<{ matchType: MatchType | string }> = ({ matchType }) => {
  const label = matchType.replace(/_/g, ' ');
  const style = (() => {
    switch (matchType) {
      case 'EXACT_MATCH':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'FUZZY_MATCH':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'MINOR_DIFFERENCE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MISMATCH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  })();

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-medium border ${style}`}>
      {label}
    </span>
  );
};
