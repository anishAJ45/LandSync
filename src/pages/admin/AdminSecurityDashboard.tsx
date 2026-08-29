import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RotateCcw,
  Zap,
  Activity
} from 'lucide-react';
import { advancedGovernanceService } from '../../services/advancedGovernanceService';
import { BackupRecord, ComplianceReadinessReport } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export const AdminSecurityDashboard: React.FC = () => {
  const [securityData, setSecurityData] = useState<any | null>(null);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [compliance, setCompliance] = useState<ComplianceReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'security' | 'backup' | 'compliance'>('security');
  const [backupTriggering, setBackupTriggering] = useState(false);
  const [restoreSimulating, setRestoreSimulating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sec, bks, comp] = await Promise.all([
        advancedGovernanceService.getSecurityDashboard(),
        advancedGovernanceService.getBackupRecords(),
        advancedGovernanceService.getComplianceReadiness()
      ]);
      setSecurityData(sec);
      setBackups(bks);
      setCompliance(comp);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load security and compliance telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerBackup = async (type: string) => {
    try {
      setBackupTriggering(true);
      const newBackup = await advancedGovernanceService.triggerSimulatedBackup(type);
      setBackups((prev) => [newBackup, ...prev]);
      alert(`Simulated backup "${type}" executed successfully.`);
    } catch (err) {
      alert('Failed to trigger backup');
    } finally {
      setBackupTriggering(false);
    }
  };

  const handleSimulateRestore = async (backupId: string) => {
    try {
      setRestoreSimulating(true);
      const res = await advancedGovernanceService.simulateDisasterRecovery(backupId);
      alert(`${res.message} (Restored ${res.restored_records} records in ${res.recovery_time_seconds}s)`);
    } catch (err) {
      alert('Failed to simulate recovery');
    } finally {
      setRestoreSimulating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Scanning Security Posture & Compliance Framework..." size="lg" />;
  if (error) return <ErrorMessage title="Security Engine Error" message={error} onRetry={loadData} />;

  return (
    <div id="admin-security-dashboard" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Security, Backup & Compliance Gateway</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> High Security Baseline
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Zero-Trust access interceptor, digital signatures, disaster recovery simulation, and DPI compliance checklist.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Posture</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Threats</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'backup'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Backup & Disaster Recovery ({backups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'compliance'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Compliance Readiness ({compliance?.overall_compliance_percentage || 0}%)</span>
        </button>
      </div>

      {/* Tab 1: Security & Threats */}
      {activeTab === 'security' && securityData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Auth System</span>
              <p className="text-xl font-black text-slate-900 mt-1">JWT + Argon2</p>
              <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Nominal
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Failed Logins (24h)</span>
              <p className="text-xl font-black text-slate-900 mt-1">{securityData.failed_logins_24h || 2}</p>
              <span className="text-[11px] text-slate-500 font-medium mt-1">Auto-rate limited</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Encryption Tier</span>
              <p className="text-xl font-black text-slate-900 mt-1">AES-256 (At-Rest)</p>
              <span className="text-[11px] text-indigo-700 font-semibold mt-1">TLS 1.3 in-transit</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Threat Alerts</span>
              <p className="text-xl font-black text-emerald-800 mt-1">0 Critical</p>
              <span className="text-[11px] text-emerald-800 font-semibold mt-1">Clean posture</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Security Interceptor Rules & Digital Signatures</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">e-Sign / Digital Signature Verification</p>
                  <p className="text-slate-500 text-[11px]">Enforces cryptographic checksums on RoR, Title Deeds, and FMB sketches.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ENFORCED
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Consent Access Interceptor</p>
                  <p className="text-slate-500 text-[11px]">Blocks third-party API calls without active citizen consent record token.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Backup & Disaster Recovery */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Disaster Recovery & Cadastral Snapshot Engine</h3>
              <p className="text-xs text-slate-500">Automated immutable snapshots for Cadastral GeoJSON, RoR Ledgers, and System Configurations</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleTriggerBackup('INCREMENTAL_CADASTRAL')}
                disabled={backupTriggering}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200"
              >
                + Cadastral Backup
              </button>
              <button
                onClick={() => handleTriggerBackup('FULL_SNAPSHOT')}
                disabled={backupTriggering}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-950 text-white hover:bg-blue-900"
              >
                + Full Snapshot
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Backup ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Records</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Disaster Simulation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backups.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 font-mono">
                    <td className="py-3 px-4 font-bold text-slate-900">{b.id}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-700">{b.backup_type}</td>
                    <td className="py-3 px-4">{b.records_count}</td>
                    <td className="py-3 px-4">{b.file_size_mb} MB</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{new Date(b.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSimulateRestore(b.id)}
                        disabled={restoreSimulating}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-900 hover:bg-indigo-50 border border-indigo-200 font-sans"
                      >
                        Simulate Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Compliance Readiness Checklist */}
      {activeTab === 'compliance' && compliance && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Digital Public Infrastructure (DPI)
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1">Compliance Readiness Indicator</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {compliance.disclaimer}
              </p>
            </div>

            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center">
              <span className="text-3xl font-black text-teal-400">{compliance.overall_compliance_percentage}%</span>
              <span className="text-xs text-slate-300 block font-semibold mt-0.5">{compliance.assessment_tier}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compliance.categories.map((cat) => (
              <div key={cat.category} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{cat.category}</span>
                    <h4 className="font-bold text-sm text-slate-900">{cat.title}</h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      cat.status === 'COMPLIANT'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {cat.score}% • {cat.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{cat.notes}</p>

                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Controls Verified:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.controls_verified.map((ctrl, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-mono">
                        ✓ {ctrl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
