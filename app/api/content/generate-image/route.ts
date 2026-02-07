import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  generateImage,
  isImageGenerationConfigured,
  hasImageQuota,
  detectBestStyle,
  type ImageStyle
} from '@/lib/openai/images'
import { persistContentImage } from '@/lib/content-image'

/**
 * POST /api/content/generate-image
 * Generate a single AI image for Step 3 "Choose your image".
 * Body: { topic, industry, businessName, style?, contentType?, brandPrimaryColor? }
 */
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isImageGenerationConfigured()) {
    return NextResponse.json({ error: 'AI image generation is not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const {
      topic,
      industry,
      businessName,
      style: requestedStyle,
      contentType = 'social-post',
      brandPrimaryColor,
    } = body

    if (!topic || !industry || !businessName) {
      return NextResponse.json(
        { error: 'topic, industry, and businessName are required' },
        { status: 400 }
      )
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, images_generated_this_month')
      .eq('user_id', user.id)
      .single()

    const plan = subscription?.plan || 'free'
    const imagesUsedThisMonth = subscription?.images_generated_this_month || 0
    const IMAGE_LIMITS: Record<string, number> = {
      free: 5,
      starter: 30,
      pro: 100,
      premium: -1,
    }
    const limit = IMAGE_LIMITS[plan] ?? 5
    if (limit !== -1 && imagesUsedThisMonth >= limit) {
      return NextResponse.json(
        { error: 'Monthly AI image limit reached. Use stock or upload your own.' },
        { status: 403 }
      )
    }

    const finalStyle: ImageStyle = requestedStyle && ['promotional', 'professional', 'friendly', 'seasonal'].includes(requestedStyle)
      ? requestedStyle
      : detectBestStyle(topic)

    const imageResult = await generateImage({
      topic,
      businessName,
      industry,
      style: finalStyle,
      contentType,
      brandPrimaryColor: brandPrimaryColor || undefined,
    })

    const permanentUrl = await persistContentImage(supabase, user.id, imageResult.url)

    const { data: imgRow } = await supabase
      .from('generated_images')
      .insert({
        user_id: user.id,
        image_url: permanentUrl || imageResult.url,
        topic,
        business_name: businessName,
        industry,
        style: imageResult.style,
        content_type: contentType,
        size: imageResult.size,
        full_prompt: imageResult.fullPrompt || null,
        revised_prompt: imageResult.revisedPrompt || null,
        prompt_version: 'v1',
        source: 'ai',
      })
      .select('id')
      .single()

    await supabase
      .from('subscriptions')
      .update({
        images_generated_this_month: imagesUsedThisMonth + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return NextResponse.json({
      url: permanentUrl || imageResult.url,
      style: imageResult.style,
      size: imageResult.size,
      generated_image_id: imgRow?.id ?? null,
    })
  } catch (err) {
    console.error('Generate image error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate image' },
      { status: 500 }
    )
  }
}
