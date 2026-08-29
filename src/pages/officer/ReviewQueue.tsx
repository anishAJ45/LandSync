import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Clock,
  ArrowRight,
  MapPin,
  ExternalLink,
  User,
  MessageSquare,
  ShieldCheck,
  X,
  Send,
  AlertCircle,
  Info,
  Check,
  RefreshCw,
  FolderOpen,
  Calendar
} from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { Application, ApplicationStatus, TimelineEvent, OfficerNote } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { StatCard } from '../../components/common/StatCard';

export const ReviewQueue: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<{
    pending_cases: number;
    under_review: number;
    verification_pending: number;
    completed_today: number;
    high_priority: number;
  }>({
    pending_cases: 0,
    under_review: 0,
    verification_pending: 0,
    completed_today: 0,
    high_priority: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeStatusTab, setActiveStatusTab] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Inspection Drawer
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status Update State
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusRemarks, setStatusRemarks] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Add Note State
  const [officerNote, setOfficerNote] = useState('');
  const [noteType, setNoteType] = useState<'INTERNAL' | 'CITIZEN_VISIBLE' | 'ACTION_REQUIRED'>('INTERNAL');
  const [addingNote, setAddingNote] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [appsData, statsData] = await Promise.all([
        applicationService.getApplications(),
        applicationService.getOfficerQueueStats(),
      ]);
      setApplications(appsData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading review queue:', err);
      setError(err.response?.data?.detail || 'Failed to load officer verification docket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openInspection = async (app: Application) => {
    setSelectedApp(app);
    setNewStatus('');
    setStatusRemarks('');
    setOfficerNote('');
    try {
      setLoadingDetail(true);
      const [fullApp, events] = await Promise.all([
        applicationService.getApplicationById(app.application_id),
        applicationService.getTimeline(app.application_id),
      ]);
      setSelectedApp(fullApp);
      setTimeline(events);
    } catch (err) {
      console.error('Error fetching detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (targetStatus: string) => {
    if (!selectedApp) return;
    if (['REJECTED', 'MORE_INFORMATION_REQUIRED'].includes(targetStatus) && !statusRemarks.trim()) {
      alert(`Statutory remarks are required when marking a case as ${targetStatus.replace(/_/g, ' ')}.`);
      return;
    }

    try {
      setUpdatingStatus(true);
      const updated = await applicationService.updateStatus(
        selectedApp.application_id,
        targetStatus,
        statusRemarks.trim() || undefined
      );
      setSelectedApp(updated);
      setStatusRemarks('');
      setNewStatus('');
      // Refresh list and stats
      fetchData();
      // Reload timeline
      const events = await applicationService.getTimeline(selectedApp.application_id);
      setTimeline(events);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update application status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !officerNote.trim()) return;

    try {
      setAddingNote(true);
      await applicationService.addNote(selectedApp.application_id, officerNote.trim(), noteType);
      setOfficerNote('');
      // Reload detail
      const [fullApp, events] = await Promise.all([
        applicationService.getApplicationById(selectedApp.application_id),
        applicationService.getTimeline(selectedApp.application_id),
      ]);
      setSelectedApp(fullApp);
      setTimeline(events);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add officer note.');
    } finally {
      setAddingNote(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">Submitted</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">Under Review</span>;
      case 'VERIFICATION_PENDING':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">Verification Pending</span>;
      case 'MORE_INFORMATION_REQUIRED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-900 border border-red-200">Info Requested</span>;
      case 'VERIFIED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200">Verified</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">Approved</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-900 border border-rose-200">Rejected</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">Closed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-900 border border-red-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-900 border border-blue-200">MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">LOW</span>;
    }
  };

  const filteredApps = applications.filter((app) => {
    if (activeStatusTab !== 'ALL' && app.status !== activeStatusTab) return false;
    if (priorityFilter !== 'ALL' && app.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = app.application_id.toLowerCase().includes(q);
      const matchParcel = app.parcel_id.toLowerCase().includes(q);
      const matchCitizen = app.citizen_name?.toLowerCase().includes(q) || false;
      const matchType = app.service_type.toLowerCase().includes(q);
      const matchSurvey = app.survey_number?.toLowerCase().includes(q) || false;
      if (!matchId && !matchParcel && !matchCitizen && !matchType && !matchSurvey) return false;
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Fetching statutory verification queue and review dockets..." size="lg" />;
  }

  if (error) {
    return <ErrorMessage title="Queue Load Error" message={error} onRetry={fetchData} />;
  }

  return (
    <div id="officer-review-queue-page" className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Revenue & Survey Officer Console
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Tahsildar Verification Docket</span>
          </div>
          <h1 className="text-2xl font-extrabold text-blue-950 mt-1">
            Statutory Review & Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Conduct title inspection, evaluate cadastral boundary overlaps, request citizen clarifications, and issue digital mutation endorsements.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Docket
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          id="stat-queue-pending"
          title="New Submissions"
          value={stats.pending_cases}
          subtitle="Awaiting Initial Intake"
          icon={ClipboardList}
          variant="primary"
        />
        <StatCard
          id="stat-queue-review"
          title="Under Review"
          value={stats.under_review}
          subtitle="Desk Examination"
          icon={Clock}
          variant="secondary"
        />
        <StatCard
          id="stat-queue-verification"
          title="Field Verification"
          value={stats.verification_pending}
          subtitle="Surveyor Inspection"
          icon={MapPin}
          variant="warning"
        />
        <StatCard
          id="stat-queue-high-prio"
          title="High Priority"
          value={stats.high_priority}
          subtitle="Critical Dockets"
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          id="stat-queue-completed"
          title="Approved / Verified"
          value={stats.completed_today}
          subtitle="Determinations"
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Queue Filters and Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-slate-100">
          {[
            { id: 'ALL', label: 'All Cases', count: applications.length },
            { id: 'SUBMITTED', label: 'New Submitted', count: applications.filter(a => a.status === 'SUBMITTED').length },
            { id: 'UNDER_REVIEW', label: 'Under Review', count: applications.filter(a => a.status === 'UNDER_REVIEW').length },
            { id: 'VERIFICATION_PENDING', label: 'Field Verification', count: applications.filter(a => a.status === 'VERIFICATION_PENDING').length },
            { id: 'MORE_INFORMATION_REQUIRED', label: 'Info Requested', count: applications.filter(a => a.status === 'MORE_INFORMATION_REQUIRED').length },
            { id: 'VERIFIED', label: 'Verified', count: applications.filter(a => a.status === 'VERIFIED').length },
            { id: 'APPROVED', label: 'Approved', count: applications.filter(a => a.status === 'APPROVED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatusTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeStatusTab === tab.id
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeStatusTab === tab.id
                    ? 'bg-teal-400 text-blue-950 font-extrabold'
                    : 'bg-slate-100 text-slate-600 font-semibold'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Priority Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by case ID, parcel, applicant name..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-950"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Review Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Case / ID</th>
                <th className="py-3 px-4">Parcel / Location</th>
                <th className="py-3 px-4">Applicant (e-KYC)</th>
                <th className="py-3 px-4">Service Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                    No verification cases match your current filters.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr
                    key={app.application_id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => openInspection(app)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-950">
                      {app.application_id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-teal-800 font-bold">{app.parcel_id}</div>
                      <div className="text-[11px] text-slate-500">
                        {app.village ? `${app.village}, ${app.district}` : 'Tamil Nadu Cadastre'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{app.citizen_name || 'Citizen User'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{app.citizen_email}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 max-w-[200px] truncate">
                      {app.service_type}
                    </td>
                    <td className="py-3 px-4">
                      {getPriorityBadge(app.priority)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {app.submitted_at.split('T')[0]}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openInspection(app);
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-950 text-white font-bold text-[11px] hover:bg-blue-900 transition shadow-xs"
                      >
                        Inspect Docket
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Inspection & Determination Modal */}
      {selectedApp && (
        <div
          id="officer-inspection-modal"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-blue-950 bg-blue-100 px-2.5 py-0.5 rounded border border-blue-300">
                    {selectedApp.application_id}
                  </span>
                  {getStatusBadge(selectedApp.status)}
                  {getPriorityBadge(selectedApp.priority)}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedApp.service_type}
                </h2>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetail ? (
                <LoadingSpinner message="Loading application lifecycle, GIS spatial geometry, and cross-record registry checks..." />
              ) : (
                <>
                  {/* Grid 1: Applicant & Linked Parcel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Applicant e-KYC */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-800 font-bold pb-1 border-b border-slate-200">
                        <User className="w-4 h-4 text-blue-950" />
                        <span>Applicant e-KYC Identity</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Full Legal Name:</span>
                          <span className="font-bold text-slate-900">{selectedApp.citizen_name || 'Citizen'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Registered Email:</span>
                          <span className="font-mono text-slate-800">{selectedApp.citizen_email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Submission Timestamp:</span>
                          <span className="font-mono text-slate-800">{selectedApp.submitted_at}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cadastral Parcel Registry */}
                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-blue-200">
                        <div className="flex items-center gap-2 text-blue-950 font-bold">
                          <MapPin className="w-4 h-4 text-teal-600" />
                          <span>Target Parcel: {selectedApp.parcel_id}</span>
                        </div>
                      </div>
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Survey No / Subdivision:</span>
                          <span className="font-mono font-bold text-blue-950">{selectedApp.survey_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Location:</span>
                          <span className="font-bold text-slate-800">{selectedApp.village}, {selectedApp.district}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Current Title Holder:</span>
                          <span className="font-bold text-slate-900">{selectedApp.current_owner}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => {
                            setSelectedApp(null);
                            navigate(`/gis?select=${selectedApp.parcel_id}`);
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-950 text-white text-[11px] font-bold hover:bg-blue-900 transition flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3 text-teal-400" />
                          Inspect on GIS Map
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApp(null);
                            navigate(`/parcel/${selectedApp.parcel_id}`);
                          }}
                          className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 text-[11px] font-bold hover:bg-slate-50 transition flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3 text-slate-600" />
                          Parcel 360° View
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Citizen Statement */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wide block">Applicant Statement & Submission Details:</span>
                    <p className="text-slate-800 leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200">
                      {selectedApp.description}
                    </p>
                  </div>

                  {/* Officer Action & Determination Panel */}
                  <div className="p-5 rounded-2xl bg-blue-950 text-white space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-blue-900 pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-teal-400" />
                        <h3 className="font-bold text-sm">Official Determination & Statutory State Machine</h3>
                      </div>
                      <span className="text-xs text-teal-300 font-mono">Current Status: {selectedApp.status}</span>
                    </div>

                    <p className="text-xs text-blue-200 leading-relaxed">
                      Select authorized state transition to advance this case through the digital public infrastructure lifecycle.
                    </p>

                    {/* Remarks Input */}
                    <div>
                      <label className="block text-xs font-bold text-blue-200 mb-1">
                        Statutory Determination Remarks / Instructions to Citizen
                      </label>
                      <input
                        type="text"
                        value={statusRemarks}
                        onChange={(e) => setStatusRemarks(e.target.value)}
                        placeholder="e.g., FMB survey confirmed no encroachment. Digital Patta approved under Revenue Code."
                        className="w-full px-3.5 py-2 rounded-xl bg-blue-900/60 border border-blue-800 text-xs text-white placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      />
                    </div>

                    {/* Transition Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* SUBMITTED -> UNDER_REVIEW */}
                      {selectedApp.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                          disabled={updatingStatus}
                          className="px-4 py-2 rounded-xl bg-teal-500 text-blue-950 font-extrabold text-xs hover:bg-teal-400 transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-4 h-4" /> Start Formal Review (Under Review)
                        </button>
                      )}

                      {/* UNDER_REVIEW -> VERIFICATION_PENDING, MORE_INFO, VERIFIED, REJECTED */}
                      {selectedApp.status === 'UNDER_REVIEW' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus('VERIFICATION_PENDING')}
                            disabled={updatingStatus}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 text-amber-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5"
                          >
                            <MapPin className="w-3.5 h-3.5" /> Dispatch Field Survey (Verification Pending)
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('MORE_INFORMATION_REQUIRED')}
                            disabled={updatingStatus}
                            className="px-3.5 py-2 rounded-xl bg-blue-800 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Request Citizen Information
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('VERIFIED')}
                            disabled={updatingStatus}
                            className="px-3.5 py-2 rounded-xl bg-teal-400 text-blue-950 font-extrabold text-xs hover:bg-teal-300 transition flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Land Record as Verified
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('REJECTED')}
                            disabled={updatingStatus}
                            className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" /> Reject Application
                          </button>
                        </>
                      )}

                      {/* VERIFICATION_PENDING -> VERIFIED, MORE_INFO, REJECTED */}
                      {selectedApp.status === 'VERIFICATION_PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus('VERIFIED')}
                            disabled={updatingStatus}
                            className="px-4 py-2 rounded-xl bg-teal-400 text-blue-950 font-extrabold text-xs hover:bg-teal-300 transition flex items-center gap-1.5 shadow-xs"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Field Survey Passed • Mark Verified
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('MORE_INFORMATION_REQUIRED')}
                            disabled={updatingStatus}
                            className="px-3.5 py-2 rounded-xl bg-blue-800 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Request Additional Proof
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('REJECTED')}
                            disabled={updatingStatus}
                            className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" /> Reject Application
                          </button>
                        </>
                      )}

                      {/* VERIFIED -> APPROVED */}
                      {selectedApp.status === 'VERIFIED' && (
                        <button
                          onClick={() => handleUpdateStatus('APPROVED')}
                          disabled={updatingStatus}
                          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition flex items-center gap-2 shadow-md"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Grant Statutory Approval & Issue Patta Mutation
                        </button>
                      )}

                      {/* MORE_INFORMATION_REQUIRED -> UNDER_REVIEW */}
                      {selectedApp.status === 'MORE_INFORMATION_REQUIRED' && (
                        <button
                          onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                          disabled={updatingStatus}
                          className="px-4 py-2 rounded-xl bg-teal-500 text-blue-950 font-bold text-xs hover:bg-teal-400 transition flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Resume Review
                        </button>
                      )}

                      {/* APPROVED -> CLOSED */}
                      {selectedApp.status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus('CLOSED')}
                          disabled={updatingStatus}
                          className="px-4 py-2 rounded-xl bg-slate-700 text-white font-bold text-xs hover:bg-slate-600 transition flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Archive & Close Case
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Add Officer Communications / Internal Notes */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-teal-600" />
                      Add Officer Minute / Citizen Communication
                    </h4>

                    <form onSubmit={handleAddNote} className="space-y-3">
                      <textarea
                        rows={2}
                        required
                        value={officerNote}
                        onChange={(e) => setOfficerNote(e.target.value)}
                        placeholder="Enter minute note, survey stone observation, or citizen-facing request..."
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-950"
                      />

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <label className="font-semibold text-slate-700">Note Visibility:</label>
                          <select
                            value={noteType}
                            onChange={(e) => setNoteType(e.target.value as any)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs text-slate-800"
                          >
                            <option value="INTERNAL">Internal Officer Minute Only</option>
                            <option value="CITIZEN_VISIBLE">Citizen Visible Public Note</option>
                            <option value="ACTION_REQUIRED">Action Required Instruction</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={addingNote}
                          className="px-4 py-2 rounded-xl bg-blue-950 text-white font-bold text-xs hover:bg-blue-900 transition flex items-center gap-1.5"
                        >
                          {addingNote ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Record Note
                        </button>
                      </div>
                    </form>

                    {/* Existing Notes */}
                    {selectedApp.notes && selectedApp.notes.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        {selectedApp.notes.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl text-xs border ${
                              n.note_type === 'INTERNAL'
                                ? 'bg-slate-50 border-slate-200 text-slate-800'
                                : n.note_type === 'ACTION_REQUIRED'
                                ? 'bg-red-50 border-red-200 text-red-950'
                                : 'bg-teal-50 border-teal-200 text-teal-950'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                              <span>Officer {n.officer_name || 'Tahsildar'} • [{n.note_type.replace(/_/g, ' ')}]</span>
                              <span className="font-mono">{n.created_at.split('T')[0]}</span>
                            </div>
                            <p className="leading-relaxed">{n.note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Complete Statutory History Timeline */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-900" />
                      Statutory Review Timeline & Cryptographic Audit Trail
                    </h4>

                    <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {timeline.map((evt) => (
                        <div key={evt.id} className="relative text-xs">
                          <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-950 text-teal-400 flex items-center justify-center text-[10px] font-bold border-2 border-white">
                            •
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">{evt.title}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{evt.timestamp}</span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{evt.description}</p>
                          <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">By {evt.actor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-[11px] text-slate-500 font-medium">
                Officer Docket Control • SIH26014 Digital Public Infrastructure
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-300 transition"
              >
                Close Docket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Disclaimer */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p>
          <strong>Statutory Protocol Notice:</strong> LandSync provides digital workflow and AI-assisted verification support. Final decisions are made by authorized officials.
        </p>
      </div>
    </div>
  );
};
