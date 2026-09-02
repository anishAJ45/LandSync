// Pollachi Approved Layout & Smart Layout Zones Dataset
export interface ApprovedLayoutFeature {
  id: string;
  name: string;
  category: 'approved_layout';
  typeLabel: string;
  description: string;
  color: string;
  fillOpacity: number;
  coordinates: [number, number][];
  disclaimerNotice: string;
}

// Approved DTCP Layout Zone (East of North plots at lat 10.66425 to 10.66465, lng 77.01000 to 77.01070)
export const POLLACHI_APPROVED_LAYOUTS: ApprovedLayoutFeature[] = [
  {
    id: 'LAYOUT-POLLACHI-1',
    name: 'Mahalingapuram DTCP Approved Smart Layout',
    category: 'approved_layout',
    typeLabel: 'DTCP Sanctioned Residential Sub-division',
    description: 'Sanctioned DTCP layout under Master Plan Approval #DTCP-CBE-POL-2024-44.',
    color: '#06b6d4', // Cyan / Teal
    fillOpacity: 0.22,
    disclaimerNotice: 'DTCP Sanctioned Layout Boundary',
    coordinates: [
      [10.66425, 77.01000],
      [10.66465, 77.01000],
      [10.66465, 77.01070],
      [10.66425, 77.01070],
      [10.66425, 77.01000]
    ]
  }
];
