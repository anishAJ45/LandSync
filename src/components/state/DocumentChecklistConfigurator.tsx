import React, { useState } from 'react';
import { StateDocumentRequirement } from '../../types';
import { FileText, CheckCircle2, AlertTriangle, Info, ShieldCheck, Filter } from 'lucide-react';

interface DocumentChecklistConfiguratorProps {
  documents: StateDocumentRequirement[];
  stateCode: string;
  onSelectServiceType?: (serviceType: string) => void;
}

export const DocumentChecklistConfigurator: React.FC<DocumentChecklistConfiguratorProps> = ({
  documents,
  stateCode,
  onSelectServiceType
}) => {
  const [selectedService, setSelectedService] = useState<string>('MUTATION');
  const [uploadedDocTypes, setUploadedDocTypes] = useState<Record<string, boolean>>({
    'Registered Sale Deed (கிரைய பத்திரம்)': true,
    'Current Patta / Chitta Copy (நடப்பு பட்டா நகல்)': true
  });

  const filteredDocs = documents.filter((d) => d.service_type === selectedService);

  const toggleUpload = (docType: string) => {
    setUploadedDocTypes((prev) => ({
      ...prev,
      [docType]: !prev[docType]
    }));
  };

  const requiredList = filteredDocs.filter((d) => d.requirement_category === 'REQUIRED');
  const conditionalList = filteredDocs.filter((d) => d.requirement_category === 'CONDITIONAL');
  const optionalList = filteredDocs.filter((d) => d.requirement_category === 'OPTIONAL');

  const requiredUploadedCount = requiredList.filter((d) => uploadedDocTypes[d.document_type]).length;
  const isComplete = requiredUploadedCount === requiredList.length && requiredList.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-800" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Smart Document Checklist Engine ({stateCode})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamically generates mandatory, conditional, and optional submission documents tailored to state revenue rules.
          </p>
        </div>

        {/* Service Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Service:</label>
          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              if (onSelectServiceType) onSelectServiceType(e.target.value);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
          >
            <option value="MUTATION">Title Mutation / Transfer</option>
            <option value="SUBDIVISION">Subdivision & Partition</option>
            <option value="NOC">No Objection Certificate (NOC)</option>
            <option value="ENCUMBRANCE_CERTIFICATE">Encumbrance Search</option>
          </select>
        </div>
      </div>

      {/* Readiness Status Bar */}
      <div className={`mt-5 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isComplete ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-amber-50/80 border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-center gap-3">
          {isComplete ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" />
          )}
          <div>
            <div className="font-extrabold text-sm">
              {isComplete ? 'Checklist Complete: Ready for Instant Automated SRO Sync' : 'Checklist Incomplete: Mandatory State Documents Missing'}
            </div>
            <div className="text-xs opacity-80 mt-0.5">
              {requiredUploadedCount} of {requiredList.length} mandatory documents verified.
            </div>
          </div>
        </div>

        <div className="text-xs font-bold px-3 py-1 bg-white/80 rounded-lg shadow-2xs">
          Interactive Simulation Mode
        </div>
      </div>

      {/* Document Groups */}
      <div className="mt-6 space-y-5">
        {/* Required Documents */}
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>1. Mandatory Required Documents ({requiredList.length})</span>
          </div>

          <div className="space-y-2">
            {requiredList.map((doc) => {
              const isChecked = !!uploadedDocTypes[doc.document_type];
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleUpload(doc.document_type)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleUpload(doc.document_type)}
                      className="w-4 h-4 rounded text-teal-800 focus:ring-teal-700 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{doc.document_type}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{doc.description}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isChecked ? '✓ Verified' : '⚠ Required'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conditional Documents */}
        {conditionalList.length > 0 && (
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>2. Conditional Requirements ({conditionalList.length})</span>
            </div>

            <div className="space-y-2">
              {conditionalList.map((doc) => {
                const isChecked = !!uploadedDocTypes[doc.document_type];
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleUpload(doc.document_type)}
                    className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/30 hover:bg-amber-50/60 transition cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleUpload(doc.document_type)}
                        className="w-4 h-4 rounded text-teal-800 focus:ring-teal-700 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{doc.document_type}</div>
                        <div className="text-[11px] text-amber-900 font-semibold mt-0.5">
                          Rule: {doc.conditional_rule}
                        </div>
                        <div className="text-[11px] text-slate-500">{doc.description}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {isChecked ? '✓ Attached' : 'ⓘ Conditional'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
