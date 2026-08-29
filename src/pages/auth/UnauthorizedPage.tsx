import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { user, getDefaultDashboardRoute } = useAuth();
  const navigate = useNavigate();

  return (
    <div id="unauthorized-page-root" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Restricted</h1>
        <p className="text-sm text-slate-600 mt-2">
          Your current account role (<strong className="text-blue-950">{user?.role || 'Guest'}</strong>) does not have authorization to view this government resource.
        </p>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-left">
          <div className="font-semibold text-slate-700 mb-1">Role Boundary Policy:</div>
          <div>• Citizen accounts cannot view Officer queues or Admin systems.</div>
          <div>• Officer accounts cannot access Administrative configuration.</div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          {user ? (
            <button
              id="return-dashboard-btn"
              onClick={() => navigate(getDefaultDashboardRoute(user.role))}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-950 hover:bg-blue-900 transition flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-teal-400" />
              Return to My {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-950 hover:bg-blue-900 transition flex items-center justify-center gap-2"
            >
              Go to Login Page
            </Link>
          )}

          <Link
            to="/"
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            LandSync Home
          </Link>
        </div>
      </div>
    </div>
  );
};
