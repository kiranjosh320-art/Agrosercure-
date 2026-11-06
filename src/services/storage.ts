import {
  Farm,
  User,
  SatelliteObservation,
  DroneInspection,
  CropDiseaseDetection,
  NotificationItem,
  DroneDevice,
  SatelliteAnomaly,
  DroneInspectionTask,
  DroneImageRecord,
  PlantIdentificationResult,
} from '../types';

const STORAGE_KEYS = {
  USER: 'agrovision_user_session',
  FARMS: 'agrovision_farms_db',
  ACTIVE_FARM_ID: 'agrovision_active_farm_id',
  SATELLITE_OBS: 'agrovision_satellite_obs',
  DRONE_INSPECTIONS: 'agrovision_drone_inspections',
  DISEASE_RECORDS: 'agrovision_disease_records',
  NOTIFICATIONS: 'agrovision_notifications',
  DRONE_DEVICE: 'agrovision_drone_device',
  SATELLITE_ANOMALIES: 'agrovision_satellite_anomalies',
  INSPECTION_TASKS: 'agrovision_inspection_tasks',
  DRONE_IMAGES: 'agrovision_drone_images',
  PLANT_IDENTIFICATIONS: 'agrovision_plant_identifications',
};

/**
 * Safe localStorage setter with automatic quota recovery.
 * Prevents QuotaExceededError from crashing the app when large payloads or image data are saved.
 */
export function safeLocalStorageSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error: any) {
    console.warn(`[StorageService] LocalStorage quota exceeded when writing "${key}". Initiating safe recovery:`, error);
    try {
      // 1. If storing disease records, strip large base64 data URLs and limit to 3 items
      if (key === STORAGE_KEYS.DISEASE_RECORDS) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const stripped = parsed.slice(0, 3).map((item: any) => ({
              ...item,
              imageUrl: item.imageUrl && item.imageUrl.length > 5000 ? '' : item.imageUrl,
            }));
            localStorage.setItem(key, JSON.stringify(stripped));
            return;
          }
        } catch {
          // continue
        }
      }

      // 2. Clear volatile non-essential caches
      localStorage.removeItem(STORAGE_KEYS.DRONE_IMAGES);
      localStorage.removeItem(STORAGE_KEYS.SATELLITE_ANOMALIES);

      // 3. Clean up existing disease records if bloated
      const existingDisease = localStorage.getItem(STORAGE_KEYS.DISEASE_RECORDS);
      if (existingDisease) {
        try {
          const recs = JSON.parse(existingDisease);
          if (Array.isArray(recs)) {
            const sanitized = recs.slice(0, 3).map((r: any) => ({
              ...r,
              imageUrl: r.imageUrl && r.imageUrl.length > 5000 ? '' : r.imageUrl,
            }));
            localStorage.setItem(STORAGE_KEYS.DISEASE_RECORDS, JSON.stringify(sanitized));
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.DISEASE_RECORDS);
        }
      }

      // 4. Retry saving the requested key
      localStorage.setItem(key, value);
    } catch (fallbackError) {
      console.warn(`[StorageService] Failed safe fallback write for key "${key}". Operation skipped without crashing UI.`, fallbackError);
    }
  }
}

// Default Farmer Demo User
const DEFAULT_USER: User = {
  id: 'usr_farmer_01',
  name: 'Ramesh Gowda',
  email: 'ramesh.gowda@malnadagro.com',
  phone: '+91 98452 38190',
  country: 'India',
  state: 'Karnataka',
  preferredLanguage: 'kn',
  createdAt: '2025-01-15T08:00:00Z',
};

