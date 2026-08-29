import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FileCheck2,
  Send,
  Bell,
  UserCheck,
  ShieldCheck,
  Search,
  FolderOpen,
  ClipboardList,
  Users,
  Server,
  Network,
  Activity,
  BarChart3,
  Settings,
  Layers,
  MapPin,
  Dna,
  ShieldAlert,
  AlertTriangle,
  Building2,
  Compass,
  Landmark,
  Table,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Grid,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LogoutButton } from '../auth/LogoutButton';
import { CommandPaletteModal } from '../common/CommandPaletteModal';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

interface NavGroup {
  id: string;
  title: string;
  badge?: string;
  items: {
    name: string;
    path: string;
    icon: any;
    badge?: string;
    roles?: string[];
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { user } = useAuth();
  const { activeStateCode } = useLanguage();
  const location = useLocation();
  const currentRole = user?.role || 'citizen';

  const [activeFilter, setActiveFilter] = useState<'all' | 'citizen' | 'officer' | 'admin'>('all');
  const [openCommandPalette, setOpenCommandPalette] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboards: true,
    citizen: true,
    officer: true,
    gis: true,
    state: true,
    admin: true
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const navGroups: NavGroup[] = [
    {
      id: 'dashboards',
      title: 'Dashboards & Portals',
      badge: 'Core',
      items: [
        { name: 'Dashboards Hub (Directory)', path: '/dashboards', icon: Grid, badge: 'All' },
        { name: 'Citizen Services Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard, roles: ['citizen', 'admin'] },
        { name: 'Officer Command Console', path: '/officer/dashboard', icon: LayoutDashboard, roles: ['officer', 'admin'] },
        { name: 'Admin Governance Hub', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['admin'] },
        { name: 'GIS Cadastral Map', path: '/gis', icon: MapPin, badge: 'Vector' },
        { name: 'Land Risk & Heat Maps', path: '/analytics/maps', icon: ShieldAlert, badge: 'AI' }
      ]
    },
    {
      id: 'citizen',
      title: 'Citizen Services & AI',
      badge: 'Citizen',
      items: [
        { name: 'Citizen AI Assistant', path: '/assistant', icon: Sparkles, badge: 'Voice', roles: ['citizen', 'officer', 'admin'] },
        { name: 'Guided Journey Wizard', path: '/citizen/guided-journey', icon: Compass, badge: '5-Step', roles: ['citizen', 'admin'] },
        { name: 'Land Record Status', path: '/citizen/status', icon: ShieldCheck, roles: ['citizen', 'admin'] },
        { name: 'Document Center (OCR)', path: '/citizen/documents', icon: FileCheck2, roles: ['citizen', 'admin'] },
        { name: 'Data Sharing & Consent', path: '/citizen/data-sharing', icon: Network, roles: ['citizen', 'admin'] },
        { name: 'My Applications Tracker', path: '/citizen/applications', icon: Send, roles: ['citizen', 'admin'] },
        { name: 'Submit New Request', path: '/citizen/create-request', icon: FileText, roles: ['citizen', 'admin'] },
        { name: 'My Land Records', path: '/citizen/records', icon: FolderOpen, roles: ['citizen', 'admin'] }
      ]
    },
    {
      id: 'officer',
      title: 'Officer Operations',
      badge: 'Officer',
      items: [
        { name: 'Review Queue', path: '/officer/queue', icon: ClipboardList, roles: ['officer', 'admin'] },
        { name: 'Verification Cases', path: '/officer/cases', icon: FolderOpen, roles: ['officer', 'admin'] },
        { name: 'Risk Detection Dashboard', path: '/officer/risk-dashboard', icon: ShieldAlert, roles: ['officer', 'admin'] },
        { name: 'Anomaly Review', path: '/officer/anomalies', icon: AlertTriangle, roles: ['officer', 'admin'] },
        { name: 'Document Review (AI/OCR)', path: '/officer/documents', icon: FileCheck2, roles: ['officer', 'admin'] },
        { name: 'Civic & Infrastructure (P9)', path: '/officer/civic-services', icon: Building2, roles: ['officer', 'admin'] },
        { name: 'Spatial Analytics (P8)', path: '/officer/spatial-analytics', icon: Compass, roles: ['officer', 'admin'] },
        { name: 'Land DNA Profile', path: '/officer/land-dna', icon: Dna, roles: ['officer', 'admin'] },
        { name: 'DPI Data Access & Sync', path: '/officer/data-access', icon: Network, roles: ['officer', 'admin'] }
      ]
    },
    {
      id: 'gis',
      title: 'Geospatial & Open Data',
      badge: 'GIS',
      items: [
        { name: 'GIS Cadastral Map', path: '/gis', icon: MapPin },
        { name: 'Open Data & Satellite Layers', path: '/gis/open-data', icon: Layers, badge: 'ISRO' },
        { name: 'Sample Parcel 360° (124/1)', path: '/parcel/TN-CBE-001-124-1', icon: MapPin, badge: 'Demo' }
      ]
    },
    {
      id: 'state',
      title: 'State Engine & DPI (Phase 10)',
      badge: 'National',
      items: [
        { name: 'State Configuration (P10)', path: '/admin/state-configuration', icon: Landmark },
        { name: 'State Matrix Comparison', path: '/admin/state-comparison', icon: Table },
        { name: 'State Onboarding Sandbox', path: '/admin/state-onboarding', icon: Landmark },
        { name: 'Department Integrations', path: '/admin/integrations', icon: Network },
        { name: 'Land Intelligence Analytics', path: '/admin/land-intelligence', icon: Dna }
      ]
    },
    {
      id: 'admin',
      title: 'Governance & Security',
      badge: 'Admin',
      items: [
        { name: 'System Hub & Monitoring', path: '/admin/system-hub', icon: Server, badge: 'Live', roles: ['admin'] },
        { name: 'User & Role Management', path: '/admin/users-roles', icon: Users, roles: ['admin'] },
        { name: 'System Configuration', path: '/admin/configuration', icon: Settings, roles: ['admin'] },
        { name: 'Data Quality Management', path: '/admin/data-quality', icon: Sparkles, roles: ['admin'] },
        { name: 'Security & Compliance', path: '/admin/security', icon: ShieldCheck, roles: ['admin'] },
        { name: 'Audit Logs & Ledger', path: '/admin/audit-logs', icon: Activity, roles: ['admin'] }
      ]
    }
  ];

  // Filter items based on activeFilter or user role
  const getFilteredGroups = () => {
    return navGroups
      .map((group) => {
        const filteredItems = group.items.filter((item) => {
          if (activeFilter === 'all') {
            // In 'all' view, show based on user role or public
            if (!item.roles) return true;
            return item.roles.includes(currentRole) || currentRole === 'admin';
          }
          if (!item.roles) return true;
          return item.roles.includes(activeFilter);
        });
        return {
          ...group,
          items: filteredItems
        };
      })
      .filter((group) => group.items.length > 0);
  };

  const filteredGroups = getFilteredGroups();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Command Palette Modal */}
      <CommandPaletteModal
        isOpen={openCommandPalette}
        onClose={() => setOpenCommandPalette(false)}
      />

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <Link
            to="/dashboards"
            onClick={onCloseMobile}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center text-teal-400 font-bold text-lg shadow-xs group-hover:bg-slate-900 transition-colors">
              <MapPin className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="font-extrabold text-base text-blue-950 tracking-tight flex items-center gap-1.5">
                LandSync
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-200">
                  DPI
                </span>
              </div>
              <p className="text-[11px] text-teal-700 font-bold flex items-center gap-1 truncate">
                <span>State: {activeStateCode}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-normal">SIH26014</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Search Bar trigger */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={() => setOpenCommandPalette(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 text-slate-500 text-xs font-semibold transition"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-teal-700" />
              <span>Search Dashboards...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-600 rounded border border-slate-300">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Portal Filter Pills */}
        <div className="px-3 py-2 border-b border-slate-100">
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-[10px] font-bold text-center">
            <button
              onClick={() => setActiveFilter('all')}
              className={`py-1 rounded-lg transition ${
                activeFilter === 'all'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('citizen')}
              className={`py-1 rounded-lg transition ${
                activeFilter === 'citizen'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Citizen
            </button>
            <button
              onClick={() => setActiveFilter('officer')}
              className={`py-1 rounded-lg transition ${
                activeFilter === 'officer'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Officer
            </button>
            <button
              onClick={() => setActiveFilter('admin')}
              className={`py-1 rounded-lg transition ${
                activeFilter === 'admin'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Navigation list with properly ordered collapsible groups */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {filteredGroups.map((group) => {
            const isExpanded = expandedSections[group.id] ?? true;

            return (
              <div key={group.id} className="space-y-1">
                {/* Group Header */}
                <button
                  onClick={() => toggleSection(group.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-wider transition group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{group.title}</span>
                    {group.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {group.badge}
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                  )}
                </button>

                {/* Items */}
                {isExpanded && (
                  <div className="space-y-0.5 pt-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onCloseMobile}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                            isActive
                              ? 'bg-blue-950 text-teal-300 shadow-xs'
                              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? 'text-teal-400' : 'text-slate-500'
                              }`}
                            />
                            <span className="truncate">{item.name}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded shrink-0 ${
                                isActive
                                  ? 'bg-teal-400/20 text-teal-300 border border-teal-400/30'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User profile & Logout footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/90">
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/citizen/profile"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 min-w-0 group hover:opacity-80 transition"
            >
              <div className="w-8 h-8 rounded-full bg-blue-950 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-950">
                  {user?.full_name || 'User'}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-teal-700 capitalize">
                    {user?.role || 'Citizen'}
                  </span>
                  <span className="text-[10px] text-slate-400">• Online</span>
                </div>
              </div>
            </Link>
            <LogoutButton variant="ghost" className="p-1.5 text-slate-500 hover:text-rose-600" />
          </div>
        </div>
      </aside>
    </>
  );
};
