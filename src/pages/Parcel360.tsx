import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { parcelService } from '../services/parcelService';
import {
  Parcel,
  ParcelAnalysis,
  ParcelHistoryItem,
  ParcelGeometryData,
  GeoJSONFeatureCollection,
  LandVerification,
  LandDNAProfile as LandDNAProfileType,
  ParcelConnectedRecordsOverview,
  ZoningRecord,
  MasterPlanRecord,
  BuildingPermissionRecord,
  RestrictionZoneRecord,
  SatelliteChangeDetectionRecord,
  SpatialTimelineEvent,
  SpatialRiskScore
} from '../types';
import { verificationService } from '../services/verificationService';
import { landDnaService } from '../services/landDnaService';
import { interoperabilityService } from '../services/interoperabilityService';
import { spatialService } from '../services/spatialService';
import { ConsistencyScoreGauge } from '../components/verification/ConsistencyScoreGauge';
import { FieldComparisonMatrix } from '../components/verification/FieldComparisonMatrix';
import { AlertsList } from '../components/verification/AlertsList';
import { ExplainableSummaryCard } from '../components/verification/ExplainableSummaryCard';
import { StartVerificationModal } from '../components/verification/StartVerificationModal';
import { MapContainer } from '../components/gis/MapContainer';
import { ParcelAnalysisPanel } from '../components/gis/ParcelAnalysisPanel';
import { ParcelHistoryTimeline } from '../components/gis/ParcelHistoryTimeline';
import { LandHealthRadar } from '../components/dna/LandHealthRadar';
import { RiskSignalCard } from '../components/dna/RiskSignalCard';
import { AnomalyBadge } from '../components/dna/AnomalyBadge';
import { ZoningInfoCard } from '../components/gis/ZoningInfoCard';
import { BuildingPermissionCard } from '../components/gis/BuildingPermissionCard';
import { RestrictionZoneViewer } from '../components/gis/RestrictionZoneViewer';
import { SatelliteChangeViewer } from '../components/gis/SatelliteChangeViewer';
import { SpatialTimeline } from '../components/gis/SpatialTimeline';
import { SpatialRiskCard } from '../components/gis/SpatialRiskCard';
import { CivicIntegrationDashboard } from '../components/civic/CivicIntegrationDashboard';
import { StateParcelContextCard } from '../components/state/StateParcelContextCard';
import {
  ChevronRight,
  ArrowLeft,
  MapPin,
  Maximize2,
  Layers,
  User,
  Calendar,
  FileText,
  Copy,
  Check,
  Download,
  Share2,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Building,
  CheckCircle2,
  ExternalLink,
  Code,
  Activity,
  Sparkles,
  Play,
  RotateCw,
  Dna,
  ShieldAlert,
  Network,
  ScanLine,
  Building2
} from 'lucide-react';

