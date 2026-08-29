import React from 'react';
import { Send, Clock, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export const CitizenApplications: React.FC = () => {
  const applications = [
    {
      id: 'APP-2026-904',
      type: 'Online Land Mutation & Title Transfer',
      parcel: 'IN-TN-MDU-2026-0015 (Survey 209/7C)',
      date: '2026-02-24',
      stage: 'Tahsildar Desk Review',
      status: 'In Progress',
    },
    {
      id: 'APP-2026-412',
      type: 'Certified Encumbrance Certificate Request',
      parcel: 'IN-TN-CHE-2026-0042 (Survey 142/3B)',
      date: '2026-02-18',
      stage: 'Certificate Issued',
      status: 'Completed',
    },
    {
      id: 'APP-2025-188',
      type: 'Cadastral Boundary Confirmation',
      parcel: 'IN-TN-CBE-2025-1089 (Survey 88/1A)',
      date: '2025-11-15',
      stage: 'Survey Complete & Patta Updated',
      status: 'Completed',
    },
  ];

  return (
    <div id="citizen-applications-page" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950">Citizen Applications & Mutations</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track statutory land service requests submitted to the Revenue & Registration Department.
          </p>
        </div>

        <button
          onClick={() => alert('New Application Form will be enabled in Phase 2 workflow.')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-950 text-white font-semibold text-xs hover:bg-blue-900 transition shadow-xs"
        >
          <Send className="w-4 h-4 text-teal-400" />
          Submit New Service Application
        </button>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {app.id}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    app.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {app.status}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900">{app.type}</h3>
              <p className="text-xs text-slate-500 font-mono">{app.parcel}</p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Stage</span>
                <span className="font-semibold text-slate-800">{app.stage}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Submission Date</span>
                <span className="font-mono font-medium">{app.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
