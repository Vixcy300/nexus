// Store service for managing 1,000 Free Users Campaign, Referral Codes & Geolocation Analytics

const STORAGE_KEYS = {
  USERS: 'arch_nexus_users_v1',
  CODES: 'arch_nexus_referral_codes_v1',
  ADMIN_AUTH: 'arch_nexus_admin_session_v1',
  QUOTA: 'arch_nexus_quota_v1'
};

export const TOTAL_FREE_QUOTA = 1000;

// Pre-seeded high-accuracy realistic architectural professionals across global architectural hubs
// to provide immediate, rich geographic intelligence for deploying the 2nd office!
const INITIAL_USERS = [
  {
    id: 'USR-8901',
    name: 'Julian Vance',
    email: 'j.vance@fosterandpartners-alumni.com',
    age: 32,
    profession: 'Senior Architect',
    referralCode: 'ARCH-LONDON-01',
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
      accuracy: 4.8,
      city: 'London',
      region: 'Greater London',
      country: 'United Kingdom'
    },
    registeredAt: '2026-09-24T10:14:00.000Z'
  },
  {
    id: 'USR-8902',
    name: 'Aarav Mehta',
    email: 'aarav.bim@studioindus.in',
    age: 27,
    profession: 'BIM Manager',
    referralCode: 'BIM-BLR-09',
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      accuracy: 3.2,
      city: 'Bangalore',
      region: 'Karnataka',
      country: 'India'
    },
    registeredAt: '2026-09-24T11:42:00.000Z'
  },
  {
    id: 'USR-8903',
    name: 'Elena Rostova',
    email: 'elena.rostova@berlin-architekten.de',
    age: 29,
    profession: 'Computational Designer',
    referralCode: 'BERLIN-CAD-22',
    location: {
      latitude: 52.5200,
      longitude: 13.4050,
      accuracy: 5.1,
      city: 'Berlin',
      region: 'Berlin',
      country: 'Germany'
    },
    registeredAt: '2026-09-25T08:20:00.000Z'
  },
  {
    id: 'USR-8904',
    name: 'Liam Chen',
    email: 'liam.chen@singapore-urban.sg',
    age: 24,
    profession: 'Architecture Student',
    referralCode: 'NUS-SG-44',
    location: {
      latitude: 1.3521,
      longitude: 103.8198,
      accuracy: 4.0,
      city: 'Singapore',
      region: 'Central',
      country: 'Singapore'
    },
    registeredAt: '2026-09-25T14:15:00.000Z'
  },
  {
    id: 'USR-8905',
    name: 'Sarah Jenkins',
    email: 'sjenkins@som-alumni.ny.us',
    age: 38,
    profession: 'Lead Structural Engineer',
    referralCode: 'NYC-REVIT-88',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 6.2,
      city: 'New York',
      region: 'New York',
      country: 'United States'
    },
    registeredAt: '2026-09-26T09:30:00.000Z'
  },
  {
    id: 'USR-8906',
    name: 'Kenji Takahashi',
    email: 'takahashi.k@tokyo-spatial.jp',
    age: 34,
    profession: 'Revit Family Specialist',
    referralCode: 'TOKYO-BIM-07',
    location: {
      latitude: 35.6762,
      longitude: 139.6503,
      accuracy: 3.5,
      city: 'Tokyo',
      region: 'Kanto',
      country: 'Japan'
    },
    registeredAt: '2026-09-26T16:04:00.000Z'
  },
  {
    id: 'USR-8907',
    name: 'Marcus Sterling',
    email: 'marcus@sterling-designs.co.uk',
    age: 41,
    profession: 'Studio Principal / Founder',
    referralCode: 'ARCH-LONDON-02',
    location: {
      latitude: 51.5142,
      longitude: -0.0931,
      accuracy: 5.5,
      city: 'London',
      region: 'Greater London',
      country: 'United Kingdom'
    },
    registeredAt: '2026-09-27T10:11:00.000Z'
  },
  {
    id: 'USR-8908',
    name: 'Priya Sharma',
    email: 'priya.cad@blr-tech.in',
    age: 26,
    profession: 'CAD Drafter / Technician',
    referralCode: 'BIM-BLR-14',
    location: {
      latitude: 12.9352,
      longitude: 77.6245,
      accuracy: 2.8,
      city: 'Bangalore',
      region: 'Karnataka',
      country: 'India'
    },
    registeredAt: '2026-09-27T12:55:00.000Z'
  },
  {
    id: 'USR-8909',
    name: 'Omar Al-Mansoor',
    email: 'omar@gulf-towers.ae',
    age: 36,
    profession: 'Senior Architect',
    referralCode: 'DXB-PARAM-33',
    location: {
      latitude: 25.2048,
      longitude: 55.2708,
      accuracy: 7.1,
      city: 'Dubai',
      region: 'Dubai',
      country: 'United Arab Emirates'
    },
    registeredAt: '2026-09-28T07:44:00.000Z'
  },
  {
    id: 'USR-8910',
    name: 'Chloe Dubois',
    email: 'c.dubois@ateliers-paris.fr',
    age: 30,
    profession: 'BIM Coordinator',
    referralCode: 'PARIS-RVT-19',
    location: {
      latitude: 48.8566,
      longitude: 2.3522,
      accuracy: 4.4,
      city: 'Paris',
      region: 'Île-de-France',
      country: 'France'
    },
    registeredAt: '2026-09-28T15:20:00.000Z'
  },
  {
    id: 'USR-8911',
    name: 'Rohan Deshmukh',
    email: 'rohan.d@iitb-alumni.in',
    age: 23,
    profession: 'Architecture Student',
    referralCode: 'BIM-BLR-21',
    location: {
      latitude: 12.9815,
      longitude: 77.5921,
      accuracy: 3.9,
      city: 'Bangalore',
      region: 'Karnataka',
      country: 'India'
    },
    registeredAt: '2026-09-29T10:05:00.000Z'
  },
  {
    id: 'USR-8912',
    name: 'Charlotte Wright',
    email: 'charlotte@shoreditch-arch.co.uk',
    age: 28,
    profession: 'Interior Architect',
    referralCode: 'ARCH-LONDON-05',
    location: {
      latitude: 51.5260,
      longitude: -0.0782,
      accuracy: 4.1,
      city: 'London',
      region: 'Greater London',
      country: 'United Kingdom'
    },
    registeredAt: '2026-09-29T17:30:00.000Z'
  }
];

