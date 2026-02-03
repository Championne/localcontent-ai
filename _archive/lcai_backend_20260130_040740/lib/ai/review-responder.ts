import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ReviewData {
  reviewerName: string
  starRating: number // 1-5
  reviewText: string
  businessName: string
  businessType: string
}

export interface GeneratedResponse {
  response: string
  tone: string
  sentiment: 'positive' | 'neutral' | 'negative'
  suggestions?: string[]
}

const RESPONSE_PROMPTS: Record<string, string> = {
  positive: `You are a friendly business owner responding to a positive review. Be:
- Genuinely grateful (not generic "thank you")
- Personal - reference specific things they mentioned
- Warm and inviting for future visits
- Brief but heartfelt (2-4 sentences)
Return JSON: {"response": "", "tone": "grateful"}`,

  neutral: `You are a professional business owner responding to a neutral/mixed review. Be:
- Appreciative of their feedback
- Address any concerns mentioned constructively
- Highlight your commitment to improvement
- Invite them to give you another chance
- Professional but warm (3-5 sentences)
Return JSON: {"response": "", "tone": "professional", "suggestions": ["internal improvement suggestions"]}`,

  negative: `You are a empathetic business owner responding to a negative review. Be:
- Apologetic without being defensive
- Take responsibility where appropriate
- Offer to make things right (specific action if possible)
- Take the conversation offline if needed ("please contact us at...")
- Show you genuinely care about their experience
- Professional and solution-focused (4-6 sentences)
Return JSON: {"response": "", "tone": "apologetic", "suggestions": ["internal improvement suggestions"]}`,
}

function getSentiment(rating: number): 'positive' | 'neutral' | 'negative' {
  if (rating >= 4) return 'positive'
  if (rating >= 3) return 'neutral'
  return 'negative'
}

export async function generateReviewResponse(
  review: ReviewData
): Promise<GeneratedResponse> {
  const sentiment = getSentiment(review.starRating)
  const systemPrompt = RESPONSE_PROMPTS[sentiment]

  const userPrompt = `Generate a response for this review:

Business: ${review.businessName} (${review.businessType})
Reviewer: ${review.reviewerName}
Rating: ${review.starRating}/5 stars
Review: "${review.reviewText}"

The response should feel personal and authentic to a local business owner.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  })

  const responseText = completion.choices[0]?.message?.content || '{}'
  
  try {
    const parsed = JSON.parse(responseText)
    return {
      response: parsed.response,
      tone: parsed.tone || sentiment,
      sentiment,
      suggestions: parsed.suggestions,
    }
  } catch {
    return {
      response: responseText,
      tone: sentiment,
      sentiment,
    }
  }
}

// Generate multiple response options
export async function generateResponseOptions(
  review: ReviewData,
  count: number = 3
): Promise<GeneratedResponse[]> {
  const sentiment = getSentiment(review.starRating)
  
  const tones = sentiment === 'positive' 
    ? ['grateful', 'enthusiastic', 'warm']
    : sentiment === 'neutral'
    ? ['professional', 'helpful', 'understanding']
    : ['apologetic', 'solution-focused', 'empathetic']

  const responses: GeneratedResponse[] = []
  
  for (let i = 0; i < count; i++) {
    const tone = tones[i % tones.length]
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: `You are a ${tone} business owner responding to a ${sentiment} review. 
Be authentic and personal. Reference specific details from their review.
Keep it concise (2-5 sentences).
Return JSON: {"response": "", "tone": "${tone}"}` 
        },
        { 
          role: 'user', 
          content: `Business: ${review.businessName} (${review.businessType})
Reviewer: ${review.reviewerName}
Rating: ${review.starRating}/5
Review: "${review.reviewText}"` 
        },
      ],
      temperature: 0.8 + (i * 0.05), // Slight variation
      max_tokens: 400,
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}')
    responses.push({
      response: parsed.response,
      tone: parsed.tone || tone,
      sentiment,
    })
  }

  return responses
}

// Analyze review sentiment and extract key topics
export async function analyzeReview(
  reviewText: string
): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number
  topics: string[]
  emotions: string[]
  actionItems: string[]
}> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { 
        role: 'system', 
        content: `Analyze this customer review. Return JSON:
{
  "sentiment": "positive|neutral|negative",
  "score": 0.0-1.0,
  "topics": ["main topics mentioned"],
  "emotions": ["customer emotions detected"],
  "actionItems": ["suggested improvements for the business"]
}` 
      },
      { role: 'user', content: reviewText },
    ],
    temperature: 0.3,
    max_tokens: 300,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0]?.message?.content || '{}')
}
