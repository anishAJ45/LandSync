import React from 'react';
import { Layers, Check, Info } from 'lucide-react';

export interface ActiveGISLayers {
  landParcels: boolean;
  approvedLayout: boolean;
  agriculturalLand: boolean;
  governmentLand: boolean;
  waterBodies: boolean;
  environmentalZones: boolean; // Prone / Restricted Zones
  roadsInfrastructure: boolean;
}

export const DEFAULT_ACTIVE_LAYERS: ActiveGISLayers = {
  landParcels: true,
  approvedLayout: true,
  agriculturalLand: true,
  governmentLand: true,
  waterBodies: true,
  environmentalZones: true,
  roadsInfrastructure: true
};

interface LayerControlsProps {
  layers: ActiveGISLayers;
  onToggleLayer: (key: keyof ActiveGISLayers) => void;
  opacity: number;
  onChangeOpacity: (val: number) => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  layers,
  onToggleLayer,
  opacity,
  onChangeOpacity
}) => {
  const layerConfigs: {
    key: keyof ActiveGISLayers;
    label: string;
    icon: string;
    badgeColor: string;
    description: string;
    disclaimerNotice: string;
  }[] = [
    {
      key: 'landParcels',
      label: 'Selected Parcel & Boundaries',
      icon: '🟡',
      badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
      description: 'Primary Cadastral Survey Land Parcel Boundaries & Selected Highlight.',
      disclaimerNotice: 'Official land records required for legal verification'
    },
    {
      key: 'approvedLayout',
      label: 'Approved Construction Zone',
      icon: '🟢',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      description: 'DTCP / LPA Approved Residential & Commercial Layout Zones.',
      disclaimerNotice: 'Sanctioned DTCP Master Plan Layer'
    },
    {
      key: 'agriculturalLand',
      label: 'Agricultural Land',
      icon: '🌾',
      badgeColor: 'bg-lime-100 text-lime-900 border-lime-300',
      description: 'Zoned Agricultural Preserves & Coconut Cultivation Belts.',
      disclaimerNotice: 'Zoned Agricultural Preserve'
    },
    {
      key: 'governmentLand',
      label: 'Government / Poramboke Land',
      icon: '🏛️',
      badgeColor: 'bg-orange-100 text-orange-950 border-orange-300',
      description: 'Revenue Poramboke Land & Government Statutory Reserve Buffers.',
      disclaimerNotice: 'State Revenue Department Statutory Reserve'
    },
    {
      key: 'waterBodies',
      label: 'Water Bodies & Streams',
      icon: '🌊',
      badgeColor: 'bg-sky-100 text-sky-950 border-sky-300',
      description: 'Aliyar Irrigation Stream Corridor & Mahalingapuram Storage Pond.',
      disclaimerNotice: '50m PWD Statutory Water Protection Buffer'
    },
    {
      key: 'environmentalZones',
      label: 'Prone / Restricted Zones',
      icon: '⚠️',
      badgeColor: 'bg-purple-100 text-purple-950 border-purple-300',
      description: 'Eco-Sensitive Buffers & Flood / Environmental Restricted Zones.',
      disclaimerNotice: 'Protected Eco-Sensitive Zone'
    },
    {
      key: 'roadsInfrastructure',
      label: 'Roads & Infrastructure',
      icon: '🛣️',
      badgeColor: 'bg-slate-200 text-slate-900 border-slate-300',
      description: 'Mahalingapuram Main Road & Access Street Corridors.',
      disclaimerNotice: 'Access Street Corridor Layer'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Land Parcel GIS Layers
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold">8 Focused GIS Intelligence Layers</p>
          </div>
        </div>
      </div>

      {/* Layer Toggle Switches */}
      <div className="space-y-2">
        {layerConfigs.map((cfg) => {
          const isActive = layers[cfg.key];
          return (
            <div
              key={cfg.key}
              onClick={() => onToggleLayer(cfg.key)}
              className={`p-2.5 rounded-xl border cursor-pointer transition select-none ${
                isActive
                  ? 'bg-slate-50 border-slate-300 shadow-2xs'
                  : 'bg-white border-slate-100 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{cfg.icon}</span>
                  <span className="text-xs font-extrabold text-slate-900">{cfg.label}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                    isActive
                      ? 'bg-blue-950 border-blue-950 text-teal-300'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <p className="text-[10px] text-slate-500 mt-1 leading-snug font-medium pl-6">
                {cfg.description}
              </p>

              <div className="mt-1.5 pl-6 flex items-center gap-1 text-[9px] text-slate-400 font-semibold italic">
                <Info className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                <span>{cfg.disclaimerNotice}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Layer Opacity Slider */}
      <div className="pt-2 border-t border-slate-100 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">
            GIS Overlay Opacity
          </span>
          <span className="font-mono font-bold text-blue-950 text-xs">
            {Math.round(opacity * 100)}%
          </span>
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

      {/* Footer Disclaimer */}
      <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-[9px] text-slate-500 font-semibold leading-relaxed text-center">
        Based on available GIS and reference datasets. Official verification may be required.
      </div>
    </div>
  );
};
