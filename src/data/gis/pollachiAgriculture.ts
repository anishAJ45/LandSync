// Pollachi Agricultural Zones Context Layer (AG-001)
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

// Zone ID: AG-001 (Type: Agricultural)
export const POLLACHI_AGRICULTURE_ZONES: AgriZoneFeature[] = [
  {
    id: 'AG-001',
    name: 'Pollachi Coconut Plantation Preserve (North Belt)',
    category: 'agricultural',
    typeLabel: 'Agricultural Zone (Nanjai/Garden Land)',
    description: 'Protected coconut agro-horticulture preserve under TN Agri Master Plan 2035.',
    color: '#84cc16', // Light transparent green
    fillOpacity: 0.18,
    disclaimerNotice: 'Zoned Agricultural Preserve',
    coordinates: [
      [10.66470, 77.00680],
      [10.66560, 77.00680],
      [10.66560, 77.01020],
      [10.66470, 77.01020],
      [10.66470, 77.00680]
    ]
  }
];
