import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/sales/industries - List all industries with stats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('include_stats') === 'true'

    if (includeStats) {
      // Use the performance view
      const { data: industries, error } = await supabase
        .from('industry_performance')
        .select('*')
      
      if (error) throw error
      return NextResponse.json({ industries })
    }

    // Simple list
    const { data: industries, error } = await supabase
      .from('industries')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    return NextResponse.json({ industries })
  } catch (error) {
    console.error('Industries API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/sales/industries - Create new industry
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, icon, color } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const { data: industry, error } = await supabase
      .from('industries')
      .insert({
        name,
        slug,
        description,
        icon: icon || '📦',
        color: color || '#6B7280'
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ industry }, { status: 201 })
  } catch (error) {
    console.error('Create industry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
