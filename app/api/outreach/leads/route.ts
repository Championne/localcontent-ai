import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/outreach/leads - List all leads with filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const campaign_id = searchParams.get('campaign_id')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('outreach_leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id)
    }

    if (search) {
      query = query.or(`business_name.ilike.%${search}%,contact_name.ilike.%${search}%,contact_email.ilike.%${search}%`)
    }

    const { data: leads, error, count } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    return NextResponse.json({ 
      leads, 
      total: count,
      limit,
      offset
    })
  } catch (error) {
    console.error('Leads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/outreach/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const { 
      business_name,
      industry,
      website,
      contact_name,
      contact_email,
      contact_phone,
      contact_title,
      city,
      state,
      country,
      google_rating,
      google_reviews_count,
      google_maps_url,
      source,
      source_details,
      notes,
      tags,
      campaign_id
    } = body

    if (!business_name) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    const { data: lead, error } = await supabase
      .from('outreach_leads')
      .insert({
        business_name,
        industry: industry || 'HVAC',
        website,
        contact_name,
        contact_email,
        contact_phone,
        contact_title,
        city,
        state,
        country: country || 'USA',
        google_rating,
        google_reviews_count,
        google_maps_url,
        source: source || 'manual',
        source_details,
        notes,
        tags,
        campaign_id,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
