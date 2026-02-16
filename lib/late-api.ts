/**
 * Late API (getlate.dev) – create profiles, connect OAuth, list accounts, and post to social platforms.
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

export function isLateConfigured(): boolean {
  return !!process.env.LATE_API_KEY
}

export interface LateProfile {
  _id: string
  name: string
  description?: string
  createdAt?: string
}

export interface LateAccount {
  _id: string
  platform: string
  name?: string
  username?: string
  picture?: string
}

export interface LatePostResult {
  _id: string
  status: string
  platforms?: Record<string, { postId?: string; url?: string; error?: string }>
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

/** Human-readable platform names */
export const LATE_PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  twitter: 'X (Twitter)',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  threads: 'Threads',
  reddit: 'Reddit',
  pinterest: 'Pinterest',
  bluesky: 'Bluesky',
  googlebusiness: 'Google Business',
  telegram: 'Telegram',
  snapchat: 'Snapchat',
}

/**
 * Get the OAuth URL to send the user to for connecting a platform to a Late profile.
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

/**
 * List connected accounts (social channels) for a Late profile.
 */
export async function getProfileAccounts(profileId: string): Promise<LateAccount[]> {
  const res = await fetch(`${LATE_API_BASE}/profiles/${profileId}/accounts`, {
    headers: getHeaders(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Late API ${res.status}`)
  }
  const data = (await res.json()) as { accounts?: LateAccount[] }
  return data.accounts || []
}

/**
 * Publish a post to one or more connected accounts via Late.
 * If scheduledFor is provided, the post is scheduled for that time.
 */
export async function postToLate(opts: {
  profileId: string
  text: string
  mediaUrls?: string[]
  accountIds?: string[]
  platforms?: string[]
  scheduledFor?: string
}): Promise<LatePostResult> {
  const body: Record<string, unknown> = {
    profileId: opts.profileId,
    text: opts.text,
  }
  if (opts.mediaUrls?.length) body.mediaUrls = opts.mediaUrls
  if (opts.accountIds?.length) body.accountIds = opts.accountIds
  if (opts.platforms?.length) body.platforms = opts.platforms
  if (opts.scheduledFor) body.scheduledFor = opts.scheduledFor

  const res = await fetch(`${LATE_API_BASE}/posts`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Late API post failed: ${res.status}`)
  }
  const data = (await res.json()) as { post?: LatePostResult }
  if (!data.post) throw new Error('Late API did not return post')
  return data.post
}
