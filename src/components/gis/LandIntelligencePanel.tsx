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
  Globe,
  Database,
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
          Enter a Registration Number, ULPIN, or Survey Number to view property details and 10-layer spatial intelligence checks.
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
  const classificationDisplay = parcel.landClassification || analysis.landClassification || 'Data unavailable for this parcel';
  const webMeta = analysis.webSourceMetadata;

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
        {/* Overall Status Banner */}
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
                  ? '⚠️ SPATIAL DISCREPANCY FLAGGED'
                  : '✅ REFERENCE PROPERTY PROFILE'}
              </span>
            </div>
            <p className="text-xs mt-1 leading-relaxed">{analysis.prototypeSpatialAnalysis}</p>
          </div>
        </div>

        {/* Section 1: PROPERTY IDENTIFICATION */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
          <h3 className="text-xs font-black uppercase text-blue-950 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Home className="w-4 h-4 text-blue-900" />
            <span>PROPERTY IDENTIFICATION</span>
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
              <div className="text-[10px] text-slate-400 font-bold uppercase">Survey & Subdivision</div>
              <div className="font-extrabold text-blue-950">{surveyDisplay} (Subdiv: {parcel.subdivision || 'A'})</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Plot Area</div>
              <div className="font-bold text-slate-900 font-mono text-xs">{parcel.area}</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Land Classification</div>
              <div className="font-extrabold text-slate-900 text-xs">{classificationDisplay}</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Village</div>
              <div className="font-bold text-slate-900">{parcel.village}</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Taluk & District</div>
              <div className="font-bold text-blue-950">{parcel.taluk || 'Pollachi'}, {parcel.district || 'Coimbatore'}</div>
            </div>
          </div>
        </div>

        {/* Section 2: SPATIAL ANALYSIS (10 GIS Layers) */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
          <h3 className="text-xs font-black uppercase text-blue-950 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Compass className="w-4 h-4 text-blue-900" />
            <span>SPATIAL ANALYSIS (10 GIS LAYERS)</span>
          </h3>

          <div className="space-y-2 text-xs">
            {/* 1. Parcel Boundary */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-2">
                <span>🟡</span>
                <span className="font-semibold text-slate-700">Parcel Boundary:</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                {analysis.parcelBoundaryStatus}
              </span>
            </div>

            {/* 2. Agricultural Land */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-2">
                <span>🌾</span>
                <span className="font-semibold text-slate-700">Agricultural Land:</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  analysis.agriculturalStatus === 'Overlap Detected'
                    ? 'bg-lime-50 text-lime-900 border-lime-300'
                    : analysis.agriculturalStatus.includes('Nearby')
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {analysis.agriculturalStatus}
              </span>
            </div>

            {/* 3. Approved Layout */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-2">
                <span>🟢</span>
                <span className="font-semibold text-slate-700">Approved Layout:</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  analysis.approvedAreaStatus.includes('Inside')
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {analysis.approvedAreaStatus}
              </span>
            </div>

            {/* 4. Government Land */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-2">
                <span>🏛️</span>
                <span className="font-semibold text-slate-700">Government Land:</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  analysis.governmentLandStatus.includes('WARNING')
                    ? 'bg-rose-50 text-rose-900 border-rose-300 font-extrabold'
                    : analysis.governmentLandStatus.includes('Nearby')
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                }`}
              >
                {analysis.governmentLandStatus}
              </span>
            </div>

            {/* 5-8. Water Body (Rivers, Streams, Ponds, Lakes) */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-2">
                <span>🌊</span>
                <span className="font-semibold text-slate-700">Water Body:</span>
              </div>
              <span className="font-bold font-mono text-blue-950 text-[10px]">
                {analysis.waterBodyStatus}
              </span>
            </div>

            {/* 9. Prone Zone */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="font-semibold text-slate-700">Prone / Hazard Zone:</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  analysis.proneZoneStatus === 'Inside Zone'
                    ? 'bg-rose-50 text-rose-900 border-rose-300'
                    : analysis.proneZoneStatus === 'Nearby'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                }`}
              >
                {analysis.proneZoneStatus}
              </span>
            </div>

            {/* 10. Road Access */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-2">
                <span>🛣️</span>
                <span className="font-semibold text-slate-700">Road Access:</span>
              </div>
              <span className="font-bold text-slate-900 text-[10px]">
                {analysis.roadAccessStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: WEB DATA COLLECTION METADATA */}
        <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-slate-800 space-y-2 text-xs">
          <div className="text-[10px] font-black uppercase text-teal-400 tracking-wider flex items-center justify-between border-b border-white/10 pb-1">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>SUPPLEMENTARY WEB COLLECTION METADATA</span>
            </span>
            <Database className="w-3.5 h-3.5 text-teal-400" />
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1">
            <div className="col-span-2 flex justify-between">
              <span className="text-slate-400">Source Name:</span>
              <span className="font-bold text-slate-200">{webMeta.sourceName}</span>
            </div>

            <div className="col-span-2 flex justify-between">
              <span className="text-slate-400">Source URL:</span>
              <a
                href={webMeta.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-teal-300 underline hover:text-teal-200"
              >
                {webMeta.sourceUrl}
              </a>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Date Collected:</span>
              <span className="font-mono text-slate-200">{webMeta.dateCollected}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Last Updated:</span>
              <span className="font-mono text-slate-200">{webMeta.lastUpdated}</span>
            </div>

            <div className="col-span-2 text-[9px] text-amber-300 italic pt-1 border-t border-white/10">
              Note: Supplementary web collected data is reference information and does not supersede government cadastral truth.
            </div>
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

        {/* MANDATORY LEGAL DISCLAIMER */}
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[10px] text-slate-600 font-bold leading-relaxed text-center">
          GIS analysis is based on available reference and spatial datasets. Official verification may be required. Generated or estimated geometry must not be treated as an official cadastral boundary.
        </div>
      </div>
    </div>
  );
};
