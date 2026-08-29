import React from 'react';
import { ExternalLink, Maximize2, User, Layers, AlertCircle } from 'lucide-react';
import { GeoJSONFeature } from '../../types';

interface ParcelPopupProps {
  properties: GeoJSONFeature['properties'];
  onOpen360: (parcelId: string) => void;
}

export const ParcelPopup: React.FC<ParcelPopupProps> = ({ properties, onOpen360 }) => {
  const isOverlap =
    properties.status === 'Boundary Discrepancy' ||
    properties.parcel_id === 'TN-CBE-001-124-3' ||
    properties.parcel_id === 'TN-CBE-001-125-1';

  return (
    <div className="p-1 max-w-[260px] text-slate-900 font-sans text-xs">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <span className="font-bold text-blue-950 text-xs truncate">
          Survey {properties.survey_number}
        </span>
        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900">
          {properties.land_use}
        </span>
      </div>

      <div className="py-2 space-y-1 text-[11px] text-slate-700">
        <div className="flex justify-between">
          <span className="text-slate-500">Parcel ID:</span>
          <span className="font-mono font-semibold">{properties.parcel_id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Owner:</span>
          <span className="font-medium truncate max-w-[130px]">{properties.owner}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Recorded Area:</span>
          <span className="font-semibold">{properties.recorded_area} {properties.area_unit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">GIS Calculated:</span>
          <span className="font-semibold text-blue-950">{properties.gis_area} {properties.area_unit}</span>
        </div>
        {isOverlap && (
          <div className="mt-1 p-1.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
            <span>Boundary dispute / overlap flagged</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onOpen360(properties.parcel_id)}
        className="w-full mt-2 py-1.5 px-2.5 bg-blue-950 hover:bg-blue-900 text-teal-300 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition"
      >
        <span>View Parcel 360°</span>
        <ExternalLink className="w-3 h-3 text-teal-400" />
      </button>
    </div>
  );
};
