import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAnalyticsOverview } from '@/lib/analytics'
import { sendEmail, emailTemplates } from '@/lib/email'

// Cron job: Send weekly performance digests
// Runs every Monday at 10 AM

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()
    
    // Get all users who have created content (active users)
    const { data: activeUsers } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .not('email', 'is', null)

    if (!activeUsers?.length) {
      return NextResponse.json({ processed: 0 })
    }

    let digestsSent = 0

    for (const user of activeUsers) {
      try {
        // Check if user has any content (only send to active users)
        const { count } = await supabase
          .from('content')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (!count || count === 0) continue

        // Get analytics for the past week
        const overview = await getAnalyticsOverview(supabase, user.id, 7)

        // Skip if no activity
        if (overview.contentCreated.total === 0 && overview.gmb.views === 0) continue

        const stats = {
          contentCreated: overview.contentCreated.total,
          views: overview.gmb.views,
          trend: overview.contentCreated.trend,
        }

        const template = emailTemplates.weeklyDigest(
          user.full_name || 'there',
          stats,
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/analytics`
        )

        await sendEmail({ to: user.email, ...template })
        digestsSent++
      } catch (e) {
        console.error(`Failed to send digest to ${user.id}:`, e)
      }
    }

    return NextResponse.json({
      success: true,
      processed: activeUsers.length,
      digestsSent,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Weekly digest cron error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
