import OpenAI from 'openai'

// Image style definitions - optimized for realistic, authentic-looking images WITHOUT TEXT
// NOTE: DALL-E often ignores "no text" instructions - we use multiple reinforcement techniques
export const IMAGE_STYLES = {
  promotional: {
    name: 'Promotional',
    description: 'Clean marketing images for sales and offers',
    keywords: ['sale', 'discount', 'off', 'special', 'deal', 'offer', 'limited', 'save', 'price', 'free'],
    promptPrefix: 'Clean marketing photograph of physical objects only. Product photography with shallow depth of field. All surfaces are blank and unmarked. No signage exists in this scene'
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
}

export interface GenerateImageResult {
  url: string
  style: ImageStyle
  size: string
  revisedPrompt?: string
  fullPrompt?: string
}

// Build the image generation prompt
function buildImagePrompt(params: GenerateImageParams): string {
  const { topic, businessName, industry, style, contentType } = params
  const styleConfig = IMAGE_STYLES[style]
  const imageSize = getImageSizeForContentType(contentType || 'social-post')
  
  // Determine format description based on size
  let formatDesc = 'Square format'
  if (imageSize === '1792x1024') {
    formatDesc = 'Wide landscape format (16:9 aspect ratio)'
  } else if (imageSize === '1024x1792') {
    formatDesc = 'Tall portrait format (9:16 aspect ratio)'
  }
  
  // Create a descriptive prompt - using positive framing (what TO show) rather than negatives
  // DALL-E responds better to "blank surfaces" than "no text"
  const prompt = `${styleConfig.promptPrefix}.

Realistic photograph representing "${topic}" for a ${industry} business.

SCENE REQUIREMENTS:
- One main subject with clean, uncluttered background
- All walls, surfaces, and objects are BLANK and UNMARKED
- Any signs in scene are EMPTY wooden boards or BLANK metal plates
- All clothing is PLAIN SOLID COLORS with no prints or logos
- All packaging and products show BLANK LABELS (solid color only)
- Computer and phone screens are OFF or show abstract colored shapes only
- Books show BLANK SPINES (solid colors)

The scene exists in a world where written language does not exist. Everything is communicated through colors, shapes, and gestures instead.

${formatDesc}. Natural lighting, authentic photograph style.`

  return prompt
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
