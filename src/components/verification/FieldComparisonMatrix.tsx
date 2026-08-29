import React, { useState } from 'react';
import { MatrixComparisonRow, LandComparisonResult, AlertSeverity } from '../../types';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, Filter } from 'lucide-react';

interface FieldComparisonMatrixProps {
  rows: MatrixComparisonRow[];
}

export const FieldComparisonMatrix: React.FC<FieldComparisonMatrixProps> = ({ rows }) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredRows = rows.filter((r) => {
    if (severityFilter === 'ALL') return true;
    if (severityFilter === 'CRITICAL') return r.severity === 'CRITICAL';
    if (severityFilter === 'HIGH') return r.severity === 'HIGH';
    if (severityFilter === 'MEDIUM') return r.severity === 'MEDIUM';
    if (severityFilter === 'LOW') return r.severity === 'LOW';
    if (severityFilter === 'MATCH') return r.severity === 'INFO';
    return true;
  });

  const getResultBadge = (result: LandComparisonResult, score: number) => {
    switch (result) {
      case 'EXACT_MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Exact Match (100%)
          </span>
        );
      case 'NORMALIZED_MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            Normalized Match ({score}%)
          </span>
        );
      case 'FUZZY_MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
            Fuzzy Match ({score}%)
          </span>
        );
      case 'MINOR_DIFFERENCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Minor Difference ({score}%)
          </span>
        );
      case 'MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            Mismatch ({score}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            {result}
          </span>
        );
    }
  };

  const getSeverityPill = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-orange-100 text-orange-800">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-100 text-sky-800">LOW</span>;
      case 'INFO':
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">VALID</span>;
    }
  };

  return (
    <div id="field-comparison-matrix" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Filter Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Multi-Source Field Comparison Matrix</h3>
          <p className="text-xs text-slate-500">
            Side-by-side reconciliation across spatial GIS, state registry database, OCR documents, and departmental data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            id="matrix-severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Fields ({rows.length})</option>
            <option value="CRITICAL">Critical Conflicts</option>
            <option value="HIGH">High Discrepancies</option>
            <option value="MEDIUM">Medium Variations</option>
            <option value="LOW">Minor Variations</option>
            <option value="MATCH">Exact Matches</option>
          </select>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
              <th className="py-3 px-4">Field Name</th>
              <th className="py-3 px-3">GIS Spatial</th>
              <th className="py-3 px-3">Registry DB</th>
              <th className="py-3 px-3">Document OCR</th>
              <th className="py-3 px-3">Dept API</th>
              <th className="py-3 px-4">Comparison Result</th>
              <th className="py-3 px-4">Explanation & Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No field comparisons match the selected filter.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => (
                <tr
                  key={row.field_name || idx}
                  className={`hover:bg-slate-50/75 transition-colors ${
                    row.severity === 'CRITICAL'
                      ? 'bg-rose-50/30'
                      : row.severity === 'HIGH'
                      ? 'bg-amber-50/20'
                      : ''
                  }`}
                >
                  {/* Field Label */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      {getSeverityPill(row.severity)}
                      <span className="font-bold text-slate-900">{row.field_label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{row.field_name}</span>
                  </td>

                  {/* GIS Value */}
                  <td className="py-3 px-3 font-medium text-slate-700 max-w-[140px] truncate" title={row.gis_value || 'N/A'}>
                    {row.gis_value || <span className="text-slate-400">N/A</span>}
                  </td>

                  {/* Database Value */}
                  <td className="py-3 px-3 font-semibold text-slate-900 max-w-[150px] truncate" title={row.database_value || 'N/A'}>
                    {row.database_value || <span className="text-slate-400">N/A</span>}
                  </td>

                  {/* Document Value */}
                  <td
                    className={`py-3 px-3 font-semibold max-w-[150px] truncate ${
                      row.comparison_result === 'MISMATCH'
                        ? 'text-rose-700 bg-rose-50/60 rounded px-1'
                        : row.comparison_result === 'MINOR_DIFFERENCE'
                        ? 'text-amber-800'
                        : 'text-slate-800'
                    }`}
                    title={row.document_value || 'N/A'}
                  >
                    {row.document_value || <span className="text-slate-400">N/A</span>}
                  </td>

                  {/* Department Value */}
                  <td className="py-3 px-3 font-medium text-slate-700 max-w-[140px] truncate" title={row.department_value || 'N/A'}>
                    {row.department_value || <span className="text-slate-400">N/A</span>}
                  </td>

                  {/* Comparison Result Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getResultBadge(row.comparison_result, row.similarity_score)}
                  </td>

                  {/* Explanation */}
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed text-xs">
                    {row.explanation}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
