import { SupabaseClient } from '@supabase/supabase-js'

export interface AnalyticsOverview {
  contentCreated: {
    total: number
    byType: Record<string, number>
    trend: number // percentage change from previous period
  }
  gmb: {
    views: number
    clicks: number
    calls: number
    viewsTrend: number
  }
  reviews: {
    total: number
    averageRating: number
    responded: number
    pending: number
  }
  engagement: {
    totalViews: number
    avgEngagementRate: number
  }
}

export interface ContentPerformance {
  id: string
  title: string
  type: string
  createdAt: string
  publishedAt?: string
  views?: number
  clicks?: number
  engagement?: number
}

// Get analytics overview
export async function getAnalyticsOverview(
  supabase: SupabaseClient,
  userId: string,
  days: number = 30
): Promise<AnalyticsOverview> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const prevStartDate = new Date()
  prevStartDate.setDate(prevStartDate.getDate() - (days * 2))

  // Content stats - current period
  const { data: currentContent } = await supabase
    .from('content')
    .select('content_type')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  // Content stats - previous period
  const { data: prevContent } = await supabase
    .from('content')
    .select('content_type')
    .eq('user_id', userId)
    .gte('created_at', prevStartDate.toISOString())
    .lt('created_at', startDate.toISOString())

  // Calculate content metrics
  const byType: Record<string, number> = {}
  for (const item of currentContent || []) {
    byType[item.content_type] = (byType[item.content_type] || 0) + 1
  }

  const currentTotal = currentContent?.length || 0
  const prevTotal = prevContent?.length || 0
  const contentTrend = prevTotal > 0 
    ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100)
    : currentTotal > 0 ? 100 : 0

  // Get metric history for GMB stats
  const { data: metrics } = await supabase
    .from('metric_history')
    .select('metric_name, value')
    .eq('user_id', userId)
    .gte('recorded_date', startDate.toISOString())

  const { data: prevMetrics } = await supabase
    .from('metric_history')
    .select('metric_name, value')
    .eq('user_id', userId)
    .gte('recorded_date', prevStartDate.toISOString())
    .lt('recorded_date', startDate.toISOString())

  // Aggregate GMB metrics
  const gmbMetrics = { views: 0, clicks: 0, calls: 0 }
  const prevGmbMetrics = { views: 0 }
  
  for (const m of metrics || []) {
    if (m.metric_name === 'gmb_views') gmbMetrics.views += m.value
    if (m.metric_name === 'gmb_clicks') gmbMetrics.clicks += m.value
    if (m.metric_name === 'gmb_calls') gmbMetrics.calls += m.value
  }

  for (const m of prevMetrics || []) {
    if (m.metric_name === 'gmb_views') prevGmbMetrics.views += m.value
  }

  const viewsTrend = prevGmbMetrics.views > 0
    ? Math.round(((gmbMetrics.views - prevGmbMetrics.views) / prevGmbMetrics.views) * 100)
    : gmbMetrics.views > 0 ? 100 : 0

  return {
    contentCreated: {
      total: currentTotal,
      byType,
      trend: contentTrend,
    },
    gmb: {
      views: gmbMetrics.views,
      clicks: gmbMetrics.clicks,
      calls: gmbMetrics.calls,
      viewsTrend,
    },
    reviews: {
      total: 0, // Will be populated from GMB API
      averageRating: 0,
      responded: 0,
      pending: 0,
    },
    engagement: {
      totalViews: gmbMetrics.views,
      avgEngagementRate: gmbMetrics.views > 0 
        ? Math.round((gmbMetrics.clicks / gmbMetrics.views) * 100) 
        : 0,
    },
  }
}

// Get content performance metrics
export async function getContentPerformance(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 10
): Promise<ContentPerformance[]> {
  const { data } = await supabase
    .from('content')
    .select('id, title, content_type, created_at, published_at, metadata')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    type: item.content_type,
    createdAt: item.created_at,
    publishedAt: item.published_at,
    views: item.metadata?.views,
    clicks: item.metadata?.clicks,
    engagement: item.metadata?.engagement,
  }))
}

// Get time series data for charts
export async function getTimeSeriesData(
  supabase: SupabaseClient,
  userId: string,
  metric: 'content' | 'views' | 'engagement',
  days: number = 30
): Promise<{ date: string; value: number }[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  if (metric === 'content') {
    const { data } = await supabase
      .from('content')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())

    // Group by date
    const grouped: Record<string, number> = {}
    for (const item of data || []) {
      const date = new Date(item.created_at).toISOString().split('T')[0]
      grouped[date] = (grouped[date] || 0) + 1
    }

    // Fill in missing dates
    const result: { date: string; value: number }[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      result.push({ date: dateStr, value: grouped[dateStr] || 0 })
    }

    return result.reverse()
  }

  // For views/engagement, get from metric_history
  const metricName = metric === 'views' ? 'gmb_views' : 'engagement_rate'
  
  const { data } = await supabase
    .from('metric_history')
    .select('recorded_date, value')
    .eq('user_id', userId)
    .eq('metric_name', metricName)
    .gte('recorded_date', startDate.toISOString())
    .order('recorded_date', { ascending: true })

  return (data || []).map(item => ({
    date: item.recorded_date.split('T')[0],
    value: item.value,
  }))
}

// Store baseline metrics for comparison
export async function captureBaseline(
  supabase: SupabaseClient,
  userId: string,
  metrics: Record<string, number>
): Promise<void> {
  const { data: existing } = await supabase
    .from('baseline_snapshots')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) {
    await supabase
      .from('baseline_snapshots')
      .update({ metrics, captured_at: new Date().toISOString() })
      .eq('user_id', userId)
  } else {
    await supabase
      .from('baseline_snapshots')
      .insert({
        user_id: userId,
        metrics,
        captured_at: new Date().toISOString(),
      })
  }
}

// Get baseline comparison
export async function getBaselineComparison(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  baseline: Record<string, number>
  current: Record<string, number>
  improvement: Record<string, number>
} | null> {
  const { data: baseline } = await supabase
    .from('baseline_snapshots')
    .select('metrics')
    .eq('user_id', userId)
    .single()

  if (!baseline) return null

  // Get current metrics (last 30 days)
  const overview = await getAnalyticsOverview(supabase, userId, 30)
  
  const current = {
    content_count: overview.contentCreated.total,
    gmb_views: overview.gmb.views,
    gmb_clicks: overview.gmb.clicks,
    engagement_rate: overview.engagement.avgEngagementRate,
  }

  const improvement: Record<string, number> = {}
  for (const [key, currentValue] of Object.entries(current)) {
    const baselineValue = baseline.metrics[key] || 0
    improvement[key] = baselineValue > 0
      ? Math.round(((currentValue - baselineValue) / baselineValue) * 100)
      : currentValue > 0 ? 100 : 0
  }

  return { baseline: baseline.metrics, current, improvement }
}
