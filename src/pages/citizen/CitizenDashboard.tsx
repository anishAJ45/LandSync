import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Clock,
  FileCheck2,
  Bell,
  MapPin,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Compass,
  FileText,
  ShieldCheck,
  Network
} from 'lucide-react';
import api from '../../services/api';
import { CitizenDashboardData } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { DataTable, Column } from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/PageHeader';

export const CitizenDashboard: React.FC = () => {
  const [data, setData] = useState<CitizenDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCitizenData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<CitizenDashboardData>('/api/dashboard/citizen');
      setData(response.data);
    } catch (err: any) {
      console.error('Error fetching citizen dashboard data:', err);
      setError(err.response?.data?.detail || 'Failed to load citizen land records and dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizenData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Fetching your land records and verification status..." size="lg" />;
  }

  if (error) {
    return <ErrorMessage title="Citizen Portal Error" message={error} onRetry={fetchCitizenData} />;
  }

  if (!data) return null;

  const parcelColumns: Column<CitizenDashboardData['recent_parcels'][0]>[] = [
    {
      header: 'Parcel ID / ULPIN',
      accessorKey: 'parcel_id',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-blue-950 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
          {row.parcel_id}
        </span>
      ),
    },
    {
      header: 'Survey Number',
      accessorKey: 'survey_no',
      render: (row) => <span className="font-semibold text-slate-800">{row.survey_no}</span>,
    },
    {
      header: 'Location',
      accessorKey: 'location',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>{row.location}</span>
        </div>
      ),
    },
    {
      header: 'Area & Classification',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.area}</div>
          <div className="text-xs text-slate-500">{row.type}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            row.status === 'Verified'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {row.status === 'Verified' ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ) : (
            <Clock className="w-3 h-3 text-amber-600" />
          )}
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
            <span>Parcel 360°</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
          <Link
            to={`/gis?parcel_id=${encodeURIComponent(row.parcel_id)}`}
            className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-950 hover:bg-slate-50 transition"
            title="View on Cadastral GIS Map"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-900" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div id="citizen-dashboard-container" className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Citizen Services Dashboard`}
        subtitle={`Welcome back, ${data.user.full_name}. Manage your registered land parcels, track mutation workflows, and access instant AI assistance.`}
        breadcrumbs={[{ label: 'Citizen Services' }, { label: 'Dashboard' }]}
        icon={Layers}
        badge={{ text: 'Aadhaar Verified', variant: 'teal' }}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/citizen/guided-journey"
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Compass className="w-4 h-4" />
              <span>Guided Journey</span>
            </Link>
            <Link
              to="/citizen/create-request"
              className="px-3.5 py-2 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900 transition flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Submit Request</span>
            </Link>
          </div>
        }
      />

      {/* Quick Access Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/citizen/guided-journey"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-xs transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Compass className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700">5-Step Wizard</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Guided mutation helper</div>
        </Link>

        <Link
          to="/assistant"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-xs transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700">AI Voice Assistant</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ask questions in EN/HI/TA</div>
        </Link>

        <Link
          to="/gis"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">GIS Cadastral Map</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Inspect vector polygons</div>
        </Link>

        <Link
          to="/citizen/documents"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Document OCR</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Verify Sale Deed & EC</div>
        </Link>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-my-parcels"
          title="My Land Parcels"
          value={data.stats.my_parcels}
          subtitle="Registered in Cadastral DB"
          icon={Layers}
          variant="secondary"
        />
        <StatCard
          id="stat-pending-requests"
          title="Pending Requests"
          value={data.stats.pending_requests}
          subtitle="Under Tahsildar Review"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          id="stat-verified-records"
          title="Verified Records"
          value={data.stats.verified_records}
          subtitle="Digitally Signed Pattas"
          icon={FileCheck2}
          variant="success"
        />
        <StatCard
          id="stat-notifications"
          title="Notifications"
          value={data.stats.unread_notifications}
          subtitle="Recent Revenue Updates"
          icon={Bell}
          variant="primary"
        />
      </div>

      {/* Main Parcels Table Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-blue-950">
            My Registered Land Parcels
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Displaying {data.recent_parcels.length} assigned parcels
          </span>
        </div>
        <DataTable id="citizen-parcels-table" columns={parcelColumns} data={data.recent_parcels} />
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-blue-950 mb-4 flex items-center justify-between">
          <span>Recent Activity & Application Trail</span>
          <span className="text-xs font-normal text-slate-500">Live timeline</span>
        </h3>
        <div className="divide-y divide-slate-100">
          {data.recent_activity.map((act) => (
            <div key={act.id} className="py-3.5 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{act.action}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{act.target}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                  {act.status}
                </span>
                <p className="text-[10px] text-slate-600 mt-1 font-mono">{act.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statutory Disclaimer */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p>
          <strong>Land Governance Notice:</strong> LandSync provides digital workflow and AI-assisted verification support. Final decisions are made by authorized officials.
        </p>
      </div>
    </div>
  );
};
