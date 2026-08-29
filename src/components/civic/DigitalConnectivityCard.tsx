import React from 'react';
import { DigitalInfrastructureRecord } from '../../types';
import {
  Wifi,
  Radio,
  Signal,
  CheckCircle2,
  AlertCircle,
  Network
} from 'lucide-react';

interface DigitalConnectivityCardProps {
  telecom: DigitalInfrastructureRecord | null;
}

export const DigitalConnectivityCard: React.FC<DigitalConnectivityCardProps> = ({ telecom }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Digital & Telecom Connectivity</h3>
            <p className="text-xs text-slate-500">5G/4G Cellular Coverage & Optical Fiber Access</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${
            telecom?.availability_status === 'HIGH_SPEED_AVAILABLE'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : telecom?.availability_status === 'MODERATE'
              ? 'bg-blue-100 text-blue-800 border-blue-300'
              : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}
        >
          {telecom?.availability_status?.replace(/_/g, ' ') || 'HIGH SPEED AVAILABLE'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
          <Signal className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Mobile Network</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {telecom?.mobile_5g_coverage ? '5G Ultra-Wideband & 4G Active' : '4G LTE Standard'}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
          <Wifi className="w-5 h-5 text-teal-600 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Fiber Broadband</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {telecom?.provider || 'BharatNet / BSNL FTTH'} ({telecom?.max_speed_mbps || 300} Mbps)
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
          <Network className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase">CSC / Digital Seva</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {telecom?.nearest_digital_seva_meters || 220}m Distance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
