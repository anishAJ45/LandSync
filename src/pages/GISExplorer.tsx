import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { parcelService } from '../services/parcelService';
import { spatialService } from '../services/spatialService';
import { Parcel, ParcelAnalysis, GISStatistics, GeoJSONFeatureCollection, SpatialRiskScore } from '../types';
import { MapContainer } from '../components/gis/MapContainer';
import { ParcelSearch } from '../components/gis/ParcelSearch';
import { ParcelLegend } from '../components/gis/ParcelLegend';
import { ParcelInfoPanel } from '../components/gis/ParcelInfoPanel';
import { GISStatsCards } from '../components/gis/GISStatsCards';
import { SpatialLayerManager, DEFAULT_SPATIAL_LAYERS, SpatialLayerState } from '../components/gis/SpatialLayerManager';
import {
  Layers,
  MapPin,
  Maximize2,
  RefreshCw,
  AlertTriangle,
  Compass,
  FileSpreadsheet,
  Info,
  ChevronRight,
  ExternalLink,
  Table,
  BarChart3,
  ScanLine,
  Building,
  Waves,
  Zap,
  ShieldAlert
} from 'lucide-react';

export const GISExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data states
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [geoJsonData, setGeoJsonData] = useState<GeoJSONFeatureCollection | null>(null);
  const [stats, setStats] = useState<GISStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Phase 8 Spatial Layer States
  const [spatialLayers, setSpatialLayers] = useState<SpatialLayerState>(DEFAULT_SPATIAL_LAYERS);
  const [spatialOpacity, setSpatialOpacity] = useState<number>(0.85);
  const [showLayerManager, setShowLayerManager] = useState<boolean>(true);

  // Filter and selection states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedLandUse, setSelectedLandUse] = useState(searchParams.get('land_use') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(
    searchParams.get('parcel_id') || 'TN-CBE-001-124-1'
  );
  const [hoveredParcelId, setHoveredParcelId] = useState<string | null>(null);

  // Analysis for selected parcel
  const [selectedAnalysis, setSelectedAnalysis] = useState<ParcelAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // View mode: Map vs Table
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');

  // Load initial GIS data
  const loadData = async () => {
    try {
      setRefreshing(true);
      const [allParcels, geojson, gisStats] = await Promise.all([
        parcelService.getAllParcels(),
        parcelService.getGeoJSON(),
        parcelService.getGISStatistics(),
      ]);
      setParcels(allParcels);
      setGeoJsonData(geojson);
      setStats(gisStats);

      // If URL had no parcel selected, default to first or stay null
      if (!selectedParcelId && allParcels.length > 0) {
        setSelectedParcelId(allParcels[0].parcel_id);
      }
    } catch (err) {
      console.error('Failed to load GIS parcels data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch analysis when selected parcel changes
  useEffect(() => {
    if (!selectedParcelId) {
      setSelectedAnalysis(null);
      return;
    }

    let isMounted = true;
    const fetchAnalysis = async () => {
      try {
        setLoadingAnalysis(true);
        const analysis = await parcelService.getParcelAnalysis(selectedParcelId);
        if (isMounted) setSelectedAnalysis(analysis);
      } catch (err) {
        console.error('Error fetching parcel analysis:', err);
        if (isMounted) setSelectedAnalysis(null);
      } finally {
        if (isMounted) setLoadingAnalysis(false);
      }
    };

    fetchAnalysis();

    return () => {
      isMounted = false;
    };
  }, [selectedParcelId]);

  // Filter parcels based on search and filters
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      // Query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          p.parcel_id.toLowerCase().includes(q) ||
          p.survey_number.toLowerCase().includes(q) ||
          p.current_owner.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Land use filter
      if (selectedLandUse && p.land_use.toLowerCase() !== selectedLandUse.toLowerCase()) {
        return false;
      }

      // Status filter
      if (selectedStatus) {
        if (selectedStatus.toLowerCase() === 'overlap') {
          if (p.parcel_id !== 'TN-CBE-001-124-3' && p.parcel_id !== 'TN-CBE-001-125-1') {
            return false;
          }
        } else if (selectedStatus.toLowerCase() === 'discrepancy') {
          const diffPct = Math.abs(p.recorded_area - p.gis_area) / p.recorded_area;
          if (diffPct <= 0.02 && !p.status.toLowerCase().includes('discrepancy')) {
            return false;
          }
        } else if (!p.status.toLowerCase().includes(selectedStatus.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [parcels, searchQuery, selectedLandUse, selectedStatus]);

  const filteredParcelIds = useMemo(() => {
    return new Set(filteredParcels.map((p) => p.parcel_id));
  }, [filteredParcels]);

  // Currently active selected parcel object
  const activeParcel = useMemo(() => {
    return parcels.find((p) => p.parcel_id === selectedParcelId) || null;
  }, [parcels, selectedParcelId]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLandUse('');
    setSelectedStatus('');
  };

  return (
    <div id="gis-explorer-page" className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>LandSync DPI</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-900 font-bold">GIS Spatial Intelligence Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Interactive Cadastral GIS & Spatial Layer Engine</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
              Phase 8 Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Multi-layer GIS public infrastructure integrating official cadastral surveys, Master Plan 2035 zoning, 50m waterbody buffers, and AI satellite change detection.
          </p>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={() => navigate('/admin/spatial-analytics')}
            className="px-3.5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-teal-300 text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <BarChart3 className="w-4 h-4 text-teal-400" />
            <span>Spatial Analytics Console</span>
          </button>

          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 border border-slate-300/60">
            <button
              id="switch-view-map-btn"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'map'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              id="switch-view-table-btn"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Parcel Grid</span>
            </button>
          </div>

          <button
            id="gis-refresh-data-btn"
            onClick={loadData}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            title="Refresh GIS layer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-900' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mandatory Hackathon Disclaimer Alert */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-blue-950 flex items-start gap-2.5 shadow-2xs">
        <Info className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">SIH Prototype GIS Infrastructure:</span> Spatial cadastral polygons are layered with Master Plan 2035 zoning classifications, PWD 50m waterbody statutory buffers (TN Protection of Tanks Act 2007), TANGEDCO HT powerlines, and Sentinel-2 multi-spectral temporal change vectors.
        </div>
      </div>

      {/* GIS Metrics Stats Cards */}
      <GISStatsCards stats={stats} loading={loading} />

      {/* Search & Filter Component */}
      <ParcelSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLandUse={selectedLandUse}
        onLandUseChange={setSelectedLandUse}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onResetFilters={handleResetFilters}
        totalCount={parcels.length}
        filteredCount={filteredParcels.length}
      />

      {/* Main Content Area: Map View vs Table View */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Map Container (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative h-[640px] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
              <MapContainer
                geoJsonData={geoJsonData}
                selectedParcelId={selectedParcelId}
                hoveredParcelId={hoveredParcelId}
                onSelectParcel={(pid) => setSelectedParcelId(pid)}
                onHoverParcel={(pid) => setHoveredParcelId(pid)}
                filteredParcelIds={filteredParcelIds}
                spatialLayers={spatialLayers}
                spatialOpacity={spatialOpacity}
              />

              {/* Floating Spatial Layer Manager on Top Left of Map */}
              <div className="absolute top-4 left-4 z-[999] max-w-[320px] hidden md:block">
                <SpatialLayerManager
                  layers={spatialLayers}
                  onChangeLayers={setSpatialLayers}
                  opacity={spatialOpacity}
                  onChangeOpacity={setSpatialOpacity}
                  compact={false}
                />
              </div>

              {/* Floating Legend on Bottom Left of Map */}
              <div className="absolute bottom-6 left-4 z-[999] max-w-[240px] hidden sm:block">
                <ParcelLegend />
              </div>
            </div>

            {/* Quick Parcel Selector Strip */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Select Parcel from Cadastral Grid ({filteredParcels.length})</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Click any card to center & inspect on map
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {filteredParcels.map((p) => {
                  const isSelected = p.parcel_id === selectedParcelId;
                  const isDiscrepancy =
                    p.status.includes('Discrepancy') ||
                    p.parcel_id === 'TN-CBE-001-124-3' ||
                    p.parcel_id === 'TN-CBE-001-125-1';

                  return (
                    <button
                      key={p.parcel_id}
                      onClick={() => setSelectedParcelId(p.parcel_id)}
                      className={`px-3 py-2 rounded-xl text-left text-xs shrink-0 border transition min-w-[170px] ${
                        isSelected
                          ? 'bg-blue-950 text-white border-blue-950 shadow-sm'
                          : isDiscrepancy
                          ? 'bg-rose-50/70 border-rose-200 text-slate-800 hover:bg-rose-100/60'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`font-bold ${isSelected ? 'text-teal-300' : 'text-blue-950'}`}>
                          Survey {p.survey_number}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {p.land_use}
                        </span>
                      </div>
                      <div className={`text-[11px] font-medium truncate ${isSelected ? 'text-slate-200' : 'text-slate-600'}`}>
                        {p.current_owner}
                      </div>
                      <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {p.recorded_area} {p.area_unit}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Inspector & Analysis Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {activeParcel ? (
              <ParcelInfoPanel
                parcel={activeParcel}
                analysis={selectedAnalysis}
                loadingAnalysis={loadingAnalysis}
                onClose={() => setSelectedParcelId(null)}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">No Parcel Selected</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Click on any parcel polygon on the GIS map or select one from the list below to inspect geometry, ownership records, and spatial discrepancy analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Cadastral Parcel Registry ({filteredParcels.length} Records)
            </h3>
            <span className="text-xs text-slate-500">
              Click any row to open the complete Parcel 360° profile
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Parcel ID / Survey No</th>
                  <th className="py-3.5 px-4">Current Owner</th>
                  <th className="py-3.5 px-4">Land Use</th>
                  <th className="py-3.5 px-4">Recorded Area</th>
                  <th className="py-3.5 px-4">GIS Calculated</th>
                  <th className="py-3.5 px-4">Variance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredParcels.map((parcel) => {
                  const diff = Math.round(Math.abs(parcel.recorded_area - parcel.gis_area) * 1000) / 1000;
                  const pct = Math.round((diff / parcel.recorded_area) * 10000) / 100;
                  const isDiscrepancy = pct > 2.0;

                  return (
                    <tr
                      key={parcel.parcel_id}
                      onClick={() => navigate(`/parcel/${encodeURIComponent(parcel.parcel_id)}`)}
                      className="hover:bg-blue-50/40 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-blue-950">{parcel.parcel_id}</div>
                        <div className="text-[11px] text-slate-500">Survey {parcel.survey_number} (Sub-div {parcel.subdivision})</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {parcel.current_owner}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                          {parcel.land_use}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium">
                        {parcel.recorded_area} {parcel.area_unit}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-950">
                        {parcel.gis_area} {parcel.area_unit}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`font-semibold ${
                            pct > 5.0
                              ? 'text-rose-600'
                              : pct > 2.0
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {pct}% ({diff} {parcel.area_unit})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            parcel.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : parcel.status === 'Under Review'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-rose-50 text-rose-900 border-rose-200'
                          }`}
                        >
                          {parcel.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/parcel/${encodeURIComponent(parcel.parcel_id)}`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-teal-300 text-xs font-bold inline-flex items-center gap-1 transition"
                        >
                          <span>360° View</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
