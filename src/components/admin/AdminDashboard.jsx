import { useState, useMemo, useEffect } from 'react';
import { 
  X, Users, Key, Globe, Download, Plus, Copy, Check, 
  Trash2, Search, Sliders, LogOut, CheckCircle2
} from 'lucide-react';
import { 
  getStoredUsers, 
  getStoredReferralCodes, 
  generateReferralCodes, 
  deleteReferralCode, 
  getGeographicInsights, 
  resetStoreToMockData, 
  logoutAdmin, 
  getQuotaSettings,
  setRemainingSlotsCount,
  resetRemainingSlotsToAuto,
  setTotalQuota
} from '../../services/storeService';

export default function AdminDashboard({ isOpen, onClose, onRefreshData }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'referrals' | 'geo'
  const [users, setUsers] = useState(getStoredUsers());
  const [codes, setCodes] = useState(getStoredReferralCodes());

  // Quota & Slots state
  const [quotaSettings, setQuotaState] = useState(getQuotaSettings());
  const [customSlotsInput, setCustomSlotsInput] = useState(quotaSettings.remainingSlots);
  const [customQuotaInput, setCustomQuotaInput] = useState(quotaSettings.totalQuota);
  const [quotaFeedback, setQuotaFeedback] = useState('');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [professionFilter, setProfessionFilter] = useState('all');

  // Referral code generator
  const [genCount, setGenCount] = useState(5);
  const [genPrefix, setGenPrefix] = useState('NEXUS');

  // Copy feedback
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync state whenever opened
  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  // Live refresh: auto-update when a user registers or codes change (even while panel is open)
  useEffect(() => {
    if (!isOpen) return;
    const handleLiveUpdate = () => refreshData();
    window.addEventListener('nexus_slots_updated', handleLiveUpdate);
    window.addEventListener('storage', handleLiveUpdate);
    return () => {
      window.removeEventListener('nexus_slots_updated', handleLiveUpdate);
      window.removeEventListener('storage', handleLiveUpdate);
    };
  }, [isOpen]);

  const refreshData = () => {
    const u = getStoredUsers();
    const c = getStoredReferralCodes();
    const q = getQuotaSettings();
    setUsers(u);
    setCodes(c);
    setQuotaState(q);
    setCustomSlotsInput(q.remainingSlots);
    setCustomQuotaInput(q.totalQuota);
    if (onRefreshData) onRefreshData();
  };

  const geoInsights = useMemo(() => {
    return getGeographicInsights();
  }, [users]);

  const availableCodes = useMemo(() => codes.filter(c => c.status === 'available'), [codes]);
  const redeemedCodes = useMemo(() => codes.filter(c => c.status === 'redeemed'), [codes]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.referralCode.toLowerCase().includes(q) ||
        u.location.city.toLowerCase().includes(q) ||
        u.location.country.toLowerCase().includes(q);
      
      const matchesProfession = 
        professionFilter === 'all' || u.profession.toLowerCase().includes(professionFilter.toLowerCase());

      return matchesSearch && matchesProfession;
    });
  }, [users, searchQuery, professionFilter]);

  // Quota Handlers
  const handleUpdateSlots = (e) => {
    e.preventDefault();
    const val = parseInt(customSlotsInput, 10);
    if (isNaN(val) || val < 0) {
      setQuotaFeedback('Please enter a valid non-negative number.');
      return;
    }
    const updated = setRemainingSlotsCount(val);
    setQuotaState(updated);
    setQuotaFeedback(`Remaining slots set to ${val} live across the website.`);
    setTimeout(() => setQuotaFeedback(''), 3500);
    if (onRefreshData) onRefreshData();
  };

  const handleResetSlotsAuto = () => {
    const updated = resetRemainingSlotsToAuto();
    setQuotaState(updated);
    setCustomSlotsInput(updated.remainingSlots);
    setQuotaFeedback(`Auto-recalculated: ${updated.remainingSlots} remaining slots based on total quota minus registered users.`);
    setTimeout(() => setQuotaFeedback(''), 3500);
    if (onRefreshData) onRefreshData();
  };

  const handleSaveTotalQuota = (e) => {
    e.preventDefault();
    const val = parseInt(customQuotaInput, 10);
    if (isNaN(val) || val <= 0) {
      setQuotaFeedback('Please enter a valid positive number for total quota.');
      return;
    }
    const updated = setTotalQuota(val);
    setQuotaState(updated);
    setCustomSlotsInput(updated.remainingSlots);
    setQuotaFeedback(`Campaign total quota updated to ${val} passes.`);
    setTimeout(() => setQuotaFeedback(''), 3500);
    if (onRefreshData) onRefreshData();
  };

  // Referral Handlers
  const handleCopySingleCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyAllAvailable = () => {
    const codeList = availableCodes.map(c => c.code).join('\n');
    navigator.clipboard.writeText(codeList);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleGenerateCodes = (e) => {
    e.preventDefault();
    generateReferralCodes(parseInt(genCount, 10) || 5, genPrefix);
    refreshData();
  };

  const handleDeleteCode = (code) => {
    if (window.confirm(`Delete referral code ${code}?`)) {
      deleteReferralCode(code);
      refreshData();
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset database to default seed data?')) {
      resetStoreToMockData();
      refreshData();
    }
  };

  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Age', 'Profession', 'Referral Code', 'City', 'Region', 'Country', 'Latitude', 'Longitude', 'Accuracy (m)', 'Registered At'];
    const rows = users.map(u => [
      u.id,
      `"${u.name}"`,
      `"${u.email}"`,
      u.age,
      `"${u.profession}"`,
      `"${u.referralCode}"`,
      `"${u.location.city}"`,
      `"${u.location.region || ''}"`,
      `"${u.location.country}"`,
      u.location.latitude,
      u.location.longitude,
      u.location.accuracy,
      `"${u.registeredAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexus_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(users, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `nexus_users_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  };

  const handleLogout = () => {
    logoutAdmin();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Top Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-white">NEXUS</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded font-mono font-medium border border-emerald-500/30">
              Admin Console
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-4 font-mono">
            <span>Logged in as:</span>
            <span className="text-slate-200 font-semibold">metheadminlover@gmail.com</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={14} />
            <span>Users Directory ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'referrals'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key size={14} />
            <span>Referral Codes ({availableCodes.length} Left)</span>
          </button>

          <button
            onClick={() => setActiveTab('geo')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'geo'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe size={14} />
            <span>2nd Office Geo Analysis</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            title="Sign out"
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Registered Users
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-white">
                {users.length} <span className="text-sm font-normal text-slate-400">/ {quotaSettings.totalQuota}</span>
              </span>
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                {Math.round((users.length / quotaSettings.totalQuota) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (users.length / quotaSettings.totalQuota) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Remaining Free Slots
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-emerald-400">
                {quotaSettings.remainingSlots}
              </span>
              <span className="text-xs text-slate-400">
                Quota: {quotaSettings.totalQuota}
              </span>
            </div>
            <span className="text-xs text-slate-500 mt-2 block">
              Dynamic live counter displayed on website
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Referral Codes
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-white">
                {availableCodes.length} <span className="text-sm font-normal text-slate-400">Available</span>
              </span>
              <span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                {redeemedCodes.length} Used
              </span>
            </div>
            <span className="text-xs text-slate-500 mt-2 block">
              Total created: {codes.length} codes
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-medium text-emerald-400 block mb-1 font-semibold">
              Top 2nd Office Candidate
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white truncate">
                {geoInsights.topCandidate ? geoInsights.topCandidate.city : 'Analyzing...'}
              </span>
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                {geoInsights.topCandidate ? `${geoInsights.topCandidate.percentage}% Share` : '0%'}
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-2 block truncate">
              {geoInsights.topCandidate ? `${geoInsights.topCandidate.country} (${geoInsights.topCandidate.count} architects registered)` : 'Awaiting data'}
            </span>
          </div>
        </div>

        {/* Quota & Remaining Slots Manager Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sliders size={16} className="text-emerald-400" />
            <h3 className="font-semibold text-sm text-white">
              Campaign Quota & Remaining Slots Control
            </h3>
          </div>

          {quotaFeedback && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{quotaFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {/* Control 1: Set Remaining Free Slots Live */}
            <form onSubmit={handleUpdateSlots} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Remaining Free Slots (Live Count)
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Directly adjust the remaining passes displayed on the landing page.
                </p>
                <input
                  type="number"
                  min="0"
                  value={customSlotsInput}
                  onChange={(e) => setCustomSlotsInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 mb-3 font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-3 rounded-md transition-colors cursor-pointer"
                >
                  Update Slots Live
                </button>
                <button
                  type="button"
                  onClick={handleResetSlotsAuto}
                  title="Auto: Quota - Registered Users"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-md border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Auto Reset
                </button>
              </div>
            </form>

            {/* Control 2: Total Campaign Quota */}
            <form onSubmit={handleSaveTotalQuota} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Campaign Total Quota
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Maximum free pioneer passes allowed for the campaign.
                </p>
                <input
                  type="number"
                  min="1"
                  value={customQuotaInput}
                  onChange={(e) => setCustomQuotaInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 mb-3 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3 rounded-md border border-slate-700 transition-colors cursor-pointer"
              >
                Save Total Quota
              </button>
            </form>

            {/* Control 3: Quick Utilities */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Database & Export Tools
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Download registered user datasets or reset mock records.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-md border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-md border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Export JSON</span>
                  </button>
                </div>
                <button
                  onClick={handleResetData}
                  className="w-full bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-xs py-2 px-3 rounded-md transition-colors cursor-pointer"
                >
                  Reset Demo Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {/* Search and Filters Header */}
            <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
                <div className="relative w-full">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, referral code, city..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={professionFilter}
                  onChange={(e) => setProfessionFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="all">All Professions</option>
                  <option value="Student">Architecture Students</option>
                  <option value="Architect">Architects / Licensed</option>
                  <option value="BIM">BIM Managers & Coordinators</option>
                  <option value="CAD">CAD Drafters & Technicians</option>
                  <option value="Engineer">Engineers (Structural/MEP)</option>
                  <option value="Principal">Studio Principals</option>
                </select>

                <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
                  Showing {filteredUsers.length} of {users.length}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Age</th>
                    <th className="py-3 px-4">Profession</th>
                    <th className="py-3 px-4">Referral Code</th>
                    <th className="py-3 px-4">Location (City, Country)</th>
                    <th className="py-3 px-4">GPS Coordinates</th>
                    <th className="py-3 px-4">Date Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-slate-500">
                        No registered users found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                          {u.id}
                        </td>
                        <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                          {u.name}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          {u.email}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          {u.age}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {u.profession}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-200">
                          {u.referralCode}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <span className="font-semibold text-white">{u.location.city}</span>, {u.location.country}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {u.location.latitude.toFixed(2)}°, {u.location.longitude.toFixed(2)}° (±{u.location.accuracy}m)
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {new Date(u.registeredAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: REFERRAL CODES MANAGER */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            {/* Generator & Copy All Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Generator Form */}
                <form onSubmit={handleGenerateCodes} className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400 font-medium">Generate</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={genCount}
                      onChange={(e) => setGenCount(e.target.value)}
                      className="w-16 bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white font-mono text-center"
                    />
                    <label className="text-xs text-slate-400 font-medium">Codes with Prefix</label>
                    <input
                      type="text"
                      value={genPrefix}
                      onChange={(e) => setGenPrefix(e.target.value.toUpperCase())}
                      className="w-24 bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white font-mono uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create Codes</span>
                  </button>
                </form>

                {/* Bulk Copy Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyAllAvailable}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2 rounded-md border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedAll ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedAll ? 'All Available Codes Copied!' : `Copy All Available (${availableCodes.length})`}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Referral Codes Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h4 className="font-semibold text-sm text-white">
                  Referral Codes Pool
                </h4>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-400 font-mono">
                    ● {availableCodes.length} Available
                  </span>
                  <span className="text-slate-500 font-mono">
                    ● {redeemedCodes.length} Redeemed
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Referral Code</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Used By / Account</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {codes.map((c) => (
                      <tr key={c.code} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                          {c.code}
                        </td>
                        <td className="py-3 px-4">
                          {c.status === 'available' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                              Redeemed
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {c.redeemedBy || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          {c.createdAt || '2026-09-20'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleCopySingleCode(c.code)}
                              title="Copy code"
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                              {copiedCode === c.code ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                            <button
                              onClick={() => handleDeleteCode(c.code)}
                              title="Delete code"
                              className="p-1.5 rounded bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
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

        {/* TAB 3: 2ND OFFICE GEOGRAPHIC ANALYSIS */}
        {activeTab === 'geo' && (
          <div className="space-y-6">
            {/* Top Candidate Recommendation Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Globe size={24} />
                </div>
                <div>
                  <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                    Expansion Recommendation
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    Deploy 2nd Physical Office in: <span className="text-emerald-400">{geoInsights.topCandidate?.city || 'London'}, {geoInsights.topCandidate?.country || 'UK'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Geographic density analysis indicates that {geoInsights.topCandidate?.percentage}% of all verified early registrations originate from this metropolitan region ({geoInsights.topCandidate?.count} verified users).
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Download size={14} />
                <span>Export Geo Dataset</span>
              </button>
            </div>

            {/* Ranked Metropolitan Locations Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800">
                <h4 className="font-semibold text-sm text-white">
                  Metropolitan Distribution & Geography Rankings
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">City / Metropolitan Area</th>
                      <th className="py-3 px-4">Country</th>
                      <th className="py-3 px-4">Registered Users</th>
                      <th className="py-3 px-4">Percentage Share</th>
                      <th className="py-3 px-4">Avg GPS Accuracy</th>
                      <th className="py-3 px-4">Office Deployment Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {geoInsights.rankedCities.map((item, index) => (
                      <tr key={item.city} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-400">
                          #{index + 1}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {item.city}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {item.country}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          {item.count} users
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {item.percentage}%
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          ±{item.avgAccuracy}m
                        </td>
                        <td className="py-3 px-4">
                          {index === 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              ★ Top Recommendation (Office #2)
                            </span>
                          ) : index < 3 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300">
                              Secondary Candidate
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-500">
                              Monitoring Growth
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
