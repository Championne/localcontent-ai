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

// Base instruction to avoid placeholders
const NO_PLACEHOLDERS = `
IMPORTANT: Never use placeholder text like [City Name], [Phone Number], [Address], [Date], etc.
If specific information is not provided, write around it naturally. For example:
- Instead of "located in [City Name]" write "in your local area" or "conveniently located nearby"
- Instead of "call [Phone Number]" write "give us a call" or "contact us today"
- Instead of "valid until [Date]" write "for a limited time" or "while supplies last"
Write complete, publication-ready content without any bracketed placeholders.`

const SYSTEM_PROMPTS: Record<ContentTemplate, string> = {
  'blog-post': `You are an expert content writer specializing in SEO-optimized blog posts for local businesses.
Your writing is engaging, informative, and naturally incorporates local SEO best practices.
Write in a conversational yet professional tone that builds trust with local customers.
Include relevant headers (using markdown ##), bullet points, and a clear call-to-action.
Focus on providing genuine value while subtly promoting the business.
${NO_PLACEHOLDERS}`,

  'social-post': `You are a social media expert for local businesses.
Create engaging, shareable content that connects with the local community.
Keep posts concise and impactful. Use relevant emojis sparingly (2-3 max).
Include appropriate hashtags (3-5) that mix branded, local, and industry tags.
Focus on building community engagement and showcasing local expertise.
${NO_PLACEHOLDERS}`,

  'gmb-post': `You are a Google Business Profile optimization expert.
Create posts that improve local search visibility and drive customer engagement.
Keep posts between 150-300 words with a clear structure.
Include a compelling hook, valuable information, and strong call-to-action.
Write in a friendly, approachable tone that encourages customers to visit or contact the business.
Use 2-3 relevant emojis to increase engagement.
${NO_PLACEHOLDERS}`,

  'email': `You are an email marketing specialist for local businesses.
Write compelling emails that nurture customer relationships and drive action.
Use a warm, personal tone while maintaining professionalism.
Structure: Subject line, greeting, valuable content, clear CTA.
Keep emails scannable with short paragraphs and bullet points where appropriate.
${NO_PLACEHOLDERS}`,

  'review-response': `You are a customer service expert helping local businesses respond to reviews.
Write thoughtful, personalized responses that show genuine appreciation.
For positive reviews: Thank sincerely, highlight specifics they mentioned, invite them back.
For negative reviews: Apologize genuinely, address concerns, offer to make it right offline.
Keep responses concise (50-100 words) but meaningful.
${NO_PLACEHOLDERS}`
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
- Ends with a clear call-to-action (like "Contact us today" or "Visit our website")
- Uses short paragraphs for readability

Remember: Do NOT use any placeholder text in brackets. Write complete, ready-to-publish content.`
      break

    case 'social-post':
      prompt += `

Write a social media post that:
- Has an attention-grabbing opening line (hook)
- Main content: 100-200 characters that provides value or sparks engagement
- 2-3 relevant emojis placed naturally
- Clear call-to-action
- 3-5 hashtags (mix of: branded, industry-specific, general)

Format:
[Hook/Opening]
[Main Content]
[Call-to-Action]
[Hashtags]

Remember: Do NOT use any placeholder text. Write ready-to-post content.`
      break

    case 'gmb-post':
      prompt += `

Write a Google Business Profile post (150-300 words) that:
- Opens with an attention-grabbing statement or question
- Provides valuable information about the topic
- Highlights what makes this business special
- Has a clear call-to-action (like "Call us today!" or "Stop by and visit!")
- Uses 2-3 emojis to increase visual appeal

Remember: Do NOT use placeholders like [Phone Number] or [Address]. Write naturally around any missing details.`
      break

    case 'email':
      prompt += `

Write a marketing email that includes:

**Subject Line:** (compelling, 40-60 characters, creates curiosity)

**Email Body:**
- Personalized greeting (use "Hi there" or similar if no name provided)
- Opening that connects with the reader
- 2-3 paragraphs of valuable content about the topic
- Key benefits or tips (use bullet points if appropriate)
- Clear, actionable CTA
- Warm sign-off from "The ${businessName} Team"

Keep the total body around 200-350 words. Make it scannable and ready to send.`
      break

    case 'review-response':
      prompt += `

Write a professional review response that:
- Thanks the customer genuinely
- References something positive about their experience
- Reinforces the business's commitment to quality
- Invites them to return
- Is warm and authentic (not corporate/robotic)
- 50-100 words maximum

Write as if responding to a 5-star review praising great service.`
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
