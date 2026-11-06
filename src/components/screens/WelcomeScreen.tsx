import React from 'react';
import { ActiveScreen, Language } from '../../types';
import { useTranslation } from '../../i18n/translations';
import {
  Satellite,
  Plane,
  Stethoscope,
  MapPin,
  CloudSun,
  ShieldCheck,
  Globe2,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
} from 'lucide-react';

interface WelcomeScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  language: Language;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate, language }) => {
  const t = useTranslation(language);

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white shadow-2xl border border-emerald-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.18),transparent_60%)]" />

        <div className="relative max-w-5xl mx-auto px-6 py-12 sm:py-16 lg:px-12 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI-Powered Global Precision Agriculture Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            AgroSecure <span className="text-emerald-400">AI</span>
          </h1>

          <p className="mt-3 text-lg sm:text-xl font-medium text-emerald-200">
            Precision Crop Health, Anomaly Engine, Crop Doctor & Financial Protection
          </p>

          <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
            Protect your yield with Sentinel-2 multi-spectral remote sensing, automated anomaly detection, AI plant leaf disease diagnosis, real-time Crop Doctor alerts, and PMFBY financial risk valuation.
          </p>

          {/* Action CTA Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2 text-sm"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('crop_detector')}
              className="bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600/80 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm"
            >
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>Crop Detector</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('anomaly_engine')}
              className="bg-amber-600/90 hover:bg-amber-500 border border-amber-500/60 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm"
            >
              <span>Anomaly Engine</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('alert_center')}
              className="bg-rose-700/90 hover:bg-rose-600 border border-rose-500/60 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm"
            >
              <span>Crop Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('financial_risk')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold px-6 py-3 rounded-xl border border-slate-600 transition-all flex items-center gap-2 text-sm"
            >
              <span>Financial Risk</span>
            </button>
          </div>

          {/* Global Coverage Pills */}
          <div className="mt-8 pt-8 border-t border-emerald-800/60 w-full flex flex-wrap justify-center items-center gap-4 text-xs text-emerald-300/90">
            <span className="flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-emerald-400" /> Worldwide Coverage:
            </span>
            <span className="bg-emerald-900/60 px-2.5 py-1 rounded-md border border-emerald-700/50">
              🇮🇳 Karnataka (Chikmagalur & Coorg)
            </span>
            <span className="bg-emerald-900/60 px-2.5 py-1 rounded-md border border-emerald-700/50">
              🇨🇴 Colombia (Huila)
            </span>
            <span className="bg-emerald-900/60 px-2.5 py-1 rounded-md border border-emerald-700/50">
              🇪🇹 Ethiopia (Yirgacheffe)
            </span>
            <span className="bg-emerald-900/60 px-2.5 py-1 rounded-md border border-emerald-700/50">
              🇧🇷 Brazil (Cerrado)
            </span>
          </div>
        </div>
      </div>

      {/* Feature Pillar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Sentinel-2 Remote Sensing */}
        <div
          onClick={() => onNavigate('satellite')}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-400 transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Satellite className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            {t.satelliteMonitoring}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Copernicus Sentinel-2 multispectral imagery at 10m ground resolution. Compute live NDVI, NDRE (Red Edge chlorophyll), and NDWI (canopy moisture) with cloud-cover filtering.
          </p>
          <div className="flex items-center text-xs font-bold text-emerald-700 group-hover:underline">
            <span>Explore Spectral Bands</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 2: AI Leaf Disease Lab */}
        <div
          onClick={() => onNavigate('disease_detection')}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-400 transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            {t.aiDiseaseTitle}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Multimodal vision AI for Coffee Leaf Rust, Cercospora leaf spot, Berry disease, and Berry borer damage. Instant severity scoring with organic and agronomic spray protocols.
          </p>
          <div className="flex items-center text-xs font-bold text-amber-700 group-hover:underline">
            <span>Test Leaf Diagnosis</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 3: Autonomous Drone Scouting */}
        <div
          onClick={() => onNavigate('drone')}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-400 transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plane className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            {t.droneTitle}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Centimeter-accurate aerial photography, waypoint mission mapping, and individual coffee bush tagging with GPS geolocation and canopy stress ratings.
          </p>
          <div className="flex items-center text-xs font-bold text-blue-700 group-hover:underline">
            <span>View Flight Missions</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 4: GPS Farm Boundary Mapping */}
        <div
          onClick={() => onNavigate('mapping')}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-400 transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            {t.gpsMapping}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Interactive polygon boundary drawer over real ESRI satellite imagery. Automatically computes geodesic land area in both Acres and Hectares with GeoJSON export.
          </p>
          <div className="flex items-center text-xs font-bold text-indigo-700 group-hover:underline">
            <span>Draw Farm Parcel</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 5: Agro-Meteorological Station */}
        <div
          onClick={() => onNavigate('weather')}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-400 transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CloudSun className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            {t.weatherTitle}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Real-time hyper-local climate tracking via Open-Meteo. Automatically assesses Coffee Leaf Rust germination microclimates and optimal spraying weather windows.
          </p>
          <div className="flex items-center text-xs font-bold text-cyan-700 group-hover:underline">
            <span>Check Weather & Risk</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Card 6: Comprehensive Farm Reports */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-400 transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            {t.reports}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Generate printable PDF-ready agronomist dossiers combining satellite NDVI time-series, drone survey logs, weather data, and actionable treatment recommendations.
          </p>
          <div className="flex items-center text-xs font-bold text-emerald-800 group-hover:underline">
            <span>Generate Dossier</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>

      {/* Verification & System Standards Box */}
      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-950 text-sm">
              Scientific Remote Sensing & Agronomy Standards
            </h4>
            <p className="text-xs text-emerald-800">
              NDVI = (NIR - RED) / (NIR + RED) &bull; NDRE = (NIR - RedEdge) / (NIR + RedEdge) &bull; Transparent Sentinel-2 acquisition dates & cloud coverage disclosures.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold bg-white text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-300">
            Copernicus Sentinel-2 Ready
          </span>
          <span className="text-[11px] font-semibold bg-emerald-700 text-white px-3 py-1.5 rounded-lg">
            Gemini 3.8 Flash Vision
          </span>
        </div>
      </div>
    </div>
  );
};
