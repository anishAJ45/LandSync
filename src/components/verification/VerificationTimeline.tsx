import React from 'react';
import { VerificationTimelineEvent } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, PlayCircle } from 'lucide-react';

interface VerificationTimelineProps {
  events: VerificationTimelineEvent[];
}

export const VerificationTimeline: React.FC<VerificationTimelineProps> = ({ events }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'RUNNING':
        return <PlayCircle className="w-4 h-4 text-sky-600 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div id="verification-timeline" className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-500" />
        Verification Execution Audit Trail
      </h3>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((evt, idx) => (
          <div key={evt.step || idx} className="relative flex items-start gap-3">
            <div className="absolute -left-6 mt-0.5 bg-white p-0.5 rounded-full">
              {getStatusIcon(evt.status)}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-900">{evt.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-slate-600">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
