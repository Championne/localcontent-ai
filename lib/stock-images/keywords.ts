/**
 * Derive search keywords from topic + industry for stock photo APIs.
 * Uses a tiered structure so rotation never runs out of images:
 *   - primary: best, most relevant terms (tried first)
 *   - secondary: good alternatives for variety
 *   - generic: broad fallback terms
 * Each industry should have 15-20+ total terms across tiers.
 *
 * Queries are written to surface high-quality, artistic, emotion-rich
 * images that feel authentic, aspirational, and client-focused.
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
      'professional HVAC technician smiling with happy family in cozy living room after repair',
      'eco-friendly air conditioner installation in sustainable suburban home',
      'skilled HVAC service technician maintaining furnace in residential basement',
      'modern heat pump outdoor unit with energy-efficient design',
      'HVAC equipment ductwork in clean attic space with natural lighting',
    ],
    secondary: [
      'smart thermostat installation in contemporary kitchen',
      'commercial rooftop HVAC unit aerial view over city buildings',
      'HVAC van loaded with professional tools parked in driveway',
      'indoor air vent system with fresh airflow visualization',
      'heating cooling system closeup with technician adjusting controls',
    ],
    generic: [
      'warm family home interior with perfect temperature comfort',
      'diverse professional service team collaborating on energy project',
      'residential energy efficiency upgrade in modern house',
      'clean indoor air quality in bright living space',
      'suburban home exterior with reliable climate control',
    ],
  },
  plumbing: {
    aliases: ['plumber'],
    primary: [
      'skilled plumber fixing kitchen sink with satisfied homeowner nearby',
      'water-efficient faucet installation in stylish modern bathroom',
      'professional plumber repairing pipes under sink in family home',
      'hot water heater setup in utility room with safety focus',
      'drain cleaning service in residential shower with clear results',
    ],
    secondary: [
      'plumbing tools and copper pipes organized in service van',
      'sewer line inspection with high-tech camera in backyard',
      'toilet installation in renovated bathroom with clean finishes',
      'pipe fitting closeup with precise welding technique',
      'emergency plumbing repair in flooded basement scenario',
    ],
    generic: [
      'reliable home water system with fresh flowing faucet',
      'diverse residential service worker ensuring clean maintenance',
      'modern bathroom renovation with efficient plumbing',
      'family enjoying leak-free home comfort',
      'suburban house with strong plumbing infrastructure',
    ],
  },
  electrical: {
    aliases: ['electrician'],
    primary: [
      'certified electrician upgrading panel with client in modern kitchen',
      'smart lighting installation in cozy living room for energy savings',
      'professional electrician wiring outlets in new home construction',
      'circuit breaker maintenance in safe residential setting',
      'solar panel setup on rooftop with sustainable energy focus',
    ],
    secondary: [
      'electrician tools including multimeter in organized toolbox',
      'light fixture hanging in elegant dining area',
      'home rewiring project with exposed safe wiring',
      'electrical safety inspection in family garage',
      'commercial electrical system in office building',
    ],
    generic: [
      'energy-efficient home with bright smart lighting',
      'diverse professional contractor in action on site',
      'modern home improvement with reliable power',
      'safe powered suburban household at dusk',
      'innovative smart home technology integration',
    ],
  },
  roofing: {
    aliases: ['roofer', 'roof repair'],
    primary: [
      'experienced roofer installing shingles on suburban house with safety gear',
      'roof repair after storm with satisfied homeowner below',
      'professional roofing crew working on metal panels',
      'gutter and roof edge installation for water protection',
      'eco-friendly solar-integrated roofing on modern home',
    ],
    secondary: [
      'flat commercial roof with waterproof membrane application',
      'roof inspection using drone over residential area',
      'tile roofing in Mediterranean-style house',
      'asphalt shingle closeup with durable texture',
      'storm damage assessment on ladder with tools',
    ],
    generic: [
      'strong weather-protected home exterior aerial view',
      'diverse construction team ensuring solid structure',
      'home improvement with fresh new roof',
      'suburban neighborhood with reliable rooftops',
      'building durability in changing seasons',
    ],
  },
  landscaping: {
    aliases: ['landscaper', 'lawn care', 'garden maintenance'],
    primary: [
      'dedicated landscaper planting native flowers in vibrant backyard',
      'professional lawn mowing in lush suburban garden',
      'garden design with pathways and shrubs for family enjoyment',
      'irrigation system setup for sustainable water use',
      'tree pruning service in peaceful outdoor space',
    ],
    secondary: [
      'hedge trimming with precise tools in front yard',
      'mulch spreading in flower beds for healthy growth',
      'outdoor patio landscaping with seating and lights',
      'backyard transformation before and after view',
      'seasonal garden maintenance with fall leaves',
    ],
    generic: [
      'green eco-friendly yard with natural beauty',
      'diverse team creating welcoming outdoor living',
      'serene residential garden in spring bloom',
      'active family in well-maintained lawn',
      'harmonious nature-integrated home exterior',
    ],
  },
  cleaning: {
    aliases: ['cleaning service', 'janitorial', 'maid service', 'house cleaning'],
    primary: [
      'professional cleaner polishing kitchen surfaces in spotless home',
      'deep cleaning team vacuuming living room with eco-supplies',
      'window washing service for crystal-clear home views',
      'office sanitizing with diverse staff in modern workspace',
      'bathroom deep clean with fresh scented results',
    ],
    secondary: [
      'carpet steam cleaning machine in cozy family room',
      'disinfecting high-touch areas in commercial setting',
      'organized cleaning cart with professional equipment',
      'post-construction cleanup in renovated space',
      'seasonal spring cleaning in bright interior',
    ],
    generic: [
      'sparkling organized home with welcoming ambiance',
      'fresh tidy living space for family comfort',
      'clean minimalist office boosting productivity',
      'immaculate kitchen ready for daily use',
      'healthy sanitized environment with natural light',
    ],
  },
  pest: {
    aliases: ['pest control', 'exterminator', 'termite'],
    primary: [
      'pest control technician treating home with safe eco-methods',
      'exterminator inspecting attic for humane removal',
      'professional pest van arriving at suburban house',
      'termite protection application in foundation area',
      'mosquito control in backyard for family safety',
    ],
    secondary: [
      'fumigation setup with protective gear',
      'rodent trap placement in clean garage',
      'wildlife relocation from residential property',
      'ant treatment closeup on outdoor path',
      'crawl space sealing for pest prevention',
    ],
    generic: [
      'safe protected family home exterior',
      'diverse service worker ensuring pest-free living',
      'clean suburban residence with peace of mind',
      'healthy home environment for pets and kids',
      'seasonal maintenance for bug-free outdoors',
    ],
  },
  'real estate': {
    aliases: ['realtor', 'real estate agent', 'property'],
    primary: [
      'real estate agent touring charming home with excited buyers',
      'house for sale sign in front of well-maintained property',
      'key handover to new owners with smiles and handshake',
      'open house event with diverse visitors exploring',
      'staged modern interior ready for showing',
    ],
    secondary: [
      'real estate contract signing in professional office',
      'neighborhood aerial view of suburban homes',
      'apartment exterior with urban appeal',
      'luxury home kitchen with high-end finishes',
      'property investment meeting with charts',
    ],
    generic: [
      'dream family home in welcoming community',
      'moving day with boxes and fresh start vibe',
      'cozy front porch entrance at sunset',
      'residential street with vibrant curb appeal',
      'growth-oriented property in thriving area',
    ],
  },
  restaurant: {
    aliases: ['dining', 'food service'],
    primary: [
      'vibrant chef plating fresh dish in lively kitchen',
      'smiling waiter serving diverse diners in cozy ambiance',
      'gourmet food closeup with steam and colors',
      'restaurant interior with warm lighting and patrons',
      'outdoor patio dining with string lights',
    ],
    secondary: [
      'bar counter with crafted cocktails and bartender',
      'food prep station with local ingredients',
      'elegant table setting for special occasion',
      'menu photography of seasonal specials',
      'busy commercial kitchen team in action',
    ],
    generic: [
      'delicious meal shared with friends',
      'cozy eatery atmosphere at evening',
      'fresh gourmet presentation on plate',
      'community gathering over food',
      'inviting restaurant facade with signage',
    ],
  },
  pizza: {
    aliases: ['pizzeria', 'pizza restaurant', 'pizza shop'],
    primary: [
      'fresh wood-fired pizza bubbling in oven',
      'pizza chef tossing dough with flour dust',
      'pepperoni slice pull with cheesy stretch',
      'pizzeria counter with assorted toppings',
      'family sharing pizza at rustic table',
    ],
    secondary: [
      'margherita pizza with basil and tomato',
      'pizza delivery box steaming hot',
      'brick oven closeup with flames',
      'Italian pizzeria interior cozy',
      'takeout pizza night with sides',
    ],
    generic: [
      'comforting cheesy food closeup',
      'casual family dinner vibe',
      'gourmet Italian cuisine flat lay',
      'warm pizzeria ambiance',
      'delicious slice on plate',
    ],
  },
  'food truck': {
    aliases: ['mobile food'],
    primary: [
      'colorful food truck serving street eats to line of customers',
      'mobile kitchen cooking tacos with fresh salsas',
      'food truck festival with diverse crowds',
      'gourmet burger truck window service',
      'night market food truck under lights',
    ],
    secondary: [
      'street food prep with grilling action',
      'customer ordering at vibrant truck counter',
      'Mexican food truck with authentic decor',
      'outdoor event food truck setup',
      'urban food truck parked in city spot',
    ],
    generic: [
      'casual street dining enjoyment',
      'festival market food variety',
      'urban culinary scene vibrant',
      'delicious mobile eats closeup',
      'community outdoor food gathering',
    ],
  },
  catering: {
    aliases: ['event catering'],
    primary: [
      'elegant catering buffet with plated appetizers',
      'professional caterer setting up wedding reception',
      'corporate lunch catering with diverse options',
      'event food station with fresh displays',
      'catering chef carving roast at banquet',
    ],
    secondary: [
      'appetizer trays at cocktail party',
      'outdoor catering van delivery scene',
      'banquet table with floral and food decor',
      'catering team prepping in kitchen',
      'special event dessert station',
    ],
    generic: [
      'sophisticated food presentation for occasions',
      'celebration meal with variety',
      'corporate dining setup professional',
      'party food shared with guests',
      'memorable event ambiance',
    ],
  },
  bakery: {
    aliases: ['baker', 'pastry shop'],
    primary: [
      'artisan baker displaying fresh sourdough loaves',
      'pastry case with golden croissants and cakes',
      'baker kneading dough in flour-dusted kitchen',
      'cupcake assortment with colorful frosting',
      'rustic bakery interior with warm ovens',
    ],
    secondary: [
      'donut glazing process closeup',
      'baguette fresh from oven',
      'cake decorating with intricate designs',
      'morning pastry selection in display',
      'cozy bakery counter with coffee',
    ],
    generic: [
      'sweet homemade treats inviting',
      'warm kitchen baking aroma implied',
      'comforting fresh bread portrait',
      'dessert indulgence closeup',
      'daily bakery routine cozy',
    ],
  },
  cafe: {
    aliases: ['coffee shop', 'coffeehouse'],
    primary: [
      'cozy cafe interior with barista pouring latte art',
      'coffee shop patrons relaxing with drinks',
      'espresso machine steaming in action',
      'outdoor cafe seating with morning light',
      'iced coffee with fresh brew details',
    ],
    secondary: [
      'pour-over coffee brewing station',
      'cappuccino foam art closeup',
      'cafe display with pastries and mugs',
      'warm coffeehouse atmosphere with books',
      'friendly barista serving customer',
    ],
    generic: [
      'relaxing morning coffee ritual',
      'cozy beverage gathering spot',
      'fresh breakfast in inviting space',
      'social cafe meeting vibe',
      'energizing drink closeup',
    ],
  },
  dental: {
    aliases: ['dentist', 'dental clinic', 'orthodontist'],
    primary: [
      'modern dental office with dentist examining smiling patient',
      'hygienist demonstrating care in bright clinic chair',
      'teeth whitening before-after in professional setting',
      'dental x-ray tech with advanced equipment',
      'pediatric dentist with happy child patient',
    ],
    secondary: [
      'orthodontics braces adjustment closeup',
      'dental tools sterilized and organized',
      'welcoming reception area with plants',
      'implant model display in consultation room',
      'family dental visit in comfortable space',
    ],
    generic: [
      'confident healthy smile portrait diverse',
      'clean clinical environment with trust',
      'medical office modern and calming',
      'wellness healthcare family focus',
      'bright smile transformation',
    ],
  },
  legal: {
    aliases: ['lawyer', 'law firm', 'attorney'],
    primary: [
      'attorney consulting client in professional office',
      'law firm meeting with diverse team',
      'courtroom scales of justice symbolic',
      'legal documents review at desk with laptop',
      'handshake deal after successful mediation',
    ],
    secondary: [
      'law library with books and research',
      'notary signing important papers',
      'business contract negotiation table',
      'expert legal advice in conference room',
      'case preparation with notes and files',
    ],
    generic: [
      'trustworthy professional portrait authority',
      'corporate consultation confident',
      'justice and fairness concept',
      'business environment secure',
      'guidance expertise meeting',
    ],
  },
  accounting: {
    aliases: ['accountant', 'bookkeeping', 'tax preparation', 'cpa', 'financial advisor'],
    primary: [
      'accountant advising small business owner on finances',
      'tax prep session with documents and calculator',
      'financial planning meeting in modern office',
      'bookkeeper analyzing spreadsheets on monitors',
      'investment review with charts and client',
    ],
    secondary: [
      'audit process with organized reports',
      'payroll setup in professional workspace',
      'quarterly report presentation table',
      'small business finance consultation',
      'portfolio management with growth graphs',
    ],
    generic: [
      'financial security and growth vibe',
      'professional desk with tools trust',
      'business success planning',
      'organized corporate environment',
      'expert advice peace of mind',
    ],
  },
  auto: {
    aliases: ['auto repair', 'car mechanic', 'auto shop', 'automotive', 'auto body'],
    primary: [
      'mechanic repairing engine in well-lit garage',
      'car service lift with tire rotation',
      'diagnostic check with computer in shop',
      'oil change closeup with fresh filter',
      'customer receiving keys after repair',
    ],
    secondary: [
      'brake inspection with calipers',
      'auto body polishing after paint',
      'transmission work in specialized bay',
      'vehicle detailing interior clean',
      'shop tools organized on wall',
    ],
    generic: [
      'reliable car parked shiny',
      'automotive maintenance trust',
      'road-ready vehicle safety',
      'professional service team',
      'clean garage environment',
    ],
  },
  salon: {
    aliases: ['hair salon', 'barbershop', 'barber', 'beauty salon', 'hairdresser'],
    primary: [
      'hairdresser styling client hair in mirror',
      'barber trimming beard with precision',
      'beauty salon manicure session relaxing',
      'blow dry finish with shiny results',
      'trendy haircut in modern chair',
    ],
    secondary: [
      'shampoo wash station with massage',
      'nail polish application colorful',
      'salon tools scissors and combs',
      'mirror station with lighting setup',
      'facial treatment spa-like',
    ],
    generic: [
      'confident beauty transformation',
      'self-care grooming session',
      'modern salon ambiance inviting',
      'personal style enhancement',
      'relaxing treatment peace',
    ],
  },
  fitness: {
    aliases: ['gym', 'personal trainer', 'fitness center', 'yoga studio', 'crossfit'],
    primary: [
      'personal trainer guiding client in gym workout',
      'group fitness class sweating together',
      'weight training with form focus',
      'yoga pose in serene studio',
      'outdoor running trail with motivation',
    ],
    secondary: [
      'crossfit pull-ups intense',
      'gym equipment setup clean',
      'stretching session flexible',
      'cycling spin class energetic',
      'pilates reformer exercise',
    ],
    generic: [
      'active healthy lifestyle portrait',
      'wellness energy movement',
      'strong body achievement',
      'community fitness group',
      'morning routine invigorating',
    ],
  },
  photography: {
    aliases: ['photographer', 'photo studio'],
    primary: [
      'photographer capturing portrait in natural light',
      'studio lighting setup for product shoot',
      'wedding couple photo session romantic',
      'camera lens focus closeup artistic',
      'event photographer in action crowd',
    ],
    secondary: [
      'photo editing on computer screen',
      'outdoor landscape shoot with tripod',
      'family session playful poses',
      'backdrop setup clean white',
      'professional gear bag organized',
    ],
    generic: [
      'creative visual art moment',
      'beautiful captured memory',
      'portfolio display inspiring',
      'light and shadow play',
      'special occasion preserved',
    ],
  },
  veterinary: {
    aliases: ['vet', 'animal hospital', 'pet clinic', 'veterinarian'],
    primary: [
      'vet examining happy dog on table',
      'pet clinic checkup with cat purring',
      'vaccination gentle with owner nearby',
      'surgery prep in sterile room',
      'grooming session fluffy results',
    ],
    secondary: [
      'stethoscope listen to pet heartbeat',
      'puppy health exam playful',
      'dental care for animal teeth',
      'exotic pet handling careful',
      'waiting room with pets calm',
    ],
    generic: [
      'loving pet owner bond',
      'healthy furry companion portrait',
      'animal care trust',
      'pet-friendly environment warm',
      'wellness for beloved animals',
    ],
  },
  construction: {
    aliases: ['contractor', 'general contractor', 'builder', 'home builder'],
    primary: [
      'construction worker framing new home structure',
      'contractor reviewing blueprints on site',
      'renovation team drywalling interior',
      'crane lifting materials high-rise',
      'demolition safe with protective gear',
    ],
    secondary: [
      'concrete foundation pour smooth',
      'heavy excavator digging foundation',
      'safety helmet team meeting',
      'commercial build progress aerial',
      'interior finish painting clean',
    ],
    generic: [
      'building growth strong foundation',
      'professional crew collaboration',
      'home project transformation',
      'urban development vibrant',
      'solid structure enduring',
    ],
  },
  moving: {
    aliases: ['movers', 'moving company', 'relocation'],
    primary: [
      'movers loading truck with boxes carefully',
      'professional team carrying furniture dolly',
      'packing service wrapping items secure',
      'new home unloading happy family',
      'office relocation efficient setup',
    ],
    secondary: [
      'storage unit organized stacks',
      'long-distance truck highway travel',
      'unpacking boxes in fresh space',
      'furniture assembly new room',
      'moving van parked driveway',
    ],
    generic: [
      'fresh start new beginning',
      'organized transition smooth',
      'family adventure moving day',
      'residential change welcoming',
      'clean space ready live',
    ],
  },
  insurance: {
    aliases: ['insurance agent', 'insurance broker'],
    primary: [
      'insurance agent meeting family for protection plan',
      'policy review with documents and smiles',
      'home coverage concept with umbrella symbol',
      'auto claim assessment with vehicle',
      'health card handover secure',
    ],
    secondary: [
      'life insurance family portrait safe',
      'property inspector checking damage',
      'advisor desk with financial tools',
      'business coverage meeting corporate',
      'paperwork signing trust handshake',
    ],
    generic: [
      'financial peace mind security',
      'professional guidance expert',
      'family safeguard home',
      'corporate planning future',
      'reliable protection concept',
    ],
  },
  tutoring: {
    aliases: ['tutor', 'education', 'learning center', 'test prep'],
    primary: [
      'tutor explaining math to engaged student whiteboard',
      'online tutoring session laptop focused',
      'teacher helping child read books smiling',
      'test prep group studying together',
      'college advising with notes and goals',
    ],
    secondary: [
      'homework assistance desk organized',
      'educational tech classroom interactive',
      'after-school program fun learning',
      'academic coaching one-on-one',
      'study materials books open',
    ],
    generic: [
      'knowledge growth success',
      'bright student achievement',
      'learning environment positive',
      'education journey inspiring',
      'academic focus determination',
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
