import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Database,
  Layers,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet,
  Search,
  Filter
} from 'lucide-react';
import { advancedGovernanceService } from '../../services/advancedGovernanceService';
import { DataQualityReport } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export const AdminDataQuality: React.FC = () => {
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await advancedGovernanceService.getDataQualityReport();
      setReport(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze land record data quality.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Evaluating Cadastral & RoR Data Quality Score..." size="lg" />;
  if (error) return <ErrorMessage title="Data Quality Engine Error" message={error} onRetry={loadData} />;
  if (!report) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-800 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-teal-800 bg-teal-50 border-teal-200';
    if (score >= 60) return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-rose-800 bg-rose-50 border-rose-200';
  };

  return (
    <div id="admin-data-quality" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Quality & Integrity Management</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(report.data_quality_score)}`}>
              Quality Level: {report.quality_level}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Automated auditing of spatial geometry, revenue field completeness, duplicate registrations, and stale metadata.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Auditing Records...' : 'Re-Run Quality Audit'}</span>
        </button>
      </div>

      {/* Top Banner: Composite Data Quality Score */}
      <div className="bg-blue-950 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
            National Land Data Quality Index (DQI)
          </span>
          <h2 className="text-xl font-extrabold text-white">Cadastral & Title Cleanliness Baseline</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Calculated across {report.total_records_analyzed} integrated parcel records from Revenue, Registration, Survey & Settlement, and Urban Local Bodies.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="text-center">
            <span className="text-4xl font-black text-teal-400">{report.data_quality_score}</span>
            <span className="text-xs text-slate-400 block font-mono">/ 100</span>
          </div>
          <div className="border-l border-slate-700 pl-4 text-xs space-y-1">
            <p className="font-bold text-slate-200">Integrity: {report.quality_level}</p>
            <p className="text-slate-400">{report.total_records_analyzed - report.missing_data_count} Validated</p>
          </div>
        </div>
      </div>

      {/* 6 Quality Dimension Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Missing Data</span>
          <p className="text-xl font-black text-slate-900 mt-1">{report.missing_data_count}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Unfilled Fields</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Duplicates</span>
          <p className="text-xl font-black text-slate-900 mt-1">{report.duplicate_records_count}</p>
          <span className="text-[10px] text-rose-600 font-semibold">Dual Registrations</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Invalid Geometry</span>
          <p className="text-xl font-black text-slate-900 mt-1">{report.invalid_geometry_count}</p>
          <span className="text-[10px] text-rose-600 font-semibold">Self-Intersections</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Mapping Errors</span>
          <p className="text-xl font-black text-slate-900 mt-1">{report.mapping_errors_count}</p>
          <span className="text-[10px] text-slate-500 font-semibold">Schema Offsets</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Conflicts</span>
          <p className="text-xl font-black text-slate-900 mt-1">{report.conflicting_records_count}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Disputed Areas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Stale Records</span>
          <p className="text-xl font-black text-slate-900 mt-1">{report.stale_records_count}</p>
          <span className="text-[10px] text-slate-400 font-semibold">&gt; 180 Days Sync</span>
        </div>
      </div>

      {/* Data Source Status & Quality Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source Connectors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-1">
          <h3 className="text-base font-bold text-slate-900">Registry Source Health</h3>
          <div className="space-y-3">
            {report.data_source_status.map((src) => (
              <div key={src.source_name} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">{src.source_name}</span>
                  <span className="font-mono text-emerald-800 font-bold">{src.health_score}%</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>{src.records_count} Records</span>
                  <span className="font-mono">{src.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Issues List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <h3 className="text-base font-bold text-slate-900">Detected Quality Anomalies ({report.recent_quality_issues.length})</h3>
          <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
            {report.recent_quality_issues.map((issue) => (
              <div key={issue.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-900">{issue.parcel_id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        issue.severity === 'HIGH' || issue.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {issue.issue_type}
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1 font-medium">{issue.description}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                    Field: {issue.field_affected} • Detected: {new Date(issue.detected_at).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={() => alert(`Initiated automated data correction workflow for ${issue.parcel_id}`)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 shrink-0"
                >
                  Auto-Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
