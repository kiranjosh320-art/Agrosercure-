import React, { useState, useEffect } from 'react';
import {
  ActiveScreen,
  CropDiseaseDetection,
  DroneInspection,
  Farm,
  Language,
  NotificationItem,
  SatelliteObservation,
  User,
  WeatherData,
  DroneDevice,
  SatelliteAnomaly,
  DroneInspectionTask,
  DroneImageRecord,
  PlantIdentificationResult,
} from './types';
import { StorageService } from './services/storage';
import { WeatherService } from './services/weather';
import { Navbar } from './components/Navbar';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { FarmMappingScreen } from './components/screens/FarmMappingScreen';
import { SatelliteMonitoringScreen } from './components/screens/SatelliteMonitoringScreen';
import { DiseaseDetectionScreen } from './components/screens/DiseaseDetectionScreen';
import { PlantIdentificationScreen } from './components/screens/PlantIdentificationScreen';
import { DroneIntegrationScreen } from './components/screens/DroneIntegrationScreen';
import { WeatherScreen } from './components/screens/WeatherScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { FarmerBotScreen } from './components/bot/FarmerBotScreen';
import { FarmerBotWidget } from './components/bot/FarmerBotWidget';
import { AuthModal } from './components/auth/AuthModal';
import { AnomalyEngineScreen } from './components/screens/AnomalyEngineScreen';
import { CropDoctorAlertCenterScreen } from './components/screens/CropDoctorAlertCenterScreen';
import { FinancialRiskScreen } from './components/screens/FinancialRiskScreen';

