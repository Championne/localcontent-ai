import OpenAI from 'openai'
import {
  selectOptimalFramework,
  getFrameworkPromptBlock,
  type CampaignGoal,
  type FrameworkRecommendation,
} from '@/lib/content/framework-selector'

// Lazy-initialize OpenRouter client (OpenAI SDK compatible)
let openrouterClient: OpenAI | null = null

function getAIClient(): OpenAI {
  if (!openrouterClient) {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      throw new Error('No AI API key configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY.')
    }

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

function getModel(): string {
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.AI_MODEL || 'anthropic/claude-3-5-sonnet-20241022'
  }
  return process.env.OPENAI_MODEL || 'gpt-4o-mini'
}

export type ContentTemplate = 'blog-post' | 'social-post' | 'social-pack' | 'gmb-post' | 'email' | 'review-response'
export type GbpPostType = 'offer' | 'event' | 'update'

export interface GenerateContentParams {
  template: ContentTemplate
  businessName: string
  industry: string
  topic: string
  tone?: string
  location?: string
  additionalContext?: string
  maxTokens?: number
  // Branding (from Brand identity)
  tagline?: string | null
  defaultCtaPrimary?: string | null
  defaultCtaSecondary?: string | null
  seoKeywords?: string | null
  shortAbout?: string | null
  website?: string | null
  socialHandles?: string | null
  serviceAreas?: string | null
  // GBP-specific fields
  gbpPostType?: GbpPostType
  gbpExpiration?: string
  gbpEventDate?: string
  gbpEventTime?: string
  // Marketing framework selection
  campaignGoal?: CampaignGoal
}

export interface SocialPackResult {
  twitter: { content: string; charCount: number }
  facebook: { content: string; charCount: number }
  instagram: { content: string; hashtags: string; charCount: number }
  linkedin: { content: string; charCount: number }
  tiktok: { content: string; charCount: number }
  nextdoor: { content: string; charCount: number }
}

// Base instruction to avoid placeholders
const NO_PLACEHOLDERS = `
IMPORTANT: Never use placeholder text like [City Name], [Phone Number], [Address], [Date], etc.
If specific information is not provided, write around it naturally. For example:
- Instead of "located in [City Name]" write "in your local area" or "conveniently located nearby"
- Instead of "call [Phone Number]" write "give us a call" or "contact us today"
Write complete, publication-ready content without any bracketed placeholders.`

// GBP Post Type specific prompts - optimized for HIGH-INTENT searchers
const GBP_POST_TYPE_PROMPTS: Record<GbpPostType, string> = {
  offer: `You are creating a Google Business Profile OFFER post.

CRITICAL CONTEXT: People seeing this are ACTIVELY SEARCHING for this type of business on Google. They have HIGH INTENT to buy/book NOW.

Write for searchers ready to act:
- Lead with the BENEFIT and the OFFER prominently
- Include specific discount/deal details
- Create urgency with the expiration
- Keep it 150-250 characters (short, punchy, action-oriented)
- Use 2-3 emojis strategically (not excessive)
- End with clear action

CTA Button: "Get Offer" (Google will show this button)

GOOD EXAMPLE:
"🎁 20% OFF first visit! New customers welcome. Same-day appointments available. Offer ends Friday. Tap 'Get Offer' to claim!"

BAD EXAMPLE (don't write like this):
"We are excited to announce a special promotion for our valued customers! We're offering a discount on our services because we appreciate you..."

${NO_PLACEHOLDERS}`,

  event: `You are creating a Google Business Profile EVENT post.

CRITICAL CONTEXT: People seeing this are ACTIVELY SEARCHING for this type of business on Google. They have HIGH INTENT.

Write for searchers ready to act:
- Lead with WHAT and WHEN clearly upfront
- Highlight the key benefit/takeaway for attendees
- Create urgency (limited spots, free, exclusive)
- Keep it 150-250 characters
- Use 2-3 emojis strategically

CTA Button: "Book" (Google will show this button)

GOOD EXAMPLE:
"📅 FREE Workshop: Home Maintenance 101, Saturday, Feb 8 at 10am. Learn money-saving tips from our experts. Limited spots! Tap to reserve."

BAD EXAMPLE (don't write like this):
"We are pleased to invite you to join us for an exciting event that we have been planning..."

${NO_PLACEHOLDERS}`,

  update: `You are creating a Google Business Profile UPDATE post.

CRITICAL CONTEXT: People seeing this are ACTIVELY SEARCHING for this type of business on Google. They have HIGH INTENT.

Write for searchers ready to act:
- Lead with the most interesting/valuable information
- Focus on what matters to the CUSTOMER, not self-promotion
- Include a reason to act now
- Keep it 150-250 characters
- Use 2-3 emojis strategically

CTA Button: "Learn More" (Google will show this button)

GOOD EXAMPLE:
"✨ Now offering same-day appointments! No more waiting weeks. Quick, quality service when you need it. Tap to learn more or book today."

BAD EXAMPLE (don't write like this):
"We are thrilled to share some exciting news with our wonderful community! Our team has been working hard to..."

${NO_PLACEHOLDERS}`
}

