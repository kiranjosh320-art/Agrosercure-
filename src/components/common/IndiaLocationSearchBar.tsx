import React, { useState, useEffect, useRef } from 'react';
import { IndiaLocationResult, IndiaLocationService, POPULAR_INDIAN_AGRI_LOCATIONS } from '../../services/indiaLocationService';
import { Search, MapPin, X, Navigation, Loader2, Sparkles, Check, Mountain } from 'lucide-react';

interface IndiaLocationSearchBarProps {
  onSelectLocation: (location: IndiaLocationResult) => void;
  selectedLocationName?: string;
  placeholder?: string;
  showQuickChips?: boolean;
  className?: string;
}

export const IndiaLocationSearchBar: React.FC<IndiaLocationSearchBarProps> = ({
  onSelectLocation,
  selectedLocationName,
  placeholder = 'Search any location across India (e.g. Chikmagalur, Wayanad, Coorg, Ooty, Nashik, Ludhiana, Araku...)',
  showQuickChips = true,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IndiaLocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Query Changes with Debounce
  const handleQueryChange = (val: string) => {
    setQuery(val);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setResults(POPULAR_INDIAN_AGRI_LOCATIONS.slice(0, 10));
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const matches = await IndiaLocationService.searchAnyLocation(val);
        setResults(matches);
      } catch (err) {
        console.warn('Location search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);
  };

  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleSelect = (loc: IndiaLocationResult) => {
    setQuery(loc.name);
    setIsOpen(false);
    setGpsError(null);
    onSelectLocation(loc);
  };

  const handleUseCurrentLocation = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const loc = await IndiaLocationService.reverseGeocode(lat, lng);
        setGpsLoading(false);
        if (loc) {
          handleSelect(loc);
        } else {
          handleSelect({
            id: `gps_${Date.now()}`,
            name: `My Location (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
            state: 'India',
            country: 'India',
            latitude: Number(lat.toFixed(4)),
            longitude: Number(lng.toFixed(4)),
            elevation: 800,
            specialty: 'Current GPS Location',
          });
        }
      },
      (err) => {
        setGpsLoading(false);
        console.warn('GPS location error:', err);
        setGpsError('Could not retrieve GPS location. Please check browser location permissions.');
        setTimeout(() => setGpsError(null), 5000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Quick Agricultural Hubs
  const quickHubs = [
    { label: '☕ Chikmagalur', id: 'in_chikkamagaluru' },
    { label: '🌿 Coorg (Madikeri)', id: 'in_madikeri' },
    { label: '🍃 Sakleshpur', id: 'in_sakleshpur' },
    { label: '🌱 Wayanad', id: 'in_kalpetta' },
    { label: '🍵 Munnar', id: 'in_munnar' },
    { label: '🏔️ Ooty / Nilgiris', id: 'in_ooty' },
    { label: '🍇 Nashik', id: 'in_nashik' },
    { label: '☕ Araku Valley', id: 'in_araku_valley' },
    { label: '🌾 Ludhiana', id: 'in_ludhiana' },
    { label: '🍎 Shimla', id: 'in_shimla' },
    { label: '🍃 Darjeeling', id: 'in_darjeeling' },
  ];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onFocus={() => {
            setIsOpen(true);
            if (!query.trim()) {
              setResults(POPULAR_INDIAN_AGRI_LOCATIONS.slice(0, 10));
            }
          }}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl pl-10 pr-24 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium shadow-sm transition outline-none"
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin mr-1" />
          )}

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults(POPULAR_INDIAN_AGRI_LOCATIONS.slice(0, 10));
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* GPS Quick Locate Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={gpsLoading}
            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition shadow-xs disabled:opacity-50"
            title="Use current GPS location"
          >
            {gpsLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-emerald-700" />
            )}
            <span className="hidden sm:inline">GPS</span>
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="mt-1 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
          ⚠️ {gpsError}
        </div>
      )}

      {/* Quick Location Chips */}
      {showQuickChips && (
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 text-xs no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 mr-1">
            Popular Hubs:
          </span>
          {quickHubs.map((hub) => {
            const loc = POPULAR_INDIAN_AGRI_LOCATIONS.find((l) => l.id === hub.id);
            if (!loc) return null;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => handleSelect(loc)}
                className="shrink-0 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-xl text-[11px] font-medium transition"
              >
                {hub.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Dropdown Suggestions List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-80 overflow-y-auto z-50 text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95">
          <div className="p-2.5 bg-slate-50 text-[11px] font-bold text-slate-500 flex items-center justify-between border-b border-slate-100">
            <span>
              {query.trim()
                ? `Results for "${query}" across India`
                : 'Popular Indian Agricultural Districts & Plantation Hubs'}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              {results.length} locations found
            </span>
          </div>

          {results.length === 0 ? (
            <div className="p-5 text-center text-slate-500">
              <MapPin className="w-6 h-6 mx-auto text-slate-300 mb-1" />
              <p className="font-semibold text-slate-700">No matching Indian locations found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Try searching with district name, taluk, or village (e.g., "Madikeri", "Sakleshpur", "Kalpetta")
              </p>
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left p-3 hover:bg-emerald-50/70 transition flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 transition">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-slate-900 group-hover:text-emerald-950 text-xs sm:text-sm">
                        {item.name}
                      </span>
                      {item.district && item.district !== item.name && (
                        <span className="text-slate-500 text-[11px]">
                          ({item.district})
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.state}
                      </span>
                    </div>

                    {item.specialty && (
                      <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                        {item.specialty}
                      </p>
                    )}

                    <div className="flex items-center gap-2.5 text-[10px] text-slate-400 mt-1">
                      <span className="flex items-center gap-0.5">
                        <Mountain className="w-3 h-3 text-slate-400" />
                        {item.elevation} m MSL
                      </span>
                      <span>&bull;</span>
                      <span>
                        {item.latitude.toFixed(3)}°N, {item.longitude.toFixed(3)}°E
                      </span>
                    </div>
                  </div>
                </div>

                <span className="shrink-0 text-emerald-700 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition mt-2">
                  Select &rarr;
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
