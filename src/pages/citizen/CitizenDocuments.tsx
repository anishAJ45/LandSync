import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  UploadCloud,
  Search,
  Filter,
  FileText,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Layers
} from 'lucide-react';
import { Document, DocumentType, DocumentVerificationStatus } from '../../types';
import { documentService } from '../../services/documentService';
import { VerificationBadge } from '../../components/documents/VerificationBadge';
import { ConfidenceMeter } from '../../components/documents/ConfidenceMeter';
import { DocumentUploadModal } from '../../components/documents/DocumentUploadModal';
import { DocumentViewer } from '../../components/documents/DocumentViewer';

export const CitizenDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
      if (selectedDoc) {
        const refreshed = data.find((d) => d.id === selectedDoc.id);
        if (refreshed) setSelectedDoc(refreshed);
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

  const handleUploadSuccess = (newDoc: Document) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDoc(newDoc);
  };

  const handleReRunPipeline = async () => {
    if (!selectedDoc) return;
    try {
      const updated = await documentService.reRunPipeline(selectedDoc.id);
      setSelectedDoc(updated);
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    } catch (err) {
      console.error('Pipeline rerun failed:', err);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.parcel_id && doc.parcel_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'ALL' || doc.document_type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || doc.verification_status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: documents.length,
    verified: documents.filter((d) => d.verification_status === 'VERIFIED').length,
    mismatch: documents.filter((d) => d.verification_status === 'MISMATCH_FOUND').length,
    review: documents.filter((d) => d.verification_status === 'REVIEW_REQUIRED').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 4 • Document Intelligence & Cadastral Cross-Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Citizen Document Center
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Upload statutory deeds, pattas, and survey maps. Our automated OCR engine extracts attributes and runs real-time cross-record validation against state land registry archives.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-blue-950 font-bold text-sm shadow-lg hover:shadow-teal-500/20 transition-all cursor-pointer shrink-0"
          >
            <UploadCloud className="w-5 h-5" />
            Upload Document for OCR
          </button>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Uploaded</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{stats.total}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Digitized across all applications</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Verified & Aligned</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-mono">{stats.verified}</p>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">High match confidence (≥90%)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Discrepancies Flagged</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2 font-mono">{stats.mismatch}</p>
          <span className="text-[11px] text-amber-600/80 mt-1 block">Survey or owner differences</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-orange-700 text-xs font-medium">
            <span>Officer Review Required</span>
            <ShieldCheck className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-700 mt-2 font-mono">{stats.review}</p>
          <span className="text-[11px] text-orange-600/80 mt-1 block">Pending field attestation</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List Column (5 or 12 cols if no doc selected) */}
        <div className={selectedDoc ? 'lg:col-span-5 space-y-4' : 'lg:col-span-12 space-y-4'}>
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by file name, survey number, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <button
                onClick={fetchDocuments}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Refresh Documents"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-700"
              >
                <option value="ALL">All Document Types</option>
                <option value={DocumentType.SALE_DEED}>Registered Sale Deed</option>
                <option value={DocumentType.PATTA}>Patta / 7/12 Extract</option>
                <option value={DocumentType.ENCUMBRANCE_CERTIFICATE}>Encumbrance Certificate</option>
                <option value={DocumentType.PROPERTY_TAX_RECORD}>Property Tax Receipt</option>
                <option value={DocumentType.LAND_SURVEY}>Cadastral Survey Map</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-700"
              >
                <option value="ALL">All Verification Statuses</option>
                <option value="VERIFIED">Verified & Validated</option>
                <option value="MISMATCH_FOUND">Discrepancy Detected</option>
                <option value="REVIEW_REQUIRED">Officer Review Required</option>
                <option value="PENDING">OCR In Progress</option>
              </select>
            </div>
          </div>

          {/* Documents Cards List */}
          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-900" />
              Loading digitized land documents...
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs space-y-3">
              <FileCheck2 className="w-8 h-8 mx-auto text-slate-400" />
              <p className="font-semibold text-slate-700">No documents found</p>
              <p className="max-w-xs mx-auto text-slate-400">
                Upload your first registered deed or revenue extract to initiate automatic OCR analysis.
              </p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-950 text-white font-bold text-xs shadow-2xs hover:bg-blue-900"
              >
                <UploadCloud className="w-4 h-4 text-teal-400" />
                Upload Document Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-blue-900 ring-2 ring-blue-900/10 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                            {doc.filename}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {doc.document_type.replace(/_/g, ' ')} • {(doc.file_size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <VerificationBadge status={doc.verification_status} size="sm" />
                    </div>

                    {/* Progress score bar if verified */}
                    {doc.verification_result && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <ConfidenceMeter
                          score={doc.verification_result.confidence_score}
                          size="sm"
                        />
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{new Date(doc.uploaded_at).toLocaleDateString('en-IN')}</span>
                      <span className="text-blue-900 font-semibold flex items-center gap-1">
                        View OCR Report <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Document Detail Viewer Column (7 cols when selected) */}
        {selectedDoc && (
          <div className="lg:col-span-7">
            <DocumentViewer
              document={selectedDoc}
              isOfficer={false}
              onReRunPipeline={handleReRunPipeline}
              onClose={() => setSelectedDoc(null)}
            />
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};
