import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/usage - Get user's usage statistics
export async function GET() {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get subscription info
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get content count for current period
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: contentCount } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    // Plan limits (matches Stripe: Starter $29, Pro $79, Premium $199). growth = legacy, map to pro.
    const planLimits: Record<string, { content: number; businesses: number }> = {
      free: { content: 5, businesses: 1 },
      starter: { content: 30, businesses: 1 },
      growth: { content: 100, businesses: 3 }, // legacy; treat like pro
      pro: { content: 100, businesses: 3 },
      premium: { content: -1, businesses: 10 }, // unlimited
    }

    const plan = subscription?.plan || 'free'
    const limits = planLimits[plan] || planLimits.free

    // Get business count
    const { count: businessCount } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      usage: {
        content: {
          used: contentCount || 0,
          limit: limits.content,
          unlimited: limits.content === -1,
          percentage: limits.content === -1 ? 0 : Math.round(((contentCount || 0) / limits.content) * 100)
        },
        businesses: {
          used: businessCount || 0,
          limit: limits.businesses,
          unlimited: limits.businesses === -1,
          percentage: limits.businesses === -1 ? 0 : Math.round(((businessCount || 0) / limits.businesses) * 100)
        }
      },
      subscription: {
        plan,
        status: subscription?.status || 'active',
        currentPeriodEnd: subscription?.current_period_end || null
      }
    })

  } catch (error) {
    console.error('Usage fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
