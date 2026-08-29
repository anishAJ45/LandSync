import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { landDnaService } from '../../services/landDnaService';
import { OfficerRiskQueueItem } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  ArrowRight,
  Dna,
  RotateCw,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const OfficerRiskDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<OfficerRiskQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await landDnaService.getOfficerRiskQueue();
      setQueue(data);
    } catch (err) {
      console.error('Failed to load risk queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filteredQueue = queue.filter((item) => {
    const matchesSearch =
      item.parcel_id.toLowerCase().includes(search.toLowerCase()) ||
      item.survey_number.toLowerCase().includes(search.toLowerCase()) ||
      item.village.toLowerCase().includes(search.toLowerCase()) ||
      item.district.toLowerCase().includes(search.toLowerCase());

    const matchesRisk = selectedRisk === 'ALL' || item.risk_level === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  const criticalCount = queue.filter((q) => q.risk_level === 'CRITICAL').length;
  const highCount = queue.filter((q) => q.risk_level === 'HIGH').length;
  const mediumCount = queue.filter((q) => q.risk_level === 'MEDIUM').length;
  const lowCount = queue.filter((q) => q.risk_level === 'LOW').length;

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getHealthBadge = (category: string) => {
    switch (category) {
      case 'EXCELLENT':
      case 'GOOD':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MODERATE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
      case 'CRITICAL':
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div id="officer-risk-dashboard" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-950 flex items-center justify-center text-teal-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-blue-950 tracking-tight">
                  Officer Risk Detection & Review Queue
                </h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                  Phase 6 Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Prioritized queue of land parcels sorted by automated risk signals & anomaly severity
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchQueue}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
          <Link
            to="/officer/anomalies"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Review Anomalies</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setSelectedRisk(selectedRisk === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`p-5 rounded-xl border text-left transition-all ${
            selectedRisk === 'CRITICAL'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Critical Risk</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-rose-700 mt-2">{criticalCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Requires immediate adjudication</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRisk(selectedRisk === 'HIGH' ? 'ALL' : 'HIGH')}
          className={`p-5 rounded-xl border text-left transition-all ${
            selectedRisk === 'HIGH'
              ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">High Risk</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-3xl font-black text-orange-700 mt-2">{highCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Document/survey conflicts</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRisk(selectedRisk === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
          className={`p-5 rounded-xl border text-left transition-all ${
            selectedRisk === 'MEDIUM'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Medium Risk</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-700 mt-2">{mediumCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Area variance / transfer velocity</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRisk(selectedRisk === 'LOW' ? 'ALL' : 'LOW')}
          className={`p-5 rounded-xl border text-left transition-all ${
            selectedRisk === 'LOW'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Low Risk</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-2">{lowCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Clean & verified records</p>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Survey No, Parcel ID, Village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-950 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Risk:</span>
          </span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedRisk(lvl)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                selectedRisk === lvl
                  ? 'bg-blue-950 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-bold text-blue-950">
            Priority Queue ({filteredQueue.length} Parcels Listed)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Ordered by critical alerts and risk score
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-teal-600" />
            <span className="text-xs font-bold">Loading risk matrix...</span>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No parcels match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-3.5">Parcel & Survey</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Risk Level</th>
                  <th className="p-3.5">Health Score</th>
                  <th className="p-3.5">Critical Signals</th>
                  <th className="p-3.5">Open Anomalies</th>
                  <th className="p-3.5">Primary Risk Reason</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredQueue.map((item) => (
                  <tr key={item.parcel_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{item.survey_number}</div>
                      <div className="font-mono text-[11px] text-slate-500">{item.parcel_id}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{item.village}</div>
                      <div className="text-[11px] text-slate-500">{item.district}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded-md border font-bold text-[10px] uppercase ${getRiskBadge(item.risk_level)}`}>
                        {item.risk_level} ({item.risk_score} pts)
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900">{item.land_health_score}/100</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getHealthBadge(item.health_category)}`}>
                          {item.health_category}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      {item.critical_signals_count > 0 ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          {item.critical_signals_count} Critical
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">0 Critical</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-700">{item.unresolved_anomalies_count} Pending</span>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="text-slate-600 line-clamp-1 font-medium">{item.primary_risk_reason}</p>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <Link
                        to={`/officer/land-dna/${item.parcel_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-950 text-white rounded-lg font-bold text-xs hover:bg-blue-900 transition-colors"
                      >
                        <Dna className="w-3 h-3 text-teal-400" />
                        <span>Land DNA</span>
                      </Link>
                      <Link
                        to={`/parcel/${item.parcel_id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs hover:bg-slate-200 transition-colors"
                      >
                        <span>360</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
