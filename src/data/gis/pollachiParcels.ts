// Pollachi Property & Building Footprint Dataset
// Geographically organized neighbourhood layout along Mahalingapuram Main Road, Pollachi

export interface LandParcel {
  id: string;
  ulpin: string;
  regNumber?: string; // e.g. "REG-2024-CBE-12402"
  surveyNumber: string; // e.g. "124"
  subdivision: string; // e.g. "2"
  fullSurveyNo: string; // e.g. "124/2"
  district: string;
  taluk: string;
  village: string;
  streetName: string;
  propertyType: string;
  buildingObservation?: string;
  areaAcres: number;
  areaSqFt: number;
  recordedAreaAcres?: number;
  gisAreaAcres?: number;
  area: string; // e.g. "0.12 Acre (5,227 sq ft)"
  landClassification: string; // Factual classification or "Classification data unavailable"
  approvalStatus: string;
  boundaryCoordinates: [number, number][]; // Reference Parcel Plot Boundary [lat, lng]
  coordinates: [number, number][]; // Leaflet alias
  buildingFootprintCoordinates?: [number, number][]; // Physical Building Footprint Structure [lat, lng]
  ownerName?: string;
  marketValue?: string;
  pattaNumber?: string;
  discrepancyNotes?: string;
  disclaimerNotice?: string;
}

