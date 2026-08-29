import axios from 'axios';
import {
  LandDNAProfile,
  LandRiskAssessment,
  RiskSignal,
  LandAnomaly,
  LandDNAHistory,
  OfficerRiskQueueItem,
  AdminLandIntelligenceAnalytics,
  CitizenLandStatusItem
} from '../types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const landDnaService = {
  // Fetch Land DNA profile for a parcel
  async getLandDNAProfile(parcelId: string): Promise<LandDNAProfile> {
    const res = await api.get<LandDNAProfile>(`/land-dna/${parcelId}`);
    return res.data;
  },

  // Trigger Land DNA profile re-generation
  async generateLandDNAProfile(parcelId: string): Promise<LandDNAProfile> {
    const res = await api.post<LandDNAProfile>(`/land-dna/generate/${parcelId}`);
    return res.data;
  },

  // Get Land DNA historical snapshots
  async getLandDNAHistory(parcelId: string): Promise<LandDNAHistory[]> {
    const res = await api.get<LandDNAHistory[]>(`/land-dna/${parcelId}/history`);
    return res.data;
  },

  // Re-run risk analysis
  async analyzeRisk(parcelId: string): Promise<{ assessment: LandRiskAssessment; profile: LandDNAProfile; signals: RiskSignal[]; anomalies: LandAnomaly[] }> {
    const res = await api.post(`/risk/analyze/${parcelId}`);
    return res.data;
  },

  // Get risk assessment
  async getRiskAssessment(parcelId: string): Promise<LandRiskAssessment> {
    const res = await api.get<LandRiskAssessment>(`/risk/${parcelId}`);
    return res.data;
  },

  // Get risk signals for a parcel
  async getRiskSignals(parcelId: string): Promise<RiskSignal[]> {
    const res = await api.get<RiskSignal[]>(`/risk/${parcelId}/signals`);
    return res.data;
  },

  // Get anomalies for a parcel
  async getAnomalies(parcelId: string): Promise<LandAnomaly[]> {
    const res = await api.get<LandAnomaly[]>(`/risk/${parcelId}/anomalies`);
    return res.data;
  },

  // Get all anomalies across system
  async getAllAnomalies(): Promise<LandAnomaly[]> {
    const res = await api.get<LandAnomaly[]>('/anomalies/all');
    return res.data;
  },

  // Review an anomaly
  async reviewAnomaly(anomalyId: string | number, reviewStatus: string, reviewNote: string): Promise<LandAnomaly> {
    const res = await api.post<LandAnomaly>(`/risk/anomalies/${anomalyId}/review`, {
      review_status: reviewStatus,
      review_note: reviewNote
    });
    return res.data;
  },

  // Resolve a risk signal
  async resolveRiskSignal(signalId: string | number, resolutionNote: string): Promise<RiskSignal> {
    const res = await api.post<RiskSignal>(`/risk/signals/${signalId}/resolve`, {
      resolution_note: resolutionNote
    });
    return res.data;
  },

  // Get officer priority risk queue
  async getOfficerRiskQueue(): Promise<OfficerRiskQueueItem[]> {
    const res = await api.get<OfficerRiskQueueItem[]>('/officer/risk-queue');
    return res.data;
  },

  // Get admin land intelligence analytics
  async getAdminLandIntelligenceAnalytics(): Promise<AdminLandIntelligenceAnalytics> {
    const res = await api.get<AdminLandIntelligenceAnalytics>('/admin/land-intelligence/analytics');
    return res.data;
  },

  // Get citizen safe statuses
  async getCitizenLandStatuses(): Promise<CitizenLandStatusItem[]> {
    const res = await api.get<CitizenLandStatusItem[]>('/citizen/land-status');
    return res.data;
  },

  // Get single citizen safe status
  async getCitizenParcelStatus(parcelId: string): Promise<CitizenLandStatusItem> {
    const res = await api.get<CitizenLandStatusItem>(`/citizen/land-status/${parcelId}`);
    return res.data;
  }
};
