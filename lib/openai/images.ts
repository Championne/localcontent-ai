import OpenAI from 'openai'

// Image style definitions - optimized for realistic, authentic-looking images WITHOUT TEXT
// NOTE: DALL-E often ignores "no text" instructions - we use multiple reinforcement techniques
export const IMAGE_STYLES = {
  promotional: {
    name: 'Promotional',
    description: 'Playful or stylized images for sales and offers',
    keywords: ['sale', 'discount', 'off', 'special', 'deal', 'offer', 'limited', 'save', 'price', 'free'],
    promptPrefix: 'Promotional-style image that clearly shows the business type: technician at work, equipment, vehicle, or service in context. Inviting but with natural, muted colours—no oversaturation or neon. Suitable for a sale or offer. No generic interiors, no furniture showrooms, no pedestals, no abstract decor or mood boards. Single clear subject from the business world. All surfaces and objects free of text or signage'
  },
  professional: {
    name: 'Professional',
    description: 'Authentic business photography',
    keywords: ['tips', 'how to', 'guide', 'advice', 'learn', 'info', 'update', 'news', 'service'],
    promptPrefix: 'Authentic professional photograph with realistic lighting and natural, muted colour palette—avoid oversaturated or intense colours. Simple clean composition showing only physical objects and environments. All surfaces blank and unmarked. No signage in scene'
  },
  friendly: {
    name: 'Friendly',
    description: 'Warm, approachable photography',
    keywords: ['thank', 'welcome', 'community', 'team', 'family', 'customer', 'appreciate', 'love'],
    promptPrefix: 'Warm natural photograph with soft lighting, candid authentic feel. Colours should be soft and natural, not vivid or intense. Shows only physical objects and people. All clothing is plain solid colors. All surfaces blank. No signage anywhere'
  },
  seasonal: {
    name: 'Seasonal',
    description: 'Subtle seasonal themed photography',
    keywords: ['holiday', 'christmas', 'summer', 'spring', 'fall', 'winter', 'new year', 'valentine', 'easter', 'thanksgiving', 'halloween'],
    promptPrefix: 'Tasteful seasonal photograph with subtle holiday elements. Muted, natural colour palette—no oversaturated or garish colours. Only physical decorations and objects. All surfaces blank and unmarked. No signage, no greeting cards, no written messages'
  }
} as const

export type ImageStyle = keyof typeof IMAGE_STYLES

// Content type to image size mapping
// DALL-E 3 supports: 1024x1024 (square), 1792x1024 (landscape), 1024x1792 (portrait)
export const CONTENT_IMAGE_SIZES: Record<string, { size: '1024x1024' | '1792x1024' | '1024x1792'; label: string }> = {
  'blog-post': { size: '1792x1024', label: 'Landscape (1792x1024)' },
  'social-pack': { size: '1024x1024', label: 'Square (1024x1024)' },
  'social-post': { size: '1024x1024', label: 'Square (1024x1024)' },
  'gmb-post': { size: '1024x1024', label: 'Square (1024x1024)' },
  'email': { size: '1792x1024', label: 'Landscape (1792x1024)' },
  'review-response': { size: '1024x1024', label: 'Square (1024x1024)' },
}

// Get optimal image size for content type
export function getImageSizeForContentType(contentType: string): '1024x1024' | '1792x1024' | '1024x1792' {
  return CONTENT_IMAGE_SIZES[contentType]?.size || '1024x1024'
}

// Plan limits for image generation
export const IMAGE_LIMITS: Record<string, number> = {
  free: 5,
  starter: 30,
  pro: 100,
  premium: -1, // unlimited
}

// Content limits per plan
export const CONTENT_LIMITS: Record<string, number> = {
  free: 5,
  starter: 30,
  pro: 100,
  premium: -1, // unlimited
}

// Detect the best style based on topic keywords
export function detectBestStyle(topic: string): ImageStyle {
  const topicLower = topic.toLowerCase()
  
  for (const [style, config] of Object.entries(IMAGE_STYLES)) {
    if (config.keywords.some(kw => topicLower.includes(kw))) {
      return style as ImageStyle
    }
  }
  
  return 'professional' // default fallback
}

// Get OpenAI client for DALL-E (uses same config as text generation)
function getOpenAIClient(): OpenAI {
  // Prefer direct OpenAI for DALL-E (OpenRouter doesn't support DALL-E)
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for image generation. DALL-E is not available through OpenRouter.')
  }
  
  return new OpenAI({
    apiKey: apiKey,
  })
}

