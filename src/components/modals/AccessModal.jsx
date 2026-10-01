import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, CheckCircle2, 
  AlertCircle, Key, User, Mail, Calendar, Briefcase, Download
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
  'Interior Architect / Designer'
];

export default function AccessModal({ isOpen, onClose, onUserRegistered }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [profession, setProfession] = useState(PROFESSIONS[1]);
  const [referralCode, setReferralCode] = useState('');
  
  // Geolocation state (silent background acquisition)
  const [locationData, setLocationData] = useState(null);

  // Submission & Validation states
  const [validationError, setValidationError] = useState('');
  const [codeStatus, setCodeStatus] = useState(null); // { valid: bool, message: str }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const usersCount = getStoredUsers().length;
  const remainingSlots = Math.max(0, TOTAL_FREE_QUOTA - usersCount);

  // Check referral code in real-time when 6+ chars typed
  useEffect(() => {
    if (referralCode.trim().length >= 6) {
      const res = validateReferralCode(referralCode);
      setCodeStatus(res);
    } else {
      setCodeStatus(null);
    }
  }, [referralCode]);

  // Silently acquire location in background on open
  useEffect(() => {
    if (isOpen && !locationData) {
      handleAcquireLocation();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        resetForm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleAcquireLocation = async () => {
    try {
      const data = await getHighAccuracyLocation();
      setLocationData(data);
    } catch {
      // Auto-fallback silently to default preset without showing any errors or prompts
      setLocationData(PRESET_LOCATIONS[0]);
    }
  };

  const handleApplySampleCode = () => {
    setReferralCode('ARCH-2026-ALPHA');
    const res = validateReferralCode('ARCH-2026-ALPHA');
    setCodeStatus(res);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 16 || ageNum > 99) {
      setValidationError('Please enter a valid age between 16 and 99.');
      return;
    }
    if (!referralCode.trim()) {
      setValidationError('Referral code is mandatory to unlock the first 1,000 free access tier.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalLoc = locationData || PRESET_LOCATIONS[0];
      const user = registerUser({
        name,
        email,
        age: ageNum,
        profession,
        referralCode,
        location: finalLoc
      });

      setRegisteredUser(user);
      if (onUserRegistered) onUserRegistered(user);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // no-op if confetti blocked
      }

    } catch (err) {
      setValidationError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRegisteredUser(null);
    setName('');
    setEmail('');
    setAge('');
    setReferralCode('');
    setValidationError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetForm}
          className="fixed inset-0 bg-ink-950/90 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-ink-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-ink-950 via-ink-900 to-ink-950 px-6 sm:px-8 py-6 border-b border-white/10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-signal animate-ping" />
                <span className="font-mono text-xs text-signal uppercase tracking-wider font-semibold">
                  First 1,000 Early Pioneer Pass
                </span>
                <span className="font-mono text-[10px] bg-signal/15 text-signal px-2 py-0.5 rounded border border-signal/30">
                  {remainingSlots} Slots Left
                </span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Claim 100% Free Lifetime Access
              </h3>
              <p className="font-body text-xs sm:text-sm text-mist-900 mt-1 max-w-md">
                Full AutoCAD (.DWG) dynamic templates, Revit (.RFA) smart families, and AI prompt generation suite.
              </p>
            </div>

            <button
              onClick={resetForm}
              className="p-2 rounded-full text-mist-700 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
            {registeredUser ? (
              /* Success / Granted Screen */
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-signal/10 border border-signal/40 flex items-center justify-center text-signal mx-auto mb-6">
                  <CheckCircle2 size={36} />
                </div>

                <span className="font-mono text-xs text-signal uppercase tracking-widest block mb-1">
                  Access Pass Activated
                </span>
                <h4 className="font-display text-3xl font-bold text-white mb-2">
                  Welcome, {registeredUser.name}!
                </h4>
                <p className="font-body text-sm text-mist-900 max-w-md mx-auto mb-6">
                  Your registration has been securely recorded. You are officially Pioneer Member <span className="font-mono text-white font-bold">#{registeredUser.id}</span>.
                </p>

                {/* Registered Summary Ticket */}
                <div className="bg-ink-950 border border-white/10 rounded-2xl p-5 max-w-md mx-auto text-left font-mono text-xs space-y-2 mb-8">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-mist-900">Email:</span>
                    <span className="text-white">{registeredUser.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-mist-900">Profession:</span>
                    <span className="text-signal">{registeredUser.profession}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-mist-900">Referral Used:</span>
                    <span className="text-white font-bold">{registeredUser.referralCode}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      alert('Downloading NEXUS Master Architectural Suite (AutoCAD .DWG Templates + Revit 2026 BIM Families + AI Prompts)...');
                    }}
                    className="w-full sm:w-auto bg-signal text-ink-950 font-display font-semibold px-8 py-3.5 rounded-full hover:bg-signal-dim transition-all flex items-center justify-center gap-2 shadow-lg shadow-signal/20 cursor-pointer"
                  >
                    <Download size={16} />
                    <span>Download CAD & Revit Library (.ZIP)</span>
                  </button>

                  <button
                    onClick={resetForm}
                    className="w-full sm:w-auto bg-ink-800 text-white font-display font-semibold px-6 py-3.5 rounded-full hover:bg-ink-700 border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Done</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Validation Banner */}
                {validationError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs font-mono">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-mist-900 mb-1.5 flex items-center gap-1.5">
                      <User size={13} className="text-signal" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-signal transition-colors font-body"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-mist-900 mb-1.5 flex items-center gap-1.5">
                      <Mail size={13} className="text-signal" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. architect@studio.com"
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-signal transition-colors font-body"
                    />
                  </div>
                </div>

                {/* Age & Profession Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-4">
                    <label className="block font-mono text-xs text-mist-900 mb-1.5 flex items-center gap-1.5">
                      <Calendar size={13} className="text-signal" />
                      Age *
                    </label>
                    <input
                      type="number"
                      required
                      min="16"
                      max="99"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 28"
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-signal transition-colors font-mono"
                    />
                  </div>

                  <div className="sm:col-span-8">
                    <label className="block font-mono text-xs text-mist-900 mb-1.5 flex items-center gap-1.5">
                      <Briefcase size={13} className="text-signal" />
                      Professional Status *
                    </label>
                    <select
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-signal transition-colors font-body cursor-pointer"
                    >
                      {PROFESSIONS.map((p) => (
                        <option key={p} value={p} className="bg-ink-900 text-white">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Referral Code (Mandatory) */}
                <div className="bg-ink-950/80 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-mono text-xs text-white flex items-center gap-1.5 font-bold">
                      <Key size={13} className="text-signal" />
                      Referral Code (MUST to Sign In) *
                    </label>
                    <button
                      type="button"
                      onClick={handleApplySampleCode}
                      className="text-[11px] font-mono text-signal hover:underline"
                    >
                      Use Demo Code: ARCH-2026-ALPHA
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter 8+ character referral code"
                    className="w-full bg-ink-900 border border-white/15 rounded-xl px-4 py-3 text-white font-mono text-sm tracking-widest focus:outline-none focus:border-signal transition-colors"
                  />

                  {codeStatus && (
                    <div className={`mt-2 font-mono text-xs flex items-center gap-1.5 ${codeStatus.valid ? 'text-green-400' : 'text-red-400'}`}>
                      {codeStatus.valid ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                      <span>{codeStatus.valid ? 'Valid Referral Code &bull; 100% Free Pass Unlocked' : codeStatus.message}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-signal text-ink-950 font-display font-bold text-base py-4 rounded-full hover:bg-signal-dim transition-all shadow-xl shadow-signal/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={18} />
                  <span>{isSubmitting ? 'Verifying & Claiming Access...' : 'Claim 1 of 1,000 Free Passes'}</span>
                </button>

                <p className="text-center font-mono text-[11px] text-mist-900">
                  🔒 Strictly limited to 1,000 early passes. By claiming access, you agree to our Terms & Privacy Policy.
                </p>

              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
