import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  CheckCircle2,
  Upload,
  Clock,
  Layers,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Eye,
  ShieldCheck,
  FileText,
  MapPin,
  Sparkles
} from 'lucide-react';

interface JourneyStep {
  id: number;
  title: string;
  shortDesc: string;
}

const STEPS: JourneyStep[] = [
  { id: 1, title: 'Locate Parcel', shortDesc: 'Search by Survey Number or ULPIN' },
  { id: 2, title: 'Verify Ownership', shortDesc: 'Cross-check RoR, Patta, and Encumbrances' },
  { id: 3, title: 'Upload Documents', shortDesc: 'AI OCR validation of Sale Deed / Tax Receipt' },
  { id: 4, title: 'Select Service', shortDesc: 'Choose Mutation, Demarcation, or Certificate' },
  { id: 5, title: 'Submit & Track', shortDesc: 'Receive Tracking Ref & Milestone Dashboard' }
];

export const CitizenGuidedJourney: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [surveyNo, setSurveyNo] = useState('124/1');
  const [district, setDistrict] = useState('Coimbatore');
  const [village, setVillage] = useState('Kalapatti');
  const [selectedService, setSelectedService] = useState('MUTATION');
  const [isVerifying, setIsVerifying] = useState(false);
  const [applicationRef, setApplicationRef] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete journey
      setApplicationRef(`APP-LS-2026-${Math.floor(10000 + Math.random() * 90000)}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div id="citizen-guided-journey" className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Citizen Land Governance Wizard</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
            Step-by-Step Guided Journey
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Follow our 5-step guided path to verify land records, upload supporting deeds, and apply for government revenue services.
        </p>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-5 gap-2 mt-6 pt-4 border-t border-slate-100">
          {STEPS.map((s) => (
            <div key={s.id} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    s.id < currentStep
                      ? 'bg-emerald-600 text-white'
                      : s.id === currentStep
                      ? 'bg-blue-950 text-teal-300 ring-2 ring-blue-300'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {s.id < currentStep ? '✓' : s.id}
                </div>
                <span
                  className={`text-xs font-bold truncate hidden sm:inline ${
                    s.id === currentStep ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </span>
              </div>
              <div
                className={`h-1.5 rounded-full ${
                  s.id <= currentStep ? 'bg-blue-900' : 'bg-slate-100'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Step Body Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* STEP 1: LOCATE PARCEL */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Step 1: Locate Your Land Parcel</h2>
            <p className="text-xs text-slate-600">
              Provide your revenue survey number, village jurisdiction, or 14-digit Unique Land Parcel Identification Number (ULPIN).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700">State & District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50"
                >
                  <option value="Coimbatore">Tamil Nadu - Coimbatore</option>
                  <option value="Lucknow">Uttar Pradesh - Lucknow</option>
                  <option value="Jaipur">Rajasthan - Jaipur</option>
                  <option value="Pune">Maharashtra - Pune</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Taluk / Village</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Survey No. / Subdiv</label>
                <input
                  type="text"
                  value={surveyNo}
                  onChange={(e) => setSurveyNo(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-900" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Detected Parcel: TN-CBE-001-124-1</h4>
                  <span className="text-[11px] text-slate-600">Owner: S. Ramanathan • Area: 42.50 cents</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/parcel/TN-CBE-001-124-1')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-blue-950 border border-slate-200 shadow-2xs hover:bg-slate-50"
              >
                Inspect Cadastral 360°
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VERIFY OWNERSHIP */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Step 2: Cross-Registry Verification</h2>
            <p className="text-xs text-slate-600">
              LandSync automatically cross-verifies revenue records with the Sub-Registrar Office (SRO) and Encumbrance records.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Revenue Patta</span>
                </div>
                <p className="text-xs font-mono text-slate-900">Patta No: 2841</p>
                <p className="text-[11px] text-slate-600">Verified against Tamil Nilam API</p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Registration (SRO)</span>
                </div>
                <p className="text-xs font-mono text-slate-900">Deed: 1420/2019</p>
                <p className="text-[11px] text-slate-600">SRO Gandhipuram (Clear Title)</p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Encumbrance Status</span>
                </div>
                <p className="text-xs font-bold text-slate-900">Nil Encumbrance</p>
                <p className="text-[11px] text-slate-600">No active mortgage / court stay</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: UPLOAD DOCUMENTS */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Step 3: Document Upload & AI Heuristics</h2>
            <p className="text-xs text-slate-600">
              Upload your Sale Deed, Property Tax receipt, or Identity Proof. Our on-device OCR engine verifies metadata instantly.
            </p>

            <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-3 hover:border-blue-500 transition cursor-pointer bg-slate-50">
              <Upload className="w-8 h-8 text-blue-900 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-800">Click to upload document or drag and drop</p>
                <p className="text-[11px] text-slate-500">PDF, PNG, JPG (Max 15MB)</p>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-900" />
                <span className="font-semibold text-slate-900">Registered_Sale_Deed_Doc1420.pdf (2.4 MB)</span>
              </div>
              <span className="text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> OCR Extracted
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: SELECT SERVICE */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Step 4: Select Revenue Service</h2>
            <p className="text-xs text-slate-600">
              Choose the digital revenue service you wish to initiate for this land parcel:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { id: 'MUTATION', title: 'Patta Mutation / Name Transfer', desc: 'Transfer revenue title based on registered sale deed or succession.' },
                { id: 'SUBDIVISION', title: 'Survey Sub-Division (FMB Split)', desc: 'Request government surveyor for physical parcel boundary bifurcation.' },
                { id: 'DEMARCATION', title: 'Boundary Demarcation & DGPS Fix', desc: 'Settle boundary clarity with DGPS coordinates survey.' },
                { id: 'LAND_CERTIFICATE', title: 'Digital Land DNA Certificate', desc: 'Instant verifiable public credential with QR code.' }
              ].map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedService(srv.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition space-y-1 ${
                    selectedService === srv.id
                      ? 'bg-blue-50 border-blue-950 ring-1 ring-blue-950'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <h3 className="font-bold text-xs text-slate-900">{srv.title}</h3>
                  <p className="text-[11px] text-slate-500">{srv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: SUBMIT & TRACK */}
        {currentStep === 5 && (
          <div className="space-y-4 text-center py-4">
            {applicationRef ? (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Application Submitted Successfully!</h2>
                  <p className="text-xs font-mono font-bold text-blue-950 mt-1">
                    Application Ref: {applicationRef}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Your request has been routed to Tahsildar (South Coimbatore) and Field Surveyor for digital validation.
                  </p>
                </div>

                <div className="pt-3 flex justify-center gap-3">
                  <button
                    onClick={() => navigate('/citizen/my-applications')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-950 text-white hover:bg-blue-900"
                  >
                    Track in My Applications
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setApplicationRef(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    Start Another Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">Ready to Submit Service Request</h3>
                <p className="text-xs text-slate-600">
                  By clicking Submit, your application will be cryptographically signed and logged onto the tamper-evident audit ledger.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        {!applicationRef && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-950 text-white hover:bg-blue-900 flex items-center gap-1.5 shadow-xs"
            >
              <span>{currentStep === 5 ? 'Confirm & Submit Application' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
