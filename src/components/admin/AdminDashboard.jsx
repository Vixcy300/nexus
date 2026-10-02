import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X, Users, Key, Globe, Download, Plus, Copy, Check,
  Trash2, Search, LogOut, RefreshCw, Settings2,
  Loader2, AlertTriangle, MapPin, TrendingUp,
  Shield, Navigation, ExternalLink, Mail, Send,
  ChevronRight, CheckCircle2, Filter, ArrowUpDown,
  Sparkles, SlidersHorizontal, Radio, Layers
} from 'lucide-react';
import {
  getStoredUsers, getStoredReferralCodes, generateReferralCodes,
  deleteReferralCode, logoutAdmin, getQuotaSettings, getRemainingSlots,
  setRemainingSlotsCount, resetRemainingSlotsToAuto, setTotalQuota,
  resetStoreToEmpty, deleteUser, createCustomReferralCode, TOTAL_FREE_QUOTA,
} from '../../services/storeService';
import { supabase } from '../../services/supabaseClient';

const TABS = [
  { id: 'users', label: 'Pioneer Registry & GPS', icon: Users },
  { id: 'codes', label: 'Referral Engine', icon: Key },
  { id: 'geo', label: 'Geo Analytics & Labs', icon: Globe },
  { id: 'settings', label: 'Studio Controls', icon: Settings2 },
];

