import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/content - List user's content with pagination
export async function GET(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const status = searchParams.get('status') // draft, published, scheduled
  const template = searchParams.get('template') // blog-post, social-post, etc.
  
  const offset = (page - 1) * limit

  try {
    let query = supabase
      .from('content')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }
    
    if (template) {
      query = query.eq('template', template)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching content:', error)
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
    }

    return NextResponse.json({
      content: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Content list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/content - Save new content
export async function POST(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { template, title, content, metadata, status = 'draft', scheduled_for } = body

    if (!template || !content) {
      return NextResponse.json(
        { error: 'Template and content are required' },
        { status: 400 }
      )
    }

    // Check usage limits (mock for now)
    // In production, check subscription limits

    const { data, error } = await supabase
      .from('content')
      .insert({
        user_id: user.id,
        template,
        title: title || metadata?.topic || 'Untitled',
        content,
        metadata: metadata || {},
        status,
        scheduled_for: scheduled_for || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving content:', error)
      return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
    }

    // Update usage counter (mock for now)
    // await supabase.rpc('increment_content_usage', { user_id: user.id })

    return NextResponse.json({
      success: true,
      content: data
    }, { status: 201 })

  } catch (error) {
    console.error('Content save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
