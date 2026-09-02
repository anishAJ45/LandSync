import React from 'react';
import { LandParcel } from '../../data/gisData';
import { SpatialAnalysisReport } from '../../services/spatialAnalysis';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  MapPin,
  FileText,
  Building2,
  Compass,
  Copy,
  ExternalLink,
  ShieldCheck,
  Home,
  X
} from 'lucide-react';

interface LandIntelligencePanelProps {
  parcel: LandParcel | null;
  analysis: SpatialAnalysisReport | null;
  onClose?: () => void;
  onNavigateToParcel360?: (ulpin: string) => void;
}

export const LandIntelligencePanel: React.FC<LandIntelligencePanelProps> = ({
  parcel,
  analysis,
  onClose,
  onNavigateToParcel360
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!parcel || !analysis) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-800 text-sm">Land Intelligence Report</h4>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          Enter a Registration Number (e.g. REG-2024-CBE-12402), ULPIN, or Survey Number to view parcel-level GIS spatial checks.
        </p>
      </div>
    );
  }

  const handleCopyULPIN = () => {
    navigator.clipboard.writeText(parcel.ulpin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const surveyDisplay = parcel.fullSurveyNo || (parcel.subdivision ? `${parcel.surveyNumber}/${parcel.subdivision}` : parcel.surveyNumber);
  const regNoDisplay = parcel.regNumber || analysis.regNumber || 'REG-2024-CBE-12402';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[85vh] lg:max-h-none">
      {/* Panel Header */}
      <div className="bg-blue-950 text-white p-4 flex items-center justify-between shrink-0">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>LandSync GIS Intelligence</span>
          </div>
          <h2 className="text-base font-black text-white tracking-tight mt-0.5">
            LAND INTELLIGENCE REPORT
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Report Body Content */}
      <div className="p-4 overflow-y-auto space-y-4 scrollbar-thin">
        {/* Risk / Overall Status Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            analysis.overallRiskLevel === 'HIGH'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : analysis.overallRiskLevel === 'MEDIUM'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          {analysis.overallRiskLevel === 'HIGH' ? (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          ) : analysis.overallRiskLevel === 'MEDIUM' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}

          <div>
            <div className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>
                {analysis.overallRiskLevel === 'HIGH'
                  ? '⚠️ OVERLAP WARNING FLAGGED'
                  : analysis.overallRiskLevel === 'MEDIUM'
                  ? '⚠️ REQUIRES VERIFICATION'
                  : '✅ CLEAR LAND PARCEL PROFILE'}
              </span>
            </div>
            <p className="text-xs mt-1 leading-relaxed">{analysis.prototypeSpatialAnalysis}</p>
          </div>
        </div>

        {/* Section 1: Land Parcel Metadata */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
          <h3 className="text-xs font-black uppercase text-blue-950 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Home className="w-4 h-4 text-blue-900" />
            <span>📍 Land Parcel Metadata</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="col-span-2 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Registration Number</div>
                <div className="font-mono font-black text-blue-950 text-sm tracking-tight">{regNoDisplay}</div>
              </div>
              <button
                onClick={handleCopyULPIN}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold flex items-center gap-1 transition"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy ULPIN'}</span>
              </button>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">ULPIN</div>
              <div className="font-mono font-extrabold text-blue-950 text-xs">{parcel.ulpin}</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Survey Number</div>
              <div className="font-extrabold text-blue-950">{surveyDisplay}</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Land Area</div>
              <div className="font-bold text-slate-900 font-mono text-xs">{parcel.area}</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Village</div>
              <div className="font-bold text-slate-900">{parcel.village}</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Taluk</div>
              <div className="font-bold text-blue-950">{parcel.taluk || 'Pollachi'}</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">District</div>
              <div className="font-bold text-slate-900">{parcel.district || 'Coimbatore'}</div>
            </div>
          </div>
        </div>

        {/* Section 2: 5-Point GIS Spatial Checks */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
          <h3 className="text-xs font-black uppercase text-blue-950 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Compass className="w-4 h-4 text-blue-900" />
            <span>🌍 GIS SPATIAL CHECKS</span>
          </h3>

          <div className="space-y-2 text-xs">
            {/* 1. Approved Area Check */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">🟢</span>
                <span className="font-semibold text-slate-700">Approved Area:</span>
              </div>
              <div>
                {analysis.approvedAreaStatus === 'INSIDE' ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Inside DTCP Layout</span>
                  </span>
                ) : analysis.approvedAreaStatus === 'INTERSECTS' ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>Intersects LPA Zone</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">
                    Verification Required
                  </span>
                )}
              </div>
            </div>

            {/* 2. Agricultural Land Check */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">🌾</span>
                <span className="font-semibold text-slate-700">Agricultural Land:</span>
              </div>
              <div>
                {analysis.agriculturalStatus === 'OVERLAP' ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-lime-50 text-lime-800 border border-lime-200 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>Agri Overlap</span>
                  </span>
                ) : analysis.agriculturalStatus === 'NEARBY' ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Nearby Agri Belt
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>No Overlap</span>
                  </span>
                )}
              </div>
            </div>

            {/* 3. Government / Poramboke Check */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏛️</span>
                <span className="font-semibold text-slate-700">Government Land:</span>
              </div>
              <div>
                {analysis.governmentLandStatus === 'OVERLAP_WARNING' ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>⚠️ OVERLAP WARNING</span>
                  </span>
                ) : analysis.governmentLandStatus === 'NEARBY' ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Nearby Poramboke
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>No Overlap</span>
                  </span>
                )}
              </div>
            </div>

            {/* 4. Waterbody Distance */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">🌊</span>
                <span className="font-semibold text-slate-700">Waterbody Distance:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold font-mono text-blue-950 text-xs">{analysis.waterBodyDistance}</span>
              </div>
            </div>

            {/* 5. Prone / Restricted Zone Check */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚠️</span>
                <span className="font-semibold text-slate-700">Prone / Restricted Zone:</span>
              </div>
              <div>
                {analysis.proneZoneStatus === 'INSIDE' ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Inside Eco Prone Zone</span>
                  </span>
                ) : analysis.proneZoneStatus === 'NEARBY' ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Nearby Buffer
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Outside Data</span>
                  </span>
                )}
              </div>
            </div>

            {/* Boundary Reference Status */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">📐</span>
                <span className="font-semibold text-slate-700">Boundary Status:</span>
              </div>
              <div>
                {analysis.boundaryStatus === 'DISCREPANCY_FLAGGED' ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    <span>Discrepancy Flagged</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Reference Boundary Shown</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Patta & Government Record */}
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-900 space-y-1 text-xs">
          <div className="font-black text-[11px] uppercase tracking-wider text-slate-700 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-900 shrink-0" />
            <span>GOVERNMENT RECORD</span>
          </div>
          <p className="text-[11px] font-medium leading-relaxed">{analysis.governmentRecord}</p>
        </div>

        {/* Parcel 360 Link */}
        {onNavigateToParcel360 && (
          <button
            onClick={() => onNavigateToParcel360(parcel.ulpin)}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-950 hover:bg-blue-900 text-teal-300 text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <span>Open Complete Parcel 360° Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Permanent Disclaimer */}
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[10px] text-slate-600 font-bold leading-relaxed text-center">
          Based on available GIS and reference datasets. Official verification may be required.
        </div>
      </div>
    </div>
  );
};
