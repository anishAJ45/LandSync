import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, MapPin, CheckCircle2, Download, Search, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { CitizenDashboardData } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export const CitizenLandRecords: React.FC = () => {
  const [data, setData] = useState<CitizenDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get<CitizenDashboardData>('/api/dashboard/citizen');
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch land records');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your land title deeds..." size="lg" />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  const filtered = data.recent_parcels.filter(
    (p) =>
      p.parcel_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.survey_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="citizen-records-page" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950">My Land Records & Title Deeds</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Digitally certified land records linked to your verified citizen profile.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by survey no or ULPIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-950"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((parcel, idx) => {
          const statusLower = (parcel.status || '').toLowerCase();
          const isVerified = statusLower === 'verified' || statusLower === 'active';
          const isVerificationRequired = statusLower === 'under review';
          const isDiscrepancy = statusLower.includes('discrepancy') || statusLower === 'boundary discrepancy';

          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
                    ULPIN: <span className="font-mono text-blue-950 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 ml-1">{parcel.parcel_id}</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                  Survey No: {parcel.survey_no}
                </h3>

                <div className="flex items-start gap-1.5 text-xs text-slate-600 font-semibold mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{parcel.location}</span>
                </div>

                {/* Land stats grid */}
                <div className="grid grid-cols-2 gap-4 mt-4 py-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Area</span>
                    <span className="font-extrabold text-blue-950 mt-0.5 block">{parcel.area}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Land Type</span>
                    <span className="font-extrabold text-blue-950 mt-0.5 block">{parcel.type}</span>
                  </div>
                </div>

                {/* Verification section */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                  {isVerified && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[10px] tracking-wide uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span>🟢 VERIFIED</span>
                      </div>
                      <div className="text-[11px] text-emerald-800 font-bold space-y-0.5">
                        <p>✓ Available department records are consistent</p>
                        <p>✓ No discrepancy found</p>
                      </div>
                    </div>
                  )}

                  {isVerificationRequired && (
                    <Link
                      to={`/parcel/${encodeURIComponent(parcel.parcel_id)}`}
                      className="block p-3 bg-orange-50 hover:bg-orange-100/60 border border-orange-200 rounded-xl space-y-1 transition text-left cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-orange-800 font-extrabold text-[10px] tracking-wide uppercase">
                          <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                          <span>🟠 VERIFICATION REQUIRED</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-orange-600 group-hover:translate-x-0.5 transition" />
                      </div>
                      <div className="text-[11px] text-orange-900 font-bold leading-normal">
                        <p>⚠ Area differs between available department records</p>
                        <p className="text-orange-700 font-bold underline mt-1 text-[10px] flex items-center gap-1">
                          Tap to view the discrepancy <ArrowRight className="w-3.5 h-3.5" />
                        </p>
                      </div>
                    </Link>
                  )}

                  {isDiscrepancy && (
                    <Link
                      to={`/gis?parcel_id=${encodeURIComponent(parcel.parcel_id)}`}
                      className="block p-3 bg-rose-50 hover:bg-rose-100/60 border border-rose-200 rounded-xl space-y-1 transition text-left cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-rose-800 font-extrabold text-[10px] tracking-wide uppercase">
                          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                          <span>🔴 DISCREPANCY DETECTED</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-rose-600 group-hover:translate-x-0.5 transition" />
                      </div>
                      <div className="text-[11px] text-rose-900 font-bold leading-normal">
                        <p>⚠ Possible boundary overlap detected on map</p>
                        <p className="text-rose-700 font-bold underline mt-1 text-[10px] flex items-center gap-1">
                          Tap to view discrepancy on map <ArrowRight className="w-3.5 h-3.5" />
                        </p>
                      </div>
                    </Link>
                  )}

                  <div className="text-[10px] text-slate-400 font-semibold pl-1">
                    Last Verified Date: <span className="font-mono text-slate-500">{parcel.last_updated}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-2 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/parcel/${encodeURIComponent(parcel.parcel_id)}`}
                    className="px-3 py-2.5 text-xs font-bold text-center text-blue-950 hover:text-blue-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
                  >
                    View Full Land Report
                  </Link>
                  <Link
                    to={`/gis?parcel_id=${encodeURIComponent(parcel.parcel_id)}`}
                    className="px-3 py-2.5 text-xs font-bold text-center text-white bg-blue-950 hover:bg-blue-900 rounded-xl transition shadow-xs"
                  >
                    View Boundary on Map
                  </Link>
                </div>
                
                <Link
                  to="/citizen/documents"
                  className="block text-center text-[10.5px] font-bold text-teal-600 hover:text-teal-700 py-1 transition"
                >
                  View / Download Documents
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
