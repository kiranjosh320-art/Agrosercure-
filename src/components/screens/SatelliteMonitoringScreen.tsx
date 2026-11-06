import React, { useState } from 'react';
import { Farm, Language, SatelliteObservation } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { FarmMap } from '../Map/FarmMap';
import {
  Satellite,
  Layers,
  Calendar,
  Cloud,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingDown,
  TrendingUp,
  Activity,
  Download,
  Filter,
  Eye,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface SatelliteMonitoringScreenProps {
  farm?: Farm;
  allFarms: Farm[];
  observations: SatelliteObservation[];
  activeObservation?: SatelliteObservation;
  onSelectObservation: (obs: SatelliteObservation) => void;
  onSelectFarm: (farmId: string) => void;
  language: Language;
}

export const SatelliteMonitoringScreen: React.FC<SatelliteMonitoringScreenProps> = ({
  farm,
  allFarms,
  observations,
  activeObservation,
  onSelectObservation,
  onSelectFarm,
  language,
}) => {
  const t = useTranslation(language);

  // Selected Index: 'NDVI' | 'NDRE' | 'NDWI' | 'TRUE_COLOR' | 'FALSE_COLOR'
  const [selectedIndex, setSelectedIndex] = useState<'NDVI' | 'NDRE' | 'NDWI' | 'TRUE_COLOR' | 'FALSE_COLOR'>('NDVI');
  const [cloudFilterThreshold, setCloudFilterThreshold] = useState<number>(20);
  const [showHeatmapOverlay, setShowHeatmapOverlay] = useState(true);

  const currentObs = activeObservation || observations[0];

  // Filter observations by cloud threshold
  const filteredObs = observations.filter((obs) => obs.cloudCoveragePercent <= cloudFilterThreshold);

  // Historical trend data
  const historicalTrend = [
    { date: 'Jun 2026', ndvi: 0.79, rainfallMm: 310, status: 'Peak Monsoon Flush' },
    { date: 'Jul 2026', ndvi: 0.81, rainfallMm: 420, status: 'Dense Canopy' },
    { date: 'Aug 2026', ndvi: 0.76, rainfallMm: 280, status: 'High Moisture' },
    { date: 'Sep 2026', ndvi: 0.74, rainfallMm: 160, status: 'Post-Monsoon Berries' },
    { date: 'Oct 2026', ndvi: 0.71, rainfallMm: 85, status: 'Slight Thinning' },
    { date: 'Nov 2026', ndvi: currentObs?.meanNdvi || 0.68, rainfallMm: 25, status: 'Current Pass (Stress in SE)' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Satellite Mission Info */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Satellite className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t.satelliteMonitoring}
            </h2>
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Copernicus Sentinel-2
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Multispectral Level-2A surface reflectance (Bottom of Atmosphere) with automated vegetation indices computation.
          </p>
        </div>

        {/* Index Selector Bar */}
        <div className="bg-slate-100 p-1 rounded-xl flex flex-wrap gap-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedIndex('NDVI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedIndex === 'NDVI'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            NDVI
          </button>
          <button
            type="button"
            onClick={() => setSelectedIndex('NDRE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedIndex === 'NDRE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            NDRE (Red Edge)
          </button>
          <button
            type="button"
            onClick={() => setSelectedIndex('NDWI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedIndex === 'NDWI'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            NDWI (Water)
          </button>
          <button
            type="button"
            onClick={() => setSelectedIndex('TRUE_COLOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedIndex === 'TRUE_COLOR'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            True Color RGB
          </button>
        </div>
      </div>

      {/* Main Satellite Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  {selectedIndex} Canopy Distribution Layer
                </h3>
                <span className="text-[11px] text-slate-500">
                  {farm?.name} &bull; Tile {currentObs?.tileId} &bull; Acquisition:{' '}
                  {currentObs ? new Date(currentObs.acquisitionDate).toLocaleString() : 'N/A'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHeatmapOverlay(!showHeatmapOverlay)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition border flex items-center gap-1.5 ${
                    showHeatmapOverlay
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {t.toggleCanopyHeatmap}
                </button>
              </div>
            </div>

            {/* Farm Map with active NDVI colormap */}
            <FarmMap
              farm={farm}
              allFarms={allFarms}
              onSelectFarm={onSelectFarm}
              showNdviOverlay={showHeatmapOverlay}
              satelliteObs={currentObs}
              language={language}
            />

            {/* Index Formula Reference Card */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-800 block text-xs">
                  {selectedIndex === 'NDVI' && 'NDVI: Normalized Difference Vegetation Index'}
                  {selectedIndex === 'NDRE' && 'NDRE: Normalized Difference Red Edge Index'}
                  {selectedIndex === 'NDWI' && 'NDWI: Normalized Difference Water Index'}
                  {selectedIndex === 'TRUE_COLOR' && 'True Color Composite: Bands B04 (Red), B03 (Green), B02 (Blue)'}
                </span>
                <span className="font-mono text-emerald-800 font-semibold block mt-0.5">
                  {selectedIndex === 'NDVI' && 'NDVI = (NIR - RED) / (NIR + RED) = (B08 - B04) / (B08 + B04)'}
                  {selectedIndex === 'NDRE' && 'NDRE = (NIR - RedEdge) / (NIR + RedEdge) = (B08 - B05) / (B08 + B05)'}
                  {selectedIndex === 'NDWI' && 'NDWI = (NIR - SWIR) / (NIR + SWIR) = (B08 - B11) / (B08 + B11)'}
                  {selectedIndex === 'TRUE_COLOR' && 'Natural RGB composite showing surface true reflectance at 10m.'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 sm:text-right shrink-0">
                Ground Resolution: <strong>10m</strong> &bull; Sun Zenith: <strong>{currentObs?.sunZenithAngle}°</strong>
              </div>
            </div>
          </div>

          {/* Historical NDVI Time Series Trajectory Chart */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  {t.historicalTrends} (6-Month Trajectory)
                </h3>
                <p className="text-xs text-slate-500">
                  Detects seasonal canopy development and sudden stress drops compared to baseline
                </p>
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                Multi-Temporal S2
              </span>
            </div>

            {/* Visual Bar Graph */}
            <div className="space-y-3 pt-2">
              {historicalTrend.map((item, idx) => (
                <div key={item.date} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 w-20">{item.date}</span>
                    <span className="text-[11px] text-slate-500 flex-1 px-2 truncate">
                      {item.status} ({item.rainfallMm}mm rain)
                    </span>
                    <span className="font-mono font-bold text-emerald-700 w-12 text-right">
                      {item.ndvi}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.ndvi >= 0.75
                          ? 'bg-emerald-600'
                          : item.ndvi >= 0.65
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${(item.ndvi / 1.0) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Anomaly Detected: </strong>
                November overpass indicates a <strong>0.05</strong> NDVI decrease from October. Ground scouting in South-East quadrant confirmed suspected Coffee Leaf Rust infection.
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Date Picker, Cloud Filtering, and Tile Details */}
        <div className="space-y-6">
          {/* Overpass Picker Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Sentinel-2 Overpasses
              </h3>
              <span className="text-[10px] text-slate-400">Revisit: ~5 Days</span>
            </div>

            {/* Cloud Cover Filter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-slate-400" />
                  Max Cloud Coverage:
                </span>
                <strong className="text-emerald-700 font-bold">&lt; {cloudFilterThreshold}%</strong>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={cloudFilterThreshold}
                onChange={(e) => setCloudFilterThreshold(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* List of Available Overpasses */}
            <div className="space-y-2 max-h-60 overflow-y-auto pt-1">
              {filteredObs.map((obs) => {
                const isSelected = obs.id === currentObs?.id;
                return (
                  <div
                    key={obs.id}
                    onClick={() => onSelectObservation(obs)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{new Date(obs.acquisitionDate).toLocaleDateString()}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {obs.satellite}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Cloud: <strong>{obs.cloudCoveragePercent}%</strong></span>
                      <span className="text-emerald-700 font-bold">NDVI: {obs.meanNdvi}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Observation Spectral Details */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Spectral Radiometry Stats
            </h4>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Mean NDVI</span>
              <strong className="text-emerald-700 font-bold text-sm">{currentObs?.meanNdvi}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Mean NDRE (Red Edge)</span>
              <strong className="text-slate-800">{currentObs?.meanNdre}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Mean NDWI (Canopy Water)</span>
              <strong className="text-slate-800">{currentObs?.meanNdwi}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">MGRS Tile ID</span>
              <span className="font-mono text-slate-800">{currentObs?.tileId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Sun Zenith Angle</span>
              <span className="text-slate-800">{currentObs?.sunZenithAngle}°</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Data Source</span>
              <span className="text-slate-700 truncate max-w-[150px]">{currentObs?.dataSource}</span>
            </div>
          </div>

          {/* Copernicus Connection & Real API Guidance */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Info className="w-4 h-4" />
              Copernicus Data Space Ecosystem (CDSE)
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              AgroVision AI connects to European Space Agency (ESA) Sentinel-2 Level-2A surface reflectance tiles.
            </p>
            <div className="pt-1">
              <a
                href="https://dataspace.copernicus.eu/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Copernicus Open Access Hub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
