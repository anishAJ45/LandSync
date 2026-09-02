// Pollachi Government Land & Poramboke Buffer Dataset (GOV-002)
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

// Zone ID: GOV-002 (Type: Government Land)
export const POLLACHI_GOVERNMENT_ZONES: GovtZoneFeature[] = [
  {
    id: 'GOV-002',
    name: 'Mahalingapuram Revenue Anadheenam Poramboke',
    category: 'government',
    typeLabel: 'Government Land Reserve (Poramboke)',
    description: 'Revenue Department Government Poramboke Land Buffer.',
    color: '#f97316', // Orange
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
