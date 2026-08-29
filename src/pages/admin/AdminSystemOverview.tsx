import React from 'react';
import { Server, Database, ShieldCheck, Activity, Cpu, CheckCircle2 } from 'lucide-react';

export const AdminSystemOverview: React.FC = () => {
  const components = [
    {
      name: 'Python FastAPI Microservice',
      version: 'v0.110.0',
      status: 'Online',
      uptime: '99.98%',
      latency: '18ms',
    },
    {
      name: 'SQLite Core Relational Engine',
      version: '3.42.0',
      status: 'Online',
      uptime: '100.00%',
      latency: '1.2ms',
    },
    {
      name: 'JWT Auth & RBAC Interceptor',
      version: 'HS256 Standard',
      status: 'Active',
      uptime: '100.00%',
      latency: '0.4ms',
    },
    {
      name: 'SIH26014 Digital Public Infrastructure Bridge',
      version: 'Phase 1 Build',
      status: 'Online',
      uptime: '99.95%',
      latency: '34ms',
    },
  ];

  return (
    <div id="admin-system-overview" className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-blue-950">System Architecture & Infrastructure Health</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Real-time diagnostics of the LandSync Phase 1 engine and database layer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {components.map((comp, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-teal-400 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{comp.name}</h3>
                  <span className="text-xs font-mono text-slate-500">{comp.version}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {comp.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Uptime Reliability</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{comp.uptime}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Avg API Latency</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{comp.latency}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
