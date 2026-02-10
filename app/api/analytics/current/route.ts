import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/analytics/current?businessId=xxx
 * Returns baseline and current metrics for a business (Impact Dashboard).
 */
export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const requestUrl = new URL(request.url)
  const businessId = requestUrl.searchParams.get('businessId')
  if (!businessId) {
    return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
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

  const [baselineRes, historyRes] = await Promise.all([
    supabase
      .from('baseline_snapshots')
      .select('metric_type, metric_value, metric_source, captured_at')
      .eq('business_id', businessId),
    supabase
      .from('metric_history')
      .select('metric_type, metric_value, metric_source, recorded_date')
      .eq('business_id', businessId)
      .order('recorded_date', { ascending: false }),
  ])

  if (baselineRes.error) {
    console.error('Baseline fetch error:', baselineRes.error)
    return NextResponse.json({ error: 'Failed to load baseline' }, { status: 500 })
  }
  if (historyRes.error) {
    console.error('Metric history fetch error:', historyRes.error)
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 })
  }

  const baseline: Record<string, { value: number | null; source: string | null; captured_at: string }> = {}
  for (const row of baselineRes.data ?? []) {
    baseline[row.metric_type] = {
      value: row.metric_value != null ? Number(row.metric_value) : null,
      source: row.metric_source ?? null,
      captured_at: row.captured_at ?? '',
    }
  }

  const current: Record<string, { value: number | null; source: string | null; recorded_date: string }> = {}
  const seen = new Set<string>()
  for (const row of historyRes.data ?? []) {
    if (!seen.has(row.metric_type)) {
      seen.add(row.metric_type)
      current[row.metric_type] = {
        value: row.metric_value != null ? Number(row.metric_value) : null,
        source: row.metric_source ?? null,
        recorded_date: row.recorded_date ?? '',
      }
    }
  }

  const lastSync =
    historyRes.data?.length && historyRes.data[0]
      ? historyRes.data[0].recorded_date
      : null

  return NextResponse.json({
    businessId,
    baseline,
    current,
    lastSync,
  })
}
