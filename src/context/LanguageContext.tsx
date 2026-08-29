import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode, SUPPORTED_LANGUAGES, translations } from '../i18n/translations';
import { GovernanceContextType } from '../types';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  activeStateCode: string;
  setActiveStateCode: (stateCode: string) => void;
  governanceContext: GovernanceContextType;
  setGovernanceContext: (context: GovernanceContextType) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('landsync_language') as LanguageCode) || 'en';
  });

  const [activeStateCode, setActiveStateCodeState] = useState<string>(() => {
    return localStorage.getItem('landsync_state_code') || 'TN';
  });

  const [governanceContext, setGovernanceContextState] = useState<GovernanceContextType>(() => {
    return (localStorage.getItem('landsync_gov_context') as GovernanceContextType) || 'RURAL';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('landsync_language', lang);
  };

  const setActiveStateCode = (stateCode: string) => {
    setActiveStateCodeState(stateCode);
    localStorage.setItem('landsync_state_code', stateCode);
    // Automatically suggest default language if changing state
    if (stateCode === 'TN' && language === 'en') {
      // Keep English default or allow regional switch
    } else if (stateCode === 'KA' && language === 'ta') {
      setLanguage('kn');
    } else if (stateCode === 'KL' && (language === 'ta' || language === 'kn')) {
      setLanguage('ml');
    }
  };

  const setGovernanceContext = (ctx: GovernanceContextType) => {
    setGovernanceContextState(ctx);
    localStorage.setItem('landsync_gov_context', ctx);
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations.en;
    if (langDict[key]) return langDict[key];
    const fallbackDict = translations.en;
    if (fallbackDict[key]) return fallbackDict[key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        activeStateCode,
        setActiveStateCode,
        governanceContext,
        setGovernanceContext,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
