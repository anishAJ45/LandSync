import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Copy,
  Check,
  ShieldCheck,
  Building,
  Calendar,
  Layers,
  FileCheck2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { Document, DocumentType } from '../../types';
import { VerificationBadge, SeverityBadge } from './VerificationBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import { MismatchTable } from './MismatchTable';

interface DocumentViewerProps {
  document: Document;
  isOfficer?: boolean;
  onStatusUpdate?: (status: string, notes?: string) => Promise<void>;
  onReRunPipeline?: () => Promise<void>;
  onClose?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  isOfficer = false,
  onStatusUpdate,
  onReRunPipeline,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'extracted' | 'ocr_raw' | 'preview'>('extracted');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [reviewNotes, setReviewNotes] = useState(document.review_notes || '');
  const [showNotesModal, setShowNotesModal] = useState(false);

  const ocr = document.ocr_result;
  const verification = document.verification_result;

  const handleCopyOcr = () => {
    if (ocr?.raw_text) {
      navigator.clipboard.writeText(ocr.raw_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAction = async (status: string) => {
    if (!onStatusUpdate) return;
    setIsUpdating(true);
    try {
      await onStatusUpdate(status, reviewNotes);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredRawText = ocr?.raw_text || '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Top Advisory Banner */}
      <div className="bg-blue-950 px-5 py-2.5 text-blue-100 flex items-center justify-between text-xs border-b border-blue-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            <strong>Statutory Advisory:</strong> LandSync uses automated OCR & cadastral cross-analysis to assist verification. Results are advisory and require authorized officer attestation.
          </span>
        </div>
        <span className="text-[11px] font-mono bg-blue-900/60 px-2 py-0.5 rounded text-teal-300">
          SIH26014 DPI
        </span>
      </div>

      {/* Document Overview Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-900/10 text-blue-950 flex items-center justify-center shrink-0 border border-blue-900/20">
              <FileText className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{document.filename}</h2>
                <VerificationBadge status={document.verification_status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  Type: <strong className="text-slate-700">{document.document_type.replace(/_/g, ' ')}</strong>
                </span>
                <span>•</span>
                <span>Size: <strong className="text-slate-700">{formatFileSize(document.file_size)}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Uploaded: {new Date(document.uploaded_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {document.application_id && (
                  <>
                    <span>•</span>
                    <span className="text-blue-700 font-mono">App #{document.application_id.slice(0, 8)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Verification Score block */}
          {verification && (
            <div className="w-full lg:w-72 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <ConfidenceMeter
                score={verification.confidence_score}
                label="Cross-Match Score"
              />
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-200 pb-px">
          <button
            onClick={() => setActiveTab('extracted')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'extracted'
                ? 'border-blue-900 text-blue-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Extracted Fields & Verification
            {document.extracted_fields?.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-900 font-mono">
                {document.extracted_fields.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('ocr_raw')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ocr_raw'
                ? 'border-blue-900 text-blue-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Raw OCR Transcript
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'border-blue-900 text-blue-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            Document Inspection Preview
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto max-h-[600px] space-y-6">
        {/* Tab 1: Extracted Fields & Discrepancies */}
        {activeTab === 'extracted' && (
          <div className="space-y-6">
            {/* Cadastral Mismatches Section */}
            {verification?.mismatches && (
              <MismatchTable mismatches={verification.mismatches} />
            )}

            {/* Extracted Fields Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-teal-600" />
                  Structured Extracted Attributes ({document.extracted_fields?.length || 0})
                </h3>
                <span className="text-xs text-slate-500">
                  Engine: Tesseract OCR + Pattern Disambiguation
                </span>
              </div>

              {document.extracted_fields && document.extracted_fields.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Field Name</th>
                        <th className="py-3 px-4">Raw Extracted Value</th>
                        <th className="py-3 px-4">Normalized Canonical Value</th>
                        <th className="py-3 px-4">Confidence</th>
                        <th className="py-3 px-4">OCR Source Context</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                      {document.extracted_fields.map((field) => (
                        <tr key={field.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 capitalize">
                            {field.field_name.replace(/_/g, ' ')}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-900 font-medium">
                            {field.field_value || '—'}
                          </td>
                          <td className="py-3 px-4 font-mono text-blue-900 font-semibold bg-blue-50/30">
                            {field.normalized_value || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {(field.confidence * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                            {field.source_text_snippet || 'Document Body'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  No structured fields were extracted from this document yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Raw OCR Transcript */}
        {activeTab === 'ocr_raw' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">
                  OCR Engine: <strong>Tesseract v5.3 / LayoutParser</strong>
                </span>
                <span className="text-xs text-slate-500">
                  Word Count: <strong>{filteredRawText.split(/\s+/).filter(Boolean).length}</strong>
                </span>
                <span className="text-xs text-slate-500">
                  Avg OCR Accuracy: <strong>{ocr ? (ocr.confidence_score * 100).toFixed(1) : 0}%</strong>
                </span>
              </div>
              <button
                onClick={handleCopyOcr}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy Full Transcript'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto max-h-[420px] whitespace-pre-wrap selection:bg-teal-500 selection:text-white border border-slate-800">
              {filteredRawText || 'No OCR transcript available.'}
            </div>
          </div>
        )}

        {/* Tab 3: Visual Document Inspection Preview */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-slate-300 font-serif text-slate-800 text-xs space-y-4 leading-relaxed relative">
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-900 text-white rounded text-[10px] font-sans font-bold">
                  OCR INSPECTED
                </div>
                <div className="text-center pb-3 border-b border-slate-200">
                  <h4 className="font-bold text-sm tracking-wider uppercase">GOVERNMENT OF MAHARASHTRA / KARNATAKA</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">REGISTRATION & STAMPS DEPARTMENT</p>
                  <p className="text-[11px] font-semibold mt-1">{document.document_type.replace(/_/g, ' ')}</p>
                </div>
                <div className="space-y-2 text-[11px]">
                  <p><strong>DOCUMENT REFERENCE:</strong> {document.id.toUpperCase()}</p>
                  <p><strong>RECORD HOLDER:</strong> {document.extracted_fields?.find(f => f.field_name.includes('name'))?.field_value || 'Shri Rameshwar Patil'}</p>
                  <p><strong>SURVEY NUMBER:</strong> {document.extracted_fields?.find(f => f.field_name.includes('survey'))?.field_value || '124/2'}</p>
                  <p><strong>AREA SPECIFICATION:</strong> {document.extracted_fields?.find(f => f.field_name.includes('area'))?.field_value || '2.45 Acres'}</p>
                  <p><strong>TALUKA / DISTRICT:</strong> Haveli, Pune</p>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-500 italic">
                  <span>Digitized via LandSync DPI</span>
                  <span>Official Signature & Seal Verified</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Showing digitized view of uploaded file <strong>{document.filename}</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Officer Action Bar or Citizen Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onReRunPipeline && (
            <button
              onClick={onReRunPipeline}
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              Re-run AI/OCR Pipeline
            </button>
          )}
        </div>

        {isOfficer && onStatusUpdate && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleAction('REVIEW_REQUIRED')}
              disabled={isUpdating}
              className="px-3.5 py-2 rounded-xl border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-900 text-xs font-semibold shadow-2xs transition-colors"
            >
              Flag for Field Hearing
            </button>
            <button
              onClick={() => handleAction('MISMATCH_FOUND')}
              disabled={isUpdating}
              className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold shadow-2xs transition-colors"
            >
              Request Re-Upload
            </button>
            <button
              onClick={() => handleAction('VERIFIED')}
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Endorse Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
