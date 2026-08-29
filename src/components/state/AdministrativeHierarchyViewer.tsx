import React, { useState } from 'react';
import { AdministrativeHierarchy, GovernanceContextType } from '../../types';
import { Network, Building2, Trees, User, ChevronRight, ShieldCheck } from 'lucide-react';

interface AdministrativeHierarchyViewerProps {
  hierarchy: AdministrativeHierarchy | null;
  stateCode: string;
  contextType: GovernanceContextType;
  onChangeContext?: (ctx: GovernanceContextType) => void;
}

export const AdministrativeHierarchyViewer: React.FC<AdministrativeHierarchyViewerProps> = ({
  hierarchy,
  stateCode,
  contextType,
  onChangeContext
}) => {
  const [activeLevelNumber, setActiveLevelNumber] = useState<number>(1);

  if (!hierarchy) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
        No administrative hierarchy defined for {stateCode} ({contextType}).
      </div>
    );
  }

  const activeLevel = hierarchy.levels.find((l) => l.level_number === activeLevelNumber) || hierarchy.levels[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-teal-800" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Administrative & Jurisdiction Hierarchy ({stateCode})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-tiered governance structure mapping field officers to executive land authorities.
          </p>
        </div>

        {/* Rural / Urban Context Switch */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => onChangeContext && onChangeContext('RURAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              contextType === 'RURAL'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            <span>Rural Revenue Structure</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeContext && onChangeContext('URBAN')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              contextType === 'URBAN'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Urban Civic Structure</span>
          </button>
        </div>
      </div>

      {/* Stepped Hierarchy Tree */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Hierarchy Chain Column */}
        <div className="lg:col-span-5 space-y-2">
          {hierarchy.levels.map((lvl) => {
            const isSelected = lvl.level_number === activeLevelNumber;
            return (
              <div
                key={lvl.level_number}
                onClick={() => setActiveLevelNumber(lvl.level_number)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-teal-50 border-teal-500 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${
                      isSelected
                        ? 'bg-teal-800 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    L{lvl.level_number}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">{lvl.level_name}</div>
                    <div className="text-[11px] font-bold text-teal-800 mt-0.5">{lvl.local_name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <ChevronRight
                    className={`w-4 h-4 transition ${
                      isSelected ? 'text-teal-700 translate-x-1' : 'text-slate-300'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Level Inspector Details Column */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div>
              <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                Tier Level {activeLevel.level_number} of {hierarchy.levels.length}
              </span>
              <h4 className="text-lg font-black text-slate-900 mt-1.5">
                {activeLevel.level_name} • {activeLevel.local_name}
              </h4>
            </div>

            <div className="text-right text-xs text-slate-500">
              Parent Tier: <strong className="text-slate-800">{activeLevel.parent_level}</strong>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-teal-700" />
                <span>Statutory Administrative Head / Competent Authority</span>
              </div>
              <div className="text-sm font-black text-teal-950">
                {activeLevel.administrative_head}
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Jurisdiction Duties & Land Governance Scope</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {activeLevel.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