const SYSTEM_PROMPTS: Record<string, string> = {
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

  'social-pack': `You are a social media expert who creates platform-optimized content for local businesses.
You will generate posts for 6 different platforms, each optimized for that platform's best practices.
Return your response in valid JSON format with the exact structure specified.
${NO_PLACEHOLDERS}`,

  // Default GMB prompt (used if no specific post type)
  'gmb-post': GBP_POST_TYPE_PROMPTS.update,

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

// Get the appropriate system prompt for GBP posts based on type
function getGbpSystemPrompt(postType?: GbpPostType): string {
  if (postType && GBP_POST_TYPE_PROMPTS[postType]) {
    return GBP_POST_TYPE_PROMPTS[postType]
  }
  return GBP_POST_TYPE_PROMPTS.update // Default to update
}

function buildPrompt(params: GenerateContentParams): string {
  const { 
    template, 
    businessName, 
    industry, 
    topic, 
    tone = 'professional',
    location,
    additionalContext,
    tagline,
    defaultCtaPrimary,
    defaultCtaSecondary,
    seoKeywords,
    gbpPostType,
    gbpExpiration,
    gbpEventDate,
    gbpEventTime
  } = params
  
  let prompt = `Create a ${template.replace('-', ' ')} for the following local business:

**Business Name:** ${businessName}
**Industry:** ${industry}
**Topic/Subject:** ${topic}
**Desired Tone:** ${tone}

**Language:** Write all content in the same language as the Topic/Subject above. If the topic is in Dutch, write entirely in Dutch; if in another language, write in that language. Only use English if the topic is in English.`

  if (location) {
    prompt += `\n**Location:** ${location} — mention naturally (e.g. "in [location]", "serving [location]").`
  }
  if (tagline) {
    prompt += `\n**Tagline (use in sign-off or when appropriate):** ${tagline}`
  }
  if (defaultCtaPrimary || defaultCtaSecondary) {
    const ctas = [defaultCtaPrimary, defaultCtaSecondary].filter(Boolean).join(' or ')
    prompt += `\n**Preferred call-to-action:** Prefer these CTAs where relevant: ${ctas}`
  }
  if (seoKeywords) {
    prompt += `\n**SEO keywords (weave naturally into headings/body):** ${seoKeywords}`
  }
  if (params.shortAbout) {
    prompt += `\n**About the business (use for voice and key points):** ${params.shortAbout}`
  }
  if (params.website) {
    prompt += `\n**Website (use for "Visit our site" / "Learn more" where relevant):** ${params.website}`
  }
  if (params.socialHandles) {
    prompt += `\n**Social handles (use in sign-off or "Follow us" where fitting):** ${params.socialHandles}`
  }
  if (params.serviceAreas) {
    prompt += `\n**Service areas (cities/neighbourhoods served — mention when relevant for local intent):** ${params.serviceAreas}`
  }
  if (additionalContext) {
    prompt += `\n**Additional Context:** ${additionalContext}`
  }

  // ── Marketing framework injection ──────────────────────────────────
  const frameworkRec = selectOptimalFramework({
    topic,
    industry,
    contentType: template,
    campaignGoal: params.campaignGoal,
  })
  const frameworkBlock = getFrameworkPromptBlock(frameworkRec)
  prompt += `\n\n${frameworkBlock}`

  // Store recommendation on params so callers can retrieve it
  ;(params as GenerateContentParams & { _frameworkRec?: FrameworkRecommendation })._frameworkRec = frameworkRec

  switch (template) {
    case 'blog-post':
      prompt += `

Write a comprehensive, SEO-optimized blog post (600-800 words) that:
- Has an engaging, keyword-rich title
- Opens with a hook that addresses the reader's needs
- Includes 3-4 main sections with descriptive headers (##)
- Provides actionable tips, insights, or valuable information
- Naturally mentions the business name 2-3 times (not forced)
- Ends with a clear call-to-action${defaultCtaPrimary ? ` (prefer: "${defaultCtaPrimary}" or "${defaultCtaSecondary || 'Contact us'}")` : ' (e.g. "Contact us today" or "Visit our website")'}
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
      // Build GBP-specific prompt based on post type
      if (gbpPostType === 'offer') {
        prompt += `

**Post Type:** Special Offer
**Offer Expires:** ${gbpExpiration || 'Limited time'}
**CTA Button:** Get Offer

Write a Google Business Profile OFFER post (150-250 characters) that:
- Opens with the offer/discount prominently
- Creates urgency with the expiration date
- Tells them exactly what to do next
- Uses 2-3 emojis
- Is direct and benefit-focused (remember: searchers are ready to buy!)

Write short and punchy. No fluff. Every word should drive action.`
      } else if (gbpPostType === 'event') {
        prompt += `

**Post Type:** Event
**Event Date:** ${gbpEventDate || 'Coming soon'}
**Event Time:** ${gbpEventTime || ''}
**CTA Button:** Book

Write a Google Business Profile EVENT post (150-250 characters) that:
- States WHAT and WHEN clearly upfront
- Highlights the key benefit for attendees
- Creates urgency (limited spots, free, etc.)
- Uses 2-3 emojis
- Ends with clear call to reserve/book

Write short and punchy. Lead with the event details.`
      } else {
        // Update/News type
        prompt += `

**Post Type:** Update/News
**CTA Button:** Learn More

Write a Google Business Profile UPDATE post (150-250 characters) that:
- Leads with the most newsworthy/interesting information
- Focuses on what matters to the customer
- Includes a reason to learn more or act
- Uses 2-3 emojis
- Is helpful and informative, not salesy

Write short and punchy. Focus on customer benefit.`
      }
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

function buildSocialPackPrompt(params: GenerateContentParams): string {
  const { 
    businessName, 
    industry, 
    topic, 
    tone = 'professional',
    location,
    additionalContext,
    tagline,
    defaultCtaPrimary,
    defaultCtaSecondary,
    seoKeywords
  } = params

  let context = `Create social media posts for a local business:

**Business Name:** ${businessName}
**Industry:** ${industry}
**Topic/Subject:** ${topic}
**Desired Tone:** ${tone}

**Language:** Write all posts in the same language as the Topic/Subject above. If the topic is in Dutch, write entirely in Dutch; if in another language, write in that language. Only use English if the topic is in English.`

  if (location) {
    context += `\n**Location:** ${location} — mention naturally where it fits.`
  }
  if (tagline) {
    context += `\n**Tagline (use in sign-off or bio where fitting):** ${tagline}`
  }
  if (defaultCtaPrimary || defaultCtaSecondary) {
    const ctas = [defaultCtaPrimary, defaultCtaSecondary].filter(Boolean).join(' or ')
    context += `\n**Preferred CTA:** ${ctas}`
  }
  if (seoKeywords) {
    context += `\n**SEO / hashtag hints:** Consider these for hashtags or captions: ${seoKeywords}`
  }
  if (params.shortAbout) {
    context += `\n**About the business (voice and key points):** ${params.shortAbout}`
  }
  if (params.website) {
    context += `\n**Website (for "Visit our site" / "Learn more"):** ${params.website}`
  }
  if (params.socialHandles) {
    context += `\n**Social handles (use in sign-off or "Follow us @..."):** ${params.socialHandles}`
  }
  if (params.serviceAreas) {
    context += `\n**Service areas (cities/neighbourhoods served — mention where relevant):** ${params.serviceAreas}`
  }
  if (additionalContext) {
    context += `\n**Additional Context:** ${additionalContext}`
  }

  // ── Marketing framework injection for social pack ──────────────────
  const socialFrameworkRec = selectOptimalFramework({
    topic,
    industry,
    contentType: 'social-pack',
    campaignGoal: params.campaignGoal,
  })
  const socialFrameworkBlock = getFrameworkPromptBlock(socialFrameworkRec)
  context += `\n\n${socialFrameworkBlock}`

  // Store recommendation so callers can retrieve it
  ;(params as GenerateContentParams & { _frameworkRec?: FrameworkRecommendation })._frameworkRec = socialFrameworkRec

  return `${context}

Generate optimized posts for ALL 6 platforms. Each post must be perfectly tailored to the platform's best practices:

1. **Twitter/X** (71-100 characters optimal)
   - Punchy, direct, attention-grabbing
   - Maximum 3 hashtags
   - No fluff, every word counts

2. **Facebook** (40-80 characters optimal)
   - Conversational, friendly tone
   - NO hashtags (they hurt reach on Facebook)
   - Encourage engagement (questions work well)

3. **Instagram** 
   - Short visible caption (138 characters before "...more")
   - Full caption can be 300-500 characters with storytelling
   - 15-30 hashtags (mix of popular and niche) - put these in a separate "hashtags" field
   - Visual/lifestyle focused language
   - Use 3-5 emojis

4. **LinkedIn** (150 characters visible before "...see more")
   - Professional, value-driven tone
   - Industry-specific insights
   - 3-5 professional hashtags integrated in content
   - Thought leadership angle

5. **TikTok** (100-150 characters)
   - Hook-first, casual/trendy language
   - Gen-Z friendly but authentic
   - 3-5 trending hashtags
   - Use 2-3 emojis

6. **Nextdoor** (200-400 characters)
   - Neighborly, community-focused tone
   - NO hashtags (Nextdoor doesn't use them)
   - Local/neighborhood angle
   - Personal, helpful approach

Return your response as a valid JSON object with this EXACT structure (no markdown, just JSON):
{
  "twitter": { "content": "your twitter post here" },
  "facebook": { "content": "your facebook post here" },
  "instagram": { "content": "your instagram caption here", "hashtags": "#hashtag1 #hashtag2 ..." },
  "linkedin": { "content": "your linkedin post here" },
  "tiktok": { "content": "your tiktok caption here" },
  "nextdoor": { "content": "your nextdoor post here" }
}

IMPORTANT: Return ONLY the JSON object, no explanation or markdown code blocks.`
}

export async function generateContent(params: GenerateContentParams): Promise<string> {
  const { maxTokens = 1500, template, gbpPostType } = params
  
  const client = getAIClient()
  const model = getModel()
  
  // Use GBP-specific system prompt if it's a GMB post
  const systemPrompt = template === 'gmb-post' 
    ? getGbpSystemPrompt(gbpPostType)
    : SYSTEM_PROMPTS[template]
    
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

export interface ContentWithFramework {
  content: string
  framework: string
  frameworkReasoning: string
  frameworkConfidence: number
  awarenessLevel: string
}

/** Like generateContent but also returns framework metadata. */
export async function generateContentWithFramework(params: GenerateContentParams): Promise<ContentWithFramework> {
  // Run framework selection based on actual content context
  const { selectOptimalFramework } = await import('@/lib/content/framework-selector')
  const rec = selectOptimalFramework({
    topic: params.topic,
    industry: params.industry,
    contentType: params.template || 'social-post',
    campaignGoal: params.campaignGoal,
  })
  const content = await generateContent(params)
  return {
    content,
    framework: rec.framework,
    frameworkReasoning: rec.reasoning,
    frameworkConfidence: rec.confidence,
    awarenessLevel: rec.awarenessLevel,
  }
}

export interface SocialPackWithFramework {
  pack: SocialPackResult
  framework: string
  frameworkReasoning: string
  frameworkConfidence: number
  awarenessLevel: string
}

/** Like generateSocialPack but also returns framework metadata. */
export async function generateSocialPackWithFramework(params: Omit<GenerateContentParams, 'template'>): Promise<SocialPackWithFramework> {
  // Run framework selection based on actual content context
  const { selectOptimalFramework } = await import('@/lib/content/framework-selector')
  const rec = selectOptimalFramework({
    topic: params.topic,
    industry: params.industry,
    contentType: 'social-pack',
    campaignGoal: params.campaignGoal,
  })
  const pack = await generateSocialPack(params)
  return {
    pack,
    framework: rec.framework,
    frameworkReasoning: rec.reasoning,
    frameworkConfidence: rec.confidence,
    awarenessLevel: rec.awarenessLevel,
  }
}

export async function generateSocialPack(params: Omit<GenerateContentParams, 'template'>): Promise<SocialPackResult> {
  const client = getAIClient()
  const model = getModel()
  const systemPrompt = SYSTEM_PROMPTS['social-pack']
  const userPrompt = buildSocialPackPrompt({ ...params, template: 'social-pack' })

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    
    let parsed
    try {
      const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleanJson)
    } catch {
      console.error('Failed to parse social pack JSON:', responseText)
      throw new Error('Failed to parse AI response')
    }

    return {
      twitter: {
        content: parsed.twitter?.content || '',
        charCount: (parsed.twitter?.content || '').length
      },
      facebook: {
        content: parsed.facebook?.content || '',
        charCount: (parsed.facebook?.content || '').length
      },
      instagram: {
        content: parsed.instagram?.content || '',
        hashtags: parsed.instagram?.hashtags || '',
        charCount: (parsed.instagram?.content || '').length
      },
      linkedin: {
        content: parsed.linkedin?.content || '',
        charCount: (parsed.linkedin?.content || '').length
      },
      tiktok: {
        content: parsed.tiktok?.content || '',
        charCount: (parsed.tiktok?.content || '').length
      },
      nextdoor: {
        content: parsed.nextdoor?.content || '',
        charCount: (parsed.nextdoor?.content || '').length
      }
    }
  } catch (error) {
    console.error('AI API error:', error)
    throw new Error('Failed to generate social pack with AI')
  }
}

export async function generateContentStream(params: GenerateContentParams) {
  const { maxTokens = 1500, template, gbpPostType } = params
  
  const client = getAIClient()
  const model = getModel()
  
  const systemPrompt = template === 'gmb-post' 
    ? getGbpSystemPrompt(gbpPostType)
    : SYSTEM_PROMPTS[template]
    
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

export const isOpenAIConfigured = isAIConfigured
