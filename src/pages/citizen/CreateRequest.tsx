import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Send,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ArrowLeft,
  Layers,
  ShieldCheck,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { parcelService } from '../../services/parcelService';
import { applicationService } from '../../services/applicationService';
import { Parcel, ApplicationServiceType, ApplicationPriority } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const SERVICE_TYPES: { type: ApplicationServiceType; title: string; desc: string; icon: string }[] = [
  {
    type: 'LAND RECORD VERIFICATION',
    title: 'Land Record & Title Verification',
    desc: 'Verify digital Patta, Chitta, and Sub-Registrar ownership ledger before sale or mortgage.',
    icon: '📜',
  },
  {
    type: 'BOUNDARY DISCREPANCY REPORT',
    title: 'Boundary Discrepancy & Encroachment',
    desc: 'Report physical spatial deviation between actual boundary fence and cadastral map.',
    icon: '📐',
  },
  {
    type: 'AREA DISCREPANCY REVIEW',
    title: 'Area Discrepancy Reconciliation',
    desc: 'Resolve variance between deed recorded area and computerized GIS polygon area.',
    icon: '📊',
  },
  {
    type: 'OWNERSHIP VERIFICATION',
    title: 'Ownership & Legal Succession',
    desc: 'Verify inheritance title transfer, family partition, or legal heirship records.',
    icon: '⚖️',
  },
  {
    type: 'DOCUMENT VERIFICATION',
    title: 'Registered Deed Authenticity Check',
    desc: 'Cross-reference registered sale deed or encumbrance certificate with SRO archives.',
    icon: '🔍',
  },
  {
    type: 'LAND RECORD CORRECTION REQUEST',
    title: 'Name / Clerical Error Correction',
    desc: 'Rectify typographic errors in owner name, father/husband name, or survey sub-division.',
    icon: '✍️',
  },
  {
    type: 'PARCEL INFORMATION REQUEST',
    title: 'Certified Extract & FMB Map Copy',
    desc: 'Obtain digitally signed Field Measurement Book sketch and certified A-Register extract.',
    icon: '🗺️',
  },
];

