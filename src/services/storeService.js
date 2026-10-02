// Store service for managing 1,000 Free Users Campaign, Referral Codes & Geolocation Analytics

const STORAGE_KEYS = {
  USERS: 'arch_nexus_users_v2',
  CODES: 'arch_nexus_referral_codes_v2',
  ADMIN_AUTH: 'arch_nexus_admin_session_v1',
  QUOTA: 'arch_nexus_quota_v1'
};

export const TOTAL_FREE_QUOTA = 1000;

// NO fake users - starts completely clean for genuine user registrations
const INITIAL_USERS = [];

// Clean initial active referral codes ready for real pioneers (no fake redeemed codes)
const INITIAL_REFERRAL_CODES = [
  { code: 'ARCH-2026-ALPHA', status: 'available', createdAt: '2026-10-01', redeemedBy: null, tags: ['VIP', 'CAD'] },
  { code: 'NEXUS-BIM-101', status: 'available', createdAt: '2026-10-01', redeemedBy: null, tags: ['Revit'] },
  { code: 'NEXUS-CAD-202', status: 'available', createdAt: '2026-10-01', redeemedBy: null, tags: ['AutoCAD'] },
  { code: 'NEXUS-AI-303', status: 'available', createdAt: '2026-10-01', redeemedBy: null, tags: ['AI Prompt'] },
  { code: 'NEXUS-STUDIO-404', status: 'available', createdAt: '2026-10-01', redeemedBy: null, tags: ['Studio'] },
  { code: 'NEXUS-GEO-505', status: 'available', createdAt: '2026-10-01', redeemedBy: null, tags: ['Expansion'] },
  { code: 'REVIT-DYN-606', status: 'available', createdAt: '2026-10-01', redeemedBy: null, tags: ['Dynamo'] },
  { code: 'PARAM-GEN-707', status: 'available', createdAt: '2026-10-01', redeemedBy: null, tags: ['Parametric'] },
  { code: 'NEXUS-PIONEER-808', status: 'available', createdAt: '2026-10-01', redeemedBy: null, tags: ['Pioneer'] },
  { code: 'GLOBAL-1000-FREE', status: 'available', createdAt: '2026-10-01', redeemedBy: null, tags: ['General'] }
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
  return updated;
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
  return { ...updated, remainingSlots: getRemainingSlots() };
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
  return { ...updated, remainingSlots: getRemainingSlots() };
};

export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Purge any old fake demo records
        const genuineUsers = parsed.filter(u => !u.id?.startsWith('USR-89'));
        if (genuineUsers.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(genuineUsers));
        }
        return genuineUsers;
      }
    }
  } catch {}
  return INITIAL_USERS;
};

export const getStoredReferralCodes = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CODES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(INITIAL_REFERRAL_CODES));
  return INITIAL_REFERRAL_CODES;
};

export const validateReferralCode = (code) => {
  if (!code || typeof code !== 'string') {
    return { valid: false, message: 'Referral code is required.' };
  }

  const clean = code.trim().toUpperCase();
  const codes = getStoredReferralCodes();
  const found = codes.find(c => c.code.toUpperCase() === clean);

  if (!found) {
    return { valid: false, message: 'Invalid referral code. Please check your invitation pass.' };
  }

  if (found.status === 'redeemed') {
    return { valid: false, message: 'This referral code has already been redeemed.' };
  }

  return { valid: true, code: found.code, message: 'Valid code: 100% Free Lifetime Access Unlocked' };
};

export const registerUser = ({ name, email, age, profession, referralCode, location }) => {
  const users = getStoredUsers();
  const codes = getStoredReferralCodes();
  const quota = getRemainingSlots();

  if (quota <= 0) {
    throw new Error('All 1,000 free lifetime pioneer slots have been claimed.');
  }

  // Check duplicate email
  const existingEmail = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existingEmail) {
    throw new Error('This email address has already claimed an access pass.');
  }

  // Validate referral code
  const codeValidation = validateReferralCode(referralCode);
  if (!codeValidation.valid) {
    throw new Error(codeValidation.message);
  }

  // Generate ID
  const newId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;

  const newUser = {
    id: newId,
    name: name.trim(),
    email: email.trim(),
    age: parseInt(age, 10),
    profession,
    referralCode: referralCode.trim().toUpperCase(),
    location: {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy || 5,
      city: location.city || 'Undisclosed',
      region: location.region || '',
      country: location.country || 'Global'
    },
    registeredAt: new Date().toISOString()
  };

  // Mark referral code as redeemed
  const updatedCodes = codes.map(c => {
    if (c.code.toUpperCase() === referralCode.trim().toUpperCase()) {
      return {
        ...c,
        status: 'redeemed',
        redeemedBy: email.trim(),
        redeemedAt: new Date().toISOString()
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

export const generateReferralCodes = (count = 5, prefix = 'NEXUS') => {
  const codes = getStoredReferralCodes();
  const newCodes = [];
  const cleanPrefix = (prefix || 'NEXUS').toUpperCase().replace(/[^A-Z0-9]/g, '');

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
  
  if (users.length === 0) {
    return {
      totalUsers: 0,
      remainingSlots: getRemainingSlots(),
      rankedCities: [],
      countryBreakdown: {},
      topCandidate: null
    };
  }

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
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(INITIAL_REFERRAL_CODES));
  return { users: [], codes: INITIAL_REFERRAL_CODES };
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
