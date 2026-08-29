import React from 'react';
import { BuildingPermissionRecord } from '../../types';
import {
  Building,
  CheckCircle2,
  AlertTriangle,
  FileText,
  AlertOctagon,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface BuildingPermissionCardProps {
  permission: BuildingPermissionRecord | null;
  gisArea?: number;
  loading?: boolean;
}

export const BuildingPermissionCard: React.FC<BuildingPermissionCardProps> = ({
  permission,
  gisArea,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="p-4 bg-white rounded-xl border border-slate-200 animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-20 bg-slate-100 rounded" />
      </div>
    );
  }

  if (!permission) {
    return (
      <div className="p-5 bg-white rounded-xl border border-slate-200 text-center">
        <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">No Building Permission on Record</p>
        <p className="text-xs text-slate-400 mt-1">
          No sanctioned building plan or structural approval has been registered for this parcel. Any physical construction may constitute an unapproved development.
        </p>
      </div>
    );
  }

  const hasDeviation = permission.deviation_flag;
  const deviationColor = hasDeviation
    ? 'bg-rose-50 text-rose-800 border-rose-200'
    : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs text-white ${hasDeviation ? 'bg-rose-600' : 'bg-blue-900'}`}>
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              Sanctioned Building Permission
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${deviationColor}`}>
                {hasDeviation ? 'Deviation Detected' : 'Fully Compliant'}
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              Permit ID: <span className="font-mono font-medium text-slate-700">{permission.permission_id}</span> ({permission.issuing_authority})
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Sanction Date</span>
          <span className="text-xs font-semibold text-slate-700">{permission.sanction_date}</span>
        </div>
      </div>

      <div className="p-5 space-y-4 text-xs">
        {/* Core Parameters Comparison Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Sanctioned Built-Up</span>
            <span className="text-sm font-bold text-blue-950">{permission.sanctioned_area_sqm} sq.m</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Approved Floors</span>
            <span className="text-sm font-bold text-blue-950">G + {permission.sanctioned_floors - 1} ({permission.sanctioned_floors} Floors)</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Sanctioned Use</span>
            <span className="text-sm font-bold text-blue-950">{permission.proposed_use}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Approval Status</span>
            <span className="text-sm font-bold text-emerald-700">{permission.approval_status}</span>
          </div>
        </div>

        {/* AI Built-up vs Sanctioned Deviation Box */}
        {hasDeviation ? (
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-rose-900 text-xs">
                <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" />
                Structural / Setback Deviation Detected
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white">
                +{permission.deviation_percentage?.toFixed(1)}% Excess
              </span>
            </div>

            <p className="text-[11px] text-rose-800 leading-relaxed">
              {permission.deviation_notes || 'Physical satellite footprint exceeds sanctioned spatial extent. Notice has been scheduled.'}
            </p>

            <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between text-[11px] text-rose-900">
              <span>Inspector Protocol: <strong>Section 56 TN Town & Country Planning Act</strong></span>
              <button
                type="button"
                className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-lg shadow-xs transition-colors"
              >
                Issue Show-Cause Notice
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-[11px] text-emerald-800">
              <span className="font-bold">Sanctioned Footprint Verified:</span> Physical construction on-ground strictly conforms to approved architectural drawings and setbacks.
            </div>
          </div>
        )}

        {/* Setback and Coverage Compliance Details */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
          <div>
            <span className="font-semibold text-slate-800">Applicant:</span> {permission.applicant_name}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Validity:</span> {permission.valid_until}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Architect Reg:</span> CA/2019/TN-4491
          </div>
        </div>
      </div>
    </div>
  );
};
