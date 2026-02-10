import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/integrations - List connected integrations for the current user.
 * Query: ?businessId=xxx to filter by business (optional).
 * Returns only safe fields (no tokens); includes business_id per row.
 */
export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const requestUrl = new URL(request.url)
  const businessId = requestUrl.searchParams.get('businessId')

  let query = supabase
    .from('user_integrations')
    .select('id, business_id, platform, account_id, account_name, location_id, connected_at, last_sync_at')
    .eq('user_id', user.id)
    .order('platform')

  if (businessId) {
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single()
    if (!business) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 404 })
    }
    query = query.eq('business_id', businessId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Integrations list error:', error)
    return NextResponse.json({ error: 'Failed to load integrations' }, { status: 500 })
  }

  return NextResponse.json({ integrations: data ?? [] })
}
