export type Language = 'en' | 'kn' | 'hi' | 'es';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  preferredLanguage: Language;
  createdAt: string;
}

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // [lng, lat][] in standard GeoJSON
}

export interface FarmZone {
  zoneId: string;
  name: string;
  status: 'healthy' | 'moderate' | 'stressed';
  ndvi: number;
  ndre: number;
  ndwi: number;
  lat: number;
  lng: number;
  notes: string;
}

export interface Farm {
  id: string;
  userId: string;
  name: string;
  locationName: string;
  country: string;
  state: string;
  cropType: string;
  cropCategory?: string;
  cropVariety?: string;
  coffeeVariety?: string;
  plantingYear?: number;
  shadePercent?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  boundaryGeoJson: GeoJsonPolygon;
  areaAcres: number;
  areaHectares: number;
  createdAt: string;
  updatedAt: string;
  zones?: FarmZone[];
}

export interface IndianCropVariety {
  id: string;
  name: string;
  nameKn?: string;
  nameHi?: string;
  durationDays?: string;
  yieldPotential?: string;
  keyFeatures: string;
  breederOrg?: string;
  suitableRegions?: string[];
  specialty?: string;
}

export interface IndianCrop {
  id: string;
  name: string;
  commonName: string;
  kannadaName: string;
  hindiName: string;
  scientificName: string;
  category:
    | 'Cereals & Millets'
    | 'Plantation Crops'
    | 'Spices & Condiments'
    | 'Cash Crops & Fiber'
    | 'Pulses & Legumes'
    | 'Oilseeds'
    | 'Horticulture & Fruits'
    | 'Vegetables';
  icon: string;
  majorGrowingStates: string[];
  sowingSeason: string;
  soilPreference: string;
  waterNeed: 'Low' | 'Moderate' | 'High' | 'Very High';
  varieties: IndianCropVariety[];
}

export interface SatelliteObservation {
  id: string;
  farmId: string;
  acquisitionDate: string;
  satellite: 'Sentinel-2A' | 'Sentinel-2B';
  cloudCoveragePercent: number;
  tileId: string;
  sunZenithAngle: number;
  meanNdvi: number;
  meanNdre: number;
  meanNdwi: number;
  healthyAreaPercent: number;
  moderateAreaPercent: number;
  stressedAreaPercent: number;
  imageUrl?: string;
  dataSource: string;
  isSimulatedFallback?: boolean;
}

export interface TaggedPlant {
  id: string;
  tagNumber: string;
  lat: number;
  lng: number;
  healthStatus: 'Healthy' | 'Suspected Rust' | 'Nutrient Stress' | 'Berry Borer';
  notes: string;
  date: string;
}

export interface DroneWaypoint {
  id: string;
  lat: number;
  lng: number;
  altitudeMeters: number;
  headingDegrees: number;
  status: 'normal' | 'flagged';
  notes?: string;
}

export interface DroneInspection {
  id: string;
  farmId: string;
  flightDate: string;
  pilotName: string;
  droneModel: string;
  altitudeMeters: number;
  flightDurationMin: number;
  gsdCmPerPixel: number;
  imageUrl: string;
  waypointsCount: number;
  bushesInspectedCount: number;
  stressedBushesCount: number;
  waypoints: DroneWaypoint[];
  taggedPlants: TaggedPlant[];
}

export interface CoffeeLeafValidationResult {
  isValidCoffeeLeaf: boolean;
  detectedSubject: string;
  confidence: number;
  reason: string;
  validationMessage?: string | null;
}

export interface CropDiseaseDetection {
  id: string;
  farmId?: string;
  cropIdentified: string;
  conditionName: string;
  scientificName: string;
  confidence: number;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Healthy' | 'Low' | 'Medium' | 'High';
  isDefinitive: boolean;
  symptomsObserved: string[];
  possibleCauses: string[];
  recommendedActions: {
    immediate: string[];
    culturalAndOrganic: string[];
    chemicalTreatment: string[];
    preventative: string[];
  };
  expertVerificationWarning: string;
  imageUrl: string;
  createdAt: string;
  samplePresetKey?: string;
  // Specific Coffee Arabica Detection Fields
  detectedPlant?: string;
  detectionResult?: 'Healthy' | 'Possible Disease Detected' | 'Uncertain';
  diseaseName?: string;
  visibleSymptoms?: string[];
  recommendedNextSteps?: string[];
  summaryMessage?: string;
  diseaseSeverity?: 'Low' | 'Medium' | 'High';
}

