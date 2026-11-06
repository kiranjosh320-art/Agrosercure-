import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Farm,
  SatelliteObservation,
  DroneInspection,
  Language,
  SatelliteAnomaly,
  DroneInspectionTask,
  DroneImageRecord,
} from '../../types';
import { calculatePolygonAreaSquareMeters, sqMetersToAcres, sqMetersToHectares } from '../../utils/geo';
import { useTranslation } from '../../i18n/translations';
import {
  Layers,
  MapPin,
  Eye,
  Plane,
  AlertTriangle,
  CheckCircle,
  Crosshair,
  Camera,
  Search,
  X,
  Loader2,
  Navigation,
  Globe,
  Sparkles,
} from 'lucide-react';
import { IndiaLocationResult, IndiaLocationService } from '../../services/indiaLocationService';

interface FarmMapProps {
  farm?: Farm;
  allFarms?: Farm[];
  mapCenter?: [number, number]; // [lat, lng]
  isDrawingMode?: boolean;
  drawingPoints?: [number, number][]; // [lat, lng][]
  onDrawingPointsChange?: (points: [number, number][]) => void;
  showNdviOverlay?: boolean;
  showDroneOverlay?: boolean;
  satelliteObs?: SatelliteObservation;
  droneInspection?: DroneInspection;
  anomalies?: SatelliteAnomaly[];
  inspectionTasks?: DroneInspectionTask[];
  droneImages?: DroneImageRecord[];
  onSelectFarm?: (farmId: string) => void;
  onSendForInspection?: (anomaly: SatelliteAnomaly) => void;
  onLocationSearched?: (location: IndiaLocationResult) => void;
  enableMapSearch?: boolean;
  language: Language;
}

