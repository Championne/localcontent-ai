import OpenAI from 'openai'

// Image style definitions - optimized for realistic, authentic-looking images WITHOUT TEXT
// NOTE: DALL-E often ignores "no text" instructions - we use multiple reinforcement techniques
export const IMAGE_STYLES = {
  promotional: {
    name: 'Promotional',
    description: 'Playful or stylized images for sales and offers',
    keywords: ['sale', 'discount', 'off', 'special', 'deal', 'offer', 'limited', 'save', 'price', 'free'],
    promptPrefix: 'Playful, stylized or slightly abstract image. Can be illustrative or conceptual, not necessarily photorealistic. Clean composition, no text. No showroom, no pedestals, no gallery lighting, no literal mood-board frames or color swatches. Surfaces and objects free of signage or writing'
  },
  professional: {
    name: 'Professional',
    description: 'Authentic business photography',
    keywords: ['tips', 'how to', 'guide', 'advice', 'learn', 'info', 'update', 'news', 'service'],
    promptPrefix: 'Authentic professional photograph with realistic lighting. Simple clean composition showing only physical objects and environments. All surfaces blank and unmarked. No signage in scene'
  },
  friendly: {
    name: 'Friendly',
    description: 'Warm, approachable photography',
    keywords: ['thank', 'welcome', 'community', 'team', 'family', 'customer', 'appreciate', 'love'],
    promptPrefix: 'Warm natural photograph with soft lighting, candid authentic feel. Shows only physical objects and people. All clothing is plain solid colors. All surfaces blank. No signage anywhere'
  },
  seasonal: {
    name: 'Seasonal',
    description: 'Subtle seasonal themed photography',
    keywords: ['holiday', 'christmas', 'summer', 'spring', 'fall', 'winter', 'new year', 'valentine', 'easter', 'thanksgiving', 'halloween'],
    promptPrefix: 'Tasteful seasonal photograph with subtle holiday elements. Only physical decorations and objects. All surfaces blank and unmarked. No signage, no greeting cards, no written messages'
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
  /** Optional: derive warm/cool/neutral mood for lighting tone in the prompt */
  brandPrimaryColor?: string | null
}

export interface GenerateImageResult {
  url: string
  style: ImageStyle
  size: string
  revisedPrompt?: string
  fullPrompt?: string
}

// DALL-E 3 often adds text; we put no-text first and repeat it so the model follows it
const NO_TEXT_BLOCK = `CRITICAL: This image must contain absolutely no text. No words, no letters, no numbers, no signs, no labels, no logos, no writing on walls or objects. All surfaces are blank and unmarked. Any boards or signs in the scene are empty. Clothing is plain solid colors with no text or graphics. Product packaging is blank or solid color only. Screens and displays are off or show only abstract colors. The image must be completely free of written language.`

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
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
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

// Build the image generation prompt with strong anti-text reinforcement (no-text at start and end)
function buildImagePrompt(params: GenerateImageParams): string {
  const { topic, industry, style, contentType } = params
  const styleConfig = IMAGE_STYLES[style]
  const imageSize = getImageSizeForContentType(contentType || 'social-post')

  let formatDesc = 'Square format'
  if (imageSize === '1792x1024') formatDesc = 'Wide landscape format'
  else if (imageSize === '1024x1792') formatDesc = 'Tall portrait format'

  // Start with no-text so the model sees it first; keep scene description minimal to reduce text temptation
  let scene = `Realistic photograph representing the theme "${topic}" for a ${industry} context. ${styleConfig.promptPrefix}. Single main subject, clean uncluttered background, natural lighting. ${formatDesc}. Convey the idea through visuals only—no text in the image.`
  if (params.brandPrimaryColor && /^#[0-9A-Fa-f]{6}$/.test(params.brandPrimaryColor)) {
    scene += ` ${getMoodFromHex(params.brandPrimaryColor)}`
  }
  return `${NO_TEXT_BLOCK} ${scene} ${NO_TEXT_BLOCK}`
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
