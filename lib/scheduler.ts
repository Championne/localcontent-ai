/**
 * Scheduler — schedule, cancel, list, and process scheduled content.
 * Used by the publish UI and the Vercel Cron job.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { postToLate, isLateConfigured } from '@/lib/late-api'
import { getValidAccessToken, createGmbPost } from '@/lib/google-business'

export interface ScheduledContent {
  id: string
  user_id: string
  business_id: string | null
  content_id: string | null
  platform: string
  post_text: string
  media_url: string | null
  platform_options: Record<string, unknown>
  scheduled_for: string
  status: 'pending' | 'processing' | 'published' | 'failed' | 'cancelled'
  error_message: string | null
  retry_count: number
  published_at: string | null
  platform_post_id: string | null
  platform_post_url: string | null
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Schedule content for a specific platform + time
// ---------------------------------------------------------------------------

export async function scheduleContent(
  supabase: SupabaseClient,
  userId: string,
  opts: {
    businessId: string
    contentId?: string
    platform: string
    postText: string
    mediaUrl?: string
    scheduledFor: string
    platformOptions?: Record<string, unknown>
  },
): Promise<{ success: boolean; scheduleId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('scheduled_content')
      .insert({
        user_id: userId,
        business_id: opts.businessId,
        content_id: opts.contentId || null,
        platform: opts.platform,
        post_text: opts.postText,
        media_url: opts.mediaUrl || null,
        platform_options: opts.platformOptions || {},
        scheduled_for: opts.scheduledFor,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) throw error
    return { success: true, scheduleId: data.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to schedule' }
  }
}

// ---------------------------------------------------------------------------
// Cancel a pending scheduled post
// ---------------------------------------------------------------------------

export async function cancelScheduledContent(
  supabase: SupabaseClient,
  userId: string,
  scheduleId: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('scheduled_content')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', scheduleId)
    .eq('user_id', userId)
    .in('status', ['pending'])
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ---------------------------------------------------------------------------
// Get scheduled content for a user (optionally filtered by status or date range)
// ---------------------------------------------------------------------------

export async function getScheduledContent(
  supabase: SupabaseClient,
  userId: string,
  opts?: { status?: string; from?: string; to?: string; businessId?: string },
): Promise<ScheduledContent[]> {
  let query = supabase
    .from('scheduled_content')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_for', { ascending: true })

  if (opts?.status) query = query.eq('status', opts.status)
  if (opts?.from) query = query.gte('scheduled_for', opts.from)
  if (opts?.to) query = query.lte('scheduled_for', opts.to)
  if (opts?.businessId) query = query.eq('business_id', opts.businessId)

  const { data } = await query
  return (data || []) as ScheduledContent[]
}

// ---------------------------------------------------------------------------
// Process all due scheduled content (called by cron job)
// ---------------------------------------------------------------------------

export async function processDueContent(
  supabase: SupabaseClient,
): Promise<{ processed: number; succeeded: number; failed: number }> {
  const now = new Date().toISOString()

  // Get pending posts that are due
  const { data: dueItems } = await supabase
    .from('scheduled_content')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .order('scheduled_for', { ascending: true })
    .limit(50)

  if (!dueItems?.length) return { processed: 0, succeeded: 0, failed: 0 }

  let succeeded = 0
  let failed = 0

  for (const item of dueItems as ScheduledContent[]) {
    // Mark processing
    await supabase
      .from('scheduled_content')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', item.id)

    try {
      let result: { success: boolean; postId?: string; error?: string } = { success: false, error: 'Unknown platform' }

      if (item.platform === 'gmb') {
        result = await publishToGmb(supabase, item)
      } else {
        result = await publishToSocial(supabase, item)
      }

      if (result.success) {
        await supabase
          .from('scheduled_content')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
            platform_post_id: result.postId || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)

        // Update content status if linked
        if (item.content_id) {
          await supabase
            .from('content')
            .update({ status: 'published', published_at: new Date().toISOString() })
            .eq('id', item.content_id)
        }
        succeeded++
      } else {
        await supabase
          .from('scheduled_content')
          .update({
            status: 'failed',
            error_message: result.error || 'Unknown error',
            retry_count: (item.retry_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)
        failed++
      }
    } catch (err) {
      await supabase
        .from('scheduled_content')
        .update({
          status: 'failed',
          error_message: err instanceof Error ? err.message : 'Unexpected error',
          retry_count: (item.retry_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)
      failed++
    }
  }

  return { processed: dueItems.length, succeeded, failed }
}

// ---------------------------------------------------------------------------
// Internal: publish a single item to GMB
// ---------------------------------------------------------------------------

async function publishToGmb(
  supabase: SupabaseClient,
  item: ScheduledContent,
): Promise<{ success: boolean; postId?: string; error?: string }> {
  if (!item.business_id) return { success: false, error: 'No business_id' }

  const { data: integration } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', item.user_id)
    .eq('business_id', item.business_id)
    .eq('platform', 'google_business')
    .single()

  if (!integration?.access_token || !integration?.location_id) {
    return { success: false, error: 'GMB not connected' }
  }

  const { accessToken, expiresAt, refreshed } = await getValidAccessToken({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
    token_expires_at: integration.token_expires_at,
  })

  if (refreshed) {
    await supabase
      .from('user_integrations')
      .update({ access_token: accessToken, token_expires_at: expiresAt })
      .eq('id', integration.id)
  }

  const opts = (item.platform_options || {}) as Record<string, unknown>
  return createGmbPost(accessToken, integration.location_id, {
    languageCode: 'en',
    summary: item.post_text,
    topicType: (opts.topicType as 'STANDARD' | 'EVENT' | 'OFFER') || 'STANDARD',
    callToAction: opts.callToAction as { actionType: string; url: string } | undefined,
    media: item.media_url ? [{ mediaFormat: 'PHOTO', sourceUrl: item.media_url }] : undefined,
  })
}

// ---------------------------------------------------------------------------
// Internal: publish a single item to a social platform via Late
// ---------------------------------------------------------------------------

async function publishToSocial(
  supabase: SupabaseClient,
  item: ScheduledContent,
): Promise<{ success: boolean; postId?: string; error?: string }> {
  if (!isLateConfigured()) return { success: false, error: 'Late API not configured' }
  if (!item.business_id) return { success: false, error: 'No business_id' }

  const { data: lateIntegration } = await supabase
    .from('user_integrations')
    .select('account_id')
    .eq('user_id', item.user_id)
    .eq('business_id', item.business_id)
    .eq('platform', 'late_aggregator')
    .single()

  if (!lateIntegration?.account_id) {
    return { success: false, error: 'Social accounts not connected' }
  }

  try {
    const result = await postToLate({
      profileId: lateIntegration.account_id,
      text: item.post_text,
      mediaUrls: item.media_url ? [item.media_url] : undefined,
      platforms: [item.platform],
    })
    const platformResult = result.platforms?.[item.platform]
    if (platformResult?.error) return { success: false, error: platformResult.error }
    return { success: true, postId: platformResult?.postId || result._id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Late API error' }
  }
}