// Seed Farms Worldwide with rich Indian primary crops and varieties
const INITIAL_FARMS: Farm[] = [
  {
    id: 'farm_chikmagalur_01',
    userId: 'usr_farmer_01',
    name: 'Giri Shikhara Estate',
    locationName: 'Baba Budangiri, Chikmagalur',
    country: 'India',
    state: 'Karnataka',
    cropType: 'Coffee Arabica',
    cropCategory: 'Plantation Crops',
    cropVariety: 'Selection 795 & Chandragiri',
    coffeeVariety: 'Selection 795 & Chandragiri',
    plantingYear: 2014,
    shadePercent: 40,
    coordinates: {
      lat: 13.4215,
      lng: 75.7621,
    },
    areaAcres: 28.5,
    areaHectares: 11.53,
    boundaryGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [75.7592, 13.4235],
          [75.7648, 13.4241],
          [75.7656, 13.4192],
          [75.7608, 13.4188],
          [75.7592, 13.4235],
        ],
      ],
    },
    createdAt: '2025-02-10T10:00:00Z',
    updatedAt: '2026-11-01T04:30:00Z',
    zones: [
      {
        zoneId: 'zone_nw_01',
        name: 'North-West Silver Oak Block',
        status: 'healthy',
        ndvi: 0.74,
        ndre: 0.48,
        ndwi: 0.32,
        lat: 13.4231,
        lng: 75.7605,
        notes: 'Dense high-canopy shade, vigorous green foliage, no visible rust pustules.',
      },
      {
        zoneId: 'zone_se_02',
        name: 'South-East Slope Block (At Risk)',
        status: 'stressed',
        ndvi: 0.43,
        ndre: 0.28,
        ndwi: 0.11,
        lat: 13.4195,
        lng: 75.7642,
        notes: 'Canopy thinning detected by Sentinel-2. Low soil moisture and early chlorotic spotting.',
      },
      {
        zoneId: 'zone_center_03',
        name: 'Central Valley Cauvery Block',
        status: 'moderate',
        ndvi: 0.58,
        ndre: 0.39,
        ndwi: 0.22,
        lat: 13.4212,
        lng: 75.7623,
        notes: 'Moderate vigor, standard vegetative flushing after post-monsoon showers.',
      },
    ],
  },
  {
    id: 'farm_karnal_rice_02',
    userId: 'usr_farmer_01',
    name: 'Pusa Basmati Heritage Fields',
    locationName: 'Karnal, Indo-Gangetic Basin',
    country: 'India',
    state: 'Haryana',
    cropType: 'Rice / Paddy',
    cropCategory: 'Cereals & Millets',
    cropVariety: 'Pusa Basmati 1121 & Pusa 1509',
    coffeeVariety: 'Pusa Basmati 1121',
    plantingYear: 2021,
    shadePercent: 0,
    coordinates: {
      lat: 29.6857,
      lng: 76.9905,
    },
    areaAcres: 36.4,
    areaHectares: 14.73,
    boundaryGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [76.9881, 29.6875],
          [76.9935, 29.6882],
          [76.9942, 29.6835],
          [76.9878, 29.6828],
          [76.9881, 29.6875],
        ],
      ],
    },
    createdAt: '2025-06-15T08:00:00Z',
    updatedAt: '2026-11-03T11:20:00Z',
    zones: [
      {
        zoneId: 'zone_basmati_01',
        name: 'Pusa 1121 Export Parcel',
        status: 'healthy',
        ndvi: 0.82,
        ndre: 0.56,
        ndwi: 0.42,
        lat: 29.6865,
        lng: 76.9912,
        notes: 'Optimal tillering stage, active irrigation, zero blast detected.',
      },
    ],
  },
  {
    id: 'farm_guntur_cotton_03',
    userId: 'usr_farmer_01',
    name: 'Krishna Delta Cotton & Chilli Farm',
    locationName: 'Tenali, Guntur District',
    country: 'India',
    state: 'Andhra Pradesh',
    cropType: 'Cotton & Red Chilli',
    cropCategory: 'Cash Crops & Fiber',
    cropVariety: 'RCH 659 BG II & Guntur Sannam (S4)',
    coffeeVariety: 'RCH 659 BG II',
    plantingYear: 2022,
    shadePercent: 0,
    coordinates: {
      lat: 16.3067,
      lng: 80.4365,
    },
    areaAcres: 24.0,
    areaHectares: 9.71,
    boundaryGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [80.4335, 16.3085],
          [80.4398, 16.3092],
          [80.4405, 16.3045],
          [80.4342, 16.3038],
          [80.4335, 16.3085],
        ],
      ],
    },
    createdAt: '2025-07-20T09:30:00Z',
    updatedAt: '2026-11-02T14:15:00Z',
    zones: [
      {
        zoneId: 'zone_cotton_01',
        name: 'BG-II Bollgard Block',
        status: 'healthy',
        ndvi: 0.73,
        ndre: 0.49,
        ndwi: 0.28,
        lat: 16.3072,
        lng: 80.4371,
        notes: 'Healthy boll formation, square retention >88%, pest-free.',
      },
    ],
  },
  {
    id: 'farm_mandya_ragi_04',
    userId: 'usr_farmer_01',
    name: 'Cauvery Basin Ragi & Cane Estate',
    locationName: 'Maddur, Mandya',
    country: 'India',
    state: 'Karnataka',
    cropType: 'Finger Millet (Ragi)',
    cropCategory: 'Cereals & Millets',
    cropVariety: 'GPU 28 & ML 365 Ragi',
    coffeeVariety: 'GPU 28',
    plantingYear: 2023,
    shadePercent: 0,
    coordinates: {
      lat: 12.5833,
      lng: 77.0500,
    },
    areaAcres: 18.5,
    areaHectares: 7.49,
    boundaryGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [77.0475, 12.5852],
          [77.0532, 12.5858],
          [77.0538, 12.5808],
          [77.0481, 12.5802],
          [77.0475, 12.5852],
        ],
      ],
    },
    createdAt: '2025-08-10T10:00:00Z',
    updatedAt: '2026-11-04T08:00:00Z',
    zones: [
      {
        zoneId: 'zone_ragi_01',
        name: 'GPU-28 High Calcium Plot',
        status: 'healthy',
        ndvi: 0.76,
        ndre: 0.52,
        ndwi: 0.31,
        lat: 12.5841,
        lng: 77.0512,
        notes: 'Dense tillers, blast-resistant healthy canopy, high earhead count.',
      },
    ],
  },
  {
    id: 'farm_sakleshpur_spices_05',
    userId: 'usr_farmer_01',
    name: 'Malnad Pepper & Cardamom Plantation',
    locationName: 'Hethur, Sakleshpur',
    country: 'India',
    state: 'Karnataka',
    cropType: 'Black Pepper & Cardamom',
    cropCategory: 'Spices & Condiments',
    cropVariety: 'Panniyur 1 & Njallani Green Gold',
    coffeeVariety: 'Panniyur 1',
    plantingYear: 2017,
    shadePercent: 50,
    coordinates: {
      lat: 12.8752,
      lng: 75.7825,
    },
    areaAcres: 22.0,
    areaHectares: 8.9,
    boundaryGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [75.7795, 12.8775],
          [75.7852, 12.8781],
          [75.7858, 12.8732],
          [75.7801, 12.8726],
          [75.7795, 12.8775],
        ],
      ],
    },
    createdAt: '2025-04-12T11:00:00Z',
    updatedAt: '2026-11-03T10:30:00Z',
    zones: [
      {
        zoneId: 'zone_pepper_01',
        name: 'Silver Oak Pepper Vines',
        status: 'healthy',
        ndvi: 0.79,
        ndre: 0.54,
        ndwi: 0.36,
        lat: 12.8761,
        lng: 75.7831,
        notes: 'Vigorous Panniyur vines, long spikes with 95% berry set.',
      },
    ],
  },
  {
    id: 'farm_coorg_02',
    userId: 'usr_farmer_01',
    name: 'Madikeri Mist Plantation',
    locationName: 'Suntikoppa, Kodagu (Coorg)',
    country: 'India',
    state: 'Karnataka',
    cropType: 'Coffee Robusta & Pepper',
    cropCategory: 'Plantation Crops',
    cropVariety: 'Robusta Congensis & CxR',
    coffeeVariety: 'Robusta Congensis & CxR',
    plantingYear: 2011,
    shadePercent: 45,
    coordinates: {
      lat: 12.4589,
      lng: 75.8234,
    },
    areaAcres: 42.0,
    areaHectares: 17.0,
    boundaryGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [75.8198, 12.4615],
          [75.8265, 12.4628],
          [75.8272, 12.4552],
          [75.8205, 12.4548],
          [75.8198, 12.4615],
        ],
      ],
    },
    createdAt: '2025-03-01T09:00:00Z',
    updatedAt: '2026-10-28T12:00:00Z',
    zones: [
      {
        zoneId: 'zone_coorg_01',
        name: 'River Valley Robusta Block',
        status: 'healthy',
        ndvi: 0.81,
        ndre: 0.52,
        ndwi: 0.38,
        lat: 12.4601,
        lng: 75.8221,
        notes: 'Excellent canopy density with high chlorophyll readings.',
      },
      {
        zoneId: 'zone_coorg_02',
        name: 'Upper Ridge Pepper Block',
        status: 'moderate',
        ndvi: 0.61,
        ndre: 0.41,
        ndwi: 0.21,
        lat: 12.4572,
        lng: 75.8248,
        notes: 'Slight yellowing noticed along exposed ridge line.',
      },
    ],
  },
];

