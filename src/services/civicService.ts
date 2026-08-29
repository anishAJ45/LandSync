import api from './api';
import {
  PropertyTaxRecord,
  LandValuationReference,
  WaterConnectionRecord,
  ElectricityConnectionRecord,
  DrainageInfrastructureRecord,
  RoadAccessRecord,
  RoadAccessAnalysis,
  InfrastructureProjectRecord,
  ProjectImpactAnalysis,
  DigitalInfrastructureRecord,
  CivicServiceProfile,
  CivicServiceScore,
  CivicInsight,
  CivicAlert,
  CivicParcel360Overview,
  CivicAnalyticsSummary,
  CivicServiceRequest,
  GeoJSONFeatureCollection
} from '../types';

export const civicService = {
  // 1. Get complete Parcel 360 Civic Overview
  getParcelCivicOverview: async (parcelId: string): Promise<CivicParcel360Overview> => {
    const response = await api.get(`/api/civic/parcel-360-civic/${parcelId}`);
    return response.data;
  },

  // 2. Property Tax Endpoints
  getPropertyTax: async (parcelId: string): Promise<PropertyTaxRecord | null> => {
    const response = await api.get(`/api/civic/parcel/${parcelId}/tax`);
    return response.data;
  },

  // 3. Land Valuation Reference Endpoints
  getLandValuation: async (parcelId: string): Promise<LandValuationReference | null> => {
    const response = await api.get(`/api/civic/parcel/${parcelId}/valuation`);
    return response.data;
  },

  // 4. Utility Infrastructure (Water, Electricity, Drainage, Telecom)
  getUtilities: async (parcelId: string): Promise<{
    water: WaterConnectionRecord | null;
    electricity: ElectricityConnectionRecord | null;
    drainage: DrainageInfrastructureRecord | null;
    sewerage: DrainageInfrastructureRecord | null;
    digital: DigitalInfrastructureRecord | null;
  }> => {
    const response = await api.get(`/api/civic/parcel/${parcelId}/utilities`);
    return response.data;
  },

  // 5. Road Access & Connectivity Analysis
  getRoadAccess: async (parcelId: string): Promise<{
    record: RoadAccessRecord | null;
    analysis: RoadAccessAnalysis;
  }> => {
    const response = await api.get(`/api/civic/parcel/${parcelId}/roads`);
    return response.data;
  },

  // 6. Public Infrastructure Projects & Impact Analysis
  getInfrastructureProjects: async (parcelId: string): Promise<{
    projects: InfrastructureProjectRecord[];
    analysis: ProjectImpactAnalysis;
  }> => {
    const response = await api.get(`/api/civic/parcel/${parcelId}/projects`);
    return response.data;
  },

  // 7. Civic Service Profile & 0-100 Score
  getCivicServiceScore: async (parcelId: string): Promise<{
    profile: CivicServiceProfile | null;
    score: CivicServiceScore;
  }> => {
    const response = await api.get(`/api/civic/parcel/${parcelId}/score`);
    return response.data;
  },

  // 8. Cross-Layer Explainable Insights
  getCivicInsights: async (parcelId: string): Promise<{
    insights: CivicInsight[];
    alerts: CivicAlert[];
  }> => {
    const response = await api.get(`/api/civic/parcel/${parcelId}/insights`);
    return response.data;
  },

  // 9. Civic GIS Vector Layers
  getCivicLayerGeoJSON: async (layerId: string): Promise<GeoJSONFeatureCollection> => {
    const response = await api.get(`/api/civic/layers/${layerId}`);
    return response.data;
  },

  // 10. Admin & Officer Civic Analytics Dashboard
  getCivicAnalytics: async (): Promise<CivicAnalyticsSummary> => {
    const response = await api.get('/api/civic/analytics');
    return response.data;
  },

  // 11. Citizen My Services Dashboard
  getMyCivicServices: async (): Promise<{
    parcels: Array<{
      parcel_id: string;
      survey_number: string;
      village: string;
      property_tax: PropertyTaxRecord | null;
      water: WaterConnectionRecord | null;
      electricity: ElectricityConnectionRecord | null;
      road: RoadAccessRecord | null;
      civic_score: number;
    }>;
    service_requests: CivicServiceRequest[];
    unread_alerts: CivicAlert[];
  }> => {
    const response = await api.get('/api/civic/my-services');
    return response.data;
  },

  // 12. Submit Civic Service Request
  submitServiceRequest: async (data: {
    parcel_id: string;
    service_category: string;
    description: string;
    priority?: string;
  }): Promise<CivicServiceRequest> => {
    const response = await api.post('/api/civic/service-request', data);
    return response.data;
  },

  // 13. Simulated Tax Payment
  payPropertyTaxSimulated: async (parcelId: string, amount: number): Promise<PropertyTaxRecord> => {
    const response = await api.post(`/api/civic/parcel/${parcelId}/tax/pay-simulated`, { amount });
    return response.data;
  },

  // 14. Officer Action: Review & Mark Verified
  reviewCivicRecord: async (data: {
    parcel_id: string;
    action: 'MARK_REVIEWED' | 'FLAG_INCONSISTENCY' | 'DISPATCH_INSPECTION';
    notes: string;
  }): Promise<{ status: string; message: string }> => {
    const response = await api.post('/api/civic/record-review', data);
    return response.data;
  }
};
