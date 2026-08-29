import {
  MasterPlanRecord,
  ZoningRecord,
  BuildingPermissionRecord,
  RestrictionZoneRecord,
  EnvironmentalRecord,
  SatelliteChangeDetectionRecord,
  SpatialTimelineEvent,
  SpatialConflictRecord,
  SpatialRiskScore,
  SpatialAnalyticsSummary
} from '../types';

const API_BASE = '/api/spatial';

function getAuthHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const spatialService = {
  // Master Plans
  async getMasterPlans(): Promise<MasterPlanRecord[]> {
    const res = await fetch(`${API_BASE}/master-plans`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch master plans');
    return res.json();
  },

  async getMasterPlanById(planId: string): Promise<MasterPlanRecord> {
    const res = await fetch(`${API_BASE}/master-plans/${planId}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch master plan details');
    return res.json();
  },

  // Zoning
  async getZoningList(params?: { parcel_id?: string; zone_type?: string; plan_id?: string }): Promise<ZoningRecord[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/zoning?${query}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch zoning records');
    return res.json();
  },

  async getZoningByParcel(parcelId: string): Promise<ZoningRecord> {
    const res = await fetch(`${API_BASE}/zoning/${parcelId}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch parcel zoning');
    return res.json();
  },

  // Building Permissions
  async getBuildingPermissions(params?: { parcel_id?: string; deviation_only?: boolean }): Promise<BuildingPermissionRecord[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/building-permissions?${query}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch building permissions');
    return res.json();
  },

  async getBuildingPermissionsByParcel(parcelId: string): Promise<BuildingPermissionRecord[]> {
    const res = await fetch(`${API_BASE}/building-permissions/${parcelId}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch parcel building permissions');
    return res.json();
  },

  async registerBuildingPermission(data: Partial<BuildingPermissionRecord>): Promise<BuildingPermissionRecord> {
    const res = await fetch(`${API_BASE}/building-permissions`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to register building permission');
    return res.json();
  },

  // Restriction Zones
  async getRestrictionZones(zone_type?: string): Promise<RestrictionZoneRecord[]> {
    const query = zone_type ? `?zone_type=${zone_type}` : '';
    const res = await fetch(`${API_BASE}/restriction-zones${query}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch restriction zones');
    return res.json();
  },

  async checkParcelRestrictions(parcelId: string): Promise<{ parcel_id: string; total_affecting_zones: number; restriction_level: string; zones: RestrictionZoneRecord[] }> {
    const res = await fetch(`${API_BASE}/restriction-zones/check/${parcelId}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to check parcel restrictions');
    return res.json();
  },

  // Environmental Intelligence
  async getEnvironmentalData(parcelId: string): Promise<EnvironmentalRecord> {
    const res = await fetch(`${API_BASE}/environmental/${parcelId}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch environmental intelligence');
    return res.json();
  },

  // Satellite Change Detection
  async getSatelliteChanges(params?: { parcel_id?: string; change_type?: string; status?: string }): Promise<SatelliteChangeDetectionRecord[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/satellite-changes?${query}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch satellite changes');
    return res.json();
  },

  async getSatelliteChangesByParcel(parcelId: string): Promise<SatelliteChangeDetectionRecord[]> {
    const res = await fetch(`${API_BASE}/satellite-changes/${parcelId}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch parcel satellite changes');
    return res.json();
  },

  async simulateSatelliteScan(parcelId: string): Promise<SatelliteChangeDetectionRecord> {
    const res = await fetch(`${API_BASE}/satellite-changes/simulate`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify({ parcel_id: parcelId })
    });
    if (!res.ok) throw new Error('Failed to run satellite change detection');
    return res.json();
  },

  async updateSatelliteChangeStatus(id: number | string, status: string, notes?: string): Promise<SatelliteChangeDetectionRecord> {
    const res = await fetch(`${API_BASE}/satellite-changes/${id}/status`, {
      method: 'PUT',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify({ change_status: status, inspector_notes: notes })
    });
    if (!res.ok) throw new Error('Failed to update change detection status');
    return res.json();
  },

  // Historical Spatial Timeline
  async getSpatialTimeline(parcelId: string): Promise<SpatialTimelineEvent[]> {
    const res = await fetch(`${API_BASE}/timeline/${parcelId}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch spatial timeline');
    return res.json();
  },

  // Spatial Conflicts & Encroachments
  async getSpatialConflicts(params?: { parcel_id?: string; severity?: string; conflict_type?: string; status?: string }): Promise<SpatialConflictRecord[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/conflicts?${query}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch spatial conflicts');
    return res.json();
  },

  async getSpatialConflictsByParcel(parcelId: string): Promise<SpatialConflictRecord[]> {
    const res = await fetch(`${API_BASE}/conflicts/${parcelId}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch parcel spatial conflicts');
    return res.json();
  },

  async resolveSpatialConflict(conflictId: string | number, new_status: string, resolution_notes: string): Promise<SpatialConflictRecord> {
    const res = await fetch(`${API_BASE}/conflicts/${conflictId}/resolve`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify({ new_status, resolution_notes })
    });
    if (!res.ok) throw new Error('Failed to resolve spatial conflict');
    return res.json();
  },

  // Spatial Risk Score
  async getSpatialRiskScore(parcelId: string): Promise<SpatialRiskScore> {
    const res = await fetch(`${API_BASE}/risk-score/${parcelId}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch spatial risk score');
    return res.json();
  },

  // Comprehensive Spatial 360
  async getSpatialParcel360(parcelId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/parcel-360-spatial/${parcelId}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch spatial 360 profile');
    return res.json();
  },

  // Advanced Spatial Analytics
  async getSpatialAnalytics(): Promise<SpatialAnalyticsSummary> {
    const res = await fetch(`${API_BASE}/analytics`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch spatial analytics');
    return res.json();
  },

  // GeoJSON Layer
  async getVectorLayerGeoJson(layerId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/layers/${layerId}`, { credentials: 'include', headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch vector layer ${layerId}`);
    return res.json();
  }
};
