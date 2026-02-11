import { createClient } from '@/lib/supabase/server'
import { createLateProfile, getLateConnectUrl, type LatePlatform } from '@/lib/late-api'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BUSINESS_COOKIE = 'late_connect_business_id'
const COOKIE_MAX_AGE = 600 // 10 minutes

/** GET /api/integrations/late/connect?businessId=xxx&platform=facebook - Start Late OAuth for a business; redirects to Late. */
export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const requestUrl = new URL(request.url)
  const businessId = requestUrl.searchParams.get('businessId')
  const platformParam = requestUrl.searchParams.get('platform') || 'facebook'
  if (!businessId) {
    return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
  }

  const platform = platformParam.toLowerCase() as LatePlatform
  const allowed = ['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube', 'threads', 'reddit', 'pinterest', 'bluesky', 'googlebusiness', 'telegram', 'snapchat']
  if (!allowed.includes(platform)) {
    return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 })
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single()
  if (!business) {
    return NextResponse.json({ error: 'Business not found or access denied' }, { status: 404 })
  }

  let profileId: string

  const { data: existing } = await supabase
    .from('user_integrations')
    .select('account_id')
    .eq('user_id', user.id)
    .eq('business_id', businessId)
    .eq('platform', 'late_aggregator')
    .single()

  if (existing?.account_id) {
    profileId = existing.account_id
  } else {
    try {
      const lateProfile = await createLateProfile(
        business.name ? `${business.name} (GeoSpark)` : 'GeoSpark Social',
        `Social accounts for ${business.name || 'this business'}`
      )
      profileId = lateProfile._id
      await supabase.from('user_integrations').upsert(
        {
          user_id: user.id,
          business_id: businessId,
          platform: 'late_aggregator',
          account_id: profileId,
          account_name: business.name || 'Social',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,business_id,platform' }
      )
    } catch (e) {
      console.error('Late create profile error:', e)
      return NextResponse.json(
        { error: 'Server misconfiguration: Late API not configured or failed' },
        { status: 500 }
      )
    }
  }

  const redirectUrl = `${requestUrl.origin}/api/integrations/late/callback`
  let authUrl: string
  try {
    authUrl = await getLateConnectUrl(platform, profileId, redirectUrl)
  } catch (e) {
    console.error('Late connect URL error:', e)
    return NextResponse.json(
      { error: 'Could not start social connection. Check LATE_API_KEY.' },
      { status: 500 }
    )
  }

  const cookieStore = await cookies()
  cookieStore.set(BUSINESS_COOKIE, businessId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return NextResponse.redirect(authUrl)
}
