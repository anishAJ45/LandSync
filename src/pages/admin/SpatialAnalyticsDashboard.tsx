import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { spatialService } from '../../services/spatialService';
import {
  SpatialAnalyticsSummary,
  SpatialConflictRecord,
  SatelliteChangeDetectionRecord,
  ZoningRecord
} from '../../types';
import {
  Layers,
  ShieldAlert,
  ScanLine,
  Building,
  Waves,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  ExternalLink,
  MapPin,
  RefreshCw,
  Eye,
  Sliders,
  Scale
} from 'lucide-react';
import { SpatialConflictModal } from '../../components/gis/SpatialConflictModal';

export const SpatialAnalyticsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<SpatialAnalyticsSummary | null>(null);
  const [conflicts, setConflicts] = useState<SpatialConflictRecord[]>([]);
  const [satelliteChanges, setSatelliteChanges] = useState<SatelliteChangeDetectionRecord[]>([]);
  const [zoningList, setZoningList] = useState<ZoningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'conflicts' | 'satellite' | 'zoning'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConflict, setSelectedConflict] = useState<SpatialConflictRecord | null>(null);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [analyticsData, conflictsData, satelliteData, zoningData] = await Promise.all([
        spatialService.getSpatialAnalytics(),
        spatialService.getSpatialConflicts(),
        spatialService.getSatelliteChanges(),
        spatialService.getZoningList()
      ]);
      setAnalytics(analyticsData);
      setConflicts(conflictsData);
      setSatelliteChanges(satelliteData);
      setZoningList(zoningData);
    } catch (err) {
      console.error('Failed to load spatial analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredConflicts = conflicts.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.parcel_id.toLowerCase().includes(q) ||
      c.conflict_type.toLowerCase().includes(q) ||
      c.overlapping_entity.toLowerCase().includes(q)
    );
  });

  const exportAuditReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analytics, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `LandSync_Spatial_Intelligence_Audit_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 uppercase tracking-wider">
              Phase 8: Spatial Intelligence & GIS Engine
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Coimbatore Master Plan 2035
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-950 tracking-tight">
            Advanced Spatial & GIS Intelligence Console
          </h1>
          <p className="text-sm text-slate-600">
            Real-time cadastral compliance, zoning adherence, satellite change detection, and statutory buffer breach monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${refreshing ? 'animate-spin' : ''}`} />
            Sync GIS Engine
          </button>

          <button
            onClick={exportAuditReport}
            className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            Export Spatial Audit Dossier
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Parcels Analyzed
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-blue-950">
              {analytics.total_parcels_analyzed}
            </div>
            <p className="text-xs text-teal-700 font-medium">
              100% Cadastral & ULPIN Synchronized
            </p>
          </div>

          {/* KPI 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Encroachments
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-rose-600">
              {analytics.active_encroachments_count}
            </div>
            <p className="text-xs text-rose-700 font-medium">
              {analytics.conflicts_by_severity?.critical || 0} Critical Overlaps Flagged
            </p>
          </div>

          {/* KPI 3 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                AI Satellite Anomalies
              </span>
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center">
                <ScanLine className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-violet-900">
              {analytics.unauthorized_constructions_flagged}
            </div>
            <p className="text-xs text-violet-700 font-medium">
              Multi-spectral physical deviations
            </p>
          </div>

          {/* KPI 4 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Buffer Breaches
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <Waves className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-cyan-900">
              {analytics.restriction_zone_breaches}
            </div>
            <p className="text-xs text-cyan-700 font-medium">
              Waterbody & HT Corridor violations
            </p>
          </div>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Executive Spatial Overview
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'conflicts'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Encroachment & Dispute Queue ({conflicts.length})
        </button>

        <button
          onClick={() => setActiveTab('satellite')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'satellite'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ScanLine className="w-4 h-4" />
          AI Satellite Detections ({satelliteChanges.length})
        </button>

        <button
          onClick={() => setActiveTab('zoning')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'zoning'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          Master Plan Zoning Matrix ({zoningList.length})
        </button>
      </div>

      {/* Tab 1: Executive Overview */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Visual Distribution Graphs & Risk Matrices */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Master Plan Zoning Breakdown */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-600" />
                  Master Plan 2035 Zoning Breakdown
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Coimbatore LPA</span>
              </div>

              <div className="space-y-3 text-xs">
                {Object.entries(analytics.zoning_distribution || {}).map(([zone, count]) => {
                  const total = analytics.total_parcels_analyzed || 1;
                  const numCount = Number(count);
                  const pct = Math.round((numCount / total) * 100);
                  return (
                    <div key={zone} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span>{zone}</span>
                        <span>{numCount} parcels ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spatial Conflict Severity */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Conflict Severity Distribution
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Total: {conflicts.length}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600" />
                    <span className="font-bold text-rose-950">Critical Severity (Waterbody / HT)</span>
                  </div>
                  <span className="text-sm font-extrabold text-rose-700">
                    {analytics.conflicts_by_severity?.critical || 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="font-bold text-amber-950">High Severity (Boundary Overlap)</span>
                  </div>
                  <span className="text-sm font-extrabold text-amber-700">
                    {analytics.conflicts_by_severity?.high || 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="font-bold text-blue-950">Moderate Severity (Setback Deficit)</span>
                  </div>
                  <span className="text-sm font-extrabold text-blue-700">
                    {analytics.conflicts_by_severity?.moderate || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 text-white shadow-md space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-400 text-blue-950 uppercase">
                  GIS Explorer Bridge
                </span>
                <h3 className="text-base font-bold text-white">
                  Interactive Cadastral & Buffer Overlay
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Open the high-resolution GIS map with Master Plan 2035 zoning, 50m waterbody buffers, and satellite change vector layers active.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => navigate('/gis')}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-blue-950 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Launch GIS Cadastral Explorer
                </button>
              </div>
            </div>
          </div>

          {/* High-Risk Parcels Action Table */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  High Spatial Risk Parcels (Statutory Action Required)
                </h3>
                <p className="text-xs text-slate-500">
                  Parcels requiring immediate revenue field verification or municipal notice issuance.
                </p>
              </div>

              <button
                onClick={() => navigate('/gis')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                Inspect All on Map <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-3 px-4">Parcel ID / ULPIN</th>
                    <th className="py-3 px-4">Zoning Classification</th>
                    <th className="py-3 px-4">Restriction Breach</th>
                    <th className="py-3 px-4">Satellite Flag</th>
                    <th className="py-3 px-4">Risk Index</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-950">
                      TN-CBE-001-124-3
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        C2 - Commercial
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-rose-700 font-semibold flex items-center gap-1">
                        <Waves className="w-3.5 h-3.5 text-cyan-600" />
                        50m Lake Buffer Breach
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-violet-700 font-medium">New Construction (+120 sqm)</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                        88/100 (Critical)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate('/gis?parcel_id=TN-CBE-001-124-3')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                        >
                          View GIS
                        </button>
                        <button
                          onClick={() => navigate('/parcel/TN-CBE-001-124-3')}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                        >
                          Parcel 360
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-950">
                      TN-CBE-001-125-1
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        AG-1 - Agricultural
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        110kV HT Power Corridor
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600">Stable (No change)</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                        72/100 (High)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate('/gis?parcel_id=TN-CBE-001-125-1')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                        >
                          View GIS
                        </button>
                        <button
                          onClick={() => navigate('/parcel/TN-CBE-001-125-1')}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                        >
                          Parcel 360
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Spatial Conflicts & Encroachments */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search conflicts by Parcel ID, type, or entity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredConflicts.length} of {conflicts.length} recorded disputes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredConflicts.map((c) => (
              <div
                key={c.conflict_id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-950">{c.parcel_id}</span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase border ${
                        c.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {c.severity}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {c.conflict_id}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{c.conflict_type}</h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 flex justify-between">
                    <span>Overlapping Entity: <strong>{c.overlapping_entity}</strong></span>
                    <span className="text-rose-700 font-bold">Extent: {c.encroachment_extent_sqm} sq.m</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Status: <strong className="text-amber-700">{c.status}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/gis?parcel_id=${c.parcel_id}`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      View on Map
                    </button>
                    <button
                      onClick={() => setSelectedConflict(c)}
                      className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-semibold flex items-center gap-1"
                    >
                      <Scale className="w-3.5 h-3.5 text-teal-400" />
                      Adjudicate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI Satellite Detections */}
      {activeTab === 'satellite' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {satelliteChanges.map((sc) => (
              <div
                key={sc.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-950">{sc.parcel_id}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-violet-100 text-violet-800 border border-violet-200 uppercase">
                        {sc.change_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Sensor: {sc.sensor_source} • Detected Area: <strong>{sc.detected_area_sqm} sq.m</strong>
                    </p>
                  </div>

                  <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                    AI Conf: {(sc.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Baseline Pass</span>
                    <span className="font-mono font-semibold text-slate-800">{sc.baseline_date}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Detection Pass</span>
                    <span className="font-mono font-semibold text-slate-800">{sc.detection_date}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Status</span>
                    <span className="font-bold text-rose-700">{sc.change_status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/gis?parcel_id=${sc.parcel_id}`)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                  >
                    Open Temporal Inspector
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Master Plan Zoning Matrix */}
      {activeTab === 'zoning' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-blue-950">
                Coimbatore Master Plan 2035 Classification Directory
              </h3>
              <p className="text-xs text-slate-500">
                Statutory development regulations and land use covenants registered under Tamil Nadu TCP Act 1971.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-3 px-4">Zone Code</th>
                  <th className="py-3 px-4">Zone Name</th>
                  <th className="py-3 px-4">Max FAR / FSI</th>
                  <th className="py-3 px-4">Max Height</th>
                  <th className="py-3 px-4">Permitted Uses</th>
                  <th className="py-3 px-4">Prohibited Uses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {zoningList.map((z) => (
                  <tr key={z.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-950">
                      {z.zone_code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {z.zone_name}
                    </td>
                    <td className="py-3 px-4 font-bold text-teal-700">
                      {z.max_far.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {z.max_height_meters}m
                    </td>
                    <td className="py-3 px-4 text-emerald-800">
                      {z.permitted_uses.join(', ')}
                    </td>
                    <td className="py-3 px-4 text-rose-800">
                      {z.prohibited_uses.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Spatial Conflict Resolution Modal */}
      {selectedConflict && (
        <SpatialConflictModal
          conflict={selectedConflict}
          onClose={() => setSelectedConflict(null)}
          onResolved={() => {
            loadData();
            setSelectedConflict(null);
          }}
        />
      )}
    </div>
  );
};
