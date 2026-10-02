/**
 * Geolocation Service — production-quality, reviewed & corrected.
 *
 * Key improvements over v1:
 *  - GeoError with typed codes (UNSUPPORTED | DENIED | UNAVAILABLE | TIMEOUT | ABORTED)
 *  - watchPosition with stall detector (resolves when accuracy stops improving)
 *  - AbortSignal support for React cleanup on unmount
 *  - Haversine distance (not raw degrees) with 100 km max for fallback lookup
 *  - Coordinate rounding (3 dp) for Nominatim caching & privacy
 *  - reverseGeocode cache (Map) so repeated calls skip the network
 *  - No silent London fallback — callers decide what to do on failure
 *  - Null for missing fields instead of fake strings
 *  - PRESET_LOCATIONS at top so it's clear to readers
 */

// ─── Known reference cities (fallback only when no geocoder) ──────────────────

export const PRESET_LOCATIONS = [
  { city: 'London',    region: 'Greater London',  country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278,  accuracy: 999 },
  { city: 'New York',  region: 'New York',         country: 'United States',  countryCode: 'US', latitude: 40.7128, longitude: -74.0060, accuracy: 999 },
  { city: 'Chennai',   region: 'Tamil Nadu',       country: 'India',          countryCode: 'IN', latitude: 13.0827, longitude:  80.2707, accuracy: 999 },
  { city: 'Bangalore', region: 'Karnataka',        country: 'India',          countryCode: 'IN', latitude: 12.9716, longitude:  77.5946, accuracy: 999 },
  { city: 'Mumbai',    region: 'Maharashtra',      country: 'India',          countryCode: 'IN', latitude: 19.0760, longitude:  72.8777, accuracy: 999 },
  { city: 'New Delhi', region: 'Delhi',            country: 'India',          countryCode: 'IN', latitude: 28.6139, longitude:  77.2090, accuracy: 999 },
  { city: 'Dubai',     region: 'Dubai',            country: 'UAE',            countryCode: 'AE', latitude: 25.2048, longitude:  55.2708, accuracy: 999 },
  { city: 'Singapore', region: 'Central',          country: 'Singapore',      countryCode: 'SG', latitude:  1.3521, longitude: 103.8198, accuracy: 999 },
  { city: 'Berlin',    region: 'Berlin',           country: 'Germany',        countryCode: 'DE', latitude: 52.5200, longitude:  13.4050, accuracy: 999 },
  { city: 'Paris',     region: 'Île-de-France',    country: 'France',         countryCode: 'FR', latitude: 48.8566, longitude:   2.3522, accuracy: 999 },
  { city: 'Tokyo',     region: 'Kanto',            country: 'Japan',          countryCode: 'JP', latitude: 35.6762, longitude: 139.6503, accuracy: 999 },
  { city: 'Sydney',    region: 'New South Wales',  country: 'Australia',      countryCode: 'AU', latitude: -33.865, longitude: 151.2094, accuracy: 999 },
  { city: 'Los Angeles', region: 'California',     country: 'United States',  countryCode: 'US', latitude: 34.0522, longitude:-118.2437, accuracy: 999 },
  { city: 'São Paulo', region: 'São Paulo',        country: 'Brazil',         countryCode: 'BR', latitude:-23.5505, longitude: -46.6333, accuracy: 999 },
];

// ─── Error class ──────────────────────────────────────────────────────────────

export class GeoError extends Error {
  /** @param {'UNSUPPORTED'|'DENIED'|'UNAVAILABLE'|'TIMEOUT'|'ABORTED'} code */
  constructor(code, message) {
    super(message);
    this.name = 'GeoError';
    this.code = code;
  }
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

const toRad = (d) => (d * Math.PI) / 180;

/** Returns distance in km using haversine formula. */
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
};

// ─── Low-level position acquisition ──────────────────────────────────────────

/**
 * Returns the best GPS fix available.
 * Stops when: accuracy <= targetAccuracy, no improvement for stallMs, or maxWaitMs elapses.
 * Rejects with GeoError — callers decide the fallback.
 *
 * @param {{ targetAccuracy?: number, maxWaitMs?: number, stallMs?: number, signal?: AbortSignal }} opts
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number, timestamp: number }>}
 */
