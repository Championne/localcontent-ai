import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPost, type GMBPost } from '@/lib/google-business'
import { canCreateContent, trackContentCreation } from '@/lib/usage-tracker'

// POST - Create a post on Google Business Profile
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check usage limits
    const usageCheck = await canCreateContent(supabase, user.id, 'gmb')
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.reason }, { status: 403 })
    }

    const body = await request.json()
    const { 
      summary, 
      callToAction,
      mediaUrl,
      topicType = 'STANDARD',
      event,
      offer,
      saveToLibrary = true 
    } = body

    if (!summary) {
      return NextResponse.json({ error: 'Summary is required' }, { status: 400 })
    }

    // Build GMB post
    const post: GMBPost = {
      languageCode: 'en',
      summary,
      topicType,
    }

    if (callToAction) {
      post.callToAction = {
        actionType: callToAction.type || 'LEARN_MORE',
        url: callToAction.url,
      }
    }

    if (mediaUrl) {
      post.media = [{
        mediaFormat: 'PHOTO',
        sourceUrl: mediaUrl,
      }]
    }

    if (topicType === 'EVENT' && event) {
      post.event = event
    }

    if (topicType === 'OFFER' && offer) {
      post.offer = offer
    }

    // Create the post
    const result = await createPost(supabase, user.id, post)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Track usage
    await trackContentCreation(supabase, user.id, 'gmb')

    // Save to content library
    if (saveToLibrary) {
      await supabase.from('content').insert({
        user_id: user.id,
        title: summary.substring(0, 100),
        body: summary,
        content_type: 'gmb',
        status: 'published',
        published_at: new Date().toISOString(),
        metadata: {
          gmb_post_id: result.postId,
          topic_type: topicType,
          call_to_action: callToAction,
        },
      })
    }

    return NextResponse.json({ 
      success: true, 
      postId: result.postId,
      message: 'Post published to Google Business Profile'
    })

  } catch (error) {
    console.error('GMB post error:', error)
    return NextResponse.json({ error: 'Failed to create GMB post' }, { status: 500 })
  }
}
