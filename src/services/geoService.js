// High-Accuracy Geolocation Service with Reverse Geocoding & Fallbacks

export const getHighAccuracyLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          // Attempt reverse geocoding via OpenStreetMap Nominatim
          const reverseData = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            accuracy: Math.round(accuracy * 10) / 10,
            city: reverseData.city,
            region: reverseData.region,
            country: reverseData.country,
            source: 'gps_satellite'
          });
        } catch {
          // If reverse geocoding network call fails, estimate based on coordinate bounding
          const fallbackEstimate = estimateCityFromCoords(latitude, longitude);
          resolve({
            latitude,
            longitude,
            accuracy: Math.round(accuracy * 10) / 10,
            city: fallbackEstimate.city,
            region: fallbackEstimate.region,
            country: fallbackEstimate.country,
            source: 'gps_coords'
          });
        }
      },
      (error) => {
        let msg = 'Unable to retrieve location.';
        if (error.code === 1) msg = 'Location permission denied. Please allow location to verify geography for our 2nd office expansion.';
        if (error.code === 2) msg = 'Location position unavailable.';
        if (error.code === 3) msg = 'Location request timed out.';
        reject(new Error(msg));
      },
      options
    );
  });
};

export const reverseGeocode = async (lat, lng) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Geocoding service unavailable');
    const data = await res.json();
    const addr = data.address || {};

    const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || addr.county || 'Detected Metro';
    const region = addr.state || addr.county || addr.region || '';
    const country = addr.country || 'Global';

    return { city, region, country };
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
    { city: 'Sydney', region: 'New South Wales', country: 'Australia', lat: -33.86, lng: 151.20 }
  ];

  let closest = cities[0];
  let minDistance = Infinity;

  cities.forEach(c => {
    const dist = Math.hypot(lat - c.lat, lng - c.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = c;
    }
  });

  return {
    city: closest.city,
    region: closest.region,
    country: closest.country
  };
};

// Quick simulation/preset for users testing in restricted environments
export const PRESET_LOCATIONS = [
  { city: 'London', region: 'Greater London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, accuracy: 4.5 },
  { city: 'Bangalore', region: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, accuracy: 3.8 },
  { city: 'New York', region: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, accuracy: 5.2 },
  { city: 'Berlin', region: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, accuracy: 4.1 },
  { city: 'Tokyo', region: 'Kanto', country: 'Japan', latitude: 35.6762, longitude: 139.6503, accuracy: 3.5 },
  { city: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, accuracy: 6.0 },
  { city: 'Paris', region: 'Île-de-France', country: 'France', latitude: 48.8566, longitude: 2.3522, accuracy: 4.8 }
];
