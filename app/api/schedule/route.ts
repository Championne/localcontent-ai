import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { scheduleContent, cancelScheduledContent, getScheduledContent } from '@/lib/scheduler'

/**
 * GET /api/schedule — list scheduled content for the current user
 * Query params: ?from=ISO&to=ISO&status=pending&businessId=uuid
 */
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const items = await getScheduledContent(supabase, user.id, {
    status: sp.get('status') || undefined,
    from: sp.get('from') || undefined,
    to: sp.get('to') || undefined,
    businessId: sp.get('businessId') || undefined,
  })

  return NextResponse.json({ items })
}

/**
 * POST /api/schedule — schedule content for a specific platform + time
 * Body: { businessId, contentId?, platform, postText, mediaUrl?, scheduledFor, platformOptions? }
 */
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { businessId, contentId, platform, postText, mediaUrl, scheduledFor, platformOptions } = body

  if (!businessId || !platform || !postText || !scheduledFor) {
    return NextResponse.json(
      { error: 'Missing fields: businessId, platform, postText, scheduledFor' },
      { status: 400 },
    )
  }

  const result = await scheduleContent(supabase, user.id, {
    businessId,
    contentId,
    platform,
    postText,
    mediaUrl,
    scheduledFor,
    platformOptions,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  // Update content record if linked
  if (contentId) {
    await supabase
      .from('content')
      .update({ status: 'scheduled', scheduled_for: scheduledFor })
      .eq('id', contentId)
      .eq('user_id', user.id)
  }

  return NextResponse.json({ success: true, scheduleId: result.scheduleId })
}

/**
 * DELETE /api/schedule — cancel a scheduled post
 * Body: { scheduleId }
 */
export async function DELETE(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.scheduleId) return NextResponse.json({ error: 'scheduleId required' }, { status: 400 })

  const result = await cancelScheduledContent(supabase, user.id, body.scheduleId)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 })
  return NextResponse.json({ success: true })
}