export const Parcel360: React.FC = () => {
  const { parcelId } = useParams<{ parcelId: string }>();
  const navigate = useNavigate();

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [analysis, setAnalysis] = useState<ParcelAnalysis | null>(null);
  const [history, setHistory] = useState<ParcelHistoryItem[]>([]);
  const [geometry, setGeometry] = useState<ParcelGeometryData | null>(null);
  const [allGeoJson, setAllGeoJson] = useState<GeoJSONFeatureCollection | null>(null);
  const [verification, setVerification] = useState<LandVerification | null>(null);
  const [dnaProfile, setDnaProfile] = useState<LandDNAProfileType | null>(null);
  const [connectedRecords, setConnectedRecords] = useState<ParcelConnectedRecordsOverview | null>(null);

  // Phase 8 Spatial Intelligence Data
  const [spatialData, setSpatialData] = useState<{
    zoning: ZoningRecord | null;
    master_plan: MasterPlanRecord | null;
    building_permission: BuildingPermissionRecord | null;
    restrictions: RestrictionZoneRecord[];
    satellite_changes: SatelliteChangeDetectionRecord[];
    timeline: SpatialTimelineEvent[];
    risk_score: SpatialRiskScore | null;
  } | null>(null);

  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [rerunningVer, setRerunningVer] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'spatial' | 'civic' | 'analysis' | 'timeline' | 'verification' | 'dna' | 'dpi' | 'geojson'>('overview');
  const [copied, setCopied] = useState(false);

  const loadParcelData = async () => {
    if (!parcelId) return;
    try {
      setLoading(true);
      setError(null);

      const [p, a, h, g, geojson, ver, dna, dpi, spatial] = await Promise.all([
        parcelService.getParcelById(parcelId),
        parcelService.getParcelAnalysis(parcelId),
        parcelService.getParcelHistory(parcelId),
        parcelService.getParcelGeometry(parcelId),
        parcelService.getGeoJSON(),
        verificationService.getParcelVerificationSummary(parcelId).catch(() => null),
        landDnaService.getLandDNAProfile(parcelId).catch(() => null),
        interoperabilityService.getParcelConnectedRecords(parcelId).catch(() => null),
        spatialService.getSpatialParcel360(parcelId).catch(() => null)
      ]);

      setParcel(p);
      setAnalysis(a);
      setHistory(h);
      setGeometry(g);
      setAllGeoJson(geojson);
      setVerification(ver);
      setDnaProfile(dna);
      setConnectedRecords(dpi);
      setSpatialData(spatial);
    } catch (err: any) {
      console.error('Error fetching Parcel 360 data:', err);
      setError(err.response?.data?.detail || 'Parcel record not found in DPI database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParcelData();
  }, [parcelId]);

  const handleRerunVerification = async () => {
    if (!verification) return;
    try {
      setRerunningVer(true);
      const updated = await verificationService.rerunVerification(verification.verification_id);
      setVerification(updated);
    } catch (err) {
      console.error('Failed to rerun verification:', err);
    } finally {
      setRerunningVer(false);
    }
  };

  const handleCopyId = () => {
    if (parcel?.parcel_id) {
      navigator.clipboard.writeText(parcel.parcel_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportJSON = () => {
    if (!parcel) return;
    const fullProfile = {
      parcel,
      analysis,
      history,
      geometry,
      verification,
      dnaProfile,
      connectedRecords,
      spatialData,
      exported_at: new Date().toISOString(),
      dpi_standard: 'SIH26014-LandSync-v2.0'
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullProfile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Parcel360_${parcel.parcel_id}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="h-44 bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-96 bg-slate-100 rounded-2xl" />
          <div className="lg:col-span-7 h-96 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Parcel Record Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Could not locate parcel in cadastral registry.'}</p>
        <button
          onClick={() => navigate('/gis')}
          className="px-4 py-2 bg-blue-950 text-white text-xs font-bold rounded-xl shadow-xs"
        >
          Return to GIS Explorer
        </button>
      </div>
    );
  }

  const coordinatesList = geometry?.coordinates?.[0] || parcel.coordinates?.[0] || [];

  return (
    <div id="parcel-360-page" className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button
            onClick={() => navigate('/gis')}
            className="hover:text-blue-950 flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>GIS Explorer</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-blue-950 font-bold">Parcel 360° Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-mono text-slate-700 font-bold">{parcel.parcel_id}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="copy-parcel-id-btn"
            onClick={handleCopyId}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied!' : 'Copy ID'}</span>
          </button>

          <button
            id="export-parcel-json-btn"
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-teal-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 360° Data</span>
          </button>
        </div>
      </div>

      {/* Main Parcel Profile Header Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 text-xs font-bold tracking-wide uppercase">
                Survey No. {parcel.survey_number}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold">
                Subdivision {parcel.subdivision || '1'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                {parcel.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30 text-xs font-semibold">
                {parcel.land_use} Land
              </span>
              {spatialData?.risk_score && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  spatialData.risk_score.risk_score > 50
                    ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40'
                    : 'bg-teal-500/30 text-teal-300 border border-teal-400/40'
                }`}>
                  Spatial Risk: {spatialData.risk_score.risk_score}/100
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-white">
              {parcel.parcel_id}
            </h1>

            <p className="text-sm text-slate-300 mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{parcel.village}, Sulur Block, {parcel.district} District, {parcel.state}</span>
            </p>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Current Owner</div>
              <div className="text-sm font-bold text-white mt-0.5 truncate max-w-[140px]">
                {parcel.current_owner}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Patta Area</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {parcel.recorded_area} {parcel.area_unit}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">GIS Area</div>
              <div className="text-sm font-bold text-teal-300 mt-0.5">
                {parcel.gis_area} {parcel.area_unit}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          id="parcel-tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'overview'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Core Attributes</span>
        </button>

        {/* Phase 8: Spatial & Zoning Intelligence Tab */}
        <button
          id="parcel-tab-spatial"
          onClick={() => setActiveTab('spatial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'spatial'
              ? 'bg-teal-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-teal-950 hover:bg-teal-50'
          }`}
        >
          <Building2 className="w-4 h-4 text-teal-400" />
          <span>Spatial & Zoning Intelligence</span>
          {spatialData?.risk_score && (
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
              spatialData.risk_score.risk_score > 50
                ? 'bg-rose-400/20 text-rose-300'
                : 'bg-teal-400/20 text-teal-300'
            }`}>
              {spatialData.risk_score.risk_level}
            </span>
          )}
        </button>

        <button
          id="parcel-tab-civic"
          onClick={() => setActiveTab('civic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'civic'
              ? 'bg-teal-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-teal-950 hover:bg-teal-50'
          }`}
        >
          <Building className="w-4 h-4 text-teal-400" />
          <span>Civic, Fiscal & Utilities</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-400/20 text-teal-300">
            Phase 9
          </span>
        </button>

        <button
          id="parcel-tab-analysis"
          onClick={() => setActiveTab('analysis')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'analysis'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Maximize2 className="w-4 h-4" />
          <span>Boundary Integrity</span>
          {analysis?.boundary_status === 'MAJOR DIFFERENCE' && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          id="parcel-tab-timeline"
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'timeline'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Mutation Timeline ({history.length})</span>
        </button>

        <button
          id="parcel-tab-verification"
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'verification'
              ? 'bg-indigo-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-indigo-900 hover:bg-indigo-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Cross-Record Verification</span>
        </button>

        <button
          id="parcel-tab-dna"
          onClick={() => setActiveTab('dna')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'dna'
              ? 'bg-teal-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50'
          }`}
        >
          <Dna className="w-4 h-4 text-teal-400" />
          <span>Land DNA Profile</span>
        </button>

        <button
          id="parcel-tab-dpi"
          onClick={() => setActiveTab('dpi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'dpi'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
          }`}
        >
          <Network className="w-4 h-4 text-teal-400" />
          <span>Connected Records (DPI)</span>
        </button>

        <button
          id="parcel-tab-geojson"
          onClick={() => setActiveTab('geojson')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'geojson'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>GeoJSON</span>
        </button>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Focused Mini-Map & Geometry Specs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Focused Map View */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-900" /> Cadastral Map Context
              </span>
              <button
                onClick={() => navigate(`/gis?parcel_id=${encodeURIComponent(parcel.parcel_id)}`)}
                className="text-[11px] font-bold text-blue-900 hover:text-blue-950 flex items-center gap-0.5"
              >
                <span>Full Map</span> <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="h-[320px] rounded-xl overflow-hidden border border-slate-200">
              <MapContainer
                geoJsonData={allGeoJson}
                selectedParcelId={parcel.parcel_id}
                hoveredParcelId={null}
                onSelectParcel={(pid) => {
                  if (pid !== parcel.parcel_id) {
                    navigate(`/parcel/${encodeURIComponent(pid)}`);
                  }
                }}
                onHoverParcel={() => {}}
                center={[parcel.latitude, parcel.longitude]}
                zoom={17}
              />
            </div>
            <div className="text-[10px] text-slate-400 italic">
              Blue highlighted polygon represents {parcel.parcel_id} Survey {parcel.survey_number}. Click adjacent plots to inspect neighbors.
            </div>
          </div>

          {/* Raw Polygon Coordinates Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-900" /> Polygon Boundary Vertices ({coordinatesList.length})
              </span>
              <span className="text-[10px] font-mono text-slate-500">EPSG:4326 (WGS84)</span>
            </div>

            <div className="overflow-x-auto max-h-[220px] overflow-y-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Vertex #</th>
                    <th className="py-2 px-3">Longitude (E)</th>
                    <th className="py-2 px-3">Latitude (N)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {coordinatesList.map((coord, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-semibold text-slate-500">#{idx + 1}</td>
                      <td className="py-1.5 px-3">{coord[0]?.toFixed(6)}</td>
                      <td className="py-1.5 px-3">{coord[1]?.toFixed(6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Tab View Contents (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: Core Attributes & Ownership */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Official Cadastral & Patta Details
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Owner Name</span>
                    <span className="font-bold text-slate-900">{parcel.current_owner}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Father / Husband Name</span>
                    <span className="font-semibold text-slate-800">{parcel.father_name || 'Not Recorded'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Patta / Record of Rights No.</span>
                    <span className="font-mono font-bold text-blue-950">{parcel.patta_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Survey & Subdivision</span>
                    <span className="font-semibold text-slate-800">Survey {parcel.survey_number} / {parcel.subdivision}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Official Recorded Area</span>
                    <span className="font-mono font-bold text-blue-950">{parcel.recorded_area} {parcel.area_unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">GIS Calculated Extent</span>
                    <span className="font-mono font-bold text-teal-700">{parcel.gis_area} {parcel.area_unit}</span>
                  </div>
                </div>
              </div>

              {/* State Configuration & Local Unit Normalization Context Card */}
              <StateParcelContextCard
                stateCode={parcel.state || (parcel.parcel_id?.includes('TN') ? 'TN' : 'TN')}
                surveyNumber={`${parcel.survey_number}/${parcel.subdivision}`}
                pattaOrKathaNumber={parcel.patta_number}
                extentLocal={`${parcel.recorded_area} ${parcel.area_unit}`}
                extentStandardSqM={
                  parcel.area_unit?.toLowerCase().includes('cent')
                    ? Number((parcel.recorded_area * 40.4686).toFixed(2))
                    : Number((parcel.recorded_area * 4046.86).toFixed(2))
                }
                subdivision={parcel.subdivision}
                villageOrWard={parcel.village}
                district={parcel.district}
                onOpenStateConfig={() => navigate('/admin/state-configuration')}
              />

              {/* Spatial Highlights preview */}
              {analysis && (
                <ParcelAnalysisPanel
                  analysis={analysis}
                  onSelectNeighbor={(pid) => navigate(`/parcel/${encodeURIComponent(pid)}`)}
                />
              )}
            </div>
          )}

          {/* TAB 2: Phase 8 Spatial & Zoning Intelligence */}
          {activeTab === 'spatial' && spatialData && (
            <div className="space-y-6">
              {/* Composite Spatial Risk Score */}
              <SpatialRiskCard riskScore={spatialData.risk_score} />

              {/* Master Plan & Zoning Inspector */}
              <ZoningInfoCard
                zoning={spatialData.zoning}
                masterPlan={spatialData.master_plan}
              />

              {/* Sanctioned Building Permission & Deviation */}
              <BuildingPermissionCard
                permission={spatialData.building_permission}
                gisArea={parcel.gis_area}
              />

              {/* Statutory Restriction Zones & Buffers */}
              <RestrictionZoneViewer
                zones={spatialData.restrictions || []}
                parcelId={parcel.parcel_id}
              />

              {/* AI Satellite Temporal Change Detection */}
              <SatelliteChangeViewer
                changes={spatialData.satellite_changes || []}
                parcelId={parcel.parcel_id}
                onScanComplete={loadParcelData}
              />

              {/* Historical Spatial Evolution Timeline */}
              <SpatialTimeline timeline={spatialData.timeline || []} />
            </div>
          )}

          {/* TAB 3: Geometric & Boundary Integrity */}
          {activeTab === 'analysis' && analysis && (
            <ParcelAnalysisPanel
              analysis={analysis}
              onSelectNeighbor={(pid) => navigate(`/parcel/${encodeURIComponent(pid)}`)}
            />
          )}

          {/* TAB 4: Event & Mutation Timeline */}
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Chronological Mutation & Event Timeline
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Immutable history of title deeds, sub-divisions, DGPS surveys, and automated DPI audits
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                  {history.length} Events
                </span>
              </div>

              <ParcelHistoryTimeline history={history} />
            </div>
          )}

          {/* TAB 5: Cross-Record Verification & Intelligence */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              {verification ? (
                <>
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {verification.verification_id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            verification.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {verification.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">
                        Multi-Source Cross-Record Reconciliation
                      </h3>
                      <p className="text-xs text-slate-500">
                        Synchronized across GIS, Revenue Patta DB, Document OCR, and Department Registries
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRerunVerification}
                        disabled={rerunningVer}
                        className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                      >
                        <RotateCw className={`w-3.5 h-3.5 text-slate-600 ${rerunningVer ? 'animate-spin' : ''}`} />
                        <span>{rerunningVer ? 'Re-running...' : 'Re-run Engine'}</span>
                      </button>

                      <button
                        onClick={() => navigate(`/officer/cases?id=${verification.verification_id}`)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Open Case Studio</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ConsistencyScoreGauge
                      score={verification.overall_consistency_score}
                      level={verification.consistency_level}
                      totalRecords={verification.total_records_checked}
                      matches={verification.matches}
                      minorDifferences={verification.minor_differences}
                      majorMismatches={verification.major_mismatches}
                      criticalMismatches={verification.critical_mismatches}
                    />

                    <ExplainableSummaryCard
                      summary={verification.summary}
                      score={verification.overall_consistency_score}
                      level={verification.consistency_level}
                      criticalCount={verification.critical_mismatches}
                      majorCount={verification.major_mismatches}
                      minorCount={verification.minor_differences}
                    />
                  </div>

                  <FieldComparisonMatrix rows={verification.matrix_rows || []} />

                  <AlertsList
                    alerts={verification.alerts || []}
                    verificationId={verification.verification_id}
                    onAlertResolved={(resolved) => {
                      if (verification) {
                        const updatedAlerts = (verification.alerts || []).map((a) =>
                          a.id === resolved.id ? resolved : a
                        );
                        setVerification({ ...verification, alerts: updatedAlerts });
                      }
                    }}
                  />
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">No Prior Verification Run Found</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Execute LandSync's cross-record intelligence engine to verify boundary areas, survey numbers, and deed identity across all public registers.
                    </p>
                  </div>
                  <button
                    onClick={() => setVerificationModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Verification for {parcel.parcel_id}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Land DNA & Intelligent Risk Detection Engine */}
          {activeTab === 'dna' && (
            <div className="space-y-6">
              {dnaProfile ? (
                <>
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {dnaProfile.dna_id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
                          {dnaProfile.health_category} HEALTH
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                          {dnaProfile.risk_level} RISK
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">
                        Land DNA Profile & Explainable Intelligence
                      </h3>
                      <p className="text-xs text-slate-500">
                        Synthesized multi-dimensional profile integrating GIS, records, historical events, and verification results
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/officer/land-dna/${parcel.parcel_id}`}
                        className="px-3.5 py-2 bg-blue-950 hover:bg-blue-900 text-teal-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <Dna className="w-3.5 h-3.5" />
                        <span>Full DNA Studio</span>
                      </Link>
                    </div>
                  </div>

                  <LandHealthRadar profile={dnaProfile} />

                  {/* Active Signals in Tab */}
                  {dnaProfile.risk_signals && dnaProfile.risk_signals.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <h3 className="font-bold text-slate-900 text-sm">Active Explainable Risk Signals</h3>
                      <div className="space-y-3">
                        {dnaProfile.risk_signals.map((sig) => (
                          <RiskSignalCard
                            key={sig.id}
                            signal={sig}
                            canResolve={false}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Anomalies in Tab */}
                  {dnaProfile.anomalies && dnaProfile.anomalies.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <h3 className="font-bold text-slate-900 text-sm">Detected Cross-Record Anomalies</h3>
                      <div className="space-y-3">
                        {dnaProfile.anomalies.map((anom) => (
                          <AnomalyBadge
                            key={anom.anomaly_id}
                            anomaly={anom}
                            canReview={false}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <Dna className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Land DNA Profile Available</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Explore this parcel's 7-dimensional consistency scores, anomaly tracking, and rule-based risk signals.
                    </p>
                  </div>
                  <Link
                    to={`/officer/land-dna/${parcel.parcel_id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-teal-300 rounded-xl text-xs font-bold shadow-sm"
                  >
                    <Dna className="w-4 h-4" />
                    <span>Open Land DNA Intelligence for {parcel.parcel_id}</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: CONNECTED RECORDS (DPI) */}
          {activeTab === 'dpi' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      DPI Layer v1.0
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                      8 Systems Federated
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Multi-Departmental Authoritative Sync
                  </h3>
                  <p className="text-xs text-slate-700 mt-0.5">
                    Real-time federated records mapped into the canonical Common Land Record representation without altering source registries.
                  </p>
                </div>

                {connectedRecords && (
                  <div className="text-right">
                    <span className="text-xs text-slate-700 font-medium">Aggregated Data Quality</span>
                    <div className="text-xl font-bold text-emerald-800">
                      {connectedRecords.overall_data_quality_score} / 100
                    </div>
                  </div>
                )}
              </div>

              {connectedRecords && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connectedRecords.records.map((rec, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-teal-500 transition"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {rec.department_system.system_id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          SCORE: {rec.data_quality_score}%
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900">{rec.department_system.department_name}</h4>
                      <p className="text-xs text-slate-700 font-medium">{rec.department_system.system_name}</p>

                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700">Authoritative Ref:</span>
                          <span className="font-mono font-semibold text-slate-800 truncate max-w-[140px]">
                            {rec.source_record_id}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700">Owner/Holder:</span>
                          <span className="font-medium text-slate-900 truncate max-w-[140px]">
                            {rec.record.owner_name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700">Standardized Area:</span>
                          <span className="font-medium text-slate-900">
                            {rec.record.standardized_area_sqm} m²
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700">Encumbrance:</span>
                          <span className={`font-semibold px-1.5 py-0.2 rounded ${
                            rec.record.encumbrance_status === 'FREE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {rec.record.encumbrance_status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
                        <span>Synced: {new Date(rec.last_synced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-teal-700 font-semibold">{rec.department_system.authentication_type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Civic, Fiscal & Infrastructure Engine (Phase 9) */}
          {activeTab === 'civic' && (
            <CivicIntegrationDashboard
              parcelId={parcel.parcel_id}
              ulpin={parcel.parcel_id}
              recordedAreaSqft={parcel.gis_area ? parcel.gis_area * 10.7639 : 43560}
            />
          )}

          {/* TAB 8: Raw Cadastral GeoJSON */}
          {activeTab === 'geojson' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Standard RFC 7946 GeoJSON</h3>
                  <p className="text-[11px] text-slate-500">
                    Open public infrastructure format for GIS integration (QGIS, ArcGIS, Mapbox)
                  </p>
                </div>
                <button
                  onClick={() => {
                    const featureGeoJSON = {
                      type: 'Feature',
                      properties: parcel,
                      geometry: {
                        type: 'Polygon',
                        coordinates: geometry?.coordinates || parcel.coordinates
                      }
                    };
                    navigator.clipboard.writeText(JSON.stringify(featureGeoJSON, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy GeoJSON'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-teal-300 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[420px] scrollbar-thin">
                {JSON.stringify(
                  {
                    type: 'Feature',
                    properties: {
                      parcel_id: parcel.parcel_id,
                      survey_number: parcel.survey_number,
                      subdivision: parcel.subdivision,
                      owner: parcel.current_owner,
                      village: parcel.village,
                      district: parcel.district,
                      recorded_area: parcel.recorded_area,
                      gis_area: parcel.gis_area,
                      area_unit: parcel.area_unit,
                      land_use: parcel.land_use,
                      status: parcel.status
                    },
                    geometry: {
                      type: 'Polygon',
                      coordinates: geometry?.coordinates || parcel.coordinates
                    }
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Start Verification Modal */}
      {parcel && (
        <StartVerificationModal
          isOpen={verificationModalOpen}
          onClose={() => setVerificationModalOpen(false)}
          defaultParcelId={parcel.parcel_id}
          onSuccess={(newVer) => {
            setVerification(newVer);
            setActiveTab('verification');
          }}
        />
      )}
    </div>
  );
};
