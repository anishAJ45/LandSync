import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  MapPin,
  MessageSquare,
  RefreshCw,
  X,
  Layers,
  ShieldCheck,
  Info,
  Calendar,
  User,
  Plus
} from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { Application, ApplicationStatus, TimelineEvent, OfficerNote } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Detail Drawer State
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Resubmit State for MORE_INFORMATION_REQUIRED
  const [clarificationNotes, setClarificationNotes] = useState('');
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitSuccess, setResubmitSuccess] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationService.getMyApplications();
      setApplications(data);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.detail || 'Failed to load your submitted applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openDetailDrawer = async (app: Application) => {
    setSelectedApp(app);
    setResubmitSuccess(null);
    setClarificationNotes('');
    try {
      setLoadingDetail(true);
      const [fullApp, events] = await Promise.all([
        applicationService.getApplicationById(app.application_id),
        applicationService.getTimeline(app.application_id),
      ]);
      setSelectedApp(fullApp);
      setTimeline(events);
    } catch (err) {
      console.error('Error loading detail/timeline:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !clarificationNotes.trim()) return;

    try {
      setResubmitting(true);
      const updated = await applicationService.resubmit(selectedApp.application_id, clarificationNotes.trim());
      setResubmitSuccess('Your clarifications have been recorded. Case status updated to SUBMITTED.');
      setSelectedApp(updated);
      // Refresh list
      fetchApplications();
      // Reload timeline
      const events = await applicationService.getTimeline(selectedApp.application_id);
      setTimeline(events);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit clarifications.');
    } finally {
      setResubmitting(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">Submitted</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">Under Review</span>;
      case 'VERIFICATION_PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">Verification Pending</span>;
      case 'MORE_INFORMATION_REQUIRED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-900 border border-red-200 animate-pulse">Action Required</span>;
      case 'VERIFIED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200">Verified</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">Approved</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-900 border border-rose-200">Rejected</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">Closed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-900 border border-red-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-900 border border-blue-200">MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">LOW</span>;
    }
  };

  const filteredApps = applications.filter((app) => {
    // Tab filter
    if (activeTab === 'ACTIVE') {
      if (['APPROVED', 'REJECTED', 'CLOSED'].includes(app.status)) return false;
    } else if (activeTab === 'ACTION_REQUIRED') {
      if (app.status !== 'MORE_INFORMATION_REQUIRED') return false;
    } else if (activeTab === 'COMPLETED') {
      if (!['APPROVED', 'VERIFIED', 'CLOSED'].includes(app.status)) return false;
    } else if (activeTab !== 'ALL') {
      if (app.status !== activeTab) return false;
    }

    // Priority filter
    if (priorityFilter !== 'ALL' && app.priority !== priorityFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = app.application_id.toLowerCase().includes(q);
      const matchParcel = app.parcel_id.toLowerCase().includes(q);
      const matchType = app.service_type.toLowerCase().includes(q);
      const matchSurvey = app.survey_number?.toLowerCase().includes(q) || false;
      if (!matchId && !matchParcel && !matchType && !matchSurvey) return false;
    }

    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Fetching your land service applications..." size="lg" />;
  }

  if (error) {
    return <ErrorMessage title="Applications Error" message={error} onRetry={fetchApplications} />;
  }

  return (
    <div id="my-applications-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950">My Land Service Applications</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track real-time statutory review stages, verification milestones, and mutation determinations.
          </p>
        </div>

        <button
          id="new-application-btn"
          onClick={() => navigate('/citizen/create-request')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-950 text-white font-bold text-xs hover:bg-blue-900 transition shadow-xs"
        >
          <Plus className="w-4 h-4 text-teal-400" />
          Create New Request
        </button>
      </div>

      {/* Tabs and Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-slate-100">
          {[
            { id: 'ALL', label: 'All Applications', count: applications.length },
            { id: 'ACTIVE', label: 'In Progress', count: applications.filter(a => !['APPROVED', 'REJECTED', 'CLOSED'].includes(a.status)).length },
            { id: 'ACTION_REQUIRED', label: 'Action Required', count: applications.filter(a => a.status === 'MORE_INFORMATION_REQUIRED').length, alert: true },
            { id: 'COMPLETED', label: 'Approved & Verified', count: applications.filter(a => ['APPROVED', 'VERIFIED', 'CLOSED'].includes(a.status)).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-teal-400 text-blue-950 font-extrabold'
                    : tab.alert && tab.count > 0
                    ? 'bg-red-100 text-red-800 font-bold'
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
              placeholder="Search by ID, parcel, survey no..."
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
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Cards Grid */}
      {filteredApps.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Applications Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No service applications match the selected criteria or search term.
          </p>
          <button
            onClick={() => navigate('/citizen/create-request')}
            className="px-4 py-2 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900 transition"
          >
            Submit a New Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.application_id}
              id={`application-card-${app.application_id}`}
              onClick={() => openDetailDrawer(app)}
              className={`p-5 rounded-2xl bg-white border transition cursor-pointer flex flex-col justify-between hover:shadow-md ${
                app.status === 'MORE_INFORMATION_REQUIRED'
                  ? 'border-red-300 ring-1 ring-red-200 hover:border-red-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Card Top Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {app.application_id}
                    </span>
                    {getPriorityBadge(app.priority)}
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                {/* Service Type & Parcel */}
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1">{app.service_type}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{app.parcel_id}</span>
                    {app.survey_number && (
                      <span className="text-slate-400 font-sans">• Survey {app.survey_number}</span>
                    )}
                  </div>
                </div>

                {/* Description Excerpt */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {app.description}
                </p>

                {/* Action banner if action required */}
                {app.status === 'MORE_INFORMATION_REQUIRED' && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Officer requested additional clarification. Click to respond.</span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Submitted: {app.submitted_at.split('T')[0]}</span>
                </div>

                <span className="text-teal-700 font-bold flex items-center gap-1 hover:underline">
                  View Dossier <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal / Drawer */}
      {selectedApp && (
        <div
          id="application-detail-modal"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
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

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetail ? (
                <LoadingSpinner message="Loading application lifecycle and verification records..." />
              ) : (
                <>
                  {/* Linked Parcel Details */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-900" />
                        <h4 className="font-bold text-xs text-blue-950 uppercase tracking-wide">Linked Parcel Registry Data</h4>
                      </div>
                      <span className="font-mono text-xs font-bold text-blue-950">{selectedApp.parcel_id}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-xl border border-blue-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Survey No</span>
                        <span className="font-mono font-bold text-slate-900">{selectedApp.survey_number || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Location</span>
                        <span className="font-bold text-slate-900">{selectedApp.village || 'Tamil Nadu'}, {selectedApp.district || 'Chennai'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Registered Owner</span>
                        <span className="font-bold text-slate-900">{selectedApp.current_owner || selectedApp.citizen_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Assigned Officer</span>
                        <span className="font-semibold text-teal-800">{selectedApp.assigned_officer_name || 'Desk Queue'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedApp(null);
                          navigate(`/gis?select=${selectedApp.parcel_id}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-950 text-white text-xs font-bold hover:bg-blue-900 transition flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-teal-400" />
                        View in GIS Explorer
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApp(null);
                          navigate(`/parcel/${selectedApp.parcel_id}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                        Open Parcel 360° View
                      </button>
                    </div>
                  </div>

                  {/* Citizen Statement */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">Applicant Statement & Justification</h4>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                      {selectedApp.description}
                    </div>
                  </div>

                  {/* Resubmit Form if ACTION REQUIRED */}
                  {selectedApp.status === 'MORE_INFORMATION_REQUIRED' && (
                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                      <div className="flex items-center gap-2 text-amber-900">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h4 className="font-bold text-xs uppercase tracking-wide">Revenue Officer Clarification Notice</h4>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        The reviewing Tahsildar or verification officer has requested supplemental documentation or clarification regarding your land record application.
                      </p>

                      {resubmitSuccess ? (
                        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          {resubmitSuccess}
                        </div>
                      ) : (
                        <form onSubmit={handleResubmit} className="space-y-3 pt-2">
                          <textarea
                            rows={3}
                            required
                            value={clarificationNotes}
                            onChange={(e) => setClarificationNotes(e.target.value)}
                            placeholder="Type your response to the officer, clarifying boundary coordinates, legal succession facts, or deed references..."
                            className="w-full p-3 rounded-xl border border-amber-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={resubmitting}
                              className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition flex items-center gap-2"
                            >
                              {resubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              Submit Clarifications & Resume Review
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Officer Notes Section */}
                  {selectedApp.notes && selectedApp.notes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                        Official Review Communications
                      </h4>
                      <div className="space-y-2">
                        {selectedApp.notes.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 rounded-xl border text-xs ${
                              n.note_type === 'ACTION_REQUIRED'
                                ? 'bg-red-50 border-red-200 text-red-950'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                              <span>Officer {n.officer_name || 'Tahsildar'}</span>
                              <span>{n.created_at.split('T')[0]}</span>
                            </div>
                            <p className="leading-relaxed">{n.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lifecycle Timeline */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-900" />
                      Statutory Review Timeline & Audit Events
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
                LandSync DPI • Case ID: {selectedApp.application_id}
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-300 transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statutory Notice */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p>
          <strong>Statutory Governance Disclaimer:</strong> LandSync provides digital workflow and AI-assisted verification support. Final decisions are made by authorized officials.
        </p>
      </div>
    </div>
  );
};
