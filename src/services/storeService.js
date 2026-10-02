/**
 * Store Service — Supabase-backed, fully async.
 * All user and referral-code data lives in Supabase so it's shared across
 * every device/browser. Admin auth session stays in localStorage only.
 */
import { supabase } from './supabaseClient';

export const TOTAL_FREE_QUOTA = 1000;
const ADMIN_AUTH_KEY = 'arch_nexus_admin_session_v1';

// ─── Row mappers ──────────────────────────────────────────────────────────────

const mapUser = (r) => ({
  id:           r.user_code || r.id,
  uuid:         r.id,
  name:         r.name,
  email:        r.email,
  age:          r.age,
  profession:   r.profession,
  referralCode: r.referral_code,
  location: {
    latitude:    r.lat          ?? null,
    longitude:   r.lng          ?? null,
    accuracy:    r.accuracy_m   ?? null,
    city:        r.city         ?? null,
    region:      r.region       ?? null,
    country:     r.country      ?? null,
    countryCode: r.country_code ?? null,
    suburb:      r.suburb       ?? null,
    postalCode:  r.postal_code  ?? null,
    source:      r.geo_source   ?? null,
  },
  registeredAt: r.registered_at,
});

const mapCode = (r) => ({
  code:        r.code,
  status:      r.status,
  createdAt:   r.created_at,
  redeemedBy:  r.redeemed_by  ?? null,
  redeemedAt:  r.redeemed_at  ?? null,
  tags:        r.tags         ?? [],
});

// ─── Initial seed codes ───────────────────────────────────────────────────────

const SEED_CODES = [
  { code: 'ARCH-2026-ALPHA',   status: 'available', tags: ['VIP', 'CAD'] },
  { code: 'NEXUS-BIM-101',     status: 'available', tags: ['Revit'] },
  { code: 'NEXUS-CAD-202',     status: 'available', tags: ['AutoCAD'] },
  { code: 'NEXUS-AI-303',      status: 'available', tags: ['AI Prompt'] },
  { code: 'NEXUS-STUDIO-404',  status: 'available', tags: ['Studio'] },
  { code: 'NEXUS-GEO-505',     status: 'available', tags: ['Expansion'] },
  { code: 'REVIT-DYN-606',     status: 'available', tags: ['Dynamo'] },
  { code: 'PARAM-GEN-707',     status: 'available', tags: ['Parametric'] },
  { code: 'NEXUS-PIONEER-808', status: 'available', tags: ['Pioneer'] },
  { code: 'GLOBAL-1000-FREE',  status: 'available', tags: ['General'] },
];

// ─── Users ────────────────────────────────────────────────────────────────────

