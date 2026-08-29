import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const RegisterPage: React.FC = () => {
  const { register, getDefaultDashboardRoute } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'citizen' | 'officer'>('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newUser = await register(fullName, email, password, role);
      navigate(getDefaultDashboardRoute(newUser.role), { replace: true });
    } catch (err: any) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="register-page-root" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center text-teal-400 font-bold shadow-xs">
            <MapPin className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-blue-950 tracking-tight">LandSync</span>
        </Link>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Create LandSync Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Register to access your land parcels and digital verification records
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-2xl">
          {error && (
            <div className="mb-6">
              <ErrorMessage title="Registration Error" message={error} />
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name (as in Aadhaar / Official ID)
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@domain.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-role" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Account Type
              </label>
              <select
                id="reg-role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-950 focus:border-transparent"
              >
                <option value="citizen">Citizen (Land Owner / Purchaser)</option>
                <option value="officer">Land Revenue Officer</option>
              </select>
            </div>

            <button
              id="reg-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-950 hover:bg-blue-900 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-950 transition shadow-sm disabled:opacity-60"
            >
              {loading ? (
                <LoadingSpinner size="sm" message="" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 text-teal-400" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-900">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
