import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  exchangeCodeForTokens, 
  getGMBAccounts, 
  getGMBLocations,
  saveGoogleIntegration 
} from '@/lib/oauth/google'

// GET - Handle Google OAuth callback
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for OAuth errors
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/dashboard/integrations?error=${error}`, baseUrl)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=missing_params', baseUrl)
      )
    }

    // Verify state token
    const storedState = request.cookies.get('google_oauth_state')?.value
    const userId = request.cookies.get('google_oauth_user')?.value

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=invalid_state', baseUrl)
      )
    }

    if (!userId) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=session_expired', baseUrl)
      )
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)
    if (!tokens) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=token_exchange_failed', baseUrl)
      )
    }

    // Get user's GMB accounts
    const accounts = await getGMBAccounts(tokens.access_token)
    
    if (accounts.length === 0) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=no_gmb_accounts', baseUrl)
      )
    }

    // Get locations for first account
    const accountId = accounts[0].name
    const locations = await getGMBLocations(tokens.access_token, accountId)

    if (locations.length === 0) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=no_locations', baseUrl)
      )
    }

    // For now, use first location (could add selection UI later)
    const location = locations[0]
    const locationId = location.name
    const locationName = location.title

    // Save integration to database
    const supabase = createClient()
    const saved = await saveGoogleIntegration(
      supabase,
      userId,
      tokens,
      accountId,
      locationId,
      locationName
    )

    if (!saved) {
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=save_failed', baseUrl)
      )
    }

    // Clear OAuth cookies and redirect to success
    const response = NextResponse.redirect(
      new URL(`/dashboard/integrations?success=google_connected&location=${encodeURIComponent(locationName)}`, baseUrl)
    )
    response.cookies.delete('google_oauth_state')
    response.cookies.delete('google_oauth_user')

    return response

  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=callback_failed', baseUrl)
    )
  }
}
