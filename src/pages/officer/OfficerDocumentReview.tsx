import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Building,
  Layers,
  ArrowRight,
  Eye,
  FileText,
  Clock,
  Sparkles,
  UserCheck,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { Document, DocumentType, DocumentVerificationStatus } from '../../types';
import { documentService } from '../../services/documentService';
import { VerificationBadge, SeverityBadge } from '../../components/documents/VerificationBadge';
import { ConfidenceMeter } from '../../components/documents/ConfidenceMeter';
import { DocumentViewer } from '../../components/documents/DocumentViewer';

export const OfficerDocumentReview: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
      if (selectedDoc) {
        const refreshed = data.find((d) => d.id === selectedDoc.id);
        if (refreshed) setSelectedDoc(refreshed);
      } else if (data.length > 0) {
        setSelectedDoc(data[0]);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleStatusUpdate = async (status: string, notes?: string) => {
    if (!selectedDoc) return;
    try {
      const updated = await documentService.updateVerificationStatus(selectedDoc.id, status, notes);
      setSelectedDoc(updated);
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setActionSuccessMessage(`Document ${selectedDoc.filename} updated to ${status.replace(/_/g, ' ')}`);
      setTimeout(() => setActionSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleReRunPipeline = async () => {
    if (!selectedDoc) return;
    try {
      const updated = await documentService.reRunPipeline(selectedDoc.id);
      setSelectedDoc(updated);
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setActionSuccessMessage(`AI & Cadastral Pipeline re-executed successfully.`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Pipeline rerun failed:', err);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.parcel_id && doc.parcel_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || doc.verification_status === statusFilter;
    const matchesType = typeFilter === 'ALL' || doc.document_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: documents.length,
    mismatches: documents.filter((d) => d.verification_status === 'MISMATCH_FOUND').length,
    reviewRequired: documents.filter((d) => d.verification_status === 'REVIEW_REQUIRED').length,
    verified: documents.filter((d) => d.verification_status === 'VERIFIED').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Cadastral Intelligence Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Document Verification & Review Queue
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Review OCR extractions, assess cadastral database discrepancies, and endorse statutory land records for mutation processing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDocuments}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Review Queue Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
            statusFilter === 'ALL' ? 'border-blue-900 ring-2 ring-blue-900/10' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total In Queue</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{stats.total}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">All submitted land records</span>
        </div>

        <div
          onClick={() => setStatusFilter('MISMATCH_FOUND')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
            statusFilter === 'MISMATCH_FOUND' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Discrepancies Flagged</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2 font-mono">{stats.mismatches}</p>
          <span className="text-[11px] text-amber-600/80 mt-1 block">Requires manual review</span>
        </div>

        <div
          onClick={() => setStatusFilter('REVIEW_REQUIRED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
            statusFilter === 'REVIEW_REQUIRED' ? 'border-orange-500 ring-2 ring-orange-500/10' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-orange-700 text-xs font-medium">
            <span>Field Hearing Required</span>
            <ShieldCheck className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-700 mt-2 font-mono">{stats.reviewRequired}</p>
          <span className="text-[11px] text-orange-600/80 mt-1 block">Pending field measurement</span>
        </div>

        <div
          onClick={() => setStatusFilter('VERIFIED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
            statusFilter === 'VERIFIED' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Endorsed & Verified</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-mono">{stats.verified}</p>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">Ready for final sanction</span>
        </div>
      </div>

      {/* Main Review Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Queue Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by deed name, parcel ID, app ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="MISMATCH_FOUND">Discrepancy Detected</option>
                <option value="REVIEW_REQUIRED">Review Required</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending OCR</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-700"
              >
                <option value="ALL">All Document Types</option>
                <option value={DocumentType.SALE_DEED}>Sale Deed</option>
                <option value={DocumentType.PATTA}>Patta / 7/12 Extract</option>
                <option value={DocumentType.ENCUMBRANCE_CERTIFICATE}>Encumbrance Cert</option>
                <option value={DocumentType.LAND_SURVEY}>Land Survey Map</option>
              </select>
            </div>
          </div>

          {/* List of items */}
          {loading ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-900" />
              Loading officer review queue...
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
              No documents match the active filters.
            </div>
          ) : (
            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                const mismatchesCount = doc.verification_result?.mismatches?.length || 0;

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-blue-950 ring-2 ring-blue-950/15 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 font-mono">
                            {doc.filename}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {doc.document_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <VerificationBadge status={doc.verification_status} size="sm" />
                    </div>

                    {doc.verification_result && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <ConfidenceMeter
                          score={doc.verification_result.confidence_score}
                          size="sm"
                        />
                        {mismatchesCount > 0 && (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {mismatchesCount} {mismatchesCount === 1 ? 'Mismatch' : 'Mismatches'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Inspection Column */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <DocumentViewer
              document={selectedDoc}
              isOfficer={true}
              onStatusUpdate={handleStatusUpdate}
              onReRunPipeline={handleReRunPipeline}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              Select a document from the queue to inspect OCR extractions and cross-match report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
