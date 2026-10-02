import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X, Users, Key, Globe, Download, Plus, Copy, Check,
  Trash2, Search, LogOut, RefreshCw, Settings2,
  Loader2, AlertTriangle, MapPin, TrendingUp,
  Shield, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  getStoredUsers, getStoredReferralCodes, generateReferralCodes,
  deleteReferralCode, logoutAdmin, getQuotaSettings, getRemainingSlots,
  setRemainingSlotsCount, resetRemainingSlotsToAuto, setTotalQuota,
  resetStoreToEmpty, TOTAL_FREE_QUOTA,
} from '../../services/storeService';
import { supabase } from '../../services/supabaseClient';

const TABS = [
  { id: 'users', label: 'Users',         icon: Users },
  { id: 'codes', label: 'Referral Codes',icon: Key },
  { id: 'geo',   label: 'Geo Analytics', icon: Globe },
  { id: 'settings', label: 'Settings',   icon: Settings2 },
];

export default function AdminDashboard({ isOpen, onClose, onRefreshData }) {
  const [tab,    setTab]    = useState('users');
  const [users,  setUsers]  = useState([]);
  const [codes,  setCodes]  = useState([]);
  const [quota,  setQuota]  = useState({ totalQuota: 1000, manualRemaining: null });
  const [remaining, setRemaining] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Users tab
  const [search, setSearch] = useState('');
  const [profFilter, setProfFilter] = useState('');

  // Codes tab
  const [genCount,  setGenCount]  = useState(5);
  const [genPrefix, setGenPrefix] = useState('NEXUS');
  const [genLoading, setGenLoading] = useState(false);
  const [copied, setCopied] = useState('');

  // Settings tab
  const [newManual, setNewManual] = useState('');
  const [newTotal,  setNewTotal]  = useState('');
  const [settingMsg, setSettingMsg] = useState('');

  const refreshData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [u, c, q, r] = await Promise.all([
        getStoredUsers(),
        getStoredReferralCodes(),
        getQuotaSettings(),
        getRemainingSlots(),
      ]);
      setUsers(u); setCodes(c); setQuota(q); setRemaining(r);
      if (onRefreshData) onRefreshData();
    } catch (e) {
      setError(e.message || 'Failed to load data from Supabase.');
    } finally {
      setLoading(false);
    }
  }, [onRefreshData]);

  // Load on open
  useEffect(() => { if (isOpen) { setTab('users'); refreshData(); } }, [isOpen]);

  // Real-time: when a new user is inserted, refresh immediately
  useEffect(() => {
    if (!isOpen) return;
    const channel = supabase.channel('nexus_admin_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nexus_users' }, refreshData)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'nexus_referral_codes' }, refreshData)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [isOpen, refreshData]);

  // Window event fallback
  useEffect(() => {
    if (!isOpen) return;
    const fn = () => refreshData();
    window.addEventListener('nexus_slots_updated', fn);
    return () => window.removeEventListener('nexus_slots_updated', fn);
  }, [isOpen, refreshData]);

  // ─── Users tab ────────────────────────────────────────────────────────────
  const professions = useMemo(() => [...new Set(users.map(u => u.profession).filter(Boolean))], [users]);
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      const matchSearch = !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.referralCode?.toLowerCase().includes(q) ||
        u.location?.city?.toLowerCase().includes(q);
      const matchProf = !profFilter || u.profession === profFilter;
      return matchSearch && matchProf;
    });
  }, [users, search, profFilter]);

  // ─── Codes tab ────────────────────────────────────────────────────────────
  const availableCodes = codes.filter(c => c.status === 'available');
  const redeemedCodes  = codes.filter(c => c.status === 'redeemed');

  const handleGenerate = async () => {
    setGenLoading(true);
    try { await generateReferralCodes(genCount, genPrefix); await refreshData(); }
    catch (e) { alert('Generate failed: ' + e.message); }
    finally { setGenLoading(false); }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete code "${code}"?`)) return;
    try { await deleteReferralCode(code); await refreshData(); }
    catch (e) { alert('Delete failed: ' + e.message); }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(''), 1500);
    });
  };

  // ─── Geo tab ─────────────────────────────────────────────────────────────
  const geoData = useMemo(() => {
    if (!users.length) return { rankedCities: [], countries: {} };
    const cityMap = {};
    const countries = {};
    users.forEach(u => {
      const city    = u.location?.city    || 'Unknown';
      const country = u.location?.country || 'Unknown';
      const key = `${city}|${country}`;
      cityMap[key] = cityMap[key] || { city, country, count: 0, gpsCount: 0 };
      cityMap[key].count++;
      if (u.location?.latitude) cityMap[key].gpsCount++;
      countries[country] = (countries[country] || 0) + 1;
    });
    const rankedCities = Object.values(cityMap).sort((a, b) => b.count - a.count);
    return { rankedCities, countries };
  }, [users]);

  // ─── Settings tab ─────────────────────────────────────────────────────────
  const doSetManual = async () => {
    try { await setRemainingSlotsCount(newManual); setSettingMsg('Manual slots updated ✓'); await refreshData(); }
    catch (e) { setSettingMsg('Error: ' + e.message); }
  };
  const doResetAuto = async () => {
    try { await resetRemainingSlotsToAuto(); setSettingMsg('Reset to auto-calculate ✓'); await refreshData(); }
    catch (e) { setSettingMsg('Error: ' + e.message); }
  };
  const doSetTotal = async () => {
    try { await setTotalQuota(newTotal); setSettingMsg('Total quota updated ✓'); await refreshData(); }
    catch (e) { setSettingMsg('Error: ' + e.message); }
  };
  const doReset = async () => {
    if (!window.confirm('Delete ALL users and reset all referral codes? This cannot be undone.')) return;
    if (!window.confirm('Are you absolutely sure? All 0 registered users will be deleted.')) return;
    try { await resetStoreToEmpty(); await refreshData(); setSettingMsg('Database reset ✓'); }
    catch (e) { setSettingMsg('Error: ' + e.message); }
  };
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ users, codes, quota }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'nexus-export.json'; a.click();
    URL.revokeObjectURL(url);
  };
  const exportCSV = () => {
    const rows = [
      ['ID','Name','Email','Age','Profession','Referral Code','City','Region','Country','Lat','Lng','Accuracy (m)','Registered At'],
      ...users.map(u => [
        u.id, u.name, u.email, u.age, u.profession, u.referralCode,
        u.location?.city, u.location?.region, u.location?.country,
        u.location?.latitude, u.location?.longitude, u.location?.accuracy,
        u.registeredAt,
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'nexus-users.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => { logoutAdmin(); onClose(); };

  if (!isOpen) return null;

  const kpiClass = 'bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-1';
  const btnClass = 'px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors';

  return (
    <div className="fixed inset-0 z-[200] bg-gray-950 flex flex-col overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-green-400" />
          <span className="font-mono text-sm font-bold text-white tracking-tight">NEXUS ADMIN</span>
          <span className="hidden sm:block font-mono text-[11px] text-gray-500 border-l border-gray-700 pl-3">
            metheadminlover@gmail.com
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-lg">
            {remaining} slots left
          </span>
          <button onClick={refreshData} disabled={loading}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors">
            <LogOut size={15} />
          </button>
          <button onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <X size={15} />
          </button>
        </div>
      </header>

      {/* ── Tab Bar ────────────────────────────────────────────────────────── */}
      <nav className="shrink-0 bg-gray-900 border-b border-gray-800 px-4 sm:px-6 flex gap-1 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-3 py-3 font-mono text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === id
                ? 'border-green-400 text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}>
            <Icon size={13} />
            {label}
            {id === 'users' && users.length > 0 && (
              <span className="bg-gray-800 text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full">{users.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading && (
          <div className="flex items-center justify-center h-40 gap-3 text-gray-400 font-mono text-sm">
            <Loader2 size={18} className="animate-spin" /> Loading from Supabase…
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 text-red-400 font-mono text-sm">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-1">Supabase Error</div>
              <div className="text-xs opacity-80">{error}</div>
              <button onClick={refreshData} className="mt-2 text-xs underline">Retry</button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── USERS TAB ────────────────────────────────────────── */}
            {tab === 'users' && (
              <div className="space-y-4">
                {/* KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Registered',      val: users.length,                          color: 'text-white' },
                    { label: 'Slots Remaining', val: remaining,                              color: 'text-green-400' },
                    { label: 'Codes Available', val: availableCodes.length,                  color: 'text-blue-400' },
                    { label: '% Claimed',       val: `${Math.round((users.length / TOTAL_FREE_QUOTA) * 100)}%`, color: 'text-purple-400' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className={kpiClass}>
                      <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
                      <span className={`font-mono text-2xl font-bold ${color}`}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, city…"
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-green-400/50 placeholder-gray-600" />
                  </div>
                  <select value={profFilter} onChange={e => setProfFilter(e.target.value)}
                    className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-green-400/50">
                    <option value="">All Professions</option>
                    {professions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={exportCSV} className={`${btnClass} bg-gray-800 text-gray-300 hover:bg-gray-700 flex items-center gap-1.5`}>
                      <Download size={12} /> CSV
                    </button>
                    <button onClick={exportJSON} className={`${btnClass} bg-gray-800 text-gray-300 hover:bg-gray-700 flex items-center gap-1.5`}>
                      <Download size={12} /> JSON
                    </button>
                  </div>
                </div>

                {/* Table */}
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-16 text-gray-600 font-mono text-sm">
                    {users.length === 0 ? 'No users registered yet.' : 'No users match your search.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-800">
                    <table className="w-full text-xs font-mono">
                      <thead className="bg-gray-900 text-gray-500 uppercase tracking-wider text-[10px]">
                        <tr>
                          {['#','Name','Email','Age','Profession','Code','Location','GPS Acc.','Registered'].map(h => (
                            <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {filteredUsers.map((u, i) => (
                          <tr key={u.uuid || u.id} className="hover:bg-gray-900/50 transition-colors">
                            <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                            <td className="px-3 py-3 text-white font-medium whitespace-nowrap">{u.name}</td>
                            <td className="px-3 py-3 text-gray-300 whitespace-nowrap">{u.email}</td>
                            <td className="px-3 py-3 text-gray-300">{u.age}</td>
                            <td className="px-3 py-3 text-gray-300 max-w-[140px] truncate" title={u.profession}>{u.profession}</td>
                            <td className="px-3 py-3 text-green-400 whitespace-nowrap">{u.referralCode}</td>
                            <td className="px-3 py-3 text-gray-300 whitespace-nowrap">
                              {[u.location?.city, u.location?.country].filter(Boolean).join(', ') || <span className="text-gray-600">—</span>}
                            </td>
                            <td className="px-3 py-3 text-gray-400">
                              {u.location?.accuracy != null
                                ? <span className={u.location.accuracy < 50 ? 'text-green-400' : u.location.accuracy < 200 ? 'text-yellow-400' : 'text-red-400'}>
                                    ±{Math.round(u.location.accuracy)}m
                                  </span>
                                : <span className="text-gray-600">—</span>
                              }
                            </td>
                            <td className="px-3 py-3 text-gray-500 whitespace-nowrap">
                              {u.registeredAt ? new Date(u.registeredAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit', hour:'2-digit', minute:'2-digit' }) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── CODES TAB ────────────────────────────────────────── */}
            {tab === 'codes' && (
              <div className="space-y-4">
                {/* KPIs */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total Codes',   val: codes.length,           color: 'text-white' },
                    { label: 'Available',     val: availableCodes.length,  color: 'text-green-400' },
                    { label: 'Redeemed',      val: redeemedCodes.length,   color: 'text-orange-400' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className={kpiClass}>
                      <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
                      <span className={`font-mono text-2xl font-bold ${color}`}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Generate */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                  <div className="font-mono text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Generate New Codes</div>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div>
                      <label className="font-mono text-[10px] text-gray-600 block mb-1">Count</label>
                      <input type="number" min="1" max="100" value={genCount} onChange={e => setGenCount(e.target.value)}
                        className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-green-400/50" />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-gray-600 block mb-1">Prefix</label>
                      <input type="text" value={genPrefix} onChange={e => setGenPrefix(e.target.value.toUpperCase())} placeholder="NEXUS"
                        className="w-28 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-green-400/50 uppercase" />
                    </div>
                    <button onClick={handleGenerate} disabled={genLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-400/10 border border-green-400/30 text-green-400 font-mono text-xs font-semibold hover:bg-green-400/20 transition-colors disabled:opacity-50">
                      {genLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                      Generate
                    </button>
                  </div>
                </div>

                {/* Codes table */}
                {codes.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 font-mono text-sm">No referral codes found.</div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-800">
                    <table className="w-full text-xs font-mono">
                      <thead className="bg-gray-900 text-gray-500 uppercase tracking-wider text-[10px]">
                        <tr>
                          {['Code','Status','Tags','Used By','Created',''].map(h => (
                            <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {codes.map((c) => (
                          <tr key={c.code} className="hover:bg-gray-900/50 transition-colors">
                            <td className="px-3 py-3">
                              <span className="text-white font-semibold tracking-wider">{c.code}</span>
                            </td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'available' ? 'bg-green-400/10 text-green-400' : 'bg-orange-400/10 text-orange-400'}`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-gray-500">
                              {c.tags?.map(t => (
                                <span key={t} className="inline-block bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-[9px] mr-1">{t}</span>
                              ))}
                            </td>
                            <td className="px-3 py-3 text-gray-400 max-w-[140px] truncate">{c.redeemedBy || '—'}</td>
                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                              {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleCopy(c.code)} title="Copy"
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
                                  {copied === c.code ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                                </button>
                                {c.status === 'available' && (
                                  <button onClick={() => handleDelete(c.code)} title="Delete"
                                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-gray-800 transition-colors">
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── GEO TAB ──────────────────────────────────────────── */}
            {tab === 'geo' && (
              <div className="space-y-4">
                {users.length === 0 ? (
                  <div className="text-center py-16 text-gray-600 font-mono text-sm">
                    No users yet — register some to see geographic data.
                  </div>
                ) : (
                  <>
                    {/* Top candidate */}
                    {geoData.rankedCities[0] && (
                      <div className="bg-green-400/5 border border-green-400/20 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center text-green-400 shrink-0">
                          <TrendingUp size={18} />
                        </div>
                        <div>
                          <div className="font-mono text-[10px] text-green-400 uppercase tracking-widest mb-1">Top Expansion Candidate</div>
                          <div className="font-mono text-lg font-bold text-white">
                            {geoData.rankedCities[0].city}, {geoData.rankedCities[0].country}
                          </div>
                          <div className="font-mono text-xs text-gray-400">
                            {geoData.rankedCities[0].count} registered users · {((geoData.rankedCities[0].count / users.length) * 100).toFixed(1)}% of total signups
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ranked cities */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-800 font-mono text-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-2">
                        <MapPin size={12} /> City Rankings
                      </div>
                      <div className="divide-y divide-gray-800/60">
                        {geoData.rankedCities.map((c, i) => (
                          <div key={`${c.city}|${c.country}`} className="px-4 py-3 flex items-center gap-3">
                            <span className="font-mono text-xs text-gray-600 w-5 shrink-0">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-mono text-sm text-white">{c.city}</div>
                              <div className="font-mono text-[10px] text-gray-500">{c.country}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-mono text-sm font-bold text-white">{c.count}</div>
                              <div className="font-mono text-[10px] text-gray-500">{((c.count / users.length) * 100).toFixed(1)}%</div>
                            </div>
                            <div className="w-20 shrink-0">
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-400 rounded-full transition-all"
                                  style={{ width: `${(c.count / geoData.rankedCities[0].count) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* GPS coverage */}
                    <div className={kpiClass}>
                      <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">GPS Coverage</span>
                      <span className="font-mono text-2xl font-bold text-blue-400">
                        {Math.round((users.filter(u => u.location?.latitude).length / users.length) * 100)}%
                      </span>
                      <span className="font-mono text-[10px] text-gray-600">
                        {users.filter(u => u.location?.latitude).length} of {users.length} users with real GPS coordinates
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── SETTINGS TAB ─────────────────────────────────────── */}
            {tab === 'settings' && (
              <div className="space-y-4 max-w-lg">
                {settingMsg && (
                  <div className="bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-2.5 font-mono text-xs text-green-400">
                    {settingMsg}
                  </div>
                )}

                {/* Quota control */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
                  <div className="font-mono text-xs text-gray-400 font-semibold uppercase tracking-wider">Quota Control</div>
                  <div className="font-mono text-xs text-gray-500">
                    Current: {quota.manualRemaining !== null ? `Manual override → ${quota.manualRemaining} slots` : `Auto (${quota.totalQuota} total − ${users.length} registered = ${remaining} remaining)`}
                  </div>

                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="font-mono text-[10px] text-gray-600 block mb-1">Set manual remaining slots</label>
                      <input type="number" min="0" value={newManual} onChange={e => setNewManual(e.target.value)} placeholder={remaining.toString()}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-green-400/50" />
                    </div>
                    <button onClick={doSetManual}
                      className={`${btnClass} bg-green-400/10 border border-green-400/30 text-green-400 hover:bg-green-400/20`}>
                      Set
                    </button>
                    <button onClick={doResetAuto}
                      className={`${btnClass} bg-gray-800 text-gray-300 hover:bg-gray-700`}>
                      Reset to Auto
                    </button>
                  </div>

                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="font-mono text-[10px] text-gray-600 block mb-1">Change total quota (currently {quota.totalQuota})</label>
                      <input type="number" min="1" value={newTotal} onChange={e => setNewTotal(e.target.value)} placeholder={quota.totalQuota.toString()}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-green-400/50" />
                    </div>
                    <button onClick={doSetTotal}
                      className={`${btnClass} bg-blue-400/10 border border-blue-400/30 text-blue-400 hover:bg-blue-400/20`}>
                      Update
                    </button>
                  </div>
                </div>

                {/* Export */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                  <div className="font-mono text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Export Data</div>
                  <div className="flex gap-3">
                    <button onClick={exportCSV}
                      className={`${btnClass} bg-gray-800 text-gray-300 hover:bg-gray-700 flex items-center gap-2`}>
                      <Download size={12} /> Download CSV
                    </button>
                    <button onClick={exportJSON}
                      className={`${btnClass} bg-gray-800 text-gray-300 hover:bg-gray-700 flex items-center gap-2`}>
                      <Download size={12} /> Download JSON
                    </button>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                  <div className="font-mono text-xs text-red-400 font-semibold uppercase tracking-wider mb-2">Danger Zone</div>
                  <div className="font-mono text-[11px] text-gray-500 mb-3">
                    Permanently delete all registered users and reset all referral codes to available.
                  </div>
                  <button onClick={doReset}
                    className={`${btnClass} bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20`}>
                    Reset Entire Database
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
