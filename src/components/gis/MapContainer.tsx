import React, { useEffect, useState } from 'react';
import {
  MapContainer as LeafletMap,
  TileLayer,
  GeoJSON,
  useMap,
  Popup,
  Polygon
} from 'react-leaflet';
import L, { Layer } from 'leaflet';
import { GeoJSONFeatureCollection } from '../../types';
import { Layers } from 'lucide-react';
import { SpatialLayerState, DEFAULT_SPATIAL_LAYERS } from './SpatialLayerManager';
import { COIMBATORE_DISTRICT_GIS } from '../../data/gisData';

interface GISMapProps {
  geoJsonData?: GeoJSONFeatureCollection | null;
  selectedParcelId?: string | null;
  hoveredParcelId?: string | null;
  onSelectParcel?: (parcelId: string) => void;
  onHoverParcel?: (parcelId: string | null) => void;
  filteredParcelIds?: Set<string>;
  center?: [number, number];
  zoom?: number;
  showLabels?: boolean;
  spatialLayers?: SpatialLayerState;
  spatialOpacity?: number;
}

// Map Base Layers using Google HD High-Res Satellite Imagery (Zoom up to 20)
const BASE_LAYERS = {
  hd_satellite: {
    name: 'HD Satellite (Google)',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: 'Imagery &copy; Google Maps &mdash; High-Resolution Aerial & Building View',
    maxZoom: 20,
    maxNativeZoom: 20
  },
  hd_hybrid: {
    name: 'HD Hybrid (Google)',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: 'Imagery &copy; Google Maps &mdash; HD Satellite + Street Overlay',
    maxZoom: 20,
    maxNativeZoom: 20
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
    maxNativeZoom: 19
  },
  carto: {
    name: 'Clean Light (CartoDB)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
    maxNativeZoom: 19
  }
};

function MapController({
  selectedParcelId,
  geoJsonData,
  defaultCenter,
  defaultZoom
}: {
  selectedParcelId: string | null;
  geoJsonData: GeoJSONFeatureCollection | null | undefined;
  defaultCenter: [number, number];
  defaultZoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!geoJsonData || !geoJsonData.features || !geoJsonData.features.length) {
      map.setView(defaultCenter, defaultZoom);
      return;
    }

    if (selectedParcelId) {
      const feature = geoJsonData.features.find(
        (f) => f.properties.parcel_id === selectedParcelId
      );
      if (feature && feature.geometry && feature.geometry.coordinates) {
        try {
          const coords = feature.geometry.coordinates[0];
          const latLngs = coords.map((c) => [c[1], c[0]] as [number, number]);
          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [80, 80], maxZoom: 19, animate: true });
        } catch (e) {
          console.error('Error fitting bounds:', e);
        }
      }
    } else {
      try {
        const allLatLngs: [number, number][] = [];
        geoJsonData.features.forEach((f) => {
          if (f.geometry && f.geometry.coordinates) {
            f.geometry.coordinates[0].forEach((c) => {
              allLatLngs.push([c[1], c[0]]);
            });
          }
        });
        if (allLatLngs.length > 0) {
          const allBounds = L.latLngBounds(allLatLngs);
          map.fitBounds(allBounds, { padding: [50, 50], animate: true });
        }
      } catch (e) {
        map.setView(defaultCenter, defaultZoom);
      }
    }
  }, [selectedParcelId, geoJsonData, map, defaultCenter, defaultZoom]);

  return null;
}

