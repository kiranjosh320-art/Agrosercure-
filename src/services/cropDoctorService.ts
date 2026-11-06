import { CropDoctorAlert, WeatherData, Farm } from '../types';

export const INITIAL_CROP_DOCTOR_ALERTS: CropDoctorAlert[] = [
  {
    id: 'alert_pest_01',
    category: 'pest_disease',
    severity: 'critical',
    titleEn: 'Severe Coffee Leaf Rust & Spore Dispersal Warning',
    titleKn: 'ಕಾಫಿ ಎಲೆ ತುಕ್ಕು ರೋಗ ಮತ್ತು ಬೀಜಾಣು ಪ್ರಸರಣ ತೀವ್ರ ಎಚ್ಚರಿಕೆ',
    titleHi: 'कॉफ़ी रतुआ (Leaf Rust) व बीजाणु प्रसार गंभीर चेतावनी',
    descriptionEn: 'High relative humidity (>82%) and persistent leaf surface moisture (>6 hours) in the district creates high sporulation risk for Hemileia vastatrix.',
    descriptionKn: 'ಜಿಲ್ಲೆಯಲ್ಲಿ ಶೇ. 82 ಕ್ಕಿಂತ ಹೆಚ್ಚು ತೇವಾಂಶ ಮತ್ತು 6 ಗಂಟೆಗಳ ಕಾಲ ಎಲೆಗಳಲ್ಲಿ ನಿಂತ ನೀರಿನಿಂದ ಎಲೆ ತುಕ್ಕು ರೋಗ ಹರಡುವ ಸಾಧ್ಯತೆ ಹೆಚ್ಚಾಗಿದೆ.',
    descriptionHi: 'जिले में उच्च आर्द्रता (>82%) और पत्तियों पर 6 घंटे से अधिक समय तक नमी रहने के कारण कॉफ़ी रतुआ रोग फैलने का भारी खतरा है।',
    actionRequiredEn: 'Immediately spray freshly prepared 1% Bordeaux Mixture or Copper Oxychloride 50 WP @ 2.5 g/L on the abaxial (underside) leaf surface. Prune dense shade trees.',
    actionRequiredKn: 'ತಕ್ಷಣವೇ ಎಲೆಗಳ ಕೆಳಭಾಗಕ್ಕೆ 1% ಬೋರ್ಡೋ ದ್ರಾವಣ ಅಥವಾ ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ (2.5 ಗ್ರಾಂ/ಲೀ) ಸಿಂಪಡಿಸಿ. ನೆರಳಿನ ಮರಗಳನ್ನು ಸವರಿ.',
    actionRequiredHi: 'पत्तियों की निचली सतह पर तुरंत 1% बोर्डो मिश्रण या कॉपर ऑक्सीक्लोराइड (2.5 ग्राम/लीटर) का छिड़काव करें। पेड़ों की हल्की छंटाई करें।',
    source: 'Central Coffee Research Institute (CCRI) & AgroSecure Anomaly Engine',
    affectedCrop: 'Coffee (Arabica & Robusta)',
    locationState: 'Karnataka',
    district: 'Chikmagalur',
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    acknowledged: false,
    resolved: false,
    recommendedScreen: 'crop_detector',
  },
  {
    id: 'alert_weather_02',
    category: 'extreme_weather',
    severity: 'warning',
    titleEn: 'Unseasonal Thunderstorms & Localized Hailstorm Risk',
    titleKn: 'ಅಕಾಲಿಕ ಗುಡುಗು ಮಿಂಚು ಸಹಿತ ಮಳೆ ಮತ್ತು ಆಲಿಕಲ್ಲು ಅಪಾಯ',
    titleHi: 'बेमौसम गरज-चमक व ओलावृष्टि का खतरा',
    descriptionEn: 'Convective storm cloud formation forecast over the Western Ghats and Deccan plateau in the next 36 hours. Gusts up to 45 km/h.',
    descriptionKn: 'ಮುಂದಿನ 36 ಗಂಟೆಗಳಲ್ಲಿ ಪಶ್ಚಿಮ ಘಟ್ಟಗಳು ಮತ್ತು ಡೆಕ್ಕನ್ ಪ್ರಸ್ಥಭೂಮಿಯಲ್ಲಿ ಅಕಾಲಿಕ ಗುಡುಗು ಮಳೆಯ ಮುನ್ಸೂಚನೆ. ಗಾಳಿಯ ವೇಗ ಗಂಟೆಗೆ 45 ಕಿ.ಮೀ.',
    descriptionHi: 'अगले 36 घंटों में पश्चिमी घाट व दक्कन क्षेत्र में तेज आंधी और बेमौसम बारिश की चेतावनी। हवा की गति 45 किमी/घंटा तक संभव।',
    actionRequiredEn: 'Clear field drainage trenches immediately to avoid waterlogging. Secure drying yard cherry crops and postpone open fertilizer broadcast.',
    actionRequiredKn: 'ನೀರು ನಿಲ್ಲದಂತೆ ತೋಟದ ಚರಂಡಿಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ. ಒಣಗಿಸುವ ಕಣದಲ್ಲಿರುವ ಕಾಫಿ ಹಣ್ಣುಗಳನ್ನು ಮುಚ್ಚಿ ಮತ್ತು ರಸಗೊಬ್ಬರ ಹಾಕುವುದನ್ನು ಮುಂದೂಡಿ.',
    actionRequiredHi: 'खेत में जलभराव रोकने हेतु नालियों की सफाई करें। सुखाए जा रहे अनाजों को सुरक्षित ढकें और उर्वरक डालने का काम टालें।',
    source: 'India Meteorological Department (IMD) Agromet & Open-Meteo',
    affectedCrop: 'All Crops',
    locationState: 'Karnataka / Kerala',
    district: 'Chikmagalur / Wayanad',
    date: new Date(Date.now() - 3600000 * 12).toISOString(),
    acknowledged: false,
    resolved: false,
    recommendedScreen: 'weather',
  },
  {
    id: 'alert_spray_03',
    category: 'spray_window',
    severity: 'advisory',
    titleEn: 'Optimal Foliar Spraying Window: Tomorrow 06:30 AM - 10:30 AM',
    titleKn: 'ಸೂಕ್ತ ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಸಮಯ: ನಾಳೆ ಬೆಳಗ್ಗೆ 06:30 ರಿಂದ 10:30',
    titleHi: 'छिड़काव के लिए सर्वोत्तम समय: कल सुबह 06:30 से 10:30',
    descriptionEn: 'Wind speed will be calm (4-8 km/h), surface dew will have evaporated by 6:30 AM, and rainfall probability is under 12%. Ideal for systemic fungicide absorption.',
    descriptionKn: 'ಮುಂಜಾನೆ ಗಾಳಿಯ ವೇಗ ಕಡಿಮೆ (4-8 ಕಿ.ಮೀ/ಗಂಟೆ), ಇಬ್ಬನಿ ಒಣಗಿರುತ್ತದೆ ಮತ್ತು ಮಳೆಯ ಸಂಭವ ಶೇ. 12 ಕ್ಕಿಂತ ಕಡಿಮೆ ಇದೆ. ರಸಗೊಬ್ಬರ ಮತ್ತು ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಣೆಗೆ ಅತ್ಯುತ್ತಮ ಸಮಯ.',
    descriptionHi: 'हवा की गति शांत (4-8 किमी/घंटा), पत्तियों पर ओस नहीं रहेगी तथा बारिश की संभावना 12% से कम है। कवकनाशी छिड़काव के लिए आदर्श समय।',
    actionRequiredEn: 'Schedule targeted knapsack or power sprayer operation. Use non-ionic surfactant/sticker (0.5 ml/L) for optimal retention.',
    actionRequiredKn: 'ಪವರ್ ಸ್ಪ್ರೇಯರ್ ಮೂಲಕ ಸಿಂಪಡಣೆ ನಡೆಸಿ. ದ್ರಾವಣ ಸರಿಯಾಗಿ ಅಂಟಿಕೊಳ್ಳಲು ಸ್ಟಿಕ್ಕರ್ ಬೆರೆಸಿ.',
    actionRequiredHi: 'स्प्रेयर तैयार रखें और दवा के घोल में स्टिकर मिलाकर छिड़काव पूरा करें।',
    source: 'AgroSecure Precision Meteorological Engine',
    affectedCrop: 'Coffee, Spices, Vegetables',
    locationState: 'Karnataka',
    district: 'All Western Ghats Hubs',
    date: new Date(Date.now() - 3600000 * 18).toISOString(),
    acknowledged: false,
    resolved: false,
    recommendedScreen: 'weather',
  },
  {
    id: 'alert_irrigation_04',
    category: 'irrigation',
    severity: 'warning',
    titleEn: 'Soil Moisture Deficit Flagged in Upper Slope Quadrants',
    titleKn: 'ಮೇಲ್ಭಾಗದ ಇಳಿಜಾರಿನ ವಲಯಗಳಲ್ಲಿ ಮಣ್ಣಿನ ತೇವಾಂಶ ಕೊರತೆ ಪತ್ತೆ',
    titleHi: 'ऊपरी ढलान वाले क्षेत्र में मिट्टी में नमी की कमी दर्ज',
    descriptionEn: 'Sentinel-2 NDWI drop of 38% observed across 4.2 acres. Soil volumetric water content has decreased below permanent wilting point buffer.',
    descriptionKn: 'ಉಪಗ್ರಹ NDWI ಸೂಚ್ಯಂಕದಲ್ಲಿ 38% ಇಳಿಕೆ ಕಂಡುಬಂದಿದೆ. 4.2 ಎಕರೆ ಪ್ರದೇಶದಲ್ಲಿ ಮಣ್ಣಿನ ತೇವಾಂಶ ಗಣನೀಯವಾಗಿ ಕಡಿಮೆಯಾಗಿದೆ.',
    descriptionHi: 'उपग्रह डेटा के अनुसार 4.2 एकड़ क्षेत्र में मिट्टी की नमी में 38% की गिरावट दर्ज की गई है। पौधों में जल तनाव संभव।',
    actionRequiredEn: 'Initiate supplemental drip irrigation (30-40 liters per bush basin) or apply dense biomass mulch to preserve capillary soil water.',
    actionRequiredKn: 'ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ಪ್ರತಿ ಗಿಡಕ್ಕೆ 30-40 ಲೀಟರ್ ನೀರು ಕೊಡಿ ಅಥವಾ ಬುಡಕ್ಕೆ ಒಣ ಎಲೆಗಳ ಹೊದಿಕೆ (ಮಲ್ಚಿಂಗ್) ಮಾಡಿ.',
    actionRequiredHi: 'ड्रिप सिंचाई चालू करें या नमी बचाने के लिए पेड़ों की जड़ों के चारों ओर सूखी घास या पत्तियों से मल्चिंग करें।',
    source: 'Copernicus Sentinel-2 NDWI Telemetry',
    affectedCrop: 'Plantation Crops & Horticulture',
    locationState: 'Karnataka',
    district: 'Chikmagalur',
    date: new Date(Date.now() - 3600000 * 28).toISOString(),
    acknowledged: false,
    resolved: false,
    recommendedScreen: 'anomaly_engine',
  },
  {
    id: 'alert_gov_05',
    category: 'gov_mandi',
    severity: 'info',
    titleEn: 'PMFBY Kharif/Rabi Insurance Enrollment & Localized Claim Window',
    titleKn: 'ಪಿಎಂಎಫ್‌ಬಿವೈ (PMFBY) ಬೆಳೆ ವಿಮೆ ನೋಂದಣಿ ಮತ್ತು ಕ್ಲೈಮ್ ಸೌಲಭ್ಯ',
    titleHi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY) नामांकन व क्लेम सूचना',
    descriptionEn: 'Government of India has opened the enrollment window for horticultural & plantation crops. Farmers experiencing weather-induced yield loss must intimate within 72 hours.',
    descriptionKn: 'ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಸರ್ಕಾರದ ಬೆಳೆ ವಿಮೆ ನೋಂದಣಿ ಆರಂಭವಾಗಿದೆ. ಅಕಾಲಿಕ ಹಾನಿ ಸಂಭವಿಸಿದಲ್ಲಿ 72 ಗಂಟೆಯೊಳಗೆ ಕೃಷಿ ಇಲಾಖೆಗೆ ಮಾಹಿತಿ ನೀಡಿ.',
    descriptionHi: 'फसल बीमा योजना के तहत नामांकन जारी है। आपदा या असमय बारिश से फसल नुकसान होने पर 72 घंटे के अंदर टोल फ्री 14447 पर सूचना दर्ज कराएं।',
    actionRequiredEn: 'Submit land RTC/Pahani records and bank account details on pmfby.gov.in or through local Common Service Centers (CSC). Check Financial Risk tab.',
    actionRequiredKn: 'ಪಹಣಿ (RTC) ಮತ್ತು ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ ದಾಖಲೆಗಳೊಂದಿಗೆ ಸಿಎಸ್‌ಸಿ ಕೇಂದ್ರದಲ್ಲಿ ವಿಮೆ ನೋಂದಣಿ ಮಾಡಿಸಿ.',
    actionRequiredHi: 'जमीन के दस्तावेज व बैंक खाते के साथ नजदीकी सीएससी (CSC) केंद्र पर पंजीकरण कराएं।',
    source: 'Ministry of Agriculture & Farmers Welfare, GoI',
    affectedCrop: 'All Registered Crops',
    locationState: 'Pan-India',
    district: 'All Districts',
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    acknowledged: false,
    resolved: false,
    recommendedScreen: 'financial_risk',
  },
];

