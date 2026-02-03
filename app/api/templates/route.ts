import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/templates - List available templates
export async function GET(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const industry = searchParams.get('industry')

  try {
    let query = supabase
      .from('templates')
      .select('*')
      .or(`is_public.eq.true,user_id.eq.${user.id},user_id.is.null`)
      .order('usage_count', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (industry) {
      query = query.or(`industry.eq.${industry},industry.is.null`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    // Group by category for frontend
    const grouped = (data || []).reduce((acc, template) => {
      const cat = template.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(template)
      return acc
    }, {} as Record<string, typeof data>)

    return NextResponse.json({
      templates: data || [],
      grouped,
      categories: Object.keys(grouped)
    })

  } catch (error) {
    console.error('Templates list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/templates - Create custom template
export async function POST(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, category, industry, prompt_template, variables } = body

    if (!name || !prompt_template) {
      return NextResponse.json(
        { error: 'Name and prompt template are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        category: category || 'other',
        industry: industry || null,
        prompt_template,
        variables: variables || [],
        is_public: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      template: data
    }, { status: 201 })

  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
