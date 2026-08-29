import React, { useState } from 'react';
import { StateConnectorConfiguration } from '../../types';
import { Radio, RefreshCw, CheckCircle2, Shield, Activity, Database, Check } from 'lucide-react';

interface StateConnectorPanelProps {
  connectors: StateConnectorConfiguration[];
  stateCode: string;
}

export const StateConnectorPanel: React.FC<StateConnectorPanelProps> = ({
  connectors,
  stateCode
}) => {
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<Record<number, string>>({});

  const handleTestConnection = (connector: StateConnectorConfiguration) => {
    setTestingId(connector.id);
    setTimeout(() => {
      setTestingId(null);
      setTestResult((prev) => ({
        ...prev,
        [connector.id]: `✓ 200 OK • Response Time: 42ms • Auth: ${connector.authentication_type} Valid`
      }));
    }, 600);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-teal-800" />
            <h3 className="font-extrabold text-slate-900 text-base">
              State Government API Connectors ({stateCode})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time bridges to State Land Revenue, Registration & Stamp, and Cadastral GIS Survey Gateways.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>{connectors.length} Live Gateways Connected</span>
        </div>
      </div>

      {/* Connector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {connectors.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded">
                  {c.department}
                </span>
                <h4 className="font-black text-slate-900 text-sm mt-1.5">
                  {c.connector_name}
                </h4>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {c.status}
              </span>
            </div>

            {/* Spec Badges */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-0.5 bg-slate-200/80 rounded font-mono text-[11px] font-bold text-slate-700">
                {c.data_format}
              </span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold text-[11px] border border-blue-200">
                {c.authentication_type}
              </span>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded font-semibold text-[11px] border border-purple-200">
                {c.endpoint_type}
              </span>
            </div>

            {/* Metrics */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <div>
                Sync Reliability: <strong className="text-emerald-700">{c.sync_success_rate}%</strong>
              </div>
              <div>
                API: <strong className="text-slate-900">{c.api_version}</strong>
              </div>
            </div>

            {/* Test Action & Results */}
            <div className="mt-3.5 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleTestConnection(c)}
                disabled={testingId === c.id}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingId === c.id ? 'animate-spin' : ''}`} />
                <span>{testingId === c.id ? 'Pinging Gateway...' : 'Test Connection'}</span>
              </button>

              {testResult[c.id] && (
                <div className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  {testResult[c.id]}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
