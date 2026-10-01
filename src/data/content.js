export const services = [
  { 
    id: 1, 
    number: '01', 
    icon: 'Layers', 
    title: 'AutoCAD Dynamic Blocks (.DWG)', 
    desc: 'Production-grade, AIA-compliant 2D detail blocks with dynamic stretch, visibility states, flip actions, and automated layer assignments.', 
    tags: ['AutoCAD 2026', '.DWG', 'Dynamic Blocks', 'AIA Standards'], 
    span: 'col-span-2' 
  },
  { 
    id: 2, 
    number: '02', 
    icon: 'Box', 
    title: 'Parametric Revit Families (.RFA)', 
    desc: 'LOD 300–400 smart BIM components with pre-mapped shared parameters, schedule formulas, and zero Revit model warnings.', 
    tags: ['Revit BIM', '.RFA', 'LOD 350', 'OmniClass'], 
    span: 'col-span-1' 
  },
  { 
    id: 3, 
    number: '03', 
    icon: 'Sparkles', 
    title: 'AI Architectural Prompt Engine', 
    desc: 'Calibrated prompts for Midjourney v6, ControlNet CAD line-art, and SDXL for photorealistic concepts, sections, and facades.', 
    tags: ['Midjourney v6', 'ControlNet', 'SDXL', 'Prompts'], 
    span: 'col-span-1' 
  },
  { 
    id: 4, 
    number: '04', 
    icon: 'FileCode', 
    title: 'Turnkey Project Templates (.RVT / .DWG)', 
    desc: 'Ready-to-deploy sheet sets, standard viewport layouts, CTB monochrome/color plot styles, and graphic overrides.', 
    tags: ['Turnkey Starter', 'CTB Styles', 'Sheet Sets', 'Title Blocks'], 
    span: 'col-span-2' 
  },
  { 
    id: 5, 
    number: '05', 
    icon: 'Terminal', 
    title: 'Dynamo & AutoLISP Automation', 
    desc: 'Visual scripts and LISP routines that automate facade iteration, room tagging, grid generation, and quantity takeoffs.', 
    tags: ['Dynamo', 'AutoLISP', 'Python BIM', 'Automation'], 
    span: 'col-span-1' 
  },
  { 
    id: 6, 
    number: '06', 
    icon: 'Compass', 
    title: 'Architectural Detail Vault', 
    desc: 'Over 1,200 weather-tested, thermal-analyzed building envelope, parapet, curtain wall, and interior joinery details.', 
    tags: ['Envelope', 'Thermal Details', 'Joinery', 'ISO 19650'], 
    span: 'col-span-1' 
  },
  { 
    id: 7, 
    number: '07', 
    icon: 'Cpu', 
    title: '100% Free Lifetime Pioneer Access', 
    desc: 'Exclusively reserved for the first 1,000 verified architects, designers, and students. Guaranteed $0 subscription for life.', 
    tags: ['1,000 Quota', 'Lifetime Free', 'No Subscriptions', 'VIP Priority'], 
    span: 'col-span-3' 
  },
  { 
    id: 8, 
    number: '08', 
    icon: 'ShieldCheck', 
    title: 'Unrestricted Commercial Rights', 
    desc: 'Full perpetual commercial and academic licensing. Use in live client projects, competitions, studio builds, or firm deliverables.', 
    tags: ['Royalty Free', 'Commercial', 'Academic', 'Worldwide'], 
    span: 'col-span-1' 
  },
];

