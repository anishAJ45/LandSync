import React from 'react';
import { Layers, Sliders, Info } from 'lucide-react';

export interface ActiveGISLayers {
  landParcels: boolean;
  waterBodies: boolean;
  agriculturalLand: boolean;
  governmentLand: boolean;
  approvedLayout: boolean;
  roadsInfrastructure: boolean;
  wardBoundaries: boolean;
  townshipAreas: boolean;
  environmentalZones: boolean;
}

export const DEFAULT_ACTIVE_LAYERS: ActiveGISLayers = {
  landParcels: true,
  waterBodies: true,
  agriculturalLand: true,
  governmentLand: true,
  approvedLayout: true,
  roadsInfrastructure: true,
  wardBoundaries: true,
  townshipAreas: true,
  environmentalZones: true
};

interface LayerControlsProps {
  layers: ActiveGISLayers;
  onToggleLayer: (layerKey: keyof ActiveGISLayers) => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
  compact?: boolean;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  layers,
  onToggleLayer,
  opacity,
  onChangeOpacity,
  compact = false
}) => {
  const layerItems: Array<{
    key: keyof ActiveGISLayers;
    label: string;
    icon: string;
    colorBg: string;
    textColor: string;
    description: string;
    disclaimer: string;
  }> = [
    {
      key: 'landParcels',
      label: 'Land Parcels',
      icon: '📐',
      colorBg: 'bg-slate-800',
      textColor: 'text-slate-800',
      description: 'Pollachi cadastral survey boundaries & sub-division parcels',
      disclaimer: 'Prototype / reference GIS layer'
    },
    {
      key: 'waterBodies',
      label: 'Water Bodies',
      icon: '🌊',
      colorBg: 'bg-blue-600',
      textColor: 'text-blue-700',
      description: 'Aliyar river stream, Contour canal & PWD 50m statutory buffer',
      disclaimer: 'Reference dataset pending authoritative GIS digitization'
    },
    {
      key: 'agriculturalLand',
      label: 'Agricultural Land',
      icon: '🌾',
      colorBg: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      description: 'Pollachi coconut plantation preserve & wetland paddy belt',
      disclaimer: 'Prototype / reference GIS layer'
    },
    {
      key: 'governmentLand',
      label: 'Government / Poramboke Land',
      icon: '🏛️',
      colorBg: 'bg-orange-500',
      textColor: 'text-orange-700',
      description: 'State revenue poramboke & collectorate reserved land',
      disclaimer: 'Reference dataset pending authoritative GIS digitization'
    },
    {
      key: 'approvedLayout',
      label: 'Approved Construction / Layout Areas',
      icon: '🟢',
      colorBg: 'bg-cyan-500',
      textColor: 'text-cyan-700',
      description: 'DTCP/LPA sanctioned Mahalingapuram residential & commercial layouts',
      disclaimer: 'Prototype / reference GIS layer'
    },
    {
      key: 'roadsInfrastructure',
      label: 'Roads & Infrastructure',
      icon: '🛣️',
      colorBg: 'bg-slate-600',
      textColor: 'text-slate-600',
      description: 'NH-83 Pollachi-Dindigul highway & SH-78 Valparai road corridor',
      disclaimer: 'Prototype / reference GIS layer'
    },
    {
      key: 'wardBoundaries',
      label: 'Ward Boundaries',
      icon: '🏛️',
      colorBg: 'bg-indigo-600',
      textColor: 'text-indigo-700',
      description: 'Pollachi Municipality Ward 1, Ward 2 & Ward 3 boundary lines',
      disclaimer: 'Reference dataset pending authoritative GIS digitization'
    },
    {
      key: 'townshipAreas',
      label: 'Township Areas',
      icon: '🌆',
      colorBg: 'bg-amber-600',
      textColor: 'text-amber-700',
      description: 'Pollachi Master Plan 2035 Urban Growth Core Township Area',
      disclaimer: 'Reference dataset pending authoritative GIS digitization'
    },
    {
      key: 'environmentalZones',
      label: 'Environmental Zones',
      icon: '🌿',
      colorBg: 'bg-purple-600',
      textColor: 'text-purple-700',
      description: 'Anamalai tiger reserve foothills & eco-sensitive riverine corridor',
      disclaimer: 'Reference dataset pending authoritative GIS digitization'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-950 text-teal-300 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs tracking-tight">GIS LAYERS CONTROL</h3>
            <p className="text-[10px] font-medium text-slate-500">9 Active Layers for Pollachi Taluk Map</p>
          </div>
        </div>
      </div>

      {/* Layer Toggle Switches */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {layerItems.map((item) => {
          const isChecked = layers[item.key];
          return (
            <label
              key={item.key}
              className={`flex items-start justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                isChecked
                  ? 'bg-slate-50/80 border-slate-300 shadow-2xs'
                  : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-2 pr-2">
                <span className="text-sm mt-0.5">{item.icon}</span>
                <div>
                  <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                    <span>{item.label}</span>
                    <span className={`w-2 h-2 rounded-full ${item.colorBg}`} />
                  </div>
                  {!compact && (
                    <p className="text-[10px] text-slate-500 leading-normal mt-0.5">{item.description}</p>
                  )}
                  <div className="text-[9px] text-slate-400 italic mt-0.5 font-medium">
                    {item.disclaimer}
                  </div>
                </div>
              </div>

              {/* Custom Toggle Switch */}
              <div className="relative inline-flex items-center shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleLayer(item.key)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-950"></div>
              </div>
            </label>
          );
        })}
      </div>

      {/* Opacity Slider */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-blue-900" />
            <span>Layer Opacity</span>
          </span>
          <span className="font-mono text-blue-950">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={opacity}
          onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-950"
        />
      </div>

      {/* Map Legend */}
      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 text-xs space-y-2">
        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
          <span>Map Legend</span>
          <Info className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-600 inline-block shrink-0" />
            <span>Agriculture (Green)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500/40 border border-cyan-600 inline-block shrink-0" />
            <span>Approved Layout (Teal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-orange-500/40 border border-orange-600 inline-block shrink-0" />
            <span>Government (Orange)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500/40 border border-blue-600 inline-block shrink-0" />
            <span>Water Bodies (Blue)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-500/40 border border-purple-600 inline-block shrink-0" />
            <span>Environment (Purple)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-yellow-400 border-2 border-yellow-600 inline-block shrink-0" />
            <span>Selected Parcel (Yellow)</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500 border-dashed inline-block shrink-0" />
            <span>Potential Conflict (Red)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
