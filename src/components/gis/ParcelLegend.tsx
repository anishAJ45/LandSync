import React from 'react';
import { Layers } from 'lucide-react';

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
          Map Legend
        </span>
      </div>

      <div className="space-y-2 text-slate-700 font-semibold text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-700 inline-block shrink-0 shadow-2xs" />
          <span>🔵 Selected Land</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-400 inline-block shrink-0 shadow-2xs" />
          <span>⚪ Surrounding Land Parcels</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700 inline-block shrink-0 shadow-2xs animate-pulse" />
          <span>🔴 Possible Boundary Overlap</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 border border-orange-700 inline-block shrink-0 shadow-2xs" />
          <span>🟠 Verification Required</span>
        </div>
      </div>
    </div>
  );
};

