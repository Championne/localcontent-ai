import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/sales/leads/[id]/outreach - Get outreach history for a sales lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the sales lead first
    const { data: salesLead, error: leadError } = await supabase
      .from('leads')
      .select('id, contact_email')
      .eq('id', id)
      .single()

    if (leadError || !salesLead) {
      return NextResponse.json({ error: 'Sales lead not found' }, { status: 404 })
    }

    // Find linked outreach leads (either by sales_lead_id or by matching email)
    let outreachLeads = []

    // First, try to find by direct link
    const { data: linkedLeads } = await supabase
      .from('outreach_leads')
      .select('*')
      .eq('sales_lead_id', id)

    if (linkedLeads && linkedLeads.length > 0) {
      outreachLeads = linkedLeads
    } else if (salesLead.contact_email) {
      // Fallback: find by matching email
      const { data: emailMatchLeads } = await supabase
        .from('outreach_leads')
        .select('*')
        .eq('contact_email', salesLead.contact_email)

      if (emailMatchLeads) {
        outreachLeads = emailMatchLeads
      }
    }

    if (outreachLeads.length === 0) {
      return NextResponse.json({ 
        outreach_leads: [],
        activities: [],
        summary: null
      })
    }

    // Get activities for all linked outreach leads
    const outreachLeadIds = outreachLeads.map(l => l.id)
    
    const { data: activities } = await supabase
      .from('outreach_activities')
      .select('*')
      .in('lead_id', outreachLeadIds)
      .order('created_at', { ascending: false })
      .limit(100)

    // Build summary
    const summary = {
      total_outreach_leads: outreachLeads.length,
      total_emails_sent: outreachLeads.reduce((sum, l) => sum + (l.emails_sent || 0), 0),
      total_emails_opened: outreachLeads.reduce((sum, l) => sum + (l.emails_opened || 0), 0),
      first_contacted: outreachLeads
        .filter(l => l.last_contacted_at)
        .sort((a, b) => new Date(a.last_contacted_at).getTime() - new Date(b.last_contacted_at).getTime())[0]?.last_contacted_at,
      first_replied: outreachLeads
        .filter(l => l.last_replied_at)
        .sort((a, b) => new Date(a.last_replied_at).getTime() - new Date(b.last_replied_at).getTime())[0]?.last_replied_at,
      campaigns: [...new Set(outreachLeads.filter(l => l.campaign_id).map(l => l.campaign_id))],
    }

    return NextResponse.json({
      outreach_leads: outreachLeads,
      activities: activities || [],
      summary
    })
  } catch (error) {
    console.error('Get outreach history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
