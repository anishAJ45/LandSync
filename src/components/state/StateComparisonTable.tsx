import React, { useState } from 'react';
import { StateComparisonRow } from '../../types';
import { Table, Search, ShieldCheck, ArrowRight } from 'lucide-react';

interface StateComparisonTableProps {
  comparisonData: StateComparisonRow[];
  onSelectState?: (stateCode: string) => void;
}

export const StateComparisonTable: React.FC<StateComparisonTableProps> = ({
  comparisonData,
  onSelectState
}) => {
  const [search, setSearch] = useState('');

  const filtered = comparisonData.filter(
    (row) =>
      row.state_name.toLowerCase().includes(search.toLowerCase()) ||
      row.state_code.toLowerCase().includes(search.toLowerCase()) ||
      row.land_system.toLowerCase().includes(search.toLowerCase()) ||
      row.registration_system.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-teal-800" />
            <h3 className="font-extrabold text-slate-900 text-base">
              National Cross-State Configuration & Interoperability Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side comparison of state land registries, local units, and readiness ratings across India.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search state, system..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/80 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4">Land Records System</th>
              <th className="py-3 px-4">Registration Gateway</th>
              <th className="py-3 px-4">Key Local Nomenclature</th>
              <th className="py-3 px-4">Default Unit</th>
              <th className="py-3 px-4 text-center">Mappings</th>
              <th className="py-3 px-4 text-center">Readiness</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filtered.map((row) => (
              <tr key={row.state_code} className="hover:bg-teal-50/40 transition">
                {/* State */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-teal-800 text-white font-black text-xs flex items-center justify-center">
                      {row.state_code}
                    </span>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs">{row.state_name}</div>
                      <div className="text-[10px] text-slate-400">{row.primary_language}</div>
                    </div>
                  </div>
                </td>

                {/* Land System */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-800 text-xs">{row.land_system}</div>
                  <div className="text-[10px] text-slate-400">RoR & Cadastre</div>
                </td>

                {/* Registration System */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-800 text-xs">{row.registration_system}</div>
                  <div className="text-[10px] text-slate-400">IGR SRO Portal</div>
                </td>

                {/* Nomenclature */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {row.key_local_terms.map((term, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Unit */}
                <td className="py-3.5 px-4">
                  <span className="px-2 py-1 rounded bg-teal-50 text-teal-900 border border-teal-200 font-mono text-[11px] font-bold">
                    {row.default_unit}
                  </span>
                </td>

                {/* Mappings */}
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-black text-slate-800 text-xs">
                    {row.field_mappings_count}
                  </span>
                </td>

                {/* Readiness Score */}
                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-black text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{row.readiness_score}%</span>
                  </div>
                </td>

                {/* Switch Action */}
                <td className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => onSelectState && onSelectState(row.state_code)}
                    className="flex items-center gap-1 text-teal-800 hover:text-teal-950 font-bold text-xs hover:underline"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
