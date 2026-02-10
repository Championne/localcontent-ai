import OpenAI from 'openai'

// ---------------------------------------------------------------------------
// Sub-variation type
// ---------------------------------------------------------------------------
export interface StyleSubVariation {
  name: string
  promptPrefix: string
}

// ---------------------------------------------------------------------------
// Image style definitions — 10 styles with optional sub-variations
// ---------------------------------------------------------------------------
export const IMAGE_STYLES = {
  promotional: {
    name: 'Promotional',
    description: 'Cinematic images for sales and offers',
    keywords: ['sale', 'discount', 'off', 'special', 'deal', 'offer', 'limited', 'save', 'price', 'free', 'promo', 'promotion', 'coupon'],
    promptPrefix: 'Inviting promotional photograph with cinematic lighting, warm highlights and shallow depth of field. Natural but vibrant tones matching an energetic mood. Single clear subject from the business world, premium focus on the product or service. No generic interiors, no furniture showrooms, no pedestals, no abstract decor or mood boards. All surfaces and objects free of text or signage',
    subVariations: {} as Record<string, StyleSubVariation>,
  },
  professional: {
    name: 'Professional',
    description: 'Editorial documentary-style photography',
    keywords: ['tips', 'how to', 'guide', 'advice', 'learn', 'info', 'update', 'news', 'service', 'announcement', 'launch'],
    promptPrefix: 'High-end editorial photograph with soft natural window light and clean minimal composition. Documentary-style realism with a muted, sophisticated colour palette. Simple uncluttered background, DSLR quality with subtle depth of field. All surfaces blank and unmarked. No signage in scene',
    subVariations: {} as Record<string, StyleSubVariation>,
  },
  friendly: {
    name: 'Friendly',
    description: 'Warm candid lifestyle photography',
    keywords: ['thank', 'welcome', 'community', 'team', 'family', 'customer', 'appreciate', 'love', 'happy', 'together'],
    promptPrefix: 'Candid lifestyle photograph with golden hour warmth and soft bokeh background. Genuine, approachable feel with natural smiles if people are present. Soft diffused lighting, warm colour tones. All clothing is plain solid colors. All surfaces blank. No signage anywhere',
    subVariations: {} as Record<string, StyleSubVariation>,
  },
  seasonal: {
    name: 'Seasonal',
    description: 'Subtle seasonal themes with nature',
    keywords: ['holiday', 'christmas', 'summer', 'spring', 'fall', 'winter', 'new year', 'valentine', 'easter', 'thanksgiving', 'halloween', 'season'],
    promptPrefix: 'Tasteful seasonal photograph with subtle holiday elements and biophilic accents like plants, greenery, or natural textures. Muted, natural colour palette—no oversaturated or garish colours. Only physical decorations and objects. All surfaces blank and unmarked. No signage, no greeting cards, no written messages',
    subVariations: {} as Record<string, StyleSubVariation>,
  },
  artistic: {
    name: 'Artistic',
    description: 'Painterly illustrative styles',
    keywords: ['creative', 'inspire', 'transform', 'journey', 'dream', 'vision', 'art', 'style', 'unique', 'elevate', 'design', 'craft'],
    promptPrefix: 'Artistic stylized illustration with a painterly quality, soft brush strokes and dreamy atmosphere. Vibrant yet harmonious colors, high detail, cinematic composition. Single cohesive scene evoking emotion and creativity. No text or signage',
    subVariations: {
      watercolor: { name: 'Watercolor', promptPrefix: 'Soft dreamy watercolor illustration with translucent washes, gentle colour bleeding and delicate brush strokes. Light airy atmosphere with pastel-to-vivid gradient tones. Single cohesive scene, artistic and evocative. No text or signage' },
      'oil-painting': { name: 'Oil Painting', promptPrefix: 'Rich textured oil painting illustration with visible thick brush strokes, deep saturated colors and dramatic lighting. Classical composition with modern subject matter. Single cohesive scene. No text or signage' },
      sketch: { name: 'Sketch', promptPrefix: 'Clean modern line art sketch illustration with confident pen strokes on a light background. Minimal colour accents, architectural precision mixed with artistic flair. Single cohesive scene. No text or signage' },
    } as Record<string, StyleSubVariation>,
  },
  graffiti: {
    name: 'Graffiti',
    description: 'Bold urban street art energy',
    keywords: ['urban', 'street', 'bold', 'edgy', 'fun', 'rebel', 'standout', 'loud', 'colorful', 'mural'],
    promptPrefix: 'Dynamic graffiti street art style illustration with vibrant spray paint colors on a clean wall background. Bold lines and energetic composition, urban artistic vibe with high contrast. Single focused subject integrated into the art style. No literal text or words in the graffiti itself',
    subVariations: {
      full: { name: 'Full Graffiti', promptPrefix: 'Immersive full graffiti mural illustration covering the entire scene with vibrant spray paint colors, bold dripping lines, and explosive energy. Urban artistic masterpiece with the business subject woven into the art. No literal text or words' },
      'subtle-accents': { name: 'Subtle Accents', promptPrefix: 'Clean professional photograph with subtle graffiti-style accent elements at the edges—spray paint splatters, stencil patterns, and artistic drips as decorative framing. Main subject is photographically realistic. No literal text or words in the accents' },
    } as Record<string, StyleSubVariation>,
  },
  lifestyle: {
    name: 'Lifestyle',
    description: 'Candid real-people everyday moments',
    keywords: ['everyday', 'real', 'life', 'experience', 'home', 'moment', 'routine', 'authentic', 'people', 'living'],
    promptPrefix: 'Candid lifestyle photograph capturing natural candid moments with warm inviting atmosphere. People interacting with the service in a real home or business setting. Soft natural light, relatable and aspirational feel, DSLR quality with subtle depth of field. No staged poses. All surfaces blank. No signage',
    subVariations: {} as Record<string, StyleSubVariation>,
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Clean premium modern aesthetic',
    keywords: ['clean', 'modern', 'minimal', 'sleek', 'premium', 'sophisticated', 'elegant', 'simple', 'refined', 'luxury'],
    promptPrefix: 'Minimalist high-end photograph with clean lines, generous negative space and soft neutral tones. Sophisticated composition with one subtle accent colour. Premium feel with matte textures and geometric simplicity. DSLR quality, shallow depth of field. All surfaces blank. No signage',
    subVariations: {} as Record<string, StyleSubVariation>,
  },
  vintage: {
    name: 'Vintage',
    description: 'Film grain nostalgic retro feel',
    keywords: ['vintage', 'retro', 'classic', 'old-school', 'nostalgia', 'heritage', 'tradition', 'throwback', 'timeless'],
    promptPrefix: 'Warm vintage aesthetic photograph with gentle film grain, soft sepia undertones and nostalgic lighting. Slightly faded colours reminiscent of 35mm film photography from the 1970s. Authentic retro feel with soft vignette. All surfaces blank. No signage or written messages',
    subVariations: {} as Record<string, StyleSubVariation>,
  },
  wellness: {
    name: 'Wellness',
    description: 'Serene spa-like calming atmosphere',
    keywords: ['wellness', 'calm', 'relax', 'peace', 'health', 'comfort', 'spa', 'zen', 'mindful', 'healing', 'self-care', 'yoga'],
    promptPrefix: 'Spa-like serene photograph with calming biophilic elements—plants, natural wood, stone textures. Soft diffused lighting creating a peaceful mood. Muted earth tones with hints of sage green and warm ivory. Tranquil atmosphere. All surfaces blank. No signage',
    subVariations: {} as Record<string, StyleSubVariation>,
  },
} as const

