// Pollachi Water Bodies Layer (WATER-001)
export interface WaterBodyFeature {
  id: string;
  name: string;
  type: 'river' | 'canal' | 'lake' | 'pond' | 'waterbody';
  geometryType: 'polyline' | 'polygon';
  color: string;
  coordinates: [number, number][] | [number, number][][];
  bufferDistanceMeters?: number;
  disclaimerNotice: string;
}

// Zone ID: WATER-001 (Type: Waterbody)
export const POLLACHI_WATER_BODIES: WaterBodyFeature[] = [
  {
    id: 'WATER-001',
    name: 'Mahalingapuram Water Storage Pond & Stream Corridor',
    type: 'waterbody',
    geometryType: 'polygon',
    color: '#0284c7', // Deep Blue
    bufferDistanceMeters: 50,
    disclaimerNotice: '50m PWD Statutory Water Protection Buffer',
    coordinates: [
      [10.66320, 77.01000],
      [10.66360, 77.01000],
      [10.66360, 77.01060],
      [10.66320, 77.01060],
      [10.66320, 77.01000]
    ]
  },
  {
    id: 'WATER-002-STREAM',
    name: 'Aliyar Canal Irrigation Stream Corridor',
    type: 'canal',
    geometryType: 'polyline',
    color: '#0284c7',
    bufferDistanceMeters: 50,
    disclaimerNotice: '50m PWD Statutory Water Protection Buffer',
    coordinates: [
      [10.66340, 77.00650],
      [10.66340, 77.00750],
      [10.66340, 77.00850],
      [10.66340, 77.00950],
      [10.66340, 77.01050]
    ]
  }
];
