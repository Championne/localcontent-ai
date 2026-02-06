import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * POST /api/sales/ai-coach/assist - Live AI assistant during calls
 * Sales rep can ask questions or describe situation, AI provides suggestions
 */
export async function POST(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const { message, lead_id, call_id, conversation_history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 })
    }

    const supabase = createClient()

    // Fetch lead context if provided
    let leadContext = ''
    if (lead_id) {
      const { data: lead } = await supabase
        .from('leads')
        .select('company_name, contact_name, industry, business_type, location, status, notes')
        .eq('id', lead_id)
        .single()

      if (lead) {
        leadContext = `
Current lead: ${lead.contact_name || 'Unknown'} at ${lead.company_name}
Business type: ${lead.business_type || lead.industry || 'Unknown'}
Location: ${lead.location || 'Unknown'}
Status: ${lead.status}
Notes: ${lead.notes || 'None'}
`
      }
    }

    // Fetch common objections from feedback
    const { data: objections } = await supabase
      .from('feedback')
      .select('title, description')
      .eq('type', 'objection')
      .order('upvotes', { ascending: false })
      .limit(5)

    const objectionContext = objections?.length 
      ? `\nCommon objections our team has logged:\n${objections.map(o => `- ${o.title}`).join('\n')}`
      : ''

    // Build conversation for AI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an expert sales coach providing LIVE assistance during a sales call.
You work for GeoSpark (LocalContent.ai) - AI-powered social media content for local businesses.

PRICING (matches Stripe):
- Starter: $29/month (30 content pieces, 1 business)
- Pro: $79/month (100 content pieces, 3 businesses, most popular)
- Premium: $199/month (unlimited content, 10 businesses)

IMPORTANT RULES:
1. Be VERY concise - rep is on a live call
2. Use bullet points or short phrases
3. Give specific words/phrases to say
4. If they share an objection, give a direct response to use
5. Always aim toward booking a demo or closing

${leadContext}
${objectionContext}
`
      }
    ]

    // Add conversation history if provided
    if (conversation_history && Array.isArray(conversation_history)) {
      for (const msg of conversation_history.slice(-6)) { // Last 6 messages for context
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })
      }
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 300, // Keep responses short for live use
    })

    const response = completion.choices[0]?.message?.content || 'Unable to assist'

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('AI assist error:', error)
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}
