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
export const INDUSTRY_SCENE_HINTS: Record<string, string> = {
  hvac: 'a technician servicing an air conditioning unit on-site',
  'hvac / heating & cooling': 'a technician servicing an air conditioning unit on-site',
  plumber: 'a plumber working under a kitchen sink with professional tools',
  plumbing: 'a plumber working under a kitchen sink with professional tools',
  electrician: 'an electrician working on a residential electrical panel',
  electrical: 'an electrician working on a residential electrical panel',
  roofing: 'a roofer installing shingles on a house roof',
  landscaping: 'a landscaper mowing a lush green lawn on a sunny day',
  'landscaping / lawn care': 'a landscaper trimming hedges in a beautifully maintained garden',
  cleaning: 'a professional cleaner wiping down a spotless kitchen counter',
  'cleaning service': 'a professional cleaner wiping down a spotless kitchen counter',
  pest: 'a pest control technician inspecting a home exterior with equipment',
  'real estate': 'the front exterior of an inviting residential home with a manicured lawn',
  restaurant: 'a chef plating a dish in a professional restaurant kitchen',
  'restaurant / food service': 'a chef plating a beautifully garnished dish in a warm restaurant kitchen',
  dental: 'a dentist gently examining a patient\'s smile in a modern clinic',
  dentist: 'a dentist gently examining a patient\'s smile in a modern clinic',
  'dentist / dental practice': 'a dentist gently examining a patient\'s smile in a modern clinic',
  legal: 'a lawyer reviewing documents at a polished office desk',
  accounting: 'a financial advisor working at a desk with a laptop and documents',
  auto: 'a mechanic working under the hood of a car in a repair shop',
  'auto repair': 'a mechanic working under the hood of a car in a repair shop',
  'auto repair / mechanic': 'a mechanic working under the hood of a car in a well-lit repair shop',
  salon: 'a hairstylist working on a client\'s hair in a modern salon',
  'salon / spa / beauty': 'a stylist carefully working on a client in a chic modern salon',
  fitness: 'a personal trainer guiding a client through an exercise in a bright gym',
  'fitness / gym': 'a personal trainer guiding a client through an exercise in a bright gym',
  retail: 'a shopkeeper arranging products on shelves in a welcoming storefront',
  'retail / shop': 'a shopkeeper arranging products on shelves in a welcoming storefront',
  contractor: 'a general contractor reviewing plans at a residential construction site',
  'general contractor': 'a general contractor reviewing plans at a residential construction site',
}

export function getIndustrySceneHint(industry: string): string {
  const key = industry.trim().toLowerCase().replace(/\s*&\s*/g, ' and ')
  return INDUSTRY_SCENE_HINTS[key] ?? INDUSTRY_SCENE_HINTS[key.replace(/\s+and\s+/g, ' & ')] ?? `a ${industry} professional at work in their typical environment`
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
  } catch (error) {
    console.error('DALL-E image generation error:', error)
    throw new Error('Failed to generate image. Please try again.')
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
