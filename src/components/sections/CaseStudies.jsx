import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { caseStudies } from '../../data/content'
import ScrollReveal from '../ui/ScrollReveal'

const CaseStudyCard = ({ data }) => {
  const cardRef = useRef(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"])

  const handleMouseMove = (e) => {
    // Only apply 3D tilt on devices with hover capability
    if (window.matchMedia('(hover: none)').matches) return
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsRevealed(false)
  }

  const toggleDetails = () => {
    setIsRevealed(prev => !prev)
  }

  return (
    <div style={{ perspective: 1500 }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={toggleDetails}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden bg-ink-800 border border-white/10 sm:border-white/5 min-h-[340px] sm:min-h-0 sm:aspect-[4/3] group rounded-2xl sm:rounded-sm cursor-pointer select-none"
        data-cursor="view"
      >
        {/* Background gradient art */}
        <div className={`absolute inset-0 bg-gradient-to-br ${data.accentColor} opacity-40 transition-opacity duration-500 group-hover:opacity-80`} />
        <div 
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        {/* Normal State Front */}
        <div className="absolute inset-0 p-5 sm:p-7 md:p-8 flex flex-col justify-between z-10">
          <div className="flex justify-between items-start gap-2">
            <span className="inline-block border border-white/20 text-white/70 bg-black/30 font-mono text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-md">
              {data.industry}
            </span>
            {/* Mobile tap indicator */}
            <span className="sm:hidden font-mono text-[10px] text-signal/80 bg-signal/10 px-2 py-0.5 rounded border border-signal/20">
              Tap for info
            </span>
          </div>
          <div>
            <h3 
              className="font-display font-medium text-2xl sm:text-3xl lg:text-4xl mb-1.5 sm:mb-2 tracking-tight text-white" 
              style={{ transform: "translateZ(30px)" }}
            >
              {data.company}
            </h3>
            <p 
              className="font-mono text-base sm:text-lg lg:text-xl text-signal font-semibold" 
              style={{ transform: "translateZ(20px)" }}
            >
              {data.result}
            </p>
          </div>
        </div>

        {/* Hover / Tap Overlay State */}
        <div 
          className={`absolute inset-0 bg-ink-950/95 p-5 sm:p-7 md:p-8 flex flex-col justify-between transition-transform duration-500 ease-out z-20 ${
            isRevealed ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="font-mono text-[10px] text-signal uppercase tracking-wider font-semibold">
                Case Study Overview
              </span>
              <span className="sm:hidden font-mono text-[10px] text-mist-900 border border-white/10 px-2 py-0.5 rounded">
                Tap to close
              </span>
            </div>
            
            <p className="text-mist-100 text-xs sm:text-sm lg:text-base leading-relaxed mb-4 sm:mb-6 font-body">
              {data.desc}
            </p>
          </div>
          
          <div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {data.services.map(tag => (
                <span key={tag} className="font-mono text-[9px] sm:text-[10px] text-white/70 bg-white/5 px-2 py-1 rounded-sm border border-white/10">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-signal font-mono text-xs sm:text-sm font-semibold">
              <span className="hover:underline hover:underline-offset-4">Verified Deliverables</span> &rarr;
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function CaseStudies() {
  return (
    <section className="bg-ink-950 py-16 sm:py-24 lg:py-32 relative overflow-hidden" id="work">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
        <ScrollReveal className="mb-10 sm:mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div>
            <p className="font-mono text-xs text-signal uppercase tracking-widest mb-3 sm:mb-4">Selected Work</p>
            <h2 className="font-display text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
              Proof in production.
            </h2>
          </div>
          <button 
            className="text-mist-900 border border-white/10 hover:border-white/30 hover:text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm transition-colors text-nowrap self-start md:self-auto" 
            data-cursor="hover"
          >
            View All Projects
          </button>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
          {caseStudies.map((cs, i) => (
            <ScrollReveal key={cs.id} delay={i * 0.1}>
              <CaseStudyCard data={cs} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
