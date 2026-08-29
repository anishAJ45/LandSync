import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, Clock } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const notifications = [
    {
      id: 1,
      title: 'Patta Mutation Approved',
      desc: 'Your transfer application for Tambaram Parcel 142/3B was verified by Tahsildar.',
      time: '2 hours ago',
      type: 'success',
    },
    {
      id: 2,
      title: 'Survey Sub-division Scheduled',
      desc: 'Field verification team will visit Sulur plot on March 2nd, 2026.',
      time: '1 day ago',
      type: 'info',
    },
    {
      id: 3,
      title: 'Encumbrance Certificate Ready',
      desc: 'Digitally signed copy of EC is now available for download in your portal.',
      time: '3 days ago',
      type: 'success',
    },
    {
      id: 4,
      title: 'Annual Land Tax Assessment',
      desc: 'Revenue department updated the standard guideline value for Madurai region.',
      time: '1 week ago',
      type: 'warning',
    },
  ];

  return (
    <div id="notifications-page" className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-blue-950">System & Land Registry Notifications</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Real-time alerts regarding title changes, mutation reviews, and legal clearances.
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-start gap-3.5 hover:border-slate-300 transition"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                n.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : n.type === 'warning'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-blue-50 text-blue-950'
              }`}
            >
              {n.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : n.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                <span className="text-[11px] text-slate-600 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {n.time}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
