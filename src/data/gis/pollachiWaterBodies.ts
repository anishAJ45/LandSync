// Pollachi Water Bodies Layer (Aliyar Canal Stream & Mahalingapuram Pond)
export interface WaterBodyFeature {
  id: string;
  name: string;
  type: 'river' | 'canal' | 'lake' | 'pond';
  geometryType: 'polyline' | 'polygon';
  color: string;
  coordinates: [number, number][] | [number, number][][];
  bufferDistanceMeters?: number;
  disclaimerNotice: string;
}

export const POLLACHI_WATER_BODIES: WaterBodyFeature[] = [
  // 1. Aliyar Irrigation Canal / Stream (Polyline running south of South plots at lat 10.66340)
  {
    id: 'WB-POLLACHI-CANAL',
    name: 'Aliyar Irrigation Canal / Stream Corridor',
    type: 'canal',
    geometryType: 'polyline',
    color: '#0284c7', // Cyan / Deep Blue
    bufferDistanceMeters: 50,
    disclaimerNotice: '50m PWD Buffer Buffer Mandatory under TN Protection of Water Bodies Act',
    coordinates: [
      [10.66340, 77.00650],
      [10.66340, 77.00750],
      [10.66340, 77.00850],
      [10.66340, 77.00950],
      [10.66340, 77.01050]
    ]
  },
  // 2. Mahalingapuram Local Pond (Polygon at lat 10.66320 to 10.66360, lng 77.01000 to 77.01060)
  {
    id: 'WB-POLLACHI-POND',
    name: 'Mahalingapuram Water Storage Pond',
    type: 'pond',
    geometryType: 'polygon',
    color: '#0369a1',
    bufferDistanceMeters: 50,
    disclaimerNotice: 'State PWD Statutory Water Protection Buffer',
    coordinates: [
      [10.66320, 77.01000],
      [10.66360, 77.01000],
      [10.66360, 77.01060],
      [10.66320, 77.01060],
      [10.66320, 77.01000]
    ]
  }
];
