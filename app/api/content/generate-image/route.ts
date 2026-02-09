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
 * Body: { topic, industry, businessName, style?, contentType?, brandPrimaryColor?, brandSecondaryColor?, brandAccentColor? }
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
      subVariation,
      contentType = 'social-post',
      postType,
      brandPrimaryColor,
      brandSecondaryColor,
      brandAccentColor,
      preferredStyles,
      avoidStyles,
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

    const ALL_STYLES: ImageStyle[] = ['promotional', 'professional', 'friendly', 'seasonal', 'artistic', 'graffiti', 'lifestyle', 'minimalist', 'vintage', 'wellness']
    // Fetch business preferences if a businessId is available
    let bizPreferred: string[] | undefined = Array.isArray(preferredStyles) ? preferredStyles : undefined
    let bizAvoided: string[] | undefined = Array.isArray(avoidStyles) ? avoidStyles : undefined
    const finalStyle: ImageStyle = requestedStyle && ALL_STYLES.includes(requestedStyle)
      ? requestedStyle
      : detectBestStyle(topic, industry, postType || contentType, bizPreferred, bizAvoided)

    // Fetch AI prompt overrides for this user
    let sceneHintOverride: string | null = null
    let stylePrefixOverride: string | null = null
    try {
      const { data: aiOverrides } = await supabase
        .from('ai_prompt_overrides')
        .select('override_type, key, prompt_text')
        .eq('user_id', user.id)
        .in('key', [industry.trim().toLowerCase(), finalStyle])
      if (aiOverrides) {
        for (const ov of aiOverrides) {
          if (ov.override_type === 'scene_hint' && ov.key === industry.trim().toLowerCase()) {
            sceneHintOverride = ov.prompt_text
          }
          if (ov.override_type === 'style_prefix' && ov.key === finalStyle) {
            stylePrefixOverride = ov.prompt_text
          }
        }
      }
    } catch {
      // Non-critical: continue without overrides
    }

    const imageResult = await generateImage({
      topic,
      businessName,
      industry,
      style: finalStyle,
      subVariation: subVariation || undefined,
      contentType,
      postType: postType || contentType,
      preferredStyles: bizPreferred,
      avoidStyles: bizAvoided,
      brandPrimaryColor: brandPrimaryColor || undefined,
      brandSecondaryColor: brandSecondaryColor || undefined,
      brandAccentColor: brandAccentColor || undefined,
      sceneHintOverride,
      stylePrefixOverride,
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
