import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/outreach/priority-queue - Get prioritized leads for action
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const industry_id = searchParams.get('industry_id')
    const temperature = searchParams.get('temperature') // hot, warm, warming, cold
    const action = searchParams.get('action') // call_now, call_today, send_email, etc.
    const limit = parseInt(searchParams.get('limit') || '50')

    // Try to use the view first, fall back to query if view doesn't exist
    let query = supabase
      .from('outreach_leads')
      .select(`
        *,
        industry:industries(id, name, icon, color)
      `)
      .not('status', 'in', '("converted","not_interested","unsubscribed")')
      .or('bounced.is.null,bounced.eq.false')
      .or('unsubscribed.is.null,unsubscribed.eq.false')
      .order('score', { ascending: false })
      .limit(limit)

    if (industry_id) {
      query = query.eq('industry_id', industry_id)
    }

    // Filter by temperature (score ranges)
    if (temperature === 'hot') {
      query = query.gte('score', 75)
    } else if (temperature === 'warm') {
      query = query.gte('score', 50).lt('score', 75)
    } else if (temperature === 'warming') {
      query = query.gte('score', 25).lt('score', 50)
    } else if (temperature === 'cold') {
      query = query.lt('score', 25)
    }

    const { data: leads, error } = await query

    if (error) throw error

    // Add computed fields
    const enrichedLeads = (leads || []).map(lead => {
      const score = lead.score || 0
      
      // Determine temperature
      let temp = 'cold'
      let tempEmoji = '🔵'
      if (score >= 75) { temp = 'hot'; tempEmoji = '🔥' }
      else if (score >= 50) { temp = 'warm'; tempEmoji = '🟠' }
      else if (score >= 25) { temp = 'warming'; tempEmoji = '🟡' }

      // Determine recommended action
      let recommendedAction = 'continue_sequence'
      if (lead.last_email_replied_at) {
        recommendedAction = 'call_now'
      } else if (score >= 75) {
        recommendedAction = 'call_today'
      } else if (score >= 50 && (lead.emails_sent || 0) < 3) {
        recommendedAction = 'send_email'
      } else if (score >= 50) {
        recommendedAction = 'call_soon'
      } else if ((lead.emails_sent || 0) === 0) {
        recommendedAction = 'start_sequence'
      }

      return {
        ...lead,
        temperature: temp,
        temperature_emoji: tempEmoji,
        recommended_action: recommendedAction
      }
    })

    // Filter by action if specified
    let filteredLeads = enrichedLeads
    if (action) {
      filteredLeads = enrichedLeads.filter(l => l.recommended_action === action)
    }

    // Group by temperature for dashboard
    const summary = {
      hot: enrichedLeads.filter(l => l.temperature === 'hot').length,
      warm: enrichedLeads.filter(l => l.temperature === 'warm').length,
      warming: enrichedLeads.filter(l => l.temperature === 'warming').length,
      cold: enrichedLeads.filter(l => l.temperature === 'cold').length,
      total: enrichedLeads.length
    }

    // Action counts
    const actionCounts = {
      call_now: enrichedLeads.filter(l => l.recommended_action === 'call_now').length,
      call_today: enrichedLeads.filter(l => l.recommended_action === 'call_today').length,
      call_soon: enrichedLeads.filter(l => l.recommended_action === 'call_soon').length,
      send_email: enrichedLeads.filter(l => l.recommended_action === 'send_email').length,
      start_sequence: enrichedLeads.filter(l => l.recommended_action === 'start_sequence').length,
    }

    return NextResponse.json({
      leads: filteredLeads,
      summary,
      actionCounts
    })
  } catch (error) {
    console.error('Priority queue error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
