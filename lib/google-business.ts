/**
 * Google Business Profile (GMB) OAuth and API helpers.
 * Used for connect flow and (later) insights/reviews/posting.
 */

const GMB_SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
].join(' ')

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export function getGmbAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not set')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GMB_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

export interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope?: string
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not set')
  if (!clientSecret) throw new Error('GOOGLE_CLIENT_SECRET is not set')

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${res.status} ${err}`)
  }

  const data = (await res.json()) as GoogleTokenResponse
  return data
}

/** Token expiry: set token_expires_at from expires_in (seconds). */
export function tokenExpiresAt(expiresInSeconds: number): Date {
  const d = new Date()
  d.setSeconds(d.getSeconds() + expiresInSeconds)
  return d
}

/** Refresh access token using refresh_token. Returns new tokens. */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not set')
  if (!clientSecret) throw new Error('GOOGLE_CLIENT_SECRET is not set')

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token refresh failed: ${res.status} ${err}`)
  }

  const data = (await res.json()) as GoogleTokenResponse
  return data
}

/** Integration row from DB (minimal fields needed for token refresh). */
export interface GmbIntegrationRow {
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
}

/** Return a valid access token, refreshing if expired (with 5 min buffer). Caller should persist new token/expiry if refreshed. */
export async function getValidAccessToken(
  row: GmbIntegrationRow
): Promise<{ accessToken: string; expiresAt: string | null; refreshed: boolean }> {
  const bufferMs = 5 * 60 * 1000
  const now = Date.now()
  const expiresAt = row.token_expires_at ? new Date(row.token_expires_at).getTime() : 0
  if (row.refresh_token && expiresAt && now >= expiresAt - bufferMs) {
    const tokens = await refreshAccessToken(row.refresh_token)
    const newExpires = tokens.expires_in ? tokenExpiresAt(tokens.expires_in).toISOString() : null
    return { accessToken: tokens.access_token, expiresAt: newExpires, refreshed: true }
  }
  return { accessToken: row.access_token, expiresAt: row.token_expires_at, refreshed: false }
}

/**
 * Fetch GMB account and first location for display (account name).
 * Uses Business Profile API v1 (accounts.list, locations.list).
 */
const GMB_API_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1'
const GMB_ACCOUNTS_BASE = 'https://mybusinessaccountmanagement.googleapis.com/v1'

export interface GmbAccount {
  name: string   // accounts/123
  accountName?: string
}

export interface GmbLocation {
  name: string   // locations/456
  title?: string
}

export async function fetchGmbAccounts(accessToken: string): Promise<GmbAccount[]> {
  const res = await fetch(`${GMB_ACCOUNTS_BASE}/accounts`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    if (res.status === 403) return []
    throw new Error(`GMB accounts failed: ${res.status}`)
  }
  const data = (await res.json()) as { accounts?: { name: string; accountName?: string }[] }
  return (data.accounts || []).map((a) => ({ name: a.name, accountName: a.accountName }))
}

export async function fetchFirstGmbLocation(accessToken: string, accountName: string): Promise<GmbLocation | null> {
  // locations are under businessinformation API
  const res = await fetch(
    `${GMB_API_BASE}/${accountName}/locations?readMask=name,title&pageSize=1`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) {
    if (res.status === 403 || res.status === 404) return null
    throw new Error(`GMB locations failed: ${res.status}`)
  }
  const data = (await res.json()) as { locations?: { name: string; title?: string }[] }
  const loc = data.locations?.[0]
  return loc ? { name: loc.name, title: loc.title } : null
}

// ---------------------------------------------------------------------------
// GMB Posting via My Business v4 API
// ---------------------------------------------------------------------------

const GMB_POSTS_BASE = 'https://mybusiness.googleapis.com/v4'

export interface GMBPost {
  languageCode: string
  summary: string
  topicType: 'STANDARD' | 'EVENT' | 'OFFER'
  callToAction?: { actionType: string; url: string }
  media?: Array<{ mediaFormat: 'PHOTO' | 'VIDEO'; sourceUrl: string }>
  event?: { title: string; schedule: { startDate: object; endDate: object } }
  offer?: { couponCode?: string; redeemOnlineUrl?: string; termsConditions?: string }
}

export interface GMBPostResult {
  success: boolean
  postId?: string
  error?: string
}

/**
 * Create a post on Google Business Profile.
 * Requires a valid access token for the user and their location_id from user_integrations.
 */
export async function createGmbPost(
  accessToken: string,
  locationName: string,
  post: GMBPost,
): Promise<GMBPostResult> {
  try {
    const body: Record<string, unknown> = {
      languageCode: post.languageCode || 'en',
      summary: post.summary,
      topicType: post.topicType || 'STANDARD',
    }

    if (post.callToAction) body.callToAction = post.callToAction
    if (post.media?.length) body.media = post.media
    if (post.topicType === 'EVENT' && post.event) body.event = post.event
    if (post.topicType === 'OFFER' && post.offer) body.offer = post.offer

    const res = await fetch(`${GMB_POSTS_BASE}/${locationName}/localPosts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: `GMB post failed: ${res.status} ${err}` }
    }

    const data = (await res.json()) as { name?: string }
    const postId = data.name?.split('/').pop()
    return { success: true, postId }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'GMB post error' }
  }
}
