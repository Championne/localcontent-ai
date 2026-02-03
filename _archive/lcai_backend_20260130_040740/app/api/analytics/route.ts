import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  getAnalyticsOverview, 
  getContentPerformance,
  getTimeSeriesData,
  getBaselineComparison 
} from '@/lib/analytics'

// GET - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'overview'
    const days = parseInt(searchParams.get('days') || '30')

    switch (view) {
      case 'overview':
        const overview = await getAnalyticsOverview(supabase, user.id, days)
        return NextResponse.json({ overview, period: { days } })

      case 'content':
        const limit = parseInt(searchParams.get('limit') || '10')
        const performance = await getContentPerformance(supabase, user.id, limit)
        return NextResponse.json({ content: performance })

      case 'timeseries':
        const metric = searchParams.get('metric') as 'content' | 'views' | 'engagement'
        if (!metric) {
          return NextResponse.json({ error: 'Metric required' }, { status: 400 })
        }
        const timeSeries = await getTimeSeriesData(supabase, user.id, metric, days)
        return NextResponse.json({ timeSeries, metric, days })

      case 'baseline':
        const comparison = await getBaselineComparison(supabase, user.id)
        if (!comparison) {
          return NextResponse.json({ 
            hasBaseline: false,
            message: 'No baseline captured yet' 
          })
        }
        return NextResponse.json({ hasBaseline: true, ...comparison })

      default:
        return NextResponse.json({ error: 'Invalid view' }, { status: 400 })
    }

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
