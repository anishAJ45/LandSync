import React from 'react';
import { RestrictionZoneRecord } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Waves,
  Zap,
  Plane,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface RestrictionZoneViewerProps {
  zones: RestrictionZoneRecord[];
  parcelId: string;
  loading?: boolean;
}

export const RestrictionZoneViewer: React.FC<RestrictionZoneViewerProps> = ({
  zones,
  parcelId,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="p-4 bg-white rounded-xl border border-slate-200 animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-24 bg-slate-100 rounded" />
      </div>
    );
  }

  const getZoneIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'waterbody_buffer':
        return <Waves className="w-4 h-4 text-cyan-600" />;
      case 'high_tension_powerline':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'airport_funnel':
        return <Plane className="w-4 h-4 text-blue-600" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
    }
  };

  const getSeverityBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'prohibitive':
      case 'critical':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
      case 'regulated':
      case 'high':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
      case 'moderate':
        return 'bg-blue-50 text-blue-800 border-blue-200 font-medium';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              Statutory Restriction Zones & Buffer Checks
              <span className={`px-2 py-0.5 rounded-full text-[11px] border ${zones.length > 0 ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                {zones.length} Active {zones.length === 1 ? 'Restriction' : 'Restrictions'}
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              Statutory No-Development Zones, Environmental Catchments & Infrastructure Corridors
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-3 text-xs">
        {zones.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-950">Zero Restriction Buffer Encumbrances</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                This parcel does not intersect any notified PWD waterbody 50m buffers, high tension power corridors, railway safety zones, or airport height restrictions.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {zones.map((zone) => (
              <div
                key={zone.zone_id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                      {getZoneIcon(zone.zone_type)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        {zone.zone_name}
                        <span className={`text-[10px] px-2 py-0.2 rounded-full border ${getSeverityBadge(zone.restriction_level)}`}>
                          {zone.restriction_level.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Authority: <span className="text-slate-700">{zone.statutory_authority}</span> • Buffer: <span className="text-slate-800 font-semibold">{zone.buffer_distance_meters}m</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-200 text-slate-700">
                    {zone.zone_id}
                  </span>
                </div>

                {/* Regulation description */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed">
                  <span className="font-semibold text-blue-950">Statutory Rule: </span>
                  {zone.regulations}
                </div>

                {/* Legal Citation & Action */}
                <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 text-slate-500 gap-2">
                  <span className="italic">
                    Ref: <strong>{zone.legal_act_reference}</strong>
                  </span>

                  <span className="text-rose-700 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Strict Clearance Required for Mutation
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