export type ImageStyle = keyof typeof IMAGE_STYLES

/** Set of styles that should use "illustration" rather than "photograph" in prompts */
const ILLUSTRATION_STYLES: ReadonlySet<string> = new Set(['artistic', 'graffiti'])

/** Set of styles that get DSLR quality suffix */
const REALISTIC_STYLES: ReadonlySet<string> = new Set(['promotional', 'professional', 'friendly', 'lifestyle', 'minimalist', 'seasonal', 'vintage', 'wellness'])

// ---------------------------------------------------------------------------
// Content type to image size mapping
// ---------------------------------------------------------------------------
export const CONTENT_IMAGE_SIZES: Record<string, { size: '1024x1024' | '1792x1024' | '1024x1792'; label: string }> = {
  'blog-post': { size: '1792x1024', label: 'Landscape (1792x1024)' },
  'social-pack': { size: '1024x1024', label: 'Square (1024x1024)' },
  'social-post': { size: '1024x1024', label: 'Square (1024x1024)' },
  'gmb-post': { size: '1792x1024', label: 'Landscape 4:3 (1792x1024)' },
  'email': { size: '1792x1024', label: 'Landscape (1792x1024)' },
  'review-response': { size: '1024x1024', label: 'Square (1024x1024)' },
}

export function getImageSizeForContentType(contentType: string): '1024x1024' | '1792x1024' | '1024x1792' {
  return CONTENT_IMAGE_SIZES[contentType]?.size || '1024x1024'
}

// ---------------------------------------------------------------------------
// Plan limits
// ---------------------------------------------------------------------------
export const IMAGE_LIMITS: Record<string, number> = {
  free: 5, starter: 30, pro: 100, premium: -1,
}

export const CONTENT_LIMITS: Record<string, number> = {
  free: 5, starter: 30, pro: 100, premium: -1,
}

