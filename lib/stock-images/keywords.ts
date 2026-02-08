/**
 * Derive search keywords from topic + industry for stock photo APIs.
 * Uses a tiered structure so rotation never runs out of images:
 *   - primary: best, most relevant terms (tried first)
 *   - secondary: good alternatives for variety
 *   - generic: broad fallback terms
 * Each industry should have 15-20+ total terms across tiers.
 */

export interface IndustryQueryConfig {
  aliases: string[]    // alternative names that resolve to this industry
  primary: string[]    // 5-7 best terms, tried first
  secondary: string[]  // 5-7 alternative terms
  generic: string[]    // 3-5 broad fallback terms
}

/** Canonical industry configs with tiered search terms. */
export const INDUSTRY_QUERY_CONFIGS: Record<string, IndustryQueryConfig> = {
  hvac: {
    aliases: ['hvac / heating & cooling', 'heating and cooling', 'heating & cooling', 'air conditioning', 'heating ventilation'],
    primary: [
      'HVAC technician repair',
      'air conditioner installation',
      'HVAC service technician',
      'furnace maintenance worker',
      'air conditioning unit outdoor',
      'HVAC equipment ductwork',
    ],
    secondary: [
      'heating cooling repair',
      'AC unit repair closeup',
      'thermostat installation',
      'commercial HVAC rooftop',
      'heat pump outdoor unit',
      'HVAC van tools',
      'air vent ductwork ceiling',
    ],
    generic: [
      'home comfort temperature',
      'technician uniform tools',
      'residential service call',
      'indoor air quality',
      'energy efficiency home',
    ],
  },
  plumbing: {
    aliases: ['plumber'],
    primary: [
      'plumber at work',
      'plumbing repair pipes',
      'plumber technician wrench',
      'kitchen sink plumbing',
      'bathroom faucet repair',
      'water heater installation',
    ],
    secondary: [
      'plumbing tools copper pipe',
      'drain cleaning service',
      'pipe fitting closeup',
      'plumber under sink',
      'toilet repair installation',
      'sewer line inspection',
    ],
    generic: [
      'home maintenance repair',
      'water pipe system',
      'residential service worker',
      'bathroom renovation',
      'clean water faucet',
    ],
  },
  electrical: {
    aliases: ['electrician'],
    primary: [
      'electrician at work',
      'electrical panel repair',
      'electrician wiring home',
      'circuit breaker panel',
      'electrical installation outlet',
      'commercial electrician',
    ],
    secondary: [
      'electrician tools multimeter',
      'light fixture installation',
      'electrical wiring closeup',
      'home rewiring project',
      'electrical safety inspection',
      'solar panel installation',
    ],
    generic: [
      'home improvement electrical',
      'power tools professional',
      'energy efficient lighting',
      'smart home technology',
      'residential contractor',
    ],
  },
  roofing: {
    aliases: ['roofer', 'roof repair'],
    primary: [
      'roofer at work',
      'roofing repair shingles',
      'roof installation crew',
      'roofing contractor ladder',
      'residential roof replacement',
      'roofing tools materials',
    ],
    secondary: [
      'flat roof commercial',
      'roof inspection drone',
      'gutter installation',
      'metal roofing panels',
      'roof tile clay',
      'storm damage roof repair',
    ],
    generic: [
      'house exterior aerial',
      'construction worker safety',
      'home improvement exterior',
      'weather protection building',
      'suburban residential home',
    ],
  },
  landscaping: {
    aliases: ['landscaper', 'lawn care', 'garden maintenance'],
    primary: [
      'landscaping garden design',
      'landscaper at work mowing',
      'garden maintenance pruning',
      'lawn care professional',
      'landscape architecture yard',
      'garden planting flowers',
    ],
    secondary: [
      'hedge trimming service',
      'irrigation sprinkler system',
      'mulching flower bed',
      'tree trimming service',
      'outdoor patio landscape',
      'backyard garden beautiful',
    ],
    generic: [
      'green lawn suburban home',
      'outdoor living space',
      'nature garden peaceful',
      'spring garden bloom',
      'residential yard maintenance',
    ],
  },
  cleaning: {
    aliases: ['cleaning service', 'janitorial', 'maid service', 'house cleaning'],
    primary: [
      'cleaning service professional',
      'professional cleaner home',
      'cleaning supplies equipment',
      'house cleaning team',
      'office cleaning service',
      'deep cleaning kitchen',
    ],
    secondary: [
      'carpet cleaning machine',
      'window cleaning professional',
      'sanitizing disinfecting surface',
      'vacuum cleaning floor',
      'bathroom cleaning spotless',
      'commercial janitorial service',
    ],
    generic: [
      'clean organized home',
      'sparkling kitchen modern',
      'tidy living room',
      'fresh clean interior',
      'spotless workspace office',
    ],
  },
  pest: {
    aliases: ['pest control', 'exterminator', 'termite'],
    primary: [
      'pest control technician',
      'exterminator spraying home',
      'pest inspection service',
      'termite inspection house',
      'pest control van equipment',
      'rodent control professional',
    ],
    secondary: [
      'fumigation tent house',
      'bug spray treatment',
      'wildlife removal service',
      'ant control treatment',
      'mosquito spraying outdoor',
      'crawl space inspection',
    ],
    generic: [
      'clean home protection',
      'family safe home',
      'residential service worker',
      'suburban house exterior',
      'home maintenance seasonal',
    ],
  },
  'real estate': {
    aliases: ['realtor', 'real estate agent', 'property'],
    primary: [
      'real estate agent client',
      'house for sale sign',
      'home showing tour',
      'real estate professional',
      'keys new home handover',
      'open house real estate',
    ],
    secondary: [
      'modern house exterior',
      'real estate contract signing',
      'home staging interior',
      'neighborhood suburban aerial',
      'apartment building modern',
      'luxury home interior',
    ],
    generic: [
      'dream home family',
      'residential neighborhood street',
      'moving day boxes',
      'house front door entrance',
      'property investment growth',
    ],
  },
  restaurant: {
    aliases: ['dining', 'food service'],
    primary: [
      'restaurant kitchen chef',
      'chef cooking flame',
      'restaurant food plated',
      'restaurant interior dining',
      'waiter serving food',
      'commercial kitchen busy',
    ],
    secondary: [
      'restaurant bar counter',
      'food preparation station',
      'dining table setting elegant',
      'menu food photography',
      'restaurant patio outdoor',
      'brunch cafe food',
    ],
    generic: [
      'delicious food closeup',
      'people dining together',
      'fresh ingredients kitchen',
      'cozy restaurant ambiance',
      'gourmet meal presentation',
    ],
  },
  pizza: {
    aliases: ['pizzeria', 'pizza restaurant', 'pizza shop'],
    primary: [
      'fresh pizza closeup',
      'pizza restaurant oven',
      'wood fired pizza flame',
      'pizza chef tossing dough',
      'pizzeria counter service',
      'pepperoni pizza slice',
    ],
    secondary: [
      'pizza delivery box',
      'pizza dough preparation',
      'brick oven pizza',
      'margherita pizza basil',
      'pizza takeout family',
      'italian restaurant pizza',
    ],
    generic: [
      'comfort food cheesy',
      'family dinner table',
      'italian food cuisine',
      'food photography flat lay',
      'restaurant warm ambiance',
    ],
  },
  'food truck': {
    aliases: ['mobile food'],
    primary: [
      'food truck colorful',
      'street food vendor truck',
      'food truck service window',
      'food truck festival outdoor',
      'mobile kitchen cooking',
      'food truck menu board',
    ],
    secondary: [
      'street food preparation',
      'food truck customer line',
      'gourmet food truck',
      'taco truck Mexican food',
      'food truck night market',
      'outdoor food event',
    ],
    generic: [
      'outdoor dining street',
      'festival food market',
      'casual food enjoyment',
      'urban food scene',
      'delicious street eats',
    ],
  },
  catering: {
    aliases: ['event catering'],
    primary: [
      'catering buffet setup',
      'professional catering event',
      'catering food display',
      'wedding catering service',
      'corporate catering lunch',
      'catering chef preparing',
    ],
    secondary: [
      'event food station',
      'appetizer tray elegant',
      'banquet table setup',
      'catering van delivery',
      'cocktail party food',
      'outdoor event catering',
    ],
    generic: [
      'elegant food presentation',
      'party celebration food',
      'corporate event dining',
      'buffet food variety',
      'special occasion meal',
    ],
  },
  bakery: {
    aliases: ['baker', 'pastry shop'],
    primary: [
      'artisan bakery bread',
      'fresh bread loaves display',
      'bakery shop interior',
      'pastry display case',
      'baker kneading dough',
      'croissant pastry golden',
    ],
    secondary: [
      'cupcake decoration sprinkles',
      'sourdough bread rustic',
      'bakery oven fresh',
      'cake decorating professional',
      'baguette French bread',
      'donut glazed assortment',
    ],
    generic: [
      'morning breakfast pastry',
      'warm cozy kitchen',
      'homemade baking flour',
      'sweet treat dessert',
      'comfort food fresh',
    ],
  },
  cafe: {
    aliases: ['coffee shop', 'coffeehouse'],
    primary: [
      'cafe interior cozy',
      'coffee shop barista',
      'latte art coffee cup',
      'cafe food pastry',
      'coffee beans roasted',
      'espresso machine professional',
    ],
    secondary: [
      'cafe outdoor seating',
      'pour over coffee brewing',
      'coffeehouse atmosphere warm',
      'iced coffee summer drink',
      'cappuccino foam art',
      'cafe counter display',
    ],
    generic: [
      'morning coffee routine',
      'cozy warm drinks',
      'relaxing cafe moment',
      'fresh breakfast beverage',
      'friendly coffee meeting',
    ],
  },
  dental: {
    aliases: ['dentist', 'dental clinic', 'orthodontist'],
    primary: [
      'dental office modern',
      'dentist patient exam',
      'dental care hygienist',
      'dental clinic chair',
      'teeth whitening treatment',
      'dental x-ray technology',
    ],
    secondary: [
      'dental tools instruments',
      'orthodontist braces',
      'dental reception waiting',
      'smile healthy teeth',
      'dental implant model',
      'pediatric dentist child',
    ],
    generic: [
      'healthy smile portrait',
      'medical professional office',
      'clean clinical environment',
      'family healthcare visit',
      'modern medical technology',
    ],
  },
  legal: {
    aliases: ['lawyer', 'law firm', 'attorney'],
    primary: [
      'lawyer office professional',
      'legal consultation client',
      'law firm interior',
      'attorney at desk',
      'courtroom justice scales',
      'legal documents contract',
    ],
    secondary: [
      'business meeting conference',
      'law books library',
      'handshake agreement deal',
      'legal research computer',
      'notary public signing',
      'mediation meeting table',
    ],
    generic: [
      'professional office modern',
      'business consultation meeting',
      'trust authority portrait',
      'corporate environment',
      'expert advice guidance',
    ],
  },
  accounting: {
    aliases: ['accountant', 'bookkeeping', 'tax preparation', 'cpa', 'financial advisor'],
    primary: [
      'accountant office professional',
      'tax preparation documents',
      'financial advisor client',
      'accounting calculator spreadsheet',
      'bookkeeper at desk',
      'financial planning meeting',
    ],
    secondary: [
      'business tax filing',
      'audit financial review',
      'payroll processing office',
      'quarterly business report',
      'investment portfolio review',
      'small business accounting',
    ],
    generic: [
      'professional office desk',
      'business finance growth',
      'organized workspace documents',
      'trust expertise advice',
      'corporate meeting table',
    ],
  },
  auto: {
    aliases: ['auto repair', 'car mechanic', 'auto shop', 'automotive', 'auto body'],
    primary: [
      'auto repair mechanic',
      'car mechanic workshop',
      'auto shop garage',
      'car maintenance service',
      'mechanic under car lift',
      'tire rotation service',
    ],
    secondary: [
      'engine repair closeup',
      'oil change service',
      'brake repair automotive',
      'car diagnostic computer',
      'auto body paint',
      'transmission repair shop',
    ],
    generic: [
      'car parked clean',
      'automotive tools equipment',
      'vehicle inspection check',
      'road safety driving',
      'trusted repair service',
    ],
  },
  salon: {
    aliases: ['hair salon', 'barbershop', 'barber', 'beauty salon', 'hairdresser'],
    primary: [
      'hair salon styling',
      'barber cutting hair',
      'beauty salon interior',
      'hairdresser blow dry',
      'barbershop classic chair',
      'hair coloring highlights',
    ],
    secondary: [
      'salon shampoo wash',
      'beard trim barbershop',
      'manicure nail salon',
      'hair tools scissors comb',
      'salon mirror station',
      'trendy haircut style',
    ],
    generic: [
      'beauty care personal',
      'self care grooming',
      'modern salon interior',
      'confident style look',
      'relaxing spa treatment',
    ],
  },
  fitness: {
    aliases: ['gym', 'personal trainer', 'fitness center', 'yoga studio', 'crossfit'],
    primary: [
      'gym fitness workout',
      'personal trainer client',
      'fitness class group',
      'weight training gym',
      'yoga studio class',
      'running exercise outdoor',
    ],
    secondary: [
      'crossfit box workout',
      'gym equipment weights',
      'stretching flexibility exercise',
      'spinning cycling class',
      'fitness motivation athlete',
      'pilates studio reformer',
    ],
    generic: [
      'healthy lifestyle active',
      'wellness movement energy',
      'strong body exercise',
      'morning routine fitness',
      'community sports team',
    ],
  },
  photography: {
    aliases: ['photographer', 'photo studio'],
    primary: [
      'photographer at work',
      'photography studio lighting',
      'camera lens closeup',
      'portrait photography session',
      'wedding photographer couple',
      'professional camera equipment',
    ],
    secondary: [
      'photo editing computer',
      'outdoor photo shoot',
      'studio backdrop setup',
      'event photographer',
      'product photography setup',
      'family photo session',
    ],
    generic: [
      'creative art visual',
      'beautiful moment captured',
      'professional portfolio display',
      'light shadow artistic',
      'memories special occasion',
    ],
  },
  veterinary: {
    aliases: ['vet', 'animal hospital', 'pet clinic', 'veterinarian'],
    primary: [
      'veterinarian examining pet',
      'vet clinic animal care',
      'dog at veterinary office',
      'cat veterinary checkup',
      'pet vaccination vet',
      'veterinary surgery professional',
    ],
    secondary: [
      'pet grooming professional',
      'animal hospital waiting',
      'vet stethoscope dog',
      'puppy health checkup',
      'pet dental care vet',
      'exotic animal veterinary',
    ],
    generic: [
      'happy pet owner',
      'dog cat pet portrait',
      'animal love companion',
      'pet friendly business',
      'furry friend healthy',
    ],
  },
  construction: {
    aliases: ['contractor', 'general contractor', 'builder', 'home builder'],
    primary: [
      'construction worker site',
      'home construction framing',
      'contractor building project',
      'construction crane building',
      'renovation remodel home',
      'blueprint construction plan',
    ],
    secondary: [
      'concrete pouring foundation',
      'drywall installation interior',
      'commercial building construction',
      'demolition renovation project',
      'construction safety helmet',
      'heavy equipment excavator',
    ],
    generic: [
      'building progress structure',
      'professional crew team',
      'home improvement project',
      'development growth urban',
      'strong foundation solid',
    ],
  },
  moving: {
    aliases: ['movers', 'moving company', 'relocation'],
    primary: [
      'moving company truck',
      'movers carrying boxes',
      'packing boxes moving',
      'moving truck loading',
      'professional movers team',
      'new home moving day',
    ],
    secondary: [
      'furniture moving dollies',
      'storage unit facility',
      'packing supplies tape',
      'long distance moving highway',
      'office relocation moving',
      'unpacking new home',
    ],
    generic: [
      'new beginning home',
      'organized boxes stacked',
      'family moving happy',
      'residential neighborhood street',
      'fresh start clean space',
    ],
  },
  insurance: {
    aliases: ['insurance agent', 'insurance broker'],
    primary: [
      'insurance agent client meeting',
      'insurance policy documents',
      'family protection insurance',
      'home insurance concept',
      'auto insurance claim',
      'business insurance office',
    ],
    secondary: [
      'health insurance card',
      'insurance umbrella protection',
      'property damage assessment',
      'insurance advisor desk',
      'life insurance family',
      'insurance paperwork signing',
    ],
    generic: [
      'financial security peace',
      'professional consultation office',
      'trust handshake agreement',
      'family safety home',
      'business planning meeting',
    ],
  },
  tutoring: {
    aliases: ['tutor', 'education', 'learning center', 'test prep'],
    primary: [
      'tutor student learning',
      'tutoring session desk',
      'teacher helping student',
      'online tutoring laptop',
      'math tutoring whiteboard',
      'study group students',
    ],
    secondary: [
      'reading books education',
      'test preparation studying',
      'homework help desk',
      'educational technology classroom',
      'after school program',
      'college prep tutoring',
    ],
    generic: [
      'learning knowledge growth',
      'education success achievement',
      'bright student smiling',
      'classroom environment study',
      'academic excellence focus',
    ],
  },
}

