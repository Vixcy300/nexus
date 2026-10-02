import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import { services } from '../../data/content'
import ScrollReveal from '../ui/ScrollReveal'

// Map content spans to responsive classes so mobile remains strictly 1-column
const getResponsiveSpan = (span) => {
  switch (span) {
    case 'col-span-3':
      return 'col-span-1 sm:col-span-2 lg:col-span-3'
    case 'col-span-2':
      return 'col-span-1 sm:col-span-2 lg:col-span-2'
    default:
      return 'col-span-1 sm:col-span-1 lg:col-span-1'
  }
}

export default function ServicesGrid() {
  return (
    <section className="bg-ink-900 py-16 sm:py-24 lg:py-32 relative overflow-hidden" id="services">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
        
        <ScrollReveal delay={0.1}>
          <p className="font-mono text-xs text-signal uppercase tracking-widest mb-3 sm:mb-4">
            Our Capabilities
          </p>
          <h2 className="font-display text-3xl sm:text-5xl lg:text-7xl font-bold mb-10 sm:mb-16 tracking-tight leading-tight sm:leading-none">
            Everything you need.<br className="hidden sm:inline" /> Nothing you don't.
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-auto lg:auto-rows-[minmax(280px,auto)]">
          {services.map((service, i) => {
            const IconComponent = LucideIcons[service.icon] || LucideIcons.Circle
            const isLarge = service.span === 'col-span-2' || service.span === 'col-span-3'
            const spanClass = getResponsiveSpan(service.span)
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className={`${spanClass} bg-ink-800 border border-white/10 sm:border-white/5 p-6 sm:p-8 relative overflow-hidden group hover:border-signal/40 transition-all duration-500 hover:bg-ink-800/90 flex flex-col justify-between rounded-xl sm:rounded-none`}
                data-cursor="hover"
              >
                {/* Background glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10 mb-6 sm:mb-8">
                  <div className="flex justify-between items-start w-full mb-4 sm:mb-8">
                    <span className="font-mono text-xs text-mist-900 font-semibold">{service.number}</span>
                    <div className="text-white/60 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                      <IconComponent size={24} className="sm:w-7 sm:h-7" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <h3 className={`font-display font-medium ${isLarge ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-xl sm:text-2xl mt-2 sm:mt-4'} mb-2 sm:mb-3 text-white`}>
                    {service.title}
                  </h3>
                  <p className="text-mist-900 text-xs sm:text-sm leading-relaxed max-w-sm">
                    {service.desc}
                  </p>
                </div>

                <div className="relative z-10 flex flex-wrap gap-1.5 sm:gap-2 mt-auto">
                  {service.tags.map(tag => (
                    <span key={tag} className="font-mono text-[10px] sm:text-xs text-mist-700 bg-ink-900 border border-white/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Hover arrow slide-in (desktop only) */}
                <div className="hidden lg:flex absolute right-8 bottom-8 items-center gap-2 text-signal font-mono text-sm translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <span>Explore</span> &rarr;
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
