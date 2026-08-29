import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldCheck,
  Activity,
  Layers,
  FileCheck2,
  AlertTriangle,
  RefreshCw,
  Info,
  Users,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { applicationService } from '../../services/applicationService';
import {
  AnalyticsOverview,
  StatusDistributionItem,
  ServiceTypeDistributionItem,
  MonthlyTrendItem,
  PriorityDistributionItem,
  AuditLog
} from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { StatCard } from '../../components/common/StatCard';
import { DataTable, Column } from '../../components/common/DataTable';
import { DocumentAnalyticsSection } from '../../components/admin/DocumentAnalyticsSection';

const STATUS_COLORS = {
  SUBMITTED: '#3b82f6',
  UNDER_REVIEW: '#6366f1',
  VERIFICATION_PENDING: '#f59e0b',
  MORE_INFORMATION_REQUIRED: '#ef4444',
  VERIFIED: '#14b8a6',
  APPROVED: '#10b981',
  REJECTED: '#f43f5e',
  CLOSED: '#64748b',
};

export const AdminAnalytics: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [statusData, setStatusData] = useState<StatusDistributionItem[]>([]);
  const [serviceTypeData, setServiceTypeData] = useState<ServiceTypeDistributionItem[]>([]);
  const [trendsData, setTrendsData] = useState<MonthlyTrendItem[]>([]);
  const [priorityData, setPriorityData] = useState<PriorityDistributionItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        ovData,
        stData,
        srvData,
        trData,
        prioData,
        logsData,
      ] = await Promise.all([
        applicationService.getAnalyticsOverview(),
        applicationService.getStatusDistribution(),
        applicationService.getServiceTypeDistribution(),
        applicationService.getApplicationTrends(),
        applicationService.getPriorityDistribution(),
        applicationService.getAuditLogs(20),
      ]);

      setOverview(ovData);
      setStatusData(stData);
      setServiceTypeData(srvData);
      setTrendsData(trData);
      setPriorityData(prioData);
      setAuditLogs(logsData);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.detail || 'Failed to fetch LandSync DPI analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating state-wide cadastral telemetry and analytics..." size="lg" />;
  }

  if (error) {
    return <ErrorMessage title="Analytics Error" message={error} onRetry={fetchAnalytics} />;
  }

  if (!overview) return null;

  const auditColumns: Column<AuditLog>[] = [
    {
      header: 'Audit ID',
      accessorKey: 'id',
      render: (row) => <span className="font-mono text-xs font-bold text-slate-700">{row.id}</span>,
    },
    {
      header: 'Actor',
      accessorKey: 'actor',
      render: (row) => <span className="font-mono text-xs font-semibold text-blue-950">{row.actor}</span>,
    },
    {
      header: 'Action / Event',
      accessorKey: 'action',
      render: (row) => (
        <span className="font-mono text-xs bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Audit Details',
      accessorKey: 'details',
      render: (row) => <span className="text-xs text-slate-700">{row.details}</span>,
    },
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      render: (row) => <span className="font-mono text-[11px] text-slate-500">{row.timestamp}</span>,
    },
  ];

  return (
    <div id="admin-analytics-page" className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Executive DPI Analytics & Governance
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">SIH26014 Public Telemetry</span>
          </div>
          <h1 className="text-2xl font-extrabold text-blue-950 mt-1">
            Cadastral Governance & Service Inflow Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time multi-departmental service statistics, mutation turnaround speeds, and cryptographic audit logs.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Telemetry
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          id="stat-analytics-total"
          title="Total Applications"
          value={overview.total_applications}
          subtitle="All Time Submissions"
          icon={FileCheck2}
          variant="primary"
        />
        <StatCard
          id="stat-analytics-under-review"
          title="Active In-Review"
          value={overview.under_review + overview.verification_pending}
          subtitle="Under Desk/Field Survey"
          icon={Activity}
          variant="secondary"
        />
        <StatCard
          id="stat-analytics-approved"
          title="Statutory Approved"
          value={overview.approved}
          subtitle="Mutations Issued"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          id="stat-analytics-turnaround"
          title="Avg. Turnaround"
          value={`${overview.average_processing_days} Days`}
          subtitle="Submission to Order"
          icon={Calendar}
          variant="warning"
        />
        <StatCard
          id="stat-analytics-high-prio"
          title="High Priority"
          value={overview.high_priority_cases}
          subtitle="Urgent Dockets"
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          id="stat-analytics-users"
          title="Registered Citizens"
          value={overview.total_users}
          subtitle="e-KYC Verified Accounts"
          icon={Users}
          variant="primary"
        />
      </div>

      {/* Charts Row 1: Status Distribution & Service Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Applications by Status (Pie / Donut Chart) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-blue-950 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-teal-600" />
                Applications by Workflow Status
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Live distribution of cases across statutory lifecycle</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {overview.total_applications} Cases
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name.replace(/_/g, ' ')} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={(STATUS_COLORS as any)[entry.status] || entry.color || '#3b82f6'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} Applications`,
                    String(name).replace(/_/g, ' '),
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Service Type Breakdown (Bar Chart) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-blue-950 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-900" />
                Service Inflow by Category
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Demand across verification, mutation, and boundary correction</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={serviceTypeData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  type="category"
                  dataKey="service_type"
                  width={140}
                  tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 600 }}
                  tickFormatter={(val) => val.length > 20 ? `${val.substring(0, 18)}...` : val}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} Applications`, 'Submissions']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0f172a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: 5-Month Trends & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-blue-950 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                5-Month Intake & Resolution Trends
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Comparing submitted vs verified and approved determinations</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="submitted" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSubmitted)" name="Submitted" />
                <Area type="monotone" dataKey="verified" stroke="#14b8a6" fillOpacity={0.2} fill="#14b8a6" name="Verified" />
                <Area type="monotone" dataKey="approved" stroke="#10b981" fillOpacity={1} fill="url(#colorApproved)" name="Approved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-blue-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              Urgency & Priority Intake
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Criticality ratio of current dockets</p>
          </div>

          <div className="space-y-3 pt-2">
            {priorityData.map((p) => {
              const total = overview.total_applications || 1;
              const pct = Math.round((p.count / total) * 100);
              return (
                <div key={p.priority} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{p.priority}</span>
                    <span className="text-slate-600">{p.count} cases ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: p.color || '#3b82f6',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 mt-4">
            <span className="font-bold text-slate-800 block">SLA Target Enforcement:</span>
            <p className="text-[11px] leading-relaxed">
              Critical & High priority dockets trigger automated alerts to the respective Sub-Collector and District Revenue Officer.
            </p>
          </div>
        </div>
      </div>

      {/* Document Intelligence & OCR Analytics Section */}
      <DocumentAnalyticsSection />

      {/* Audit Logs Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-blue-950 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Cryptographic Audit Trail (Immutable DPI Ledger)
          </h3>
          <span className="text-xs text-slate-500 font-medium">Real-time hash-chained event logs</span>
        </div>
        <DataTable id="analytics-audit-table" columns={auditColumns} data={auditLogs} />
      </div>

      {/* Statutory Notice */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p>
          <strong>DPI Compliance Notice:</strong> LandSync provides digital workflow and AI-assisted verification support. Final decisions are made by authorized officials.
        </p>
      </div>
    </div>
  );
};
