import React from 'react';
import { ZoningRecord, MasterPlanRecord } from '../../types';
import {
  Building2,
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Layers,
  ArrowUpRight,
  Sparkles,
  Info
} from 'lucide-react';

interface ZoningInfoCardProps {
  zoning: ZoningRecord | null;
  masterPlan?: MasterPlanRecord | null;
  loading?: boolean;
}

export const ZoningInfoCard: React.FC<ZoningInfoCardProps> = ({
  zoning,
  masterPlan,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="p-4 bg-white rounded-xl border border-slate-200 animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-16 bg-slate-100 rounded" />
        <div className="h-20 bg-slate-100 rounded" />
      </div>
    );
  }

  if (!zoning) {
    return (
      <div className="p-5 bg-white rounded-xl border border-slate-200 text-center">
        <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">No Zoning Record Found</p>
        <p className="text-xs text-slate-400 mt-1">This parcel has not been classified under the current Master Plan.</p>
      </div>
    );
  }

  const getZoneBadgeColor = (code: string) => {
    if (code.startsWith('R')) return 'bg-teal-50 text-teal-800 border-teal-200';
    if (code.startsWith('C')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (code.startsWith('I')) return 'bg-purple-50 text-purple-800 border-purple-200';
    if (code.startsWith('AG')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (code.startsWith('W') || code.startsWith('CRZ')) return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    return 'bg-slate-50 text-slate-800 border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              Master Plan & Zoning Classification
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getZoneBadgeColor(zoning.zone_code)}`}>
                {zoning.zone_code} - {zoning.zone_name}
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              Statutory Land Use Regulations under {zoning.plan_authority}
            </p>
          </div>
        </div>

        {zoning.special_conditions && zoning.special_conditions.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            {zoning.special_conditions.length} Condition{zoning.special_conditions.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4 text-xs">
        {/* Development Parameters Grid */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Permissible Development Parameters
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block text-[11px]">Max FAR / FSI</span>
              <span className="text-sm font-bold text-blue-950">{zoning.max_far.toFixed(2)}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block text-[11px]">Max Height</span>
              <span className="text-sm font-bold text-blue-950">{zoning.max_height_meters} Meters</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block text-[11px]">Max Ground Coverage</span>
              <span className="text-sm font-bold text-blue-950">{zoning.max_ground_coverage_percentage}%</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block text-[11px]">Min Setbacks (F/R/S)</span>
              <span className="text-sm font-bold text-blue-950">
                {zoning.min_setback_meters.front}m / {zoning.min_setback_meters.rear}m / {zoning.min_setback_meters.sides}m
              </span>
            </div>
          </div>
        </div>

        {/* Permitted vs Prohibited Uses */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Permitted */}
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1.5">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Permitted Activities
            </div>
            <ul className="space-y-1 text-[11px] text-emerald-800">
              {zoning.permitted_uses.map((use, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {use}
                </li>
              ))}
            </ul>
          </div>

          {/* Conditional */}
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 space-y-1.5">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Conditional Uses (NOC Required)
            </div>
            <ul className="space-y-1 text-[11px] text-amber-800">
              {zoning.conditional_uses && zoning.conditional_uses.length > 0 ? (
                zoning.conditional_uses.map((use, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {use}
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic">None specified</li>
              )}
            </ul>
          </div>

          {/* Prohibited */}
          <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/40 space-y-1.5">
            <div className="font-bold text-rose-900 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Strictly Prohibited
            </div>
            <ul className="space-y-1 text-[11px] text-rose-800">
              {zoning.prohibited_uses.map((use, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {use}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Special Conditions / Notified Caveats */}
        {zoning.special_conditions && zoning.special_conditions.length > 0 && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Special Statutory Conditions & Covenants
            </div>
            <div className="space-y-1 text-[11px] text-slate-600 pl-5">
              {zoning.special_conditions.map((cond, idx) => (
                <div key={idx} className="list-disc">
                  • {cond}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Master Plan Metadata */}
        {masterPlan && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              <span className="font-semibold text-slate-700">Master Plan:</span> {masterPlan.plan_name} ({masterPlan.valid_from} - {masterPlan.valid_to})
            </div>
            <div>
              <span className="font-semibold text-slate-700">Gazette Ref:</span> {masterPlan.gazette_notification_no}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
