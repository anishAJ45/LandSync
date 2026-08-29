import React from 'react';
import { RoadAccessRecord, RoadAccessAnalysis } from '../../types';
import {
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  ShieldCheck,
  MapPin
} from 'lucide-react';

interface RoadAccessCardProps {
  roadRecord: RoadAccessRecord | null;
  analysis: RoadAccessAnalysis | null;
}

export const RoadAccessCard: React.FC<RoadAccessCardProps> = ({
  roadRecord,
  analysis
}) => {
  const accessCategory = analysis?.access_category || roadRecord?.access_status || 'GOOD_ACCESS';

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'GOOD_ACCESS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'LIMITED_ACCESS':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'REQUIRES_REVIEW':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Road Access & Connectivity</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${getCategoryBadge(accessCategory)}`}>
                {accessCategory.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Right-of-Way (RoW) & Statutory Setback Analysis
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-semibold uppercase">Access Score</div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {analysis?.access_score || 90}/100
          </div>
        </div>
      </div>

      {/* Primary Road Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Nearest Road</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
            {analysis?.nearest_road || roadRecord?.road_name || 'Sulur Main Link Road'}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Road Classification</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            {analysis?.road_type?.replace('_', ' ') || roadRecord?.road_type?.replace('_', ' ') || 'LOCAL ROAD'}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Road Width</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
            {analysis?.road_width_meters || roadRecord?.road_width || 12} Meters
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Distance to Road</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
            {analysis?.road_distance_meters !== undefined ? `${analysis.road_distance_meters}m` : '0m (Direct Frontage)'}
          </div>
        </div>
      </div>

      {/* Statutory Advisory and Access Availability */}
      <div className="space-y-3">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs">
          <MapPin className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-blue-950">Connectivity Status: </span>
            <span className="text-blue-900">{analysis?.access_availability || 'Direct frontage with approved right-of-way.'}</span>
          </div>
        </div>

        {analysis?.possible_access_restrictions && analysis.possible_access_restrictions.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Access Advisory / Restriction Flags:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] pl-1">
              {analysis.possible_access_restrictions.map((res, idx) => (
                <li key={idx}>{res}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
          <span>Authority: <strong className="text-slate-700">{roadRecord?.authority || 'State Highways / Sulur Town Panchayat'}</strong></span>
          <span>Right of Way: <strong className={roadRecord?.right_of_way_clear !== false ? 'text-emerald-600' : 'text-rose-600'}>
            {roadRecord?.right_of_way_clear !== false ? 'Clear / Unobstructed' : 'Encroachment Flagged'}
          </strong></span>
        </div>
      </div>
    </div>
  );
};