// ---------------------------------------------------------------------------
// Industry scene hints (expanded)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Industry scene hints — arrays of vivid, specific variations.
// One is randomly picked per generation for diversity. Each hint is a
// self-contained scene description that layers well with any style prefix.
// ---------------------------------------------------------------------------
export const INDUSTRY_SCENE_HINTS: Record<string, string[]> = {
  // ── HVAC ────────────────────────────────────────────────────────────────
  hvac: [
    'skilled HVAC technician installing an energy-efficient air conditioner in a cozy family home during summer, with professional tools and safety gear',
    'modern heating system being serviced in a residential basement, emphasizing comfort and reliability, warm natural lighting',
    'branded service van parked outside a suburban house, loaded with eco-friendly HVAC equipment and organized tools',
    'satisfied homeowner enjoying fresh cool air from a newly repaired vent in a bright living room, relaxed and comfortable',
  ],
  'hvac / heating & cooling': null as unknown as string[], // alias — resolved below

  // ── PLUMBING ────────────────────────────────────────────────────────────
  plumber: [
    'experienced plumber repairing a leaky faucet under a kitchen sink in a busy family home, using high-quality tools and wearing protective gloves',
    'plumber installing gleaming new pipes in a bathroom renovation, focused on clean efficient work with copper fittings visible',
    'plumbing service van arriving at a home with neatly organized plumbing supplies and toolboxes',
    'happy homeowner shaking hands with a friendly plumber after fixing a burst pipe, relief and gratitude on their face',
  ],
  plumbing: null as unknown as string[], // alias

  // ── ELECTRICAL ──────────────────────────────────────────────────────────
  electrician: [
    'certified electrician safely upgrading a home electrical panel in a modern kitchen, with multimeter and insulated tools',
    'electrician installing smart LED lighting in a cozy living room, highlighting energy savings and modern technology',
    'electrical service van equipped with cables and safety gear parked outside a small office building',
    'smiling client watching as electrician tests newly wired outlets for safety, professional and reassuring atmosphere',
  ],
  electrical: null as unknown as string[], // alias

  // ── ROOFING ─────────────────────────────────────────────────────────────
  roofing: [
    'professional roofer laying durable shingles on a suburban house roof under clear skies, using harness and safety equipment',
    'roofing team inspecting and repairing storm-damaged tiles on a family home, with materials stacked neatly on scaffold',
    'roofers applying eco-friendly sealant to extend roof life on a sunny day, teamwork and precision visible',
    'proud homeowner viewing a beautifully completed new roof from the front yard, house looking refreshed and well-maintained',
  ],

  // ── LANDSCAPING ─────────────────────────────────────────────────────────
  landscaping: [
    'dedicated landscaper shaping hedges and planting vibrant flowers in a welcoming backyard garden, with wheelbarrow and pruning shears',
    'landscaper mowing a lush green lawn in a suburban neighbourhood on a sunny morning, emphasizing sustainable practices',
    'designer laying out a low-maintenance outdoor space with native drought-resistant plants and decorative stone paths',
    'family enjoying a freshly landscaped patio with outdoor seating, string lights, and potted plants in the evening',
  ],
  'landscaping / lawn care': null as unknown as string[], // alias

  // ── CLEANING ────────────────────────────────────────────────────────────
  cleaning: [
    'efficient cleaning specialist deep-cleaning a kitchen countertop in a spotless home, using eco-friendly sprays and microfiber cloths',
    'professional cleaning team vacuuming and organizing a bright office space for productivity, wearing branded uniforms',
    'window washer polishing glass for a crystal-clear view in a commercial storefront, sunlight streaming through',
    'satisfied client relaxing in a freshly cleaned living room, breathing easy with sparkling surfaces all around',
  ],
  'cleaning service': null as unknown as string[], // alias

  // ── PEST CONTROL ────────────────────────────────────────────────────────
  pest: [
    'trained pest control expert applying safe targeted treatments in a home attic, wearing protective suit and using humane methods',
    'pest technician inspecting a garden perimeter with monitoring tools and eco-friendly solutions, thorough and methodical',
    'pest control service vehicle stocked with non-toxic solutions parked outside a restaurant, professional branding visible',
    'relieved business owner smiling after effective pest removal, gesturing toward a clean pest-free environment',
  ],
  'pest control': null as unknown as string[], // alias

  // ── REAL ESTATE ─────────────────────────────────────────────────────────
  'real estate': [
    'enthusiastic real estate agent touring a charming family home with potential buyers, pointing out bright living room features',
    'exterior of a well-maintained suburban house with welcoming porch, manicured landscaping, and warm sunlight',
    'agent handing over keys to excited new homeowners at closing, genuine smiles and celebration',
    'stylish open-house interior with fresh flowers, natural light pouring through large windows, and modern staging',
  ],

  // ── RESTAURANT / FOOD SERVICE ───────────────────────────────────────────
  restaurant: [
    'talented chef expertly grilling fresh ingredients in a lively restaurant kitchen, steam rising and aromas implied',
    'beautifully plated dish of seasonal cuisine on a rustic wooden table, vibrant colours and garnish, ready for service',
    'bustling cozy dining area with diverse happy patrons enjoying meals together, warm ambient lighting',
    'sous chef carefully preparing appetizers with fresh local produce for a community tasting event',
  ],
  'restaurant / food service': null as unknown as string[], // alias

  // ── DENTAL ──────────────────────────────────────────────────────────────
  dental: [
    'gentle dentist performing a check-up on a relaxed patient in a bright modern clinic with state-of-the-art chairs and calming decor',
    'dental hygienist demonstrating proper brushing techniques with a friendly approachable manner, educational setting',
    'welcoming dental office reception area with comfortable seating, plants, and a reassuring atmosphere',
    'smiling patient leaving the clinic with brighter teeth after a cosmetic treatment, confident and happy',
  ],
  dentist: null as unknown as string[], // alias
  'dentist / dental practice': null as unknown as string[], // alias

  // ── LEGAL ───────────────────────────────────────────────────────────────
  legal: [
    'knowledgeable attorney discussing case details with a client in a confidential office setting, open law books on shelves',
    'lawyer reviewing contracts at a polished desk with laptop, notes, and a coffee cup, focused and professional',
    'courtroom preparation scene with briefcase, legal documents spread out, and determined expression',
    'client receiving reassuring advice in a supportive consultation, attorney listening attentively',
  ],

  // ── ACCOUNTING / FINANCE ────────────────────────────────────────────────
  accounting: [
    'expert accountant analysing financial spreadsheets on a dual-monitor setup in a tidy organised office, with charts and a coffee mug',
    'financial advisor consulting with a small business owner on tax strategies across a desk, both engaged and focused',
    'accountant balancing books with calculator, reports fanned out, and coloured tabs for organisation',
    'entrepreneur smiling after receiving sound financial planning advice, handshake over a completed report',
  ],

  // ── AUTO REPAIR ─────────────────────────────────────────────────────────
  auto: [
    'skilled mechanic performing a precise engine tune-up under a lifted vehicle in a well-lit auto shop, with diagnostic tools on a cart',
    'technician replacing tires in a busy garage with organised racks of wheels and a tyre balancing machine',
    'happy customer picking up their repaired car with keys in hand, waving at the friendly mechanic in the service bay',
    'display of quality auto parts and organised tools in a professional service bay, emphasizing reliability and expertise',
  ],
  'auto repair': null as unknown as string[], // alias
  'auto repair / mechanic': null as unknown as string[], // alias

  // ── SALON / SPA / BEAUTY ────────────────────────────────────────────────
  salon: [
    'talented hairstylist crafting a modern cut on a smiling client in a chic salon with large mirrors and warm lighting',
    'spa therapist performing a relaxing facial treatment in a serene room with candles, soft towels, and calming plants',
    'nail artist applying intricate nail art at a stylish manicure station, colours and brushes neatly arranged',
    'client admiring their fresh new hairstyle in the mirror with a delighted expression, stylist standing proudly behind',
  ],
  'salon / spa / beauty': null as unknown as string[], // alias

  // ── FITNESS / GYM ───────────────────────────────────────────────────────
  fitness: [
    'personal trainer guiding a motivated client through a kettlebell workout in a bright modern gym, encouraging form',
    'small group fitness class doing yoga stretches in a sunlit studio, mats arranged in rows, calm and focused energy',
    'athlete using a rowing machine in a well-equipped training facility, determination and endurance on display',
    'trainer and client high-fiving after completing a workout milestone, sweat and smiles, community feeling',
  ],
  'fitness / gym': null as unknown as string[], // alias

  // ── RETAIL / SHOP ───────────────────────────────────────────────────────
  retail: [
    'welcoming shopkeeper arranging artisan products on wooden shelves in a cozy boutique storefront with warm lighting',
    'customer browsing unique handmade items in a curated local shop, chatting with the friendly store owner',
    'beautifully merchandised window display attracting passers-by on a charming main street, seasonal decorations',
    'small business owner gift-wrapping a purchase for a delighted customer at the checkout counter',
  ],
  'retail / shop': null as unknown as string[], // alias

  // ── CONTRACTOR / CONSTRUCTION ───────────────────────────────────────────
  contractor: [
    'general contractor reviewing blueprints at a residential construction site with framing visible, hard hat and vest on',
    'construction team collaborating on a home renovation, measuring and cutting materials with precision tools',
    'contractor walking a homeowner through a completed kitchen remodel, pointing out craftsmanship details',
    'well-organised construction site with stacked lumber, equipment, and a clean work area showing professionalism',
  ],
  'general contractor': null as unknown as string[], // alias

  // ── PHOTOGRAPHY ─────────────────────────────────────────────────────────
  photography: [
    'photographer capturing a portrait session in a studio with professional lighting, softboxes and backdrop visible',
    'event photographer shooting a joyful outdoor wedding ceremony, camera in hand, golden hour light',
    'product photographer arranging items on a clean white table for a commercial shoot, reflectors and tripod nearby',
    'photographer reviewing stunning images on a laptop with the happy client, both excited about the results',
  ],

  // ── INSURANCE ───────────────────────────────────────────────────────────
  insurance: [
    'friendly insurance agent explaining coverage options to a family across a desk, brochures and laptop open',
    'agent visiting a client\'s home for a property assessment, clipboard in hand, professional and approachable',
    'insurance advisor congratulating a client on securing their first home insurance, handshake in a bright office',
    'couple reviewing an insurance policy together on a tablet with an advisor, feeling reassured and protected',
  ],

  // ── VETERINARY / PET CARE ───────────────────────────────────────────────
  veterinary: [
    'caring veterinarian gently examining a golden retriever on a clinic table, stethoscope around neck, reassuring the pet',
    'vet tech holding a content cat while the veterinarian administers a routine check-up, calm clinic environment',
    'happy pet owner picking up their healthy dog after a vet visit, tail wagging, receptionist smiling in background',
    'veterinary clinic waiting area with pets and owners, educational posters on walls, warm and welcoming atmosphere',
  ],
  'pet care': null as unknown as string[], // alias

  // ── MOVING / RELOCATION ─────────────────────────────────────────────────
  moving: [
    'professional movers carefully loading wrapped furniture into a branded moving truck on a residential street',
    'moving team assembling furniture in a new apartment, boxes neatly stacked, client supervising with excitement',
    'family standing in front of their new home with the moving crew, thumbs up and smiles all around',
    'organised packing station with labelled boxes, bubble wrap, and moving blankets, ready for an efficient move',
  ],

  // ── TUTORING / EDUCATION ────────────────────────────────────────────────
  tutoring: [
    'patient tutor helping a student work through a maths problem at a well-lit desk, books and notebooks spread out',
    'group of students collaborating on a project in a bright classroom, tutor guiding discussion at the whiteboard',
    'online tutor teaching via video call on a laptop, friendly and engaged expression, colourful notes in background',
    'student celebrating an academic achievement with their proud tutor, high-five moment in a library setting',
  ],
  education: null as unknown as string[], // alias

  // ── BAKERY / CAFÉ ───────────────────────────────────────────────────────
  bakery: [
    'baker pulling a tray of golden fresh-baked bread from a commercial oven, flour dusted apron and warm glow',
    'display case filled with colourful pastries, macarons, and cakes in a cozy artisan bakery, inviting and appetizing',
    'barista crafting latte art in a stylish local café, steam wand in action, cozy seating in background',
    'customer enjoying a fresh croissant and coffee at a charming café window seat, morning light streaming in',
  ],
  cafe: null as unknown as string[], // alias
  'bakery / cafe': null as unknown as string[], // alias

  // ── CHILDCARE / DAYCARE ─────────────────────────────────────────────────
  childcare: [
    'friendly childcare provider reading a colourful storybook to a small group of engaged toddlers on a play mat',
    'children happily painting at an art table in a bright daycare room, supervised by a caring educator',
    'outdoor playground at a daycare centre with kids climbing and sliding, safe equipment and green grass',
    'parent dropping off a smiling child at daycare, warm handoff to a welcoming caregiver at the entrance',
  ],
  daycare: null as unknown as string[], // alias

  // ── THERAPY / COUNSELING ────────────────────────────────────────────────
  therapy: [
    'therapist in a calm comfortable office having a supportive conversation with a client, soft lighting and plants',
    'counselor\'s office with two chairs facing each other, tissue box on table, warm neutral tones creating a safe space',
    'mental health professional taking notes during a session, attentive and empathetic expression, bookshelf behind',
    'serene wellness room with a comfortable couch, soft throw blanket, and a diffuser emitting calming scent',
  ],
  counseling: null as unknown as string[], // alias

  // ── IT / TECH SERVICES ──────────────────────────────────────────────────
  'it services': [
    'IT specialist setting up a network server rack in a clean data room, cables neatly organised and labelled',
    'tech support professional helping a small business owner troubleshoot a laptop at their desk, patient and friendly',
    'cybersecurity expert monitoring multiple screens for threats, focused and alert in a modern office environment',
    'IT consultant explaining cloud migration strategy to a business team around a conference table with diagrams',
  ],
  technology: null as unknown as string[], // alias

  // ── WEDDING / EVENT PLANNING ────────────────────────────────────────────
  'event planning': [
    'event planner arranging elegant floral centrepieces on round tables in a beautifully decorated wedding venue',
    'wedding coordinator reviewing a detailed timeline with the bride and groom, all smiling with excitement',
    'corporate event setup with branded signage, chairs in rows, and a stage with microphone, professional atmosphere',
    'completed outdoor garden party with string lights, white linens, and an arch of flowers, ready for guests',
  ],
  wedding: null as unknown as string[], // alias
}

