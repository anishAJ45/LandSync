import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { landDnaService } from '../../services/landDnaService';
import { CitizenLandStatusItem } from '../../types';
import {
  ShieldCheck,
  AlertCircle,
  Clock,
  FileCheck,
  MapPin,
  ExternalLink,
  RotateCw,
  HelpCircle,
  FileText,
  UploadCloud,
  ChevronRight,
  Info
} from 'lucide-react';

export const CitizenLandStatus: React.FC = () => {
  const [statuses, setStatuses] = useState<CitizenLandStatusItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const data = await landDnaService.getCitizenLandStatuses();
      setStatuses(data);
    } catch (err) {
      console.error('Failed to load citizen land status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: 'Digital Record Verified',
          icon: ShieldCheck,
          desc: 'Records across Patta, Survey, and Registration are fully aligned.'
        };
      case 'ACTION_REQUIRED':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          label: 'Action Required',
          icon: AlertCircle,
          desc: 'Clarification or supplementary identity document required.'
        };
      case 'UNDER_GOVERNMENT_REVIEW':
        return {
          bg: 'bg-blue-50 text-blue-900 border-blue-200',
          label: 'Under Administrative Review',
          icon: Clock,
          desc: 'Your record is currently undergoing scheduled department review.'
        };
      case 'STABLE':
      default:
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          label: 'Active & Stable',
          icon: FileCheck,
          desc: 'Standard registered land title in good standing.'
        };
    }
  };

  return (
    <div id="citizen-land-status-page" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-950 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-blue-950 tracking-tight">
                  My Land Record Status & Digital Verification
                </h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  Citizen Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Check digital synchronization status of your land parcels across Tamil Nadu government registries
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchStatuses}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors self-start md:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Reassuring Information Note */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950 leading-relaxed font-medium">
          <strong className="font-bold text-blue-900">Digital Land Records Assurance:</strong> LandSync continuously validates your registered land records against satellite cadastral boundaries, State Patta registers, and Sub-Registrar deed indexes to protect your property ownership rights.
        </div>
      </div>

      {/* Parcel Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 flex items-center justify-center gap-2">
          <RotateCw className="w-4 h-4 animate-spin text-teal-600" />
          <span className="text-xs font-bold">Checking land record sync status...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {statuses.map((item) => {
            const badge = getStatusBadge(item.record_health_status);
            const Icon = badge.icon;
            return (
              <div
                key={item.parcel_id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-blue-950">
                        Survey No. {item.survey_number}
                      </h3>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.parcel_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>{item.village}, {item.district}</span>
                      <span>•</span>
                      <span>Owner: <strong className="text-slate-700">{item.owner_name}</strong></span>
                      <span>•</span>
                      <span>Extent: <strong className="text-slate-700">{item.recorded_area} {item.area_unit}</strong></span>
                    </div>
                  </div>

                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${badge.bg}`}>
                    <Icon className="w-4 h-4" />
                    <span>{badge.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 space-y-2">
                    <p className="text-xs text-slate-600 font-medium">
                      {badge.desc}
                    </p>

                    {item.action_required && item.action_description && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950 font-medium flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-amber-900">Required Citizen Step:</strong> {item.action_description}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-4 flex flex-wrap items-center justify-end gap-2">
                    {item.action_required ? (
                      <Link
                        to="/citizen/documents"
                        className="px-3.5 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Document</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/parcel/${item.parcel_id}`}
                        className="px-3.5 py-2 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>View Parcel 360</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    <Link
                      to="/gis"
                      className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                    >
                      View on GIS
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
