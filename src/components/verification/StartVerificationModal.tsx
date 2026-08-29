import React, { useState, useEffect } from 'react';
import { parcelService } from '../../services/parcelService';
import { applicationService } from '../../services/applicationService';
import { verificationService } from '../../services/verificationService';
import { Parcel, LandVerification } from '../../types';
import { X, Play, Loader2, Sparkles, CheckSquare, Square, Layers } from 'lucide-react';

interface StartVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newVerification: LandVerification) => void;
  initialParcelId?: string;
  initialApplicationId?: string;
}

export const StartVerificationModal: React.FC<StartVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialParcelId = '',
  initialApplicationId = '',
}) => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState(initialParcelId);
  const [selectedAppId, setSelectedAppId] = useState(initialApplicationId);
  const [verificationType, setVerificationType] = useState('FULL_PARCEL_VERIFICATION');
  const [sources, setSources] = useState<string[]>([
    'GIS',
    'PARCEL_DATABASE',
    'DOCUMENT_OCR',
    'APPLICATION',
    'HISTORICAL_RECORD',
    'MOCK_DEPARTMENT_API',
  ]);
  const [loadingParcels, setLoadingParcels] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadParcels();
      if (initialParcelId) setSelectedParcelId(initialParcelId);
      if (initialApplicationId) setSelectedAppId(initialApplicationId);
    }
  }, [isOpen, initialParcelId, initialApplicationId]);

  const loadParcels = async () => {
    try {
      setLoadingParcels(true);
      const res = await parcelService.getAllParcels();
      setParcels(res);
      if (!selectedParcelId && res.length > 0) {
        setSelectedParcelId(res[0].parcel_id);
      }
    } catch (err) {
      console.error('Failed to load parcels:', err);
    } finally {
      setLoadingParcels(false);
    }
  };

  const toggleSource = (src: string) => {
    if (sources.includes(src)) {
      if (sources.length > 1) {
        setSources(sources.filter((s) => s !== src));
      }
    } else {
      setSources([...sources, src]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcelId) return;

    try {
      setIsSubmitting(true);
      setPipelineStep(1);

      // Simulate real-time pipeline execution animation
      await new Promise((r) => setTimeout(r, 600));
      setPipelineStep(2);
      await new Promise((r) => setTimeout(r, 600));
      setPipelineStep(3);
      await new Promise((r) => setTimeout(r, 600));

      const newVer = await verificationService.createVerification({
        parcel_id: selectedParcelId,
        application_id: selectedAppId || undefined,
        verification_type: verificationType,
        sources,
      });

      setPipelineStep(4);
      await new Promise((r) => setTimeout(r, 400));

      onSuccess(newVer);
      onClose();
    } catch (err) {
      console.error('Failed to initiate verification:', err);
    } finally {
      setIsSubmitting(false);
      setPipelineStep(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Run Cross-Record Verification</h3>
              <p className="text-xs text-slate-500">
                Execute intelligent multi-source reconciliation engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitting ? (
          /* Execution Simulation Animation */
          <div className="py-8 space-y-4 text-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                {pipelineStep === 1 && 'Collecting Immutable Snapshots...'}
                {pipelineStep === 2 && 'Normalizing Survey & Extent Tokens...'}
                {pipelineStep === 3 && 'Executing Multi-Field Similarity Engine...'}
                {pipelineStep === 4 && 'Computing Consistency Score & Alerts...'}
              </h4>
              <p className="text-xs text-slate-500">
                Harmonizing spatial, deed, revenue, and department records in real-time
              </p>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className="bg-indigo-600 h-full transition-all duration-500"
                style={{ width: `${((pipelineStep || 1) / 4) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Target Parcel Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Target Land Parcel <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedParcelId}
                onChange={(e) => setSelectedParcelId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {parcels.map((p) => (
                  <option key={p.parcel_id} value={p.parcel_id}>
                    {p.parcel_id} — Survey {p.survey_number} ({p.current_owner}, {p.recorded_area} {p.area_unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Application Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link Citizen Service Application (Optional)
              </label>
              <input
                type="text"
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                placeholder="e.g. LS-2026-000001"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Verification Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Scope & Type
              </label>
              <select
                value={verificationType}
                onChange={(e) => setVerificationType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="FULL_PARCEL_VERIFICATION">Full Parcel 360° Comprehensive Verification</option>
                <option value="OWNERSHIP_VERIFICATION">Ownership & Title Identity Verification</option>
                <option value="AREA_VERIFICATION">Area & Spatial Boundary Verification</option>
                <option value="SURVEY_VERIFICATION">Survey Number & Subdivision Verification</option>
                <option value="DOCUMENT_TO_RECORD_VERIFICATION">Document OCR to Master Registry Cross-Check</option>
                <option value="HISTORICAL_CONSISTENCY_CHECK">Historical Chain of Title Continuity Check</option>
              </select>
            </div>

            {/* Data Sources Checklist */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                <span>Active Data Sources ({sources.length} selected)</span>
                <Layers className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'GIS', label: 'GIS Cadastral Spatial' },
                  { id: 'PARCEL_DATABASE', label: 'State Master Registry DB' },
                  { id: 'DOCUMENT_OCR', label: 'Document Intelligence OCR' },
                  { id: 'APPLICATION', label: 'Citizen Portal Application' },
                  { id: 'HISTORICAL_RECORD', label: 'Historical Chain of Title' },
                  { id: 'MOCK_DEPARTMENT_API', label: 'Department Integrations (Mock)' },
                ].map((src) => {
                  const isChecked = sources.includes(src.id);
                  return (
                    <button
                      type="button"
                      key={src.id}
                      onClick={() => toggleSource(src.id)}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                        isChecked
                          ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span className="truncate text-xs">{src.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingParcels || isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                Launch Verification Engine
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
