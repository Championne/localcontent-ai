import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getUsageWithLimits } from '@/lib/usage-tracker'
import { sendUsageAlert } from '@/lib/email'

// Cron job: Send usage alerts to users approaching their limits
// Runs daily at 9 AM

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()
    
    // Get all active users with subscriptions
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .not('email', 'is', null)

    if (!users?.length) {
      return NextResponse.json({ processed: 0 })
    }

    let alertsSent = 0
    const threshold = 80 // Alert at 80% usage

    for (const user of users) {
      try {
        const limits = await getUsageWithLimits(supabase, user.id)
        
        // Check each content type
        const alerts: { type: string; percent: number }[] = []
        
        if (limits.blogPosts.limit !== Infinity) {
          const percent = Math.round((limits.blogPosts.used / limits.blogPosts.limit) * 100)
          if (percent >= threshold && percent < 100) {
            alerts.push({ type: 'blog posts', percent })
          }
        }
        
        if (limits.socialPosts.limit !== Infinity) {
          const percent = Math.round((limits.socialPosts.used / limits.socialPosts.limit) * 100)
          if (percent >= threshold && percent < 100) {
            alerts.push({ type: 'social posts', percent })
          }
        }
        
        if (limits.gmbUpdates.limit !== Infinity) {
          const percent = Math.round((limits.gmbUpdates.used / limits.gmbUpdates.limit) * 100)
          if (percent >= threshold && percent < 100) {
            alerts.push({ type: 'GMB updates', percent })
          }
        }

        // Send one alert for the highest usage
        if (alerts.length > 0) {
          const highestAlert = alerts.sort((a, b) => b.percent - a.percent)[0]
          await sendUsageAlert(
            user.email,
            user.full_name || 'there',
            highestAlert.percent,
            highestAlert.type
          )
          alertsSent++
        }
      } catch (e) {
        console.error(`Failed to process user ${user.id}:`, e)
      }
    }

    return NextResponse.json({
      success: true,
      processed: users.length,
      alertsSent,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Usage alerts cron error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
