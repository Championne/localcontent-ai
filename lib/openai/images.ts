import OpenAI from 'openai'

// Image style definitions
export const IMAGE_STYLES = {
  promotional: {
    name: 'Promotional',
    description: 'Bold, eye-catching graphics for sales and offers',
    keywords: ['sale', 'discount', 'off', 'special', 'deal', 'offer', 'limited', 'save', 'price', 'free'],
    promptPrefix: 'Bold promotional marketing graphic with vibrant colors, clean modern design, professional advertising style, no text'
  },
  professional: {
    name: 'Professional',
    description: 'Clean, polished images for tips and updates',
    keywords: ['tips', 'how to', 'guide', 'advice', 'learn', 'info', 'update', 'news', 'service'],
    promptPrefix: 'Professional business photography style, clean and polished, high quality corporate imagery, no text'
  },
  friendly: {
    name: 'Friendly',
    description: 'Warm, approachable illustrations',
    keywords: ['thank', 'welcome', 'community', 'team', 'family', 'customer', 'appreciate', 'love'],
    promptPrefix: 'Warm friendly illustration style, approachable and welcoming, soft colors, cheerful mood, no text'
  },
  seasonal: {
    name: 'Seasonal',
    description: 'Holiday and seasonal themed graphics',
    keywords: ['holiday', 'christmas', 'summer', 'spring', 'fall', 'winter', 'new year', 'valentine', 'easter', 'thanksgiving', 'halloween'],
    promptPrefix: 'Festive seasonal themed graphic, celebratory mood, holiday decorations, no text'
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
  
  // Create a descriptive prompt that captures the essence without including text
  const prompt = `${styleConfig.promptPrefix}. 
Create an image representing "${topic}" for a ${industry} business called "${businessName}". 
The image should be suitable for ${contentType === 'blog-post' ? 'a blog header' : contentType === 'email' ? 'an email newsletter header' : 'social media marketing'}.
Style: ${styleConfig.name} - ${styleConfig.description}.
Important: Do NOT include any text, words, letters, or numbers in the image. The image should be purely visual.
${formatDesc}, high quality, vibrant and engaging.`

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
      style: params.style === 'friendly' ? 'natural' : 'vivid',
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
      revisedPrompt: revisedPrompt
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
