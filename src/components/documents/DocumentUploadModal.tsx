import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Building,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DocumentType, Document } from '../../types';
import { documentService } from '../../services/documentService';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (doc: Document) => void;
  defaultApplicationId?: string;
  defaultParcelId?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  defaultApplicationId,
  defaultParcelId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>(DocumentType.SALE_DEED);
  const [applicationId, setApplicationId] = useState(defaultApplicationId || '');
  const [parcelId, setParcelId] = useState(defaultParcelId || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();

    if (!ext || !validExtensions.includes(ext)) {
      setError('Unsupported file type. Please upload a PDF, PNG, JPG, or JPEG file.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB statutory limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUploadAndProcess = async () => {
    if (!file) {
      setError('Please select or drop a document file first.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      setUploadStep('Uploading file and initializing secure DPI storage...');
      await new Promise(r => setTimeout(r, 600));

      setUploadStep('Executing Tesseract Optical Character Recognition (OCR)...');
      await new Promise(r => setTimeout(r, 800));

      setUploadStep('Classifying document structure and extracting cadastral fields...');
      await new Promise(r => setTimeout(r, 700));

      setUploadStep('Performing cross-record cadastral comparison against state registry...');

      const newDoc = await documentService.uploadDocument(
        file,
        docType,
        applicationId || undefined,
        parcelId || undefined
      );

      onUploadSuccess(newDoc);
      onClose();
    } catch (err: any) {
      console.error('Failed to upload document:', err);
      setError(err.response?.data?.detail || err.message || 'Document processing failed.');
    } finally {
      setIsUploading(false);
      setUploadStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-blue-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload Land Document for OCR</h3>
              <p className="text-xs text-teal-300">Automated Cadastral Verification Pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Document Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Document Classification Type *
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              disabled={isUploading}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
            >
              <option value={DocumentType.SALE_DEED}>Registered Sale Deed (Khareed Patra)</option>
              <option value={DocumentType.PATTA}>Patta / 7/12 Extract / RoR</option>
              <option value={DocumentType.ENCUMBRANCE_CERTIFICATE}>Encumbrance Certificate (EC)</option>
              <option value={DocumentType.PROPERTY_TAX_RECORD}>Property Tax Receipt / Assessment</option>
              <option value={DocumentType.LAND_SURVEY}>Cadastral Survey Map / Tippani</option>
              <option value={DocumentType.IDENTITY_DOCUMENT}>Aadhaar / Voter ID (Identity Proof)</option>
              <option value={DocumentType.OTHER}>Other Land Record Document</option>
            </select>
          </div>

          {/* Optional Linked Parcel or Application */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Link Application ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. APP-2025-001"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                disabled={isUploading}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cadastral Survey/Parcel (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. PCL-MH-PUN-001 or 124/2"
                value={parcelId}
                onChange={(e) => setParcelId(e.target.value)}
                disabled={isUploading}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Document File (Max 10MB) *
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-teal-500 bg-teal-50/50'
                  : file
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-blue-900 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                    <File className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for OCR extraction
                  </p>
                  <span className="text-[11px] text-teal-700 font-semibold mt-2 hover:underline">
                    Click to choose a different file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-950 flex items-center justify-center mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    Drag and drop your document here, or <span className="text-blue-700 underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports high-resolution PDF, PNG, JPG, and JPEG files up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Live Pipeline Progress Indicator */}
          {isUploading && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                <span>Running AI & Cadastral Verification Pipeline...</span>
              </div>
              <p className="text-xs text-blue-800 font-medium pl-6">
                {uploadStep}
              </p>
              <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadAndProcess}
            disabled={!file || isUploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Document...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-400" />
                Upload & Verify with OCR
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
