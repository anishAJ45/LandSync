import React from 'react';
import {
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Users,
  Compass,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ParcelAnalysis, NeighborParcel } from '../../types';

interface ParcelAnalysisPanelProps {
  analysis: ParcelAnalysis;
  onSelectNeighbor?: (parcelId: string) => void;
  className?: string;
}

export const ParcelAnalysisPanel: React.FC<ParcelAnalysisPanelProps> = ({
  analysis,
  onSelectNeighbor,
  className = '',
}) => {
  const boundaryStatus = analysis.boundary_status;
  const isMatch = boundaryStatus === 'MATCH';
  const isMinor = boundaryStatus === 'MINOR DIFFERENCE';
  const isMajor = boundaryStatus === 'MAJOR DIFFERENCE';

  const statusBadge = {
    MATCH: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      desc: 'Area matches within permissible survey tolerance (≤ 2.0%).',
    },
    'MINOR DIFFERENCE': {
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
      icon: AlertCircle,
      desc: 'Minor variance detected (2.0% - 5.0%). Typical of legacy chain survey conversion.',
    },
    'MAJOR DIFFERENCE': {
      bg: 'bg-rose-50 text-rose-900 border-rose-200',
      icon: AlertTriangle,
      desc: 'Significant variance (> 5.0%). Requires DGPS ground verification and physical resurvey.',
    },
  }[boundaryStatus] || {
    bg: 'bg-slate-50 text-slate-800 border-slate-200',
    icon: CheckCircle2,
    desc: 'Boundary status evaluated.',
  };

  const StatusIcon = statusBadge.icon;

  return (
    <div id="parcel-spatial-analysis-card" className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
            <Maximize2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm tracking-tight">
              Spatial & Geometric Integrity Analysis
            </h4>
            <p className="text-[11px] text-slate-500">
              Automated comparison between Revenue Records (Patta) and Cadastral GIS Polygons
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusBadge.bg}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {analysis.boundary_status}
        </span>
      </div>

      {/* Area Comparison Gauge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Recorded Revenue Area (Patta)
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {analysis.recorded_area} <span className="text-xs font-normal text-slate-600">{analysis.area_unit}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Official State Land Register</div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            GIS Polygon Calculated Area
          </div>
          <div className="text-xl font-black text-blue-950 mt-1">
            {analysis.gis_area} <span className="text-xs font-normal text-slate-600">{analysis.area_unit}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">DGPS / Satellite Vector Extent</div>
        </div>

        <div className={`border rounded-xl p-3.5 text-center ${statusBadge.bg}`}>
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
            Computed Discrepancy
          </div>
          <div className="text-xl font-black mt-1">
            {analysis.area_difference} {analysis.area_unit}{' '}
            <span className="text-xs font-bold">({analysis.percentage_difference}%)</span>
          </div>
          <div className="text-[10px] opacity-80 mt-0.5">{statusBadge.desc}</div>
        </div>
      </div>

      {/* Polygon Overlap / Conflict Box */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-blue-900" /> Boundary Overlap Assessment
        </div>

        {analysis.overlap_status.has_overlap ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Active Polygon Overlap Detected</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 text-[10px] font-bold">
                Severity: {analysis.overlap_status.overlap_severity}
              </span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              The polygon geometry overlaps with adjoining parcel{' '}
              <span className="font-bold font-mono">
                {analysis.overlap_status.overlapping_parcels.join(', ')}
              </span>{' '}
              by approximately{' '}
              <span className="font-bold">{analysis.overlap_status.overlap_area_acres} Acres</span>.
              This indicates conflicting survey entries or encroaching cadastral coordinates.
            </p>
          </div>
        ) : (
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs text-emerald-900">
              <span className="font-bold">Zero Geometric Overlaps.</span> The parcel boundary lines are topologically clean with no coordinate intersections with surrounding survey plots.
            </div>
          </div>
        )}
      </div>

      {/* Adjacent & Nearby Parcels List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-900" /> Adjacent & Neighbouring Cadastral Parcels
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {analysis.neighbor_count} connected parcels
          </span>
        </div>

        {analysis.neighbors && analysis.neighbors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {analysis.neighbors.map((neighbor, idx) => (
              <div
                key={idx}
                onClick={() => onSelectNeighbor?.(neighbor.parcel_id)}
                className={`p-3 rounded-xl border border-slate-200 bg-slate-50/70 transition flex flex-col justify-between ${
                  onSelectNeighbor ? 'cursor-pointer hover:bg-blue-50/50 hover:border-blue-300' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-blue-950">
                      Survey {neighbor.survey_number}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {neighbor.relationship}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-800 font-medium truncate">
                    {neighbor.owner}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {neighbor.land_use} • {neighbor.parcel_id}
                  </div>
                </div>

                {neighbor.distance_approx_m !== undefined && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Proximity: ~{neighbor.distance_approx_m}m</span>
                    {onSelectNeighbor && (
                      <span className="text-blue-900 font-bold flex items-center gap-0.5">
                        Inspect <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded-xl text-center">
            No adjacent cadastral parcels found in proximity.
          </div>
        )}
      </div>

      {/* Mandatory SIH Prototype Disclaimer */}
      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
        {analysis.disclaimer}
      </div>
    </div>
  );
};
