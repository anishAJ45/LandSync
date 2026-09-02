// Pollachi Agricultural Zones Context Layer (Coconut Farming Preserves, Paddy Belts)
export interface AgriZoneFeature {
  id: string;
  name: string;
  category: 'agricultural';
  typeLabel: string;
  description: string;
  color: string;
  fillOpacity: number;
  coordinates: [number, number][];
  disclaimerNotice: string;
}

// Agricultural Zone positioned North of North plots (lat 10.66470 to 10.66560)
export const POLLACHI_AGRICULTURE_ZONES: AgriZoneFeature[] = [
  {
    id: 'AGRI-POLLACHI-1',
    name: 'Pollachi Coconut Plantation Preserve (North Belt)',
    category: 'agricultural',
    typeLabel: 'Coconut Farming Preserve Zone (Nanjai/Garden Land)',
    description: 'Protected coconut agro-horticulture preserve under TN Agri Master Plan 2035.',
    color: '#10b981', // Green
    fillOpacity: 0.22,
    disclaimerNotice: 'Prototype / reference GIS layer',
    coordinates: [
      [10.66470, 77.00680],
      [10.66560, 77.00680],
      [10.66560, 77.01020],
      [10.66470, 77.01020],
      [10.66470, 77.00680]
    ]
  }
];
