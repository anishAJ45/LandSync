import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { parcelService } from '../../services/parcelService';
import { MapContainer } from '../../components/gis/MapContainer';
import { Parcel, GeoJSONFeatureCollection } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

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

  // GIS Data states
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [geoJsonData, setGeoJsonData] = useState<GeoJSONFeatureCollection | null>(null);
  const [loadingGIS, setLoadingGIS] = useState(true);

  // Form State
  const [surveyNo, setSurveyNo] = useState('124/2');
  const [district, setDistrict] = useState('Coimbatore');
  const [village, setVillage] = useState('Demo Village');
  const [selectedService, setSelectedService] = useState('MUTATION');
  const [isVerifying, setIsVerifying] = useState(false);
  const [applicationRef, setApplicationRef] = useState<string | null>(null);

  // ULPIN Search state
  const [ulpinQuery, setUlpinQuery] = useState('ULPIN-TN-00124-02');
  const [isSearching, setIsSearching] = useState(false);
  const [landIdentified, setLandIdentified] = useState(false);
  const [verifyingPipeline, setVerifyingPipeline] = useState(false);
  const [pipelineStepIndex, setPipelineStepIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchGIS = async () => {
      try {
        setLoadingGIS(true);
        const [allParcels, geojson] = await Promise.all([
          parcelService.getAllParcels(),
          parcelService.getGeoJSON()
        ]);
        setParcels(allParcels);
        setGeoJsonData(geojson);
      } catch (err) {
        console.error('Error fetching GIS data for Guided Journey:', err);
      } finally {
        setLoadingGIS(false);
      }
    };
    fetchGIS();
  }, []);

  const matchedParcel = useMemo(() => {
    // Return TN-CBE-001-124-2 as matched parcel for ULPIN-TN-00124-02
    if (landIdentified && (ulpinQuery.toUpperCase().includes('124-02') || ulpinQuery.toUpperCase().includes('124/2'))) {
      return parcels.find(p => p.parcel_id === 'TN-CBE-001-124-2');
    }
    const query = surveyNo.trim().toLowerCase();
    return parcels.find(
      (p) =>
        p.survey_number.toLowerCase() === query ||
        p.parcel_id.toLowerCase() === query ||
        p.survey_number.replace(/\s+/g, '') === query.replace(/\s+/g, '')
    );
  }, [surveyNo, parcels, landIdentified, ulpinQuery]);

  const handleFindLand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ulpinQuery.trim()) return;
    setIsSearching(true);
    setLandIdentified(false);
    await new Promise((r) => setTimeout(r, 650));
    setIsSearching(false);
    setLandIdentified(true);
  };

  const handleStartVerification = async () => {
    setVerifyingPipeline(true);
    setPipelineStepIndex(0);

    for (let i = 0; i < 8; i++) {
      setPipelineStepIndex(i);
      await new Promise((r) => setTimeout(r, 550));
    }

    setVerifyingPipeline(false);
    setPipelineStepIndex(null);
    setCurrentStep(2); // auto-advance to Step 2
  };

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
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-extrabold text-blue-950">Step 1: ULPIN Land Search & Identification</h2>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 animate-pulse">
                SIH Demonstration Mode
              </span>
            </div>

            {/* ULPIN Input Form */}
            <form onSubmit={handleFindLand} className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Enter ULPIN</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={ulpinQuery}
                  onChange={(e) => setUlpinQuery(e.target.value)}
                  placeholder="Example: ULPIN-TN-00124-02"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-950 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isSearching ? 'Searching...' : '🔍 Find Land'}
                </button>
              </div>
            </form>

            {/* Simulation Warning Notification Banner */}
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-950 font-semibold italic">
              📢 Demo / Prototype Data – For SIH Demonstration Only. Please query <strong>ULPIN-TN-00124-02</strong>.
            </div>

            {/* Identified Land Box */}
            {landIdentified && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 text-xs">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                    <span>Land Identified Successfully</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-slate-700 font-semibold">
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">ULPIN</span>
                      <strong className="font-mono text-slate-900 block mt-0.5">{ulpinQuery}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">State</span>
                      <strong className="text-slate-900 block mt-0.5">Tamil Nadu</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">District</span>
                      <strong className="text-slate-900 block mt-0.5">Coimbatore</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Village</span>
                      <strong className="text-slate-900 block mt-0.5">Demo Village</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Survey Number</span>
                      <strong className="text-slate-900 block mt-0.5">124/2</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Patta Number</span>
                      <strong className="text-slate-900 block mt-0.5">PT-2025-4567</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Land Area</span>
                      <strong className="text-slate-900 block mt-0.5">2.50 Acres</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Land Type</span>
                      <strong className="text-slate-900 block mt-0.5">Agricultural</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px]">Location</span>
                      <strong className="text-slate-900 block mt-0.5">Coimbatore, Tamil Nadu</strong>
                    </div>
                  </div>
                </div>

                {/* Linked Records Section */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h3 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                    🔗 Linked Department Records
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <div className="font-bold text-slate-900 text-xs">Registration Records</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Document Number: DOC-2025-12345</div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mt-1">
                        Status: Available
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <div className="font-bold text-slate-900 text-xs">Revenue / Patta Records</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Patta Number: PT-2025-4567</div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mt-1">
                        Status: Available
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <div className="font-bold text-slate-900 text-xs">Survey & GIS Records</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Survey Number: 124/2</div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mt-1">
                        Boundary Data: Available
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <div className="font-bold text-slate-900 text-xs">Encumbrance Records</div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mt-1">
                        Status: No active encumbrance found in demo data
                      </span>
                    </div>
                  </div>
                </div>

                {/* Map Preview */}
                {matchedParcel && geoJsonData && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Map Boundary Preview</span>
                    <div className="h-60 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100 shadow-2xs">
                      <MapContainer
                        geoJsonData={geoJsonData}
                        selectedParcelId={matchedParcel.parcel_id}
                        hoveredParcelId={null}
                        onSelectParcel={() => {}}
                        onHoverParcel={() => {}}
                      />
                    </div>
                  </div>
                )}

                {/* Start Verification Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartVerification}
                    className="w-full py-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-teal-300 font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
                  >
                    🚀 Start LandSync Verification
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: VERIFY OWNERSHIP */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-extrabold text-blue-950">Step 2: Cross-Registry Verification Report</h2>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                🟢 Verified Record
              </span>
            </div>

            {/* Verification Stats Summary */}
            <div className="p-4 bg-emerald-50/75 border border-emerald-200 rounded-2xl space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Verification Result</div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Overall Record Status:</span>
                <span className="text-emerald-700">✓ Fully Reconciled & Consistent</span>
              </div>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                All linked records in Tamil Nilam (Revenue), SRO Gandhipuram (Registration), and Cadastral GIS database match within zero tolerance boundaries.
              </p>
              <div className="text-[10px] text-slate-400 font-semibold italic mt-1 text-center">
                “Demo / Prototype Data – For SIH Demonstration Only”
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Revenue Patta Records</span>
                </div>
                <p className="text-[11px] font-mono text-slate-900 font-semibold mt-1">Patta No: PT-2025-4567</p>
                <p className="text-[11px] text-slate-600">Verified against Tamil Nilam API</p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Registration (SRO)</span>
                </div>
                <p className="text-[11px] font-mono text-slate-900 font-semibold mt-1">Deed: DOC-2025-12345</p>
                <p className="text-[11px] text-slate-600">SRO Sulur Registry (Clear Title)</p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Encumbrance & Liens</span>
                </div>
                <p className="text-[11px] font-bold text-slate-900 mt-1">Nil Encumbrance</p>
                <p className="text-[11px] text-slate-600">No active bank mortgages found</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600 font-semibold">
              <span className="font-bold text-slate-800">💡 Next Step Checklist</span>
              <p>Your registry validation checks are complete. Proceed to Step 3 to upload sale deeds or tax receipts for AI OCR validation before finalizing the mutation application.</p>
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
              disabled={currentStep === 1 && !landIdentified}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-950 text-white hover:bg-blue-900 flex items-center gap-1.5 shadow-xs disabled:opacity-40"
            >
              <span>{currentStep === 5 ? 'Confirm & Submit Application' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Verification Pipeline Simulation Modal Overlay */}
        {verifyingPipeline && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-900 animate-pulse">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-blue-950">Executing LandSync State Router...</h3>
                  <p className="text-xs text-slate-500 font-semibold">Demo / Prototype Data – For SIH Demonstration Only</p>
                </div>
              </div>

              <div className="space-y-4 py-2">
                {[
                  'ULPIN Identified',
                  'Identify State: TN (Tamil Nadu)',
                  'Routing request to State Router...',
                  'Active Tamil Nadu State Adapter selected',
                  'Fetching dummy Revenue, SRO & GIS department records...',
                  'Normalizing to LandSync Common Data Model Template...',
                  'AI-Assisted Cross-Department comparison analysis running...',
                  'Reconciling final verification results...'
                ].map((stepText, idx) => {
                  const isCompleted = idx < (pipelineStepIndex ?? 0);
                  const isActive = idx === pipelineStepIndex;
                  
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs font-bold transition duration-300">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isCompleted ? 'bg-emerald-100 text-emerald-800' : isActive ? 'bg-blue-950 text-teal-300 ring-2 ring-blue-300 animate-bounce' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className={isCompleted ? 'text-slate-500 line-through' : isActive ? 'text-blue-950 font-black' : 'text-slate-400 font-semibold'}>
                        {stepText}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-950 h-full transition-all duration-300 ease-out"
                  style={{ width: `${(((pipelineStepIndex ?? 0) + 1) / 8) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
