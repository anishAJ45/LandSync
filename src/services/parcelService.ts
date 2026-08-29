import api from './api';
import {
  Parcel,
  ParcelGeometryData,
  ParcelHistoryItem,
  ParcelAnalysis,
  GISStatistics,
  GeoJSONFeatureCollection
} from '../types';

export interface ParcelSearchParams {
  q?: string;
  village?: string;
  district?: string;
  land_use?: string;
  status?: string;
}

export const parcelService = {
  // 1. Get all parcels
  async getAllParcels(): Promise<Parcel[]> {
    const res = await api.get<Parcel[]>('/api/parcels');
    return res.data;
  },

  // 2. Get GeoJSON Feature Collection for GIS Map
  async getGeoJSON(): Promise<GeoJSONFeatureCollection> {
    const res = await api.get<GeoJSONFeatureCollection>('/api/parcels/geojson');
    return res.data;
  },

  // 3. Search and filter parcels
  async searchParcels(params: ParcelSearchParams): Promise<Parcel[]> {
    const res = await api.get<Parcel[]>('/api/parcels/search', { params });
    return res.data;
  },

  // 4. Get single parcel 360 foundation record
  async getParcelById(parcelId: string): Promise<Parcel> {
    const res = await api.get<Parcel>(`/api/parcels/${encodeURIComponent(parcelId)}`);
    return res.data;
  },

  // 5. Get parcel polygon geometry
  async getParcelGeometry(parcelId: string): Promise<ParcelGeometryData> {
    const res = await api.get<ParcelGeometryData>(`/api/parcels/${encodeURIComponent(parcelId)}/geometry`);
    return res.data;
  },

  // 6. Get parcel chronological event history
  async getParcelHistory(parcelId: string): Promise<ParcelHistoryItem[]> {
    const res = await api.get<ParcelHistoryItem[]>(`/api/parcels/${encodeURIComponent(parcelId)}/history`);
    return res.data;
  },

  // 7. Get Shapely geometric analysis (area discrepancy, neighbors, overlaps)
  async getParcelAnalysis(parcelId: string): Promise<ParcelAnalysis> {
    const res = await api.get<ParcelAnalysis>(`/api/parcels/${encodeURIComponent(parcelId)}/analysis`);
    return res.data;
  },

  // 8. Get aggregated GIS statistics
  async getGISStatistics(): Promise<GISStatistics> {
    const res = await api.get<GISStatistics>('/api/parcels/stats');
    return res.data;
  }
};
