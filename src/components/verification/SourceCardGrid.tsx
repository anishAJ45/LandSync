import React, { useState } from 'react';
import { LandRecordSnapshot } from '../../types';
import { Database, MapPin, FileText, History, Building2, Eye, X, CheckCircle, ShieldAlert } from 'lucide-react';

interface SourceCardGridProps {
  snapshots: LandRecordSnapshot[];
  parcelId: string;
}

export const SourceCardGrid: React.FC<SourceCardGridProps> = ({ snapshots, parcelId }) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<LandRecordSnapshot | null>(null);

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'GIS':
        return <MapPin className="w-5 h-5 text-indigo-600" />;
      case 'PARCEL_DATABASE':
        return <Database className="w-5 h-5 text-blue-600" />;
      case 'DOCUMENT_OCR':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'HISTORICAL_RECORD':
        return <History className="w-5 h-5 text-amber-600" />;
      case 'MOCK_DEPARTMENT_API':
      default:
        return <Building2 className="w-5 h-5 text-violet-600" />;
    }
  };

  return (
    <div id="source-card-grid" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Multi-Source Record Snapshots</h3>
          <p className="text-xs text-slate-500">
            Immutable cross-departmental records collected for Parcel <span className="font-mono font-bold text-slate-700">{parcelId}</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          {snapshots.length} Data Sources Connected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {snapshots.map((snap) => {
          const data = snap.record_data || {};
          return (
            <div
              key={snap.id || snap.source_name}
              id={`source-card-${snap.source_type.toLowerCase()}`}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      {getSourceIcon(snap.source_type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{snap.source_name}</h4>
                      <span className="text-[11px] font-mono text-slate-500 uppercase">{snap.source_type}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    SYNCHRONIZED
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  {data.owner_name && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Owner:</span>
                      <span className="font-semibold text-slate-800 text-right truncate max-w-[150px]">
                        {data.owner_name}
                      </span>
                    </div>
                  )}
                  {data.survey_number && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Survey No:</span>
                      <span className="font-mono font-semibold text-slate-800">{data.survey_number}</span>
                    </div>
                  )}
                  {data.area !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Recorded Extent:</span>
                      <span className="font-semibold text-slate-800">
                        {data.area} {data.area_unit || 'Acres'}
                      </span>
                    </div>
                  )}
                  {data.status && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Registry Status:</span>
                      <span className="font-semibold text-slate-800">{data.status}</span>
                    </div>
                  )}
                  {data.ocr_confidence && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">OCR Confidence:</span>
                      <span className="font-semibold text-emerald-700">{data.ocr_confidence}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Ref: {snap.record_reference_id || 'ID-DEFAULT'}</span>
                <button
                  onClick={() => setSelectedSnapshot(snap)}
                  className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Raw Snapshot
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Snapshot Payload Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSourceIcon(selectedSnapshot.source_type)}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedSnapshot.source_name}</h3>
                  <p className="text-xs text-slate-500">
                    Source: {selectedSnapshot.source_type} | Ref: {selectedSnapshot.record_reference_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  This is an immutable snapshot captured at verification initialization. Any subsequent modifications to live records will require re-running the verification engine.
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Snapshot JSON Payload
                </h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-72">
                  {JSON.stringify(selectedSnapshot.record_data, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
