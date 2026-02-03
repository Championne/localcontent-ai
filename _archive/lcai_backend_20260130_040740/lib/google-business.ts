import { SupabaseClient } from '@supabase/supabase-js'

const GMB_API_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1'
const GMB_POSTS_API = 'https://mybusiness.googleapis.com/v4'

export interface GMBLocation {
  name: string
  locationName: string
  primaryPhone: string
  address: {
    addressLines: string[]
    locality: string
    region: string
    postalCode: string
  }
  websiteUri?: string
}

export interface GMBPost {
  languageCode: string
  summary: string
  callToAction?: {
    actionType: 'LEARN_MORE' | 'BOOK' | 'ORDER' | 'SHOP' | 'SIGN_UP' | 'CALL'
    url?: string
  }
  media?: {
    mediaFormat: 'PHOTO' | 'VIDEO'
    sourceUrl: string
  }[]
  topicType: 'STANDARD' | 'EVENT' | 'OFFER'
  event?: {
    title: string
    schedule: {
      startDate: { year: number; month: number; day: number }
      endDate: { year: number; month: number; day: number }
    }
  }
  offer?: {
    couponCode?: string
    redeemOnlineUrl?: string
    termsConditions?: string
  }
}

// Get user's GMB access token from integrations
async function getGMBToken(
  supabase: SupabaseClient,
  userId: string
): Promise<{ accessToken: string; accountId: string; locationId: string } | null> {
  const { data } = await supabase
    .from('integrations')
    .select('access_token, refresh_token, metadata, expires_at')
    .eq('user_id', userId)
    .eq('platform', 'google_business')
    .single()

  if (!data) return null

  // Check if token is expired and refresh if needed
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    const refreshed = await refreshGMBToken(supabase, userId, data.refresh_token)
    if (!refreshed) return null
    return {
      accessToken: refreshed.access_token,
      accountId: data.metadata?.accountId,
      locationId: data.metadata?.locationId,
    }
  }

  return {
    accessToken: data.access_token,
    accountId: data.metadata?.accountId,
    locationId: data.metadata?.locationId,
  }
}

// Refresh expired GMB token
async function refreshGMBToken(
  supabase: SupabaseClient,
  userId: string,
  refreshToken: string
): Promise<{ access_token: string } | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) return null

    const data = await response.json()

    // Update stored token
    await supabase
      .from('integrations')
      .update({
        access_token: data.access_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      })
      .eq('user_id', userId)
      .eq('platform', 'google_business')

    return data
  } catch {
    return null
  }
}

// List user's GMB locations
export async function listLocations(
  supabase: SupabaseClient,
  userId: string
): Promise<GMBLocation[]> {
  const auth = await getGMBToken(supabase, userId)
  if (!auth) throw new Error('Google Business Profile not connected')

  const response = await fetch(
    `${GMB_API_BASE}/accounts/${auth.accountId}/locations`,
    {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch GMB locations')
  }

  const data = await response.json()
  return data.locations || []
}

// Create a post on GMB
export async function createPost(
  supabase: SupabaseClient,
  userId: string,
  post: GMBPost
): Promise<{ success: boolean; postId?: string; error?: string }> {
  const auth = await getGMBToken(supabase, userId)
  if (!auth) {
    return { success: false, error: 'Google Business Profile not connected' }
  }

  try {
    const response = await fetch(
      `${GMB_POSTS_API}/accounts/${auth.accountId}/locations/${auth.locationId}/localPosts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error?.message || 'Failed to create post' }
    }

    const data = await response.json()
    return { success: true, postId: data.name }
  } catch (error) {
    return { success: false, error: 'Failed to create GMB post' }
  }
}

// Get GMB insights/metrics
export async function getInsights(
  supabase: SupabaseClient,
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  views: number
  searches: number
  actions: number
  calls: number
  websiteClicks: number
}> {
  const auth = await getGMBToken(supabase, userId)
  if (!auth) throw new Error('Google Business Profile not connected')

  const response = await fetch(
    `${GMB_API_BASE}/accounts/${auth.accountId}/locations/${auth.locationId}:fetchMultiDailyMetricsTimeSeries`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dailyMetrics: [
          'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
          'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
          'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
          'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
          'CALL_CLICKS',
          'WEBSITE_CLICKS',
        ],
        dailyRange: {
          startDate: {
            year: startDate.getFullYear(),
            month: startDate.getMonth() + 1,
            day: startDate.getDate(),
          },
          endDate: {
            year: endDate.getFullYear(),
            month: endDate.getMonth() + 1,
            day: endDate.getDate(),
          },
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch GMB insights')
  }

  const data = await response.json()
  
  // Aggregate metrics
  let views = 0, searches = 0, calls = 0, websiteClicks = 0

  for (const series of data.multiDailyMetricTimeSeries || []) {
    const metric = series.dailyMetricTimeSeries?.dailyMetric
    const values = series.dailyMetricTimeSeries?.timeSeries?.datedValues || []
    
    const total = values.reduce((sum: number, v: any) => sum + (parseInt(v.value) || 0), 0)
    
    if (metric?.includes('IMPRESSIONS')) views += total
    if (metric?.includes('SEARCH')) searches += total
    if (metric === 'CALL_CLICKS') calls = total
    if (metric === 'WEBSITE_CLICKS') websiteClicks = total
  }

  return { views, searches, actions: calls + websiteClicks, calls, websiteClicks }
}

// Get GMB reviews
export async function getReviews(
  supabase: SupabaseClient,
  userId: string,
  pageSize: number = 50
): Promise<{
  reviews: Array<{
    reviewId: string
    reviewer: { displayName: string }
    starRating: string
    comment: string
    createTime: string
    updateTime: string
    reviewReply?: { comment: string }
  }>
  averageRating: number
  totalReviewCount: number
}> {
  const auth = await getGMBToken(supabase, userId)
  if (!auth) throw new Error('Google Business Profile not connected')

  const response = await fetch(
    `${GMB_POSTS_API}/accounts/${auth.accountId}/locations/${auth.locationId}/reviews?pageSize=${pageSize}`,
    {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch GMB reviews')
  }

  const data = await response.json()
  return {
    reviews: data.reviews || [],
    averageRating: data.averageRating || 0,
    totalReviewCount: data.totalReviewCount || 0,
  }
}

// Reply to a review
export async function replyToReview(
  supabase: SupabaseClient,
  userId: string,
  reviewId: string,
  comment: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await getGMBToken(supabase, userId)
  if (!auth) {
    return { success: false, error: 'Google Business Profile not connected' }
  }

  try {
    const response = await fetch(
      `${GMB_POSTS_API}/${reviewId}/reply`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error?.message || 'Failed to reply' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to reply to review' }
  }
}
