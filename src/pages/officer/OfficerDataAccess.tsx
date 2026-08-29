import React, { useState, useEffect } from 'react';
import {
  Network,
  Search,
  ShieldCheck,
  Building2,
  FileText,
  Clock,
  Layers,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter,
  UserCheck,
  Send,
  Eye,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { interoperabilityService } from '../../services/interoperabilityService';
import { parcelService } from '../../services/parcelService';
import {
  DepartmentSystem,
  ParcelConnectedRecordsOverview,
  DataLineageItem,
  IntegrationRequest,
  Parcel
} from '../../types';

export const OfficerDataAccess: React.FC = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState<string>('TN-CBE-001-124-2');
  const [departments, setDepartments] = useState<DepartmentSystem[]>([]);
  const [connectedRecords, setConnectedRecords] = useState<ParcelConnectedRecordsOverview | null>(null);
  const [lineageItems, setLineageItems] = useState<DataLineageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'connected' | 'request' | 'lineage'>('connected');

  // Single Request Form
  const [targetDept, setTargetDept] = useState('DEPT-000001');
  const [officialPurpose, setOfficialPurpose] = useState('Official title verification and Land DNA profile synthesis');
  const [accessMode, setAccessMode] = useState<'OFFICIAL_AUTHORIZED' | 'SYSTEM_AUTHORIZED' | 'CITIZEN_CONSENT'>('OFFICIAL_AUTHORIZED');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [lastRequestResult, setLastRequestResult] = useState<IntegrationRequest | null>(null);

  // Lineage Filter
  const [lineageSearch, setLineageSearch] = useState('');

  // Inspector state
  const [inspectRecord, setInspectRecord] = useState<any | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedParcelId) {
      loadParcelConnectedData(selectedParcelId);
    }
  }, [selectedParcelId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [parcelList, deptList, lineage] = await Promise.all([
        parcelService.getAllParcels(),
        interoperabilityService.getDepartments(),
        interoperabilityService.getDataLineage()
      ]);
      setParcels(parcelList);
      setDepartments(deptList);
      setLineageItems(lineage);
      if (parcelList.length > 0) {
        setSelectedParcelId(parcelList[0].parcel_id);
      }
    } catch (err) {
      console.error('Failed to load officer data access data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadParcelConnectedData = async (parcelId: string) => {
    setLoading(true);
    try {
      const data = await interoperabilityService.getParcelConnectedRecords(parcelId);
      setConnectedRecords(data);
    } catch (err) {
      console.error('Failed to fetch connected records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteOfficialRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRequest(true);
    try {
      const result = await interoperabilityService.createIntegrationRequest({
        target_system: targetDept,
        request_type: 'OFFICIAL_AUDIT_PULL',
        parcel_id: selectedParcelId,
        purpose: officialPurpose,
        access_mode: accessMode
      });
      setLastRequestResult(result);
      // Refresh connected records and lineage
      loadParcelConnectedData(selectedParcelId);
      const updatedLineage = await interoperabilityService.getDataLineage();
      setLineageItems(updatedLineage);
    } catch (err) {
      console.error('Failed to submit integration request:', err);
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                Officer Interoperability Console
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Statutory Cross-Department Access
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              DPI Multi-Department Record Synchronizer
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
              Fetch, aggregate, and cross-examine authoritative records from 8 state departments in real-time under statutory revenue and survey officer audit authority.
            </p>
          </div>

          {/* Parcel Selector */}
          <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Target Parcel</label>
            <select
              value={selectedParcelId}
              onChange={(e) => setSelectedParcelId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-teal-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              {parcels.map((p) => (
                <option key={p.parcel_id} value={p.parcel_id}>
                  {p.parcel_id} (Survey {p.survey_number} — {p.village})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('connected')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'connected'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Connected Department Records (8/8)</span>
          {connectedRecords && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-teal-800 text-teal-200 font-bold">
              {connectedRecords.overall_data_quality_score}% Quality
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('request')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'request'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Statutory Data Pull Request</span>
        </button>

        <button
          onClick={() => setActiveTab('lineage')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'lineage'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Data Lineage & Audit Trail</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700">
            {lineageItems.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Connected Department Records Overview */}
      {activeTab === 'connected' && connectedRecords && (
        <div className="space-y-6">
          {/* Parcel Metadata Header */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {connectedRecords.parcel_id}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                  Survey {connectedRecords.survey_number}
                </span>
                <span className="text-xs text-slate-700">
                  {connectedRecords.village}, {connectedRecords.district}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Multi-Department Federated Record Matrix
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-700 font-medium">Aggregated Data Quality</div>
                <div className="text-xl font-bold text-emerald-800">
                  {connectedRecords.overall_data_quality_score} / 100
                </div>
              </div>
              <button
                onClick={() => loadParcelConnectedData(selectedParcelId)}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer transition"
                title="Refresh All Feeds"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Grid of 8 Department Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {connectedRecords.records.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-teal-500 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {rec.department_system.system_id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      SCORE: {rec.data_quality_score}%
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{rec.department_system.department_name}</h3>
                  <p className="text-[11px] text-slate-700 font-medium">{rec.department_system.system_name}</p>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Record Ref:</span>
                      <span className="font-mono font-semibold text-slate-800 text-[11px] truncate max-w-[120px]">
                        {rec.source_record_id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Title / Holder:</span>
                      <span className="font-medium text-slate-900 truncate max-w-[120px]">
                        {rec.record.owner_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Area Metric:</span>
                      <span className="font-medium text-slate-900">
                        {rec.record.standardized_area_sqm} m²
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Encumbrance:</span>
                      <span className={`font-semibold text-[11px] px-1.5 py-0.2 rounded ${
                        rec.record.encumbrance_status === 'FREE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {rec.record.encumbrance_status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-700">
                    Synced: {new Date(rec.last_synced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => setInspectRecord(rec)}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Statutory Data Pull Request Wizard */}
      {activeTab === 'request' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Statutory Departmental Data Pull Request</h2>
            <p className="text-xs text-slate-700 mt-0.5">
              Issue an authorized DPI integration query to synchronize external departmental records with legal audit justification.
            </p>
          </div>

          <form onSubmit={handleExecuteOfficialRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Land Parcel</label>
              <select
                value={selectedParcelId}
                onChange={(e) => setSelectedParcelId(e.target.value)}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Department System</label>
              <select
                value={targetDept}
                onChange={(e) => setTargetDept(e.target.value)}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Access Authorization Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between ${accessMode === 'OFFICIAL_AUTHORIZED' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">OFFICIAL_AUTHORIZED</span>
                    <input
                      type="radio"
                      name="accessMode"
                      checked={accessMode === 'OFFICIAL_AUTHORIZED'}
                      onChange={() => setAccessMode('OFFICIAL_AUTHORIZED')}
                      className="text-blue-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-700 mt-1">Statutory verification powers (Revenue / Tahsildar / SRO audit)</p>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between ${accessMode === 'SYSTEM_AUTHORIZED' ? 'border-purple-600 bg-purple-50/50' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">SYSTEM_AUTHORIZED</span>
                    <input
                      type="radio"
                      name="accessMode"
                      checked={accessMode === 'SYSTEM_AUTHORIZED'}
                      onChange={() => setAccessMode('SYSTEM_AUTHORIZED')}
                      className="text-purple-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-700 mt-1">Automated background Land DNA & risk engine profiling</p>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between ${accessMode === 'CITIZEN_CONSENT' ? 'border-teal-600 bg-teal-50/50' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">CITIZEN_CONSENT</span>
                    <input
                      type="radio"
                      name="accessMode"
                      checked={accessMode === 'CITIZEN_CONSENT'}
                      onChange={() => setAccessMode('CITIZEN_CONSENT')}
                      className="text-teal-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-700 mt-1">Dispatches cryptographic consent token to title holder</p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Audit Purpose</label>
              <textarea
                value={officialPurpose}
                onChange={(e) => setOfficialPurpose(e.target.value)}
                rows={3}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                placeholder="Specify administrative reason, file reference number, or court decree index..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submittingRequest}
                className="w-full py-3 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {submittingRequest ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Dispatch Authorized Gateway Request</span>
              </button>
            </div>
          </form>

          {/* Last Request Result Modal / Banner */}
          {lastRequestResult && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono">Request: {lastRequestResult.request_id}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  {lastRequestResult.status}
                </span>
              </div>
              <p className="text-xs">
                Authoritative record retrieved and mapped to CommonLandRecord standard with Quality Score: <strong>{lastRequestResult.data_quality_score}/100</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Data Lineage & Audit Trail */}
      {activeTab === 'lineage' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Data Lineage & Statutory Access Trail</h3>
              <p className="text-xs text-slate-700">Immutable audit log tracking every cross-departmental data retrieval, purpose, and authorized official.</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Lineage ID, Official or Parcel..."
                value={lineageSearch}
                onChange={(e) => setLineageSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-3 px-4">Lineage ID</th>
                  <th className="py-3 px-4">Parcel ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Source System</th>
                  <th className="py-3 px-4">Accessed By</th>
                  <th className="py-3 px-4">Audit Purpose</th>
                  <th className="py-3 px-4">Access Mode</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineageItems
                  .filter((item) =>
                    !lineageSearch ||
                    item.lineage_id.toLowerCase().includes(lineageSearch.toLowerCase()) ||
                    item.parcel_id.toLowerCase().includes(lineageSearch.toLowerCase()) ||
                    item.accessed_by.toLowerCase().includes(lineageSearch.toLowerCase()) ||
                    item.access_purpose.toLowerCase().includes(lineageSearch.toLowerCase())
                  )
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-teal-800">{item.lineage_id}</td>
                      <td className="py-3 px-4 font-mono text-slate-900">{item.parcel_id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {item.data_category.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{item.source_system}</td>
                      <td className="py-3 px-4 text-slate-900 font-medium">{item.accessed_by}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={item.access_purpose}>
                        {item.access_purpose}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">
                          {item.access_mode}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Record Modal */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {inspectRecord.department_system.system_id}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {inspectRecord.department_system.department_name}
                </h3>
                <p className="text-xs text-slate-700">Authoritative Synchronized Record</p>
              </div>
              <button
                onClick={() => setInspectRecord(null)}
                className="p-2 rounded-xl text-slate-700 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-semibold">Authoritative Record ID:</span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{inspectRecord.source_record_id}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-semibold">Data Quality Score:</span>
                  <div className="font-bold text-emerald-800 text-sm mt-0.5">{inspectRecord.data_quality_score} / 100</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Transformed Common Land Data Representation
                </h4>
                <pre className="text-xs font-mono bg-slate-900 text-teal-300 p-4 rounded-xl overflow-x-auto max-h-60">
                  {JSON.stringify(inspectRecord.record, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Raw Department Source Preview
                </h4>
                <pre className="text-xs font-mono bg-slate-900 text-amber-300 p-4 rounded-xl overflow-x-auto max-h-40">
                  {JSON.stringify(inspectRecord.raw_preview, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectRecord(null)}
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
