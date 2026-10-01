import { Lock } from 'lucide-react'

export default function Footer({ onOpenAdminLogin }) {
  return (
    <footer className="bg-ink-950 border-t border-white/5 pt-20 pb-8" id="contact">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          
          {/* Col 1 */}
          <div className="col-span-1 border-r-0 md:border-r md:border-white/5 pr-8">
            <div className="group inline-block mb-4 relative" data-cursor="hover">
              <div className="flex items-center gap-2">
                <span className="font-display text-3xl font-bold tracking-tight text-white group-hover:text-signal transition-colors duration-500">
                  NEXUS
                </span>
                <div className="w-2 h-2 rounded-full bg-signal animate-pulse-slow"></div>
              </div>
            </div>
            <p className="text-mist-900 text-sm mb-6 leading-relaxed max-w-xs">
              Next-generation AutoCAD templates, parametric Revit BIM smart families, and architectural AI prompt systems.
            </p>
            <div className="font-mono text-xs text-signal/80 bg-ink-900 border border-white/5 px-3 py-2 rounded-lg inline-block">
              Free Pioneer Pass: 1,000 Users Max
            </div>
          </div>

          {/* Col 2 */}
          <div className="col-span-1">
            <h4 className="font-mono text-xs text-signal uppercase tracking-widest mb-5">Vault Assets</h4>
            <ul className="flex flex-col gap-3 text-sm text-mist-500">
              <li><a href="#services" className="hover:text-white transition-colors" data-cursor="text">AutoCAD Dynamic Blocks (.DWG)</a></li>
              <li><a href="#services" className="hover:text-white transition-colors" data-cursor="text">Revit Smart BIM Families (.RFA)</a></li>
              <li><a href="#services" className="hover:text-white transition-colors" data-cursor="text">AI Prompt Generative Synthesizer</a></li>
              <li><a href="#services" className="hover:text-white transition-colors" data-cursor="text">Turnkey Architectural Sheet Sets</a></li>
              <li><a href="#services" className="hover:text-white transition-colors" data-cursor="text">Dynamo & AutoLISP Automation</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="col-span-1">
            <h4 className="font-mono text-xs text-signal uppercase tracking-widest mb-5">Architecture</h4>
            <ul className="flex flex-col gap-3 text-sm text-mist-500">
              <li><a href="#about" className="hover:text-white transition-colors" data-cursor="text">Our Philosophy</a></li>
              <li><a href="#process" className="hover:text-white transition-colors" data-cursor="text">Workflow Pipeline</a></li>
              <li><a href="#work" className="hover:text-white transition-colors" data-cursor="text">Selected Projects</a></li>
              <li><a href="#team" className="hover:text-white transition-colors" data-cursor="text">The Team</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors" data-cursor="text">Frequently Asked Questions</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="col-span-1">
            <h4 className="font-mono text-xs text-signal uppercase tracking-widest mb-5">2nd Office Expansion</h4>
            <div className="flex flex-col gap-3 text-sm text-mist-500">
              <p className="text-mist-700 text-xs leading-relaxed">
                We are actively analyzing user geographic density from our first 1,000 pioneer signups to establish our second physical design office and research workshop.
              </p>
              <div className="mt-2 text-xs font-mono text-mist-900 border-l border-signal/40 pl-3">
                Current top candidate regions: Greater London, Karnataka (Bangalore), Berlin, and New York.
              </div>
            </div>
          </div>

        </div>

        {/* Privacy Policy Disclosure regarding Location Collection */}
        <div className="border-t border-white/5 pt-6 pb-6 text-xs text-mist-900 font-mono leading-relaxed bg-ink-900/40 p-4 rounded-xl mb-8 border border-white/5">
          <p>
            <span className="text-white font-semibold">Privacy & Geographic Data Disclosure:</span> During registration for the 1,000 Free Pioneer campaign, NEXUS collects user-consented high-accuracy geolocation data (city, country, coordinates). This data is strictly utilized to compute regional density mapping in order to determine the deployment city for our second architectural studio and research hub. Data is processed securely, never shared with third parties, and retained exclusively for spatial analytics.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-mist-900">
          <p>© 2026 NEXUS Architecture & Generative AI Systems. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#faq" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>&bull;</span>
            <a href="#faq" className="hover:text-white transition-colors">Terms of Service</a>
            <span>&bull;</span>
            {/* Subtle, discreet Admin Link */}
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 text-mist-700 hover:text-signal transition-colors cursor-pointer"
              title="Studio Administration"
            >
              <Lock size={12} />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

