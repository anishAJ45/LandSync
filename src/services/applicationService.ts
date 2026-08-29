import api from './api';
import {
  Application,
  TimelineEvent,
  OfficerNote,
  Notification,
  AuditLog,
  AnalyticsOverview,
  StatusDistributionItem,
  ServiceTypeDistributionItem,
  MonthlyTrendItem,
  PriorityDistributionItem
} from '../types';

export const applicationService = {
  // 1. Create Application
  async createApplication(payload: {
    parcel_id: string;
    service_type: string;
    description: string;
    priority?: string;
  }): Promise<Application> {
    const response = await api.post<Application>('/api/applications', payload);
    return response.data;
  },

  // 2. List Applications
  async getApplications(params?: {
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<Application[]> {
    const response = await api.get<Application[]>('/api/applications', { params });
    return response.data;
  },

  // 3. Citizen My Applications
  async getMyApplications(): Promise<Application[]> {
    const response = await api.get<Application[]>('/api/applications/my');
    return response.data;
  },

  // 4. Officer Queue Stats
  async getOfficerQueueStats(): Promise<{
    pending_cases: number;
    under_review: number;
    verification_pending: number;
    completed_today: number;
    high_priority: number;
  }> {
    const response = await api.get('/api/applications/officer/queue-stats');
    return response.data;
  },

  // 5. Get Single Application Detail
  async getApplicationById(applicationId: string): Promise<Application> {
    const response = await api.get<Application>(`/api/applications/${applicationId}`);
    return response.data;
  },

  // 6. Update Application Status
  async updateStatus(
    applicationId: string,
    status: string,
    remarks?: string
  ): Promise<Application> {
    const response = await api.put<Application>(`/api/applications/${applicationId}/status`, {
      status,
      remarks,
    });
    return response.data;
  },

  // 7. Assign Officer
  async assignOfficer(applicationId: string, officerId: number): Promise<Application> {
    const response = await api.post<Application>(`/api/applications/${applicationId}/assign`, {
      officer_id: officerId,
    });
    return response.data;
  },

  // 8. Add Officer Note
  async addNote(
    applicationId: string,
    note: string,
    noteType: 'INTERNAL' | 'CITIZEN_VISIBLE' | 'ACTION_REQUIRED' = 'INTERNAL'
  ): Promise<OfficerNote> {
    const response = await api.post<OfficerNote>(`/api/applications/${applicationId}/notes`, {
      note,
      note_type: noteType,
    });
    return response.data;
  },

  // 9. Get Timeline
  async getTimeline(applicationId: string): Promise<TimelineEvent[]> {
    const response = await api.get<TimelineEvent[]>(`/api/applications/${applicationId}/timeline`);
    return response.data;
  },

  // 10. Citizen Resubmit
  async resubmit(applicationId: string, additionalNotes: string): Promise<Application> {
    const response = await api.post<Application>(`/api/applications/${applicationId}/resubmit`, {
      additional_notes: additionalNotes,
    });
    return response.data;
  },

  // Notifications
  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/api/notifications', {
      params: { unread_only: unreadOnly ? 'true' : 'false' },
    });
    return response.data;
  },

  async getUnreadNotificationCount(): Promise<number> {
    const response = await api.get<{ unread_count: number }>('/api/notifications/unread-count');
    return response.data.unread_count;
  },

  async markAsRead(notificationId: number): Promise<Notification> {
    const response = await api.put<Notification>(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<{ status: string; marked_read_count: number }> {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
  },

  // Analytics & Audit
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const response = await api.get<AnalyticsOverview>('/api/analytics/overview');
    return response.data;
  },

  async getStatusDistribution(): Promise<StatusDistributionItem[]> {
    const response = await api.get<StatusDistributionItem[]>('/api/analytics/applications/status');
    return response.data;
  },

  async getServiceTypeDistribution(): Promise<ServiceTypeDistributionItem[]> {
    const response = await api.get<ServiceTypeDistributionItem[]>(
      '/api/analytics/applications/service-types'
    );
    return response.data;
  },

  async getApplicationTrends(): Promise<MonthlyTrendItem[]> {
    const response = await api.get<MonthlyTrendItem[]>('/api/analytics/applications/trends');
    return response.data;
  },

  async getPriorityDistribution(): Promise<PriorityDistributionItem[]> {
    const response = await api.get<PriorityDistributionItem[]>(
      '/api/analytics/priority-distribution'
    );
    return response.data;
  },

  async getAuditLogs(limit = 50): Promise<AuditLog[]> {
    const response = await api.get<AuditLog[]>('/api/analytics/audit-logs', {
      params: { limit },
    });
    return response.data;
  },
};
