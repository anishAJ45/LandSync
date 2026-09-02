import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Plus,
  MapPin,
  CheckCircle2,
  Clock,
  Bell,
  Sparkles,
  ArrowRight,
  X,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
  Info,
  Layers,
  FileCheck2
} from 'lucide-react';
import api from '../../services/api';
import { CitizenDashboardData, Parcel } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { MapContainer } from '../../components/gis/MapContainer';
import { parcelService } from '../../services/parcelService';

export const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<CitizenDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Map & GIS states
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [mapSearchQuery, setMapSearchQuery] = useState('');

  const matchedSearchParcelId = React.useMemo(() => {
    if (!mapSearchQuery || !geoJsonData) return null;
    const query = mapSearchQuery.trim().toLowerCase();
    const found = geoJsonData.features.find(
      (f: any) =>
        f.properties.survey_number.toLowerCase() === query ||
        f.properties.parcel_id.toLowerCase() === query ||
        f.properties.survey_number.replace(/\s+/g, '') === query.replace(/\s+/g, '')
    );
    return found ? found.properties.parcel_id : null;
  }, [mapSearchQuery, geoJsonData]);

  const activeDashboardMapParcelId = matchedSearchParcelId || selectedParcelId;

  // Search modal states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchType, setSearchType] = useState<'ulpin' | 'survey' | 'location'>('ulpin');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Parcel[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchCitizenData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<CitizenDashboardData>('/api/dashboard/citizen');
      setData(response.data);
      
      // Default selected parcel id to first record if available
      if (response.data.recent_parcels.length > 0) {
        setSelectedParcelId(response.data.recent_parcels[0].parcel_id);
      }
    } catch (err: any) {
      console.error('Error fetching citizen dashboard data:', err);
      setError(err.response?.data?.detail || 'Failed to load citizen land records and dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizenData();
  }, []);

  // Fetch GeoJSON on data load
  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const geojson = await parcelService.getGeoJSON();
        setGeoJsonData(geojson);
      } catch (err) {
        console.error('Error fetching GeoJSON for map preview:', err);
      }
    };
    if (data) {
      fetchGeoJSON();
    }
  }, [data]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setSearchError(null);
      setSearchResults([]);
      
      let params = {};
      if (searchType === 'ulpin') {
        params = { q: searchQuery };
      } else if (searchType === 'survey') {
        params = { q: searchQuery };
      } else {
        params = { village: searchQuery };
      }

      const results = await parcelService.searchParcels(params);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No land parcels found matching your search query.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('Failed to search parcels. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching your land records and verification status..." size="lg" />;
  }

  if (error) {
    return <ErrorMessage title="Citizen Portal Error" message={error} onRetry={fetchCitizenData} />;
  }

  if (!data) return null;

  return (
    <div id="citizen-dashboard-container" className="space-y-8 bg-slate-50/50 min-h-screen pb-12">
      {/* Top Welcome Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight flex items-center gap-2">
            Welcome back, {data.user.full_name || 'Ramesh'} 👋
          </h1>
          <p className="mt-2 text-base text-slate-600 font-medium leading-relaxed">
            Manage your land, verify documents, and track your requests easily.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-teal-50 border border-teal-200 text-teal-800">
            <ShieldCheck className="w-4 h-4 text-teal-600 animate-pulse" />
            Aadhaar Verified Profile
          </span>
        </div>
      </div>

      {/* 3 Large Primary Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search Land Card */}
        <button
          onClick={() => {
            setSearchOpen(true);
            setSearchResults([]);
            setSearchQuery('');
            setSearchError(null);
          }}
          className="bg-white text-left p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-500 hover:shadow-md transition duration-200 group relative overflow-hidden cursor-pointer focus:outline-none"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-950 flex items-center justify-center mb-5 group-hover:scale-110 transition duration-200">
            <Search className="w-6 h-6 text-teal-600" />
          </div>
          <h3 className="text-lg font-bold text-blue-950 flex items-center gap-1">
            Search Land
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition duration-200 text-teal-600" />
          </h3>
          <p className="mt-2 text-sm text-slate-500 font-medium leading-normal">
            Search using ULPIN, Survey Number, or Location.
          </p>
        </button>

        {/* Verify Document Card */}
        <Link
          to="/citizen/documents"
          className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-500 hover:shadow-md transition duration-200 group relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-950 flex items-center justify-center mb-5 group-hover:scale-110 transition duration-200">
            <FileText className="w-6 h-6 text-teal-600" />
          </div>
          <h3 className="text-lg font-bold text-blue-950 flex items-center gap-1">
            Verify Document
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition duration-200 text-teal-600" />
          </h3>
          <p className="mt-2 text-sm text-slate-500 font-medium leading-normal">
            Upload Patta/RoR and use OCR to extract and verify land details.
          </p>
        </Link>

        {/* Submit Request Card */}
        <Link
          to="/citizen/create-request"
          className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-500 hover:shadow-md transition duration-200 group relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-950 flex items-center justify-center mb-5 group-hover:scale-110 transition duration-200">
            <Plus className="w-6 h-6 text-teal-600" />
          </div>
          <h3 className="text-lg font-bold text-blue-950 flex items-center gap-1">
            Submit Request
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition duration-200 text-teal-600" />
          </h3>
          <p className="mt-2 text-sm text-slate-500 font-medium leading-normal">
            Apply for land-related services and track the request.
          </p>
        </Link>
      </div>

      {/* Main Content Grid: Land Parcels & GIS map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Land Parcels & Map Preview) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* My Land Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-blue-950 tracking-tight flex items-center gap-2">
                🗺️ My Land Parcels
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {data.recent_parcels.length} registered properties
              </span>
            </div>

            {/* Horizontal visual cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.recent_parcels.map((parcel) => {
                const isSelected = selectedParcelId === parcel.parcel_id;
                return (
                  <div
                    key={parcel.parcel_id}
                    className={`bg-white p-5 rounded-2xl border transition duration-200 ${
                      isSelected
                        ? 'border-teal-500 shadow-md ring-1 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-extrabold text-blue-950 flex items-center gap-1.5">
                          <span>🗺️ Survey No. {parcel.survey_no}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          {parcel.location}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          parcel.status === 'Verified'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          parcel.status === 'Verified' ? 'bg-emerald-600' : 'bg-amber-600'
                        }`} />
                        {parcel.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 py-3 border-t border-b border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Area</span>
                        <span className="font-extrabold text-blue-950 mt-0.5 block">{parcel.area}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Classification</span>
                        <span className="font-extrabold text-blue-950 mt-0.5 block">{parcel.type}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedParcelId(parcel.parcel_id)}
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg transition cursor-pointer ${
                          isSelected
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Show on Map'}
                      </button>

                      <Link
                        to={`/parcel/${encodeURIComponent(parcel.parcel_id)}`}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-0.5 transition"
                      >
                        View 360° Profile
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GIS Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-blue-950 flex items-center gap-1.5">
                🗺️ Your Land on Map
              </h3>
              <Link
                to="/gis"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-teal-300 text-xs font-bold shadow-xs transition"
              >
                <span>Open Full GIS Map</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick map search bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search any survey number (e.g. 124/2, 125/2) to show on map..."
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                className="w-full text-xs pl-8.5 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 font-medium placeholder:text-slate-400 bg-slate-50 focus:bg-white transition"
              />
              {mapSearchQuery && (
                <button
                  type="button"
                  onClick={() => setMapSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Map Preview Wrapper */}
            <div className="h-72 rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-100 flex items-center justify-center">
              {geoJsonData ? (
                <div className="w-full h-full">
                  <MapContainer
                    geoJsonData={geoJsonData}
                    selectedParcelId={activeDashboardMapParcelId}
                    hoveredParcelId={null}
                    onSelectParcel={(parcelId) => {
                      setSelectedParcelId(parcelId);
                      setMapSearchQuery(''); // clear search on manual click
                    }}
                    onHoverParcel={() => {}}
                  />
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <LoadingSpinner size="md" message="Loading Cadastral Layer..." />
                </div>
              )}
            </div>
            {activeDashboardMapParcelId && (
              <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 justify-center">
                <Info className="w-3.5 h-3.5 text-blue-900" />
                Showing highlighted polygon for parcel <span className="font-mono text-blue-950 font-bold">{activeDashboardMapParcelId}</span>
              </p>
            )}
          </div>

        </div>

        {/* Right Column (Status Metrics & Activities) */}
        <div className="space-y-8">
          
          {/* Quick Status Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-blue-950 tracking-tight">
              ⚡ Quick Status
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {/* My Records Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-teal-600 flex items-center justify-center font-bold">
                    <FileCheck2 className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">My Records</h4>
                    <p className="text-2xl font-black text-blue-950 mt-0.5">{data.stats.my_parcels || 6}</p>
                  </div>
                </div>
                <Link to="/citizen/records" className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-950 transition">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Pending Requests Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">Pending Requests</h4>
                    <p className="text-2xl font-black text-blue-950 mt-0.5">{data.stats.pending_requests || 2}</p>
                  </div>
                </div>
                <Link to="/citizen/applications" className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-950 transition">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Notifications Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">Notifications</h4>
                    <p className="text-2xl font-black text-blue-950 mt-0.5">{data.stats.unread_notifications || 2}</p>
                  </div>
                </div>
                <Link to="/citizen/notifications" className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-950 transition">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-blue-950">
              🔔 Recent Updates
            </h3>
            
            <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-6 text-xs">
              {/* Event 1 */}
              <div className="relative">
                <span className="absolute -left-[22px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                <div>
                  <h4 className="font-extrabold text-blue-950">Patta document verified</h4>
                  <p className="text-slate-500 mt-0.5">Digitally signed Patta certificate generated and secured in ledger.</p>
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">2 hours ago</span>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <span className="absolute -left-[22px] top-0.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white" />
                <div>
                  <h4 className="font-extrabold text-blue-950">Mutation request under review</h4>
                  <p className="text-slate-500 mt-0.5">Tahsildar is verifying spatial overlap for Survey No. 124/1.</p>
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">1 day ago</span>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative">
                <span className="absolute -left-[22px] top-0.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white" />
                <div>
                  <h4 className="font-extrabold text-blue-950">New update from Revenue Department</h4>
                  <p className="text-slate-500 mt-0.5">Digital Public Infrastructure state sync completed for Coimbatore region.</p>
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">3 days ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Disclaimer */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-blue-950 flex items-start gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-blue-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Land Governance Notice:</strong> LandSync provides digital workflow and AI-assisted verification support. Final decisions are made by authorized officials.
            </p>
          </div>

        </div>

      </div>

      {/* Search Land Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-blue-950 flex items-center gap-2">
                <Search className="w-5 h-5 text-teal-600" />
                Search Land Registry
              </h3>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Search Tabs */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold text-center">
                <button
                  type="button"
                  onClick={() => {
                    setSearchType('ulpin');
                    setSearchResults([]);
                    setSearchError(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                    searchType === 'ulpin' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ULPIN / ID
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchType('survey');
                    setSearchResults([]);
                    setSearchError(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                    searchType === 'survey' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Survey Number
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchType('location');
                    setSearchResults([]);
                    setSearchError(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                    searchType === 'location' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Location
                </button>
              </div>

              {/* Search Input Form */}
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="text"
                    required
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchType === 'ulpin'
                        ? 'Enter Unique Land Parcel Identification Number (e.g. TN-CBE-001)'
                        : searchType === 'survey'
                        ? 'Enter Survey Number (e.g. 124/1)'
                        : 'Enter Village or District (e.g. Coimbatore)'
                    }
                    className="w-full text-sm py-3 pl-4 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 font-medium placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="absolute right-2.5 top-2 p-1.5 rounded-lg bg-blue-950 text-white hover:bg-blue-900 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Searching State */}
              {searching && (
                <div className="py-8 flex justify-center">
                  <LoadingSpinner size="md" message="Searching registry database..." />
                </div>
              )}

              {/* Error messages */}
              {searchError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Results ({searchResults.length})
                  </p>
                  
                  {searchResults.map((p) => (
                    <div
                      key={p.parcel_id}
                      className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
                          {p.parcel_id}
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-1">
                          Survey No. {p.survey_number} • {p.recorded_area} {p.area_unit}
                        </p>
                        <p className="text-[11px] text-slate-500 font-semibold">
                          Owner: {p.current_owner}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSearchOpen(false);
                          navigate(`/gis?parcel_id=${encodeURIComponent(p.parcel_id)}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition cursor-pointer"
                      >
                        View Map
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSearchOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition hover:bg-slate-100 cursor-pointer"
              >
                Close Search
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
