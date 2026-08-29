import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../../i18n/translations';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false, className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Globe className="w-4 h-4 text-slate-400 shrink-0" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className={`bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-700 transition cursor-pointer ${
          compact ? 'px-2 py-1' : 'px-2.5 py-1.5'
        }`}
        title="Select Interface Language"
        aria-label="Language selection"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  );
};
