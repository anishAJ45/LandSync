// Pollachi Cadastral Property & Building Footprint Dataset
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
  propertyType: 'Residential House' | 'Commercial Plot' | 'Residential Villa' | 'Townhouse' | 'Duplex' | 'Agri Cottage' | 'Reserved Plot';
  buildingObservation?: string;
  areaAcres: number;
  areaSqFt: number;
  recordedAreaAcres?: number;
  gisAreaAcres?: number;
  area: string; // e.g. "0.12 Acre (5,227 sq ft)"
  landClassification: string;
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

// 10 Geographically organized property plots along Mahalingapuram Main Road, Pollachi
export const POLLACHI_PARCELS: LandParcel[] = [
  // --- NORTH SIDE PROPERTIES (lat 10.66425 to 10.66455) ---
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
    propertyType: 'Residential House',
    buildingObservation: 'Single-Story Brick House with Front Porch',
    areaAcres: 0.08,
    recordedAreaAcres: 0.08,
    gisAreaAcres: 0.079,
    areaSqFt: 3485,
    area: '0.08 Acre (3,485 sq ft)',
    landClassification: 'Residential House Plot',
    approvalStatus: 'DTCP Sanctioned Residential Plot',
    ownerName: 'Subramaniam Ranganathan',
    marketValue: '₹ 38.00 Lakhs',
    pattaNumber: 'PATTA-TN-POL-12401',
    disclaimerNotice: 'Based on available GIS and reference datasets. Official verification may be required.',
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
    propertyType: 'Residential Villa',
    buildingObservation: '2-Story Independent House Structure (Selected Focus Property)',
    areaAcres: 0.12,
    recordedAreaAcres: 0.12,
    gisAreaAcres: 0.1202,
    areaSqFt: 5227,
    area: '0.12 Acre (5,227 sq ft)',
    landClassification: 'Approved Residential House Property',
    approvalStatus: 'DTCP Approved Layout (#DTCP-CBE-POL-2024-44)',
    ownerName: 'Kavitha Ramachandran',
    marketValue: '₹ 68.50 Lakhs',
    pattaNumber: 'PATTA-TN-POL-12402',
    disclaimerNotice: 'Based on available GIS and reference datasets. Official verification may be required.',
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
    propertyType: 'Residential House',
    buildingObservation: '1-Story Brick Dwelling with Fence Line Discrepancy',
    areaAcres: 0.10,
    recordedAreaAcres: 0.10,
    gisAreaAcres: 0.108,
    areaSqFt: 4356,
    area: '0.10 Acre (4,356 sq ft)',
    landClassification: 'Residential / Boundary Discrepancy Flagged',
    approvalStatus: 'Pending Verification (Northern Fence Discrepancy)',
    ownerName: 'Senthil Kumar V.',
    marketValue: '₹ 52.00 Lakhs',
    pattaNumber: 'PATTA-TN-POL-12403',
    discrepancyNotes: '5.8% survey vector discrepancy vs Patta registry line.',
    disclaimerNotice: 'Based on available GIS and reference datasets. Official verification may be required.',
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
    id: 'P-POL-124-4',
    ulpin: 'TN-CBE-001-124-4',
    regNumber: 'REG-2024-CBE-12404',
    surveyNumber: '124',
    subdivision: '4',
    fullSurveyNo: '124/4',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Mahalingapuram',
    streetName: 'Mahalingapuram Main Road (North Side)',
    propertyType: 'Townhouse',
    buildingObservation: 'Newly Constructed Townhouse Structure',
    areaAcres: 0.09,
    recordedAreaAcres: 0.09,
    gisAreaAcres: 0.089,
    areaSqFt: 3920,
    area: '0.09 Acre (3,920 sq ft)',
    landClassification: 'DTCP Residential Smart Plot',
    approvalStatus: 'DTCP Approved Residential Layout',
    ownerName: 'Anand Viswanathan',
    marketValue: '₹ 58.00 Lakhs',
    pattaNumber: 'PATTA-TN-POL-12404',
    disclaimerNotice: 'Based on available GIS and reference datasets. Official verification may be required.',
    boundaryCoordinates: [
      [10.66425, 77.00880],
      [10.66455, 77.00880],
      [10.66455, 77.00930],
      [10.66425, 77.00930],
      [10.66425, 77.00880]
    ],
    coordinates: [
      [10.66425, 77.00880],
      [10.66455, 77.00880],
      [10.66455, 77.00930],
      [10.66425, 77.00930],
      [10.66425, 77.00880]
    ],
    buildingFootprintCoordinates: [
      [10.66432, 77.00892],
      [10.66448, 77.00892],
      [10.66448, 77.00918],
      [10.66432, 77.00918],
      [10.66432, 77.00892]
    ]
  },
  {
    id: 'P-POL-124-5',
    ulpin: 'TN-CBE-001-124-5',
    regNumber: 'REG-2024-CBE-12405',
    surveyNumber: '124',
    subdivision: '5',
    fullSurveyNo: '124/5',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Mahalingapuram',
    streetName: 'Mahalingapuram Main Road (North Corner)',
    propertyType: 'Commercial Plot',
    buildingObservation: 'Commercial Retail Shopfront Building',
    areaAcres: 0.15,
    recordedAreaAcres: 0.15,
    gisAreaAcres: 0.149,
    areaSqFt: 6534,
    area: '0.15 Acre (6,534 sq ft)',
    landClassification: 'Commercial Mixed-Use Property',
    approvalStatus: 'LPA Approved Commercial Plot',
    ownerName: 'Pollachi Traders Association',
    marketValue: '₹ 1.15 Cr',
    pattaNumber: 'PATTA-TN-POL-12405',
    disclaimerNotice: 'Based on available GIS and reference datasets. Official verification may be required.',
    boundaryCoordinates: [
      [10.66425, 77.00940],
      [10.66455, 77.00940],
      [10.66455, 77.00990],
      [10.66425, 77.00990],
      [10.66425, 77.00940]
    ],
    coordinates: [
      [10.66425, 77.00940],
      [10.66455, 77.00940],
      [10.66455, 77.00990],
      [10.66425, 77.00990],
      [10.66425, 77.00940]
    ],
    buildingFootprintCoordinates: [
      [10.66432, 77.00952],
      [10.66448, 77.00952],
      [10.66448, 77.00978],
      [10.66432, 77.00978],
      [10.66432, 77.00952]
    ]
  },

  // --- SOUTH SIDE PROPERTIES (lat 10.66375 to 10.66405) ---
  {
    id: 'P-POL-125-1',
    ulpin: 'TN-CBE-001-125-1',
    regNumber: 'REG-2024-CBE-12501',
    surveyNumber: '125',
    subdivision: '1',
    fullSurveyNo: '125/1',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Mahalingapuram',
    streetName: 'Mahalingapuram Main Road (South Side)',
    propertyType: 'Agri Cottage',
    buildingObservation: 'Farmhouse Cottage Structure',
    areaAcres: 0.14,
    recordedAreaAcres: 0.14,
    gisAreaAcres: 0.139,
    areaSqFt: 6098,
    area: '0.14 Acre (6,098 sq ft)',
    landClassification: 'Coconut Agro Preserve Plot',
    approvalStatus: 'Zoned Agricultural Preserve',
    ownerName: 'Murugan Thangavel',
    marketValue: '₹ 42.00 Lakhs',
    pattaNumber: 'PATTA-TN-POL-12501',
    disclaimerNotice: 'Based on available GIS and reference datasets. Official verification may be required.',
    boundaryCoordinates: [
      [10.66375, 77.00700],
      [10.66405, 77.00700],
      [10.66405, 77.00750],
      [10.66375, 77.00750],
      [10.66375, 77.00700]
    ],
    coordinates: [
      [10.66375, 77.00700],
      [10.66405, 77.00700],
      [10.66405, 77.00750],
      [10.66375, 77.00750],
      [10.66375, 77.00700]
    ],
    buildingFootprintCoordinates: [
      [10.66382, 77.00712],
      [10.66398, 77.00712],
      [10.66398, 77.00738],
      [10.66382, 77.00738],
      [10.66382, 77.00712]
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
    propertyType: 'Residential Villa',
    buildingObservation: 'Independent Residential Villa Structure',
    areaAcres: 0.11,
    recordedAreaAcres: 0.11,
    gisAreaAcres: 0.1101,
    areaSqFt: 4791,
    area: '0.11 Acre (4,791 sq ft)',
    landClassification: 'DTCP Residential Villa Plot',
    approvalStatus: 'DTCP Approved Layout (#CBE-POL-2024-88)',
    ownerName: 'Deepa Natarajan',
    marketValue: '₹ 62.00 Lakhs',
    pattaNumber: 'PATTA-TN-POL-12502',
    disclaimerNotice: 'Based on available GIS and reference datasets. Official verification may be required.',
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
  },
  {
    id: 'P-POL-125-3',
    ulpin: 'TN-CBE-001-125-3',
    regNumber: 'REG-2024-CBE-12503',
    surveyNumber: '125',
    subdivision: '3',
    fullSurveyNo: '125/3',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Mahalingapuram',
    streetName: 'Mahalingapuram Main Road (South Side)',
    propertyType: 'Duplex',
    buildingObservation: 'Modern Duplex Residence Building',
    areaAcres: 0.16,
    recordedAreaAcres: 0.16,
    gisAreaAcres: 0.159,
    areaSqFt: 6969,
    area: '0.16 Acre (6,969 sq ft)',
    landClassification: 'Approved Residential Plot',
    approvalStatus: 'DTCP Approved Plot',
    ownerName: 'Karthik Subramanian',
    marketValue: '₹ 72.00 Lakhs',
    pattaNumber: 'PATTA-TN-POL-12503',
    disclaimerNotice: 'Based on available GIS and reference datasets. Official verification may be required.',
    boundaryCoordinates: [
      [10.66375, 77.00820],
      [10.66405, 77.00820],
      [10.66405, 77.00870],
      [10.66375, 77.00870],
      [10.66375, 77.00820]
    ],
    coordinates: [
      [10.66375, 77.00820],
      [10.66405, 77.00820],
      [10.66405, 77.00870],
      [10.66375, 77.00870],
      [10.66375, 77.00820]
    ],
    buildingFootprintCoordinates: [
      [10.66382, 77.00832],
      [10.66398, 77.00832],
      [10.66398, 77.00858],
      [10.66382, 77.00858],
      [10.66382, 77.00832]
    ]
  },
  {
    id: 'P-POL-125-4',
    ulpin: 'TN-CBE-001-125-4',
    regNumber: 'REG-2024-CBE-12504',
    surveyNumber: '125',
    subdivision: '4',
    fullSurveyNo: '125/4',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Mahalingapuram',
    streetName: 'Mahalingapuram Main Road (South Side)',
    propertyType: 'Residential House',
    buildingObservation: 'G+1 Residential Corner House Structure',
    areaAcres: 0.08,
    recordedAreaAcres: 0.08,
    gisAreaAcres: 0.0801,
    areaSqFt: 3485,
    area: '0.08 Acre (3,485 sq ft)',
    landClassification: 'Residential Corner Plot',
    approvalStatus: 'DTCP Approved Plot',
    ownerName: 'Saravanan Periasamy',
    marketValue: '₹ 45.00 Lakhs',
    pattaNumber: 'PATTA-TN-POL-12504',
    disclaimerNotice: 'Based on available GIS and reference datasets. Official verification may be required.',
    boundaryCoordinates: [
      [10.66375, 77.00880],
      [10.66405, 77.00880],
      [10.66405, 77.00930],
      [10.66375, 77.00930],
      [10.66375, 77.00880]
    ],
    coordinates: [
      [10.66375, 77.00880],
      [10.66405, 77.00880],
      [10.66405, 77.00930],
      [10.66375, 77.00930],
      [10.66375, 77.00880]
    ],
    buildingFootprintCoordinates: [
      [10.66382, 77.00892],
      [10.66398, 77.00892],
      [10.66398, 77.00918],
      [10.66382, 77.00918],
      [10.66382, 77.00892]
    ]
  },
  {
    id: 'P-POL-126-1',
    ulpin: 'TN-CBE-001-126-1',
    regNumber: 'REG-2024-CBE-12601',
    surveyNumber: '126',
    subdivision: '1',
    fullSurveyNo: '126/1',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Mahalingapuram',
    streetName: 'Mahalingapuram Main Road (South Corner)',
    propertyType: 'Residential House',
    buildingObservation: 'Independent G+1 House Structure',
    areaAcres: 0.13,
    recordedAreaAcres: 0.13,
    gisAreaAcres: 0.129,
    areaSqFt: 5662,
    area: '0.13 Acre (5,662 sq ft)',
    landClassification: 'Approved Residential Plot',
    approvalStatus: 'DTCP Sanctioned Plot',
    ownerName: 'Revathi Krishnan',
    marketValue: '₹ 56.00 Lakhs',
    pattaNumber: 'PATTA-TN-POL-12601',
    disclaimerNotice: 'Based on available GIS and reference datasets. Official verification may be required.',
    boundaryCoordinates: [
      [10.66375, 77.00940],
      [10.66405, 77.00940],
      [10.66405, 77.00990],
      [10.66375, 77.00990],
      [10.66375, 77.00940]
    ],
    coordinates: [
      [10.66375, 77.00940],
      [10.66405, 77.00940],
      [10.66405, 77.00990],
      [10.66375, 77.00990],
      [10.66375, 77.00940]
    ],
    buildingFootprintCoordinates: [
      [10.66382, 77.00952],
      [10.66398, 77.00952],
      [10.66398, 77.00978],
      [10.66382, 77.00978],
      [10.66382, 77.00952]
    ]
  }
];
