import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export interface ContentGenerationRequest {
  templateType: 'blog' | 'social' | 'gmb' | 'email'
  businessName: string
  businessType: string
  location: string
  keywords: string[]
  tone?: 'professional' | 'friendly' | 'casual' | 'authoritative'
  topic?: string
  additionalContext?: string
}

export interface GeneratedContent {
  title: string
  body: string
  hashtags?: string[]
  callToAction?: string
  seoDescription?: string
}

const SYSTEM_PROMPTS = {
  blog: `You are an expert content writer for local businesses. Create engaging, SEO-optimized blog posts that:
- Include local references and community connections
- Use natural keyword placement
- Have clear structure with headings
- Include a compelling call-to-action
- Sound authentic to a local business owner`,

  social: `You are a social media expert for local businesses. Create engaging posts that:
- Are concise and attention-grabbing
- Include relevant hashtags
- Encourage engagement (questions, CTAs)
- Feel authentic and local
- Are optimized for the platform`,

  gmb: `You are a Google Business Profile expert. Create posts that:
- Are under 1500 characters
- Include a clear call-to-action
- Highlight local relevance
- Are professional but approachable
- Encourage customer action`,

  email: `You are an email marketing expert for local businesses. Create emails that:
- Have compelling subject lines
- Are personalized and warm
- Include clear value propositions
- Have strong calls-to-action
- Feel like they're from a trusted local business`,
}

export async function generateContent(
  request: ContentGenerationRequest
): Promise<GeneratedContent> {
  const { templateType, businessName, businessType, location, keywords, tone = 'friendly', topic, additionalContext } = request

  const systemPrompt = SYSTEM_PROMPTS[templateType]

  const userPrompt = `Create a ${templateType === 'blog' ? 'blog post' : templateType === 'social' ? 'social media post' : templateType === 'gmb' ? 'Google Business Profile post' : 'marketing email'} for:

Business: ${businessName}
Type: ${businessType}
Location: ${location}
Keywords to include: ${keywords.join(', ')}
Tone: ${tone}
${topic ? `Topic: ${topic}` : ''}
${additionalContext ? `Additional context: ${additionalContext}` : ''}

Return your response in the following JSON format:
{
  "title": "The title or headline",
  "body": "The main content",
  "hashtags": ["relevant", "hashtags"],
  "callToAction": "A clear call to action",
  "seoDescription": "A meta description for SEO (if blog post)"
}`

  const { text } = await generateText({
    model: openai('gpt-4-turbo-preview'),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
    maxTokens: 2000,
  })

  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    return JSON.parse(jsonMatch[0]) as GeneratedContent
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      title: topic || `Content for ${businessName}`,
      body: text,
      hashtags: keywords.map(k => k.replace(/\s+/g, '')),
      callToAction: `Contact ${businessName} today!`,
    }
  }
}

export async function generateContentVariations(
  request: ContentGenerationRequest,
  count: number = 3
): Promise<GeneratedContent[]> {
  const variations: GeneratedContent[] = []
  
  for (let i = 0; i < count; i++) {
    const content = await generateContent({
      ...request,
      additionalContext: `${request.additionalContext || ''} (Variation ${i + 1} of ${count} - make it unique)`,
    })
    variations.push(content)
  }
  
  return variations
}
