import React, { useState } from 'react';
import { InfrastructureProjectRecord, ProjectImpactAnalysis } from '../../types';
import {
  HardHat,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Building,
  Info,
  Flame,
  ArrowRight
} from 'lucide-react';

interface InfrastructureProjectPanelProps {
  projects: InfrastructureProjectRecord[];
  impactAssessment: ProjectImpactAnalysis | null;
}

export const InfrastructureProjectPanel: React.FC<InfrastructureProjectPanelProps> = ({
  projects,
  impactAssessment
}) => {
  const [selectedRadius, setSelectedRadius] = useState<number>(500);

  const getImpactBadge = (level: string) => {
    switch (level) {
      case 'REQUIRES_AUTHORITY_REVIEW':
        return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
      case 'POSSIBLE_IMPACT':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'NEARBY_PROJECT':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 text-orange-700 rounded-xl">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Infrastructure Projects & Corridor Impact</h3>
              {impactAssessment && (
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${getImpactBadge(impactAssessment.overall_impact_level)}`}>
                  {impactAssessment.overall_impact_level.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Capital Infrastructure Overlay • Highway Expansions, Metro & Smart City Works
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[200, 500, 1000].map((radius) => (
            <button
              key={radius}
              onClick={() => setSelectedRadius(radius)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                selectedRadius === radius
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {radius}m
            </button>
          ))}
        </div>
      </div>

      {/* Impact Summary Alert Box */}
      {impactAssessment && impactAssessment.overall_impact_level === 'REQUIRES_AUTHORITY_REVIEW' && (
        <div className="my-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-rose-900 text-sm">Potential Right-of-Way / Alignment Corridor</div>
            <p className="text-rose-800 mt-1 leading-relaxed">
              This parcel lies within the statutory buffer corridor of planned capital works. Check with the nodal authority before finalizing deed registrations or structural approvals.
            </p>
          </div>
        </div>
      )}

      {/* List of Nearby Infrastructure Projects */}
      {!projects || projects.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs bg-slate-50 rounded-xl my-4">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
          <p className="font-medium text-slate-700">No conflicting capital infrastructure projects detected in proximity.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Clear buffer for zoning and building clearance.</p>
        </div>
      ) : (
        <div className="space-y-3 my-4">
          {projects.map((proj) => (
            <div
              key={proj.project_id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{proj.project_name}</span>
                  <span className="text-slate-400 font-mono text-[10px]">({proj.project_id})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    proj.status === 'UNDER_CONSTRUCTION'
                      ? 'bg-amber-100 text-amber-800'
                      : proj.status === 'PLANNED'
                      ? 'bg-blue-100 text-blue-800'
                      : proj.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {proj.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {proj.distance_to_parcel_meters !== undefined ? `${proj.distance_to_parcel_meters}m away` : 'Within corridor'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Type:</span>
                  <div className="font-semibold text-slate-700">{proj.project_type.replace(/_/g, ' ')}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Authority:</span>
                  <div className="font-semibold text-slate-700 truncate">{proj.authority}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Investment:</span>
                  <div className="font-semibold text-slate-700">₹{proj.investment_inr_cr} Cr</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Impact:</span>
                  <div className={`font-bold ${proj.impact_level === 'REQUIRES_AUTHORITY_REVIEW' ? 'text-rose-600' : 'text-slate-800'}`}>
                    {proj.impact_level?.replace(/_/g, ' ') || 'NEARBY PROJECT'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advisory Note */}
      {impactAssessment?.statutory_advisory && (
        <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <span><strong>Statutory Advisory:</strong> {impactAssessment.statutory_advisory}</span>
        </div>
      )}
    </div>
  );
};
