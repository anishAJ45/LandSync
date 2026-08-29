import React, { useEffect, useState } from 'react';
import { civicService } from '../../services/civicService';
import {
  CivicParcel360Overview,
  PropertyTaxRecord
} from '../../types';
import { PropertyTaxCard } from './PropertyTaxCard';
import { LandValuationCard } from './LandValuationCard';
import { UtilityStatusPanel } from './UtilityStatusPanel';
import { DrainageSewerageCard } from './DrainageSewerageCard';
import { RoadAccessCard } from './RoadAccessCard';
import { InfrastructureProjectPanel } from './InfrastructureProjectPanel';
import { DigitalConnectivityCard } from './DigitalConnectivityCard';
import { CivicServiceScoreCard } from './CivicServiceScoreCard';
import { CivicInsightsCard } from './CivicInsightsCard';
import { CivicServiceRequestModal } from './CivicServiceRequestModal';
import {
  Building2,
  RefreshCw,
  PlusCircle,
  Layers,
  Sparkles,
  Award,
  AlertCircle
} from 'lucide-react';

interface CivicIntegrationDashboardProps {
  parcelId: string;
  ulpin: string;
  recordedAreaSqft?: number;
}

export const CivicIntegrationDashboard: React.FC<CivicIntegrationDashboardProps> = ({
  parcelId,
  ulpin,
  recordedAreaSqft = 43560
}) => {
  const [bundle, setBundle] = useState<CivicParcel360Overview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState<boolean>(false);
  const [defaultRequestType, setDefaultRequestType] = useState<string>('WATER_CONNECTION');

  const fetchBundle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await civicService.getParcelCivicOverview(parcelId);
      setBundle(data);
    } catch (err: any) {
      console.error('Failed to load civic bundle:', err);
      setError(err?.message || 'Could not fetch civic infrastructure data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parcelId) {
      fetchBundle();
    }
  }, [parcelId]);

  const handlePaymentSuccess = (updatedTax: PropertyTaxRecord) => {
    if (bundle) {
      setBundle({
        ...bundle,
        property_tax: updatedTax
      });
      // Refresh score after payment
      fetchBundle();
    }
  };

  const handleOpenRequest = (serviceType: string = 'WATER_CONNECTION') => {
    setDefaultRequestType(serviceType);
    setRequestModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-800 mb-3" />
        <p className="font-bold text-slate-800 text-sm">Aggregating Civic, Fiscal & Infrastructure Data...</p>
        <p className="text-xs text-slate-400 mt-1 font-mono">Querying Municipal Tax, TANGEDCO, TWAD & GIS Road Alignments</p>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
        <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
        <h4 className="font-bold text-slate-900 text-base">Civic Data Unavailable</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          {error || 'Unable to retrieve unified civic records for this parcel.'}
        </p>
        <button
          onClick={fetchBundle}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Aggregation</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-teal-500/30 text-teal-200 font-bold text-[10px] uppercase tracking-wider border border-teal-400/30">
              Phase 9 Engine
            </span>
            <h2 className="text-xl font-black tracking-tight">Civic, Fiscal & Infrastructure Suite</h2>
          </div>
          <p className="text-xs text-teal-100/80 mt-1">
            Parcel-linked municipal taxation, guideline valuation, utilities, road setbacks & infrastructure projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenRequest('WATER_CONNECTION')}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for Civic Service</span>
          </button>
          <button
            onClick={fetchBundle}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition"
            title="Refresh Civic Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Civic Readiness Score (Composite Index) */}
      {bundle.civic_score && <CivicServiceScoreCard scoreData={bundle.civic_score} />}

      {/* 2. Cross-Layer Intelligence Insights */}
      {bundle.civic_insights && bundle.civic_insights.length > 0 && (
        <CivicInsightsCard insights={bundle.civic_insights} />
      )}

      {/* 3. Fiscal Grid: Property Tax + Land Valuation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PropertyTaxCard
          taxRecord={bundle.property_tax}
          parcelId={parcelId}
          onPaymentSuccess={handlePaymentSuccess}
        />
        <LandValuationCard
          valuation={bundle.valuation}
          recordedAreaSqft={recordedAreaSqft}
        />
      </div>

      {/* 4. Physical Infrastructure: Road Access & Setbacks */}
      <RoadAccessCard
        roadRecord={bundle.road_access}
        analysis={bundle.road_analysis}
      />

      {/* 5. Core Utilities: Water & Electricity */}
      <UtilityStatusPanel
        water={bundle.water}
        electricity={bundle.electricity}
        onRequestUtility={(type) => handleOpenRequest(type)}
      />

      {/* 6. Sanitation & Drainage */}
      <DrainageSewerageCard
        drainage={bundle.drainage}
        sewerage={bundle.sewerage}
      />

      {/* 7. Capital Projects & Corridor Impact */}
      <InfrastructureProjectPanel
        projects={bundle.nearby_projects || []}
        impactAssessment={bundle.project_impact}
      />

      {/* 8. Digital / Telecom Infrastructure */}
      <DigitalConnectivityCard telecom={bundle.digital} />

      {/* Service Request Modal */}
      <CivicServiceRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        parcelId={parcelId}
        ulpin={ulpin}
        defaultServiceType={defaultRequestType}
        onSuccess={() => fetchBundle()}
      />
    </div>
  );
};
