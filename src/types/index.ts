export type UserRole = 'citizen' | 'officer' | 'admin';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CitizenDashboardData {
  user: {
    id: number;
    full_name: string;
    email: string;
    role: string;
  };
  stats: {
    my_parcels: number;
    pending_requests: number;
    verified_records: number;
    unread_notifications: number;
  };
  recent_parcels: Array<{
    parcel_id: string;
    survey_no: string;
    location: string;
    area: string;
    type: string;
    status: string;
    last_updated: string;
  }>;
  recent_activity: Array<{
    id: number;
    action: string;
    target: string;
    timestamp: string;
    status: string;
  }>;
}

export interface OfficerDashboardData {
  user: {
    id: number;
    full_name: string;
    email: string;
    role: string;
  };
  stats: {
    pending_cases: number;
    high_priority_cases: number;
    completed_today: number;
    ai_flagged_cases: number;
  };
  verification_queue: Array<{
    case_id: string;
    parcel_id: string;
    applicant_name: string;
    request_type: string;
    submitted_date: string;
    priority: string;
    ai_risk_score: string;
    status: string;
  }>;
}

export interface AdminDashboardData {
  user: {
    id: number;
    full_name: string;
    email: string;
    role: string;
  };
  stats: {
    total_users: number;
    citizens: number;
    officers: number;
    admins: number;
    system_status: string;
    api_status: string;
  };
  department_integrations: Array<{
    department: string;
    protocol: string;
    status: string;
    sync_rate: string;
  }>;
  audit_logs: Array<{
    id: string;
    actor: string;
    action: string;
    detail: string;
    timestamp: string;
  }>;
}

// ==========================================
// PHASE 2: GIS & PARCEL INTELLIGENCE TYPES
// ==========================================

export type LandUseType = 'Residential' | 'Agricultural' | 'Commercial' | 'Government';
export type ParcelStatus = 'Active' | 'Under Review' | 'Boundary Discrepancy';
export type BoundaryStatus = 'MATCH' | 'MINOR DIFFERENCE' | 'MAJOR DIFFERENCE';
export type OverlapSeverity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface ParcelHistoryItem {
  id: number;
  parcel_id: string;
  event_type: string;
  description: string;
  event_date: string;
  source: string;
  created_at: string;
}

export interface ParcelGeometryData {
  id: number;
  parcel_id: string;
  geometry_type: string;
  coordinates: number[][][];
  geojson: {
    type: string;
    coordinates: number[][][];
  };
  created_at: string;
  updated_at: string;
}

export interface Parcel {
  id: number;
  parcel_id: string;
  survey_number: string;
  subdivision: string;
  district: string;
  state: string;
  village: string;
  latitude: number;
  longitude: number;
  recorded_area: number;
  gis_area: number;
  area_unit: string;
  land_use: LandUseType | string;
  current_owner: string;
  status: ParcelStatus | string;
  created_at: string;
  updated_at: string;
  coordinates?: number[][][];
  history?: ParcelHistoryItem[];
  geometry?: ParcelGeometryData;
}

export interface NeighborParcel {
  parcel_id: string;
  survey_number: string;
  owner: string;
  land_use: string;
  relationship: 'Adjacent' | 'Nearby' | string;
  distance_approx_m?: number;
}

export interface OverlapStatus {
  has_overlap: boolean;
  overlapping_parcels: string[];
  overlap_area_acres: number;
  overlap_severity: OverlapSeverity | string;
  note: string;
}

export interface ParcelAnalysis {
  parcel_id: string;
  survey_number: string;
  village: string;
  district: string;
  state: string;
  current_owner: string;
  land_use: string;
  status: string;
  recorded_area: number;
  gis_area: number;
  area_unit: string;
  area_difference: number;
  percentage_difference: number;
  boundary_status: BoundaryStatus | string;
  neighbor_count: number;
  neighbors: NeighborParcel[];
  overlap_status: OverlapStatus;
  disclaimer: string;
}

export interface GISStatistics {
  total_parcels: number;
  residential_count: number;
  agricultural_count: number;
  commercial_count: number;
  government_count: number;
  area_mismatch_count: number;
  overlap_count: number;
  under_review_count: number;
  active_count: number;
  boundary_discrepancy_count: number;
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    id: number;
    parcel_id: string;
    survey_number: string;
    subdivision: string;
    owner: string;
    village: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
    recorded_area: number;
    gis_area: number;
    area_unit: string;
    land_use: string;
    status: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  name: string;
  features: GeoJSONFeature[];
}

// ==========================================
// PHASE 3: APPLICATIONS & WORKFLOW TYPES
// ==========================================

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFICATION_PENDING'
  | 'MORE_INFORMATION_REQUIRED'
  | 'VERIFIED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLOSED';

export type ApplicationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ApplicationServiceType =
  | 'LAND RECORD VERIFICATION'
  | 'BOUNDARY DISCREPANCY REPORT'
  | 'AREA DISCREPANCY REVIEW'
  | 'OWNERSHIP VERIFICATION'
  | 'DOCUMENT VERIFICATION'
  | 'LAND RECORD CORRECTION REQUEST'
  | 'PARCEL INFORMATION REQUEST';

export interface ApplicationStatusHistory {
  id: number;
  application_id: string;
  previous_status: string | null;
  new_status: ApplicationStatus | string;
  changed_by: string;
  remarks: string | null;
  created_at: string;
}

export interface OfficerNote {
  id: number;
  application_id: string;
  officer_id: number;
  officer_name?: string;
  note: string;
  note_type: 'INTERNAL' | 'CITIZEN_VISIBLE' | 'ACTION_REQUIRED';
  created_at: string;
}

export interface Application {
  id: number;
  application_id: string;
  parcel_id: string;
  citizen_id: number;
  citizen_name?: string;
  citizen_email?: string;
  service_type: string;
  description: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  assigned_officer_id: number | null;
  assigned_officer_name?: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  completed_at: string | null;
  survey_number?: string;
  village?: string;
  district?: string;
  current_owner?: string;
  recorded_area?: number;
  land_use?: string;
  status_history?: ApplicationStatusHistory[];
  notes?: OfficerNote[];
  parcel_details?: Parcel | null;
}

export interface TimelineEvent {
  id: string;
  event_type: 'CREATION' | 'STATUS_CHANGE' | 'OFFICER_NOTE';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  badge_variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: 'SUCCESS' | 'WARNING' | 'INFO' | 'ACTION_REQUIRED';
  is_read: boolean;
  related_application_id: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: string;
  ip_address: string;
  timestamp: string;
}