export default function AdminDashboard({ isOpen, onClose, onRefreshData }) {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [quota, setQuota] = useState({ totalQuota: 1000, manualRemaining: null });
  const [remaining, setRemaining] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Users tab filters & state
  const [search, setSearch] = useState('');
  const [profFilter, setProfFilter] = useState('');
  const [geoFilter, setGeoFilter] = useState('all'); // 'all' | 'gps' | 'nogps'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'accuracy' | 'name'
  const [selectedUser, setSelectedUser] = useState(null);
  const [copiedCoords, setCopiedCoords] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  // Codes tab state
  const [genCount, setGenCount] = useState(5);
  const [genPrefix, setGenPrefix] = useState('NEXUS');
  const [customCode, setCustomCode] = useState('');
  const [customTag, setCustomTag] = useState('VIP');
  const [codeStatusFilter, setCodeStatusFilter] = useState('all'); // 'all' | 'available' | 'redeemed'
  const [codeSearch, setCodeSearch] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [copied, setCopied] = useState('');

  // Email resending state
  const [resendingEmailId, setResendingEmailId] = useState(null);

  // Settings tab state
  const [newManual, setNewManual] = useState('');
  const [newTotal, setNewTotal] = useState('');
  const [settingMsg, setSettingMsg] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, c, q, r] = await Promise.all([
        getStoredUsers(),
        getStoredReferralCodes(),
        getQuotaSettings(),
        getRemainingSlots(),
      ]);
      setUsers(u);
      setCodes(c);
      setQuota(q);
      setRemaining(r);
      if (onRefreshData) onRefreshData();
    } catch (e) {
      setError(e.message || 'Failed to sync with Supabase.');
    } finally {
      setLoading(false);
    }
  }, [onRefreshData]);

  // Load when opened
  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, refreshData]);

  // Real-time Supabase WebSockets channel
  useEffect(() => {
    if (!isOpen) return;
    const channel = supabase.channel('nexus_admin_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nexus_users' }, refreshData)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'nexus_users' }, refreshData)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'nexus_users' }, refreshData)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nexus_referral_codes' }, refreshData)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'nexus_referral_codes' }, refreshData)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'nexus_referral_codes' }, refreshData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, refreshData]);

  // Handle slot update custom events
  useEffect(() => {
    if (!isOpen) return;
    const fn = () => refreshData();
    window.addEventListener('nexus_slots_updated', fn);
    return () => window.removeEventListener('nexus_slots_updated', fn);
  }, [isOpen, refreshData]);

  // ─── Users Filtering & Sorting ──────────────────────────────────────────────
  const professions = useMemo(() => [...new Set(users.map(u => u.profession).filter(Boolean))], [users]);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter(u => {
      const matchSearch = !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.id?.toLowerCase().includes(q) ||
        u.referralCode?.toLowerCase().includes(q) ||
        u.location?.city?.toLowerCase().includes(q) ||
        u.location?.suburb?.toLowerCase().includes(q) ||
        u.location?.region?.toLowerCase().includes(q) ||
        u.location?.country?.toLowerCase().includes(q);

      const matchProf = !profFilter || u.profession === profFilter;
      
      const hasGps = u.location?.latitude != null && u.location?.longitude != null;
      const matchGeo = geoFilter === 'all' ? true : (geoFilter === 'gps' ? hasGps : !hasGps);

      return matchSearch && matchProf && matchGeo;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.registeredAt || 0) - new Date(b.registeredAt || 0);
      }
      if (sortBy === 'accuracy') {
        return (a.location?.accuracy ?? 9999) - (b.location?.accuracy ?? 9999);
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });
  }, [users, search, profFilter, geoFilter, sortBy]);

  const handleCopyCoords = (coords) => {
    navigator.clipboard.writeText(coords).then(() => {
      setCopiedCoords(coords);
      showNotice(`Coordinates copied: ${coords}`);
      setTimeout(() => setCopiedCoords(''), 2000);
    });
  };

  const handleDeleteSingleUser = async (userToDelete) => {
    if (!window.confirm(`Permanently remove pioneer "${userToDelete.name}" (${userToDelete.email})? This frees up 1 quota slot.`)) {
      return;
    }
    try {
      await deleteUser(userToDelete.uuid || userToDelete.id);
      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null);
      }
      showNotice(`Pioneer ${userToDelete.name} removed.`);
      await refreshData();
    } catch (e) {
      alert(`Deletion failed: ${e.message}`);
    }
  };

  const handleResendConfirmation = async (user) => {
    setResendingEmailId(user.id);
    try {
      const res = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          id: user.id,
          profession: user.profession,
          referralCode: user.referralCode,
          location: user.location,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showNotice(`Confirmation pass re-sent to ${user.email} ✓`);
      } else {
        alert(`Email dispatch error: ${data.error || 'Server error'}`);
      }
    } catch (err) {
      alert(`Network error dispatching email: ${err.message}`);
    } finally {
      setResendingEmailId(null);
    }
  };

  // ─── Referral Codes Handling ───────────────────────────────────────────────
  const availableCodes = useMemo(() => codes.filter(c => c.status === 'available'), [codes]);
  const redeemedCodes  = useMemo(() => codes.filter(c => c.status === 'redeemed'), [codes]);

  const filteredCodes = useMemo(() => {
    const q = codeSearch.toLowerCase().trim();
    return codes.filter(c => {
      const matchSearch = !q ||
        c.code?.toLowerCase().includes(q) ||
        c.redeemedBy?.toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q));

      const matchStatus = codeStatusFilter === 'all' || c.status === codeStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [codes, codeSearch, codeStatusFilter]);

  const handleGenerateBatch = async () => {
    setGenLoading(true);
    try {
      await generateReferralCodes(genCount, genPrefix);
      await refreshData();
      showNotice(`Generated ${genCount} codes with prefix ${genPrefix.toUpperCase()} ✓`);
    } catch (e) {
      alert(`Generate failed: ${e.message}`);
    } finally {
      setGenLoading(false);
    }
  };

  const handleCreateCustomCode = async (e) => {
    e.preventDefault();
    if (!customCode.trim()) return;
    setGenLoading(true);
    try {
      const tags = customTag.split(',').map(t => t.trim()).filter(Boolean);
      await createCustomReferralCode(customCode, tags.length ? tags : ['VIP']);
      setCustomCode('');
      await refreshData();
      showNotice(`Custom code created: ${customCode.toUpperCase()} ✓`);
    } catch (err) {
      alert(`Creation error: ${err.message}`);
    } finally {
      setGenLoading(false);
    }
  };

  const handleDeleteCode = async (code) => {
    if (!window.confirm(`Delete referral pass "${code}"?`)) return;
    try {
      await deleteReferralCode(code);
      await refreshData();
      showNotice(`Code ${code} deleted.`);
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      showNotice(`Code copied: ${code}`);
      setTimeout(() => setCopied(''), 1500);
    });
  };

  const handleCopyAllAvailableCodes = () => {
    if (!availableCodes.length) return;
    const text = availableCodes.map(c => c.code).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      showNotice(`Copied ${availableCodes.length} available codes to clipboard!`);
    });
  };

  // ─── Geo Analytics ────────────────────────────────────────────────────────
  const geoData = useMemo(() => {
    if (!users.length) return { rankedCities: [], countries: {}, withGps: 0, highPrecision: 0 };
    const cityMap = {};
    const countries = {};
    let withGps = 0;
    let highPrecision = 0;

    users.forEach(u => {
      const city = u.location?.city || 'Unknown';
      const country = u.location?.country || 'Global Network';
      const key = `${city}|${country}`;
      cityMap[key] = cityMap[key] || { city, country, count: 0, gpsCount: 0, sumAccuracy: 0 };
      cityMap[key].count++;

      if (u.location?.latitude != null && u.location?.longitude != null) {
        withGps++;
        cityMap[key].gpsCount++;
        if (u.location?.accuracy != null) {
          cityMap[key].sumAccuracy += u.location.accuracy;
          if (u.location.accuracy <= 30) highPrecision++;
        }
      }
      countries[country] = (countries[country] || 0) + 1;
    });

    const rankedCities = Object.values(cityMap).map(c => ({
      ...c,
      avgAccuracy: c.gpsCount > 0 ? Math.round(c.sumAccuracy / c.gpsCount) : null,
    })).sort((a, b) => b.count - a.count);

    return { rankedCities, countries, withGps, highPrecision };
  }, [users]);

  // ─── Settings Controls ────────────────────────────────────────────────────
  const doSetManual = async () => {
    try {
      await setRemainingSlotsCount(newManual);
      setSettingMsg('Manual remaining slots updated ✓');
      await refreshData();
    } catch (e) {
      setSettingMsg(`Error: ${e.message}`);
    }
  };

  const doResetAuto = async () => {
    try {
      await resetRemainingSlotsToAuto();
      setSettingMsg('Reset to automatic slot calculation ✓');
      await refreshData();
    } catch (e) {
      setSettingMsg(`Error: ${e.message}`);
    }
  };

  const doSetTotal = async () => {
    try {
      await setTotalQuota(newTotal);
      setSettingMsg('Total quota cap updated ✓');
      await refreshData();
    } catch (e) {
      setSettingMsg(`Error: ${e.message}`);
    }
  };

  const doResetEntireStore = async () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    try {
      await resetStoreToEmpty();
      setResetConfirm(false);
      await refreshData();
      showNotice('Database reset to fresh state ✓');
    } catch (e) {
      alert(`Reset error: ${e.message}`);
    }
  };

  // ─── Exports ──────────────────────────────────────────────────────────────
  const exportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      studioQuota: quota,
      remainingSlots: remaining,
      totalUsers: users.length,
      users,
      referralCodes: codes,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-telemetry-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Exported full JSON archive ✓');
  };

  const exportCSV = () => {
    const rows = [
      [
        'Member ID', 'Name', 'Email', 'Age', 'Profession', 'Referral Code',
        'Suburb', 'Postal Code', 'City', 'Region', 'Country',
        'Latitude', 'Longitude', 'GPS Accuracy (m)', 'Direct Google Maps Navigation Link',
        'Registered At'
      ],
      ...users.map(u => [
        u.id,
        u.name,
        u.email,
        u.age,
        u.profession,
        u.referralCode,
        u.location?.suburb,
        u.location?.postalCode,
        u.location?.city,
        u.location?.region,
        u.location?.country,
        u.location?.latitude,
        u.location?.longitude,
        u.location?.accuracy,
        u.location?.latitude && u.location?.longitude
          ? `https://www.google.com/maps?q=${u.location.latitude},${u.location.longitude}`
          : '',
        u.registeredAt,
      ]),
    ];
    const csvContent = rows.map(r => r.map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-pioneers-gps-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Exported CSV with GPS telemetry ✓');
  };

  const handleLogout = () => {
    logoutAdmin();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-ink-950 text-mist-100 flex flex-col overflow-hidden font-body antialiased selection:bg-signal selection:text-ink-950">
      
      {/* ── Top Command Bar ─────────────────────────────────────────────────── */}
      <header className="shrink-0 bg-ink-900/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-signal/10 border border-signal/30 flex items-center justify-center text-signal shrink-0 shadow-lg shadow-signal/10">
            <Shield size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-white text-sm sm:text-base tracking-tight">
                NEXUS STUDIO
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-signal bg-signal/10 px-2 py-0.5 rounded-full border border-signal/25 hidden xs:inline-block">
                Command OS
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-mist-700">
              <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Realtime Sync
              </span>
              <span className="hidden md:inline text-white/20">•</span>
              <span className="hidden md:inline text-[11px] text-mist-900 truncate">
                metheadminlover@gmail.com
              </span>
            </div>
          </div>
        </div>

        {/* Global Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="bg-ink-950/80 border border-white/10 rounded-xl px-3 py-1.5 hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-signal"></div>
            <span className="font-mono text-xs text-white font-bold">{remaining}</span>
            <span className="font-mono text-[10px] text-mist-700 uppercase tracking-wider">Slots Left</span>
          </div>

          <button
            onClick={refreshData}
            disabled={loading}
            title="Force refresh data"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-ink-800/80 border border-white/10 text-mist-500 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 text-xs font-mono disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-signal' : ''} />
            <span className="hidden md:inline">Sync</span>
          </button>

          <button
            onClick={handleLogout}
            title="Log out of admin session"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-ink-800/80 border border-white/10 text-mist-500 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center gap-2 text-xs font-mono"
          >
            <LogOut size={14} />
            <span className="hidden md:inline">Logout</span>
          </button>

          <button
            onClick={onClose}
            title="Close command panel"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-mist-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* ── Sub Navigation Tabs ──────────────────────────────────────────────── */}
      <nav className="shrink-0 bg-ink-900/60 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar z-10">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2.5 px-4 py-3.5 font-mono text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
              tab === id
                ? 'border-signal text-signal bg-signal/5'
                : 'border-transparent text-mist-700 hover:text-mist-100 hover:bg-white/[0.02]'
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
            {id === 'users' && users.length > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                tab === id ? 'bg-signal text-ink-950' : 'bg-white/10 text-mist-500'
              }`}>
                {users.length}
              </span>
            )}
            {id === 'codes' && availableCodes.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                {availableCodes.length}
              </span>
            )}
          </button>
        ))}

        {/* Global Toast Notification */}
        {actionNotice && (
          <div className="ml-auto hidden sm:flex items-center gap-2 text-xs font-mono text-signal bg-signal/10 border border-signal/30 px-3 py-1 rounded-full animate-fade-in">
            <CheckCircle2 size={13} />
            <span>{actionNotice}</span>
          </div>
        )}
      </nav>

      {/* ── Main Dashboard Body ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        
        {/* Loading Banner */}
        {loading && (
          <div className="flex items-center justify-center py-12 gap-3 text-signal font-mono text-sm bg-ink-900/40 border border-white/5 rounded-2xl">
            <Loader2 size={18} className="animate-spin" />
            <span>Refreshing live architectural telemetry from Supabase…</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-3.5 text-red-400 font-mono text-sm">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-white mb-1">Supabase Live Connection Interrupted</div>
              <p className="text-xs text-red-300/80 mb-3">{error}</p>
              <button
                onClick={refreshData}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-xs font-mono text-white hover:bg-red-500/30 transition-colors"
              >
                Reconnect Supabase
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 1: PIONEER REGISTRY & GPS ─────────────────────────────────── */}
        {!loading && !error && tab === 'users' && (
          <div className="space-y-6">
            
            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-ink-900/70 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-mist-700 uppercase tracking-widest font-semibold">
                    Registered Pioneers
                  </span>
                  <Users size={16} className="text-signal" />
                </div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-white">
                  {users.length}
                </div>
                <div className="font-mono text-[10px] text-mist-700 mt-1">
                  {((users.length / quota.totalQuota) * 100).toFixed(1)}% of {quota.totalQuota} target cap
                </div>
              </div>

              <div className="bg-ink-900/70 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-mist-700 uppercase tracking-widest font-semibold">
                    GPS Precision Locks
                  </span>
                  <Navigation size={16} className="text-emerald-400 rotate-45" />
                </div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-emerald-400">
                  {geoData.withGps}
                </div>
                <div className="font-mono text-[10px] text-mist-700 mt-1">
                  {users.length > 0 ? Math.round((geoData.withGps / users.length) * 100) : 0}% telemetry rate ({geoData.highPrecision} ≤30m)
                </div>
              </div>

              <div className="bg-ink-900/70 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-mist-700 uppercase tracking-widest font-semibold">
                    Referral Inventory
                  </span>
                  <Key size={16} className="text-blue-400" />
                </div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-blue-400">
                  {availableCodes.length}
                </div>
                <div className="font-mono text-[10px] text-mist-700 mt-1">
                  {redeemedCodes.length} redeemed passes logged
                </div>
              </div>

              <div className="bg-ink-900/70 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-mist-700 uppercase tracking-widest font-semibold">
                    Remaining Passes
                  </span>
                  <Sparkles size={16} className="text-purple-400" />
                </div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-purple-400">
                  {remaining}
                </div>
                <div className="font-mono text-[10px] text-mist-700 mt-1">
                  {quota.manualRemaining !== null ? 'Manual slot override active' : 'Real-time auto calculated'}
                </div>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="bg-ink-900/80 border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-700" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search pioneer by name, email, ID, city, code…"
                    className="w-full bg-ink-950 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-signal/50 placeholder-mist-900 transition-colors"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-mist-700 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Profession filter */}
                <select
                  value={profFilter}
                  onChange={(e) => setProfFilter(e.target.value)}
                  className="bg-ink-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-mist-100 focus:outline-none focus:border-signal/50"
                >
                  <option value="">All Disciplines ({professions.length})</option>
                  {professions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                {/* GPS lock filter */}
                <select
                  value={geoFilter}
                  onChange={(e) => setGeoFilter(e.target.value)}
                  className="bg-ink-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-mist-100 focus:outline-none focus:border-signal/50"
                >
                  <option value="all">All Telemetry</option>
                  <option value="gps">GPS Fixed Only ({geoData.withGps})</option>
                  <option value="nogps">No GPS ({users.length - geoData.withGps})</option>
                </select>

                {/* Sorting */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-ink-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-mist-100 focus:outline-none focus:border-signal/50"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="accuracy">Sort: Highest GPS Accuracy</option>
                  <option value="name">Sort: Name (A-Z)</option>
                </select>
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                <button
                  onClick={exportCSV}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-ink-800 border border-white/10 text-mist-100 hover:text-white hover:border-signal/40 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Download size={13} className="text-signal" />
                  <span>CSV with GPS</span>
                </button>
                <button
                  onClick={exportJSON}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-ink-800 border border-white/10 text-mist-100 hover:text-white hover:border-white/30 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Download size={13} />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            {/* Table / List View */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-20 bg-ink-900/40 border border-white/5 rounded-3xl p-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-mist-700">
                  <Users size={22} />
                </div>
                <h4 className="font-display text-lg font-bold text-white mb-1">
                  {users.length === 0 ? 'No Pioneers Registered' : 'No Matching Pioneers Found'}
                </h4>
                <p className="font-mono text-xs text-mist-700 max-w-sm mx-auto">
                  {users.length === 0
                    ? 'Incoming registration data with GPS telemetry will automatically stream here in real-time.'
                    : 'Try clearing your search query or adjusting your discipline / GPS filters.'}
                </p>
              </div>
            ) : (
              <div className="bg-ink-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="bg-ink-950/80 border-b border-white/10 text-[10px] text-mist-700 uppercase tracking-widest">
                        <th className="px-4 py-3.5 w-12 text-center">#</th>
                        <th className="px-4 py-3.5">Pioneer Identity</th>
                        <th className="px-4 py-3.5">Discipline &amp; Role</th>
                        <th className="px-4 py-3.5">Pass Code</th>
                        <th className="px-4 py-3.5">Geographic Location</th>
                        <th className="px-4 py-3.5">Exact GPS Fix</th>
                        <th className="px-4 py-3.5">Precision</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map((u, i) => {
                        const hasCoords = u.location?.latitude != null && u.location?.longitude != null;
                        const lat = hasCoords ? Number(u.location.latitude).toFixed(6) : null;
                        const lng = hasCoords ? Number(u.location.longitude).toFixed(6) : null;
                        const coordStr = hasCoords ? `${lat}, ${lng}` : null;
                        const mapsUrl = hasCoords ? `https://www.google.com/maps?q=${u.location.latitude},${u.location.longitude}` : null;

                        return (
                          <tr
                            key={u.uuid || u.id}
                            className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                            onClick={() => setSelectedUser(u)}
                          >
                            <td className="px-4 py-4 text-center text-mist-900 font-mono text-xs">
                              {i + 1}
                            </td>

                            {/* Pioneer Identity */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-signal/10 border border-signal/30 text-signal font-display font-bold flex items-center justify-center text-xs shrink-0">
                                  {u.name ? u.name.charAt(0).toUpperCase() : 'P'}
                                </div>
                                <div>
                                  <div className="font-semibold text-white flex items-center gap-2">
                                    <span>{u.name}</span>
                                    <span className="font-mono text-[10px] text-signal bg-signal/10 px-1.5 py-0.2 rounded border border-signal/20">
                                      #{u.id}
                                    </span>
                                  </div>
                                  <div className="text-mist-700 text-[11px] font-mono mt-0.5">
                                    {u.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Profession */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-mist-100 font-medium">{u.profession}</div>
                              <div className="text-mist-900 text-[10px]">
                                Age: {u.age || '—'}
                              </div>
                            </td>

                            {/* Referral Code */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="font-mono text-xs font-semibold text-signal bg-signal/5 px-2 py-1 rounded-md border border-signal/20">
                                {u.referralCode}
                              </span>
                            </td>

                            {/* Location */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-white font-medium">
                                <MapPin size={12} className="text-signal shrink-0" />
                                <span>
                                  {[u.location?.suburb, u.location?.city].filter(Boolean).join(', ') || u.location?.city || 'Undisclosed'}
                                </span>
                              </div>
                              <div className="text-mist-700 text-[10px] pl-4">
                                {[u.location?.region, u.location?.country].filter(Boolean).join(', ')}
                                {u.location?.postalCode && ` • ${u.location.postalCode}`}
                              </div>
                            </td>

                            {/* Coordinates with copy */}
                            <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              {hasCoords ? (
                                <div className="inline-flex items-center gap-1.5 bg-ink-950 border border-white/10 px-2.5 py-1 rounded-lg">
                                  <span className="text-emerald-300 font-mono text-[11px] select-all">
                                    {coordStr}
                                  </span>
                                  <button
                                    onClick={() => handleCopyCoords(`${u.location.latitude}, ${u.location.longitude}`)}
                                    title="Copy latitude &amp; longitude"
                                    className="p-1 hover:text-white text-mist-700 transition-colors"
                                  >
                                    {copiedCoords === `${u.location.latitude}, ${u.location.longitude}` ? (
                                      <Check size={11} className="text-emerald-400" />
                                    ) : (
                                      <Copy size={11} />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-mist-900 text-[11px] italic">No GPS Lock</span>
                              )}
                            </td>

                            {/* Precision */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              {u.location?.accuracy != null ? (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  u.location.accuracy <= 30
                                    ? 'bg-signal/15 text-signal border-signal/30'
                                    : u.location.accuracy <= 100
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                }`}>
                                  ±{Math.round(u.location.accuracy)}m {u.location.accuracy <= 30 ? 'Precision' : ''}
                                </span>
                              ) : (
                                <span className="text-mist-900">—</span>
                              )}
                            </td>

                            {/* Row Action buttons */}
                            <td className="px-4 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                {hasCoords && (
                                  <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open coordinates in Google Maps"
                                    className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-white transition-all"
                                  >
                                    <Navigation size={12} className="rotate-45" />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleResendConfirmation(u)}
                                  disabled={resendingEmailId === u.id}
                                  title="Resend Access Confirmation Email"
                                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-mist-500 hover:text-signal hover:border-signal/30 transition-all disabled:opacity-50"
                                >
                                  {resendingEmailId === u.id ? (
                                    <Loader2 size={12} className="animate-spin text-signal" />
                                  ) : (
                                    <Mail size={12} />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteSingleUser(u)}
                                  title="Delete pioneer pass"
                                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-mist-700 hover:text-red-400 hover:border-red-500/30 transition-all"
                                >
                                  <Trash2 size={12} />
                                </button>
                                <button
                                  onClick={() => setSelectedUser(u)}
                                  title="View full dossier"
                                  className="p-1.5 rounded-lg bg-signal/10 border border-signal/20 text-signal hover:bg-signal/20 transition-all ml-1"
                                >
                                  <ChevronRight size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="bg-ink-950/60 border-t border-white/5 px-6 py-3 flex items-center justify-between font-mono text-[11px] text-mist-700">
                  <span>Showing {filteredUsers.length} of {users.length} registered pioneers</span>
                  <span>Click any row to open full architect dossier</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: REFERRAL ENGINE ────────────────────────────────────────── */}
        {!loading && !error && tab === 'codes' && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-ink-900/70 border border-white/10 rounded-2xl p-5">
                <span className="font-mono text-[10px] text-mist-700 uppercase tracking-widest font-semibold block mb-1">
                  Total Managed Codes
                </span>
                <div className="font-display text-3xl font-bold text-white">{codes.length}</div>
              </div>
              <div className="bg-ink-900/70 border border-white/10 rounded-2xl p-5">
                <span className="font-mono text-[10px] text-mist-700 uppercase tracking-widest font-semibold block mb-1">
                  Active &amp; Available
                </span>
                <div className="font-display text-3xl font-bold text-emerald-400">{availableCodes.length}</div>
              </div>
              <div className="bg-ink-900/70 border border-white/10 rounded-2xl p-5">
                <span className="font-mono text-[10px] text-mist-700 uppercase tracking-widest font-semibold block mb-1">
                  Claimed &amp; Redeemed
                </span>
                <div className="font-display text-3xl font-bold text-amber-400">{redeemedCodes.length}</div>
              </div>
            </div>

            {/* Creation Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Batch generator */}
              <div className="bg-ink-900/80 border border-white/10 rounded-2xl p-5">
                <div className="font-display text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Sparkles size={16} className="text-signal" />
                  <span>Batch Code Generator</span>
                </div>
                <p className="font-mono text-xs text-mist-700 mb-4">
                  Generate unique cryptographic invite codes with custom studio prefixes.
                </p>
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <label className="font-mono text-[10px] text-mist-700 block mb-1.5">Count</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={genCount}
                      onChange={(e) => setGenCount(e.target.value)}
                      className="w-20 bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-signal"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-mist-700 block mb-1.5">Prefix</label>
                    <input
                      type="text"
                      value={genPrefix}
                      onChange={(e) => setGenPrefix(e.target.value.toUpperCase())}
                      placeholder="NEXUS"
                      className="w-32 bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs uppercase focus:outline-none focus:border-signal"
                    />
                  </div>
                  <button
                    onClick={handleGenerateBatch}
                    disabled={genLoading}
                    className="px-4 py-2 rounded-xl bg-signal text-ink-950 font-mono text-xs font-bold hover:bg-signal-dim transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-lg shadow-signal/15"
                  >
                    {genLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                    <span>Generate Batch</span>
                  </button>
                </div>
              </div>

              {/* Single custom code */}
              <form onSubmit={handleCreateCustomCode} className="bg-ink-900/80 border border-white/10 rounded-2xl p-5">
                <div className="font-display text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Key size={16} className="text-blue-400" />
                  <span>Custom VIP Pass</span>
                </div>
                <p className="font-mono text-xs text-mist-700 mb-4">
                  Mint a specific vanity pass code for partners, conferences, or VIP studios.
                </p>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[140px]">
                    <label className="font-mono text-[10px] text-mist-700 block mb-1.5">Pass Code</label>
                    <input
                      type="text"
                      required
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                      placeholder="e.g. ZAHA-VIP-2026"
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs uppercase focus:outline-none focus:border-signal"
                    />
                  </div>
                  <div className="w-28">
                    <label className="font-mono text-[10px] text-mist-700 block mb-1.5">Tag</label>
                    <input
                      type="text"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="VIP, CAD"
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-signal"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={genLoading || !customCode.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-500 text-white font-mono text-xs font-bold hover:bg-blue-600 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Plus size={13} />
                    <span>Create Code</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Filter and Code List */}
            <div className="bg-ink-900/80 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex gap-3 items-center w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-700" />
                  <input
                    type="text"
                    value={codeSearch}
                    onChange={(e) => setCodeSearch(e.target.value)}
                    placeholder="Search codes, users, tags…"
                    className="w-full bg-ink-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-signal"
                  />
                </div>
                <select
                  value={codeStatusFilter}
                  onChange={(e) => setCodeStatusFilter(e.target.value)}
                  className="bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-mist-100 focus:outline-none focus:border-signal"
                >
                  <option value="all">All Statuses ({codes.length})</option>
                  <option value="available">Available ({availableCodes.length})</option>
                  <option value="redeemed">Redeemed ({redeemedCodes.length})</option>
                </select>
              </div>

              <button
                onClick={handleCopyAllAvailableCodes}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-ink-800 border border-white/10 text-mist-100 hover:text-white hover:border-signal/40 text-xs font-mono flex items-center justify-center gap-2 transition-all"
              >
                <Copy size={13} className="text-signal" />
                <span>Copy All Available Codes ({availableCodes.length})</span>
              </button>
            </div>

            {/* Codes Table */}
            <div className="bg-ink-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="bg-ink-950/80 border-b border-white/10 text-[10px] text-mist-700 uppercase tracking-widest">
                      <th className="px-5 py-3.5">Referral Code</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Tags</th>
                      <th className="px-5 py-3.5">Redeemed By</th>
                      <th className="px-5 py-3.5">Created Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCodes.map((c) => (
                      <tr key={c.code} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-white tracking-wider">
                          <span className="font-mono text-signal">{c.code}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            c.status === 'available'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}>
                            {c.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {c.tags?.map((t) => (
                              <span key={t} className="bg-ink-950 border border-white/10 text-mist-500 px-2 py-0.5 rounded text-[10px]">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-mist-500 truncate max-w-[180px]">
                          {c.redeemedBy || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-mist-700 whitespace-nowrap">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCopyCode(c.code)}
                              title="Copy code"
                              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-mist-500 hover:text-white transition-colors"
                            >
                              {copied === c.code ? <Check size={13} className="text-signal" /> : <Copy size={13} />}
                            </button>
                            {c.status === 'available' && (
                              <button
                                onClick={() => handleDeleteCode(c.code)}
                                title="Delete code"
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-mist-700 hover:text-red-400 hover:border-red-500/30 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: GEO ANALYTICS & LABS ───────────────────────────────────── */}
        {!loading && !error && tab === 'geo' && (
          <div className="space-y-6">
            
            {users.length === 0 ? (
              <div className="text-center py-20 bg-ink-900/40 border border-white/5 rounded-3xl p-8">
                <Globe size={32} className="mx-auto text-mist-700 mb-3" />
                <h4 className="font-display text-lg font-bold text-white mb-1">No Geographic Data Available</h4>
                <p className="font-mono text-xs text-mist-700">Pioneer registrations with GPS fixes will populate the research map.</p>
              </div>
            ) : (
              <>
                {/* Top Research Candidate */}
                {geoData.rankedCities[0] && (
                  <div className="bg-gradient-to-r from-signal/15 via-ink-900 to-ink-900 border border-signal/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl shadow-signal/5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-signal/20 border border-signal/40 flex items-center justify-center text-signal shrink-0 shadow-lg shadow-signal/20">
                        <TrendingUp size={26} />
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-signal uppercase tracking-widest font-bold mb-1">
                          Strategic Expansion Lab Candidate #1
                        </div>
                        <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                          {geoData.rankedCities[0].city}, {geoData.rankedCities[0].country}
                        </h3>
                        <p className="font-mono text-xs text-mist-700 mt-1">
                          {geoData.rankedCities[0].count} Verified Pioneer Signups • {((geoData.rankedCities[0].count / users.length) * 100).toFixed(1)}% density index
                          {geoData.rankedCities[0].avgAccuracy && ` • Avg GPS Accuracy ±${geoData.rankedCities[0].avgAccuracy}m`}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${geoData.rankedCities[0].city}, ${geoData.rankedCities[0].country}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 rounded-full bg-signal text-ink-950 font-display font-semibold text-xs sm:text-sm hover:bg-signal-dim transition-all flex items-center gap-2 shadow-lg shadow-signal/20 shrink-0"
                    >
                      <Navigation size={14} className="rotate-45" />
                      <span>Inspect Hub Area in Maps</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                {/* Ranked Hubs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* City Rankings */}
                  <div className="lg:col-span-2 bg-ink-900/80 border border-white/10 rounded-3xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                      <div className="font-display font-bold text-white text-sm flex items-center gap-2">
                        <MapPin size={15} className="text-signal" />
                        <span>Metropolitan Density Rankings</span>
                      </div>
                      <span className="font-mono text-[10px] text-mist-700">
                        {geoData.rankedCities.length} Global Hubs
                      </span>
                    </div>

                    <div className="divide-y divide-white/5">
                      {geoData.rankedCities.map((c, i) => (
                        <div key={`${c.city}|${c.country}`} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.01] transition-colors">
                          <span className="font-mono text-xs font-bold text-mist-700 w-6">
                            #{i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm flex items-center gap-2">
                              <span>{c.city}</span>
                              <span className="text-mist-700 text-xs font-mono font-normal">({c.country})</span>
                            </div>
                            <div className="font-mono text-[10px] text-mist-900 mt-0.5">
                              {c.gpsCount} of {c.count} fixes verified
                              {c.avgAccuracy && ` • ±${c.avgAccuracy}m accuracy`}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-mono font-bold text-sm text-white">{c.count}</div>
                            <div className="font-mono text-[10px] text-mist-700">
                              {((c.count / users.length) * 100).toFixed(1)}%
                            </div>
                          </div>

                          {/* Meter bar */}
                          <div className="w-24 sm:w-32 shrink-0">
                            <div className="h-2 bg-ink-950 rounded-full overflow-hidden border border-white/5">
                              <div
                                className="h-full bg-signal rounded-full transition-all"
                                style={{
                                  width: `${(c.count / (geoData.rankedCities[0]?.count || 1)) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Country Breakdown & Telemetry */}
                  <div className="space-y-4">
                    <div className="bg-ink-900/80 border border-white/10 rounded-3xl p-6">
                      <div className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
                        <Globe size={15} className="text-blue-400" />
                        <span>Territorial Breakdown</span>
                      </div>
                      <div className="space-y-3 font-mono text-xs">
                        {Object.entries(geoData.countries).map(([country, count]) => (
                          <div key={country} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <span className="text-mist-500">{country}</span>
                            <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded">
                              {count} pioneers
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-ink-900/80 border border-white/10 rounded-3xl p-6">
                      <div className="font-display font-bold text-white text-sm mb-2 flex items-center gap-2">
                        <Radio size={15} className="text-signal animate-pulse" />
                        <span>Telemetry Accuracy Index</span>
                      </div>
                      <p className="font-mono text-xs text-mist-700 mb-4">
                        W3C Geolocation API with Nominatim reverse geocoding cache.
                      </p>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between text-mist-500">
                          <span>Total Telemetry Fixes</span>
                          <span className="text-white font-bold">{geoData.withGps} / {users.length}</span>
                        </div>
                        <div className="flex justify-between text-mist-500">
                          <span>Sub-30m Precision Fixes</span>
                          <span className="text-signal font-bold">{geoData.highPrecision}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 4: STUDIO CONTROLS & SETTINGS ──────────────────────────────── */}
        {!loading && !error && tab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            {settingMsg && (
              <div className="bg-signal/10 border border-signal/30 rounded-2xl px-5 py-3 font-mono text-xs text-signal flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{settingMsg}</span>
              </div>
            )}

            {/* Campaign Quota Controls */}
            <div className="bg-ink-900/80 border border-white/10 rounded-3xl p-6 space-y-5">
              <div>
                <h4 className="font-display text-base font-bold text-white">Campaign Quota Controls</h4>
                <p className="font-mono text-xs text-mist-700 mt-0.5">
                  Currently: {quota.manualRemaining !== null
                    ? `Manual Override Mode (${quota.manualRemaining} slots displayed)`
                    : `Dynamic Mode (${quota.totalQuota} max cap − ${users.length} registered = ${remaining} slots remaining)`}
                </p>
              </div>

              {/* Set manual slots */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-mist-500 block">
                  Force Manual Remaining Slots Count
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={newManual}
                    onChange={(e) => setNewManual(e.target.value)}
                    placeholder={`Current: ${remaining}`}
                    className="flex-1 bg-ink-950 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-signal"
                  />
                  <button
                    onClick={doSetManual}
                    className="px-4 py-2.5 rounded-xl bg-signal text-ink-950 font-mono text-xs font-bold hover:bg-signal-dim transition-all"
                  >
                    Apply Override
                  </button>
                  <button
                    onClick={doResetAuto}
                    className="px-4 py-2.5 rounded-xl bg-ink-800 border border-white/10 text-mist-100 font-mono text-xs hover:border-white/30 transition-all"
                  >
                    Reset to Dynamic
                  </button>
                </div>
              </div>

              {/* Change total quota */}
              <div className="space-y-2 pt-4 border-t border-white/5">
                <label className="font-mono text-xs text-mist-500 block">
                  Adjust Total Campaign Quota Cap
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={newTotal}
                    onChange={(e) => setNewTotal(e.target.value)}
                    placeholder={`Current total: ${quota.totalQuota}`}
                    className="flex-1 bg-ink-950 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-signal"
                  />
                  <button
                    onClick={doSetTotal}
                    className="px-4 py-2.5 rounded-xl bg-blue-500 text-white font-mono text-xs font-bold hover:bg-blue-600 transition-all"
                  >
                    Update Total Cap
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Export Panel */}
            <div className="bg-ink-900/80 border border-white/10 rounded-3xl p-6">
              <h4 className="font-display text-base font-bold text-white mb-1">Telemetry Data Exports</h4>
              <p className="font-mono text-xs text-mist-700 mb-4">
                Export registered architect records with verified coordinates and pass codes.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={exportCSV}
                  className="px-4 py-2.5 rounded-xl bg-ink-800 border border-white/10 text-mist-100 hover:text-white hover:border-signal/40 font-mono text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <Download size={14} className="text-signal" />
                  <span>Download Full CSV (GPS + Details)</span>
                </button>
                <button
                  onClick={exportJSON}
                  className="px-4 py-2.5 rounded-xl bg-ink-800 border border-white/10 text-mist-100 hover:text-white hover:border-white/30 font-mono text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <Download size={14} />
                  <span>Download JSON Database Dump</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-display font-bold text-base">
                <AlertTriangle size={18} />
                <span>Danger Zone — Studio Reset</span>
              </div>
              <p className="font-mono text-xs text-mist-700 leading-relaxed">
                Permanently wipes all registered pioneer records from Supabase, restores the default VIP referral code roster, and resets the quota to 1,000 slots.
              </p>
              <button
                onClick={doResetEntireStore}
                className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                  resetConfirm
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                }`}
              >
                {resetConfirm ? 'CONFIRM PERMANENT RESET NOW' : 'Reset Entire Database'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Slide-Over Pioneer Dossier Inspector ─────────────────────────────── */}
      {selectedUser && (
        <div className="fixed inset-0 z-[210] flex justify-end">
          <div
            onClick={() => setSelectedUser(null)}
            className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-lg bg-ink-900 border-l border-white/15 h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between shadow-2xl z-10 animate-slide-in">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-signal/15 border border-signal/40 flex items-center justify-center text-signal font-display font-bold text-base">
                    {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-signal uppercase tracking-widest block font-bold">
                      Verified Pioneer Dossier
                    </span>
                    <h3 className="font-display text-xl font-bold text-white">
                      {selectedUser.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-full text-mist-700 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Identity & Access Card */}
              <div className="bg-ink-950 border border-white/10 rounded-2xl p-4 font-mono text-xs space-y-3">
                <div className="flex justify-between pb-2 border-b border-white/5">
                  <span className="text-mist-700">Member ID:</span>
                  <span className="font-bold text-signal">#{selectedUser.id}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-white/5">
                  <span className="text-mist-700">Email Address:</span>
                  <span className="text-white select-all">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-white/5">
                  <span className="text-mist-700">Discipline:</span>
                  <span className="text-white font-medium">{selectedUser.profession}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-white/5">
                  <span className="text-mist-700">Age:</span>
                  <span className="text-white">{selectedUser.age || '—'}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-white/5">
                  <span className="text-mist-700">Invitation Pass:</span>
                  <span className="text-emerald-400 font-bold">{selectedUser.referralCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mist-700">Registration Date:</span>
                  <span className="text-mist-500">
                    {selectedUser.registeredAt ? new Date(selectedUser.registeredAt).toLocaleString() : '—'}
                  </span>
                </div>
              </div>

              {/* Geographic Telemetry Card */}
              <div className="bg-ink-950 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
                    <MapPin size={15} className="text-signal" />
                    <span>Geographic Telemetry</span>
                  </div>
                  {selectedUser.location?.accuracy != null && (
                    <span className="font-mono text-[10px] text-signal bg-signal/10 px-2 py-0.5 rounded-full border border-signal/20">
                      ±{Math.round(selectedUser.location.accuracy)}m Fix
                    </span>
                  )}
                </div>

                <div className="font-mono text-xs space-y-2 text-mist-500 pt-2 border-t border-white/5">
                  <div className="flex justify-between">
                    <span>Resolved Area:</span>
                    <span className="text-white text-right">
                      {[selectedUser.location?.suburb, selectedUser.location?.city].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Region &amp; Country:</span>
                    <span className="text-white text-right">
                      {[selectedUser.location?.region, selectedUser.location?.country].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>
                  {selectedUser.location?.postalCode && (
                    <div className="flex justify-between">
                      <span>Postal PIN:</span>
                      <span className="text-white">{selectedUser.location.postalCode}</span>
                    </div>
                  )}
                  {selectedUser.location?.latitude != null && (
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span>Exact Coordinates:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-300 font-bold select-all">
                          {Number(selectedUser.location.latitude).toFixed(6)}, {Number(selectedUser.location.longitude).toFixed(6)}
                        </span>
                        <button
                          onClick={() => handleCopyCoords(`${selectedUser.location.latitude}, ${selectedUser.location.longitude}`)}
                          className="p-1 hover:text-white text-mist-700"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Google Maps Link */}
                {selectedUser.location?.latitude != null && selectedUser.location?.longitude != null && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedUser.location.latitude},${selectedUser.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-3 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Navigation size={13} className="rotate-45" />
                    <span>Open in Google Maps Route Navigation</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/10 flex flex-col gap-2.5">
              <button
                onClick={() => handleResendConfirmation(selectedUser)}
                disabled={resendingEmailId === selectedUser.id}
                className="w-full py-3 rounded-full bg-signal text-ink-950 font-display font-semibold text-xs sm:text-sm hover:bg-signal-dim transition-all flex items-center justify-center gap-2 shadow-lg shadow-signal/20 disabled:opacity-50"
              >
                {resendingEmailId === selectedUser.id ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Mail size={15} />
                )}
                <span>Resend Confirmation Email Pass</span>
              </button>

              <button
                onClick={() => handleDeleteSingleUser(selectedUser)}
                className="w-full py-2.5 rounded-full bg-ink-950 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 size={13} />
                <span>Delete Pioneer Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
