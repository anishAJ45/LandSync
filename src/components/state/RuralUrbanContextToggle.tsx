import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { GovernanceContextType } from '../../types';
import { Trees, Building, MapPin } from 'lucide-react';

interface RuralUrbanContextToggleProps {
  className?: string;
  onChange?: (context: GovernanceContextType) => void;
}

export const RuralUrbanContextToggle: React.FC<RuralUrbanContextToggleProps> = ({ className = '', onChange }) => {
  const { governanceContext, setGovernanceContext, t } = useLanguage();

  const handleSelect = (ctx: GovernanceContextType) => {
    setGovernanceContext(ctx);
    if (onChange) onChange(ctx);
  };

  return (
    <div className={`inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl ${className}`}>
      <button
        type="button"
        onClick={() => handleSelect('RURAL')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
          governanceContext === 'RURAL'
            ? 'bg-emerald-800 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
        <Trees className="w-3.5 h-3.5" />
        <span>Rural / Patta (கிராமப்புற)</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelect('URBAN')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
          governanceContext === 'URBAN'
            ? 'bg-teal-800 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
        <Building className="w-3.5 h-3.5" />
        <span>Urban / Municipal (நகர்ப்புற)</span>
      </button>
    </div>
  );
};
