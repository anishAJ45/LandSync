import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
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
  ArrowUpRight,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface DashboardCardItem {
  id: string;
  title: string;
  category: 'Citizen' | 'Officer' | 'GIS & Spatial' | 'State Engine' | 'Admin & Security';
  description: string;
  path: string;
  icon: any;
  status: 'Live' | 'Operational' | 'Real-time' | 'DPI Verified';
  statusColor: string;
  roleBadge?: string;
  metrics?: { label: string; value: string }[];
  tags: string[];
  primaryActionLabel: string;
}

export const DashboardsHubPage: React.FC = () => {
  const { user } = useAuth();
  const { activeStateCode } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const dashboardsList: DashboardCardItem[] = [
    // 1. Citizen Portals
    {
      id: 'citizen-dash',
      title: 'Citizen Services Dashboard',
      category: 'Citizen',
      description: 'Unified citizen self-service portal for tracking ownership, viewing Patta/RoR records, and monitoring live mutation request lifecycles.',
      path: '/citizen/dashboard',
      icon: LayoutDashboard,
      status: 'Live',
      statusColor: 'bg-teal-50 text-teal-800 border-teal-200',
      roleBadge: 'Citizen Portal',
      metrics: [
        { label: 'Active Parcels', value: '3 Tracked' },
        { label: 'Verification', value: '100% KYC' }
      ],
      tags: ['ULPIN Search', 'Patta View', 'Application Tracker'],
      primaryActionLabel: 'Open Citizen Dashboard'
    },
    {
      id: 'guided-journey',
      title: '5-Step Guided Citizen Journey',
      category: 'Citizen',
      description: 'Interactive conversational step-by-step wizard guiding citizens from parcel lookup to pre-validation, tenure status, and mutation filing.',
      path: '/citizen/guided-journey',
      icon: Compass,
      status: 'Operational',
      statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      roleBadge: 'Self-Service Wizard',
      metrics: [
        { label: 'Completion Rate', value: '98.4%' },
        { label: 'Avg Time', value: '3.5 mins' }
      ],
      tags: ['Interactive Steps', 'Pre-Check', 'Zero Confusion'],
      primaryActionLabel: 'Launch Guided Wizard'
    },
    {
      id: 'citizen-ai',
      title: 'Citizen Multilingual AI Assistant',
      category: 'Citizen',
      description: 'Zero-cost, browser-native conversational & voice assistant answering queries in English, Hindi, and Tamil with deep-linked navigation.',
      path: '/assistant',
      icon: Sparkles,
      status: 'Real-time',
      statusColor: 'bg-purple-50 text-purple-800 border-purple-200',
      roleBadge: 'AI & Voice Engine',
      metrics: [
        { label: 'Languages', value: 'EN / HI / TA' },
        { label: 'Latency', value: '< 50ms (Zero Cost)' }
      ],
      tags: ['Voice Input', 'Speech Synth', 'Local Knowledge Base'],
      primaryActionLabel: 'Chat with AI Assistant'
    },
    {
      id: 'citizen-docs',
      title: 'Document Center & AI/OCR Verification',
      category: 'Citizen',
      description: 'Client-side OCR and metadata extraction engine cross-verifying Sale Deeds, Encumbrance Certificates (EC), and Revenue records.',
      path: '/citizen/documents',
      icon: FileCheck2,
      status: 'DPI Verified',
      statusColor: 'bg-blue-50 text-blue-800 border-blue-200',
      roleBadge: 'Document Intelligence',
      metrics: [
        { label: 'OCR Accuracy', value: '96.8%' },
        { label: 'Cross-Match', value: 'Automated' }
      ],
      tags: ['Sale Deed OCR', 'Encumbrance Check', 'Fraud Prevention'],
      primaryActionLabel: 'Open Document Center'
    },
    {
      id: 'data-sharing',
      title: 'Consent & Data Sharing Gateway',
      category: 'Citizen',
      description: 'DPDP-compliant digital consent management platform allowing citizens to share verified land records with banks and agro-lenders.',
      path: '/citizen/data-sharing',
      icon: ShieldCheck,
      status: 'DPI Verified',
      statusColor: 'bg-teal-50 text-teal-800 border-teal-200',
      roleBadge: 'DPI & Consent',
      metrics: [
        { label: 'Active Consents', value: '2 Banks' },
        { label: 'Access Log', value: '100% Audited' }
      ],
      tags: ['Time-bound Access', 'Instant Revoke', 'Bank Integration'],
      primaryActionLabel: 'Manage Consents'
    },

    // 2. Officer Operations
    {
      id: 'officer-dash',
      title: 'Land Officer Command Console',
      category: 'Officer',
      description: 'Comprehensive operational console for Talathis, VAOs, and Tahsildars to manage verification queues, conduct field audits, and approve mutations.',
      path: '/officer/dashboard',
      icon: LayoutDashboard,
      status: 'Live',
      statusColor: 'bg-blue-50 text-blue-800 border-blue-200',
      roleBadge: 'Revenue Officer',
      metrics: [
        { label: 'Pending Queue', value: '4 Cases' },
        { label: 'Avg SLA', value: '48h Target' }
      ],
      tags: ['Case Management', 'Field Verification', 'Digital Signature'],
      primaryActionLabel: 'Launch Officer Console'
    },
    {
      id: 'officer-risk',
      title: 'Risk & Anomaly Detection Dashboard',
      category: 'Officer',
      description: 'Automated discrepancy scoring identifying boundary mismatches, multi-party ownership conflicts, and prohibited land flags.',
      path: '/officer/risk-dashboard',
      icon: ShieldAlert,
      status: 'Real-time',
      statusColor: 'bg-rose-50 text-rose-800 border-rose-200',
      roleBadge: 'Risk Detection',
      metrics: [
        { label: 'High Risk Flags', value: '2 Parcels' },
        { label: 'Overlap Detection', value: 'Sub-meter' }
      ],
      tags: ['Anomaly Queue', 'Encroachment Alert', 'Dispute Prevention'],
      primaryActionLabel: 'Inspect Risk Queue'
    },
    {
      id: 'civic-services',
      title: 'Civic & Infrastructure Integration (P9)',
      category: 'Officer',
      description: 'Cross-departmental synchronization linking land parcels with municipal property taxes, electricity utilities, water boards, and building plans.',
      path: '/officer/civic-services',
      icon: Building2,
      status: 'Operational',
      statusColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      roleBadge: 'Urban & Rural Civic',
      metrics: [
        { label: 'Linked Utilities', value: '4 Authorities' },
        { label: 'Tax Sync', value: 'Real-time' }
      ],
      tags: ['EB Meter Bind', 'Water Board', 'Property Tax UID'],
      primaryActionLabel: 'Open Civic Manager'
    },

    // 3. GIS & Spatial
    {
      id: 'gis-cadastre',
      title: 'GIS Cadastral Map & Parcel Explorer',
      category: 'GIS & Spatial',
      description: 'Interactive high-precision cadastral map with vector polygons, satellite imagery, survey layer overlays, and ULPIN parcel search.',
      path: '/gis',
      icon: MapPin,
      status: 'Live',
      statusColor: 'bg-teal-50 text-teal-800 border-teal-200',
      roleBadge: 'Interactive GIS',
      metrics: [
        { label: 'Mapped Parcels', value: '14,280+' },
        { label: 'Map Engine', value: 'Leaflet Vector' }
      ],
      tags: ['Satellite Toggle', 'Cadastral Overlay', 'Parcel 360 Deep-link'],
      primaryActionLabel: 'Explore GIS Map'
    },
    {
      id: 'risk-heatmaps',
      title: 'Land Risk & Encroachment Heatmaps',
      category: 'GIS & Spatial',
      description: 'Spatial heatmaps highlighting waterbody buffer zone violations, forest land proximity, flood hazards, and fraudulent subdivision clusters.',
      path: '/analytics/maps',
      icon: ShieldAlert,
      status: 'Real-time',
      statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
      roleBadge: 'Spatial Analytics',
      metrics: [
        { label: 'Active Layers', value: '5 Layers' },
        { label: 'Buffer Engine', value: '50m-200m Zones' }
      ],
      tags: ['Buffer Zones', 'Encroachment Grid', 'Fraud Ring Graph'],
      primaryActionLabel: 'View Risk Heatmaps'
    },
    {
      id: 'land-dna',
      title: 'Land DNA & Digital Twin Profile',
      category: 'GIS & Spatial',
      description: 'Holistic 0–100 Land Health Score indexing geometric fidelity, legal title clarity, civic clearances, tax compliance, and environmental encumbrances.',
      path: '/admin/land-intelligence',
      icon: Dna,
      status: 'Operational',
      statusColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      roleBadge: 'Digital Twin',
      metrics: [
        { label: 'Avg Health Score', value: '88 / 100' },
        { label: '6 Dimensions', value: 'Indexed' }
      ],
      tags: ['Geometric Trust', 'Title Index', 'Genealogy Graph'],
      primaryActionLabel: 'Inspect Land DNA'
    },
    {
      id: 'open-data',
      title: 'Open Data & Satellite Layer Catalog',
      category: 'GIS & Spatial',
      description: 'Public geospatial catalog publishing Sentinel-2 multispectral layers, Bhuvan ISRO WMS services, and OpenStreetMap cadastral basemaps.',
      path: '/gis/open-data',
      icon: Layers,
      status: 'Operational',
      statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      roleBadge: 'Open Geospatial',
      metrics: [
        { label: 'Catalogs', value: 'ISRO + Sentinel' },
        { label: 'Resolution', value: '10m Multi-spectral' }
      ],
      tags: ['Bhuvan WMS', 'Sentinel Indices', 'NDVI Vegetation'],
      primaryActionLabel: 'Browse Layer Catalog'
    },

    // 4. State Engine
    {
      id: 'state-config',
      title: 'State Configuration Engine (Phase 10)',
      category: 'State Engine',
      description: 'Multi-state adaptation engine supporting diverse land tenure frameworks across Tamil Nadu (Patta/Chitta), Karnataka (Bhoomi), Maharashtra (7/12), UP, and more.',
      path: '/admin/state-configuration',
      icon: Landmark,
      status: 'Live',
      statusColor: 'bg-teal-50 text-teal-800 border-teal-200',
      roleBadge: 'National Engine',
      metrics: [
        { label: 'Active State', value: `${activeStateCode} Configured` },
        { label: 'States Supported', value: '7 Major States' }
      ],
      tags: ['Local Terminology', 'Custom Units', 'Subdivision Rules'],
      primaryActionLabel: 'Configure State Engine'
    },
    {
      id: 'state-matrix',
      title: 'State Matrix Comparison & Readiness',
      category: 'State Engine',
      description: 'Side-by-side comparative matrix benchmarking state digitisation readiness, survey unit conversions (Cent, Guntha, Bigha, Acre), and legal schemas.',
      path: '/admin/state-comparison',
      icon: Table,
      status: 'Operational',
      statusColor: 'bg-blue-50 text-blue-800 border-blue-200',
      roleBadge: 'Benchmarking Hub',
      metrics: [
        { label: 'Readiness Index', value: '88% National Avg' },
        { label: 'Unit Mapper', value: 'Multi-metric' }
      ],
      tags: ['Cross-State Matrix', 'Readiness Score', 'Unit Converter'],
      primaryActionLabel: 'View State Matrix'
    },
    {
      id: 'state-onboarding',
      title: 'State Onboarding Sandbox & Schema Mapper',
      category: 'State Engine',
      description: 'Self-service migration and schema mapping workbench allowing state land revenue departments to onboard legacy formats to LandSync DPI.',
      path: '/admin/state-onboarding',
      icon: Landmark,
      status: 'Operational',
      statusColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      roleBadge: 'Migration Sandbox',
      metrics: [
        { label: 'Schema Validator', value: 'Real-time JSON' },
        { label: 'Mapping Confidence', value: '99.2%' }
      ],
      tags: ['Schema Transformation', 'Validation Sandbox', 'Export Template'],
      primaryActionLabel: 'Open Onboarding Sandbox'
    },
    {
      id: 'dept-integrations',
      title: 'Department Integrations & DPI Connectors',
      category: 'State Engine',
      description: 'Interoperability middleware linking Registration (SRO), Revenue (Tahsil), Survey (FMB), High Court Land Registry, and Commercial Banks.',
      path: '/admin/integrations',
      icon: Server,
      status: 'DPI Verified',
      statusColor: 'bg-teal-50 text-teal-800 border-teal-200',
      roleBadge: 'API Gateway',
      metrics: [
        { label: 'Active APIs', value: '6 Microservices' },
        { label: 'Sync Health', value: '99.98% Uptime' }
      ],
      tags: ['SRO Connector', 'Revenue Sync', 'Court Registry API'],
      primaryActionLabel: 'Manage DPI Connectors'
    },

    // 5. Admin & Governance
    {
      id: 'admin-hub',
      title: 'System Diagnostic Hub & Telemetry',
      category: 'Admin & Security',
      description: 'Real-time platform telemetry monitoring container latency, worker threads, database connection pools, memory pressure, and background sync queues.',
      path: '/admin/system-hub',
      icon: Server,
      status: 'Real-time',
      statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      roleBadge: 'Platform Operations',
      metrics: [
        { label: 'System Health', value: '100% Healthy' },
        { label: 'P99 Latency', value: '12ms' }
      ],
      tags: ['Worker Threads', 'Live Logs', 'Queue Trigger'],
      primaryActionLabel: 'Inspect System Hub'
    },
    {
      id: 'admin-users',
      title: 'User & Role Access Management (RBAC)',
      category: 'Admin & Security',
      description: 'Granular role-based access control matrix with hierarchical state, district, and taluk jurisdictional assignment for revenue staff and citizens.',
      path: '/admin/users-roles',
      icon: Users,
      status: 'Operational',
      statusColor: 'bg-blue-50 text-blue-800 border-blue-200',
      roleBadge: 'RBAC Security',
      metrics: [
        { label: 'Total Users', value: '18 Active' },
        { label: 'Role Types', value: '5 Granular Tiers' }
      ],
      tags: ['Jurisdiction Filter', 'Permission Matrix', 'MFA Status'],
      primaryActionLabel: 'Manage User Roles'
    },
    {
      id: 'data-quality',
      title: 'Data Quality & Cadastral Scorer',
      category: 'Admin & Security',
      description: 'Automated data audit suite identifying orphaned survey polygons, missing owner Aadhaar hashes, spelling discrepancies, and boundary gaps.',
      path: '/admin/data-quality',
      icon: Sparkles,
      status: 'Operational',
      statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
      roleBadge: 'Data Cleansing',
      metrics: [
        { label: 'Quality Score', value: '94.2 / 100' },
        { label: 'Issues Found', value: '3 Auto-Fixable' }
      ],
      tags: ['Cadastral Audit', 'Missing Attributes', 'Batch Auto-Fix'],
      primaryActionLabel: 'Audit Data Quality'
    },
    {
      id: 'security-compliance',
      title: 'Security & Compliance Matrix',
      category: 'Admin & Security',
      description: 'Enterprise governance console managing DPDP Act compliance, cryptographic access tokens, automatic snapshots, and disaster recovery replication.',
      path: '/admin/security',
      icon: ShieldCheck,
      status: 'DPI Verified',
      statusColor: 'bg-teal-50 text-teal-800 border-teal-200',
      roleBadge: 'DPDP Compliance',
      metrics: [
        { label: 'Compliance Index', value: '98.5% Pass' },
        { label: 'Backup State', value: 'Daily Snapshot Active' }
      ],
      tags: ['DPDP Audit', 'Instant Backup', 'Retention Policies'],
      primaryActionLabel: 'View Security Matrix'
    },
    {
      id: 'audit-ledger',
      title: 'Immutable Audit Ledger & Hash Check',
      category: 'Admin & Security',
      description: 'Cryptographically hashed event ledger recording every mutation, title transfer, consent approval, and GIS coordinate edit with SHA-256 integrity proofs.',
      path: '/admin/audit-logs',
      icon: Activity,
      status: 'DPI Verified',
      statusColor: 'bg-purple-50 text-purple-800 border-purple-200',
      roleBadge: 'Immutable Ledger',
      metrics: [
        { label: 'Ledger Records', value: '25,000+ Events' },
        { label: 'Hash Proof', value: 'SHA-256 Validated' }
      ],
      tags: ['Cryptographic Audit', 'Actor Tracking', 'Export CSV/JSON'],
      primaryActionLabel: 'Explore Audit Ledger'
    }
  ];

  const categories = ['All', 'Citizen', 'Officer', 'GIS & Spatial', 'State Engine', 'Admin & Security'];

  const filteredDashboards = dashboardsList.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Globe className="w-80 h-80 text-teal-300" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              National Land Governance Platform • SIH26014
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              State Engine: {activeStateCode} Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Unified Dashboards & Intelligence Directory
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Centralized access hub to all specialized dashboards, citizen self-service wizards, revenue officer consoles, cadastral GIS explorers, and national governance registries.
          </p>

          {/* Quick Search in Banner */}
          <div className="pt-2 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across all 18 dashboards, modules, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-400 focus:bg-white/15 transition"
              />
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition shrink-0"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs & Quick Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-950 text-teal-300 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat === 'All' ? `All Dashboards (${dashboardsList.length})` : cat}
            </button>
          ))}
        </div>

        <div className="text-xs font-bold text-slate-500 shrink-0">
          Showing <span className="text-slate-900 font-extrabold">{filteredDashboards.length}</span> of {dashboardsList.length} Hubs
        </div>
      </div>

      {/* Main Dashboards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDashboards.map((dash) => {
          const Icon = dash.icon;
          return (
            <div
              key={dash.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 text-teal-300 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {dash.roleBadge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {dash.roleBadge}
                      </span>
                    )}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${dash.statusColor}`}>
                      {dash.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-950 transition-colors flex items-center gap-1">
                    {dash.title}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {dash.description}
                  </p>
                </div>

                {/* Metrics Preview */}
                {dash.metrics && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    {dash.metrics.map((m, i) => (
                      <div key={i} className="bg-slate-50 rounded-lg p-2">
                        <div className="text-[10px] font-semibold text-slate-500 truncate">{m.label}</div>
                        <div className="text-xs font-bold text-slate-900 truncate">{m.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {dash.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  {dash.category}
                </span>
                <Link
                  to={dash.path}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 group-hover:translate-x-0.5 transition-all"
                >
                  <span>{dash.primaryActionLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Launch & Help Section */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
            <Sparkles className="w-4 h-4" />
            Looking for something specific?
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Use the Interactive AI Voice Assistant or Quick Command Palette
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Ctrl+K</kbd> anywhere in the application to instantly jump to any survey number, deed verification, or administrative report.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/assistant')}
            className="px-4 py-2.5 rounded-xl bg-blue-950 hover:bg-slate-800 text-teal-300 text-xs font-bold flex items-center gap-2 shadow-xs transition"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Open Citizen AI</span>
          </button>
          <button
            onClick={() => navigate('/gis')}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 transition"
          >
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>Launch GIS Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
