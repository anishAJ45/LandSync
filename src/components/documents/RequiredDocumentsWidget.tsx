import React from 'react';
import { FileCheck, AlertCircle, UploadCloud, Eye, CheckCircle2, FileText, Clock } from 'lucide-react';
import { Document, DocumentType, ApplicationServiceType } from '../../types';
import { VerificationBadge } from './VerificationBadge';

interface RequiredDocumentsWidgetProps {
  serviceType: ApplicationServiceType | string;
  uploadedDocuments: Document[];
  onUploadClick: (docType: DocumentType) => void;
  onViewDoc: (doc: Document) => void;
}

export const RequiredDocumentsWidget: React.FC<RequiredDocumentsWidgetProps> = ({
  serviceType,
  uploadedDocuments,
  onUploadClick,
  onViewDoc,
}) => {
  // Mapping of required docs per service type
  const getRequiredTypes = (type: string): { type: DocumentType; label: string; mandatory: boolean }[] => {
    switch (type) {
      case 'MUTATION_SALE':
      case 'MUTATION_GIFT':
      case 'MUTATION_INHERITANCE':
        return [
          { type: DocumentType.SALE_DEED, label: 'Registered Sale / Transfer Deed', mandatory: true },
          { type: DocumentType.PATTA, label: 'Latest 7/12 Extract / RoR Record', mandatory: true },
          { type: DocumentType.ENCUMBRANCE_CERTIFICATE, label: '12-Year Encumbrance Certificate', mandatory: true },
          { type: DocumentType.IDENTITY_DOCUMENT, label: 'Applicant Identity Proof (Aadhaar / Voter ID)', mandatory: true },
        ];
      case 'SUBDIVISION':
      case 'BOUNDARY_SURVEY':
        return [
          { type: DocumentType.PATTA, label: 'Current Patta / Record of Rights', mandatory: true },
          { type: DocumentType.LAND_SURVEY, label: 'Cadastral Survey Map / Field Sketch (Tippani)', mandatory: true },
          { type: DocumentType.PROPERTY_TAX_RECORD, label: 'Latest Tax Clearance Receipt', mandatory: false },
          { type: DocumentType.IDENTITY_DOCUMENT, label: 'Applicant Identity Proof', mandatory: true },
        ];
      case 'CONVERSION':
      case 'ENCUMBRANCE_CERT':
      default:
        return [
          { type: DocumentType.SALE_DEED, label: 'Title Deed Document', mandatory: true },
          { type: DocumentType.PATTA, label: '7/12 Extract / Khata Certificate', mandatory: true },
          { type: DocumentType.PROPERTY_TAX_RECORD, label: 'Property Tax Assessment Receipt', mandatory: false },
        ];
    }
  };

  const requirements = getRequiredTypes(serviceType);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Statutory Document Verification Checklist</h4>
            <p className="text-xs text-slate-500">Required proofs analyzed by OCR and Cadastral cross-check</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {requirements.map((req) => {
          const matchedDoc = uploadedDocuments.find((d) => d.document_type === req.type);

          return (
            <div key={req.type} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  {matchedDoc ? (
                    matchedDoc.verification_status === 'VERIFIED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : matchedDoc.verification_status === 'MISMATCH_FOUND' ? (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{req.label}</span>
                    {req.mandatory && (
                      <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                        Mandatory
                      </span>
                    )}
                  </div>
                  {matchedDoc ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 font-mono">{matchedDoc.filename}</span>
                      <VerificationBadge status={matchedDoc.verification_status} size="sm" />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Not uploaded yet</p>
                  )}
                </div>
              </div>

              <div>
                {matchedDoc ? (
                  <button
                    onClick={() => onViewDoc(matchedDoc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View OCR Analysis
                  </button>
                ) : (
                  <button
                    onClick={() => onUploadClick(req.type)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold shadow-2xs transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-teal-400" />
                    Upload
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
