import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, FileCode, CheckCircle, Eye, Download, Sparkles, SlidersHorizontal, Monitor } from 'lucide-react';

const TEMPLATE_CATEGORIES = [
  {
    id: 'autocad',
    title: 'AutoCAD (.DWG) Dynamic Blocks',
    badge: 'AIA & ISO 13567 Standard',
    items: [
      {
        name: 'Parametric Door & Window Matrix',
        format: '.DWG / Dynamic Block',
        specs: 'Auto-wall cutout, 30°/45°/90° swing angles, reversible handedness, 900mm–2400mm dynamic stretch.',
        layers: ['A-DOOR', 'A-WALL', 'A-GLAZ', 'A-DIMS'],
        downloads: '14,200+'
      },
      {
        name: 'Universal Modular Core & Stair Generator',
        format: '.DWG + AutoLISP Routine',
        specs: 'Automated riser/tread calculation (IBC 2024 compliance), stringer offsets, dynamic handrail grips.',
        layers: ['A-FLOR-STRS', 'A-ANNO-TEXT', 'S-GRID'],
        downloads: '9,840+'
      },
      {
        name: 'Structural Steel Column & Connection Library',
        format: '.DWG Dynamic Tables',
        specs: 'Universal beams (W-Shapes, HEB, UB, UC), moment connections, bolt arrays with auto-spacing.',
        layers: ['S-COLS', 'S-BEAM', 'S-DETL'],
        downloads: '11,400+'
      }
    ]
  },
  {
    id: 'revit',
    title: 'Autodesk Revit (.RVT / .RFA) Smart BIM Families',
    badge: 'LOD 350 / 400 Fabrication Ready',
    items: [
      {
        name: 'Parametric Curtain Wall Panel with Sun Louvers',
        format: '.RFA / Adaptive Component',
        specs: 'Revit 2022-2026. Solar radiation tracking parameters, nested mullions, customizable glass U-values.',
        layers: ['Curtain Panels', 'Mullions', 'Shared Parameters'],
        downloads: '18,900+'
      },
      {
        name: 'Complete MEP Duct & Mechanical Equipment Set',
        format: '.RFA with Connectors',
        specs: 'CFM airflow calculation formulas, pressure drop tables, auto-sizing connectors for VAV & AHU units.',
        layers: ['Mechanical Equipment', 'Duct Accessories'],
        downloads: '8,750+'
      },
      {
        name: 'Modular Residential Bathroom Pod (DFMA)',
        format: '.RVT & .RFA Assembly',
        specs: 'Prefinished walls, plumbing routing clearance zones, clash-tested against structural slabs.',
        layers: ['Plumbing Fixtures', 'Specialty Equipment'],
        downloads: '7,320+'
      }
    ]
  },
  {
    id: 'ai_prompts',
    title: 'Generative AI Architecture Prompts',
    badge: 'ControlNet + Midjourney Master Recipes',
    items: [
      {
        name: 'DWG Line-Art to Photoreal Exterior Rendering',
        format: 'ControlNet Canny + Flux Matrix',
        specs: 'Maintains exact structural CAD linework while generating photoreal concrete, weathered steel, and vegetation.',
        layers: ['AI Weights', 'Preprocessor', 'Negative Prompts'],
        downloads: '22,400+'
      },
      {
        name: 'Dynamo Visual Programming Prompt Prompter',
        format: 'Natural Language to Dynamo Node Graph',
        specs: 'Outputs zero-touch Dynamo Python code for massing subdivisions and automated sheet numbering.',
        layers: ['Dynamo Graph', 'Python Script'],
        downloads: '13,100+'
      },
      {
        name: 'Interior Spatial Lighting & Material Moodboards',
        format: 'Midjourney v6.1 Master String',
        specs: 'Specific architectural finishes: microcement, fluted glass, brushed brass, 2700K indirect cove lighting.',
        layers: ['Photoreal V6', 'Material Tags'],
        downloads: '19,800+'
      }
    ]
  }
];

