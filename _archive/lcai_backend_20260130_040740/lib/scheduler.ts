import { SupabaseClient } from '@supabase/supabase-js'
import { createPost as createGMBPost } from './google-business'

export interface ScheduledContent {
  id: string
  user_id: string
  content_id: string
  platform: 'gmb' | 'facebook' | 'instagram' | 'twitter' | 'linkedin'
  scheduled_for: string
  status: 'pending' | 'processing' | 'published' | 'failed'
  metadata?: Record<string, any>
  error_message?: string
  published_at?: string
}

// Schedule content for publishing
export async function scheduleContent(
  supabase: SupabaseClient,
  userId: string,
  contentId: string,
  platform: string,
  scheduledFor: Date,
  metadata?: Record<string, any>
): Promise<{ success: boolean; scheduleId?: string; error?: string }> {
  try {
    // Verify content exists and belongs to user
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id, title, body, content_type')
      .eq('id', contentId)
      .eq('user_id', userId)
      .single()

    if (contentError || !content) {
      return { success: false, error: 'Content not found' }
    }

    // Create scheduled entry
    const { data, error } = await supabase
      .from('scheduled_content')
      .insert({
        user_id: userId,
        content_id: contentId,
        platform,
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending',
        metadata,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, scheduleId: data.id }
  } catch (error) {
    return { success: false, error: 'Failed to schedule content' }
  }
}

// Cancel scheduled content
export async function cancelScheduledContent(
  supabase: SupabaseClient,
  userId: string,
  scheduleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('scheduled_content')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .eq('status', 'pending')

    if (error) throw error
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to cancel scheduled content' }
  }
}

// Get user's scheduled content
export async function getScheduledContent(
  supabase: SupabaseClient,
  userId: string,
  status?: string
): Promise<ScheduledContent[]> {
  let query = supabase
    .from('scheduled_content')
    .select(`
      *,
      content:content_id (
        title,
        body,
        content_type
      )
    `)
    .eq('user_id', userId)
    .order('scheduled_for', { ascending: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { data } = await query
  return data || []
}

// Process due scheduled content (called by cron job)
export async function processDueContent(
  supabase: SupabaseClient
): Promise<{ processed: number; succeeded: number; failed: number }> {
  const now = new Date().toISOString()
  
  // Get all pending content that is due
  const { data: dueContent } = await supabase
    .from('scheduled_content')
    .select(`
      *,
      content:content_id (
        title,
        body,
        content_type,
        metadata
      )
    `)
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .limit(50)

  if (!dueContent || dueContent.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 }
  }

  let succeeded = 0
  let failed = 0

  for (const scheduled of dueContent) {
    // Mark as processing
    await supabase
      .from('scheduled_content')
      .update({ status: 'processing' })
      .eq('id', scheduled.id)

    try {
      let result: { success: boolean; error?: string } = { success: false }

      switch (scheduled.platform) {
        case 'gmb':
          result = await createGMBPost(supabase, scheduled.user_id, {
            languageCode: 'en',
            summary: scheduled.content.body,
            topicType: 'STANDARD',
            callToAction: scheduled.metadata?.callToAction,
          })
          break

        // Future platforms
        case 'facebook':
        case 'instagram':
        case 'twitter':
        case 'linkedin':
          result = { success: false, error: `${scheduled.platform} publishing not yet implemented` }
          break

        default:
          result = { success: false, error: 'Unknown platform' }
      }

      if (result.success) {
        // Mark as published
        await supabase
          .from('scheduled_content')
          .update({ 
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .eq('id', scheduled.id)

        // Update content status
        await supabase
          .from('content')
          .update({ 
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .eq('id', scheduled.content_id)

        succeeded++
      } else {
        // Mark as failed
        await supabase
          .from('scheduled_content')
          .update({ 
            status: 'failed',
            error_message: result.error,
          })
          .eq('id', scheduled.id)

        failed++
      }
    } catch (error) {
      // Mark as failed
      await supabase
        .from('scheduled_content')
        .update({ 
          status: 'failed',
          error_message: 'Unexpected error during publishing',
        })
        .eq('id', scheduled.id)

      failed++
    }
  }

  return { processed: dueContent.length, succeeded, failed }
}

// Reschedule failed content
export async function rescheduleContent(
  supabase: SupabaseClient,
  userId: string,
  scheduleId: string,
  newScheduledFor: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('scheduled_content')
      .update({ 
        status: 'pending',
        scheduled_for: newScheduledFor.toISOString(),
        error_message: null,
      })
      .eq('id', scheduleId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to reschedule content' }
  }
}
