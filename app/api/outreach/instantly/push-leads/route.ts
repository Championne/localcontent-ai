import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { instantly, InstantlyLead } from '@/lib/instantly'

// POST /api/outreach/instantly/push-leads - Push leads from GeoSpark to Instantly
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      campaign_id, 
      lead_ids, 
      filters,
      skip_duplicates = true 
    } = body

    if (!campaign_id) {
      return NextResponse.json({ error: 'campaign_id is required' }, { status: 400 })
    }

    // Fetch leads from database
    let query = supabase
      .from('outreach_leads')
      .select('*')

    // If specific lead IDs provided
    if (lead_ids && lead_ids.length > 0) {
      query = query.in('id', lead_ids)
    }

    // Apply filters
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.industry_id) {
        query = query.eq('industry_id', filters.industry_id)
      }
      if (filters.campaign_id) {
        query = query.eq('campaign_id', filters.campaign_id)
      }
    }

    // Only get leads that haven't been sent to Instantly yet
    if (!lead_ids) {
      query = query.or('instantly_campaign_id.is.null,instantly_campaign_id.neq.' + campaign_id)
    }

    const { data: leads, error: fetchError } = await query.limit(500)

    if (fetchError) {
      throw fetchError
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No leads to push',
        uploaded: 0,
        skipped: 0
      })
    }

    // Transform to Instantly format
    const instantlyLeads: InstantlyLead[] = leads.map(lead => ({
      email: lead.email,
      first_name: lead.first_name || '',
      last_name: lead.last_name || '',
      company_name: lead.company_name || '',
      phone: lead.phone || '',
      website: lead.website || '',
      custom_variables: {
        geospark_id: lead.id,
        city: lead.city || '',
        state: lead.state || '',
        industry: lead.industry || '',
        google_rating: lead.google_rating?.toString() || '',
        google_reviews: lead.google_reviews_count?.toString() || '',
        source: 'geospark_crm'
      }
    }))

    // Push to Instantly
    const result = await instantly.addLeads(campaign_id, instantlyLeads, {
      skip_if_in_workspace: skip_duplicates,
      skip_if_in_campaign: skip_duplicates
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Update leads in database with Instantly campaign ID
    const leadIds = leads.map(l => l.id)
    await supabase
      .from('outreach_leads')
      .update({ 
        instantly_campaign_id: campaign_id,
        status: 'contacted',
        updated_at: new Date().toISOString()
      })
      .in('id', leadIds)

    // Log activity for each lead
    const activities = leads.map(lead => ({
      lead_id: lead.id,
      type: 'email_sent',
      notes: `Added to Instantly campaign: ${campaign_id}`,
      created_at: new Date().toISOString()
    }))

    await supabase.from('outreach_activities').insert(activities)

    return NextResponse.json({
      success: true,
      uploaded: result.data?.uploaded || leads.length,
      skipped: result.data?.skipped || 0,
      total_processed: leads.length
    })
  } catch (error) {
    console.error('Push leads to Instantly error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
