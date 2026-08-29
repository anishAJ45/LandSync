import React, { useState } from 'react';
import { LandValuationReference } from '../../types';
import {
  TrendingUp,
  Landmark,
  Info,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface LandValuationCardProps {
  valuation: LandValuationReference | null;
  recordedAreaSqft?: number;
}

export const LandValuationCard: React.FC<LandValuationCardProps> = ({
  valuation,
  recordedAreaSqft = 43560 // 1 Acre default
}) => {
  const [showTrends, setShowTrends] = useState(false);

  if (!valuation) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Land Valuation Reference</h3>
            <p className="text-xs text-slate-500">Government Guideline Reference Rates</p>
          </div>
        </div>
        <p className="text-xs text-slate-500">Valuation reference not available for this parcel.</p>
      </div>
    );
  }

  const estimatedGuidelineValue = (valuation.reference_rate || 2000) * recordedAreaSqft;
  const minEstimatedValue = (valuation.min_rate || valuation.reference_rate * 0.9) * recordedAreaSqft;
  const maxEstimatedValue = (valuation.max_rate || valuation.reference_rate * 1.15) * recordedAreaSqft;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Land Valuation Reference</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[11px] uppercase">
                {valuation.confidence_level} Confidence
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Source: {valuation.source_authority}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-semibold uppercase">Reference Rate</div>
          <div className="text-lg font-black text-slate-900 font-mono">
            ₹{valuation.reference_rate.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-500">/ sq.ft</span>
          </div>
        </div>
      </div>

      {/* Primary Value Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5 bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 rounded-xl border border-slate-100">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Land Category</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">{valuation.land_category}</div>
          <div className="text-[11px] text-slate-500 mt-1">{valuation.location_reference}</div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Indicative Rate Band</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">
            ₹{valuation.min_rate.toLocaleString('en-IN')} - ₹{valuation.max_rate.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-teal-800 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Market Premium +15%</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Estimated Guideline Value</div>
          <div className="text-base font-black text-blue-950 mt-0.5">
            ₹{(estimatedGuidelineValue / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Range: ₹{(minEstimatedValue / 100000).toFixed(1)}L - ₹{(maxEstimatedValue / 100000).toFixed(1)}L
          </div>
        </div>
      </div>

      {/* Historical Trend or Comparables */}
      {valuation.historical_trends && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setShowTrends(!showTrends)}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1.5 transition"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{showTrends ? 'Hide 4-Year Trend' : 'View 4-Year Guideline Value Trend'}</span>
          </button>

          {showTrends && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {valuation.historical_trends.map((trend, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs font-bold text-slate-700">{trend.year}</div>
                  <div className="text-sm font-extrabold text-slate-900 mt-1 font-mono">
                    ₹{trend.guideline_rate}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Est: ₹{trend.market_estimate}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mandatory Regulatory Disclaimer */}
      <div className="mt-4 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-900 leading-relaxed">
          <span className="font-bold">Prototype Disclaimer:</span> {valuation.disclaimer || 'Valuation references are indicative prototype data and do not represent official property valuation or government stamp duty assessment.'}
        </p>
      </div>
    </div>
  );
};
