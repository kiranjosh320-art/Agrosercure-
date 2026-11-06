import React, { useState } from 'react';
import { ActiveScreen, Farm, Language, WeatherData, CropDoctorAlert } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { CropDoctorService } from '../../services/cropDoctorService';
import { IndiaLocationSearchBar } from '../common/IndiaLocationSearchBar';
import { IndiaLocationResult } from '../../services/indiaLocationService';
import {
  BellRing,
  AlertTriangle,
  Bug,
  CloudLightning,
  Droplets,
  Building,
  CheckCircle2,
  ExternalLink,
  Bot,
  Filter,
  Wind,
  Printer,
  ChevronRight,
  ShieldCheck,
  Search,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';

interface CropDoctorAlertCenterScreenProps {
  activeFarm?: Farm;
  weather?: WeatherData;
  onNavigate: (screen: ActiveScreen) => void;
  onAskBotWithPrompt?: (prompt: string) => void;
  language: Language;
}

export const CropDoctorAlertCenterScreen: React.FC<CropDoctorAlertCenterScreenProps> = ({
  activeFarm,
  weather,
  onNavigate,
  onAskBotWithPrompt,
  language,
}) => {
  const t = useTranslation(language);

  const [alerts, setAlerts] = useState<CropDoctorAlert[]>(() => CropDoctorService.getAlerts());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchDistrict, setSearchDistrict] = useState<string>('');
  const [exportNoticeModal, setExportNoticeModal] = useState<CropDoctorAlert | null>(null);

  const sprayWindow = CropDoctorService.calculateSprayingWindow(weather);

  const filteredAlerts = alerts.filter((a) => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && a.severity !== selectedSeverity) return false;
    if (searchDistrict && !a.locationState?.toLowerCase().includes(searchDistrict.toLowerCase()) && !a.district?.toLowerCase().includes(searchDistrict.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleAcknowledge = (id: string) => {
    CropDoctorService.acknowledgeAlert(id);
    setAlerts(CropDoctorService.getAlerts());
  };

  const handleResolve = (id: string) => {
    CropDoctorService.resolveAlert(id);
    setAlerts(CropDoctorService.getAlerts());
  };

  const handleAskDoctor = (alertItem: CropDoctorAlert) => {
    const question = `Crop Doctor Alert: How should I address "${alertItem.titleEn}" on my farm? What are the specific chemical and organic dosages?`;
    if (onAskBotWithPrompt) {
      onAskBotWithPrompt(question);
    }
    onNavigate('farmer_bot');
  };

  const handleSelectIndianLocation = (loc: IndiaLocationResult) => {
    setSearchDistrict(loc.district || loc.name);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pest_disease':
        return <Bug className="w-5 h-5 text-rose-600" />;
      case 'extreme_weather':
        return <CloudLightning className="w-5 h-5 text-amber-600" />;
      case 'spray_window':
        return <Wind className="w-5 h-5 text-blue-600" />;
      case 'irrigation':
        return <Droplets className="w-5 h-5 text-teal-600" />;
      case 'gov_mandi':
        return <Building className="w-5 h-5 text-emerald-600" />;
      default:
        return <BellRing className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-rose-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
            <BellRing className="w-7 h-7 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Crop Doctor <span className="text-rose-400">Alert Center</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white uppercase">
                Live Advisory
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Hyperlocal actionable warnings for plant epidemics, weather threats, spray windows, and PMFBY notices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('crop_detector')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-md"
          >
            <span>Scan Crop Leaf</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Spray Window & Weather Advisory Telemetry Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Spray Window Status */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs md:col-span-2 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Precision Spraying Window Calculator
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated from wind velocity, dew point, humidity & rain probability
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                sprayWindow.suitability === 'Favorable'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : sprayWindow.suitability === 'Caution'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {sprayWindow.suitability}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-semibold">Wind Speed</span>
              <span className="text-sm font-extrabold text-slate-800">
                {weather?.current.windSpeed?.toFixed(1) || '6.4'} km/h
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-semibold">Relative Humidity</span>
              <span className="text-sm font-extrabold text-slate-800">
                {weather?.current.relativeHumidity || '68'}%
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block font-semibold">Rain Probability</span>
              <span className="text-sm font-extrabold text-slate-800">
                {weather?.current.precipitationProbability ?? 12}%
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
            <strong>Advisory: </strong>
            {sprayWindow.reasons.join(' • ')}
          </div>
        </div>

        {/* Emergency Kisan Support Card */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 p-5 rounded-3xl text-white shadow-xs border border-emerald-800/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-extrabold text-sm text-white">Crop Protection Helpdesk</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Facing an unidentified epidemic or pest swarm? Connect with AgroBot Doctor or locate nearby Krishi Vigyan Kendra (KVK).
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <button
              type="button"
              onClick={() => onNavigate('farmer_bot')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AgroBot AI Assistant</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('financial_risk')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Assess Yield & Financial Risk &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Geocoding / Location Filter across India */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-600" />
            Filter Crop Alerts by Indian District / Taluk
          </span>
          {searchDistrict && (
            <button
              type="button"
              onClick={() => setSearchDistrict('')}
              className="text-[11px] text-rose-600 hover:underline font-bold"
            >
              Clear Filter ({searchDistrict})
            </button>
          )}
        </div>
        <IndiaLocationSearchBar
          onSelectLocation={handleSelectIndianLocation}
          placeholder="Type any Indian district (e.g. Chikmagalur, Wayanad, Coorg, Shimla, Nashik, Ludhiana)..."
        />
      </div>

      {/* Alert Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'pest_disease', label: '🦠 Pest & Disease' },
            { id: 'extreme_weather', label: '⛈️ Extreme Weather' },
            { id: 'spray_window', label: '🧪 Spray Window' },
            { id: 'irrigation', label: '💧 Soil Irrigation' },
            { id: 'gov_mandi', label: '🏛️ Schemes & Mandi' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs text-xs font-semibold">
          {[
            { id: 'all', label: 'All Severity' },
            { id: 'critical', label: 'Critical' },
            { id: 'warning', label: 'Warning' },
            { id: 'advisory', label: 'Advisory' },
          ].map((sev) => (
            <button
              key={sev.id}
              type="button"
              onClick={() => setSelectedSeverity(sev.id)}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedSeverity === sev.id
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards Feed */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-3xl border border-slate-200 text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
            <h3 className="text-base font-extrabold text-slate-800">All Clear! No Active Threats</h3>
            <p className="text-xs text-slate-400 mt-1">
              No agricultural alerts match the selected criteria for this location.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alertItem) => {
            const isResolved = alertItem.resolved;
            const isAck = alertItem.acknowledged;

            return (
              <div
                key={alertItem.id}
                className={`bg-white rounded-3xl p-5 border shadow-sm transition space-y-4 ${
                  alertItem.severity === 'critical'
                    ? 'border-rose-300 ring-2 ring-rose-500/10'
                    : alertItem.severity === 'warning'
                    ? 'border-amber-300'
                    : 'border-slate-200'
                } ${isResolved ? 'opacity-70 bg-slate-50' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200 shrink-0 mt-0.5">
                      {getCategoryIcon(alertItem.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            alertItem.severity === 'critical'
                              ? 'bg-rose-600 text-white animate-pulse'
                              : alertItem.severity === 'warning'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {alertItem.severity}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 capitalize">
                          {alertItem.category.replace('_', ' ')}
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(alertItem.date).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {language === 'kn' ? alertItem.titleKn : alertItem.titleEn}
                      </h3>
                      {language !== 'kn' && alertItem.titleKn && (
                        <p className="text-xs text-emerald-800 font-medium">
                          {alertItem.titleKn}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isResolved ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    ) : isAck ? (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        Acknowledged
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(alertItem.id)}
                        className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl transition"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'kn' ? alertItem.descriptionKn : alertItem.descriptionEn}
                </p>

                {/* Prescribed Action Banner */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <span className="font-extrabold block text-amber-900 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    Recommended Agronomic Action:
                  </span>
                  <p className="leading-relaxed">
                    {language === 'kn' ? alertItem.actionRequiredKn : alertItem.actionRequiredEn}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Source: {alertItem.source}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAskDoctor(alertItem)}
                      className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold transition text-[11px]"
                    >
                      <Bot className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Ask AgroBot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportNoticeModal(alertItem)}
                      className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-semibold transition text-[11px]"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print Notice</span>
                    </button>
                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => handleResolve(alertItem.id)}
                        className="text-[11px] font-bold text-emerald-700 hover:underline px-2"
                      >
                        Mark as Addressed &check;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Print Notice Modal */}
      {exportNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block">
                  Official Farm Protection Notice
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {exportNoticeModal.titleEn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExportNoticeModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-3">
              <p><strong>District:</strong> {exportNoticeModal.district || 'Karnataka'}</p>
              <p><strong>Threat Level:</strong> {exportNoticeModal.severity.toUpperCase()}</p>
              <p><strong>Description:</strong> {exportNoticeModal.descriptionEn}</p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <strong>Prescription:</strong> {exportNoticeModal.actionRequiredEn}
              </div>
              <p className="text-[10px] text-slate-400">Issued by AgroSecure Agronomic Diagnostic System &bull; {new Date().toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExportNoticeModal(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
