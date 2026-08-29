import React, { useState, useEffect } from 'react';
import { stateConfigService } from '../services/stateConfigService';
import { StateComparisonRow } from '../types';
import { StateComparisonTable } from '../components/state/StateComparisonTable';
import { useLanguage } from '../context/LanguageContext';
import { Table, Sparkles, ShieldCheck, Landmark, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StateComparisonPage: React.FC = () => {
  const [comparisonData, setComparisonData] = useState<StateComparisonRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { setActiveStateCode } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await stateConfigService.getStateComparison();
        setComparisonData(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleInspectState = (stateCode: string) => {
    setActiveStateCode(stateCode);
    navigate('/admin/state-configuration');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 text-white border-b border-teal-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  National Interoperability
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-3">
                Pan-India State Land Stack Comparison
              </h1>
              <p className="text-sm text-teal-200/80 mt-1 max-w-3xl">
                Compare registry schemas, regional area units, local nomenclature, and API readiness scores across states.
              </p>
            </div>

            <button
              onClick={() => navigate('/admin/state-configuration')}
              className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Landmark className="w-4 h-4" />
              <span>State Configuration Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <StateComparisonTable
          comparisonData={comparisonData}
          onSelectState={handleInspectState}
        />
      </div>
    </div>
  );
};
