import React, { useState, useEffect } from 'react';
import { stateConfigService } from '../services/stateConfigService';
import {
  StateProfile,
  StateFieldMapping,
  UnitConfiguration,
  LandTerminology,
  StateWorkflowConfiguration,
  StateDocumentRequirement,
  AdministrativeHierarchy,
  StateConnectorConfiguration,
  StateReadinessReport,
  GovernanceContextType
} from '../types';
import { StateSelector } from '../components/state/StateSelector';
import { StateProfileCard } from '../components/state/StateProfileCard';
import { FieldMappingTable } from '../components/state/FieldMappingTable';
import { UnitConversionPanel } from '../components/state/UnitConversionPanel';
import { TerminologyExplorer } from '../components/state/TerminologyExplorer';
import { WorkflowConfigurator } from '../components/state/WorkflowConfigurator';
import { DocumentChecklistConfigurator } from '../components/state/DocumentChecklistConfigurator';
import { AdministrativeHierarchyViewer } from '../components/state/AdministrativeHierarchyViewer';
import { StateConnectorPanel } from '../components/state/StateConnectorPanel';
import { StateReadinessScore } from '../components/state/StateReadinessScore';
import { StateRecordNormalizerModal } from '../components/state/StateRecordNormalizerModal';
import { StateOnboardingWizard } from '../components/state/StateOnboardingWizard';
import { RuralUrbanContextToggle } from '../components/state/RuralUrbanContextToggle';
import { LanguageSelector } from '../components/state/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import {
  Landmark,
  Layers,
  Scale,
  BookOpen,
  GitFork,
  FileText,
  Network,
  Radio,
  Gauge,
  Sparkles,
  Plus,
  ArrowRightLeft,
  CheckCircle2
} from 'lucide-react';