export interface NotificationItem {
  id: string;
  type: 'stress' | 'disease' | 'weather' | 'satellite' | 'drone';
  titleEn: string;
  titleKn: string;
  messageEn: string;
  messageKn: string;
  date: string;
  read: boolean;
  severity: 'info' | 'warning' | 'critical';
  farmId?: string;
  linkScreen?: string;
}

export interface HourlyForecastItem {
  time: string;
  hourLabel: string;
  temperature: number;
  precipitationProbability: number;
  precipitationMm: number;
  weatherCode: number;
  condition: string;
  windSpeedKmH: number;
  cloudCoverPercent: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  precipitationProb: number;
  precipitationSumMm: number;
  condition: string;
  weatherCode: number;
  windSpeedMaxKmH: number;
  windDirectionDominantDeg: number;
  windDirectionCompass: string;
  solarRadiationSumMj: number;
  uvIndexMax: number;
}

export interface SevereWeatherAlert {
  id: string;
  title: string;
  severity: 'advisory' | 'warning' | 'critical';
  category: 'heat' | 'frost' | 'storm' | 'wind' | 'disease' | 'drought';
  description: string;
  actionRequired: string;
}

export interface WeatherData {
  current: {
    temperature: number;
    temperatureMax?: number;
    temperatureMin?: number;
    apparentTemperature?: number;
    relativeHumidity: number;
    precipitation: number;
    precipitationProbability?: number;
    windSpeed: number;
    windDirectionDeg?: number;
    windDirectionCompass?: string;
    windGustsKmH?: number;
    atmosphericPressureHpa?: number;
    cloudCoveragePercent?: number;
    solarRadiationWm2?: number;
    solarRadiationMjDay?: number;
    weatherCode: number;
    condition: string;
    dewPoint: number;
    uvIndex: number;
  };
  hourly?: HourlyForecastItem[];
  forecast: {
    date: string;
    dayName: string;
    tempMax: number;
    tempMin: number;
    precipitationProb: number;
    condition: string;
    precipitationSumMm?: number;
    windSpeedMaxKmH?: number;
    solarRadiationSumMj?: number;
  }[];
  forecast14Day?: DailyForecastItem[];
  weeklyRainfall?: {
    currentWeekMm: number;
    nextWeekMm: number;
    twoWeekTotalMm: number;
  };
  temperatureTrend?: {
    highestUpcoming: number;
    lowestUpcoming: number;
    averageUpcoming: number;
    trendDirection: 'warming' | 'cooling' | 'stable';
  };
  severeAlerts?: SevereWeatherAlert[];
  dataSource?: string;
  lastUpdated?: string;
  elevationMeters?: number;
  agriculturalRisks: {
    rustGerminationRisk: 'Low' | 'Moderate' | 'High';
    sprayingWindowSuitability: 'Favorable' | 'Unfavorable' | 'Caution';
    droughtStressIndicator: 'Normal' | 'Moderate' | 'Severe';
    explanationEn: string;
    explanationKn: string;
  };
}

// -------------------------------------------------------------
// 30-Year Climate Analysis Interfaces
// -------------------------------------------------------------

export interface MonthlyClimatePoint {
  monthIndex: number; // 0 to 11
  monthName: string;
  monthShort: string;
  avgRainfallMm: number;
  avgTempC: number;
  avgMaxTempC: number;
  avgMinTempC: number;
  solarRadiationMj: number;
  isWetSeason: boolean;
}

