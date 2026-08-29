import React from 'react';
import { StateProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Landmark, ChevronDown } from 'lucide-react';

interface StateSelectorProps {
  states: StateProfile[];
  selectedStateCode: string;
  onSelectState: (stateCode: string) => void;
  className?: string;
}

export const StateSelector: React.FC<StateSelectorProps> = ({
  states,
  selectedStateCode,
  onSelectState,
  className = ''
}) => {
  const { setActiveStateCode } = useLanguage();

  const handleSelect = (code: string) => {
    onSelectState(code);
    setActiveStateCode(code);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50/80 border border-teal-200/80 rounded-xl text-xs font-bold text-teal-900">
        <Landmark className="w-4 h-4 text-teal-700" />
        <span>Active State Profile:</span>
      </div>

      <div className="relative">
        <select
          value={selectedStateCode}
          onChange={(e) => handleSelect(e.target.value)}
          className="appearance-none bg-white border-2 border-teal-800 text-slate-900 text-xs font-black rounded-xl pl-3.5 pr-8 py-2 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-teal-700 transition cursor-pointer shadow-xs"
        >
          {states.map((s) => (
            <option key={s.state_code} value={s.state_code}>
              {s.state_name} ({s.state_code}) • {s.land_record_system_name.split(' ')[0]}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
      </div>
    </div>
  );
};
