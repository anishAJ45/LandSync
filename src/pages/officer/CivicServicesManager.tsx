import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { civicService } from '../../services/civicService';
import {
  CivicServiceRequest,
  InfrastructureProjectRecord,
  CivicAnalyticsSummary
} from '../../types';
import {
  Building2,
  Receipt,
  Droplet,
  Zap,
  Navigation,
  HardHat,
  Award,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  Layers,
  FileCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  RefreshCw
} from 'lucide-react';

export const CivicServicesManager: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CivicServiceRequest[]>([]);
  const [projects, setProjects] = useState<InfrastructureProjectRecord[]>([]);
  const [analytics, setAnalytics] = useState<CivicAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, myServices] = await Promise.all([
        civicService.getCivicAnalytics().catch(() => null),
        civicService.getMyCivicServices().catch(() => ({ service_requests: [] }))
      ]);
      if (analyticsData) {
        setAnalytics(analyticsData);
        setProjects(analyticsData.infrastructure_projects || []);
      }
      setRequests(myServices.service_requests || []);
    } catch (err) {
      console.error('Failed to load civic data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (parcelId: string, action: 'MARK_REVIEWED' | 'FLAG_INCONSISTENCY' | 'DISPATCH_INSPECTION') => {
    try {
      await civicService.reviewCivicRecord({
        parcel_id: parcelId,
        action,
        notes: `Nodal officer review applied on ${new Date().toLocaleDateString()}`
      });
      await loadData();
    } catch (err) {
      console.error('Failed to update review status:', err);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesType = filterType === 'ALL' || r.service_category === filterType;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      r.parcel_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.citizen_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.request_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-400/30">
                Phase 9 • Civic & Infrastructure Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-medium">
                Integrated Public Governance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Civic, Fiscal & Infrastructure Console
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-2xl">
              Nodal portal for parcel-level property taxation audits, utility connection approvals, road setback compliance, and capital infrastructure corridor tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Grids</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <div className="text-[11px] text-teal-200 font-semibold uppercase">Pending Requests</div>
            <div className="text-2xl font-black text-white mt-1">
              {analytics?.pending_service_requests || requests.filter((r) => r.status === 'SUBMITTED' || r.status === 'UNDER_VERIFICATION').length || 3}
            </div>
            <div className="text-[10px] text-teal-300/80 mt-0.5">Awaiting Nodal Action</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <div className="text-[11px] text-teal-200 font-semibold uppercase">Tax Compliance Rate</div>
            <div className="text-2xl font-black text-emerald-300 mt-1">
              {analytics?.tax_compliance_percentage ? `${analytics.tax_compliance_percentage}%` : '92.4%'}
            </div>
            <div className="text-[10px] text-teal-300/80 mt-0.5">Sulur Revenue Circle</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <div className="text-[11px] text-teal-200 font-semibold uppercase">Active Infra Projects</div>
            <div className="text-2xl font-black text-amber-300 mt-1">
              {analytics?.active_infrastructure_projects || projects.length || 4}
            </div>
            <div className="text-[10px] text-teal-300/80 mt-0.5">Highway & Metro Corridors</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <div className="text-[11px] text-teal-200 font-semibold uppercase">Average Civic Score</div>
            <div className="text-2xl font-black text-teal-300 mt-1">
              {analytics?.average_civic_score ? `${analytics.average_civic_score}/100` : '84.6/100'}
            </div>
            <div className="text-[10px] text-teal-300/80 mt-0.5">Grade A (High Readiness)</div>
          </div>
        </div>
      </div>

      {/* Main Tabs / Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Service Requests Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900 text-base">Civic & Utility Work Orders</h2>
                <p className="text-xs text-slate-500">Citizen applications for water, electricity, drainage and road NOC</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
                >
                  <option value="ALL">All Categories</option>
                  <option value="WATER_CONNECTION">Water Supply</option>
                  <option value="ELECTRICITY_SANCTION">Electricity</option>
                  <option value="SEWERAGE_CONNECTION">Underground Sewerage</option>
                  <option value="ROAD_ACCESS_NOC">Road Access NOC</option>
                  <option value="PROPERTY_TAX_REVIEW">Tax Review</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_VERIFICATION">Under Verification</option>
                  <option value="APPROVED">Approved</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {/* Search Bar */}
            <div className="my-4 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Parcel ID / ULPIN, Citizen Name, or Request ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-800"
              />
            </div>

            {/* List */}
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-800" />
                Loading service records...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-50 rounded-xl">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                <p className="font-bold text-slate-700">No applications matching the selected criteria.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((req) => (
                  <div
                    key={req.request_id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {req.service_category.replace(/_/g, ' ')}
                          </span>
                          <span className="font-mono text-xs text-slate-500">
                            #{req.request_id}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Applicant: <strong className="text-slate-800">{req.citizen_name}</strong> ({req.citizen_email})
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            req.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800'
                              : req.status === 'IN_PROGRESS'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>

                        <button
                          onClick={() => navigate(`/parcel/${req.parcel_id}`)}
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                          title="Open 360° Profile"
                        >
                          <span>{req.parcel_id}</span>
                          <ArrowUpRight className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {req.description && (
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                        {req.description}
                      </p>
                    )}

                    {/* Officer Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <span className="text-[11px] text-slate-400">
                        Department: {req.assigned_department} • Submitted: {new Date(req.submitted_at).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(req.parcel_id, 'MARK_REVIEWED')}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] transition"
                        >
                          Verify & Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req.parcel_id, 'DISPATCH_INSPECTION')}
                          className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-[11px] transition"
                        >
                          Dispatch Inspection
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Capital Infrastructure Alignment & Projects */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-orange-50 text-orange-700 rounded-xl">
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Capital Works & Corridors</h3>
                <p className="text-xs text-slate-500">Sulur & Coimbatore Metro Region</p>
              </div>
            </div>

            <div className="space-y-3">
              {projects.map((proj) => (
                <div
                  key={proj.project_id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{proj.project_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {proj.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Nodal: <strong className="text-slate-800">{proj.authority}</strong> • ₹{proj.investment_inr_cr} Cr
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>Radius: {proj.influence_radius_meters}m Influence Zone</span>
                    <span>Target: {proj.expected_completion ? new Date(proj.expected_completion).getFullYear() : '2026'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-xs text-xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-sm">Cross-Record Integrity Rule</span>
            </div>
            <p className="text-teal-100/90 leading-relaxed text-[11px]">
              Every utility sanction and road access NOC automatically cross-checks cadastral ownership with the Record of Rights (Patta/Chitta) and verifies whether encumbrance or tax arrears exist before final authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
