import React, { useState } from 'react';
import { StateFieldMapping } from '../../types';
import { ArrowRight, CheckCircle2, AlertCircle, Plus, Search, Filter } from 'lucide-react';

interface FieldMappingTableProps {
  mappings: StateFieldMapping[];
  stateCode: string;
  onAddNewMapping?: () => void;
}

export const FieldMappingTable: React.FC<FieldMappingTableProps> = ({
  mappings,
  stateCode,
  onAddNewMapping
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSystem, setFilterSystem] = useState<string>('ALL');

  const systems = Array.from(new Set(mappings.map((m) => m.source_system)));

  const filtered = mappings.filter((m) => {
    const matchesSearch =
      m.source_field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.standard_field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSystem = filterSystem === 'ALL' || m.source_system === filterSystem;
    return matchesSearch && matchesSystem;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">
            State Source Field → Common Land Data Model Mappings
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic schema translation rules for {stateCode} land registries to standard LandSync fields.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onAddNewMapping && (
            <button
              onClick={onAddNewMapping}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Field Mapping</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search source or standard field..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterSystem}
            onChange={(e) => setFilterSystem(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
          >
            <option value="ALL">All Source Systems ({mappings.length})</option>
            {systems.map((sys) => (
              <option key={sys} value={sys}>
                {sys}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/80 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">State Source Field</th>
              <th className="py-3 px-4">Transformation</th>
              <th className="py-3 px-4">LandSync Standard Field</th>
              <th className="py-3 px-4">Data Type</th>
              <th className="py-3 px-4">Requirement</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No matching field mappings found for {stateCode}.
                </td>
              </tr>
            ) : (
              filtered.map((map) => (
                <tr key={map.id} className="hover:bg-teal-50/40 transition">
                  {/* Source Field */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-900 text-xs">
                      {map.source_field}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      System: {map.source_system}
                    </div>
                  </td>

                  {/* Transformation Arrow */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-slate-100 text-slate-500">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      {map.transformation_rule && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {map.transformation_rule}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Standard Field */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-black text-teal-900 text-xs bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block">
                      {map.standard_field}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs line-clamp-1">
                      {map.description}
                    </p>
                  </td>

                  {/* Data Type */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">
                      {map.data_type}
                    </span>
                  </td>

                  {/* Requirement */}
                  <td className="py-3.5 px-4">
                    {map.is_required ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Optional
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      {map.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
