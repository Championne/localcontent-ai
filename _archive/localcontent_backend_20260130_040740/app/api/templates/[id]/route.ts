import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get single template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
      .from('templates')
      .select('*')
      .eq('id', params.id)

    // Can view if public or own template
    if (user) {
      query = query.or(`is_public.eq.true,created_by.eq.${user.id}`)
    } else {
      query = query.eq('is_public', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }
      throw error
    }

    // Increment usage count
    await supabase
      .from('templates')
      .update({ usage_count: (data.usage_count || 0) + 1 })
      .eq('id', params.id)

    return NextResponse.json({ template: data })

  } catch (error) {
    console.error('Fetch template error:', error)
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
  }
}

// PATCH - Update template (only owner)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const allowedFields = [
      'name', 'description', 'content_type', 'category',
      'prompt_template', 'variables', 'example_output', 'is_public'
    ]
    
    const updates: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }
    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', params.id)
      .eq('created_by', user.id) // Only owner can update
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found or not authorized' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ success: true, template: data })

  } catch (error) {
    console.error('Update template error:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

// DELETE - Delete template (only owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', params.id)
      .eq('created_by', user.id) // Only owner can delete

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
