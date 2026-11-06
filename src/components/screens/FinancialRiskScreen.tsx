import React, { useState } from 'react';
import {
  ActiveScreen,
  Farm,
  Language,
  WeatherData,
  SatelliteAnomaly,
  CropDiseaseDetection,
} from '../../types';
import { useTranslation } from '../../i18n/translations';
import { FinancialRiskService } from '../../services/financialRiskService';
import {
  IndianRupee,
  ShieldAlert,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  FileCheck,
  Building,
  CheckCircle2,
  Printer,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  HelpCircle,
  Award,
} from 'lucide-react';

interface FinancialRiskScreenProps {
  activeFarm?: Farm;
  anomalies: SatelliteAnomaly[];
  diseaseRecords: CropDiseaseDetection[];
  weather?: WeatherData;
  onNavigate: (screen: ActiveScreen) => void;
  language: Language;
}

export const FinancialRiskScreen: React.FC<FinancialRiskScreenProps> = ({
  activeFarm,
  anomalies,
  diseaseRecords,
  weather,
  onNavigate,
  language,
}) => {
  const t = useTranslation(language);

  const defaultBenchmark = FinancialRiskService.getBenchmarkForCrop(activeFarm?.cropType || 'Coffee');

  // Interactive slider overrides
  const [acreage, setAcreage] = useState<number>(activeFarm?.areaAcres || 12.5);
  const [expectedYield, setExpectedYield] = useState<number>(defaultBenchmark.defaultExpectedYieldQuintalsPerAcre);
  const [mandiPrice, setMandiPrice] = useState<number>(defaultBenchmark.benchmarkMspPerQuintal);
  const [inputCost, setInputCost] = useState<number>(defaultBenchmark.avgInputCostPerAcre);
  const [showClaimGuide, setShowClaimGuide] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);

  const riskProfile = FinancialRiskService.calculateFinancialRiskProfile(
    activeFarm,
    anomalies,
    diseaseRecords,
    weather,
    { acreage, expectedYield, mandiPrice, inputCost }
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 text-white p-6 rounded-3xl shadow-xl border border-amber-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
              <IndianRupee className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  AgroSecure <span className="text-amber-400">Financial Risk Dashboard</span>
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase">
                  PMFBY & Crop Insurance
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Yield loss valuation, Revenue-at-Risk modeling, PMFBY claim estimation & Kisan Credit health index
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowDossierModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Claim Dossier</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Composite Risk Score */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Composite Risk Index</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{riskProfile.compositeRiskScore}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  riskProfile.riskLevel === 'Critical'
                    ? 'bg-rose-600'
                    : riskProfile.riskLevel === 'High'
                    ? 'bg-amber-500'
                    : riskProfile.riskLevel === 'Moderate'
                    ? 'bg-yellow-400'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${riskProfile.compositeRiskScore}%` }}
              />
            </div>
          </div>
          <span
            className={`text-[11px] font-extrabold uppercase ${
              riskProfile.riskLevel === 'Critical'
                ? 'text-rose-600'
                : riskProfile.riskLevel === 'High'
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}
          >
            {riskProfile.riskLevel} Financial Risk
          </span>
        </div>

        {/* Assessed Yield Loss % */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Assessed Yield Loss</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-rose-600">-{riskProfile.assessedYieldLossPercent}%</span>
            </div>
            <span className="text-[11px] text-slate-500">From satellite NDVI & anomalies</span>
          </div>
          <span className="text-[10px] text-slate-400">
            Expected normal: {riskProfile.expectedYieldQuintalsPerAcre} Qtl/Acre
          </span>
        </div>

        {/* Projected Financial Loss */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Projected Revenue Loss</span>
            <IndianRupee className="w-4 h-4 text-rose-500" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-rose-600">
                ₹{riskProfile.projectedLoss.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Without PMFBY claim offset</span>
          </div>
          <span className="text-[10px] text-slate-400">
            Total crop value: ₹{(acreage * expectedYield * mandiPrice).toLocaleString('en-IN')}
          </span>
        </div>

        {/* PMFBY Estimated Claim Payout */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Est. PMFBY Claim Payout</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600">
                ₹{riskProfile.estimatedPmfbyPayout.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Claim settlement potential</span>
          </div>
          <button
            type="button"
            onClick={() => setShowClaimGuide(!showClaimGuide)}
            className="text-[11px] text-emerald-700 hover:underline font-bold text-left flex items-center gap-0.5"
          >
            <span>72-hr Intimation Guide</span> &rarr;
          </button>
        </div>
      </div>

      {/* 72-Hour PMFBY Claim Guide Banner */}
      {showClaimGuide && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-3 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <h4 className="font-extrabold text-sm text-amber-900">
                Mandatory PMFBY Localized Disaster Intimation Rule
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowClaimGuide(false)}
              className="text-amber-800 font-bold hover:text-amber-950"
            >
              &times;
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-2xl border border-amber-200">
              <strong className="block text-slate-900 mb-1">1. Intimation Time Limit:</strong>
              Report localized hailstorm, unseasonal downpour, or pest outbreak within <strong>72 hours</strong> on toll-free <strong>14447</strong> or via Crop Insurance App.
            </div>
            <div className="p-3 bg-white rounded-2xl border border-amber-200">
              <strong className="block text-slate-900 mb-1">2. Required Evidence:</strong>
              Submit Geo-tagged satellite NDVI map from AgroSecure, land RTC/Pahani survey number, and bank account details.
            </div>
            <div className="p-3 bg-white rounded-2xl border border-amber-200">
              <strong className="block text-slate-900 mb-1">3. Field Loss Assessment:</strong>
              Joint survey by Agriculture Officer, Revenue Inspector, and Insurance surveyor conducted within 10 days.
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Risk Simulator & Credit Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Revenue-at-Risk Simulator */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Interactive Revenue Protection Simulator
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">
              Adjust Farm Parameters to Model Financial Exposure
            </h3>
            <p className="text-xs text-slate-500">
              Simulate market prices, input investments, and crop yield shortfalls
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Acreage Slider */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1.5">
                <span>Cultivated Farm Land:</span>
                <span className="text-emerald-700 font-extrabold">{acreage} Acres</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="0.5"
                value={acreage}
                onChange={(e) => setAcreage(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Expected Yield */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1.5">
                <span>Normal Expected Yield:</span>
                <span className="text-slate-900 font-extrabold">{expectedYield} Quintals / Acre</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="0.5"
                value={expectedYield}
                onChange={(e) => setExpectedYield(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Mandi Price */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1.5">
                <span>Market / MSP Rate (₹/Quintal):</span>
                <span className="text-emerald-700 font-extrabold">₹{mandiPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="1500"
                max="75000"
                step="250"
                value={mandiPrice}
                onChange={(e) => setMandiPrice(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Input Cost */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1.5">
                <span>Input Investment (Seeds, Fertilizers, Labor):</span>
                <span className="text-slate-900 font-extrabold">₹{inputCost.toLocaleString('en-IN')} / Acre</span>
              </div>
              <input
                type="range"
                min="10000"
                max="90000"
                step="500"
                value={inputCost}
                onChange={(e) => setInputCost(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
            <div className="flex justify-between text-slate-600">
              <span>Potential Gross Crop Harvest Value:</span>
              <span className="font-extrabold text-slate-900">
                ₹{(acreage * expectedYield * mandiPrice).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Working Capital Invested:</span>
              <span className="font-extrabold text-slate-900">
                ₹{(acreage * inputCost).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-rose-700 font-bold border-t border-slate-200 pt-2">
              <span>Projected Loss Due to Anomalies:</span>
              <span>-₹{riskProfile.projectedLoss.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Estimated PMFBY Insurance Settlement:</span>
              <span>+₹{riskProfile.estimatedPmfbyPayout.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-300 pt-2">
              <span>Net Financial Revenue After Insurance:</span>
              <span>₹{(riskProfile.projectedRevenue + riskProfile.estimatedPmfbyPayout).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Right: Kisan Credit Card Health & Disaster Exposure */}
        <div className="lg:col-span-5 space-y-6">
          {/* KCC Credit Health Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Agri-Credit Health Meter
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Kisan Credit Card (KCC) Score
                </h3>
              </div>
              <Award className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-center">
              <span className="text-4xl font-black text-emerald-800">{riskProfile.kccCreditScore}</span>
              <span className="text-xs text-slate-400 block mt-0.5">Scale 300 to 850</span>
              <span className="inline-block mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                {riskProfile.kccCreditScore > 720 ? 'Excellent Credit Standing' : 'Acceptable Standing'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Maintains eligibility for the Government 3% prompt repayment incentive, reducing effective KCC crop loan interest to <strong>4.0% p.a.</strong>
            </p>
          </div>

          {/* Risk Factors Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900">
              Risk Component Penalty Breakdown
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Extreme Weather Threat (30 max):</span>
                  <span className="font-bold text-slate-800">{riskProfile.breakdown.weatherRiskPenalty} pts</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(riskProfile.breakdown.weatherRiskPenalty / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Disease Outbreak Severity (25 max):</span>
                  <span className="font-bold text-slate-800">{riskProfile.breakdown.diseaseRiskPenalty} pts</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${(riskProfile.breakdown.diseaseRiskPenalty / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Satellite Anomaly Area (25 max):</span>
                  <span className="font-bold text-slate-800">{riskProfile.breakdown.satelliteAnomalyPenalty} pts</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full"
                    style={{ width: `${(riskProfile.breakdown.satelliteAnomalyPenalty / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Soil Moisture Aridity (20 max):</span>
                  <span className="font-bold text-slate-800">{riskProfile.breakdown.soilMoisturePenalty} pts</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(riskProfile.breakdown.soilMoisturePenalty / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official PMFBY Claim Dossier Modal */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block">
                  Government of India &bull; PMFBY Crop Loss Dossier
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  AgroSecure Precision Risk & Insurance Assessment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDossierModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p><strong>Estate Name:</strong> {activeFarm?.name || 'Giri Shikhara Estate'}</p>
                <p><strong>Coordinates:</strong> Lat {activeFarm?.coordinates.lat.toFixed(4) || '13.4215'}°N, Lng {activeFarm?.coordinates.lng.toFixed(4) || '75.7621'}°E</p>
                <p><strong>Crop & Cultivar:</strong> {riskProfile.cropName} &bull; {acreage} Acres</p>
                <p><strong>Sentinel-2 Tile ID:</strong> T43PFS (Copernicus L2A MSI)</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[10px] text-rose-600 block">Assessed Yield Shortfall</span>
                  <span className="font-extrabold text-sm">{riskProfile.assessedYieldLossPercent}%</span>
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] text-emerald-700 block">PMFBY Claim Eligible</span>
                  <span className="font-extrabold text-sm">₹{riskProfile.estimatedPmfbyPayout.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="border border-slate-200 p-3 rounded-xl space-y-1">
                <strong>Agronomic Expert Attestation:</strong>
                <p className="text-[11px] text-slate-500">
                  Satellite remote sensing verifies spectral vegetation stress consistent with localized climatic events. Ground validation coordinates logged on AgroSecure blockchain ledger.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDossierModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
