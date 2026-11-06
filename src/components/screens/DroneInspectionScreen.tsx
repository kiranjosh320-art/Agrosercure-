import React, { useState, useRef } from 'react';
import { DroneInspection, Farm, Language, TaggedPlant } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { FarmMap } from '../Map/FarmMap';
import {
  Plane,
  UploadCloud,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Shield,
  Layers,
  FileText,
  Activity,
  Compass,
  Zap,
} from 'lucide-react';

interface DroneInspectionScreenProps {
  farm?: Farm;
  allFarms: Farm[];
  onSelectFarm: (farmId: string) => void;
  inspections: DroneInspection[];
  activeInspection?: DroneInspection;
  onSaveInspection: (inspection: DroneInspection) => void;
  language: Language;
}

export const DroneInspectionScreen: React.FC<DroneInspectionScreenProps> = ({
  farm,
  allFarms,
  onSelectFarm,
  inspections,
  activeInspection,
  onSaveInspection,
  language,
}) => {
  const t = useTranslation(language);
  const currentInsp = activeInspection || inspections[0];

  const [pilotName, setPilotName] = useState('Anil Kumar (DGCA Certified)');
  const [droneModel, setDroneModel] = useState('DJI Matrice 350 RTK + Multispectral P1');
  const [altitudeMeters, setAltitudeMeters] = useState(45);
  const [flightDurationMin, setFlightDurationMin] = useState(24);
  const [gsdCm, setGsdCm] = useState(1.8);
  const [uploadedImage, setUploadedImage] = useState<string>(
    currentInsp?.imageUrl ||
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
  );

  // New tagged plant modal / form state
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [newPlantTag, setNewPlantTag] = useState('BUSH-42-SE');
  const [newPlantStatus, setNewPlantStatus] = useState<'Healthy' | 'Suspected Rust' | 'Nutrient Stress' | 'Berry Borer'>(
    'Suspected Rust'
  );
  const [newPlantNotes, setNewPlantNotes] = useState('Powdery orange pustules on lower leaves; isolate bush.');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setUploadedImage(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePlantRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInsp) return;

    const centroid = farm?.coordinates || { lat: 13.4215, lng: 75.7621 };

    const newPlant: TaggedPlant = {
      id: `plant_${Date.now()}`,
      tagNumber: newPlantTag,
      lat: Number((centroid.lat + (Math.random() - 0.5) * 0.002).toFixed(6)),
      lng: Number((centroid.lng + (Math.random() - 0.5) * 0.002).toFixed(6)),
      healthStatus: newPlantStatus,
      notes: newPlantNotes,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedInsp: DroneInspection = {
      ...currentInsp,
      bushesInspectedCount: currentInsp.bushesInspectedCount + 1,
      stressedBushesCount:
        newPlantStatus !== 'Healthy'
          ? currentInsp.stressedBushesCount + 1
          : currentInsp.stressedBushesCount,
      taggedPlants: [newPlant, ...currentInsp.taggedPlants],
    };

    onSaveInspection(updatedInsp);
    setShowAddPlantModal(false);
    setNewPlantTag('');
    setNewPlantNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t.droneTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.droneSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddPlantModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tag Individual Bush</span>
          </button>
        </div>
      </div>

      {/* Flight Telemetry & Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t.flightAltitude}</span>
            <Compass className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {currentInsp?.altitudeMeters || 45} <span className="text-xs font-normal text-slate-500">meters AGL</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            GSD: <strong>{currentInsp?.gsdCmPerPixel || 1.8} cm/px</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t.bushesInspected}</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {currentInsp?.bushesInspectedCount || 420}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Survey Duration: <strong>{currentInsp?.flightDurationMin || 24} min</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t.bushesFlagged}</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-600">
            {currentInsp?.stressedBushesCount || 18}
          </div>
          <div className="text-[11px] text-red-500 mt-0.5 font-medium">
            Requires targeted copper spray
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Drone Model &amp; RTK</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {currentInsp?.droneModel || 'DJI Matrice 350 RTK'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
            Pilot: {currentInsp?.pilotName || 'Certified DGCA'}
          </div>
        </div>
      </div>

      {/* Main Map & Tagged Plants Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map with Drone Path Overlay */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-600" />
                  Flight Path &amp; Plant Geotag Map
                </h3>
                <span className="text-[11px] text-slate-500">
                  {farm?.name} &bull; Surveyed on {currentInsp ? new Date(currentInsp.flightDate).toLocaleDateString() : 'Recent'}
                </span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-lg">
                Waypoints: {currentInsp?.waypointsCount || 16}
              </span>
            </div>

            <FarmMap
              farm={farm}
              allFarms={allFarms}
              onSelectFarm={onSelectFarm}
              showDroneOverlay={true}
              droneInspection={currentInsp}
              language={language}
            />
          </div>

          {/* Aerial Image Preview & Upload Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Aerial Orthomosaic &amp; Canopy Snapshot
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{t.uploadDronePhoto}</span>
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden max-h-72 border border-slate-200">
              <img
                src={uploadedImage}
                alt="Drone Survey Plantation"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-lg border border-slate-700">
                Ground Sampling Distance: <strong>1.8 cm/px</strong> &bull; Lat 13.4215°, Lng 75.7621°
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Tagged Individual Coffee Bushes */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Tagged Individual Bushes
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {currentInsp?.taggedPlants.length || 0} Records
              </span>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto">
              {currentInsp?.taggedPlants.map((plant) => {
                const isRust = plant.healthStatus.includes('Rust');
                return (
                  <div
                    key={plant.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      isRust
                        ? 'border-red-300 bg-red-50/60'
                        : plant.healthStatus === 'Healthy'
                        ? 'border-emerald-300 bg-emerald-50/60'
                        : 'border-amber-300 bg-amber-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono">
                        {plant.tagNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isRust
                            ? 'bg-red-200 text-red-800'
                            : plant.healthStatus === 'Healthy'
                            ? 'bg-emerald-200 text-emerald-800'
                            : 'bg-amber-200 text-amber-800'
                        }`}
                      >
                        {plant.healthStatus}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                      {plant.notes}
                    </p>

                    <div className="pt-1 text-[10px] text-slate-400 flex justify-between">
                      <span>{plant.date}</span>
                      <span className="font-mono">
                        {plant.lat.toFixed(4)}°, {plant.lng.toFixed(4)}°
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowAddPlantModal(true)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-400 text-blue-700 hover:bg-blue-50 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tag Another Bush</span>
            </button>
          </div>

          {/* Future Hardware Integration Guide (Prompt Spec Section 7) */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t.connectDroneHardware}
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {t.droneHardwareNote}
            </p>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-[11px] space-y-1">
              <span className="text-slate-400 block font-semibold">Future Hardware Integration Endpoints:</span>
              <p className="font-mono text-emerald-300">MAVLink UDP Port: :14550</p>
              <p className="font-mono text-emerald-300">DJI Onboard SDK / Payload SDK 3.x</p>
              <p className="font-mono text-emerald-300">GeoTIFF Orthomosaic Cloud Pipeline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tag Plant Modal */}
      {showAddPlantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePlantRecord}
            className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Tag Individual Bush Record</h3>
              <button
                type="button"
                onClick={() => setShowAddPlantModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bush Identifier Tag
              </label>
              <input
                type="text"
                required
                value={newPlantTag}
                onChange={(e) => setNewPlantTag(e.target.value)}
                placeholder="e.g. BUSH-104-NW"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Health Status
              </label>
              <select
                value={newPlantStatus}
                onChange={(e: any) => setNewPlantStatus(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none bg-white"
              >
                <option value="Healthy">Healthy (Normal Vigorous Foliage)</option>
                <option value="Suspected Rust">Suspected Rust (Powdery pustules)</option>
                <option value="Nutrient Stress">Nutrient Stress (Chlorosis / Yellowing)</option>
                <option value="Berry Borer">Berry Borer (Fruit boreholes)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Field Inspection Notes
              </label>
              <textarea
                rows={3}
                required
                value={newPlantNotes}
                onChange={(e) => setNewPlantNotes(e.target.value)}
                placeholder="Observed symptoms and recommended agronomic action..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                Save Bush Record
              </button>
              <button
                type="button"
                onClick={() => setShowAddPlantModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