// Pre-seeded active referral codes for testing & demonstration
const INITIAL_REFERRAL_CODES = [
  // Active available codes ready to be redeemed
  { code: 'ARCH-2026-ALPHA', status: 'available', createdAt: '2026-09-20', redeemedBy: null, tags: ['VIP', 'CAD'] },
  { code: 'BIM-VIP-789', status: 'available', createdAt: '2026-09-20', redeemedBy: null, tags: ['Revit', 'VIP'] },
  { code: 'CAD-PRO-452', status: 'available', createdAt: '2026-09-21', redeemedBy: null, tags: ['AutoCAD'] },
  { code: 'NEXUS-AI-999', status: 'available', createdAt: '2026-09-22', redeemedBy: null, tags: ['AI Prompt'] },
  { code: 'STUDIO-HUB-101', status: 'available', createdAt: '2026-09-22', redeemedBy: null, tags: ['Studio'] },
  { code: 'OFFICE-EXP-2026', status: 'available', createdAt: '2026-09-23', redeemedBy: null, tags: ['Expansion'] },
  { code: 'REVIT-DYN-555', status: 'available', createdAt: '2026-09-23', redeemedBy: null, tags: ['Dynamo'] },
  { code: 'PARAM-GEN-300', status: 'available', createdAt: '2026-09-24', redeemedBy: null, tags: ['Parametric'] },
  { code: 'GEO-LOC-777', status: 'available', createdAt: '2026-09-24', redeemedBy: null, tags: ['GeoTarget'] },
  { code: 'GLOBAL-1000-FREE', status: 'available', createdAt: '2026-09-25', redeemedBy: null, tags: ['General'] },
  
  // Already redeemed codes corresponding to initial users
  { code: 'ARCH-LONDON-01', status: 'redeemed', createdAt: '2026-09-20', redeemedBy: 'j.vance@fosterandpartners-alumni.com', redeemedAt: '2026-09-24T10:14:00.000Z' },
  { code: 'BIM-BLR-09', status: 'redeemed', createdAt: '2026-09-20', redeemedBy: 'aarav.bim@studioindus.in', redeemedAt: '2026-09-24T11:42:00.000Z' },
  { code: 'BERLIN-CAD-22', status: 'redeemed', createdAt: '2026-09-21', redeemedBy: 'elena.rostova@berlin-architekten.de', redeemedAt: '2026-09-25T08:20:00.000Z' },
  { code: 'NUS-SG-44', status: 'redeemed', createdAt: '2026-09-21', redeemedBy: 'liam.chen@singapore-urban.sg', redeemedAt: '2026-09-25T14:15:00.000Z' },
  { code: 'NYC-REVIT-88', status: 'redeemed', createdAt: '2026-09-22', redeemedBy: 'sjenkins@som-alumni.ny.us', redeemedAt: '2026-09-26T09:30:00.000Z' },
  { code: 'TOKYO-BIM-07', status: 'redeemed', createdAt: '2026-09-22', redeemedBy: 'takahashi.k@tokyo-spatial.jp', redeemedAt: '2026-09-26T16:04:00.000Z' },
  { code: 'ARCH-LONDON-02', status: 'redeemed', createdAt: '2026-09-23', redeemedBy: 'marcus@sterling-designs.co.uk', redeemedAt: '2026-09-27T10:11:00.000Z' },
  { code: 'BIM-BLR-14', status: 'redeemed', createdAt: '2026-09-23', redeemedBy: 'priya.cad@blr-tech.in', redeemedAt: '2026-09-27T12:55:00.000Z' },
  { code: 'DXB-PARAM-33', status: 'redeemed', createdAt: '2026-09-24', redeemedBy: 'omar@gulf-towers.ae', redeemedAt: '2026-09-28T07:44:00.000Z' },
  { code: 'PARIS-RVT-19', status: 'redeemed', createdAt: '2026-09-24', redeemedBy: 'c.dubois@ateliers-paris.fr', redeemedAt: '2026-09-28T15:20:00.000Z' },
  { code: 'BIM-BLR-21', status: 'redeemed', createdAt: '2026-09-25', redeemedBy: 'rohan.d@iitb-alumni.in', redeemedAt: '2026-09-29T10:05:00.000Z' },
  { code: 'ARCH-LONDON-05', status: 'redeemed', createdAt: '2026-09-25', redeemedBy: 'charlotte@shoreditch-arch.co.uk', redeemedAt: '2026-09-29T17:30:00.000Z' }
];

