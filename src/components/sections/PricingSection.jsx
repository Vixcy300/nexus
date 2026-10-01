import { Check } from 'lucide-react'
import MagneticButton from '../ui/MagneticButton'
import ScrollReveal from '../ui/ScrollReveal'

export default function PricingSection({ onOpenAccessModal, remainingSlots = 988 }) {
  const plans = [
    {
      name: 'Student Pass',
      price: '$0 Free',
      desc: '100% Free Lifetime for Architecture & Design Students',
      features: [
        'AutoCAD .DWG Dynamic Blocks Library',
        'Revit .RFA Essential BIM Families',
        'AI Architecture Prompt Primer',
        'Academic & Competition License',
        'Valid Referral Code Required'
      ],
      timeline: 'Instant Access',
      btnText: 'Claim Student Pass',
      btnClass: 'border border-white/20 text-white hover:border-signal hover:text-signal',
      borderClass: 'border-white/10'
    },
    {
      name: 'Pioneer Studio Pass',
      price: '$0 Free',
      desc: 'Guaranteed Free for First 1,000 Early Pioneer Users',
      features: [
        'All 12,500+ AutoCAD Dynamic Blocks (.DWG)',
        'All 4,500+ Parametric Revit Families (.RFA)',
        'Full AI Prompt Generative Engine Vault',
        'Unrestricted Commercial Practice Clearance',
        'ISO 19650 BIM Sheets & CTB Plot Styles',
        'VIP Invite Privileges for Studio Peers'
      ],
      timeline: 'Lifetime Free Access',
      btnText: `Claim Pioneer Pass (${remainingSlots} left)`,
      btnClass: 'bg-signal text-ink-950 hover:shadow-[0_0_25px_rgba(232,255,71,0.3)]',
      borderClass: 'border-signal/50',
      popular: true
    },
    {
      name: 'Studio & Enterprise',
      price: '$0 Free',
      desc: 'Multi-seat access during the 1,000 pioneer rollout',
      features: [
        'Central studio server deployment rights',
        'Network shared parameter tables (.TXT)',
        'Custom AI architectural prompt syntax guide',
        'Direct consultation for 2nd office hub',
        'Priority feature requests for CAD/Revit'
      ],
      timeline: '1,000 Quota Phase',
      btnText: 'Claim Studio Pass',
      btnClass: 'border border-white/20 text-white hover:border-signal hover:text-signal',
      borderClass: 'border-white/10'
    }
  ]

  return (
    <section className="bg-ink-950 py-32" id="pricing">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <ScrollReveal className="text-center mb-20 md:mb-24">
          <p className="font-mono text-xs text-signal uppercase tracking-widest mb-4">First 1,000 Pioneers Campaign</p>
          <h2 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-6">100% Free Lifetime.<br/>No subscriptions.</h2>
          <p className="text-mist-900 max-w-lg mx-auto">
            We are democratizing next-generation architectural intelligence. The first 1,000 verified users unlock the complete CAD, Revit, and AI vault free for life.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.1}>
              <div 
                className={`relative bg-ink-900 border ${plan.borderClass} p-8 md:p-10 rounded-2xl flex flex-col h-full group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${plan.popular ? 'scale-100 md:scale-105 z-10 shadow-2xl' : 'z-0'}`}
                data-cursor="hover"
              >
                {plan.popular && (
                  <div className="absolute top-0 right-8 -translate-y-1/2">
                    <span className="bg-signal text-ink-950 font-mono text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md">
                      Pioneer Tier
                    </span>
                  </div>
                )}
                
                <h3 className="font-display text-2xl font-semibold mb-2">{plan.name}</h3>
                <div className="font-display text-5xl font-bold mb-4 text-white">{plan.price}</div>
                <p className="font-mono text-xs text-mist-700 mb-8 pb-8 border-b border-white/5">{plan.desc}</p>
                
                <ul className="flex flex-col gap-4 mb-10 flex-grow">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-start gap-3">
                      <Check className="text-signal mt-1 shrink-0" size={16} strokeWidth={3} />
                      <span className="text-sm text-mist-500">{feat}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 mt-4 pt-4 border-t border-white/5 border-dashed">
                    <span className="text-signal mt-1 shrink-0 font-mono text-[10px]">&rarr;</span>
                    <span className="text-xs font-mono text-mist-700">Timeline: {plan.timeline}</span>
                  </li>
                </ul>

                <MagneticButton 
                  onClick={onOpenAccessModal}
                  className={`w-full py-4 rounded-full font-display font-medium text-lg transition-all cursor-pointer ${plan.btnClass}`}
                >
                  {plan.btnText}
                </MagneticButton>
                
                <p className="font-mono text-[10px] text-mist-900 text-center mt-6">
                  Referral code mandatory &bull; Lifetime free access
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