export interface AnalyticsOverview {
  total_applications: number;
  submitted: number;
  under_review: number;
  verification_pending: number;
  more_info_required: number;
  verified: number;
  approved: number;
  rejected: number;
  closed: number;
  high_priority_cases: number;
  average_processing_days: number;
  total_users: number;
  total_parcels: number;
  system_health: string;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ServiceTypeDistributionItem {
  service_type: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrendItem {
  month: string;
  submitted: number;
  verified: number;
  approved: number;
  rejected: number;
}

export interface PriorityDistributionItem {
  priority: string;
  count: number;
  color: string;
}

// ==============================================================
// PHASE 4: DOCUMENT INTELLIGENCE & AI/OCR VERIFICATION TYPES
// ==============================================================

export enum DocumentType {
  SALE_DEED = 'SALE_DEED',
  PATTA = 'PATTA',
  ENCUMBRANCE_CERTIFICATE = 'ENCUMBRANCE_CERTIFICATE',
  PROPERTY_TAX_RECORD = 'PROPERTY_TAX_RECORD',
  LAND_SURVEY = 'LAND_SURVEY_DOCUMENT',
  LAND_SURVEY_DOCUMENT = 'LAND_SURVEY_DOCUMENT',
  IDENTITY_DOCUMENT = 'IDENTITY_DOCUMENT',
  OTHER = 'OTHER_LAND_DOCUMENT',
  OTHER_LAND_DOCUMENT = 'OTHER_LAND_DOCUMENT',
}

export type DocumentProcessingStatus =
  | 'UPLOADED'
  | 'PROCESSING'
  | 'OCR_COMPLETED'
  | 'EXTRACTION_COMPLETED'
  | 'VERIFICATION_COMPLETED'
  | 'FAILED';

export type DocumentVerificationStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'MISMATCH_FOUND'
  | 'REVIEW_REQUIRED'
  | 'FAILED';

export type MatchType =
  | 'EXACT_MATCH'
  | 'FUZZY_MATCH'
  | 'MINOR_DIFFERENCE'
  | 'MISMATCH'
  | 'MISSING_IN_DOCUMENT'
  | 'MISSING_IN_SYSTEM';

export type MismatchSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DocumentOCRResult {
  id?: number;
  document_id: string;
  raw_text: string;
  cleaned_text: string;
  page_count: number;
  average_confidence: number;
  processing_time: number;
  created_at?: string;
}

export interface DocumentExtractedField {
  id?: number;
  document_id: string;
  field_name: string;
  field_value: string;
  normalized_value: string;
  confidence: number;
  source_text?: string | null;
  source_text_snippet?: string | null;
  status: 'FOUND' | 'NOT_FOUND' | 'LOW_CONFIDENCE';
  created_at?: string;
}

export interface DocumentVerificationResult {
  id?: number;
  document_id: string;
  application_id?: string | null;
  parcel_id?: string | null;
  overall_score: number;
  confidence_score: number;
  verification_status: DocumentVerificationStatus;
  confidence_level: string;
  mismatch_count: number;
  critical_mismatch_count: number;
  summary: string;
  review_required: boolean;
  mismatches?: DocumentMismatch[];
  created_at?: string;
}

export interface DocumentMismatch {
  id?: number;
  document_id: string;
  field_name: string;
  document_value?: string | null;
  system_value?: string | null;
  match_type: MatchType;
  severity: MismatchSeverity;
  confidence: number;
  description: string;
  created_at?: string;
}

export interface DocumentRecord {
  id: string | number;
  document_id: string;
  application_id?: string | null;
  parcel_id?: string | null;
  uploaded_by: number;
  uploader_name?: string;
  document_type: DocumentType | string;
  detected_type?: string | null;
  filename: string;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  mime_type: string;
  upload_status: string;
  processing_status: DocumentProcessingStatus;
  ocr_status: string;
  verification_status: DocumentVerificationStatus;
  uploaded_at: string;
  processed_at?: string | null;
  ocr_result?: DocumentOCRResult | null;
  extracted_fields?: DocumentExtractedField[];
  verification_result?: DocumentVerificationResult | null;
  mismatches?: DocumentMismatch[];
  review_notes?: string;
}

export type Document = DocumentRecord;

export interface DocumentListItem {
  id: string | number;
  document_id: string;
  application_id?: string | null;
  parcel_id?: string | null;
  uploaded_by: number;
  uploader_name?: string;
  document_type: DocumentType | string;
  detected_type?: string | null;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  processing_status: DocumentProcessingStatus;
  verification_status: DocumentVerificationStatus;
  overall_score?: number | null;
  confidence_score?: number | null;
  mismatch_count?: number;
  critical_mismatch_count?: number;
  uploaded_at: string;
  processed_at?: string | null;
}

export interface RequiredDocumentsResponse {
  application_id: string;
  service_type: string;
  required_document_types: DocumentType[];
  uploaded_documents: DocumentListItem[];
  missing_document_types: DocumentType[];
  is_complete: boolean;
  status_summary: string;
}

export interface DocumentAnalyticsOverview {
  total_documents: number;
  processing: number;
  completed: number;
  failed: number;
  average_verification_score: number;
  average_match_score: number;
  total_mismatches: number;
  mismatch_rate_percent: number;
  critical_mismatches: number;
  system_ocr_accuracy: string;
  status_distribution: { status: string; count: number }[];
  type_distribution: { document_type: string; count: number }[];
}

export type DocumentAnalytics = DocumentAnalyticsOverview;

// ==============================================================
// PHASE 5: CROSS-RECORD VERIFICATION & LAND INTELLIGENCE TYPES
// ==============================================================

export type LandVerificationSourceType =
  | 'GIS'
  | 'PARCEL_DATABASE'
  | 'DOCUMENT_OCR'
  | 'APPLICATION'
  | 'OWNERSHIP_RECORD'
  | 'HISTORICAL_RECORD'
  | 'MOCK_DEPARTMENT_API';

export type LandVerificationType =
  | 'FULL_PARCEL_VERIFICATION'
  | 'OWNERSHIP_VERIFICATION'
  | 'AREA_VERIFICATION'
  | 'SURVEY_VERIFICATION'
  | 'DOCUMENT_TO_RECORD_VERIFICATION'
  | 'HISTORICAL_CONSISTENCY_CHECK';

export type LandVerificationStatus =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REQUIRES_REVIEW'
  | 'FAILED';

export type LandComparisonResult =
  | 'EXACT_MATCH'
  | 'NORMALIZED_MATCH'
  | 'FUZZY_MATCH'
  | 'MINOR_DIFFERENCE'
  | 'MISMATCH'
  | 'MISSING_IN_SOURCE_A'
  | 'MISSING_IN_SOURCE_B'
  | 'INSUFFICIENT_DATA';

export type AlertSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type VerificationAlertType =
  | 'OWNER_MISMATCH'
  | 'SURVEY_MISMATCH'
  | 'AREA_MISMATCH'
  | 'LOCATION_MISMATCH'
  | 'HISTORICAL_CONFLICT'
  | 'BOUNDARY_CONFLICT'
  | 'DOCUMENT_CONFLICT'
  | 'MISSING_RECORD'
  | 'INTEGRATION_DATA_MISMATCH';

export type ConsistencyLevel =
  | 'HIGH_CONSISTENCY'
  | 'GOOD_CONSISTENCY'
  | 'MODERATE_CONSISTENCY'
  | 'LOW_CONSISTENCY';

export interface VerificationRecordData {
  source: LandVerificationSourceType;
  source_name: string;
  source_reference_id?: string | null;
  parcel_id?: string | null;
  survey_number?: string | null;
  subdivision?: string | null;
  owner_name?: string | null;
  father_spouse_name?: string | null;
  village?: string | null;
  district?: string | null;
  state?: string | null;
  area?: number | null;
  area_unit?: string | null;
  area_sqm?: number | null;
  land_use?: string | null;
  document_number?: string | null;
  registration_number?: string | null;
  record_date?: string | null;
  property_type?: string | null;
  boundary_north?: string | null;
  boundary_south?: string | null;
  boundary_east?: string | null;
  boundary_west?: string | null;
  status?: string | null;
  raw_data?: Record<string, any>;
}

export interface LandRecordSnapshot {
  id: number;
  verification_id: string;
  source_type: LandVerificationSourceType;
  source_name: string;
  record_reference_id?: string | null;
  record_data: VerificationRecordData | Record<string, any>;
  created_at: string;
}

export interface FieldComparisonResult {
  id: number;
  verification_id: string;
  field_name: string;
  source_a: string;
  source_b: string;
  value_a?: string | null;
  value_b?: string | null;
  normalized_value_a?: string | null;
  normalized_value_b?: string | null;
  comparison_result: LandComparisonResult;
  similarity_score: number;
  severity: AlertSeverity;
  explanation: string;
  created_at?: string;
}

export interface MatrixComparisonRow {
  field_name: string;
  field_label: string;
  gis_value?: string | null;
  database_value?: string | null;
  document_value?: string | null;
  historical_value?: string | null;
  department_value?: string | null;
  comparison_result: LandComparisonResult;
  similarity_score: number;
  severity: AlertSeverity;
  explanation: string;
}

export interface VerificationAlert {
  id: number;
  verification_id: string;
  parcel_id?: string | null;
  application_id?: string | null;
  alert_type: VerificationAlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  is_resolved: boolean;
  resolved_by?: number | string | null;
  resolved_by_name?: string | null;
  resolved_remarks?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

export interface VerificationTimelineEvent {
  step: number;
  title: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'WARNING' | 'FAILED';
  timestamp: string;
  meta?: Record<string, any>;
}

export interface LandVerification {
  id: number;
  verification_id: string; // Format: VER-2026-000001
  parcel_id: string;
  application_id?: string | null;
  requested_by: number;
  requested_by_name?: string;
  verification_type: LandVerificationType;
  status: LandVerificationStatus;
  overall_consistency_score: number;
  consistency_level: ConsistencyLevel;
  total_records_checked: number;
  matches: number;
  minor_differences: number;
  major_mismatches: number;
  critical_mismatches: number;
  summary: string;
  sources_used?: LandVerificationSourceType[];
  created_at: string;
  completed_at?: string | null;
  snapshots?: LandRecordSnapshot[];
  comparisons?: FieldComparisonResult[];
  matrix_rows?: MatrixComparisonRow[];
  alerts?: VerificationAlert[];
  timeline?: VerificationTimelineEvent[];
}

export interface VerificationAnalyticsOverview {
  total_verifications: number;
  high_consistency: number;
  review_required: number;
  critical_conflicts: number;
  average_consistency_score: number;
  most_common_mismatch_type: string;
  status_counts: { status: string; count: number }[];
  consistency_distribution: { level: string; count: number; percentage: number }[];
  mismatch_types: { alert_type: string; count: number; percentage: number }[];
  source_availability: { source_type: string; available_count: number; total_queries: number; availability_percent: number }[];
}

export interface MockDepartmentRecord {
  department: string;
  department_code: string;
  endpoint: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latency_ms: number;
  last_synced: string;
  description: string;
  sample_data: CommonLandRecord;
}

// ==========================================
// PHASE 6: LAND DNA & INTELLIGENT RISK TYPES
// ==========================================

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskSignalType =
  | 'REPEATED_SURVEY_CONFLICT'
  | 'SIGNIFICANT_AREA_CHANGE'
  | 'MULTIPLE_DOCUMENT_MISMATCHES'
  | 'REPEATED_OWNER_CONFLICT'
  | 'UNRESOLVED_CRITICAL_ALERT'
  | 'HIGH_FREQUENCY_RECORD_CHANGE'
  | 'GIS_AREA_DIFFERENCE'
  | 'DOCUMENT_DATA_INCONSISTENCY'
  | 'MISSING_CRITICAL_RECORD'
  | 'REPEATED_VERIFICATION_FAILURE'
  | 'MULTIPLE_HISTORICAL_CONFLICTS'
  | 'SUDDEN_DATA_CHANGE';

export type AnomalyType =
  | 'AREA_ANOMALY'
  | 'SURVEY_ANOMALY'
  | 'OWNER_PATTERN_ANOMALY'
  | 'DOCUMENT_ANOMALY'
  | 'HISTORICAL_CHANGE_ANOMALY'
  | 'GIS_RECORD_ANOMALY'
  | 'VERIFICATION_ANOMALY'
  | 'DATA_COMPLETENESS_ANOMALY';

export type AnomalyReviewStatus =
  | 'DETECTED'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'DISMISSED'
  | 'ACTION_REQUESTED';

export type LandHealthCategory =
  | 'EXCELLENT' // 90-100
  | 'GOOD' // 80-89
  | 'MODERATE' // 60-79
  | 'LOW' // 40-59
  | 'CRITICAL'; // <40

export interface LandDNAProfile {
  id: number;
  dna_id: string; // e.g. DNA-2026-000001
  parcel_id: string;
  identity_score: number; // 0-100
  record_consistency_score: number; // 0-100
  ownership_stability_score: number; // 0-100
  area_stability_score: number; // 0-100
  survey_stability_score: number; // 0-100
  document_consistency_score: number; // 0-100
  verification_health_score: number; // 0-100
  overall_land_health_score: number; // 0-100
  health_category: LandHealthCategory;
  risk_level: RiskLevel;
  overall_risk_score: number; // 0-100
  profile_summary: string;
  generated_at: string;
  updated_at: string;
  // Expanded embedded objects for view
  risk_assessment?: LandRiskAssessment;
  risk_signals?: RiskSignal[];
  anomalies?: LandAnomaly[];
  history?: LandDNAHistory[];
  parcel_details?: Parcel;
}

export interface LandRiskAssessment {
  id: number;
  risk_assessment_id: string; // e.g. RISK-2026-000001
  parcel_id: string;
  application_id?: string | null;
  overall_risk_score: number; // 0-100
  risk_level: RiskLevel;
  record_risk: number; // 0-100
  document_risk: number; // 0-100
  historical_risk: number; // 0-100
  area_risk: number; // 0-100
  survey_risk: number; // 0-100
  ownership_risk: number; // 0-100
  gis_risk: number; // 0-100
  summary: string;
  created_at: string;
}

export interface RiskSignal {
  id: number;
  risk_assessment_id: string;
  parcel_id: string;
  signal_type: RiskSignalType;
  signal_name: string;
  description: string;
  source: string;
  severity: AlertSeverity; // 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  risk_points: number;
  confidence: number;
  is_resolved: boolean;
  resolution_note?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

export interface LandAnomaly {
  id: number;
  anomaly_id: string; // e.g. ANOM-2026-000001
  parcel_id: string;
  application_id?: string | null;
  anomaly_type: AnomalyType;
  field_name: string;
  expected_value: string;
  observed_value: string;
  anomaly_score: number; // 0-100
  severity: AlertSeverity;
  explanation: string;
  detected_at: string;
  review_status: AnomalyReviewStatus;
  review_note?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

export interface LandDNAHistory {
  id: number;
  parcel_id: string;
  dna_profile_id: string;
  profile_snapshot_json: Record<string, any>;
  change_summary: string;
  created_at: string;
}

export interface OfficerRiskQueueItem {
  parcel_id: string;
  dna_id: string;
  survey_number: string;
  village: string;
  district: string;
  land_health_score: number;
  health_category: LandHealthCategory;
  risk_score: number;
  risk_level: RiskLevel;
  critical_signals_count: number;
  total_signals_count: number;
  unresolved_anomalies_count: number;
  last_verification_date: string;
  last_verified_score?: number;
  primary_risk_reason: string;
}

export interface AdminLandIntelligenceAnalytics {
  total_dna_profiles: number;
  average_land_health_score: number;
  average_risk_score: number;
  low_risk_count: number;
  medium_risk_count: number;
  high_risk_count: number;
  critical_risk_count: number;
  unresolved_signals_count: number;
  resolved_signals_count: number;
  total_anomalies_count: number;
  unresolved_anomalies_count: number;
  risk_distribution: { level: string; count: number; percentage: number }[];
  health_distribution: { category: string; count: number; percentage: number }[];
  anomaly_types_distribution: { anomaly_type: string; count: number; percentage: number }[];
  top_risk_signals: { signal_type: string; count: number; percentage: number }[];
  verification_health_trends: { month: string; avg_health: number; avg_risk: number }[];
}

export interface CitizenLandStatusItem {
  parcel_id: string;
  survey_number: string;
  village: string;
  district: string;
  owner_name: string;
  recorded_area: number;
  area_unit: string;
  application_id?: string | null;
  application_status?: string | null;
  verification_status: string; // 'VERIFIED' | 'UNDER_REVIEW' | 'REQUIRES_CITIZEN_ACTION'
  record_health_status: 'HEALTHY' | 'STABLE' | 'ACTION_REQUIRED' | 'UNDER_GOVERNMENT_REVIEW';
  action_required: boolean;
  action_description?: string | null;
  latest_update: string;
}

// ==========================================
// PHASE 7: LAND INTEROPERABILITY & DPI TYPES
// ==========================================

export type DepartmentSystemStatus = 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'SIMULATED';
export type AuthenticationType = 'BEARER_TOKEN' | 'API_KEY' | 'OAUTH2_SIMULATED' | 'MTLS_SIMULATED';
export type IntegrationRequestType =
  | 'PARCEL_LOOKUP'
  | 'OWNERSHIP_LOOKUP'
  | 'REGISTRATION_LOOKUP'
  | 'SURVEY_LOOKUP'
  | 'ENCUMBRANCE_LOOKUP'
  | 'LAND_USE_LOOKUP'
  | 'LITIGATION_LOOKUP'
  | 'FULL_PARCEL_SYNC';

export type AccessMode = 'OFFICIAL_AUTHORIZED' | 'CITIZEN_CONSENT' | 'SYSTEM_AUTHORIZED';

export type IntegrationRequestStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'DENIED'
  | 'EXPIRED';

export type ConsentStatus =
  | 'PENDING'
  | 'GRANTED'
  | 'DENIED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'NOT_REQUIRED';

export type DataCategory =
  | 'PARCEL_INFORMATION'
  | 'OWNERSHIP_INFORMATION'
  | 'REGISTRATION_INFORMATION'
  | 'SURVEY_INFORMATION'
  | 'DOCUMENT_INFORMATION'
  | 'ENCUMBRANCE_INFORMATION'
  | 'LAND_USE_INFORMATION'
  | 'LITIGATION_STATUS';

export type TransformationType =
  | 'STRING_NORMALIZE'
  | 'SURVEY_NUMBER_CLEANSE'
  | 'AREA_UNIT_CONVERT'
  | 'DATE_STANDARDIZE'
  | 'STATUS_CANONICALIZE'
  | 'MASK_PII';

export interface DepartmentSystem {
  id: number;
  system_id: string; // e.g. DEPT-000001
  department_name: string; // e.g. Revenue Department
  system_name: string; // e.g. Tamil Nilam Land Records
  system_type: string; // e.g. REVENUE | REGISTRATION | SURVEY | ENCUMBRANCE | MUNICIPAL | COURT | LAND_USE | FINANCIAL
  description: string;
  api_version: string;
  status: DepartmentSystemStatus;
  base_url: string;
  authentication_type: AuthenticationType;
  is_mock: boolean;
  supported_categories: DataCategory[];
  requests_count_today: number;
  success_rate: number; // 0-100
  avg_response_time_ms: number;
  last_health_check: string;
  created_at: string;
}

export interface CommonLandRecord {
  parcel_id: string;
  source_system: string;
  source_record_id: string;
  survey_number: string;
  subdivision_number: string;
  owner_name: string;
  owner_identifier_masked: string;
  village: string;
  district: string;
  state: string;
  area: number;
  area_unit: string;
  standardized_area_sqm: number;
  land_use: string;
  property_type: string;
  registration_number: string;
  registration_date: string;
  document_reference: string;
  encumbrance_status: 'FREE' | 'MORTGAGED' | 'DISPUTED' | 'UNDER_INVESTIGATION' | 'UNKNOWN';
  litigation_status: 'CLEAR' | 'PENDING_CASE' | 'STAY_ORDER' | 'DISPOSED' | 'UNKNOWN';
  record_timestamp: string;
  source_timestamp: string;
  data_version: string;
  raw_data_reference: string;
}

export interface DataTransformationLog {
  id: number;
  request_id: string;
  source_system: string;
  target_schema: string;
  source_field: string;
  target_field: string;
  transformation_type: TransformationType;
  original_value: string;
  transformed_value: string;
  success: boolean;
  created_at: string;
}

export interface DataLineageItem {
  id: number;
  lineage_id: string; // e.g. LINEAGE-2026-000001
  parcel_id: string;
  data_category: DataCategory;
  source_system: string;
  source_record_id: string;
  transformation_reference: string;
  accessed_by: string;
  access_purpose: string;
  access_mode: AccessMode;
  timestamp: string;
}

export interface DataAccessConsent {
  id: number;
  consent_id: string; // e.g. CONSENT-2026-000001
  user_id: number;
  citizen_name: string;
  parcel_id: string;
  request_id: string;
  requesting_organization: string;
  data_category: DataCategory;
  purpose: string;
  consent_status: ConsentStatus;
  granted_at?: string | null;
  expires_at?: string | null;
  revoked_at?: string | null;
  created_at: string;
}

export interface IntegrationRequest {
  id: number;
  request_id: string; // e.g. INT-2026-000001
  requesting_system: string;
  target_system: string;
  requested_by: string;
  request_type: IntegrationRequestType;
  parcel_id: string;
  purpose: string;
  access_mode: AccessMode;
  consent_id?: string | null;
  status: IntegrationRequestStatus;
  data_quality_score: number; // 0-100
  response_data?: CommonLandRecord | null;
  raw_response?: Record<string, any> | null;
  transformations?: DataTransformationLog[];
  validation_errors?: string[];
  validation_warnings?: string[];
  error_message?: string | null;
  request_timestamp: string;
  response_timestamp?: string | null;
  created_at: string;
}

export interface IntegrationHealthSummary {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  pending_requests: number;
  avg_response_time_ms: number;
  requests_today: number;
  success_rate_percentage: number;
  departments: DepartmentSystem[];
  requests_by_department: { department: string; count: number; success_rate: number }[];
  requests_by_status: { status: string; count: number; percentage: number }[];
  requests_by_category: { category: string; count: number; percentage: number }[];
  requests_timeline: { time: string; requests: number; success: number; failure: number }[];
}

export interface ParcelConnectedRecordsOverview {
  parcel_id: string;
  survey_number: string;
  village: string;
  district: string;
  overall_data_quality_score: number;
  departments_connected_count: number;
  total_departments_count: number;
  records: Array<{
    department_system: DepartmentSystem;
    available: boolean;
    last_synced: string;
    data_quality_score: number;
    source_record_id: string;
    record: CommonLandRecord | null;
    raw_preview: Record<string, any> | null;
    status: 'SYNCHRONIZED' | 'PENDING_CONSENT' | 'UNAVAILABLE' | 'OUTDATED';
  }>;
}

// ==========================================
// PHASE 8: ADVANCED GIS & SPATIAL INTELLIGENCE TYPES
// ==========================================

export type SpatialDataCategory = 'BASE_LAYER' | 'ESSENTIAL_GOVERNANCE' | 'USE_CASE_ADDITIONAL';

export type ZoningType =
  | 'PRIMARY_RESIDENTIAL'
  | 'MIXED_RESIDENTIAL'
  | 'COMMERCIAL'
  | 'INDUSTRIAL'
  | 'AGRICULTURAL'
  | 'PUBLIC_SEMI_PUBLIC'
  | 'OPEN_SPACE_RECREATION'
  | 'WATERBODY_CONSERVATION'
  | 'ECO_SENSITIVE';

export interface MasterPlanRecord {
  id: number;
  plan_id: string; // e.g. MP-CBE-2035
  plan_name: string;
  authority: string; // e.g. Coimbatore Urban Development Authority (CUDA) / DTCP
  city_or_region: string;
  plan_year: string; // e.g. "2021-2035"
  valid_from: string;
  valid_to: string;
  status: 'ACTIVE' | 'DRAFT' | 'SUPERSEDED';
  description: string;
  notification_gazette_no: string;
  created_at: string;
}

export interface ZoningRecord {
  id: number;
  zone_id: string; // e.g. ZONE-CBE-R1-042
  parcel_id: string;
  plan_id: string;
  zone_type: ZoningType;
  zone_code: string; // e.g. "R1", "C2", "AG-1"
  zone_name: string;
  permitted_uses: string[];
  prohibited_uses: string[];
  conditional_uses: string[];
  max_fsi_far: number; // e.g. 1.5, 2.0, 3.25
  max_building_height_meters: number;
  front_setback_meters: number;
  rear_setback_meters: number;
  side_setback_meters: number;
  max_coverage_percentage: number;
  buffer_required_meters: number;
  special_conditions?: string;
  created_at: string;
}

export type BuildingInspectionStatus =
  | 'APPROVED_NOT_STARTED'
  | 'UNDER_CONSTRUCTION_COMPLIANT'
  | 'UNDER_CONSTRUCTION_DEVIATION'
  | 'OCCUPANCY_CERTIFICATE_ISSUED'
  | 'UNAUTHORIZED_CONSTRUCTION'
  | 'STOP_WORK_ORDER';

export interface BuildingPermissionRecord {
  id: number;
  permission_id: string; // e.g. BP-2024-CBE-0891
  parcel_id: string;
  applicant_name: string;
  application_no: string;
  approval_date: string;
  approved_builtup_area_sqm: number;
  approved_floors: number;
  purpose: string; // e.g. "Residential G+2", "Commercial Godown"
  validity_years: number;
  inspection_status: BuildingInspectionStatus;
  deviation_flag: boolean;
  detected_deviation_percentage?: number;
  deviation_details?: string;
  approved_footprint_geojson?: any;
  created_at: string;
}

export type RestrictionZoneType =
  | 'COASTAL_REGULATION_ZONE'
  | 'RIVER_WATERBODY_BUFFER'
  | 'ARCHAEOLOGICAL_HERITAGE_BUFFER'
  | 'AIRPORT_DEFENSE_FUNNEL'
  | 'HIGH_TENSION_POWER_BUFFER'
  | 'RAILWAY_SAFETY_BUFFER'
  | 'FOREST_ECO_SENSITIVE_ZONE';

export type RestrictionLevel =
  | 'STRICT_NO_DEVELOPMENT'
  | 'CONDITIONAL_APPROVAL'
  | 'HEIGHT_RESTRICTED'
  | 'BUFFER_SETBACK_ONLY';

export interface RestrictionZoneRecord {
  id: number;
  zone_id: string; // e.g. REST-WB-001
  zone_name: string;
  zone_type: RestrictionZoneType;
  restriction_level: RestrictionLevel;
  buffer_distance_meters: number;
  enacting_law: string; // e.g. "Tamil Nadu Protection of Tanks and Eviction of Encroachment Act, 2007"
  description: string;
  affecting_parcels: string[];
  max_allowable_height_meters?: number;
  coordinates?: number[][][];
  geojson_feature?: any;
  created_at: string;
}

export type FloodRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
export type EcoSensitivityStatus = 'NORMAL' | 'SENSITIVE' | 'PROTECTED_WETLAND' | 'FOREST_CORRIDOR';

export interface EnvironmentalRecord {
  id: number;
  parcel_id: string;
  flood_risk_level: FloodRiskLevel;
  flood_zone_name: string;
  wetland_proximity_meters: number;
  waterbody_buffer_conflict: boolean;
  forest_buffer_meters: number;
  vegetation_index_ndvi: number; // -1 to +1
  historical_tree_loss_percentage: number;
  slope_grade_percentage: number;
  eco_sensitivity_status: EcoSensitivityStatus;
  soil_type: string;
  groundwater_table_depth_meters: number;
  created_at: string;
}

export type SatelliteChangeType =
  | 'NEW_CONSTRUCTION'
  | 'VEGETATION_LOSS'
  | 'WATERBODY_SHRINKAGE'
  | 'EXCAVATION_OR_MINING'
  | 'ROOF_EXPANSION'
  | 'ROAD_ENCROACHMENT';

export type SatelliteChangeStatus =
  | 'PENDING_FIELD_VERIFICATION'
  | 'CONFIRMED_UNAUTHORIZED'
  | 'LEGAL_AND_APPROVED'
  | 'RESOLVED';

export interface SatelliteChangeDetectionRecord {
  id: number;
  detection_id: string; // e.g. SAT-CHG-2026-004
  parcel_id: string;
  survey_number: string;
  detection_date: string;
  previous_image_date: string;
  current_image_date: string;
  change_type: SatelliteChangeType;
  confidence_score: number; // 0-100%
  detected_change_area_sqm: number;
  approved_permission_id?: string | null;
  violation_probability: number; // 0-100%
  ai_detection_summary: string;
  change_status: SatelliteChangeStatus;
  before_image_url: string;
  after_image_url: string;
  bounding_polygon?: number[][][];
  inspector_assigned?: string | null;
  inspector_notes?: string | null;
  created_at: string;
}

export interface SpatialTimelineEvent {
  id: number;
  parcel_id: string;
  year: number; // e.g. 1995, 2010, 2018, 2026
  event_date: string;
  event_title: string;
  event_type: 'CADASTRAL_CREATION' | 'SUBDIVISION' | 'CONVERSION' | 'CONSTRUCTION' | 'ENCROACHMENT_FLAG' | 'RESURVEY';
  before_area_acres: number;
  after_area_acres: number;
  change_summary: string;
  recorded_by: string;
  geojson_snapshot: any;
  satellite_thumbnail_url?: string;
  source_authority: string;
}

export type SpatialConflictType =
  | 'MASTER_PLAN_MISMATCH'
  | 'UNAUTHORIZED_CONSTRUCTION'
  | 'RESTRICTION_ZONE_OVERLAP'
  | 'WATERBODY_ENCROACHMENT'
  | 'GOVERNMENT_LAND_ENCROACHMENT'
  | 'ROAD_RIGHT_OF_WAY_VIOLATION';

export type SpatialConflictSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type SpatialConflictStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'NOTICE_ISSUED' | 'REGULARIZED' | 'DEMOLISHED';

export interface SpatialConflictRecord {
  id: number;
  conflict_id: string; // e.g. CONF-SPATIAL-2026-012
  parcel_id: string;
  survey_number: string;
  conflict_type: SpatialConflictType;
  severity: SpatialConflictSeverity;
  title: string;
  description: string;
  conflicting_layer: string; // e.g. "DTCP Master Plan 2035", "PWD Tank Buffer", "State Highway RoW"
  detected_overlap_area_sqm: number;
  legal_reference: string;
  recommended_action: string;
  status: SpatialConflictStatus;
  detected_at: string;
  notice_number?: string | null;
  resolution_notes?: string | null;
  action_officer?: string | null;
  coordinates?: number[][][];
}

export interface SpatialRiskFactor {
  factor_name: string;
  category: 'ZONING' | 'RESTRICTION' | 'SATELLITE_CHANGE' | 'ENVIRONMENTAL' | 'BUILDING_DEV';
  weight: number; // 0 to 1
  score: number; // 0 to 100
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  finding: string;
}

export interface SpatialRiskScore {
  parcel_id: string;
  overall_spatial_risk_score: number; // 0-100 (0=safe, 100=extreme risk)
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  master_plan_alignment_score: number; // 0-100
  restriction_zone_proximity_score: number; // 0-100
  satellite_change_risk_score: number; // 0-100
  environmental_hazard_score: number; // 0-100
  building_deviation_risk_score: number; // 0-100
  factors: SpatialRiskFactor[];
  explainable_summary: string;
  recommended_actions: string[];
}

export interface ParcelSpatial360Overview {
  parcel_id: string;
  survey_number: string;
  village: string;
  district: string;
  master_plan: MasterPlanRecord | null;
  zoning: ZoningRecord | null;
  building_permissions: BuildingPermissionRecord[];
  active_restrictions: RestrictionZoneRecord[];
  environmental: EnvironmentalRecord | null;
  recent_satellite_changes: SatelliteChangeDetectionRecord[];
  timeline_events: SpatialTimelineEvent[];
  spatial_conflicts: SpatialConflictRecord[];
  spatial_risk: SpatialRiskScore;
  infrastructure: {
    road_access_type: string;
    road_width_meters: number;
    water_pipeline_proximity_meters: number;
    ht_line_proximity_meters: number;
    property_tax_zone: string;
    annual_property_tax_inr: number;
  };
}

export interface SpatialLayerDefinition {
  id: string;
  name: string;
  category: SpatialDataCategory;
  description: string;
  enabled_by_default: boolean;
  color: string;
  fill_color: string;
  opacity: number;
  icon_name: string;
  badge_count?: number;
}

export interface SpatialAnalyticsSummary {
  total_parcels_analyzed: number;
  parcels_with_conflicts: number;
  active_encroachments_detected: number;
  unauthorized_constructions_flagged: number;
  restriction_zone_breaches: number;
  environmental_high_risk_count: number;
  avg_spatial_risk_score: number;
  conflicts_by_type: { type: string; count: number; severity: string }[];
  conflicts_by_severity: { severity: string; count: number; color: string }[];
  zoning_distribution: { zone_type: string; count: number; percentage: number }[];
  satellite_detections_timeline: { month: string; new_buildings: number; tree_loss: number; encroachments: number }[];
  high_risk_parcels: Array<{
    parcel_id: string;
    survey_number: string;
    owner: string;
    risk_score: number;
    risk_level: string;
    primary_issue: string;
  }>;
}

// =========================================================================
// PHASE 9: CIVIC, FISCAL & INFRASTRUCTURE INTEGRATION TYPES
// =========================================================================

export type PropertyTaxPaymentStatus = 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERDUE' | 'DISPUTED';

export interface PropertyTaxRecord {
  id: number;
  tax_record_id: string;
  parcel_id: string;
  ulpin: string;
  property_reference: string;
  local_body: string;
  assessment_year: string;
  property_type: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'AGRICULTURAL' | 'VACANT_LAND' | 'INSTITUTIONAL';
  assessed_value: number;
  annual_tax: number;
  amount_paid: number;
  amount_due: number;
  payment_status: PropertyTaxPaymentStatus;
  last_payment_date: string | null;
  due_date: string;
  arrears: number;
  tax_payer_name?: string;
  tax_zone?: string;
  history?: Array<{
    assessment_year: string;
    assessed_value: number;
    tax_amount: number;
    paid_amount: number;
    status: PropertyTaxPaymentStatus;
    receipt_no: string;
    payment_date: string;
  }>;
  updated_at: string;
}

export interface LandValuationReference {
  id: number;
  valuation_id: string;
  parcel_id: string;
  ulpin: string;
  location_reference: string;
  land_category: string;
  reference_rate: number;
  unit: string;
  min_rate: number;
  max_rate: number;
  effective_date: string;
  source_authority: string;
  confidence_level: 'HIGH' | 'MEDIUM' | 'PROVISIONAL';
  notes: string;
  historical_trends?: Array<{
    year: number;
    guideline_rate: number;
    market_estimate: number;
  }>;
  comparable_references?: Array<{
    location: string;
    distance_km: number;
    rate_per_sqft: number;
    category: string;
  }>;
  disclaimer: string;
  created_at: string;
}

export type UtilityConnectionStatus = 'CONNECTED' | 'AVAILABLE' | 'PENDING' | 'NOT_AVAILABLE' | 'UNDER_MAINTENANCE';

export interface WaterConnectionRecord {
  id: number;
  connection_id: string;
  parcel_id: string;
  ulpin: string;
  provider: string;
  connection_status: UtilityConnectionStatus;
  connection_type: 'DOMESTIC' | 'COMMERCIAL' | 'AGRICULTURAL' | 'INDUSTRIAL' | 'BULK_SUPPLY';
  meter_status: 'METERED_ACTIVE' | 'UNMETERED' | 'FAULTY' | 'DISCONNECTED' | 'NOT_APPLICABLE';
  supply_status: 'NORMAL_24X7' | 'INTERMITTENT_DAILY' | 'RESTRICTED' | 'MAINTENANCE_SHUTDOWN' | 'NO_SUPPLY';
  pipeline_distance_meters: number;
  pressure_bar?: number;
  application_reference?: string | null;
  created_at: string;
}

export interface ElectricityConnectionRecord {
  id: number;
  connection_id: string;
  parcel_id: string;
  ulpin: string;
  provider: string;
  connection_status: UtilityConnectionStatus;
  connection_type: 'LT_RESIDENTIAL' | 'LT_COMMERCIAL' | 'HT_INDUSTRIAL' | 'AGRICULTURAL_FREE' | 'TEMPORARY';
  meter_status: 'SMART_METER_LIVE' | 'DIGITAL_METER' | 'MECHANICAL' | 'NOT_APPLICABLE';
  service_status: 'ACTIVE_ENERGIZED' | 'SCHEDULED_OUTAGE' | 'PENDING_SANCTION' | 'DE-ENERGIZED';
  sanctioned_load_kw: number;
  transformer_id?: string;
  transformer_distance_meters: number;
  application_reference?: string | null;
  updated_at: string;
}

export type DrainageInfrastructureType = 'STORM_WATER_DRAIN' | 'SEWER_LINE' | 'SEWAGE_TREATMENT' | 'DRAINAGE_CHANNEL';

export interface DrainageInfrastructureRecord {
  id: number;
  infrastructure_id: string;
  parcel_id: string;
  ulpin: string;
  infrastructure_type: DrainageInfrastructureType;
  availability_status: 'AVAILABLE' | 'UNDER_DEVELOPMENT' | 'PLANNED' | 'NOT_AVAILABLE';
  provider: string;
  distance_to_network: number;
  connection_status: 'CONNECTED' | 'AVAILABLE_NOT_CONNECTED' | 'IN_PROGRESS' | 'NO_NETWORK';
  capacity_status?: string;
  geometry?: any;
  updated_at: string;
}

export type RoadType = 'HIGHWAY' | 'MAIN_ROAD' | 'LOCAL_ROAD' | 'PRIVATE_ROAD' | 'SERVICE_ROAD' | 'FOOTPATH';
export type RoadAccessCategory = 'GOOD_ACCESS' | 'LIMITED_ACCESS' | 'NO_DIRECT_ACCESS' | 'REQUIRES_REVIEW';

export interface RoadAccessRecord {
  id: number;
  road_access_id: string;
  parcel_id: string;
  ulpin: string;
  road_name: string;
  road_type: RoadType;
  road_width: number;
  distance_to_road: number;
  access_status: RoadAccessCategory;
  authority: string;
  right_of_way_clear: boolean;
  surface_type: 'ASPHALT' | 'CONCRETE' | 'GRAVEL' | 'UNPAVED';
  encroachment_detected: boolean;
  restrictions?: string[];
  geometry?: any;
  updated_at: string;
}

export interface RoadAccessAnalysis {
  parcel_id: string;
  nearest_road: string;
  road_distance_meters: number;
  road_type: RoadType;
  road_width_meters: number;
  access_category: RoadAccessCategory;
  access_availability: string;
  possible_access_restrictions: string[];
  access_score: number;
  recommendation: string;
}

export type InfrastructureProjectType = 'ROAD_PROJECT' | 'METRO' | 'RAILWAY' | 'WATER_PROJECT' | 'SMART_CITY' | 'PUBLIC_BUILDING' | 'UTILITY_PROJECT';
export type ProjectImpactLevel = 'NO_KNOWN_IMPACT' | 'NEARBY_PROJECT' | 'POSSIBLE_IMPACT' | 'REQUIRES_AUTHORITY_REVIEW';

export interface InfrastructureProjectRecord {
  id: number;
  project_id: string;
  project_name: string;
  project_type: InfrastructureProjectType;
  authority: string;
  status: 'PLANNED' | 'UNDER_CONSTRUCTION' | 'NEAR_COMPLETION' | 'COMPLETED' | 'ON_HOLD';
  start_date: string;
  expected_completion: string;
  description: string;
  affected_area: string;
  investment_inr_cr: number;
  influence_radius_meters: number;
  distance_to_parcel_meters?: number;
  impact_level?: ProjectImpactLevel;
  geometry?: any;
  created_at: string;
}

export interface ProjectImpactAnalysis {
  parcel_id: string;
  total_projects_within_2km: number;
  overall_impact_level: ProjectImpactLevel;
  primary_affected_project: InfrastructureProjectRecord | null;
  projects: Array<{
    project: InfrastructureProjectRecord;
    distance_meters: number;
    intersects_corridor: boolean;
    is_inside_influence_zone: boolean;
    potential_benefit_or_disruption: string;
    impact_level: ProjectImpactLevel;
  }>;
  statutory_advisory: string;
}

export type DigitalInfrastructureType = 'FIBER' | 'BROADBAND' | 'MOBILE_NETWORK' | 'PUBLIC_WIFI' | 'DIGITAL_SERVICE_POINT';

export interface DigitalInfrastructureRecord {
  id: number;
  infrastructure_id: string;
  parcel_id: string;
  ulpin: string;
  infrastructure_type: DigitalInfrastructureType;
  provider: string;
  availability_status: 'HIGH_SPEED_AVAILABLE' | 'MODERATE' | 'LIMITED' | 'PLANNED';
  connection_status: 'CONNECTED' | 'AVAILABLE_ON_DEMAND' | 'NETWORK_EDGE' | 'NO_SERVICE';
  max_speed_mbps: number;
  mobile_5g_coverage: boolean;
  nearest_digital_seva_meters: number;
  geometry?: any;
  updated_at: string;
}

export interface CivicServiceProfile {
  parcel_id: string;
  ulpin: string;
  water_status: UtilityConnectionStatus;
  electricity_status: UtilityConnectionStatus;
  drainage_status: string;
  sewerage_status: string;
  road_access_status: RoadAccessCategory;
  telecom_status: string;
  property_tax_status: PropertyTaxPaymentStatus;
  overall_civic_readiness: string;
  last_updated: string;
}

export type CivicScoreCategory = 'LIMITED' | 'BASIC' | 'GOOD' | 'WELL_CONNECTED';

export interface CivicScoreFactor {
  factor_name: string;
  score: number;
  max_score: number;
  weight: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'DEFICIENT' | 'CRITICAL';
  summary: string;
}

export interface CivicServiceScore {
  parcel_id: string;
  overall_score: number;
  score_category: CivicScoreCategory;
  water_score: number;
  electricity_score: number;
  road_access_score: number;
  drainage_score: number;
  sewerage_score: number;
  digital_score: number;
  factors: CivicScoreFactor[];
  explainable_summary: string;
  disclaimer: string;
}

export interface CivicInsight {
  id: string;
  parcel_id: string;
  insight_type: 'TAX_OWNERSHIP_MISMATCH' | 'ROAD_ACCESS_GAP' | 'UTILITY_BUILDING_GAP' | 'PROJECT_PROXIMITY' | 'TAX_LANDUSE_DISCREPANCY' | 'SERVICE_DEFICIT' | 'INFRASTRUCTURE_OPPORTUNITY';
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'POSITIVE';
  title: string;
  description: string;
  source: string;
  confidence: number;
  last_updated: string;
  requires_human_review: boolean;
  recommended_action: string;
}

export interface CivicAlert {
  id: string;
  alert_type: 'PROPERTY_TAX_OVERDUE' | 'UTILITY_CONNECTION_PENDING' | 'SERVICE_DISRUPTION' | 'INFRASTRUCTURE_PROJECT_NEARBY' | 'LIMITED_ROAD_ACCESS' | 'LOW_CIVIC_SERVICE_SCORE' | 'DATA_INCONSISTENCY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  parcel_id: string;
  ulpin: string;
  timestamp: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface CivicServiceRequest {
  id: number;
  request_id: string;
  parcel_id: string;
  citizen_name: string;
  citizen_email: string;
  service_category: 'PROPERTY_TAX_REVIEW' | 'WATER_CONNECTION' | 'ELECTRICITY_SANCTION' | 'ROAD_ACCESS_NOC' | 'SEWERAGE_CONNECTION' | 'DIGITAL_INFRASTRUCTURE';
  description: string;
  status: 'SUBMITTED' | 'UNDER_VERIFICATION' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assigned_department: string;
  submitted_at: string;
  updated_at: string;
}

export interface CivicParcel360Overview {
  parcel_id: string;
  ulpin: string;
  survey_number: string;
  village: string;
  district: string;
  current_owner: string;
  land_use: string;
  property_tax: PropertyTaxRecord | null;
  valuation: LandValuationReference | null;
  water: WaterConnectionRecord | null;
  electricity: ElectricityConnectionRecord | null;
  drainage: DrainageInfrastructureRecord | null;
  sewerage: DrainageInfrastructureRecord | null;
  road_access: RoadAccessRecord | null;
  road_analysis: RoadAccessAnalysis | null;
  digital: DigitalInfrastructureRecord | null;
  nearby_projects: InfrastructureProjectRecord[];
  project_impact: ProjectImpactAnalysis | null;
  civic_profile: CivicServiceProfile | null;
  civic_score: CivicServiceScore | null;
  civic_insights: CivicInsight[];
  active_alerts: CivicAlert[];
}

export interface CivicAnalyticsSummary {
  total_parcels: number;
  water_coverage_percentage: number;
  electricity_coverage_percentage: number;
  road_access_coverage_percentage: number;
  drainage_coverage_percentage: number;
  sewerage_coverage_percentage: number;
  digital_coverage_percentage: number;
  average_civic_score: number;
  total_tax_collected_cr: number;
  total_tax_arrears_cr: number;
  tax_compliance_percentage: number;
  active_infrastructure_projects: number;
  pending_service_requests: number;
  service_availability_by_area: Array<{
    area_name: string;
    water_pct: number;
    power_pct: number;
    road_pct: number;
    drain_pct: number;
    avg_score: number;
  }>;
  tax_payment_distribution: Array<{
    status: PropertyTaxPaymentStatus;
    count: number;
    amount_inr_lakhs: number;
    color: string;
  }>;
  civic_score_distribution: Array<{
    range: string;
    category: CivicScoreCategory;
    count: number;
    percentage: number;
    color: string;
  }>;
  infrastructure_projects: InfrastructureProjectRecord[];
  service_deficits_by_category: Array<{
    category: string;
    unserved_parcels: number;
    critical_cases: number;
  }>;
}

// ============================================================================
// PHASE 10: NATIONAL SCALABILITY & STATE CONFIGURATION ENGINE
// ============================================================================

export type SupportedLanguageCode = 'en' | 'hi' | 'ta' | 'kn' | 'ml' | 'mr' | 'pa';

export type StateConfigurationStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'TESTING';

export type StateReadinessLevel = 'NOT_READY' | 'PARTIALLY_READY' | 'CONFIGURED' | 'DEPLOYMENT_READY';

export type GovernanceContextType = 'RURAL' | 'URBAN';

export interface StateProfile {
  id: number;
  state_code: string; // e.g. 'TN', 'KA', 'KL', 'MH', 'DL', 'PB'
  state_name: string;
  country: string;
  primary_language: string;
  supported_languages: string[];
  land_record_system_name: string; // e.g. 'Tamil Nilam', 'Bhoomi', 'e-Rekha', 'MahaBhulekh'
  registration_system_name: string; // e.g. 'STAR 2.0', 'KAVERI 2.0', 'PEARL', 'iSARITA'
  survey_system_name: string; // e.g. 'CollabLand TN', 'Dishaank KA', 'Bhoo Bhoomi KL'
  default_area_unit: string; // e.g. 'Acre', 'Guntha', 'Cent', 'Square Meter'
  default_language: string;
  timezone: string;
  currency: string;
  status: StateConfigurationStatus;
  rural_structure: string[];
  urban_structure: string[];
  created_at: string;
  updated_at: string;
}

export interface StateFieldMapping {
  id: number;
  state_code: string;
  source_system: string; // e.g. 'Tamil Nilam (Patta / Chitta)', 'Bhoomi RTC'
  source_field: string; // e.g. 'patta_no', 'katha_no', 'tandaper_no', 'hissa_no'
  standard_field: string; // e.g. 'ownership_record_reference', 'subdivision_number', 'area'
  data_type: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'JSON' | 'GEOJSON';
  transformation_rule?: string; // e.g. 'CONVERT_TO_ACRES', 'TRIM_PREFIX', 'UPPERCASE', 'EXTRACT_INTEGER'
  is_required: boolean;
  description: string;
  status: 'MAPPED' | 'PENDING' | 'DEPRECATED';
}

export interface UnitConfiguration {
  id: number;
  state_code: string;
  unit_name: string; // e.g. 'Cent', 'Guntha', 'Acre', 'Hectare', 'Ground', 'Bigha', 'Biswa', 'Kanal'
  unit_category: 'AREA' | 'LENGTH' | 'VALUATION';
  conversion_to_standard: number; // multiplier to convert to Square Meters
  standard_unit: string; // 'Square Meter'
  local_symbol: string;
  description: string;
}

export interface LandTerminology {
  id: number;
  state_code: string;
  local_term: string; // e.g. 'Patta', 'Chitta', 'Adangal', 'RTC', 'Pahani', 'Thandaper', 'Satbara (7/12)'
  standard_term: string; // e.g. 'Record of Rights / Ownership Title', 'Crop Register', 'Land Account Number'
  category: 'RECORD_TYPE' | 'ADMINISTRATIVE' | 'SURVEY_TERM' | 'TENURE_TYPE' | 'VALUATION_TERM';
  language: string;
  description: string;
  context_usage: string;
}

export interface StateWorkflowStep {
  step_order: number;
  step_name: string;
  responsible_role: 'citizen' | 'officer' | 'admin' | 'revenue_inspector' | 'tahsildar' | 'surveyor';
  required_documents: string[];
  approval_required: boolean;
  sla_days: number;
  auto_verification_rules?: string[];
}

export interface StateWorkflowConfiguration {
  id: number;
  state_code: string;
  workflow_name: string; // e.g. 'Patta Mutation Workflow', 'RTC Transfer Workflow', 'Porkkalam Survey Demarcation'
  workflow_type: 'MUTATION' | 'SUBDIVISION' | 'NOC_CLEARANCE' | 'CONVERSION' | 'RECORD_CORRECTION';
  steps: StateWorkflowStep[];
  status: StateConfigurationStatus;
  version: string;
  description: string;
}

export interface StateDocumentRequirement {
  id: number;
  state_code: string;
  service_type: 'MUTATION' | 'SUBDIVISION' | 'NOC' | 'ENCUMBRANCE_CERTIFICATE' | 'BUILDING_CLEARANCE';
  document_type: string; // e.g. 'Sale Deed', 'Patta Copy', 'Aadhaar Card', 'Encumbrance Certificate', 'FMB Sketch'
  is_required: boolean;
  requirement_category: 'REQUIRED' | 'OPTIONAL' | 'CONDITIONAL';
  conditional_rule?: string; // e.g. 'If parcel has active mortgage', 'If inherited ancestral property'
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AdministrativeHierarchyLevel {
  level_number: number;
  level_name: string; // e.g. 'State', 'District', 'Taluk / Tehsil', 'Revenue Village / Ward'
  parent_level: string;
  local_name: string; // e.g. 'Vattam', 'Hobli', 'Desom', 'Firka'
  language: string;
  administrative_head: string; // e.g. 'District Collector', 'Tahsildar', 'Village Administrative Officer (VAO)'
  description: string;
}

export interface AdministrativeHierarchy {
  id: number;
  state_code: string;
  context_type: GovernanceContextType;
  levels: AdministrativeHierarchyLevel[];
}

export interface StateConnectorConfiguration {
  id: number;
  state_code: string;
  department: string; // e.g. 'Revenue Department', 'Registration Department', 'Survey & Settlement', 'Town Planning'
  connector_name: string; // e.g. 'Tamil Nilam API', 'Bhoomi Karnataka API', 'e-Rekha Kerala Gateway'
  api_version: string;
  authentication_type: 'BEARER_TOKEN' | 'OAUTH2' | 'MTLS' | 'API_KEY';
  data_format: 'REST_JSON' | 'GEOJSON' | 'CSV_BATCH' | 'SOAP_XML';
  endpoint_type: 'SYNC_REALTIME' | 'WEBHOOK_ASYNC' | 'BATCH_PULL';
  mapping_profile: string;
  status: 'ACTIVE' | 'CONNECTED' | 'SIMULATED' | 'DEGRADED';
  last_sync_timestamp: string;
  sync_success_rate: number;
}

export interface StateComparisonRow {
  state_code: string;
  state_name: string;
  primary_language: string;
  land_system: string;
  registration_system: string;
  key_local_terms: string[];
  default_unit: string;
  field_mappings_count: number;
  readiness_score: number;
  readiness_level?: StateReadinessLevel | string;
  active_connectors?: number;
  rural_subdivision_unit?: string;
  urban_subdivision_unit?: string;
}

export interface StateReadinessFactorScore {
  factor_name: string;
  score: number; // 0 - 100
  weight: number; // percentage
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NEEDS_ATTENTION';
  details: string;
}

export interface StateReadinessReport {
  state_code: string;
  state_name: string;
  overall_score: number; // 0 - 100
  readiness_level: StateReadinessLevel;
  factor_scores: {
    field_mapping: StateReadinessFactorScore;
    unit_configuration: StateReadinessFactorScore;
    terminology: StateReadinessFactorScore;
    workflow_configuration: StateReadinessFactorScore;
    document_requirements: StateReadinessFactorScore;
    administrative_hierarchy: StateReadinessFactorScore;
    api_connectors: StateReadinessFactorScore;
    gis_compatibility: StateReadinessFactorScore;
    language_support: StateReadinessFactorScore;
  };
  recommendations: string[];
  evaluated_at: string;
}

export interface StateConfigurationVersion {
  id: number;
  state_code: string;
  version: string;
  configuration_type: 'FULL_BUNDLE' | 'FIELD_MAPPING' | 'WORKFLOW' | 'UNIT_CONVERSION' | 'TERMINOLOGY';
  change_summary: string;
  created_by: string;
  created_at: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'ROLLED_BACK';
}

export interface StateNormalizationRequest {
  state_code: string;
  source_system: string;
  source_record: Record<string, any>;
}

export interface StateNormalizationResponse {
  state_code: string;
  source_system: string;
  standardized_record: {
    parcel_id: string;
    ulpin: string;
    survey_number: string;
    subdivision_number?: string;
    owner_name: string;
    owner_identifier?: string;
    area_sq_m: number;
    original_area: number;
    original_unit: string;
    land_use: string;
    registration_id?: string;
    registration_date?: string;
    administrative_units: {
      state: string;
      district: string;
      sub_district: string;
      village_or_ward: string;
    };
  };
  applied_transformations: Array<{
    source_field: string;
    standard_field: string;
    rule_applied: string;
    original_value: any;
    transformed_value: any;
  }>;
  quality_status: 'DATA_VALID' | 'DATA_WARNING' | 'DATA_ERROR';
  quality_notes: string[];
}

export interface StateDataQualityReport {
  state_code: string;
  total_records_checked: number;
  valid_count: number;
  warning_count: number;
  error_count: number;
  validation_issues: Array<{
    rule_id: string;
    severity: 'ERROR' | 'WARNING' | 'INFO';
    field: string;
    message: string;
    record_ref: string;
  }>;
  compliance_percentage: number;
}

export type ExtendedUserRole = 'citizen' | 'officer' | 'admin' | 'system_admin' | 'state_admin';

// ============================================================================
// PHASE 10.5: ADVANCED GOVERNANCE, INTELLIGENT OPERATIONS & SECURITY TYPES
// ============================================================================

export interface UserRoleAssignment {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  role: ExtendedUserRole;
  state_jurisdiction?: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
  permissions: string[];
}

export interface RolePermissionDefinition {
  role: ExtendedUserRole;
  title: string;
  description: string;
  permissions: Array<{
    code: string;
    label: string;
    description: string;
    granted: boolean;
  }>;
}

export interface SystemHealthMetrics {
  timestamp: string;
  api_status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  database_status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  gis_service_status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  ocr_service_status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  ai_engine_status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  connector_gateway_status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  total_active_users: number;
  active_citizens: number;
  active_officers: number;
  active_admins: number;
  average_latency_ms: number;
  request_volume_per_min: number;
  failed_requests_24h: number;
  uptime_percentage: number;
  recent_events: Array<{
    id: string;
    level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    source: string;
    message: string;
    timestamp: string;
  }>;
  background_jobs: Array<{
    id: string;
    name: string;
    schedule: string;
    last_run: string;
    status: 'COMPLETED' | 'RUNNING' | 'PENDING' | 'FAILED';
    duration_ms: number;
  }>;
  prototype_environment: {
    node_env: string;
    platform: string;
    version: string;
    db_type: string;
    auth_mode: string;
  };
}

export interface SystemConfigurationState {
  feature_flags: Array<{
    key: string;
    label: string;
    category: 'GIS' | 'AI' | 'DPI' | 'SECURITY' | 'STATE_CONFIG';
    enabled: boolean;
    description: string;
  }>;
  gis_settings: {
    default_zoom: number;
    default_lat: number;
    default_lng: number;
    max_resolution_meters: number;
    enable_satellite_hybrid: boolean;
    auto_refresh_cadastral: boolean;
  };
  notification_settings: {
    email_notifications: boolean;
    sms_alerts_simulated: boolean;
    in_app_toast_enabled: boolean;
    officer_sla_warning_threshold_hours: number;
  };
  workflow_settings: {
    auto_trigger_cross_verification: boolean;
    require_biometric_aadhaar_mock: boolean;
    require_dual_officer_approval_high_risk: boolean;
  };
}

export interface DetailedAuditLogRecord {
  id: string;
  actor_name: string;
  actor_email: string;
  actor_role: ExtendedUserRole;
  action_type: string;
  module: string;
  parcel_id?: string;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  timestamp: string;
  ip_address: string;
  request_id: string;
  details: Record<string, any>;
  integrity_hash: string;
}

export type DataQualityScoreLevel = 'CRITICAL' | 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';

export interface DataQualityReport {
  data_quality_score: number; // 0 - 100
  quality_level: DataQualityScoreLevel;
  total_records_analyzed: number;
  missing_data_count: number;
  duplicate_records_count: number;
  invalid_geometry_count: number;
  mapping_errors_count: number;
  incomplete_records_count: number;
  conflicting_records_count: number;
  stale_records_count: number;
  data_source_status: Array<{
    source_name: string;
    records_count: number;
    health_score: number;
    status: 'SYNCHRONIZED' | 'STALE' | 'WARNING';
    last_sync: string;
  }>;
  recent_quality_issues: Array<{
    id: string;
    parcel_id: string;
    issue_type: 'MISSING_DATA' | 'DUPLICATE' | 'INVALID_GEOMETRY' | 'MAPPING_ERROR' | 'CONFLICT' | 'STALE';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    field_affected: string;
    description: string;
    detected_at: string;
    resolved: boolean;
  }>;
}

export type EncroachmentDetectionStatus =
  | 'NO_ISSUE'
  | 'POSSIBLE_ENCROACHMENT'
  | 'HIGH_RISK_OVERLAP'
  | 'REQUIRES_HUMAN_REVIEW';

export interface EncroachmentRecord {
  id: string;
  parcel_id: string;
  ulpin: string;
  survey_number: string;
  status: EncroachmentDetectionStatus;
  risk_percentage: number;
  overlap_area_sq_m: number;
  encroached_zone_type: 'BUFFER_ZONE' | 'WATER_BODY' | 'GOVERNMENT_LAND' | 'ADJACENT_PARCEL' | 'RIGHT_OF_WAY';
  zone_description: string;
  satellite_imagery_epoch: string;
  detected_at: string;
  human_verification_notes?: string;
  disclaimer: string;
  coordinates: number[][][];
}

export interface LandSubdivisionRecord {
  id: string;
  parent_parcel_id: string;
  child_parcel_id: string;
  ulpin: string;
  subdivision_reference: string;
  effective_date: string;
  reason: string;
  status: 'PENDING_SURVEY' | 'APPROVED' | 'IN_REVIEW' | 'RECORDED';
  original_area_cents: number;
  subdivided_area_cents: number;
  parent_survey_no: string;
  child_survey_no: string;
  fmb_sketch_url?: string;
}

export interface LandMutationRecord {
  id: string;
  parcel_id: string;
  ulpin: string;
  mutation_reference: string;
  previous_owner_reference: string;
  new_owner_reference: string;
  mutation_type: 'SALE_DEED' | 'INHERITANCE_PARTITION' | 'GIFT_DEED' | 'GOVT_ACQUISITION' | 'COURT_DECREE';
  status: 'INITIATED' | 'OBJECTION_PERIOD' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
  effective_date: string;
  registered_sro: string;
  amount_inr?: number;
  workflow_stage: string;
}

export interface FraudPatternAlert {
  id: string;
  parcel_id: string;
  ulpin: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  alert_title: string;
  pattern_type:
    | 'MULTIPLE_OWNERSHIP_CHANGES_SHORT_PERIOD'
    | 'REPEATED_DOCUMENT_SUBMISSIONS'
    | 'SAME_DOC_LINKED_MULTIPLE_PARCELS'
    | 'REPEATED_FAILED_VERIFICATIONS'
    | 'UNUSUAL_AREA_CHANGES'
    | 'REGISTRATION_ANOMALIES'
    | 'CONFLICTING_OWNERSHIP_RECORDS'
    | 'UNUSUAL_TRANSACTION_PATTERNS';
  suspicion_score: number; // 0 - 100
  detection_timestamp: string;
  description: string;
  recommended_action: string;
  requires_review: boolean;
}

export interface HeatMapPoint {
  lat: number;
  lng: number;
  intensity: number; // 0 - 1
  label: string;
  parcel_id?: string;
  category: string;
}

export interface HeatMapDataset {
  id: string;
  name: string;
  description: string;
  category:
    | 'VERIFICATION_RISK'
    | 'DISPUTE_DENSITY'
    | 'DATA_QUALITY_ISSUES'
    | 'INFRASTRUCTURE_DEFICIENCY'
    | 'PENDING_SERVICE_REQUESTS'
    | 'POSSIBLE_CHANGE_DETECTION'
    | 'PARCEL_RISK_DISTRIBUTION';
  points: HeatMapPoint[];
}

export interface LandRiskMapRecord {
  parcel_id: string;
  ulpin: string;
  survey_number: string;
  owner_name: string;
  lat: number;
  lng: number;
  overall_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  composite_score: number; // 0 - 100
  factors: {
    ownership_risk: { score: number; detail: string };
    document_risk: { score: number; detail: string };
    spatial_risk: { score: number; detail: string };
    environmental_restriction: { score: number; detail: string };
    infrastructure_risk: { score: number; detail: string };
    transaction_risk: { score: number; detail: string };
    data_quality_risk: { score: number; detail: string };
  };
  explanation: string;
}

export interface ScenarioSimulationRequest {
  scenario_type:
    | 'NEW_INFRASTRUCTURE_PROJECT'
    | 'FLOOD_ZONE_EXPANSION'
    | 'ROAD_EXPANSION'
    | 'NEW_ZONING_RULE'
    | 'UTILITY_INFRASTRUCTURE_EXPANSION';
  title: string;
  target_buffer_meters: number;
  origin_lat: number;
  origin_lng: number;
  parameters: Record<string, any>;
}

export interface AffectedParcelImpact {
  parcel_id: string;
  ulpin: string;
  survey_number: string;
  owner_name: string;
  current_land_use: string;
  overlap_area_sq_m: number;
  acquisition_estimated_cost_inr: number;
  disruption_severity: 'LOW' | 'MODERATE' | 'HIGH' | 'TOTAL';
  recommended_governance_action: string;
}

export interface ScenarioSimulationResult {
  simulation_id: string;
  scenario_type: string;
  title: string;
  executed_at: string;
  total_affected_parcels: number;
  total_affected_area_sq_m: number;
  estimated_compensation_budget_inr: number;
  risk_distribution: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  affected_parcels: AffectedParcelImpact[];
  summary_insights: string[];
  disclaimer: string;
}

export interface PredictiveInsight {
  id: string;
  prediction_type:
    | 'DOCUMENT_VERIFICATION_DELAY'
    | 'HIGH_RISK_VERIFICATION_QUEUE'
    | 'POTENTIAL_INFRASTRUCTURE_DEMAND'
    | 'AREAS_LIKELY_TO_REQUIRE_REVIEW'
    | 'AREAS_WITH_INCREASING_LAND_CHANGES'
    | 'INCREASING_DATA_QUALITY_ISSUES';
  title: string;
  confidence_percentage: number;
  explanation: string;
  data_used: string[];
  generated_time: string;
  impact_level: 'LOW' | 'MEDIUM' | 'HIGH';
  recommended_action: string;
}

export interface ChatbotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggested_actions?: Array<{
    label: string;
    action_type: 'NAVIGATE' | 'SEARCH_PARCEL' | 'QUERY' | 'OPEN_MODAL';
    payload: string;
  }>;
  related_links?: Array<{
    title: string;
    url: string;
  }>;
}

export interface OpenDataLayerMetadata {
  id: string;
  name: string;
  category: 'SATELLITE_IMAGERY' | 'OPENSTREETMAP' | 'ADMINISTRATIVE' | 'ENVIRONMENTAL' | 'INFRASTRUCTURE' | 'GEOJSON_PROTOTYPE';
  source_organization: string;
  last_updated: string;
  data_type: 'RASTER_TILES' | 'VECTOR_GEOJSON' | 'WMS_OGC' | 'TABULAR';
  spatial_coverage: string;
  license_note: string;
  is_active: boolean;
  opacity: number;
}

export interface HistoricalArchiveRecord {
  id: string;
  parcel_id: string;
  archive_category: 'HISTORICAL_OWNERSHIP' | 'HISTORICAL_REGISTRATION' | 'HISTORICAL_BOUNDARIES' | 'HISTORICAL_LAND_USE' | 'HISTORICAL_DOCUMENTS' | 'HISTORICAL_VERIFICATION';
  epoch_date: string;
  title: string;
  record_reference: string;
  authorizing_body: string;
  document_url?: string;
  summary_data: Record<string, any>;
  created_at: string;
}

export interface DataLineageRecord {
  id: string;
  parcel_id: string;
  attribute_name: string;
  source_department: string;
  source_system: string;
  original_record_reference: string;
  date_received: string;
  last_updated: string;
  transformation_applied: string;
  verification_status: 'SOURCE_VERIFIED' | 'DERIVED_NORMALIZED' | 'MANUALLY_OVERRIDDEN' | 'PENDING_CONFIRMATION';
  integrity_checksum: string;
}

export interface ConsentRecord {
  id: string;
  user_id: number;
  parcel_id: string;
  data_category: 'OWNERSHIP_TITLE' | 'GIS_GEOMETRY' | 'TAX_RECEIPTS' | 'ENCUMBRANCE_HISTORY' | 'BUILDING_APPROVALS';
  purpose: 'BANK_MORTGAGE_LOAN' | 'BUILDING_PLAN_APPROVAL' | 'UTILITY_CONNECTION' | 'COURT_PROCEEDING' | 'CITIZEN_SELF_EXPORT';
  requesting_entity: string;
  consent_status: 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'PENDING_APPROVAL';
  granted_at: string;
  revoked_at?: string;
  expiry_date: string;
  access_count: number;
}

export interface BackupRecord {
  id: string;
  backup_type: 'FULL_SNAPSHOT' | 'INCREMENTAL_CADASTRAL' | 'AUDIT_LOGS_ARCHIVE' | 'USER_CONFIGS';
  status: 'SUCCESS' | 'IN_PROGRESS' | 'RESTORE_READY' | 'DEGRADED';
  file_size_mb: number;
  records_count: number;
  created_at: string;
  storage_location: string;
  integrity_verified: boolean;
  recovery_point_objective: string;
}

export interface ComplianceCategoryItem {
  category: 'DATA_PRIVACY' | 'ACCESS_CONTROL' | 'AUDITABILITY' | 'DATA_RETENTION' | 'CONSENT_FRAMEWORK' | 'SECURITY_MONITORING' | 'BACKUP_RESILIENCE' | 'API_SECURITY';
  title: string;
  status: 'COMPLIANT' | 'PARTIALLY_IMPLEMENTED' | 'NEEDS_CONFIGURATION';
  score: number; // 0 - 100
  controls_verified: string[];
  notes: string;
}

export interface ComplianceReadinessReport {
  overall_compliance_percentage: number;
  assessment_tier: 'HIGH_READINESS' | 'STANDARD_READINESS' | 'PROVISIONAL';
  evaluation_date: string;
  disclaimer: string;
  categories: ComplianceCategoryItem[];
}