export const getStoredUsers = async () => {
  const { data, error } = await supabase
    .from('nexus_users')
    .select('*')
    .order('registered_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapUser);
};

// ─── Referral Codes ───────────────────────────────────────────────────────────

export const getStoredReferralCodes = async () => {
  const { data, error } = await supabase
    .from('nexus_referral_codes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  // Auto-seed if table is empty
  if (!data || data.length === 0) {
    await supabase.from('nexus_referral_codes').insert(SEED_CODES);
    return SEED_CODES.map(c => ({ ...c, createdAt: new Date().toISOString(), redeemedBy: null, redeemedAt: null }));
  }
  return data.map(mapCode);
};

export const validateReferralCode = async (code) => {
  if (!code || typeof code !== 'string') return { valid: false, message: 'Referral code is required.' };
  const clean = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from('nexus_referral_codes')
    .select('code, status')
    .eq('code', clean)
    .maybeSingle();
  if (error || !data) return { valid: false, message: 'Invalid referral code. Please check your invitation pass.' };
  if (data.status === 'redeemed') return { valid: false, message: 'This referral code has already been used.' };
  return { valid: true, code: data.code };
};

export const generateReferralCodes = async (count = 5, prefix = 'NEXUS') => {
  const cleanPrefix = (prefix || 'NEXUS').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'NEXUS';
  const newCodes = Array.from({ length: parseInt(count, 10) || 5 }, () => ({
    code:   `${cleanPrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    status: 'available',
    tags:   ['Admin-Generated'],
  }));
  const { data, error } = await supabase.from('nexus_referral_codes').insert(newCodes).select();
  if (error) throw error;
  return (data || []).map(mapCode);
};

export const deleteUser = async (idOrUuid) => {
  const { error } = await supabase
    .from('nexus_users')
    .delete()
    .or(`id.eq.${idOrUuid},user_code.eq.${idOrUuid}`);
  if (error) throw error;
  dispatchUpdate();
};

export const createCustomReferralCode = async (code, tags = ['VIP']) => {
  const clean = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from('nexus_referral_codes')
    .insert([{ code: clean, status: 'available', tags }])
    .select();
  if (error) throw error;
  return mapCode(data[0]);
};

export const deleteReferralCode = async (code) => {
  const { error } = await supabase.from('nexus_referral_codes').delete().eq('code', code);
  if (error) throw error;
};

// ─── Quota ────────────────────────────────────────────────────────────────────

export const getQuotaSettings = async () => {
  const { data } = await supabase.from('nexus_quota').select('*').eq('id', 1).maybeSingle();
  if (!data) return { totalQuota: TOTAL_FREE_QUOTA, manualRemaining: null };
  return { totalQuota: data.total_quota || TOTAL_FREE_QUOTA, manualRemaining: data.manual_remaining ?? null };
};

export const getRemainingSlots = async () => {
  const [quota, { count }] = await Promise.all([
    getQuotaSettings(),
    supabase.from('nexus_users').select('*', { count: 'exact', head: true }),
  ]);
  if (quota.manualRemaining !== null && !isNaN(quota.manualRemaining)) return Math.max(0, quota.manualRemaining);
  return Math.max(0, (quota.totalQuota || TOTAL_FREE_QUOTA) - (count || 0));
};

export const setRemainingSlotsCount = async (val) => {
  const n = Math.max(0, parseInt(val, 10) || 0);
  const { error } = await supabase.from('nexus_quota').upsert({ id: 1, manual_remaining: n });
  if (error) throw error;
  dispatchUpdate();
  return { manualRemaining: n };
};

export const resetRemainingSlotsToAuto = async () => {
  const { error } = await supabase.from('nexus_quota').upsert({ id: 1, manual_remaining: null });
  if (error) throw error;
  dispatchUpdate();
  return { manualRemaining: null };
};

export const setTotalQuota = async (val) => {
  const q = Math.max(1, parseInt(val, 10) || TOTAL_FREE_QUOTA);
  const { error } = await supabase.from('nexus_quota').upsert({ id: 1, total_quota: q });
  if (error) throw error;
  dispatchUpdate();
  return { totalQuota: q };
};

// ─── Registration ─────────────────────────────────────────────────────────────

export const registerUser = async ({ name, email, age, profession, referralCode, location }) => {
  // 1. Mandatory Location coordinates check
  if (!location || location.latitude == null || location.longitude == null) {
    throw new Error('Verified geographic GPS coordinates are mandatory to claim a Pioneer Pass.');
  }

  // 2. Check slots
  const remaining = await getRemainingSlots();
  if (remaining <= 0) throw new Error('All 1,000 free lifetime pioneer slots have been claimed.');

  // 2. Duplicate email check
  const { data: existing } = await supabase
    .from('nexus_users').select('id').eq('email', email.trim().toLowerCase()).maybeSingle();
  if (existing) throw new Error('This email address has already claimed an access pass.');

  // 3. Validate code
  const codeCheck = await validateReferralCode(referralCode);
  if (!codeCheck.valid) throw new Error(codeCheck.message);

  // 4. Atomically redeem code (only update 'available' rows)
  const { count: updated } = await supabase
    .from('nexus_referral_codes')
    .update({ status: 'redeemed', redeemed_by: email.trim().toLowerCase(), redeemed_at: new Date().toISOString() })
    .eq('code', referralCode.trim().toUpperCase())
    .eq('status', 'available')
    .select('*', { count: 'exact', head: true });
  if (updated === 0) throw new Error('This referral code was just used. Please try another code.');

  // 5. Insert user
  const userCode = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
  const { data, error } = await supabase.from('nexus_users').insert({
    user_code:    userCode,
    name:         name.trim(),
    email:        email.trim().toLowerCase(),
    age:          parseInt(age, 10),
    profession,
    referral_code: referralCode.trim().toUpperCase(),
    lat:          location?.latitude    ?? null,
    lng:          location?.longitude   ?? null,
    accuracy_m:   location?.accuracy   ?? null,
    city:         location?.city        ?? null,
    region:       location?.region      ?? null,
    country:      location?.country     ?? null,
    country_code: location?.countryCode ?? null,
    suburb:       location?.suburb      ?? null,
    postal_code:  location?.postalCode  ?? null,
    geo_source:   location?.source      ?? null,
  }).select().single();

  if (error) throw new Error(error.message || 'Registration failed. Please try again.');
  dispatchUpdate();
  return mapUser(data);
};

// ─── Geographic Insights ──────────────────────────────────────────────────────

export const getGeographicInsights = async () => {
  const [users, remaining] = await Promise.all([getStoredUsers(), getRemainingSlots()]);
  if (users.length === 0) return { totalUsers: 0, remainingSlots: remaining, rankedCities: [], countryBreakdown: {}, topCandidate: null };

  const cityMap = {};
  const countryMap = {};
  users.forEach((u) => {
    const city    = u.location.city    || 'Unknown';
    const country = u.location.country || 'Unknown';
    const key     = `${city}|${country}`;
    cityMap[key] = cityMap[key] || { city, country, count: 0, totalAccuracy: 0 };
    cityMap[key].count++;
    cityMap[key].totalAccuracy += (u.location.accuracy ?? 999);
    countryMap[country] = (countryMap[country] || 0) + 1;
  });

  const rankedCities = Object.values(cityMap).map((c) => ({
    ...c,
    avgAccuracy:  Math.round((c.totalAccuracy / c.count) * 10) / 10,
    percentage:   Math.round((c.count / users.length) * 1000) / 10,
  })).sort((a, b) => b.count - a.count);

  return { totalUsers: users.length, remainingSlots: remaining, rankedCities, countryBreakdown: countryMap, topCandidate: rankedCities[0] || null };
};

// ─── Reset (admin only) ───────────────────────────────────────────────────────

export const resetStoreToEmpty = async () => {
  await supabase.from('nexus_users').delete().not('id', 'is', null);
  await supabase.from('nexus_referral_codes').delete().not('id', 'is', null);
  await supabase.from('nexus_referral_codes').insert(SEED_CODES);
  await supabase.from('nexus_quota').upsert({ id: 1, total_quota: TOTAL_FREE_QUOTA, manual_remaining: null });
  dispatchUpdate();
};

// ─── Admin auth (localStorage session only) ───────────────────────────────────

export const checkAdminAuth = () => localStorage.getItem(ADMIN_AUTH_KEY) === 'ok';

export const loginAdmin = (email, password) => {
  const E = (import.meta.env.VITE_ADMIN_EMAIL    || 'metheadminlover@gmail.com').toLowerCase().trim();
  const P =  import.meta.env.VITE_ADMIN_PASSWORD || 'bharanihema@2007';
  if (email.trim().toLowerCase() === E && password === P) {
    localStorage.setItem(ADMIN_AUTH_KEY, 'ok');
    return { success: true };
  }
  return { success: false, message: 'Invalid email or password.' };
};

export const logoutAdmin = () => localStorage.removeItem(ADMIN_AUTH_KEY);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const dispatchUpdate = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('nexus_slots_updated'));
};
