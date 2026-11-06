/**
 * Geodesic and Cartographic Utilities for Farm Land Parcels
 */

// Earth mean radius in meters (WGS84 ellipsoid approx)
const EARTH_RADIUS = 6378137;

/**
 * Calculates the geodesic surface area of a polygon defined by [lng, lat] coordinates in square meters.
 * Based on the spherical excess algorithm (Gauss-Bonnet on a sphere).
 */
export function calculatePolygonAreaSquareMeters(coordinates: [number, number][]): number {
  if (!coordinates || coordinates.length < 3) return 0;

  // Ensure ring is closed
  const points = [...coordinates];
  const first = points[0];
  const last = points[points.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    points.push(first);
  }

  let totalAngle = 0;
  const numPoints = points.length;

  for (let i = 0; i < numPoints - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    const lambda1 = (p1[0] * Math.PI) / 180;
    const phi1 = (p1[1] * Math.PI) / 180;
    const lambda2 = (p2[0] * Math.PI) / 180;
    const phi2 = (p2[1] * Math.PI) / 180;

    totalAngle += (lambda2 - lambda1) * (2 + Math.sin(phi1) + Math.sin(phi2));
  }

  const area = Math.abs((totalAngle * EARTH_RADIUS * EARTH_RADIUS) / 2);
  return area;
}

/**
 * Converts square meters to acres (1 Acre = 4046.85642 m²)
 */
export function sqMetersToAcres(sqMeters: number): number {
  return Number((sqMeters / 4046.8564224).toFixed(2));
}

/**
 * Converts square meters to hectares (1 Hectare = 10,000 m²)
 */
export function sqMetersToHectares(sqMeters: number): number {
  return Number((sqMeters / 10000).toFixed(2));
}

/**
 * Calculates geographic centroid of coordinates [[lng, lat], ...]
 */
export function calculateCentroid(coordinates: [number, number][]): { lat: number; lng: number } {
  if (!coordinates || coordinates.length === 0) {
    return { lat: 13.3153, lng: 75.7754 }; // Default Chikmagalur coffee belt
  }

  let sumLat = 0;
  let sumLng = 0;
  const count = coordinates.length;

  for (const pt of coordinates) {
    sumLng += pt[0];
    sumLat += pt[1];
  }

  return {
    lat: Number((sumLat / count).toFixed(6)),
    lng: Number((sumLng / count).toFixed(6)),
  };
}

/**
 * Formats coordinates for display (e.g. 13.3153° N, 75.7754° E)
 */
export function formatCoordinate(lat: number, lng: number): string {
  const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lngStr}`;
}

/**
 * Calculate distance between two lat/lng coordinates in meters (Haversine)
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}
