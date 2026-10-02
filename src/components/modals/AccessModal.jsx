import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, CheckCircle2,
  AlertCircle, Key, User, Mail, Calendar, Briefcase, Download, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  registerUser,
  validateReferralCode,
  getStoredUsers,
  TOTAL_FREE_QUOTA
} from '../../services/storeService';
import { getHighAccuracyLocation, PRESET_LOCATIONS } from '../../services/geoService';

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

  // Location state
  const [locationData, setLocationData] = useState(null);
  const [isLocating, setIsLocating] = useState(false); // actively acquiring
  const locationRef = useRef(null); // keep ref for submit time

  // Submission & Validation states
  const [validationError, setValidationError] = useState('');
  const [codeStatus, setCodeStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState(''); // 'locating' | 'saving' | ''
  const [registeredUser, setRegisteredUser] = useState(null);

  const usersCount = getStoredUsers().length;
  const remainingSlots = Math.max(0, TOTAL_FREE_QUOTA - usersCount);

  // Validate referral code on type
  useEffect(() => {
    if (referralCode.trim().length >= 6) {
      setCodeStatus(validateReferralCode(referralCode));
    } else {
      setCodeStatus(null);
    }
  }, [referralCode]);

  // Start silently capturing location as soon as modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLocating(true);
      getHighAccuracyLocation()
        .then((data) => {
          setLocationData(data);
          locationRef.current = data;
        })
        .catch(() => {
          setLocationData(PRESET_LOCATIONS[0]);
          locationRef.current = PRESET_LOCATIONS[0];
        })
        .finally(() => setIsLocating(false));
    }
  }, [isOpen]);

  // Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) resetForm();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) return setValidationError('Please enter your full name.');
    if (!email.trim() || !email.includes('@')) return setValidationError('Please enter a valid email address.');
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 16 || ageNum > 99)
      return setValidationError('Please enter a valid age between 16 and 99.');
    if (!referralCode.trim())
      return setValidationError('Referral code is required to claim your free Pioneer Pass.');
    const codeCheck = validateReferralCode(referralCode);
    if (!codeCheck.valid) return setValidationError(codeCheck.message);

    setIsSubmitting(true);

    // If location still being acquired, wait for it (up to 10s more)
    if (!locationRef.current) {
      setSubmitPhase('locating');
      await new Promise((resolve) => {
        const maxWait = Date.now() + 10000;
        const poll = setInterval(() => {
          if (locationRef.current || Date.now() > maxWait) {
            clearInterval(poll);
            if (!locationRef.current) locationRef.current = PRESET_LOCATIONS[0];
            resolve();
          }
        }, 200);
      });
    }

    setSubmitPhase('saving');

    try {
      const user = registerUser({
        name,
        email,
        age: ageNum,
        profession,
        referralCode,
        location: locationRef.current || PRESET_LOCATIONS[0],
      });

      setRegisteredUser(user);
      if (onUserRegistered) onUserRegistered(user);

      try {
        confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
      } catch {}
    } catch (err) {
      setValidationError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
      setSubmitPhase('');
    }
  };

  const resetForm = () => {
    setRegisteredUser(null);
    setName('');
    setEmail('');
    setAge('');
    setReferralCode('');
    setValidationError('');
    setCodeStatus(null);
    onClose();
  };

  if (!isOpen) return null;

  const submitLabel = () => {
    if (submitPhase === 'locating') return 'Verifying location…';
    if (submitPhase === 'saving') return 'Securing your Pioneer Pass…';
    if (isSubmitting) return 'Processing…';
    return 'Claim 1 of 1,000 Free Passes';
  };

  return (
    <AnimatePresence>
      {/* Full-screen overlay */}
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isSubmitting && resetForm()}
          className="absolute inset-0 bg-ink-950/90 backdrop-blur-xl"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full sm:max-w-xl bg-ink-900 border border-white/10 sm:rounded-3xl rounded-t-3xl shadow-2xl z-10 flex flex-col max-h-[95dvh] sm:max-h-[90vh]"
        >
          {/* Header — sticky */}
          <div className="shrink-0 bg-gradient-to-r from-ink-950 via-ink-900 to-ink-950 px-5 sm:px-7 py-4 sm:py-5 border-b border-white/10 flex items-start justify-between rounded-t-3xl">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="w-1.5 h-1.5 rounded-full bg-signal animate-ping shrink-0" />
                <span className="font-mono text-[10px] sm:text-xs text-signal uppercase tracking-wider font-semibold">
                  First 1,000 Early Pioneer Pass
                </span>
                <span className="font-mono text-[10px] bg-signal/15 text-signal px-2 py-0.5 rounded border border-signal/30 shrink-0">
                  {remainingSlots} Left
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight">
                Claim 100% Free Lifetime Access
              </h3>
              <p className="font-body text-[11px] sm:text-xs text-mist-900 mt-0.5 leading-snug">
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

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-5 sm:py-6">
            {registeredUser ? (
              /* ── Success Screen ── */
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
                  Your access has been secured.
                </p>

                <div className="bg-ink-950 border border-white/10 rounded-2xl p-4 max-w-sm mx-auto text-left font-mono text-[11px] space-y-2 mb-6">
                  {[
                    ['Email', registeredUser.email],
                    ['Profession', registeredUser.profession],
                    ['Referral Used', registeredUser.referralCode],
                    ['Location', `${registeredUser.location.city}, ${registeredUser.location.country}`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between gap-2 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-mist-900 shrink-0">{label}:</span>
                      <span className="text-white text-right">{val}</span>
                    </div>
                  ))}
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
              /* ── Registration Form ── */
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Error Banner */}
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

                {/* Age + Profession — stack on mobile, side by side on sm+ */}
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
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 28"
                      inputMode="numeric"
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
                        <option key={p} value={p} className="bg-ink-900 text-white">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Referral Code */}
                <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                    <label className="font-mono text-xs text-white flex items-center gap-1.5 font-bold">
                      <Key size={12} className="text-signal" />
                      Referral Code (Required) *
                    </label>
                  </div>
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
                      <span>
                        {codeStatus.valid
                          ? '✓ Valid code — Free Lifetime Pass Unlocked'
                          : codeStatus.message}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-signal text-ink-950 font-display font-bold text-sm sm:text-base py-4 rounded-full hover:bg-signal-dim transition-all shadow-xl shadow-signal/20 flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  <span>{submitLabel()}</span>
                </button>

                {/* Location silent indicator — only visible while locating */}
                {isLocating && (
                  <p className="text-center font-mono text-[10px] text-mist-900/60 flex items-center justify-center gap-1.5">
                    <Loader2 size={10} className="animate-spin" />
                    Verifying connection…
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