export const StateConfigurationPage: React.FC = () => {
  const { activeStateCode, setActiveStateCode, governanceContext, setGovernanceContext, t } = useLanguage();

  const [states, setStates] = useState<StateProfile[]>([]);
  const [selectedState, setSelectedState] = useState<StateProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('profile');

  // Sub-data for active state
  const [mappings, setMappings] = useState<StateFieldMapping[]>([]);
  const [units, setUnits] = useState<UnitConfiguration[]>([]);
  const [terminology, setTerminology] = useState<LandTerminology[]>([]);
  const [workflows, setWorkflows] = useState<StateWorkflowConfiguration[]>([]);
  const [documents, setDocuments] = useState<StateDocumentRequirement[]>([]);
  const [hierarchy, setHierarchy] = useState<AdministrativeHierarchy | null>(null);
  const [connectors, setConnectors] = useState<StateConnectorConfiguration[]>([]);
  const [readiness, setReadiness] = useState<StateReadinessReport | null>(null);

  // Modals / Wizards
  const [isNormalizerOpen, setIsNormalizerOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load all states on mount
  useEffect(() => {
    async function loadStates() {
      const stateList = await stateConfigService.getStateProfiles();
      setStates(stateList);
      const found = stateList.find((s) => s.state_code === activeStateCode) || stateList[0];
      setSelectedState(found);
    }
    loadStates();
  }, [activeStateCode]);

  // Load detailed state data when active state or context changes
  useEffect(() => {
    if (!activeStateCode) return;
    async function loadStateDetails() {
      setLoading(true);
      try {
        const [
          profileData,
          mappingsData,
          unitsData,
          termsData,
          workflowsData,
          docsData,
          hierarchyData,
          connectorsData,
          readinessData
        ] = await Promise.all([
          stateConfigService.getStateProfile(activeStateCode),
          stateConfigService.getStateMappings(activeStateCode),
          stateConfigService.getStateUnits(activeStateCode),
          stateConfigService.getStateTerminology(activeStateCode),
          stateConfigService.getStateWorkflows(activeStateCode),
          stateConfigService.getStateDocuments(activeStateCode),
          stateConfigService.getStateHierarchy(activeStateCode, governanceContext),
          stateConfigService.getStateConnectors(activeStateCode),
          stateConfigService.getStateReadiness(activeStateCode)
        ]);

        setSelectedState(profileData);
        setMappings(mappingsData);
        setUnits(unitsData);
        setTerminology(termsData);
        setWorkflows(workflowsData);
        setDocuments(docsData);
        setHierarchy(hierarchyData);
        setConnectors(connectorsData);
        setReadiness(readinessData);
      } catch (err) {
        console.error('Error loading state details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStateDetails();
  }, [activeStateCode, governanceContext]);

  const handleStateChange = (stateCode: string) => {
    setActiveStateCode(stateCode);
  };

  const handleOnboardComplete = async (newProfile: Partial<StateProfile>) => {
    try {
      const res = await stateConfigService.onboardNewState(newProfile);
      setIsOnboardingOpen(false);
      const updatedList = await stateConfigService.getStateProfiles();
      setStates(updatedList);
      setActiveStateCode(newProfile.state_code || 'TN');
      alert(`State ${newProfile.state_name} (${newProfile.state_code}) successfully onboarded to LandSync!`);
    } catch (err) {
      alert('Onboarding failed: ' + err);
    }
  };

  const tabs = [
    { id: 'profile', label: 'State Profile', icon: Landmark, count: null },
    { id: 'mappings', label: 'Field Mappings', icon: Layers, count: mappings.length },
    { id: 'units', label: 'Unit Engine', icon: Scale, count: units.length },
    { id: 'terminology', label: 'Terminology', icon: BookOpen, count: terminology.length },
    { id: 'workflows', label: 'Workflows', icon: GitFork, count: workflows.length },
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { id: 'hierarchy', label: 'Hierarchy', icon: Network, count: null },
    { id: 'connectors', label: 'API Connectors', icon: Radio, count: connectors.length },
    { id: 'readiness', label: 'Readiness & Audit', icon: Gauge, count: readiness ? `${readiness.overall_score}%` : null }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 text-white border-b border-teal-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  National Scalability Engine • Phase 10
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Zero Code State Adaptability
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-3">
                State Configuration & Governance Engine
              </h1>
              <p className="text-sm text-teal-200/80 mt-1 max-w-3xl">
                Dynamic pan-India land administration configuration: adapt local revenue terminology, unit converters, workflow approvals, and SRO connectors without rewriting core platform code.
              </p>
            </div>

            {/* Quick Actions & Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <RuralUrbanContextToggle />
              <LanguageSelector />

              <button
                type="button"
                onClick={() => setIsNormalizerOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-black transition shadow-sm"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Test Data Normalizer</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New State</span>
              </button>
            </div>
          </div>

          {/* State Switcher Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <StateSelector
              states={states}
              selectedStateCode={activeStateCode}
              onSelectState={handleStateChange}
            />

            <div className="text-xs text-teal-300 flex items-center gap-2">
              <span>National Land Data Model:</span>
              <strong className="text-white">v3.2 Cadastral Core Compatible</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto pb-2 scrollbar-thin gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-200' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                      isActive ? 'bg-teal-900 text-teal-100' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="mt-6">
          {selectedState && activeTab === 'profile' && (
            <div className="space-y-6">
              <StateProfileCard profile={selectedState} />
              {readiness && <StateReadinessScore report={readiness} />}
            </div>
          )}

          {activeTab === 'mappings' && (
            <FieldMappingTable
              mappings={mappings}
              stateCode={activeStateCode}
            />
          )}

          {activeTab === 'units' && (
            <UnitConversionPanel
              units={units}
              stateCode={activeStateCode}
            />
          )}

          {activeTab === 'terminology' && (
            <TerminologyExplorer
              terms={terminology}
              stateCode={activeStateCode}
            />
          )}

          {activeTab === 'workflows' && (
            <WorkflowConfigurator
              workflows={workflows}
              stateCode={activeStateCode}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentChecklistConfigurator
              documents={documents}
              stateCode={activeStateCode}
            />
          )}

          {activeTab === 'hierarchy' && (
            <AdministrativeHierarchyViewer
              hierarchy={hierarchy}
              stateCode={activeStateCode}
              contextType={governanceContext}
              onChangeContext={setGovernanceContext}
            />
          )}

          {activeTab === 'connectors' && (
            <StateConnectorPanel
              connectors={connectors}
              stateCode={activeStateCode}
            />
          )}

          {activeTab === 'readiness' && readiness && (
            <div className="space-y-6">
              <StateReadinessScore report={readiness} />
            </div>
          )}
        </div>
      </div>

      {/* Normalizer Modal */}
      <StateRecordNormalizerModal
        stateCode={activeStateCode}
        isOpen={isNormalizerOpen}
        onClose={() => setIsNormalizerOpen(false)}
      />

      {/* Onboarding Wizard Modal */}
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <StateOnboardingWizard
            onComplete={handleOnboardComplete}
            onCancel={() => setIsOnboardingOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
