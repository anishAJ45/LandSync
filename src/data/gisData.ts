import { POLLACHI_PARCELS, LandParcel } from './gis/pollachiParcels';
import { CONVERTED_EXCEL_PARCELS, EXCEL_PARCELS_MAP, convertExcelRecordToLandParcel } from './gis/excelDatasetLoader';
import { POLLACHI_AGRICULTURE_ZONES, AgriZoneFeature } from './gis/pollachiAgriculture';
import { POLLACHI_GOVERNMENT_ZONES, GovtZoneFeature } from './gis/pollachiGovernmentLand';
import { POLLACHI_WATER_BODIES, WaterBodyFeature } from './gis/pollachiWaterBodies';
import { POLLACHI_APPROVED_LAYOUTS, ApprovedLayoutFeature } from './gis/pollachiApprovedLayouts';
import { POLLACHI_TALUK_BOUNDARY, BoundaryFeature } from './gis/pollachiBoundary';
import { POLLACHI_WARDS, WardFeature } from './gis/pollachiWards';
import { POLLACHI_TOWNSHIP, TownshipFeature } from './gis/pollachiTownship';

export interface DistrictGISData {
  districtName: string;
  talukName: string;
  centerCoordinates: [number, number];
  defaultZoom: number;
  totalLandParcelsCount: number;
  parcels: LandParcel[];
  agriculturalZones: AgriZoneFeature[];
  governmentZones: GovtZoneFeature[];
  waterBodies: WaterBodyFeature[];
  approvedLayoutZones: ApprovedLayoutFeature[];
  environmentalZones: ApprovedLayoutFeature[];
  infrastructure: BoundaryFeature[];
  wards: WardFeature[];
  township: TownshipFeature[];
}

// Combined Pollachi Taluk GIS Dataset featuring 18,284 records from LANDSYNC_Pollachi_Parcel_Prototype.xlsx
export const POLLACHI_TALUK_GIS: DistrictGISData = {
  districtName: 'Coimbatore',
  talukName: 'Pollachi',
  centerCoordinates: [10.6642, 77.0085], // Mahalingapuram Main Road corridor
  defaultZoom: 16,
  totalLandParcelsCount: 18284,
  parcels: [...POLLACHI_PARCELS, ...CONVERTED_EXCEL_PARCELS],
  agriculturalZones: POLLACHI_AGRICULTURE_ZONES,
  governmentZones: POLLACHI_GOVERNMENT_ZONES,
  waterBodies: POLLACHI_WATER_BODIES,
  approvedLayoutZones: POLLACHI_APPROVED_LAYOUTS,
  environmentalZones: [],
  infrastructure: [],
  wards: POLLACHI_WARDS,
  township: POLLACHI_TOWNSHIP
};

// Re-export alias for legacy components
export const COIMBATORE_DISTRICT_GIS = POLLACHI_TALUK_GIS;

export const DISTRICTS_LIST = ['Coimbatore', 'Tiruppur', 'Erode', 'Nilgiris', 'Salem'];
export const TALUKS_LIST = ['Pollachi', 'Coimbatore North', 'Coimbatore South', 'Valparai', 'Sulur'];

export type { LandParcel };
export { EXCEL_PARCELS_MAP, convertExcelRecordToLandParcel };
