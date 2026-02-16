import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { postToLate, isLateConfigured } from '@/lib/late-api'
import { getValidAccessToken, createGmbPost } from '@/lib/google-business'

export const maxDuration = 30

/**
 * POST /api/publish
 *
 * Unified publishing endpoint. Routes to Late (social platforms) or GMB (direct) based on platform.
 *
 * Body: {
 *   contentId: string          — content to publish
 *   businessId: string         — which business
 *   platforms: string[]        — e.g. ['facebook','instagram','gmb']
 *   text: string               — post text
 *   mediaUrl?: string          — optional image URL
 *   scheduledFor?: string      — ISO date for scheduling (if omitted, publishes now)
 *   gmbOptions?: { topicType, callToAction, event, offer }
 * }
 */
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { contentId, businessId, platforms, text, mediaUrl, scheduledFor, gmbOptions } = body

    if (!businessId || !platforms?.length || !text) {
      return NextResponse.json({ error: 'Missing required fields: businessId, platforms, text' }, { status: 400 })
    }

    const results: Record<string, { success: boolean; postId?: string; error?: string }> = {}

    // Separate GMB from social platforms
    const gmbRequested = platforms.includes('gmb') || platforms.includes('google_business')
    const socialPlatforms = (platforms as string[]).filter(p => p !== 'gmb' && p !== 'google_business')

    // 1. Publish to social platforms via Late
    if (socialPlatforms.length > 0) {
      // Get Late profile for this business
      const { data: lateIntegration } = await supabase
        .from('user_integrations')
        .select('account_id, metadata')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .eq('platform', 'late_aggregator')
        .single()

      if (!lateIntegration?.account_id) {
        for (const p of socialPlatforms) {
          results[p] = { success: false, error: 'Social accounts not connected. Go to Analytics to connect.' }
        }
      } else if (!isLateConfigured()) {
        for (const p of socialPlatforms) {
          results[p] = { success: false, error: 'Late API not configured' }
        }
      } else {
        try {
          const lateResult = await postToLate({
            profileId: lateIntegration.account_id,
            text,
            mediaUrls: mediaUrl ? [mediaUrl] : undefined,
            platforms: socialPlatforms,
            scheduledFor,
          })
          for (const p of socialPlatforms) {
            const platformResult = lateResult.platforms?.[p]
            results[p] = platformResult?.error
              ? { success: false, error: platformResult.error }
              : { success: true, postId: platformResult?.postId || lateResult._id }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Late API error'
          for (const p of socialPlatforms) {
            results[p] = { success: false, error: msg }
          }
        }
      }
    }

    // 2. Publish to GMB directly
    if (gmbRequested) {
      const { data: gmbIntegration } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .eq('platform', 'google_business')
        .single()

      if (!gmbIntegration?.access_token || !gmbIntegration?.location_id) {
        results.gmb = { success: false, error: 'GMB not connected for this business' }
      } else {
        try {
          const { accessToken, expiresAt, refreshed } = await getValidAccessToken({
            access_token: gmbIntegration.access_token,
            refresh_token: gmbIntegration.refresh_token,
            token_expires_at: gmbIntegration.token_expires_at,
          })
          if (refreshed) {
            await supabase
              .from('user_integrations')
              .update({ access_token: accessToken, token_expires_at: expiresAt })
              .eq('id', gmbIntegration.id)
          }

          const gmbResult = await createGmbPost(accessToken, gmbIntegration.location_id, {
            languageCode: 'en',
            summary: text,
            topicType: gmbOptions?.topicType || 'STANDARD',
            callToAction: gmbOptions?.callToAction,
            media: mediaUrl ? [{ mediaFormat: 'PHOTO', sourceUrl: mediaUrl }] : undefined,
            event: gmbOptions?.event,
            offer: gmbOptions?.offer,
          })
          results.gmb = gmbResult
        } catch (err) {
          results.gmb = { success: false, error: err instanceof Error ? err.message : 'GMB post error' }
        }
      }
    }

    // 3. Update content status if we have a contentId
    if (contentId) {
      const anySuccess = Object.values(results).some(r => r.success)
      if (anySuccess) {
        await supabase
          .from('content')
          .update({
            status: scheduledFor ? 'scheduled' : 'published',
            scheduled_for: scheduledFor || null,
            published_at: scheduledFor ? null : new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', contentId)
          .eq('user_id', user.id)
      }
    }

    const allSuccess = Object.values(results).every(r => r.success)
    const anySuccess = Object.values(results).some(r => r.success)

    return NextResponse.json({
      success: anySuccess,
      allSuccess,
      results,
      scheduledFor: scheduledFor || null,
    })
  } catch (err) {
    console.error('Publish error:', err)
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 })
  }
}
