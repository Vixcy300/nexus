import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, CheckCircle2, AlertCircle,
  Key, User, Mail, Calendar, Briefcase, Download, Loader2
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
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [age,        setAge]        = useState('');
  const [profession, setProfession] = useState(PROFESSIONS[1]);
  const [referralCode, setReferralCode] = useState('');

  // Slots count loaded async
  const [remainingSlots, setRemainingSlots] = useState(TOTAL_FREE_QUOTA);

  // GPS state
  const [locationStatus, setLocationStatus] = useState('idle'); // idle|acquiring|ok|denied|failed
  const locationRef  = useRef(null);
  const abortRef     = useRef(null);

  // Code validation
  const [codeStatus,   setCodeStatus]   = useState(null);
  const validateTimer = useRef(null);

  // Submit state
  const [validationError, setValidationError] = useState('');
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [submitPhase,     setSubmitPhase]     = useState('');
  const [registeredUser,  setRegisteredUser]  = useState(null);

  // Load real slot count
  useEffect(() => {
    if (!isOpen) return;
    getRemainingSlots().then(setRemainingSlots).catch(() => {});
  }, [isOpen]);

  // Start GPS acquisition when modal opens
  const locationPromiseRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setLocationStatus('acquiring');

    const locPromise = getLocation({
      signal: controller.signal,
      targetAccuracy: 15,
      maxWaitMs: 15000,
      stallMs: 4000,
    });
    locationPromiseRef.current = locPromise;

    locPromise
      .then((loc) => {
        locationRef.current = loc;
        setLocationStatus('ok');
      })
      .catch((err) => {
        if (err instanceof GeoError && err.code === 'ABORTED') return;
        if (err instanceof GeoError && err.code === 'DENIED') {
          setLocationStatus('denied');
        } else {
          setLocationStatus('failed');
          locationRef.current = null;
        }
      });

    return () => controller.abort();
  }, [isOpen]);

  // Debounced async referral code validation
  useEffect(() => {
    clearTimeout(validateTimer.current);
    if (referralCode.trim().length < 6) { setCodeStatus(null); return; }
    validateTimer.current = setTimeout(async () => {
      const res = await validateReferralCode(referralCode);
      setCodeStatus(res);
    }, 500);
    return () => clearTimeout(validateTimer.current);
  }, [referralCode]);

  // Esc key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isOpen && !isSubmitting) resetForm(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim())                           return setValidationError('Please enter your full name.');
    if (!email.trim() || !email.includes('@'))  return setValidationError('Please enter a valid email address.');
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 16 || ageNum > 99)
      return setValidationError('Please enter a valid age between 16 and 99.');
    if (!referralCode.trim())
      return setValidationError('A referral code is required to claim your Pioneer Pass.');

    // Validate code (may still be loading)
    setSubmitPhase('validating');
    setIsSubmitting(true);
    const codeCheck = await validateReferralCode(referralCode);
    if (!codeCheck.valid) {
      setValidationError(codeCheck.message);
      setIsSubmitting(false);
      setSubmitPhase('');
      return;
    }

    // If GPS still running, wait for the in-flight high precision fix (up to 8s)
    if (!locationRef.current && locationPromiseRef.current) {
      setSubmitPhase('locating');
      try {
        const resolvedLoc = await Promise.race([
          locationPromiseRef.current,
          new Promise((resolve) => setTimeout(() => resolve(null), 8000)),
        ]);
        if (resolvedLoc) {
          locationRef.current = resolvedLoc;
        }
      } catch (e) {
        // Fallback handled in promise catch
      }
    }

    setSubmitPhase('saving');
    try {
      const user = await registerUser({
        name, email, age: ageNum, profession, referralCode,
        location: locationRef.current || null,
      });
      setRegisteredUser(user);
      if (onUserRegistered) onUserRegistered(user);
      // Update remaining slots
      getRemainingSlots().then(setRemainingSlots).catch(() => {});
      try { confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } }); } catch {}

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
    setName(''); setEmail(''); setAge(''); setReferralCode('');
    setValidationError(''); setCodeStatus(null);
    setLocationStatus('idle');
    locationRef.current = null;
    onClose();
  };

  if (!isOpen) return null;

  const btnLabel = () => {
    if (submitPhase === 'validating') return 'Checking code…';
    if (submitPhase === 'locating')   return 'Verifying location…';
    if (submitPhase === 'saving')     return 'Securing your Pioneer Pass…';
    if (isSubmitting)                 return 'Processing…';
    return 'Claim 1 of 1,000 Free Passes';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => !isSubmitting && resetForm()}
          className="absolute inset-0 bg-ink-950/90 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full sm:max-w-xl bg-ink-900 border border-white/10 sm:rounded-3xl rounded-t-3xl shadow-2xl z-10 flex flex-col max-h-[95dvh] sm:max-h-[90vh]"
        >
          {/* Header */}
          <div className="shrink-0 px-5 sm:px-7 py-4 border-b border-white/10 flex items-start justify-between rounded-t-3xl bg-ink-950/60">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="w-1.5 h-1.5 rounded-full bg-signal animate-ping shrink-0" />
                <span className="font-mono text-[10px] text-signal uppercase tracking-wider font-semibold">
                  First 1,000 Early Pioneer Pass
                </span>
                <span className="font-mono text-[10px] bg-signal/15 text-signal px-2 py-0.5 rounded border border-signal/30 shrink-0">
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
            <button onClick={() => !isSubmitting && resetForm()}
              className="p-1.5 rounded-full text-mist-700 hover:text-white hover:bg-white/10 transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-5 sm:py-6">
            {registeredUser ? (
              /* Success */
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-signal/10 border border-signal/40 flex items-center justify-center text-signal mx-auto mb-4">
                  <CheckCircle2 size={30} />
                </div>
                <span className="font-mono text-[10px] text-signal uppercase tracking-widest block mb-1">Access Pass Activated</span>
                <h4 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">Welcome, {registeredUser.name}!</h4>
                <p className="font-body text-xs sm:text-sm text-mist-900 max-w-sm mx-auto mb-5">
                  You are officially Pioneer Member <span className="font-mono text-white font-bold">#{registeredUser.id}</span>.
                </p>
                <div className="bg-ink-950 border border-white/10 rounded-2xl p-4 max-w-sm mx-auto text-left font-mono text-[11px] space-y-2 mb-4">
                  {[
                    ['Email',    registeredUser.email],
                    ['Role',     registeredUser.profession],
                    ['Referral', registeredUser.referralCode],
                    ['Region',   [registeredUser.location?.city, registeredUser.location?.country].filter(Boolean).join(', ') || 'Global Network'],
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
                  <button onClick={() => alert('Downloading NEXUS Architectural Suite…')}
                    className="w-full bg-signal text-ink-950 font-display font-semibold px-6 py-3.5 rounded-full hover:bg-signal-dim transition-all flex items-center justify-center gap-2 shadow-lg shadow-signal/20">
                    <Download size={15} /><span>Download CAD &amp; Revit Library</span>
                  </button>
                  <button onClick={resetForm}
                    className="w-full bg-ink-800 text-white font-display font-semibold px-6 py-3 rounded-full hover:bg-ink-700 border border-white/10 transition-all">
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Location denied banner */}
                {locationStatus === 'denied' && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-amber-400 text-xs font-mono">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>Location access was denied. Your registration will still be processed — enable location in browser settings for full geographic verification.</span>
                  </div>
                )}

                {validationError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 text-red-400 text-xs font-mono">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-mono text-xs text-mist-900 mb-1.5 flex items-center gap-1.5">
                    <User size={12} className="text-signal" /> Full Name *
                  </label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maya Lin"
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-signal transition-colors" />
                </div>

                <div>
                  <label className="block font-mono text-xs text-mist-900 mb-1.5 flex items-center gap-1.5">
                    <Mail size={12} className="text-signal" /> Email Address *
                  </label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. architect@studio.com"
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-signal transition-colors" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-mist-900 mb-1.5 flex items-center gap-1.5">
                      <Calendar size={12} className="text-signal" /> Age *
                    </label>
                    <input type="number" required min="16" max="99" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="28"
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-signal transition-colors font-mono" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-mono text-xs text-mist-900 mb-1.5 flex items-center gap-1.5">
                      <Briefcase size={12} className="text-signal" /> Professional Role *
                    </label>
                    <select value={profession} onChange={(e) => setProfession(e.target.value)}
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-signal transition-colors">
                      {PROFESSIONS.map((p) => <option key={p} value={p} className="bg-ink-900">{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4">
                  <label className="font-mono text-xs text-white flex items-center gap-1.5 font-bold mb-1.5">
                    <Key size={12} className="text-signal" /> Referral Code (Required) *
                  </label>
                  <input type="text" required value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter your referral code"
                    className="w-full bg-ink-900 border border-white/15 rounded-xl px-4 py-3 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-signal transition-colors" />
                  {codeStatus && (
                    <div className={`mt-2 font-mono text-[11px] flex items-center gap-1.5 ${codeStatus.valid ? 'text-green-400' : 'text-red-400'}`}>
                      {codeStatus.valid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      <span>{codeStatus.valid ? '✓ Valid — Free Lifetime Pass Unlocked' : codeStatus.message}</span>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-signal text-ink-950 font-display font-bold text-sm sm:text-base py-4 rounded-full hover:bg-signal-dim transition-all shadow-xl shadow-signal/20 flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  <span>{btnLabel()}</span>
                </button>

                {locationStatus === 'acquiring' && (
                  <p className="text-center font-mono text-[10px] text-mist-900/50 flex items-center justify-center gap-1.5">
                    <Loader2 size={9} className="animate-spin" /> Verifying connection…
                  </p>
                )}

                <p className="text-center font-mono text-[10px] text-mist-900 leading-snug">
                  🔒 Strictly limited to 1,000 passes. By submitting you agree to our Terms &amp; Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
