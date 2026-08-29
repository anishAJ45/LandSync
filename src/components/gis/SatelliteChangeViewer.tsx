import React, { useState } from 'react';
import { SatelliteChangeDetectionRecord } from '../../types';
import {
  ScanLine,
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Eye,
  Sliders
} from 'lucide-react';
import { spatialService } from '../../services/spatialService';

interface SatelliteChangeViewerProps {
  changes: SatelliteChangeDetectionRecord[];
  parcelId: string;
  onScanComplete?: () => void;
  loading?: boolean;
}

export const SatelliteChangeViewer: React.FC<SatelliteChangeViewerProps> = ({
  changes,
  parcelId,
  onScanComplete,
  loading = false
}) => {
  const [scanning, setScanning] = useState(false);
  const [activeComparisonIndex, setActiveComparisonIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100% split slider
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleSimulateScan = async () => {
    try {
      setScanning(true);
      await spatialService.simulateSatelliteScan(parcelId);
      if (onScanComplete) onScanComplete();
    } catch (err) {
      console.error('Failed to run satellite scan:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      setUpdatingId(id);
      await spatialService.updateSatelliteChangeStatus(id, status, 'Verified via field revenue inspector report.');
      if (onScanComplete) onScanComplete();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-xl border border-slate-200 animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-28 bg-slate-100 rounded" />
      </div>
    );
  }

  const activeChange = changes[activeComparisonIndex] || changes[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-700 text-white flex items-center justify-center shadow-xs">
            <ScanLine className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              AI Satellite Change Detection & Remote Sensing
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${changes.length > 0 ? 'bg-violet-50 text-violet-800 border-violet-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                {changes.length} Detected {changes.length === 1 ? 'Event' : 'Events'}
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              Sentinel-2 & Cartosat-3 Temporal Multi-Spectral AI Difference Engine
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateScan}
          disabled={scanning}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Running Spectral Scan...' : 'Trigger AI Scan'}
        </button>
      </div>

      <div className="p-5 space-y-4 text-xs">
        {changes.length === 0 ? (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-slate-900">No Temporal Physical Anomalies Detected</p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Multi-spectral analysis between baseline and recent high-res satellite passes reveals zero unauthorized structural additions or illegal excavations.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Interactive Before/After Split Viewer */}
            {activeChange && (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900">
                <div className="px-4 py-2 bg-slate-800 text-slate-200 flex items-center justify-between text-[11px]">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-teal-400" />
                    Temporal Comparison: {activeChange.baseline_date} vs {activeChange.detection_date}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-violet-600/60 text-violet-200 font-mono text-[10px]">
                    Confidence: {(activeChange.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Imagery Preview Canvas Mock */}
                <div className="relative h-48 bg-slate-950 overflow-hidden select-none">
                  {/* Baseline Layer (Left) */}
                  <div
                    className="absolute inset-0 bg-cover bg-center flex items-end p-3"
                    style={{
                      backgroundImage: `radial-gradient(circle at 30% 40%, rgba(16, 185, 129, 0.4), transparent 60%), linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`,
                      clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                    }}
                  >
                    <div className="bg-black/70 backdrop-blur-xs text-slate-200 text-[10px] px-2 py-1 rounded font-mono">
                      Baseline ({activeChange.baseline_date}) - Undisturbed Green Cover
                    </div>
                  </div>

                  {/* Detected Layer (Right) */}
                  <div
                    className="absolute inset-0 bg-cover bg-center flex items-end justify-end p-3"
                    style={{
                      backgroundImage: `radial-gradient(circle at 60% 50%, rgba(225, 29, 72, 0.5), transparent 70%), linear-gradient(135deg, #1e1b4b 0%, #311042 100%)`,
                      clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`
                    }}
                  >
                    <div className="bg-rose-950/80 border border-rose-600/50 text-rose-200 text-[10px] px-2 py-1 rounded font-mono">
                      Recent Pass ({activeChange.detection_date}) - {activeChange.change_type.toUpperCase()}
                    </div>
                  </div>

                  {/* Split Line Bar */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-teal-400 shadow-md cursor-ew-resize flex items-center justify-center"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="w-5 h-5 rounded-full bg-teal-400 text-blue-950 flex items-center justify-center text-[9px] font-bold shadow-lg">
                      ↔
                    </div>
                  </div>
                </div>

                {/* Slider bar control */}
                <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Baseline</span>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                    className="w-1/2 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                  <span>Detected Pass</span>
                </div>
              </div>
            )}

            {/* List of Detected Changes */}
            <div className="space-y-3">
              {changes.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    idx === activeComparisonIndex
                      ? 'border-violet-400 bg-violet-50/40 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-950 text-xs">{item.change_type}</span>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase border ${
                          item.change_status === 'Flagged'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : item.change_status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {item.change_status}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          {item.sensor_source}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Detected Area: <strong className="text-slate-900">{item.detected_area_sqm} sq.m</strong> • Baseline: <span className="text-slate-700 font-mono">{item.baseline_date}</span> to <span className="text-slate-700 font-mono">{item.detection_date}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActiveComparisonIndex(idx)}
                        type="button"
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        Compare Visuals
                      </button>
                    </div>
                  </div>

                  {/* Violation Assessment */}
                  {item.potential_violation && (
                    <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        Unsanctioned structural activity flagged without registered building permit.
                      </span>

                      {item.change_status !== 'Verified' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'Verified')}
                          disabled={updatingId === item.id}
                          className="px-2 py-0.5 bg-rose-700 hover:bg-rose-800 text-white rounded font-semibold text-[10px] transition-colors"
                        >
                          Confirm & Issue Notice
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
