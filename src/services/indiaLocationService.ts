/**
 * India Location Geocoding & Agricultural Hub Service
 * Provides instant lookup and live Open-Meteo geocoding across all Indian states and districts.
 */

export interface IndiaLocationResult {
  id: string | number;
  name: string;
  district?: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation: number;
  specialty?: string;
}

/**
 * Curated offline directory of 50+ major agricultural districts, taluks, and plantation hubs across India
 * for instant zero-latency responses.
 */
export const POPULAR_INDIAN_AGRI_LOCATIONS: IndiaLocationResult[] = [
  // Karnataka (Coffee, Arecanut, Spices, Ragi, Cotton, Sugarcane)
  {
    id: 'in_chikkamagaluru',
    name: 'Chikkamagaluru',
    district: 'Chikkamagaluru',
    state: 'Karnataka',
    country: 'India',
    latitude: 13.3223,
    longitude: 75.7740,
    elevation: 1042,
    specialty: 'Coffee, Black Pepper, Cardamom',
  },
  {
    id: 'in_sakleshpur',
    name: 'Sakleshpur',
    district: 'Hassan',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.9734,
    longitude: 75.7865,
    elevation: 956,
    specialty: 'High-Rainfall Arabica & Robusta Coffee, Cardamom',
  },
  {
    id: 'in_madikeri',
    name: 'Madikeri (Coorg)',
    district: 'Kodagu',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.4244,
    longitude: 75.7382,
    elevation: 1150,
    specialty: 'Robusta & Arabica Coffee, Coorg Orange, Pepper',
  },
  {
    id: 'in_somwarpet',
    name: 'Somwarpet',
    district: 'Kodagu',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.5972,
    longitude: 75.8647,
    elevation: 1027,
    specialty: 'Shade-Grown Plantation Crops & Ginger',
  },
  {
    id: 'in_thirthahalli',
    name: 'Thirthahalli',
    district: 'Shivamogga',
    state: 'Karnataka',
    country: 'India',
    latitude: 13.6934,
    longitude: 75.2392,
    elevation: 610,
    specialty: 'Arecanut (Supari), Paddy, Spices',
  },
  {
    id: 'in_shivamogga',
    name: 'Shivamogga',
    district: 'Shivamogga',
    state: 'Karnataka',
    country: 'India',
    latitude: 13.9299,
    longitude: 75.5681,
    elevation: 580,
    specialty: 'Paddy Rice, Sugarcane, Areca, Ginger',
  },
  {
    id: 'in_dharwad',
    name: 'Dharwad',
    district: 'Dharwad',
    state: 'Karnataka',
    country: 'India',
    latitude: 15.4589,
    longitude: 75.0078,
    elevation: 750,
    specialty: 'Millets, Cotton, Groundnut, Soybean',
  },
  {
    id: 'in_belagavi',
    name: 'Belagavi',
    district: 'Belagavi',
    state: 'Karnataka',
    country: 'India',
    latitude: 15.8497,
    longitude: 74.4977,
    elevation: 762,
    specialty: 'Sugarcane, Vegetables, Paddy, Maize',
  },
  {
    id: 'in_mysuru',
    name: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.2958,
    longitude: 76.6394,
    elevation: 770,
    specialty: 'Ragi, Sugarcane, Pulses, Banana',
  },
  {
    id: 'in_mandya',
    name: 'Mandya (Sugar City)',
    district: 'Mandya',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.5218,
    longitude: 76.8951,
    elevation: 678,
    specialty: 'Sugarcane, Irrigated Paddy, Mulberry / Sericulture',
  },
  {
    id: 'in_ballari',
    name: 'Ballari',
    district: 'Ballari',
    state: 'Karnataka',
    country: 'India',
    latitude: 15.1394,
    longitude: 76.9214,
    elevation: 495,
    specialty: 'Cotton, Chilli, Groundnut, Sunflower',
  },

  // Kerala (Tea, Cardamom, Rubber, Pepper, Coconut)
  {
    id: 'in_kalpetta',
    name: 'Kalpetta (Wayanad)',
    district: 'Wayanad',
    state: 'Kerala',
    country: 'India',
    latitude: 11.6080,
    longitude: 76.0820,
    elevation: 780,
    specialty: 'Robusta Coffee, Black Pepper, Tea, Ginger',
  },
  {
    id: 'in_munnar',
    name: 'Munnar',
    district: 'Idukki',
    state: 'Kerala',
    country: 'India',
    latitude: 10.0882,
    longitude: 77.0624,
    elevation: 1470,
    specialty: 'High-Altitude Estate Tea, Cool-Climate Vegetables',
  },
  {
    id: 'in_kumily',
    name: 'Kumily / Thekkady',
    district: 'Idukki',
    state: 'Kerala',
    country: 'India',
    latitude: 9.6052,
    longitude: 77.1683,
    elevation: 914,
    specialty: 'Small Cardamom, Clove, Nutmeg, Vanilla',
  },
  {
    id: 'in_palakkad',
    name: 'Palakkad (Rice Bowl of Kerala)',
    district: 'Palakkad',
    state: 'Kerala',
    country: 'India',
    latitude: 10.7867,
    longitude: 76.6548,
    elevation: 84,
    specialty: 'Paddy Rice, Coconut, Mango, Vegetables',
  },
  {
    id: 'in_kottayam',
    name: 'Kottayam',
    district: 'Kottayam',
    state: 'Kerala',
    country: 'India',
    latitude: 9.5916,
    longitude: 76.5222,
    elevation: 12,
    specialty: 'Natural Rubber, Spices, Coconut',
  },

  // Tamil Nadu (Tea, Coffee, Cotton, Paddy, Mango, Banana)
  {
    id: 'in_ooty',
    name: 'Udhagamandalam (Ooty)',
    district: 'The Nilgiris',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 11.4102,
    longitude: 76.6950,
    elevation: 2240,
    specialty: 'Orthodox Nilgiri Tea, Hill Potatoes, Carrots',
  },
  {
    id: 'in_coonoor',
    name: 'Coonoor',
    district: 'The Nilgiris',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 11.3530,
    longitude: 76.7959,
    elevation: 1850,
    specialty: 'High-Grown Nilgiri Specialty Tea',
  },
  {
    id: 'in_yercaud',
    name: 'Yercaud (Shevaroy Hills)',
    district: 'Salem',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 11.7753,
    longitude: 78.2093,
    elevation: 1515,
    specialty: 'Arabica Coffee, Orange, Silver Oak, Pepper',
  },
  {
    id: 'in_coimbatore',
    name: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 11.0168,
    longitude: 76.9558,
    elevation: 411,
    specialty: 'Cotton, Vegetables, Maize, Poultry',
  },
  {
    id: 'in_thanjavur',
    name: 'Thanjavur (Cauvery Delta)',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 10.7870,
    longitude: 79.1378,
    elevation: 59,
    specialty: 'Kuruvai & Thaladi Paddy Rice, Banana, Coconut',
  },

  // Andhra Pradesh & Telangana (Coffee, Chilli, Cotton, Rice, Tobacco)
  {
    id: 'in_araku_valley',
    name: 'Araku Valley',
    district: 'Alluri Sitharama Raju',
    state: 'Andhra Pradesh',
    country: 'India',
    latitude: 18.3333,
    longitude: 82.8833,
    elevation: 911,
    specialty: 'GI-Tagged Araku Organic Arabica Coffee, Pepper, Turmeric',
  },
  {
    id: 'in_guntur',
    name: 'Guntur (Asia’s Largest Chilli Yard)',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    latitude: 16.3067,
    longitude: 80.4365,
    elevation: 33,
    specialty: 'Guntur Sannam Red Chilli, Cotton, Tobacco',
  },
  {
    id: 'in_warangal',
    name: 'Warangal',
    district: 'Warangal',
    state: 'Telangana',
    country: 'India',
    latitude: 17.9689,
    longitude: 79.5941,
    elevation: 266,
    specialty: 'Cotton, Red Chilli, Paddy, Turmeric',
  },

  // Maharashtra (Grapes, Onions, Sugarcane, Cotton, Soybean)
  {
    id: 'in_nashik',
    name: 'Nashik (Wine & Grape Capital)',
    district: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.9975,
    longitude: 73.7898,
    elevation: 600,
    specialty: 'Export Table Grapes, Wine Grapes, Red Onions, Tomatoes',
  },
  {
    id: 'in_pune',
    name: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    latitude: 18.5204,
    longitude: 73.8567,
    elevation: 560,
    specialty: 'Sugarcane, Vegetables, Floriculture, Jowar',
  },
  {
    id: 'in_nagpur',
    name: 'Nagpur (Orange City)',
    district: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
    latitude: 21.1458,
    longitude: 79.0882,
    elevation: 310,
    specialty: 'Nagpur Mandarin Oranges, Cotton, Soybean',
  },
  {
    id: 'in_kolhapur',
    name: 'Kolhapur',
    district: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    latitude: 16.7050,
    longitude: 74.2433,
    elevation: 569,
    specialty: 'High-Yield Sugarcane, Jaggery, Soybean, Rice',
  },

  // Punjab & Haryana (Wheat, Basmati Rice, Mustard)
  {
    id: 'in_ludhiana',
    name: 'Ludhiana (PAU Agri Hub)',
    district: 'Ludhiana',
    state: 'Punjab',
    country: 'India',
    latitude: 30.9010,
    longitude: 75.8573,
    elevation: 245,
    specialty: 'High-Yield Wheat, Basmati Paddy, Dairy, Fodder',
  },
  {
    id: 'in_amritsar',
    name: 'Amritsar',
    district: 'Amritsar',
    state: 'Punjab',
    country: 'India',
    latitude: 31.6340,
    longitude: 74.8723,
    elevation: 232,
    specialty: 'Premium Basmati Rice, Wheat, Vegetables',
  },
  {
    id: 'in_karnal',
    name: 'Karnal (Rice Bowl & NDRI)',
    district: 'Karnal',
    state: 'Haryana',
    country: 'India',
    latitude: 29.6857,
    longitude: 76.9905,
    elevation: 252,
    specialty: 'Basmati Rice, Wheat, Sugarcane, Dairy Research',
  },

  // Himachal Pradesh & J&K (Apples, Stone Fruits, Saffron)
  {
    id: 'in_shimla',
    name: 'Shimla (Apple Belt)',
    district: 'Shimla',
    state: 'Himachal Pradesh',
    country: 'India',
    latitude: 31.1048,
    longitude: 77.1734,
    elevation: 2206,
    specialty: 'Royal Delicious Apples, Stone Fruits, Off-Season Veg',
  },
  {
    id: 'in_kullu',
    name: 'Kullu',
    district: 'Kullu',
    state: 'Himachal Pradesh',
    country: 'India',
    latitude: 31.9579,
    longitude: 77.1095,
    elevation: 1278,
    specialty: 'Apples, Pears, Plums, Trout Aquaculture',
  },
  {
    id: 'in_srinagar',
    name: 'Srinagar (Kashmir Valley)',
    district: 'Srinagar',
    state: 'Jammu and Kashmir',
    country: 'India',
    latitude: 34.0837,
    longitude: 74.7973,
    elevation: 1585,
    specialty: 'GI Kashmiri Saffron, Walnuts, Almonds, Apples',
  },

  // West Bengal & Assam (Tea, Jute, Rice)
  {
    id: 'in_darjeeling',
    name: 'Darjeeling (Champagne of Teas)',
    district: 'Darjeeling',
    state: 'West Bengal',
    country: 'India',
    latitude: 27.0410,
    longitude: 88.2663,
    elevation: 2042,
    specialty: 'GI Darjeeling Black, Green & White Tea, Large Cardamom',
  },
  {
    id: 'in_jorhat',
    name: 'Jorhat (Tea Research Hub - Tocklai)',
    district: 'Jorhat',
    state: 'Assam',
    country: 'India',
    latitude: 26.7509,
    longitude: 94.2037,
    elevation: 116,
    specialty: 'Assam Orthodox & CTC Tea, Winter Vegetables',
  },

  // Uttar Pradesh & Madhya Pradesh (Wheat, Sugarcane, Soybean, Pulses)
  {
    id: 'in_varanasi',
    name: 'Varanasi',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    latitude: 25.3176,
    longitude: 82.9739,
    elevation: 81,
    specialty: 'Paddy, Wheat, Vegetables, Betel Vine',
  },
  {
    id: 'in_indore',
    name: 'Indore (Malwa Plateau)',
    district: 'Indore',
    state: 'Madhya Pradesh',
    country: 'India',
    latitude: 22.7196,
    longitude: 75.8577,
    elevation: 553,
    specialty: 'Soybean (Soya Bowl), Wheat (Sharbati), Chickpea',
  },

  // Rajasthan & Gujarat (Millets, Mustard, Groundnut, Cotton)
  {
    id: 'in_anand',
    name: 'Anand (Milk Capital of India)',
    district: 'Anand',
    state: 'Gujarat',
    country: 'India',
    latitude: 22.5645,
    longitude: 72.9289,
    elevation: 39,
    specialty: 'Tobacco, Banana, Dairy, Vegetables',
  },
  {
    id: 'in_jaipur',
    name: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    latitude: 26.9124,
    longitude: 75.7873,
    elevation: 431,
    specialty: 'Pearl Millet (Bajra), Mustard, Barley, Pulses',
  },
];

