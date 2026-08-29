import React, { useState, useEffect } from 'react';
import {
  Network,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Play,
  ArrowRight,
  Database,
  Search,
  Code2,
  FileSpreadsheet,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Layers,
  Sparkles,
  Server,
  Lock,
  ChevronRight,
  Filter
} from 'lucide-react';
import { interoperabilityService } from '../../services/interoperabilityService';
import { parcelService } from '../../services/parcelService';
import {
  DepartmentSystem,
  IntegrationRequest,
  IntegrationHealthSummary,
  CommonLandRecord,
  Parcel
} from '../../types';

export const DepartmentIntegrationCenter: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentSystem[]>([]);
  const [healthSummary, setHealthSummary] = useState<IntegrationHealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'systems' | 'sandbox' | 'requests' | 'health'>('systems');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('DEPT-000001');
  const [selectedDeptDetail, setSelectedDeptDetail] = useState<{
    department: DepartmentSystem;
    recent_requests: IntegrationRequest[];
    schema_mapping: Array<{ source_field: string; common_field: string; data_type: string; description: string }>;
    mock_endpoints: Array<{ method: string; path: string; description: string; sample_request: any; sample_response: any }>;
  } | null>(null);
  const [deptDetailModalOpen, setDeptDetailModalOpen] = useState(false);

  // Sandbox state
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [sandboxDept, setSandboxDept] = useState('DEPT-000001');
  const [sandboxParcelId, setSandboxParcelId] = useState('TN-CBE-001-124-2');
  const [sandboxRequestType, setSandboxRequestType] = useState('FULL_PARCEL_SYNC');
  const [sandboxExecuting, setSandboxExecuting] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<{
    request: IntegrationRequest;
    raw_mock_response: any;
    validation_report: {
      is_valid: boolean;
      data_quality_score: number;
      quality_tier: string;
      errors: string[];
      warnings: string[];
      checks_passed: number;
      total_checks: number;
    };
    transformation_logs: Array<{
      source_field: string;
      target_field: string;
      transformation_type: string;
      original_value: string;
      transformed_value: string;
      success: boolean;
    }>;
    standardized_record: CommonLandRecord;
    data_lineage_preview: any;
  } | null>(null);

  // Requests Table Filters
  const [requestSearch, setRequestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptList, health, parcelsData] = await Promise.all([
        interoperabilityService.getDepartments(),
        interoperabilityService.getHealthMetrics(),
        parcelService.getAllParcels()
      ]);
      setDepartments(deptList);
      setHealthSummary(health);
      setParcels(parcelsData);
      if (parcelsData.length > 0 && !sandboxParcelId) {
        setSandboxParcelId(parcelsData[0].parcel_id);
      }
    } catch (err) {
      console.error('Failed to load integration center data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeptDetail = async (deptId: string) => {
    setSelectedDeptId(deptId);
    try {
      const detail = await interoperabilityService.getDepartmentById(deptId);
      setSelectedDeptDetail(detail);
      setDeptDetailModalOpen(true);
    } catch (err) {
      console.error('Failed to load department details:', err);
    }
  };

  const handleRunSandboxTest = async () => {
    setSandboxExecuting(true);
    try {
      const result = await interoperabilityService.executeSandboxTest({
        department_id: sandboxDept,
        request_type: sandboxRequestType,
        parcel_id: sandboxParcelId
      });
      setSandboxResult(result);
    } catch (err) {
      console.error('Sandbox execution failed:', err);
    } finally {
      setSandboxExecuting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5" />
                  Phase 7: DPI & Land Interoperability
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  SIH26014 Standard
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Department Integration & Interoperability Center
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
                Seamless Digital Public Infrastructure (DPI) gateway connecting 8 state and central departmental systems into an immutable Common Land Data Model without altering authoritative source databases.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition flex items-center gap-2 border border-slate-700 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Gateway</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('sandbox');
                  if (!sandboxResult) handleRunSandboxTest();
                }}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Test Sandbox</span>
              </button>
            </div>
          </div>

          {/* Important Government Disclaimer Banner */}
          <div className="mt-6 p-3.5 rounded-xl bg-slate-800/80 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-semibold text-amber-300">Prototype Notice:</span> Simulated departmental systems integration framework. Real deployment requires authorized government REST/SOAP APIs, formal data-sharing MoUs, mTLS certificates, and compliance with the Digital Personal Data Protection Act (DPDPA 2023).
            </p>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Connected Systems</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-800">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{departments.length} / 8</span>
            <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              100% Online
            </span>
          </div>
          <p className="text-xs text-slate-700 mt-1">Revenue, IGRS, Survey, CERSAI, ULB, DTCP, NJDG, SLBC</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Gateway Success Rate</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{healthSummary?.success_rate_percentage || 99.1}%</span>
            <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              Optimal SLA
            </span>
          </div>
          <p className="text-xs text-slate-700 mt-1">549 requests processed past 24h</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Avg Round-Trip Latency</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-900">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{healthSummary?.avg_response_time_ms || 184} ms</span>
            <span className="text-xs font-medium text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full">
              &lt; 250ms Target
            </span>
          </div>
          <p className="text-xs text-slate-700 mt-1">Async transformation engine</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Transformation Engine</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">6 Rules Active</span>
            <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              Zero-Loss
            </span>
          </div>
          <p className="text-xs text-slate-700 mt-1">Source-preserved normalization</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('systems')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'systems'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Department Systems Registry</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'systems' ? 'bg-blue-800 text-teal-300' : 'bg-slate-200 text-slate-700'}`}>
            {departments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'sandbox'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Interactive API Sandbox</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-100 text-teal-800 font-bold uppercase">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Gateway Request Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'health'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>DPI Health & SLAs</span>
        </button>
      </div>

      {/* TAB 1: Department Systems Registry */}
      {activeTab === 'systems' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Registered Departmental Connector Systems</h2>
            <p className="text-xs text-slate-700">Click any system to view its schema mapping, live test endpoints, and configuration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.system_id}
                onClick={() => handleOpenDeptDetail(dept.system_id)}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:border-teal-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {dept.system_id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {dept.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition">
                    {dept.department_name}
                  </h3>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">{dept.system_name}</p>

                  <p className="text-xs text-slate-700 mt-3 line-clamp-2 leading-relaxed">
                    {dept.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {dept.supported_categories.map((cat, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {cat.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-700" />
                    <span>{dept.authentication_type.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-teal-600 font-semibold group-hover:translate-x-0.5 transition">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Interactive API Sandbox */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6">
          {/* Controls Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-800">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Developer API Sandbox & Transformation Evaluator</h2>
                <p className="text-xs text-slate-700">Simulate a live departmental REST query, evaluate the field-by-field transformation engine, and inspect data quality validation.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Department System</label>
                <select
                  value={sandboxDept}
                  onChange={(e) => setSandboxDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  {departments.map((d) => (
                    <option key={d.system_id} value={d.system_id}>
                      {d.department_name} ({d.system_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sample Land Parcel</label>
                <select
                  value={sandboxParcelId}
                  onChange={(e) => setSandboxParcelId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  {parcels.map((p) => (
                    <option key={p.parcel_id} value={p.parcel_id}>
                      {p.parcel_id} — Survey {p.survey_number} ({p.current_owner || 'Owner'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Request Type</label>
                <div className="flex gap-2">
                  <select
                    value={sandboxRequestType}
                    onChange={(e) => setSandboxRequestType(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="FULL_PARCEL_SYNC">FULL_PARCEL_SYNC (RoR & Title)</option>
                    <option value="PARCEL_LOOKUP">PARCEL_LOOKUP (Standard Query)</option>
                    <option value="BOUNDARY_VERIFY">BOUNDARY_VERIFY (Cadastral Survey)</option>
                    <option value="ENCUMBRANCE_AUDIT">ENCUMBRANCE_AUDIT (Lien Check)</option>
                  </select>

                  <button
                    onClick={handleRunSandboxTest}
                    disabled={sandboxExecuting}
                    className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
                  >
                    {sandboxExecuting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                    <span>Execute</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sandbox Results Display */}
          {sandboxResult && (
            <div className="space-y-6 animate-fadeIn">
              {/* Validation & Quality Banner */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      sandboxResult.validation_report.data_quality_score >= 90
                        ? 'bg-emerald-50 text-emerald-800'
                        : sandboxResult.validation_report.data_quality_score >= 70
                        ? 'bg-amber-50 text-amber-900'
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          Data Quality Score: {sandboxResult.validation_report.data_quality_score} / 100
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {sandboxResult.validation_report.quality_tier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5">
                        Passed {sandboxResult.validation_report.checks_passed} of {sandboxResult.validation_report.total_checks} automated schema, identity & integrity checks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                      Request ID: {sandboxResult.request.request_id}
                    </span>
                    <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                      Lineage: {sandboxResult.data_lineage_preview.lineage_id}
                    </span>
                  </div>
                </div>

                {sandboxResult.validation_report.warnings.length > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Transformation Warnings: </span>
                      {sandboxResult.validation_report.warnings.join('; ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Grid: Raw Department Response VS Standardized Common Land Record */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Raw Department Payload */}
                <div className="bg-slate-950 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        1. Raw Department Source Payload (Mock Output)
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      UNMODIFIED
                    </span>
                  </div>
                  <pre className="text-xs font-mono bg-slate-900 p-4 rounded-xl overflow-x-auto text-emerald-400 max-h-80 leading-relaxed">
                    {JSON.stringify(sandboxResult.raw_mock_response, null, 2)}
                  </pre>
                  <p className="text-[11px] text-slate-400 mt-3 italic">
                    * Authoritative source data remains strictly unmodified in the state registry.
                  </p>
                </div>

                {/* Right: Standardized Common Land Record */}
                <div className="bg-slate-950 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-teal-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        2. Transformed Common Land Record (Canonical Schema)
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-mono">
                      CommonLandRecord.v1
                    </span>
                  </div>
                  <pre className="text-xs font-mono bg-slate-900 p-4 rounded-xl overflow-x-auto text-teal-300 max-h-80 leading-relaxed">
                    {JSON.stringify(sandboxResult.standardized_record, null, 2)}
                  </pre>
                  <p className="text-[11px] text-slate-400 mt-3 italic">
                    * Clean standardized representation ready for Land DNA, Risk Engine, and Citizen Views.
                  </p>
                </div>
              </div>

              {/* Transformation Logs Table */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Step-by-Step Data Transformation Trace</h4>
                    <p className="text-xs text-slate-700">Audit trail showing exact field mappings and unit conversions executed by the transformation pipeline.</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {sandboxResult.transformation_logs.length} Rules Executed
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                        <th className="py-2.5 px-3">Rule Type</th>
                        <th className="py-2.5 px-3">Source Field</th>
                        <th className="py-2.5 px-3">Raw Value</th>
                        <th className="py-2.5 px-3 text-center">&rarr;</th>
                        <th className="py-2.5 px-3">Target Field</th>
                        <th className="py-2.5 px-3">Standardized Value</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sandboxResult.transformation_logs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                              {log.transformation_type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-amber-700">{log.source_field}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{log.original_value}</td>
                          <td className="py-2.5 px-3 text-center text-slate-700">&rarr;</td>
                          <td className="py-2.5 px-3 font-mono text-teal-700 font-semibold">{log.target_field}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-900 font-medium">{log.transformed_value}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              APPLIED
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
        </div>
      )}

      {/* TAB 3: Gateway Request Logs */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Interoperability Gateway Transaction Logs</h3>
              <p className="text-xs text-slate-700">Real-time audit log of all departmental requests dispatched through the DPI layer.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Request ID or Parcel..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 w-56"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Target System</th>
                  <th className="py-3 px-4">Parcel ID</th>
                  <th className="py-3 px-4">Requested By</th>
                  <th className="py-3 px-4">Access Mode</th>
                  <th className="py-3 px-4">Data Quality</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-900">INT-2026-000001</td>
                  <td className="py-3 px-4 font-medium text-slate-900">Tamil Nilam (Revenue)</td>
                  <td className="py-3 px-4 font-mono text-slate-700">TN-CBE-001-124-2</td>
                  <td className="py-3 px-4 text-slate-700">Tahsildar M. Ramanathan</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-semibold text-[10px]">
                      OFFICIAL_AUTHORIZED
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-800">98 / 100</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      COMPLETED
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-mono">Just now</td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-900">INT-2026-000002</td>
                  <td className="py-3 px-4 font-medium text-slate-900">CollabLand FMB (Survey)</td>
                  <td className="py-3 px-4 font-mono text-slate-700">TN-CBE-001-124-2</td>
                  <td className="py-3 px-4 text-slate-700">DPI Cadastral Engine</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold text-[10px]">
                      SYSTEM_AUTHORIZED
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-800">96 / 100</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      COMPLETED
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-mono">10 mins ago</td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-900">INT-2026-000003</td>
                  <td className="py-3 px-4 font-medium text-slate-900">CERSAI Central Registry</td>
                  <td className="py-3 px-4 font-mono text-slate-700">TN-CBE-001-126-2</td>
                  <td className="py-3 px-4 text-slate-700">SBI Agricultural Cell</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold text-[10px]">
                      CITIZEN_CONSENT
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-800">100 / 100</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      COMPLETED
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-mono">1 hour ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DPI Health & SLAs */}
      {activeTab === 'health' && healthSummary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Hourly Throughput</h4>
              <div className="mt-3 space-y-2">
                {healthSummary.requests_timeline.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-600">{item.time}</span>
                    <div className="flex-1 mx-3 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-500 h-full rounded-full"
                        style={{ width: `${(item.requests / 200) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-800">{item.requests} req</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Requests by Category</h4>
              <div className="mt-3 space-y-2">
                {healthSummary.requests_by_category.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 truncate max-w-[140px]">{cat.category.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-slate-800">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Status Distribution</h4>
              <div className="mt-3 space-y-2">
                {healthSummary.requests_by_status.map((st, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{st.status}</span>
                    <span className="font-bold text-emerald-800">{st.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Details Modal */}
      {deptDetailModalOpen && selectedDeptDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {selectedDeptDetail.department.system_id}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedDeptDetail.department.department_name}
                </h3>
                <p className="text-xs text-slate-700">{selectedDeptDetail.department.system_name}</p>
              </div>
              <button
                onClick={() => setDeptDetailModalOpen(false)}
                className="p-2 rounded-xl text-slate-700 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description & Base URL */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <p className="text-slate-700 leading-relaxed">{selectedDeptDetail.department.description}</p>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 text-slate-600 font-mono">
                  <span className="font-semibold text-slate-700">Base Gateway URL:</span>
                  <span className="text-teal-700">{selectedDeptDetail.department.base_url}</span>
                </div>
              </div>

              {/* Schema Mapping Table */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Standardized Schema Mapping Contract</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-2.5">Source Department Field</th>
                        <th className="p-2.5">&rarr;</th>
                        <th className="p-2.5">Common Land Field</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Transformation Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDeptDetail.schema_mapping.map((map, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-mono text-amber-700 font-medium">{map.source_field}</td>
                          <td className="p-2.5 text-slate-700">&rarr;</td>
                          <td className="p-2.5 font-mono text-teal-700 font-bold">{map.common_field}</td>
                          <td className="p-2.5 text-slate-700 font-semibold">{map.data_type}</td>
                          <td className="p-2.5 text-slate-700">{map.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mock REST Endpoints */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Authoritative Gateway Endpoints</h4>
                <div className="space-y-2">
                  {selectedDeptDetail.mock_endpoints.map((ep, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${ep.method === 'GET' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                          {ep.method}
                        </span>
                        <span className="text-teal-300 font-semibold">{ep.path}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{ep.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setDeptDetailModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
