import api from './api';
import {
  UserRoleAssignment,
  RolePermissionDefinition,
  SystemHealthMetrics,
  SystemConfigurationState,
  DetailedAuditLogRecord,
  DataQualityReport,
  EncroachmentRecord,
  LandSubdivisionRecord,
  LandMutationRecord,
  FraudPatternAlert,
  HeatMapDataset,
  LandRiskMapRecord,
  ScenarioSimulationRequest,
  ScenarioSimulationResult,
  PredictiveInsight,
  OpenDataLayerMetadata,
  HistoricalArchiveRecord,
  DataLineageRecord,
  ConsentRecord,
  BackupRecord,
  ComplianceReadinessReport
} from '../types';

export const advancedGovernanceService = {
  // 1. System Health & Monitoring
  getSystemHealth: async (): Promise<SystemHealthMetrics> => {
    const res = await api.get<SystemHealthMetrics>('/api/admin/system/health');
    return res.data;
  },

  getSystemMonitoring: async (): Promise<SystemHealthMetrics> => {
    const res = await api.get<SystemHealthMetrics>('/api/admin/system/monitoring');
    return res.data;
  },

  // 2. User & Role Management
  getUserRoleAssignments: async (): Promise<UserRoleAssignment[]> => {
    const res = await api.get<UserRoleAssignment[]>('/api/admin/users/roles');
    return res.data;
  },

  updateUserRole: async (userId: number, role: string, isActive?: boolean): Promise<UserRoleAssignment> => {
    const res = await api.put<UserRoleAssignment>(`/api/admin/users/${userId}/role`, {
      role,
      is_active: isActive
    });
    return res.data;
  },

  getRolePermissionMatrix: async (): Promise<RolePermissionDefinition[]> => {
    const res = await api.get<RolePermissionDefinition[]>('/api/admin/roles/permissions');
    return res.data;
  },

  // 3. System Configuration
  getSystemConfiguration: async (): Promise<SystemConfigurationState> => {
    const res = await api.get<SystemConfigurationState>('/api/admin/configuration');
    return res.data;
  },

  updateSystemConfiguration: async (config: Partial<SystemConfigurationState>): Promise<SystemConfigurationState> => {
    const res = await api.put<SystemConfigurationState>('/api/admin/configuration', config);
    return res.data;
  },

  // 4. Audit & Log Management
  getDetailedAuditLogs: async (params?: {
    search?: string;
    role?: string;
    module?: string;
    result?: string;
  }): Promise<DetailedAuditLogRecord[]> => {
    const res = await api.get<DetailedAuditLogRecord[]>('/api/admin/audit-logs', { params });
    return res.data;
  },

  exportAuditLogsCSV: async (): Promise<string> => {
    const logs = await advancedGovernanceService.getDetailedAuditLogs();
    const headers = ['Audit ID', 'Timestamp', 'Actor Name', 'Role', 'Module', 'Action', 'Parcel ID', 'Result', 'IP Address', 'Integrity Hash'];
    const rows = logs.map(l => [
      l.id,
      l.timestamp,
      `"${l.actor_name}"`,
      l.actor_role,
      l.module,
      `"${l.action_type}"`,
      l.parcel_id || 'N/A',
      l.result,
      l.ip_address,
      l.integrity_hash
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  // 5. Data Quality Management
  getDataQualityReport: async (): Promise<DataQualityReport> => {
    const res = await api.get<DataQualityReport>('/api/admin/data-quality');
    return res.data;
  },

  // 6. Encroachment Detection
  getEncroachmentDetections: async (parcelId?: string): Promise<EncroachmentRecord[]> => {
    const res = await api.get<EncroachmentRecord[]>('/api/governance/encroachments', {
      params: parcelId ? { parcel_id: parcelId } : undefined
    });
    return res.data;
  },

  // 7. Sub-Division & Mutation Tracking
  getLandSubdivisionRecords: async (parcelId?: string): Promise<LandSubdivisionRecord[]> => {
    const res = await api.get<LandSubdivisionRecord[]>('/api/governance/subdivisions', {
      params: parcelId ? { parcel_id: parcelId } : undefined
    });
    return res.data;
  },

  getLandMutationRecords: async (parcelId?: string): Promise<LandMutationRecord[]> => {
    const res = await api.get<LandMutationRecord[]>('/api/governance/mutations', {
      params: parcelId ? { parcel_id: parcelId } : undefined
    });
    return res.data;
  },

  // 8. Fraud Pattern Detection
  getFraudPatternAlerts: async (parcelId?: string): Promise<FraudPatternAlert[]> => {
    const res = await api.get<FraudPatternAlert[]>('/api/governance/fraud-alerts', {
      params: parcelId ? { parcel_id: parcelId } : undefined
    });
    return res.data;
  },

  // 9. GIS Heat Maps
  getHeatMapDatasets: async (category?: string): Promise<HeatMapDataset[]> => {
    const res = await api.get<HeatMapDataset[]>('/api/governance/heatmaps', {
      params: category ? { category } : undefined
    });
    return res.data;
  },

  // 10. Land Risk Maps
  getLandRiskMap: async (parcelId?: string): Promise<LandRiskMapRecord[]> => {
    const res = await api.get<LandRiskMapRecord[]>('/api/governance/risk-maps', {
      params: parcelId ? { parcel_id: parcelId } : undefined
    });
    return res.data;
  },

  // 11. Scenario Simulation
  simulateScenario: async (req: ScenarioSimulationRequest): Promise<ScenarioSimulationResult> => {
    const res = await api.post<ScenarioSimulationResult>('/api/governance/scenarios/simulate', req);
    return res.data;
  },

  // 12. Predictive Analytics
  getPredictiveInsights: async (): Promise<PredictiveInsight[]> => {
    const res = await api.get<PredictiveInsight[]>('/api/governance/predictions');
    return res.data;
  },

  // 13. Open Data Explorer & Satellite Metadata
  getOpenDataLayers: async (): Promise<OpenDataLayerMetadata[]> => {
    const res = await api.get<OpenDataLayerMetadata[]>('/api/governance/open-data');
    return res.data;
  },

  // 14. Historical Archive & Data Lineage
  getHistoricalArchive: async (parcelId: string): Promise<HistoricalArchiveRecord[]> => {
    const res = await api.get<HistoricalArchiveRecord[]>(`/api/governance/archive/${encodeURIComponent(parcelId)}`);
    return res.data;
  },

  getDataLineage: async (parcelId: string): Promise<DataLineageRecord[]> => {
    const res = await api.get<DataLineageRecord[]>(`/api/governance/lineage/${encodeURIComponent(parcelId)}`);
    return res.data;
  },

  // 15. Consent & Data Sharing
  getConsentRecords: async (parcelId?: string): Promise<ConsentRecord[]> => {
    const res = await api.get<ConsentRecord[]>('/api/security/consent', {
      params: parcelId ? { parcel_id: parcelId } : undefined
    });
    return res.data;
  },

  grantConsent: async (data: { parcel_id: string; data_category: string; purpose: string; requesting_entity: string; expiry_days: number }): Promise<ConsentRecord> => {
    const res = await api.post<ConsentRecord>('/api/security/consent', data);
    return res.data;
  },

  revokeConsent: async (consentId: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.post<{ success: boolean; message: string }>(`/api/security/consent/${consentId}/revoke`);
    return res.data;
  },

  // 16. Security Dashboard, Backup & Disaster Recovery, Compliance Readiness
  getSecurityDashboard: async (): Promise<any> => {
    const res = await api.get('/api/security/dashboard');
    return res.data;
  },

  getBackupRecords: async (): Promise<BackupRecord[]> => {
    const res = await api.get<BackupRecord[]>('/api/security/backup');
    return res.data;
  },

  triggerSimulatedBackup: async (backupType: string): Promise<BackupRecord> => {
    const res = await api.post<BackupRecord>('/api/security/backup/trigger', { backup_type: backupType });
    return res.data;
  },

  simulateDisasterRecovery: async (backupId: string): Promise<{ success: boolean; recovery_time_seconds: number; restored_records: number; message: string }> => {
    const res = await api.post(`/api/security/backup/${backupId}/simulate-restore`);
    return res.data;
  },

  getComplianceReadiness: async (): Promise<ComplianceReadinessReport> => {
    const res = await api.get<ComplianceReadinessReport>('/api/security/compliance');
    return res.data;
  }
};
