import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { landDnaService } from '../../services/landDnaService';
import { LandDNAProfile as LandDNAProfileType, AnomalyReviewStatus } from '../../types';
import { LandHealthRadar } from '../../components/dna/LandHealthRadar';
import { RiskSignalCard } from '../../components/dna/RiskSignalCard';
import { AnomalyBadge } from '../../components/dna/AnomalyBadge';
import {
  Dna,
  ShieldAlert,
  ShieldCheck,
  RotateCw,
  Clock,
  ArrowLeft,
  FileCheck,
  AlertTriangle,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';

export const LandDNAProfile: React.FC = () => {
  const { parcelId } = useParams<{ parcelId?: string }>();
  const navigate = useNavigate();
  const activeParcelId = parcelId || 'TN-CBE-001-124-2';

  const [profile, setProfile] = useState<LandDNAProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SIGNALS' | 'ANOMALIES' | 'HISTORY'>('OVERVIEW');
  const [selectedParcel, setSelectedParcel] = useState(activeParcelId);

  const sampleParcels = [
    { id: 'TN-CBE-001-124-2', label: 'TN-CBE-001-124-2 (Healthy - 94/100)' },
    { id: 'TN-CBE-001-126-2', label: 'TN-CBE-001-126-2 (Area Delta - 74/100)' },
    { id: 'TN-CBE-001-125-1', label: 'TN-CBE-001-125-1 (Document Mismatch - 46/100)' },
    { id: 'TN-CBE-001-128-4', label: 'TN-CBE-001-128-4 (Transfer Velocity - 62/100)' },
    { id: 'TN-CBE-001-127-3', label: 'TN-CBE-001-127-3 (Critical Boundary Overlap - 28/100)' }
  ];

  const fetchProfile = async (id: string) => {
    setLoading(true);
    try {
      const data = await landDnaService.getLandDNAProfile(id);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load Land DNA Profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(selectedParcel);
  }, [selectedParcel]);

  const handleReanalyze = async () => {
    if (!profile) return;
    setAnalyzing(true);
    try {
      const res = await landDnaService.analyzeRisk(profile.parcel_id);
      setProfile({
        ...res.profile,
        risk_assessment: res.assessment,
        risk_signals: res.signals,
        anomalies: res.anomalies
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResolveSignal = async (signalId: number, note: string) => {
    try {
      await landDnaService.resolveRiskSignal(signalId, note);
      if (profile) fetchProfile(profile.parcel_id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewAnomaly = async (anomalyId: string, status: AnomalyReviewStatus, note: string) => {
    try {
      await landDnaService.reviewAnomaly(anomalyId, status, note);
      if (profile) fetchProfile(profile.parcel_id);
    } catch (err) {
      console.error(err);
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div id="land-dna-profile-page" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Parcel Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-950 flex items-center justify-center text-teal-400">
              <Dna className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-blue-950 tracking-tight">Land DNA Intelligence</h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  Phase 6
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Explainable Multi-Source Land Health, Anomaly & Risk Detection Profile
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Select Parcel:</span>
            <select
              value={selectedParcel}
              onChange={(e) => setSelectedParcel(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-950"
            >
              {sampleParcels.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleReanalyze}
            disabled={analyzing || loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors shadow-xs disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Re-analyzing...' : 'Re-run DNA Intelligence'}</span>
          </button>
        </div>
      </div>

      {loading || !profile ? (
        <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-slate-200">
          <div className="flex flex-col items-center gap-3">
            <RotateCw className="w-8 h-8 text-teal-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Synthesizing Land DNA Intelligence Profile...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Executive Intelligence Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall Land Health</span>
                <div className="text-2xl font-black text-blue-950 mt-1">{profile.overall_land_health_score}/100</div>
                <div className="text-xs font-semibold text-teal-700 mt-0.5">Category: {profile.health_category}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm border border-teal-200">
                {profile.overall_land_health_score}%
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Intelligent Risk Score</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{profile.overall_risk_score}/100</div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5 ${getRiskBadge(profile.risk_level)}`}>
                  {profile.risk_level} RISK
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-sm border border-rose-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Risk Signals</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {profile.risk_signals?.filter((s) => !s.is_resolved).length || 0}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Total signals: {profile.risk_signals?.length || 0}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm border border-amber-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Detected Anomalies</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {profile.anomalies?.filter((a) => a.review_status !== 'RESOLVED' && a.review_status !== 'DISMISSED').length || 0}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Total records: {profile.anomalies?.length || 0}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-sm border border-blue-200">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Explainable AI Narrative Card */}
          <div className="bg-blue-950 text-white p-6 rounded-xl shadow-xs relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-400/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-teal-300 tracking-tight">
                    Explainable Land DNA Intelligence Summary
                  </h3>
                  <span className="text-[11px] text-blue-200 font-mono">
                    Updated: {new Date(profile.updated_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {profile.profile_summary}
                </p>
                <div className="pt-2 flex items-center gap-4 text-xs text-blue-300">
                  <span>Survey: <strong>{profile.parcel_details?.survey_number}/{profile.parcel_details?.subdivision}</strong></span>
                  <span>Village: <strong>{profile.parcel_details?.village}</strong></span>
                  <span>Owner: <strong>{profile.parcel_details?.current_owner}</strong></span>
                  <span>Area: <strong>{profile.parcel_details?.recorded_area} {profile.parcel_details?.area_unit}</strong></span>
                  <Link
                    to={`/parcel/${profile.parcel_id}`}
                    className="ml-auto text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                  >
                    <span>Open Parcel 360</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { id: 'OVERVIEW', label: 'Health Score Breakdown', icon: Dna, count: null },
              { id: 'SIGNALS', label: 'Explainable Risk Signals', icon: ShieldAlert, count: profile.risk_signals?.length },
              { id: 'ANOMALIES', label: 'Anomaly Observations', icon: AlertTriangle, count: profile.anomalies?.length },
              { id: 'HISTORY', label: 'Profile History Snapshots', icon: Clock, count: profile.history?.length }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-blue-950 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== null && tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-blue-800 text-teal-300' : 'bg-slate-100 text-slate-700'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Health Breakdown */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <LandHealthRadar profile={profile} />

              {/* Sub-Risk Categorization */}
              {profile.risk_assessment && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-blue-950 tracking-tight">Multi-Dimensional Risk Vector Breakdown</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                    {[
                      { label: 'Record Risk', val: profile.risk_assessment.record_risk },
                      { label: 'Document Risk', val: profile.risk_assessment.document_risk },
                      { label: 'Historical Risk', val: profile.risk_assessment.historical_risk },
                      { label: 'Area Risk', val: profile.risk_assessment.area_risk },
                      { label: 'Survey Risk', val: profile.risk_assessment.survey_risk },
                      { label: 'Ownership Risk', val: profile.risk_assessment.ownership_risk },
                      { label: 'GIS Risk', val: profile.risk_assessment.gis_risk }
                    ].map((r, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                        <div className="text-[11px] font-semibold text-slate-500">{r.label}</div>
                        <div className="text-lg font-black text-slate-900 mt-1">{r.val}/100</div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full ${r.val > 60 ? 'bg-rose-500' : r.val > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${r.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Signals */}
          {activeTab === 'SIGNALS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">
                  {profile.risk_signals?.length || 0} Risk Signals evaluated against rule-based detection matrix
                </span>
                <span className="text-xs text-slate-500">
                  Rule-based explainable weights
                </span>
              </div>
              <div className="space-y-3">
                {profile.risk_signals && profile.risk_signals.length > 0 ? (
                  profile.risk_signals.map((sig) => (
                    <RiskSignalCard
                      key={sig.id}
                      signal={sig}
                      canResolve={true}
                      onResolve={handleResolveSignal}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
                    No risk signals recorded for this parcel.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Anomalies */}
          {activeTab === 'ANOMALIES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">
                  {profile.anomalies?.length || 0} Cross-Record Anomalies Tracked
                </span>
                <Link
                  to="/officer/anomalies"
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  <span>Open Anomaly Review Console</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {profile.anomalies && profile.anomalies.length > 0 ? (
                  profile.anomalies.map((anom) => (
                    <AnomalyBadge
                      key={anom.anomaly_id}
                      anomaly={anom}
                      canReview={true}
                      onReview={handleReviewAnomaly}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
                    No anomalies detected.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: History Snapshots */}
          {activeTab === 'HISTORY' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-blue-950 tracking-tight">Land DNA Historical Snapshots</h3>
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {profile.history && profile.history.length > 0 ? (
                  profile.history.map((h, i) => (
                    <div key={i} className="flex items-start gap-4 pl-6 relative">
                      <div className="w-3 h-3 rounded-full bg-teal-500 border-2 border-white absolute left-1.5 top-1.5 shadow-xs" />
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-blue-950">{h.dna_profile_id}</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(h.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1.5 font-medium">{h.change_summary}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs p-4">No snapshot history found.</div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
