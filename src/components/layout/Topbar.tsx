import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Grid,
  MapPin,
  Landmark,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../state/LanguageSelector';
import { RuralUrbanContextToggle } from '../state/RuralUrbanContextToggle';
import { CommandPaletteModal } from '../common/CommandPaletteModal';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { activeStateCode } = useLanguage();
  const [openCommandPalette, setOpenCommandPalette] = useState(false);

  return (
    <>
      <CommandPaletteModal
        isOpen={openCommandPalette}
        onClose={() => setOpenCommandPalette(false)}
      />

      <header
        id="app-topbar"
        className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between"
      >
        {/* Left Section: Mobile toggle, Active state & Direct Dashboards button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="topbar-toggle-sidebar-btn"
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Direct Dashboards Hub Button */}
          <Link
            to="/dashboards"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-slate-900 text-teal-300 text-xs font-bold shadow-xs transition"
          >
            <Grid className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Dashboards</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/admin/state-configuration"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-950 text-xs font-black hover:bg-teal-100 transition"
              title="Active State Engine Configuration"
            >
              <Landmark className="w-3.5 h-3.5 text-teal-700" />
              <span>State: {activeStateCode}</span>
            </Link>

            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:inline">
              Land Governance DPI • SIH26014
            </span>
          </div>
        </div>

        {/* Center Section: Quick Omnibox Search trigger */}
        <div className="hidden lg:block flex-1 max-w-xs mx-4">
          <button
            onClick={() => setOpenCommandPalette(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-500 text-xs font-medium transition"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Search dashboards, surveys, tools...</span>
            </div>
            <kbd className="px-1.5 py-0.2 bg-white text-slate-500 font-mono text-[10px] rounded border border-slate-300">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Section: Controls, Language, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Voice Quick Link */}
          <Link
            to="/assistant"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold transition"
            title="Open Citizen AI Multilingual Voice Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden xl:inline">AI Voice</span>
          </Link>

          {/* Rural / Urban Context Switcher */}
          <div className="hidden xl:block">
            <RuralUrbanContextToggle />
          </div>

          {/* Language Selector */}
          <LanguageSelector compact />

          {/* Quick notification indicator */}
          <Link
            to="/citizen/notifications"
            id="topbar-notifications-btn"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white"></span>
          </Link>

          {/* User avatar/pill */}
          <Link
            to="/citizen/profile"
            className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-teal-300 font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.role === 'admin' ? 'AD' : user?.role === 'officer' ? 'OF' : 'CZ'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {user?.full_name?.split(' ')[0] || 'User'}
              </div>
              <div className="text-[10px] font-semibold text-teal-700 capitalize">
                {user?.role || 'Citizen'}
              </div>
            </div>
          </Link>
        </div>
      </header>
    </>
  );
};
