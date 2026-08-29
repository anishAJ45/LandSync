import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { LandDNAProfile } from '../../types';
import { ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react';

interface Props {
  profile: LandDNAProfile;
}

export const LandHealthRadar: React.FC<Props> = ({ profile }) => {
  const radarData = [
    { subject: 'Identity', score: profile.identity_score, fullMark: 100 },
    { subject: 'Record Consistency', score: profile.record_consistency_score, fullMark: 100 },
    { subject: 'Ownership Stability', score: profile.ownership_stability_score, fullMark: 100 },
    { subject: 'Area Stability', score: profile.area_stability_score, fullMark: 100 },
    { subject: 'Survey Stability', score: profile.survey_stability_score, fullMark: 100 },
    { subject: 'Doc Consistency', score: profile.document_consistency_score, fullMark: 100 },
    { subject: 'Verification Health', score: profile.verification_health_score, fullMark: 100 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-teal-700 bg-teal-50 border-teal-200';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-600';
    if (score >= 70) return 'bg-teal-600';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div id="land-health-radar-container" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-blue-950 tracking-tight">Land DNA Health Profile</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
              {profile.dna_id}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-dimensional record consistency & stability intelligence index
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Health</div>
            <div className="text-2xl font-black text-blue-950 flex items-center gap-1 justify-end">
              <span>{profile.overall_land_health_score}</span>
              <span className="text-xs font-semibold text-slate-400">/100</span>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${getScoreColor(profile.overall_land_health_score)}`}>
            {profile.health_category}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Radar Chart */}
        <div className="lg:col-span-6 h-72 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip
                formatter={(value: any) => [`${value}/100`, 'Score']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Radar
                name="Health Score"
                dataKey="score"
                stroke="#0d9488"
                fill="#14b8a6"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 7 Breakdown Metric Bars */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pb-1 border-b border-slate-100">
            <span>Score Dimension</span>
            <span>Rating</span>
          </div>

          {[
            { label: 'Identity Score', score: profile.identity_score, desc: 'Cadastral ID & hierarchical boundary accuracy' },
            { label: 'Record Consistency', score: profile.record_consistency_score, desc: 'Multi-source cross-registry field agreement' },
            { label: 'Ownership Stability', score: profile.ownership_stability_score, desc: 'Conveyance continuity & transfer frequency' },
            { label: 'Area Stability', score: profile.area_stability_score, desc: 'GIS polygon vs registered Patta area tolerance' },
            { label: 'Survey Stability', score: profile.survey_stability_score, desc: 'Subdivision history and field measurement records' },
            { label: 'Document Consistency', score: profile.document_consistency_score, desc: 'OCR text extraction & deed match fidelity' },
            { label: 'Verification Health', score: profile.verification_health_score, desc: 'Automated verification history & conflict logs' }
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">{item.label}</span>
                  <span className="hidden sm:inline text-slate-400 text-[11px] ml-2 font-normal">({item.desc})</span>
                </div>
                <span className="font-bold text-slate-900">{item.score}/100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(item.score)}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official AI Decision Support Disclaimer */}
      <div className="mt-6 p-3.5 rounded-lg bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed font-medium">
          <strong className="font-bold">Official Decision Support Notice:</strong> Land DNA is an explainable decision-support profile generated by automated cross-record consistency algorithms. It assists revenue and survey officers and does not establish legal ownership or replace formal judicial rulings.
        </p>
      </div>
    </div>
  );
};
