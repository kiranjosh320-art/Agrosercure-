import React, { useState } from 'react';
import { ActiveScreen, Farm, Language, NotificationItem, User } from '../types';
import {
  Sprout,
  Satellite,
  MapPin,
  Stethoscope,
  Plane,
  CloudSun,
  FileText,
  Bell,
  Languages,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Check,
  Bot,
  ShieldCheck,
  Activity,
  BellRing,
  IndianRupee,
  ScanLine,
} from 'lucide-react';
import { languageList, useTranslation } from '../i18n/translations';

interface NavbarProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  language: Language;
  onToggleLanguage: () => void;
  onSelectLanguage: (lang: Language) => void;
  farms: Farm[];
  activeFarm?: Farm;
  onSelectFarm: (farmId: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  onNavigate,
  language,
  onToggleLanguage,
  onSelectLanguage,
  farms,
  activeFarm,
  onSelectFarm,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  user,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  const t = useTranslation(language);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: { id: ActiveScreen; label: string; icon: React.ReactNode; isNew?: boolean; badge?: string }[] = [
    { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'crop_detector', label: t.cropDetector || 'AI Plant Identifier', icon: <ScanLine className="w-4 h-4 text-emerald-400" />, isNew: true, badge: 'AI' },
    { id: 'disease_detection', label: 'Disease Lab', icon: <Stethoscope className="w-4 h-4 text-teal-300" /> },
    { id: 'farmer_bot', label: t.farmerBot || 'AgroBot AI', icon: <Bot className="w-4 h-4 text-emerald-300" />, isNew: true, badge: 'AI' },
    { id: 'anomaly_engine', label: t.anomalyEngine || 'Anomaly Engine', icon: <Activity className="w-4 h-4 text-amber-400" />, isNew: true, badge: 'HOT' },
    { id: 'alert_center', label: t.cropDoctor || 'Crop Doctor Alerts', icon: <BellRing className="w-4 h-4 text-rose-400" />, isNew: true, badge: 'ALERT' },
    { id: 'financial_risk', label: t.financialRisk || 'Financial Risk', icon: <IndianRupee className="w-4 h-4 text-yellow-300" />, isNew: true, badge: 'PMFBY' },
    { id: 'mapping', label: t.gpsMapping, icon: <MapPin className="w-4 h-4" /> },
    { id: 'satellite', label: t.satelliteMonitoring, icon: <Satellite className="w-4 h-4" /> },
    { id: 'drone_integration', label: t.droneIntegrationTitle || t.droneInspection, icon: <Plane className="w-4 h-4" /> },
    { id: 'weather', label: t.weatherStation, icon: <CloudSun className="w-4 h-4" /> },
    { id: 'reports', label: t.reports, icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-emerald-950 text-white shadow-xl border-b border-emerald-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 p-0.5 shadow-md flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1">
                  AgroSecure <span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-800/80 text-emerald-300 border border-emerald-600/60 uppercase">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80 hidden sm:block leading-none mt-0.5">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Active Farm Selector */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
              className="flex items-center gap-2 bg-emerald-900/80 hover:bg-emerald-800/90 border border-emerald-700/80 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-100 transition shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  {t.selectActiveFarm}
                </div>
                <div className="font-semibold truncate max-w-[170px] text-white">
                  {activeFarm?.name || 'Select Farm'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-300 ml-1" />
            </button>

            {farmDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800 flex justify-between items-center">
                  <span>{t.farms}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFarmDropdownOpen(false);
                      onNavigate('add_farm');
                    }}
                    className="text-emerald-400 hover:underline"
                  >
                    + {t.addFarm}
                  </button>
                </div>
                {farms.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      onSelectFarm(f.id);
                      setFarmDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-emerald-950/80 transition ${
                      f.id === activeFarm?.id ? 'bg-emerald-950 text-emerald-300 font-bold' : 'text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {f.locationName} &bull; {f.areaAcres} {t.acres}
                      </div>
                    </div>
                    {f.id === activeFarm?.id && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Controls: Language, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Multi-Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="flex items-center gap-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 hover:text-white px-2.5 py-1.5 rounded-xl border border-emerald-700/80 text-xs font-semibold transition shadow-sm"
                title={t.quickLanguageSwitch}
              >
                <Languages className="w-4 h-4 text-emerald-400" />
                <span className="hidden xs:inline">
                  {languageList.find((l) => l.code === language)?.label || 'Language'}
                </span>
                <span className="xs:hidden uppercase font-bold text-[11px] text-emerald-300">
                  {language}
                </span>
                <ChevronDown className="w-3 h-3 text-emerald-300 ml-0.5" />
              </button>

              {languageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
                    {t.changeLanguagePrompt}
                  </div>
                  {languageList.map((langItem) => {
                    const isCurrent = langItem.code === language;
                    return (
                      <button
                        key={langItem.code}
                        type="button"
                        onClick={() => {
                          onSelectLanguage(langItem.code);
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between transition ${
                          isCurrent
                            ? 'bg-emerald-950 text-emerald-300 font-bold'
                            : 'text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{langItem.flag}</span>
                          <span>{langItem.label}</span>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white transition"
                title={t.notifications}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-800 flex justify-between items-center text-slate-300">
                    <span className="font-bold flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-emerald-400" />
                      {t.notifications} ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={onMarkAllNotificationsRead}
                        className="text-[11px] text-emerald-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/80">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">No new alerts</div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            onMarkNotificationRead(notif.id);
                            if (notif.linkScreen) {
                              onNavigate(notif.linkScreen as ActiveScreen);
                              setNotifDropdownOpen(false);
                            }
                          }}
                          className={`p-3 cursor-pointer hover:bg-slate-800/70 transition flex gap-2.5 ${
                            !notif.read ? 'bg-emerald-950/40' : ''
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              notif.severity === 'critical'
                                ? 'bg-red-500 animate-pulse'
                                : notif.severity === 'warning'
                                ? 'bg-amber-400'
                                : 'bg-blue-400'
                            }`}
                          />
                          <div>
                            <p className="font-semibold text-slate-100">
                              {language === 'kn' ? notif.titleKn : notif.titleEn}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {language === 'kn' ? notif.messageKn : notif.messageEn}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {new Date(notif.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-slate-800 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        onNavigate('notifications');
                      }}
                      className="text-xs text-emerald-400 hover:underline font-medium"
                    >
                      {t.viewDetails} &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 bg-emerald-900/60 hover:bg-emerald-800 text-white p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-emerald-700/60 transition"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline text-xs font-semibold">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-emerald-300 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-bold text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                      {user.state}, {user.country}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('profile');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                    {t.userProfile}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-900/40 text-red-300 flex items-center gap-2 border-t border-slate-800"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    {t.logout}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 py-1.5 border-t border-emerald-900/60 text-xs font-semibold overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-100/90 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.isNew && (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ml-0.5 shadow-2xs ${
                      item.badge === 'ALERT'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : item.badge === 'HOT'
                        ? 'bg-amber-400 text-slate-950'
                        : item.badge === 'PMFBY'
                        ? 'bg-yellow-300 text-slate-950'
                        : 'bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {item.badge || 'AI'}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1 text-sm">
          {/* Mobile Farm Selector */}
          <div className="pb-3 border-b border-slate-800 mb-2">
            <span className="text-xs uppercase text-slate-400 font-bold block mb-1">
              {t.selectActiveFarm}:
            </span>
            <select
              value={activeFarm?.id || ''}
              onChange={(e) => onSelectFarm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.locationName})
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Language Selector */}
          <div className="pb-3 border-b border-slate-800 mb-2">
            <span className="text-xs uppercase text-slate-400 font-bold block mb-1">
              {t.language}:
            </span>
            <select
              value={language}
              onChange={(e) => onSelectLanguage(e.target.value as Language)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2"
            >
              {languageList.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left ${
                  isActive ? 'bg-emerald-700 text-white font-bold' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