// Resolve null aliases to point to their parent key
;(function resolveAliases() {
  const entries = Object.entries(INDUSTRY_SCENE_HINTS)
  // Build a map of canonical keys (those with actual arrays)
  const canonical = new Map<string, string[]>()
  for (const [k, v] of entries) {
    if (Array.isArray(v) && v.length > 0) canonical.set(k, v)
  }
  // Alias resolution: find the canonical key whose name is a substring or starts similarly
  for (const [aliasKey, v] of entries) {
    if (v === null || (Array.isArray(v) && v.length === 0)) {
      // Try to find canonical parent by matching prefix
      const base = aliasKey.split('/')[0].trim().replace(/\s+/g, ' ')
      for (const [ck, cv] of canonical) {
        if (ck === base || base.startsWith(ck) || ck.startsWith(base)) {
          (INDUSTRY_SCENE_HINTS as Record<string, string[]>)[aliasKey] = cv
          break
        }
      }
    }
  }
})()

export function getIndustrySceneHint(industry: string): string {
  const key = industry.trim().toLowerCase().replace(/\s*&\s*/g, ' & ')
  const hints = INDUSTRY_SCENE_HINTS[key]
    ?? INDUSTRY_SCENE_HINTS[key.replace(/\s*&\s*/g, ' and ')]
    ?? INDUSTRY_SCENE_HINTS[key.replace(/\s+and\s+/g, ' & ')]
    // Fallback: try just the first word (e.g. "hvac" from "HVAC services")
    ?? INDUSTRY_SCENE_HINTS[key.split(/[\s/]/)[0]]
  if (hints && hints.length > 0) {
    return hints[Math.floor(Math.random() * hints.length)]
  }
  return `a ${industry} professional at work in their typical environment, approachable and skilled`
}

