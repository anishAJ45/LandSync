// Pollachi Government Land & Poramboke Buffer Dataset
export interface GovtZoneFeature {
  id: string;
  name: string;
  category: 'government';
  typeLabel: string;
  description: string;
  color: string;
  fillOpacity: number;
  coordinates: [number, number][];
  disclaimerNotice: string;
}

// Government Revenue Poramboke Zone (West of South plots at lat 10.66360 to 10.66405, lng 77.00620 to 77.00680)
export const POLLACHI_GOVERNMENT_ZONES: GovtZoneFeature[] = [
  {
    id: 'GOVT-POLLACHI-1',
    name: 'Mahalingapuram Revenue Anadheenam Poramboke',
    category: 'government',
    typeLabel: 'Government Poramboke Reserve Land (Non-Assessed)',
    description: 'Revenue Department Government Poramboke Land Buffer.',
    color: '#ea580c', // Orange / Amber
    fillOpacity: 0.22,
    disclaimerNotice: 'State Revenue Department Statutory Reserve',
    coordinates: [
      [10.66360, 77.00620],
      [10.66405, 77.00620],
      [10.66405, 77.00680],
      [10.66360, 77.00680],
      [10.66360, 77.00620]
    ]
  }
];