export default function App() {
  // State Initialization from Persistent Storage
  const [user, setUser] = useState<User>(StorageService.getUser());
  const [language, setLanguage] = useState<Language>(() => {
    const saved = (localStorage.getItem('agrosecure_language') || localStorage.getItem('agrovision_language')) as Language | null;
    if (saved && (['en', 'kn', 'hi', 'es'] as string[]).includes(saved)) return saved;
    return user.preferredLanguage || 'kn';
  });
  const [farms, setFarms] = useState<Farm[]>(StorageService.getFarms());
  const [activeFarmId, setActiveFarmId] = useState<string>(StorageService.getActiveFarmId());
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');
  const [botInitialPrompt, setBotInitialPrompt] = useState<string | undefined>(undefined);

  const [satelliteObsList, setSatelliteObsList] = useState<SatelliteObservation[]>(
    StorageService.getSatelliteObservations()
  );
  const [droneInspections, setDroneInspections] = useState<DroneInspection[]>(
    StorageService.getDroneInspections()
  );
  const [diseaseRecords, setDiseaseRecords] = useState<CropDiseaseDetection[]>(
    StorageService.getDiseaseRecords()
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    StorageService.getNotifications()
  );

  // Drone Integration Module States
  const [droneDevice, setDroneDevice] = useState<DroneDevice>(() => StorageService.getDroneDevice());
  const [anomalies, setAnomalies] = useState<SatelliteAnomaly[]>(() => StorageService.getSatelliteAnomalies());
  const [inspectionTasks, setInspectionTasks] = useState<DroneInspectionTask[]>(() => StorageService.getInspectionTasks());
  const [droneImages, setDroneImages] = useState<DroneImageRecord[]>(() => StorageService.getDroneImageRecords());
  const [plantIdentifications, setPlantIdentifications] = useState<PlantIdentificationResult[]>(() =>
    StorageService.getPlantIdentifications()
  );

  const [weather, setWeather] = useState<WeatherData | undefined>(undefined);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Active farm resolver
  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0];
  const activeSatelliteObs = satelliteObsList.find((obs) => obs.farmId === activeFarm?.id) || satelliteObsList[0];
  const activeDroneInsp = droneInspections.find((insp) => insp.farmId === activeFarm?.id) || droneInspections[0];

  // Fetch Live Weather when Active Farm changes
  useEffect(() => {
    if (!activeFarm) return;
    const { lat, lng } = activeFarm.coordinates;
    WeatherService.getFarmWeather(lat, lng)
      .then((data) => setWeather(data))
      .catch((err) => console.warn('Weather fetch error:', err));
  }, [activeFarm?.id, activeFarm?.coordinates.lat, activeFarm?.coordinates.lng]);

  // Farm selection handler
  const handleSelectFarm = (farmId: string) => {
    setActiveFarmId(farmId);
    StorageService.setActiveFarmId(farmId);
  };

  // Farm save handler
  const handleSaveFarm = (farm: Farm) => {
    StorageService.saveFarm(farm);
    const updated = StorageService.getFarms();
    setFarms(updated);
    setActiveFarmId(farm.id);

    // Also auto-generate initial Sentinel-2 observation for this new parcel
    const newObs: SatelliteObservation = {
      id: `sat_obs_${farm.id}_${Date.now()}`,
      farmId: farm.id,
      acquisitionDate: new Date().toISOString(),
      satellite: 'Sentinel-2B',
      cloudCoveragePercent: 4.8,
      tileId: `T${Math.floor((farm.coordinates.lng + 180) / 6) + 1}PFS`,
      sunZenithAngle: 33.2,
      meanNdvi: 0.69,
      meanNdre: 0.45,
      meanNdwi: 0.28,
      healthyAreaPercent: 72.0,
      moderateAreaPercent: 18.0,
      stressedAreaPercent: 10.0,
      dataSource: 'Copernicus Sentinel-2 Level-2A',
    };
    StorageService.saveSatelliteObservation(newObs);
    setSatelliteObsList(StorageService.getSatelliteObservations());
  };

  // Farm delete handler
  const handleDeleteFarm = (farmId: string) => {
    StorageService.deleteFarm(farmId);
    const updated = StorageService.getFarms();
    setFarms(updated);
    setActiveFarmId(StorageService.getActiveFarmId());
  };

  // Drone inspection save
  const handleSaveDroneInspection = (inspection: DroneInspection) => {
    StorageService.saveDroneInspection(inspection);
    setDroneInspections(StorageService.getDroneInspections());
  };

  // Disease detection record save
  const handleSaveDiseaseRecord = (record: CropDiseaseDetection) => {
    StorageService.saveDiseaseRecord(record);
    setDiseaseRecords(StorageService.getDiseaseRecords());

    // Create notification for new detection
    const newNotif: NotificationItem = {
      id: `notif_dis_${Date.now()}`,
      type: 'disease',
      titleEn: `AI Diagnosis: ${record.conditionName}`,
      titleKn: `ಎಐ ರೋಗ ಪತ್ತೆ: ${record.conditionName}`,
      messageEn: `Confidence ${record.confidence}%. Action: ${record.recommendedActions?.chemicalTreatment?.[0] || record.recommendedActions?.immediate?.[0] || 'Inspect field and apply recommended cultural treatment'}`,
      messageKn: `ನಿಖರತೆ ${record.confidence}%. ಶಿಫಾರಸು: ${record.recommendedActions?.chemicalTreatment?.[0] || record.recommendedActions?.immediate?.[0] || 'ತೋಟ ಪರಿಶೀಲಿಸಿ ಸೂಕ್ತ ಚಿಕಿತ್ಸೆ ನೀಡಿ'}`,
      date: new Date().toISOString(),
      read: false,
      severity: record.severity === 'Severe' ? 'critical' : 'warning',
      farmId: activeFarm?.id,
      linkScreen: 'disease_detection',
    };
    const notifs = [newNotif, ...notifications];
    setNotifications(notifs);
  };

  // Drone Integration Handlers
  const handleUpdateDrone = (device: DroneDevice) => {
    StorageService.saveDroneDevice(device);
    setDroneDevice(device);
  };

  const handleUpdateAnomalies = (anomList: SatelliteAnomaly[]) => {
    StorageService.saveSatelliteAnomalies(anomList);
    setAnomalies(anomList);
  };

  const handleUpdateTasks = (tasksList: DroneInspectionTask[]) => {
    StorageService.saveInspectionTasks(tasksList);
    setInspectionTasks(tasksList);
  };

  const handleUpdateImages = (imgList: DroneImageRecord[]) => {
    StorageService.saveDroneImageRecords(imgList);
    setDroneImages(imgList);
  };

  // Plant Identification Handlers
  const handleSavePlantIdentification = (record: PlantIdentificationResult) => {
    StorageService.savePlantIdentification(record);
    setPlantIdentifications(StorageService.getPlantIdentifications());
  };

  const handleDeletePlantIdentification = (id: string) => {
    StorageService.deletePlantIdentification(id);
    setPlantIdentifications(StorageService.getPlantIdentifications());
  };

  // Select or Change Language
  const handleSelectLanguage = (newLang: Language) => {
    setLanguage(newLang);
    const updatedUser = { ...user, preferredLanguage: newLang };
    setUser(updatedUser);
    StorageService.setUser(updatedUser);
    localStorage.setItem('agrovision_language', newLang);
  };

  // Toggle Language
  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'kn' : 'en';
    handleSelectLanguage(nextLang);
  };

  // Reset to default sample seed
  const handleResetDefaults = () => {
    StorageService.resetAllToDefaults();
    setUser(StorageService.getUser());
    setFarms(StorageService.getFarms());
    setActiveFarmId(StorageService.getActiveFarmId());
    setSatelliteObsList(StorageService.getSatelliteObservations());
    setDroneInspections(StorageService.getDroneInspections());
    setDiseaseRecords(StorageService.getDiseaseRecords());
    setNotifications(StorageService.getNotifications());
    setDroneDevice(StorageService.getDroneDevice());
    setAnomalies(StorageService.getSatelliteAnomalies());
    setInspectionTasks(StorageService.getInspectionTasks());
    setDroneImages(StorageService.getDroneImageRecords());
    setPlantIdentifications(StorageService.getPlantIdentifications());
    setActiveScreen('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Main Navigation */}
      <Navbar
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onSelectLanguage={handleSelectLanguage}
        farms={farms}
        activeFarm={activeFarm}
        onSelectFarm={handleSelectFarm}
        notifications={notifications}
        onMarkNotificationRead={(id) => {
          StorageService.markNotificationRead(id);
          setNotifications(StorageService.getNotifications());
        }}
        onMarkAllNotificationsRead={() => {
          StorageService.markAllNotificationsRead();
          setNotifications(StorageService.getNotifications());
        }}
        user={user}
        onLogout={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeScreen === 'welcome' && (
          <WelcomeScreen onNavigate={setActiveScreen} language={language} />
        )}

        {activeScreen === 'dashboard' && (
          <DashboardScreen
            activeFarm={activeFarm}
            allFarms={farms}
            onSelectFarm={handleSelectFarm}
            satelliteObs={activeSatelliteObs}
            droneInspection={activeDroneInsp}
            droneDevice={droneDevice}
            anomalies={anomalies}
            inspectionTasks={inspectionTasks}
            droneImages={droneImages}
            recentDetections={diseaseRecords}
            notifications={notifications}
            weather={weather}
            onNavigate={setActiveScreen}
            language={language}
          />
        )}

        {activeScreen === 'farmer_bot' && (
          <FarmerBotScreen
            user={user}
            activeFarm={activeFarm}
            weather={weather}
            satelliteObs={activeSatelliteObs}
            recentDetections={diseaseRecords}
            initialPrompt={botInitialPrompt}
            onNavigate={setActiveScreen}
            language={language}
          />
        )}

        {activeScreen === 'crop_detector' && (
          <PlantIdentificationScreen
            activeFarm={activeFarm}
            language={language}
            onNavigate={setActiveScreen}
            onAskBotWithPrompt={(prompt) => {
              setBotInitialPrompt(prompt);
              setActiveScreen('farmer_bot');
            }}
            savedIdentifications={plantIdentifications}
            onSaveIdentification={handleSavePlantIdentification}
            onDeleteIdentification={handleDeletePlantIdentification}
          />
        )}

        {activeScreen === 'disease_detection' && (
          <DiseaseDetectionScreen
            activeFarm={activeFarm}
            onSaveDetectionRecord={handleSaveDiseaseRecord}
            detectionHistory={diseaseRecords}
            onNavigate={setActiveScreen}
            onAskBotWithPrompt={(prompt) => {
              setBotInitialPrompt(prompt);
              setActiveScreen('farmer_bot');
            }}
            language={language}
          />
        )}

        {activeScreen === 'anomaly_engine' && (
          <AnomalyEngineScreen
            activeFarm={activeFarm}
            farms={farms}
            anomalies={anomalies}
            droneDevice={droneDevice}
            inspectionTasks={inspectionTasks}
            droneImages={droneImages}
            onUpdateAnomalies={handleUpdateAnomalies}
            onUpdateTasks={handleUpdateTasks}
            onNavigate={setActiveScreen}
            language={language}
          />
        )}

        {activeScreen === 'alert_center' && (
          <CropDoctorAlertCenterScreen
            activeFarm={activeFarm}
            weather={weather}
            onNavigate={setActiveScreen}
            onAskBotWithPrompt={(prompt) => {
              setBotInitialPrompt(prompt);
              setActiveScreen('farmer_bot');
            }}
            language={language}
          />
        )}

        {activeScreen === 'financial_risk' && (
          <FinancialRiskScreen
            activeFarm={activeFarm}
            anomalies={anomalies}
            diseaseRecords={diseaseRecords}
            weather={weather}
            onNavigate={setActiveScreen}
            language={language}
          />
        )}

        {(activeScreen === 'mapping' || activeScreen === 'add_farm') && (
          <FarmMappingScreen
            farms={farms}
            activeFarm={activeFarm}
            onSaveFarm={handleSaveFarm}
            onDeleteFarm={handleDeleteFarm}
            onSelectFarm={handleSelectFarm}
            onNavigate={setActiveScreen}
            language={language}
          />
        )}

        {(activeScreen === 'satellite' || activeScreen === 'crop_health') && (
          <SatelliteMonitoringScreen
            farm={activeFarm}
            allFarms={farms}
            observations={satelliteObsList}
            activeObservation={activeSatelliteObs}
            onSelectObservation={(obs) => {}}
            onSelectFarm={handleSelectFarm}
            language={language}
          />
        )}

        {(activeScreen === 'drone' || activeScreen === 'drone_integration') && (
          <DroneIntegrationScreen
            farm={activeFarm}
            allFarms={farms}
            onSelectFarm={handleSelectFarm}
            droneDevice={droneDevice}
            onUpdateDrone={handleUpdateDrone}
            anomalies={anomalies}
            onUpdateAnomalies={handleUpdateAnomalies}
            inspectionTasks={inspectionTasks}
            onUpdateTasks={handleUpdateTasks}
            droneImages={droneImages}
            onUpdateImages={handleUpdateImages}
            satelliteObs={activeSatelliteObs}
            onNavigate={setActiveScreen}
            language={language}
          />
        )}

        {activeScreen === 'weather' && (
          <WeatherScreen
            farm={activeFarm}
            weather={weather}
            onRefreshWeather={() => {
              if (activeFarm) {
                WeatherService.getFarmWeather(activeFarm.coordinates.lat, activeFarm.coordinates.lng).then(
                  (d) => setWeather(d)
                );
              }
            }}
            language={language}
          />
        )}

        {activeScreen === 'reports' && (
          <ReportsScreen
            farm={activeFarm}
            satelliteObs={activeSatelliteObs}
            droneInspection={activeDroneInsp}
            diseaseDetections={diseaseRecords}
            weather={weather}
            language={language}
          />
        )}

        {activeScreen === 'notifications' && (
          <NotificationsScreen
            notifications={notifications}
            onMarkRead={(id) => {
              StorageService.markNotificationRead(id);
              setNotifications(StorageService.getNotifications());
            }}
            onMarkAllRead={() => {
              StorageService.markAllNotificationsRead();
              setNotifications(StorageService.getNotifications());
            }}
            onNavigate={setActiveScreen}
            language={language}
          />
        )}

        {activeScreen === 'profile' && (
          <ProfileScreen
            user={user}
            onUpdateUser={(updated) => {
              setUser(updated);
              StorageService.setUser(updated);
              setLanguage(updated.preferredLanguage);
            }}
            onResetDefaults={handleResetDefaults}
            language={language}
          />
        )}
      </main>

      {/* Floating Farmer AI Companion Widget (Kisan Mitra) */}
      <FarmerBotWidget
        user={user}
        activeFarm={activeFarm}
        weather={weather}
        satelliteObs={activeSatelliteObs}
        recentDetections={diseaseRecords}
        currentScreen={activeScreen}
        onNavigate={setActiveScreen}
        language={language}
      />

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-800">AgroVision AI</span>
            <span>&bull;</span>
            <span>Global Agricultural Health &amp; Crop Disease Diagnostic System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Sentinel-2 Level-2A BOA</span>
            <span>&bull;</span>
            <span>Gemini 3.8 Flash Vision</span>
            <span>&bull;</span>
            <span>Open-Meteo Weather</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(logged) => {
          setUser(logged);
          StorageService.setUser(logged);
          setLanguage(logged.preferredLanguage);
        }}
        language={language}
      />
    </div>
  );
}
