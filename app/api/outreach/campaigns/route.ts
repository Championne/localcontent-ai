import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/outreach/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('outreach_campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: campaigns, error } = await query

    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Campaigns API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/outreach/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const { 
      name,
      description,
      type,
      target_industry,
      target_location,
      settings,
      emails // Array of email sequence steps
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 })
    }

    // Create campaign
    const { data: campaign, error } = await supabase
      .from('outreach_campaigns')
      .insert({
        name,
        description,
        type: type || 'cold_email',
        target_industry: target_industry || 'HVAC',
        target_location,
        settings: settings || {},
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign:', error)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    // Add email sequence steps if provided
    if (emails && Array.isArray(emails) && emails.length > 0) {
      const emailsToInsert = emails.map((email, index) => ({
        campaign_id: campaign.id,
        step_number: index + 1,
        subject: email.subject,
        body: email.body,
        delay_days: email.delay_days || (index === 0 ? 0 : 3),
        send_time: email.send_time || '09:00'
      }))

      const { error: emailError } = await supabase
        .from('outreach_emails')
        .insert(emailsToInsert)

      if (emailError) {
        console.error('Error creating email sequence:', emailError)
        // Campaign created but emails failed - don't fail the whole request
      }
    }

    // Fetch campaign with emails
    const { data: fullCampaign } = await supabase
      .from('outreach_campaigns')
      .select('*, outreach_emails(*)')
      .eq('id', campaign.id)
      .single()

    return NextResponse.json({ campaign: fullCampaign }, { status: 201 })
  } catch (error) {
    console.error('Create campaign error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
