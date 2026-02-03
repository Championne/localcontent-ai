import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const template = searchParams.get('template')
    const status = searchParams.get('status')

    let query = supabase
      .from('content')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (template) {
      query = query.eq('template', template)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Content fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ content: data || [] })
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, template, metadata = {}, status = 'draft', business_id, image_url, image_style, platforms } = body

    if (!content || !template) {
      return NextResponse.json({ error: 'Content and template are required' }, { status: 400 })
    }

    // Build metadata including image if provided
    const fullMetadata = {
      ...metadata,
      ...(image_url && { image_url }),
      ...(image_style && { image_style }),
      ...(platforms && { platforms }),
    }

    const { data, error } = await supabase
      .from('content')
      .insert({
        user_id: user.id,
        title: title || `${template} - ${new Date().toLocaleDateString()}`,
        content,
        template,
        metadata: fullMetadata,
        status,
        business_id: business_id || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Content save error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Content saved successfully', data }, { status: 201 })
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
