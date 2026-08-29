import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { landDnaService } from '../../services/landDnaService';
import { LandAnomaly, AnomalyReviewStatus } from '../../types';
import { AnomalyBadge } from '../../components/dna/AnomalyBadge';
import {
  AlertTriangle,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  HelpCircle,
  Dna,
  ShieldCheck
} from 'lucide-react';

export const OfficerAnomalyReview: React.FC = () => {
  const [anomalies, setAnomalies] = useState<LandAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const data = await landDnaService.getAllAnomalies();
      setAnomalies(data);
    } catch (err) {
      console.error('Failed to load anomalies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const handleReview = async (anomalyId: string, status: AnomalyReviewStatus, note: string) => {
    try {
      await landDnaService.reviewAnomaly(anomalyId, status, note);
      fetchAnomalies();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAnomalies = anomalies.filter((a) => {
    const matchesSearch =
      a.anomaly_id.toLowerCase().includes(search.toLowerCase()) ||
      a.parcel_id.toLowerCase().includes(search.toLowerCase()) ||
      a.field_name.toLowerCase().includes(search.toLowerCase()) ||
      a.explanation.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || a.review_status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const totalCount = anomalies.length;
  const criticalCount = anomalies.filter((a) => a.severity === 'CRITICAL').length;
  const underReviewCount = anomalies.filter((a) => a.review_status === 'UNDER_REVIEW').length;
  const resolvedCount = anomalies.filter((a) => a.review_status === 'RESOLVED').length;

  return (
    <div id="officer-anomaly-review-page" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-950 flex items-center justify-center text-teal-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-blue-950 tracking-tight">
                  Cross-Record Anomaly Review Console
                </h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                  Officer Console
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Rule-based anomaly detection & officer adjudication workflow
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAnomalies}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Anomalies</span>
          </button>
          <Link
            to="/officer/risk-dashboard"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors shadow-xs"
          >
            <Dna className="w-3.5 h-3.5 text-teal-400" />
            <span>Risk Queue</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Anomalies</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">All detected instances</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">Critical Severity</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{criticalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">High variance & conflicts</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Under Investigation</div>
          <div className="text-2xl font-black text-blue-900 mt-1">{underReviewCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Field survey scheduled</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Resolved Rate</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{resolvedCount} resolved records</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Anomaly ID, Parcel ID, Field..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-950 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="DETECTED">Detected</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ACTION_REQUESTED">Action Requested</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-teal-600" />
            <span className="text-xs font-bold">Loading anomaly records...</span>
          </div>
        ) : filteredAnomalies.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm font-medium">
            No anomaly records match the selected filters.
          </div>
        ) : (
          filteredAnomalies.map((anom) => (
            <AnomalyBadge
              key={anom.anomaly_id}
              anomaly={anom}
              canReview={true}
              onReview={handleReview}
            />
          ))
        )}
      </div>
    </div>
  );
};
