import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MagneticButton from '../ui/MagneticButton';
import AnimatedCounter from '../ui/AnimatedCounter';

export default function Hero({ onOpenAccessModal, remainingSlots = 988 }) {
  const containerRef = useRef(null);
  const blobRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!blobRef.current) return;
      const { clientX, clientY } = e;
      blobRef.current.style.transform = `translate(${clientX - 400}px, ${clientY - 400}px)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const line1 = "We build".split(' ');
  const line2 = "next-gen CAD".split(' ');
  const line3 = "& Revit AI.".split(' ');
  
  let wordIndex = 0;

  const renderWords = (words, stroke = false) => {
    return words.map((word, i) => {
      const currentDelay = (wordIndex++) * 0.08;
      return (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 60, rotateX: -40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: currentDelay, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`inline-block mr-[2vw] ${stroke ? 'text-stroke-signal text-signal' : 'text-white'}`}
          style={{ transformOrigin: "bottom center" }}
        >
          {word}
        </motion.span>
      );
    });
  };

  return (
    <section ref={containerRef} className="relative min-h-screen bg-ink-950 overflow-hidden flex flex-col justify-center pt-24 pb-20">
      
      {/* Dynamic Backgrounds */}
      <div 
        ref={blobRef} 
        className="absolute top-0 left-0 w-[800px] h-[800px] bg-signal/10 rounded-full blur-[120px] pointer-events-none transition-transform duration-1000 ease-out z-0"
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
      <div className="grain absolute inset-0 z-[1] pointer-events-none" />

      <motion.div style={{ opacity, scale, y }} className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-start mt-4 sm:mt-10">
        
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-ink-800 border border-white/10 text-mist-900 font-mono text-xs px-4 py-2 rounded-full mb-10 flex items-center gap-2 cursor-pointer hover:border-signal/40 transition-colors"
          onClick={onOpenAccessModal}
        >
          <div className="w-1.5 h-1.5 bg-signal rounded-full animate-pulse-slow" />
          <span>100% Free for first 1,000 users &bull; {remainingSlots} slots remaining &rarr;</span>
        </motion.div>

        {/* Headlines */}
        <h1 className="font-display text-7xl sm:text-8xl md:text-[8rem] lg:text-[10rem] leading-[0.9] tracking-tight mb-8 w-full perspective-1000" data-cursor="hover">
          <div className="overflow-visible pb-1 sm:pb-2">{renderWords(line1)}</div>
          <div className="overflow-visible pb-1 sm:pb-2">{renderWords(line2, true)}</div>
          <div className="overflow-visible pb-1 sm:pb-2">{renderWords(line3)}</div>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 1 }}
          className="font-body text-mist-900 text-lg md:text-xl max-w-xl mb-12 leading-relaxed"
          data-cursor="text"
        >
          Production-ready AutoCAD templates, smart parametric Revit families, and AI prompt generation. The new era of architectural design is here.
        </motion.p>

        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="flex flex-wrap items-center gap-6"
        >
          <MagneticButton 
            onClick={onOpenAccessModal}
            className="bg-signal text-ink-950 font-display font-medium px-8 py-4 rounded-full text-lg hover:shadow-[0_0_30px_rgba(232,255,71,0.3)] transition-all cursor-pointer"
          >
            Claim Free Access
          </MagneticButton>
          
          <a 
            href="#services"
            className="border border-white/20 text-mist-900 hover:text-white hover:border-white/40 hover:bg-white/5 font-display font-medium px-8 py-4 rounded-full text-lg transition-all" 
            data-cursor="hover"
          >
            Explore Templates
          </a>
        </motion.div>

      </motion.div>

      {/* Floating Rotating Circle Badge */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-32 right-12 md:right-32 w-32 h-32 hidden md:flex items-center justify-center opacity-60 z-10 pointer-events-none"
      >
        <svg viewBox="0 0 100 100" width="100" height="100">
          <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
          <text className="font-mono text-[9px] fill-white tracking-widest uppercase">
            <textPath href="#circlePath">NEXUS · CAD · REVIT · AI · 2026 · </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Bottom Counter Stat */}
      <div className="absolute bottom-8 left-6 md:left-12 z-20 hidden sm:block">
        <div className="font-display flex flex-col gap-1 items-start text-white/80">
          <span className="text-3xl text-signal"><AnimatedCounter end={1000} suffix=" Free" /></span>
          <span className="font-mono text-xs text-mist-900 tracking-wider">Early Pioneer Quota</span>
        </div>
      </div>
    </section>
  );
}
