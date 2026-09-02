import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  POLLACHI_TALUK_GIS,
  DISTRICTS_LIST,
  TALUKS_LIST,
  LandParcel,
  EXCEL_PARCELS_MAP,
  convertExcelRecordToLandParcel
} from '../data/gisData';
import { spatialAnalysisService, SpatialAnalysisReport } from '../services/spatialAnalysis';
import { GISMap } from '../components/gis/GISMap';
import { LayerControls, DEFAULT_ACTIVE_LAYERS, ActiveGISLayers } from '../components/gis/LayerControls';
import { LandIntelligencePanel } from '../components/gis/LandIntelligencePanel';
import {
  Search,
  ChevronRight,
  RotateCcw,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Home,
  FileSpreadsheet
} from 'lucide-react';

export const GISDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('q') || searchParams.get('ulpin') || 'REG-2024-CBE-12402'
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Coimbatore');
  const [selectedTaluk, setSelectedTaluk] = useState<string>('Pollachi');
  const [selectedState, setSelectedState] = useState<string>('TN (Tamil Nadu)');

  // GIS Layers State
  const [activeLayers, setActiveLayers] = useState<ActiveGISLayers>(DEFAULT_ACTIVE_LAYERS);
  const [layerOpacity, setLayerOpacity] = useState<number>(0.85);

  // Selected Parcel State
  const [selectedParcelId, setSelectedParcelId] = useState<string>('TN-CBE-001-124-2');
  const [analysisReport, setAnalysisReport] = useState<SpatialAnalysisReport | null>(null);

  // Find active Pollachi property parcel by Registration Number, ULPIN, Survey Number or Excel Parcel ID
  const activeParcel = useMemo(() => {
    if (!selectedParcelId) return POLLACHI_TALUK_GIS.parcels[1];
    const clean = selectedParcelId.trim().toUpperCase();
    const cleanNoSpace = clean.replace(/\s+/g, '');

    // 1. Search in pre-loaded GIS parcels array
    const matchedInMemory = POLLACHI_TALUK_GIS.parcels.find(
      (p) =>
        p.ulpin.toUpperCase() === clean ||
        p.id.toUpperCase() === clean ||
        (p.regNumber && p.regNumber.toUpperCase() === clean) ||
        (p.regNumber && p.regNumber.toUpperCase().replace(/\s+/g, '') === cleanNoSpace) ||
        (p.fullSurveyNo && p.fullSurveyNo.toUpperCase() === clean) ||
        (p.fullSurveyNo && p.fullSurveyNo.toUpperCase().replace(/\s+/g, '') === cleanNoSpace) ||
        p.surveyNumber.toUpperCase() === clean ||
        p.surveyNumber.toUpperCase().replace(/\s+/g, '') === cleanNoSpace
    );

    if (matchedInMemory) return matchedInMemory;

    // 2. Search in 18,284 record Excel lookup dictionary
    const rawExcelRec = EXCEL_PARCELS_MAP[clean] || EXCEL_PARCELS_MAP[`DEMO-PLCH-${clean}`];
    if (rawExcelRec) {
      return convertExcelRecordToLandParcel(rawExcelRec, 99);
    }

    return POLLACHI_TALUK_GIS.parcels[1]; // Default to 124/2 House Plot
  }, [selectedParcelId]);

  // Run spatial analysis whenever active parcel changes
  useEffect(() => {
    if (activeParcel) {
      const report = spatialAnalysisService.analyzeLandParcel(activeParcel, POLLACHI_TALUK_GIS);
      setAnalysisReport(report);
    }
  }, [activeParcel]);

  // Search Submit Handler: Supports Excel Parcel IDs (DEMO-PLCH-000001), Registration Numbers, ULPINs, Survey Subdivision
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;

    const cleanNoSpace = query.replace(/\s+/g, '');

    const matched = POLLACHI_TALUK_GIS.parcels.find(
      (p) =>
        p.ulpin.toUpperCase() === query ||
        p.id.toUpperCase() === query ||
        (p.regNumber && p.regNumber.toUpperCase() === query) ||
        (p.regNumber && p.regNumber.toUpperCase().replace(/\s+/g, '') === cleanNoSpace) ||
        (p.fullSurveyNo && p.fullSurveyNo.toUpperCase() === query) ||
        (p.fullSurveyNo && p.fullSurveyNo.toUpperCase().replace(/\s+/g, '') === cleanNoSpace) ||
        p.surveyNumber.toUpperCase() === query ||
        p.surveyNumber.toUpperCase().replace(/\s+/g, '') === cleanNoSpace
    );

    if (matched) {
      setSelectedParcelId(matched.ulpin);
      setSearchParams({ q: matched.ulpin });
    } else if (EXCEL_PARCELS_MAP[query] || EXCEL_PARCELS_MAP[`DEMO-PLCH-${query}`]) {
      const key = EXCEL_PARCELS_MAP[query] ? query : `DEMO-PLCH-${query}`;
      setSelectedParcelId(key);
      setSearchParams({ q: key });
    } else {
      setSelectedParcelId('TN-CBE-001-124-2');
    }
  };

  // Toggle individual GIS layer switch
  const handleToggleLayer = (key: keyof ActiveGISLayers) => {
    setActiveLayers((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('REG-2024-CBE-12402');
    setSelectedDistrict('Coimbatore');
    setSelectedTaluk('Pollachi');
    setSelectedState('TN (Tamil Nadu)');
    setSelectedParcelId('TN-CBE-001-124-2');
    setActiveLayers(DEFAULT_ACTIVE_LAYERS);
  };

  return (
    <div
      id="gis-map-dashboard-container"
      className="min-h-screen bg-slate-50/60 py-6 px-4 sm:px-6 lg:px-8 space-y-6"
    >
      {/* Dashboard Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>LandSync DPI</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-900 font-bold">LAND PARCEL INTELLIGENCE GIS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>POLLACHI LAND INTELLIGENCE GIS DASHBOARD</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-950 border border-blue-200 flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-blue-900" />
              <span>18,284 Excel Records Loaded</span>
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-4xl">
            Land parcel intelligence interface for Pollachi Taluk. Loaded with 18,284 records from LANDSYNC_Pollachi_Parcel_Prototype.xlsx. Search by Excel Parcel ID (DEMO-PLCH-000001), Registration Number (REG-2024-CBE-12402), ULPIN, or Survey Subdivision to zoom directly to your parcel.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={() => navigate('/admin/spatial-analytics')}
            className="px-3.5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-teal-300 text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <BarChart3 className="w-4 h-4 text-teal-400" />
            <span>Spatial Analytics Console</span>
          </button>
        </div>
      </div>

      {/* Dataset Verification Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border border-blue-900">
        <div className="flex items-center gap-2.5">
          <FileSpreadsheet className="w-4 h-4 text-teal-300 shrink-0" />
          <div>
            <span className="font-bold text-teal-300">Both Excel Datasets Loaded:</span> LANDSYNC_Pollachi_Parcel_Prototype.xlsx & (1).xlsx (18,284 Pollachi parcel records across 65 villages). All Mahalingapuram Main Road visualizers remain 100% active.
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] bg-white/10 px-2.5 py-1 rounded-lg shrink-0 font-mono text-slate-200">
          <span>District: {selectedDistrict}</span>
          <span>|</span>
          <span>Taluk: {selectedTaluk}</span>
        </div>
      </div>

      {/* Main 3-Column GIS Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT PANEL (3 cols) ================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Registration Number & Excel Parcel ID Search Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-4 h-4 text-blue-900" />
                <span>Search Reg No / Parcel ID</span>
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-[10px] text-slate-400 hover:text-slate-700 font-bold flex items-center gap-1"
                title="Reset Filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <form onSubmit={handleSearch} className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Reg #, ULPIN, Excel ID or Survey No
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. DEMO-PLCH-000001 or 124/2"
                    className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-blue-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-1 bg-blue-950 text-white rounded-lg hover:bg-blue-900 transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* State Adaptor Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  State Adaptor System
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="TN (Tamil Nadu)">TN – Tamil Nilam (Pollachi Property Engine)</option>
                  <option value="KA (Karnataka)">KA – Bhoomi RTC Engine</option>
                  <option value="MH (Maharashtra)">MH – MahaBhulekh (7/12)</option>
                  <option value="DL (Delhi)">DL – DDA DPI Spatial System</option>
                </select>
              </div>

              {/* District Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  District Filter
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  {DISTRICTS_LIST.map((d) => (
                    <option key={d} value={d}>
                      {d} District
                    </option>
                  ))}
                </select>
              </div>

              {/* Taluk Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Taluk Filter
                </label>
                <select
                  value={selectedTaluk}
                  onChange={(e) => setSelectedTaluk(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  {TALUKS_LIST.map((t) => (
                    <option key={t} value={t}>
                      {t} Taluk
                    </option>
                  ))}
                </select>
              </div>
            </form>

            {/* Quick Registration & Excel Parcel Presets */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Dataset Presets</span>
                <span className="text-[9px] text-teal-700 font-extrabold">Zoom to Parcel 🟡</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {['REG-2024-CBE-12402', 'DEMO-PLCH-000001', 'DEMO-PLCH-000002', 'DEMO-PLCH-000003', 'TN-CBE-001-124-1'].map((pKey) => (
                  <button
                    key={pKey}
                    onClick={() => {
                      setSearchQuery(pKey);
                      setSelectedParcelId(pKey);
                      setSearchParams({ q: pKey });
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition border ${
                      pKey === activeParcel?.ulpin || pKey === activeParcel?.regNumber
                        ? 'bg-blue-950 text-teal-300 border-blue-950 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {pKey.replace('DEMO-PLCH-', 'XL-').replace('REG-2024-CBE-', 'Reg ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 8 Focused GIS Layer Controls */}
          <LayerControls
            layers={activeLayers}
            onToggleLayer={handleToggleLayer}
            opacity={layerOpacity}
            onChangeOpacity={setLayerOpacity}
          />
        </div>

        {/* ================= CENTER PANEL (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="h-[650px] relative rounded-2xl overflow-hidden border border-slate-200 shadow-md">
            <GISMap
              gisData={POLLACHI_TALUK_GIS}
              activeLayers={activeLayers}
              layerOpacity={layerOpacity}
              selectedParcelId={activeParcel ? activeParcel.ulpin : selectedParcelId}
              onSelectParcel={(pid) => {
                setSelectedParcelId(pid);
                setSearchQuery(pid);
                setSearchParams({ q: pid });
              }}
            />
          </div>

          {/* Pollachi Property Plot Strip */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Land Parcels ({POLLACHI_TALUK_GIS.parcels.length} Pre-loaded / 18,284 Total)</span>
              <span className="text-[10px] text-slate-400 font-normal">Click to zoom & inspect</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {POLLACHI_TALUK_GIS.parcels.slice(0, 15).map((p) => {
                const isSelected = activeParcel && p.ulpin === activeParcel.ulpin;
                const isDiscrepancy = p.ulpin === 'TN-CBE-001-124-3';

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedParcelId(p.ulpin);
                      setSearchQuery(p.regNumber || p.fullSurveyNo || p.ulpin);
                      setSearchParams({ q: p.ulpin });
                    }}
                    className={`px-3 py-2 rounded-xl text-left text-xs shrink-0 border transition min-w-[170px] ${
                      isSelected
                        ? 'bg-blue-950 text-white border-blue-950 shadow-sm'
                        : isDiscrepancy
                        ? 'bg-rose-50 border-rose-200 text-slate-800 hover:bg-rose-100'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`font-black ${isSelected ? 'text-teal-300' : 'text-blue-950'}`}>
                        🟡 {p.fullSurveyNo ? `Survey ${p.fullSurveyNo}` : p.id}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {p.areaAcres ? `${p.areaAcres} Ac` : p.area.split(' ')[0]}
                      </span>
                    </div>
                    <div className={`text-[10px] font-mono truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {p.regNumber || p.ulpin}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL (4 cols) ================= */}
        <div className="lg:col-span-4 space-y-4">
          <LandIntelligencePanel
            parcel={activeParcel}
            analysis={analysisReport}
            onNavigateToParcel360={(ulpin) => navigate(`/parcel/${encodeURIComponent(ulpin)}`)}
          />
        </div>
      </div>
    </div>
  );
};