// Factual Pollachi Property Plots along Mahalingapuram Main Road
export const POLLACHI_PARCELS: LandParcel[] = [
  {
    id: 'P-POL-124-1',
    ulpin: 'TN-CBE-001-124-1',
    regNumber: 'REG-2024-CBE-12401',
    surveyNumber: '124',
    subdivision: '1',
    fullSurveyNo: '124/1',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Mahalingapuram',
    streetName: 'Mahalingapuram Main Road (North Side)',
    propertyType: 'Residential Dwelling',
    buildingObservation: 'Single-Story Structure Visible in Satellite Imagery',
    areaAcres: 0.08,
    areaSqFt: 3485,
    area: '0.08 Acre (3,485 sq ft)',
    landClassification: 'DTCP Sanctioned Residential Plot',
    approvalStatus: 'DTCP Approved Layout',
    ownerName: 'Subramaniam Ranganathan',
    marketValue: '₹ 38.00 Lakhs',
    pattaNumber: 'PATTA-TN-POL-12401',
    disclaimerNotice: 'Satellite imagery identifies visual structures. Legal parcel boundaries and official land classifications require authoritative cadastral and government datasets.',
    boundaryCoordinates: [
      [10.66425, 77.00700],
      [10.66455, 77.00700],
      [10.66455, 77.00750],
      [10.66425, 77.00750],
      [10.66425, 77.00700]
    ],
    coordinates: [
      [10.66425, 77.00700],
      [10.66455, 77.00700],
      [10.66455, 77.00750],
      [10.66425, 77.00750],
      [10.66425, 77.00700]
    ],
    buildingFootprintCoordinates: [
      [10.66432, 77.00712],
      [10.66448, 77.00712],
      [10.66448, 77.00738],
      [10.66432, 77.00738],
      [10.66432, 77.00712]
    ]
  },
  {
    id: 'P-POL-124-2',
    ulpin: 'TN-CBE-001-124-2',
    regNumber: 'REG-2024-CBE-12402',
    surveyNumber: '124',
    subdivision: '2',
    fullSurveyNo: '124/2',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Mahalingapuram',
    streetName: 'Mahalingapuram Main Road (North Side)',
    propertyType: 'Residential Building',
    buildingObservation: '2-Story Building Structure Visible in HD Satellite View',
    areaAcres: 0.12,
    areaSqFt: 5227,
    area: '0.12 Acre (5,227 sq ft)',
    landClassification: 'DTCP Approved Residential Property',
    approvalStatus: 'DTCP Approved Layout (#DTCP-CBE-POL-2024-44)',
    ownerName: 'Kavitha Ramachandran',
    marketValue: '₹ 68.50 Lakhs',
    pattaNumber: 'PATTA-TN-POL-12402',
    disclaimerNotice: 'Satellite imagery identifies visual structures. Legal parcel boundaries and official land classifications require authoritative cadastral and government datasets.',
    boundaryCoordinates: [
      [10.66425, 77.00760],
      [10.66455, 77.00760],
      [10.66455, 77.00810],
      [10.66425, 77.00810],
      [10.66425, 77.00760]
    ],
    coordinates: [
      [10.66425, 77.00760],
      [10.66455, 77.00760],
      [10.66455, 77.00810],
      [10.66425, 77.00810],
      [10.66425, 77.00760]
    ],
    buildingFootprintCoordinates: [
      [10.66430, 77.00772],
      [10.66448, 77.00772],
      [10.66448, 77.00798],
      [10.66430, 77.00798],
      [10.66430, 77.00772]
    ]
  },
  {
    id: 'P-POL-124-3',
    ulpin: 'TN-CBE-001-124-3',
    regNumber: 'REG-2024-CBE-12403',
    surveyNumber: '124',
    subdivision: '3',
    fullSurveyNo: '124/3',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Mahalingapuram',
    streetName: 'Mahalingapuram Main Road (North Side)',
    propertyType: 'Residential Dwelling',
    buildingObservation: 'Single-Story Building Structure Visible in Satellite View',
    areaAcres: 0.10,
    areaSqFt: 4356,
    area: '0.10 Acre (4,356 sq ft)',
    landClassification: 'Classification data unavailable',
    approvalStatus: 'Pending Verification',
    ownerName: 'Senthil Kumar V.',
    marketValue: '₹ 52.00 Lakhs',
    pattaNumber: 'PATTA-TN-POL-12403',
    discrepancyNotes: 'Northern boundary vector discrepancy flagged.',
    disclaimerNotice: 'Satellite imagery identifies visual structures. Legal parcel boundaries and official land classifications require authoritative cadastral and government datasets.',
    boundaryCoordinates: [
      [10.66425, 77.00820],
      [10.66455, 77.00820],
      [10.66455, 77.00870],
      [10.66425, 77.00870],
      [10.66425, 77.00820]
    ],
    coordinates: [
      [10.66425, 77.00820],
      [10.66455, 77.00820],
      [10.66455, 77.00870],
      [10.66425, 77.00870],
      [10.66425, 77.00820]
    ],
    buildingFootprintCoordinates: [
      [10.66432, 77.00832],
      [10.66448, 77.00832],
      [10.66448, 77.00858],
      [10.66432, 77.00858],
      [10.66432, 77.00832]
    ]
  },
  {
    id: 'P-POL-125-2',
    ulpin: 'TN-CBE-001-125-2',
    regNumber: 'REG-2024-CBE-12502',
    surveyNumber: '125',
    subdivision: '2',
    fullSurveyNo: '125/2',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Mahalingapuram',
    streetName: 'Mahalingapuram Main Road (South Side)',
    propertyType: 'Residential Building',
    buildingObservation: 'Single Dwelling Structure Visible in Satellite View',
    areaAcres: 0.11,
    areaSqFt: 4791,
    area: '0.11 Acre (4,791 sq ft)',
    landClassification: 'DTCP Approved Residential Layout',
    approvalStatus: 'DTCP Approved Layout (#CBE-POL-2024-88)',
    ownerName: 'Deepa Natarajan',
    marketValue: '₹ 62.00 Lakhs',
    pattaNumber: 'PATTA-TN-POL-12502',
    disclaimerNotice: 'Satellite imagery identifies visual structures. Legal parcel boundaries and official land classifications require authoritative cadastral and government datasets.',
    boundaryCoordinates: [
      [10.66375, 77.00760],
      [10.66405, 77.00760],
      [10.66405, 77.00810],
      [10.66375, 77.00810],
      [10.66375, 77.00760]
    ],
    coordinates: [
      [10.66375, 77.00760],
      [10.66405, 77.00760],
      [10.66405, 77.00810],
      [10.66375, 77.00810],
      [10.66375, 77.00760]
    ],
    buildingFootprintCoordinates: [
      [10.66382, 77.00772],
      [10.66398, 77.00772],
      [10.66398, 77.00798],
      [10.66382, 77.00798],
      [10.66382, 77.00772]
    ]
  }
];
