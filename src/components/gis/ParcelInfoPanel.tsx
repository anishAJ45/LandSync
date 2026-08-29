import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Maximize2,
  User,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  X,
  Compass,
  FileText
} from 'lucide-react';
import { Parcel, ParcelAnalysis } from '../../types';

interface ParcelInfoPanelProps {
  parcel: Parcel;
  analysis: ParcelAnalysis | null;
  loadingAnalysis: boolean;
  onClose: () => void;
  className?: string;
}

export const ParcelInfoPanel: React.FC<ParcelInfoPanelProps> = ({
  parcel,
  analysis,
  loadingAnalysis,
  onClose,
  className = '',
}) => {
  const navigate = useNavigate();

  // Status colors
  const statusColors = {
    Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Under Review': 'bg-amber-100 text-amber-900 border-amber-200',
    'Boundary Discrepancy': 'bg-rose-100 text-rose-900 border-rose-200',
  }[parcel.status] || 'bg-slate-100 text-slate-800 border-slate-200';

  const boundaryStatus = analysis?.boundary_status || 'MATCH';
  const boundaryColor = {
    MATCH: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    'MINOR DIFFERENCE': 'text-amber-800 bg-amber-50 border-amber-200',
    'MAJOR DIFFERENCE': 'text-rose-800 bg-rose-50 border-rose-200',
  }[boundaryStatus];

  return (
    <div
      id={`parcel-info-panel-${parcel.parcel_id}`}
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col max-h-[85vh] ${className}`}
    >
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-800/80 text-teal-300">
              Survey {parcel.survey_number}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusColors}`}>
              {parcel.status}
            </span>
          </div>
          <h3 className="font-bold text-base text-white tracking-tight truncate">
            {parcel.parcel_id}
          </h3>
          <p className="text-xs text-slate-300 truncate">
            {parcel.village}, {parcel.district}, {parcel.state}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition shrink-0"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body scrollable content */}
      <div className="p-5 overflow-y-auto space-y-4 text-xs">
        {/* Core Attributes */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
          <div>
            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
              <User className="w-3 h-3" /> Current Owner
            </div>
            <div className="font-bold text-slate-900 mt-0.5 text-xs truncate">
              {parcel.current_owner}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
              <Layers className="w-3 h-3" /> Land Use
            </div>
            <div className="font-bold text-slate-900 mt-0.5 text-xs">
              {parcel.land_use}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
              <Compass className="w-3 h-3" /> Coordinates
            </div>
            <div className="font-mono text-slate-800 mt-0.5 text-[11px]">
              {parcel.latitude.toFixed(4)}° N, {parcel.longitude.toFixed(4)}° E
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Sub-division
            </div>
            <div className="font-bold text-slate-900 mt-0.5 text-xs">
              Sub-div {parcel.subdivision || '1'}
            </div>
          </div>
        </div>

        {/* Area Intelligence Section */}
        <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-blue-900" /> Area Discrepancy
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${boundaryColor}`}>
              {boundaryStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-1">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-500 font-medium">Recorded (Patta)</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {parcel.recorded_area} {parcel.area_unit}
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-500 font-medium">GIS Calculated</div>
              <div className="text-sm font-bold text-blue-950 mt-0.5">
                {parcel.gis_area} {parcel.area_unit}
              </div>
            </div>
          </div>

          {analysis && (
            <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Absolute Difference:</span>
                <span className="font-semibold text-slate-900">
                  {analysis.area_difference} {parcel.area_unit} ({analysis.percentage_difference}%)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Overlap & Risk Alerts */}
        {analysis?.overlap_status?.has_overlap ? (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Boundary Overlap Detected!</span>
            </div>
            <p className="text-[11px] text-rose-800 leading-snug">
              Overlaps with parcel{' '}
              <span className="font-bold">
                {analysis.overlap_status.overlapping_parcels.join(', ')}
              </span>{' '}
              by approx {analysis.overlap_status.overlap_area_acres} Acres.
            </p>
          </div>
        ) : (
          <div className="bg-emerald-50/70 border border-emerald-200/60 p-2.5 rounded-xl flex items-center gap-2 text-emerald-800 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>No polygon spatial boundary overlaps detected.</span>
          </div>
        )}

        {/* Neighbors count */}
        {analysis && analysis.neighbor_count > 0 && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="font-bold text-slate-800 text-xs mb-1.5">
              Adjacent / Nearby Parcels ({analysis.neighbor_count})
            </div>
            <div className="space-y-1.5">
              {analysis.neighbors.slice(0, 3).map((n, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] text-slate-700">
                  <span className="font-medium">
                    Survey {n.survey_number} ({n.owner})
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                    {n.relationship}
                  </span>
                </div>
              ))}
              {analysis.neighbor_count > 3 && (
                <div className="text-[10px] text-blue-900 font-semibold pt-1">
                  +{analysis.neighbor_count - 3} more neighbors in 360° view
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
        <button
          id={`open-parcel-360-btn-${parcel.parcel_id}`}
          onClick={() => navigate(`/parcel/${encodeURIComponent(parcel.parcel_id)}`)}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-950 hover:bg-blue-900 text-teal-300 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
        >
          <span>Open Full Parcel 360° View</span>
          <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
        </button>
      </div>
    </div>
  );
};
