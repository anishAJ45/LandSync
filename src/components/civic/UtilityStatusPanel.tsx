import React from 'react';
import { WaterConnectionRecord, ElectricityConnectionRecord } from '../../types';
import {
  Droplet,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Gauge,
  Activity,
  Plus
} from 'lucide-react';

interface UtilityStatusPanelProps {
  water: WaterConnectionRecord | null;
  electricity: ElectricityConnectionRecord | null;
  onRequestUtility?: (type: 'WATER_CONNECTION' | 'ELECTRICITY_SANCTION') => void;
}

export const UtilityStatusPanel: React.FC<UtilityStatusPanelProps> = ({
  water,
  electricity,
  onRequestUtility
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'AVAILABLE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'UNDER_MAINTENANCE':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Water Supply Infrastructure Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Water Supply Network</h3>
                <p className="text-xs text-slate-500">TWAD / Urban Local Body Grid</p>
              </div>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${getStatusBadge(
                water?.connection_status || 'AVAILABLE'
              )}`}
            >
              {water?.connection_status?.replace('_', ' ') || 'AVAILABLE'}
            </span>
          </div>

          <div className="space-y-3 my-4 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Provider / Authority:</span>
              <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                {water?.provider || 'TWAD Board'}
              </span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Connection Category:</span>
              <span className="font-bold text-slate-800">{water?.connection_type || 'DOMESTIC'}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Meter Status:</span>
              <span className="font-semibold text-slate-800">{water?.meter_status?.replace('_', ' ') || 'METERED_ACTIVE'}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Supply Regularity:</span>
              <span className="font-bold text-emerald-700">{water?.supply_status?.replace('_', ' ') || 'NORMAL_24X7'}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Pipeline Distance:</span>
              <span className="font-bold text-slate-900 font-mono">
                {water?.pipeline_distance_meters ? `${water.pipeline_distance_meters} meters` : 'At Boundary Frontage'}
              </span>
            </div>
          </div>
        </div>

        {water?.connection_status !== 'CONNECTED' && onRequestUtility && (
          <button
            onClick={() => onRequestUtility('WATER_CONNECTION')}
            className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply for New Water Connection</span>
          </button>
        )}
      </div>

      {/* 2. Electricity Infrastructure Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Electricity Grid Connectivity</h3>
                <p className="text-xs text-slate-500">TANGEDCO / Distribution Utility</p>
              </div>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${getStatusBadge(
                electricity?.connection_status || 'CONNECTED'
              )}`}
            >
              {electricity?.connection_status?.replace('_', ' ') || 'CONNECTED'}
            </span>
          </div>

          <div className="space-y-3 my-4 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Provider Utility:</span>
              <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                {electricity?.provider || 'TANGEDCO'}
              </span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Tariff Category:</span>
              <span className="font-bold text-slate-800">{electricity?.connection_type || 'LT_RESIDENTIAL'}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Sanctioned Load:</span>
              <span className="font-bold text-slate-900 font-mono">
                {electricity?.sanctioned_load_kw || 5.0} kW
              </span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Meter Type:</span>
              <span className="font-semibold text-slate-800">{electricity?.meter_status?.replace('_', ' ') || 'SMART_METER_LIVE'}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Nearest Transformer:</span>
              <span className="font-bold text-slate-900 font-mono">
                {electricity?.transformer_distance_meters || 35} meters ({electricity?.transformer_id || 'TR-04'})
              </span>
            </div>
          </div>
        </div>

        {electricity?.connection_status !== 'CONNECTED' && onRequestUtility && (
          <button
            onClick={() => onRequestUtility('ELECTRICITY_SANCTION')}
            className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply for Load Sanction / Meter</span>
          </button>
        )}
      </div>
    </div>
  );
};
