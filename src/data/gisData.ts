// LandSync GIS Data Engine - Pollachi Property & House Scale Dataset
// Primary GIS Prototype Dataset for Pollachi Land Intelligence GIS Dashboard

import { POLLACHI_TALUK_BOUNDARY, BoundaryFeature } from './gis/pollachiBoundary';
import { POLLACHI_WATER_BODIES, WaterBodyFeature } from './gis/pollachiWaterBodies';
import { POLLACHI_WARDS, WardFeature } from './gis/pollachiWards';
import { POLLACHI_TOWNSHIP, TownshipFeature } from './gis/pollachiTownship';
import { POLLACHI_AGRICULTURE_ZONES, AgriZoneFeature } from './gis/pollachiAgriculture';
import { POLLACHI_GOVERNMENT_ZONES, GovtZoneFeature } from './gis/pollachiGovernmentLand';
import { POLLACHI_APPROVED_LAYOUTS, ApprovedLayoutFeature } from './gis/pollachiApprovedLayouts';
import { POLLACHI_PARCELS, LandParcel } from './gis/pollachiParcels';

export type { LandParcel, BoundaryFeature, WaterBodyFeature, WardFeature, TownshipFeature, AgriZoneFeature, GovtZoneFeature, ApprovedLayoutFeature };

export interface GISZone {
  id: string;
  name: string;
  category: 'agricultural' | 'approved_layout' | 'government' | 'environmental';
  typeLabel: string;
  description: string;
  coordinates: [number, number][]; // [latitude, longitude]
  color: string;
  fillOpacity: number;
  disclaimerNotice?: string;
}

export interface RoadInfrastructureFeature {
  id: string;
  name: string;
  type: 'highway' | 'arterial' | 'village_road' | 'railway';
  coordinates: [number, number][];
  color: string;
  disclaimerNotice?: string;
}

export interface DistrictGISData {
  districtName: string;
  talukName: string;
  stateCode: string;
  centerCoordinates: [number, number];
  defaultZoom: number;
  parcels: LandParcel[];
  agriculturalZones: GISZone[];
  approvedLayoutZones: GISZone[];
  governmentZones: GISZone[];
  environmentalZones: GISZone[];
  waterBodies: WaterBodyFeature[];
  infrastructure: RoadInfrastructureFeature[];
  boundary?: BoundaryFeature;
  wards?: WardFeature[];
  township?: TownshipFeature[];
}

// Environmental Protection Zones (Aliyar & Anamalai Reserve Buffer)
export const POLLACHI_ENVIRONMENTAL_ZONES: GISZone[] = [
  {
    id: 'ECO-POLLACHI-1',
    name: 'Anamalai Foothills Eco-Sensitive Reserve Zone',
    category: 'environmental',
    typeLabel: 'MoEFCC Protected Tiger Reserve Buffer',
    description: 'Statutory ecological buffer under Western Ghats Bio-Conservation Regulations.',
    color: '#a855f7', // Purple
    fillOpacity: 0.08,
    disclaimerNotice: 'Reference dataset pending authoritative GIS digitization',
    coordinates: [
      [10.5850, 76.9500],
      [10.6050, 76.9550],
      [10.6000, 76.9750],
      [10.5800, 76.9700],
      [10.5850, 76.9500]
    ]
  }
];

// Road Infrastructure - Mahalingapuram Main Road Corridor
export const POLLACHI_INFRASTRUCTURE: RoadInfrastructureFeature[] = [
  {
    id: 'INFRA-POL-MAHALINGAPURAM-ROAD',
    name: 'Mahalingapuram Main Road (Pollachi Town Core Street)',
    type: 'arterial',
    color: '#334155',
    disclaimerNotice: 'Property Access Street Corridor',
    coordinates: [
      [10.66415, 77.00700],
      [10.66410, 77.00800],
      [10.66405, 77.00900],
      [10.66400, 77.01000],
      [10.66395, 77.01100]
    ]
  }
];

// Primary Pollachi Taluk Property-Level GIS Dataset
export const POLLACHI_TALUK_GIS: DistrictGISData = {
  districtName: 'Coimbatore',
  talukName: 'Pollachi',
  stateCode: 'TN',
  centerCoordinates: [10.6641, 77.0088], // Mahalingapuram Main Road Property Clustered Center
  defaultZoom: 18, // Property / Neighbourhood Deep Zoom
  
  parcels: POLLACHI_PARCELS,
  agriculturalZones: POLLACHI_AGRICULTURE_ZONES as GISZone[],
  approvedLayoutZones: POLLACHI_APPROVED_LAYOUTS as GISZone[],
  governmentZones: POLLACHI_GOVERNMENT_ZONES as GISZone[],
  environmentalZones: POLLACHI_ENVIRONMENTAL_ZONES,
  waterBodies: POLLACHI_WATER_BODIES,
  infrastructure: POLLACHI_INFRASTRUCTURE,
  boundary: POLLACHI_TALUK_BOUNDARY,
  wards: POLLACHI_WARDS,
  township: POLLACHI_TOWNSHIP
};

// Preserve backward-compatibility alias for Coimbatore District
export const COIMBATORE_DISTRICT_GIS = POLLACHI_TALUK_GIS;

export const DISTRICTS_LIST = ['Coimbatore', 'Chennai', 'Salem', 'Madurai', 'Tiruchirappalli'];
export const TALUKS_LIST = ['Pollachi', 'Sulur', 'Coimbatore North', 'Coimbatore South', 'Annur', 'Valparai'];
