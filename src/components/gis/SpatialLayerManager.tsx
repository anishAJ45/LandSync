import React, { useState } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Sliders,
  ShieldAlert,
  Compass,
  MapPin,
  Waves,
  Zap,
  Plane,
  Trees,
  Building,
  ScanLine,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

export interface SpatialLayerState {
  // Base Layers
  cadastralBoundaries: boolean;
  ulpinLabels: boolean;
  surveySubdivisions: boolean;
  administrativeBoundaries: boolean;

  // Governance Layers
  masterPlanZoning: boolean;
  sanctionedBuildingFootprints: boolean;
  rorStatusIndicators: boolean;

  // Use-Case & Restriction Layers
  waterbodyBuffer50m: boolean;
  highTensionCorridor15m: boolean;
  airportFunnelHeight: boolean;
  floodRiskZones: boolean;
  stateHighwayRoW: boolean;

  // AI & Remote Sensing Layers
  satelliteChangeAnomalies: boolean;
  treeLossNdviOverlay: boolean;
}

export const DEFAULT_SPATIAL_LAYERS: SpatialLayerState = {
  cadastralBoundaries: true,
  ulpinLabels: true,
  surveySubdivisions: true,
  administrativeBoundaries: true,

  masterPlanZoning: true,
  sanctionedBuildingFootprints: true,
  rorStatusIndicators: true,

  waterbodyBuffer50m: true,
  highTensionCorridor15m: true,
  airportFunnelHeight: false,
  floodRiskZones: true,
  stateHighwayRoW: true,

  satelliteChangeAnomalies: true,
  treeLossNdviOverlay: false,
};

interface SpatialLayerManagerProps {
  layers: SpatialLayerState;
  onChangeLayers: (updated: SpatialLayerState) => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
  onApplyPreset?: (presetName: 'governance' | 'encroachment' | 'environmental' | 'minimal') => void;
  compact?: boolean;
}

