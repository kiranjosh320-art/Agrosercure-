import { Farm, SatelliteAnomaly, CropDiseaseDetection, WeatherData, FinancialRiskProfile } from '../types';

// Standardized benchmark data for major Indian crops (Scales of Finance & MSP benchmarks)
export interface IndianCropFinancialBenchmark {
  cropKey: string;
  cropName: string;
  defaultExpectedYieldQuintalsPerAcre: number;
  benchmarkMspPerQuintal: number; // in ₹
  avgInputCostPerAcre: number; // in ₹
  pmfbySumInsuredPerAcre: number; // in ₹
}

export const CROP_FINANCIAL_BENCHMARKS: Record<string, IndianCropFinancialBenchmark> = {
  coffee: {
    cropKey: 'coffee',
    cropName: 'Coffee (Arabica / Robusta)',
    defaultExpectedYieldQuintalsPerAcre: 8.5,
    benchmarkMspPerQuintal: 28500, // ₹28,500 / quintal (clean coffee)
    avgInputCostPerAcre: 48000,
    pmfbySumInsuredPerAcre: 75000,
  },
  rice: {
    cropKey: 'rice',
    cropName: 'Rice / Paddy (Basmati / Non-Basmati)',
    defaultExpectedYieldQuintalsPerAcre: 22.0,
    benchmarkMspPerQuintal: 2320, // MSP rate ₹2,320 / quintal
    avgInputCostPerAcre: 26000,
    pmfbySumInsuredPerAcre: 42000,
  },
  wheat: {
    cropKey: 'wheat',
    cropName: 'Wheat (Sharbati / Durum)',
    defaultExpectedYieldQuintalsPerAcre: 19.5,
    benchmarkMspPerQuintal: 2425, // MSP rate ₹2,425 / quintal
    avgInputCostPerAcre: 21000,
    pmfbySumInsuredPerAcre: 38000,
  },
  cotton: {
    cropKey: 'cotton',
    cropName: 'Cotton (Bt Hybrid)',
    defaultExpectedYieldQuintalsPerAcre: 10.5,
    benchmarkMspPerQuintal: 7521, // MSP rate ₹7,521 / quintal
    avgInputCostPerAcre: 34000,
    pmfbySumInsuredPerAcre: 48000,
  },
  tea: {
    cropKey: 'tea',
    cropName: 'Tea (CTC & Orthodox)',
    defaultExpectedYieldQuintalsPerAcre: 14.0,
    benchmarkMspPerQuintal: 16500,
    avgInputCostPerAcre: 52000,
    pmfbySumInsuredPerAcre: 70000,
  },
  spices: {
    cropKey: 'spices',
    cropName: 'Black Pepper & Cardamom',
    defaultExpectedYieldQuintalsPerAcre: 4.8,
    benchmarkMspPerQuintal: 58000,
    avgInputCostPerAcre: 62000,
    pmfbySumInsuredPerAcre: 85000,
  },
  maize: {
    cropKey: 'maize',
    cropName: 'Maize / Corn',
    defaultExpectedYieldQuintalsPerAcre: 24.0,
    benchmarkMspPerQuintal: 2225,
    avgInputCostPerAcre: 19500,
    pmfbySumInsuredPerAcre: 34000,
  },
  groundnut: {
    cropKey: 'groundnut',
    cropName: 'Groundnut / Peanut',
    defaultExpectedYieldQuintalsPerAcre: 12.0,
    benchmarkMspPerQuintal: 6783,
    avgInputCostPerAcre: 24000,
    pmfbySumInsuredPerAcre: 36000,
  },
};