const STORAGE_ALERTS_KEY = 'agrosecure_crop_doctor_alerts';

export const CropDoctorService = {
  getAlerts(): CropDoctorAlert[] {
    const raw = localStorage.getItem(STORAGE_ALERTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(INITIAL_CROP_DOCTOR_ALERTS));
      return INITIAL_CROP_DOCTOR_ALERTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CROP_DOCTOR_ALERTS;
    }
  },

  saveAlert(alert: CropDoctorAlert): void {
    const alerts = this.getAlerts();
    const idx = alerts.findIndex((a) => a.id === alert.id);
    if (idx >= 0) {
      alerts[idx] = alert;
    } else {
      alerts.unshift(alert);
    }
    localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(alerts));
  },

  acknowledgeAlert(id: string): void {
    const alerts = this.getAlerts();
    const alert = alerts.find((a) => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(alerts));
    }
  },

  resolveAlert(id: string): void {
    const alerts = this.getAlerts();
    const alert = alerts.find((a) => a.id === id);
    if (alert) {
      alert.resolved = true;
      alert.acknowledged = true;
      localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(alerts));
    }
  },

  addDiagnosisAlert(diseaseName: string, confidence: number, cropName: string): CropDoctorAlert {
    const newAlert: CropDoctorAlert = {
      id: `alert_auto_diag_${Date.now()}`,
      category: 'pest_disease',
      severity: 'critical',
      titleEn: `Field Diagnostic Alert: ${diseaseName} Confirmed (${confidence}%)`,
      titleKn: `ಕ್ಷೇತ್ರ ರೋಗ ಪತ್ತೆ ಎಚ್ಚರಿಕೆ: ${diseaseName} ದೃಢಪಟ್ಟಿದೆ (${confidence}%)`,
      titleHi: `खेत निदान चेतावनी: ${diseaseName} की पुष्टि (${confidence}%)`,
      descriptionEn: `AI Plant Pathology Lab detected high-confidence symptoms of ${diseaseName} on ${cropName}. Immediate containment required to safeguard adjoining acreage.`,
      descriptionKn: `ನಮ್ಮ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಲ್ಯಾಬ್ ${cropName} ನಲ್ಲಿ ${diseaseName} ಲಕ್ಷಣಗಳನ್ನು ಗುರುತಿಸಿದೆ. ಉಳಿದ ಜಮೀನಿಗೆ ಹರಡದಂತೆ ತಕ್ಷಣ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.`,
      descriptionHi: `एआई लैब द्वारा ${cropName} में ${diseaseName} के गंभीर लक्षण पाए गए हैं। बाकी फसल को बचाने के लिए तुरंत उपचार शुरू करें।`,
      actionRequiredEn: 'Inspect surrounding bushes within a 40-meter perimeter. Apply prescribed biocontrol or targeted chemical treatment.',
      actionRequiredKn: 'ಸೋಂಕಿತ ಗಿಡದ ಸುತ್ತಲಿನ 40 ಮೀಟರ್ ವ್ಯಾಪ್ತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಸೂಕ್ತ ಔಷಧ ಸಿಂಪಡಿಸಿ.',
      actionRequiredHi: 'आसपास के 40 मीटर क्षेत्र का निरीक्षण कर तुरंत अनुशंसित कवकनाशी का छिड़काव करें।',
      source: 'AgroSecure AI Crop Detector Lab',
      affectedCrop: cropName,
      date: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
      recommendedScreen: 'crop_detector',
    };
    this.saveAlert(newAlert);
    return newAlert;
  },

  calculateSprayingWindow(weather?: WeatherData): {
    suitability: 'Favorable' | 'Caution' | 'Unfavorable';
    score: number;
    reasons: string[];
  } {
    if (!weather?.current) {
      return {
        suitability: 'Favorable',
        score: 85,
        reasons: ['Calm winds anticipated', 'Adequate leaf drying conditions'],
      };
    }

    const { windSpeed, relativeHumidity, precipitation } = weather.current;
    const reasons: string[] = [];
    let score = 100;

    if (windSpeed > 15) {
      score -= 40;
      reasons.push(`High wind speed (${windSpeed.toFixed(1)} km/h) causes severe chemical spray drift`);
    } else if (windSpeed < 3) {
      reasons.push(`Optimal calm wind conditions (${windSpeed.toFixed(1)} km/h)`);
    }

    if (precipitation > 0.5) {
      score -= 50;
      reasons.push(`Active rainfall (${precipitation} mm) will wash off applied chemicals`);
    }

    if (relativeHumidity > 90) {
      score -= 25;
      reasons.push(`Excessive humidity (${relativeHumidity}%) slows down leaf evaporation and absorption`);
    } else if (relativeHumidity < 40) {
      score -= 20;
      reasons.push(`Low humidity (${relativeHumidity}%) accelerates chemical crystallization`);
    }

    const clampedScore = Math.max(0, Math.min(100, score));
    const suitability = clampedScore >= 70 ? 'Favorable' : clampedScore >= 40 ? 'Caution' : 'Unfavorable';

    return {
      suitability,
      score: clampedScore,
      reasons: reasons.length > 0 ? reasons : ['All agro-meteorological parameters within optimal range'],
    };
  },
};
