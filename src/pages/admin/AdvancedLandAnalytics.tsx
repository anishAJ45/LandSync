import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  MapPin,
  AlertTriangle,
  Flame,
  ShieldAlert,
  GitBranch,
  FileText,
  Sliders,
  TrendingUp,
  BrainCircuit,
  Eye,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Shield,
  Zap,
  Play
} from 'lucide-react';
import { advancedGovernanceService } from '../../services/advancedGovernanceService';
import {
  EncroachmentRecord,
  LandSubdivisionRecord,
  LandMutationRecord,
  FraudPatternAlert,
  HeatMapDataset,
  LandRiskMapRecord,
  ScenarioSimulationResult,
  PredictiveInsight
} from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export const AdvancedLandAnalytics: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'heatmaps' | 'risk_maps' | 'encroachments' | 'fraud' | 'subdivisions' | 'scenarios' | 'predictions'>('heatmaps');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Analytics Datasets
  const [heatmaps, setHeatmaps] = useState<HeatMapDataset[]>([]);
  const [selectedHeatmapCategory, setSelectedHeatmapCategory] = useState<string>('VERIFICATION_RISK');
  const [riskMaps, setRiskMaps] = useState<LandRiskMapRecord[]>([]);
  const [encroachments, setEncroachments] = useState<EncroachmentRecord[]>([]);
  const [subdivisions, setSubdivisions] = useState<LandSubdivisionRecord[]>([]);
  const [mutations, setMutations] = useState<LandMutationRecord[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudPatternAlert[]>([]);
  const [predictions, setPredictions] = useState<PredictiveInsight[]>([]);

  // Scenario Simulator State
  const [simScenarioType, setSimScenarioType] = useState<string>('ROAD_EXPANSION');
  const [simBufferMeters, setSimBufferMeters] = useState<number>(30);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<ScenarioSimulationResult | null>(null);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const [hm, rm, enc, sub, mut, fraud, pred] = await Promise.all([
        advancedGovernanceService.getHeatMapDatasets(),
        advancedGovernanceService.getLandRiskMap(),
        advancedGovernanceService.getEncroachmentDetections(),
        advancedGovernanceService.getLandSubdivisionRecords(),
        advancedGovernanceService.getLandMutationRecords(),
        advancedGovernanceService.getFraudPatternAlerts(),
        advancedGovernanceService.getPredictiveInsights()
      ]);
      setHeatmaps(hm);
      setRiskMaps(rm);
      setEncroachments(enc);
      setSubdivisions(sub);
      setMutations(mut);
      setFraudAlerts(fraud);
      setPredictions(pred);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load advanced spatial intelligence models.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const handleRunSimulation = async () => {
    try {
      setSimulating(true);
      const res = await advancedGovernanceService.simulateScenario({
        scenario_type: simScenarioType as any,
        title: `Simulated ${simScenarioType.replace(/_/g, ' ')} (${simBufferMeters}m Buffer)`,
        target_buffer_meters: simBufferMeters,
        origin_lat: 11.0168,
        origin_lng: 76.9558,
        parameters: { zone: 'Urban Corridor Alpha' }
      });
      setSimulationResult(res);
    } catch (err: any) {
      alert('Failed to execute spatial scenario simulation');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Synthesizing Advanced Governance & Spatial Risk Models..." size="lg" />;
  if (error) return <ErrorMessage title="Analytics Error" message={error} onRetry={loadAllAnalytics} />;

  const activeHeatmap = heatmaps.find((h) => h.category === selectedHeatmapCategory) || heatmaps[0];

  return (
    <div id="advanced-land-analytics" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Advanced Land Governance & Risk Intelligence</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              AI & Spatial Engine (Phase 10.5)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Encroachment indications, subdivision tracking, fraud pattern detector, GIS heatmaps, scenario simulations, and predictive insights.
          </p>
        </div>

        <button
          onClick={loadAllAnalytics}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('heatmaps')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'heatmaps'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>GIS Heat Maps</span>
        </button>

        <button
          onClick={() => setActiveTab('risk_maps')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'risk_maps'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Composite Land Risk Maps</span>
        </button>

        <button
          onClick={() => setActiveTab('encroachments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'encroachments'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Encroachment Detections ({encroachments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fraud')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'fraud'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4 text-purple-400" />
          <span>Fraud Patterns ({fraudAlerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subdivisions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'subdivisions'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-4 h-4 text-teal-400" />
          <span>Subdivisions & Mutations</span>
        </button>

        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'scenarios'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Scenario Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'predictions'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-emerald-400" />
          <span>Predictive Insights ({predictions.length})</span>
        </button>
      </div>

      {/* TAB 1: HEAT MAPS */}
      {activeTab === 'heatmaps' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Cadastral Density & Anomaly Heat Maps</h3>
                <p className="text-xs text-slate-500">Spatial clustering of verification backlog, land disputes, and data quality issues</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Density Metric:</span>
                <select
                  value={selectedHeatmapCategory}
                  onChange={(e) => setSelectedHeatmapCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50"
                >
                  <option value="VERIFICATION_RISK">Verification Risk Density</option>
                  <option value="DISPUTE_DENSITY">Dispute Density</option>
                  <option value="DATA_QUALITY_ISSUES">Data Quality Issues</option>
                  <option value="INFRASTRUCTURE_DEFICIENCY">Infrastructure Deficiency</option>
                  <option value="PENDING_SERVICE_REQUESTS">Pending Service Requests</option>
                </select>
              </div>
            </div>

            {activeHeatmap && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">{activeHeatmap.name}</span>
                  <span className="font-mono text-slate-500">{activeHeatmap.points.length} Spatial Hotspots</span>
                </div>
                <p className="text-xs text-slate-600">{activeHeatmap.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {activeHeatmap.points.map((pt, i) => (
                    <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{pt.label}</span>
                        <p className="text-[10px] font-mono text-slate-400">
                          {pt.lat.toFixed(4)}°N, {pt.lng.toFixed(4)}°E
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pt.intensity > 0.7
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          Intensity: {(pt.intensity * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COMPOSITE RISK MAPS */}
      {activeTab === 'risk_maps' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Parcel-Level Multi-Factor Risk Assessment</h3>
            <p className="text-xs text-slate-500">
              Combines Ownership Risk, Document Authenticity, Spatial Buffers, Restrictions, and Transactional Volatility.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskMaps.map((rm) => (
                <div key={rm.parcel_id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-sm text-blue-950">{rm.parcel_id}</span>
                      <p className="text-xs text-slate-600 font-semibold">{rm.owner_name} • Survey {rm.survey_number}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        rm.overall_risk_level === 'CRITICAL' || rm.overall_risk_level === 'HIGH'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {rm.overall_risk_level} ({rm.composite_score}/100)
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">{rm.explanation}</p>

                  {/* Factor Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-[10px]">
                    <div className="p-1.5 bg-white rounded-lg border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Ownership</span>
                      <span className="font-bold text-slate-800">{rm.factors.ownership_risk.score}%</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Document</span>
                      <span className="font-bold text-slate-800">{rm.factors.document_risk.score}%</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Spatial</span>
                      <span className="font-bold text-slate-800">{rm.factors.spatial_risk.score}%</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Restriction</span>
                      <span className="font-bold text-slate-800">{rm.factors.environmental_restriction.score}%</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => navigate(`/parcel/${encodeURIComponent(rm.parcel_id)}`)}
                      className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1"
                    >
                      <span>Inspect Parcel 360°</span> <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ENCROACHMENT DETECTIONS */}
      {activeTab === 'encroachments' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Official Governance Notice</p>
              <p className="mt-0.5">
                AI and GIS spatial indications represent algorithmic advisory indicators for survey planning. These do NOT constitute legal determinations of encroachment and require mandatory ground field DGPS verification by a licensed Revenue Surveyor.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Detected Boundary Overlaps & Possible Encroachments</h3>

            <div className="divide-y divide-slate-100">
              {encroachments.map((enc) => (
                <div key={enc.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-950">{enc.parcel_id}</span>
                      <span className="text-xs text-slate-500 font-medium">(Survey {enc.survey_number})</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          enc.status === 'HIGH_RISK_OVERLAP'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {enc.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold">{enc.zone_description}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Zone Type: {enc.encroached_zone_type} • Overlap: {enc.overlap_area_sq_m} sq.m • Imagery: {enc.satellite_imagery_epoch}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/parcel/${encodeURIComponent(enc.parcel_id)}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                    >
                      View in Cadastral Map
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FRAUD PATTERN DETECTOR */}
      {activeTab === 'fraud' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Behavioral & Registry Fraud Pattern Alerts</h3>
              <p className="text-xs text-slate-500">
                Identifies rapid turnover, repeated document submissions, anomalous area inflation, and conflicting registrations. (Flagged for administrative review only).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fraudAlerts.map((fa) => (
                <div key={fa.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-950">{fa.parcel_id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          fa.risk_level === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {fa.risk_level} SUSPICIOUS PATTERN
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600">Score: {fa.suspicion_score}%</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{fa.alert_title}</h4>
                  <p className="text-xs text-slate-600">{fa.description}</p>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-indigo-900 block text-[10px] uppercase">Recommended Action:</span>
                    {fa.recommended_action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUBDIVISIONS & MUTATIONS */}
      {activeTab === 'subdivisions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Land Subdivisions ({subdivisions.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Subdivision Ref</th>
                    <th className="py-2.5 px-3">Parent Parcel</th>
                    <th className="py-2.5 px-3">Child Parcel</th>
                    <th className="py-2.5 px-3">Original Area</th>
                    <th className="py-2.5 px-3">Subdivided Area</th>
                    <th className="py-2.5 px-3">Effective Date</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {subdivisions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-blue-950">{s.subdivision_reference}</td>
                      <td className="py-2.5 px-3">{s.parent_parcel_id} (Survey {s.parent_survey_no})</td>
                      <td className="py-2.5 px-3 font-bold text-teal-800">{s.child_parcel_id} (Survey {s.child_survey_no})</td>
                      <td className="py-2.5 px-3">{s.original_area_cents} cents</td>
                      <td className="py-2.5 px-3">{s.subdivided_area_cents} cents</td>
                      <td className="py-2.5 px-3 text-slate-500">{s.effective_date}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Land Title Mutations ({mutations.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Mutation Ref</th>
                    <th className="py-2.5 px-3">Parcel ID</th>
                    <th className="py-2.5 px-3">Previous Owner</th>
                    <th className="py-2.5 px-3">New Owner</th>
                    <th className="py-2.5 px-3">Mutation Type</th>
                    <th className="py-2.5 px-3">SRO Office</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {mutations.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-blue-950">{m.mutation_reference}</td>
                      <td className="py-2.5 px-3">{m.parcel_id}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{m.previous_owner_reference}</td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{m.new_owner_reference}</td>
                      <td className="py-2.5 px-3 font-sans">{m.mutation_type}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-500">{m.registered_sro}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SCENARIO SIMULATOR */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cadastral Scenario & Infrastructure Impact Simulator</h3>
            <p className="text-xs text-slate-500">
              Interactive Decision Support Tool: Simulate public works, flood zone adjustments, or highway expansions to assess affected land parcels and compensation budgets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-700">Scenario Category</label>
                <select
                  value={simScenarioType}
                  onChange={(e) => setSimScenarioType(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="ROAD_EXPANSION">Highway / Road Widening (SH-17)</option>
                  <option value="FLOOD_ZONE_EXPANSION">Noyyal River 100-Year Flood Zone Expansion</option>
                  <option value="NEW_INFRASTRUCTURE_PROJECT">Metro Rail Transit Phase-2 Alignment</option>
                  <option value="NEW_ZONING_RULE">Mixed-Use Commercial Transit Overlay Zone</option>
                  <option value="UTILITY_INFRASTRUCTURE_EXPANSION">High-Tension Power Transmission Corridor</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Buffer Width (Meters)</label>
                <input
                  type="number"
                  value={simBufferMeters}
                  onChange={(e) => setSimBufferMeters(parseInt(e.target.value, 10) || 10)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 text-xs font-semibold bg-white font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleRunSimulation}
                  disabled={simulating}
                  className="w-full py-2.5 rounded-lg text-xs font-bold bg-blue-950 text-white hover:bg-blue-900 flex items-center justify-center gap-2 shadow-xs"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{simulating ? 'Simulating Impact...' : 'Execute Simulation'}</span>
                </button>
              </div>
            </div>

            {simulationResult && (
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-900 uppercase">Sim ID: {simulationResult.simulation_id}</span>
                    <h4 className="font-bold text-base text-slate-900">{simulationResult.title}</h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    {simulationResult.total_affected_parcels} Parcels Affected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <span className="text-slate-500">Total Area Affected</span>
                    <p className="font-black text-slate-900 text-sm mt-0.5">
                      {simulationResult.total_affected_area_sq_m.toLocaleString()} sq.m
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <span className="text-slate-500">Estimated Compensation</span>
                    <p className="font-black text-blue-950 text-sm mt-0.5">
                      ₹{(simulationResult.estimated_compensation_budget_inr / 10000000).toFixed(2)} Cr
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <span className="text-slate-500">High Risk Parcels</span>
                    <p className="font-black text-rose-700 text-sm mt-0.5">
                      {simulationResult.risk_distribution.high} Plots
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <span className="text-slate-500">Disruption Severity</span>
                    <p className="font-black text-amber-700 text-sm mt-0.5">Moderate Corridor</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800">Impacted Parcel Breakdown:</span>
                  <div className="overflow-x-auto bg-white rounded-xl border border-blue-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Parcel</th>
                          <th className="py-2 px-3">Owner</th>
                          <th className="py-2 px-3">Current Use</th>
                          <th className="py-2 px-3">Overlap (sq.m)</th>
                          <th className="py-2 px-3">Compensation Est.</th>
                          <th className="py-2 px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {simulationResult.affected_parcels.map((ap) => (
                          <tr key={ap.parcel_id}>
                            <td className="py-2 px-3 font-bold text-blue-900">{ap.parcel_id}</td>
                            <td className="py-2 px-3 font-sans text-slate-700">{ap.owner_name}</td>
                            <td className="py-2 px-3 font-sans">{ap.current_land_use}</td>
                            <td className="py-2 px-3">{ap.overlap_area_sq_m}</td>
                            <td className="py-2 px-3 text-emerald-800 font-bold">₹{ap.acquisition_estimated_cost_inr.toLocaleString()}</td>
                            <td className="py-2 px-3 font-sans text-slate-500 text-[11px]">{ap.recommended_governance_action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: PREDICTIVE INSIGHTS */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Predictive Governance & Demand Forecasts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.impact_level === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {p.prediction_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-800">
                      Confidence: {p.confidence_percentage}%
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                  <p className="text-xs text-slate-600">{p.explanation}</p>

                  <div className="space-y-1 text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700 block">Data Sources Evaluated:</span>
                    <div className="flex flex-wrap gap-1">
                      {p.data_used.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs">
                    <span className="font-bold text-blue-900">Recommended Action: </span>
                    <span className="text-slate-700">{p.recommended_action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
