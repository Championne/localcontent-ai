import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

const SYSTEM_PROMPTS: Record<string, string> = {
  blog: `You are an expert content writer for local businesses. Create engaging, SEO-optimized blog posts that:
- Include local references and community connections
- Use natural keyword placement
- Have clear structure with headings
- Include a compelling call-to-action
- Sound authentic to a local business owner
Return JSON: {"title": "", "body": "", "seoDescription": "", "callToAction": ""}`,

  social: `You are a social media expert for local businesses. Create engaging posts that:
- Are concise and attention-grabbing (under 280 chars for main text)
- Include relevant hashtags
- Encourage engagement
- Feel authentic and local
Return JSON: {"title": "", "body": "", "hashtags": [], "callToAction": ""}`,

  gmb: `You are a Google Business Profile expert. Create posts that:
- Are under 1500 characters
- Include a clear call-to-action
- Highlight local relevance
- Are professional but approachable
Return JSON: {"title": "", "body": "", "callToAction": ""}`,

  email: `You are an email marketing expert. Create emails that:
- Have compelling subject lines
- Are personalized and warm
- Include clear value propositions
- Have strong calls-to-action
Return JSON: {"title": "Subject line", "body": "", "callToAction": ""}`,
}

export async function generateContent(
  request: ContentGenerationRequest
): Promise<GeneratedContent> {
  const { templateType, businessName, businessType, location, keywords, tone = 'friendly', topic, additionalContext } = request

  const systemPrompt = SYSTEM_PROMPTS[templateType]

  const userPrompt = `Create content for:
Business: ${businessName}
Type: ${businessType}
Location: ${location}
Keywords: ${keywords.join(', ')}
Tone: ${tone}
${topic ? `Topic: ${topic}` : ''}
${additionalContext ? `Context: ${additionalContext}` : ''}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })

  const responseText = completion.choices[0]?.message?.content || '{}'
  
  try {
    return JSON.parse(responseText) as GeneratedContent
  } catch {
    return {
      title: topic || `Content for ${businessName}`,
      body: responseText,
      hashtags: keywords.map(k => k.replace(/\s+/g, '')),
      callToAction: `Contact ${businessName} today!`,
    }
  }
}

// Streaming version for real-time generation
export async function* generateContentStream(
  request: ContentGenerationRequest
): AsyncGenerator<string> {
  const { templateType, businessName, businessType, location, keywords, tone = 'friendly', topic, additionalContext } = request

  const systemPrompt = SYSTEM_PROMPTS[templateType].replace('Return JSON:', 'Write naturally:')

  const userPrompt = `Create content for:
Business: ${businessName}
Type: ${businessType}  
Location: ${location}
Keywords: ${keywords.join(', ')}
Tone: ${tone}
${topic ? `Topic: ${topic}` : ''}
${additionalContext ? `Context: ${additionalContext}` : ''}`

  const stream = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      yield content
    }
  }
}

// Generate multiple variations
export async function generateVariations(
  request: ContentGenerationRequest,
  count: number = 3
): Promise<GeneratedContent[]> {
  const variations: GeneratedContent[] = []
  
  for (let i = 0; i < count; i++) {
    const content = await generateContent({
      ...request,
      additionalContext: `${request.additionalContext || ''} Variation ${i + 1}/${count} - make it unique.`,
    })
    variations.push(content)
  }
  
  return variations
}
