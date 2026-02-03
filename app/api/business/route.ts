import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/business - Get user's businesses
export async function GET() {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching businesses:', error)
      return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
    }

    return NextResponse.json({ businesses: data || [] })

  } catch (error) {
    console.error('Business list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/business - Create new business
export async function POST(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, industry, description, location, website, phone, referral_source } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        name,
        industry: industry || null,
        description: description || null,
        location: location || null,
        website: website || null,
        phone: phone || null,
        referral_source: referral_source || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating business:', error)
      // Return more details for debugging
      return NextResponse.json({ 
        error: 'Failed to create business',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      business: data
    }, { status: 201 })

  } catch (error) {
    console.error('Create business error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/business - Update business
export async function PATCH(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, name, industry, description, location, website, phone } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updates.name = name
    if (industry !== undefined) updates.industry = industry
    if (description !== undefined) updates.description = description
    if (location !== undefined) updates.location = location
    if (website !== undefined) updates.website = website
    if (phone !== undefined) updates.phone = phone

    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating business:', error)
      return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      business: data
    })

  } catch (error) {
    console.error('Update business error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
