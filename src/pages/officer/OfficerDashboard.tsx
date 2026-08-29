import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Cpu,
  ShieldAlert,
  ArrowRight,
  MapPin,
  Building2,
  Compass,
  FileCheck2,
  Dna,
  FolderOpen
} from 'lucide-react';
import api from '../../services/api';
import { OfficerDashboardData } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { DataTable, Column } from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/PageHeader';

export const OfficerDashboard: React.FC = () => {
  const [data, setData] = useState<OfficerDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOfficerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<OfficerDashboardData>('/api/dashboard/officer');
      setData(response.data);
    } catch (err: any) {
      console.error('Error fetching officer dashboard data:', err);
      setError(err.response?.data?.detail || 'Failed to load officer verification queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Fetching Land Officer verification queue..." size="lg" />;
  }

  if (error) {
    return <ErrorMessage title="Officer Console Error" message={error} onRetry={fetchOfficerData} />;
  }

  if (!data) return null;

  const queueColumns: Column<OfficerDashboardData['verification_queue'][0]>[] = [
    {
      header: 'Case ID',
      accessorKey: 'case_id',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-blue-950 bg-slate-100 px-2 py-1 rounded">
          {row.case_id}
        </span>
      ),
    },
    {
      header: 'Parcel ID (ULPIN)',
      accessorKey: 'parcel_id',
      render: (row) => (
        <span className="font-mono text-xs text-teal-800 font-semibold">
          {row.parcel_id}
        </span>
      ),
    },
    {
      header: 'Applicant Name',
      accessorKey: 'applicant_name',
      render: (row) => <span className="font-medium text-slate-900">{row.applicant_name}</span>,
    },
    {
      header: 'Verification Request',
      accessorKey: 'request_type',
      render: (row) => <span className="text-slate-700">{row.request_type}</span>,
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
            row.priority === 'High'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : row.priority === 'Medium'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {row.priority}
        </span>
      ),
    },
    {
      header: 'AI Anomaly Flag',
      accessorKey: 'ai_risk_score',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${
            row.ai_risk_score.includes('Flagged')
              ? 'text-red-700 font-bold'
              : row.ai_risk_score.includes('Moderate')
              ? 'text-amber-700 font-semibold'
              : 'text-emerald-700'
          }`}
        >
          {row.ai_risk_score.includes('Flagged') ? (
            <AlertTriangle className="w-3 h-3 text-red-600" />
          ) : (
            <CheckCircle className="w-3 h-3 text-emerald-600" />
          )}
          {row.ai_risk_score}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      render: (row) => (
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200">
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/parcel/${encodeURIComponent(row.parcel_id)}`}
            className="px-2.5 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 text-teal-300 font-bold text-xs inline-flex items-center gap-1 transition"
          >
            <span>Inspect 360°</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link
            to={`/gis?parcel_id=${encodeURIComponent(row.parcel_id)}`}
            className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-950 hover:bg-slate-50 transition"
            title="Locate on GIS Map"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-900" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div id="officer-dashboard-container" className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Land Revenue Officer Console`}
        subtitle={`Command hub for Tahsildars, VAOs, and Revenue Inspectors. Manage boundary verification queues, inspect AI anomaly alerts, and endorse digital titles.`}
        breadcrumbs={[{ label: 'Officer Operations' }, { label: 'Console' }]}
        icon={ClipboardList}
        badge={{ text: 'Tahsildar Authority', variant: 'blue' }}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/officer/queue"
              className="px-3.5 py-2 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900 transition flex items-center gap-1.5 shadow-xs"
            >
              <ClipboardList className="w-3.5 h-3.5 text-teal-400" />
              <span>Full Review Queue</span>
            </Link>
            <Link
              to="/analytics/maps"
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Risk Heatmaps</span>
            </Link>
          </div>
        }
      />

      {/* Quick Access Officer Tools */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/officer/queue"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Verification Queue</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{data.stats.pending_cases} active desk cases</div>
        </Link>

        <Link
          to="/officer/anomalies"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-xs transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700">Anomaly Review</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cross-record discrepancies</div>
        </Link>

        <Link
          to="/analytics/maps"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-rose-400 hover:shadow-xs transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700">Risk & Heat Maps</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Buffer overlaps & hazards</div>
        </Link>

        <Link
          to="/officer/civic-services"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Civic Services (P9)</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Property tax & EB sync</div>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-pending-cases"
          title="Pending Cases"
          value={data.stats.pending_cases}
          subtitle="Awaiting Field / Desk Review"
          icon={ClipboardList}
          variant="primary"
        />
        <StatCard
          id="stat-high-priority"
          title="High Priority"
          value={data.stats.high_priority_cases}
          subtitle="Urgent Mutation Deadlines"
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          id="stat-completed-today"
          title="Completed Today"
          value={data.stats.completed_today}
          subtitle="Patta & Title Approvals"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          id="stat-ai-flagged"
          title="AI Flagged Cases"
          value={data.stats.ai_flagged_cases}
          subtitle="Dispute / Overlap Warnings"
          icon={Cpu}
          variant="warning"
        />
      </div>

      {/* Main Verification Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-blue-950">
            Active Verification Requests Queue
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {data.verification_queue.length} cases assigned to your division
          </span>
        </div>
        <DataTable id="officer-queue-table" columns={queueColumns} data={data.verification_queue} />
      </div>

      {/* Statutory Disclaimer */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p>
          <strong>Statutory Protocol Notice:</strong> LandSync provides digital workflow and AI-assisted verification support. Final decisions are made by authorized officials.
        </p>
      </div>
    </div>
  );
};
