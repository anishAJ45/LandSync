import React from 'react';
import { Layers, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ParcelLegendProps {
  className?: string;
}

export const ParcelLegend: React.FC<ParcelLegendProps> = ({ className = '' }) => {
  return (
    <div
      id="gis-map-legend"
      className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 p-4 text-xs select-none ${className}`}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <Layers className="w-4 h-4 text-blue-900" />
        <span className="font-bold text-slate-800 tracking-tight text-xs uppercase">
          Cadastral Map Legend
        </span>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Land Classification
        </div>
        <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-teal-500/30 border-2 border-teal-600 shadow-2xs inline-block shrink-0" />
            <span>Residential</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500/30 border-2 border-emerald-600 shadow-2xs inline-block shrink-0" />
            <span>Agricultural</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-blue-500/30 border-2 border-blue-600 shadow-2xs inline-block shrink-0" />
            <span>Commercial</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-purple-500/30 border-2 border-purple-600 shadow-2xs inline-block shrink-0" />
            <span>Government</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Boundary Intelligence Flags
          </div>
          <div className="space-y-1.5 text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-rose-500/40 border-2 border-rose-600 shadow-2xs inline-block shrink-0 animate-pulse" />
              <span className="text-[11px]">Polygon Overlap / Discrepancy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-amber-500/30 border-2 border-amber-600 shadow-2xs inline-block shrink-0" />
              <span className="text-[11px]">Area Mismatch (&gt;2% Variance)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-sky-500/20 border-2 border-dashed border-sky-600 shadow-2xs inline-block shrink-0" />
              <span className="text-[11px]">Active Selected Parcel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
