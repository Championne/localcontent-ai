import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/outreach/leads/[id] - Get single lead with activities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: lead, error } = await supabase
      .from('outreach_leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Get activities for this lead
    const { data: activities } = await supabase
      .from('outreach_activities')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ lead, activities: activities || [] })
  } catch (error) {
    console.error('Get lead error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/outreach/leads/[id] - Update lead
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const oldLead = await supabase
      .from('outreach_leads')
      .select('status')
      .eq('id', id)
      .single()

    const { data: lead, error } = await supabase
      .from('outreach_leads')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lead:', error)
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }

    // Log status change activity
    if (oldLead.data && body.status && oldLead.data.status !== body.status) {
      await supabase.from('outreach_activities').insert({
        lead_id: id,
        type: 'status_changed',
        details: {
          from: oldLead.data.status,
          to: body.status
        }
      })
    }

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Update lead error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/outreach/leads/[id] - Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('outreach_leads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting lead:', error)
      return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete lead error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
