// High-Accuracy Geolocation Service with Adaptive WatchPosition & Reverse Geocoding

/**
 * Tries to get the most accurate location by watching for improvements
 * over a period of time, then resolves with the best reading obtained.
 * Falls back silently to preset if denied or unavailable.
 */
export const getHighAccuracyLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(PRESET_LOCATIONS[0]);
      return;
    }

    let bestReading = null;
    let watchId = null;
    let resolved = false;

    const finish = async (coords) => {
      if (resolved) return;
      resolved = true;
      if (watchId !== null) {
        try { navigator.geolocation.clearWatch(watchId); } catch {}
      }

      const { latitude, longitude, accuracy } = coords;
      try {
        const geo = await reverseGeocode(latitude, longitude);
        resolve({
          latitude,
          longitude,
          accuracy: Math.round(accuracy * 10) / 10,
          city: geo.city,
          region: geo.region,
          country: geo.country,
          countryCode: geo.countryCode || '',
          suburb: geo.suburb || '',
          postalCode: geo.postalCode || '',
          source: 'gps_watch',
        });
      } catch {
        const fallback = estimateCityFromCoords(latitude, longitude);
        resolve({
          latitude,
          longitude,
          accuracy: Math.round(accuracy * 10) / 10,
          city: fallback.city,
          region: fallback.region,
          country: fallback.country,
          countryCode: '',
          suburb: '',
          postalCode: '',
          source: 'gps_coords',
        });
      }
    };

    const onError = () => {
      if (resolved) return;
      resolved = true;
      if (watchId !== null) {
        try { navigator.geolocation.clearWatch(watchId); } catch {}
      }
      resolve(PRESET_LOCATIONS[0]);
    };

    // Use watchPosition to keep getting better fixes
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { accuracy } = pos.coords;
        // Update best reading if this one is more accurate (lower number = better)
        if (!bestReading || accuracy < bestReading.accuracy) {
          bestReading = pos.coords;
        }
        // If we reach excellent accuracy (< 20m), resolve immediately
        if (accuracy <= 20) {
          finish(pos.coords);
        }
      },
      onError,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    // Hard deadline: after 12 seconds, resolve with whatever best we got
    setTimeout(() => {
      if (!resolved) {
        if (bestReading) {
          finish(bestReading);
        } else {
          onError();
        }
      }
    }, 12000);
  });
};

export const reverseGeocode = async (lat, lng) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: { 'Accept': 'application/json', 'Accept-Language': 'en' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Geocoding service unavailable');
    const data = await res.json();
    const addr = data.address || {};

    return {
      city: addr.city || addr.town || addr.municipality || addr.village || addr.suburb || addr.county || 'Detected Metro',
      region: addr.state || addr.county || addr.region || '',
      country: addr.country || 'Global',
      countryCode: addr.country_code ? addr.country_code.toUpperCase() : '',
      suburb: addr.suburb || addr.neighbourhood || addr.quarter || '',
      postalCode: addr.postcode || '',
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

// Fallback lookup table for common coordinate hubs
export const estimateCityFromCoords = (lat, lng) => {
  const cities = [
    { city: 'London', region: 'Greater London', country: 'United Kingdom', lat: 51.5, lng: -0.12 },
    { city: 'Bangalore', region: 'Karnataka', country: 'India', lat: 12.97, lng: 77.59 },
    { city: 'Mumbai', region: 'Maharashtra', country: 'India', lat: 19.07, lng: 72.87 },
    { city: 'New Delhi', region: 'Delhi', country: 'India', lat: 28.61, lng: 77.20 },
    { city: 'New York', region: 'New York', country: 'United States', lat: 40.71, lng: -74.0 },
    { city: 'San Francisco', region: 'California', country: 'United States', lat: 37.77, lng: -122.4 },
    { city: 'Berlin', region: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.40 },
    { city: 'Paris', region: 'Île-de-France', country: 'France', lat: 48.85, lng: 2.35 },
    { city: 'Tokyo', region: 'Kanto', country: 'Japan', lat: 35.68, lng: 139.69 },
    { city: 'Singapore', region: 'Central', country: 'Singapore', lat: 1.35, lng: 103.82 },
    { city: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', lat: 25.20, lng: 55.27 },
    { city: 'Sydney', region: 'New South Wales', country: 'Australia', lat: -33.86, lng: 151.20 },
    { city: 'Chennai', region: 'Tamil Nadu', country: 'India', lat: 13.08, lng: 80.27 },
    { city: 'Hyderabad', region: 'Telangana', country: 'India', lat: 17.38, lng: 78.48 },
    { city: 'Kolkata', region: 'West Bengal', country: 'India', lat: 22.57, lng: 88.36 },
    { city: 'Los Angeles', region: 'California', country: 'United States', lat: 34.05, lng: -118.24 },
    { city: 'Chicago', region: 'Illinois', country: 'United States', lat: 41.88, lng: -87.63 },
    { city: 'Toronto', region: 'Ontario', country: 'Canada', lat: 43.65, lng: -79.38 },
    { city: 'São Paulo', region: 'São Paulo', country: 'Brazil', lat: -23.55, lng: -46.63 },
    { city: 'Shanghai', region: 'Shanghai', country: 'China', lat: 31.23, lng: 121.47 },
  ];

  let closest = cities[0];
  let minDistance = Infinity;
  cities.forEach((c) => {
    const dist = Math.hypot(lat - c.lat, lng - c.lng);
    if (dist < minDistance) { minDistance = dist; closest = c; }
  });
  return { city: closest.city, region: closest.region, country: closest.country };
};

export const PRESET_LOCATIONS = [
  { city: 'London', region: 'Greater London', country: 'United Kingdom', countryCode: 'GB', suburb: '', postalCode: '', latitude: 51.5074, longitude: -0.1278, accuracy: 4.5, source: 'preset' },
  { city: 'Bangalore', region: 'Karnataka', country: 'India', countryCode: 'IN', suburb: '', postalCode: '', latitude: 12.9716, longitude: 77.5946, accuracy: 3.8, source: 'preset' },
  { city: 'New York', region: 'New York', country: 'United States', countryCode: 'US', suburb: '', postalCode: '', latitude: 40.7128, longitude: -74.0060, accuracy: 5.2, source: 'preset' },
  { city: 'Berlin', region: 'Berlin', country: 'Germany', countryCode: 'DE', suburb: '', postalCode: '', latitude: 52.5200, longitude: 13.4050, accuracy: 4.1, source: 'preset' },
  { city: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', suburb: '', postalCode: '', latitude: 25.2048, longitude: 55.2708, accuracy: 6.0, source: 'preset' },
];
