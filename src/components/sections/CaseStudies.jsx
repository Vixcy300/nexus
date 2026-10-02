import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { caseStudies } from '../../data/content'
import ScrollReveal from '../ui/ScrollReveal'

const CaseStudyCard = ({ data }) => {
  const cardRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"])

  const handleMouseMove = (e) => {
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
  }

  return (
    <div style={{ perspective: 1500 }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden bg-ink-800 border border-white/5 aspect-[4/3] group rounded-sm"
        data-cursor="view"
      >
        {/* Background gradient art */}
        <div className={`absolute inset-0 bg-gradient-to-br ${data.accentColor} opacity-40 transition-opacity duration-500 group-hover:opacity-80`} />
        <div 
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        ></div>

        {/* Normal State Front */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
          <div className="flex justify-between items-start">
            <span className="inline-block border border-white/20 text-white/60 bg-black/20 font-mono text-xs px-3 py-1 rounded-full backdrop-blur-md">
              {data.industry}
            </span>
          </div>
          <div>
            <h3 className="font-display font-medium text-4xl mb-2 tracking-tight" style={{ transform: "translateZ(30px)" }}>{data.company}</h3>
            <p className="font-mono text-xl text-signal" style={{ transform: "translateZ(20px)" }}>{data.result}</p>
          </div>
        </div>

        {/* Hover Overlay State */}
        <div className="absolute inset-0 bg-ink-950/95 p-8 flex flex-col justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
          <p className="text-mist-100 text-lg leading-relaxed mb-6 font-body">
            {data.desc}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {data.services.map(tag => (
              <span key={tag} className="font-mono text-[10px] text-white/50 bg-white/5 px-2 py-1 rounded-sm border border-white/10">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-2 text-signal font-mono text-sm group/btn cursor-pointer">
            <span className="group-hover/btn:underline hover:underline-offset-4">View Case Study</span> &rarr;
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function CaseStudies() {
  return (
    <section className="bg-ink-950 py-32" id="work">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <ScrollReveal className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p className="font-mono text-xs text-signal uppercase tracking-widest mb-4">Selected Work</p>
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight">Proof in production.</h2>
          </div>
          <button className="text-mist-900 border border-white/10 hover:border-white/30 hover:text-white px-6 py-3 rounded-full text-sm transition-colors text-nowrap self-start md:self-auto" data-cursor="hover">
            View All Projects
          </button>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
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
