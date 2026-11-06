import React, { useState } from 'react';
import { Language, User } from '../../types';
import { useTranslation } from '../../i18n/translations';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Globe,
  MapPin,
  Languages,
  X,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language,
}) => {
  const t = useTranslation(language);

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [stateName, setStateName] = useState('Karnataka');
  const [prefLang, setPrefLang] = useState<Language>(language);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  // Demo user fast login
  const handleFastDemoLogin = (farmerKey: 'chikmagalur' | 'colombia' | 'ethiopia') => {
    let demoUser: User;
    if (farmerKey === 'colombia') {
      demoUser = {
        id: 'usr_carlos_02',
        name: 'Carlos Mendez',
        email: 'carlos.mendez@huilacoffee.co',
        phone: '+57 312 849 2011',
        country: 'Colombia',
        state: 'Huila',
        preferredLanguage: 'en',
        createdAt: '2025-04-10T10:00:00Z',
      };
    } else if (farmerKey === 'ethiopia') {
      demoUser = {
        id: 'usr_abebe_03',
        name: 'Abebe Bekele',
        email: 'abebe.bekele@yirgacheffe.org',
        phone: '+251 91 123 4567',
        country: 'Ethiopia',
        state: 'Gedeo SNNPR',
        preferredLanguage: 'en',
        createdAt: '2025-06-20T10:00:00Z',
      };
    } else {
      demoUser = {
        id: 'usr_farmer_01',
        name: 'Ramesh Gowda',
        email: 'ramesh.gowda@malnadagro.com',
        phone: '+91 98452 38190',
        country: 'India',
        state: 'Karnataka',
        preferredLanguage: 'kn',
        createdAt: '2025-01-15T08:00:00Z',
      };
    }
    onLoginSuccess(demoUser);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'forgot') {
      setResetSent(true);
      setTimeout(() => {
        setResetSent(false);
        setMode('login');
      }, 3000);
      return;
    }

    if (mode === 'register') {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: name || 'Registered Farmer',
        email,
        phone: phone || '+91 98000 00000',
        country,
        state: stateName,
        preferredLanguage: prefLang,
        createdAt: new Date().toISOString(),
      };
      onLoginSuccess(newUser);
      onClose();
    } else {
      // Login
      const loggedUser: User = {
        id: 'usr_farmer_01',
        name: name || 'Ramesh Gowda',
        email: email || 'farmer@agrovision.ai',
        phone: '+91 98452 38190',
        country: 'India',
        state: 'Karnataka',
        preferredLanguage: language,
        createdAt: new Date().toISOString(),
      };
      onLoginSuccess(loggedUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full relative border border-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Branding Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto mb-3 shadow-md text-xl">
            🌾
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {mode === 'login' && t.login}
            {mode === 'register' && t.register}
            {mode === 'forgot' && 'Reset Password'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            AgroVision AI Global Farmer Authentication Portal
          </p>
        </div>

        {/* Fast Demo Account Selector */}
        {mode === 'login' && (
          <div className="mb-5 bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Quick Demo Farmer Login:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => handleFastDemoLogin('chikmagalur')}
                className="bg-white hover:bg-emerald-100/60 text-slate-800 p-1.5 rounded-lg border border-emerald-200 font-bold transition text-center"
              >
                🇮🇳 Ramesh (Chikmagalur)
              </button>
              <button
                type="button"
                onClick={() => handleFastDemoLogin('colombia')}
                className="bg-white hover:bg-emerald-100/60 text-slate-800 p-1.5 rounded-lg border border-emerald-200 font-bold transition text-center"
              >
                🇨🇴 Carlos (Huila)
              </button>
              <button
                type="button"
                onClick={() => handleFastDemoLogin('ethiopia')}
                className="bg-white hover:bg-emerald-100/60 text-slate-800 p-1.5 rounded-lg border border-emerald-200 font-bold transition text-center"
              >
                🇪🇹 Abebe (Yirgacheffe)
              </button>
            </div>
          </div>
        )}

        {resetSent && (
          <div className="mb-4 bg-emerald-100 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Password reset instructions dispatched to your email.</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
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
                  placeholder="e.g. Ramesh Gowda"
                  className="w-full text-xs p-2.5 pl-8 rounded-xl border border-slate-300 outline-none"
                />
                <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          )}

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
                placeholder="farmer@example.com"
                className="w-full text-xs p-2.5 pl-8 rounded-xl border border-slate-300 outline-none"
              />
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 pl-8 rounded-xl border border-slate-300 outline-none"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98452 38190"
                    className="w-full text-xs p-2.5 pl-8 rounded-xl border border-slate-300 outline-none"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Language
                </label>
                <select
                  value={prefLang}
                  onChange={(e) => setPrefLang(e.target.value as Language)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 outline-none bg-white"
                >
                  <option value="en">English (Global)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="es">Español (Spanish)</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm mt-2"
          >
            {mode === 'login' && 'Sign In to AgroVision'}
            {mode === 'register' && 'Complete Registration'}
            {mode === 'forgot' && 'Send Reset Link'}
          </button>
        </form>

        {/* Footer Mode Switchers */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
          {mode === 'login' ? (
            <>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-slate-500 hover:text-emerald-700 font-medium"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-emerald-700 hover:underline font-bold"
              >
                Create Account &rarr;
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-emerald-700 hover:underline font-bold mx-auto"
            >
              &larr; Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
