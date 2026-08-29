import React, { useState, useEffect } from 'react';
import {
  Layers,
  MapPin,
  Globe,
  Database,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Info,
  Shield,
  Sliders,
  Sparkles,
  FileCode
} from 'lucide-react';
import { advancedGovernanceService } from '../services/advancedGovernanceService';
import { OpenDataLayerMetadata } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const OpenDataExplorer: React.FC = () => {
  const [layers, setLayers] = useState<OpenDataLayerMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedGovernanceService.getOpenDataLayers();
      setLayers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load open data metadata layers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, is_active: !l.is_active } : l))
    );
  };

  const handleOpacityChange = (id: string, opacity: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, opacity } : l))
    );
  };

  const filteredLayers = layers.filter(
    (l) => selectedCategory === 'ALL' || l.category === selectedCategory
  );

  if (loading) return <LoadingSpinner message="Scanning Open GIS Data Catalog..." size="lg" />;
  if (error) return <ErrorMessage title="Open Data Catalog Error" message={error} onRetry={loadData} />;

  return (
    <div id="open-data-explorer" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Open Data & Satellite Layer Explorer</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
              OGC & GeoJSON Standards
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse public domain cadastral datasets, ISRO Bhuvan / Copernicus Sentinel temporal imagery, and municipal zoning boundaries.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Catalog</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'SATELLITE_IMAGERY', 'ADMINISTRATIVE', 'ENVIRONMENTAL', 'INFRASTRUCTURE', 'GEOJSON_PROTOTYPE'].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          )
        )}
      </div>

      {/* Layer Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLayers.map((layer) => (
          <div
            key={layer.id}
            className={`p-5 rounded-2xl border transition space-y-3 ${
              layer.is_active ? 'bg-white border-blue-300 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-80'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {layer.data_type}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">{layer.name}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">Source: <span className="font-semibold text-slate-700">{layer.source_organization}</span></p>
              </div>

              <input
                type="checkbox"
                checked={layer.is_active}
                onChange={() => handleToggleLayer(layer.id)}
                className="w-5 h-5 rounded text-blue-900 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-slate-600">
              <div>
                <span className="text-slate-400 block font-sans">Coverage</span>
                {layer.spatial_coverage}
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Last Updated</span>
                {layer.last_updated}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 italic">
              License: {layer.license_note}
            </div>

            {layer.is_active && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4 text-xs">
                <span className="text-slate-600 font-semibold">Opacity: {(layer.opacity * 100).toFixed(0)}%</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={layer.opacity}
                  onChange={(e) => handleOpacityChange(layer.id, parseFloat(e.target.value))}
                  className="w-32 accent-blue-900 cursor-pointer"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
