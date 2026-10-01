import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import MagneticButton from '../ui/MagneticButton';
import { Menu, X } from 'lucide-react';

export default function Navbar({ onOpenAccessModal, remainingSlots = 988 }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 80);
  });

  const navLinks = [
    { name: 'Templates', href: '#services' },
    { name: 'Revit BIM', href: '#process' },
    { name: 'AI Prompts', href: '#about' },
    { name: 'Work', href: '#work' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' }
  ];

  return (
    <>
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? 'backdrop-blur-xl bg-ink-950/80 border-b border-white/5 py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* Logo - NEXUS text and blinking signal green dot */}
          <a href="#" className="flex items-center gap-2 cursor-pointer z-50">
            <span className="font-display text-2xl font-bold tracking-tight text-white">NEXUS</span>
            <div className="w-2 h-2 rounded-full bg-signal animate-pulse-slow"></div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="font-body text-sm text-mist-900 hover:text-white transition-colors relative group"
                data-cursor="hover"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 h-[1px] bg-signal w-0 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <MagneticButton 
              onClick={onOpenAccessModal}
              className="px-6 py-2.5 rounded-full bg-signal text-ink-950 font-display font-medium text-sm hover:shadow-[0_0_25px_rgba(232,255,71,0.3)] transition-all cursor-pointer"
              data-cursor="hover"
            >
              Claim Free Access
            </MagneticButton>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden z-50 text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-900 z-40 flex flex-col justify-center px-8"
          >
            <nav className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="font-display text-4xl sm:text-5xl text-white hover:text-signal transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </motion.a>
              ))}
            </nav>

            <div className="mt-10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAccessModal();
                }}
                className="w-full bg-signal text-ink-950 font-display font-semibold py-4 rounded-full text-base"
              >
                Claim Free Access ({remainingSlots} Slots Left)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

