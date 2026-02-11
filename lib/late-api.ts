/**
 * Late API (getlate.dev) – create profiles and get OAuth connect URLs for social platforms.
 * One Late profile per GeoSpark business; we store profile ID in user_integrations (platform = late_aggregator).
 */

const LATE_API_BASE = 'https://getlate.dev/api/v1'

function getHeaders(): HeadersInit {
  const key = process.env.LATE_API_KEY
  if (!key) throw new Error('LATE_API_KEY is not set')
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

export interface LateProfile {
  _id: string
  name: string
  description?: string
  createdAt?: string
}

/**
 * Create a Late profile (Social Set). Call once per business when linking socials.
 */
export async function createLateProfile(name: string, description?: string): Promise<LateProfile> {
  const res = await fetch(`${LATE_API_BASE}/profiles`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      name: name || 'GeoSpark Social',
      ...(description && { description }),
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Late API ${res.status}`)
  }
  const data = (await res.json()) as { profile?: LateProfile }
  if (!data.profile?._id) throw new Error('Late API did not return profile')
  return data.profile
}

/** Platforms supported by Late connect (path segment). */
export const LATE_CONNECT_PLATFORMS = [
  'facebook',
  'instagram',
  'linkedin',
  'twitter',
  'tiktok',
  'youtube',
  'threads',
  'reddit',
  'pinterest',
  'bluesky',
  'googlebusiness',
  'telegram',
  'snapchat',
] as const

export type LatePlatform = (typeof LATE_CONNECT_PLATFORMS)[number]

/**
 * Get the OAuth URL to send the user to for connecting a platform to a Late profile.
 * Redirect user to the returned authUrl.
 */
export async function getLateConnectUrl(
  platform: LatePlatform,
  profileId: string,
  redirectUrl: string
): Promise<string> {
  const url = new URL(`${LATE_API_BASE}/connect/${platform}`)
  url.searchParams.set('profileId', profileId)
  url.searchParams.set('redirect_url', redirectUrl)

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Late API ${res.status}`)
  }
  const data = (await res.json()) as { authUrl?: string }
  if (!data.authUrl) throw new Error('Late API did not return authUrl')
  return data.authUrl
}
