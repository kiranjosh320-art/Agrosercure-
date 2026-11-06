import {
  ClimateAnalysisData,
  CropEcologicalRequirement,
  CropSuitabilityResult,
  GlobalRegionProfile,
} from '../types';
import { FAO_ECOCROP_DATABASE } from '../data/faoEcoCropData';

export interface SoilPreferences {
  soilType?: string;
  soilPh?: number;
  drainage?: 'Well-drained' | 'Moderate' | 'Poorly-drained' | 'Waterlogged';
  irrigationAvailable?: boolean;
}

export const CropSuitabilityService = {
  /**
   * Retrieves all verified crops from FAO EcoCrop database
   */
  getAllCrops(): CropEcologicalRequirement[] {
    return FAO_ECOCROP_DATABASE;
  },

  /**
   * Evaluates a crop against environmental & climatic conditions
   */
  evaluateCropSuitability(
    crop: CropEcologicalRequirement,
    climate: ClimateAnalysisData,
    soil: SoilPreferences = {}
  ): CropSuitabilityResult {
    const tempC = climate.annualAverages.meanTempC;
    const rainfallMm = climate.annualAverages.annualRainfallMm;
    const humidityPct = climate.annualAverages.meanHumidityPercent;
    const elevationM = climate.coordinates.elevationMeters || 1000;
    const farmPh = soil.soilPh ?? 6.2;
    const farmDrainage = soil.drainage ?? 'Well-drained';
    const hasIrrigation = soil.irrigationAvailable ?? true;

    const limitingFactors: string[] = [];
    const favorableFactors: string[] = [];
    const agronomicAdaptations: string[] = [];

    // 1. Temperature Evaluation
    let tempScore = 100;
    let tempStatus: 'optimal' | 'acceptable' | 'limiting' = 'optimal';
    let tempExpl = `Mean temp ${tempC}°C is inside optimum range (${crop.tempOptMin}°C – ${crop.tempOptMax}°C).`;

    if (tempC >= crop.tempOptMin && tempC <= crop.tempOptMax) {
      tempScore = 100;
      favorableFactors.push(`Thermal regime (${tempC}°C) is in the prime biological comfort zone.`);
    } else if (tempC >= crop.tempMin && tempC < crop.tempOptMin) {
      const ratio = (tempC - crop.tempMin) / Math.max(1, crop.tempOptMin - crop.tempMin);
      tempScore = Math.round(60 + ratio * 30);
      tempStatus = 'acceptable';
      tempExpl = `Mean temp ${tempC}°C is slightly below optimum (${crop.tempOptMin}°C), but within physiological tolerance.`;
      limitingFactors.push(`Cooler temperature will prolong vegetative cycle and delay maturity.`);
      agronomicAdaptations.push(`Use thermal mulch or orient rows to maximize sun exposure.`);
    } else if (tempC > crop.tempOptMax && tempC <= crop.tempMax) {
      const ratio = (crop.tempMax - tempC) / Math.max(1, crop.tempMax - crop.tempOptMax);
      tempScore = Math.round(55 + ratio * 30);
      tempStatus = 'acceptable';
      tempExpl = `Mean temp ${tempC}°C is above optimum (${crop.tempOptMax}°C), inducing mild heat respiration stress.`;
      limitingFactors.push(`Elevated heat during flowering may reduce fruit or grain set.`);
      agronomicAdaptations.push(`Introduce two-tier shade trees (e.g., Grevillea robusta / Erythrina) to moderate understory temperatures.`);
    } else {
      tempScore = 25;
      tempStatus = 'limiting';
      if (tempC < crop.tempMin) {
        tempExpl = `SEVERE LIMIT: Mean temp ${tempC}°C is below biological threshold (${crop.tempMin}°C).`;
        limitingFactors.push(`Cold stress and potential frost will halt photosynthesis and damage tissues.`);
      } else {
        tempExpl = `SEVERE LIMIT: Mean temp ${tempC}°C exceeds maximum threshold (${crop.tempMax}°C).`;
        limitingFactors.push(`Severe thermal stress causing pollen sterility and leaf scorch.`);
      }
    }

    // 2. Rainfall & Water Availability Evaluation
    let rainScore = 100;
    let rainStatus: 'optimal' | 'acceptable' | 'limiting' = 'optimal';
    let rainExpl = `Annual rainfall ${rainfallMm}mm is within optimum demand (${crop.annualRainfallOptMin} – ${crop.annualRainfallOptMax}mm).`;

    if (rainfallMm >= crop.annualRainfallOptMin && rainfallMm <= crop.annualRainfallOptMax) {
      rainScore = 100;
      favorableFactors.push(`Natural rainfall (${rainfallMm}mm/yr) satisfies crop water requirements.`);
    } else if (rainfallMm < crop.annualRainfallOptMin) {
      if (hasIrrigation) {
        rainScore = 85;
        rainStatus = 'acceptable';
        rainExpl = `Natural rainfall (${rainfallMm}mm) is below optimum (${crop.annualRainfallOptMin}mm), but compensated by farm irrigation.`;
        favorableFactors.push(`Irrigation infrastructure mitigates seasonal precipitation deficits.`);
        agronomicAdaptations.push(`Implement micro-drip fertigation with 3-5 day scheduled intervals during dry months.`);
      } else {
        const ratio = Math.max(0, (rainfallMm - crop.annualRainfallMin) / Math.max(1, crop.annualRainfallOptMin - crop.annualRainfallMin));
        rainScore = Math.round(35 + ratio * 40);
        rainStatus = rainScore >= 60 ? 'acceptable' : 'limiting';
        tempExpl = `Rainfall deficit: ${rainfallMm}mm vs required ${crop.annualRainfallOptMin}mm.`;
        limitingFactors.push(`Moisture deficit during active growth without supplemental irrigation.`);
        agronomicAdaptations.push(`Construct farm percolation ponds and in-situ rainwater harvesting trenches across slope contours.`);
      }
    } else {
      // Excessive rainfall
      if (rainfallMm <= crop.annualRainfallMax) {
        rainScore = 75;
        rainStatus = 'acceptable';
        rainExpl = `Rainfall ${rainfallMm}mm exceeds optimum but is within drainage limit (${crop.annualRainfallMax}mm).`;
        agronomicAdaptations.push(`Ensure raised planting mounds and clearing of border drainage gullies.`);
      } else {
        rainScore = 30;
        rainStatus = 'limiting';
        rainExpl = `Excessive rainfall (${rainfallMm}mm) exceeds tolerance threshold (${crop.annualRainfallMax}mm), risking root asphyxiation and fungal epiphytotics.`;
        limitingFactors.push(`High waterlogging and severe foliar fungal disease pressure.`);
      }
    }

    // 3. Humidity Evaluation
    let humScore = 100;
    let humStatus: 'optimal' | 'acceptable' | 'limiting' = 'optimal';
    let humExpl = `Relative humidity ${humidityPct}% matches optimum range (${crop.humidityOptMin}% – ${crop.humidityOptMax}%).`;

    if (humidityPct >= crop.humidityOptMin && humidityPct <= crop.humidityOptMax) {
      humScore = 100;
      favorableFactors.push(`Atmospheric humidity (${humidityPct}%) supports optimal stomatal conductance.`);
    } else if (humidityPct >= crop.humidityMin && humidityPct < crop.humidityOptMin) {
      humScore = 75;
      humStatus = 'acceptable';
      humExpl = `Humidity ${humidityPct}% is slightly dry compared to optimum ${crop.humidityOptMin}%.`;
      agronomicAdaptations.push(`Maintain soil organic mulch layer to reduce vapor pressure deficit stress.`);
    } else if (humidityPct > crop.humidityOptMax) {
      humScore = 70;
      humStatus = 'acceptable';
      humExpl = `High sustained humidity (${humidityPct}%) creates elevated fungal spore germination risk.`;
      limitingFactors.push(`High humidity increases foliar disease pressure requiring preventative bio-fungicides.`);
      agronomicAdaptations.push(`Increase plant spacing and prune lower canopy branches to promote cross-ventilation.`);
    } else {
      humScore = 40;
      humStatus = 'limiting';
      humExpl = `Humidity (${humidityPct}%) is outside crop tolerance (${crop.humidityMin}% – ${crop.humidityOptMax}%).`;
      limitingFactors.push(`Extremely dry or saturated air restricts economic yields.`);
    }

    // 4. Elevation Evaluation
    let elevScore = 100;
    let elevStatus: 'optimal' | 'acceptable' | 'limiting' = 'optimal';
    let elevExpl = `Elevation ${elevationM}m is within suitability range (${crop.elevationMin}m – ${crop.elevationMax}m).`;

    if (elevationM >= crop.elevationMin && elevationM <= crop.elevationMax) {
      elevScore = 100;
      favorableFactors.push(`Elevation (${elevationM}m MSL) matches physiological altitude preferences.`);
    } else if (elevationM < crop.elevationMin) {
      const diff = crop.elevationMin - elevationM;
      elevScore = Math.max(30, Math.round(85 - (diff / 200) * 15));
      elevStatus = elevScore >= 65 ? 'acceptable' : 'limiting';
      elevExpl = `Elevation ${elevationM}m is below preferred minimum (${crop.elevationMin}m).`;
      if (elevScore < 65) limitingFactors.push(`Low altitude causes higher ambient temperatures and bean/fruit density loss.`);
    } else {
      const diff = elevationM - crop.elevationMax;
      elevScore = Math.max(25, Math.round(80 - (diff / 300) * 20));
      elevStatus = elevScore >= 60 ? 'acceptable' : 'limiting';
      elevExpl = `Elevation ${elevationM}m is above preferred maximum (${crop.elevationMax}m).`;
      if (elevScore < 60) limitingFactors.push(`High altitude increases risk of slow maturation and low minimum night temperatures.`);
    }

    // 5. Soil pH Evaluation
    let phScore = 100;
    let phStatus: 'optimal' | 'acceptable' | 'limiting' = 'optimal';
    let phExpl = `Soil pH ${farmPh} is within optimum range (${crop.soilPhOptMin} – ${crop.soilPhOptMax}).`;

    if (farmPh >= crop.soilPhOptMin && farmPh <= crop.soilPhOptMax) {
      phScore = 100;
      favorableFactors.push(`Soil pH (${farmPh}) provides optimal macro- and micronutrient bio-availability.`);
    } else if (farmPh >= crop.soilPhMin && farmPh <= crop.soilPhMax) {
      phScore = 75;
      phStatus = 'acceptable';
      phExpl = `Soil pH ${farmPh} is acceptable but slightly outside optimum (${crop.soilPhOptMin} – ${crop.soilPhOptMax}).`;
      if (farmPh < crop.soilPhOptMin) {
        agronomicAdaptations.push(`Apply agricultural limestone or dolomite (1.5-2.0 t/ha) to raise soil pH.`);
      } else {
        agronomicAdaptations.push(`Apply elemental sulfur or composted organic manure to gently buffer pH.`);
      }
    } else {
      phScore = 35;
      phStatus = 'limiting';
      phExpl = `Soil pH ${farmPh} is outside tolerance limit (${crop.soilPhMin} – ${crop.soilPhMax}).`;
      limitingFactors.push(`Soil acidity or alkalinity restricts phosphorus and micro-nutrient uptake.`);
      agronomicAdaptations.push(`Perform comprehensive soil lab test and incorporate corrective soil amendments before planting.`);
    }

    // 6. Soil Drainage Evaluation
    let drainScore = 100;
    let drainStatus: 'optimal' | 'acceptable' | 'limiting' = 'optimal';
    let drainExpl = `Soil drainage condition (${farmDrainage}) is well-tolerated.`;

    if (crop.soilDrainage.includes(farmDrainage)) {
      drainScore = 100;
      favorableFactors.push(`Soil drainage profile (${farmDrainage}) supports root aeration.`);
    } else if (farmDrainage === 'Moderate' && crop.soilDrainage.includes('Well-drained')) {
      drainScore = 75;
      drainStatus = 'acceptable';
      drainExpl = `Moderate drainage is acceptable, but deep rooting requires uncompacted subsoil.`;
      agronomicAdaptations.push(`Deep rip or chisel plow hardpan layers to improve internal percolation.`);
    } else if (farmDrainage === 'Poorly-drained' || farmDrainage === 'Waterlogged') {
      drainScore = 30;
      drainStatus = 'limiting';
      drainExpl = `Poor drainage poses severe root rot risk for ${crop.name}.`;
      limitingFactors.push(`Waterlogging creates anaerobic root conditions and collar rot.`);
      agronomicAdaptations.push(`Construct deep perimeter sub-surface French drains.`);
    }

    // Calculate Weighted Environmental Suitability Index
    // Weights: Temperature (30%), Rainfall/Water (25%), Elevation (15%), Soil pH (15%), Drainage (10%), Humidity (5%)
    const overallScore = Math.round(
      tempScore * 0.30 +
      rainScore * 0.25 +
      elevScore * 0.15 +
      phScore * 0.15 +
      drainScore * 0.10 +
      humScore * 0.05
    );

    let suitabilityStatus: CropSuitabilityResult['suitabilityStatus'] = 'Highly Suitable';
    if (overallScore >= 80 && limitingFactors.length === 0) {
      suitabilityStatus = 'Highly Suitable';
    } else if (overallScore >= 68) {
      suitabilityStatus = 'Suitable';
    } else if (overallScore >= 50) {
      suitabilityStatus = 'Moderately Suitable';
    } else {
      suitabilityStatus = 'Marginal / Unsuitable';
    }

    return {
      crop,
      overallScore,
      suitabilityStatus,
      parameterAudit: {
        temperature: {
          score: tempScore,
          status: tempStatus,
          currentValue: `${tempC}°C`,
          requiredRange: `${crop.tempOptMin}°C – ${crop.tempOptMax}°C (Limit: ${crop.tempMin}°C–${crop.tempMax}°C)`,
          explanation: tempExpl,
        },
        rainfall: {
          score: rainScore,
          status: rainStatus,
          currentValue: `${rainfallMm} mm/yr`,
          requiredRange: `${crop.annualRainfallOptMin} – ${crop.annualRainfallOptMax} mm (Limit: ${crop.annualRainfallMin}–${crop.annualRainfallMax} mm)`,
          explanation: rainExpl,
        },
        humidity: {
          score: humScore,
          status: humStatus,
          currentValue: `${humidityPct}%`,
          requiredRange: `${crop.humidityOptMin}% – ${crop.humidityOptMax}%`,
          explanation: humExpl,
        },
        elevation: {
          score: elevScore,
          status: elevStatus,
          currentValue: `${elevationM} m`,
          requiredRange: `${crop.elevationMin} m – ${crop.elevationMax} m`,
          explanation: elevExpl,
        },
        soilPh: {
          score: phScore,
          status: phStatus,
          currentValue: `pH ${farmPh}`,
          requiredRange: `pH ${crop.soilPhOptMin} – ${crop.soilPhOptMax} (Tolerant: ${crop.soilPhMin}–${crop.soilPhMax})`,
          explanation: phExpl,
        },
        soilDrainage: {
          score: drainScore,
          status: drainStatus,
          currentValue: farmDrainage,
          requiredRange: crop.soilDrainage.join(', '),
          explanation: drainExpl,
        },
      },
      limitingFactors,
      favorableFactors,
      agronomicAdaptations,
    };
  },

  /**
   * Evaluates all crops for a given climate and ranks them by suitability
   */
  rankAllCropsForClimate(
    climate: ClimateAnalysisData,
    soil: SoilPreferences = {}
  ): CropSuitabilityResult[] {
    const results = FAO_ECOCROP_DATABASE.map((crop) =>
      this.evaluateCropSuitability(crop, climate, soil)
    );

    // Sort descending by overall suitability score
    return results.sort((a, b) => b.overallScore - a.overallScore);
  },

  /**
   * Returns list of predefined global agricultural regions for the compatibility checker
   */
  getGlobalRegionProfiles(): GlobalRegionProfile[] {
    return GLOBAL_REGION_PROFILES;
  },
};

