import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
  Bell,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { advancedGovernanceService } from '../../services/advancedGovernanceService';
import { SystemConfigurationState } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export const AdminConfiguration: React.FC = () => {
  const [config, setConfig] = useState<SystemConfigurationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedGovernanceService.getSystemConfiguration();
      setConfig(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load system configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleFeature = (key: string) => {
    if (!config) return;
    setConfig({
      ...config,
      feature_flags: config.feature_flags.map((f) =>
        f.key === key ? { ...f, enabled: !f.enabled } : f
      )
    });
    setSavedSuccess(false);
  };

  const handleSaveAll = async () => {
    if (!config) return;
    try {
      setSaving(true);
      const updated = await advancedGovernanceService.updateSystemConfiguration(config);
      setConfig(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save configuration settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading System Configuration Engine..." size="lg" />;
  if (error) return <ErrorMessage title="Configuration Error" message={error} onRetry={loadData} />;
  if (!config) return null;

  return (
    <div id="admin-configuration" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Configuration & Feature Flags</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Admin Only • Audit Logged
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Toggle platform runtime modules, GIS tile cache limits, automated AI triggers, and notification pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Configuration Saved & Audit Logged
            </span>
          )}
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-950 text-white hover:bg-blue-900 flex items-center gap-2 transition shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>

      {/* Feature Flags Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Runtime Feature Flags</h3>
            <p className="text-xs text-slate-500">Enable or disable microservices and specialized spatial analyzers on the fly</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.feature_flags.map((flag) => (
            <div
              key={flag.key}
              className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                flag.enabled ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {flag.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{flag.label}</h4>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{flag.description}</p>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">{flag.key}</span>
              </div>

              <button
                onClick={() => handleToggleFeature(flag.key)}
                className={`p-1.5 rounded-lg transition shrink-0 ${
                  flag.enabled ? 'text-blue-950 hover:text-blue-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {flag.enabled ? (
                  <ToggleRight className="w-7 h-7 text-blue-900" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subsystem Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GIS Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-900" />
            <h3 className="text-sm font-bold text-slate-900">GIS Cadastral Defaults</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 font-semibold">Default Zoom Level</label>
              <input
                type="number"
                value={config.gis_settings.default_zoom}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    gis_settings: { ...config.gis_settings, default_zoom: parseInt(e.target.value, 10) || 16 }
                  })
                }
                className="w-full mt-1 p-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold">Max Spatial Resolution (Meters)</label>
              <input
                type="number"
                value={config.gis_settings.max_resolution_meters}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    gis_settings: { ...config.gis_settings, max_resolution_meters: parseFloat(e.target.value) || 0.1 }
                  })
                }
                className="w-full mt-1 p-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-900" />
            <h3 className="text-sm font-bold text-slate-900">Notification & SLA Alerts</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 font-semibold">Officer SLA Warning Threshold (Hours)</label>
              <input
                type="number"
                value={config.notification_settings.officer_sla_warning_threshold_hours}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    notification_settings: {
                      ...config.notification_settings,
                      officer_sla_warning_threshold_hours: parseInt(e.target.value, 10) || 24
                    }
                  })
                }
                className="w-full mt-1 p-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-700 font-medium">In-App Toast Alerts</span>
              <input
                type="checkbox"
                checked={config.notification_settings.in_app_toast_enabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    notification_settings: {
                      ...config.notification_settings,
                      in_app_toast_enabled: e.target.checked
                    }
                  })
                }
                className="w-4 h-4 rounded text-blue-900"
              />
            </div>
          </div>
        </div>

        {/* Workflow Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-900" />
            <h3 className="text-sm font-bold text-slate-900">Workflow & Verification Rules</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Auto-Trigger Cross Verification</span>
              <input
                type="checkbox"
                checked={config.workflow_settings.auto_trigger_cross_verification}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    workflow_settings: {
                      ...config.workflow_settings,
                      auto_trigger_cross_verification: e.target.checked
                    }
                  })
                }
                className="w-4 h-4 rounded text-blue-900"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Dual Officer Approval on High Risk</span>
              <input
                type="checkbox"
                checked={config.workflow_settings.require_dual_officer_approval_high_risk}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    workflow_settings: {
                      ...config.workflow_settings,
                      require_dual_officer_approval_high_risk: e.target.checked
                    }
                  })
                }
                className="w-4 h-4 rounded text-blue-900"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
