import React from 'react';
import { Layers, Check, Info } from 'lucide-react';

export interface ActiveGISLayers {
  landParcels: boolean;
  agriculturalLand: boolean;
  approvedLayout: boolean;
  governmentLand: boolean;
  rivers: boolean;
  streams: boolean;
  ponds: boolean;
  lakes: boolean;
  environmentalZones: boolean; // Environmental / Prone Zones
  roadsInfrastructure: boolean; // Roads and Infrastructure
}

export const DEFAULT_ACTIVE_LAYERS: ActiveGISLayers = {
  landParcels: true,
  agriculturalLand: true,
  approvedLayout: true,
  governmentLand: true,
  rivers: true,
  streams: true,
  ponds: true,
  lakes: true,
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
    description: string;
  }[] = [
    {
      key: 'landParcels',
      label: '1. Parcel Boundaries',
      icon: '🟡',
      description: 'Cadastral Survey Land Parcel Boundaries & Selected Highlight.'
    },
    {
      key: 'agriculturalLand',
      label: '2. Agricultural Land',
      icon: '🌾',
      description: 'Zoned Agricultural Preserves & Coconut Cultivation Belts.'
    },
    {
      key: 'approvedLayout',
      label: '3. Approved Layout / Development Area',
      icon: '🟢',
      description: 'DTCP / LPA Approved Residential & Commercial Layout Zones.'
    },
    {
      key: 'governmentLand',
      label: '4. Government / Poramboke Land',
      icon: '🏛️',
      description: 'Revenue Poramboke Land & Government Statutory Reserve Buffers.'
    },
    {
      key: 'rivers',
      label: '5. Rivers',
      icon: '🏞️',
      description: 'Major River Corridors & Main Statutory Protection Belts.'
    },
    {
      key: 'streams',
      label: '6. Streams',
      icon: '🌊',
      description: 'Aliyar Irrigation Canal & Tributary Stream Network.'
    },
    {
      key: 'ponds',
      label: '7. Ponds',
      icon: '💧',
      description: 'Mahalingapuram Local Storage Ponds & Catchments.'
    },
    {
      key: 'lakes',
      label: '8. Lakes',
      icon: '⛵',
      description: 'Regional Water Storage Lakes & Reservoirs.'
    },
    {
      key: 'environmentalZones',
      label: '9. Environmental / Prone Zones',
      icon: '⚠️',
      description: 'Eco-Sensitive Buffers & Hazard / Restricted Zones.'
    },
    {
      key: 'roadsInfrastructure',
      label: '10. Roads and Infrastructure',
      icon: '🛣️',
      description: 'Mahalingapuram Main Road & Access Street Corridors.'
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
              GIS Intelligence Layers
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold">10 Independent Toggleable Layers</p>
          </div>
        </div>
      </div>

      {/* 10 Independent Layer Toggle Switches */}
      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {layerConfigs.map((cfg) => {
          const isActive = layers[cfg.key];
          return (
            <div
              key={cfg.key}
              onClick={() => onToggleLayer(cfg.key)}
              className={`p-2 rounded-xl border cursor-pointer transition select-none ${
                isActive
                  ? 'bg-slate-50 border-slate-300 shadow-2xs'
                  : 'bg-white border-slate-100 opacity-50 hover:opacity-90'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs">{cfg.icon}</span>
                  <span className="text-xs font-extrabold text-slate-900">{cfg.label}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                    isActive
                      ? 'bg-blue-950 border-blue-950 text-teal-300'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <p className="text-[9px] text-slate-500 mt-0.5 leading-snug font-medium pl-6">
                {cfg.description}
              </p>
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
      <div className="p-2 bg-slate-100 rounded-xl border border-slate-200 text-[9px] text-slate-500 font-semibold leading-relaxed text-center">
        GIS analysis is based on available reference and spatial datasets. Official verification may be required.
      </div>
    </div>
  );
};
