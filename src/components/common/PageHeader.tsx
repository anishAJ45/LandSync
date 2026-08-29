import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, LayoutDashboard, Sparkles, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  icon?: any;
  badge?: {
    text: string;
    variant?: 'teal' | 'blue' | 'purple' | 'amber' | 'emerald' | 'rose';
  };
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  icon: Icon,
  badge,
  actions
}) => {
  const { activeStateCode } = useLanguage();

  const badgeStyles = {
    teal: 'bg-teal-50 text-teal-900 border-teal-200',
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
    purple: 'bg-purple-50 text-purple-900 border-purple-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    rose: 'bg-rose-50 text-rose-900 border-rose-200'
  };

  return (
    <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 -mt-6 sm:-mt-8 px-4 sm:px-6 py-4 sm:py-5 mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 overflow-x-auto">
          <Link
            to="/dashboards"
            className="hover:text-blue-950 flex items-center gap-1 font-medium transition"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Dashboards</span>
          </Link>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  className="hover:text-blue-950 font-medium transition truncate max-w-[160px]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-teal-300 flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5 sm:mt-0">
              <Icon className="w-5 h-5 text-teal-400" />
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {title}
              </h1>

              {badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    badgeStyles[badge.variant || 'teal']
                  }`}
                >
                  {badge.text}
                </span>
              )}

              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                State: {activeStateCode}
              </span>
            </div>

            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