// ---------------------------------------------------------------------------
// Industry-style biases for smart detection (Phase 2A)
// ---------------------------------------------------------------------------
export const INDUSTRY_STYLE_BIASES: Record<string, Partial<Record<ImageStyle, number>>> = {
  hvac: { professional: 0.8, lifestyle: 0.5 },
  plumber: { professional: 0.8, lifestyle: 0.6 },
  plumbing: { professional: 0.8, lifestyle: 0.6 },
  electrician: { professional: 0.8, lifestyle: 0.5 },
  electrical: { professional: 0.8, lifestyle: 0.5 },
  roofing: { professional: 0.7, lifestyle: 0.5 },
  landscaping: { lifestyle: 0.7, friendly: 0.6, seasonal: 0.5 },
  cleaning: { professional: 0.6, minimalist: 0.6, lifestyle: 0.5 },
  'real estate': { lifestyle: 0.8, professional: 0.6, minimalist: 0.5 },
  restaurant: { promotional: 0.7, lifestyle: 0.8, friendly: 0.6 },
  dental: { professional: 0.7, wellness: 0.8, friendly: 0.6 },
  dentist: { professional: 0.7, wellness: 0.8, friendly: 0.6 },
  legal: { professional: 0.9, minimalist: 0.5 },
  accounting: { professional: 0.8, minimalist: 0.6 },
  auto: { professional: 0.7, lifestyle: 0.5 },
  'auto repair': { professional: 0.7, lifestyle: 0.5 },
  salon: { friendly: 0.8, artistic: 0.7, wellness: 0.6, lifestyle: 0.5 },
  fitness: { lifestyle: 0.8, friendly: 0.6, wellness: 0.5 },
  retail: { promotional: 0.7, lifestyle: 0.7, friendly: 0.5 },
  contractor: { professional: 0.8, lifestyle: 0.5 },
}

