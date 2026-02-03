import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  scheduleContent, 
  cancelScheduledContent, 
  getScheduledContent,
  rescheduleContent 
} from '@/lib/scheduler'

// GET - Get user's scheduled content
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    const scheduled = await getScheduledContent(supabase, user.id, status)

    return NextResponse.json({ scheduled })

  } catch (error) {
    console.error('Fetch scheduled error:', error)
    return NextResponse.json({ error: 'Failed to fetch scheduled content' }, { status: 500 })
  }
}

// POST - Schedule content for publishing
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contentId, platform, scheduledFor, metadata } = body

    if (!contentId || !platform || !scheduledFor) {
      return NextResponse.json({ 
        error: 'contentId, platform, and scheduledFor are required' 
      }, { status: 400 })
    }

    const scheduledDate = new Date(scheduledFor)
    if (scheduledDate <= new Date()) {
      return NextResponse.json({ 
        error: 'Scheduled time must be in the future' 
      }, { status: 400 })
    }

    const result = await scheduleContent(
      supabase, 
      user.id, 
      contentId, 
      platform, 
      scheduledDate,
      metadata
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      scheduleId: result.scheduleId,
      scheduledFor: scheduledDate.toISOString()
    })

  } catch (error) {
    console.error('Schedule error:', error)
    return NextResponse.json({ error: 'Failed to schedule content' }, { status: 500 })
  }
}

// PATCH - Reschedule content
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { scheduleId, scheduledFor } = body

    if (!scheduleId || !scheduledFor) {
      return NextResponse.json({ 
        error: 'scheduleId and scheduledFor are required' 
      }, { status: 400 })
    }

    const result = await rescheduleContent(
      supabase, 
      user.id, 
      scheduleId, 
      new Date(scheduledFor)
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Reschedule error:', error)
    return NextResponse.json({ error: 'Failed to reschedule content' }, { status: 500 })
  }
}

// DELETE - Cancel scheduled content
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const scheduleId = searchParams.get('id')

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 })
    }

    const result = await cancelScheduledContent(supabase, user.id, scheduleId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Cancel schedule error:', error)
    return NextResponse.json({ error: 'Failed to cancel scheduled content' }, { status: 500 })
  }
}