/**
 * Predefined Global Agricultural Region Profiles
 * Covers major farming zones worldwide with verified 30-year climatology baselines.
 */
export const GLOBAL_REGION_PROFILES: GlobalRegionProfile[] = [
  // India
  {
    id: 'in_karnataka_chikmagalur',
    country: 'India',
    countryCode: 'IN',
    regionOrState: 'Karnataka (Chikmagalur / Western Ghats)',
    coordinates: { lat: 13.4215, lng: 75.7621 },
    elevationMeters: 1080,
    koppenCode: 'Cwb',
    koppenName: 'Subtropical Highland / Mild Montane',
    annualMeanTempC: 22.4,
    annualRainfallMm: 1950,
    meanHumidityPercent: 82,
    typicalSoilType: 'Deep Red Clay Loam / Forest Loam',
    typicalSoilPh: 5.8,
    typicalDrainage: 'Well-drained',
  },
  {
    id: 'in_karnataka_dharwad',
    country: 'India',
    countryCode: 'IN',
    regionOrState: 'Karnataka (Dharwad / North Karnataka Plains)',
    coordinates: { lat: 15.4589, lng: 75.0078 },
    elevationMeters: 750,
    koppenCode: 'BSh',
    koppenName: 'Hot Semi-Arid Steppe',
    annualMeanTempC: 25.1,
    annualRainfallMm: 780,
    meanHumidityPercent: 62,
    typicalSoilType: 'Black Vertisols / Clay Loam',
    typicalSoilPh: 7.6,
    typicalDrainage: 'Moderate',
  },
  {
    id: 'in_punjab_ludhiana',
    country: 'India',
    countryCode: 'IN',
    regionOrState: 'Punjab (Ludhiana / Indo-Gangetic Plain)',
    coordinates: { lat: 30.9010, lng: 75.8573 },
    elevationMeters: 245,
    koppenCode: 'BSh',
    koppenName: 'Subtropical Semi-Arid',
    annualMeanTempC: 24.0,
    annualRainfallMm: 680,
    meanHumidityPercent: 58,
    typicalSoilType: 'Alluvial Loam',
    typicalSoilPh: 7.4,
    typicalDrainage: 'Well-drained',
  },
  {
    id: 'in_kerala_wayanad',
    country: 'India',
    countryCode: 'IN',
    regionOrState: 'Kerala (Wayanad High Ranges)',
    coordinates: { lat: 11.6854, lng: 76.1320 },
    elevationMeters: 920,
    koppenCode: 'Am',
    koppenName: 'Tropical Monsoon Highland',
    annualMeanTempC: 21.8,
    annualRainfallMm: 2800,
    meanHumidityPercent: 86,
    typicalSoilType: 'Acidic Laterite / Humic Loam',
    typicalSoilPh: 5.2,
    typicalDrainage: 'Well-drained',
  },
  {
    id: 'in_assam_jorhat',
    country: 'India',
    countryCode: 'IN',
    regionOrState: 'Assam (Jorhat / Upper Brahmaputra)',
    coordinates: { lat: 26.7509, lng: 94.2037 },
    elevationMeters: 116,
    koppenCode: 'Cwa',
    koppenName: 'Humid Subtropical (Monsoonal)',
    annualMeanTempC: 23.5,
    annualRainfallMm: 2200,
    meanHumidityPercent: 84,
    typicalSoilType: 'Acidic Alluvial Sandy Loam',
    typicalSoilPh: 4.9,
    typicalDrainage: 'Well-drained',
  },
  // Colombia
  {
    id: 'co_huila_pitalito',
    country: 'Colombia',
    countryCode: 'CO',
    regionOrState: 'Huila (Pitalito / Andean Valley)',
    coordinates: { lat: 1.8540, lng: -76.0514 },
    elevationMeters: 1318,
    koppenCode: 'Cfb',
    koppenName: 'Subtropical Highland Oceanic',
    annualMeanTempC: 20.8,
    annualRainfallMm: 1680,
    meanHumidityPercent: 78,
    typicalSoilType: 'Volcanic Ash Andisol Loam',
    typicalSoilPh: 5.6,
    typicalDrainage: 'Well-drained',
  },
  {
    id: 'co_antioquia_medellin',
    country: 'Colombia',
    countryCode: 'CO',
    regionOrState: 'Antioquia (Central Cordillera)',
    coordinates: { lat: 6.2442, lng: -75.5812 },
    elevationMeters: 1495,
    koppenCode: 'Af',
    koppenName: 'Tropical Rainforest / Montane',
    annualMeanTempC: 21.5,
    annualRainfallMm: 1750,
    meanHumidityPercent: 80,
    typicalSoilType: 'Volcanic Organic Loam',
    typicalSoilPh: 5.4,
    typicalDrainage: 'Well-drained',
  },
  // Brazil
  {
    id: 'br_minas_gerais',
    country: 'Brazil',
    countryCode: 'BR',
    regionOrState: 'Minas Gerais (Sul de Minas)',
    coordinates: { lat: -21.5555, lng: -45.4338 },
    elevationMeters: 950,
    koppenCode: 'Cwb',
    koppenName: 'Subtropical Highland with Dry Winter',
    annualMeanTempC: 20.2,
    annualRainfallMm: 1450,
    meanHumidityPercent: 74,
    typicalSoilType: 'Deep Red Latosol (Oxisol)',
    typicalSoilPh: 5.5,
    typicalDrainage: 'Well-drained',
  },
  {
    id: 'br_mato_grosso',
    country: 'Brazil',
    countryCode: 'BR',
    regionOrState: 'Mato Grosso (Cerrado Grain Belt)',
    coordinates: { lat: -13.0617, lng: -55.9184 },
    elevationMeters: 380,
    koppenCode: 'Aw',
    koppenName: 'Tropical Savanna',
    annualMeanTempC: 26.2,
    annualRainfallMm: 1850,
    meanHumidityPercent: 72,
    typicalSoilType: 'Clayey Oxisol / Red-Yellow Latosol',
    typicalSoilPh: 5.2,
    typicalDrainage: 'Well-drained',
  },
  // United States
  {
    id: 'us_california_central_valley',
    country: 'United States',
    countryCode: 'US',
    regionOrState: 'California (Central Valley / Fresno)',
    coordinates: { lat: 36.7468, lng: -119.7726 },
    elevationMeters: 90,
    koppenCode: 'BSk',
    koppenName: 'Cold Semi-Arid / Mediterranean Steppe',
    annualMeanTempC: 17.8,
    annualRainfallMm: 290,
    meanHumidityPercent: 52,
    typicalSoilType: 'Alluvial Silt Loam',
    typicalSoilPh: 7.2,
    typicalDrainage: 'Well-drained',
  },
  {
    id: 'us_iowa_ames',
    country: 'United States',
    countryCode: 'US',
    regionOrState: 'Iowa (Corn & Soybean Belt)',
    coordinates: { lat: 42.0308, lng: -93.6319 },
    elevationMeters: 290,
    koppenCode: 'Dfa',
    koppenName: 'Hot-Summer Humid Continental',
    annualMeanTempC: 9.8,
    annualRainfallMm: 890,
    meanHumidityPercent: 68,
    typicalSoilType: 'Deep Fertile Mollisol Loam (Clarion)',
    typicalSoilPh: 6.6,
    typicalDrainage: 'Well-drained',
  },
  {
    id: 'us_florida_citrus',
    country: 'United States',
    countryCode: 'US',
    regionOrState: 'Florida (Central Citrus Belt / Orlando)',
    coordinates: { lat: 28.5383, lng: -81.3792 },
    elevationMeters: 30,
    koppenCode: 'Cfa',
    koppenName: 'Humid Subtropical',
    annualMeanTempC: 22.6,
    annualRainfallMm: 1320,
    meanHumidityPercent: 76,
    typicalSoilType: 'Sandy Entisol (Candler Sand)',
    typicalSoilPh: 6.2,
    typicalDrainage: 'Well-drained',
  },
  // Kenya
  {
    id: 'ke_kiambu_highlands',
    country: 'Kenya',
    countryCode: 'KE',
    regionOrState: 'Kenya (Kiambu / Central Highlands)',
    coordinates: { lat: -1.1714, lng: 36.8356 },
    elevationMeters: 1720,
    koppenCode: 'Cwb',
    koppenName: 'Subtropical Highland / Montane',
    annualMeanTempC: 19.1,
    annualRainfallMm: 1150,
    meanHumidityPercent: 72,
    typicalSoilType: 'Deep Volcanic Nitisol (Red Kikuyu Loam)',
    typicalSoilPh: 5.4,
    typicalDrainage: 'Well-drained',
  },
  // Ethiopia
  {
    id: 'et_oromia_jimma',
    country: 'Ethiopia',
    countryCode: 'ET',
    regionOrState: 'Ethiopia (Oromia / Jimma Highlands)',
    coordinates: { lat: 7.6734, lng: 36.8344 },
    elevationMeters: 1780,
    koppenCode: 'Cfb',
    koppenName: 'Subtropical Highland (Moist)',
    annualMeanTempC: 19.4,
    annualRainfallMm: 1540,
    meanHumidityPercent: 74,
    typicalSoilType: 'Deep Humic Nitosols',
    typicalSoilPh: 5.5,
    typicalDrainage: 'Well-drained',
  },
  // Vietnam
  {
    id: 'vn_dak_lak',
    country: 'Vietnam',
    countryCode: 'VN',
    regionOrState: 'Vietnam (Dak Lak / Central Highlands)',
    coordinates: { lat: 12.6667, lng: 108.0500 },
    elevationMeters: 510,
    koppenCode: 'Aw',
    koppenName: 'Tropical Savanna / Basalt Plateau',
    annualMeanTempC: 24.2,
    annualRainfallMm: 1780,
    meanHumidityPercent: 81,
    typicalSoilType: 'Deep Red Basaltic Soil',
    typicalSoilPh: 5.3,
    typicalDrainage: 'Well-drained',
  },
  // Australia
  {
    id: 'au_queensland_sunshine',
    country: 'Australia',
    countryCode: 'AU',
    regionOrState: 'Australia (Queensland / Darling Downs)',
    coordinates: { lat: -27.5598, lng: 151.9507 },
    elevationMeters: 600,
    koppenCode: 'Cfa',
    koppenName: 'Humid Subtropical',
    annualMeanTempC: 18.2,
    annualRainfallMm: 720,
    meanHumidityPercent: 60,
    typicalSoilType: 'Heavy Black Cracking Clay',
    typicalSoilPh: 7.5,
    typicalDrainage: 'Moderate',
  },
  // Spain
  {
    id: 'es_andalusia_seville',
    country: 'Spain',
    countryCode: 'ES',
    regionOrState: 'Spain (Andalusia / Guadalquivir Basin)',
    coordinates: { lat: 37.3891, lng: -5.9845 },
    elevationMeters: 20,
    koppenCode: 'Csa',
    koppenName: 'Hot-Summer Mediterranean',
    annualMeanTempC: 19.2,
    annualRainfallMm: 540,
    meanHumidityPercent: 55,
    typicalSoilType: 'Calcareous Clay Loam',
    typicalSoilPh: 7.8,
    typicalDrainage: 'Well-drained',
  },
  // Egypt
  {
    id: 'eg_nile_delta',
    country: 'Egypt',
    countryCode: 'EG',
    regionOrState: 'Egypt (Nile Delta / Gharbia)',
    coordinates: { lat: 30.7865, lng: 31.0004 },
    elevationMeters: 14,
    koppenCode: 'BWh',
    koppenName: 'Hot Desert (Nile Irrigated)',
    annualMeanTempC: 21.6,
    annualRainfallMm: 50,
    meanHumidityPercent: 65,
    typicalSoilType: 'Heavy Fertile Nile Silt Clay',
    typicalSoilPh: 8.1,
    typicalDrainage: 'Moderate',
  },
];