// Post-type biases (Phase 2B)
const POST_TYPE_BIASES: Record<string, Partial<Record<ImageStyle, number>>> = {
  'blog-post': { professional: 0.3, lifestyle: 0.2, minimalist: 0.1 },
  'social-pack': { friendly: 0.2, lifestyle: 0.2, artistic: 0.1 },
  'social-post': { friendly: 0.2, lifestyle: 0.2, artistic: 0.1 },
  'gmb-post': { professional: 0.2, promotional: 0.2 },
  'email': { professional: 0.2, minimalist: 0.2 },
}

// ---------------------------------------------------------------------------
// Smart style detection with weighted scoring (Phase 2C)
// ---------------------------------------------------------------------------
export function detectBestStyle(
  topic: string,
  industry?: string,
  postType?: string,
  preferredStyles?: string[],
  avoidStyles?: string[],
): ImageStyle {
  const topicLower = topic.toLowerCase()
  const allStyles = Object.keys(IMAGE_STYLES) as ImageStyle[]
  const scores: Record<string, number> = {}

  for (const style of allStyles) {
    // 1. Keyword match (weight 0.5)
    const config = IMAGE_STYLES[style]
    const matchCount = config.keywords.filter(kw => topicLower.includes(kw)).length
    const maxKeywords = config.keywords.length
    const keywordScore = maxKeywords > 0 ? (matchCount / maxKeywords) : 0

    // 2. Industry bias (weight 0.3)
    let industryScore = 0
    if (industry) {
      const indKey = industry.trim().toLowerCase()
      const biases = INDUSTRY_STYLE_BIASES[indKey]
      if (biases && biases[style] !== undefined) {
        industryScore = biases[style]!
      }
    }

    // 3. Post type bias (weight 0.2)
    let postTypeScore = 0
    if (postType) {
      const ptBiases = POST_TYPE_BIASES[postType]
      if (ptBiases && ptBiases[style] !== undefined) {
        postTypeScore = ptBiases[style]!
      }
    }

    // Weighted total
    let total = (keywordScore * 0.5) + (industryScore * 0.3) + (postTypeScore * 0.2)

    // 4. User preference boosts/blocks
    if (preferredStyles?.includes(style)) total += 0.3
    if (avoidStyles?.includes(style)) total = -Infinity

    scores[style] = total
  }

  // Find the winner
  let bestStyle: ImageStyle = 'professional'
  let bestScore = -Infinity
  for (const style of allStyles) {
    if (scores[style] > bestScore) {
      bestScore = scores[style]
      bestStyle = style
    }
  }

  // Fallback if no clear winner
  if (bestScore < 0.05) return 'professional'

  return bestStyle
}

// ---------------------------------------------------------------------------
// OpenAI client
// ---------------------------------------------------------------------------
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for image generation. DALL-E is not available through OpenRouter.')
  }
  return new OpenAI({ apiKey })
}