export const FarmMap: React.FC<FarmMapProps> = ({
  farm,
  allFarms = [],
  mapCenter,
  isDrawingMode = false,
  drawingPoints = [],
  onDrawingPointsChange,
  showNdviOverlay = false,
  showDroneOverlay = false,
  satelliteObs,
  droneInspection,
  anomalies = [],
  inspectionTasks = [],
  droneImages = [],
  onSelectFarm,
  onSendForInspection,
  onLocationSearched,
  enableMapSearch = true,
  language,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const overlayLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<any>(null);

  const [activeTileType, setActiveTileType] = useState<'satellite' | 'street'>('satellite');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IndiaLocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<IndiaLocationResult | null>(null);
  const t = useTranslation(language);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = farm?.coordinates.lat || 13.4215;
    const initialLng = farm?.coordinates.lng || 75.7621;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: true,
    });

    // Default to ESRI Satellite imagery
    const satLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics, CNES/Airbus DS',
        maxZoom: 19,
      }
    ).addTo(map);

    tileLayerRef.current = satLayer;
    polygonLayerGroupRef.current = L.layerGroup().addTo(map);
    overlayLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Tile Type Switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    map.removeLayer(tileLayerRef.current);

    if (activeTileType === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
          maxZoom: 19,
        }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }
      ).addTo(map);
    }
  }, [activeTileType]);

  // Center on active farm when changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !farm || isDrawingMode) return;

    map.setView([farm.coordinates.lat, farm.coordinates.lng], 16, { animate: true });
  }, [farm?.id, isDrawingMode]);

  // Center on mapCenter when requested (e.g. from Indian location search bar)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapCenter) return;
    map.setView(mapCenter, 16, { animate: true });
  }, [mapCenter?.[0], mapCenter?.[1]]);

  // Handle Drawing Mode Click Listener
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    function handleMapClick(e: L.LeafletMouseEvent) {
      if (!isDrawingMode || !onDrawingPointsChange) return;
      const newPt: [number, number] = [Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6))];
      onDrawingPointsChange([...drawingPoints, newPt]);
    }

    if (isDrawingMode) {
      map.on('click', handleMapClick);
    }

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawingMode, drawingPoints, onDrawingPointsChange]);

  // Render Polygons and Map Features
  useEffect(() => {
    const map = mapInstanceRef.current;
    const polyGroup = polygonLayerGroupRef.current;
    const overlayGroup = overlayLayerGroupRef.current;
    if (!map || !polyGroup || !overlayGroup) return;

    polyGroup.clearLayers();
    overlayGroup.clearLayers();

    // 1. If in Drawing Mode, draw vertex markers and boundary outline
    if (isDrawingMode) {
      if (drawingPoints.length > 0) {
        drawingPoints.forEach((pt, index) => {
          const marker = L.circleMarker(pt, {
            radius: 6,
            fillColor: '#10b981',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          });
          marker.bindTooltip(`Point #${index + 1}`, { permanent: false });
          polyGroup.addLayer(marker);
        });

        if (drawingPoints.length > 1) {
          const polyline = L.polyline(drawingPoints, {
            color: '#10b981',
            weight: 3,
            dashArray: '5, 8',
          });
          polyGroup.addLayer(polyline);
        }

        if (drawingPoints.length >= 3) {
          const polygon = L.polygon(drawingPoints, {
            color: '#059669',
            fillColor: '#34d399',
            fillOpacity: 0.35,
            weight: 3,
          });
          polyGroup.addLayer(polygon);
        }
      }
      return;
    }

    // 2. Render all farms or active farm
    const farmsToRender = allFarms.length > 0 ? allFarms : farm ? [farm] : [];

    farmsToRender.forEach((f) => {
      const isCurrentActive = farm?.id === f.id;
      const coords = f.boundaryGeoJson.coordinates[0];
      if (!coords || coords.length < 3) return;

      // Leaflet expects [lat, lng] while GeoJSON uses [lng, lat]
      const leafletCoords: [number, number][] = coords.map((c) => [c[1], c[0]]);

      const polygon = L.polygon(leafletCoords, {
        color: isCurrentActive ? '#10b981' : '#64748b',
        fillColor: isCurrentActive ? '#059669' : '#94a3b8',
        fillOpacity: isCurrentActive ? 0.35 : 0.15,
        weight: isCurrentActive ? 3.5 : 2,
      });

      polygon.bindPopup(`
        <div class="p-1 font-sans">
          <div class="text-xs uppercase font-bold text-emerald-800 tracking-wider">${f.cropType}</div>
          <h4 class="font-bold text-slate-900 text-sm mt-0.5">${f.name}</h4>
          <p class="text-xs text-slate-600 mt-1">${f.locationName}, ${f.country}</p>
          <div class="mt-2 text-xs flex gap-3 text-slate-700">
            <span><strong>${f.areaAcres}</strong> ${t.acres}</span>
            <span><strong>${f.areaHectares}</strong> ${t.hectares}</span>
          </div>
        </div>
      `);

      polygon.on('click', () => {
        if (onSelectFarm && f.id !== farm?.id) {
          onSelectFarm(f.id);
        }
      });

      polyGroup.addLayer(polygon);

      // Centroid Pin
      const centerMarker = L.marker([f.coordinates.lat, f.coordinates.lng], {
        icon: L.divIcon({
          className: 'custom-farm-pin',
          html: `
            <div class="flex items-center justify-center w-8 h-8 rounded-full ${
              isCurrentActive ? 'bg-emerald-600 shadow-lg ring-4 ring-emerald-300' : 'bg-slate-700'
            } text-white font-bold text-xs">
              🌾
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      });
      polyGroup.addLayer(centerMarker);
    });

    // 3. Render NDVI Heatmap Overlay if toggled
    if (showNdviOverlay && farm?.zones) {
      farm.zones.forEach((zone) => {
        let zoneColor = '#10b981'; // healthy
        let label = 'Healthy (>0.6)';
        if (zone.status === 'stressed') {
          zoneColor = '#ef4444';
          label = 'Stressed (<0.45)';
        } else if (zone.status === 'moderate') {
          zoneColor = '#f59e0b';
          label = 'Moderate (0.45-0.6)';
        }

        const zoneCircle = L.circle([zone.lat, zone.lng], {
          radius: 45,
          color: zoneColor,
          fillColor: zoneColor,
          fillOpacity: 0.65,
          weight: 2,
        });

        zoneCircle.bindPopup(`
          <div class="p-1">
            <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase text-white" style="background-color: ${zoneColor}">
              ${zone.status}
            </span>
            <h5 class="font-bold text-slate-800 text-xs mt-1">${zone.name}</h5>
            <p class="text-xs text-slate-600 mt-0.5">NDVI: <strong>${zone.ndvi}</strong> | NDRE: <strong>${zone.ndre}</strong></p>
            <p class="text-[11px] text-slate-500 mt-1 italic">${zone.notes}</p>
          </div>
        `);

        overlayGroup.addLayer(zoneCircle);
      });
    }

    // 4. Render Drone Survey Waypoints and Tagged Bushes if toggled
    if (showDroneOverlay && droneInspection) {
      // Flight path polyline
      const pathPoints: [number, number][] = droneInspection.waypoints.map((wp) => [wp.lat, wp.lng]);
      if (pathPoints.length > 1) {
        const dronePath = L.polyline(pathPoints, {
          color: '#3b82f6',
          weight: 2.5,
          dashArray: '6, 6',
        });
        overlayGroup.addLayer(dronePath);
      }

      // Drone waypoints
      droneInspection.waypoints.forEach((wp, idx) => {
        const isFlagged = wp.status === 'flagged';
        const wpMarker = L.circleMarker([wp.lat, wp.lng], {
          radius: isFlagged ? 8 : 5,
          fillColor: isFlagged ? '#dc2626' : '#2563eb',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.9,
        });
        wpMarker.bindTooltip(`WP #${idx + 1} (${wp.altitudeMeters}m AGL)`, { permanent: false });
        overlayGroup.addLayer(wpMarker);
      });

      // Tagged individual coffee plants
      droneInspection.taggedPlants.forEach((plant) => {
        const isRust = plant.healthStatus.includes('Rust');
        const marker = L.marker([plant.lat, plant.lng], {
          icon: L.divIcon({
            className: 'custom-plant-pin',
            html: `
              <div class="flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold shadow ${
                isRust ? 'bg-red-600 animate-pulse' : 'bg-emerald-600'
              }">
                ${isRust ? '⚠️' : '🌱'}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        });

        marker.bindPopup(`
          <div class="p-1">
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isRust ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
            }">${plant.tagNumber}</span>
            <div class="font-bold text-xs text-slate-800 mt-1">${plant.healthStatus}</div>
            <p class="text-[11px] text-slate-600 mt-1">${plant.notes}</p>
          </div>
        `);

        overlayGroup.addLayer(marker);
      });
    }

    // 5. Render Satellite Crop Anomalies (Suspicious Zones flagged by Sentinel-2)
    if (anomalies && anomalies.length > 0) {
      anomalies.forEach((anom) => {
        const isDispatched = anom.inspection_status === 'dispatched';
        const isInspected = anom.inspection_status === 'inspected';
        const isCritical = anom.severity === 'Critical' || anom.severity === 'High';

        const anomalyIcon = L.divIcon({
          className: 'custom-anomaly-pin',
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute w-8 h-8 rounded-full ${
                isInspected ? 'bg-emerald-400/40' : isCritical ? 'bg-red-500/40 animate-ping' : 'bg-amber-400/40 animate-ping'
              }"></span>
              <div class="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-lg ${
                isInspected ? 'bg-emerald-600' : isCritical ? 'bg-red-600' : 'bg-amber-600'
              }">
                ${isInspected ? '✓' : '⚠️'}
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const anomMarker = L.marker([anom.latitude, anom.longitude], { icon: anomalyIcon });

        anomMarker.bindPopup(`
          <div class="p-1.5 font-sans min-w-[200px]">
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }">${anom.severity} Risk Anomaly</span>
              <span class="text-[10px] text-slate-500 font-mono">${anom.anomaly_id}</span>
            </div>
            <h4 class="font-bold text-slate-900 text-xs">${anom.anomaly_type.replace('_', ' ')}</h4>
            <p class="text-[11px] text-slate-600 mt-1">${anom.description}</p>
            <div class="mt-2 pt-2 border-t border-slate-100 text-[11px] space-y-1">
              <div class="flex justify-between text-slate-700">
                <span>Vegetation Drop:</span>
                <strong class="text-red-600">-${anom.drop_percentage}% (${anom.vegetation_index})</strong>
              </div>
              <div class="flex justify-between text-slate-500 text-[10px]">
                <span>Status:</span>
                <span class="capitalize font-semibold text-emerald-800">${anom.inspection_status}</span>
              </div>
            </div>
          </div>
        `);

        overlayGroup.addLayer(anomMarker);
      });
    }

    // 6. Render Geotagged Drone Images
    if (droneImages && droneImages.length > 0) {
      droneImages.forEach((img) => {
        const camPin = L.divIcon({
          className: 'custom-drone-photo-pin',
          html: `
            <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shadow-md border-2 border-white hover:scale-125 transition-transform">
              📷
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const imgMarker = L.marker([img.latitude, img.longitude], { icon: camPin });

        imgMarker.bindPopup(`
          <div class="p-1 font-sans max-w-[220px]">
            <div class="rounded-lg overflow-hidden mb-1.5 border border-slate-200">
              <img src="${img.image_url}" alt="Drone capture" class="w-full h-24 object-cover" />
            </div>
            <div class="flex justify-between items-center text-[10px] text-slate-500 mb-1">
              <span class="font-bold text-blue-700 uppercase">${img.camera_type} Camera</span>
              <span>${img.altitude}m AGL</span>
            </div>
            ${
              img.ai_analysis
                ? `
              <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-[10px]">
                <strong class="text-slate-800 block">${img.ai_analysis.condition_name}</strong>
                <span class="text-emerald-700 font-bold">Confidence: ${img.ai_analysis.confidence}%</span>
                <p class="text-[9px] text-amber-800 mt-1 italic">${img.ai_analysis.verification_warning}</p>
              </div>
            `
                : ''
            }
          </div>
        `);

        overlayGroup.addLayer(imgMarker);
      });
    }
  }, [farm, allFarms, isDrawingMode, drawingPoints, showNdviOverlay, showDroneOverlay, droneInspection, anomalies, inspectionTasks, droneImages]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search Input Change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setSearchOpen(true);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await IndiaLocationService.searchAnyLocation(val);
        setSearchResults(results);
      } catch (err) {
        console.warn('Map search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
  };

  // Handle Select Location from Search Bar
  const handleSelectSearchedLocation = (loc: IndiaLocationResult) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setSearchedLocation(loc);
    setSearchQuery(loc.name);
    setSearchOpen(false);

    // Fly map smoothly to the selected location
    map.flyTo([loc.latitude, loc.longitude], 16, {
      animate: true,
      duration: 1.2,
    });

    // Remove previous search pin if any
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }

    // Drop new pulsating search pin marker
    const searchPinIcon = L.divIcon({
      className: 'custom-search-pin',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full">
          <span class="absolute w-10 h-10 rounded-full bg-emerald-500/40 animate-ping"></span>
          <div class="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold shadow-2xl ring-4 ring-white border-2 border-emerald-900">
            📍
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [0, 0],
    });

    const marker = L.marker([loc.latitude, loc.longitude], { icon: searchPinIcon }).addTo(map);

    const popupHtml = `
      <div class="p-1 font-sans min-w-[200px]">
        <div class="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">${loc.country}</div>
        <h4 class="font-bold text-slate-900 text-sm mt-0.5">${loc.name}</h4>
        <p class="text-xs text-slate-600 mt-0.5">${loc.district ? `${loc.district}, ` : ''}${loc.state}</p>
        ${loc.specialty ? `<div class="mt-1.5 text-[11px] text-emerald-700 font-medium bg-emerald-50 p-1 rounded border border-emerald-200">${loc.specialty}</div>` : ''}
        <div class="mt-2 text-[10px] text-slate-500 flex justify-between border-t border-slate-100 pt-1.5">
          <span>${loc.elevation ? `${loc.elevation} m MSL` : ''}</span>
          <span>${loc.latitude.toFixed(4)}°, ${loc.longitude.toFixed(4)}°</span>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml).openPopup();
    searchMarkerRef.current = marker;

    if (onLocationSearched) {
      onLocationSearched(loc);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchedLocation(null);
    setSearchOpen(false);
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }
  };

  // Geolocation trigger
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17);

          if (isDrawingMode && onDrawingPointsChange) {
            onDrawingPointsChange([...drawingPoints, [Number(latitude.toFixed(6)), Number(longitude.toFixed(6))]]);
          }
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Drawing mode live area calculation
  let currentDrawingAreaAcres = 0;
  let currentDrawingAreaHa = 0;
  if (drawingPoints.length >= 3) {
    // Convert to [lng, lat] for calculation
    const lngLatPoints: [number, number][] = drawingPoints.map((pt) => [pt[1], pt[0]]);
    const sqMeters = calculatePolygonAreaSquareMeters(lngLatPoints);
    currentDrawingAreaAcres = sqMetersToAcres(sqMeters);
    currentDrawingAreaHa = sqMetersToHectares(sqMeters);
  }

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow-md border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* In-Map Universal Location Search Bar (Top-Left) */}
      {enableMapSearch && (
        <div
          ref={searchContainerRef}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          className="absolute top-4 left-4 z-20 w-[calc(100%-120px)] sm:w-80 md:w-96"
        >
          <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
            <div className="pl-3.5 pr-1.5 text-emerald-700 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onFocus={() => {
                setSearchOpen(true);
                if (!searchQuery.trim()) {
                  IndiaLocationService.searchAnyLocation('').then((r) => setSearchResults(r));
                }
              }}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search any location on map (India, Global, or Lat, Lng)..."
              className="w-full bg-transparent py-2.5 pr-8 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {isSearching && <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin mr-1" />}
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick preset chips when input focused but empty */}
          {searchOpen && !searchQuery.trim() && (
            <div className="mt-1 bg-white/95 backdrop-blur-md rounded-xl p-2 shadow-xl border border-slate-200 text-[11px] animate-in fade-in zoom-in-95">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 px-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Quick Agricultural Locations:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {[
                  { name: 'Chikkamagaluru', lat: 13.3223, lng: 75.774, state: 'Karnataka', country: 'India' },
                  { name: 'Coorg (Madikeri)', lat: 12.4244, lng: 75.7382, state: 'Karnataka', country: 'India' },
                  { name: 'Sakleshpur', lat: 12.9734, lng: 75.7865, state: 'Karnataka', country: 'India' },
                  { name: 'Wayanad', lat: 11.608, lng: 76.082, state: 'Kerala', country: 'India' },
                  { name: 'Araku Valley', lat: 18.3333, lng: 82.8833, state: 'Andhra Pradesh', country: 'India' },
                  { name: 'Huila (Colombia)', lat: 1.8542, lng: -76.0512, state: 'Huila', country: 'Colombia' },
                  { name: 'Cerrado (Brazil)', lat: -18.9439, lng: -46.9931, state: 'Minas Gerais', country: 'Brazil' },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      handleSelectSearchedLocation({
                        id: `preset_${preset.name}`,
                        name: preset.name,
                        state: preset.state,
                        country: preset.country,
                        latitude: preset.lat,
                        longitude: preset.lng,
                        elevation: 1000,
                        specialty: `${preset.country} Agricultural Hub`,
                      })
                    }
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 text-slate-700 transition text-[10px] font-medium"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Autocomplete Results Dropdown */}
          {searchOpen && searchQuery.trim() && (
            <div className="mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs animate-in fade-in zoom-in-95">
              <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-500 flex justify-between items-center">
                <span>Matching locations for "{searchQuery}"</span>
                <span className="text-slate-400">{searchResults.length} found</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <MapPin className="w-5 h-5 mx-auto text-slate-300 mb-1" />
                  <p className="font-semibold text-slate-700 text-xs">No matching locations found</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Tip: Try entering town, district, country, or coordinates like "13.42, 75.76"
                  </p>
                </div>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSearchedLocation(item)}
                    className="w-full text-left p-2.5 hover:bg-emerald-50/80 transition flex items-start justify-between gap-2 group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 transition">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 group-hover:text-emerald-950 text-xs">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {item.state}, {item.country}
                          </span>
                        </div>
                        {item.specialty && (
                          <p className="text-[10px] text-emerald-800 font-medium mt-0.5 line-clamp-1">
                            {item.specialty}
                          </p>
                        )}
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {item.latitude.toFixed(3)}°, {item.longitude.toFixed(3)}° &bull; {item.elevation}m MSL
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-emerald-700 font-bold text-[10px] opacity-0 group-hover:opacity-100 transition self-center">
                      Fly Here &rarr;
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Map Control Overlay Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Layer Switcher */}
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200 flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTileType('satellite')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTileType === 'satellite'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {t.switchToSatelliteLayer}
          </button>
          <button
            type="button"
            onClick={() => setActiveTileType('street')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTileType === 'street'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            {t.switchToMapLayer}
          </button>
        </div>

        {/* Detect Location Button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          title={t.detectMyLocation}
          className="bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 flex items-center justify-center gap-2 text-xs font-semibold hover:text-emerald-700 transition"
        >
          <Crosshair className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">{t.detectMyLocation}</span>
        </button>
      </div>

      {/* Drawing Mode Info Banner */}
      {isDrawingMode && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <p className="text-xs font-semibold text-emerald-300">{t.clickMapToDraw}</p>
              <p className="text-[11px] text-slate-300">
                {t.boundaryVertices}: <strong className="text-white">{drawingPoints.length}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">{t.boundaryAcres}: </span>
              <strong className="text-emerald-400 text-sm">{currentDrawingAreaAcres}</strong> {t.acres} (
              {currentDrawingAreaHa} {t.hectares})
            </div>
          </div>
        </div>
      )}

      {/* Legend when NDVI or Drone is active */}
      {!isDrawingMode && (showNdviOverlay || showDroneOverlay) && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 text-xs">
          {showNdviOverlay && (
            <div className="mb-1.5">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                Sentinel-2 NDVI Health Scale
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  &gt;0.6 Dense
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  0.4-0.6 Moderate
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  &lt;0.4 Stressed
                </span>
              </div>
            </div>
          )}

          {showDroneOverlay && (
            <div className="pt-1.5 border-t border-slate-200">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-blue-600" />
                Drone Flight & Tagged Bushes
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Waypoint
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> Flagged Bush
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /> Healthy Bush
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