export interface ClimateAnalysisData {
  farmId?: string;
  locationName: string;
  country: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
    elevationMeters: number;
  };
  referencePeriod: string; // e.g. "1991–2020 (WMO 30-Year Baseline)"
  koppenClassification: {
    code: string; // e.g. "Cwb", "Af", "Aw", "Cfa", "BSh"
    name: string; // e.g. "Subtropical Highland Climate"
    group: string; // e.g. "Group C: Temperate"
    simpleExplanation: string;
    characteristics: string[];
  };
  annualAverages: {
    meanTempC: number;
    meanMaxTempC: number;
    meanMinTempC: number;
    annualRainfallMm: number;
    meanHumidityPercent: number;
    solarRadiationMjDay: number;
  };
  monthlyDistribution: MonthlyClimatePoint[];
  seasonalCycle: {
    wetSeason: {
      name: string;
      months: string;
      totalRainfallMm: number;
      percentageOfAnnual: number;
      description: string;
    };
    drySeason: {
      name: string;
      months: string;
      totalRainfallMm: number;
      description: string;
    };
    temperatureVariation: {
      seasonalRangeDeltaC: number;
      warmestMonth: string;
      coldestMonth: string;
    };
  };
  climaticIndicators: {
    droughtIndicator: {
      status: 'Low / Humid' | 'Moderate / Sub-Humid' | 'High / Semi-Arid' | 'Severe Arid';
      speiValue: number;
      aridityIndex: number;
      explanation: string;
    };
    heatStressIndicator: {
      daysAbove35C: number;
      maxSummerPeakC: number;
      riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
      explanation: string;
    };
    frostRiskIndicator: {
      hasFrostRisk: boolean;
      annualFrostDays: number;
      recordMinimumTempC: number;
      riskLevel: 'None' | 'Low' | 'Moderate' | 'High';
      explanation: string;
    };
  };
  dataSource: string;
}

// -------------------------------------------------------------
// FAO EcoCrop & Crop Suitability Interfaces
// -------------------------------------------------------------

export type CropCategory =
  | 'Beverage'
  | 'Cereal'
  | 'Pulse'
  | 'Cash Crop'
  | 'Fiber'
  | 'Fruit'
  | 'Vegetable'
  | 'Tuber'
  | 'Oilseed';

export interface CropEcologicalRequirement {
  id: string;
  name: string;
  nameKn?: string;
  nameHi?: string;
  nameEs?: string;
  scientificName: string;
  category: CropCategory;
  faoEcoCropCode: string;
  // Temperature (°C)
  tempMin: number;
  tempOptMin: number;
  tempOptMax: number;
  tempMax: number;
  // Annual Rainfall (mm)
  annualRainfallMin: number;
  annualRainfallOptMin: number;
  annualRainfallOptMax: number;
  annualRainfallMax: number;
  // Humidity (%)
  humidityMin: number;
  humidityOptMin: number;
  humidityOptMax: number;
  // Soil requirements
  soilTypes: string[];
  soilPhMin: number;
  soilPhOptMin: number;
  soilPhOptMax: number;
  soilPhMax: number;
  soilDrainage: ('Well-drained' | 'Moderate' | 'Poorly-drained' | 'Waterlogged')[];
  // Elevation (meters)
  elevationMin: number;
  elevationMax: number;
  // Growing Cycle
  growingSeasonDays: number;
  waterRequirementLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  frostTolerance: 'None (Susceptible)' | 'Tolerates Light Frost' | 'Frost Hardy';
  suitableKoppenCodes: string[];
  summary: string;
  iconName: string;
}

export interface CropSuitabilityParameterAudit {
  score: number; // 0 - 100
  status: 'optimal' | 'acceptable' | 'limiting';
  currentValue: string;
  requiredRange: string;
  explanation: string;
}

