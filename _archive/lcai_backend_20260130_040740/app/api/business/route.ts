import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get user's business profile(s)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get specific business
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 })
      }

      return NextResponse.json({ business: data })
    }

    // Get all businesses for user
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ businesses: data })

  } catch (error) {
    console.error('Fetch business error:', error)
    return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 })
  }
}

// POST - Create new business profile
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      business_type,
      description,
      phone,
      email,
      website,
      address,
      city,
      state,
      zip_code,
      country,
      keywords,
      target_audience,
      tone,
      logo_url,
      is_primary,
    } = body

    if (!name || !business_type) {
      return NextResponse.json({ 
        error: 'Name and business_type are required' 
      }, { status: 400 })
    }

    // If this is primary, unset other primary businesses
    if (is_primary) {
      await supabase
        .from('businesses')
        .update({ is_primary: false })
        .eq('user_id', user.id)
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        name,
        business_type,
        description,
        phone,
        email,
        website,
        address,
        city,
        state,
        zip_code,
        country: country || 'US',
        keywords: keywords || [],
        target_audience,
        tone: tone || 'friendly',
        logo_url,
        is_primary: is_primary || false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, business: data })

  } catch (error) {
    console.error('Create business error:', error)
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
  }
}

// PATCH - Update business profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
    }

    const allowedFields = [
      'name', 'business_type', 'description', 'phone', 'email', 
      'website', 'address', 'city', 'state', 'zip_code', 'country',
      'keywords', 'target_audience', 'tone', 'logo_url', 'is_primary'
    ]

    const filteredUpdates: Record<string, any> = {}
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field]
      }
    }
    filteredUpdates.updated_at = new Date().toISOString()

    // If setting as primary, unset others
    if (filteredUpdates.is_primary) {
      await supabase
        .from('businesses')
        .update({ is_primary: false })
        .eq('user_id', user.id)
        .neq('id', id)
    }

    const { data, error } = await supabase
      .from('businesses')
      .update(filteredUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, business: data })

  } catch (error) {
    console.error('Update business error:', error)
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
  }
}

// DELETE - Delete business profile
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete business error:', error)
    return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 })
  }
}