export const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedParcelId = searchParams.get('parcel_id') || '';

  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loadingParcels, setLoadingParcels] = useState(true);
  const [selectedParcelId, setSelectedParcelId] = useState(preselectedParcelId);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  const [serviceType, setServiceType] = useState<ApplicationServiceType>('LAND RECORD VERIFICATION');
  const [priority, setPriority] = useState<ApplicationPriority>('MEDIUM');
  const [description, setDescription] = useState('');
  const [surveyNotes, setSurveyNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([
    'Patta_Extract_2026.pdf',
    'Registered_SaleDeed_Scan.pdf'
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        setLoadingParcels(true);
        const data = await parcelService.getAllParcels();
        setParcels(data);
        if (preselectedParcelId) {
          const match = data.find(p => p.parcel_id.toLowerCase() === preselectedParcelId.toLowerCase());
          if (match) {
            setSelectedParcel(match);
            setSelectedParcelId(match.parcel_id);
          }
        } else if (data.length > 0) {
          setSelectedParcel(data[0]);
          setSelectedParcelId(data[0].parcel_id);
        }
      } catch (err) {
        console.error('Failed to load parcels:', err);
      } finally {
        setLoadingParcels(false);
      }
    };
    fetchParcels();
  }, [preselectedParcelId]);

  const handleParcelChange = (pid: string) => {
    setSelectedParcelId(pid);
    const found = parcels.find(p => p.parcel_id === pid);
    setSelectedParcel(found || null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map((f: File) => f.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcelId) {
      setSubmitError('Please select a valid land parcel for this request.');
      return;
    }
    if (!description.trim()) {
      setSubmitError('Please provide detailed descriptions and justification for the request.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const fullDescription = surveyNotes
        ? `${description.trim()}\n\n[Surveyor & Cadastral Reference Notes]: ${surveyNotes.trim()}`
        : description.trim();

      const created = await applicationService.createApplication({
        parcel_id: selectedParcelId,
        service_type: serviceType,
        description: fullDescription,
        priority: priority
      });

      setSubmittedAppId(created.application_id);
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || 'Failed to submit service application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingParcels) {
    return <LoadingSpinner message="Loading land registry parcels..." size="lg" />;
  }

  if (submittedAppId) {
    return (
      <div id="create-request-success" className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="p-8 rounded-2xl bg-white border border-emerald-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Application Successfully Registered
            </span>
            <h2 className="text-2xl font-extrabold text-blue-950 mt-3">
              Application ID: <span className="font-mono text-teal-700">{submittedAppId}</span>
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
              Your land service request has been queued in the digital public workflow. A Tahsildar desk officer has been notified.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 space-y-1.5 font-medium max-w-lg mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500">Service Category:</span>
              <span className="font-bold text-slate-900">{serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Parcel ID:</span>
              <span className="font-mono font-bold text-blue-950">{selectedParcelId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Initial Status:</span>
              <span className="font-semibold text-blue-800">SUBMITTED (In Review Queue)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Turnaround:</span>
              <span className="font-semibold text-emerald-800">2 - 4 Business Days</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="view-my-applications-btn"
              onClick={() => navigate('/citizen/applications')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900 transition shadow-xs flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              View My Applications
            </button>
            <button
              id="view-gis-parcel-btn"
              onClick={() => navigate(`/parcel/${selectedParcelId}`)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-blue-900" />
              Inspect Parcel in GIS 360°
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <p>
            <strong>Statutory Notice:</strong> LandSync provides digital public workflow and AI-assisted verification support. Final administrative decisions and mutation endorsements are executed by authorized revenue and survey officials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="create-request-page" className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-950 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">
            Submit Land Service Application
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Initiate digital public infrastructure workflows for title verification, boundary reconciliation, or mutation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            Authenticated e-KYC
          </span>
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p>{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Land Parcel */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-950 text-teal-400 font-bold text-xs flex items-center justify-center">1</span>
              <h2 className="text-sm font-bold text-slate-900">Select Land Parcel</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">{parcels.length} registered parcels available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Parcel Identifier <span className="text-red-500">*</span>
              </label>
              <select
                id="parcel-selector"
                value={selectedParcelId}
                onChange={(e) => handleParcelChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-950"
              >
                {parcels.map((p) => (
                  <option key={p.parcel_id} value={p.parcel_id}>
                    {p.parcel_id} — Survey {p.survey_number} ({p.village}, {p.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Urgency / Statutory Priority
              </label>
              <select
                id="priority-selector"
                value={priority}
                onChange={(e) => setPriority(e.target.value as ApplicationPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-950"
              >
                <option value="LOW">Low — Regular Administrative Docket (5-7 days)</option>
                <option value="MEDIUM">Medium — Standard Mutation Processing (3-5 days)</option>
                <option value="HIGH">High — Time-sensitive Transaction / Bank Loan (1-2 days)</option>
                <option value="CRITICAL">Critical — Active Boundary Dispute / Encroachment</option>
              </select>
            </div>
          </div>

          {/* Selected Parcel Preview Banner */}
          {selectedParcel && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Owner</span>
                <span className="font-bold text-slate-900">{selectedParcel.current_owner}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Survey Number</span>
                <span className="font-mono font-bold text-blue-950">{selectedParcel.survey_number}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Recorded Area</span>
                <span className="font-bold text-slate-900">{selectedParcel.recorded_area} {selectedParcel.area_unit}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                <span className="font-semibold text-teal-800">{selectedParcel.status}</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Choose Service Type */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-950 text-teal-400 font-bold text-xs flex items-center justify-center">2</span>
              <h2 className="text-sm font-bold text-slate-900">Select Land Governance Service</h2>
            </div>
            <span className="text-xs text-teal-700 font-semibold">Standard Public Workflow</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SERVICE_TYPES.map((st) => {
              const isSelected = serviceType === st.type;
              return (
                <div
                  key={st.type}
                  id={`service-card-${st.type.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setServiceType(st.type)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-950 bg-blue-50/50 shadow-xs ring-1 ring-blue-950'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{st.icon}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-blue-950 fill-blue-100" />
                      )}
                    </div>
                    <h3 className="font-bold text-xs text-slate-900">{st.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Application Details & Statement */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-950 text-teal-400 font-bold text-xs flex items-center justify-center">3</span>
              <h2 className="text-sm font-bold text-slate-900">Application Statement & Documents</h2>
            </div>
            <span className="text-xs text-slate-400">Formal revenue record entry</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Purpose & Detailed Justification <span className="text-red-500">*</span>
              </label>
              <textarea
                id="application-description"
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the specific statutory requirements, reason for mutation or verification, legal succession details, or specific boundary dispute background..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-950 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Cadastral Survey / Boundary Reference (Optional)
              </label>
              <input
                id="survey-notes-input"
                type="text"
                value={surveyNotes}
                onChange={(e) => setSurveyNotes(e.target.value)}
                placeholder="e.g., Adjoining survey 142/3A north marker stone displaced by 1.5 meters."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-950 placeholder:text-slate-400"
              />
            </div>

            {/* Document Upload Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Supporting Paperwork & Encumbrance Documents
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50/50 transition">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">
                  Drag and drop files or <label className="text-teal-700 font-bold cursor-pointer hover:underline">browse<input type="file" multiple onChange={handleFileUpload} className="hidden" /></label>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Supported formats: PDF, JPG, PNG (Max 25MB per document)
                </p>
              </div>

              {/* Uploaded files chips */}
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {uploadedFiles.map((fname, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium"
                    >
                      <FileText className="w-3 h-3 text-slate-500" />
                      {fname}
                      <button
                        type="button"
                        onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-red-600 ml-1 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer & Action Bar */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <p>
            <strong>Official DPI Disclaimer:</strong> LandSync provides digital workflow and AI-assisted verification support. Final decisions and mutation endorsements are made by authorized officials in accordance with the State Land Revenue Act.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/citizen/applications')}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            id="submit-request-btn"
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900 transition shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Clock className="w-4 h-4 animate-spin text-teal-400" />
                Registering Application...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-teal-400" />
                Submit Application to Revenue Queue
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
