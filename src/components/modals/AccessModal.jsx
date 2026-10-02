import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, CheckCircle2, AlertCircle,
  Key, User, Mail, Calendar, Briefcase, Download, Loader2,
  MapPin, Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { registerUser, validateReferralCode, TOTAL_FREE_QUOTA, getRemainingSlots } from '../../services/storeService';
import { getLocation, GeoError } from '../../services/geoService';

const PROFESSIONS = [
  'Architecture Student',
  'Licensed Architect / Working Architect',
  'BIM Manager / BIM Coordinator',
  'CAD Drafter / 2D-3D Technician',
  'Structural / Civil Engineer',
  'MEP Engineer (HVAC/Plumbing/Elec)',
  'Computational Designer / Parametric Lead',
  'Studio Principal / Founder',
  'Interior Architect / Designer',
];

export default function AccessModal({ isOpen, onClose, onUserRegistered }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [profession, setProfession] = useState(PROFESSIONS[1]);
  const [referralCode, setReferralCode] = useState('');

  // Slots count loaded async
  const [remainingSlots, setRemainingSlots] = useState(TOTAL_FREE_QUOTA);

  // GPS state (starts idle - ONLY queried when requested or on submit)
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'acquiring' | 'ok' | 'denied' | 'failed'
  const locationRef = useRef(null);
  const abortRef = useRef(null);

  // Code validation
  const [codeStatus, setCodeStatus] = useState(null);
  const validateTimer = useRef(null);

  // Submit state
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);

  // Load real slot count on open
  useEffect(() => {
    if (!isOpen) return;
    getRemainingSlots().then(setRemainingSlots).catch(() => {});
  }, [isOpen]);

  // Debounced async referral code validation
  useEffect(() => {
    clearTimeout(validateTimer.current);
    if (referralCode.trim().length < 6) {
      setCodeStatus(null);
      return;
    }
    validateTimer.current = setTimeout(async () => {
      const res = await validateReferralCode(referralCode);
      setCodeStatus(res);
    }, 500);
    return () => clearTimeout(validateTimer.current);
  }, [referralCode]);

  // Esc key handler
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) resetForm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSubmitting]);

  // Explicit location request handler
  const requestLocationFix = async () => {
    setLocationStatus('acquiring');
    setValidationError('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const loc = await getLocation({
        signal: controller.signal,
        targetAccuracy: 15,
        maxWaitMs: 15000,
        stallMs: 4000,
      });

      locationRef.current = loc;
      setLocationStatus('ok');
      return loc;
    } catch (err) {
      if (err instanceof GeoError && err.code === 'ABORTED') {
        setLocationStatus('idle');
        return null;
      }
      if (err instanceof GeoError && err.code === 'DENIED') {
        setLocationStatus('denied');
      } else {
        setLocationStatus('failed');
      }
      locationRef.current = null;
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) return setValidationError('Please enter your full name.');
    if (!email.trim() || !email.includes('@')) return setValidationError('Please enter a valid email address.');
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 16 || ageNum > 99) {
      return setValidationError('Please enter a valid age between 16 and 99.');
    }
    if (!referralCode.trim()) {
      return setValidationError('A referral code is required to claim your Pioneer Pass.');
    }

    setIsSubmitting(true);

    // 1. Validate referral code first
    setSubmitPhase('validating');
    const codeCheck = await validateReferralCode(referralCode);
    if (!codeCheck.valid) {
      setValidationError(codeCheck.message);
      setIsSubmitting(false);
      setSubmitPhase('');
      return;
    }

    // 2. Strict location verification: Must have valid coordinates
    let loc = locationRef.current;
    if (!loc || loc.latitude == null || loc.longitude == null) {
      setSubmitPhase('locating');
      try {
        loc = await requestLocationFix();
      } catch (err) {
        setIsSubmitting(false);
        setSubmitPhase('');
        if (err instanceof GeoError && err.code === 'DENIED') {
          setValidationError(
            'Location access is mandatory to claim your Free Pioneer Pass. Please allow location permissions in your browser.'
          );
        } else {
          setValidationError(
            'Unable to acquire GPS fix. Please ensure location is enabled on your device and try again.'
          );
        }
        return;
      }
    }

    // Double check: absolutely reject if location coordinates missing
    if (!loc || loc.latitude == null || loc.longitude == null) {
      setIsSubmitting(false);
      setSubmitPhase('');
      setValidationError('Verified geographic location is required. Please grant location access to submit.');
      return;
    }

    // 3. Register user with verified coordinates
    setSubmitPhase('saving');
    try {
      const user = await registerUser({
        name,
        email,
        age: ageNum,
        profession,
        referralCode,
        location: loc,
      });

      setRegisteredUser(user);
      if (onUserRegistered) onUserRegistered(user);
      getRemainingSlots().then(setRemainingSlots).catch(() => {});
      try {
        confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
      } catch {}

      // Asynchronously dispatch Google SMTP confirmation pass
      fetch('/api/send-confirmation', {
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
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('[NEXUS] Confirmation email dispatched:', data);
        })
        .catch((mailErr) => {
          console.warn('[NEXUS] Email dispatch error:', mailErr);
        });
    } catch (err) {
      setValidationError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSubmitPhase('');
    }
  };

  const resetForm = () => {
    abortRef.current?.abort();
    setRegisteredUser(null);
    setName('');
    setEmail('');
    setAge('');
    setReferralCode('');
    setValidationError('');
    setCodeStatus(null);
    setLocationStatus('idle');
    locationRef.current = null;
    onClose();
  };

  if (!isOpen) return null;

  const btnLabel = () => {
    if (submitPhase === 'validating') return 'Checking referral code…';
    if (submitPhase === 'locating') return 'Verifying high-precision GPS…';
    if (submitPhase === 'saving') return 'Securing your Pioneer Pass…';
    if (locationStatus === 'ok') return 'Claim Free Pioneer Pass →';
    return 'Verify Location & Claim Pass →';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isSubmitting && resetForm()}
          className="fixed inset-0 bg-ink-950/90 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-ink-900 border border-white/15 rounded-3xl shadow-2xl z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="shrink-0 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-white/10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 bg-signal rounded-full animate-pulse-slow" />
                <span className="font-mono text-[10px] text-signal uppercase tracking-widest font-bold">
                  First 1,000 Early Pioneer Pass
                </span>
                <span className="font-mono text-[10px] text-ink-950 bg-signal font-bold px-2 py-0.5 rounded-full ml-1">
                  {remainingSlots} Left
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight">
                Claim 100% Free Lifetime Access
              </h3>
              <p className="font-body text-[11px] sm:text-xs text-mist-900 mt-0.5">
                AutoCAD templates · Revit families · AI prompt suite
              </p>
            </div>
            <button
              onClick={() => !isSubmitting && resetForm()}
              className="p-1.5 rounded-full text-mist-700 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-5 sm:py-6">
            {registeredUser ? (
              /* Success Screen */
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-signal/10 border border-signal/40 flex items-center justify-center text-signal mx-auto mb-4">
                  <CheckCircle2 size={30} />
                </div>
                <span className="font-mono text-[10px] text-signal uppercase tracking-widest block mb-1">
                  Access Pass Activated
                </span>
                <h4 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                  Welcome, {registeredUser.name}!
                </h4>
                <p className="font-body text-xs sm:text-sm text-mist-900 max-w-sm mx-auto mb-5">
                  You are officially Pioneer Member{' '}
                  <span className="font-mono text-white font-bold">#{registeredUser.id}</span>.
                </p>

                <div className="bg-ink-950 border border-white/10 rounded-2xl p-4 max-w-sm mx-auto text-left font-mono text-[11px] space-y-2 mb-4">
                  {[
                    ['Email', registeredUser.email],
                    ['Role', registeredUser.profession],
                    ['Referral', registeredUser.referralCode],
                    [
                      'Region',
                      [registeredUser.location?.suburb, registeredUser.location?.city, registeredUser.location?.country]
                        .filter(Boolean)
                        .join(', ') || 'Global Network',
                    ],
                    [
                      'Coordinates',
                      registeredUser.location?.latitude != null
                        ? `${Number(registeredUser.location.latitude).toFixed(4)}, ${Number(
                            registeredUser.location.longitude
                          ).toFixed(4)}`
                        : 'Verified Fix',
                    ],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between gap-2 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-mist-900 shrink-0">{l}:</span>
                      <span className="text-white text-right break-all">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-signal font-mono mb-6 bg-signal/10 border border-signal/20 rounded-xl py-2 px-3 max-w-sm mx-auto">
                  <Mail size={13} className="shrink-0" />
                  <span className="truncate">Confirmation pass sent to {registeredUser.email}</span>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => alert('Downloading NEXUS Architectural Suite…')}
                    className="w-full bg-signal text-ink-950 font-display font-semibold px-6 py-3.5 rounded-full hover:bg-signal-dim transition-all flex items-center justify-center gap-2 shadow-lg shadow-signal/20"
                  >
                    <Download size={15} />
                    <span>Download CAD &amp; Revit Library</span>
                  </button>
                  <button
                    onClick={resetForm}
                    className="w-full bg-ink-800 text-white font-display font-semibold px-6 py-3 rounded-full hover:bg-ink-700 border border-white/10 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Validation Error Banner */}
                {validationError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 text-red-400 text-xs font-mono">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block font-mono text-xs text-mist-900 mb-1.5 flex items-center gap-1.5">
                    <User size={12} className="text-signal" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-signal transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-mono text-xs text-mist-900 mb-1.5 flex items-center gap-1.5">
                    <Mail size={12} className="text-signal" /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. architect@studio.com"
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-signal transition-colors"
                  />
                </div>

                {/* Age & Profession */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-mist-900 mb-1.5 flex items-center gap-1.5">
                      <Calendar size={12} className="text-signal" /> Age *
                    </label>
                    <input
                      type="number"
                      required
                      min="16"
                      max="99"
                      inputMode="numeric"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="28"
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-signal transition-colors font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-mono text-xs text-mist-900 mb-1.5 flex items-center gap-1.5">
                      <Briefcase size={12} className="text-signal" /> Professional Role *
                    </label>
                    <select
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-signal transition-colors"
                    >
                      {PROFESSIONS.map((p) => (
                        <option key={p} value={p} className="bg-ink-900">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Referral Code */}
                <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4">
                  <label className="font-mono text-xs text-white flex items-center gap-1.5 font-bold mb-1.5">
                    <Key size={12} className="text-signal" /> Referral Code (Required) *
                  </label>
                  <input
                    type="text"
                    required
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter your referral code"
                    className="w-full bg-ink-900 border border-white/15 rounded-xl px-4 py-3 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-signal transition-colors"
                  />
                  {codeStatus && (
                    <div
                      className={`mt-2 font-mono text-[11px] flex items-center gap-1.5 ${
                        codeStatus.valid ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {codeStatus.valid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      <span>{codeStatus.valid ? '✓ Valid — Free Lifetime Pass Unlocked' : codeStatus.message}</span>
                    </div>
                  )}
                </div>

                {/* ── Geographic Telemetry Status Card (MANDATORY REQUIREMENT) ── */}
                {locationStatus === 'idle' && (
                  <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="text-signal shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono text-xs text-white font-bold block">
                          GPS Location Verification (Mandatory)
                        </span>
                        <p className="font-mono text-[11px] text-mist-700 mt-0.5">
                          High-precision coordinates map NEXUS Studio&apos;s next research lab.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={requestLocationFix}
                      disabled={isSubmitting}
                      className="px-3.5 py-1.5 rounded-lg bg-signal/10 border border-signal/30 text-signal hover:bg-signal/20 font-mono text-xs font-semibold shrink-0 transition-colors"
                    >
                      Verify Location Now
                    </button>
                  </div>
                )}

                {locationStatus === 'acquiring' && (
                  <div className="bg-signal/5 border border-signal/30 rounded-2xl p-4 flex items-center gap-3 text-signal">
                    <Loader2 size={16} className="animate-spin shrink-0" />
                    <div className="font-mono text-xs">
                      <div className="font-bold">Acquiring GPS fix (target accuracy ≤15m)…</div>
                      <div className="text-[11px] text-signal/80 mt-0.5">
                        Please tap &quot;Allow&quot; in the browser location popup.
                      </div>
                    </div>
                  </div>
                )}

                {locationStatus === 'ok' && locationRef.current && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-emerald-400">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 size={18} className="shrink-0" />
                      <div className="min-w-0 font-mono text-xs">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>Location Verified</span>
                          {locationRef.current.accuracy != null && (
                            <span className="text-[10px] text-signal bg-signal/10 px-2 py-0.2 rounded-full border border-signal/25">
                              ±{Math.round(locationRef.current.accuracy)}m Precision
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-mist-500 truncate mt-0.5">
                          {[
                            locationRef.current.suburb,
                            locationRef.current.city,
                            locationRef.current.country,
                          ]
                            .filter(Boolean)
                            .join(', ') || 'Coordinates Locked'}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest bg-emerald-500/20 px-2 py-1 rounded shrink-0">
                      Verified
                    </span>
                  </div>
                )}

                {locationStatus === 'denied' && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-2.5 text-red-400">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <div className="font-mono text-xs">
                        <span className="font-bold block text-white">
                          Location Access Denied — Registration Blocked
                        </span>
                        <p className="text-mist-500 text-[11px] mt-1 leading-relaxed">
                          Pioneer Passes strictly require verified coordinates to determine studio deployment. To enable:
                        </p>
                        <ol className="list-decimal list-inside text-mist-700 text-[11px] mt-1 space-y-0.5">
                          <li>
                            Click the lock icon <span className="text-white font-bold">🔒</span> in your browser address bar
                          </li>
                          <li>
                            Set <span className="text-white">Location</span> to{' '}
                            <span className="text-emerald-400 font-bold">Allow</span>
                          </li>
                          <li>Click the button below to re-verify</li>
                        </ol>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={requestLocationFix}
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl bg-signal text-ink-950 font-mono text-xs font-bold hover:bg-signal-dim transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-signal/15"
                    >
                      <Navigation size={13} className="rotate-45" />
                      <span>Retry Location Permission Access</span>
                    </button>
                  </div>
                )}

                {locationStatus === 'failed' && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-400 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>GPS signal timeout. Please ensure location is enabled.</span>
                    </div>
                    <button
                      type="button"
                      onClick={requestLocationFix}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs"
                    >
                      Retry GPS Fix
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-signal text-ink-950 font-display font-bold text-sm sm:text-base py-4 rounded-full hover:bg-signal-dim transition-all shadow-xl shadow-signal/20 flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  <span>{btnLabel()}</span>
                </button>

                <p className="text-center font-mono text-[10px] text-mist-900 leading-snug">
                  🔒 Strictly limited to 1,000 passes. Mandatory GPS verification ensures fair distribution.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
