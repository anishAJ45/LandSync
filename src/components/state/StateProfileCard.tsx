import React from 'react';
import { StateProfile } from '../../types';
import { Landmark, Database, ShieldCheck, Map, Languages, Scale, Clock, CheckCircle2 } from 'lucide-react';

interface StateProfileCardProps {
  profile: StateProfile;
}

export const StateProfileCard: React.FC<StateProfileCardProps> = ({ profile }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-teal-50 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-800 to-emerald-900 flex items-center justify-center text-white font-black text-lg shadow-sm">
            {profile.state_code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{profile.state_name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {profile.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              National Cadastral Engine Profile • Primary Language: <strong className="text-slate-800">{profile.primary_language}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            Standard Unit: <strong className="text-teal-900">{profile.default_area_unit}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            Timezone: {profile.timezone}
          </span>
        </div>
      </div>

      {/* Core Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {/* Land Records System */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-teal-300 transition">
          <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Database className="w-4 h-4" />
            <span>Land Records (RoR)</span>
          </div>
          <div className="font-extrabold text-slate-900 text-sm">{profile.land_record_system_name}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Revenue Department & e-District Cadastral Ledger
          </div>
        </div>

        {/* Registration System */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-emerald-300 transition">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Registration & Stamp</span>
          </div>
          <div className="font-extrabold text-slate-900 text-sm">{profile.registration_system_name}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Inspector General of Registration (IGR) SRO Integration
          </div>
        </div>

        {/* Survey & GIS System */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-blue-300 transition">
          <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Map className="w-4 h-4" />
            <span>Survey & Cadastral GIS</span>
          </div>
          <div className="font-extrabold text-slate-900 text-sm">{profile.survey_system_name}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Digital Cadastral Survey & Resurvey Vector Layer
          </div>
        </div>
      </div>

      {/* Languages and Structure Info */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-slate-400" />
          <span>Supported Languages:</span>
          {profile.supported_languages.map((lang) => (
            <span key={lang} className="px-2 py-0.5 bg-slate-100 rounded-md font-semibold text-slate-700">
              {lang}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <Clock className="w-3.5 h-3.5" />
          <span>Last Configuration Sync: {new Date(profile.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
