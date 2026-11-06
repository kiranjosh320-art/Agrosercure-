import React, { useState } from 'react';
import { ActiveScreen, Farm, Language } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { FarmMap } from '../Map/FarmMap';
import {
  calculateCentroid,
  calculatePolygonAreaSquareMeters,
  sqMetersToAcres,
  sqMetersToHectares,
} from '../../utils/geo';
import {
  MapPin,
  Trash2,
  CheckCircle,
  RotateCcw,
  Plus,
  Crosshair,
  Layers,
  Info,
  Save,
  Globe,
  Search,
  Sparkles,
  Tag,
  Award,
  Sprout,
  AlertTriangle,
} from 'lucide-react';
import { IndiaLocationSearchBar } from '../common/IndiaLocationSearchBar';
import { IndiaLocationResult } from '../../services/indiaLocationService';
import {
  INDIAN_PRIMARY_CROPS,
  INDIAN_CROP_CATEGORIES,
  IndianCropsService,
} from '../../data/indianCropsData';

interface FarmMappingScreenProps {
  farms: Farm[];
  activeFarm?: Farm;
  onSaveFarm: (farm: Farm) => void;
  onDeleteFarm: (farmId: string) => void;
  onSelectFarm: (farmId: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
  language: Language;
}

export const FarmMappingScreen: React.FC<FarmMappingScreenProps> = ({
  farms,
  activeFarm,
  onSaveFarm,
  onDeleteFarm,
  onSelectFarm,
  onNavigate,
  language,
}) => {
  const t = useTranslation(language);

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]); // [lat, lng][]
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);

  // Form Fields for new or edited farm
  const [farmName, setFarmName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [country, setCountry] = useState('India');
  const [stateName, setStateName] = useState('Karnataka');

  // Master Indian Agricultural Crop & Cultivar Selection State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCropId, setSelectedCropId] = useState<string>('crop_rice_paddy');
  const [selectedVarietyId, setSelectedVarietyId] = useState<string>('var_pusa_1121');
  const [isCustomVariety, setIsCustomVariety] = useState(false);
  const [customVarietyName, setCustomVarietyName] = useState('');

  const [cropType, setCropType] = useState('Rice / Paddy');
  const [coffeeVariety, setCoffeeVariety] = useState('Pusa Basmati 1121');
  const [plantingYear, setPlantingYear] = useState(2023);
  const [shadePercent, setShadePercent] = useState(0);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Helper handlers for cascading crop & variety selections
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const availableCrops = cat === 'All' ? INDIAN_PRIMARY_CROPS : IndianCropsService.getCropsByCategory(cat);
    if (availableCrops.length > 0 && !availableCrops.some((c) => c.id === selectedCropId)) {
      const firstCrop = availableCrops[0];
      setSelectedCropId(firstCrop.id);
      setCropType(firstCrop.name);
      if (firstCrop.varieties.length > 0) {
        setSelectedVarietyId(firstCrop.varieties[0].id);
        setCoffeeVariety(firstCrop.varieties[0].name);
        setIsCustomVariety(false);
      }
    }
  };

  const handleCropChange = (cropId: string) => {
    setSelectedCropId(cropId);
    const crop = IndianCropsService.getCropById(cropId);
    if (crop) {
      setCropType(crop.name);
      if (crop.varieties.length > 0) {
        setSelectedVarietyId(crop.varieties[0].id);
        setCoffeeVariety(crop.varieties[0].name);
        setIsCustomVariety(false);
      }
    }
  };

  const handleVarietyChange = (val: string) => {
    if (val === '__custom__') {
      setIsCustomVariety(true);
      setCustomVarietyName('');
    } else {
      setIsCustomVariety(false);
      setSelectedVarietyId(val);
      const crop = IndianCropsService.getCropById(selectedCropId);
      const matched = crop?.varieties.find((v) => v.id === val);
      if (matched) {
        setCoffeeVariety(matched.name);
      }
    }
  };

  // Handle location search selection across India
  const handleSelectIndianLocation = (loc: IndiaLocationResult) => {
    setLocationName(loc.name);
    setStateName(loc.state);
    setCountry(loc.country);
    setMapCenter([loc.latitude, loc.longitude]);

    // Create an initial starter parcel centered at location
    const delta = 0.0022; // ~220m box
    setDrawingPoints([
      [loc.latitude + delta, loc.longitude - delta],
      [loc.latitude + delta, loc.longitude + delta],
      [loc.latitude - delta, loc.longitude + delta],
      [loc.latitude - delta, loc.longitude - delta],
    ]);
    setIsDrawingMode(true);
  };

  // Quick preset coordinates for global coffee regions
  const quickRegions = [
    { name: 'Chikmagalur (Karnataka, India)', lat: 13.4215, lng: 75.7621, country: 'India', state: 'Karnataka' },
    { name: 'Kodagu / Coorg (Karnataka, India)', lat: 12.4589, lng: 75.8234, country: 'India', state: 'Karnataka' },
    { name: 'Huila (Colombia, Andes)', lat: 1.8542, lng: -76.0512, country: 'Colombia', state: 'Huila' },
    { name: 'Yirgacheffe (Ethiopia, Highlands)', lat: 6.1625, lng: 38.2056, country: 'Ethiopia', state: 'SNNPR' },
    { name: 'Cerrado Mineiro (Brazil)', lat: -18.9186, lng: -46.9928, country: 'Brazil', state: 'Minas Gerais' },
    { name: 'Central Highlands (Vietnam)', lat: 12.6667, lng: 108.05, country: 'Vietnam', state: 'Dak Lak' },
  ];

  // Start new farm boundary drawing
  const handleStartDrawing = () => {
    setDrawingPoints([]);
    setIsDrawingMode(true);
    setFarmName('');
    setLocationName('');
  };

  // Complete and save farm boundary
  const handleSaveFarm = (e: React.FormEvent) => {
    e.preventDefault();

    if (drawingPoints.length < 3) {
      setFormError('Please click on the map to mark at least 3 corner boundary points to enclose a land parcel.');
      return;
    }

    if (!farmName.trim()) {
      setFormError('Please enter a name for the farm or estate.');
      return;
    }

    setFormError(null);

    // Convert drawing points [lat, lng] to GeoJSON polygon format [lng, lat]
    const closedPoints = [...drawingPoints];
    if (
      closedPoints[0][0] !== closedPoints[closedPoints.length - 1][0] ||
      closedPoints[0][1] !== closedPoints[closedPoints.length - 1][1]
    ) {
      closedPoints.push(closedPoints[0]);
    }

    const geoJsonCoords: [number, number][] = closedPoints.map((pt) => [pt[1], pt[0]]);
    const centroid = calculateCentroid(geoJsonCoords);
    const sqMeters = calculatePolygonAreaSquareMeters(geoJsonCoords);
    const acres = sqMetersToAcres(sqMeters);
    const hectares = sqMetersToHectares(sqMeters);

    const crop = IndianCropsService.getCropById(selectedCropId);
    const matchedVariety = crop?.varieties.find((v) => v.id === selectedVarietyId);
    const finalVarietyName = isCustomVariety && customVarietyName.trim()
      ? customVarietyName.trim()
      : (matchedVariety ? matchedVariety.name : (coffeeVariety || 'Standard Cultivar'));

    const newFarm: Farm = {
      id: `farm_${Date.now()}`,
      userId: activeFarm?.userId || 'usr_farmer_01',
      name: farmName,
      locationName: locationName || `${stateName}, ${country}`,
      country,
      state: stateName,
      cropType: crop ? crop.name : cropType,
      cropCategory: crop ? crop.category : 'Agriculture',
      cropVariety: finalVarietyName,
      coffeeVariety: finalVarietyName,
      plantingYear: Number(plantingYear),
      shadePercent: Number(shadePercent),
      coordinates: centroid,
      boundaryGeoJson: {
        type: 'Polygon',
        coordinates: [geoJsonCoords],
      },
      areaAcres: acres,
      areaHectares: hectares,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      zones: [
        {
          zoneId: `zone_main_${Date.now()}`,
          name: 'Main Block',
          status: 'healthy',
          ndvi: 0.69,
          ndre: 0.45,
          ndwi: 0.28,
          lat: centroid.lat,
          lng: centroid.lng,
          notes: `Primary parcel of ${finalVarietyName} (${crop?.name || cropType}). Standard healthy vegetative canopy.`,
        },
      ],
    };

    onSaveFarm(newFarm);
    onSelectFarm(newFarm.id);
    setIsDrawingMode(false);
    setDrawingPoints([]);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 4000);
  };

  // Live acreage calculation during drawing
  let liveAcres = 0;
  let liveHa = 0;
  if (drawingPoints.length >= 3) {
    const geoJsonCoords: [number, number][] = drawingPoints.map((pt) => [pt[1], pt[0]]);
    const sqMeters = calculatePolygonAreaSquareMeters(geoJsonCoords);
    liveAcres = sqMetersToAcres(sqMeters);
    liveHa = sqMetersToHectares(sqMeters);
  }

  // Master Indian Agricultural Crop & Cultivar resolution
  const filteredCrops = selectedCategory === 'All'
    ? INDIAN_PRIMARY_CROPS
    : IndianCropsService.getCropsByCategory(selectedCategory);

  const currentCrop = IndianCropsService.getCropById(selectedCropId) || INDIAN_PRIMARY_CROPS[0];
  const activeVariety = currentCrop.varieties.find((v) => v.id === selectedVarietyId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Mode Switch */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t.gpsMapping}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Trace your farm parcel directly on high-resolution ESRI satellite imagery or use GPS auto-locate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isDrawingMode ? (
            <button
              type="button"
              onClick={handleStartDrawing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addFarm} / Draw Boundary</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsDrawingMode(false);
                setDrawingPoints([]);
              }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2.5 rounded-xl transition text-xs"
            >
              Cancel Drawing
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="bg-emerald-100 border border-emerald-400 text-emerald-900 p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Success!</strong> Farm parcel boundaries saved and GeoJSON registered. Satellite NDVI observations are now linked to this parcel.
          </span>
        </div>
      )}

      {formError && (
        <div className="bg-red-50 border border-red-300 text-red-900 p-4 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{formError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFormError(null)}
            className="text-red-700 hover:text-red-950 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Map & Drawing Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 space-y-3">
          {/* India Location Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-emerald-600" />
              Find Any Location Across India to Map Farm Boundaries:
            </span>
            <IndiaLocationSearchBar
              onSelectLocation={handleSelectIndianLocation}
              placeholder="Search any village, taluk, town or district across India (e.g. Sakleshpur, Somwarpet, Wayanad, Munnar, Ooty, Nashik, Ludhiana...)"
              showQuickChips={true}
            />
          </div>

          <FarmMap
            farm={activeFarm}
            allFarms={farms}
            mapCenter={mapCenter}
            isDrawingMode={isDrawingMode}
            drawingPoints={drawingPoints}
            onDrawingPointsChange={setDrawingPoints}
            onSelectFarm={onSelectFarm}
            onLocationSearched={handleSelectIndianLocation}
            language={language}
          />

          {/* Quick Location Jumpers for Global Support */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              Jump to Region:
            </span>
            {quickRegions.map((region) => (
              <button
                key={region.name}
                type="button"
                onClick={() => {
                  setCountry(region.country);
                  setStateName(region.state);
                  if (isDrawingMode) {
                    setDrawingPoints([[region.lat, region.lng]]);
                  }
                }}
                className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg border border-slate-200 transition text-[11px]"
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar: Form or Registered Farms List */}
        <div className="space-y-6">
          {isDrawingMode ? (
            /* Drawing & Registration Form */
            <form
              onSubmit={handleSaveFarm}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4"
            >
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-900 text-base">{t.addFarm}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on the satellite map to trace boundary vertices
                </p>
              </div>

              {/* Live Area Indicator Box */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {t.boundaryAcres}
                </span>
                <div className="text-2xl font-black text-emerald-950">
                  {liveAcres} <span className="text-sm font-semibold">{t.acres}</span>
                </div>
                <div className="text-xs text-emerald-700">
                  {liveHa} {t.hectares} &bull; {drawingPoints.length} {t.boundaryVertices}
                </div>
              </div>

              {/* Form Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.farmNameLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. Giri Shikhara Estate"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.farmLocationLabel}
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Baba Budangiri, Chikmagalur"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              {/* Agricultural Category Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Crop Category / ಬೆಳೆ ವರ್ಗ</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">{filteredCrops.length} crops</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                >
                  <option value="All">All Categories (ಎಲ್ಲಾ ಬೆಳೆಗಳು)</option>
                  {INDIAN_CROP_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Crop & Verified Cultivar Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Primary Crop (ಮುಖ್ಯ ಬೆಳೆ) *</span>
                  </label>
                  <select
                    value={selectedCropId}
                    onChange={(e) => handleCropChange(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                  >
                    {filteredCrops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name} ({c.kannadaName || ''})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Variety / Cultivar (ತಳಿ) *</span>
                  </label>
                  <select
                    value={isCustomVariety ? '__custom__' : selectedVarietyId}
                    onChange={(e) => handleVarietyChange(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-medium"
                  >
                    {currentCrop.varieties.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.durationDays})
                      </option>
                    ))}
                    <option value="__custom__">+ Other / Enter Custom Cultivar</option>
                  </select>
                </div>
              </div>

              {/* Custom Variety Free Text Input */}
              {isCustomVariety && (
                <div className="animate-fade-in bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    Custom Cultivar / Local Indigenous Seed Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={customVarietyName}
                    onChange={(e) => {
                      setCustomVarietyName(e.target.value);
                      setCoffeeVariety(e.target.value);
                    }}
                    placeholder="e.g. Nati Deshi Seed, Local Wild Selection, Farmers Choice"
                    className="w-full text-xs p-2.5 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 bg-white outline-none"
                  />
                </div>
              )}

              {/* ICAR / Board Verified Cultivar Profile Card */}
              {!isCustomVariety && activeVariety && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-emerald-950 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {activeVariety.name}
                      {activeVariety.nameKn && (
                        <span className="text-[10px] text-emerald-800 font-normal">
                          ({activeVariety.nameKn})
                        </span>
                      )}
                    </span>
                    {activeVariety.specialty && (
                      <span className="bg-emerald-200/90 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px] shrink-0">
                        {activeVariety.specialty}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 bg-white/70 p-2 rounded-lg border border-emerald-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">DURATION</span>
                      <strong className="text-slate-800">{activeVariety.durationDays}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">YIELD POTENTIAL</span>
                      <strong className="text-emerald-700">{activeVariety.yieldPotential}</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-snug">
                    {activeVariety.keyFeatures}
                  </p>
                  <div className="text-[10px] text-slate-500 border-t border-emerald-100/80 pt-1 flex items-center justify-between">
                    <span><strong>Breeder:</strong> {activeVariety.breederOrg}</span>
                    <span className="text-emerald-700 font-medium">ICAR / Board Verified</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.plantingYearLabel}
                  </label>
                  <input
                    type="number"
                    value={plantingYear}
                    onChange={(e) => setPlantingYear(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.shadeCanopyLabel}
                  </label>
                  <input
                    type="number"
                    value={shadePercent}
                    onChange={(e) => setShadePercent(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={drawingPoints.length < 3}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition ${
                    drawingPoints.length >= 3
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{t.saveFarm}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDrawingPoints([])}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.resetPoints}</span>
                </button>
              </div>
            </form>
          ) : (
            /* List of Registered Farms */
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  {t.farms} ({farms.length})
                </h3>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Multiple Farms Enabled
                </span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {farms.map((f) => {
                  const isCurrent = f.id === activeFarm?.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => onSelectFarm(f.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-200'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{f.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{f.locationName}</p>
                          <div className="flex flex-wrap items-center gap-1 mt-1.5">
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded">
                              {f.cropType}
                            </span>
                            {(f.cropVariety || f.coffeeVariety) && (
                              <span className="text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                {f.cropVariety || f.coffeeVariety}
                              </span>
                            )}
                            {f.cropCategory && (
                              <span className="text-[9px] font-normal text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                                {f.cropCategory}
                              </span>
                            )}
                          </div>
                        </div>
                        {farms.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to delete ${f.name}?`)) {
                                onDeleteFarm(f.id);
                              }
                            }}
                            title="Delete Farm Boundary"
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-600">
                          <strong>{f.areaAcres}</strong> {t.acres} ({f.areaHectares} {t.hectares})
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {f.coordinates.lat.toFixed(4)}°, {f.coordinates.lng.toFixed(4)}°
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleStartDrawing}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-emerald-400 text-emerald-800 hover:bg-emerald-50 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addFarm}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
