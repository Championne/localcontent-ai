import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/outreach/campaigns/[id] - Get campaign with emails and stats
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

    // Get campaign with email sequence
    const { data: campaign, error } = await supabase
      .from('outreach_campaigns')
      .select('*, outreach_emails(*)')
      .eq('id', id)
      .single()

    if (error || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get lead stats for this campaign
    const { data: leads, count } = await supabase
      .from('outreach_leads')
      .select('status', { count: 'exact' })
      .eq('campaign_id', id)

    // Calculate stats
    const stats = {
      total_leads: count || 0,
      by_status: {} as Record<string, number>
    }

    if (leads) {
      leads.forEach(lead => {
        stats.by_status[lead.status] = (stats.by_status[lead.status] || 0) + 1
      })
    }

    return NextResponse.json({ 
      campaign: {
        ...campaign,
        outreach_emails: campaign.outreach_emails?.sort((a: { step_number: number }, b: { step_number: number }) => a.step_number - b.step_number)
      },
      stats 
    })
  } catch (error) {
    console.error('Get campaign error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/outreach/campaigns/[id] - Update campaign
export async function PUT(
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

    const body = await request.json()
    const { emails, ...campaignData } = body

    // Update campaign
    const { data: campaign, error } = await supabase
      .from('outreach_campaigns')
      .update(campaignData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating campaign:', error)
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
    }

    // Update emails if provided
    if (emails && Array.isArray(emails)) {
      // Delete existing emails
      await supabase
        .from('outreach_emails')
        .delete()
        .eq('campaign_id', id)

      // Insert new emails
      if (emails.length > 0) {
        const emailsToInsert = emails.map((email, index) => ({
          campaign_id: id,
          step_number: index + 1,
          subject: email.subject,
          body: email.body,
          delay_days: email.delay_days || (index === 0 ? 0 : 3),
          send_time: email.send_time || '09:00'
        }))

        await supabase
          .from('outreach_emails')
          .insert(emailsToInsert)
      }
    }

    // Fetch updated campaign with emails
    const { data: fullCampaign } = await supabase
      .from('outreach_campaigns')
      .select('*, outreach_emails(*)')
      .eq('id', id)
      .single()

    return NextResponse.json({ campaign: fullCampaign })
  } catch (error) {
    console.error('Update campaign error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/outreach/campaigns/[id] - Delete campaign
export async function DELETE(
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

    // Remove campaign_id from leads (don't delete leads)
    await supabase
      .from('outreach_leads')
      .update({ campaign_id: null })
      .eq('campaign_id', id)

    // Delete campaign (emails will cascade)
    const { error } = await supabase
      .from('outreach_campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting campaign:', error)
      return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete campaign error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
