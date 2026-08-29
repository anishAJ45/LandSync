import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Lock,
  Eye,
  Info,
  RefreshCw,
  Share2,
  Layers,
  ChevronRight,
  Sparkles,
  KeyRound,
  FileCheck2
} from 'lucide-react';
import { interoperabilityService } from '../../services/interoperabilityService';
import { DataAccessConsent, DataLineageItem } from '../../types';

export const CitizenDataSharing: React.FC = () => {
  const [consents, setConsents] = useState<DataAccessConsent[]>([]);
  const [lineageItems, setLineageItems] = useState<DataLineageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    setLoading(true);
    try {
      const [consentList, lineage] = await Promise.all([
        interoperabilityService.getConsents(),
        interoperabilityService.getDataLineage()
      ]);
      setConsents(consentList);
      setLineageItems(lineage);
    } catch (err) {
      console.error('Failed to load consent data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async (consentId: string) => {
    setProcessingId(consentId);
    try {
      await interoperabilityService.grantConsent(consentId);
      setFeedbackMessage({ type: 'success', message: `Consent granted successfully for request ${consentId}. Authoritative record access authorized.` });
      await loadConsents();
    } catch (err) {
      setFeedbackMessage({ type: 'error', message: 'Failed to grant consent. Please retry.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (consentId: string) => {
    setProcessingId(consentId);
    try {
      await interoperabilityService.denyConsent(consentId, 'Citizen declined access request.');
      setFeedbackMessage({ type: 'success', message: `Consent request ${consentId} has been denied.` });
      await loadConsents();
    } catch (err) {
      setFeedbackMessage({ type: 'error', message: 'Failed to deny consent.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevoke = async (consentId: string) => {
    setProcessingId(consentId);
    try {
      await interoperabilityService.revokeConsent(consentId);
      setFeedbackMessage({ type: 'success', message: `Consent ${consentId} has been permanently revoked.` });
      await loadConsents();
    } catch (err) {
      setFeedbackMessage({ type: 'error', message: 'Failed to revoke consent.' });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingConsents = consents.filter((c) => c.consent_status === 'PENDING');
  const activeConsents = consents.filter((c) => c.consent_status === 'GRANTED');
  const pastConsents = consents.filter((c) => c.consent_status === 'DENIED' || c.consent_status === 'REVOKED' || c.consent_status === 'EXPIRED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Digital Personal Data Protection (DPDPA 2023)
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Citizen Privacy & Consent Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Land Data Sharing & Consent Management
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
              You maintain sovereign control over who can access your verified land records, title documents, and encumbrance certificates. Approve, deny, or revoke access at any time.
            </p>
          </div>

          <button
            onClick={loadConsents}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition flex items-center gap-2 border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-3.5 rounded-xl bg-slate-800/80 border border-teal-500/30 text-teal-200/90 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            External institutions (banks, housing finance, road authorities) require your explicit cryptographic consent before accessing your verified cadastral and title information. Official statutory officers access records under lawful revenue authority with transparent audit logging.
          </p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between animate-fadeIn ${
          feedbackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <span>{feedbackMessage.message}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-700 hover:text-slate-700 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-700">Pending Consent Requests</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{pendingConsents.length}</span>
            <span className="text-xs text-amber-900 font-medium">Requires your action</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-700">Active Granted Consents</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-800">{activeConsents.length}</span>
            <span className="text-xs text-emerald-800 font-medium">Active data links</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-700">Total Audit Inquiries</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{lineageItems.length}</span>
            <span className="text-xs text-slate-700 font-medium">All-time access events</span>
          </div>
        </div>
      </div>

      {/* PENDING CONSENT REQUESTS (ACTIONABLE) */}
      {pendingConsents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h2 className="text-base font-bold text-slate-900">
              Pending Data Access Requests ({pendingConsents.length})
            </h2>
          </div>

          <div className="space-y-4">
            {pendingConsents.map((consent) => (
              <div
                key={consent.consent_id}
                className="bg-white rounded-2xl p-6 border-2 border-amber-300 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {consent.consent_id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        ACTION REQUIRED
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {consent.requesting_organization}
                    </h3>
                    <p className="text-xs text-slate-700">
                      Requests access to records for parcel <strong>{consent.parcel_id}</strong>
                    </p>
                  </div>

                  <div className="text-right text-xs text-slate-700">
                    <div>Requested on: {new Date(consent.created_at).toLocaleDateString()}</div>
                    <div className="text-amber-900 font-medium">
                      Expires: {consent.expires_at ? new Date(consent.expires_at).toLocaleDateString() : 'In 14 days'}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div>
                    <span className="font-semibold text-slate-700">Stated Purpose: </span>
                    <span className="text-slate-900">{consent.purpose}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Requested Data Category: </span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-medium">
                      {consent.data_category.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleDeny(consent.consent_id)}
                    disabled={processingId === consent.consent_id}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Deny Access</span>
                  </button>

                  <button
                    onClick={() => handleGrant(consent.consent_id)}
                    disabled={processingId === consent.consent_id}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {processingId === consent.consent_id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Grant Consent (Authorize Access)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE GRANTED CONSENTS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Active Granted Data Authorizations</h2>
        <p className="text-xs text-slate-700">These organizations currently have time-bound permission to query your standardized land data.</p>

        {activeConsents.length === 0 ? (
          <p className="text-xs text-slate-700 py-4 italic text-center">No active third-party consents currently granted.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-3 px-4">Consent ID</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Parcel ID</th>
                  <th className="py-3 px-4">Data Category</th>
                  <th className="py-3 px-4">Granted On</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeConsents.map((c) => (
                  <tr key={c.consent_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">{c.consent_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.requesting_organization}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{c.parcel_id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-[11px]">
                        {c.data_category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {c.granted_at ? new Date(c.granted_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3 px-4 text-emerald-800 font-medium">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '30 Days'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRevoke(c.consent_id)}
                        disabled={processingId === c.consent_id}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition cursor-pointer border border-rose-200"
                      >
                        Revoke Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CITIZEN DATA ACCESS AUDIT HISTORY */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Your Land Data Access History</h2>
        <p className="text-xs text-slate-700">Transparent record of every instance where your land profile was queried by state officers or authorized financial bodies.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4">Lineage Ref</th>
                <th className="py-3 px-4">Parcel ID</th>
                <th className="py-3 px-4">Accessed By</th>
                <th className="py-3 px-4">Access Reason / Purpose</th>
                <th className="py-3 px-4">Authorization</th>
                <th className="py-3 px-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lineageItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono text-teal-800 font-semibold">{item.lineage_id}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{item.parcel_id}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{item.accessed_by}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm truncate" title={item.access_purpose}>
                    {item.access_purpose}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">
                      {item.access_mode}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
