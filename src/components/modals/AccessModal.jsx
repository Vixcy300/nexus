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

  // Location state (queried in background on open and verified before submit)
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'acquiring' | 'ok' | 'denied' | 'failed'
  const [isLocating, setIsLocating] = useState(false);
  const locationRef = useRef(null);
  const locationPromiseRef = useRef(null);
  const abortRef = useRef(null);

  // Code validation
  const [codeStatus, setCodeStatus] = useState(null);
  const validateTimer = useRef(null);

  // Submit state
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);

  // Load real slot count on open and initiate background location verification
  useEffect(() => {
    if (!isOpen) return;
    getRemainingSlots().then(setRemainingSlots).catch(() => {});
    
    // Background location verification
    requestLocationFix().catch(() => {});
  }, [isOpen]);

  // Listen to browser permission state changes (e.g. user taps lock icon in address bar and sets Allow)
  useEffect(() => {
    if (!('permissions' in navigator) || !navigator.permissions?.query) return;
    let permObj;
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        permObj = status;
        const onPermChange = () => {
          if (status.state === 'granted') {
            locationPromiseRef.current = null;
            requestLocationFix().catch(() => {});
          } else if (status.state === 'denied') {
            setLocationStatus('denied');
          }
        };
        status.addEventListener('change', onPermChange);
      })
      .catch(() => {});

    return () => {
      permObj?.removeEventListener('change', onPermChange);
    };
  }, []);

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
      if (e.key === 'Escape' && isOpen && !isSubmitting && !isLocating) resetForm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSubmitting, isLocating]);

  // Background location request handler with promise deduplication
  const requestLocationFix = () => {
    if (locationRef.current?.latitude != null) {
      return Promise.resolve(locationRef.current);
    }
    if (locationPromiseRef.current) {
      return locationPromiseRef.current;
    }

    setLocationStatus('acquiring');
    setIsLocating(true);
    setValidationError('');

    const controller = new AbortController();
    abortRef.current = controller;

    const promise = (async () => {
      try {
        const loc = await getLocation({
          signal: controller.signal,
          targetAccuracy: 50,
          maxWaitMs: 12000,
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
      } finally {
        setIsLocating(false);
        locationPromiseRef.current = null;
      }
    })();

    locationPromiseRef.current = promise;
    return promise;
  };

  const handlePrimaryAction = async (e) => {
    e.preventDefault();
    setValidationError('');

    // If location is not yet verified or missing coordinates, clicking this button triggers the browser location request!
    if (locationStatus !== 'ok' || !locationRef.current?.latitude) {
      locationPromiseRef.current = null;
      try {
        const loc = await requestLocationFix();
        // If location is now acquired and form fields are ready, submit directly!
        if (loc && name.trim() && email.trim() && age && referralCode.trim()) {
          handleSubmit(e, loc);
        }
      } catch (err) {
        // Handled in requestLocationFix
      }
      return;
    }

    // Location is verified, proceed with normal form submit
    handleSubmit(e);
  };

  const handleSubmit = async (e, forcedLoc = null) => {
    if (e && e.preventDefault) e.preventDefault();
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
    let loc = forcedLoc || locationRef.current;
    if (!loc || loc.latitude == null || loc.longitude == null) {
      setSubmitPhase('locating');
      try {
        locationPromiseRef.current = null;
        loc = await requestLocationFix();
      } catch (err) {
        setIsSubmitting(false);
        setSubmitPhase('');
        if (err instanceof GeoError && err.code === 'DENIED') {
          setValidationError(
            'Location access is required. Mandatory GPS verification ensures fair distribution. Please allow location permissions in your browser.'
          );
        } else {
          setValidationError(
            'Unable to acquire location. Please ensure location is enabled on your device and browser, then try again.'
          );
        }
        return;
      }
    }

    // Double check: absolutely reject if location coordinates missing
    if (!loc || loc.latitude == null || loc.longitude == null) {
      setIsSubmitting(false);
      setSubmitPhase('');
      setValidationError('Verified location is required. Mandatory GPS verification ensures fair distribution.');
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
    locationPromiseRef.current = null;
    locationRef.current = null;
    setIsLocating(false);
    setRegisteredUser(null);
    setName('');
    setEmail('');
    setAge('');
    setReferralCode('');
    setValidationError('');
    setCodeStatus(null);
    setLocationStatus('idle');
    onClose();
  };

  if (!isOpen) return null;

  const btnLabel = () => {
    if (submitPhase === 'validating') return 'Checking referral code…';
    if (submitPhase === 'locating' || isLocating || locationStatus === 'acquiring') return 'Verifying location…';
    if (submitPhase === 'saving') return 'Securing your Pioneer Pass…';
    if (locationStatus === 'denied' || locationStatus === 'failed') return 'Allow Location to Submit';
    return 'Claim Free Pioneer Pass →';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
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
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 35, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg max-h-[90dvh] sm:max-h-[88vh] flex flex-col bg-ink-900 border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden"
        >
          {/* Mobile Drag Indicator */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden shrink-0" />

          {/* Header */}
          <div className="shrink-0 px-4 sm:px-7 pt-2.5 sm:pt-6 pb-3 sm:pb-4 border-b border-white/10 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="w-1.5 h-1.5 bg-signal rounded-full animate-pulse-slow shrink-0" />
                <span className="font-mono text-[9px] sm:text-[10px] text-signal uppercase tracking-wider font-bold">
                  First 1,000 Early Pioneer Pass
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] text-ink-950 bg-signal font-bold px-1.5 py-0.2 rounded-full">
                  {remainingSlots} Left
                </span>
              </div>
              <h3 className="font-display text-lg sm:text-2xl font-bold text-white leading-tight">
                Claim 100% Free Lifetime Access
              </h3>
              <p className="font-body text-[11px] sm:text-xs text-mist-700 mt-0.5 truncate">
                AutoCAD templates · Revit families · AI prompt suite
              </p>
            </div>
            <button
              onClick={() => !isSubmitting && resetForm()}
              className="p-2 -mr-1 -mt-1 rounded-full text-mist-500 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-7 py-4 sm:py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {registeredUser ? (
              /* Success Screen - Fully Mobile Responsive & Informative */
              <div className="text-center py-2 sm:py-4 space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-signal/15 border border-signal/40 flex items-center justify-center text-signal mx-auto shadow-lg shadow-signal/15">
                  <CheckCircle2 size={32} />
                </div>
                
                <div>
                  <span className="font-mono text-[10px] sm:text-xs text-signal uppercase tracking-widest font-bold block mb-1">
                    Pioneer Pass Verified &amp; Reserved
                  </span>
                  <h4 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Thank You, {registeredUser.name}!
                  </h4>
                  <p className="font-body text-xs sm:text-sm text-mist-700 mt-1 max-w-sm mx-auto">
                    You are officially confirmed as Pioneer Member{' '}
                    <span className="font-mono text-signal font-bold">#{registeredUser.id}</span>.
                  </p>
                </div>

                {/* Service Availability / Launch Notice Card */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 text-left text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>We will notify you when services go live!</span>
                  </div>
                  <p className="text-mist-500 font-body text-xs sm:text-sm leading-relaxed">
                    Our computational design team is finalizing the CAD blocks, smart Revit families, and AI prompt engines. As a verified Early Pioneer, you will receive an exclusive priority email with instant access the moment downloads and services launch.
                  </p>
                </div>

                {/* Credentials Card (Country only, mobile responsive) */}
                <div className="bg-ink-950 border border-white/10 rounded-2xl p-4 sm:p-5 text-left font-mono text-xs space-y-2.5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-mist-700">Member ID:</span>
                    <span className="font-bold text-signal">#{registeredUser.id}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-mist-700">Email:</span>
                    <span className="text-white font-medium break-all text-right ml-2">{registeredUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-mist-700">Discipline:</span>
                    <span className="text-white text-right ml-2">{registeredUser.profession}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-mist-700">Country:</span>
                    <span className="text-white font-semibold text-right ml-2">
                      {registeredUser.location?.country || 'International'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-mist-700">Pass Code:</span>
                    <span className="text-emerald-400 font-bold">{registeredUser.referralCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-mist-700">Status:</span>
                    <span className="text-emerald-400 font-bold">✓ 100% Free Lifetime Reserved</span>
                  </div>
                </div>

                {/* Email notice badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-signal font-mono bg-signal/10 border border-signal/20 rounded-xl py-2.5 px-3">
                  <Mail size={14} className="shrink-0" />
                  <span className="truncate">Confirmation pass sent to {registeredUser.email}</span>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <button
                    onClick={resetForm}
                    className="w-full bg-signal text-ink-950 font-display font-bold text-sm sm:text-base py-3.5 sm:py-4 rounded-full hover:bg-signal-dim transition-all shadow-xl shadow-signal/20 flex items-center justify-center gap-2"
                  >
                    <span>Done — Return to Studio</span>
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
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-base sm:text-sm focus:outline-none focus:border-signal transition-colors"
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
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-base sm:text-sm focus:outline-none focus:border-signal transition-colors"
                  />
                </div>

                {/* Age & Profession */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-base sm:text-sm focus:outline-none focus:border-signal transition-colors font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-mono text-xs text-mist-900 mb-1.5 flex items-center gap-1.5">
                      <Briefcase size={12} className="text-signal" /> Professional Role *
                    </label>
                    <select
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white text-base sm:text-sm focus:outline-none focus:border-signal transition-colors"
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
                <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-3.5 sm:p-4">
                  <label className="font-mono text-xs text-white flex items-center gap-1.5 font-bold mb-1.5">
                    <Key size={12} className="text-signal" /> Referral Code (Required) *
                  </label>
                  <input
                    type="text"
                    required
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter referral code"
                    className="w-full bg-ink-900 border border-white/15 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-white font-mono text-sm tracking-normal sm:tracking-wider focus:outline-none focus:border-signal transition-colors"
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

                {/* ── Background Location Verification Status ── */}
                {locationStatus === 'acquiring' && (
                  <div className="flex items-center justify-center gap-2 font-mono text-xs text-mist-500 py-1.5">
                    <Loader2 size={13} className="animate-spin text-signal" />
                    <span>Verifying location in background…</span>
                  </div>
                )}

                {locationStatus === 'ok' && (
                  <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-emerald-400 py-1.5">
                    <CheckCircle2 size={13} />
                    <span>Location verified</span>
                  </div>
                )}

                {(locationStatus === 'denied' || locationStatus === 'failed') && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-xs font-mono space-y-3 text-red-400">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
                        <div>
                          <div className="font-bold text-white text-sm">Location access required</div>
                          <div className="text-[11px] text-amber-300 font-medium mt-0.5">
                            Mandatory GPS verification ensures fair distribution.
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isLocating}
                        onClick={() => {
                          locationPromiseRef.current = null;
                          requestLocationFix().catch(() => {});
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-signal text-ink-950 font-bold hover:bg-signal-dim transition-all text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-signal/20 disabled:opacity-60"
                      >
                        {isLocating ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} className="rotate-45" />}
                        <span>{isLocating ? 'Verifying…' : 'Enable Location'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-mist-500 leading-relaxed font-sans">
                      Mandatory GPS verification ensures fair distribution of the 1,000 Free Pioneer Passes. Location access is currently disabled or blocked in your browser.
                    </p>

                    {/* Step-by-step browser unblock guide */}
                    <div className="bg-ink-950/70 border border-white/10 rounded-xl p-3 text-[11px] text-mist-300 space-y-1.5 font-sans">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Navigation size={12} className="text-signal" />
                        <span>How to allow in your browser:</span>
                      </div>
                      <p className="leading-snug">
                        1. Tap the lock or site settings icon <span className="text-white font-bold">🔒</span> next to the URL in your browser address bar above.
                      </p>
                      <p className="leading-snug">
                        2. Set <span className="text-white font-bold">Location</span> to <span className="text-emerald-400 font-bold">Allow</span>.
                      </p>
                      <p className="leading-snug">
                        3. Tap <span className="text-signal font-bold">Enable Location</span> button above to re-verify.
                      </p>
                    </div>
                  </div>
                )}

                {/* Primary Action Button & Safe Area */}
                <div className="pt-2 pb-5 sm:pb-1">
                  <button
                    type={locationStatus === 'ok' && locationRef.current?.latitude ? 'submit' : 'button'}
                    onClick={handlePrimaryAction}
                    disabled={isSubmitting || isLocating}
                    className="w-full bg-signal text-ink-950 font-display font-bold text-sm sm:text-base py-3.5 sm:py-4 rounded-full hover:bg-signal-dim transition-all shadow-xl shadow-signal/20 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isLocating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    <span>{btnLabel()}</span>
                  </button>

                  <p className="text-center font-mono text-[10px] sm:text-[11px] text-mist-900 leading-snug mt-2.5">
                    🔒 Strictly limited to 1,000 passes. One claim per verified creator.
                  </p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