/** Build a lookup from alias → canonical key for fast resolution. */
const aliasLookup: Record<string, string> = {}
for (const [canonical, config] of Object.entries(INDUSTRY_QUERY_CONFIGS)) {
  aliasLookup[canonical] = canonical
  for (const alias of config.aliases) {
    aliasLookup[alias.toLowerCase()] = canonical
  }
}

/** Resolve an industry string to its canonical config. */
function resolveIndustry(industry: string): IndustryQueryConfig | null {
  const key = industry.trim().toLowerCase()
  if (!key) return null
  // Exact or alias match
  const canonical = aliasLookup[key]
  if (canonical) return INDUSTRY_QUERY_CONFIGS[canonical]
  // Normalize & and "and"
  const normalized = key.replace(/\s*&\s*/g, ' and ')
  const canon2 = aliasLookup[normalized]
  if (canon2) return INDUSTRY_QUERY_CONFIGS[canon2]
  // Substring match: "promotional pizza business" → pizza
  for (const [k, config] of Object.entries(INDUSTRY_QUERY_CONFIGS)) {
    if (key.includes(k)) return config
    for (const alias of config.aliases) {
      if (key.includes(alias.toLowerCase())) return config
    }
  }
  return null
}

/** Get all terms for an industry, flattened in tier order: primary → secondary → generic. */
export function getIndustrySearchTerms(industry: string, overrides?: { primary?: string[]; secondary?: string[]; generic?: string[] }): string[] {
  const config = resolveIndustry(industry)
  if (!config && !overrides) return []
  const primary = overrides?.primary ?? config?.primary ?? []
  const secondary = overrides?.secondary ?? config?.secondary ?? []
  const generic = overrides?.generic ?? config?.generic ?? []
  return [...primary, ...secondary, ...generic]
}

