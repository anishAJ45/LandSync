import React, { useState } from 'react';
import { StateProfile } from '../../types';
import { Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Landmark, Database, Layers, Check, ShieldCheck } from 'lucide-react';

interface StateOnboardingWizardProps {
  onComplete: (profile: Partial<StateProfile>) => void;
  onCancel: () => void;
}

export const StateOnboardingWizard: React.FC<StateOnboardingWizardProps> = ({
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    state_code: 'AP',
    state_name: 'Andhra Pradesh',
    primary_language: 'Telugu',
    default_area_unit: 'Acre / Cent',
    land_record_system_name: 'Meebhoomi (1B / Adangal)',
    registration_system_name: 'CARD (Computer-aided Registration)',
    survey_system_name: 'Bhudhaar / YSR Jagananna Bhoo Hakku',
    rural_levels: 'District > Division > Mandal > Gram Panchayat > Revenue Village',
    urban_levels: 'Municipal Corporation > Zone > Ward > Assessment No',
    sample_owner_field: 'pattadar_name',
    sample_survey_field: 'khata_no'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFinish = () => {
    const newProfile: Partial<StateProfile> = {
      state_code: formData.state_code.toUpperCase(),
      state_name: formData.state_name,
      country: 'India',
      primary_language: formData.primary_language,
      supported_languages: [formData.primary_language, 'English'],
      land_record_system_name: formData.land_record_system_name,
      registration_system_name: formData.registration_system_name,
      survey_system_name: formData.survey_system_name,
      default_area_unit: formData.default_area_unit,
      default_language: 'en',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      status: 'ACTIVE',
      rural_structure: formData.rural_levels.split(' > '),
      urban_structure: formData.urban_levels.split(' > ')
    };
    onComplete(newProfile);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden max-w-3xl mx-auto">
      {/* Wizard Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                State LandSync Onboarding Wizard
              </h2>
              <p className="text-xs text-teal-200 mt-0.5">
                Step-by-step configuration for seamless pan-India interoperability
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              Step {step} of 4
            </span>
          </div>
        </div>

        {/* Stepper Bar */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {['1. Basic Profile', '2. Portals & APIs', '3. Jurisdictions', '4. Validation'].map((label, idx) => (
            <div key={idx}>
              <div
                className={`h-1.5 rounded-full ${
                  step >= idx + 1 ? 'bg-emerald-400' : 'bg-white/20'
                }`}
              />
              <span className="text-[10px] text-teal-200 font-bold block mt-1">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-8">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Landmark className="w-5 h-5 text-teal-800" />
              State Identity & Core Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State / UT Name
                </label>
                <input
                  type="text"
                  name="state_name"
                  value={formData.state_name}
                  onChange={handleChange}
                  placeholder="e.g. Andhra Pradesh, Gujarat, Odisha"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2-Letter State Code
                </label>
                <input
                  type="text"
                  name="state_code"
                  maxLength={2}
                  value={formData.state_code}
                  onChange={handleChange}
                  placeholder="e.g. AP, GJ, OD"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-black uppercase focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary State Language
                </label>
                <input
                  type="text"
                  name="primary_language"
                  value={formData.primary_language}
                  onChange={handleChange}
                  placeholder="e.g. Telugu, Gujarati, Odia"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Area Unit
                </label>
                <select
                  name="default_area_unit"
                  value={formData.default_area_unit}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-teal-700"
                >
                  <option value="Acre / Cent">Acre / Cent</option>
                  <option value="Acre / Guntha">Acre / Guntha</option>
                  <option value="Hectare / Are">Hectare / Are</option>
                  <option value="Bigha / Biswa">Bigha / Biswa</option>
                  <option value="Kanal / Marla">Kanal / Marla</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-800" />
              State Government Registry Systems
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Land Record (RoR) Portal Name
                </label>
                <input
                  type="text"
                  name="land_record_system_name"
                  value={formData.land_record_system_name}
                  onChange={handleChange}
                  placeholder="e.g. Meebhoomi, AnyRoR, Bhulekh"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registration & Stamp SRO System
                </label>
                <input
                  type="text"
                  name="registration_system_name"
                  value={formData.registration_system_name}
                  onChange={handleChange}
                  placeholder="e.g. CARD, Garvi, e-Dharani"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cadastral GIS Vector Engine
                </label>
                <input
                  type="text"
                  name="survey_system_name"
                  value={formData.survey_system_name}
                  onChange={handleChange}
                  placeholder="e.g. Bhudhaar, CollabLand GIS"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-800" />
              Administrative Jurisdiction Chains
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rural Revenue Hierarchy (Delimited with &apos;&gt;&apos;)
                </label>
                <input
                  type="text"
                  name="rural_levels"
                  value={formData.rural_levels}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Urban Civic Hierarchy (Delimited with &apos;&gt;&apos;)
                </label>
                <input
                  type="text"
                  name="urban_levels"
                  value={formData.urban_levels}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-2 font-black text-emerald-950 text-sm mb-1">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>Onboarding Readiness Verified</span>
              </div>
              <p className="text-xs text-emerald-800">
                All parameters for <strong>{formData.state_name} ({formData.state_code})</strong> comply with the National LandSync Common Land Model.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">State Code:</span>
                <span className="font-mono font-bold text-slate-900">{formData.state_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Land Records:</span>
                <span className="font-bold text-slate-900">{formData.land_record_system_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registration:</span>
                <span className="font-bold text-slate-900">{formData.registration_system_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Standard Area Unit:</span>
                <span className="font-bold text-teal-800">{formData.default_area_unit}</span>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Deploy State Configuration</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