export default function TemplateExplorer({ onOpenAccessModal }) {
  const [activeTab, setActiveTab] = useState('autocad');
  const [activeLayers, setActiveLayers] = useState({
    'A-WALL': true,
    'S-GRID': true,
    'A-GLAZ': true,
    'A-DIMS': true,
    'A-DOOR': true
  });
  const [previewDoorAngle, setPreviewDoorAngle] = useState(90);
  const [previewWallThick, setPreviewWallThick] = useState(200);

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const selectedCategory = TEMPLATE_CATEGORIES.find(c => c.id === activeTab);

  return (
    <section id="templates" className="relative py-28 bg-ink-900 border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-signal/10 border border-signal/30 text-signal font-mono text-xs uppercase tracking-wider mb-4">
            <Layers size={14} />
            Architectural Production Assets
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-bold tracking-tight">
            Next-Gen <span className="text-signal">AutoCAD & Revit</span> Systems
          </h2>
          <p className="font-body text-mist-900 text-lg mt-4">
            Built by practicing architects and computational engineers. Battle-tested on high-rise, commercial, and net-zero residential projects worldwide.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-5 py-3 rounded-full font-display text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-signal text-ink-950 shadow-lg shadow-signal/20'
                      : 'bg-ink-800 text-mist-700 hover:text-white border border-white/10'
                  }`}
                >
                  {cat.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Layout: Left Interactive Dynamic Block Inspector, Right Template Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Interactive Dynamic Block Preview Box */}
          <div className="lg:col-span-5 bg-ink-950 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl sticky top-24">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-[11px] text-signal uppercase tracking-wider">
                  Interactive CAD Inspector
                </span>
                <h3 className="font-display text-xl font-bold text-white mt-1">
                  Dynamic Block Flex Test
                </h3>
              </div>
              <div className="px-3 py-1 rounded-full bg-signal/10 border border-signal/30 text-signal font-mono text-xs">
                Live Snapping
              </div>
            </div>

            {/* Dynamic Visual CAD Drawing Viewport */}
            <div className="relative h-64 bg-ink-900 rounded-2xl border border-white/10 flex items-center justify-center p-4 overflow-hidden">
              <svg viewBox="0 0 320 220" className="w-full h-full">
                {/* Background CAD grid */}
                <defs>
                  <pattern id="inspGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="320" height="220" fill="url(#inspGrid)" />

                {/* S-GRID */}
                {activeLayers['S-GRID'] && (
                  <g stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 3">
                    <line x1="40" y1="20" x2="40" y2="200" />
                    <line x1="280" y1="20" x2="280" y2="200" />
                    <line x1="20" y1="110" x2="300" y2="110" />
                  </g>
                )}

                {/* A-WALL */}
                {activeLayers['A-WALL'] && (
                  <g fill="none" stroke="#e8ff47" strokeWidth="2.5">
                    {/* Left Wall jamb */}
                    <rect x="40" y={110 - previewWallThick / 3} width="60" height={previewWallThick / 1.5} fill="rgba(232,255,71,0.1)" />
                    {/* Right Wall jamb */}
                    <rect x="220" y={110 - previewWallThick / 3} width="60" height={previewWallThick / 1.5} fill="rgba(232,255,71,0.1)" />
                  </g>
                )}

                {/* A-DOOR Dynamic Swing */}
                {activeLayers['A-DOOR'] && (
                  <g>
                    {/* Door Leaf */}
                    <line
                      x1="100"
                      y1="110"
                      x2={100 + Math.cos((previewDoorAngle * Math.PI) / 180) * 120}
                      y2={110 - Math.sin((previewDoorAngle * Math.PI) / 180) * 120}
                      stroke="#ff6b35"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Swing arc */}
                    <path
                      d={`M 220 110 A 120 120 0 0 0 ${100 + Math.cos((previewDoorAngle * Math.PI) / 180) * 120} ${110 - Math.sin((previewDoorAngle * Math.PI) / 180) * 120}`}
                      fill="none"
                      stroke="#ff6b35"
                      strokeWidth="1.2"
                      strokeDasharray="4 2"
                    />
                    {/* Hinge point */}
                    <circle cx="100" cy="110" r="4" fill="#ffffff" stroke="#ff6b35" strokeWidth="2" />
                  </g>
                )}

                {/* A-DIMS Dimensions */}
                {activeLayers['A-DIMS'] && (
                  <g stroke="#9898b8" strokeWidth="1">
                    <line x1="100" y1="180" x2="220" y2="180" />
                    <line x1="100" y1="175" x2="100" y2="185" />
                    <line x1="220" y1="175" x2="220" y2="185" />
                    <text x="160" y="195" fill="#9898b8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                      OPENING: 1,200 mm &bull; SWING: {previewDoorAngle}°
                    </text>
                  </g>
                )}
              </svg>

              {/* Dynamic Grip Handles indicator */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 font-mono text-[10px] text-white/70 bg-ink-950/80 px-2 py-0.5 rounded border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-signal" />
                Dynamic Grip Active
              </div>
            </div>

            {/* Interactive sliders for the dynamic block */}
            <div className="mt-5 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-mist-700">Dynamic Door Swing Angle:</span>
                  <span className="text-signal font-bold">{previewDoorAngle}°</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="15"
                  value={previewDoorAngle}
                  onChange={(e) => setPreviewDoorAngle(parseInt(e.target.value, 10))}
                  className="w-full accent-signal bg-ink-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-mist-700">Wall Core Thickness:</span>
                  <span className="text-signal font-bold">{previewWallThick} mm</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="350"
                  step="25"
                  value={previewWallThick}
                  onChange={(e) => setPreviewWallThick(parseInt(e.target.value, 10))}
                  className="w-full accent-signal bg-ink-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Layer Toggles */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <span className="font-mono text-[11px] text-mist-900 block mb-2">
                Toggle CAD Drawing Layers:
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.keys(activeLayers).map((layer) => (
                  <button
                    key={layer}
                    onClick={() => toggleLayer(layer)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all border ${
                      activeLayers[layer]
                        ? 'bg-signal/15 text-signal border-signal/40'
                        : 'bg-ink-800/60 text-mist-900 border-white/5 line-through opacity-50'
                    }`}
                  >
                    {layer}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Template Catalog Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-mist-700">
                Included in Free 1,000 Early Access Pass:
              </span>
              <span className="font-mono text-xs text-signal font-semibold">
                {selectedCategory?.badge}
              </span>
            </div>

            {selectedCategory?.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-ink-950/80 border border-white/10 hover:border-signal/40 rounded-2xl p-6 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded font-mono text-[10px] bg-ink-800 text-signal border border-signal/20 mb-2">
                      {item.format}
                    </span>
                    <h4 className="font-display text-xl font-bold text-white group-hover:text-signal transition-colors">
                      {item.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-mist-900 block">
                      Architect Downloads
                    </span>
                    <span className="font-mono text-sm text-white font-bold">
                      {item.downloads}
                    </span>
                  </div>
                </div>

                <p className="font-body text-sm text-mist-700 leading-relaxed mb-4">
                  {item.specs}
                </p>

                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-white/5 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-mist-900">Layers:</span>
                    {item.layers.map((l, i) => (
                      <span key={i} className="font-mono text-[10px] bg-ink-800 text-mist-500 px-2 py-0.5 rounded">
                        {l}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={onOpenAccessModal}
                    className="flex items-center gap-1.5 text-xs font-mono font-medium text-signal hover:text-white transition-colors"
                  >
                    <span>Claim Free Download</span>
                    <Download size={13} />
                  </button>
                </div>
              </div>
            ))}

            {/* Pro Notice */}
            <div className="p-4 rounded-xl bg-ink-950 border border-white/5 text-xs font-mono text-mist-700 flex items-center justify-between">
              <span>All DWG and RVT templates are tested on AutoCAD 2026 and Revit 2026.</span>
              <span className="text-signal">Zero Missing XREFs Guarantee</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
