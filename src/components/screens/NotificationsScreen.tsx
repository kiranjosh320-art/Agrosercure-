import React, { useState } from 'react';
import { ActiveScreen, Language, NotificationItem } from '../../types';
import { useTranslation } from '../../i18n/translations';
import {
  Bell,
  AlertTriangle,
  Stethoscope,
  CloudSun,
  Satellite,
  Plane,
  CheckCircle,
  Filter,
} from 'lucide-react';

interface NotificationsScreenProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (screen: ActiveScreen) => void;
  language: Language;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
  language,
}) => {
  const t = useTranslation(language);
  const [filterType, setFilterType] = useState<string>('all');

  const filtered =
    filterType === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filterType);

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'stress':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'disease':
        return <Stethoscope className="w-5 h-5 text-red-500" />;
      case 'weather':
        return <CloudSun className="w-5 h-5 text-cyan-500" />;
      case 'satellite':
        return <Satellite className="w-5 h-5 text-emerald-500" />;
      case 'drone':
        return <Plane className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t.notifications}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time automated alerts distinguishing between <strong>suspected remote-sensing crop stress</strong> and <strong>confirmed disease diagnosis</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={onMarkAllRead}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition self-start sm:self-auto"
        >
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {['all', 'stress', 'disease', 'weather', 'satellite', 'drone'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilterType(f)}
            className={`px-3.5 py-2 rounded-xl capitalize transition ${
              filterType === f
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All Alerts' : f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-2" />
            <p className="text-sm font-semibold">No alerts matching this filter.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onMarkRead(item.id);
                if (item.linkScreen) {
                  onNavigate(item.linkScreen as ActiveScreen);
                }
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                !item.read
                  ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-100 shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-bold text-sm text-slate-900">
                    {language === 'kn' ? item.titleKn : item.titleEn}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.date).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {language === 'kn' ? item.messageKn : item.messageEn}
                </p>

                <div className="mt-2.5 flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.severity === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : item.severity === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.severity}
                  </span>

                  {item.linkScreen && (
                    <span className="text-xs font-semibold text-emerald-700 hover:underline">
                      View in {item.linkScreen} &rarr;
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
