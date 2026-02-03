import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

// Product knowledge base
const PRODUCT_KNOWLEDGE = `
GEOSPARK / LOCALCONTENT.AI - PRODUCT KNOWLEDGE

WHAT WE DO:
AI-powered social media content creation for local businesses. We write and schedule engaging posts that highlight their services and local area.

PRICING PLANS:
| Plan | Price | Posts | Locations | Best For |
|------|-------|-------|-----------|----------|
| Starter | $69/mo | 10/month | 1 | Solo businesses just starting |
| Growth | $129/mo | 30/month | 3 | Growing businesses, multiple services |
| Pro | $249/mo | Unlimited | 10 | Agencies, franchises |
| Enterprise | $499/mo | Custom | Unlimited | Large organizations |

Annual discount: ~15% off (2 months free)

KEY FEATURES:
- AI writes posts in their brand voice
- Local area content (events, weather, community)
- Automatic scheduling to optimal times
- Works with Facebook, Instagram, Google Business
- Takes 5 minutes/week to review and approve
- No contracts, cancel anytime

VALUE PROPOSITIONS BY BUSINESS TYPE:
- HVAC: "Show off seasonal tips, emergency services, and customer testimonials"
- Plumbers: "Build trust with helpful home maintenance tips and quick response times"
- Electricians: "Showcase safety tips and modern home upgrades"
- Restaurants: "Highlight daily specials, behind-the-scenes, and local partnerships"
- Salons: "Feature transformations, staff expertise, and seasonal styles"
- Dentists: "Share oral health tips and patient success stories"
- Contractors: "Before/after projects and craftsmanship"

ROI MATH:
- Average local service costs $150-500
- One new customer from social media = 2-7 months of GeoSpark paid
- Local businesses report 20-40% increase in calls after consistent posting

COMPETITORS:
- Hootsuite/Buffer: Just scheduling, no content creation ($99-249/mo)
- Hiring social media manager: $500-2000/month
- Marketing agency: $1000-5000/month
- DIY: 5-10 hours/week of business owner time

COMMON OBJECTIONS & RESPONSES:
1. "It's too expensive"
   → "What does one new customer bring you? $200? $500? One customer covers 3-7 months of GeoSpark. Plus, what's your time worth doing this yourself?"

2. "Social media doesn't work for my business"
   → "I hear that a lot. But 70% of people look at a business's social media before calling. When yours is active and professional, you get more calls. Our customers see 20-40% more inquiries."

3. "I don't have time to manage another tool"
   → "That's exactly why this exists. It takes 5 minutes a week - you just review AI-written posts and click approve. Most customers do it on their phone during lunch."

4. "I tried social media before and it didn't work"
   → "Consistency is key. Posting once a week for 3 months then stopping doesn't work. GeoSpark posts 2-3x per week automatically. That consistency is what builds visibility."

5. "I need to think about it"
   → "Totally understand. What specific concerns can I address? Also, we have a money-back guarantee - try it for 30 days, and if you're not seeing results, full refund."

6. "My nephew/friend does my social media"
   → "That's great you have help! How consistent are they posting? GeoSpark can complement that - we handle the regular posting so they can focus on special content."

CLOSING TECHNIQUES:
- "Should we get you started with the Starter plan today, or does Growth make more sense for your 3 locations?"
- "I can set up a quick demo right now - takes 10 minutes and you'll see exactly what your posts would look like. Want to do that?"
- "We're running a special this month - first month is 50% off. Want me to lock that in for you?"
- "What would need to happen for you to give this a try?"
`

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

/**
 * POST /api/sales/ai-coach/chat - Live AI chat during calls
 */
export async function POST(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const { message, lead_id, conversation_history = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
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
        leadContext = `\n\nCURRENT LEAD CONTEXT:\n- Company: ${lead.company_name}\n- Contact: ${lead.contact_name || 'Unknown'}\n- Business Type: ${lead.business_type || lead.industry || 'Unknown'}\n- Location: ${lead.location || 'Unknown'}\n- Notes: ${lead.notes || 'None'}`
      }
    }

    // Build messages array with conversation history
    const messages = [
      {
        role: 'system',
        content: `You are a live sales coach assisting a rep during a call RIGHT NOW. You must respond INSTANTLY with helpful, actionable advice.

${PRODUCT_KNOWLEDGE}
${leadContext}

RULES:
- Be BRIEF - rep is on a live call, no time for long answers
- Give EXACT words to say when possible
- Use bullet points for quick scanning
- If they ask about objections, give the response script
- If they ask about pricing, give the exact numbers
- Be encouraging and confident
- Never say "I don't know" - always provide something helpful`
      },
      ...conversation_history.slice(-6).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ]

    let reply = ''

    // Try Groq first (faster), fallback to OpenAI
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
            temperature: 0.5,
            max_tokens: 400,
          }),
        })

        if (response.ok) {
          const completion = await response.json()
          reply = completion.choices?.[0]?.message?.content || ''
        } else {
          const errorData = await response.json()
          console.error('Groq API error:', errorData)
        }
      } catch (groqError) {
        console.error('Groq request failed:', groqError)
      }
    }

    // Fallback to OpenAI if Groq failed or not configured
    if (!reply && OPENAI_API_KEY) {
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
            temperature: 0.5,
            max_tokens: 400,
          }),
        })

        if (response.ok) {
          const completion = await response.json()
          reply = completion.choices?.[0]?.message?.content || ''
        } else {
          const errorData = await response.json()
          console.error('OpenAI API error:', errorData)
        }
      } catch (openaiError) {
        console.error('OpenAI request failed:', openaiError)
      }
    }

    if (!reply) {
      // No API keys configured or both failed
      const missingKeys = []
      if (!GROQ_API_KEY) missingKeys.push('GROQ_API_KEY')
      if (!OPENAI_API_KEY) missingKeys.push('OPENAI_API_KEY')
      
      if (missingKeys.length === 2) {
        return NextResponse.json({ 
          error: 'AI not configured. Add GROQ_API_KEY or OPENAI_API_KEY to environment variables.' 
        }, { status: 500 })
      }
      
      return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 500 })
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}
