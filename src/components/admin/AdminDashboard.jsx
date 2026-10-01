import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Users, Key, MapPin, Globe, Download, Plus, Copy, Check, 
  Trash2, Search, Filter, RefreshCw, Building, Award, Compass, Radio,
  LogOut, ShieldAlert
} from 'lucide-react';
import { 
  getStoredUsers, 
  getStoredReferralCodes, 
  generateReferralCodes, 
  deleteReferralCode, 
  getGeographicInsights, 
  resetStoreToMockData, 
  logoutAdmin, 
  TOTAL_FREE_QUOTA 
} from '../../services/storeService';

export default function AdminDashboard({ isOpen, onClose, onRefreshData }) {
  const [activeTab, setActiveTab] = useState('geo'); // 'geo' | 'referrals' | 'users'
  const [users, setUsers] = useState(getStoredUsers());
  const [codes, setCodes] = useState(getStoredReferralCodes());

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search and filter for users table
  const [searchQuery, setSearchQuery] = useState('');
  const [professionFilter, setProfessionFilter] = useState('all');

  // Referral code generation state
  const [genCount, setGenCount] = useState(5);
  const [genPrefix, setGenPrefix] = useState('ARCH');
  const [showGenModal, setShowGenModal] = useState(false);

  // Copy feedback state
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Refresh local data state
  const refreshData = () => {
    setUsers(getStoredUsers());
    setCodes(getStoredReferralCodes());
    if (onRefreshData) onRefreshData();
  };

  const geoInsights = useMemo(() => {
    return getGeographicInsights();
  }, [users]);

  // Derived referral stats
  const availableCodes = useMemo(() => codes.filter(c => c.status === 'available'), [codes]);
  const redeemedCodes = useMemo(() => codes.filter(c => c.status === 'redeemed'), [codes]);
  const remainingFreeSlots = Math.max(0, TOTAL_FREE_QUOTA - users.length);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.referralCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.location.country.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProfession = 
        professionFilter === 'all' || u.profession.toLowerCase().includes(professionFilter.toLowerCase());

      return matchesSearch && matchesProfession;
    });
  }, [users, searchQuery, professionFilter]);

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
    setShowGenModal(false);
  };

  const handleDeleteCode = (code) => {
    if (window.confirm(`Are you sure you want to remove referral code ${code}?`)) {
      deleteReferralCode(code);
      refreshData();
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset database to pre-seeded architectural demo data?')) {
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
    link.setAttribute('download', `archnexus_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(users, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `archnexus_users_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  };

  const handleLogout = () => {
    logoutAdmin();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-ink-950 flex flex-col overflow-hidden text-mist-100 font-body">
      
      {/* Top Navbar */}
      <header className="bg-ink-900 border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-white tracking-tight">ARCHVIBE</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-signal text-ink-950 font-bold uppercase">
              Admin OS
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-mist-900 border-l border-white/10 pl-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>HQ Deployment & Quota Engine</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-ink-950 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('geo')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 ${
              activeTab === 'geo'
                ? 'bg-signal text-ink-950 shadow-sm'
                : 'text-mist-700 hover:text-white'
            }`}
          >
            <Compass size={14} />
            <span>2nd Office Geo Intelligence</span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 ${
              activeTab === 'referrals'
                ? 'bg-signal text-ink-950 shadow-sm'
                : 'text-mist-700 hover:text-white'
            }`}
          >
            <Key size={14} />
            <span>Referral Codes ({availableCodes.length} Left)</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-signal text-ink-950 shadow-sm'
                : 'text-mist-700 hover:text-white'
            }`}
          >
            <Users size={14} />
            <span>Users Database ({users.length})</span>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            title="Sign out of Admin Portal"
            className="p-2 rounded-xl text-mist-700 hover:text-red-400 hover:bg-white/5 transition-colors font-mono text-xs flex items-center gap-1.5"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-mist-700 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-ink-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <span className="font-mono text-xs text-mist-900 block mb-1">
              Registered Early Users
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-white">
                {users.length} <span className="text-sm font-mono text-mist-900 font-normal">/ {TOTAL_FREE_QUOTA}</span>
              </span>
              <span className="text-xs font-mono text-signal bg-signal/10 px-2 py-0.5 rounded">
                {Math.round((users.length / TOTAL_FREE_QUOTA) * 100)}% Filled
              </span>
            </div>
            <div className="w-full bg-ink-950 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-signal h-full rounded-full transition-all duration-500"
                style={{ width: `${(users.length / TOTAL_FREE_QUOTA) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-ink-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <span className="font-mono text-xs text-mist-900 block mb-1">
              Free Slots Remaining
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-emerald-400">
                {remainingFreeSlots}
              </span>
              <span className="text-xs font-mono text-mist-700">
                Quota: 1,000 Max
              </span>
            </div>
            <span className="text-[11px] font-mono text-mist-900 mt-2 block">
              100% Free Lifetime Tier Active
            </span>
          </div>

          <div className="bg-ink-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <span className="font-mono text-xs text-mist-900 block mb-1">
              Referral Codes Status
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-white">
                {availableCodes.length} <span className="text-sm font-mono text-mist-900 font-normal">Available</span>
              </span>
              <span className="text-xs font-mono text-ember bg-ember/10 px-2 py-0.5 rounded">
                {redeemedCodes.length} Used
              </span>
            </div>
            <span className="text-[11px] font-mono text-mist-900 mt-2 block">
              Total Created: {codes.length}
            </span>
          </div>

          <div className="bg-ink-900/80 border border-signal/30 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-signal/5 rounded-full blur-xl" />
            <span className="font-mono text-xs text-signal block mb-1 font-bold">
              ★ 2nd Office Top Candidate
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl font-bold text-white truncate">
                {geoInsights.topCandidate ? geoInsights.topCandidate.city : 'Analyzing...'}
              </span>
              <span className="text-xs font-mono text-signal bg-signal/15 px-2 py-0.5 rounded">
                {geoInsights.topCandidate ? `${geoInsights.topCandidate.percentage}% Density` : '0%'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-mist-700 mt-2 block truncate">
              {geoInsights.topCandidate ? `${geoInsights.topCandidate.country} (${geoInsights.topCandidate.count} architects)` : 'Awaiting data'}
            </span>
          </div>

        </div>

        {/* TAB 1: 2nd Office Geographic Intelligence Hub */}
        {activeTab === 'geo' && (
          <div className="space-y-6">
            
            {/* Top Recommendation Banner */}
            <div className="bg-gradient-to-r from-ink-900 via-ink-850 to-ink-900 border border-signal/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-signal/15 border border-signal/40 flex items-center justify-center text-signal shrink-0">
                  <Building size={28} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-signal/10 border border-signal/30 text-signal font-mono text-xs uppercase mb-2">
                    <Award size={13} />
                    Geographic Expansion Algorithm Recommendation
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    Deploy 2nd Physical Office in: <span className="text-signal">{geoInsights.topCandidate?.city || 'London'}, {geoInsights.topCandidate?.country || 'UK'}</span>
                  </h3>
                  <p className="font-body text-sm text-mist-900 mt-1 max-w-2xl">
                    High-accuracy GPS verification shows the highest geographic density of registered architects, BIM directors, and university students ({geoInsights.topCandidate?.percentage}% of all verified users).
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleExportCSV}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-ink-800 hover:bg-ink-700 text-white font-mono text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors"
                >
                  <Download size={14} />
                  <span>Export Geo CSV</span>
                </button>
              </div>
            </div>

            {/* Geographic Radar Map & Density Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: Interactive Coordinate Radar Plot */}
              <div className="lg:col-span-7 bg-ink-900/80 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-signal animate-pulse" />
                    <h4 className="font-display text-lg font-bold text-white">
                      Global User Coordinates Radar
                    </h4>
                  </div>
                  <span className="font-mono text-xs text-mist-700">
                    High-Accuracy GPS (±4.5m avg)
                  </span>
                </div>

                {/* Simulated World Geographic Coordinate Map */}
                <div className="relative flex-1 min-h-[340px] bg-ink-950 rounded-2xl border border-white/10 p-4 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 800 400" className="w-full h-full opacity-90">
                    <defs>
                      <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                      </pattern>
                      <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#e8ff47" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#e8ff47" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Grid */}
                    <rect width="800" height="400" fill="url(#radarGrid)" />

                    {/* Equator & Meridian */}
                    <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(255,255,255,0.1)" strokeDasharray="5 5" />
                    <line x1="400" y1="0" x2="400" y2="400" stroke="rgba(255,255,255,0.1)" strokeDasharray="5 5" />

                    {/* Plot User Dots according to coordinates */}
                    {users.map((u, i) => {
                      // Project Lat/Lng to 800x400 SVG space (Equirectangular approximation)
                      const cx = ((u.location.longitude + 180) / 360) * 800;
                      const cy = ((90 - u.location.latitude) / 180) * 400;
                      const isTopCity = geoInsights.topCandidate && u.location.city === geoInsights.topCandidate.city;

                      return (
                        <g key={u.id || i} className="group cursor-pointer">
                          {/* Pulsing ring for top cluster */}
                          {isTopCity && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r="16"
                              fill="none"
                              stroke="#e8ff47"
                              strokeWidth="1"
                              opacity="0.4"
                              className="animate-ping"
                            />
                          )}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isTopCity ? 5 : 3.5}
                            fill={isTopCity ? '#e8ff47' : '#ff6b35'}
                            stroke="#ffffff"
                            strokeWidth="1"
                          />
                        </g>
                      );
                    })}

                    {/* City Cluster Labels on map */}
                    {geoInsights.rankedCities.slice(0, 5).map((city, idx) => {
                      const cx = ((city.coordinates[1] + 180) / 360) * 800;
                      const cy = ((90 - city.coordinates[0]) / 180) * 400;

                      return (
                        <g key={city.city}>
                          <text
                            x={cx}
                            y={cy - 12}
                            fill={idx === 0 ? '#e8ff47' : '#ffffff'}
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {city.city} ({city.count})
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Radar Legend */}
                  <div className="absolute bottom-3 left-3 bg-ink-900/90 border border-white/10 rounded-lg p-2.5 text-[10px] font-mono flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-signal" />
                      <span>#1 Cluster ({geoInsights.topCandidate?.city})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-ember" />
                      <span>Global Nodes</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-mono text-mist-900">
                  <span>Plotted directly from user device GPS signals</span>
                  <span className="text-signal">OpenStreetMap Reverse Geocoded</span>
                </div>
              </div>

              {/* Right: Ranked Geographic Hubs Table */}
              <div className="lg:col-span-5 bg-ink-900/80 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                  <h4 className="font-display text-lg font-bold text-white">
                    Metropolitan Density Ranking
                  </h4>
                  <span className="font-mono text-xs text-signal font-semibold">
                    {geoInsights.rankedCities.length} Metros Identified
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {geoInsights.rankedCities.map((item, idx) => (
                    <div
                      key={item.city}
                      className={`p-4 rounded-2xl border transition-all ${
                        idx === 0
                          ? 'bg-signal/10 border-signal/40'
                          : 'bg-ink-950/60 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                            idx === 0 ? 'bg-signal text-ink-950' : 'bg-ink-800 text-mist-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-display font-bold text-white text-base">
                            {item.city}, {item.country}
                          </span>
                        </div>
                        <span className={`font-mono text-xs font-bold ${idx === 0 ? 'text-signal' : 'text-mist-700'}`}>
                          {item.count} Users ({item.percentage}%)
                        </span>
                      </div>

                      <div className="w-full bg-ink-950 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full ${idx === 0 ? 'bg-signal' : 'bg-mist-700'}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px] font-mono text-mist-900">
                        <span>Avg GPS Precision: &plusmn;{item.avgAccuracy}m</span>
                        {idx === 0 && (
                          <span className="text-signal font-bold uppercase">
                            Primary Recommendation
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: Referral Code Manager */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-900/80 border border-white/10 rounded-2xl p-6">
              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Referral Codes Management
                </h3>
                <p className="font-body text-xs sm:text-sm text-mist-900 mt-1">
                  Manage mandatory invite codes. Users must hold a valid code to claim one of the first 1,000 free lifetime accounts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCopyAllAvailable}
                  className="px-4 py-2.5 rounded-xl bg-ink-800 hover:bg-ink-700 text-white font-mono text-xs flex items-center gap-2 border border-white/10 transition-colors"
                >
                  {copiedAll ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  <span>{copiedAll ? 'All Codes Copied!' : 'Copy All Available Codes'}</span>
                </button>

                <button
                  onClick={() => setShowGenModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-signal text-ink-950 font-display font-semibold text-xs flex items-center gap-2 hover:bg-signal-dim transition-all shadow-md shadow-signal/20"
                >
                  <Plus size={16} />
                  <span>Generate New Codes</span>
                </button>
              </div>
            </div>

            {/* Quick Stats banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-ink-950 p-4 rounded-xl border border-white/5 font-mono text-xs">
                <span className="text-mist-900 block">Total Codes in Database:</span>
                <span className="text-xl font-bold text-white">{codes.length}</span>
              </div>
              <div className="bg-ink-950 p-4 rounded-xl border border-white/5 font-mono text-xs">
                <span className="text-mist-900 block">Available (Unredeemed):</span>
                <span className="text-xl font-bold text-signal">{availableCodes.length}</span>
              </div>
              <div className="bg-ink-950 p-4 rounded-xl border border-white/5 font-mono text-xs">
                <span className="text-mist-900 block">Redeemed / Claimed:</span>
                <span className="text-xl font-bold text-ember">{redeemedCodes.length}</span>
              </div>
            </div>

            {/* Referral Codes Table */}
            <div className="bg-ink-900/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-ink-950 border-b border-white/10 text-mist-900 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-6 py-4">Referral Code</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4">Redeemed By</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {codes.map((item) => {
                      const isAvailable = item.status === 'available';
                      const isCopied = copiedCode === item.code;

                      return (
                        <tr key={item.code} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-white tracking-wider text-sm">
                              {item.code}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold ${
                              isAvailable
                                ? 'bg-signal/15 text-signal border border-signal/30'
                                : 'bg-ember/15 text-ember border border-ember/30'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-mist-700">
                            {item.createdAt}
                          </td>
                          <td className="px-6 py-4 text-mist-700">
                            {item.redeemedBy ? (
                              <span className="text-emerald-400 font-normal">
                                {item.redeemedBy}
                              </span>
                            ) : (
                              <span className="text-mist-900 italic">None yet</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleCopySingleCode(item.code)}
                                title="Copy referral code to clipboard"
                                className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                                  isCopied
                                    ? 'bg-green-500/20 border-green-500/40 text-green-400'
                                    : 'bg-ink-800 hover:bg-ink-700 border-white/10 text-mist-100'
                                }`}
                              >
                                {isCopied ? <Check size={13} /> : <Copy size={13} />}
                                <span>{isCopied ? 'Copied' : 'Copy'}</span>
                              </button>

                              <button
                                onClick={() => handleDeleteCode(item.code)}
                                title="Revoke code"
                                className="p-1.5 rounded-lg text-mist-900 hover:text-red-400 hover:bg-white/5 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Registered Users Directory */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            {/* Table Control Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ink-900/80 border border-white/10 rounded-2xl p-6">
              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Registered Innovators Directory
                </h3>
                <p className="font-body text-xs sm:text-sm text-mist-900 mt-1">
                  Full list of {users.length} architects and students with verified high-accuracy GPS coordinates.
                </p>
              </div>

              {/* Export actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 rounded-xl bg-ink-800 hover:bg-ink-700 text-white font-mono text-xs flex items-center gap-2 border border-white/10 transition-colors"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="px-4 py-2.5 rounded-xl bg-ink-800 hover:bg-ink-700 text-white font-mono text-xs flex items-center gap-2 border border-white/10 transition-colors"
                >
                  <Download size={14} />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={handleResetData}
                  title="Reset to pre-seeded demo users"
                  className="p-2.5 rounded-xl text-mist-900 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {/* Search & Profession Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8 relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist-900" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, referral code, or city..."
                  className="w-full bg-ink-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-signal"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={professionFilter}
                  onChange={(e) => setProfessionFilter(e.target.value)}
                  className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-signal cursor-pointer"
                >
                  <option value="all">All Professions ({users.length})</option>
                  <option value="architect">Architects</option>
                  <option value="student">Architecture Students</option>
                  <option value="bim">BIM Managers</option>
                  <option value="engineer">Structural / MEP Engineers</option>
                  <option value="designer">Computational Designers</option>
                  <option value="drafter">CAD Drafters</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-ink-900/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-ink-950 border-b border-white/10 text-mist-900 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Age</th>
                      <th className="px-6 py-4">Profession</th>
                      <th className="px-6 py-4">Referral Code</th>
                      <th className="px-6 py-4">Verified Location</th>
                      <th className="px-6 py-4">GPS Accuracy</th>
                      <th className="px-6 py-4">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white text-sm">
                              {u.name}
                            </div>
                            <div className="text-[11px] text-mist-900">
                              {u.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-mist-700">
                            {u.age}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-md bg-ink-800 border border-white/10 text-signal text-[11px]">
                              {u.profession}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-white bg-ink-950 px-2 py-1 rounded border border-white/10">
                              {u.referralCode}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white font-medium flex items-center gap-1.5">
                              <MapPin size={13} className="text-signal" />
                              <span>{u.location.city}, {u.location.country}</span>
                            </div>
                            <div className="text-[10px] text-mist-900 mt-0.5">
                              {u.location.latitude.toFixed(4)}°, {u.location.longitude.toFixed(4)}°
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              &plusmn;{u.location.accuracy}m
                            </span>
                          </td>
                          <td className="px-6 py-4 text-mist-900 text-[11px]">
                            {new Date(u.registeredAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-mist-900 font-mono text-sm">
                          No users found matching query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Code Generation Sub-Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-[130] bg-ink-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-ink-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h4 className="font-display text-xl font-bold text-white mb-2">
              Batch Generate Referral Codes
            </h4>
            <p className="font-body text-xs text-mist-900 mb-6">
              Create unique referral codes to distribute to architectural firms, universities, or social channels.
            </p>

            <form onSubmit={handleGenerateCodes} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-mist-700 mb-1.5">
                  Number of Codes to Generate
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={genCount}
                  onChange={(e) => setGenCount(e.target.value)}
                  className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-signal"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-mist-700 mb-1.5">
                  Prefix (e.g. ARCH, BIM, CAD, STUDIO)
                </label>
                <input
                  type="text"
                  maxLength="8"
                  value={genPrefix}
                  onChange={(e) => setGenPrefix(e.target.value.toUpperCase())}
                  className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-signal uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2.5 rounded-xl text-mist-700 hover:text-white font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-signal text-ink-950 font-display font-semibold text-xs hover:bg-signal-dim transition-all shadow-md shadow-signal/20"
                >
                  Generate Codes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