export interface GenerateImageParams {
  topic: string
  businessName: string
  industry: string
  style: ImageStyle
  contentType?: string // Added to determine image size
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
  size: string
  revisedPrompt?: string
  fullPrompt?: string
}

// DALL-E 3 often adds text; we put no-text first and repeat it so the model follows it
const NO_TEXT_BLOCK = `CRITICAL: This image must contain absolutely no text. No words, no letters, no numbers, no signs, no labels, no logos, no writing on walls or objects. All surfaces are blank and unmarked. Any boards or signs in the scene are empty. Clothing is plain solid colors with no text or graphics. Product packaging is blank or solid color only. Do NOT include TV screens, monitors, or digital displays in the scene—if unavoidable, they must be switched off (solid black screen). The image must be completely free of written language.`

// Anti-collage block: prevent DALL-E from creating mood boards, collages, or color swatches
const SINGLE_PHOTO_BLOCK = `This must be a single cohesive photograph—NOT a collage, NOT a mood board, NOT a montage, NOT split panels. No color swatches, no color palette strips, no inset photos. One continuous scene from a single camera angle.`

/**
 * Sanitize the user-facing topic to remove promotional text that DALL-E would
 * attempt to render as visible text in the image. We extract only the visual
 * SUBJECT (e.g. "margarita pizza") and discard prices, percentages, CTAs.
 */
function sanitizeTopicForPrompt(topic: string): string {
  let cleaned = topic
  // Remove percentages and prices (10%, $5, €10, 50% off, etc.)
  cleaned = cleaned.replace(/\d+[\.,]?\d*\s*%/g, '')
  cleaned = cleaned.replace(/[$€£¥]\s*\d+[\.,]?\d*/g, '')
  cleaned = cleaned.replace(/\d+[\.,]?\d*\s*[$€£¥]/g, '')
  // Remove common promotional phrases
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
  // Collapse whitespace and trim
  cleaned = cleaned.replace(/\s+/g, ' ').replace(/^[\s,.\-!:]+|[\s,.\-!:]+$/g, '').trim()
  // If after stripping we have almost nothing, fall back to a generic description
  if (cleaned.length < 3) {
    return 'the business and its services'
  }
  return cleaned
}

/** Industry-normalized key to concrete scene subject hints so the image clearly shows that business (not generic interiors).
 *  IMPORTANT: Each hint must describe ONE decisive subject. Never use "or" alternatives — DALL-E renders all of them as a collage. */
export const INDUSTRY_SCENE_HINTS: Record<string, string> = {
  hvac: 'a technician servicing an air conditioning unit on-site',
  'hvac / heating & cooling': 'a technician servicing an air conditioning unit on-site',
  plumbing: 'a plumber working under a kitchen sink with professional tools',
  electrical: 'an electrician working on a residential electrical panel',
  roofing: 'a roofer installing shingles on a house roof',
  landscaping: 'a landscaper mowing a lush green lawn on a sunny day',
  cleaning: 'a professional cleaner wiping down a spotless kitchen counter',
  pest: 'a pest control technician inspecting a home exterior with equipment',
  'real estate': 'the front exterior of an inviting residential home with a manicured lawn',
  restaurant: 'a chef plating a dish in a professional restaurant kitchen',
  dental: 'a modern dental treatment room with a patient chair and equipment',
  legal: 'a lawyer reviewing documents at a polished office desk',
  accounting: 'a financial advisor working at a desk with a laptop and documents',
  auto: 'a mechanic working under the hood of a car in a repair shop',
  'auto repair': 'a mechanic working under the hood of a car in a repair shop',
}

export function getIndustrySceneHint(industry: string): string {
  const key = industry.trim().toLowerCase().replace(/\s*&\s*/g, ' and ')
  return INDUSTRY_SCENE_HINTS[key] ?? INDUSTRY_SCENE_HINTS[key.replace(/\s+and\s+/g, ' & ')] ?? `a ${industry} professional at work in their typical environment`
}