export const getQuotaSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTA);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return { totalQuota: TOTAL_FREE_QUOTA, manualRemaining: null };
};

export const getRemainingSlots = () => {
  const settings = getQuotaSettings();
  const users = getStoredUsers();
  if (settings.manualRemaining !== null && settings.manualRemaining !== undefined && !isNaN(settings.manualRemaining)) {
    return Math.max(0, parseInt(settings.manualRemaining, 10));
  }
  const total = settings.totalQuota || TOTAL_FREE_QUOTA;
  return Math.max(0, total - users.length);
};

export const setRemainingSlotsCount = (newCount) => {
  const current = getQuotaSettings();
  const count = parseInt(newCount, 10);
  const updated = {
    ...current,
    manualRemaining: isNaN(count) ? null : Math.max(0, count)
  };
  localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(updated));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexus_slots_updated', { detail: { remaining: getRemainingSlots() } }));
  }
  return getRemainingSlots();
};

export const resetRemainingSlotsToAuto = () => {
  const current = getQuotaSettings();
  const updated = {
    ...current,
    manualRemaining: null
  };
  localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(updated));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexus_slots_updated', { detail: { remaining: getRemainingSlots() } }));
  }
  return getRemainingSlots();
};

export const setTotalQuota = (newQuota) => {
  const current = getQuotaSettings();
  const q = parseInt(newQuota, 10) || TOTAL_FREE_QUOTA;
  const updated = {
    ...current,
    totalQuota: q
  };
  localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(updated));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexus_slots_updated', { detail: { remaining: getRemainingSlots() } }));
  }
  return getRemainingSlots();
};

export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
};

export const getStoredReferralCodes = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CODES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(INITIAL_REFERRAL_CODES));
      return INITIAL_REFERRAL_CODES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REFERRAL_CODES;
  }
};

export const validateReferralCode = (inputCode) => {
  if (!inputCode || typeof inputCode !== 'string') return { valid: false, message: 'Referral code is mandatory to unlock access.' };
  
  const cleanCode = inputCode.trim().toUpperCase();
  const codes = getStoredReferralCodes();
  const match = codes.find(c => c.code.toUpperCase() === cleanCode);

  if (!match) {
    return { valid: false, message: 'Invalid referral code. Please check or request an official invite code.' };
  }

  if (match.status === 'redeemed') {
    return { valid: false, message: `This referral code has already been redeemed.` };
  }

  return { valid: true, code: match.code, details: match };
};

