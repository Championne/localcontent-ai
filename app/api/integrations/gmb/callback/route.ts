import { createClient } from '@/lib/supabase/server'
import {
  exchangeCodeForTokens,
  tokenExpiresAt,
  fetchGmbAccounts,
  fetchFirstGmbLocation,
} from '@/lib/google-business'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const STATE_COOKIE = 'gmb_connect_state'
const BUSINESS_COOKIE = 'gmb_connect_business_id'

/** GET /api/integrations/gmb/callback - OAuth callback; saves integration and redirects. */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const errorParam = requestUrl.searchParams.get('error')
  const origin = requestUrl.origin
  const redirectBase = `${origin}/dashboard/analytics`

  if (errorParam) {
    return NextResponse.redirect(
      `${redirectBase}?error=gmb_denied&message=${encodeURIComponent(errorParam)}`
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(`${redirectBase}?error=gmb_missing_params`)
  }

  const cookieStore = await cookies()
  const savedState = cookieStore.get(STATE_COOKIE)?.value
  const businessId = cookieStore.get(BUSINESS_COOKIE)?.value
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${redirectBase}?error=gmb_invalid_state`)
  }
  if (!businessId) {
    return NextResponse.redirect(`${redirectBase}?error=gmb_missing_business`)
  }

  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.redirect(`${origin}/auth/login?next=/dashboard/analytics`)
  }

  const redirectUri = `${origin}/api/integrations/gmb/callback`

  let accessToken: string
  let refreshToken: string | null = null
  let expiresAt: string | null = null

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri)
    accessToken = tokens.access_token
    if (tokens.refresh_token) refreshToken = tokens.refresh_token
    if (tokens.expires_in) expiresAt = tokenExpiresAt(tokens.expires_in).toISOString()
  } catch (e) {
    console.error('GMB token exchange error:', e)
    return NextResponse.redirect(`${redirectBase}?error=gmb_token_failed`)
  }

  let accountId: string | null = null
  let accountName: string | null = null
  let locationId: string | null = null

  try {
    const accounts = await fetchGmbAccounts(accessToken)
    const first = accounts[0]
    if (first) {
      accountId = first.name
      accountName = first.accountName || first.name
      const loc = await fetchFirstGmbLocation(accessToken, first.name)
      if (loc) locationId = loc.name
    }
  } catch {
    // Non-fatal: we still save the integration
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single()
  if (!business) {
    cookieStore.set(STATE_COOKIE, '', { path: '/', maxAge: 0 })
    cookieStore.set(BUSINESS_COOKIE, '', { path: '/', maxAge: 0 })
    return NextResponse.redirect(`${redirectBase}?error=gmb_business_invalid`)
  }

  const { error: upsertError } = await supabase
    .from('user_integrations')
    .upsert(
      {
        user_id: user.id,
        business_id: businessId,
        platform: 'google_business',
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt,
        account_id: accountId,
        account_name: accountName,
        location_id: locationId,
        last_error: null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,business_id,platform',
      }
    )

  cookieStore.set(STATE_COOKIE, '', { path: '/', maxAge: 0 })
  cookieStore.set(BUSINESS_COOKIE, '', { path: '/', maxAge: 0 })

  if (upsertError) {
    console.error('GMB integration upsert error:', upsertError)
    return NextResponse.redirect(`${redirectBase}?error=gmb_save_failed`)
  }

  return NextResponse.redirect(`${redirectBase}?connected=gmb`)
}
