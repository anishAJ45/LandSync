// Pollachi Taluk Administrative Boundary Reference Layer
export interface BoundaryFeature {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number][];
  disclaimerNotice: string;
}

export const POLLACHI_TALUK_BOUNDARY: BoundaryFeature = {
  id: 'POLLACHI-TALUK-BOUND',
  name: 'Pollachi Taluk Administrative Boundary',
  type: 'Taluk Boundary',
  coordinates: [
    [10.6850, 76.9600],
    [10.7000, 77.0100],
    [10.6900, 77.0600],
    [10.6400, 77.0700],
    [10.6000, 77.0400],
    [10.5800, 76.9700],
    [10.6200, 76.9400],
    [10.6850, 76.9600]
  ],
  disclaimerNotice: 'Reference dataset pending authoritative GIS digitization'
};