export function getBestPosition({
  targetAccuracy = 30,
  maxWaitMs = 12000,
  stallMs = 4000,
  signal,
} = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      return reject(new GeoError('UNSUPPORTED', 'Geolocation not supported by this browser.'));
    }
    if (signal?.aborted) {
      return reject(new GeoError('ABORTED', 'Location request was cancelled.'));
    }

    let best = null;
    let done = false;
    let watchId;
    let stallTimer;
    let deadline;

    const cleanup = () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
      clearTimeout(stallTimer);
      clearTimeout(deadline);
      signal?.removeEventListener('abort', onAbort);
    };

    const settle = (fn, value) => {
      if (done) return;
      done = true;
      cleanup();
      fn(value);
    };

    const finish = () =>
      best
        ? settle(resolve, best)
        : settle(reject, new GeoError('TIMEOUT', 'Could not obtain a location fix within the time limit.'));

    const onAbort = () => settle(reject, new GeoError('ABORTED', 'Location request was cancelled.'));
    signal?.addEventListener('abort', onAbort, { once: true });

    deadline = setTimeout(finish, maxWaitMs);

    watchId = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) => {
        if (!best || coords.accuracy < best.accuracy) {
          best = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: Math.round(coords.accuracy),
            timestamp,
          };
          // Reset stall timer on every improvement
          clearTimeout(stallTimer);
          stallTimer = setTimeout(finish, stallMs);
        }
        // Early exit if we hit the target accuracy
        if (best.accuracy <= targetAccuracy) finish();
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          // Hard stop — no point watching further
          settle(reject, new GeoError('DENIED', 'Location permission was denied.'));
        } else if (best) {
          // Already have something useful — finish with it
          finish();
        } else {
          settle(
            reject,
            new GeoError(
              err.code === err.TIMEOUT ? 'TIMEOUT' : 'UNAVAILABLE',
              err.message || 'Location unavailable.'
            )
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

// ─── Reverse geocoding ────────────────────────────────────────────────────────

/** In-memory cache keyed by "lat3,lon3" (3 decimal places ≈ 110 m grid). */
const geoCache = new Map();

/**
 * Reverse geocodes coordinates using Nominatim.
 * Rounds to 3 dp for caching and privacy (~110 m precision, fine for city lookup).
 * Returns null fields rather than fake strings.
 *
 * @param {number} lat
 * @param {number} lng
 * @param {{ signal?: AbortSignal }} opts
 */
export async function reverseGeocode(lat, lng, { signal } = {}) {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  if (geoCache.has(key)) return geoCache.get(key);

  // zoom=14 → suburb/city level. 4 dp ≈ 11 m, sufficient for lookup.
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}&zoom=14&addressdetails=1&accept-language=en`;

  const timeout = AbortSignal.timeout ? AbortSignal.timeout(5000) : null;
  const combined =
    signal && timeout
      ? AbortSignal.any([signal, timeout])
      : signal || timeout;

  const res = await fetch(url, {
    headers: { Referer: window.location.origin },
    signal: combined || undefined,
  });
  if (!res.ok) throw new Error(`Nominatim error (${res.status})`);

  const { address: a = {} } = await res.json();

  const result = {
    city:        a.city || a.town || a.municipality || a.village || a.county || null,
    region:      a.state || a.region || null,
    country:     a.country || null,
    countryCode: a.country_code?.toUpperCase() || null,
    suburb:      a.suburb || a.neighbourhood || a.quarter || null,
    postalCode:  a.postcode || null,
  };

  geoCache.set(key, result);
  return result;
}

// ─── Nearest-city fallback (haversine, 100 km max) ───────────────────────────

const KNOWN_CITIES = [
  { city: 'London',      region: 'Greater London',  country: 'United Kingdom', lat: 51.51, lng:  -0.13 },
  { city: 'Bangalore',   region: 'Karnataka',        country: 'India',          lat: 12.97, lng:  77.59 },
  { city: 'Mumbai',      region: 'Maharashtra',      country: 'India',          lat: 19.07, lng:  72.88 },
  { city: 'New Delhi',   region: 'Delhi',            country: 'India',          lat: 28.61, lng:  77.21 },
  { city: 'Chennai',     region: 'Tamil Nadu',       country: 'India',          lat: 13.08, lng:  80.27 },
  { city: 'Hyderabad',   region: 'Telangana',        country: 'India',          lat: 17.38, lng:  78.48 },
  { city: 'Kolkata',     region: 'West Bengal',      country: 'India',          lat: 22.57, lng:  88.36 },
  { city: 'Ahmedabad',   region: 'Gujarat',          country: 'India',          lat: 23.02, lng:  72.57 },
  { city: 'Pune',        region: 'Maharashtra',      country: 'India',          lat: 18.52, lng:  73.86 },
  { city: 'New York',    region: 'New York',         country: 'United States',  lat: 40.71, lng: -74.01 },
  { city: 'Los Angeles', region: 'California',       country: 'United States',  lat: 34.05, lng:-118.24 },
  { city: 'Chicago',     region: 'Illinois',         country: 'United States',  lat: 41.88, lng: -87.63 },
  { city: 'San Francisco', region: 'California',     country: 'United States',  lat: 37.77, lng:-122.42 },
  { city: 'Toronto',     region: 'Ontario',          country: 'Canada',         lat: 43.65, lng: -79.38 },
  { city: 'Berlin',      region: 'Berlin',           country: 'Germany',        lat: 52.52, lng:  13.41 },
  { city: 'Paris',       region: 'Île-de-France',    country: 'France',         lat: 48.86, lng:   2.35 },
  { city: 'Tokyo',       region: 'Kanto',            country: 'Japan',          lat: 35.68, lng: 139.69 },
  { city: 'Shanghai',    region: 'Shanghai',         country: 'China',          lat: 31.23, lng: 121.47 },
  { city: 'Singapore',   region: 'Central',          country: 'Singapore',      lat:  1.35, lng: 103.82 },
  { city: 'Dubai',       region: 'Dubai',            country: 'UAE',            lat: 25.20, lng:  55.27 },
  { city: 'Sydney',      region: 'New South Wales',  country: 'Australia',      lat:-33.87, lng: 151.21 },
  { city: 'São Paulo',   region: 'São Paulo',        country: 'Brazil',         lat:-23.55, lng: -46.63 },
  { city: 'Nairobi',     region: 'Nairobi',          country: 'Kenya',          lat: -1.29, lng:  36.82 },
  { city: 'Lagos',       region: 'Lagos',            country: 'Nigeria',        lat:  6.52, lng:   3.38 },
  { city: 'Cairo',       region: 'Cairo',            country: 'Egypt',          lat: 30.04, lng:  31.24 },
  { city: 'Istanbul',    region: 'Istanbul',         country: 'Turkey',         lat: 41.02, lng:  28.97 },
  { city: 'Riyadh',      region: 'Riyadh',           country: 'Saudi Arabia',   lat: 24.69, lng:  46.72 },
  { city: 'Jakarta',     region: 'Java',             country: 'Indonesia',      lat: -6.21, lng: 106.85 },
];

/**
 * Returns nearest known city within maxKm, or null fields if none found.
 * @param {number} lat
 * @param {number} lng
 * @param {number} maxKm  Default 100 km — anything further returns nulls.
 */
export function estimateCityFromCoords(lat, lng, maxKm = 100) {
  let best = null;
  let minDist = Infinity;

  for (const c of KNOWN_CITIES) {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < minDist) { minDist = d; best = c; }
  }

  if (best && minDist <= maxKm) {
    return { city: best.city, region: best.region, country: best.country };
  }
  return { city: null, region: null, country: null };
}

// ─── High-level helper ────────────────────────────────────────────────────────

/**
 * Full pipeline: GPS → reverse geocode → nearest-city fallback.
 * THROWS GeoError on GPS failure (DENIED / UNSUPPORTED / UNAVAILABLE / TIMEOUT / ABORTED).
 * Geocoding failures are silent — falls back to coordinate estimation.
 *
 * @param {{ targetAccuracy?: number, maxWaitMs?: number, stallMs?: number, signal?: AbortSignal }} opts
 */
export async function getLocation(opts = {}) {
  // May throw GeoError — caller decides fallback (e.g. city picker for DENIED)
  const pos = await getBestPosition(opts);

  let place;
  let source;
  try {
    place = await reverseGeocode(pos.latitude, pos.longitude, opts);
    source = 'gps_geocoded';
  } catch {
    place = {
      ...estimateCityFromCoords(pos.latitude, pos.longitude),
      countryCode: null,
      suburb: null,
      postalCode: null,
    };
    source = 'gps_estimated';
  }

  return { ...pos, ...place, source };
}
