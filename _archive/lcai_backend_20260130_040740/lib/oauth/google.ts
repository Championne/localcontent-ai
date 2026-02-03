import { SupabaseClient } from '@supabase/supabase-js'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`

// Scopes needed for Google Business Profile
const SCOPES = [
  'https://www.googleapis.com/auth/business.manage', // GMB management
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ')

// Generate OAuth URL for Google login
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline', // Get refresh token
    prompt: 'consent', // Force consent to get refresh token
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
} | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!response.ok) {
      console.error('Token exchange failed:', await response.text())
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Token exchange error:', error)
    return null
  }
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  expires_in: number
} | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

// Get user's Google profile
export async function getGoogleProfile(accessToken: string): Promise<{
  id: string
  email: string
  name: string
  picture?: string
} | null> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

// Get user's GMB accounts
export async function getGMBAccounts(accessToken: string): Promise<Array<{
  name: string
  accountName: string
  type: string
}>> {
  try {
    const response = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!response.ok) return []
    const data = await response.json()
    return data.accounts || []
  } catch {
    return []
  }
}

// Get locations for a GMB account
export async function getGMBLocations(
  accessToken: string,
  accountId: string
): Promise<Array<{
  name: string
  title: string
  storefrontAddress?: {
    addressLines: string[]
    locality: string
    administrativeArea: string
    postalCode: string
  }
}>> {
  try {
    const response = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations?readMask=name,title,storefrontAddress`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!response.ok) return []
    const data = await response.json()
    return data.locations || []
  } catch {
    return []
  }
}

// Save Google integration to database
export async function saveGoogleIntegration(
  supabase: SupabaseClient,
  userId: string,
  tokens: {
    access_token: string
    refresh_token: string
    expires_in: number
  },
  accountId: string,
  locationId: string,
  locationName: string
): Promise<boolean> {
  try {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    const { error } = await supabase.from('integrations').upsert({
      user_id: userId,
      platform: 'google_business',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      metadata: {
        accountId,
        locationId,
        locationName,
      },
      connected_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,platform',
    })

    return !error
  } catch {
    return false
  }
}

// Disconnect Google integration
export async function disconnectGoogle(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('user_id', userId)
      .eq('platform', 'google_business')

    return !error
  } catch {
    return false
  }
}
