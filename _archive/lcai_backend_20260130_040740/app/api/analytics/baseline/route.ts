import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureBaseline, getAnalyticsOverview } from '@/lib/analytics'

// POST - Capture baseline metrics
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current metrics to use as baseline
    const overview = await getAnalyticsOverview(supabase, user.id, 30)
    
    const metrics = {
      content_count: overview.contentCreated.total,
      gmb_views: overview.gmb.views,
      gmb_clicks: overview.gmb.clicks,
      gmb_calls: overview.gmb.calls,
      engagement_rate: overview.engagement.avgEngagementRate,
      review_count: overview.reviews.total,
      average_rating: overview.reviews.averageRating,
    }

    await captureBaseline(supabase, user.id, metrics)

    return NextResponse.json({ 
      success: true, 
      baseline: metrics,
      capturedAt: new Date().toISOString(),
      message: 'Baseline captured. Future analytics will compare against these values.'
    })

  } catch (error) {
    console.error('Capture baseline error:', error)
    return NextResponse.json({ error: 'Failed to capture baseline' }, { status: 500 })
  }
}
