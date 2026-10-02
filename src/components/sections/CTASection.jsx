import { motion } from 'framer-motion'
import MagneticButton from '../ui/MagneticButton'

export default function CTASection({ onOpenAccessModal, remainingSlots = 988 }) {
  return (
    <section className="relative min-h-screen bg-ink-950 flex flex-col justify-center items-center overflow-hidden py-32" id="cta">
      {/* Dramatic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink-700 via-ink-900 to-ink-950 opacity-50 z-0"></div>
      <div className="grain absolute inset-0 z-0 mix-blend-overlay opacity-30"></div>
      
      {/* Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(232,255,71,0.06),transparent)] z-0 rounded-full blur-[50px] pointer-events-none"></div>

      {/* Floating background ambient lights */}
      <motion.div 
        animate={{ y: [0, -80, 0], x: [0, 40, 0] }} 
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute -top-20 left-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-signal rounded-full opacity-[0.03] blur-3xl z-0"
      />
      <motion.div 
        animate={{ y: [0, 80, 0], x: [0, -40, 0] }} 
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }} 
        className="absolute -bottom-40 right-[10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-ember rounded-full opacity-[0.03] blur-3xl z-0"
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs text-signal uppercase tracking-widest mb-8 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 bg-signal rounded-full animate-pulse-slow"></span>
          Limited to the First 1,000 Early Pioneer Architects
        </motion.p>

        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] tracking-tighter leading-[0.9] mb-8 sm:mb-12 flex flex-col"
        >
          <span className="text-white">Design tomorrow.</span>
          <span className="text-stroke-signal text-signal">Build today.</span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-mist-500 font-body text-xl md:text-2xl mb-14 max-w-2xl leading-relaxed"
        >
          AutoCAD templates (.DWG), parametric Revit BIM families (.RFA), and AI architectural prompt synthesis. 100% free lifetime access for our first 1,000 users.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col items-center gap-6 w-full"
        >
          <MagneticButton 
            onClick={onOpenAccessModal}
            className="px-12 py-6 text-xl md:text-2xl font-display font-medium bg-signal text-ink-950 rounded-full hover:shadow-[0_0_40px_rgba(232,255,71,0.3)] transition-all group overflow-hidden relative cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-3">
              Claim Free Pioneer Access
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>&rarr;</motion.span>
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity z-0"></div>
          </MagneticButton>

          <p className="font-mono text-xs text-mist-900 mt-2">
            Referral code required &bull; {remainingSlots} Pioneer passes remaining
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 pt-8 border-t border-white/5 flex flex-col items-center gap-3 w-full md:w-auto px-12"
        >
          <p className="font-mono text-xs text-mist-700">
            Deployed across architectural studios in London, Bangalore, Berlin, New York, Singapore & Zurich.
          </p>
        </motion.div>

      </div>
    </section>
  )
}

