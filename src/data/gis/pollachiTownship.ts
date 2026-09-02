// Pollachi Master Plan 2035 Urban Growth Core Township Area
export interface TownshipFeature {
  id: string;
  name: string;
  planZone: string;
  color: string;
  coordinates: [number, number][];
  disclaimerNotice: string;
}

export const POLLACHI_TOWNSHIP: TownshipFeature[] = [
  {
    id: 'TOWNSHIP-POL-CORE',
    name: 'Pollachi Master Plan 2035 Urban Growth Core Area',
    planZone: 'LPA Master Plan Urban Growth Residential Zone',
    color: '#f59e0b', // Amber
    disclaimerNotice: 'LPA Master Plan 2035 Zoning Boundary',
    coordinates: [
      [10.66260, 77.00550],
      [10.66600, 77.00550],
      [10.66600, 77.01150],
      [10.66260, 77.01150],
      [10.66260, 77.00550]
    ]
  }
];
