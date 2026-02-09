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
    const {
      id,
      name,
      industry,
      description,
      location,
      website,
      phone,
      brand_primary_color,
      brand_secondary_color,
      brand_accent_color,
      tagline,
      default_cta_primary,
      default_cta_secondary,
      seo_keywords,
      default_tone,
      social_handles,
      service_areas,
      short_about,
      preferred_image_styles,
      avoid_image_styles,
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    const toStr = (v: unknown) => (v == null || v === '' ? null : String(v))
    if (name !== undefined) updates.name = name == null ? '' : String(name)
    if (industry !== undefined) updates.industry = toStr(industry)
    if (description !== undefined) updates.description = toStr(description)
    if (location !== undefined) updates.location = toStr(location)
    if (website !== undefined) updates.website = toStr(website)
    if (phone !== undefined) updates.phone = toStr(phone)
    if (brand_primary_color !== undefined) updates.brand_primary_color = toStr(brand_primary_color)
    if (brand_secondary_color !== undefined) updates.brand_secondary_color = toStr(brand_secondary_color)
    if (brand_accent_color !== undefined) updates.brand_accent_color = toStr(brand_accent_color)
    if (tagline !== undefined) updates.tagline = toStr(tagline)
    if (default_cta_primary !== undefined) updates.default_cta_primary = toStr(default_cta_primary)
    if (default_cta_secondary !== undefined) updates.default_cta_secondary = toStr(default_cta_secondary)
    if (seo_keywords !== undefined) updates.seo_keywords = toStr(seo_keywords)
    if (default_tone !== undefined) updates.default_tone = toStr(default_tone)
    if (social_handles !== undefined) updates.social_handles = toStr(social_handles)
    if (service_areas !== undefined) updates.service_areas = toStr(service_areas)
    if (short_about !== undefined) updates.short_about = toStr(short_about)
    if (preferred_image_styles !== undefined) updates.preferred_image_styles = Array.isArray(preferred_image_styles) ? preferred_image_styles : []
    if (avoid_image_styles !== undefined) updates.avoid_image_styles = Array.isArray(avoid_image_styles) ? avoid_image_styles : []

    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error updating business:', error)
      return NextResponse.json(
        { error: 'Failed to update business', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Business not found or you don’t have permission to update it' },
        { status: 404 }
      )
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
