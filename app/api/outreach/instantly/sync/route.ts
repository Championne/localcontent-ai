import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { instantly } from '@/lib/instantly'

// POST /api/outreach/instantly/sync - Sync campaign stats and lead statuses from Instantly
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { campaign_id } = body

    // If specific campaign provided, sync just that one
    if (campaign_id) {
      const result = await syncCampaign(supabase, campaign_id)
      return NextResponse.json(result)
    }

    // Otherwise, sync all campaigns
    const campaignsResult = await instantly.listCampaigns()
    
    if (!campaignsResult.success || !campaignsResult.data) {
      return NextResponse.json({ error: 'Failed to fetch campaigns from Instantly' }, { status: 500 })
    }

    const syncResults = []
    
    for (const campaign of campaignsResult.data) {
      const result = await syncCampaign(supabase, campaign.id)
      syncResults.push({
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        ...result
      })
    }

    return NextResponse.json({
      success: true,
      synced_campaigns: syncResults.length,
      results: syncResults
    })
  } catch (error) {
    console.error('Instantly sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function syncCampaign(supabase: Awaited<ReturnType<typeof createClient>>, campaignId: string) {
  // Get campaign stats
  const statsResult = await instantly.getCampaignStats(campaignId)
  
  if (!statsResult.success) {
    return { success: false, error: statsResult.error }
  }

  // Get leads in this campaign from our database
  const { data: ourLeads } = await supabase
    .from('outreach_leads')
    .select('id, email, emails_sent, emails_opened, emails_replied')
    .eq('instantly_campaign_id', campaignId)

  if (!ourLeads || ourLeads.length === 0) {
    return { 
      success: true, 
      leads_synced: 0,
      stats: statsResult.data
    }
  }

  // For each lead, get their status from Instantly
  let synced = 0
  let errors = 0

  for (const lead of ourLeads) {
    try {
      const leadStatus = await instantly.getLeadStatus(campaignId, lead.email)
      
      if (leadStatus.success && leadStatus.data) {
        // Update our database with Instantly's data
        await supabase
          .from('outreach_leads')
          .update({
            emails_sent: leadStatus.data.emails_sent || lead.emails_sent,
            emails_opened: leadStatus.data.emails_opened || lead.emails_opened,
            emails_replied: leadStatus.data.replied ? 
              Math.max(lead.emails_replied || 0, 1) : lead.emails_replied,
            instantly_lead_status: leadStatus.data.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id)
        
        synced++
      }
    } catch (e) {
      console.error(`Error syncing lead ${lead.email}:`, e)
      errors++
    }
  }

  return {
    success: true,
    leads_synced: synced,
    errors: errors,
    stats: statsResult.data
  }
}

// GET - Get current sync status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Instantly campaigns
    const campaignsResult = await instantly.listCampaigns()
    
    if (!campaignsResult.success) {
      return NextResponse.json({ 
        connected: false, 
        error: 'Failed to connect to Instantly' 
      })
    }

    // Get email accounts
    const accountsResult = await instantly.listEmailAccounts()

    // Get overall analytics
    const analyticsResult = await instantly.getAccountAnalytics()

    return NextResponse.json({
      connected: true,
      campaigns: campaignsResult.data || [],
      email_accounts: accountsResult.data || [],
      analytics: analyticsResult.data || null
    })
  } catch (error) {
    console.error('Instantly status error:', error)
    return NextResponse.json({ 
      connected: false, 
      error: String(error) 
    })
  }
}
