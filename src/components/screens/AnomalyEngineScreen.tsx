import React, { useState } from 'react';
import {
  ActiveScreen,
  Farm,
  Language,
  SatelliteAnomaly,
  DroneDevice,
  DroneInspectionTask,
  DroneImageRecord,
} from '../../types';
import { useTranslation } from '../../i18n/translations';
import { FarmMap } from '../Map/FarmMap';
import { IndiaLocationSearchBar } from '../common/IndiaLocationSearchBar';
import { IndiaLocationResult } from '../../services/indiaLocationService';
import {
  Activity,
  AlertTriangle,
  Plane,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Eye,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  RotateCcw,
  Plus,
  Compass,
} from 'lucide-react';

interface AnomalyEngineScreenProps {
  activeFarm?: Farm;
  farms: Farm[];
  anomalies: SatelliteAnomaly[];
  droneDevice: DroneDevice;
  inspectionTasks: DroneInspectionTask[];
  droneImages: DroneImageRecord[];
  onUpdateAnomalies: (list: SatelliteAnomaly[]) => void;
  onUpdateTasks: (list: DroneInspectionTask[]) => void;
  onNavigate: (screen: ActiveScreen) => void;
  language: Language;
}

export const AnomalyEngineScreen: React.FC<AnomalyEngineScreenProps> = ({
  activeFarm,
  farms,
  anomalies,
  droneDevice,
  inspectionTasks,
  droneImages,
  onUpdateAnomalies,
  onUpdateTasks,
  onNavigate,
  language,
}) => {
  const t = useTranslation(language);

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'resolved'>('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState<SatelliteAnomaly | null>(anomalies[0] || null);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);
  const [operatorName, setOperatorName] = useState('DGCA Certified Agronomist');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Filter anomalies for active farm
  const farmAnomalies = activeFarm
    ? anomalies.filter((a) => a.farm_id === activeFarm.id || !a.farm_id)
    : anomalies;

  const filteredAnomalies = farmAnomalies.filter((a) => {
    if (selectedFilter === 'critical') return a.severity === 'Critical';
    if (selectedFilter === 'high') return a.severity === 'High';
    if (selectedFilter === 'medium') return a.severity === 'Medium' || a.severity === 'Low';
    if (selectedFilter === 'resolved') return a.inspection_status === 'verified' || a.inspection_status === 'inspected';
    return true;
  });

  // Calculate stats
  const criticalCount = farmAnomalies.filter((a) => a.severity === 'Critical' || a.severity === 'High').length;
  const avgDropPercent = farmAnomalies.length > 0
    ? Math.round(farmAnomalies.reduce((acc, a) => acc + a.drop_percentage, 0) / farmAnomalies.length)
    : 0;

  // Handle Location Search selection on the map
  const handleSelectIndianLocation = (loc: IndiaLocationResult) => {
    setMapCenter([loc.latitude, loc.longitude]);
  };

  // Dispatch Drone Mission
  const handleConfirmDispatch = () => {
    if (!selectedAnomaly) return;
    if (!operatorConfirmed) {
      console.warn('Safety protocol: Human-in-the-loop operator confirmation is required prior to drone flight authorization.');
      return;
    }

    const newTask: DroneInspectionTask = {
      inspection_id: `insp_${Date.now()}`,
      farm_id: activeFarm?.id || 'farm_primary',
      anomaly_id: selectedAnomaly.anomaly_id,
      drone_id: droneDevice.drone_id,
      coordinates: {
        lat: selectedAnomaly.latitude,
        lng: selectedAnomaly.longitude,
        altitudeMeters: 45,
      },
      target_radius_m: 50,
      inspection_status: 'dispatched',
      operator_confirmed: true,
      operator_name: operatorName,
      created_at: new Date().toISOString(),
      dispatched_at: new Date().toISOString(),
      images_count: 0,
      notes: `Targeting ${selectedAnomaly.anomaly_type} flagged with ${selectedAnomaly.drop_percentage}% decline.`,
    };

    const updatedTasks = [newTask, ...inspectionTasks];
    onUpdateTasks(updatedTasks);

    const updatedAnomalies = anomalies.map((a) =>
      a.anomaly_id === selectedAnomaly.anomaly_id ? { ...a, inspection_status: 'dispatched' as const } : a
    );
    onUpdateAnomalies(updatedAnomalies);
    setSelectedAnomaly({ ...selectedAnomaly, inspection_status: 'dispatched' });

    setDispatchSuccess(true);
    setTimeout(() => {
      setShowDispatchModal(false);
      setDispatchSuccess(false);
      setOperatorConfirmed(false);
    }, 1800);
  };

  // Simulate Anomaly
  const handleSimulateAnomaly = () => {
    setSimulating(true);
    setTimeout(() => {
      const latOffset = (Math.random() - 0.5) * 0.004;
      const lngOffset = (Math.random() - 0.5) * 0.004;
      const baseLat = activeFarm?.coordinates.lat || 13.4215;
      const baseLng = activeFarm?.coordinates.lng || 75.7621;

      const types: ('NDVI_Drop' | 'Canopy_Chlorosis' | 'Moisture_Deficit' | 'Vegetation_Loss')[] = [
        'NDVI_Drop',
        'Canopy_Chlorosis',
        'Moisture_Deficit',
        'Vegetation_Loss',
      ];
      const selectedType = types[Math.floor(Math.random() * types.length)];
      const dropVal = Math.floor(Math.random() * 25) + 32;

      const newSimAnomaly: SatelliteAnomaly = {
        anomaly_id: `anom_sim_${Date.now()}`,
        farm_id: activeFarm?.id || 'farm_primary',
        anomaly_type: selectedType,
        severity: dropVal > 40 ? 'Critical' : 'High',
        latitude: Number((baseLat + latOffset).toFixed(5)),
        longitude: Number((baseLng + lngOffset).toFixed(5)),
        satellite_image_date: new Date().toISOString(),
        vegetation_index: selectedType === 'Moisture_Deficit' ? 'NDMI' : selectedType === 'Canopy_Chlorosis' ? 'NDRE' : 'NDVI',
        index_value: Number((0.38 - Math.random() * 0.1).toFixed(2)),
        historical_baseline_value: 0.72,
        drop_percentage: dropVal,
        inspection_status: 'unassigned',
        description: `Sentinel-2 Level-2A flagged a ${dropVal}% decline in ${selectedType}. Elevated spectral deviation requiring immediate aerial ground truth check.`,
      };

      const updated = [newSimAnomaly, ...anomalies];
      onUpdateAnomalies(updated);
      setSelectedAnomaly(newSimAnomaly);
      setMapCenter([newSimAnomaly.latitude, newSimAnomaly.longitude]);
      setSimulating(false);
    }, 600);
  };

  const handleResolveAnomaly = (id: string) => {
    const updated = anomalies.map((a) =>
      a.anomaly_id === id ? { ...a, inspection_status: 'verified' as const } : a
    );
    onUpdateAnomalies(updated);
    if (selectedAnomaly?.anomaly_id === id) {
      setSelectedAnomaly({ ...selectedAnomaly, inspection_status: 'verified' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-amber-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-xl">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  AgroSecure <span className="text-amber-400">Anomaly Engine</span>
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase">
                  Multi-Spectral Sentinel-2
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Real-time satellite & drone vegetation stress, thermal deficit, and pest hotspot detection
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleSimulateAnomaly}
            disabled={simulating}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{simulating ? 'Analyzing Sentinel-2 Overpass...' : 'Simulate Sentinel-2 Anomaly'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('alert_center')}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition"
          >
            <span>Crop Doctor Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Flagged Anomalies</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{farmAnomalies.length}</p>
          <span className="text-[11px] text-amber-700 font-medium">Across active parcels</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>High & Critical</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1">{criticalCount}</p>
          <span className="text-[11px] text-rose-700 font-medium">Urgent scouting advised</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Average Drop</span>
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{avgDropPercent}%</p>
          <span className="text-[11px] text-slate-500 font-medium">Vegetation index delta</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Drone Dispatches</span>
            <Plane className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{inspectionTasks.length}</p>
          <span className="text-[11px] text-emerald-700 font-medium">{droneImages.length} aerial captures</span>
        </div>
      </div>

      {/* Real-time Indian Location Search Bar on Anomaly Map */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-emerald-600" />
            Search Any Indian Location / Taluk on Satellite Map
          </span>
          <span className="text-[11px] text-slate-400">Centers map directly on coordinates</span>
        </div>
        <IndiaLocationSearchBar
          onSelectLocation={handleSelectIndianLocation}
          placeholder="Search any Indian village, taluk, town, or plantation center (e.g., Sakleshpur, Wayanad, Munnar, Nashik)..."
        />
      </div>

      {/* Main Map & Anomaly Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">
                Spatial Satellite Heatmap ({activeFarm?.name || 'Farm'})
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-rose-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical
              </span>
              <span className="flex items-center gap-1 text-amber-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Baseline
              </span>
            </div>
          </div>

          <div className="flex-1 w-full rounded-2xl overflow-hidden border border-slate-200 relative">
            <FarmMap
              farm={activeFarm}
              allFarms={farms}
              mapCenter={mapCenter}
              showNdviOverlay={true}
              showDroneOverlay={true}
              anomalies={farmAnomalies}
              inspectionTasks={inspectionTasks}
              droneImages={droneImages}
              onSendForInspection={(anom) => {
                setSelectedAnomaly(anom);
                setShowDispatchModal(true);
              }}
              language={language}
            />
          </div>
        </div>

        {/* Right Column: Anomaly List & Inspector */}
        <div className="lg:col-span-5 space-y-4">
          {/* Anomaly Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-semibold overflow-x-auto no-scrollbar">
            {(['all', 'critical', 'high', 'medium', 'resolved'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedFilter(tab)}
                className={`px-3 py-1.5 rounded-xl capitalize transition shrink-0 ${
                  selectedFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Anomaly Items */}
          <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
            {filteredAnomalies.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <p className="font-bold text-slate-800 text-sm">No anomalies in this category</p>
                <p className="text-xs text-slate-400 mt-1">Vegetation canopy within expected seasonal baseline.</p>
              </div>
            ) : (
              filteredAnomalies.map((anom) => {
                const isSelected = selectedAnomaly?.anomaly_id === anom.anomaly_id;
                return (
                  <div
                    key={anom.anomaly_id}
                    onClick={() => {
                      setSelectedAnomaly(anom);
                      setMapCenter([anom.latitude, anom.longitude]);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                          anom.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : anom.severity === 'High'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {anom.drop_percentage}%
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs text-slate-900">
                            {anom.anomaly_type.replace('_', ' ')}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                              anom.severity === 'Critical'
                                ? 'bg-rose-600 text-white'
                                : anom.severity === 'High'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-blue-500 text-white'
                            }`}
                          >
                            {anom.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {anom.description}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Lat {anom.latitude.toFixed(4)}, Lng {anom.longitude.toFixed(4)} &bull; {anom.vegetation_index} {anom.index_value}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-slate-400 shrink-0 capitalize">
                      {anom.inspection_status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Anomaly Action Box */}
          {selectedAnomaly && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Detailed Anomaly Audit
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {selectedAnomaly.anomaly_type.replace('_', ' ')}
                  </h3>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    selectedAnomaly.inspection_status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedAnomaly.inspection_status === 'dispatched'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedAnomaly.inspection_status.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {selectedAnomaly.description}
              </p>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Baseline</span>
                  <span className="font-extrabold text-slate-800">{selectedAnomaly.historical_baseline_value}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-900">
                  <span className="text-[10px] text-rose-600 block">Current {selectedAnomaly.vegetation_index}</span>
                  <span className="font-extrabold">{selectedAnomaly.index_value}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-900">
                  <span className="text-[10px] text-amber-600 block">Drop Delta</span>
                  <span className="font-extrabold">-{selectedAnomaly.drop_percentage}%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs transition shadow-sm"
                >
                  <Plane className="w-4 h-4" />
                  <span>Dispatch Drone Mission</span>
                </button>
                {selectedAnomaly.inspection_status !== 'verified' && (
                  <button
                    type="button"
                    onClick={() => handleResolveAnomaly(selectedAnomaly.anomaly_id)}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition"
                    title="Mark anomaly resolved"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Resolve</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drone Mission Dispatch Modal (Human In The Loop Requirement) */}
      {showDispatchModal && selectedAnomaly && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Plane className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Deploy Autonomous Drone Mission
                </h3>
                <p className="text-xs text-slate-500">
                  Human-in-the-loop DGCA safety verification protocol
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Coordinates:</span>
                <span className="font-bold text-slate-800">
                  {selectedAnomaly.latitude.toFixed(5)}°N, {selectedAnomaly.longitude.toFixed(5)}°E
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Flight Altitude:</span>
                <span className="font-bold text-slate-800">45 meters AGL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scouting Radius:</span>
                <span className="font-bold text-slate-800">50 meters perimeter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Drone Device:</span>
                <span className="font-bold text-emerald-700">{droneDevice.model}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Authorized Pilot / Agronomist Name:
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-emerald-600"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="operatorCheck"
                checked={operatorConfirmed}
                onChange={(e) => setOperatorConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="operatorCheck" className="text-[11px] text-amber-950 leading-relaxed cursor-pointer font-medium">
                I hereby verify that airspace conditions, battery telemetry, and local flight permits comply with DGCA Drone Rules 2021 before dispatching this autonomous mission.
              </label>
            </div>

            {dispatchSuccess && (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold text-center animate-pulse">
                &check; Flight plan transmitted to {droneDevice.model}. Mission underway!
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDispatchModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={!operatorConfirmed}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md disabled:opacity-40"
              >
                Authorize & Launch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