// Initial Satellite Observations (Sentinel-2 overpasses)
const INITIAL_SATELLITE_OBS: SatelliteObservation[] = [
  {
    id: 'sat_obs_chik_2026_11_02',
    farmId: 'farm_chikmagalur_01',
    acquisitionDate: '2026-11-02T05:14:22Z',
    satellite: 'Sentinel-2B',
    cloudCoveragePercent: 4.2,
    tileId: 'T43PFS',
    sunZenithAngle: 32.4,
    meanNdvi: 0.68,
    meanNdre: 0.44,
    meanNdwi: 0.26,
    healthyAreaPercent: 71.5,
    moderateAreaPercent: 18.2,
    stressedAreaPercent: 10.3,
    dataSource: 'Copernicus Sentinel-2 Level-2A (BOA Reflectance)',
    isSimulatedFallback: false,
  },
  {
    id: 'sat_obs_chik_2026_10_28',
    farmId: 'farm_chikmagalur_01',
    acquisitionDate: '2026-10-28T05:13:58Z',
    satellite: 'Sentinel-2A',
    cloudCoveragePercent: 8.7,
    tileId: 'T43PFS',
    sunZenithAngle: 34.1,
    meanNdvi: 0.71,
    meanNdre: 0.46,
    meanNdwi: 0.29,
    healthyAreaPercent: 74.8,
    moderateAreaPercent: 17.0,
    stressedAreaPercent: 8.2,
    dataSource: 'Copernicus Sentinel-2 Level-2A (BOA Reflectance)',
  },
  {
    id: 'sat_obs_chik_2026_10_18',
    farmId: 'farm_chikmagalur_01',
    acquisitionDate: '2026-10-18T05:14:10Z',
    satellite: 'Sentinel-2B',
    cloudCoveragePercent: 12.1,
    tileId: 'T43PFS',
    sunZenithAngle: 37.8,
    meanNdvi: 0.73,
    meanNdre: 0.47,
    meanNdwi: 0.31,
    healthyAreaPercent: 78.0,
    moderateAreaPercent: 15.4,
    stressedAreaPercent: 6.6,
    dataSource: 'Copernicus Sentinel-2 Level-2A',
  },
];

