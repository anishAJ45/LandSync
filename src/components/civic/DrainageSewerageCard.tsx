import React from 'react';
import { DrainageInfrastructureRecord } from '../../types';
import {
  Waves,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface DrainageSewerageCardProps {
  drainage: DrainageInfrastructureRecord | null;
  sewerage: DrainageInfrastructureRecord | null;
}

export const DrainageSewerageCard: React.FC<DrainageSewerageCardProps> = ({
  drainage,
  sewerage
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-teal-50 text-teal-800 rounded-xl">
          <Waves className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">Drainage & Sewerage Infrastructure</h3>
          <p className="text-xs text-slate-500">Stormwater Channels & Underground Sewerage (UGD)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
        {/* Stormwater Drain */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Stormwater Drain
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                drainage?.availability_status === 'AVAILABLE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {drainage?.availability_status || 'AVAILABLE'}
            </span>
          </div>

          <div className="text-xs space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Network Distance:</span>
              <span className="font-bold text-slate-800">{drainage?.distance_to_network || 2.5}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Channel Type:</span>
              <span className="font-semibold text-slate-800">{drainage?.capacity_status || 'Covered RCC Box Drain'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Managing Body:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[150px]">{drainage?.provider || 'Town Panchayat'}</span>
            </div>
          </div>
        </div>

        {/* Underground Sewerage UGD */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Underground Sewerage (UGD)
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                sewerage?.connection_status === 'CONNECTED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : sewerage?.connection_status === 'AVAILABLE_NOT_CONNECTED'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {sewerage?.connection_status?.replace('_', ' ') || 'CONNECTED'}
            </span>
          </div>

          <div className="text-xs space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">UGD Main Distance:</span>
              <span className="font-bold text-slate-800">{sewerage?.distance_to_network || 4.0}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Treatment Terminal:</span>
              <span className="font-semibold text-slate-800">{sewerage?.capacity_status || 'Coimbatore STP Hub 3'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Authority:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[150px]">{sewerage?.provider || 'Municipal Corp'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
