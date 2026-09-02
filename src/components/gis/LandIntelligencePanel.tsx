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
        <h4 className="font-bold text-slate-800 text-sm">Tamil Nilam Geo-Info Report</h4>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          Click any house or plot on the map or enter a ULPIN / Survey Number (e.g. 124/2) to generate the Cadastral & GIS Spatial Intelligence Report.
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[85vh] lg:max-h-none">
      {/* Panel Header */}
      <div className="bg-blue-950 text-white p-4 flex items-center justify-between shrink-0">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tamil Nilam Geo-Info Style GIS</span>
          </div>
          <h2 className="text-base font-black text-white tracking-tight mt-0.5">
            Cadastral & GIS Intelligence Report
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
                  ? '❌ Boundary Discrepancy / High Risk'
                  : analysis.overallRiskLevel === 'MEDIUM'
                  ? '⚠️ Requires Verification / Medium Risk'
                  : '✅ Clear Cadastral & Spatial Profile'}
              </span>
            </div>
            <p className="text-xs mt-1 leading-relaxed">{analysis.prototypeSpatialAnalysis}</p>
          </div>
        </div>

        {/* Section 1: Property Identification & Street Address */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
          <h3 className="text-xs font-black uppercase text-blue-950 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Home className="w-4 h-4 text-blue-900" />
            <span>📍 Cadastral Identification</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="col-span-2 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">ULPIN (Unique Land Pin)</div>
                <div className="font-mono font-black text-blue-950 text-sm tracking-tight">{parcel.ulpin}</div>
              </div>
              <button
                onClick={handleCopyULPIN}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold flex items-center gap-1 transition"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="col-span-2 bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Street Corridor</div>
              <div className="font-extrabold text-blue-950 text-xs">{parcel.streetName}</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Survey & Subdivision</div>
              <div className="font-extrabold text-blue-950">{surveyDisplay}</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Property Type</div>
              <div className="font-bold text-slate-900">{parcel.propertyType || 'Residential Plot'}</div>
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

        {/* Section 2: Dual Geometry Concept (Building Footprint vs Survey Boundary) */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-xl p-3.5 border border-slate-800 space-y-2 text-xs">
          <div className="text-[10px] font-black uppercase text-teal-400 tracking-wider flex items-center justify-between border-b border-white/10 pb-1">
            <span>Dual Geometry Concept</span>
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
          </div>

          <div className="space-y-1.5 text-[11px] pt-0.5">
            <div className="flex items-start gap-1.5">
              <span className="font-bold text-amber-300 shrink-0">📐 SURVEY PARCEL BOUNDARY:</span>
              <span className="text-slate-200">Land record reference boundary (Survey No. {surveyDisplay})</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="font-bold text-teal-300 shrink-0">🏠 BUILDING FOOTPRINT:</span>
              <span className="text-slate-200">{parcel.buildingObservation || 'Physical building structure polygon'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Plot Extent & Valuation */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
          <h3 className="text-xs font-black uppercase text-blue-950 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <FileText className="w-4 h-4 text-blue-900" />
            <span>📐 Plot Extent & Valuation</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-600 font-medium">Actual Plot Extent:</span>
              <span className="font-black font-mono text-blue-950 text-xs">{parcel.area}</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-600 font-medium">Land Classification:</span>
              <span className="font-bold text-slate-900 text-right">{parcel.landClassification}</span>
            </div>

            {parcel.ownerName && (
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-600 font-medium">Registered Owner:</span>
                <span className="font-bold text-slate-900">{parcel.ownerName}</span>
              </div>
            )}

            {parcel.marketValue && (
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-600 font-medium">Estimated Market Value:</span>
                <span className="font-extrabold text-emerald-700">{parcel.marketValue}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: 6-Point GIS Spatial Analysis */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
          <h3 className="text-xs font-black uppercase text-blue-950 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Compass className="w-4 h-4 text-blue-900" />
            <span>🌍 6-Point GIS Spatial Analysis</span>
          </h3>

          <div className="space-y-2 text-xs">
            {/* 1. Agricultural Zone Check */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">🌾</span>
                <span className="font-semibold text-slate-700">Agricultural Overlap:</span>
              </div>
              <div>
                {analysis.agriculturalOverlap ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>Coconut Preserve</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>No Overlap</span>
                  </span>
                )}
              </div>
            </div>

            {/* 2. Waterbody Proximity */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">🌊</span>
                <span className="font-semibold text-slate-700">Waterbody Distance:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold font-mono text-blue-950">{analysis.waterBodyDistance}</span>
                {analysis.isWaterBodyBufferAffected ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    ⚠️ &lt; 50m PWD Buffer
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✅ Safe
                  </span>
                )}
              </div>
            </div>

            {/* 3. Government / Poramboke Check */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏛️</span>
                <span className="font-semibold text-slate-700">Government Poramboke:</span>
              </div>
              <div>
                {analysis.governmentLandOverlap ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    <span>Poramboke Conflict</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Clear</span>
                  </span>
                )}
              </div>
            </div>

            {/* 4. Approved Layout Check */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">🟢</span>
                <span className="font-semibold text-slate-700">Approved Layout Status:</span>
              </div>
              <div>
                {analysis.approvedLayout ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>DTCP Sanctioned</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">
                    ℹ️ Unapproved Layout
                  </span>
                )}
              </div>
            </div>

            {/* 5. Environmental Zone Check */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">🌿</span>
                <span className="font-semibold text-slate-700">Environmental Zone:</span>
              </div>
              <div>
                {analysis.environmentalRestriction ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Protected Zone</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Clear</span>
                  </span>
                )}
              </div>
            </div>

            {/* 6. Road Proximity & Boundary Conflict */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">🛣️</span>
                <span className="font-semibold text-slate-700">Road Corridor Distance:</span>
              </div>
              <span className="font-bold font-mono text-blue-950">{analysis.roadDistance}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm">📐</span>
                <span className="font-semibold text-slate-700">Boundary Vector Conflict:</span>
              </div>
              <div>
                {analysis.boundaryConflict ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    <span>Discrepancy Flagged</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>No Conflict</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Tamil Nilam Categorization */}
        <div className="space-y-2 text-xs">
          {/* Government Record */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-900 space-y-1">
            <div className="font-black text-[11px] uppercase tracking-wider text-slate-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-900 shrink-0" />
              <span>GOVERNMENT RECORD</span>
            </div>
            <p className="text-[11px] font-medium leading-relaxed">{analysis.governmentRecord}</p>
          </div>

          {/* GIS Observation */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 text-blue-950 space-y-1">
            <div className="font-black text-[11px] uppercase tracking-wider text-blue-900 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-blue-900 shrink-0" />
              <span>GIS OBSERVATION</span>
            </div>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-700">
              {analysis.gisObservations.map((obs, idx) => (
                <li key={idx}>{obs}</li>
              ))}
            </ul>
          </div>

          {/* Prototype Spatial Analysis */}
          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200/80 text-indigo-950 space-y-1">
            <div className="font-black text-[11px] uppercase tracking-wider text-indigo-900 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-900 shrink-0" />
              <span>PROTOTYPE SPATIAL ANALYSIS</span>
            </div>
            <p className="text-[11px] font-medium leading-relaxed">{analysis.prototypeSpatialAnalysis}</p>
          </div>
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

        {/* Tamil Nilam Mandatory Legal Disclaimer */}
        <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-[10px] text-slate-600 leading-relaxed text-center font-semibold">
          Building footprints and satellite observations are visual references. Survey parcel boundaries require authoritative cadastral/FMB data for official legal verification.
        </div>
      </div>
    </div>
  );
};
