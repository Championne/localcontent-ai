import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List user's content
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const contentType = searchParams.get('type')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = supabase
      .from('content')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      content: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })

  } catch (error) {
    console.error('Fetch content error:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

// POST - Create new content manually
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, body: contentBody, content_type, status = 'draft', metadata = {} } = body

    if (!title || !contentBody) {
      return NextResponse.json({ error: 'Title and body required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('content')
      .insert({
        user_id: user.id,
        title,
        body: contentBody,
        content_type: content_type || 'post',
        status,
        metadata,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, content: data })

  } catch (error) {
    console.error('Create content error:', error)
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
  }
}
