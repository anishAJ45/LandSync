import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MapPin, Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2, User, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user, getDefaultDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'officer' | 'admin' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to respective dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDefaultDashboardRoute(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, getDefaultDashboardRoute]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const loggedUser = await login(email, password, selectedRole || undefined);
      const targetRoute = getDefaultDashboardRoute(loggedUser.role);
      navigate(targetRoute, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.response?.data?.detail || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'citizen' | 'officer' | 'admin') => {
    setError(null);
    if (role === 'citizen') {
      setEmail('citizen@landsync.demo');
      setPassword('Citizen@123');
      setSelectedRole('citizen');
    } else if (role === 'officer') {
      setEmail('officer@landsync.demo');
      setPassword('Officer@123');
      setSelectedRole('officer');
    } else if (role === 'admin') {
      setEmail('admin@landsync.demo');
      setPassword('Admin@123');
      setSelectedRole('admin');
    }
  };

  return (
    <div id="login-page-root" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center text-teal-400 font-bold shadow-xs">
            <MapPin className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-blue-950 tracking-tight">LandSync</span>
        </Link>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Government Land Governance Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Digital Public Infrastructure for Land Administration (SIH26014)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        {/* Main Login Card */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-2xl">
          {error && (
            <div className="mb-6">
              <ErrorMessage title="Authentication Error" message={error} />
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Government Email Address
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@landsync.demo"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                />
              </div>
            </div>

            {/* Optional Role Selector */}
            <div>
              <label htmlFor="login-role" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Role Filter (Optional)
              </label>
              <select
                id="login-role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-950 focus:border-transparent"
              >
                <option value="">Auto-detect Role from Account</option>
                <option value="citizen">Citizen (Land Owner / Applicant)</option>
                <option value="officer">Land Officer (Tahsildar / Registrar)</option>
                <option value="admin">System Administrator (State / Central)</option>
              </select>
            </div>

            {/* Submit button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-950 hover:bg-blue-900 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-950 transition shadow-sm disabled:opacity-60"
            >
              {loading ? (
                <LoadingSpinner size="sm" message="" />
              ) : (
                <>
                  <span>Sign In to LandSync</span>
                  <ArrowRight className="w-4 h-4 text-teal-400" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Accounts Selector */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="text-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1-Click Phase 1 Demo Credentials
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                id="quick-demo-citizen"
                onClick={() => fillDemoCredentials('citizen')}
                className="p-3 text-left rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/80 transition"
              >
                <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                  <span>Citizen</span>
                  <User className="w-3.5 h-3.5 text-teal-700" />
                </div>
                <div className="text-[11px] text-teal-800 font-mono mt-1 truncate">citizen@landsync.demo</div>
                <div className="text-[10px] text-teal-600 font-mono">Citizen@123</div>
              </button>

              <button
                type="button"
                id="quick-demo-officer"
                onClick={() => fillDemoCredentials('officer')}
                className="p-3 text-left rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 transition"
              >
                <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                  <span>Officer</span>
                  <Key className="w-3.5 h-3.5 text-blue-800" />
                </div>
                <div className="text-[11px] text-blue-900 font-mono mt-1 truncate">officer@landsync.demo</div>
                <div className="text-[10px] text-blue-600 font-mono">Officer@123</div>
              </button>

              <button
                type="button"
                id="quick-demo-admin"
                onClick={() => fillDemoCredentials('admin')}
                className="p-3 text-left rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 transition"
              >
                <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                  <span>Admin</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-800" />
                </div>
                <div className="text-[11px] text-amber-900 font-mono mt-1 truncate">admin@landsync.demo</div>
                <div className="text-[10px] text-amber-600 font-mono">Admin@123</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-900">
              Register New Citizen Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
