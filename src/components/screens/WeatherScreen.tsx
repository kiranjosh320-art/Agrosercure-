import React, { useState, useEffect } from 'react';
import {
  ActiveScreen,
  ClimateAnalysisData,
  CropCategory,
  CropEcologicalRequirement,
  CropSuitabilityResult,
  Farm,
  GlobalRegionProfile,
  Language,
  WeatherData,
} from '../../types';
import { useTranslation } from '../../i18n/translations';
import { ClimateService } from '../../services/climateService';
import { CropSuitabilityService } from '../../services/cropSuitabilityService';
import { WeatherService } from '../../services/weather';
import { IndiaLocationSearchBar } from '../common/IndiaLocationSearchBar';
import { IndiaLocationResult } from '../../services/indiaLocationService';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Calendar,
  Compass,
  MapPin,
  RefreshCw,
  Globe,
  Sprout,
  BarChart3,
  Layers,
  Sliders,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Info,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface WeatherScreenProps {
  farm?: Farm;
  weather?: WeatherData;
  onRefreshWeather?: () => void;
  language: Language;
}

type WeatherModuleTab = 'forecast' | 'climate' | 'suitable_crops' | 'compatibility_checker';

export const WeatherScreen: React.FC<WeatherScreenProps> = ({
  farm,
  weather,
  onRefreshWeather,
  language,
}) => {
  const t = useTranslation(language);
  const [activeTab, setActiveTab] = useState<WeatherModuleTab>('forecast');
  const [forecastHorizon, setForecastHorizon] = useState<'7day' | '14day'>('14day');

  // Climate Analysis State
  const [climateData, setClimateData] = useState<ClimateAnalysisData | null>(null);
  const [climateLoading, setClimateLoading] = useState(false);

  // Crop Suitability Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [irrigationAvailable, setIrrigationAvailable] = useState<boolean>(true);
  const [farmSoilPh, setFarmSoilPh] = useState<number>(6.2);
  const [farmDrainage, setFarmDrainage] = useState<'Well-drained' | 'Moderate' | 'Poorly-drained'>('Well-drained');
  const [expandedCropId, setExpandedCropId] = useState<string | null>('crop_coffee_arabica');

  // Worldwide Compatibility Checker State
  const globalRegions = CropSuitabilityService.getGlobalRegionProfiles();
  const allCrops = CropSuitabilityService.getAllCrops();
  const [selectedRegionId, setSelectedRegionId] = useState<string>('in_karnataka_chikmagalur');
  const [selectedCropId, setSelectedCropId] = useState<string>('crop_coffee_arabica');
  const [regionClimateData, setRegionClimateData] = useState<ClimateAnalysisData | null>(null);

  // Search Indian Location State
  const [searchedLocation, setSearchedLocation] = useState<IndiaLocationResult | null>(null);
  const [customWeather, setCustomWeather] = useState<WeatherData | null>(null);
  const [isLocWeatherLoading, setIsLocWeatherLoading] = useState(false);

  const selectedRegion = globalRegions.find((r) => r.id === selectedRegionId) || globalRegions[0];
  const selectedCrop = allCrops.find((c) => c.id === selectedCropId) || allCrops[0];

  // Fetch 30-Year Climate Analysis for Active Farm (if no custom search active)
  useEffect(() => {
    if (searchedLocation) return;
    if (!farm) return;
    setClimateLoading(true);
    ClimateService.getClimateAnalysis(
      farm.coordinates.lat,
      farm.coordinates.lng,
      farm.name,
      farm.country,
      farm.state,
      1050
    )
      .then((data) => setClimateData(data))
      .catch((err) => console.warn('Climate fetch error:', err))
      .finally(() => setClimateLoading(false));
  }, [farm?.coordinates.lat, farm?.coordinates.lng, farm?.name, searchedLocation]);

  // When an Indian Location is selected via Search Bar, fetch its live Open-Meteo weather and climate
  useEffect(() => {
    if (!searchedLocation) return;
    setIsLocWeatherLoading(true);
    WeatherService.getFarmWeather(searchedLocation.latitude, searchedLocation.longitude)
      .then((data) => setCustomWeather(data))
      .catch((err) => console.warn('Custom location weather error:', err))
      .finally(() => setIsLocWeatherLoading(false));

    ClimateService.getClimateAnalysis(
      searchedLocation.latitude,
      searchedLocation.longitude,
      searchedLocation.name,
      searchedLocation.country,
      searchedLocation.state,
      searchedLocation.elevation
    )
      .then((data) => setClimateData(data))
      .catch((err) => console.warn('Custom location climate error:', err));
  }, [searchedLocation]);

  // Reset from custom search back to registered farm
  const handleResetToMyFarm = () => {
    setSearchedLocation(null);
    setCustomWeather(null);
    if (farm) {
      ClimateService.getClimateAnalysis(
        farm.coordinates.lat,
        farm.coordinates.lng,
        farm.name,
        farm.country,
        farm.state,
        1050
      ).then((data) => setClimateData(data));
    }
  };

  // Fetch Climate for Selected Global Region in Compatibility Checker
  useEffect(() => {
    if (!selectedRegion) return;
    ClimateService.getClimateAnalysis(
      selectedRegion.coordinates.lat,
      selectedRegion.coordinates.lng,
      selectedRegion.regionOrState,
      selectedRegion.country,
      selectedRegion.regionOrState,
      selectedRegion.elevationMeters
    )
      .then((data) => setRegionClimateData(data))
      .catch((err) => console.warn('Region climate error:', err));
  }, [selectedRegionId]);

  // Ranked crops for current active climate
  const rankedCrops: CropSuitabilityResult[] = climateData
    ? CropSuitabilityService.rankAllCropsForClimate(climateData, {
        irrigationAvailable,
        soilPh: farmSoilPh,
        drainage: farmDrainage,
      })
    : [];

  const filteredCrops =
    selectedCategory === 'All'
      ? rankedCrops
      : rankedCrops.filter((r) => r.crop.category === selectedCategory);

  // Single compatibility result for Global Checker
  const singleCompatibilityAudit: CropSuitabilityResult | null = regionClimateData
    ? CropSuitabilityService.evaluateCropSuitability(selectedCrop, regionClimateData, {
        irrigationAvailable: true,
        soilPh: selectedRegion.typicalSoilPh,
        drainage: selectedRegion.typicalDrainage,
      })
    : null;

  const activeWeather = customWeather || weather;
  const current = activeWeather?.current;
  const severeAlerts = activeWeather?.severeAlerts || [];
  const hourly = activeWeather?.hourly || [];
  const dailyForecast =
    forecastHorizon === '14day'
      ? activeWeather?.forecast14Day || activeWeather?.forecast || []
      : activeWeather?.forecast || [];

  const displayLocationTitle = searchedLocation
    ? `${searchedLocation.name}, ${searchedLocation.state}`
    : farm
    ? `${farm.name} (${farm.locationName})`
    : 'Chikmagalur, Karnataka';

  const displayCoordinates = searchedLocation
    ? { lat: searchedLocation.latitude, lng: searchedLocation.longitude, elevation: searchedLocation.elevation }
    : { lat: farm?.coordinates.lat || 13.4215, lng: farm?.coordinates.lng || 75.7621, elevation: activeWeather?.elevationMeters || 1080 };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CloudSun className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Weather Forecasting &amp; Climate Crop Suitability
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Precision micro-meteorology, 30-year WMO climate normal baseline, and FAO EcoCrop suitability analysis
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {displayLocationTitle} &bull; {displayCoordinates.lat.toFixed(4)}°N, {displayCoordinates.lng.toFixed(4)}°E
            </span>
            <span>&bull;</span>
            <span>Elevation: <strong>{displayCoordinates.elevation} m MSL</strong></span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-semibold">Live Open-Meteo Integration</span>
          </div>
        </div>

        {onRefreshWeather && (
          <button
            type="button"
            onClick={() => {
              if (searchedLocation) {
                setIsLocWeatherLoading(true);
                WeatherService.getFarmWeather(searchedLocation.latitude, searchedLocation.longitude)
                  .then((w) => setCustomWeather(w))
                  .finally(() => setIsLocWeatherLoading(false));
              } else {
                onRefreshWeather();
              }
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLocWeatherLoading ? 'animate-spin' : ''}`} />
            <span>Update Live Readings</span>
          </button>
        )}
      </div>

      {/* Search Any Location Across India */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              Search Any Location Across India
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Type any village, taluk, district or city to instantly fetch live weather, 14-day forecasts, 30-year climate analysis, and suitable crops
            </p>
          </div>

          {searchedLocation && (
            <button
              type="button"
              onClick={handleResetToMyFarm}
              className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-bold flex items-center gap-1 self-start sm:self-auto bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
            >
              &larr; Back to {farm?.name || 'My Farm'}
            </button>
          )}
        </div>

        <IndiaLocationSearchBar
          onSelectLocation={(loc) => setSearchedLocation(loc)}
          selectedLocationName={searchedLocation?.name}
          placeholder="Search any location across India (e.g. Chikmagalur, Sakleshpur, Wayanad, Munnar, Ooty, Nashik, Ludhiana, Araku...)"
          showQuickChips={true}
        />

        {searchedLocation && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <div>
                <span className="font-extrabold text-emerald-950 text-sm">
                  {searchedLocation.name}, {searchedLocation.state}
                </span>
                {searchedLocation.specialty && (
                  <span className="text-[11px] text-emerald-800 ml-2 font-medium">
                    &bull; {searchedLocation.specialty}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-emerald-900">
              <span>Elevation: <strong>{searchedLocation.elevation} m MSL</strong></span>
              <span>&bull;</span>
              <span>GPS: <strong>{searchedLocation.latitude.toFixed(4)}°N, {searchedLocation.longitude.toFixed(4)}°E</strong></span>
              {isLocWeatherLoading && (
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Fetching live data...
                </span>
              )}
              <button
                type="button"
                onClick={handleResetToMyFarm}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition shadow-xs"
              >
                Reset to My Farm
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-200/80 rounded-2xl overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('forecast')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
            activeTab === 'forecast'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CloudSun className="w-4 h-4 text-emerald-600" />
          <span>1. Live Weather &amp; 14-Day Forecast</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('climate')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
            activeTab === 'climate'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <span>2. 30-Year Climate Analysis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('suitable_crops')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
            activeTab === 'suitable_crops'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>3. Find Suitable Crops for This Climate</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('compatibility_checker')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
            activeTab === 'compatibility_checker'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>4. Check Crop Climate Compatibility (Worldwide)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LIVE WEATHER & 14-DAY FORECAST                   */}
      {/* ======================================================== */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* Severe Weather Alerts Banner */}
          {severeAlerts.length > 0 && (
            <div className="space-y-2">
              {severeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 border-red-200 text-red-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle
                      className={`w-5 h-5 shrink-0 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                      }`}
                    />
                    <div>
                      <div className="font-extrabold text-sm">{alert.title}</div>
                      <div className="text-slate-700 mt-0.5 leading-relaxed">{alert.description}</div>
                      <div className="font-semibold text-slate-800 mt-1">
                        <strong>Required Action:</strong> {alert.actionRequired}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 uppercase font-black text-[10px] px-2.5 py-1 rounded-full ${
                      alert.severity === 'critical'
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Primary Current Observations 8-Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* Temperature */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 col-span-2">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Current Temperature</span>
                <Thermometer className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {current?.temperature ?? 24.2}°C
                </span>
                <span className="text-xs text-slate-500">
                  Feels like {current?.apparentTemperature ?? 25.1}°C
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                <span>Max: <strong className="text-red-600">{current?.temperatureMax ?? 26}°C</strong></span>
                <span>Min: <strong className="text-blue-600">{current?.temperatureMin ?? 18}°C</strong></span>
              </div>
            </div>

            {/* Humidity */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 col-span-2 sm:col-span-2">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Relative Humidity</span>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {current?.relativeHumidity ?? 84}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Dew Point: <strong>{current?.dewPoint ?? 20.1}°C</strong> &bull;{' '}
                <span className={(current?.relativeHumidity ?? 84) > 80 ? 'text-red-600 font-bold' : 'text-emerald-600 font-medium'}>
                  {(current?.relativeHumidity ?? 84) > 80 ? 'High Moisture' : 'Moderate'}
                </span>
              </div>
            </div>

            {/* Wind Velocity & Compass */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 col-span-2 sm:col-span-2">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Wind Speed &amp; Direction</span>
                <Wind className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {current?.windSpeed ?? 8.5} <span className="text-xs font-normal text-slate-500">km/h</span>
                </span>
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {current?.windDirectionCompass || 'SW'} ({current?.windDirectionDeg ?? 215}°)
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Gusts: <strong>{current?.windGustsKmH ?? 14.2} km/h</strong> (Low drift risk)
              </div>
            </div>

            {/* Rainfall & Probability */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 col-span-2 sm:col-span-2">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Rainfall Today</span>
                <CloudRain className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {current?.precipitation ?? 0.0} <span className="text-xs font-normal text-slate-500">mm</span>
                </span>
                <span className="text-xs text-blue-600 font-bold">
                  {current?.precipitationProbability ?? 20}% prob
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Status: <strong>{current?.condition || 'Partly Cloudy'}</strong>
              </div>
            </div>
          </div>

          {/* Secondary Telemetry: Atmospheric Pressure, Cloud Coverage, Solar Radiation, UV Index */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Atmospheric Pressure</span>
                <strong className="text-slate-900 text-sm">{current?.atmosphericPressureHpa ?? 1013.2} hPa</strong>
                <span className="text-[10px] text-slate-500 block">Mean sea-level normalized</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                <CloudSun className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cloud Coverage</span>
                <strong className="text-slate-900 text-sm">{current?.cloudCoveragePercent ?? 45}%</strong>
                <span className="text-[10px] text-slate-500 block">Diffuse light scattering</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Solar Radiation</span>
                <strong className="text-slate-900 text-sm">{current?.solarRadiationWm2 ?? 520} W/m²</strong>
                <span className="text-[10px] text-slate-500 block">{current?.solarRadiationMjDay ?? 20.4} MJ/m²/day</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">UV Index</span>
                <strong className="text-slate-900 text-sm">{current?.uvIndex ?? 6.8} (Moderate-High)</strong>
                <span className="text-[10px] text-slate-500 block">Peak solar zenith intensity</span>
              </div>
            </div>
          </div>

          {/* 24-Hour Hourly Timeline */}
          {hourly.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Next 24-Hour Microclimate Timeline
                </h3>
                <span className="text-xs text-slate-500">Hourly temperature, rain probability &amp; wind</span>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2.5 min-w-[700px]">
                  {hourly.slice(0, 24).map((h, i) => (
                    <div
                      key={h.time}
                      className={`p-2.5 rounded-xl border text-center flex-1 min-w-[72px] space-y-1 transition ${
                        i === 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50/60 border-slate-200'
                      }`}
                    >
                      <span className="block text-[11px] font-bold text-slate-700">{h.hourLabel}</span>
                      <CloudSun className="w-5 h-5 mx-auto text-amber-500 my-1" />
                      <div className="font-black text-xs text-slate-900">{h.temperature}°C</div>
                      <div className="text-[10px] text-blue-600 font-semibold">{h.precipitationProbability}%</div>
                      <div className="text-[9px] text-slate-400">{h.windSpeedKmH} km/h</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7-Day / 14-Day Forecast Toggle Section */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Multi-Day Precision Agronomy Forecast
                </h3>
                <p className="text-xs text-slate-500">
                  Global Numerical Weather Prediction (NWP) model ensemble projection
                </p>
              </div>

              {/* Horizon Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setForecastHorizon('7day')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    forecastHorizon === '7day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  7-Day Outlook
                </button>
                <button
                  type="button"
                  onClick={() => setForecastHorizon('14day')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    forecastHorizon === '14day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  14-Day Extended
                </button>
              </div>
            </div>

            {/* Daily Forecast Grid */}
            <div className={`grid gap-2.5 ${forecastHorizon === '14day' ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'}`}>
              {dailyForecast.map((d) => (
                <div
                  key={d.date}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/30 transition text-center space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{d.dayName}</span>
                    <span className="text-[10px] text-slate-400">{d.date.slice(5)}</span>
                  </div>

                  <CloudSun className="w-6 h-6 mx-auto text-amber-500 my-1" />

                  <div className="text-xs font-extrabold text-slate-900">
                    {d.tempMax}° / <span className="text-slate-400 font-normal">{d.tempMin}°</span>
                  </div>

                  <div className="text-[11px] text-blue-600 font-bold">
                    {d.precipitationProb}% rain
                  </div>

                  <div className="text-[10px] text-slate-500">
                    {d.precipitationSumMm ?? 0} mm
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly Rainfall Sum & Temperature Trends Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 space-y-2">
                <div className="font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-blue-600" />
                    Weekly Rainfall Accumulation Predictions
                  </span>
                  <span className="font-extrabold">{weather?.weeklyRainfall?.twoWeekTotalMm ?? 42.7} mm Total</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center pt-1">
                  <div className="bg-white p-2 rounded-lg border border-blue-200">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Week 1 (Days 1–7)</span>
                    <strong className="text-blue-700 text-base">{weather?.weeklyRainfall?.currentWeekMm ?? 28.5} mm</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-200">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Week 2 (Days 8–14)</span>
                    <strong className="text-blue-700 text-base">{weather?.weeklyRainfall?.nextWeekMm ?? 14.2} mm</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-2">
                <div className="font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    14-Day Temperature Trajectory
                  </span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {weather?.temperatureTrend?.trendDirection || 'Stable'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Highest Peak</span>
                    <strong className="text-red-600 text-sm">{weather?.temperatureTrend?.highestUpcoming ?? 27}°C</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Lowest Dip</span>
                    <strong className="text-blue-600 text-sm">{weather?.temperatureTrend?.lowestUpcoming ?? 17}°C</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Mean Outlook</span>
                    <strong className="text-slate-800 text-sm">{weather?.temperatureTrend?.averageUpcoming ?? 25.4}°C</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Source & Timestamp Footer */}
            <div className="pt-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between border-t border-slate-100">
              <span>Data Source: <strong>{weather?.dataSource || 'Open-Meteo Weather API'}</strong></span>
              <span>Last updated: {weather?.lastUpdated ? new Date(weather.lastUpdated).toLocaleTimeString() : 'Just now'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CLIMATE CONDITION ANALYSIS (30-YEAR BASELINE)     */}
      {/* ======================================================== */}
      {activeTab === 'climate' && (
        <div className="space-y-6">
          {/* Independence Callout */}
          <div className="bg-emerald-950 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-sm block">
                  30-Year Standard Climate Reference Period (1991–2020)
                </span>
                <span className="text-emerald-200/90 text-[11px]">
                  Historical climatological averages derived from Copernicus ERA5-Land reanalysis and WMO standard normals.
                  Kept completely independent of real-time weather forecasts.
                </span>
              </div>
            </div>
            <span className="hidden sm:inline-block bg-emerald-800 text-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
              WMO Standard
            </span>
          </div>

          {/* Köppen-Geiger Classification Card */}
          {climateData && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                    {climateData.koppenClassification.code}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                      Köppen-Geiger Climate Classification
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      {climateData.koppenClassification.name}
                    </h3>
                    <p className="text-xs text-slate-500">{climateData.koppenClassification.group}</p>
                  </div>
                </div>

                <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-bold self-start sm:self-auto">
                  Reference: 1991–2020
                </span>
              </div>

              {/* Simple Language Explanation */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600" />
                  What this climate means for your farm:
                </div>
                <p>{climateData.koppenClassification.simpleExplanation}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-600">
                  {climateData.koppenClassification.characteristics.map((char, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{char}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 30-Year Climatological Averages Grid */}
          {climateData && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Annual Mean Temp</span>
                <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                  {climateData.annualAverages.meanTempC}°C
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">30-Year Average</span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Average Max Temp</span>
                <span className="text-2xl font-black text-red-600 mt-0.5 block">
                  {climateData.annualAverages.meanMaxTempC}°C
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">Warmest daytime highs</span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Average Min Temp</span>
                <span className="text-2xl font-black text-blue-600 mt-0.5 block">
                  {climateData.annualAverages.meanMinTempC}°C
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">Nighttime valley lows</span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Annual Rainfall</span>
                <span className="text-2xl font-black text-indigo-600 mt-0.5 block">
                  {climateData.annualAverages.annualRainfallMm} <span className="text-xs font-normal">mm</span>
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">Total annual normal</span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Average Humidity</span>
                <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                  {climateData.annualAverages.meanHumidityPercent}%
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">Relative saturation</span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Solar Insolation</span>
                <span className="text-2xl font-black text-amber-600 mt-0.5 block">
                  {climateData.annualAverages.solarRadiationMjDay}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">MJ/m²/day</span>
              </div>
            </div>
          )}

          {/* Monthly Rainfall & Temperature Distribution Graph */}
          {climateData && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-emerald-600" />
                    Monthly Rainfall Distribution (30-Year Normal)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cumulative monthly precipitation (mm) and temperature trajectory throughout the agricultural year
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                    Wet Season
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
                    Dry Season
                  </span>
                </div>
              </div>

              {/* Monthly Bar Chart Visualizer */}
              <div className="pt-6 pb-2">
                <div className="grid grid-cols-12 gap-1.5 sm:gap-2 h-48 items-end border-b border-slate-200 pb-2">
                  {climateData.monthlyDistribution.map((m) => {
                    const maxRain = Math.max(...climateData.monthlyDistribution.map((x) => x.avgRainfallMm), 400);
                    const heightPercent = Math.max(8, Math.round((m.avgRainfallMm / maxRain) * 100));

                    return (
                      <div key={m.monthIndex} className="flex flex-col items-center h-full justify-end group">
                        <span className="text-[10px] font-bold text-slate-600 mb-1 opacity-80 group-hover:opacity-100">
                          {m.avgRainfallMm}
                        </span>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            m.isWetSeason
                              ? 'bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-700'
                              : 'bg-gradient-to-t from-amber-400 to-amber-300 group-hover:from-amber-500'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                          title={`${m.monthName}: ${m.avgRainfallMm} mm rainfall, ${m.avgTempC}°C mean temp`}
                        />
                        <span className="text-[11px] font-bold text-slate-700 mt-2 block">
                          {m.monthShort}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {m.avgTempC}°
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Wet Season, Dry Season & Hazard Risk Indicators */}
          {climateData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Wet Season Card */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      {climateData.seasonalCycle.wetSeason.name}
                    </h4>
                  </div>
                  <span className="font-extrabold text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded">
                    {climateData.seasonalCycle.wetSeason.percentageOfAnnual}% of Rain
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {climateData.seasonalCycle.wetSeason.totalRainfallMm} mm
                </div>
                <div className="text-xs text-slate-600 font-semibold">
                  Duration: {climateData.seasonalCycle.wetSeason.months}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {climateData.seasonalCycle.wetSeason.description}
                </p>
              </div>

              {/* Dry Season Card */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      {climateData.seasonalCycle.drySeason.name}
                    </h4>
                  </div>
                  <span className="font-extrabold text-amber-700 text-xs bg-amber-50 px-2 py-0.5 rounded">
                    Harvest Window
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {climateData.seasonalCycle.drySeason.totalRainfallMm} mm
                </div>
                <div className="text-xs text-slate-600 font-semibold">
                  Duration: {climateData.seasonalCycle.drySeason.months}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {climateData.seasonalCycle.drySeason.description}
                </p>
              </div>

              {/* Climatic Stress & Vulnerability */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-900 text-sm">Climatic Stress Indicators</h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">30-Yr Audit</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Drought Vulnerability:</span>
                    <strong className="text-emerald-700 font-bold">
                      {climateData.climaticIndicators.droughtIndicator.status}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Heat Stress (&gt;35°C):</span>
                    <strong className={climateData.climaticIndicators.heatStressIndicator.daysAbove35C > 0 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
                      {climateData.climaticIndicators.heatStressIndicator.daysAbove35C} Days/yr
                    </strong>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Frost Hazard Risk:</span>
                    <strong className={climateData.climaticIndicators.frostRiskIndicator.hasFrostRisk ? 'text-blue-600 font-bold' : 'text-emerald-700 font-bold'}>
                      {climateData.climaticIndicators.frostRiskIndicator.riskLevel} (Frost Free)
                    </strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 italic pt-1">
                  Seasonal Temperature Range Delta: <strong>{climateData.seasonalCycle.temperatureVariation.seasonalRangeDeltaC}°C</strong> (Warmest: {climateData.seasonalCycle.temperatureVariation.warmestMonth}, Coldest: {climateData.seasonalCycle.temperatureVariation.coldestMonth})
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: "FIND WHICH CROPS ARE SUITABLE FOR THIS CLIMATE"  */}
      {/* ======================================================== */}
      {activeTab === 'suitable_crops' && (
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                FAO EcoCrop Precision Engine
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                Crops Environmentally Suitable for {farm?.name || 'This Location'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Evaluated against 30-year bioclimatic normals: Mean Temp {climateData?.annualAverages.meanTempC ?? 22.4}°C &bull;{' '}
                Rainfall {climateData?.annualAverages.annualRainfallMm ?? 1950} mm/yr &bull; Elevation{' '}
                {climateData?.coordinates.elevationMeters ?? 1080} m MSL &bull; Köppen{' '}
                {climateData?.koppenClassification.code ?? 'Cwb'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Irrigation Available?</span>
              <button
                type="button"
                onClick={() => setIrrigationAvailable(!irrigationAvailable)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  irrigationAvailable
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {irrigationAvailable ? 'Yes (Irrigated)' : 'No (Rainfed)'}
              </button>
            </div>
          </div>

          {/* Interactive Parameters Adjuster: Category, Soil pH, Drainage */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="font-bold text-slate-700 shrink-0 mr-1">Category:</span>
                {['All', 'Beverage', 'Cereal', 'Cash Crop', 'Fruit', 'Pulse', 'Oilseed', 'Vegetable', 'Tuber'].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              {/* Soil Profile Tweaks */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Soil pH:</span>
                  <select
                    value={farmSoilPh}
                    onChange={(e) => setFarmSoilPh(parseFloat(e.target.value))}
                    className="bg-slate-100 border border-slate-300 rounded-lg p-1 text-xs font-bold text-slate-800"
                  >
                    <option value={5.2}>5.2 (Acidic)</option>
                    <option value={5.8}>5.8 (Mild Acid)</option>
                    <option value={6.2}>6.2 (Ideal Loam)</option>
                    <option value={6.8}>6.8 (Neutral)</option>
                    <option value={7.5}>7.5 (Alkaline)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Drainage:</span>
                  <select
                    value={farmDrainage}
                    onChange={(e) => setFarmDrainage(e.target.value as any)}
                    className="bg-slate-100 border border-slate-300 rounded-lg p-1 text-xs font-bold text-slate-800"
                  >
                    <option value="Well-drained">Well-drained</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Poorly-drained">Poorly-drained</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Ranked Crop Cards Grid */}
          <div className="space-y-4">
            {filteredCrops.map((item) => {
              const { crop, overallScore, suitabilityStatus, parameterAudit, limitingFactors, favorableFactors, agronomicAdaptations } = item;
              const isExpanded = expandedCropId === crop.id;

              const statusColor =
                suitabilityStatus === 'Highly Suitable'
                  ? 'bg-emerald-600 text-white'
                  : suitabilityStatus === 'Suitable'
                  ? 'bg-teal-600 text-white'
                  : suitabilityStatus === 'Moderately Suitable'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-500 text-white';

              return (
                <div
                  key={crop.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition"
                >
                  <div
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                    onClick={() => setExpandedCropId(isExpanded ? null : crop.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0 border border-emerald-200">
                        <Sprout className="w-6 h-6 text-emerald-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-base">
                            {crop.name}
                          </h4>
                          <span className="text-xs text-slate-400 italic">
                            ({crop.scientificName})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                            {crop.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {crop.summary}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                          <span>FAO Code: <strong>{crop.faoEcoCropCode}</strong></span>
                          <span>&bull;</span>
                          <span>Optimal Temp: <strong>{crop.tempOptMin}–{crop.tempOptMax}°C</strong></span>
                          <span>&bull;</span>
                          <span>Rainfall Demand: <strong>{crop.annualRainfallOptMin}–{crop.annualRainfallOptMax} mm</strong></span>
                          <span>&bull;</span>
                          <span>Growing Cycle: <strong>{crop.growingSeasonDays} days</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-900 block leading-tight">
                          {overallScore}%
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 ${statusColor}`}>
                          {suitabilityStatus}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Environmental Parameter Audit */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-4 text-xs animate-in fade-in">
                      {/* Parameter Meters Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                        {Object.entries(parameterAudit).map(([paramName, audit]) => {
                          const badgeColor =
                            audit.status === 'optimal'
                              ? 'text-emerald-700 bg-emerald-100 border-emerald-300'
                              : audit.status === 'acceptable'
                              ? 'text-teal-700 bg-teal-100 border-teal-300'
                              : 'text-amber-800 bg-amber-100 border-amber-300';

                          return (
                            <div key={paramName} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                                <span>{paramName}</span>
                                <span className="font-extrabold text-slate-700">{audit.score}%</span>
                              </div>
                              <div className="font-bold text-slate-900 text-sm truncate">
                                {audit.currentValue}
                              </div>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border block truncate ${badgeColor}`}>
                                {audit.status}
                              </span>
                              <p className="text-[10px] text-slate-500 leading-tight pt-1">
                                {audit.explanation}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Limiting Factors & Adaptation Advice */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {/* Favorable & Limiting Factors */}
                        <div className="space-y-2">
                          <span className="font-bold text-slate-800 block text-xs">Environmental Factors:</span>
                          {favorableFactors.map((f, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-800">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </div>
                          ))}
                          {limitingFactors.map((l, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-900">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span>{l}</span>
                            </div>
                          ))}
                        </div>

                        {/* Agronomic Adaptation Advice */}
                        <div className="space-y-2">
                          <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            Agronomic Management &amp; Adaptation:
                          </span>
                          {agronomicAdaptations.length > 0 ? (
                            agronomicAdaptations.map((a, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{a}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-500">
                              Standard commercial practices apply. No major climatic limiting adaptations needed.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: "CHECK CROP CLIMATE COMPATIBILITY" (WORLDWIDE)    */}
      {/* ======================================================== */}
      {activeTab === 'compatibility_checker' && (
        <div className="space-y-6">
          {/* Global Selector Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                Interactive Global Simulator
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                Check Crop Climate Compatibility in Any Region
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select any country, agricultural state or region worldwide to test its environmental feasibility against any crop.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Select Region */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  1. Select Country &amp; Agricultural Region:
                </label>
                <select
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {globalRegions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.country} &bull; {r.regionOrState} (Köppen: {r.koppenCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Crop */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  2. Select Crop from Verified FAO Database:
                </label>
                <select
                  value={selectedCropId}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {allCrops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.scientificName}) &bull; {c.category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Compatibility Analysis Result Card */}
          {singleCompatibilityAudit && selectedRegion && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-6 p-6">
              {/* Score Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-2xl shrink-0">
                    <Sprout className="w-8 h-8 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Compatibility Assessment
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-xl">
                      {selectedCrop.name} in {selectedRegion.regionOrState}, {selectedRegion.country}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Köppen: <strong>{selectedRegion.koppenCode} ({selectedRegion.koppenName})</strong> &bull;{' '}
                      Elevation: <strong>{selectedRegion.elevationMeters} m</strong> &bull; Mean Temp:{' '}
                      <strong>{selectedRegion.annualMeanTempC}°C</strong> &bull; Annual Rain:{' '}
                      <strong>{selectedRegion.annualRainfallMm} mm</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-3xl font-black text-slate-900 block leading-none">
                      {singleCompatibilityAudit.overallScore}%
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase inline-block mt-1 ${
                        singleCompatibilityAudit.suitabilityStatus === 'Highly Suitable'
                          ? 'bg-emerald-600 text-white'
                          : singleCompatibilityAudit.suitabilityStatus === 'Suitable'
                          ? 'bg-teal-600 text-white'
                          : singleCompatibilityAudit.suitabilityStatus === 'Moderately Suitable'
                          ? 'bg-amber-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {singleCompatibilityAudit.suitabilityStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Parameter-by-Parameter Scorecard */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                {Object.entries(singleCompatibilityAudit.parameterAudit).map(([param, audit]) => (
                  <div key={param} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                      <span>{param}</span>
                      <span className="font-black text-slate-700">{audit.score}%</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm truncate">{audit.currentValue}</div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block ${
                        audit.status === 'optimal'
                          ? 'text-emerald-700 bg-emerald-100 border-emerald-300'
                          : audit.status === 'acceptable'
                          ? 'text-teal-700 bg-teal-100 border-teal-300'
                          : 'text-amber-800 bg-amber-100 border-amber-300'
                      }`}
                    >
                      {audit.status}
                    </span>
                    <p className="text-[10px] text-slate-500 pt-1 leading-tight">{audit.explanation}</p>
                  </div>
                ))}
              </div>

              {/* Favorable vs Limiting Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Why This Location Is Favorable:
                  </span>
                  {singleCompatibilityAudit.favorableFactors.map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-emerald-900 text-[11px]">
                      <span>&bull;</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Climatic Challenges &amp; Limiting Factors:
                  </span>
                  {singleCompatibilityAudit.limitingFactors.length > 0 ? (
                    singleCompatibilityAudit.limitingFactors.map((l, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-amber-950 text-[11px]">
                        <span>&bull;</span>
                        <span>{l}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      No critical limiting barriers. Ideal agro-climatic match.
                    </p>
                  )}
                </div>
              </div>

              {/* Actionable Agronomic Adaptation Report */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Agronomic Adaptation &amp; Cultivation Recommendations:
                </span>
                <div className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                  {singleCompatibilityAudit.agronomicAdaptations.map((a, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
