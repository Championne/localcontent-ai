import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken, createGmbPost, type GMBPost } from '@/lib/google-business'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { businessId, summary, callToAction, mediaUrl, topicType = 'STANDARD', event, offer } = body

    if (!summary) return NextResponse.json({ error: 'Summary is required' }, { status: 400 })

    // Get GMB integration for this business
    const { data: integration } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'google_business')
      .eq('business_id', businessId || '')
      .single()

    if (!integration || !integration.access_token) {
      return NextResponse.json({ error: 'Google Business Profile not connected for this business' }, { status: 400 })
    }

    if (!integration.location_id) {
      return NextResponse.json({ error: 'No GMB location found. Please reconnect Google Business Profile.' }, { status: 400 })
    }

    // Refresh token if needed
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

    // Build GMB post
    const post: GMBPost = { languageCode: 'en', summary, topicType }
    if (callToAction) post.callToAction = { actionType: callToAction.type || 'LEARN_MORE', url: callToAction.url }
    if (mediaUrl) post.media = [{ mediaFormat: 'PHOTO', sourceUrl: mediaUrl }]
    if (topicType === 'EVENT' && event) post.event = event
    if (topicType === 'OFFER' && offer) post.offer = offer

    const result = await createGmbPost(accessToken, integration.location_id, post)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, postId: result.postId })
  } catch (err) {
    console.error('GMB post error:', err)
    return NextResponse.json({ error: 'Failed to create GMB post' }, { status: 500 })
  }
}