// Initial Drone Inspections
const INITIAL_DRONE_INSPECTIONS: DroneInspection[] = [
  {
    id: 'drone_insp_001',
    farmId: 'farm_chikmagalur_01',
    flightDate: '2026-11-03T09:15:00Z',
    pilotName: 'Anil Kumar (DGCA Certified)',
    droneModel: 'DJI Matrice 350 RTK + Multispectral P1',
    altitudeMeters: 45,
    flightDurationMin: 24,
    gsdCmPerPixel: 1.8,
    imageUrl:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    waypointsCount: 16,
    bushesInspectedCount: 420,
    stressedBushesCount: 18,
    waypoints: [
      { id: 'wp_1', lat: 13.4231, lng: 75.7602, altitudeMeters: 45, headingDegrees: 90, status: 'normal' },
      { id: 'wp_2', lat: 13.4233, lng: 75.7625, altitudeMeters: 45, headingDegrees: 90, status: 'normal' },
      { id: 'wp_3', lat: 13.4212, lng: 75.7638, altitudeMeters: 45, headingDegrees: 180, status: 'flagged', notes: 'Suspected Rust cluster on lower foliage' },
      { id: 'wp_4', lat: 13.4198, lng: 75.7615, altitudeMeters: 45, headingDegrees: 270, status: 'normal' },
    ],
    taggedPlants: [
      {
        id: 'plant_tag_14',
        tagNumber: 'BUSH-14-SE',
        lat: 13.4196,
        lng: 75.7641,
        healthStatus: 'Suspected Rust',
        notes: 'Underleaf orange sporulation detected on 4 branches. Recommend immediate copper spray isolation.',
        date: '2026-11-03',
      },
      {
        id: 'plant_tag_27',
        tagNumber: 'BUSH-27-SE',
        lat: 13.4199,
        lng: 75.7637,
        healthStatus: 'Nutrient Stress',
        notes: 'Interveinal chlorosis resembling magnesium or nitrogen deficiency.',
        date: '2026-11-03',
      },
      {
        id: 'plant_tag_88',
        tagNumber: 'BUSH-88-NW',
        lat: 13.4228,
        lng: 75.7608,
        healthStatus: 'Healthy',
        notes: 'Vigorous primary branches, high cherry set, zero leaf lesioning.',
        date: '2026-11-03',
      },
    ],
  },
];

// Initial Disease Detection Records
const INITIAL_DISEASE_RECORDS: CropDiseaseDetection[] = [
  {
    id: 'rec_dis_01',
    farmId: 'farm_chikmagalur_01',
    cropIdentified: 'Coffee (Coffea arabica - Selection 795)',
    conditionName: 'Coffee Leaf Rust (Hemileia vastatrix)',
    scientificName: 'Hemileia vastatrix Berkeley & Broome',
    confidence: 96,
    severity: 'Moderate',
    isDefinitive: false,
    symptomsObserved: [
      'Powdery orange-yellow spore pustules on underside of leaves',
      'Chlorotic yellowish-white spots on upper leaf surface',
      'Beginning of premature leaf shedding on lower secondary branches',
    ],
    possibleCauses: [
      'Warm temperature between 22-24°C coupled with sustained humidity > 85%',
      'Persistent morning dew on foliage exceeding 5 hours',
      'Heavy shade restricting canopy airflow',
    ],
    recommendedActions: {
      immediate: [
        'Collect and destroy heavily infected dropped leaves away from the plot',
        'Refrain from overhead irrigation during afternoon periods',
      ],
      culturalAndOrganic: [
        'Thin shade trees (Silver Oak / Dadap) to achieve 35% filtered sunlight',
        'Foliar spray of beneficial bio-fungicide (Trichoderma viride or Bacillus subtilis)',
      ],
      chemicalTreatment: [
        'Foliar application of Copper Oxychloride 50% WP @ 2.5 grams per liter with sticker',
        'If infection surpasses 15% leaf area, apply Triazole systemic fungicide under agronomist supervision',
      ],
      preventative: [
        'Infill gaps with rust-tolerant varieties like Chandragiri or Cauvery',
        'Maintain balanced soil potassium and nitrogen fertilization',
      ],
    },
    expertVerificationWarning:
      'Expert Verification Advisory: This is an AI-assisted detection. Confirm diagnosis with your Coffee Board Extension Officer before procuring or applying commercial chemical fungicides.',
    imageUrl:
      'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-11-04T11:20:00Z',
    samplePresetKey: 'rust',
  },
];

