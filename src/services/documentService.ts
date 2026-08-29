import api from './api';
import {
  DocumentListItem,
  DocumentRecord,
  DocumentOCRResult,
  DocumentExtractedField,
  DocumentVerificationResult,
  DocumentMismatch,
  RequiredDocumentsResponse,
  DocumentAnalyticsOverview
} from '../types';

export const documentService = {
  // Get list of documents with optional filters
  async getDocuments(params?: {
    application_id?: string;
    document_type?: string;
    verification_status?: string;
  }): Promise<DocumentRecord[]> {
    const res = await api.get('/api/documents', { params });
    return res.data;
  },

  // Get full document details including OCR, fields, and mismatches
  async getDocumentById(documentId: string | number): Promise<DocumentRecord> {
    const res = await api.get(`/api/documents/${documentId}`);
    return res.data;
  },

  // Get OCR transcript
  async getDocumentOCR(documentId: string | number): Promise<DocumentOCRResult> {
    const res = await api.get(`/api/documents/${documentId}/ocr`);
    return res.data;
  },

  // Get extracted structured entities
  async getDocumentFields(documentId: string | number): Promise<DocumentExtractedField[]> {
    const res = await api.get(`/api/documents/${documentId}/fields`);
    return res.data;
  },

  // Get verification result score & summary
  async getDocumentVerification(documentId: string | number): Promise<DocumentVerificationResult> {
    const res = await api.get(`/api/documents/${documentId}/verification`);
    return res.data;
  },

  // Get mismatches list
  async getDocumentMismatches(documentId: string | number): Promise<DocumentMismatch[]> {
    const res = await api.get(`/api/documents/${documentId}/mismatches`);
    return res.data;
  },

  // Upload new document (supports File or FormData)
  async uploadDocument(
    fileOrFormData: File | FormData,
    documentType?: string,
    applicationId?: string,
    parcelId?: string
  ): Promise<DocumentRecord> {
    let formData: FormData;
    if (fileOrFormData instanceof FormData) {
      formData = fileOrFormData;
    } else {
      formData = new FormData();
      formData.append('file', fileOrFormData);
      if (documentType) formData.append('document_type', documentType);
      if (applicationId) formData.append('application_id', applicationId);
      if (parcelId) formData.append('parcel_id', parcelId);
    }

    const res = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Re-run OCR and cadastral comparison pipeline
  async reprocessDocument(documentId: string | number): Promise<DocumentRecord> {
    const res = await api.post(`/api/documents/${documentId}/reprocess`);
    return res.data;
  },

  async reRunPipeline(documentId: string | number): Promise<DocumentRecord> {
    return this.reprocessDocument(documentId);
  },

  // Update verification status / endorse
  async updateVerificationStatus(
    documentId: string | number,
    status: string,
    notes?: string
  ): Promise<DocumentRecord> {
    const res = await api.post(`/api/documents/${documentId}/review`, {
      action: status === 'VERIFIED' ? 'APPROVE_VERIFICATION' : status === 'MISMATCH_FOUND' ? 'REQUEST_REUPLOAD' : 'ADD_NOTE',
      remarks: notes || `Status updated to ${status}`,
    });
    if (res.data && res.data.document) {
      return res.data.document;
    }
    return this.getDocumentById(documentId);
  },

  // Officer review action (Approve verification / Request reupload)
  async reviewDocument(
    documentId: string | number,
    action: 'APPROVE_VERIFICATION' | 'REQUEST_REUPLOAD' | 'ADD_NOTE',
    remarks?: string,
    reupload_reason?: string
  ): Promise<{ status: string; message: string; document?: DocumentRecord }> {
    const res = await api.post(`/api/documents/${documentId}/review`, {
      action,
      remarks,
      reupload_reason,
    });
    return res.data;
  },

  // Application document checklist
  async getRequiredDocuments(applicationId: string): Promise<RequiredDocumentsResponse> {
    const res = await api.get(`/api/applications/${applicationId}/required-documents`);
    return res.data;
  },

  // Application uploaded documents
  async getApplicationDocuments(applicationId: string): Promise<DocumentListItem[]> {
    const res = await api.get(`/api/applications/${applicationId}/documents`);
    return res.data;
  },

  // Document Analytics
  async getDocumentAnalytics(): Promise<DocumentAnalyticsOverview> {
    const res = await api.get('/api/analytics/documents/overview');
    return res.data;
  },

  async getAnalyticsOverview(): Promise<DocumentAnalyticsOverview> {
    return this.getDocumentAnalytics();
  },

  async getAnalyticsTypes(): Promise<Array<{ document_type: string; count: number; percentage: number }>> {
    const res = await api.get('/api/analytics/documents/types');
    return res.data;
  },

  async getAnalyticsVerification(): Promise<Array<{ verification_status: string; count: number }>> {
    const res = await api.get('/api/analytics/documents/verification');
    return res.data;
  },
};

export default documentService;
