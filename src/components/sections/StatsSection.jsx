import AnimatedCounter from '../ui/AnimatedCounter'
import ScrollReveal from '../ui/ScrollReveal'

export default function StatsSection() {
  const stats = [
    { num: 1000, label: 'Pioneer Free Passes', suffix: '+' },
    { num: 4500, label: 'Parametric Revit Families', suffix: '+' },
    { num: 12500, label: 'AutoCAD Dynamic Blocks', suffix: '+' },
    { num: 250, label: 'Calibrated AI Prompts', suffix: '+' },
    { num: 100, label: 'LOD 200–400 BIM Compliant', suffix: '%' },
    { num: 0, label: 'Subscription Fee (First 1,000)', prefix: '$' }
  ]

  return (
    <section className="bg-signal py-16 sm:py-24 md:py-32 w-full text-ink-950 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-8 md:gap-x-12 gap-y-8 sm:gap-y-12 md:gap-y-16">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} delay={i * 0.1} className="flex flex-col items-start xl:items-center min-w-0">
              <div className="font-display text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight tabular-nums leading-none">
                <AnimatedCounter 
                  end={stat.num} 
                  prefix={stat.prefix} 
                  suffix={stat.suffix} 
                  decimals={stat.decimals} 
                />
              </div>
              <p className="font-mono text-[10px] xs:text-xs sm:text-sm uppercase tracking-wider md:tracking-widest mt-2 sm:mt-3 md:mt-4 opacity-80 font-semibold break-words leading-snug">
                {stat.label}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

