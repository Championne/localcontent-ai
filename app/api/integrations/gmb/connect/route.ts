import { createClient } from '@/lib/supabase/server'
import { getGmbAuthUrl } from '@/lib/google-business'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const STATE_COOKIE = 'gmb_connect_state'
const BUSINESS_COOKIE = 'gmb_connect_business_id'
const STATE_MAX_AGE = 600 // 10 minutes

/** GET /api/integrations/gmb/connect?businessId=xxx - Start GMB OAuth for a business; redirects to Google. */
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

  const redirectUri = `${requestUrl.origin}/api/integrations/gmb/callback`
  const state = crypto.randomUUID()

  try {
    const authUrl = getGmbAuthUrl(redirectUri, state)
    const cookieStore = await cookies()
    cookieStore.set(STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: STATE_MAX_AGE,
      path: '/',
    })
    cookieStore.set(BUSINESS_COOKIE, businessId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: STATE_MAX_AGE,
      path: '/',
    })
    return NextResponse.redirect(authUrl)
  } catch (e) {
    const message = e instanceof Error ? e.message : ''
    console.error('GMB connect error:', e)
    // Show which env var is missing (no secret values), otherwise generic message
    const safeMessage =
      message && (message.includes('GOOGLE_CLIENT_ID') || message.includes('GOOGLE_CLIENT_SECRET'))
        ? `${message} Add it to .env.local (or Vercel env for production) and restart the server.`
        : 'Server misconfiguration: Google OAuth not configured'
    return NextResponse.json({ error: safeMessage }, { status: 500 })
  }
}
