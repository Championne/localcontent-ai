import OpenAI from 'openai'

// Lazy-initialize OpenRouter client (OpenAI SDK compatible)
let openrouterClient: OpenAI | null = null

function getAIClient(): OpenAI {
  if (!openrouterClient) {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      throw new Error('No AI API key configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY.')
    }

    // Use OpenRouter if OPENROUTER_API_KEY is set, otherwise fall back to OpenAI
    if (process.env.OPENROUTER_API_KEY) {
      openrouterClient = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://geospark.ai',
          'X-Title': 'GeoSpark',
        },
      })
    } else {
      openrouterClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    }
  }
  return openrouterClient
}

// Get the appropriate model based on configuration
function getModel(): string {
  // If using OpenRouter, prefer Claude
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.AI_MODEL || 'anthropic/claude-3-5-sonnet-20241022'
  }
  // Fall back to OpenAI model
  return process.env.OPENAI_MODEL || 'gpt-4o-mini'
}

export type ContentTemplate = 'blog-post' | 'social-post' | 'gmb-post' | 'email' | 'review-response'

export interface GenerateContentParams {
  template: ContentTemplate
  businessName: string
  industry: string
  topic: string
  tone?: string
  location?: string
  additionalContext?: string
  maxTokens?: number
}

const SYSTEM_PROMPTS: Record<ContentTemplate, string> = {
  'blog-post': `You are an expert content writer specializing in SEO-optimized blog posts for local businesses.
Your writing is engaging, informative, and naturally incorporates local SEO best practices.
Write in a conversational yet professional tone that builds trust with local customers.
Include relevant headers (using markdown ##), bullet points, and a clear call-to-action.
Focus on providing genuine value while subtly promoting the business.`,

  'social-post': `You are a social media expert for local businesses.
Create engaging, shareable content that connects with the local community.
Keep posts concise and impactful. Use relevant emojis sparingly (2-3 max).
Include appropriate hashtags (3-5) that mix branded, local, and industry tags.
Focus on building community engagement and showcasing local expertise.`,

  'gmb-post': `You are a Google Business Profile optimization expert.
Create posts that improve local search visibility and drive customer engagement.
Keep posts between 150-300 words with a clear structure.
Include a compelling hook, valuable information, and strong call-to-action.
Write in a friendly, approachable tone that encourages customers to visit or contact the business.
Use 2-3 relevant emojis to increase engagement.`,

  'email': `You are an email marketing specialist for local businesses.
Write compelling emails that nurture customer relationships and drive action.
Use a warm, personal tone while maintaining professionalism.
Structure: Subject line, greeting, valuable content, clear CTA.
Keep emails scannable with short paragraphs and bullet points where appropriate.`,

  'review-response': `You are a customer service expert helping local businesses respond to reviews.
Write thoughtful, personalized responses that show genuine appreciation.
For positive reviews: Thank sincerely, highlight specifics they mentioned, invite them back.
For negative reviews: Apologize genuinely, address concerns, offer to make it right offline.
Keep responses concise (50-100 words) but meaningful.`
}

function buildPrompt(params: GenerateContentParams): string {
  const { 
    template, 
    businessName, 
    industry, 
    topic, 
    tone = 'professional',
    location,
    additionalContext 
  } = params
  
  let prompt = `Create a ${template.replace('-', ' ')} for the following local business:

**Business Name:** ${businessName}
**Industry:** ${industry}
**Topic/Subject:** ${topic}
**Desired Tone:** ${tone}`

  if (location) {
    prompt += `\n**Location:** ${location}`
  }

  if (additionalContext) {
    prompt += `\n**Additional Context:** ${additionalContext}`
  }

  switch (template) {
    case 'blog-post':
      prompt += `

Write a comprehensive, SEO-optimized blog post (600-800 words) that:
- Has an engaging, keyword-rich title
- Opens with a hook that addresses the reader's needs
- Includes 3-4 main sections with descriptive headers (##)
- Provides actionable tips, insights, or valuable information
- Naturally mentions the business name 2-3 times (not forced)
- Incorporates local references where relevant
- Ends with a clear call-to-action
- Uses short paragraphs for readability

Output the content in clean markdown format.`
      break

    case 'social-post':
      prompt += `

Write a social media post that:
- Has an attention-grabbing opening line (hook)
- Main content: 100-200 characters that provides value or sparks engagement
- 2-3 relevant emojis placed naturally
- Clear call-to-action (question, invitation, or prompt)
- 3-5 hashtags (mix of: #LocalBusiness, industry-specific, location-based)

Format:
[Hook/Opening]
[Main Content]
[Call-to-Action]
[Hashtags]`
      break

    case 'gmb-post':
      prompt += `

Write a Google Business Profile post (150-300 words) that:
- Opens with an attention-grabbing statement or question
- Provides valuable information about the topic
- Highlights what makes this business special
- Includes local relevance (community, neighborhood, local expertise)
- Has a clear call-to-action (Call Now, Visit Us, Learn More, Book Today)
- Uses 2-3 emojis to increase visual appeal
- Is optimized for local search discovery`
      break

    case 'email':
      prompt += `

Write a marketing email that includes:

**Subject Line:** (compelling, 40-60 characters, creates curiosity)

**Email Body:**
- Personalized greeting
- Opening that connects with the reader
- 2-3 paragraphs of valuable content about the topic
- Key benefits or tips (use bullet points if appropriate)
- Clear, actionable CTA button text suggestion
- Warm sign-off

Keep the total body around 200-350 words. Make it scannable.`
      break

    case 'review-response':
      prompt += `

Write a professional review response that:
- Thanks the customer genuinely
- References something specific from typical customer feedback
- Reinforces the business's commitment to quality
- Invites them to return or stay in touch
- Is warm and authentic (not corporate/robotic)
- 50-100 words maximum`
      break
  }

  return prompt
}

export async function generateContent(params: GenerateContentParams): Promise<string> {
  const { maxTokens = 1500 } = params
  
  const client = getAIClient()
  const model = getModel()
  const systemPrompt = SYSTEM_PROMPTS[params.template]
  const userPrompt = buildPrompt(params)

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('AI API error:', error)
    throw new Error('Failed to generate content with AI')
  }
}

export async function generateContentStream(params: GenerateContentParams) {
  const { maxTokens = 1500 } = params
  
  const client = getAIClient()
  const model = getModel()
  const systemPrompt = SYSTEM_PROMPTS[params.template]
  const userPrompt = buildPrompt(params)

  const stream = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
    stream: true,
  })

  return stream
}

export function isAIConfigured(): boolean {
  return !!(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY)
}

// Keep backward compatibility
export const isOpenAIConfigured = isAIConfigured
