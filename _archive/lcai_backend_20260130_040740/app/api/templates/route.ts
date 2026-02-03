import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List templates (public + user's own)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const contentType = searchParams.get('type')
    const search = searchParams.get('search')

    // Build query for public templates OR user's own templates
    let query = supabase
      .from('templates')
      .select('*')
      .order('usage_count', { ascending: false })

    // Filter: public templates OR user's own
    if (user) {
      query = query.or(`is_public.eq.true,created_by.eq.${user.id}`)
    } else {
      query = query.eq('is_public', true)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ templates: data })

  } catch (error) {
    console.error('Fetch templates error:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST - Create new template
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
      description, 
      content_type, 
      category,
      prompt_template,
      variables,
      example_output,
      is_public = false 
    } = body

    if (!name || !content_type || !prompt_template) {
      return NextResponse.json({ 
        error: 'Name, content_type, and prompt_template are required' 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('templates')
      .insert({
        name,
        description,
        content_type,
        category: category || 'general',
        prompt_template,
        variables: variables || [],
        example_output,
        is_public,
        created_by: user.id,
        usage_count: 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, template: data })

  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
