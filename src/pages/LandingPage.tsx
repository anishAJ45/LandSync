import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  Layers,
  FileCheck,
  Activity,
  Users,
  Search,
  Database,
  Lock,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user, getDefaultDashboardRoute } = useAuth();
  const navigate = useNavigate();

  return (
    <div id="landing-page-root" className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Top Navigation Bar */}
      <nav id="landing-nav" className="h-20 border-b border-slate-200 bg-white/95 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center text-teal-400 font-bold shadow-xs">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-blue-950 tracking-tight">LandSync</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900">
                SIH26014
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <button
                id="landing-goto-dashboard-btn"
                onClick={() => navigate(getDefaultDashboardRoute(user.role))}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-950 text-white font-semibold text-sm hover:bg-blue-900 transition shadow-xs"
              >
                Go to {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
                <ArrowRight className="w-4 h-4 text-teal-300" />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  id="landing-login-nav-btn"
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-950 transition"
                >
                  Sign In
                </Link>
                <Link
                  id="landing-explore-nav-btn"
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-950 text-white font-semibold text-sm hover:bg-blue-900 transition shadow-xs"
                >
                  Explore Platform
                  <ArrowRight className="w-4 h-4 text-teal-400" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="landing-hero" className="relative py-20 lg:py-28 bg-slate-50/80 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-950 text-xs font-bold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Smart India Hackathon 2026 • Problem Statement SIH26014
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-950 tracking-tight leading-tight">
              AI-Powered Integrated Land Intelligence Platform
            </h1>

            <p className="text-xl sm:text-2xl font-medium text-teal-800 tracking-normal">
              "One Parcel. One Connected View. Complete Trust."
            </p>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              A unified digital public infrastructure bridging land revenue, registration, survey GIS records, and judicial registries into a single parcel-centric source of truth.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                id="hero-gis-btn"
                to="/gis"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-950 text-white font-bold text-base hover:bg-blue-900 transition shadow-md"
              >
                <MapPin className="w-5 h-5 text-teal-400" />
                Launch GIS Cadastral Explorer
                <ArrowRight className="w-5 h-5 text-teal-400" />
              </Link>
              <Link
                id="hero-explore-btn"
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-base hover:bg-slate-50 transition shadow-xs"
              >
                Access Role Portals (Citizen / Officer / Admin)
              </Link>
            </div>

            {/* Quick Demo Credentials Banner */}
            <div className="pt-6">
              <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-600">
                <span className="font-semibold text-blue-950">Pre-seeded Phase 1 Demo Accounts:</span>
                <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono">citizen@landsync.demo</span>
                <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono">officer@landsync.demo</span>
                <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono">admin@landsync.demo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Problem Overview */}
      <section id="problem-overview" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold text-teal-700 tracking-wider uppercase">Problem Statement SIH26014</span>
            <h2 className="text-3xl font-extrabold text-blue-950 mt-1">
              The Challenge of Fragmented Land Governance
            </h2>
            <p className="text-slate-600 mt-3 text-base leading-relaxed">
              India's land administration currently operates across isolated silos: Revenue Departments, Sub-Registrar Offices (IGRS), Survey & Settlement maps, and Court Registries. This fragmentation leads to overlapping claims, fraudulent deeds, delayed title mutations, and protracted litigation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h3 className="font-bold text-lg text-slate-900">Siloed Databases</h3>
              <p className="text-sm text-slate-600 mt-2">
                Sale deeds are registered without instant cross-validation against live cadastral survey maps or pending revenue dispute records.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h3 className="font-bold text-lg text-slate-900">Title & Boundary Disputes</h3>
              <p className="text-sm text-slate-600 mt-2">
                Citizens and buyers lack a single parcel-centric view to verify encumbrance, historical lineage, and spatial overlaps before transacting.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-950 flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h3 className="font-bold text-lg text-slate-900">Slow Administrative Mutating</h3>
              <p className="text-sm text-slate-600 mt-2">
                Officers spend weeks manually cross-referencing paper archives and multiple disjointed state portals to clear single mutation cases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How LandSync Works */}
      <section id="how-landsync-works" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal-700 tracking-wider uppercase">Architecture & Workflow</span>
            <h2 className="text-3xl font-extrabold text-blue-950 mt-1">
              How LandSync Unifies Land Records
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              A four-step digital public infrastructure workflow connecting all stakeholders seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-teal-400 flex items-center justify-center mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-blue-950">1. Data Ingestion</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Interoperable API connector pulls records from Revenue, Registration (IGRS), Cadastral Survey, and e-Courts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-teal-800">
                Multi-Department Sync
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-teal-400 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-blue-950">2. Parcel 360 Linking</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Every land parcel is assigned an immutable Unique Land Parcel Identification Number (ULPIN) acting as its digital identity.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-teal-800">
                Single Source of Truth
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-teal-400 flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-blue-950">3. Verification Engine</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Cross-record verification flags anomalies, boundary overlaps, encumbrances, and litigation risk before officer approval.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-teal-800">
                Risk & Anomaly Auditing
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-teal-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-blue-950">4. Transparent Delivery</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Citizens access verified titles instantly, officers process mutation queues digitally, and admins audit system integrity.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-teal-800">
                Complete Citizen Trust
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Key Features & Roadmap */}
      <section id="key-features" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold text-teal-700 tracking-wider uppercase">System Capabilities</span>
            <h2 className="text-3xl font-extrabold text-blue-950 mt-1">
              Phase 1 Foundation & System Roadmap
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Phase 1 establishes the rock-solid authentication, multi-role access, database schema, and dashboard architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-teal-200 bg-teal-50/40">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-md bg-teal-600 text-white text-xs font-bold uppercase">
                  Phase 1 & 2 (Active)
                </span>
                <span className="text-xs font-semibold text-teal-900">GIS Intelligence & Foundation</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Interactive Cadastral GIS Explorer with Shapely geometric analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Parcel 360° Unified View (Spatial geometry, ownership, and history)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Automated polygon overlap detection & area mismatch alerts (&gt;2% variance)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>FastAPI + SQLite zero-cost local backend & Bcrypt/JWT RBAC session security</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Responsive government-grade UI with Leaflet vector polygon rendering</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 text-xs font-bold uppercase">
                  Upcoming Phases
                </span>
                <span className="text-xs font-semibold text-slate-600">AI & Deep Verification Layers</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>AI/OCR Document Verification for Vernacular Title Deeds (Tamil Nilam & IGRS)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Land DNA Engine & Temporal Integrity Timeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Risk Scoring Matrix & Anomaly Detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Multi-Department Live Integration Webhooks & Court Injunction Sync</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Why Parcel-Centric */}
      <section id="why-parcel-centric" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-teal-700 tracking-wider uppercase">The Core Paradigm</span>
              <h2 className="text-3xl font-extrabold text-blue-950">
                Why a Parcel-Centric Architecture?
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Traditional records are stored document-by-document or department-by-department. LandSync turns this upside down: every piece of physical land (the parcel) becomes the anchor object to which deeds, survey bounds, tax receipts, encumbrance history, and litigations attach.
              </p>
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-white border border-slate-200">
                  <h5 className="font-bold text-blue-950">Zero Duplicate Registrations</h5>
                  <p className="text-xs text-slate-500 mt-1">Direct spatial checks block illegal double-selling of the same plot.</p>
                </div>
                <div className="p-4 rounded-lg bg-white border border-slate-200">
                  <h5 className="font-bold text-blue-950">Instant Encumbrance Check</h5>
                  <p className="text-xs text-slate-500 mt-1">Bank loans, liens, and court stays surface immediately on the parcel profile.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-blue-950 text-white p-8 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <Lock className="w-4 h-4" />
                Immutable Parcel Trust
              </div>
              <h3 className="text-2xl font-bold text-white">One Connected View</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                "LandSync ensures that citizens, revenue officers, and banks look at the exact same verified record at the exact same moment."
              </p>
              <div className="pt-4 border-t border-blue-900/60 flex items-center justify-between text-xs text-teal-300">
                <span>DPI Standard Compatible</span>
                <span>SIH2026 Innovation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Role-based Access */}
      <section id="role-access" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-700 tracking-wider uppercase">Security & Permissions</span>
            <h2 className="text-3xl font-extrabold text-blue-950 mt-1">
              Role-Based Access Control
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Dedicated interfaces and API barriers tailored for each government stakeholder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-teal-400 transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-blue-950">Citizen</h3>
              <p className="text-xs font-semibold text-teal-700 mt-0.5">citizen@landsync.demo</p>
              <p className="text-sm text-slate-600 mt-3">
                View owned land parcels, check mutation application status, download verified land certificates, and track notifications.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-blue-400 transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center font-bold mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-blue-950">Land Officer</h3>
              <p className="text-xs font-semibold text-blue-800 mt-0.5">officer@landsync.demo</p>
              <p className="text-sm text-slate-600 mt-3">
                Review mutation and boundary verification cases, execute spatial inspections, approve Patta records, and handle review queues.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-amber-400 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-blue-950">System Admin</h3>
              <p className="text-xs font-semibold text-amber-800 mt-0.5">admin@landsync.demo</p>
              <p className="text-sm text-slate-600 mt-3">
                Manage user accounts and roles, monitor department API connectors, audit security logs, and oversee system health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="landing-footer" className="bg-blue-950 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-blue-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-400 text-blue-950 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">LandSync</span>
              <span className="text-xs text-slate-400">| Smart India Hackathon 2026 (SIH26014)</span>
            </div>
            <div className="text-xs text-slate-400 text-center md:text-right">
              Digital Public Infrastructure for Land Governance • Phase 1 Foundation
            </div>
          </div>
          <div className="pt-6 text-center text-xs text-slate-500">
            © 2026 LandSync DPI Architecture. Built with Python FastAPI, SQLite, and React.
          </div>
        </div>
      </footer>
    </div>
  );
};
