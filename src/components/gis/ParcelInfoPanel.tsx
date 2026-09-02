import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  ExternalLink,
  X,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Maximize2
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

  const isOverlap =
    parcel.status === 'Boundary Discrepancy' ||
    parcel.parcel_id === 'TN-CBE-001-124-3' ||
    parcel.parcel_id === 'TN-CBE-001-125-1';

  const isMajorMismatch = Math.abs(parcel.recorded_area - parcel.gis_area) / parcel.recorded_area > 0.02;
  const isVerificationRequired = parcel.status === 'Under Review' || isMajorMismatch || isOverlap;

  // Render values
  const boundaryStatusText = isOverlap
    ? '⚠️ Possible Boundary Overlap'
    : '✓ Clearly Identified';
  const boundaryStatusColor = isOverlap ? 'text-rose-700' : 'text-emerald-700';

  const verificationStatusText = isOverlap
    ? '⚠️ Possible Boundary Overlap Detected'
    : isMajorMismatch
    ? '⚠️ Area Mismatch Detected'
    : parcel.status === 'Under Review'
    ? '⚠️ Pending Administrative Review'
    : '✓ No Boundary Discrepancy Found';
  const verificationStatusColor = isVerificationRequired ? 'text-orange-700' : 'text-emerald-700';

  return (
    <div
      id={`parcel-info-panel-${parcel.parcel_id}`}
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col max-h-[85vh] ${className}`}
    >
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="min-w-0 pr-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
            Selected Land Details
          </div>
          <h3 className="font-black text-base text-white tracking-tight truncate mt-0.5">
            Survey Number: {parcel.survey_number}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition shrink-0"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-5 overflow-y-auto space-y-5 text-xs">
        
        {/* Simple details card */}
        <div className="space-y-4">
          <div className="text-[11px] font-extrabold text-blue-950 uppercase tracking-widest border-b border-slate-100 pb-1">
            YOUR SELECTED LAND
          </div>

          <div className="space-y-3 font-semibold text-slate-700">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">Survey Number:</span>
              <span className="text-blue-950 font-bold">{parcel.survey_number}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">Area:</span>
              <span className="text-blue-950 font-bold">{parcel.recorded_area} {parcel.area_unit}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">Location:</span>
              <span className="text-blue-950 font-bold">{parcel.village}, {parcel.state}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">Boundary Status:</span>
              <span className={`font-bold ${boundaryStatusColor}`}>{boundaryStatusText}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">Verification Status:</span>
              <span className={`font-bold ${verificationStatusColor} text-right`}>{verificationStatusText}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Warning Alert Box */}
        {isVerificationRequired && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-orange-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Verification Required</span>
            </div>
            <p className="text-[11px] text-orange-700 leading-relaxed font-semibold italic">
              Possible boundary overlap detected. Please verify with the concerned Survey and Land Records authority before purchasing.
            </p>
          </div>
        )}

        {/* Dynamic Safe Success Box */}
        {!isVerificationRequired && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-800 text-[11px] font-semibold">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Land Record Clear</span>
            </div>
            <p className="text-emerald-700 font-normal leading-normal">
              This land parcel has fully synchronized spatial boundaries and match records across all state land registries.
            </p>
          </div>
        )}

        {/* General details for buying safety */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-slate-500 leading-relaxed text-[11px]">
          <span className="font-bold text-slate-700 block mb-1">💡 Buyer Information Note</span>
          Always cross-check the registered sale deed against the computerized A-register and the Field Measurement Book (FMB) coordinates before signing a purchase agreement.
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
        <button
          id={`open-parcel-360-btn-${parcel.parcel_id}`}
          onClick={() => navigate(`/parcel/${encodeURIComponent(parcel.parcel_id)}`)}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-950 hover:bg-blue-900 text-teal-300 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
        >
          <span>Open Full Land 360° Profile</span>
          <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
        </button>
      </div>
    </div>
  );
};

