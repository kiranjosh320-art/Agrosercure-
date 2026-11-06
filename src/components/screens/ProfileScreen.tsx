import React, { useState } from 'react';
import { Language, User } from '../../types';
import { useTranslation } from '../../i18n/translations';
import {
  User as UserIcon,
  Mail,
  Phone,
  Globe,
  MapPin,
  Languages,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle,
  Key,
  ExternalLink,
} from 'lucide-react';

interface ProfileScreenProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onResetDefaults: () => void;
  language: Language;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onUpdateUser,
  onResetDefaults,
  language,
}) => {
  const t = useTranslation(language);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [country, setCountry] = useState(user.country);
  const [stateName, setStateName] = useState(user.state);
  const [prefLang, setPrefLang] = useState<Language>(user.preferredLanguage);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      name,
      email,
      phone,
      country,
      state: stateName,
      preferredLanguage: prefLang,
    };
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t.userProfile}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Farmer credentials, regional localization, and API configuration.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm('Reset application database to initial verified sample data?')) {
              onResetDefaults();
            }
          }}
          className="text-xs font-semibold text-slate-600 hover:text-red-600 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Database</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile preferences updated successfully!</span>
        </div>
      )}

      {/* Profile Edit Form */}
      <form
        onSubmit={handleSave}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5"
      >
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Farmer Registration Particulars
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 pl-8 rounded-xl border border-slate-300 outline-none"
              />
              <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 pl-8 rounded-xl border border-slate-300 outline-none"
              />
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mobile Number *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 pl-8 rounded-xl border border-slate-300 outline-none"
              />
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Preferred Language
            </label>
            <div className="relative">
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value as Language)}
                className="w-full text-xs p-2.5 pl-8 rounded-xl border border-slate-300 outline-none bg-white"
              >
                <option value="en">English (Global)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="es">Español (Spanish)</option>
              </select>
              <Languages className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Country
            </label>
            <div className="relative">
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full text-xs p-2.5 pl-8 rounded-xl border border-slate-300 outline-none"
              />
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              State / Province
            </label>
            <div className="relative">
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full text-xs p-2.5 pl-8 rounded-xl border border-slate-300 outline-none"
              />
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update Farmer Profile</span>
          </button>
        </div>
      </form>

      {/* External Integration & API Documentation Panel (Section 14 Requirement) */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Key className="w-4 h-4" />
          Enterprise Satellite &amp; AI Integration Architecture
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          AgroVision AI is designed for seamless scaling from local farms in Karnataka to coffee estates across Colombia, Brazil, and Ethiopia. External integrations operate as follows:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1">
            <span className="font-bold text-white block">1. Copernicus Sentinel-2</span>
            <p className="text-slate-400 text-[11px]">
              Direct connection to Copernicus Data Space Ecosystem (CDSE) / Sentinel Hub OAuth API for live Level-2A BOA tiles.
            </p>
          </div>
          <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1">
            <span className="font-bold text-white block">2. Google Gemini 3.8 Flash</span>
            <p className="text-slate-400 text-[11px]">
              Server-side vision model proxy analyzing microscopic leaf pathology features with zero browser key exposure.
            </p>
          </div>
          <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-1">
            <span className="font-bold text-white block">3. Open-Meteo Global</span>
            <p className="text-slate-400 text-[11px]">
              Keyless open agro-meteorological API delivering 7-day hourly forecasts and disease germination risk indices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