export const POPULAR_GLOBAL_AGRI_LOCATIONS: IndiaLocationResult[] = [
  {
    id: 'gl_huila',
    name: 'Pitalito (Huila)',
    district: 'Huila',
    state: 'Andean Region',
    country: 'Colombia',
    latitude: 1.8542,
    longitude: -76.0512,
    elevation: 1318,
    specialty: 'Single-Origin High-Altitude Specialty Arabica Coffee',
  },
  {
    id: 'gl_cerrado',
    name: 'Patrocínio (Cerrado Mineiro)',
    district: 'Minas Gerais',
    state: 'Southeast',
    country: 'Brazil',
    latitude: -18.9439,
    longitude: -46.9931,
    elevation: 934,
    specialty: 'Plateau Mechanized Coffee & Soybeans',
  },
  {
    id: 'gl_yirgacheffe',
    name: 'Yirgacheffe (Gedeo)',
    district: 'Gedeo Zone',
    state: 'SNNPR',
    country: 'Ethiopia',
    latitude: 6.1625,
    longitude: 38.2056,
    elevation: 1889,
    specialty: 'Floral & Citrus Heirloom Forest Arabica Coffee',
  },
  {
    id: 'gl_daklak',
    name: 'Buon Ma Thuot (Dak Lak)',
    district: 'Dak Lak',
    state: 'Central Highlands',
    country: 'Vietnam',
    latitude: 12.6667,
    longitude: 108.0500,
    elevation: 536,
    specialty: 'Global Robusta Coffee Capital & Black Pepper',
  },
  {
    id: 'gl_nyeri',
    name: 'Nyeri (Mount Kenya)',
    district: 'Central Province',
    state: 'Highlands',
    country: 'Kenya',
    latitude: -0.4201,
    longitude: 36.9476,
    elevation: 1759,
    specialty: 'Volcanic Soil SL-28 & SL-34 Arabica Coffee & Tea',
  },
  {
    id: 'gl_aceh',
    name: 'Takengon (Lake Tawar, Aceh)',
    district: 'Central Aceh',
    state: 'Sumatra',
    country: 'Indonesia',
    latitude: 4.6294,
    longitude: 96.8458,
    elevation: 1200,
    specialty: 'Wet-Hulled (Giling Basah) Gayo Organic Arabica',
  },
  {
    id: 'gl_antigua',
    name: 'Antigua Guatemala',
    district: 'Sacatepéquez',
    state: 'Volcanic Highlands',
    country: 'Guatemala',
    latitude: 14.5586,
    longitude: -90.7339,
    elevation: 1530,
    specialty: 'Shade-Grown Volcanic Valley Bourbon Arabica',
  },
  {
    id: 'gl_tarrazu',
    name: 'San Marcos de Tarrazú',
    district: 'San José',
    state: 'Los Santos',
    country: 'Costa Rica',
    latitude: 9.6606,
    longitude: -84.0203,
    elevation: 1429,
    specialty: 'Strictly Hard Bean (SHB) Micro-Lot Coffee',
  },
  {
    id: 'gl_central_valley_us',
    name: 'Fresno (Central Valley)',
    district: 'Fresno County',
    state: 'California',
    country: 'United States',
    latitude: 36.7468,
    longitude: -119.7726,
    elevation: 90,
    specialty: 'Almonds, Grapes, Citrus, Precision Ag Irrigation',
  },
  {
    id: 'gl_andalusia',
    name: 'Jaén (Andalusia)',
    district: 'Jaén',
    state: 'Andalusia',
    country: 'Spain',
    latitude: 37.7796,
    longitude: -3.7849,
    elevation: 574,
    specialty: 'World Olive Oil Capital (Picual Olives)',
  },
];

