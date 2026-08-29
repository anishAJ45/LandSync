import api from './api';
import {
  LandVerification,
  LandRecordSnapshot,
  FieldComparisonResult,
  VerificationAlert,
  VerificationTimelineEvent,
  VerificationAnalyticsOverview,
  MockDepartmentRecord,
} from '../types';

export const verificationService = {
  // Get all verifications with optional filter parameters
  async getVerifications(params?: {
    parcel_id?: string;
    application_id?: string;
    verification_type?: string;
    status?: string;
    consistency_level?: string;
  }): Promise<LandVerification[]> {
    const res = await api.get('/api/verifications', { params });
    return res.data;
  },

  // Get complete verification studio summary
  async getVerificationById(verificationId: string): Promise<LandVerification> {
    const res = await api.get(`/api/verifications/${verificationId}`);
    return res.data;
  },

  // Get immutable record snapshots
  async getRecordSnapshots(verificationId: string): Promise<LandRecordSnapshot[]> {
    const res = await api.get(`/api/verifications/${verificationId}/records`);
    return res.data;
  },

  // Get granular field comparisons
  async getFieldComparisons(verificationId: string): Promise<FieldComparisonResult[]> {
    const res = await api.get(`/api/verifications/${verificationId}/comparisons`);
    return res.data;
  },

  // Get alerts list
  async getVerificationAlerts(verificationId: string): Promise<VerificationAlert[]> {
    const res = await api.get(`/api/verifications/${verificationId}/alerts`);
    return res.data;
  },

  // Get step-by-step verification audit timeline
  async getVerificationTimeline(verificationId: string): Promise<VerificationTimelineEvent[]> {
    const res = await api.get(`/api/verifications/${verificationId}/timeline`);
    return res.data;
  },

  // Initiate a new cross-record verification
  async createVerification(data: {
    parcel_id: string;
    application_id?: string;
    verification_type: string;
    sources?: string[];
  }): Promise<LandVerification> {
    const res = await api.post('/api/verifications', data);
    return res.data;
  },

  // Re-run verification against freshest data
  async rerunVerification(verificationId: string): Promise<LandVerification> {
    const res = await api.post(`/api/verifications/${verificationId}/rerun`);
    return res.data;
  },

  // Officer / Admin alert resolution with remarks
  async resolveAlert(
    verificationId: string,
    alertId: number,
    remarks?: string
  ): Promise<{ status: string; alert: VerificationAlert; message: string }> {
    const res = await api.post(`/api/verifications/${verificationId}/resolve-alert/${alertId}`, {
      remarks: remarks || 'Resolved by reviewing land officer',
    });
    return res.data;
  },

  // Get latest verification summary for a specific parcel
  async getParcelVerificationSummary(parcelId: string): Promise<LandVerification | null> {
    const res = await api.get(`/api/parcels/${parcelId}/verification-summary`);
    return res.data;
  },

  // Verification Intelligence Analytics
  async getAnalyticsOverview(): Promise<VerificationAnalyticsOverview> {
    const res = await api.get('/api/analytics/verifications/overview');
    return res.data;
  },

  async getMismatchTypes(): Promise<Array<{ alert_type: string; count: number; percentage: number }>> {
    const res = await api.get('/api/analytics/verifications/mismatch-types');
    return res.data;
  },

  async getConsistencyDistribution(): Promise<Array<{ level: string; count: number; percentage: number }>> {
    const res = await api.get('/api/analytics/verifications/consistency-distribution');
    return res.data;
  },

  async getSourceAvailability(): Promise<Array<{ source_type: string; available_count: number; total_queries: number; availability_percent: number }>> {
    const res = await api.get('/api/analytics/verifications/source-availability');
    return res.data;
  },

  // Mock Department Integration Status & Inspector
  async getDepartmentIntegrations(): Promise<MockDepartmentRecord[]> {
    const res = await api.get('/api/integrations/status');
    return res.data;
  },
};
