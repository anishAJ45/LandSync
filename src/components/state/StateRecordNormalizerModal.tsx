import React, { useState } from 'react';
import { stateConfigService } from '../../services/stateConfigService';
import { StateNormalizationResponse } from '../../types';
import { Sparkles, X, CheckCircle2, RefreshCw, ArrowRight, Code } from 'lucide-react';

interface StateRecordNormalizerModalProps {
  stateCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export const StateRecordNormalizerModal: React.FC<StateRecordNormalizerModalProps> = ({
  stateCode,
  isOpen,
  onClose
}) => {
  const [sourceSystem, setSourceSystem] = useState<string>(
    stateCode === 'TN' ? 'Tamil Nilam (Patta/Chitta)' : stateCode === 'KA' ? 'Bhoomi RTC' : 'MahaBhulekh (7/12)'
  );

  const samplePayloads: Record<string, string> = {
    TN: JSON.stringify(
      {
        patta_number: '1240',
        pula_en: '124/1A',
        utpirivu_en: '1',
        patta_dharar_peyar: 'ரங்கநாதன் சுப்பிரமணியம் (Ranganathan Subramaniam)',
        parappu_hec_are: '1-20-50',
        area: 3.25,
        area_unit: 'Cent',
        district: 'Coimbatore',
        taluk: 'Sulur',
        village: 'Kannampalayam',
        land_use: 'Agricultural (Wet / நஞ்சை)',
        doc_reg_number: '2026/SRO-SULUR/1842'
      },
      null,
      2
    ),
    KA: JSON.stringify(
      {
        katha_number: 'K-9081',
        survey_no: '88/2',
        hissa_no: '3',
        khatedar_name: 'ಮಂಜುನಾಥ ಗೌಡ (Manjunath Gowda)',
        extent: 4.5,
        area_unit: 'Guntha',
        district: 'Bengaluru Rural',
        taluk: 'Devanahalli',
        hobli: 'Kasaba',
        village: 'Kundanahalli',
        land_use: 'Dry Agricultural (ಖುಷ್ಕಿ)',
        kaveri_token_id: 'KAVERI-2026-DEV-4421'
      },
      null,
      2
    ),
    MH: JSON.stringify(
      {
        khate_kramank: '8A-452',
        gat_kramank: '112/B',
        pot_hissa: '2',
        khatedar_name: 'अशोक पाटिल (Ashok Patil)',
        extent: 15.0,
        area_unit: 'Are',
        district: 'Pune',
        taluka: 'Haveli',
        village: 'Wagholi',
        land_use: 'Jirayat (जिरायत)',
        isarita_reg_id: 'MH-PUN-HAV-2026-1092'
      },
      null,
      2
    )
  };

  const [rawJson, setRawJson] = useState<string>(samplePayloads[stateCode] || samplePayloads.TN);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<StateNormalizationResponse | null>(null);

  if (!isOpen) return null;

  const handleNormalize = async () => {
    try {
      setLoading(true);
      const parsed = JSON.parse(rawJson);
      const res = await stateConfigService.normalizeStateRecord(stateCode, sourceSystem, parsed);
      setResult(res);
    } catch (err: any) {
      alert('Invalid JSON input: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                State Data Normalization & Ingestion Simulator ({stateCode})
              </h3>
              <p className="text-xs text-teal-200">
                Transforms state revenue records into the National Common Land Data Model in real-time.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1">
          {/* Left: Input */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase text-slate-700">
                Raw State Ingestion Record (JSON)
              </label>
              <select
                value={sourceSystem}
                onChange={(e) => setSourceSystem(e.target.value)}
                className="text-[11px] bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700"
              >
                <option value="Tamil Nilam (Patta/Chitta)">Tamil Nilam (TN)</option>
                <option value="Bhoomi RTC">Bhoomi RTC (KA)</option>
                <option value="e-Rekha">e-Rekha (KL)</option>
                <option value="MahaBhulekh (7/12)">MahaBhulekh (MH)</option>
              </select>
            </div>

            <textarea
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              rows={12}
              className="w-full flex-1 p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-inner"
            />

            <button
              onClick={handleNormalize}
              disabled={loading}
              className="mt-3 w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Normalizing Schema...' : 'Normalize to Common Land Model'}</span>
            </button>
          </div>

          {/* Right: Output */}
          <div className="flex flex-col">
            <label className="text-xs font-black uppercase text-slate-700 mb-2">
              Standardized Output (Common Land Model)
            </label>

            {result ? (
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {/* Result Card */}
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 font-extrabold text-emerald-950 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Normalized Successfully ({result.quality_status})</span>
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    ULPIN: <strong>{result.standardized_record.ulpin}</strong> • Area: <strong>{result.standardized_record.area_sq_m} sq.m</strong>
                  </div>
                </div>

                {/* Applied Transformations */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Applied Transformation Rules
                  </div>
                  <div className="space-y-1 text-xs font-mono">
                    {result.applied_transformations.map((t, idx) => (
                      <div key={idx} className="text-slate-700 text-[11px]">
                        <span className="font-bold text-teal-800">{t.rule_applied}:</span> {t.original_value} → {t.transformed_value}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Standardized JSON */}
                <div className="p-3 bg-slate-900 text-teal-300 font-mono text-xs rounded-xl overflow-x-auto max-h-56">
                  <pre>{JSON.stringify(result.standardized_record, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-center">
                <Code className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold">Click Normalize to test the transformation engine.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
