import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Server,
  ShieldCheck,
  Activity,
  Database,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Settings,
  Sparkles,
  Table,
  Landmark,
  Layers,
  MapPin,
  ShieldAlert
} from 'lucide-react';
import api from '../../services/api';
import { AdminDashboardData } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { DataTable, Column } from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/PageHeader';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<AdminDashboardData>('/api/dashboard/admin');
      setData(response.data);
    } catch (err: any) {
      console.error('Error fetching admin dashboard data:', err);
      setError(err.response?.data?.detail || 'Failed to load administrator dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Fetching system status and administrative audit logs..." size="lg" />;
  }

  if (error) {
    return <ErrorMessage title="Admin Portal Error" message={error} onRetry={fetchAdminData} />;
  }

  if (!data) return null;

  const integrationColumns: Column<AdminDashboardData['department_integrations'][0]>[] = [
    {
      header: 'Department / Authority',
      accessorKey: 'department',
      render: (row) => <span className="font-semibold text-slate-900">{row.department}</span>,
    },
    {
      header: 'API Protocol',
      accessorKey: 'protocol',
      render: (row) => (
        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
          {row.protocol}
        </span>
      ),
    },
    {
      header: 'Connector Health',
      accessorKey: 'status',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Sync Success Rate',
      accessorKey: 'sync_rate',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-teal-900">
          {row.sync_rate}
        </span>
      ),
    },
  ];

  const auditColumns: Column<AdminDashboardData['audit_logs'][0]>[] = [
    {
      header: 'Audit ID',
      accessorKey: 'id',
      render: (row) => <span className="font-mono text-xs font-bold text-slate-700">{row.id}</span>,
    },
    {
      header: 'Actor Account',
      accessorKey: 'actor',
      render: (row) => <span className="font-mono text-xs text-blue-950 font-semibold">{row.actor}</span>,
    },
    {
      header: 'Event Action',
      accessorKey: 'action',
      render: (row) => (
        <span className="font-mono text-xs bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Details',
      accessorKey: 'detail',
      render: (row) => <span className="text-xs text-slate-700">{row.detail}</span>,
    },
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      render: (row) => <span className="font-mono text-[11px] text-slate-600">{row.timestamp}</span>,
    },
  ];

  return (
    <div id="admin-dashboard-container" className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Admin Governance & Management Hub`}
        subtitle={`System administration console for managing user roles, inspecting telemetry, configuring multi-state tenure engines, and auditing immutable ledgers.`}
        breadcrumbs={[{ label: 'Administration' }, { label: 'Governance Hub' }]}
        icon={Server}
        badge={{ text: 'System Admin', variant: 'amber' }}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/admin/system-hub"
              className="px-3.5 py-2 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900 transition flex items-center gap-1.5 shadow-xs"
            >
              <Server className="w-3.5 h-3.5 text-teal-400" />
              <span>System Diagnostics Hub</span>
            </Link>
            <Link
              to="/admin/state-configuration"
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>State Config (P10)</span>
            </Link>
          </div>
        }
      />

      {/* Quick Access Admin Operations Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          to="/admin/system-hub"
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Server className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">System Hub</div>
          <div className="text-[10px] text-slate-500">Live health & jobs</div>
        </Link>

        <Link
          to="/admin/users-roles"
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">User Roles</div>
          <div className="text-[10px] text-slate-500">RBAC permissions</div>
        </Link>

        <Link
          to="/admin/configuration"
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-xs transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Settings className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700">Configuration</div>
          <div className="text-[10px] text-slate-500">Feature flags & SLA</div>
        </Link>

        <Link
          to="/admin/data-quality"
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-xs transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700">Data Quality</div>
          <div className="text-[10px] text-slate-500">Cadastral scorer</div>
        </Link>

        <Link
          to="/admin/security"
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-xs transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700">Security</div>
          <div className="text-[10px] text-slate-500">DPDP compliance</div>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-rose-400 hover:shadow-xs transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700">Audit Ledger</div>
          <div className="text-[10px] text-slate-500">SHA-256 integrity</div>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard
          id="stat-total-users"
          title="Total Users"
          value={data.stats.total_users}
          subtitle="All Active Accounts"
          icon={Users}
          variant="primary"
        />
        <StatCard
          id="stat-citizens"
          title="Citizens"
          value={data.stats.citizens}
          subtitle="Land Owners"
          icon={Users}
          variant="secondary"
        />
        <StatCard
          id="stat-officers"
          title="Officers"
          value={data.stats.officers}
          subtitle="Tahsildars"
          icon={Users}
          variant="primary"
        />
        <StatCard
          id="stat-admins"
          title="Admins"
          value={data.stats.admins}
          subtitle="State Operators"
          icon={ShieldCheck}
          variant="warning"
        />
        <StatCard
          id="stat-system-status"
          title="System Status"
          value="Healthy"
          subtitle="FastAPI Core Running"
          icon={Server}
          variant="success"
        />
        <StatCard
          id="stat-api-status"
          title="API Uptime"
          value="100%"
          subtitle="All Microservices Up"
          icon={Activity}
          variant="success"
        />
      </div>

      {/* Department Integrations Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-blue-950">
            Departmental & Judicial Integrations
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            4 Interoperable Public Infrastructure Connectors
          </span>
        </div>
        <DataTable
          id="admin-integrations-table"
          columns={integrationColumns}
          data={data.department_integrations}
        />
      </div>

      {/* Cryptographic Audit Trail */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-blue-950">
            System Security & Audit Trail
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Immutable operation history
          </span>
        </div>
        <DataTable id="admin-audit-table" columns={auditColumns} data={data.audit_logs} />
      </div>

      {/* Statutory Disclaimer */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p>
          <strong>DPI Statutory Notice:</strong> LandSync provides digital workflow and AI-assisted verification support. Final decisions are made by authorized officials.
        </p>
      </div>
    </div>
  );
};