/** Get terms organized by tier (for the dashboard editor). */
export function getIndustryTiers(industry: string): { primary: string[]; secondary: string[]; generic: string[] } | null {
  const config = resolveIndustry(industry)
  if (!config) return null
  return { primary: config.primary, secondary: config.secondary, generic: config.generic }
}

/** Get all canonical industry keys (for the dashboard editor). */
export function getAllIndustryKeys(): string[] {
  return Object.keys(INDUSTRY_QUERY_CONFIGS)
}

export function getSearchQueryForTopic(topic: string, industry: string): string {
  const t = topic.trim().toLowerCase()
  const ind = industry.trim().toLowerCase()

  // If topic is already a short phrase (e.g. "plumber at work"), use it with industry as context
  const words = t.split(/\s+/)
  if (words.length <= 4 && t.length <= 40) {
    return `${t} ${ind}`.trim()
  }

  // Long topic: take first few meaningful words and add industry
  const short = words.slice(0, 3).join(' ')
  return `${short} ${ind}`.trim()
}

/**
 * Return query variants using tiered rotation.
 * page=1 starts from tier 1, page=2 offsets into the list so regenerate gets fresh terms.
 * Each page cycles through a different slice of the combined tier list.
 */
export function getSearchQueryVariants(topic: string, industry: string, page = 1, overrides?: { primary?: string[]; secondary?: string[]; generic?: string[] }): string[] {
  const ind = industry.trim().toLowerCase()
  const allTerms = getIndustrySearchTerms(industry, overrides)
  const topicQuery = getSearchQueryForTopic(topic, industry)
  const variants: string[] = []

  if (allTerms.length > 0) {
    // Rotate: each page offsets by 3 terms so regenerate gets fresh queries
    const offset = ((page - 1) * 3) % allTerms.length
    for (let i = 0; i < allTerms.length; i++) {
      variants.push(allTerms[(offset + i) % allTerms.length])
    }
  }

  // Add topic-derived query as fallback
  variants.push(topicQuery)
  if (ind && !topicQuery.toLowerCase().includes(ind)) {
    variants.push(`${industry} professional`)
  }
  if (ind) {
    variants.push(`${industry} work`, `${industry} team`)
  }
  return [...new Set(variants)]
}