export interface CropSuitabilityResult {
  crop: CropEcologicalRequirement;
  overallScore: number; // 0 - 100
  suitabilityStatus: 'Highly Suitable' | 'Suitable' | 'Moderately Suitable' | 'Marginal / Unsuitable';
  parameterAudit: {
    temperature: CropSuitabilityParameterAudit;
    rainfall: CropSuitabilityParameterAudit;
    humidity: CropSuitabilityParameterAudit;
    elevation: CropSuitabilityParameterAudit;
    soilPh: CropSuitabilityParameterAudit;
    soilDrainage: CropSuitabilityParameterAudit;
  };
  limitingFactors: string[];
  favorableFactors: string[];
  agronomicAdaptations: string[];
}

export interface GlobalRegionProfile {
  id: string;
  country: string;
  countryCode: string;
  regionOrState: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  elevationMeters: number;
  koppenCode: string;
  koppenName: string;
  annualMeanTempC: number;
  annualRainfallMm: number;
  meanHumidityPercent: number;
  typicalSoilType: string;
  typicalSoilPh: number;
  typicalDrainage: 'Well-drained' | 'Moderate' | 'Poorly-drained';
}

export type DroneConnectionStatus =
  | 'Connected'
  | 'Disconnected'
  | 'Connecting'
  | 'Connection error'
  | 'Unsupported drone';

export interface DroneDevice {
  drone_id: string;
  manufacturer: string;
  model: string;
  connection_type: 'MAVLink_UDP' | 'MAVLink_TCP' | 'DJI_Mobile_SDK' | 'PX4_Direct' | 'Manual_Import';
  connection_status: DroneConnectionStatus;
  battery_percentage?: number;
  gps_status?: string;
  flight_status?: 'Landed' | 'Hovering' | 'Autonomous Mission' | 'Returning Home' | 'Disconnected';
  telemetry?: {
    altitudeM: number;
    speedMs: number;
    headingDeg: number;
    lat: number;
    lng: number;
  };
  last_connected: string;
  is_demo: boolean;
}

export interface SatelliteAnomaly {
  anomaly_id: string;
  farm_id: string;
  anomaly_type: 'NDVI_Drop' | 'Canopy_Chlorosis' | 'Moisture_Deficit' | 'Vegetation_Loss';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  latitude: number;
  longitude: number;
  satellite_image_date: string;
  vegetation_index: 'NDVI' | 'NDRE' | 'NDMI';
  index_value: number;
  historical_baseline_value: number;
  drop_percentage: number;
  inspection_status: 'unassigned' | 'task_created' | 'dispatched' | 'inspected' | 'verified';
  description: string;
}

export interface DroneInspectionTask {
  inspection_id: string;
  farm_id: string;
  anomaly_id: string;
  drone_id: string;
  coordinates: {
    lat: number;
    lng: number;
    altitudeMeters: number;
  };
  target_radius_m: number;
  inspection_status:
    | 'pending_approval'
    | 'dispatched'
    | 'in_flight'
    | 'images_received'
    | 'completed'
    | 'cancelled';
  operator_confirmed: boolean;
  operator_name: string;
  created_at: string;
  dispatched_at?: string;
  completed_at?: string;
  images_count: number;
  notes?: string;
}

export interface DroneImageRecord {
  image_id: string;
  inspection_id: string;
  anomaly_id?: string;
  farm_id: string;
  image_url: string;
  latitude: number;
  longitude: number;
  altitude: number;
  camera_type: 'RGB' | 'Multispectral' | 'Thermal';
  capture_timestamp: string;
  drone_model: string;
  ai_analysis?: {
    condition_name: string;
    scientific_name?: string;
    confidence: number;
    severity: 'Mild' | 'Moderate' | 'Severe' | 'Healthy';
    symptoms: string[];
    verification_warning: string;
    recommended_reinspection_date: string;
  };
}

export interface FarmerChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  category?: 'disease' | 'weather' | 'soil' | 'scheme' | 'general' | 'crop_advice';
  suggestions?: string[];
  recommendedScreen?: ActiveScreen;
}

