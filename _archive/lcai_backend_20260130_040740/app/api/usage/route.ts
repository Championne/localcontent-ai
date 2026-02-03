import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUsageWithLimits, getUsageHistory, getUserPlan } from '@/lib/usage-tracker'
import { PLANS } from '@/lib/stripe'

// GET - Get user's usage stats and limits
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeHistory = searchParams.get('history') === 'true'
    const historyDays = parseInt(searchParams.get('days') || '30')

    const [limits, plan] = await Promise.all([
      getUsageWithLimits(supabase, user.id),
      getUserPlan(supabase, user.id),
    ])

    const planDetails = PLANS[plan]

    const response: any = {
      usage: limits,
      plan: {
        key: plan,
        name: planDetails?.name || 'Starter',
        features: planDetails?.features || [],
      },
      billingPeriod: {
        start: new Date(new Date().setDate(1)).toISOString(),
        end: new Date(new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0)).toISOString(),
      },
    }

    if (includeHistory) {
      response.history = await getUsageHistory(supabase, user.id, historyDays)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Fetch usage error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
  }
}
