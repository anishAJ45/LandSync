import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { landDnaService } from '../../services/landDnaService';
import { AdminLandIntelligenceAnalytics } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  BarChart3,
  Dna,
  ShieldAlert,
  ShieldCheck,
  RotateCw,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const AdminLandIntelligence: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminLandIntelligenceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await landDnaService.getAdminLandIntelligenceAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const RISK_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];
  const HEALTH_COLORS = ['#059669', '#10b981', '#f59e0b', '#f97316', '#ef4444'];

  return (
    <div id="admin-land-intelligence-page" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-950 flex items-center justify-center text-teal-400">
              <Dna className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-blue-950 tracking-tight">
                  State Land Intelligence & Cadastral Integrity
                </h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                  DPI Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Macro-level land health trends, risk distribution & cross-department anomaly insights
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAnalytics}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Telemetry</span>
          </button>
          <Link
            to="/officer/risk-dashboard"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
            <span>Officer Queue</span>
          </Link>
        </div>
      </div>

      {loading || !analytics ? (
        <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-slate-200">
          <div className="flex flex-col items-center gap-3">
            <RotateCw className="w-8 h-8 text-teal-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Aggregating State Cadastral Analytics...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Executive Macro KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Land DNA Profiles</div>
              <div className="text-2xl font-black text-blue-950 mt-1">{analytics.total_dna_profiles} Parcels</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">100% Cadastre Covered</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">State Avg Health Index</div>
              <div className="text-2xl font-black text-teal-700 mt-1">{analytics.average_land_health_score}/100</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Weighted across 7 dimensions</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Risk Score</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{analytics.average_risk_score}/100</div>
              <div className="text-[11px] text-amber-600 font-semibold mt-0.5">{analytics.high_risk_count + analytics.critical_risk_count} High/Critical Parcels</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Signals Resolution</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {analytics.resolved_signals_count} / {analytics.resolved_signals_count + analytics.unresolved_signals_count}
              </div>
              <div className="text-[11px] text-teal-600 font-semibold mt-0.5">
                {Math.round((analytics.resolved_signals_count / ((analytics.resolved_signals_count + analytics.unresolved_signals_count) || 1)) * 100)}% Resolved
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-blue-950 tracking-tight">Parcel Risk Level Distribution</h3>
                <span className="text-xs text-slate-500 font-medium">State Registry</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.risk_distribution}
                      dataKey="count"
                      nameKey="level"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.risk_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} Parcels`, 'Count']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Health Category Breakdown */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-blue-950 tracking-tight">Land Health Category Distribution</h3>
                <span className="text-xs text-slate-500 font-medium">Score Ranges</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.health_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} Parcels`, 'Count']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]}>
                      {analytics.health_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={HEALTH_COLORS[index % HEALTH_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Verification Trends & Top Signals */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Trend */}
            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-blue-950 tracking-tight">
                  Cadastral Health & Risk Index Trend
                </h3>
                <span className="text-xs text-slate-500 font-medium">Last 5 Months</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.verification_health_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="avg_health" name="Avg Health Score" stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="avg_risk" name="Avg Risk Score" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Risk Signal Patterns */}
            <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-blue-950 tracking-tight">
                Top Detected Risk Signals
              </h3>
              <div className="space-y-3">
                {analytics.top_risk_signals.map((sig, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{sig.signal_type}</span>
                      <span className="font-bold text-slate-900">{sig.percentage}% ({sig.count})</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${sig.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
