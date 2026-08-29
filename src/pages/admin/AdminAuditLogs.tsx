import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Hash,
  ShieldCheck,
  Calendar,
  User,
  ExternalLink
} from 'lucide-react';
import { advancedGovernanceService } from '../../services/advancedGovernanceService';
import { DetailedAuditLogRecord } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<DetailedAuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [selectedResult, setSelectedResult] = useState('ALL');
  const [exporting, setExporting] = useState(false);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedGovernanceService.getDetailedAuditLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load immutable audit records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const csvContent = await advancedGovernanceService.exportAuditLogsCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `landsync_audit_trail_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export audit logs');
    } finally {
      setExporting(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.parcel_id && log.parcel_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.request_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'ALL' || log.actor_role === selectedRole;
    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;
    const matchesResult = selectedResult === 'ALL' || log.result === selectedResult;

    return matchesSearch && matchesRole && matchesModule && matchesResult;
  });

  if (loading) return <LoadingSpinner message="Fetching tamper-evident audit logs..." size="lg" />;
  if (error) return <ErrorMessage title="Audit Log Error" message={error} onRetry={loadLogs} />;

  return (
    <div id="admin-audit-logs" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Audit Trails & Governance Logs</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Immutable Prototype Ledger
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Complete, searchable record of all title alterations, GIS boundary inspections, document uploads, and administrative approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 transition shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Exporting...' : 'Export Audit CSV'}</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search actor, parcel, ID, hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 focus:bg-white"
          />
        </div>

        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white font-semibold text-slate-700"
          >
            <option value="ALL">All Roles</option>
            <option value="citizen">Citizen</option>
            <option value="officer">Officer</option>
            <option value="admin">Admin</option>
            <option value="system_admin">System Admin</option>
            <option value="state_admin">State Admin</option>
          </select>
        </div>

        <div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white font-semibold text-slate-700"
          >
            <option value="ALL">All Modules</option>
            <option value="GIS_PARCEL">GIS & Boundaries</option>
            <option value="MUTATION_WORKFLOW">Mutation Workflow</option>
            <option value="DOCUMENT_OCR">Document OCR</option>
            <option value="CROSS_VERIFICATION">Cross Verification</option>
            <option value="SECURITY_CONSENT">Security & Consent</option>
            <option value="SYSTEM_CONFIG">System Configuration</option>
          </select>
        </div>

        <div>
          <select
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white font-semibold text-slate-700"
          >
            <option value="ALL">All Results</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Parcel ID</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-700">{log.id}</td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-sans font-bold text-slate-900 block">{log.actor_name}</span>
                    <span className="text-[10px] text-slate-400 uppercase">{log.actor_role}</span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-700">{log.module}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-blue-950">{log.action_type}</td>
                  <td className="py-3 px-4 text-slate-600">{log.parcel_id || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.result === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : log.result === 'FAILURE'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[10px] text-slate-400 truncate max-w-[120px]" title={log.integrity_hash}>
                    {log.integrity_hash.substring(0, 14)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