// Initial System & Agricultural Notifications
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    type: 'stress',
    titleEn: 'Vegetation Stress Detected in South-East Block',
    titleKn: 'ದಕ್ಷಿಣ-ಪೂರ್ವ ಬ್ಲಾಕ್‌ನಲ್ಲಿ ಬೆಳೆ ಒತ್ತಡ ಪತ್ತೆಯಾಗಿದೆ',
    messageEn: 'Sentinel-2 overpass recorded a 14% drop in NDVI (down to 0.43) across 2.9 acres.',
    messageKn: 'ಸೆಂಟಿನೆಲ್-೨ ಉಪಗ್ರಹವು ೨.೯ ಎಕರೆ ಪ್ರದೇಶದಲ್ಲಿ ಎನ್‌ಡಿವಿಐ ೧೪% ಕುಸಿದಿರುವುದನ್ನು ಗುರುತಿಸಿದೆ (೦.೪೩ ಕ್ಕೆ ಇಳಿಕೆ).',
    date: '2026-11-04T07:30:00Z',
    read: false,
    severity: 'warning',
    farmId: 'farm_chikmagalur_01',
    linkScreen: 'satellite',
  },
  {
    id: 'notif_02',
    type: 'weather',
    titleEn: 'Favorable Rust Sporulation Weather Alert',
    titleKn: 'ಕಾಫಿ ತುಕ್ಕು ರೋಗ ಹರಡುವ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
    messageEn: 'High humidity (>88%) and 23°C forecast for the next 48 hours increase spore germination risk.',
    messageKn: 'ಮುಂದಿನ ೪೮ ಗಂಟೆಗಳಲ್ಲಿ ಹೆಚ್ಚಿನ ತೇವಾಂಶ (>88%) ಮತ್ತು ೨೩°ಸೆ ಇರುವುದರಿಂದ ತುಕ್ಕು ರೋಗ ಹರಡುವ ಅಪಾಯ ಹೆಚ್ಚು.',
    date: '2026-11-03T18:00:00Z',
    read: false,
    severity: 'critical',
    farmId: 'farm_chikmagalur_01',
    linkScreen: 'weather',
  },
  {
    id: 'notif_03',
    type: 'satellite',
    titleEn: 'Fresh Sentinel-2 Multispectral Scene Available',
    titleKn: 'ಹೊಸ ಸೆಂಟಿನೆಲ್-೨ ಉಪಗ್ರಹ ಚಿತ್ರ ಲಭ್ಯವಿದೆ',
    messageEn: 'Tile T43PFS acquired with only 4.2% cloud cover. NDVI & NDRE recalculated.',
    messageKn: 'ಕೇವಲ ೪.೨% ಮೋಡಗಳೊಂದಿಗೆ ಟೈಲ್ T43PFS ಚಿತ್ರ ಲಭ್ಯವಾಗಿದೆ. ಎನ್‌ಡಿವಿಐ ನವೀಕರಿಸಲಾಗಿದೆ.',
    date: '2026-11-02T06:00:00Z',
    read: true,
    severity: 'info',
    farmId: 'farm_chikmagalur_01',
    linkScreen: 'satellite',
  },
];

// Initial Drone Device Seed
const INITIAL_DRONE_DEVICE: DroneDevice = {
  drone_id: 'drone_dji_m350_01',
  manufacturer: 'DJI',
  model: 'Matrice 350 RTK + Multispectral P1',
  connection_type: 'DJI_Mobile_SDK',
  connection_status: 'Connected',
  battery_percentage: 88,
  gps_status: 'RTK Fixed (24 Satellites)',
  flight_status: 'Landed',
  telemetry: {
    altitudeM: 0.0,
    speedMs: 0.0,
    headingDeg: 124,
    lat: 13.4215,
    lng: 75.7621,
  },
  last_connected: '2026-11-05T06:45:00Z',
  is_demo: true,
};

