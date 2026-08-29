import React, { useEffect, useState, useRef } from 'react';
import {
  MapContainer as LeafletMap,
  TileLayer,
  GeoJSON,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L, { Layer, LeafletMouseEvent } from 'leaflet';
import { GeoJSONFeatureCollection, GeoJSONFeature, Parcel } from '../../types';
import { Layers, ZoomIn, ZoomOut, Compass, MapPin } from 'lucide-react';
import { SpatialLayerState, DEFAULT_SPATIAL_LAYERS } from './SpatialLayerManager';
import { spatialService } from '../../services/spatialService';

interface GISMapProps {
  geoJsonData: GeoJSONFeatureCollection | null;
  selectedParcelId: string | null;
  hoveredParcelId: string | null;
  onSelectParcel: (parcelId: string) => void;
  onHoverParcel: (parcelId: string | null) => void;
  filteredParcelIds?: Set<string>;
  center?: [number, number];
  zoom?: number;
  showLabels?: boolean;
  spatialLayers?: SpatialLayerState;
  spatialOpacity?: number;
}

// Map Base Layers
const BASE_LAYERS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  carto: {
    name: 'Clean Light (CartoDB)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
  },
  satellite: {
    name: 'Satellite Hybrid (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  }
};

// Component to handle dynamic map bounds/centering
function MapController({
  selectedParcelId,
  geoJsonData,
  defaultCenter,
  defaultZoom
}: {
  selectedParcelId: string | null;
  geoJsonData: GeoJSONFeatureCollection | null;
  defaultCenter: [number, number];
  defaultZoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!geoJsonData || !geoJsonData.features.length) return;

    if (selectedParcelId) {
      const feature = geoJsonData.features.find(
        (f) => f.properties.parcel_id === selectedParcelId
      );
      if (feature && feature.geometry && feature.geometry.coordinates) {
        try {
          const coords = feature.geometry.coordinates[0];
          // Leaflet expects [lat, lng]
          const latLngs = coords.map((c) => [c[1], c[0]] as [number, number]);
          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [80, 80], maxZoom: 17, animate: true });
        } catch (e) {
          console.error('Error fitting bounds:', e);
        }
      }
    } else {
      // Fit to all parcels
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
  center = [11.0270, 77.0360], // Coimbatore Demo Village
  zoom = 16,
  showLabels = true,
  spatialLayers = DEFAULT_SPATIAL_LAYERS,
  spatialOpacity = 0.85
}) => {
  const [activeBaseLayer, setActiveBaseLayer] = useState<'carto' | 'osm' | 'satellite'>('carto');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Vector overlays state
  const [waterbodyLayer, setWaterbodyLayer] = useState<any>(null);
  const [htLineLayer, setHtLineLayer] = useState<any>(null);
  const [satelliteAnomalyLayer, setSatelliteAnomalyLayer] = useState<any>(null);

  // Load vector overlays
  useEffect(() => {
    const loadOverlays = async () => {
      try {
        const [water, ht, sat] = await Promise.all([
          spatialService.getVectorLayerGeoJson('waterbody_buffer').catch(() => null),
          spatialService.getVectorLayerGeoJson('high_tension_line').catch(() => null),
          spatialService.getVectorLayerGeoJson('satellite_anomalies').catch(() => null),
        ]);
        setWaterbodyLayer(water);
        setHtLineLayer(ht);
        setSatelliteAnomalyLayer(sat);
      } catch (err) {
        console.error('Failed to load vector overlays:', err);
      }
    };
    loadOverlays();
  }, []);

  // Polygon styling function
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
    const isMajorMismatch = Math.abs(props.recorded_area - props.gis_area) / props.recorded_area > 0.05;

    // Base color by land use or zoning
    let strokeColor = '#0d9488'; // teal
    let fillColor = '#14b8a6';

    switch (props.land_use?.toLowerCase()) {
      case 'agricultural':
        strokeColor = '#059669'; // emerald
        fillColor = '#10b981';
        break;
      case 'commercial':
        strokeColor = '#2563eb'; // blue
        fillColor = '#3b82f6';
        break;
      case 'government':
        strokeColor = '#7c3aed'; // purple
        fillColor = '#8b5cf6';
        break;
      case 'residential':
      default:
        strokeColor = '#0d9488'; // teal
        fillColor = '#14b8a6';
        break;
    }

    if (isOverlap) {
      strokeColor = '#e11d48'; // rose red
      fillColor = '#f43f5e';
    } else if (isMajorMismatch) {
      strokeColor = '#d97706'; // amber
      fillColor = '#f59e0b';
    }

    if (isSelected) {
      return {
        color: '#1e3a8a', // deep navy
        weight: 3.5,
        opacity: 1,
        fillColor: '#38bdf8',
        fillOpacity: 0.6 * spatialOpacity,
        dashArray: undefined
      };
    }

    if (isHovered) {
      return {
        color: '#0f172a',
        weight: 2.5,
        opacity: 1,
        fillColor: fillColor,
        fillOpacity: 0.55 * spatialOpacity
      };
    }

    if (isFilteredOut) {
      return {
        color: '#cbd5e1',
        weight: 1,
        opacity: 0.4,
        fillColor: '#f1f5f9',
        fillOpacity: 0.15
      };
    }

    const showBoundaries = spatialLayers.cadastralBoundaries;

    return {
      color: showBoundaries ? strokeColor : 'transparent',
      weight: isOverlap ? 2.5 : 1.8,
      opacity: showBoundaries ? 0.9 : 0,
      fillColor: fillColor,
      fillOpacity: (isOverlap ? 0.45 : 0.35) * spatialOpacity,
      dashArray: isOverlap ? '4, 4' : undefined
    };
  };

  const onEachFeature = (feature: any, layer: Layer) => {
    const props = feature.properties;
    const pid = props.parcel_id;

    // Tooltip
    layer.bindTooltip(
      `<div class="font-sans text-xs">
        <div class="font-bold text-blue-950">Survey ${props.survey_number}</div>
        <div class="text-slate-600">${props.owner}</div>
        <div class="text-[10px] text-slate-500 font-mono">${props.recorded_area} ${props.area_unit} | ${props.land_use}</div>
        ${props.status === 'Boundary Discrepancy' ? '<div class="text-[10px] text-rose-600 font-bold mt-0.5">⚠️ Spatial Discrepancy</div>' : ''}
      </div>`,
      {
        sticky: true,
        direction: 'top',
        className: 'custom-leaflet-tooltip'
      }
    );

    layer.on({
      click: () => {
        onSelectParcel(pid);
      },
      mouseover: () => {
        onHoverParcel(pid);
      },
      mouseout: () => {
        onHoverParcel(null);
      }
    });
  };

  return (
    <div id="gis-map-wrapper" className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-100">
      {/* Baselayer & Control Bar */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        <div className="relative">
          <button
            id="baselayer-toggle-btn"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 rounded-xl shadow-md border border-slate-200 text-xs font-bold transition"
          >
            <Layers className="w-4 h-4 text-blue-900" />
            <span>{BASE_LAYERS[activeBaseLayer].name.split(' ')[0]}</span>
          </button>

          {showLayerMenu && (
            <div
              id="baselayer-menu-dropdown"
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-xs space-y-1"
            >
              <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">
                Base Imagery Layer
              </div>
              {(Object.keys(BASE_LAYERS) as Array<keyof typeof BASE_LAYERS>).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setActiveBaseLayer(k);
                    setShowLayerMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                    activeBaseLayer === k
                      ? 'bg-blue-950 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
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

      {/* Leaflet Map instance */}
      <LeafletMap
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution={BASE_LAYERS[activeBaseLayer].attribution}
          url={BASE_LAYERS[activeBaseLayer].url}
          maxZoom={BASE_LAYERS[activeBaseLayer].maxZoom}
        />

        {/* Base Cadastral GeoJSON Layer */}
        {geoJsonData && (
          <GeoJSON
            key={`geojson-${activeBaseLayer}-${selectedParcelId}-${hoveredParcelId}-${spatialOpacity}-${spatialLayers.cadastralBoundaries}`}
            data={geoJsonData as any}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Statutory Restriction Zone: 50m Waterbody Buffer Vector Overlay */}
        {spatialLayers.waterbodyBuffer50m && waterbodyLayer && (
          <GeoJSON
            key={`waterbody-buffer-${spatialOpacity}`}
            data={waterbodyLayer}
            style={() => ({
              color: '#0284c7', // sky blue
              weight: 2,
              dashArray: '6, 6',
              fillColor: '#38bdf8',
              fillOpacity: 0.35 * spatialOpacity,
            })}
            onEachFeature={(feat, layer) => {
              layer.bindTooltip(
                `<div class="font-sans text-xs font-bold text-cyan-900">
                  🌊 PWD 50m Waterbody Protection Buffer
                  <div class="text-[10px] font-normal text-slate-600">TN Protection of Tanks Act 2007</div>
                </div>`,
                { sticky: true }
              );
            }}
          />
        )}

        {/* High Tension Corridor Vector Overlay */}
        {spatialLayers.highTensionCorridor15m && htLineLayer && (
          <GeoJSON
            key={`ht-line-${spatialOpacity}`}
            data={htLineLayer}
            style={() => ({
              color: '#f59e0b', // amber
              weight: 3.5,
              dashArray: '4, 8',
              fillColor: '#fef3c7',
              fillOpacity: 0.25 * spatialOpacity,
            })}
            onEachFeature={(feat, layer) => {
              layer.bindTooltip(
                `<div class="font-sans text-xs font-bold text-amber-900">
                  ⚡ TANGEDCO 110kV HT Transmission Line
                  <div class="text-[10px] font-normal text-slate-600">15m Corridor Clear RoW Required</div>
                </div>`,
                { sticky: true }
              );
            }}
          />
        )}

        {/* AI Satellite Change Detection Vector Overlay */}
        {spatialLayers.satelliteChangeAnomalies && satelliteAnomalyLayer && (
          <GeoJSON
            key={`sat-anomalies-${spatialOpacity}`}
            data={satelliteAnomalyLayer}
            style={() => ({
              color: '#e11d48', // rose red
              weight: 2.5,
              dashArray: '3, 3',
              fillColor: '#f43f5e',
              fillOpacity: 0.5 * spatialOpacity,
            })}
            onEachFeature={(feat, layer) => {
              layer.bindTooltip(
                `<div class="font-sans text-xs font-bold text-rose-900">
                  🛰️ AI Satellite Change Anomaly Flag
                  <div class="text-[10px] font-normal text-slate-700">Unapproved Physical Construction Detected</div>
                </div>`,
                { sticky: true }
              );
            }}
          />
        )}

        <MapController
          selectedParcelId={selectedParcelId}
          geoJsonData={geoJsonData}
          defaultCenter={[center[0], center[1]]}
          defaultZoom={zoom}
        />
      </LeafletMap>

      {/* Map Banner watermark */}
      <div className="absolute bottom-2 left-3 z-[1000] px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-lg text-[10px] text-slate-600 font-medium border border-slate-200/80 shadow-2xs pointer-events-none">
        Village: Demo Village (001) | Sulur, Coimbatore | Master Plan 2035 & GIS Overlays Active
      </div>
    </div>
  );
};