// ---------------------------------------------------------------------------
// Generation params & result interfaces
// ---------------------------------------------------------------------------
export interface GenerateImageParams {
  topic: string
  businessName: string
  industry: string
  style: ImageStyle
  contentType?: string
  subVariation?: string | null
  postType?: string
  preferredStyles?: string[]
  avoidStyles?: string[]
  /** Optional: derive warm/cool/neutral mood and promotional accents from brand colours */
  brandPrimaryColor?: string | null
  brandSecondaryColor?: string | null
  brandAccentColor?: string | null
  /** Optional: override scene hint for this industry (from Supabase) */
  sceneHintOverride?: string | null
  /** Optional: override style prefix (from Supabase) */
  stylePrefixOverride?: string | null
}

export interface GenerateImageResult {
  url: string
  style: ImageStyle
  subVariation?: string | null
  size: string
  revisedPrompt?: string
  fullPrompt?: string
}

// ---------------------------------------------------------------------------
// Prompt building blocks
// ---------------------------------------------------------------------------

// DALL-E 3 often adds text; we put no-text first and repeat it so the model follows it
const NO_TEXT_BLOCK = `CRITICAL: This image must contain absolutely no text. No words, no letters, no numbers, no signs, no labels, no logos, no writing on walls or objects. All surfaces are blank and unmarked. Any boards or signs in the scene are empty. Clothing is plain solid colors with no text or graphics. Product packaging is blank or solid color only. Do NOT include TV screens, monitors, or digital displays in the scene—if unavoidable, they must be switched off (solid black screen). The image must be completely free of written language.`

// Anti-collage block
const SINGLE_PHOTO_BLOCK = `This must be a single cohesive photograph—NOT a collage, NOT a mood board, NOT a montage, NOT split panels. No color swatches, no color palette strips, no inset photos. One continuous scene from a single camera angle.`

// Quality suffix applied to all styles
const QUALITY_SUFFIX = `High resolution, detailed textures, cinematic composition, shallow depth of field.`

/**
 * Sanitize the user-facing topic to remove promotional text that DALL-E would
 * attempt to render as visible text in the image.
 */
function sanitizeTopicForPrompt(topic: string): string {
  let cleaned = topic
  cleaned = cleaned.replace(/\d+[\.,]?\d*\s*%/g, '')
  cleaned = cleaned.replace(/[$€£¥]\s*\d+[\.,]?\d*/g, '')
  cleaned = cleaned.replace(/\d+[\.,]?\d*\s*[$€£¥]/g, '')
  const promoPatterns = [
    /\bonly today\b/gi, /\btoday only\b/gi, /\blimited time\b/gi,
    /\bact now\b/gi, /\bhurry\b/gi, /\bdon'?t miss\b/gi,
    /\bbuy one get one\b/gi, /\bbogo\b/gi, /\bfree shipping\b/gi,
    /\bsave up to\b/gi, /\bsave\b/gi, /\boff\b/gi,
    /\bdiscount\b/gi, /\bspecial offer\b/gi, /\bdeal of\b/gi,
    /\bcoupon\b/gi, /\bpromo code\b/gi, /\bflash sale\b/gi,
    /\bclearance\b/gi, /\bwhile supplies last\b/gi,
    /\border now\b/gi, /\bbook now\b/gi, /\bcall now\b/gi,
    /\bget yours\b/gi, /\bshop now\b/gi,
  ]
  for (const pat of promoPatterns) {
    cleaned = cleaned.replace(pat, '')
  }
  cleaned = cleaned.replace(/\s+/g, ' ').replace(/^[\s,.\-!:]+|[\s,.\-!:]+$/g, '').trim()
  if (cleaned.length < 3) return 'the business and its services'
  return cleaned
}

