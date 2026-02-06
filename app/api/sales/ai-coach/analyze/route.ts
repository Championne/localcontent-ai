import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

/**
 * POST /api/sales/ai-coach/analyze - Analyze live transcript and provide suggestions
 */
export async function POST(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const { transcript, lead_id } = await request.json()

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript required' }, { status: 400 })
    }

    // Fetch lead context if provided
    let leadContext = ''
    if (lead_id) {
      const supabase = createClient()
      const { data: lead } = await supabase
        .from('leads')
        .select('company_name, contact_name, industry, business_type, location, notes')
        .eq('id', lead_id)
        .single()
      
      if (lead) {
        leadContext = `\nLead: ${lead.contact_name || 'Unknown'} from ${lead.company_name} (${lead.business_type || lead.industry || 'Unknown business'})`
      }
    }

    const systemPrompt = `You are an AI sales coach analyzing a LIVE sales call in real-time. You provide brief, actionable suggestions.

CONTEXT: Selling GeoSpark/LocalContent.ai - AI social media content for local businesses
Pricing: Starter $29/mo ($290/yr), Pro $79/mo ($790/yr), Premium $199/mo ($1990/yr)
${leadContext}

ANALYZE THE TRANSCRIPT AND RESPOND WITH:
1. If you detect an OBJECTION → Provide a brief counter-response (2-3 sentences max)
2. If you detect INTEREST → Suggest a closing move
3. If you detect CONFUSION → Suggest clarification
4. If conversation is going well → Suggest next topic or question

RESPONSE FORMAT (JSON):
{
  "type": "response" | "warning" | "opportunity",
  "suggestion": "Your brief suggestion here (max 50 words)"
}

RULES:
- Be VERY brief - rep is on a live call
- Give exact words to say when possible
- Only respond if you have something useful
- Return null suggestion if no action needed`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this live transcript:\n\n${transcript}` }
    ]

    let result = null

    // Try Groq first (faster)
    if (GROQ_API_KEY) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-70b-versatile',
            messages,
            temperature: 0.3,
            max_tokens: 150,
            response_format: { type: 'json_object' }
          }),
        })

        if (response.ok) {
          const completion = await response.json()
          const content = completion.choices?.[0]?.message?.content
          if (content) {
            try {
              result = JSON.parse(content)
            } catch {
              // Not valid JSON, try to extract
              result = { type: 'response', suggestion: content }
            }
          }
        }
      } catch (groqError) {
        console.error('Groq analyze error:', groqError)
      }
    }

    // Fallback to OpenAI
    if (!result && OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.3,
            max_tokens: 150,
            response_format: { type: 'json_object' }
          }),
        })

        if (response.ok) {
          const completion = await response.json()
          const content = completion.choices?.[0]?.message?.content
          if (content) {
            try {
              result = JSON.parse(content)
            } catch {
              result = { type: 'response', suggestion: content }
            }
          }
        }
      } catch (openaiError) {
        console.error('OpenAI analyze error:', openaiError)
      }
    }

    if (!result || !result.suggestion) {
      return NextResponse.json({ suggestion: null })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