export interface CropDoctorAlert {
  id: string;
  category: 'pest_disease' | 'extreme_weather' | 'spray_window' | 'irrigation' | 'gov_mandi';
  severity: 'critical' | 'warning' | 'advisory' | 'info';
  titleEn: string;
  titleKn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionKn: string;
  descriptionHi: string;
  actionRequiredEn: string;
  actionRequiredKn: string;
  actionRequiredHi: string;
  source: string;
  affectedCrop?: string;
  locationState?: string;
  district?: string;
  date: string;
  acknowledged?: boolean;
  resolved?: boolean;
  recommendedScreen?: ActiveScreen;
}

export interface FinancialRiskProfile {
  farmId: string;
  cropName: string;
  acreage: number;
  expectedYieldQuintalsPerAcre: number;
  mandiPricePerQuintal: number; // in ₹
  totalInputInvestmentPerAcre: number; // in ₹
  sumInsuredPerAcrePmfby: number; // in ₹
  assessedYieldLossPercent: number; // 0 - 100%
  compositeRiskScore: number; // 0 - 100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  kccCreditScore: number; // 300 - 850
  projectedRevenue: number;
  projectedLoss: number;
  estimatedPmfbyPayout: number;
  netFinancialExposure: number;
  breakdown: {
    weatherRiskPenalty: number;
    diseaseRiskPenalty: number;
    satelliteAnomalyPenalty: number;
    soilMoisturePenalty: number;
  };
  recommendations: string[];
}

export type ActiveScreen =
  | 'welcome'
  | 'dashboard'
  | 'farmer_bot'
  | 'crop_detector'
  | 'anomaly_engine'
  | 'alert_center'
  | 'financial_risk'
  | 'add_farm'
  | 'mapping'
  | 'satellite'
  | 'crop_health'
  | 'disease_detection'
  | 'drone'
  | 'drone_integration'
  | 'weather'
  | 'reports'
  | 'notifications'
  | 'profile';

// ==========================================
// AI PLANT IDENTIFICATION SYSTEM INTERFACES
// ==========================================

export type PlantIdentificationStatus =
  | 'Confirmed Species'
  | 'Probable Identification'
  | 'Genus Level Only'
  | 'Family Level Only'
  | 'General Plant Category'
  | 'No recognizable plant detected';

export type PlantCategory =
  | 'tree'
  | 'shrub'
  | 'herb'
  | 'climber'
  | 'grass'
  | 'flower'
  | 'succulent'
  | 'other';

export interface PlantRegionalNames {
  hindi?: string;
  kannada?: string;
  tamil?: string;
  telugu?: string;
  malayalam?: string;
  marathi?: string;
  bengali?: string;
  sanskrit?: string;
  [key: string]: string | undefined;
}

export interface PlantMorphologicalAnalysis {
  leaves: string;
  stems: string;
  flowers: string;
  fruits_seeds: string;
  other_visible_features: string;
}

export interface PlantMedicinalAndUses {
  common_uses: string[];
  medicinal_properties: string[];
  ayurvedic_or_traditional_significance?: string;
}

export interface PlantToxicityInfo {
  is_toxic: boolean;
  toxicity_level: 'Non-toxic' | 'Mild' | 'Moderate' | 'Severe' | 'Unknown';
  toxic_parts: string;
  pet_toxicity: string;
  human_health_risks: string;
}

export interface PlantSimilarSpecies {
  scientific_name: string;
  common_name: string;
  distinguishing_traits: string;
}

export interface PlantIdentificationResult {
  id: string;
  timestamp: string;
  imageUrl: string;
  identification_status: PlantIdentificationStatus;
  common_name: string;
  scientific_name: string;
  botanical_family: string;
  plant_category: PlantCategory;
  indian_regional_names: PlantRegionalNames;
  confidence_score: number;
  confidence_level: 'High' | 'Medium' | 'Low' | 'Uncertain';
  morphological_analysis: PlantMorphologicalAnalysis;
  supporting_characteristics: string[];
  common_uses_and_medicinal_properties: PlantMedicinalAndUses;
  toxicity_and_health_risks: PlantToxicityInfo;
  similar_species: PlantSimilarSpecies[];
  identification_limitations: string;
  agricultural_notes?: string;
  specimenKey?: string;
}


