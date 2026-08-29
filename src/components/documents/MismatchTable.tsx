import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { DocumentMismatch } from '../../types';
import { SeverityBadge, MatchTypeBadge } from './VerificationBadge';

interface MismatchTableProps {
  mismatches: DocumentMismatch[];
  showTitle?: boolean;
}

export const MismatchTable: React.FC<MismatchTableProps> = ({
  mismatches,
  showTitle = true,
}) => {
  if (!mismatches || mismatches.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 text-center">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <CheckCircle className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-emerald-900">Zero Discrepancies Detected</h4>
        <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
          All extracted deed fields, owner names, and survey numbers conform with state cadastral database records with zero deductions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Cadastral Discrepancy Findings ({mismatches.length})
          </h3>
          <span className="text-xs text-slate-500">
            Deductions applied to overall confidence rating
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Cadastral Attribute</th>
              <th className="py-3 px-4">Document OCR Value</th>
              <th className="py-3 px-4">System Master Record</th>
              <th className="py-3 px-4">Match Classification</th>
              <th className="py-3 px-4">Risk Severity</th>
              <th className="py-3 px-4">Analysis & Findings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
            {mismatches.map((m, idx) => (
              <tr key={m.id || idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                  {m.field_name.replace(/_/g, ' ')}
                </td>
                <td className="py-3 px-4 font-mono text-rose-700 font-medium bg-rose-50/40">
                  {m.document_value || '<Not specified>'}
                </td>
                <td className="py-3 px-4 font-mono text-emerald-800 font-medium bg-emerald-50/40">
                  {m.system_value || '<Not specified>'}
                </td>
                <td className="py-3 px-4">
                  <MatchTypeBadge matchType={m.match_type} />
                </td>
                <td className="py-3 px-4">
                  <SeverityBadge severity={m.severity} />
                </td>
                <td className="py-3 px-4 text-slate-600 max-w-xs leading-relaxed">
                  {m.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
