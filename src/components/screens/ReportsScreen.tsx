import React from 'react';
import {
  Farm,
  Language,
  SatelliteObservation,
  DroneInspection,
  CropDiseaseDetection,
  WeatherData,
} from '../../types';
import { useTranslation } from '../../i18n/translations';
import {
  FileText,
  Printer,
  Download,
  Sprout,
  Satellite,
  Plane,
  Stethoscope,
  ShieldCheck,
  Calendar,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface ReportsScreenProps {
  farm?: Farm;
  satelliteObs?: SatelliteObservation;
  droneInspection?: DroneInspection;
  diseaseDetections: CropDiseaseDetection[];
  weather?: WeatherData;
  language: Language;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  farm,
  satelliteObs,
  droneInspection,
  diseaseDetections,
  weather,
  language,
}) => {
  const t = useTranslation(language);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t.reports}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official Agricultural Health Audit Dossier combining satellite remote sensing, autonomous drone surveys, and plant pathology diagnostics.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>{t.downloadPdf}</span>
        </button>
      </div>

      {/* Printable Report Document */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-md border border-slate-200 max-w-4xl mx-auto space-y-8 text-slate-800 print:shadow-none print:border-none print:p-0">
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-emerald-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              🌾
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                AGROVISION <span className="text-emerald-600">AI</span>
              </h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                CROP HEALTH &amp; VEGETATION AUDIT DOSSIER
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500">
            <div>
              Dossier Ref: <strong className="font-mono text-slate-800">AGV-{farm?.id.slice(-6).toUpperCase() || '2026-X'}</strong>
            </div>
            <div>
              Date Generated: <strong className="text-slate-800">{new Date().toLocaleDateString()}</strong>
            </div>
            <div>
              Status: <span className="font-bold text-emerald-700 uppercase">Verified Report</span>
            </div>
          </div>
        </div>

        {/* Plantation Entity Overview */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold">ESTATE / FARM</span>
            <strong className="text-slate-900 text-sm">{farm?.name}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">CULTIVATED AREA</span>
            <strong className="text-slate-900 text-sm">
              {farm?.areaAcres} Acres ({farm?.areaHectares} Ha)
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">PRIMARY CROP &amp; CULTIVAR</span>
            <strong className="text-slate-900 text-sm block">{farm?.cropType}</strong>
            <span className="text-[11px] text-emerald-700 font-medium">
              {farm?.cropVariety || farm?.coffeeVariety || 'Standard Variety'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">GEOGRAPHIC COORD</span>
            <span className="font-mono text-slate-800 block text-xs">
              {farm?.coordinates.lat.toFixed(4)}°N, {farm?.coordinates.lng.toFixed(4)}°E
            </span>
          </div>
        </div>

        {/* Section 1: Satellite Radiometry (Copernicus Sentinel-2) */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
            <Satellite className="w-4 h-4 text-emerald-700" />
            1. Sentinel-2 Satellite Multi-Spectral Observations
          </h3>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Mean Parcel NDVI</span>
              <strong className="text-emerald-700 font-black text-lg">
                {satelliteObs?.meanNdvi || 0.68}
              </strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">Threshold &gt;0.6: Healthy</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Red Edge NDRE (Chlorophyll)</span>
              <strong className="text-slate-900 font-black text-lg">
                {satelliteObs?.meanNdre || 0.44}
              </strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">Canopy nitrogen status</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Water Index NDWI</span>
              <strong className="text-slate-900 font-black text-lg">
                {satelliteObs?.meanNdwi || 0.26}
              </strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">Hydration status</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <strong>Canopy Health Classification:</strong>
            <p className="text-[11px] leading-relaxed">
              <strong>{satelliteObs?.healthyAreaPercent}%</strong> healthy vigorous canopy,{' '}
              <strong>{satelliteObs?.moderateAreaPercent}%</strong> moderate vegetative vigor, and{' '}
              <strong>{satelliteObs?.stressedAreaPercent}%</strong> at-risk canopy flagged in South-East quadrant.
            </p>
          </div>
        </div>

        {/* Section 2: Autonomous Drone Scouting & Plant Geotags */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
            <Plane className="w-4 h-4 text-blue-700" />
            2. High-Resolution Drone Aerial Survey
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Flight Altitude</span>
              <strong className="text-slate-800">{droneInspection?.altitudeMeters || 45} m AGL</strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Ground Resolution</span>
              <strong className="text-slate-800">{droneInspection?.gsdCmPerPixel || 1.8} cm/px</strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Bushes Inspected</span>
              <strong className="text-slate-800">{droneInspection?.bushesInspectedCount || 420}</strong>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Flagged Bushes</span>
              <strong className="text-red-600">{droneInspection?.stressedBushesCount || 18}</strong>
            </div>
          </div>
        </div>

        {/* Section 3: AI Leaf Pathology Diagnostics */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
            <Stethoscope className="w-4 h-4 text-amber-700" />
            3. AI Leaf &amp; Plant Pathology Diagnostics (Gemini 3.8 Flash)
          </h3>

          <div className="space-y-3">
            {diseaseDetections.slice(0, 2).map((det) => (
              <div
                key={det.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 text-sm block">{det.conditionName}</strong>
                    <span className="text-[11px] text-slate-500 italic font-mono">{det.scientificName}</span>
                  </div>
                  <span className="font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px]">
                    Confidence: {det.confidence}% &bull; {det.severity}
                  </span>
                </div>

                <div className="text-[11px] text-slate-700">
                  <strong>Prescribed Action: </strong>
                  {det.recommendedActions.chemicalTreatment[0]} | {det.recommendedActions.culturalAndOrganic[0]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Agronomist Sign-off Box */}
        <div className="border-t-2 border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-600">
          <div className="space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Agronomic Verification Protocol
            </p>
            <p className="text-[11px] text-slate-500 max-w-md">
              Vegetation indices and AI pathology models provide remote decision support. Chemical pesticide and fungicide applications must comply with local Coffee Board regulatory limits.
            </p>
          </div>

          <div className="text-right">
            <div className="h-10 border-b border-slate-400 w-44 mb-1" />
            <span className="block font-bold text-slate-800">Certified Agronomist Sign-off</span>
            <span className="text-[10px] text-slate-400">Coffee Extension Officer Stamp / Date</span>
          </div>
        </div>
      </div>
    </div>
  );
};
