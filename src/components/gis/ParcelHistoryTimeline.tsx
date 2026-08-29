import React from 'react';
import { ParcelHistoryItem } from '../../types';
import {
  FileText,
  GitBranch,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

interface ParcelHistoryTimelineProps {
  history: ParcelHistoryItem[];
  className?: string;
}

export const ParcelHistoryTimeline: React.FC<ParcelHistoryTimelineProps> = ({
  history,
  className = '',
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
        No recorded mutation or transaction history available for this parcel.
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    const et = eventType.toLowerCase();
    if (et.includes('overlap') || et.includes('dispute') || et.includes('mismatch') || et.includes('alert')) {
      return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    }
    if (et.includes('registration') || et.includes('conveyance') || et.includes('deed') || et.includes('purchase')) {
      return <FileText className="w-4 h-4 text-blue-900" />;
    }
    if (et.includes('patta') || et.includes('mutation') || et.includes('succession')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (et.includes('survey') || et.includes('sub-division') || et.includes('dgps') || et.includes('demarcation')) {
      return <MapPin className="w-4 h-4 text-teal-600" />;
    }
    return <GitBranch className="w-4 h-4 text-slate-600" />;
  };

  const getEventBadgeClass = (eventType: string) => {
    const et = eventType.toLowerCase();
    if (et.includes('overlap') || et.includes('dispute') || et.includes('mismatch') || et.includes('alert')) {
      return 'bg-rose-50 text-rose-900 border-rose-200';
    }
    if (et.includes('registration') || et.includes('deed') || et.includes('purchase')) {
      return 'bg-blue-50 text-blue-900 border-blue-200';
    }
    if (et.includes('patta') || et.includes('mutation')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div id="parcel-history-timeline-container" className={`space-y-4 ${className}`}>
      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
        {history.map((event, index) => {
          const isWarning =
            event.event_type.toLowerCase().includes('overlap') ||
            event.event_type.toLowerCase().includes('mismatch') ||
            event.event_type.toLowerCase().includes('dispute');

          return (
            <div key={event.id || index} className="relative group">
              {/* Timeline dot */}
              <div
                className={`absolute -left-[30px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-xs transition ${
                  isWarning
                    ? 'bg-rose-100 border-rose-500 text-rose-700'
                    : 'bg-white border-blue-900 text-blue-900'
                }`}
              >
                {getEventIcon(event.event_type)}
              </div>

              {/* Event card */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getEventBadgeClass(
                      event.event_type
                    )}`}
                  >
                    {event.event_type}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {event.event_date}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-normal">
                  {event.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Building className="w-3 h-3 text-slate-400" /> Source: {event.source}
                  </span>
                  <span className="font-mono">ID #{event.id}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
