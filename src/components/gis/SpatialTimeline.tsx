import React from 'react';
import { SpatialTimelineEvent } from '../../types';
import {
  Clock,
  History,
  Calendar,
  Layers,
  MapPin,
  FileCheck2,
  Building,
  ScanLine,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface SpatialTimelineProps {
  timeline: SpatialTimelineEvent[];
  loading?: boolean;
}

export const SpatialTimeline: React.FC<SpatialTimelineProps> = ({
  timeline,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="p-4 bg-white rounded-xl border border-slate-200 animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-24 bg-slate-100 rounded" />
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'survey':
      case 'settlement':
        return <MapPin className="w-4 h-4 text-teal-600" />;
      case 'subdivision':
      case 'partition':
        return <Layers className="w-4 h-4 text-blue-600" />;
      case 'zoning_change':
      case 'master_plan':
        return <FileCheck2 className="w-4 h-4 text-amber-600" />;
      case 'building_sanction':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'satellite_anomaly':
      case 'remote_sensing':
        return <ScanLine className="w-4 h-4 text-rose-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'survey':
        return 'bg-teal-50 border-teal-200 text-teal-900';
      case 'subdivision':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'zoning_change':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'building_sanction':
        return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'satellite_anomaly':
        return 'bg-rose-50 border-rose-200 text-rose-900';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center shadow-xs">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              Historical Spatial Evolution Timeline
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                {timeline.length} Milestones
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              Cadastral Lineage, Subdivision Mutations, Zoning Reclassifications & Satellite History
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 text-xs">
        {timeline.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500">
            No historical spatial events recorded for this parcel.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((event, idx) => (
              <div key={event.id || idx} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-slate-300 group-hover:border-teal-600 flex items-center justify-center shadow-xs transition-colors">
                  {getEventIcon(event.event_type)}
                </div>

                <div className={`p-3.5 rounded-xl border ${getEventColor(event.event_type)} transition-shadow hover:shadow-xs space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-2">
                      {event.title}
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-white/80 border border-slate-200 text-slate-700">
                        {event.event_type}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] font-bold text-slate-600">
                      {event.event_date}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="pt-1.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-2">
                    <span>Authorized By: <strong>{event.authorized_by}</strong></span>
                    {event.gis_area_snapshot && (
                      <span>Spatial Extent: <strong>{event.gis_area_snapshot} sq.m</strong></span>
                    )}
                    {event.document_reference && (
                      <span className="font-mono">Ref: {event.document_reference}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
