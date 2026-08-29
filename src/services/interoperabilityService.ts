import api from './api';
import {
  DepartmentSystem,
  IntegrationRequest,
  DataAccessConsent,
  DataLineageItem,
  IntegrationHealthSummary,
  ParcelConnectedRecordsOverview,
  CommonLandRecord
} from '../types';

export const interoperabilityService = {
  // Department Systems
  async getDepartments(): Promise<DepartmentSystem[]> {
    const response = await api.get('/integration/v1/departments');
    return response.data;
  },

  async getDepartmentById(departmentId: string): Promise<{
    department: DepartmentSystem;
    recent_requests: IntegrationRequest[];
    schema_mapping: Array<{ source_field: string; common_field: string; data_type: string; description: string }>;
    mock_endpoints: Array<{ method: string; path: string; description: string; sample_request: any; sample_response: any }>;
  }> {
    const response = await api.get(`/integration/v1/departments/${departmentId}`);
    return response.data;
  },

  // Integration Requests & Gateway
  async createIntegrationRequest(payload: {
    target_system: string;
    request_type: string;
    parcel_id: string;
    purpose: string;
    access_mode: 'OFFICIAL_AUTHORIZED' | 'CITIZEN_CONSENT' | 'SYSTEM_AUTHORIZED';
    data_category?: string;
  }): Promise<IntegrationRequest> {
    const response = await api.post('/integration/v1/request', payload);
    return response.data;
  },

  async getIntegrationRequest(requestId: string): Promise<IntegrationRequest> {
    const response = await api.get(`/integration/v1/request/${requestId}`);
    return response.data;
  },

  async getParcelConnectedRecords(parcelId: string): Promise<ParcelConnectedRecordsOverview> {
    const response = await api.get(`/integration/v1/parcels/${parcelId}/records`);
    return response.data;
  },

  async getHealthMetrics(): Promise<IntegrationHealthSummary> {
    const response = await api.get('/integration/v1/health');
    return response.data;
  },

  async executeSandboxTest(payload: {
    department_id: string;
    request_type: string;
    parcel_id: string;
    custom_parameters?: Record<string, any>;
  }): Promise<{
    request: IntegrationRequest;
    raw_mock_response: any;
    validation_report: {
      is_valid: boolean;
      data_quality_score: number;
      quality_tier: string;
      errors: string[];
      warnings: string[];
      checks_passed: number;
      total_checks: number;
    };
    transformation_logs: Array<{
      source_field: string;
      target_field: string;
      transformation_type: string;
      original_value: string;
      transformed_value: string;
      success: boolean;
    }>;
    standardized_record: CommonLandRecord;
    data_lineage_preview: DataLineageItem;
  }> {
    const response = await api.post('/integration/v1/test', payload);
    return response.data;
  },

  // Citizen Consent
  async getConsents(): Promise<DataAccessConsent[]> {
    const response = await api.get('/consent');
    return response.data;
  },

  async createConsentRequest(payload: {
    parcel_id: string;
    requesting_organization: string;
    data_category: string;
    purpose: string;
  }): Promise<DataAccessConsent> {
    const response = await api.post('/consent/request', payload);
    return response.data;
  },

  async grantConsent(consentId: string): Promise<DataAccessConsent> {
    const response = await api.post(`/consent/${consentId}/grant`);
    return response.data;
  },

  async denyConsent(consentId: string, reason?: string): Promise<DataAccessConsent> {
    const response = await api.post(`/consent/${consentId}/deny`, { reason });
    return response.data;
  },

  async revokeConsent(consentId: string): Promise<DataAccessConsent> {
    const response = await api.post(`/consent/${consentId}/revoke`);
    return response.data;
  },

  // Data Lineage
  async getDataLineage(params?: {
    parcel_id?: string;
    department?: string;
    data_category?: string;
    search?: string;
  }): Promise<DataLineageItem[]> {
    const response = await api.get('/data-lineage', { params });
    return response.data;
  },

  async getParcelLineage(parcelId: string): Promise<DataLineageItem[]> {
    const response = await api.get(`/data-lineage/${parcelId}`);
    return response.data;
  },

  // Admin Analytics
  async getIntegrationAnalytics(): Promise<IntegrationHealthSummary> {
    const response = await api.get('/admin/integration-analytics');
    return response.data;
  }
};
