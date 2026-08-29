import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, Mail, Calendar, Key, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div id="profile-page-container" className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-blue-950">Official Profile & Credentials</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Government identity authentication and role authorization details.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-950 text-teal-300 text-2xl font-bold flex items-center justify-center">
            {user.full_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-teal-100 text-teal-900 border border-teal-200">
                {user.role}
              </span>
              <span className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Verified Account
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </span>
            <p className="font-semibold text-slate-900 font-mono">{user.email}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              User ID
            </span>
            <p className="font-semibold text-slate-900 font-mono">USER-{String(user.id).padStart(5, '0')}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Registration Date
            </span>
            <p className="font-semibold text-slate-900 font-mono">
              {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              Security Standard
            </span>
            <p className="font-semibold text-slate-900">Bcrypt + JWT RS256 Standard</p>
          </div>
        </div>
      </div>
    </div>
  );
};
