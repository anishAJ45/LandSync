import React, { useState } from 'react';
import { UnitConfiguration } from '../../types';
import { Scale, ArrowRightLeft, Calculator, CheckCircle2, Sparkles } from 'lucide-react';

interface UnitConversionPanelProps {
  units: UnitConfiguration[];
  stateCode: string;
}

export const UnitConversionPanel: React.FC<UnitConversionPanelProps> = ({
  units,
  stateCode
}) => {
  const [inputValue, setInputValue] = useState<number>(2);
  const [fromUnit, setFromUnit] = useState<string>(units[0]?.unit_name || 'Acre');
  const [toUnit, setToUnit] = useState<string>('Square Meter');

  const getMultiplier = (unitName: string) => {
    const found = units.find((u) => u.unit_name.toLowerCase() === unitName.toLowerCase());
    return found ? found.conversion_to_standard : 1;
  };

  const calculateConversion = () => {
    const fromMult = getMultiplier(fromUnit);
    const toMult = getMultiplier(toUnit);
    const standardSqM = inputValue * fromMult;
    const converted = standardSqM / toMult;
    return {
      standardSqM: standardSqM.toFixed(2),
      convertedResult: converted.toFixed(4)
    };
  };

  const { standardSqM, convertedResult } = calculateConversion();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal-800" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Unit Conversion Engine ({stateCode} & National)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Converts regional measurement units (Cents, Gunthas, Grounds, Bighas, Kanals) to standard SI Square Meters.
          </p>
        </div>

        <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Core Standard: SI Square Meters (sq.m)</span>
        </div>
      </div>

      {/* Interactive Live Converter Card */}
      <div className="mt-5 p-5 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-2xl text-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
            <Calculator className="w-4 h-4" />
            Interactive Live Unit Converter
          </span>
          <span className="text-[11px] text-slate-300">
            Real-time Bidirectional Precision
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Input Value */}
          <div className="sm:col-span-3">
            <label className="block text-[10px] text-teal-200 font-semibold uppercase mb-1">
              Input Quantity
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-base font-black text-white focus:outline-hidden focus:ring-2 focus:ring-teal-400"
            />
          </div>

          {/* From Unit */}
          <div className="sm:col-span-4">
            <label className="block text-[10px] text-teal-200 font-semibold uppercase mb-1">
              From Regional Unit
            </label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-teal-400"
            >
              {units.map((u) => (
                <option key={u.id} value={u.unit_name}>
                  {u.unit_name} ({u.local_symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Arrow */}
          <div className="sm:col-span-1 flex justify-center text-teal-300 pt-3">
            <ArrowRightLeft className="w-5 h-5" />
          </div>

          {/* To Unit */}
          <div className="sm:col-span-4">
            <label className="block text-[10px] text-teal-200 font-semibold uppercase mb-1">
              Target Converted Unit
            </label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-teal-400"
            >
              {units.map((u) => (
                <option key={u.id} value={u.unit_name}>
                  {u.unit_name} ({u.local_symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Callout */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            Original: <strong className="text-white">{inputValue} {fromUnit}</strong>
            <span className="mx-2 text-teal-400">→</span>
            SI Standard: <strong className="text-teal-300">{standardSqM} sq.m</strong>
          </div>

          <div className="flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 px-4 py-2 rounded-xl">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-sm font-black text-emerald-300">
              = {convertedResult} {toUnit}
            </span>
          </div>
        </div>
      </div>

      {/* State Unit Reference Table */}
      <div className="mt-6">
        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3">
          Active Unit Conversion Registry ({units.length} Units)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {units.map((u) => (
            <div
              key={u.id}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-teal-300 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{u.unit_name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-teal-100 text-teal-800">
                  {u.local_symbol}
                </span>
              </div>
              <div className="text-xs font-black text-teal-900 mt-1">
                1 {u.unit_name} = {u.conversion_to_standard.toLocaleString()} sq.m
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {u.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