/** Derive a single mood phrase from brand primary hex for lighting tone. */
function getMoodFromHex(hex: string): string {
  const m = hex.replace(/^#/, '').match(/^([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/)
  if (!m) return 'Neutral, professional lighting and tone.'
  const r = parseInt(m[1], 16) / 255
  const g = parseInt(m[2], 16) / 255
  const b = parseInt(m[3], 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return 'Neutral, professional lighting and tone.'
  const chroma = max - min
  let h = 0
  if (chroma > 0) {
    if (max === r) h = ((g - b) / chroma) % 6
    else if (max === g) h = (b - r) / chroma + 2
    else h = (r - g) / chroma + 4
  }
  h = h * 60
  if (h < 0) h += 360
  if ((h >= 0 && h <= 60) || h >= 300) return 'Warm, inviting lighting and tone.'
  if (h >= 160 && h <= 260) return 'Clean, cool lighting and tone.'
  return 'Neutral, professional lighting and tone.'
}

/** Approximate hex to a simple colour name for prompt use. */
function getColorNameFromHex(hex: string): string {
  const m = hex.replace(/^#/, '').match(/^([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/)
  if (!m) return 'bold accent colour'
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return 'grey'
  const d = max - min
  let h = 0
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360
  const s = l < 128 ? (d / (max + min)) : (d / (512 - max - min))
  if (s < 0.15) return 'neutral'
  if (h < 25) return 'red'
  if (h < 45) return 'orange'
  if (h < 70) return 'yellow'
  if (h < 150) return 'green'
  if (h < 200) return 'cyan'
  if (h < 260) return 'blue'
  if (h < 330) return 'purple'
  return 'red'
}

// ---------------------------------------------------------------------------
// Build the full DALL-E prompt
// ---------------------------------------------------------------------------
function buildImagePrompt(params: GenerateImageParams): string {
  const { topic, industry, style, contentType, subVariation } = params
  const styleConfig = IMAGE_STYLES[style]
  const imageSize = getImageSizeForContentType(contentType || 'social-post')

  let formatDesc = 'Square format'
  if (imageSize === '1792x1024') formatDesc = 'Wide landscape format'
  else if (imageSize === '1024x1792') formatDesc = 'Tall portrait format'

  const visualTopic = sanitizeTopicForPrompt(topic)
  const industrySubject = params.sceneHintOverride || getIndustrySceneHint(industry)

  // Resolve style prefix: sub-variation > user override > default
  let stylePrefix: string
  if (params.stylePrefixOverride) {
    stylePrefix = params.stylePrefixOverride
  } else if (subVariation && styleConfig.subVariations && (styleConfig.subVariations as Record<string, StyleSubVariation>)[subVariation]) {
    stylePrefix = (styleConfig.subVariations as Record<string, StyleSubVariation>)[subVariation].promptPrefix
  } else {
    stylePrefix = styleConfig.promptPrefix
  }

  // Use "illustration" for artistic/graffiti, "photograph" for everything else
  const isIllustration = ILLUSTRATION_STYLES.has(style)
  const medium = isIllustration ? 'Illustration' : 'Photograph'

  let scene = `${medium} for a ${industry} business. Subject must be clearly related: ${industrySubject}. ${stylePrefix}. Visual theme: ${visualTopic}. Single main subject, clean uncluttered background.`

  // For realistic styles, add DSLR quality note
  if (REALISTIC_STYLES.has(style)) {
    scene += ` Natural lighting. Colour palette: natural and muted, avoid oversaturated or intensely vivid colours.`
  }

  scene += ` ${formatDesc}. Convey the idea through visuals only—no text in the image. ${QUALITY_SUFFIX}`

  // Brand colour mood
  const hexRe = /^#[0-9A-Fa-f]{6}$/
  const primaryHex = params.brandPrimaryColor && hexRe.test(params.brandPrimaryColor) ? params.brandPrimaryColor : null
  if (primaryHex) {
    scene += ` ${getMoodFromHex(primaryHex)}`
    if (style === 'promotional') {
      scene += ` The scene should feel inviting and eye-catching while remaining photographically natural. Use lighting and environment to create visual appeal rather than bold graphic colours.`
    }
    if (style === 'minimalist') {
      const colorName = getColorNameFromHex(primaryHex)
      scene += ` Use a subtle hint of ${colorName} as the single accent colour in the composition.`
    }
  }

  // Wrap with safeguard blocks
  const singleBlock = isIllustration
    ? `This must be a single cohesive illustration—NOT a collage, NOT a mood board, NOT a montage, NOT split panels. No color swatches, no inset images. One continuous scene.`
    : SINGLE_PHOTO_BLOCK

  return `${NO_TEXT_BLOCK} ${singleBlock} ${scene} ${singleBlock} ${NO_TEXT_BLOCK}`
}

// ---------------------------------------------------------------------------
// Generate an image using DALL-E 3
// ---------------------------------------------------------------------------
export async function generateImage(params: GenerateImageParams): Promise<GenerateImageResult> {
  const client = getOpenAIClient()
  const prompt = buildImagePrompt(params)
  const imageSize = getImageSizeForContentType(params.contentType || 'social-post')

  // Use 'vivid' for artistic/graffiti styles, 'natural' for everything else
  const dalleStyle = ILLUSTRATION_STYLES.has(params.style) ? 'vivid' : 'natural'
  
  try {
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: imageSize,
      quality: 'standard',
      style: dalleStyle,
    })
    
    const imageUrl = response.data[0]?.url
    const revisedPrompt = response.data[0]?.revised_prompt
    
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E')
    }
    
    return {
      url: imageUrl,
      style: params.style,
      subVariation: params.subVariation || null,
      size: imageSize,
      revisedPrompt: revisedPrompt,
      fullPrompt: prompt
    }
  } catch (error: unknown) {
    // Preserve the actual error details for debugging (billing, quota, content policy, etc.)
    const errObj = error as { status?: number; code?: string; message?: string; error?: { message?: string; code?: string; type?: string } }
    const apiMsg = errObj?.error?.message || errObj?.message || String(error)
    const apiCode = errObj?.error?.code || errObj?.code || errObj?.status
    console.error(`DALL-E image generation error [${apiCode}]:`, apiMsg)
    const detailedMsg = `DALL-E failed (${apiCode || 'unknown'}): ${apiMsg}`
    throw new Error(detailedMsg)
  }
}

// ---------------------------------------------------------------------------
// Utility exports
// ---------------------------------------------------------------------------
export function isImageGenerationConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}

export function hasImageQuota(plan: string, usedThisMonth: number): boolean {
  const limit = IMAGE_LIMITS[plan] || IMAGE_LIMITS.free
  if (limit === -1) return true
  return usedThisMonth < limit
}

export function getRemainingImageQuota(plan: string, usedThisMonth: number): number {
  const limit = IMAGE_LIMITS[plan] || IMAGE_LIMITS.free
  if (limit === -1) return -1
  return Math.max(0, limit - usedThisMonth)
}
