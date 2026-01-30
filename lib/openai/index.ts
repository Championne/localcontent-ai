import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type ContentTemplate = 'blog-post' | 'social-post' | 'gmb-post' | 'email' | 'review-response'

export interface GenerateContentParams {
  template: ContentTemplate
  businessName: string
  industry: string
  topic: string
  tone?: string
  additionalContext?: string
  maxTokens?: number
}

const SYSTEM_PROMPTS: Record<ContentTemplate, string> = {
  'blog-post': `You are an expert content writer specializing in SEO-optimized blog posts for local businesses. 
Your writing is engaging, informative, and naturally incorporates local SEO best practices.
Write in a conversational yet professional tone that builds trust with local customers.
Include relevant headers, bullet points, and a clear call-to-action.`,

  'social-post': `You are a social media expert for local businesses.
Create engaging, shareable content that connects with the local community.
Keep posts concise, use relevant emojis sparingly, and include appropriate hashtags.
Focus on building community engagement and showcasing local expertise.`,

  'gmb-post': `You are a Google Business Profile optimization expert.
Create posts that improve local search visibility and drive customer engagement.
Keep posts between 100-300 words, include a clear call-to-action, and focus on local relevance.
Write in a friendly, approachable tone that encourages customers to visit or contact the business.`,

  'email': `You are an email marketing specialist for local businesses.
Write compelling emails that nurture customer relationships and drive action.
Use a warm, personal tone while maintaining professionalism.
Include a clear subject line, engaging opening, valuable content, and strong call-to-action.`,

  'review-response': `You are a customer service expert helping local businesses respond to reviews.
Write thoughtful, personalized responses that show genuine appreciation and address concerns professionally.
Keep responses concise but meaningful, and always invite customers back.`
}

function buildPrompt(params: GenerateContentParams): string {
  const { template, businessName, industry, topic, tone = 'professional', additionalContext } = params
  
  let prompt = `Create a ${template.replace('-', ' ')} for the following local business:

Business Name: ${businessName}
Industry: ${industry}
Topic/Subject: ${topic}
Desired Tone: ${tone}
`

  if (additionalContext) {
    prompt += `\nAdditional Context: ${additionalContext}`
  }

  switch (template) {
    case 'blog-post':
      prompt += `\n\nWrite a comprehensive blog post (600-800 words) that:
- Has an engaging title and introduction
- Includes 3-4 main sections with headers
- Provides actionable tips or insights
- Naturally mentions the business name 2-3 times
- Ends with a clear call-to-action
- Is optimized for local SEO`
      break

    case 'social-post':
      prompt += `\n\nWrite a social media post that:
- Is 150-250 characters for the main text
- Includes 3-5 relevant hashtags
- Has an engaging hook
- Includes a call-to-action
- Uses 1-2 relevant emojis`
      break

    case 'gmb-post':
      prompt += `\n\nWrite a Google Business Profile post that:
- Is 150-300 words
- Has an attention-grabbing opening
- Highlights the business's local expertise
- Includes a clear call-to-action (call, visit, learn more)
- Uses 2-3 relevant emojis`
      break

    case 'email':
      prompt += `\n\nWrite a marketing email that:
- Has a compelling subject line (include it at the start)
- Opens with a personal greeting
- Provides valuable information about the topic
- Includes 2-3 key benefits or tips
- Ends with a clear call-to-action
- Is 200-400 words`
      break

    case 'review-response':
      prompt += `\n\nWrite a review response that:
- Thanks the customer by name if provided
- Acknowledges their specific feedback
- Is warm and genuine
- Invites them to return
- Is 50-100 words`
      break
  }

  return prompt
}

export async function generateContent(params: GenerateContentParams): Promise<string> {
  const { template, maxTokens = 1000 } = params
  
  const systemPrompt = SYSTEM_PROMPTS[template]
  const userPrompt = buildPrompt(params)

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate content with AI')
  }
}

export async function generateContentStream(params: GenerateContentParams) {
  const { template, maxTokens = 1000 } = params
  
  const systemPrompt = SYSTEM_PROMPTS[template]
  const userPrompt = buildPrompt(params)

  const stream = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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

export default openai
