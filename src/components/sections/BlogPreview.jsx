import ScrollReveal from '../ui/ScrollReveal'

export default function BlogPreview() {
  const posts = [
    { 
      title: 'Calibrating Midjourney v6 & ControlNet for Architectural Axonometrics & Sections', 
      cat: 'Generative AI', 
      readTime: '6 min', 
      date: 'Fall 2026' 
    },
    { 
      title: 'AutoCAD Dynamic Blocks vs Parametric Revit Families: The 2026 BIM Hybrid Workflow', 
      cat: 'CAD & BIM', 
      readTime: '8 min', 
      date: 'Fall 2026' 
    },
    { 
      title: 'ISO 19650 Standards: How Clean Shared Parameters Save Hundreds of Billable Hours', 
      cat: 'Standards', 
      readTime: '5 min', 
      date: 'Fall 2026' 
    }
  ]

  return (
    <section className="bg-ink-900 py-32" id="blog">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        <ScrollReveal className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div>
            <p className="font-mono text-xs text-signal uppercase tracking-widest mb-4">Architectural Insights</p>
            <h2 className="font-display text-5xl md:text-6xl font-bold tracking-tight">From our technical vault.</h2>
          </div>
          <a href="#services" className="font-mono text-sm text-mist-900 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1 group" data-cursor="hover">
            Explore All Resources <span className="text-signal inline-block group-hover:translate-x-1 transition-transform">&rarr;</span>
          </a>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="block bg-ink-800 border border-white/5 p-8 h-full group transition-all duration-500 hover:border-signal/30 hover:-translate-y-2 hover:bg-ink-800/80 relative overflow-hidden rounded-2xl cursor-pointer" data-cursor="hover">
                <div className="absolute inset-0 bg-gradient-to-t from-signal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <span className="inline-block border border-signal/30 text-signal font-mono text-xs px-3 py-1 rounded-full self-start mb-6 -ml-1">
                    {post.cat}
                  </span>
                  
                  <h3 className="font-display text-2xl lg:text-3xl font-medium leading-[1.2] mb-6 tracking-tight group-hover:text-signal transition-colors duration-300">
                    {post.title}
                  </h3>
                  
                  <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between font-mono text-xs text-mist-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-signal"></div>
                      <span>{post.date}</span>
                      <span className="opacity-50">&bull;</span>
                      <span>{post.readTime}</span>
                    </div>
                    
                    <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-signal">
                      Read Guide &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

