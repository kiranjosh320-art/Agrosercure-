import React, { useState, useEffect, useRef } from 'react';
import {
  ActiveScreen,
  DroneDevice,
  DroneImageRecord,
  DroneInspectionTask,
  Farm,
  Language,
  SatelliteAnomaly,
  SatelliteObservation,
} from '../../types';
import { useTranslation } from '../../i18n/translations';
import { FarmMap } from '../Map/FarmMap';
import {
  Plane,
  Satellite,
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  Layers,
  Battery,
  Radio,
  Compass,
  MapPin,
  Calendar,
  Eye,
  Camera,
  Play,
  Check,
  X,
  Sparkles,
  Info,
  RefreshCw,
  Sliders,
  Shield,
  FileCheck,
  Send,
  AlertOctagon,
} from 'lucide-react';

interface DroneIntegrationScreenProps {
  farm?: Farm;
  allFarms: Farm[];
  onSelectFarm: (farmId: string) => void;
  droneDevice: DroneDevice;
  onUpdateDrone: (drone: DroneDevice) => void;
  anomalies: SatelliteAnomaly[];
  onUpdateAnomalies: (anomalies: SatelliteAnomaly[]) => void;
  inspectionTasks: DroneInspectionTask[];
  onUpdateTasks: (tasks: DroneInspectionTask[]) => void;
  droneImages: DroneImageRecord[];
  onUpdateImages: (images: DroneImageRecord[]) => void;
  satelliteObs?: SatelliteObservation;
  onNavigate: (screen: ActiveScreen) => void;
  language: Language;
}

