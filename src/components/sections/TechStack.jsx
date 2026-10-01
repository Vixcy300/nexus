import { motion } from 'framer-motion'
import ScrollReveal from '../ui/ScrollReveal'

export default function TechStack() {
  const stack = [
    { cat: 'CAD Engines', items: ['AutoCAD 2026', 'Civil 3D', 'Rhino 8', 'Grasshopper', 'SketchUp Pro'] },
    { cat: 'BIM & Parametric', items: ['Autodesk Revit', 'Navisworks Manage', 'Dynamo BIM', 'Tekla Structures', 'ArchiCAD'] },
    { cat: 'Generative AI', items: ['Midjourney v6.1', 'ControlNet CAD', 'SDXL Architecture', 'DALL-E 3', 'Magnific AI'] },
    { cat: 'BIM Standards', items: ['AIA CAD Layer Standards', 'ISO 19650 BIM', 'OmniClass Tables', 'UniFormat II', 'IFC 4x3'] },
    { cat: 'Deliverables', items: ['.DWG Dynamic Blocks', '.RFA Smart Families', '.RVT Project Templates', '.CTB Plot Styles', '.DYN Automation'] }
  ]

  return (
    <section className="bg-ink-900 py-32 border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <ScrollReveal className="mb-20">
          <p className="font-mono text-xs text-signal uppercase tracking-widest mb-3">Architectural Technology</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Our Interoperability Stack.</h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8">
          {stack.map((category) => (
            <div key={category.cat} className="flex flex-col">
              <h3 className="font-mono text-xs text-signal uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
                {category.cat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.items.map((tech) => (
                  <motion.div
                    key={tech}
                    whileHover={{ scale: 1.05, backgroundColor: '#e8ff47', color: '#04040a', borderColor: '#e8ff47' }}
                    className="font-mono text-xs md:text-sm px-4 py-2 rounded-full border border-white/10 text-mist-500 cursor-default transition-colors"
                  >
                    {tech}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

