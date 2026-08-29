import React from 'react';
import { Search, X, Filter, Sparkles, MapPin, AlertCircle } from 'lucide-react';
import { LandUseType, ParcelStatus } from '../../types';

interface ParcelSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLandUse: string;
  onLandUseChange: (landUse: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export const ParcelSearch: React.FC<ParcelSearchProps> = ({
  searchQuery,
  onSearchChange,
  selectedLandUse,
  onLandUseChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  totalCount,
  filteredCount,
}) => {
  const quickFilters = [
    { label: 'All Parcels', landUse: '', status: '' },
    { label: 'Residential', landUse: 'Residential', status: '' },
    { label: 'Agricultural', landUse: 'Agricultural', status: '' },
    { label: 'Commercial', landUse: 'Commercial', status: '' },
    { label: 'Government', landUse: 'Government', status: '' },
    { label: 'Boundary Overlaps', landUse: '', status: 'Overlap' },
    { label: 'Discrepancies', landUse: '', status: 'Discrepancy' },
  ];

  const hasActiveFilters = searchQuery || selectedLandUse || selectedStatus;

  return (
    <div id="gis-parcel-search-bar" className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="gis-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Parcel ID (e.g. TN-CBE-001-124-1), Survey No, Owner, or Village..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2">
          {/* Land Use filter */}
          <select
            id="gis-filter-landuse"
            value={selectedLandUse}
            onChange={(e) => onLandUseChange(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white transition"
          >
            <option value="">All Land Uses</option>
            <option value="Residential">Residential</option>
            <option value="Agricultural">Agricultural</option>
            <option value="Commercial">Commercial</option>
            <option value="Government">Government</option>
          </select>

          {/* Status filter */}
          <select
            id="gis-filter-status"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white transition"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Boundary Discrepancy">Boundary Discrepancy</option>
          </select>

          {hasActiveFilters && (
            <button
              id="gis-clear-filters-btn"
              onClick={onResetFilters}
              className="px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Chips & Count */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
          </span>
          {quickFilters.map((qf, idx) => {
            const isActive =
              (qf.landUse === selectedLandUse && qf.status === selectedStatus) ||
              (!qf.landUse && !qf.status && !selectedLandUse && !selectedStatus);
            return (
              <button
                key={idx}
                onClick={() => {
                  onLandUseChange(qf.landUse);
                  onStatusChange(qf.status);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-950 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {qf.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-blue-950 font-bold">{filteredCount}</span> of {totalCount} cadastral parcels
        </div>
      </div>
    </div>
  );
};