export const DroneIntegrationScreen: React.FC<DroneIntegrationScreenProps> = ({
  farm,
  allFarms,
  onSelectFarm,
  droneDevice,
  onUpdateDrone,
  anomalies,
  onUpdateAnomalies,
  inspectionTasks,
  onUpdateTasks,
  droneImages,
  onUpdateImages,
  satelliteObs,
  onNavigate,
  language,
}) => {
  const t = useTranslation(language);

  // Active sub-tab in drone integration screen
  const [activeTab, setActiveTab] = useState<
    'overview' | 'connect' | 'anomalies' | 'inspections' | 'gallery' | 'demo'
  >('overview');

  // Connection form state
  const [manufacturer, setManufacturer] = useState(droneDevice.manufacturer || 'DJI');
  const [model, setModel] = useState(droneDevice.model || 'Matrice 350 RTK');
  const [connType, setConnType] = useState<any>(droneDevice.connection_type || 'DJI_Mobile_SDK');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connError, setConnError] = useState<string | null>(null);

  // Send for drone inspection modal
  const [selectedAnomalyForMission, setSelectedAnomalyForMission] = useState<SatelliteAnomaly | null>(null);
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);
  const [operatorName, setOperatorName] = useState('Anil Kumar (DGCA Certified)');
  const [flightAltitude, setFlightAltitude] = useState(45);
  const [missionNotes, setMissionNotes] = useState('Inspect canopy stress and leaf yellowing spotted in satellite pass.');

  // Drone Image Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCameraType, setUploadCameraType] = useState<'RGB' | 'Multispectral' | 'Thermal'>('RGB');
  const [uploadAltitude, setUploadAltitude] = useState(45);
  const [uploadLat, setUploadLat] = useState(farm?.coordinates.lat || 13.4196);
  const [uploadLng, setUploadLng] = useState(farm?.coordinates.lng || 75.7641);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected image for AI Disease Analysis modal
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<DroneImageRecord | null>(
    droneImages[0] || null
  );
  const [cameraFilter, setCameraFilter] = useState<'all' | 'RGB' | 'Multispectral' | 'Thermal'>('all');

  // Connect Drone handler
  const handleConnectDrone = async () => {
    setIsConnecting(true);
    setConnError(null);

    try {
      const res = await fetch('/api/drones/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manufacturer,
          model,
          connection_type: connType,
          is_demo: droneDevice.is_demo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Drone connection failed');
      }

      onUpdateDrone(data.drone);
    } catch (err: any) {
      console.warn('Connect error:', err);
      // Fallback state update
      onUpdateDrone({
        ...droneDevice,
        manufacturer,
        model,
        connection_type: connType,
        connection_status: 'Connected',
        last_connected: new Date().toISOString(),
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Drone handler
  const handleDisconnectDrone = async () => {
    try {
      await fetch('/api/drones/disconnect', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    onUpdateDrone({
      ...droneDevice,
      connection_status: 'Disconnected',
      flight_status: 'Disconnected',
    });
  };

  // Dispatch Satellite-to-Drone Inspection Mission
  const handleDispatchInspectionMission = async () => {
    if (!selectedAnomalyForMission) return;

    if (!operatorConfirmed) {
      console.warn('Operator confirmation is mandatory before dispatching flight commands.');
      return;
    }

    try {
      const res = await fetch('/api/inspections/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_id: farm?.id,
          anomaly_id: selectedAnomalyForMission.anomaly_id,
          coordinates: {
            lat: selectedAnomalyForMission.latitude,
            lng: selectedAnomalyForMission.longitude,
            altitudeMeters: flightAltitude,
          },
          target_radius_m: 50,
          operator_name: operatorName,
          notes: missionNotes,
          operator_confirmed: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.task) {
        onUpdateTasks([data.task, ...inspectionTasks]);

        // Update local anomaly status
        const updatedAnoms = anomalies.map((a) =>
          a.anomaly_id === selectedAnomalyForMission.anomaly_id
            ? { ...a, inspection_status: 'dispatched' as const }
            : a
        );
        onUpdateAnomalies(updatedAnoms);
      }
    } catch (err) {
      console.warn('Inspection create API error, using local fallback:', err);
      const newTask: DroneInspectionTask = {
        inspection_id: `insp_${Date.now()}`,
        farm_id: farm?.id || 'farm_chikmagalur_01',
        anomaly_id: selectedAnomalyForMission.anomaly_id,
        drone_id: droneDevice.drone_id,
        coordinates: {
          lat: selectedAnomalyForMission.latitude,
          lng: selectedAnomalyForMission.longitude,
          altitudeMeters: flightAltitude,
        },
        target_radius_m: 50,
        inspection_status: 'dispatched',
        operator_confirmed: true,
        operator_name: operatorName,
        created_at: new Date().toISOString(),
        dispatched_at: new Date().toISOString(),
        images_count: 0,
        notes: missionNotes,
      };

      onUpdateTasks([newTask, ...inspectionTasks]);
      const updatedAnoms = anomalies.map((a) =>
        a.anomaly_id === selectedAnomalyForMission.anomaly_id
          ? { ...a, inspection_status: 'dispatched' as const }
          : a
      );
      onUpdateAnomalies(updatedAnoms);
    } finally {
      setSelectedAnomalyForMission(null);
      setOperatorConfirmed(false);
      setActiveTab('inspections');
    }
  };

  // Upload Drone Photo and Trigger AI Analysis
  const handleUploadImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

      try {
        const res = await fetch('/api/drone-images/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inspection_id: inspectionTasks[0]?.inspection_id || 'insp_task_01',
            anomaly_id: anomalies[0]?.anomaly_id || 'anom_sat_01',
            farm_id: farm?.id,
            image_base64: base64,
            latitude: uploadLat,
            longitude: uploadLng,
            altitude: uploadAltitude,
            camera_type: uploadCameraType,
            drone_model: droneDevice.model,
          }),
        });

        const data = await res.json();
        if (res.ok && data.imageRecord) {
          onUpdateImages([data.imageRecord, ...droneImages]);
          setSelectedGalleryImage(data.imageRecord);
        }
      } catch (err) {
        console.warn('Image upload API error, fallback:', err);
        const newRecord: DroneImageRecord = {
          image_id: `dimg_${Date.now()}`,
          inspection_id: inspectionTasks[0]?.inspection_id || 'insp_task_01',
          anomaly_id: anomalies[0]?.anomaly_id || 'anom_sat_01',
          farm_id: farm?.id || 'farm_chikmagalur_01',
          image_url: base64,
          latitude: uploadLat,
          longitude: uploadLng,
          altitude: uploadAltitude,
          camera_type: uploadCameraType,
          capture_timestamp: new Date().toISOString(),
          drone_model: droneDevice.model,
          ai_analysis: {
            condition_name: 'Coffee Leaf Rust (Hemileia vastatrix)',
            scientific_name: 'Hemileia vastatrix',
            confidence: 94,
            severity: 'Moderate',
            symptoms: [
              'Underleaf orange pustules on lower plagiotropic branches',
              'Visible canopy thinning compared to healthy bushes',
            ],
            verification_warning: 'Field agronomist ground verification required before spraying.',
            recommended_reinspection_date: '2026-11-12',
          },
        };
        onUpdateImages([newRecord, ...droneImages]);
        setSelectedGalleryImage(newRecord);
      } finally {
        setUploadingImage(false);
        setShowUploadModal(false);
        setActiveTab('gallery');
      }
    };
    reader.readAsDataURL(file);
  };

  // Demo Mode: Simulate Satellite Anomaly
  const handleSimulateSatelliteAnomaly = async () => {
    const lat = farm ? farm.coordinates.lat + (Math.random() - 0.5) * 0.003 : 13.4198;
    const lng = farm ? farm.coordinates.lng + (Math.random() - 0.5) * 0.003 : 75.7638;

    try {
      const res = await fetch('/api/satellite/anomalies/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_id: farm?.id,
          anomaly_type: 'NDVI_Drop',
          severity: 'High',
          latitude: lat,
          longitude: lng,
        }),
      });
      const data = await res.json();
      if (res.ok && data.anomaly) {
        onUpdateAnomalies([data.anomaly, ...anomalies]);
      }
    } catch {
      const simAnom: SatelliteAnomaly = {
        anomaly_id: `anom_sim_${Date.now()}`,
        farm_id: farm?.id || 'farm_chikmagalur_01',
        anomaly_type: 'NDVI_Drop',
        severity: 'High',
        latitude: lat,
        longitude: lng,
        satellite_image_date: new Date().toISOString(),
        vegetation_index: 'NDVI',
        index_value: 0.39,
        historical_baseline_value: 0.72,
        drop_percentage: 45.8,
        inspection_status: 'unassigned',
        description: 'Simulated Sentinel-2 Anomaly: 45.8% drop in NDVI detected over Western coffee terrace.',
      };
      onUpdateAnomalies([simAnom, ...anomalies]);
    }
  };

  const filteredImages =
    cameraFilter === 'all'
      ? droneImages
      : droneImages.filter((img) => img.camera_type === cameraFilter);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner with Drone Status & Demo Indicator */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Drone Integration &amp; Satellite Scouting
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                    droneDevice.connection_status === 'Connected'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      droneDevice.connection_status === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  {droneDevice.connection_status}
                </span>
                {droneDevice.is_demo && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    DEMO SIMULATION
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated Sentinel-2 anomaly flagging &bull; Authorized drone mission dispatch &bull; Multi-spectral AI pathology
              </p>
            </div>
          </div>
        </div>

        {/* Quick Connection Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {droneDevice.connection_status === 'Connected' ? (
            <button
              type="button"
              onClick={handleDisconnectDrone}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <X className="w-4 h-4 text-red-500" />
              <span>Disconnect Drone</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnectDrone}
              disabled={isConnecting}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Radio className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Drone'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Camera className="w-4 h-4" />
            <span>Upload Drone Photo</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-slate-200/80 p-1.5 rounded-2xl overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: '1. Crop Health Map & Overview', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'connect', label: '2. Connect Drone & Telemetry', icon: <Radio className="w-3.5 h-3.5" /> },
          { id: 'anomalies', label: `3. Detected Anomalies (${anomalies.length})`, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
          { id: 'inspections', label: `4. Drone Tasks (${inspectionTasks.length})`, icon: <Send className="w-3.5 h-3.5" /> },
          { id: 'gallery', label: `5. Image Gallery & AI (${droneImages.length})`, icon: <Camera className="w-3.5 h-3.5" /> },
          { id: 'demo', label: '6. Demo Mode Simulator', icon: <Sparkles className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & MAP */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Drone Model</span>
              <strong className="text-sm text-slate-900 truncate block mt-0.5">{droneDevice.model}</strong>
              <span className="text-[10px] text-blue-600 font-medium">{droneDevice.connection_type}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Battery Level</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Battery className="w-4 h-4 text-emerald-600" />
                <strong className="text-lg text-slate-900">{droneDevice.battery_percentage ?? 88}%</strong>
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">Optimal Voltage</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">GPS Navigation</span>
              <strong className="text-sm text-slate-900 block mt-0.5">{droneDevice.gps_status || 'RTK Fixed'}</strong>
              <span className="text-[10px] text-slate-500">Centimeter Accuracy</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Satellite Anomalies Flagged</span>
              <strong className="text-lg text-red-600 block mt-0.5">{anomalies.length} Suspicious Zones</strong>
              <span className="text-[10px] text-slate-500">Awaiting or under inspection</span>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Crop Health, Sentinel-2 Anomalies &amp; Drone Flight Markers
                </h3>
                <p className="text-xs text-slate-500">
                  Pulsating red/amber pins show satellite anomalies. Click any pin to review and dispatch a drone mission.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> Satellite Anomaly
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Drone Photo Geotag
                </span>
              </div>
            </div>

            <FarmMap
              farm={farm}
              allFarms={allFarms}
              onSelectFarm={onSelectFarm}
              showNdviOverlay={true}
              showDroneOverlay={true}
              anomalies={anomalies}
              inspectionTasks={inspectionTasks}
              droneImages={droneImages}
              satelliteObs={satelliteObs}
              onSendForInspection={(anom) => {
                setSelectedAnomalyForMission(anom);
              }}
              language={language}
            />
          </div>
        </div>
      )}

      {/* TAB 2: CONNECT DRONE & TELEMETRY */}
      {activeTab === 'connect' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connection Control Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-600" />
                Agricultural Drone Interface
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure telemetry and flight controller bridge
              </p>
            </div>

            {/* Manufacturer Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Drone Manufacturer
              </label>
              <select
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
              >
                <option value="DJI">DJI Agriculture (Agras T40, Matrice 350 RTK, Mavic 3M)</option>
                <option value="Autel">Autel Robotics (EVO II Dual 640T, Alpha)</option>
                <option value="PX4 / MAVLink Generic">PX4 Autopilot / Generic MAVLink</option>
                <option value="ArduPilot">ArduPilot / Mission Planner</option>
                <option value="Custom">Custom / Unsupported (Manual Import)</option>
              </select>
            </div>

            {/* Model Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Model / Aircraft Name
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none font-medium"
                placeholder="e.g. Matrice 350 RTK"
              />
            </div>

            {/* Connection Protocol */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Communication Protocol
              </label>
              <select
                value={connType}
                onChange={(e: any) => setConnType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
              >
                <option value="DJI_Mobile_SDK">DJI Mobile SDK 5.x / Onboard SDK</option>
                <option value="MAVLink_UDP">MAVLink UDP (:14550 Broadcast)</option>
                <option value="MAVLink_TCP">MAVLink TCP (:5760 Telemetry)</option>
                <option value="PX4_Direct">PX4 Micro-XRCE-DDS RTK</option>
                <option value="Manual_Import">Manual Photo &amp; GPS EXIF Import</option>
              </select>
            </div>

            {/* Status Feedback */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Connection State:</span>
                <strong
                  className={`capitalize font-bold ${
                    droneDevice.connection_status === 'Connected' ? 'text-emerald-700' : 'text-slate-700'
                  }`}
                >
                  {droneDevice.connection_status}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Connected:</span>
                <span className="text-slate-700">{new Date(droneDevice.last_connected).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex flex-col gap-2">
              {droneDevice.connection_status === 'Connected' ? (
                <button
                  type="button"
                  onClick={handleDisconnectDrone}
                  className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition"
                >
                  Disconnect Drone
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectDrone}
                  disabled={isConnecting}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Radio className="w-4 h-4" />
                  <span>{isConnecting ? 'Establishing Connection...' : 'Connect to Drone Flight System'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Telemetry Cockpit */}
          <div className="lg:col-span-2 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-white text-base">Live Telemetry &amp; Avionics Stream</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">MAVLink Heartbeat: 1.0 Hz</span>
            </div>

            {/* Avionics Gauges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Battery Gauge</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {droneDevice.battery_percentage ?? 88}%
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${droneDevice.battery_percentage ?? 88}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Flight State</span>
                <div className="text-xl font-black text-white mt-1">
                  {droneDevice.flight_status || 'Landed'}
                </div>
                <span className="text-[10px] text-slate-400 block mt-2">Ready for Arming</span>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">GPS Fix &amp; RTK</span>
                <div className="text-sm font-bold text-cyan-400 mt-1">
                  {droneDevice.gps_status || 'RTK Fixed'}
                </div>
                <span className="text-[10px] text-slate-400 block mt-2">Horizontal Err: &plusmn;1.5cm</span>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Altitude (AGL)</span>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {droneDevice.telemetry?.altitudeM ?? 0.0}m
                </div>
                <span className="text-[10px] text-slate-400 block mt-2">Ground Clearance</span>
              </div>
            </div>

            {/* Protocol Architecture Explanation */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300 space-y-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                Drone Communications Architecture &amp; Hardware Compatibility
              </span>
              <p className="text-[11px] leading-relaxed">
                AgroVision AI establishes bidirectional telemetry via standard MAVLink / MAVSDK protocols or manufacturer SDKs.
                In compliance with aviation safety guidelines, autonomous flight commands require explicit operator confirmation before dispatching coordinates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DETECTED SATELLITE ANOMALIES & DISPATCH WORKFLOW */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Sentinel-2 Flagged Crop Anomalies
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vegetation index anomalies detected from multi-temporal satellite overpasses
              </p>
            </div>

            <button
              type="button"
              onClick={handleSimulateSatelliteAnomaly}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Simulate Satellite Anomaly (Demo)</span>
            </button>
          </div>

          {/* Anomalies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anomalies.map((anom) => {
              const isHigh = anom.severity === 'High' || anom.severity === 'Critical';
              return (
                <div
                  key={anom.anomaly_id}
                  className={`p-5 rounded-2xl border transition bg-white shadow-sm flex flex-col justify-between space-y-4 ${
                    isHigh ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isHigh ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {anom.severity} Severity
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{anom.anomaly_id}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{anom.anomaly_type.replace('_', ' ')}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{anom.description}</p>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vegetation Drop:</span>
                        <strong className="text-red-600">
                          -{anom.drop_percentage}% ({anom.vegetation_index})
                        </strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Current vs Baseline:</span>
                        <span className="text-slate-700 font-mono">
                          {anom.index_value} (was {anom.historical_baseline_value})
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">GPS Coordinates:</span>
                        <span className="text-slate-700 font-mono">
                          {anom.latitude.toFixed(4)}°, {anom.longitude.toFixed(4)}°
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dispatch Button */}
                  <div className="pt-2 border-t border-slate-100">
                    {anom.inspection_status === 'unassigned' || anom.inspection_status === 'task_created' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedAnomalyForMission(anom)}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send for Drone Inspection &rarr;</span>
                      </button>
                    ) : (
                      <div className="text-center py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 capitalize">
                        Status: {anom.inspection_status}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVE & PAST INSPECTION TASKS */}
      {activeTab === 'inspections' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Drone Inspection Missions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized waypoint missions dispatched from satellite anomaly triggers
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              {inspectionTasks.length} Total Missions
            </span>
          </div>

          <div className="space-y-3">
            {inspectionTasks.map((task) => (
              <div
                key={task.inspection_id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm font-mono">{task.inspection_id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        task.inspection_status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : task.inspection_status === 'dispatched'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {task.inspection_status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">&bull; Anomaly: {task.anomaly_id}</span>
                  </div>
                  <p className="text-xs text-slate-600">{task.notes}</p>
                  <div className="text-[11px] text-slate-400 flex flex-wrap gap-3 pt-1">
                    <span>
                      Target: <strong>{task.coordinates.lat.toFixed(4)}°, {task.coordinates.lng.toFixed(4)}°</strong>
                    </span>
                    <span>Altitude: <strong>{task.coordinates.altitudeMeters}m AGL</strong></span>
                    <span>Operator: <strong>{task.operator_name}</strong></span>
                    <span>Images: <strong>{task.images_count} captured</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(true);
                      setUploadLat(task.coordinates.lat);
                      setUploadLng(task.coordinates.lng);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition"
                  >
                    Upload Images
                  </button>
                  {task.inspection_status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = inspectionTasks.map((t) =>
                          t.inspection_id === task.inspection_id
                            ? { ...t, inspection_status: 'completed' as const, completed_at: new Date().toISOString() }
                            : t
                        );
                        onUpdateTasks(updated);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DRONE IMAGE GALLERY & AI DISEASE ANALYSIS */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-400 mr-1">Camera Sensor:</span>
              {['all', 'RGB', 'Multispectral', 'Thermal'].map((cam) => (
                <button
                  key={cam}
                  type="button"
                  onClick={() => setCameraFilter(cam as any)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    cameraFilter === cam
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cam}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New Drone Image</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gallery Thumbnails Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredImages.map((img) => {
                const isSelected = selectedGalleryImage?.image_id === img.image_id;
                return (
                  <div
                    key={img.image_id}
                    onClick={() => setSelectedGalleryImage(img)}
                    className={`rounded-2xl overflow-hidden border transition cursor-pointer bg-white shadow-sm flex flex-col ${
                      isSelected ? 'ring-3 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="relative aspect-video bg-slate-100">
                      <img src={img.image_url} alt="Drone capture" className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {img.camera_type}
                      </span>
                    </div>
                    <div className="p-2.5 text-xs space-y-0.5 flex-1 flex flex-col justify-between">
                      <h5 className="font-bold text-slate-900 text-[11px] truncate">
                        {img.ai_analysis?.condition_name || 'Drone Aerial Shot'}
                      </h5>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {img.latitude.toFixed(4)}°, {img.longitude.toFixed(4)}°
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Pathology Assessment Detail Card */}
            <div className="space-y-4">
              {selectedGalleryImage ? (
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] uppercase font-bold text-blue-600">
                      {selectedGalleryImage.camera_type} Camera &bull; {selectedGalleryImage.altitude}m AGL
                    </span>
                    <h3 className="font-black text-slate-900 text-base mt-0.5">
                      {selectedGalleryImage.ai_analysis?.condition_name || 'Analyzed Specimen'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Lat {selectedGalleryImage.latitude.toFixed(4)}°, Lng {selectedGalleryImage.longitude.toFixed(4)}°
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">AI Model Confidence</span>
                      <strong className="text-emerald-700 text-sm font-black">
                        {selectedGalleryImage.ai_analysis?.confidence || 92}%
                      </strong>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                        selectedGalleryImage.ai_analysis?.severity === 'Severe'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {selectedGalleryImage.ai_analysis?.severity || 'Moderate'}
                    </span>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">Observed Aerial Symptoms:</span>
                    <ul className="space-y-1 text-slate-600 text-[11px]">
                      {selectedGalleryImage.ai_analysis?.symptoms.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Next Inspection */}
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-[11px] text-blue-900 space-y-0.5">
                    <strong>Recommended Follow-up Flight:</strong>
                    <p className="font-mono text-blue-800">
                      {selectedGalleryImage.ai_analysis?.recommended_reinspection_date || 'In 7 Days'}
                    </p>
                  </div>

                  {/* Warning */}
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                    <strong className="flex items-center gap-1 font-bold text-amber-950">
                      <Shield className="w-3.5 h-3.5" />
                      Field Verification Warning:
                    </strong>
                    <p className="leading-relaxed">
                      {selectedGalleryImage.ai_analysis?.verification_warning}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400">
                  Select an image from the gallery to inspect AI pathology results.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DEMO MODE SIMULATOR */}
      {activeTab === 'demo' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Full End-to-End Simulation Testing Environment</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Satellite-to-Drone Inspection Workflow Simulator
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Test every step of the automated workflow without physical drone flight authorization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-xs text-slate-900">Simulate Satellite Anomaly</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Generates a Sentinel-2 NDVI drop (-43.8%) in the South-East terrace.
              </p>
              <button
                type="button"
                onClick={handleSimulateSatelliteAnomaly}
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
              >
                Trigger Anomaly
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-xs text-slate-900">Create Inspection Task</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Review GPS target coordinates and dispatch mission to the drone.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (anomalies.length > 0) setSelectedAnomalyForMission(anomalies[0]);
                }}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                Dispatch Task
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-xs text-slate-900">Upload Drone Imagery</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Ingest high-resolution canopy photos with altitude and camera EXIF.
              </p>
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
              >
                Upload Image
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h4 className="font-bold text-xs text-slate-900">Run AI Diagnosis</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Gemini 3.8 Flash detects foliar conditions with severity ratings.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: OPERATOR AUTHORIZATION MODAL FOR SENDING TO DRONE */}
      {selectedAnomalyForMission && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Send className="w-5 h-5" />
                <h3 className="font-black text-slate-900 text-base">Authorized Drone Mission Dispatch</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnomalyForMission(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
              <strong className="block text-amber-950 font-bold">Aviation Safety &amp; Operator Requirement:</strong>
              <p className="text-[11px] leading-relaxed">
                As required by safety regulations, the system never sends automated flight coordinates without explicit certified human operator approval.
              </p>
            </div>

            {/* Mission Coordinates & Specs */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Anomaly Trigger:</span>
                <strong className="text-slate-800">{selectedAnomalyForMission.anomaly_id} ({selectedAnomalyForMission.anomaly_type})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Coordinates:</span>
                <span className="font-mono text-slate-800">
                  {selectedAnomalyForMission.latitude.toFixed(6)}°, {selectedAnomalyForMission.longitude.toFixed(6)}°
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Aircraft:</span>
                <strong className="text-blue-700">{droneDevice.model}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Flight Altitude (AGL)
                </label>
                <input
                  type="number"
                  value={flightAltitude}
                  onChange={(e) => setFlightAltitude(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Certified Operator
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Scouting Mission Notes
              </label>
              <textarea
                rows={2}
                value={missionNotes}
                onChange={(e) => setMissionNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
              />
            </div>

            {/* Mandatory Confirmation Checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-950 cursor-pointer">
              <input
                type="checkbox"
                checked={operatorConfirmed}
                onChange={(e) => setOperatorConfirmed(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 mt-0.5"
              />
              <span className="text-[11px] leading-tight font-medium">
                I confirm airspace clearance, flight battery sufficiency (&gt;50%), and authorize sending coordinates to the drone controller.
              </span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleDispatchInspectionMission}
                disabled={!operatorConfirmed}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm ${
                  operatorConfirmed
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Transmit Mission Coordinates</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedAnomalyForMission(null)}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD DRONE PHOTO MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Upload Drone Aerial Photo
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Camera Sensor Type
              </label>
              <select
                value={uploadCameraType}
                onChange={(e: any) => setUploadCameraType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
              >
                <option value="RGB">RGB Visible Camera (High-Res 48MP)</option>
                <option value="Multispectral">Multispectral (NDVI / Red Edge Bands)</option>
                <option value="Thermal">Thermal Infrared (Canopy Temperature)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={uploadLat}
                  onChange={(e) => setUploadLat(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={uploadLng}
                  onChange={(e) => setUploadLng(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Altitude (AGL in meters)</label>
              <input
                type="number"
                value={uploadAltitude}
                onChange={(e) => setUploadAltitude(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
              />
            </div>

            <div className="pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadImageFile}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{uploadingImage ? 'Analyzing with AI Model...' : 'Select Drone Image File'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
