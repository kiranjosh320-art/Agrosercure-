import React, { useState } from 'react';
import {
  ActiveScreen,
  Farm,
  Language,
  SatelliteObservation,
  DroneInspection,
  CropDiseaseDetection,
  NotificationItem,
  WeatherData,
  DroneDevice,
  SatelliteAnomaly,
  DroneInspectionTask,
  DroneImageRecord,
} from '../../types';
import { useTranslation } from '../../i18n/translations';
import { FarmMap } from '../Map/FarmMap';
import {
  Sprout,
  Satellite,
  Plane,
  Stethoscope,
  MapPin,
  CloudSun,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Calendar,
  Cloud,
  Layers,
  CheckCircle2,
  Thermometer,
  Droplets,
  Wind,
  Radio,
  Battery,
  Bot,
  ScanLine,
  Activity,
  BellRing,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';

interface DashboardScreenProps {
  activeFarm?: Farm;
  allFarms: Farm[];
  onSelectFarm: (farmId: string) => void;
  satelliteObs?: SatelliteObservation;
  droneInspection?: DroneInspection;
  droneDevice?: DroneDevice;
  anomalies?: SatelliteAnomaly[];
  inspectionTasks?: DroneInspectionTask[];
  droneImages?: DroneImageRecord[];
  recentDetections: CropDiseaseDetection[];
  notifications: NotificationItem[];
  weather?: WeatherData;
  onNavigate: (screen: ActiveScreen) => void;
  language: Language;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  activeFarm,
  allFarms,
  onSelectFarm,
  satelliteObs,
  droneInspection,
  droneDevice,
  anomalies,
  inspectionTasks,
  droneImages,
  recentDetections,
  notifications,
  weather,
  onNavigate,
  language,
}) => {
  const t = useTranslation(language);
  const [showNdviOnDashboard, setShowNdviOnDashboard] = useState(true);
  const [showDroneOnDashboard, setShowDroneOnDashboard] = useState(true);

  // Calculate totals across all farms
  const totalAcres = allFarms.reduce((acc, f) => acc + (f.areaAcres || 0), 0);
  const totalHectares = allFarms.reduce((acc, f) => acc + (f.areaHectares || 0), 0);
  const activeAlerts = notifications.filter((n) => !n.read && (n.severity === 'warning' || n.severity === 'critical'));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome & Quick Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {activeFarm?.name || 'AgroSecure Farm Dashboard'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {activeFarm?.locationName}, {activeFarm?.state}, {activeFarm?.country} &bull;{' '}
            <strong className="text-emerald-700">{activeFarm?.cropType}</strong> ({activeFarm?.cropVariety || activeFarm?.coffeeVariety || 'Standard Cultivar'})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('farmer_bot')}
            className="bg-emerald-800 hover:bg-emerald-900 text-emerald-100 border border-emerald-600/80 text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>AgroBot AI</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('crop_detector')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <ScanLine className="w-4 h-4" />
            <span>AI Plant Identifier</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('anomaly_engine')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4" />
            <span>Anomaly Engine</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('alert_center')}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <BellRing className="w-4 h-4" />
            <span>Crop Doctor</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('financial_risk')}
            className="bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <IndianRupee className="w-4 h-4" />
            <span>Financial Risk</span>
          </button>
        </div>
      </div>

      {/* 4 Core Pillars Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Crop Detector */}
        <div
          onClick={() => onNavigate('crop_detector')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <ScanLine className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900">Crop Detector</h4>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">
                AI Vision
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Scan leaf images for rust, blight, pests, and get immediate chemical and organic prescriptions.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 mt-3 flex items-center gap-1 group-hover:translate-x-1 transition">
            Launch Diagnostic Lab &rarr;
          </span>
        </div>

        {/* Pillar 2: Anomaly Engine */}
        <div
          onClick={() => onNavigate('anomaly_engine')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-amber-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900">Anomaly Engine</h4>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 uppercase">
                Sentinel-2
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Automated spatial heatmap detection of NDVI collapses, moisture stress, and drone dispatch triggers.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700 mt-3 flex items-center gap-1 group-hover:translate-x-1 transition">
            View Anomaly Heatmap &rarr;
          </span>
        </div>

        {/* Pillar 3: Crop Doctor Alert Center */}
        <div
          onClick={() => onNavigate('alert_center')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-rose-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <BellRing className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900">Crop Doctor Alerts</h4>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 uppercase">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Real-time advisories for pest outbreaks, weather risks, spray timing, and government schemes.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-700 mt-3 flex items-center gap-1 group-hover:translate-x-1 transition">
            Open Alert Command Center &rarr;
          </span>
        </div>

        {/* Pillar 4: Financial Risk */}
        <div
          onClick={() => onNavigate('financial_risk')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-yellow-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900">Financial Risk</h4>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-yellow-100 text-yellow-900 uppercase">
                PMFBY
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Calculate PMFBY yield loss claims, revenue-at-risk projections, and Kisan Credit Card health scores.
            </p>
          </div>
          <span className="text-xs font-bold text-yellow-700 mt-3 flex items-center gap-1 group-hover:translate-x-1 transition">
            Calculate Loss & Claims &rarr;
          </span>
        </div>
      </div>

      {/* Kisan Mitra Agricultural Assistant Teaser Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-5 text-white shadow-md border border-emerald-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 shrink-0 border border-white/20">
            <Bot className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-base text-white">
                AgroBot AI Farm Companion (Kisan Mitra)
              </h4>
              <span className="text-[9px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                Active
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              {language === 'kn'
                ? 'ನಿಮ್ಮ ತೋಟದ ಬೆಳೆ ರೋಗ, ರಸಗೊಬ್ಬರ, ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿಗಳಿಗೆ ತಕ್ಷಣದ ಎಐ ಸಲಹೆ ಪಡೆಯಿರಿ.'
                : 'Interactive precision agronomy assistant: Ask any question about plant diseases, spray windows, or PMFBY claims.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('farmer_bot')}
          className="shrink-0 bg-white text-emerald-950 hover:bg-emerald-50 px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
        >
          <span>{language === 'kn' ? 'ಎಐ ಸಲಹೆಗಾರರೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ' : 'Chat with AgroBot'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Cultivated Area */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t.totalArea}</span>
            <Sprout className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900">
            {activeFarm?.areaAcres || totalAcres} <span className="text-xs font-normal text-slate-500">{t.acres}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {activeFarm?.areaHectares || totalHectares} {t.hectares} &bull; {allFarms.length} {t.farms}
          </div>
        </div>

        {/* Mean Sentinel-2 NDVI */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t.avgNdviScore}</span>
            <Satellite className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-2xl font-black text-emerald-600">
              {satelliteObs?.meanNdvi || 0.68}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              Healthy
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Sentinel-2B &bull; {satelliteObs ? new Date(satelliteObs.acquisitionDate).toLocaleDateString() : 'Recent'}
          </div>
        </div>

        {/* Active Alerts */}
        <div
          onClick={() => onNavigate('notifications')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t.activeAlerts}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-amber-600">
            {activeAlerts.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
            <span>{t.requiringAttention}</span>
            <ArrowRight className="w-3 h-3 text-amber-600" />
          </div>
        </div>

        {/* Drone Surveys & Connection Status */}
        <div
          onClick={() => onNavigate('drone_integration')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-400 transition"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t.droneInspectionsCount}</span>
            <Plane className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 flex items-center justify-between">
            <span>
              {droneInspection?.bushesInspectedCount || 420}{' '}
              <span className="text-xs font-normal text-slate-500">{t.bushesSurveyed}</span>
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                droneDevice?.connection_status === 'Connected'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {droneDevice?.connection_status || 'Disconnected'}
            </span>
          </div>
          <div className="text-[11px] text-blue-600 mt-0.5 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  droneDevice?.connection_status === 'Connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-slate-400'
                }`}
              />
              {droneDevice?.model || 'Matrice 300 RTK'}
            </span>
            <span className="text-slate-500 font-semibold">{droneDevice?.battery_percentage ?? 88}% ⚡</span>
          </div>
        </div>

        {/* Current Weather / Risk */}
        <div
          onClick={() => onNavigate('weather')}
          className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-4 rounded-2xl shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-300 text-xs mb-1">
            <span>{t.weatherStation}</span>
            <CloudSun className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black">
            {weather?.current.temperature ?? 24.2}°C
          </div>
          <div className="text-[11px] text-emerald-200/90 mt-0.5 flex items-center justify-between">
            <span>RH: {weather?.current.relativeHumidity ?? 84}%</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/80 text-white">
              Rust Risk High
            </span>
          </div>
        </div>
      </div>

      {/* Main Map & Live Satellite Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm GIS Map Column */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {t.gpsMapping} &amp; {t.satelliteMonitoring}
              </h3>
              <p className="text-xs text-slate-500">
                Interactive parcel boundaries with Sentinel-2 reflectance and drone flight paths
              </p>
            </div>

            {/* Overlay Toggles */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowNdviOnDashboard(!showNdviOnDashboard)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1 ${
                  showNdviOnDashboard
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Layers className="w-3 h-3" />
                NDVI Heatmap
              </button>
              <button
                type="button"
                onClick={() => setShowDroneOnDashboard(!showDroneOnDashboard)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1 ${
                  showDroneOnDashboard
                    ? 'bg-blue-100 border-blue-400 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Plane className="w-3 h-3" />
                Drone Path
              </button>
            </div>
          </div>

          {/* Interactive Map */}
          <FarmMap
            farm={activeFarm}
            allFarms={allFarms}
            onSelectFarm={onSelectFarm}
            showNdviOverlay={showNdviOnDashboard}
            showDroneOverlay={showDroneOnDashboard}
            satelliteObs={satelliteObs}
            droneInspection={droneInspection}
            anomalies={anomalies}
            inspectionTasks={inspectionTasks}
            droneImages={droneImages}
            onSendForInspection={() => onNavigate('drone_integration')}
            language={language}
          />
        </div>

        {/* Right Side: Latest Satellite Pass & Anomaly Alert */}
        <div className="space-y-6">
          {/* Latest Sentinel-2 Observation Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Satellite className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t.latestSatellitePass}</h4>
                  <span className="text-[10px] text-slate-500">
                    {satelliteObs?.satellite || 'Sentinel-2B'} &bull; Tile {satelliteObs?.tileId || 'T43PFS'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('satellite')}
                className="text-xs text-emerald-700 hover:underline font-semibold"
              >
                {t.viewDetails} &rarr;
              </button>
            </div>

            {/* Overpass Specs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  {t.cloudCover}
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {satelliteObs?.cloudCoveragePercent ?? 4.2}%
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">Optimal Clear Sky</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Sun Zenith Angle
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {satelliteObs?.sunZenithAngle ?? 32.4}°
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">10m Spatial Res</span>
              </div>
            </div>

            {/* Canopy Health Proportions */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-700 block">Canopy Health Distribution</span>
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${satelliteObs?.healthyAreaPercent ?? 71.5}%` }}
                  title="Healthy >0.6"
                />
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: `${satelliteObs?.moderateAreaPercent ?? 18.2}%` }}
                  title="Moderate 0.45-0.6"
                />
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${satelliteObs?.stressedAreaPercent ?? 10.3}%` }}
                  title="Stressed <0.45"
                />
              </div>

              <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[11px]">
                <div className="text-emerald-700">
                  <strong>{satelliteObs?.healthyAreaPercent ?? 71.5}%</strong>
                  <span className="block text-[10px] text-slate-500">{t.healthyCanopy}</span>
                </div>
                <div className="text-amber-700">
                  <strong>{satelliteObs?.moderateAreaPercent ?? 18.2}%</strong>
                  <span className="block text-[10px] text-slate-500">{t.moderateStress}</span>
                </div>
                <div className="text-red-700">
                  <strong>{satelliteObs?.stressedAreaPercent ?? 10.3}%</strong>
                  <span className="block text-[10px] text-slate-500">{t.criticalZone}</span>
                </div>
              </div>
            </div>

            {/* Formula Reference Disclaimer */}
            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 text-[11px] text-emerald-900 leading-tight">
              <strong>NDVI = (NIR - RED) / (NIR + RED)</strong>
              <p className="text-[10px] text-emerald-800 mt-0.5">
                Calculated on ESA Sentinel-2 Band 8 (842nm) and Band 4 (665nm).
              </p>
            </div>
          </div>

          {/* Stressed Zone Alert Box */}
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-sm">{t.stressedPatchDetected}</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                {anomalies?.length ?? 2} Anomalies Detected
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Sentinel-2 NDVI drop detected ({anomalies?.[0]?.drop_percentage ?? 37.1}% drop) in South-East Block. Drone inspection needed to verify Coffee Leaf Rust or water stress before ground treatment.
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigate('drone_integration')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <Plane className="w-3.5 h-3.5" />
                <span>Dispatch Drone Mission</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('disease_detection')}
                className="bg-white text-amber-800 border border-amber-300 font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-amber-100 transition"
              >
                Inspect Leaf Photo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent AI Detections & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Disease Detections */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              Recent AI Leaf Diagnostics
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('disease_detection')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              + Run New Scan
            </button>
          </div>

          <div className="space-y-3">
            {recentDetections.slice(0, 3).map((det) => (
              <div
                key={det.id}
                onClick={() => onNavigate('disease_detection')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 transition cursor-pointer flex gap-3 items-center"
              >
                <img
                  src={det.imageUrl}
                  alt={det.conditionName}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="font-bold text-xs text-slate-900 truncate">{det.conditionName}</h5>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        det.severity === 'Severe'
                          ? 'bg-red-100 text-red-700'
                          : det.severity === 'Moderate'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {det.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic truncate mt-0.5">{det.scientificName}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>Confidence: <strong className="text-emerald-700">{det.confidence}%</strong></span>
                    <span>{new Date(det.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Weather & Spraying Windows */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-emerald-600" />
              Agro-Meteorological Advisory
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('weather')}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              14-Day Forecast &amp; Climate &rarr;
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-red-500" />
                Temperature:
              </span>
              <strong className="text-slate-800">{weather?.current.temperature ?? 24.2}°C</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-500" />
                Relative Humidity:
              </span>
              <strong className="text-slate-800">{weather?.current.relativeHumidity ?? 84}%</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-cyan-500" />
                Wind Speed:
              </span>
              <strong className="text-slate-800">{weather?.current.windSpeed ?? 8.5} km/h</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-red-800">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t.rustRiskIndex}: HIGH
            </div>
            <p className="text-[11px] text-red-800 leading-relaxed">
              {language === 'kn'
                ? weather?.agriculturalRisks.explanationKn
                : weather?.agriculturalRisks.explanationEn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
