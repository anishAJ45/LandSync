import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  Popup,
  Tooltip,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  DistrictGISData,
  LandParcel,
  POLLACHI_TALUK_GIS
} from '../../data/gisData';
import { ActiveGISLayers, DEFAULT_ACTIVE_LAYERS } from './LayerControls';
import { Maximize2, Minimize2, MapPin, Compass, Layers, Home, Eye, ShieldCheck } from 'lucide-react';

// Selected Parcel Yellow Marker Icon
const selectedMarkerIcon = new L.DivIcon({
  className: 'custom-selected-marker',
  html: `<div style="background-color: #eab308; border: 3px solid #713f12; width: 22px; height: 22px; border-radius: 50%; box-shadow: 0 0 14px rgba(234, 179, 8, 0.95); display: flex; items-center; justify-center;"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

// Base Map Options Configuration featuring Google HD High-Res Satellite Imagery (Zoom up to 20)
const BASE_MAP_OPTIONS = {
  hd_satellite: {
    id: 'hd_satellite',
    name: 'HD Satellite (Google)',
    icon: '🛰️',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: 'Imagery &copy; Google Maps &mdash; High-Resolution Aerial & Building View',
    maxZoom: 20,
    maxNativeZoom: 20
  },
  hd_hybrid: {
    id: 'hd_hybrid',
    name: 'HD Hybrid (Google)',
    icon: '🌍',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: 'Imagery &copy; Google Maps &mdash; HD Satellite + Street Overlay',
    maxZoom: 20,
    maxNativeZoom: 20
  },
  street: {
    id: 'street',
    name: 'Street Map',
    icon: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | LandSync DPI',
    maxZoom: 20,
    maxNativeZoom: 19
  },
  esri_satellite: {
    id: 'esri_satellite',
    name: 'Esri Satellite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Imagery',
    maxZoom: 20,
    maxNativeZoom: 17
  }
};

interface MapControllerProps {
  selectedParcel: LandParcel | null;
  gisData: DistrictGISData;
}

// MapController component to fly to property scale
const MapController: React.FC<MapControllerProps> = ({ selectedParcel, gisData }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedParcel) {
      const coords = selectedParcel.boundaryCoordinates || selectedParcel.coordinates;
      if (coords && coords.length > 0) {
        try {
          const bounds = L.latLngBounds(coords.map(([lat, lng]) => [lat, lng]));
          map.flyToBounds(bounds, { maxZoom: 18.5, padding: [85, 85], animate: true, duration: 1.2 });
        } catch (err) {
          console.error('Error auto-centering map bounds:', err);
        }
      }
    } else if (gisData.centerCoordinates) {
      map.setView(gisData.centerCoordinates, gisData.defaultZoom, { animate: true });
    }
  }, [selectedParcel, gisData, map]);

  return null;
};

interface GISMapProps {
  gisData?: DistrictGISData;
  activeLayers?: ActiveGISLayers;
  layerOpacity?: number;
  selectedParcelId?: string | null;
  onSelectParcel?: (parcelId: string) => void;
  fullScreenContainerId?: string;
}

export const GISMap: React.FC<GISMapProps> = ({
  gisData = POLLACHI_TALUK_GIS,
  activeLayers = DEFAULT_ACTIVE_LAYERS,
  layerOpacity = 0.85,
  selectedParcelId = 'TN-CBE-001-124-2',
  onSelectParcel,
  fullScreenContainerId = 'gis-map-dashboard-container'
}) => {
  const [baseMapMode, setBaseMapMode] = useState<keyof typeof BASE_MAP_OPTIONS>('hd_satellite');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Find active selected land parcel
  const selectedParcel = React.useMemo(() => {
    if (!selectedParcelId) return null;
    const cleanId = selectedParcelId.trim().toUpperCase();
    const cleanNoSpace = cleanId.replace(/\s+/g, '');
    return (
      gisData.parcels.find(
        (p) =>
          p.ulpin.toUpperCase() === cleanId ||
          p.id.toUpperCase() === cleanId ||
          (p.regNumber && p.regNumber.toUpperCase() === cleanId) ||
          (p.fullSurveyNo && p.fullSurveyNo.toUpperCase() === cleanId) ||
          p.surveyNumber.toUpperCase() === cleanId ||
          p.surveyNumber.toUpperCase().replace(/\s+/g, '') === cleanNoSpace
      ) || gisData.parcels[1] // Default to 124/2 House Plot
    );
  }, [selectedParcelId, gisData]);

  // Toggle Full Screen Mode
  const toggleFullScreen = () => {
    const container = document.getElementById(fullScreenContainerId);
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const activeBaseMap = BASE_MAP_OPTIONS[baseMapMode];
  const isSatelliteActive = baseMapMode !== 'street';

  return (
    <div className="relative w-full h-full min-h-[580px] rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-900">
      {/* Top Map Control Bar: Base Map Switcher & Full Screen */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        {/* Base Map Switcher Buttons */}
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200 flex items-center gap-1">
          <button
            onClick={() => setBaseMapMode('hd_satellite')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              baseMapMode === 'hd_satellite'
                ? 'bg-blue-950 text-teal-300 shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Google HD High-Res Satellite View (Crisp Building Rooftops)"
          >
            <span>🛰️</span>
            <span>HD Satellite</span>
          </button>

          <button
            onClick={() => setBaseMapMode('hd_hybrid')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              baseMapMode === 'hd_hybrid'
                ? 'bg-blue-950 text-teal-300 shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Google HD Satellite + Street Overlay"
          >
            <span>🌍</span>
            <span>HD Hybrid</span>
          </button>

          <button
            onClick={() => setBaseMapMode('street')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              baseMapMode === 'street'
                ? 'bg-blue-950 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="OpenStreetMap Street View"
          >
            <span>🗺️</span>
            <span>Street</span>
          </button>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullScreen}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 rounded-xl shadow-md border border-slate-200 text-xs font-bold transition"
          title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-blue-900" /> : <Maximize2 className="w-4 h-4 text-blue-900" />}
          <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
        </button>
      </div>

      {/* Leaflet Map React Instance */}
      <MapContainer
        center={gisData.centerCoordinates}
        zoom={gisData.defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ width: '100%', height: '100%', minHeight: '580px' }}
      >
        {/* Dynamic Map Controller for flyToBounds & map state */}
        <MapController selectedParcel={selectedParcel} gisData={gisData} />

        {/* Layer 1: Base Map Tile Layer */}
        <TileLayer
          key={activeBaseMap.id}
          attribution={activeBaseMap.attribution}
          url={activeBaseMap.url}
          maxZoom={20}
          maxNativeZoom={activeBaseMap.maxNativeZoom}
        />

        {/* Layer 2: Approved Layout / Construction Zone (Transparent Green 🟢 #10b981) */}
        {activeLayers.approvedLayout &&
          gisData.approvedLayoutZones.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: '#10b981',
                weight: 2,
                fillColor: '#10b981',
                fillOpacity: 0.20 * layerOpacity
              }}
            >
              <Tooltip sticky>
                <div className="font-sans text-xs p-1">
                  <div className="font-bold text-emerald-950">🟢 {zone.name}</div>
                  <div className="text-[10px] text-slate-600 font-semibold">{zone.typeLabel}</div>
                </div>
              </Tooltip>
            </Polygon>
          ))}

        {/* Layer 3: Agricultural Land (Light Transparent Green 🌾 #84cc16) */}
        {activeLayers.agriculturalLand &&
          gisData.agriculturalZones.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: '#84cc16',
                weight: 1.5,
                fillColor: '#84cc16',
                fillOpacity: 0.18 * layerOpacity
              }}
            >
              <Tooltip sticky>
                <div className="font-sans text-xs p-1">
                  <div className="font-bold text-lime-950">🌾 {zone.name}</div>
                  <div className="text-[10px] text-slate-600 font-semibold">{zone.typeLabel}</div>
                </div>
              </Tooltip>
            </Polygon>
          ))}

        {/* Layer 4: Government / Poramboke Land (Orange 🏛️ #f97316) */}
        {activeLayers.governmentLand &&
          gisData.governmentZones.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: '#f97316',
                weight: 2,
                dashArray: '5, 5',
                fillColor: '#f97316',
                fillOpacity: 0.22 * layerOpacity
              }}
            >
              <Tooltip sticky>
                <div className="font-sans text-xs p-1">
                  <div className="font-bold text-orange-950">🏛️ {zone.name}</div>
                  <div className="text-[10px] text-slate-600 font-semibold">{zone.typeLabel}</div>
                </div>
              </Tooltip>
            </Polygon>
          ))}

        {/* Layer 5: Prone / Restricted Zones (Red/Purple ⚠️ #ef4444 / #a855f7) */}
        {activeLayers.environmentalZones &&
          gisData.environmentalZones.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: zone.color || '#a855f7',
                weight: 2,
                dashArray: '4, 4',
                fillColor: zone.color || '#a855f7',
                fillOpacity: 0.22 * layerOpacity
              }}
            >
              <Tooltip sticky>
                <div className="font-sans text-xs p-1">
                  <div className="font-bold text-purple-950">⚠️ {zone.name}</div>
                  <div className="text-[10px] text-slate-600 font-semibold">{zone.typeLabel}</div>
                </div>
              </Tooltip>
            </Polygon>
          ))}

        {/* Layer 6: Water Bodies (Blue 🌊 #0284c7) */}
        {activeLayers.waterBodies &&
          gisData.waterBodies.map((wb) => {
            if (wb.geometryType === 'polyline') {
              return (
                <Polyline
                  key={wb.id}
                  positions={wb.coordinates as [number, number][]}
                  pathOptions={{
                    color: '#0284c7',
                    weight: 5,
                    opacity: 0.9 * layerOpacity
                  }}
                >
                  <Tooltip sticky>
                    <div className="font-sans text-xs font-bold text-blue-900">
                      🌊 {wb.name} (50m PWD Buffer)
                    </div>
                  </Tooltip>
                </Polyline>
              );
            } else {
              return (
                <Polygon
                  key={wb.id}
                  positions={wb.coordinates as [number, number][]}
                  pathOptions={{
                    color: '#0284c7',
                    weight: 2,
                    fillColor: '#0284c7',
                    fillOpacity: 0.50 * layerOpacity
                  }}
                >
                  <Tooltip sticky>
                    <div className="font-sans text-xs font-bold text-blue-900">
                      🌊 {wb.name}
                    </div>
                  </Tooltip>
                </Polygon>
              );
            }
          })}

        {/* Layer 7: Roads & Infrastructure (Slate Corridor 🛣️) */}
        {activeLayers.roadsInfrastructure &&
          gisData.infrastructure.map((infra) => (
            <Polyline
              key={infra.id}
              positions={infra.coordinates}
              pathOptions={{
                color: infra.color || '#334155',
                weight: 6, // Thick clear road corridor
                opacity: 0.95 * layerOpacity
              }}
            >
              <Tooltip sticky>
                <div className="font-sans text-xs font-bold text-slate-900">
                  🛣️ {infra.name}
                </div>
              </Tooltip>
            </Polyline>
          ))}

        {/* Layer 8: Land Parcel Boundaries & Selected Land Parcel (Yellow 🟡 #eab308) */}
        {activeLayers.landParcels &&
          gisData.parcels.map((parcel) => {
            const isSelected = selectedParcel && parcel.id === selectedParcel.id;
            const isDiscrepancy = parcel.ulpin === 'TN-CBE-001-124-3';
            const coords = parcel.boundaryCoordinates || parcel.coordinates;

            return (
              <React.Fragment key={`parcel-poly-${parcel.id}`}>
                {/* Reference Survey Parcel Boundary */}
                <Polygon
                  positions={coords}
                  pathOptions={{
                    color: isSelected
                      ? '#eab308' // Glowing Yellow Stroke for Selected Land Parcel
                      : isDiscrepancy
                      ? '#ef4444' // Red warning outline for discrepancy
                      : isSatelliteActive
                      ? '#00f2fe' // Cyan outline over satellite view
                      : '#0f172a', // Dark outline over street map
                    weight: isSelected ? 4.5 : isDiscrepancy ? 2.5 : 2,
                    dashArray: isDiscrepancy && !isSelected ? '4, 4' : undefined,
                    fillColor: isSelected
                      ? '#fef08a' // Yellow fill for selected land
                      : isDiscrepancy
                      ? '#fee2e2'
                      : '#ffffff',
                    fillOpacity: isSelected
                      ? isSatelliteActive
                        ? 0.25 * layerOpacity
                        : 0.60 * layerOpacity
                      : isSatelliteActive
                      ? 0.04 * layerOpacity
                      : 0.25 * layerOpacity
                  }}
                  eventHandlers={{
                    click: () => {
                      if (onSelectParcel) onSelectParcel(parcel.ulpin);
                    }
                  }}
                >
                  <Tooltip sticky permanent={isSelected}>
                    <div className="font-sans text-xs p-1 select-none">
                      <div className="font-extrabold text-blue-950 flex items-center gap-1">
                        <span>Plot {parcel.fullSurveyNo || parcel.surveyNumber}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-800 font-bold">
                        {parcel.area}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">
                        {parcel.propertyType}
                      </div>
                    </div>
                  </Tooltip>
                </Polygon>

                {/* Building Footprint Polygon inside Plot */}
                {parcel.buildingFootprintCoordinates && (
                  <Polygon
                    positions={parcel.buildingFootprintCoordinates}
                    pathOptions={{
                      color: isSelected ? '#713f12' : '#1e3a8a',
                      weight: 2,
                      fillColor: isSelected ? '#ca8a04' : '#3b82f6',
                      fillOpacity: isSelected ? 0.85 * layerOpacity : 0.70 * layerOpacity
                    }}
                    eventHandlers={{
                      click: () => {
                        if (onSelectParcel) onSelectParcel(parcel.ulpin);
                      }
                    }}
                  >
                    <Tooltip sticky>
                      <div className="font-sans text-xs p-1 select-none">
                        <div className="font-bold text-blue-950 flex items-center gap-1">
                          <span>🏠 Physical Building Footprint</span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-medium">
                          {parcel.buildingObservation}
                        </div>
                      </div>
                    </Tooltip>
                  </Polygon>
                )}

                {/* Selected Property Popup */}
                {isSelected && (
                  <Popup position={coords[0]}>
                    <div className="font-sans text-xs p-1 select-none leading-relaxed min-w-[240px]">
                      <div className="font-black text-blue-950 text-xs mb-1 border-b pb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <span>🟡</span>
                          <span>Selected Land Parcel</span>
                        </span>
                        <span className="text-[10px] text-teal-800 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          {parcel.village}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 mt-1">
                        Registration #: <span className="text-blue-950 font-black">{parcel.regNumber || 'REG-2024-CBE-12402'}</span>
                      </div>
                      <div className="font-bold text-slate-900">
                        Survey Number: <span className="text-blue-950 font-black">{parcel.fullSurveyNo || parcel.surveyNumber}</span>
                      </div>
                      <div className="font-bold text-slate-900">
                        ULPIN: <span className="font-mono text-blue-950">{parcel.ulpin}</span>
                      </div>
                      <div className="font-bold text-slate-900">
                        Actual Plot Area: <span className="font-mono text-blue-950">{parcel.area}</span>
                      </div>
                      <div className="font-semibold text-slate-700 mt-0.5">
                        Location: {parcel.streetName}
                      </div>

                      <div className="text-[9px] text-slate-500 italic mt-1.5 border-t pt-1">
                        Based on available GIS and reference datasets. Official verification may be required.
                      </div>
                    </div>
                  </Popup>
                )}
              </React.Fragment>
            );
          })}

        {/* Selected Parcel Center Marker */}
        {selectedParcel && (selectedParcel.boundaryCoordinates || selectedParcel.coordinates).length > 0 && (
          <Marker
            position={(selectedParcel.boundaryCoordinates || selectedParcel.coordinates)[0]}
            icon={selectedMarkerIcon}
          />
        )}
      </MapContainer>

      {/* Map Watermark Banner */}
      <div className="absolute bottom-2 left-3 z-[1000] px-3 py-1 bg-white/90 backdrop-blur-xs rounded-lg text-[10px] text-slate-800 font-extrabold border border-slate-200/80 shadow-2xs pointer-events-none flex items-center gap-1.5">
        <span>🟡 Land Parcel Intelligence Active</span>
        <span className="text-slate-400">|</span>
        <span>8 Focused GIS Layers</span>
        <span className="text-slate-400">|</span>
        <span>Base: {activeBaseMap.name}</span>
      </div>
    </div>
  );
};
