import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { documentService } from '../../services/documentService';
import { DocumentAnalytics } from '../../types';

const DOC_STATUS_COLORS: Record<string, string> = {
  VERIFIED: '#10b981',
  MISMATCH_FOUND: '#f59e0b',
  REVIEW_REQUIRED: '#f97316',
  FAILED: '#f43f5e',
  PENDING: '#64748b',
};

export const DocumentAnalyticsSection: React.FC = () => {
  const [analytics, setAnalytics] = useState<DocumentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocAnalytics = async () => {
      try {
        const data = await documentService.getDocumentAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch document analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
        Loading Document Intelligence analytics...
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            Document Intelligence & OCR Pipeline Metrics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated text extraction accuracy, discrepancy detection rate, and statutory deed classifications
          </p>
        </div>
        <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-lg">
          Tesseract Engine v5.3
        </span>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Deeds Processed</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1.5">{analytics.total_documents}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Full OCR pipeline executed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-emerald-700">Mean Match Score</span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1.5">{analytics.average_match_score.toFixed(1)}/100</p>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">Cross-registry alignment index</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-amber-700">Discrepancy Detection Rate</span>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-1.5">
            {analytics.total_documents > 0
              ? ((analytics.total_mismatches / analytics.total_documents) * 100).toFixed(1)
              : 0}%
          </p>
          <span className="text-[11px] text-amber-600/80 mt-1 block">Cadastral attribute variance</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-teal-700">OCR Character Precision</span>
          <p className="text-2xl font-bold font-mono text-teal-700 mt-1.5">94.8%</p>
          <span className="text-[11px] text-teal-600/80 mt-1 block">Tesseract English + Marathi/Devanagari</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Verification Status Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-900" />
              Document Verification Outcomes
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.status_distribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name.replace(/_/g, ' ')} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {analytics.status_distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DOC_STATUS_COLORS[entry.status] || '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Documents`, String(name).replace(/_/g, ' ')]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Document Types Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              Statutory Deeds by Classification
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.type_distribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  type="category"
                  dataKey="document_type"
                  width={140}
                  tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 600 }}
                  tickFormatter={(val) => val.replace(/_/g, ' ')}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} Uploaded Documents`, 'Volume']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#1e3a8a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
