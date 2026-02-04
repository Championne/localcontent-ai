import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/sales/leads/[id]/touchpoints - Get all touchpoints for a lead
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

    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('lead_touchpoints')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (channel) {
      query = query.eq('channel', channel)
    }

    const { data: touchpoints, error } = await query

    if (error) throw error

    // Get summary stats
    const summary = {
      total: touchpoints?.length || 0,
      emails: touchpoints?.filter(t => t.channel === 'email').length || 0,
      calls: touchpoints?.filter(t => t.channel === 'call').length || 0,
      meetings: touchpoints?.filter(t => t.channel === 'meeting').length || 0,
      first_touch: touchpoints?.[touchpoints.length - 1]?.created_at,
      last_touch: touchpoints?.[0]?.created_at
    }

    return NextResponse.json({ touchpoints, summary })
  } catch (error) {
    console.error('Touchpoints API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/sales/leads/[id]/touchpoints - Add a touchpoint
export async function POST(
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
    const { channel, type, subject, content, duration_seconds, outcome, external_id, campaign_id, metadata } = body

    if (!channel || !type) {
      return NextResponse.json({ error: 'channel and type are required' }, { status: 400 })
    }

    // Get salesperson ID
    const { data: salesPerson } = await supabase
      .from('sales_team')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const { data: touchpoint, error } = await supabase
      .from('lead_touchpoints')
      .insert({
        lead_id: id,
        salesperson_id: salesPerson?.id,
        channel,
        type,
        subject,
        content,
        duration_seconds,
        outcome,
        external_id,
        campaign_id,
        metadata: metadata || {}
      })
      .select()
      .single()

    if (error) throw error

    // Update lead's channel-specific stats
    const updateData: Record<string, unknown> = {
      last_contacted_at: new Date().toISOString()
    }

    if (channel === 'email') {
      if (type === 'email_sent') {
        updateData.emails_sent = supabase.rpc('increment', { row_id: id, column_name: 'emails_sent' })
        updateData.last_email_at = new Date().toISOString()
      } else if (type === 'email_opened') {
        updateData.emails_opened = supabase.rpc('increment', { row_id: id, column_name: 'emails_opened' })
        updateData.last_email_opened_at = new Date().toISOString()
      } else if (type === 'email_replied') {
        updateData.emails_replied = supabase.rpc('increment', { row_id: id, column_name: 'emails_replied' })
        updateData.last_email_replied_at = new Date().toISOString()
      }
    } else if (channel === 'call') {
      updateData.calls_made = supabase.rpc('increment', { row_id: id, column_name: 'calls_made' })
      updateData.last_call_at = new Date().toISOString()
      updateData.last_call_outcome = outcome
      
      if (['call_connected', 'call_voicemail'].includes(type)) {
        if (type === 'call_connected') {
          updateData.calls_connected = supabase.rpc('increment', { row_id: id, column_name: 'calls_connected' })
        } else {
          updateData.voicemails_left = supabase.rpc('increment', { row_id: id, column_name: 'voicemails_left' })
        }
      }
    }

    // Simple update without RPC for now
    await supabase
      .from('leads')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', id)

    return NextResponse.json({ touchpoint }, { status: 201 })
  } catch (error) {
    console.error('Create touchpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
