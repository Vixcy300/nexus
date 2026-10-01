import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import MagneticButton from '../ui/MagneticButton'

export default function TestimonialsCarousel() {
  const testimonials = [
    { 
      quote: "The dynamic AutoCAD blocks cut our detailing time in half across our entire studio. Everything is AIA-compliant out of the box.", 
      author: "Senior Associate", 
      company: "Foster + Partners Alumni Network (London)" 
    },
    { 
      quote: "Revit families are usually bloated with junk parameters. NEXUS families are clean, lightweight, and schedule flawlessly with zero warnings.", 
      author: "Lead BIM Coordinator", 
      company: "Studio Indus (Bangalore)" 
    },
    { 
      quote: "Generating structural facade concepts with NEXUS AI prompts and feeding them into Dynamo gave us 20 valid schemes in one afternoon.", 
      author: "Computational Designer", 
      company: "Berlin Architekten Lab (Berlin)" 
    },
    { 
      quote: "As an architecture student, having free access to production-grade AIA CAD templates elevated the quality of my thesis portfolio tenfold.", 
      author: "M.Arch Candidate", 
      company: "NUS Architecture School (Singapore)" 
    },
    { 
      quote: "100% free lifetime access with unrestricted commercial rights is unheard of in AEC software. NEXUS is setting a brand new benchmark.", 
      author: "Principal Architect", 
      company: "Manhattan Urban Studio (New York)" 
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="bg-ink-950 py-32 overflow-hidden relative">
      <div className="max-w-5xl mx-auto px-6 md:px-12 relative min-h-[400px] flex flex-col justify-center">
        
        {/* Giant decorative quote */}
        <div className="absolute top-0 left-4 font-display text-[15rem] md:text-[25rem] text-signal/5 leading-none pointer-events-none select-none -translate-y-12">
          "
        </div>

        <div className="relative z-10 w-full md:w-4/5 mx-auto text-center" data-cursor="text">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <h3 className="font-display text-2xl sm:text-4xl md:text-5xl leading-tight mb-12 tracking-tight">
                "{testimonials[currentIndex].quote}"
              </h3>
              
              <div>
                <p className="font-mono text-signal uppercase tracking-widest text-sm mb-1 font-semibold">
                  {testimonials[currentIndex].author}
                </p>
                <p className="font-body text-mist-700 text-sm">
                  {testimonials[currentIndex].company}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex gap-4">
            <MagneticButton onClick={prev} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/30 transition-colors cursor-pointer">
              <ChevronLeft size={20} />
            </MagneticButton>
            <MagneticButton onClick={next} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/30 transition-colors cursor-pointer">
              <ChevronRight size={20} />
            </MagneticButton>
          </div>
          
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${i === currentIndex ? 'bg-signal w-6' : 'bg-white/20 hover:bg-white/40'}`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

