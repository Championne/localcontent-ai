import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

// Use Groq for free AI - OpenAI-compatible API, fallback to OpenAI
const GROQ_API_KEY = process.env.GROQ_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

/**
 * POST /api/sales/ai-coach/briefing - Generate pre-call briefing for a lead
 */
export async function POST(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const { lead_id } = await request.json()

    if (!lead_id) {
      return NextResponse.json({ error: 'lead_id required' }, { status: 400 })
    }

    const supabase = createClient()

    // Fetch lead with all related data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        assigned_to_member:sales_team!leads_assigned_to_fkey(name),
        activities:activities(type, subject, outcome, description, created_at),
        deals:deals(deal_name, stage, plan, mrr_value)
      `)
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Fetch recent calls to this lead
    const { data: calls } = await supabase
      .from('calls')
      .select('outcome, outcome_notes, duration_seconds, initiated_at')
      .eq('lead_id', lead_id)
      .order('initiated_at', { ascending: false })
      .limit(5)

    // Fetch relevant feedback/objections
    const { data: feedback } = await supabase
      .from('feedback')
      .select('type, title, description, client_quote')
      .or(`lead_id.eq.${lead_id},type.eq.objection`)
      .order('upvotes', { ascending: false })
      .limit(10)

    // Build context for AI
    const context = {
      company: lead.company_name,
      contact: lead.contact_name,
      industry: lead.industry || lead.business_type,
      location: lead.location,
      status: lead.status,
      priority: lead.priority,
      source: lead.source,
      notes: lead.notes,
      lastContacted: lead.last_contacted_at,
      previousCalls: calls?.map(c => ({
        outcome: c.outcome,
        notes: c.outcome_notes,
        duration: c.duration_seconds,
        date: c.initiated_at
      })),
      previousActivities: lead.activities?.slice(0, 5),
      existingDeals: lead.deals,
      commonObjections: feedback?.filter(f => f.type === 'objection').map(f => f.title),
      relatedFeedback: feedback?.filter(f => f.lead_id === lead_id)
    }

    const systemPrompt = `You are an expert sales coach helping a rep prepare for a call. 
You work for GeoSpark (also known as LocalContent.ai), a SaaS that helps local businesses create AI-powered social media content.

PRICING:
- Starter: $29/month - 10 posts/month, 1 business location
- Pro: $79/month - 30 posts/month, 3 business locations  
- Premium: $179/month - Unlimited posts, 10 business locations

TARGET CUSTOMERS: Local service businesses (HVAC, plumbers, electricians, salons, restaurants, contractors, dentists, etc.)

VALUE PROPOSITION:
- Save 10+ hours/month on social media content creation
- AI writes engaging posts about their services and local area
- Increase local visibility and customer engagement
- Professional content without hiring a marketing agency

COMMON OBJECTIONS YOU SHOULD PREPARE RESPONSES FOR:
- "Too expensive" → ROI: one new customer covers months of subscription
- "I don't have time" → That's exactly why this exists - it takes 5 min/week
- "Social media doesn't work for my business" → Local businesses see 20-40% more calls
- "I can do it myself" → How much is your time worth? Focus on your craft

Be concise, practical, and actionable. Use bullet points. Be encouraging but not pushy.`

    const userPrompt = `Generate a pre-call briefing for this lead:

${JSON.stringify(context, null, 2)}

Structure your response with these sections:
## Quick Summary
(2-3 sentences about who they are and their potential)

## Opening Line
(Exact words to start the call - personalized to them)

## Key Talking Points
(3-4 points relevant to their business type)

## Objections to Expect
(Based on their profile, what might they push back on?)

## Recommended Plan
(Which plan to pitch and why)

## Closing Strategy
(How to ask for the next step)

## Watch Out For
(Any red flags or special notes)`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    let briefing = ''

    // Try Groq first (free)
    if (GROQ_API_KEY) {
      try {
        const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-70b-versatile',
            messages,
            temperature: 0.7,
            max_tokens: 1200,
          }),
        })

        if (response.ok) {
          const completion = await response.json()
          briefing = completion.choices?.[0]?.message?.content || ''
        }
      } catch (e) {
        console.error('Groq API error:', e)
      }
    }

    // Fallback to OpenAI
    if (!briefing && OPENAI_API_KEY) {
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
            temperature: 0.7,
            max_tokens: 1200,
          }),
        })

        if (response.ok) {
          const completion = await response.json()
          briefing = completion.choices?.[0]?.message?.content || ''
        }
      } catch (e) {
        console.error('OpenAI API error:', e)
      }
    }

    if (!briefing) {
      return NextResponse.json({ error: 'AI service unavailable - check API keys' }, { status: 500 })
    }

    return NextResponse.json({
      lead_id,
      lead_name: lead.contact_name || lead.company_name,
      company: lead.company_name,
      phone: lead.contact_phone,
      briefing,
      generated_at: new Date().toISOString(),
      context: {
        status: lead.status,
        priority: lead.priority,
        industry: lead.industry || lead.business_type,
        location: lead.location,
        lastContacted: lead.last_contacted_at,
        callCount: calls?.length || 0,
      }
    })
  } catch (error) {
    console.error('Briefing generation error:', error)
    return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 })
  }
}
