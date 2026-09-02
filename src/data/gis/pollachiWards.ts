// Pollachi Municipality Wards Boundary Dataset
export interface WardFeature {
  id: string;
  wardNumber: string;
  locality: string;
  color: string;
  coordinates: [number, number][];
  disclaimerNotice: string;
}

// Ward 2 (Mahalingapuram) wrapping the neighbourhood (lat 10.66300 to 10.66580, lng 77.00600 to 77.01100)
export const POLLACHI_WARDS: WardFeature[] = [
  {
    id: 'WARD-POL-2',
    wardNumber: 'Ward 2',
    locality: 'Mahalingapuram, Pollachi Municipality',
    color: '#6366f1', // Indigo
    disclaimerNotice: 'Pollachi Municipality Ward Boundary',
    coordinates: [
      [10.66300, 77.00600],
      [10.66580, 77.00600],
      [10.66580, 77.01100],
      [10.66300, 77.01100],
      [10.66300, 77.00600]
    ]
  }
];