export const MapContainer: React.FC<GISMapProps> = ({
  geoJsonData,
  selectedParcelId,
  hoveredParcelId,
  onSelectParcel,
  onHoverParcel,
  filteredParcelIds,
  center = [10.6641, 77.0088],
  zoom = 18,
  spatialLayers = DEFAULT_SPATIAL_LAYERS,
  spatialOpacity = 0.85
}) => {
  const [activeBaseLayer, setActiveBaseLayer] = useState<keyof typeof BASE_LAYERS>('hd_satellite');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const selectedParcel = React.useMemo(() => {
    if (!selectedParcelId || !geoJsonData || !geoJsonData.features) return null;
    const feat = geoJsonData.features.find((f: any) => f.properties.parcel_id === selectedParcelId);
    return feat ? feat.properties : null;
  }, [selectedParcelId, geoJsonData]);

  const popupPosition = React.useMemo(() => {
    if (!selectedParcelId || !geoJsonData || !geoJsonData.features) return null;
    const feat = geoJsonData.features.find((f: any) => f.properties.parcel_id === selectedParcelId);
    if (!feat || !feat.geometry || !feat.geometry.coordinates) return null;
    try {
      const coords = feat.geometry.coordinates[0];
      let latSum = 0;
      let lngSum = 0;
      coords.forEach((c: any) => {
        lngSum += c[0];
        latSum += c[1];
      });
      return [latSum / coords.length, lngSum / coords.length] as [number, number];
    } catch (e) {
      return null;
    }
  }, [selectedParcelId, geoJsonData]);

  const isSatelliteMode = activeBaseLayer === 'hd_satellite' || activeBaseLayer === 'hd_hybrid';

  // Style function for Cadastral GeoJSON with Yellow Highlight for selected parcel
  const styleFeature = (feature: any) => {
    if (!feature || !feature.properties) return {};

    const props = feature.properties;
    const pid = props.parcel_id;
    const isSelected = pid === selectedParcelId;
    const isHovered = pid === hoveredParcelId;
    const isFilteredOut = filteredParcelIds && !filteredParcelIds.has(pid);

    const isOverlap =
      props.status === 'Boundary Discrepancy' ||
      pid === 'TN-CBE-001-124-3' ||
      pid === 'TN-CBE-001-125-1';

    let strokeColor = isSatelliteMode ? '#00f2fe' : '#0f172a';
    let fillColor = '#ffffff';
    let fillOpacity = isSatelliteMode ? 0.05 * spatialOpacity : 0.35 * spatialOpacity;
    let weight = 1.5;

    if (isOverlap) {
      strokeColor = '#ef4444';
      fillColor = '#fee2e2';
      fillOpacity = 0.5 * spatialOpacity;
      weight = 2;
    }

    if (isSelected) {
      strokeColor = '#eab308'; // Bright Yellow highlight
      fillColor = '#fef08a';
      fillOpacity = isSatelliteMode ? 0.25 * spatialOpacity : 0.65 * spatialOpacity;
      weight = 4;
    } else if (isHovered) {
      fillOpacity = isSatelliteMode ? 0.15 * spatialOpacity : 0.55 * spatialOpacity;
      weight = weight + 1;
    }

    if (isFilteredOut) {
      return {
        color: '#e2e8f0',
        weight: 1,
        opacity: 0.3,
        fillColor: '#f8fafc',
        fillOpacity: 0.1
      };
    }

    return {
      color: strokeColor,
      weight: weight,
      opacity: 0.9,
      fillColor: fillColor,
      fillOpacity: fillOpacity,
      dashArray: isOverlap && !isSelected ? '4, 4' : undefined
    };
  };

  const onEachFeature = (feature: any, layer: Layer) => {
    const props = feature.properties;
    const pid = props.parcel_id;

    layer.bindTooltip(
      `<div class="font-sans text-xs p-1">
        <div class="font-bold text-blue-950">Survey No: ${props.survey_number}</div>
        <div class="text-slate-600 font-semibold mt-0.5">Owner: ${props.owner || props.current_owner || 'N/A'}</div>
        <div class="text-[10px] text-slate-500 font-semibold mt-0.5">Area: ${props.recorded_area} ${props.area_unit || 'Acres'}</div>
      </div>`,
      { sticky: true, direction: 'top' }
    );

    layer.on({
      click: () => {
        if (onSelectParcel) onSelectParcel(pid);
      },
      mouseover: () => {
        if (onHoverParcel) onHoverParcel(pid);
      },
      mouseout: () => {
        if (onHoverParcel) onHoverParcel(null);
      }
    });
  };

  const activeLayerConfig = BASE_LAYERS[activeBaseLayer];

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-900">
      {/* Base Layer Switcher */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 rounded-xl shadow-md border border-slate-200 text-xs font-bold transition"
          >
            <Layers className="w-4 h-4 text-blue-900" />
            <span>{activeLayerConfig.name.split(' ')[0]}</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-xs space-y-1 z-[1100]">
              <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">Base Map</div>
              {(Object.keys(BASE_LAYERS) as Array<keyof typeof BASE_LAYERS>).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setActiveBaseLayer(k);
                    setShowLayerMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                    activeBaseLayer === k ? 'bg-blue-950 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{BASE_LAYERS[k].name}</span>
                  {activeBaseLayer === k && <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <LeafletMap
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ width: '100%', height: '100%', minHeight: '480px' }}
      >
        <TileLayer
          key={activeBaseLayer}
          attribution={activeLayerConfig.attribution}
          url={activeLayerConfig.url}
          maxZoom={20}
          maxNativeZoom={activeLayerConfig.maxNativeZoom}
        />

        {geoJsonData && (
          <GeoJSON
            key={`geojson-${activeBaseLayer}-${selectedParcelId}-${hoveredParcelId}-${spatialOpacity}`}
            data={geoJsonData as any}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Prototype Agricultural Overlay */}
        {spatialLayers.cadastralBoundaries &&
          COIMBATORE_DISTRICT_GIS.agriculturalZones.map((z) => (
            <Polygon
              key={z.id}
              positions={z.coordinates}
              pathOptions={{
                color: z.color,
                weight: 1.5,
                fillColor: z.color,
                fillOpacity: z.fillOpacity * spatialOpacity
              }}
            />
          ))}

        {popupPosition && selectedParcel && (
          <Popup position={popupPosition} closeButton={false}>
            <div className="font-sans text-xs p-1 select-none leading-relaxed min-w-[180px]">
              <div className="font-black text-blue-950 text-xs mb-1">Selected Parcel</div>
              <div className="font-bold text-slate-900">
                ULPIN: <span className="font-mono text-blue-950">{selectedParcel.parcel_id}</span>
              </div>
              <div className="font-semibold text-slate-700">Survey No: {selectedParcel.survey_number}</div>
              <div className="font-semibold text-slate-700">Area: {selectedParcel.recorded_area} {selectedParcel.area_unit || 'Acres'}</div>
            </div>
          </Popup>
        )}

        <MapController
          selectedParcelId={selectedParcelId || null}
          geoJsonData={geoJsonData}
          defaultCenter={center ? [center[0], center[1]] : [10.6641, 77.0088]}
          defaultZoom={zoom}
        />
      </LeafletMap>
    </div>
  );
};
