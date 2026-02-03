import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

/**
 * POST /api/sales/ai-coach/summary - Generate post-call summary
 */
export async function POST(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const { transcript, lead_id, call_id, duration_seconds, outcome } = await request.json()

    const supabase = createClient()

    // Fetch lead context
    let leadContext = ''
    let leadData = null
    if (lead_id) {
      const { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('id', lead_id)
        .single()
      
      if (lead) {
        leadData = lead
        leadContext = `
Lead: ${lead.contact_name || 'Unknown'} from ${lead.company_name}
Business Type: ${lead.business_type || lead.industry || 'Unknown'}
Location: ${lead.location || 'Unknown'}
Previous Notes: ${lead.notes || 'None'}
`
      }
    }

    const systemPrompt = `You are a sales call analyzer. Generate a concise summary of this sales call.

CONTEXT:
${leadContext}
Call Duration: ${Math.floor((duration_seconds || 0) / 60)} minutes ${(duration_seconds || 0) % 60} seconds
Outcome: ${outcome || 'Unknown'}

RESPOND WITH JSON:
{
  "summary": "2-3 sentence summary of what was discussed",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "customerSentiment": "positive" | "neutral" | "negative" | "interested" | "skeptical",
  "objections": ["any objections raised"],
  "nextSteps": ["suggested follow-up actions"],
  "notesToAdd": "Brief notes to add to lead record (what's new/important)"
}

Be concise and actionable.`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this call transcript:\n\n${transcript || 'No transcript available. Generate summary based on outcome: ' + outcome}` }
    ]

    let result = null

    // Try Groq first
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
            max_tokens: 500,
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
              result = { summary: content }
            }
          }
        }
      } catch (e) {
        console.error('Groq summary error:', e)
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
            max_tokens: 500,
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
              result = { summary: content }
            }
          }
        }
      } catch (e) {
        console.error('OpenAI summary error:', e)
      }
    }

    if (!result) {
      return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
    }

    // Update lead notes if we have a lead and notes to add
    if (lead_id && result.notesToAdd && leadData) {
      const timestamp = new Date().toLocaleDateString()
      const updatedNotes = leadData.notes 
        ? `${leadData.notes}\n\n[${timestamp}] ${result.notesToAdd}`
        : `[${timestamp}] ${result.notesToAdd}`

      await supabase
        .from('leads')
        .update({ 
          notes: updatedNotes,
          last_contacted_at: new Date().toISOString()
        })
        .eq('id', lead_id)
    }

    // Update call record with summary if we have call_id
    if (call_id) {
      await supabase
        .from('calls')
        .update({ 
          summary: result.summary,
          // Store full analysis in metadata or separate field if available
        })
        .eq('id', call_id)
    }

    return NextResponse.json({
      ...result,
      leadUpdated: lead_id ? true : false
    })
  } catch (error) {
    console.error('Summary generation error:', error)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
