import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
}) => {
  const variantStyles = {
    primary: {
      bg: 'bg-white',
      border: 'border-slate-200',
      iconBg: 'bg-blue-50 text-blue-800',
      valueColor: 'text-slate-900',
    },
    secondary: {
      bg: 'bg-white',
      border: 'border-slate-200',
      iconBg: 'bg-teal-50 text-teal-700',
      valueColor: 'text-teal-900',
    },
    success: {
      bg: 'bg-white',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-700',
      valueColor: 'text-emerald-950',
    },
    warning: {
      bg: 'bg-white',
      border: 'border-amber-200',
      iconBg: 'bg-amber-50 text-amber-700',
      valueColor: 'text-amber-950',
    },
    danger: {
      bg: 'bg-white',
      border: 'border-red-200',
      iconBg: 'bg-red-50 text-red-700',
      valueColor: 'text-red-950',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      id={id}
      className={`p-5 rounded-xl border ${style.border} ${style.bg} shadow-xs transition hover:shadow-md flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className={`mt-2 text-2xl font-bold tracking-tight ${style.valueColor}`}>
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${style.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {subtitle && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs font-medium text-slate-600">
          {subtitle}
        </div>
      )}
    </div>
  );
};
