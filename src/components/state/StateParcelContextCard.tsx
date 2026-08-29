import React from 'react';
import { Landmark, Scale, BookOpen, Layers, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface StateParcelContextCardProps {
  stateCode?: string;
  surveyNumber?: string;
  pattaOrKathaNumber?: string;
  extentLocal?: string;
  extentStandardSqM?: number;
  subdivision?: string;
  villageOrWard?: string;
  district?: string;
  onOpenStateConfig?: () => void;
}

export const StateParcelContextCard: React.FC<StateParcelContextCardProps> = ({
  stateCode = 'TN',
  surveyNumber = '124/1',
  pattaOrKathaNumber = '1240',
  extentLocal = '2 Acres (200 Cents)',
  extentStandardSqM = 8093.71,
  subdivision = '1',
  villageOrWard = 'Kannampalayam',
  district = 'Coimbatore',
  onOpenStateConfig
}) => {
  const { t } = useLanguage();

  const stateDetails: Record<string, { name: string; system: string; docName: string; unit: string }> = {
    TN: { name: 'Tamil Nadu', system: 'Tamil Nilam', docName: 'Patta / Chitta (பட்டா)', unit: 'Acre / Cent' },
    KA: { name: 'Karnataka', system: 'Bhoomi RTC', docName: 'Form 16 Pahani (ಪಹಣಿ)', unit: 'Acre / Guntha' },
    KL: { name: 'Kerala', system: 'e-Rekha', docName: 'Thandaper (തണ്ടപ്പേര്)', unit: 'Acre / Cent' },
    MH: { name: 'Maharashtra', system: 'MahaBhulekh', docName: '7/12 Satbara (सातबारा)', unit: 'Hectare / Are' },
    DL: { name: 'Delhi', system: 'Bhulekh Delhi', docName: 'Khatauni (खतौनी)', unit: 'Bigha / Biswa' },
    PB: { name: 'Punjab', system: 'PLRS Jamabandi', docName: 'Jamabandi (ਜਮ੍ਹਾਂਬੰਦੀ)', unit: 'Kanal / Marla' }
  };

  const details = stateDetails[stateCode] || stateDetails.TN;

  return (
    <div className="bg-gradient-to-br from-white to-teal-50/40 rounded-2xl border border-teal-200/80 shadow-xs p-5 relative overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-teal-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-800 text-white font-black text-xs flex items-center justify-center shadow-xs">
            {stateCode}
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs">
              State Configuration Context: {details.name}
            </h4>
            <div className="text-[10px] text-teal-800 font-bold">
              Integrated via {details.system}
            </div>
          </div>
        </div>

        {onOpenStateConfig && (
          <button
            onClick={onOpenStateConfig}
            className="text-[11px] font-bold text-teal-800 hover:text-teal-950 hover:underline"
          >
            Inspect State Engine
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
        <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">State Title Record</div>
          <div className="font-extrabold text-slate-900 text-xs mt-0.5">{details.docName}</div>
          <div className="text-[10px] text-teal-800 font-mono font-semibold mt-0.5">#{pattaOrKathaNumber}</div>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Survey & Subdivision</div>
          <div className="font-extrabold text-slate-900 text-xs mt-0.5">Survey {surveyNumber}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Subdiv: {subdivision}</div>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">State Regional Extent</div>
          <div className="font-extrabold text-teal-900 text-xs mt-0.5">{extentLocal}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Unit: {details.unit}</div>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase">SI Standard Area</div>
          <div className="font-black text-emerald-700 text-xs mt-0.5">{extentStandardSqM.toLocaleString()} sq.m</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Universal Normalization</div>
        </div>
      </div>
    </div>
  );
};