export const FinancialRiskService = {
  getBenchmarkForCrop(cropType: string = 'Coffee'): IndianCropFinancialBenchmark {
    const lower = cropType.toLowerCase();
    if (lower.includes('rice') || lower.includes('paddy')) return CROP_FINANCIAL_BENCHMARKS.rice;
    if (lower.includes('wheat')) return CROP_FINANCIAL_BENCHMARKS.wheat;
    if (lower.includes('cotton')) return CROP_FINANCIAL_BENCHMARKS.cotton;
    if (lower.includes('tea')) return CROP_FINANCIAL_BENCHMARKS.tea;
    if (lower.includes('pepper') || lower.includes('spice') || lower.includes('cardamom')) return CROP_FINANCIAL_BENCHMARKS.spices;
    if (lower.includes('maize') || lower.includes('corn')) return CROP_FINANCIAL_BENCHMARKS.maize;
    if (lower.includes('groundnut') || lower.includes('peanut')) return CROP_FINANCIAL_BENCHMARKS.groundnut;
    return CROP_FINANCIAL_BENCHMARKS.coffee;
  },

  calculateFinancialRiskProfile(
    farm?: Farm,
    anomalies: SatelliteAnomaly[] = [],
    diseaseRecords: CropDiseaseDetection[] = [],
    weather?: WeatherData,
    customOverrides?: {
      acreage?: number;
      expectedYield?: number;
      mandiPrice?: number;
      inputCost?: number;
    }
  ): FinancialRiskProfile {
    const crop = farm?.cropType || 'Coffee Arabica';
    const benchmark = this.getBenchmarkForCrop(crop);

    const acreage = customOverrides?.acreage ?? (farm?.areaAcres || 12.5);
    const expectedYield = customOverrides?.expectedYield ?? benchmark.defaultExpectedYieldQuintalsPerAcre;
    const mandiPrice = customOverrides?.mandiPrice ?? benchmark.benchmarkMspPerQuintal;
    const inputCostPerAcre = customOverrides?.inputCost ?? benchmark.avgInputCostPerAcre;
    const sumInsuredPerAcre = benchmark.pmfbySumInsuredPerAcre;

    // Component Penalties
    // 1. Weather Penalty (0 - 30)
    let weatherPenalty = 6;
    if (weather?.current) {
      if (weather.current.precipitation > 25 || weather.current.temperature > 37 || weather.current.temperature < 4) {
        weatherPenalty = 26;
      } else if (weather.current.precipitation > 10 || weather.current.temperature > 33) {
        weatherPenalty = 18;
      } else if (weather.current.relativeHumidity > 85) {
        weatherPenalty = 14;
      }
    }

    // 2. Disease Penalty (0 - 25)
    let diseasePenalty = 4;
    const severeDiseases = diseaseRecords.filter((d) => d.severity === 'Severe');
    const moderateDiseases = diseaseRecords.filter((d) => d.severity === 'Moderate');
    if (severeDiseases.length > 0) {
      diseasePenalty = 24;
    } else if (moderateDiseases.length > 0) {
      diseasePenalty = 15;
    } else if (diseaseRecords.length > 0) {
      diseasePenalty = 9;
    }

    // 3. Satellite Anomaly Penalty (0 - 25)
    let anomalyPenalty = 5;
    const highAnomalies = anomalies.filter((a) => a.severity === 'High' || a.severity === 'Critical');
    if (highAnomalies.length > 0) {
      anomalyPenalty = Math.min(25, 12 + highAnomalies.length * 6);
    } else if (anomalies.length > 0) {
      anomalyPenalty = 12;
    }

    // 4. Soil Moisture / Aridity Penalty (0 - 20)
    let soilMoisturePenalty = 4;
    const moistureAnomalies = anomalies.filter((a) => a.anomaly_type === 'Moisture_Deficit');
    if (moistureAnomalies.length > 0) {
      soilMoisturePenalty = 17;
    }

    // Composite Risk Score (0 - 100)
    const compositeRiskScore = Math.min(100, Math.round(weatherPenalty + diseasePenalty + anomalyPenalty + soilMoisturePenalty));

    let riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
    if (compositeRiskScore >= 75) riskLevel = 'Critical';
    else if (compositeRiskScore >= 50) riskLevel = 'High';
    else if (compositeRiskScore >= 25) riskLevel = 'Moderate';

    // Assessed Yield Loss % directly correlates with the composite risk score
    const assessedYieldLossPercent = Math.min(90, Math.max(0, Math.round(compositeRiskScore * 0.45)));

    // Total Financial Projections
    const potentialGrossRevenue = acreage * expectedYield * mandiPrice;
    const totalInputInvested = acreage * inputCostPerAcre;
    const projectedLoss = potentialGrossRevenue * (assessedYieldLossPercent / 100);
    const projectedRevenue = potentialGrossRevenue - projectedLoss;

    // PMFBY Payout Estimation:
    // If yield loss exceeds guaranteed threshold (usually 20%), payout proportional to shortfall
    const thresholdLossPercent = 15;
    let estimatedPmfbyPayout = 0;
    if (assessedYieldLossPercent > thresholdLossPercent) {
      const claimableLossPercent = assessedYieldLossPercent - thresholdLossPercent;
      estimatedPmfbyPayout = Math.round(acreage * sumInsuredPerAcre * (claimableLossPercent / 85));
    }

    const netFinancialExposure = Math.max(0, projectedLoss - estimatedPmfbyPayout);

    // Kisan Credit Card (KCC) Health Score: 300 - 850
    // Inverted from risk score + bonus for active parcel mapping
    const baseCredit = 820;
    const creditDeduction = compositeRiskScore * 3.8;
    const kccCreditScore = Math.max(350, Math.min(850, Math.round(baseCredit - creditDeduction)));

    // Recommendations
    const recommendations: string[] = [];
    if (compositeRiskScore > 50) {
      recommendations.push('File a proactive PMFBY Localized Calamity Intimation within the 72-hour regulatory window.');
      recommendations.push('Execute targeted drone multispectral flight to generate geo-tagged loss evidence.');
    }
    if (diseasePenalty > 12) {
      recommendations.push('Implement immediate chemical fungicide containment to prevent yield loss escalation past 25%.');
    }
    if (weatherPenalty > 15) {
      recommendations.push('Secure harvest drying floors and clear perimeter runoff trenches to prevent water stagnation.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Farm parameters are within safe operational limits. Maintain routine vegetative scouting.');
    }

    return {
      farmId: farm?.id || 'primary_farm',
      cropName: crop,
      acreage,
      expectedYieldQuintalsPerAcre: expectedYield,
      mandiPricePerQuintal: mandiPrice,
      totalInputInvestmentPerAcre: inputCostPerAcre,
      sumInsuredPerAcrePmfby: sumInsuredPerAcre,
      assessedYieldLossPercent,
      compositeRiskScore,
      riskLevel,
      kccCreditScore,
      projectedRevenue: Math.round(projectedRevenue),
      projectedLoss: Math.round(projectedLoss),
      estimatedPmfbyPayout: Math.round(estimatedPmfbyPayout),
      netFinancialExposure: Math.round(netFinancialExposure),
      breakdown: {
        weatherRiskPenalty: weatherPenalty,
        diseaseRiskPenalty: diseasePenalty,
        satelliteAnomalyPenalty: anomalyPenalty,
        soilMoisturePenalty: soilMoisturePenalty,
      },
      recommendations,
    };
  },
};