export const SpatialLayerManager: React.FC<SpatialLayerManagerProps> = ({
  layers,
  onChangeLayers,
  opacity,
  onChangeOpacity,
  onApplyPreset,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(!compact);
  const [activeTab, setActiveTab] = useState<'layers' | 'presets' | 'legend'>('layers');

  const toggleLayer = (key: keyof SpatialLayerState) => {
    onChangeLayers({
      ...layers,
      [key]: !layers[key]
    });
  };

  const handlePreset = (preset: 'governance' | 'encroachment' | 'environmental' | 'minimal') => {
    let updated: SpatialLayerState = { ...DEFAULT_SPATIAL_LAYERS };
    if (preset === 'governance') {
      updated = {
        ...updated,
        cadastralBoundaries: true,
        ulpinLabels: true,
        masterPlanZoning: true,
        sanctionedBuildingFootprints: true,
        rorStatusIndicators: true,
        waterbodyBuffer50m: true,
        highTensionCorridor15m: true,
        satelliteChangeAnomalies: true,
        floodRiskZones: false,
        treeLossNdviOverlay: false
      };
    } else if (preset === 'encroachment') {
      updated = {
        ...updated,
        cadastralBoundaries: true,
        ulpinLabels: true,
        masterPlanZoning: false,
        sanctionedBuildingFootprints: true,
        waterbodyBuffer50m: true,
        highTensionCorridor15m: true,
        stateHighwayRoW: true,
        satelliteChangeAnomalies: true,
        floodRiskZones: true,
        treeLossNdviOverlay: false
      };
    } else if (preset === 'environmental') {
      updated = {
        ...updated,
        cadastralBoundaries: true,
        ulpinLabels: false,
        masterPlanZoning: true,
        waterbodyBuffer50m: true,
        floodRiskZones: true,
        treeLossNdviOverlay: true,
        highTensionCorridor15m: false,
        satelliteChangeAnomalies: true
      };
    } else if (preset === 'minimal') {
      updated = {
        cadastralBoundaries: true,
        ulpinLabels: true,
        surveySubdivisions: false,
        administrativeBoundaries: false,
        masterPlanZoning: false,
        sanctionedBuildingFootprints: false,
        rorStatusIndicators: false,
        waterbodyBuffer50m: false,
        highTensionCorridor15m: false,
        airportFunnelHeight: false,
        floodRiskZones: false,
        stateHighwayRoW: false,
        satelliteChangeAnomalies: false,
        treeLossNdviOverlay: false
      };
    }
    onChangeLayers(updated);
    if (onApplyPreset) onApplyPreset(preset);
  };

  const activeCount = Object.values(layers).filter(Boolean).length;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg overflow-hidden transition-all duration-200">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/80 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              Spatial Layer Engine
              <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                {activeCount} Active
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">GIS Public Infrastructure Overlays</p>
          </div>
        </div>
        <button
          type="button"
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-3 space-y-3 max-h-[460px] overflow-y-auto">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('layers')}
              className={`flex-1 py-1 px-2 rounded-md transition-all ${
                activeTab === 'layers'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Layers ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1 px-2 rounded-md transition-all ${
                activeTab === 'presets'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Presets
            </button>
            <button
              onClick={() => setActiveTab('legend')}
              className={`flex-1 py-1 px-2 rounded-md transition-all ${
                activeTab === 'legend'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              GIS Legend
            </button>
          </div>

          {activeTab === 'layers' && (
            <div className="space-y-3 text-xs">
              {/* Category 1: Base Cadastral Layers */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Base Cadastral Infrastructure
                </div>
                <div className="space-y-1 pl-1">
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-slate-700 font-medium flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs bg-teal-500 border border-teal-700" />
                      Cadastral Parcel Boundaries
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.cadastralBoundaries}
                      onChange={() => toggleLayer('cadastralBoundaries')}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-slate-700 font-medium flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1 rounded">124/1</span>
                      ULPIN & Survey Subdivisions
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.ulpinLabels}
                      onChange={() => toggleLayer('ulpinLabels')}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-slate-700 font-medium flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs border border-dashed border-slate-600" />
                      Village Admin Boundaries
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.administrativeBoundaries}
                      onChange={() => toggleLayer('administrativeBoundaries')}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>
                </div>
              </div>

              {/* Category 2: Essential Governance Layers */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                  <Building className="w-3 h-3 text-blue-800" />
                  Essential Governance Layers
                </div>
                <div className="space-y-1 pl-1">
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-slate-700 font-medium flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 border border-amber-600" />
                      Master Plan 2035 Zoning Polygons
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.masterPlanZoning}
                      onChange={() => toggleLayer('masterPlanZoning')}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-slate-700 font-medium flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs bg-purple-500 border border-purple-700" />
                      Sanctioned Building Footprints
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.sanctionedBuildingFootprints}
                      onChange={() => toggleLayer('sanctionedBuildingFootprints')}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-slate-700 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Record of Rights (RoR) Status Badges
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.rorStatusIndicators}
                      onChange={() => toggleLayer('rorStatusIndicators')}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>
                </div>
              </div>

              {/* Category 3: Statutory Restriction Zones */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  Statutory Restriction Buffers
                </div>
                <div className="space-y-1 pl-1">
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-slate-700 font-medium flex items-center gap-2">
                      <Waves className="w-3.5 h-3.5 text-cyan-600" />
                      PWD Waterbody 50m Buffer (Lake Eri)
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.waterbodyBuffer50m}
                      onChange={() => toggleLayer('waterbodyBuffer50m')}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-slate-700 font-medium flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      TANGEDCO 110kV HT Corridor (15m)
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.highTensionCorridor15m}
                      onChange={() => toggleLayer('highTensionCorridor15m')}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-slate-700 font-medium flex items-center gap-2">
                      <Plane className="w-3.5 h-3.5 text-blue-500" />
                      Airport CCZM Height Funnel (24m)
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.airportFunnelHeight}
                      onChange={() => toggleLayer('airportFunnelHeight')}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-slate-700 font-medium flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs bg-sky-400/60 border border-sky-600" />
                      Flood Inundation Hazard Zones (Zone A)
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.floodRiskZones}
                      onChange={() => toggleLayer('floodRiskZones')}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>
                </div>
              </div>

              {/* Category 4: AI & Multi-Spectral Satellite Intelligence */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <div className="text-[11px] font-bold text-violet-700 uppercase tracking-wider flex items-center gap-1">
                  <ScanLine className="w-3 h-3 text-violet-600" />
                  AI & Remote Sensing Detections
                </div>
                <div className="space-y-1 pl-1">
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-slate-700 font-medium flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs border-2 border-rose-600 bg-rose-200/50 animate-pulse" />
                      Satellite Change & Deviation Flags
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.satelliteChangeAnomalies}
                      onChange={() => toggleLayer('satelliteChangeAnomalies')}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-slate-700 font-medium flex items-center gap-2">
                      <Trees className="w-3.5 h-3.5 text-emerald-600" />
                      NDVI Vegetation & Tree Loss Density
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.treeLossNdviOverlay}
                      onChange={() => toggleLayer('treeLossNdviOverlay')}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-slate-500" />
                    Layer Opacity
                  </span>
                  <span>{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-2 text-xs">
              <p className="text-[11px] text-slate-500">
                Quickly configure spatial layers for specialized administrative audits and dispute verification:
              </p>

              <button
                onClick={() => handlePreset('governance')}
                className="w-full text-left p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors flex items-start gap-2.5"
              >
                <Building className="w-4 h-4 text-blue-900 mt-0.5" />
                <div>
                  <div className="font-bold text-blue-950">Master Plan & Governance Audit</div>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Cadastral + Master Plan 2035 Zoning + Sanctioned Building Permits + Setback Checks
                  </p>
                </div>
              </button>

              <button
                onClick={() => handlePreset('encroachment')}
                className="w-full text-left p-2.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors flex items-start gap-2.5"
              >
                <ShieldAlert className="w-4 h-4 text-rose-700 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-950">Encroachment & Buffer Scan</div>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    PWD 50m Waterbody Buffer + TANGEDCO Corridor + Highway RoW + Satellite Detections
                  </p>
                </div>
              </button>

              <button
                onClick={() => handlePreset('environmental')}
                className="w-full text-left p-2.5 rounded-lg border border-cyan-200 bg-cyan-50/50 hover:bg-cyan-50 transition-colors flex items-start gap-2.5"
              >
                <Waves className="w-4 h-4 text-cyan-700 mt-0.5" />
                <div>
                  <div className="font-bold text-cyan-950">Environmental & Flood Risk Mode</div>
                  <p className="text-[11px] text-cyan-700 mt-0.5">
                    Catchment Inundation Zones + Singanallur Lake Wetland + NDVI Green Cover Loss
                  </p>
                </div>
              </button>

              <button
                onClick={() => handlePreset('minimal')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-start gap-2.5"
              >
                <RotateCcw className="w-4 h-4 text-slate-600 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">Clean Base Cadastral</div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Minimal view with parcel boundaries and ULPIN survey numbers only.
                  </p>
                </div>
              </button>
            </div>
          )}

          {activeTab === 'legend' && (
            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Spatial Feature Symbols
              </div>

              <div className="grid grid-cols-1 gap-1.5 pl-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-teal-500/60 border border-teal-700" />
                  <span className="text-slate-700">Residential Zone (R1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-amber-500/60 border border-amber-700" />
                  <span className="text-slate-700">Commercial / Logistics (C2)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-emerald-500/60 border border-emerald-700" />
                  <span className="text-slate-700">Agricultural Green Belt (AG-1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-cyan-600/70 border border-cyan-900" />
                  <span className="text-slate-700">Protected Waterbody Conservation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs border-2 border-dashed border-cyan-500 bg-cyan-100/60" />
                  <span className="text-slate-700">50m Waterbody Buffer Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1 bg-amber-500" />
                  <span className="text-slate-700">110kV HT Line Corridor</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs border-2 border-rose-600 bg-rose-500/30 animate-pulse" />
                  <span className="text-rose-700 font-semibold">AI Unauthorized Construction Flag</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