/** Derive a single mood phrase from brand primary hex for lighting tone (no exact hex in prompt). */
function getMoodFromHex(hex: string): string {
  const m = hex.replace(/^#/, '').match(/^([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/)
  if (!m) return 'Neutral, professional lighting and tone.'
  const r = parseInt(m[1], 16) / 255
  const g = parseInt(m[2], 16) / 255
  const b = parseInt(m[3], 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return 'Neutral, professional lighting and tone.'
  const d = max - min
  const chroma = max - min
  let h = 0
  if (chroma > 0) {
    if (max === r) h = ((g - b) / chroma) % 6
    else if (max === g) h = (b - r) / chroma + 2
    else h = (r - g) / chroma + 4
  }
  h = h * 60
  if (h < 0) h += 360
  // Warm: red/orange/yellow (roughly 0–60, 300–360). Cool: blue/teal/cyan (180–260). Else neutral.
  if ((h >= 0 && h <= 60) || h >= 300) return 'Warm, inviting lighting and tone.'
  if (h >= 160 && h <= 260) return 'Clean, cool lighting and tone.'
  return 'Neutral, professional lighting and tone.'
}

/** Approximate hex to a simple colour name for prompt use (no hex in prompt). Used for promotional brand-colour impact. */
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

// Build the image generation prompt with strong anti-text reinforcement (no-text at start and end)
function buildImagePrompt(params: GenerateImageParams): string {
  const { topic, industry, style, contentType } = params
  const styleConfig = IMAGE_STYLES[style]
  const imageSize = getImageSizeForContentType(contentType || 'social-post')

  let formatDesc = 'Square format'
  if (imageSize === '1792x1024') formatDesc = 'Wide landscape format'
  else if (imageSize === '1024x1792') formatDesc = 'Tall portrait format'

  // Sanitize topic: strip prices, percentages, CTAs so DALL-E doesn't render them as text
  const visualTopic = sanitizeTopicForPrompt(topic)

  // Lead with industry-specific subject so the image clearly shows that business (not generic interiors/showrooms)
  const industrySubject = params.sceneHintOverride || getIndustrySceneHint(industry)
  const stylePrefix = params.stylePrefixOverride || styleConfig.promptPrefix
  let scene = `Photograph for a ${industry} business. Subject must be clearly related: ${industrySubject}. ${stylePrefix}. Visual theme: ${visualTopic}. Single main subject, clean uncluttered background, natural lighting. Colour palette: natural and muted, avoid oversaturated or intensely vivid colours. ${formatDesc}. Convey the idea through visuals only—no text in the image.`
  const hexRe = /^#[0-9A-Fa-f]{6}$/
  const primaryHex = params.brandPrimaryColor && hexRe.test(params.brandPrimaryColor) ? params.brandPrimaryColor : null
  const hasBrandColor = !!primaryHex
  if (hasBrandColor) {
    scene += ` ${getMoodFromHex(primaryHex)}`
    // Promotional style: hint at warm/cool mood only—never name specific colours to avoid DALL-E rendering colour swatches
    if (style === 'promotional') {
      scene += ` The scene should feel inviting and eye-catching while remaining photographically natural. Use lighting and environment to create visual appeal rather than bold graphic colours.`
    }
  }
  return `${NO_TEXT_BLOCK} ${SINGLE_PHOTO_BLOCK} ${scene} ${SINGLE_PHOTO_BLOCK} ${NO_TEXT_BLOCK}`
}

// Generate an image using DALL-E 3
export async function generateImage(params: GenerateImageParams): Promise<GenerateImageResult> {
  const client = getOpenAIClient()
  const prompt = buildImagePrompt(params)
  const imageSize = getImageSizeForContentType(params.contentType || 'social-post')
  
  try {
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: imageSize,
      quality: 'standard',
      style: 'natural', // Always natural for authentic-looking images
    })
    
    const imageUrl = response.data[0]?.url
    const revisedPrompt = response.data[0]?.revised_prompt
    
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E')
    }
    
    return {
      url: imageUrl,
      style: params.style,
      size: imageSize,
      revisedPrompt: revisedPrompt,
      fullPrompt: prompt
    }
  } catch (error) {
    console.error('DALL-E image generation error:', error)
    throw new Error('Failed to generate image. Please try again.')
  }
}

// Check if image generation is available
export function isImageGenerationConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}

// Check if user has remaining image quota
export function hasImageQuota(plan: string, usedThisMonth: number): boolean {
  const limit = IMAGE_LIMITS[plan] || IMAGE_LIMITS.free
  if (limit === -1) return true // unlimited
  return usedThisMonth < limit
}

// Get remaining image quota
export function getRemainingImageQuota(plan: string, usedThisMonth: number): number {
  const limit = IMAGE_LIMITS[plan] || IMAGE_LIMITS.free
  if (limit === -1) return -1 // unlimited
  return Math.max(0, limit - usedThisMonth)
}
