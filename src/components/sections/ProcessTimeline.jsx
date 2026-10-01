import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import ScrollReveal from '../ui/ScrollReveal'

export default function ProcessTimeline() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"]
  })

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  const steps = [
    { title: "Instant DWG Starter Sets", tagline: "AIA layer standards from minute one", desc: "Open pre-configured AutoCAD .DWG templates with dynamic blocks, standard line-weights, CTB plot styles, and automated viewport scales.", duration: "Phase 01" },
    { title: "Parametric Revit Injection", tagline: "LOD 200–400 smart BIM families", desc: "Load nested BIM families with bidirectional shared parameters, schedule formulas, and zero clash warnings in Revit 2021–2026.", duration: "Phase 02" },
    { title: "AI Prompt Generative Studio", tagline: "From text prompt to structural concept", desc: "Harness engineered prompt syntax for Midjourney v6, ControlNet CAD line-art, and SDXL to generate photorealistic elevations, materials, and massing.", duration: "Phase 03" },
    { title: "Clash-Free Coordination", tagline: "Pre-vetted for Navisworks validation", desc: "Every family is rigorously tested against standard clearance geometries to guarantee seamless architectural and structural coordination.", duration: "Phase 04" },
    { title: "One-Click Production Vault", tagline: "Ready for construction document issue", desc: "Export sheets, details, and schedules ready for municipal submissions and client presentations with zero manual overrides.", duration: "Phase 05" },
    { title: "100% Free Lifetime Pass", tagline: "For the first 1,000 pioneer architects", desc: "Enter your referral code to unlock unrestricted access forever. Help us identify global architectural hubs for our 2nd international studio.", duration: "Pioneer" }
  ]

  const StepItem = ({ step, index }) => {
    const { ref, inView } = useInView({ threshold: 0.5 })
    
    return (
      <div ref={ref} className="min-h-screen flex items-center relative py-32" id={`process-step-${index}`}>
        {/* Animated Dot indicator */}
        <div className="absolute left-0 w-8 h-8 -translate-x-1/2 flex items-center justify-center z-10 group cursor-pointer" onClick={() => window.scrollTo({top: document.getElementById(`process-step-${index}`).offsetTop, behavior: 'smooth'})}>
          <motion.div 
            className="w-4 h-4 rounded-full border-2 transition-colors duration-500"
            animate={{ 
              borderColor: inView ? '#e8ff47' : 'rgba(255,255,255,0.2)',
              backgroundColor: inView ? '#e8ff47' : '#080812'
            }}
          />
          <span className="absolute left-8 font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity text-mist-900">Scroll</span>
        </div>

        <motion.div
          initial={{ x: 60, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ margin: '-20%' }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="pl-16 md:pl-24 relative w-full max-w-2xl"
        >
          {/* Faded Background Number */}
          <div className="absolute -top-12 md:-top-20 left-12 md:left-16 font-display text-[8rem] md:text-[12rem] text-white/5 font-bold leading-none select-none pointer-events-none">
            0{index + 1}
          </div>

          <div className="relative z-10">
            <span className="inline-block border border-white/10 text-mist-900 bg-ink-950 font-mono text-xs px-3 py-1 rounded-full mb-6">
              {step.duration}
            </span>
            <h3 className={`font-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 tracking-tight transition-colors duration-500 ${inView ? 'text-white' : 'text-mist-500'}`}>
              {step.title}
            </h3>
            <p className={`font-body text-xl md:text-2xl mb-6 transition-colors duration-500 ${inView ? 'text-signal' : 'text-mist-700'}`}>
              "{step.tagline}"
            </p>
            <p className="text-mist-900 text-base md:text-lg leading-relaxed max-w-lg">
              {step.desc}
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <section ref={containerRef} className="bg-ink-900 relative" id="process">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-16">
        <ScrollReveal>
          <p className="font-mono text-xs text-signal uppercase tracking-widest mb-4">Pipeline</p>
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight">How architects build with NEXUS.</h2>
        </ScrollReveal>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 relative w-full flex">
        
        {/* Vertical Timeline container - sticky */}
        <div className="w-px bg-white/5 absolute top-0 bottom-0 left-6 md:left-12 opacity-50"></div>
        
        {/* The active animated line */}
        <div className="sticky top-0 h-screen w-px left-6 md:left-12 flex-shrink-0 z-0">
          <motion.div 
            className="absolute top-0 w-[3px] -ml-[1px] bg-gradient-to-b from-signal/10 via-signal to-signal/10 origin-top shadow-[0_0_15px_rgba(232,255,71,0.5)]"
            style={{ scaleY, height: "100vh" }}
          />
        </div>

        {/* Steps contents */}
        <div className="flex-1 pb-32">
          {steps.map((step, index) => (
            <StepItem key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