export const caseStudies = [
  { 
    id: 1, 
    company: 'Foster Horizon Tower', 
    industry: 'Commercial High-Rise (London)', 
    result: '68% Drafting Time Saved', 
    desc: 'Integrated NEXUS dynamic DWG blocks and parametric curtain wall families across a 48-story London financial district headquarters.', 
    services: ['AutoCAD DWG', 'Revit BIM', 'LOD 400'], 
    accentColor: 'from-signal/20 to-transparent' 
  },
  { 
    id: 2, 
    company: 'Bengaluru Tech Campus', 
    industry: 'Mixed-Use Tech Park (India)', 
    result: 'Zero Revit Clash Warnings', 
    desc: 'Coordinated 180,000 sq.m structural and MEP interfaces using pre-validated NEXUS smart family libraries with full ISO 19650 compliance.', 
    services: ['Revit Families', 'Navisworks', 'ISO 19650'], 
    accentColor: 'from-green-900/40 to-transparent' 
  },
  { 
    id: 3, 
    company: 'Zurich Kinetic Pavilion', 
    industry: 'Parametric Pavilion (Zurich)', 
    result: 'AI Concept to BIM in 4 hrs', 
    desc: 'Synthesized organic solar facade geometries using NEXUS AI prompts and fed directly into adaptive Revit panels via Dynamo.', 
    services: ['AI Prompts', 'Dynamo', 'Rhino Inside'], 
    accentColor: 'from-ember/20 to-transparent' 
  },
  { 
    id: 4, 
    company: 'Hudson Waterfront Residence', 
    industry: 'Luxury Residential (New York)', 
    result: '14-Day Full CD Delivery', 
    desc: 'Completed complete architectural construction document set utilizing turnkey AIA-standard CAD template packages and CTB plot setups.', 
    services: ['AutoCAD .DWG', 'Title Blocks', 'AIA Standards'], 
    accentColor: 'from-purple-900/40 to-transparent' 
  },
];

export const team = [
  { 
    name: 'Ar. Ritik Singh', 
    role: 'Founder & Principal Architect', 
    quote: 'Architecture in the AI era is about speed of imagination and uncompromised precision in execution.', 
    colors: ['#e8ff47', '#080812'] 
  },
  { 
    name: 'Deepak Kanojiya', 
    role: 'Director of BIM & Parametrics', 
    quote: 'Every parameter in a Revit family must serve both design intent and physical construction reality.', 
    colors: ['#ff6b35', '#080812'] 
  },
  { 
    name: 'Mayank Somvanshi', 
    role: 'Computational & AI Lead', 
    quote: 'Generative AI does not replace the architect; it transforms the architect into an orchestra conductor.', 
    colors: ['#a78bfa', '#080812'] 
  },
  { 
    name: 'Nand Kishore Soni', 
    role: 'Global Standards & Technical Director', 
    quote: 'Rigorous CAD & BIM standardization is the true foundation of creative freedom in large-scale studios.', 
    colors: ['#34d399', '#080812'] 
  },
];

export const faqs = [
  { 
    q: 'Is NEXUS really 100% free for the first 1,000 users?', 
    a: 'Yes, absolutely. The first 1,000 registered architects, engineers, and students receive full lifetime access to all AutoCAD templates, Revit families, Dynamo scripts, and AI prompt libraries at $0, with all future updates included.' 
  },
  { 
    q: 'Why is a referral code mandatory to register?', 
    a: 'To guarantee quality and equitable distribution between practicing professionals and architecture students, enrollment is referral-gated. A valid referral code unlocks one of the 1,000 early pioneer passes.' 
  },
  { 
    q: 'Which software versions are supported?', 
    a: 'AutoCAD templates and dynamic blocks are compatible with AutoCAD 2018 through 2026 (.DWG). Revit families are provided in Revit 2021 through 2026 formats (.RFA & .RVT). AI prompts are engineered for Midjourney v6+, ControlNet, and SDXL.' 
  },
  { 
    q: 'Can I use these templates and families for commercial client projects?', 
    a: 'Yes. All downloads come with an unrestricted, perpetual, royalty-free commercial license. You can use them in client deliverables, design competitions, academic submissions, and production drawing sets.' 
  },
  { 
    q: 'What types of AI prompts are included in the vault?', 
    a: 'Our prompt vault includes specialized syntax for architectural massing, photorealistic exterior renderings, interior material palettes, isometric axonometrics, and ControlNet line-art conditioning prompts.' 
  },
  { 
    q: 'Why do you collect location data during registration?', 
    a: 'As disclosed in our privacy policy, location data is collected in the background to calculate regional user density. This geographical intelligence directly guides the city selection for establishing our 2nd international studio and physical workshop hub.' 
  },
  { 
    q: 'How do I share referral codes with colleagues or classmates?', 
    a: 'Once registered, your pioneer pass grants access to shareable invite codes that allow you to invite your firm colleagues or studio peers before the 1,000 user threshold closes.' 
  },
  { 
    q: 'Are the Revit families built to international BIM standards?', 
    a: 'Yes, all families adhere strictly to ISO 19650 and OmniClass standards with clean shared parameters, logical 2D/3D visibility controls, and minimal polygon counts to prevent project file bloat.' 
  },
];