// Initial Satellite Anomalies (from Sentinel-2 Spectral Analysis)
const INITIAL_SATELLITE_ANOMALIES: SatelliteAnomaly[] = [
  {
    anomaly_id: 'anom_sat_01',
    farm_id: 'farm_chikmagalur_01',
    anomaly_type: 'NDVI_Drop',
    severity: 'High',
    latitude: 13.4195,
    longitude: 75.7642,
    satellite_image_date: '2026-11-02T05:14:22Z',
    vegetation_index: 'NDVI',
    index_value: 0.43,
    historical_baseline_value: 0.74,
    drop_percentage: 41.9,
    inspection_status: 'task_created',
    description: 'South-East Slope: Sharp 41.9% NDVI reduction over 2.9 acres. Possible fungal sporulation or moisture stress.',
  },
  {
    anomaly_id: 'anom_sat_02',
    farm_id: 'farm_chikmagalur_01',
    anomaly_type: 'Canopy_Chlorosis',
    severity: 'Medium',
    latitude: 13.4231,
    longitude: 75.7602,
    satellite_image_date: '2026-11-02T05:14:22Z',
    vegetation_index: 'NDRE',
    index_value: 0.35,
    historical_baseline_value: 0.52,
    drop_percentage: 32.7,
    inspection_status: 'inspected',
    description: 'North-West Ridge: Red Edge drop indicating canopy chlorosis and nitrogen depletion.',
  },
  {
    anomaly_id: 'anom_sat_03',
    farm_id: 'farm_coorg_02',
    anomaly_type: 'Moisture_Deficit',
    severity: 'Medium',
    latitude: 12.4572,
    longitude: 75.8248,
    satellite_image_date: '2026-10-28T05:13:58Z',
    vegetation_index: 'NDMI',
    index_value: 0.18,
    historical_baseline_value: 0.38,
    drop_percentage: 52.6,
    inspection_status: 'unassigned',
    description: 'Upper Ridge: Elevated moisture deficit detected by Sentinel-2 SWIR bands.',
  },
];

// Initial Drone Inspection Tasks
const INITIAL_INSPECTION_TASKS: DroneInspectionTask[] = [
  {
    inspection_id: 'insp_task_01',
    farm_id: 'farm_chikmagalur_01',
    anomaly_id: 'anom_sat_01',
    drone_id: 'drone_dji_m350_01',
    coordinates: {
      lat: 13.4195,
      lng: 75.7642,
      altitudeMeters: 45,
    },
    target_radius_m: 60,
    inspection_status: 'dispatched',
    operator_confirmed: true,
    operator_name: 'Anil Kumar (DGCA Certified)',
    created_at: '2026-11-03T08:30:00Z',
    dispatched_at: '2026-11-03T09:00:00Z',
    images_count: 4,
    notes: 'Investigate South-East slope anomaly flagged by Sentinel-2 NDVI drop.',
  },
];

// Initial Drone Images (with Camera Types & AI Pathology)
const INITIAL_DRONE_IMAGE_RECORDS: DroneImageRecord[] = [
  {
    image_id: 'dimg_01',
    inspection_id: 'insp_task_01',
    anomaly_id: 'anom_sat_01',
    farm_id: 'farm_chikmagalur_01',
    image_url: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80',
    latitude: 13.4196,
    longitude: 75.7641,
    altitude: 45.2,
    camera_type: 'RGB',
    capture_timestamp: '2026-11-03T09:14:20Z',
    drone_model: 'DJI Matrice 350 RTK',
    ai_analysis: {
      condition_name: 'Coffee Leaf Rust (Hemileia vastatrix)',
      scientific_name: 'Hemileia vastatrix',
      confidence: 96,
      severity: 'Moderate',
      symptoms: [
        'Orange-yellow powdery spore pustules on underside of foliage',
        'Early lower canopy defoliation',
      ],
      verification_warning: 'Field verification by certified Coffee Board officer recommended before chemical spray.',
      recommended_reinspection_date: '2026-11-10',
    },
  },
  {
    image_id: 'dimg_02',
    inspection_id: 'insp_task_01',
    anomaly_id: 'anom_sat_01',
    farm_id: 'farm_chikmagalur_01',
    image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
    latitude: 13.4199,
    longitude: 75.7637,
    altitude: 44.8,
    camera_type: 'Multispectral',
    capture_timestamp: '2026-11-03T09:16:05Z',
    drone_model: 'DJI Matrice 350 RTK',
    ai_analysis: {
      condition_name: 'Nutritional Chlorosis (Nitrogen Deficit)',
      scientific_name: 'Physiological Abiotic Stress',
      confidence: 91,
      severity: 'Mild',
      symptoms: ['Interveinal yellowing on expanding shoots'],
      verification_warning: 'Perform soil pH and leaf tissue analysis before foliar fertilization.',
      recommended_reinspection_date: '2026-11-15',
    },
  },
];

