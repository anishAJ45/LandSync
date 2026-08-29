import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  LandVerification,
  VerificationAnalyticsOverview,
  MockDepartmentRecord,
  VerificationAlert,
} from '../../types';
import { verificationService } from '../../services/verificationService';
import { ConsistencyScoreGauge } from '../../components/verification/ConsistencyScoreGauge';
import { SourceCardGrid } from '../../components/verification/SourceCardGrid';
import { FieldComparisonMatrix } from '../../components/verification/FieldComparisonMatrix';
import { AlertsList } from '../../components/verification/AlertsList';
import { ExplainableSummaryCard } from '../../components/verification/ExplainableSummaryCard';
import { VerificationTimeline } from '../../components/verification/VerificationTimeline';
import { StartVerificationModal } from '../../components/verification/StartVerificationModal';
import {
  Play,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Building2,
  FileCheck2,
  Download,
  ArrowLeft,
  Server,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Check,
  Clock,
  Radio,
} from 'lucide-react';

export const OfficerVerificationCases: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [verifications, setVerifications] = useState<LandVerification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<LandVerification | null>(null);
  const [analytics, setAnalytics] = useState<VerificationAnalyticsOverview | null>(null);
  const [integrations, setIntegrations] = useState<MockDepartmentRecord[]>([]);

  const [activeTab, setActiveTab] = useState<'queue' | 'studio' | 'integrations' | 'analytics'>('queue');
  const [loading, setLoading] = useState(true);
  const [refreshingCase, setRefreshingCase] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [consistencyFilter, setConsistencyFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle URL query param for specific case
  useEffect(() => {
    const caseIdFromUrl = searchParams.get('id') || searchParams.get('case_id');
    if (caseIdFromUrl && verifications.length > 0) {
      const match = verifications.find(
        (v) => v.verification_id.toLowerCase() === caseIdFromUrl.toLowerCase() || String(v.id) === caseIdFromUrl
      );
      if (match) {
        setSelectedVerification(match);
        setActiveTab('studio');
      }
    }
  }, [searchParams, verifications]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [verList, anData, intData] = await Promise.all([
        verificationService.getVerifications(),
        verificationService.getAnalyticsOverview().catch(() => null),
        verificationService.getDepartmentIntegrations().catch(() => []),
      ]);

      setVerifications(verList);
      if (anData) setAnalytics(anData);
      setIntegrations(intData);

      // Default select first case if none selected
      if (!selectedVerification && verList.length > 0) {
        setSelectedVerification(verList[0]);
      }
    } catch (err) {
      console.error('Failed to load verification cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCase = async (ver: LandVerification) => {
    try {
      setRefreshingCase(true);
      // Fetch full details if needed
      const full = await verificationService.getVerificationById(ver.verification_id);
      setSelectedVerification(full);
      setActiveTab('studio');
      setSearchParams({ id: full.verification_id });
    } catch (err) {
      console.error('Failed to load full verification details:', err);
      setSelectedVerification(ver);
      setActiveTab('studio');
    } finally {
      setRefreshingCase(false);
    }
  };

  const handleRerunVerification = async () => {
    if (!selectedVerification) return;
    try {
      setRefreshingCase(true);
      const updated = await verificationService.rerunVerification(selectedVerification.verification_id);
      setSelectedVerification(updated);
      setVerifications((prev) =>
        prev.map((v) => (v.verification_id === updated.verification_id ? updated : v))
      );
    } catch (err) {
      console.error('Failed to re-run verification:', err);
    } finally {
      setRefreshingCase(false);
    }
  };

  const handleAlertResolved = (resolvedAlert: VerificationAlert) => {
    if (!selectedVerification) return;
    const updatedAlerts = (selectedVerification.alerts || []).map((a) =>
      a.id === resolvedAlert.id ? resolvedAlert : a
    );
    setSelectedVerification({
      ...selectedVerification,
      alerts: updatedAlerts,
    });
  };

  const handleExportReport = () => {
    if (!selectedVerification) return;
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(selectedVerification, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${selectedVerification.verification_id}_Verification_Audit_Report.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered verifications
  const filteredVerifications = verifications.filter((v) => {
    const matchesSearch =
      v.verification_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.parcel_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.application_id && v.application_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.requested_by_name && v.requested_by_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    const matchesConsistency = consistencyFilter === 'ALL' || v.consistency_level === consistencyFilter;
    const matchesType = typeFilter === 'ALL' || v.verification_type === typeFilter;

    return matchesSearch && matchesStatus && matchesConsistency && matchesType;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 75) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div id="officer-verification-center-page" className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Land Intelligence Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">Module 5</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Cross-Record Verification & Land Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Automated multi-source cross-checking across GIS spatial boundaries, Master Revenue Patta DB, Document OCR, and Departmental Registries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadAllData()}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            title="Refresh Verification Records"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="start-verification-modal-btn"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Run New Verification</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Verifications
          </span>
          <div className="text-xl font-bold text-slate-900">{verifications.length}</div>
          <span className="text-[11px] text-slate-400 font-medium">Reconciled parcels</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            High Consistency Rate
          </span>
          <div className="text-xl font-bold text-emerald-600">
            {verifications.length > 0
              ? `${Math.round(
                  (verifications.filter((v) => v.overall_consistency_score >= 75).length /
                    verifications.length) *
                    100
                )}%`
              : '0%'}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Scores ≥ 75/100</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Critical Review Required
          </span>
          <div className="text-xl font-bold text-rose-600">
            {verifications.filter((v) => v.status === 'REQUIRES_REVIEW' || v.critical_mismatches > 0).length}
          </div>
          <span className="text-[11px] text-rose-700 font-medium">Mandatory officer hearing</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Connected Dept APIs
          </span>
          <div className="text-xl font-bold text-indigo-600">
            {integrations.filter((i) => i.status === 'ONLINE').length} / {integrations.length || 5}
          </div>
          <span className="text-[11px] text-indigo-700 font-medium">Operational data gateways</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Mean Consistency Score
          </span>
          <div className="text-xl font-bold text-slate-900">
            {verifications.length > 0
              ? `${Math.round(
                  verifications.reduce((acc, v) => acc + v.overall_consistency_score, 0) /
                    verifications.length
                )}/100`
              : 'N/A'}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Average across registry</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          id="verification-tab-queue"
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'queue'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Verification Docket & Queue ({filteredVerifications.length})</span>
        </button>

        <button
          id="verification-tab-studio"
          onClick={() => setActiveTab('studio')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'studio'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Interactive Case Studio {selectedVerification && `(${selectedVerification.verification_id})`}</span>
          {selectedVerification && selectedVerification.critical_mismatches > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          id="verification-tab-integrations"
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'integrations'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Department Integrations & Gateways ({integrations.length})</span>
        </button>

        <button
          id="verification-tab-analytics"
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Verification Intelligence Analytics</span>
        </button>
      </div>

      {/* TAB 1: VERIFICATION QUEUE & LIST */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Verification ID, Parcel ID, Applicant..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="REQUIRES_REVIEW">Requires Review</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>

              <select
                value={consistencyFilter}
                onChange={(e) => setConsistencyFilter(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Consistency Levels</option>
                <option value="HIGH_CONSISTENCY">High Consistency (90-100)</option>
                <option value="GOOD_CONSISTENCY">Good Consistency (75-89)</option>
                <option value="MODERATE_CONSISTENCY">Moderate (50-74)</option>
                <option value="LOW_CONSISTENCY">Low Consistency (&lt;50)</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Verification Scopes</option>
                <option value="FULL_PARCEL_VERIFICATION">Full Parcel 360°</option>
                <option value="OWNERSHIP_VERIFICATION">Ownership Verification</option>
                <option value="AREA_VERIFICATION">Area & Spatial</option>
                <option value="DOCUMENT_TO_RECORD_VERIFICATION">OCR to Registry</option>
              </select>
            </div>
          </div>

          {/* Verification Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                    <th className="py-3.5 px-4">Verification ID</th>
                    <th className="py-3.5 px-3">Parcel ID</th>
                    <th className="py-3.5 px-3">Scope / Type</th>
                    <th className="py-3.5 px-3">Score & Level</th>
                    <th className="py-3.5 px-3">Field Check Status</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVerifications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        No cross-record verification records match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredVerifications.map((ver) => (
                      <tr
                        key={ver.verification_id}
                        className={`hover:bg-indigo-50/20 transition-colors ${
                          selectedVerification?.verification_id === ver.verification_id ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-indigo-950">
                          {ver.verification_id}
                          <span className="block text-[10px] font-sans text-slate-400 font-normal">
                            {new Date(ver.created_at).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => navigate(`/parcel/${ver.parcel_id}`)}
                            className="font-mono font-bold text-slate-800 hover:text-indigo-600 flex items-center gap-1"
                          >
                            {ver.parcel_id}
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </button>
                        </td>

                        <td className="py-3 px-3 font-medium text-slate-700">
                          {ver.verification_type.replace(/_/g, ' ')}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreBadge(
                                ver.overall_consistency_score
                              )}`}
                            >
                              {ver.overall_consistency_score}%
                            </span>
                            <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                              {ver.consistency_level.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-emerald-700 font-semibold">{ver.matches} match</span>
                            <span className="text-slate-300">|</span>
                            {ver.minor_differences > 0 && (
                              <span className="text-amber-700 font-semibold">{ver.minor_differences} minor</span>
                            )}
                            {ver.critical_mismatches > 0 && (
                              <span className="text-rose-700 font-bold">{ver.critical_mismatches} critical!</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              ver.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ver.status === 'REQUIRES_REVIEW'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {ver.status === 'COMPLETED' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                            )}
                            {ver.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            id={`inspect-case-${ver.verification_id}`}
                            onClick={() => handleSelectCase(ver)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition"
                          >
                            <span>Inspect Case</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE CASE STUDIO */}
      {activeTab === 'studio' && (
        <div className="space-y-6">
          {selectedVerification ? (
            <>
              {/* Studio Header Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveTab('queue')}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Docket
                    </button>
                    <span className="text-slate-300">/</span>
                    <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {selectedVerification.verification_id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        selectedVerification.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {selectedVerification.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Reconciliation Studio for Parcel</span>
                    <button
                      onClick={() => navigate(`/parcel/${selectedVerification.parcel_id}`)}
                      className="font-mono text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      {selectedVerification.parcel_id}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Initiated by {selectedVerification.requested_by_name || 'Revenue Officer'} on{' '}
                    {new Date(selectedVerification.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleRerunVerification}
                    disabled={refreshingCase}
                    className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                  >
                    <RotateCw className={`w-3.5 h-3.5 text-slate-600 ${refreshingCase ? 'animate-spin' : ''}`} />
                    <span>{refreshingCase ? 'Re-running Engine...' : 'Re-run Verification'}</span>
                  </button>

                  <button
                    onClick={handleExportReport}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-200" />
                    <span>Export Audit Report</span>
                  </button>
                </div>
              </div>

              {/* Consistency Gauge & Explainable AI Narrative */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <ConsistencyScoreGauge
                    score={selectedVerification.overall_consistency_score}
                    level={selectedVerification.consistency_level}
                    totalRecords={selectedVerification.total_records_checked}
                    matches={selectedVerification.matches}
                    minorDifferences={selectedVerification.minor_differences}
                    majorMismatches={selectedVerification.major_mismatches}
                    criticalMismatches={selectedVerification.critical_mismatches}
                  />
                </div>

                <div className="lg:col-span-6">
                  <ExplainableSummaryCard
                    summary={selectedVerification.summary}
                    score={selectedVerification.overall_consistency_score}
                    level={selectedVerification.consistency_level}
                    criticalCount={selectedVerification.critical_mismatches}
                    majorCount={selectedVerification.major_mismatches}
                    minorCount={selectedVerification.minor_differences}
                  />
                </div>
              </div>

              {/* Multi-Source Immutable Snapshots Grid */}
              <SourceCardGrid
                snapshots={selectedVerification.snapshots || []}
                parcelId={selectedVerification.parcel_id}
              />

              {/* Side-by-Side Field Comparison Matrix */}
              <FieldComparisonMatrix rows={selectedVerification.matrix_rows || []} />

              {/* Actionable Alerts & Discrepancy Resolver */}
              <AlertsList
                alerts={selectedVerification.alerts || []}
                verificationId={selectedVerification.verification_id}
                onAlertResolved={handleAlertResolved}
              />

              {/* Step-by-Step Verification Audit Trail */}
              <VerificationTimeline events={selectedVerification.timeline || []} />
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Sparkles className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Case Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Please select a verification case from the queue docket to open the interactive reconciliation studio.
              </p>
              <button
                onClick={() => setActiveTab('queue')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                Go to Verification Queue
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEPARTMENT INTEGRATIONS & GATEWAYS */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950">
            <Server className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block">Multi-Department Data Integration Gateways</span>
              <p className="mt-0.5 text-indigo-800">
                LandSync integrates with external state registries including the Department of Registration (IGRS), Revenue Patta System, Spatial GIS Cadastre, Encumbrance CERSAI registry, and OCR Computer Vision.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((dept) => (
              <div
                key={dept.department_code}
                id={`integration-card-${dept.department_code.toLowerCase()}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-indigo-600">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{dept.department}</h4>
                        <span className="text-[10px] font-mono text-slate-500">{dept.department_code}</span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        dept.status === 'ONLINE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <Radio className="w-2.5 h-2.5 animate-pulse" />
                      {dept.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mt-2">{dept.description}</p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Gateway Endpoint:</span>
                      <span className="font-mono text-[11px] text-slate-800 font-semibold truncate max-w-[140px]">
                        {dept.endpoint}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Response Latency:</span>
                      <span className="font-semibold text-emerald-700">{dept.latency_ms} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Last Synchronized:</span>
                      <span className="text-slate-700 font-medium">
                        {new Date(dept.last_synced).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Sync Protocol: REST JSON / OGC</span>
                  <span className="inline-flex items-center gap-1 text-indigo-600 font-bold text-xs">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Operational
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VERIFICATION INTELLIGENCE ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consistency Level Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Consistency Score Distribution
              </h3>

              <div className="space-y-3">
                {analytics.consistency_distribution.map((item) => (
                  <div key={item.level} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.level.replace(/_/g, ' ')}</span>
                      <span className="text-slate-900 font-bold">
                        {item.count} cases ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.level.includes('HIGH')
                            ? 'bg-emerald-500'
                            : item.level.includes('GOOD')
                            ? 'bg-sky-500'
                            : item.level.includes('MODERATE')
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Mismatch Types */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Frequent Anomaly & Discrepancy Types
              </h3>

              <div className="space-y-3">
                {analytics.mismatch_types.map((m) => (
                  <div key={m.alert_type} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{m.alert_type.replace(/_/g, ' ')}</span>
                      <span className="text-slate-900 font-bold">
                        {m.count} alerts ({m.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${m.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Source Availability Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Source Availability & Query Success Rate
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Data Source</th>
                    <th className="py-2.5 px-3">Queries Executed</th>
                    <th className="py-2.5 px-3">Successful Responses</th>
                    <th className="py-2.5 px-3">Reliability Uptime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {analytics.source_availability.map((s) => (
                    <tr key={s.source_type} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 font-mono text-xs">
                        {s.source_type}
                      </td>
                      <td className="py-2.5 px-3">{s.total_queries}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">{s.available_count}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.availability_percent}% Uptime
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

      {/* Start Verification Modal */}
      <StartVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newVer) => {
          setVerifications([newVer, ...verifications]);
          setSelectedVerification(newVer);
          setActiveTab('studio');
        }}
      />
    </div>
  );
};