export const IndiaLocationService = {
  /**
   * Search for ANY location worldwide or across India (Curated DB + Coordinate Parser + Open-Meteo Global Geocoding)
   */
  async searchAnyLocation(query: string): Promise<IndiaLocationResult[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return [...POPULAR_INDIAN_AGRI_LOCATIONS.slice(0, 8), ...POPULAR_GLOBAL_AGRI_LOCATIONS.slice(0, 4)];
    }

    // Check if query is coordinate string, e.g. "13.4215, 75.7621" or "13.4215 75.7621"
    const coordMatch = trimmed.match(/^([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return [
          {
            id: `coord_${lat.toFixed(4)}_${lng.toFixed(4)}`,
            name: `Coordinates: ${lat >= 0 ? `${lat.toFixed(4)}°N` : `${Math.abs(lat).toFixed(4)}°S`}, ${
              lng >= 0 ? `${lng.toFixed(4)}°E` : `${Math.abs(lng).toFixed(4)}°W`
            }`,
            state: 'GPS Coordinates',
            country: 'Custom Pin',
            latitude: Number(lat.toFixed(4)),
            longitude: Number(lng.toFixed(4)),
            elevation: 500,
            specialty: 'Exact Geolocation Coordinates',
          },
        ];
      }
    }

    const lower = trimmed.toLowerCase();

    // 1. Search local curated database (both India and Global)
    const combinedCurated = [...POPULAR_INDIAN_AGRI_LOCATIONS, ...POPULAR_GLOBAL_AGRI_LOCATIONS];
    const localMatches = combinedCurated.filter(
      (loc) =>
        loc.name.toLowerCase().includes(lower) ||
        (loc.district && loc.district.toLowerCase().includes(lower)) ||
        loc.state.toLowerCase().includes(lower) ||
        loc.country.toLowerCase().includes(lower) ||
        (loc.specialty && loc.specialty.toLowerCase().includes(lower))
    );

    // 2. Query live Open-Meteo worldwide Geocoding API if query >= 2 chars
    if (trimmed.length >= 2) {
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          trimmed
        )}&count=15&language=en&format=json`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const results: any[] = data.results || [];

          const apiResults: IndiaLocationResult[] = results.map((r) => ({
            id: `om_${r.id}`,
            name: r.name,
            district: r.admin2 || r.admin3 || '',
            state: r.admin1 || r.country || 'Region',
            country: r.country || 'Global',
            latitude: Number(r.latitude.toFixed(4)),
            longitude: Number(r.longitude.toFixed(4)),
            elevation: Math.round(r.elevation || 300),
            specialty: `${r.admin1 ? `${r.admin1}, ` : ''}${r.country} (${r.latitude >= 0 ? `${r.latitude.toFixed(2)}°N` : `${Math.abs(r.latitude).toFixed(2)}°S`})`,
          }));

          const combined = [...localMatches];
          for (const item of apiResults) {
            const isDup = combined.some(
              (c) =>
                Math.abs(c.latitude - item.latitude) < 0.05 &&
                Math.abs(c.longitude - item.longitude) < 0.05
            );
            if (!isDup) {
              combined.push(item);
            }
          }
          return combined.slice(0, 16);
        }
      } catch (err) {
        console.warn('Worldwide geocoding error, returning local curated list:', err);
      }
    }

    return localMatches.slice(0, 16);
  },

  /**
   * Search for locations across India combining curated directory and live Open-Meteo geocoding.
   */
  async searchIndiaLocations(query: string): Promise<IndiaLocationResult[]> {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return POPULAR_INDIAN_AGRI_LOCATIONS.slice(0, 12);
    }

    // 1. Search internal curated database first for instant sub-millisecond match
    const localMatches = POPULAR_INDIAN_AGRI_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(trimmed) ||
        (loc.district && loc.district.toLowerCase().includes(trimmed)) ||
        loc.state.toLowerCase().includes(trimmed) ||
        (loc.specialty && loc.specialty.toLowerCase().includes(trimmed))
    );

    // If query has at least 2 characters, also query live Open-Meteo Geocoding API
    if (trimmed.length >= 2) {
      try {
        const queryWithCountry = `${trimmed}`;
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          queryWithCountry
        )}&count=12&language=en&format=json`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const results: any[] = data.results || [];

          // Filter strictly for India
          const indiaResults: IndiaLocationResult[] = results
            .filter(
              (r) =>
                r.country_code === 'IN' ||
                (r.country && r.country.toLowerCase().includes('india'))
            )
            .map((r) => ({
              id: `om_${r.id}`,
              name: r.name,
              district: r.admin2 || r.admin3 || '',
              state: r.admin1 || 'India',
              country: 'India',
              latitude: Number(r.latitude.toFixed(4)),
              longitude: Number(r.longitude.toFixed(4)),
              elevation: Math.round(r.elevation || 500),
              specialty: `${r.admin1 || 'India'} (${r.latitude > 0 ? `${r.latitude.toFixed(2)}°N` : ''})`,
            }));

          // Merge local and remote, deduplicating by approximate latitude & longitude
          const combined = [...localMatches];
          for (const item of indiaResults) {
            const isDuplicate = combined.some(
              (c) =>
                Math.abs(c.latitude - item.latitude) < 0.08 &&
                Math.abs(c.longitude - item.longitude) < 0.08
            );
            if (!isDuplicate) {
              combined.push(item);
            }
          }
          return combined.slice(0, 15);
        }
      } catch (err) {
        console.warn('Live geocoding error, using curated database:', err);
      }
    }

    return localMatches.slice(0, 15);
  },

  /**
   * Reverse geocode coordinates to location in India (or fallback).
   */
  async reverseGeocode(lat: number, lng: number): Promise<IndiaLocationResult | null> {
    try {
      const allCurated = [...POPULAR_INDIAN_AGRI_LOCATIONS, ...POPULAR_GLOBAL_AGRI_LOCATIONS];
      for (const loc of allCurated) {
        const dLat = Math.abs(loc.latitude - lat);
        const dLng = Math.abs(loc.longitude - lng);
        if (dLat < 0.25 && dLng < 0.25) {
          return loc;
        }
      }

      // Fetch from Open-Meteo elevation/reverse API
      const elevUrl = `https://api.open-meteo.com/v1/elevation?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}`;
      let elev = 800;
      try {
        const elevRes = await fetch(elevUrl);
        if (elevRes.ok) {
          const elevData = await elevRes.json();
          if (Array.isArray(elevData.elevation)) elev = Math.round(elevData.elevation[0]);
        }
      } catch {}

      return {
        id: `custom_${lat.toFixed(3)}_${lng.toFixed(3)}`,
        name: `Location (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
        state: 'Location',
        country: 'GPS Location',
        latitude: Number(lat.toFixed(4)),
        longitude: Number(lng.toFixed(4)),
        elevation: elev,
        specialty: 'GPS Custom Agricultural Location',
      };
    } catch {
      return null;
    }
  },
};