export const StorageService = {
  // User Management
  getUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USER;
    }
  },

  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // Farms
  getFarms(): Farm[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FARMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(INITIAL_FARMS));
      return INITIAL_FARMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FARMS;
    }
  },

  saveFarm(farm: Farm): void {
    const farms = this.getFarms();
    const index = farms.findIndex((f) => f.id === farm.id);
    if (index >= 0) {
      farms[index] = farm;
    } else {
      farms.unshift(farm);
    }
    localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(farms));
  },

  deleteFarm(farmId: string): void {
    const farms = this.getFarms().filter((f) => f.id !== farmId);
    localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(farms));
    if (this.getActiveFarmId() === farmId) {
      if (farms.length > 0) {
        this.setActiveFarmId(farms[0].id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_FARM_ID);
      }
    }
  },

  getActiveFarmId(): string {
    let id = localStorage.getItem(STORAGE_KEYS.ACTIVE_FARM_ID);
    const farms = this.getFarms();
    if (!id || !farms.some((f) => f.id === id)) {
      id = farms[0]?.id || '';
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_FARM_ID, id);
      }
    }
    return id;
  },

  setActiveFarmId(farmId: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FARM_ID, farmId);
  },

  getActiveFarm(): Farm | undefined {
    const id = this.getActiveFarmId();
    const farms = this.getFarms();
    return farms.find((f) => f.id === id) || farms[0];
  },

  // Satellite Observations
  getSatelliteObservations(farmId?: string): SatelliteObservation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SATELLITE_OBS);
    let list: SatelliteObservation[] = [];
    if (!raw) {
      list = INITIAL_SATELLITE_OBS;
      localStorage.setItem(STORAGE_KEYS.SATELLITE_OBS, JSON.stringify(list));
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_SATELLITE_OBS;
      }
    }
    return farmId ? list.filter((item) => item.farmId === farmId) : list;
  },

  saveSatelliteObservation(obs: SatelliteObservation): void {
    const list = this.getSatelliteObservations();
    list.unshift(obs);
    localStorage.setItem(STORAGE_KEYS.SATELLITE_OBS, JSON.stringify(list));
  },

  // Drone Inspections
  getDroneInspections(farmId?: string): DroneInspection[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DRONE_INSPECTIONS);
    let list: DroneInspection[] = [];
    if (!raw) {
      list = INITIAL_DRONE_INSPECTIONS;
      localStorage.setItem(STORAGE_KEYS.DRONE_INSPECTIONS, JSON.stringify(list));
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_DRONE_INSPECTIONS;
      }
    }
    return farmId ? list.filter((item) => item.farmId === farmId) : list;
  },

  saveDroneInspection(inspection: DroneInspection): void {
    const list = this.getDroneInspections();
    list.unshift(inspection);
    localStorage.setItem(STORAGE_KEYS.DRONE_INSPECTIONS, JSON.stringify(list));
  },

  // Disease Detection Records
  getDiseaseRecords(): CropDiseaseDetection[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DISEASE_RECORDS);
    if (!raw) {
      safeLocalStorageSetItem(STORAGE_KEYS.DISEASE_RECORDS, JSON.stringify(INITIAL_DISEASE_RECORDS));
      return INITIAL_DISEASE_RECORDS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DISEASE_RECORDS;
    }
  },

  saveDiseaseRecord(record: CropDiseaseDetection): void {
    const list = this.getDiseaseRecords();
    
    // Sanitize image payload: avoid saving massive data URLs (>15KB) directly to localStorage
    const sanitizedRecord: CropDiseaseDetection = {
      ...record,
      imageUrl:
        record.imageUrl && record.imageUrl.startsWith('data:') && record.imageUrl.length > 15000
          ? '' // Truncate huge data URL from persistent storage; UI keeps memory preview
          : record.imageUrl,
    };

    list.unshift(sanitizedRecord);

    // Keep at most 6 disease detection history items and ensure no bulky data URLs
    const prunedList = list.slice(0, 6).map((item) => ({
      ...item,
      imageUrl:
        item.imageUrl && item.imageUrl.startsWith('data:') && item.imageUrl.length > 15000
          ? ''
          : item.imageUrl,
    }));

    safeLocalStorageSetItem(STORAGE_KEYS.DISEASE_RECORDS, JSON.stringify(prunedList));
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
  },

  markAllNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  },

  // Drone Device
  getDroneDevice(): DroneDevice {
    const raw = localStorage.getItem(STORAGE_KEYS.DRONE_DEVICE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DRONE_DEVICE, JSON.stringify(INITIAL_DRONE_DEVICE));
      return INITIAL_DRONE_DEVICE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DRONE_DEVICE;
    }
  },

  saveDroneDevice(device: DroneDevice): void {
    localStorage.setItem(STORAGE_KEYS.DRONE_DEVICE, JSON.stringify(device));
  },

  // Satellite Anomalies
  getSatelliteAnomalies(farmId?: string): SatelliteAnomaly[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SATELLITE_ANOMALIES);
    let list: SatelliteAnomaly[] = [];
    if (!raw) {
      list = INITIAL_SATELLITE_ANOMALIES;
      localStorage.setItem(STORAGE_KEYS.SATELLITE_ANOMALIES, JSON.stringify(list));
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_SATELLITE_ANOMALIES;
      }
    }
    return farmId ? list.filter((a) => a.farm_id === farmId) : list;
  },

  saveSatelliteAnomaly(anomaly: SatelliteAnomaly): void {
    const list = this.getSatelliteAnomalies();
    const idx = list.findIndex((a) => a.anomaly_id === anomaly.anomaly_id);
    if (idx >= 0) {
      list[idx] = anomaly;
    } else {
      list.unshift(anomaly);
    }
    localStorage.setItem(STORAGE_KEYS.SATELLITE_ANOMALIES, JSON.stringify(list));
  },

  saveSatelliteAnomalies(list: SatelliteAnomaly[]): void {
    localStorage.setItem(STORAGE_KEYS.SATELLITE_ANOMALIES, JSON.stringify(list));
  },

  simulateSatelliteAnomaly(farmId: string, lat = 13.4205, lng = 75.7635): SatelliteAnomaly {
    const newAnom: SatelliteAnomaly = {
      anomaly_id: `anom_sim_${Date.now()}`,
      farm_id: farmId,
      anomaly_type: 'NDVI_Drop',
      severity: 'High',
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      satellite_image_date: new Date().toISOString(),
      vegetation_index: 'NDVI',
      index_value: 0.41,
      historical_baseline_value: 0.73,
      drop_percentage: 43.8,
      inspection_status: 'unassigned',
      description: 'Simulated Sentinel-2 NDVI drop: 43.8% decline in photosynthetic vigor detected. Drone inspection advised.',
    };
    this.saveSatelliteAnomaly(newAnom);
    return newAnom;
  },

  // Drone Inspection Tasks
  getInspectionTasks(farmId?: string): DroneInspectionTask[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INSPECTION_TASKS);
    let list: DroneInspectionTask[] = [];
    if (!raw) {
      list = INITIAL_INSPECTION_TASKS;
      localStorage.setItem(STORAGE_KEYS.INSPECTION_TASKS, JSON.stringify(list));
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_INSPECTION_TASKS;
      }
    }
    return farmId ? list.filter((t) => t.farm_id === farmId) : list;
  },

  saveInspectionTask(task: DroneInspectionTask): void {
    const list = this.getInspectionTasks();
    const idx = list.findIndex((t) => t.inspection_id === task.inspection_id);
    if (idx >= 0) {
      list[idx] = task;
    } else {
      list.unshift(task);
    }
    localStorage.setItem(STORAGE_KEYS.INSPECTION_TASKS, JSON.stringify(list));

    // Update anomaly status
    const anom = this.getSatelliteAnomalies().find((a) => a.anomaly_id === task.anomaly_id);
    if (anom) {
      anom.inspection_status = task.inspection_status === 'completed' ? 'inspected' : 'dispatched';
      this.saveSatelliteAnomaly(anom);
    }
  },

  saveInspectionTasks(list: DroneInspectionTask[]): void {
    localStorage.setItem(STORAGE_KEYS.INSPECTION_TASKS, JSON.stringify(list));
  },

  // Drone Images
  getDroneImageRecords(farmId?: string, inspectionId?: string): DroneImageRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DRONE_IMAGES);
    let list: DroneImageRecord[] = [];
    if (!raw) {
      list = INITIAL_DRONE_IMAGE_RECORDS;
      localStorage.setItem(STORAGE_KEYS.DRONE_IMAGES, JSON.stringify(list));
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_DRONE_IMAGE_RECORDS;
      }
    }
    if (inspectionId) list = list.filter((img) => img.inspection_id === inspectionId);
    if (farmId) list = list.filter((img) => img.farm_id === farmId);
    return list;
  },

  saveDroneImageRecord(image: DroneImageRecord): void {
    const list = this.getDroneImageRecords();
    list.unshift(image);
    localStorage.setItem(STORAGE_KEYS.DRONE_IMAGES, JSON.stringify(list));
  },

  saveDroneImageRecords(list: DroneImageRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.DRONE_IMAGES, JSON.stringify(list));
  },

  // AI Plant Identifications
  getPlantIdentifications(): PlantIdentificationResult[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANT_IDENTIFICATIONS);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  savePlantIdentification(record: PlantIdentificationResult): void {
    const list = this.getPlantIdentifications();
    // Prepend new record, keep up to 25 records
    const updated = [record, ...list.filter((r) => r.id !== record.id)].slice(0, 25);
    safeLocalStorageSetItem(STORAGE_KEYS.PLANT_IDENTIFICATIONS, JSON.stringify(updated));
  },

  deletePlantIdentification(id: string): void {
    const list = this.getPlantIdentifications().filter((r) => r.id !== id);
    safeLocalStorageSetItem(STORAGE_KEYS.PLANT_IDENTIFICATIONS, JSON.stringify(list));
  },

  // Reset to sample defaults
  resetAllToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.FARMS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_FARM_ID);
    localStorage.removeItem(STORAGE_KEYS.SATELLITE_OBS);
    localStorage.removeItem(STORAGE_KEYS.DRONE_INSPECTIONS);
    localStorage.removeItem(STORAGE_KEYS.DISEASE_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.DRONE_DEVICE);
    localStorage.removeItem(STORAGE_KEYS.SATELLITE_ANOMALIES);
    localStorage.removeItem(STORAGE_KEYS.INSPECTION_TASKS);
    localStorage.removeItem(STORAGE_KEYS.DRONE_IMAGES);
    localStorage.removeItem(STORAGE_KEYS.PLANT_IDENTIFICATIONS);
  },
};
