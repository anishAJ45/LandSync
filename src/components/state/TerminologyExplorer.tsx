import React, { useState } from 'react';
import { LandTerminology } from '../../types';
import { BookOpen, HelpCircle, ArrowRight, Tag, Search, Info } from 'lucide-react';

interface TerminologyExplorerProps {
  terms: LandTerminology[];
  stateCode: string;
}

export const TerminologyExplorer: React.FC<TerminologyExplorerProps> = ({
  terms,
  stateCode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeTooltipTerm, setActiveTooltipTerm] = useState<number | null>(null);

  const categories: string[] = Array.from(new Set(terms.map((t) => String(t.category))));

  const filtered = terms.filter((t) => {
    const matchesSearch =
      t.local_term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.standard_term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-800" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Local Land Terminology & Standard Semantic Dictionary
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Decodes state-specific revenue nomenclature ({stateCode}) into standardized national governance terms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            {terms.length} Terms Registered
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search regional or standard term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              selectedCategory === 'ALL'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition uppercase ${
                selectedCategory === cat
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-teal-300 hover:shadow-xs transition relative"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {t.category.replace(/_/g, ' ')}
                </span>
                <h4 className="text-base font-black text-slate-900 mt-1.5">
                  {t.local_term}
                </h4>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveTooltipTerm(activeTooltipTerm === t.id ? null : t.id)}
                  className="p-1 text-slate-400 hover:text-teal-700 rounded-md transition"
                  title="View Tooltip Explanation"
                >
                  <Info className="w-4 h-4" />
                </button>

                {/* Popover / Tooltip */}
                {activeTooltipTerm === t.id && (
                  <div className="absolute right-0 top-7 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-20 border border-white/10 animate-in fade-in zoom-in-95">
                    <div className="font-bold text-teal-300 mb-1">Standard Translation</div>
                    <div className="text-slate-200 text-[11px] leading-relaxed">
                      {t.standard_term}
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-400">
                      Context: {t.context_usage}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Standard Term Mapping */}
            <div className="mt-3 pt-3 border-t border-slate-200/70">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <span>Standardized As:</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-700" />
              </div>
              <div className="font-bold text-teal-950 text-xs bg-teal-50/80 p-2 rounded-lg border border-teal-200">
                {t.standard_term}
              </div>
            </div>

            {/* Description & Usage */}
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              {t.description}
            </p>

            <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Language: <strong>{t.language}</strong> • {t.context_usage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
