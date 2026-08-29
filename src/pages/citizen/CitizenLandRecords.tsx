import React, { useState, useEffect } from 'react';
import { Layers, MapPin, CheckCircle2, Download, Search, ShieldCheck } from 'lucide-react';
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
        {filtered.map((parcel, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-mono text-xs font-bold text-blue-950 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  {parcel.parcel_id}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {parcel.status}
                </span>
              </div>

              <h3 className="font-bold text-lg text-slate-900 mb-1">
                Survey No: {parcel.survey_no}
              </h3>

              <div className="flex items-start gap-1.5 text-xs text-slate-600 mb-4">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>{parcel.location}</span>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Extent / Area:</span>
                  <span className="font-medium text-slate-800">{parcel.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Land Classification:</span>
                  <span className="font-medium text-slate-800">{parcel.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Verified Date:</span>
                  <span className="font-medium text-slate-800 font-mono">{parcel.last_updated}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => alert(`Certificate for ${parcel.parcel_id} downloaded (Phase 1 Simulated Action)`)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-950 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download Digitally Signed Patta
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
