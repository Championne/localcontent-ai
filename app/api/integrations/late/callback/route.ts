import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BUSINESS_COOKIE = 'late_connect_business_id'

/** GET /api/integrations/late/callback - Late redirects here after OAuth. Save/ensure integration and redirect to analytics. */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const redirectBase = `${origin}/dashboard/analytics`

  const profileId = requestUrl.searchParams.get('profileId')
  const connected = requestUrl.searchParams.get('connected') // e.g. facebook, twitter
  const errorParam = requestUrl.searchParams.get('error')

  if (errorParam) {
    const cookieStore = await cookies()
    cookieStore.set(BUSINESS_COOKIE, '', { path: '/', maxAge: 0 })
    return NextResponse.redirect(
      `${redirectBase}?error=late_denied&message=${encodeURIComponent(errorParam)}`
    )
  }

  const cookieStore = await cookies()
  const businessId = cookieStore.get(BUSINESS_COOKIE)?.value
  cookieStore.set(BUSINESS_COOKIE, '', { path: '/', maxAge: 0 })

  if (!businessId) {
    return NextResponse.redirect(`${redirectBase}?error=late_missing_business`)
  }

  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.redirect(`${origin}/auth/login?next=/dashboard/analytics`)
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single()
  if (!business) {
    return NextResponse.redirect(`${redirectBase}?error=late_business_invalid`)
  }

  if (profileId) {
    // Fetch existing integration to merge connected platforms
    const { data: existing } = await supabase
      .from('user_integrations')
      .select('metadata')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .eq('platform', 'late_aggregator')
      .single()

    const existingPlatforms: string[] = (existing?.metadata as { connectedPlatforms?: string[] })?.connectedPlatforms || []
    const mergedPlatforms = connected
      ? [...new Set([...existingPlatforms, connected])]
      : existingPlatforms

    const { error: upsertError } = await supabase
      .from('user_integrations')
      .upsert(
        {
          user_id: user.id,
          business_id: businessId,
          platform: 'late_aggregator',
          account_id: profileId,
          account_name: business.name || 'Social',
          metadata: {
            lastConnectedPlatform: connected || null,
            connectedPlatforms: mergedPlatforms,
          },
          last_error: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,business_id,platform' }
      )

    if (upsertError) {
      console.error('Late integration upsert error:', upsertError)
      return NextResponse.redirect(`${redirectBase}?error=late_save_failed`)
    }
  }

  return NextResponse.redirect(`${redirectBase}?connected=late`)
}
