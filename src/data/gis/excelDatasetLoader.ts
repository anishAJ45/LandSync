// Excel Dataset Loader & Converter Service for LANDSYNC_Pollachi_Parcel_Prototype.xlsx
import excelData from './pollachiExcelParcels.json';
import { LandParcel } from './pollachiParcels';

interface RawExcelRecord {
  parcel_id: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  survey_number: string;
  subdivision: string;
  area_acres: number;
  area_sqft: number;
  land_type: string;
  record_status: string;
}

/**
 * Convert a raw Excel parcel record into a full LandParcel object with map coordinates
 */
export function convertExcelRecordToLandParcel(rec: RawExcelRecord, index: number): LandParcel {
  const isNorth = index % 2 === 0;
  const latBase = isNorth ? 10.66430 : 10.66380;
  const lngBase = 77.00700 + (index % 8) * 0.00055;

  const latOffset = (index % 3) * 0.00005;
  const lngOffset = (index % 4) * 0.00005;

  const pLat1 = latBase + latOffset;
  const pLat2 = pLat1 + 0.00025;
  const pLng1 = lngBase + lngOffset;
  const pLng2 = pLng1 + 0.00045;

  // Boundary coordinates
  const boundaryCoordinates: [number, number][] = [
    [pLat1, pLng1],
    [pLat2, pLng1],
    [pLat2, pLng2],
    [pLat1, pLng2],
    [pLat1, pLng1]
  ];

  // Building footprint coordinates
  const buildingFootprintCoordinates: [number, number][] = [
    [pLat1 + 0.00005, pLng1 + 0.00008],
    [pLat2 - 0.00005, pLng1 + 0.00008],
    [pLat2 - 0.00005, pLng2 - 0.00008],
    [pLat1 + 0.00005, pLng2 - 0.00008],
    [pLat1 + 0.00005, pLng1 + 0.00008]
  ];

  const fullSurvey = `${rec.survey_number}/${rec.subdivision}`;
  const regNo = `REG-2024-CBE-${rec.parcel_id.replace('DEMO-PLCH-', '')}`;

  return {
    id: rec.parcel_id,
    ulpin: rec.parcel_id,
    regNumber: regNo,
    surveyNumber: rec.survey_number,
    subdivision: rec.subdivision,
    fullSurveyNo: fullSurvey,
    district: rec.district || 'Coimbatore',
    taluk: rec.taluk || 'Pollachi',
    village: rec.village || 'Pollachi Village',
    streetName: `Pollachi Sector Road (${rec.village})`,
    propertyType: rec.land_type === 'Agricultural' ? 'Agri Cottage' : rec.land_type === 'Commercial' ? 'Commercial Plot' : 'Residential Building',
    buildingObservation: `${rec.land_type} Structure Visible in Satellite View`,
    areaAcres: rec.area_acres,
    areaSqFt: rec.area_sqft,
    area: `${rec.area_acres} Acres (${rec.area_sqft.toLocaleString()} sq ft)`,
    landClassification: rec.land_type ? `${rec.land_type} Property (${rec.record_status})` : 'Classification data unavailable',
    approvalStatus: rec.record_status === 'Active' ? 'DTCP Sanctioned Plot' : 'Record Verification Required',
    boundaryCoordinates,
    coordinates: boundaryCoordinates,
    buildingFootprintCoordinates,
    ownerName: `Registered Owner (${rec.parcel_id})`,
    pattaNumber: `PATTA-POL-${rec.parcel_id.replace('DEMO-PLCH-', '')}`,
    disclaimerNotice: 'Satellite imagery identifies visual structures. Legal parcel boundaries and official land classifications require authoritative cadastral and government datasets.'
  };
}

// Convert representative Excel dataset records
export const CONVERTED_EXCEL_PARCELS: LandParcel[] = (excelData.sample_records as RawExcelRecord[]).map(
  (rec, idx) => convertExcelRecordToLandParcel(rec, idx)
);

// Lookup map for fast searching across all 18,284 records
export const EXCEL_PARCELS_MAP: Record<string, RawExcelRecord> = excelData.lookup_map as Record<string, RawExcelRecord>;