export const registerUser = ({ name, email, age, profession, referralCode, location }) => {
  const users = getStoredUsers();
  const codes = getStoredReferralCodes();
  
  // Check if email already registered
  const existingUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existingUser) {
    throw new Error('This email address has already claimed free early access.');
  }

  // Validate referral code
  const validation = validateReferralCode(referralCode);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const cleanCode = referralCode.trim().toUpperCase();

  // Create new user record
  const newUser = {
    id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    age: parseInt(age, 10) || 25,
    profession: profession || 'Architect',
    referralCode: cleanCode,
    location: {
      latitude: location?.latitude || 51.5074,
      longitude: location?.longitude || -0.1278,
      accuracy: location?.accuracy ? Math.round(location.accuracy * 10) / 10 : 8.5,
      city: location?.city || 'London',
      region: location?.region || 'Greater London',
      country: location?.country || 'United Kingdom'
    },
    registeredAt: new Date().toISOString()
  };

  // Update codes
  const updatedCodes = codes.map(c => {
    if (c.code.toUpperCase() === cleanCode) {
      return {
        ...c,
        status: 'redeemed',
        redeemedBy: newUser.email,
        redeemedAt: newUser.registeredAt
      };
    }
    return c;
  });

  const updatedUsers = [newUser, ...users];

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(updatedCodes));

  // If manualRemaining override was active, decrement it by 1
  try {
    const quotaSettings = getQuotaSettings();
    if (quotaSettings.manualRemaining !== null && quotaSettings.manualRemaining !== undefined && quotaSettings.manualRemaining > 0) {
      quotaSettings.manualRemaining = Math.max(0, quotaSettings.manualRemaining - 1);
      localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(quotaSettings));
    }
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexus_slots_updated', { detail: { remaining: getRemainingSlots() } }));
  }

  return newUser;
};

export const generateReferralCodes = (count = 5, prefix = 'ARCH') => {
  const codes = getStoredReferralCodes();
  const newCodes = [];
  const cleanPrefix = (prefix || 'ARCH').toUpperCase().replace(/[^A-Z0-9]/g, '');

  for (let i = 0; i < count; i++) {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codeStr = `${cleanPrefix}-${randomHex}-${Math.floor(100 + Math.random() * 900)}`;
    newCodes.push({
      code: codeStr,
      status: 'available',
      createdAt: new Date().toISOString().split('T')[0],
      redeemedBy: null,
      tags: ['Admin-Generated']
    });
  }

  const merged = [...newCodes, ...codes];
  localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(merged));
  return merged;
};

export const deleteReferralCode = (codeToDelete) => {
  const codes = getStoredReferralCodes();
  const filtered = codes.filter(c => c.code !== codeToDelete);
  localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(filtered));
  return filtered;
};

export const getGeographicInsights = () => {
  const users = getStoredUsers();
  const cityMap = {};
  const countryMap = {};

  users.forEach(u => {
    const cityKey = `${u.location.city}, ${u.location.country}`;
    const countryKey = u.location.country;

    cityMap[cityKey] = cityMap[cityKey] || {
      city: u.location.city,
      country: u.location.country,
      count: 0,
      coordinates: [u.location.latitude, u.location.longitude],
      avgAccuracy: 0,
      totalAccuracy: 0,
      users: []
    };

    cityMap[cityKey].count += 1;
    cityMap[cityKey].totalAccuracy += (u.location.accuracy || 10);
    cityMap[cityKey].users.push(u);

    countryMap[countryKey] = (countryMap[countryKey] || 0) + 1;
  });

  const rankedCities = Object.values(cityMap).map(c => ({
    ...c,
    avgAccuracy: Math.round((c.totalAccuracy / c.count) * 10) / 10,
    percentage: Math.round((c.count / users.length) * 1000) / 10
  })).sort((a, b) => b.count - a.count);

  const topCandidate = rankedCities[0] || null;

  return {
    totalUsers: users.length,
    remainingSlots: getRemainingSlots(),
    rankedCities,
    countryBreakdown: countryMap,
    topCandidate
  };
};

export const resetStoreToMockData = () => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(INITIAL_REFERRAL_CODES));
  return { users: INITIAL_USERS, codes: INITIAL_REFERRAL_CODES };
};

// Admin authentication helpers
export const checkAdminAuth = () => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'authenticated_true';
};

export const loginAdmin = (usernameOrEmail, password) => {
  const userClean = (usernameOrEmail || '').trim().toLowerCase();
  if (userClean === 'metheadminlover@gmail.com' && password === 'bharanihema@2007') {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'authenticated_true');
    return { success: true };
  }
  return { success: false, message: 'Invalid administrator email or password.' };
};

export const logoutAdmin = () => {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
};
