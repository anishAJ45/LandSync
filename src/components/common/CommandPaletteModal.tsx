import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  MapPin,
  Sparkles,
  Compass,
  FileCheck2,
  ShieldCheck,
  Server,
  Users,
  Activity,
  ShieldAlert,
  Layers,
  Landmark,
  Table,
  Building2,
  Dna,
  X,
  ArrowRight,
  Send,
  FileText
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavCommand {
  title: string;
  category: string;
  path: string;
  icon: any;
  keywords: string[];
  role?: string;
}

const COMMANDS: NavCommand[] = [
  // Dashboards
  { title: 'Dashboards Hub (Directory)', category: 'Dashboards', path: '/dashboards', icon: LayoutDashboard, keywords: ['all', 'overview', 'index', 'directory'] },
  { title: 'Citizen Services Dashboard', category: 'Dashboards', path: '/citizen/dashboard', icon: LayoutDashboard, keywords: ['citizen', 'records', 'patta', 'my land'], role: 'citizen' },
  { title: 'Officer Command Console', category: 'Dashboards', path: '/officer/dashboard', icon: LayoutDashboard, keywords: ['officer', 'verification', 'queue', 'patwari'], role: 'officer' },
  { title: 'Admin Governance Hub', category: 'Dashboards', path: '/admin/dashboard', icon: LayoutDashboard, keywords: ['admin', 'system', 'metrics'], role: 'admin' },
  
  // Geospatial & GIS
  { title: 'GIS Cadastral Map Explorer', category: 'GIS & Spatial', path: '/gis', icon: MapPin, keywords: ['gis', 'map', 'cadastre', 'survey', 'satellite', 'ulpin'] },
  { title: 'Land Risk & Heat Maps', category: 'GIS & Spatial', path: '/analytics/maps', icon: ShieldAlert, keywords: ['risk', 'heatmap', 'encroachment', 'hazard', 'buffer'] },
  { title: 'Open Data & Satellite Layers', category: 'GIS & Spatial', path: '/gis/open-data', icon: Layers, keywords: ['satellite', 'sentinel', 'bhuvan', 'open data', 'wms'] },
  { title: 'Spatial Analytics (P8)', category: 'GIS & Spatial', path: '/officer/spatial-analytics', icon: Compass, keywords: ['spatial', 'buffer', 'density', 'infrastructure'] },
  { title: 'Sample Parcel 360° View (124/1)', category: 'GIS & Spatial', path: '/parcel/TN-CBE-001-124-1', icon: MapPin, keywords: ['parcel 360', '124/1', 'demo', 'cbe'] },

  // Citizen Tools
  { title: 'Citizen AI Multilingual Assistant', category: 'Citizen Tools', path: '/assistant', icon: Sparkles, keywords: ['ai', 'voice', 'chatbot', 'help', 'hindi', 'tamil'] },
  { title: 'Guided Journey 5-Step Wizard', category: 'Citizen Tools', path: '/citizen/guided-journey', icon: Compass, keywords: ['wizard', 'guide', 'steps', 'mutation help', 'apply'] },
  { title: 'Land Record Status Check', category: 'Citizen Tools', path: '/citizen/status', icon: ShieldCheck, keywords: ['status', 'verify', 'title', 'patta'] },
  { title: 'Document Center (OCR Verification)', category: 'Citizen Tools', path: '/citizen/documents', icon: FileCheck2, keywords: ['ocr', 'document', 'deed', 'upload', 'verify'] },
  { title: 'Data Sharing & Consent Manager', category: 'Citizen Tools', path: '/citizen/data-sharing', icon: ShieldCheck, keywords: ['consent', 'bank', 'share', 'loan', 'dpi'] },
  { title: 'Submit New Request / Mutation', category: 'Citizen Tools', path: '/citizen/create-request', icon: FileText, keywords: ['mutation', 'apply', 'request', 'transfer'] },
  { title: 'My Applications Tracker', category: 'Citizen Tools', path: '/citizen/applications', icon: Send, keywords: ['track', 'applications', 'status', 'progress'] },

  // Officer Operations
  { title: 'Officer Verification Queue', category: 'Officer Operations', path: '/officer/queue', icon: Activity, keywords: ['queue', 'pending', 'cases', 'review'] },
  { title: 'Anomaly & Fraud Review', category: 'Officer Operations', path: '/officer/anomalies', icon: ShieldAlert, keywords: ['anomaly', 'fraud', 'overlap', 'risk'] },
  { title: 'Land DNA Intelligence Profile', category: 'Officer Operations', path: '/officer/land-dna', icon: Dna, keywords: ['dna', 'twin', 'health score', 'trust'] },
  { title: 'Civic & Infrastructure Integration (P9)', category: 'Officer Operations', path: '/officer/civic-services', icon: Building2, keywords: ['civic', 'tax', 'electricity', 'water', 'property'] },

  // State Engine & Administration
  { title: 'State Configuration Engine (P10)', category: 'State Engine', path: '/admin/state-configuration', icon: Landmark, keywords: ['state', 'tenure', 'tamil nadu', 'karnataka', 'maharashtra'] },
  { title: 'State Matrix Comparison & Readiness', category: 'State Engine', path: '/admin/state-comparison', icon: Table, keywords: ['matrix', 'comparison', 'readiness', 'scoring'] },
  { title: 'State Onboarding Sandbox', category: 'State Engine', path: '/admin/state-onboarding', icon: Landmark, keywords: ['onboarding', 'sandbox', 'schema', 'migrate'] },
  { title: 'Department Integrations (DPI)', category: 'State Engine', path: '/admin/integrations', icon: Server, keywords: ['dpi', 'api', 'interoperability', 'connectors'] },
  { title: 'System Diagnostics & Health Hub', category: 'Governance & Admin', path: '/admin/system-hub', icon: Server, keywords: ['system', 'health', 'telemetry', 'diagnostics', 'jobs'] },
  { title: 'User & Role Access Management', category: 'Governance & Admin', path: '/admin/users-roles', icon: Users, keywords: ['rbac', 'users', 'roles', 'permissions'] },
  { title: 'System Configuration & Feature Flags', category: 'Governance & Admin', path: '/admin/configuration', icon: Activity, keywords: ['config', 'flags', 'parameters', 'sla'] },
  { title: 'Data Quality & Cadastral Scorer', category: 'Governance & Admin', path: '/admin/data-quality', icon: Sparkles, keywords: ['quality', 'geometry', 'completeness', 'missing'] },
  { title: 'Security & Compliance Matrix', category: 'Governance & Admin', path: '/admin/security', icon: ShieldCheck, keywords: ['security', 'dpdp', 'compliance', 'backup'] },
  { title: 'Immutable Audit Ledger & Hash Check', category: 'Governance & Admin', path: '/admin/audit-logs', icon: Activity, keywords: ['audit', 'logs', 'sha256', 'immutable', 'trail'] },
];

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCommands = COMMANDS.filter((cmd) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleSelect = (cmd: NavCommand) => {
    navigate(cmd.path);
    onClose();
  };

  return (
    <div
      id="command-palette-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
    >
      <div
        id="command-palette-dialog"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[75vh]"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-teal-600 shrink-0" />
          <input
            id="command-palette-input"
            type="text"
            autoFocus
            placeholder="Jump to any dashboard, page, GIS map, or feature (e.g. 'Risk', 'Citizen', 'State', '124/1')..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-hidden focus:ring-0"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-slate-200/80 rounded border border-slate-300">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Categories Bar */}
        <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px] font-semibold text-slate-600">
          <span className="text-slate-400">Quick Filter:</span>
          {['Dashboards', 'GIS & Spatial', 'Citizen Tools', 'Officer Operations', 'State Engine', 'Governance & Admin'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSearch(cat)}
                className={`px-2.5 py-1 rounded-md transition shrink-0 ${
                  search === cat
                    ? 'bg-blue-950 text-teal-300 font-bold'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No matching pages or dashboards found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for "Dashboard", "GIS", "Patta", "Risk", or "State"</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.path + cmd.title}
                  onClick={() => handleSelect(cmd)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition ${
                    idx === selectedIndex
                      ? 'bg-teal-50 border border-teal-200 text-blue-950'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-950 text-teal-300 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-2">
                        {cmd.title}
                        {cmd.role && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 capitalize">
                            {cmd.role}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{cmd.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-teal-700 text-xs font-bold shrink-0">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>Navigation Shortcut:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">K</kbd>
          </div>
          <span className="font-semibold text-teal-700">{filteredCommands.length} shortcuts available</span>
        </div>
      </div>
    </div>
  );
};
