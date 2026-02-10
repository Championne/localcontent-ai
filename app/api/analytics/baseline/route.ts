import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_METRIC_TYPES = [
  'gmb_views',
  'search_impressions',
  'reviews',
  'avg_rating',
  'social_followers',
  'social_engagement',
  'website_sessions',
] as const

/**
 * POST /api/analytics/baseline
 * Capture or update baseline metrics for a business (e.g. after first GMB connect).
 * Body: { businessId: string, metrics: { gmb_views?: number, search_impressions?: number, ... } }
 */
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { businessId?: string; metrics?: Record<string, number> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { businessId, metrics } = body
  if (!businessId || !metrics || typeof metrics !== 'object') {
    return NextResponse.json(
      { error: 'businessId and metrics object are required' },
      { status: 400 }
    )
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single()
  if (!business) {
    return NextResponse.json({ error: 'Business not found or access denied' }, { status: 404 })
  }

  const rows = Object.entries(metrics)
    .filter(([key]) => ALLOWED_METRIC_TYPES.includes(key as (typeof ALLOWED_METRIC_TYPES)[number]))
    .filter(([, value]) => typeof value === 'number' && !Number.isNaN(value))
    .map(([metric_type, metric_value]) => ({
      user_id: user.id,
      business_id: businessId,
      metric_type,
      metric_value,
      metric_source: 'manual',
      is_baseline: true,
    }))

  if (rows.length === 0) {
    return NextResponse.json({ success: true, message: 'No valid metrics to save' })
  }

  const { error: upsertError } = await supabase.from('baseline_snapshots').upsert(rows, {
    onConflict: 'business_id,metric_type',
  })

  if (upsertError) {
    console.error('Baseline upsert error:', upsertError)
    return NextResponse.json({ error: 'Failed to save baseline' }, { status: 500 })
  }

  return NextResponse.json({ success: true, captured: rows.length })
}
