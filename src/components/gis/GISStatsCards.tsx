import React from 'react';
import { GISStatistics } from '../../types';
import { Layers, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Building2, Trees, Landmark } from 'lucide-react';

interface GISStatsCardsProps {
  stats: GISStatistics | null;
  loading?: boolean;
}

export const GISStatsCards: React.FC<GISStatsCardsProps> = ({ stats, loading = false }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div id="gis-metrics-overview" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Parcels */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Geo-Parcels
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.total_parcels}
          </span>
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
            100% Digitized
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500 truncate">
          Coimbatore District, Sulur Block
        </div>
      </div>

      {/* 2. Land Use Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Land Use Split
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Trees className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800" title="Residential">
            {stats.residential_count} Res
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800" title="Agricultural">
            {stats.agricultural_count} Agri
          </span>
          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800" title="Commercial">
            {stats.commercial_count} Com
          </span>
          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800" title="Government">
            {stats.government_count} Govt
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          Multi-sector spatial classification
        </div>
      </div>

      {/* 3. Area Discrepancies */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Area Variance Flagged
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-900 tracking-tight">
            {stats.area_mismatch_count}
          </span>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
            &gt;2% difference
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500 truncate">
          Recorded Patta vs GIS geometry
        </div>
      </div>

      {/* 4. Polygon Overlaps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Overlap Anomaly
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-rose-900 tracking-tight">
            {stats.overlap_count}
          </span>
          <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md animate-pulse">
            Active Disputes
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500 truncate">
          Automated Shapely spatial overlap detection
        </div>
      </div>
    </div>
  );
};
