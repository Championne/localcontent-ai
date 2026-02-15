import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import {
  generateImage,
  isImageGenerationConfigured,
  detectBestStyle,
  type ImageStyle,
  FRAMEWORK_IMAGE_MOODS,
} from '@/lib/openai/images'
import { selectOptimalFramework } from '@/lib/content/framework-selector'
import { persistContentImage } from '@/lib/content-image'
import { detectBrandPersonality } from '@/lib/branding/personality-detection'
import { smartBackgroundRemoval } from '@/lib/image-processing/background-removal'
import { compositeProduct } from '@/lib/image-processing/product-composition'
import {
  addSmartTextOverlay,
  extractHeadline,
} from '@/lib/image-processing/smart-text-overlay'

export const maxDuration = 60

/**
 * POST /api/content/generate-image
 *
 * Body (existing fields):
 *   topic, industry, businessName, style?, contentType?, brandPrimaryColor?,
 *   brandSecondaryColor?, brandAccentColor?, preferredStyles?, avoidStyles?,
 *   subVariation?, postType?
 *
 * Body (new fields):
 *   productImage?      — base64 data-URI of a product photo
 *   brandColors?       — { primary, secondary? } hex strings
 *   addTextOverlay?    — boolean (default true when brandColors is provided)
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
      // New hybrid-model fields
      productImage,
      brandColors,
      addTextOverlay,
    } = body

    if (!topic || !industry || !businessName) {
      return NextResponse.json(
        { error: 'topic, industry, and businessName are required' },
        { status: 400 }
      )
    }

    // ── Quota check ────────────────────────────────────────────────────
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

    // ── Style detection ────────────────────────────────────────────────
    const ALL_STYLES: ImageStyle[] = [
      'promotional', 'professional', 'friendly', 'seasonal', 'artistic',
      'graffiti', 'lifestyle', 'minimalist', 'vintage', 'wellness',
    ]
    const bizPreferred: string[] | undefined = Array.isArray(preferredStyles) ? preferredStyles : undefined
    const bizAvoided: string[] | undefined = Array.isArray(avoidStyles) ? avoidStyles : undefined
    const finalStyle: ImageStyle = requestedStyle && ALL_STYLES.includes(requestedStyle)
      ? requestedStyle
      : detectBestStyle(topic, industry, postType || contentType, bizPreferred, bizAvoided)

    // ── AI prompt overrides (non-critical) ─────────────────────────────
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

    // ── Derive brand personality ───────────────────────────────────────
    const effectiveBrandColors = brandColors ?? (
      brandPrimaryColor ? { primary: brandPrimaryColor, secondary: brandSecondaryColor } : undefined
    )
    const personality = effectiveBrandColors?.primary
      ? detectBrandPersonality(effectiveBrandColors.primary, effectiveBrandColors.secondary)
      : null

    console.log(`Brand personality: ${personality?.personality || 'none'}`)

    // Framework mood alignment — align image tone with text psychology
    const frameworkRec = selectOptimalFramework({
      topic,
      industry,
      contentType,
    })
    const frameworkMood = FRAMEWORK_IMAGE_MOODS[frameworkRec.framework] || null
    console.log(`Framework mood: ${frameworkMood?.framework || 'none'} → ${frameworkMood?.moodOverride || 'default'}`)

    let totalCost = 0
    let removalMethod: 'free' | 'paid' | 'none' = 'none'
    let model: 'dalle3' | 'sdxl' = 'dalle3'
    let finalBuffer: Buffer | null = null
    let imageFullPrompt: string | null = null
    let imageRevisedPrompt: string | null = null
    let imageSize = '1024x1024'

    // Whether post-processing (overlay / composite) requires a buffer workflow
    const needsTextOverlay = addTextOverlay !== false && !!effectiveBrandColors?.primary
    const needsBufferWorkflow = !!productImage || needsTextOverlay

    // ── WORKFLOW A: Product Image ──────────────────────────────────────
    if (productImage) {
      console.log('Workflow A: Product image generation')

      // 1. Remove background
      const productBuffer = Buffer.from(
        productImage.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      )
      const { buffer: cleanProduct, method, cost: bgCost } =
        await smartBackgroundRemoval(productBuffer)
      totalCost += bgCost
      removalMethod = method

      // 2. Generate branded background
      const bgResult = await generateImage({
        topic,
        businessName,
        industry,
        style: finalStyle,
        hasProductImage: true,
        brandColors: effectiveBrandColors,
        contentType,
        requiresComplexScene: false,
        subVariation: subVariation || undefined,
        postType: postType || contentType,
        preferredStyles: bizPreferred,
        avoidStyles: bizAvoided,
        brandPrimaryColor: brandPrimaryColor || undefined,
        brandSecondaryColor: brandSecondaryColor || undefined,
        brandAccentColor: brandAccentColor || undefined,
        sceneHintOverride,
        stylePrefixOverride,
        frameworkMood,
      })

      totalCost += bgResult.cost || 0.04
      model = bgResult.model || 'dalle3'
      imageFullPrompt = bgResult.fullPrompt || null
      imageRevisedPrompt = bgResult.revisedPrompt || null
      imageSize = bgResult.size

      const bgResponse = await fetch(bgResult.url)
      const bgBuffer = Buffer.from(await bgResponse.arrayBuffer())

      // 3. Composite product onto background
      finalBuffer = await compositeProduct(
        bgBuffer,
        cleanProduct,
        effectiveBrandColors?.primary || '#333333',
        { productScale: 0.6, addShadow: true }
      )
    }
    // ── WORKFLOW B: Service / Standard Image ──────────────────────────
    else {
      console.log('Workflow B: Service image generation')

      const imageResult = await generateImage({
        topic,
        businessName,
        industry,
        style: finalStyle,
        hasProductImage: false,
        brandColors: effectiveBrandColors,
        contentType,
        requiresComplexScene: true,
        subVariation: subVariation || undefined,
        postType: postType || contentType,
        preferredStyles: bizPreferred,
        avoidStyles: bizAvoided,
        brandPrimaryColor: brandPrimaryColor || undefined,
        brandSecondaryColor: brandSecondaryColor || undefined,
        brandAccentColor: brandAccentColor || undefined,
        sceneHintOverride,
        stylePrefixOverride,
        frameworkMood,
      })

      totalCost += imageResult.cost || 0.04
      model = imageResult.model || 'dalle3'
      imageFullPrompt = imageResult.fullPrompt || null
      imageRevisedPrompt = imageResult.revisedPrompt || null
      imageSize = imageResult.size

      if (needsBufferWorkflow) {
        // Need buffer for text overlay — download into memory
        const imageResponse = await fetch(imageResult.url)
        finalBuffer = Buffer.from(await imageResponse.arrayBuffer())
      } else {
        // No post-processing needed — use the fast persist-by-URL path
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
            size: imageSize,
            full_prompt: imageFullPrompt,
            revised_prompt: imageRevisedPrompt,
            prompt_version: 'v2',
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
          size: imageSize,
          generated_image_id: imgRow?.id ?? null,
          cost: totalCost,
          personality: personality?.personality || 'neutral',
          removalMethod,
          model,
          hasProduct: false,
        })
      }
    }

    // ── Text overlay (only reached when needsBufferWorkflow) ─────────
    if (needsTextOverlay && finalBuffer && effectiveBrandColors?.primary) {
      const headline = extractHeadline(topic)
      if (headline) {
        finalBuffer = await addSmartTextOverlay(finalBuffer, {
          headline,
          businessName,
          brandColor: effectiveBrandColors.primary,
        })
      }
    }

    // ── Persist buffer via admin client (bypasses RLS) ─────────────────
    const storageClient = getSupabaseAdmin() || supabase
    let permanentUrl: string | null = null

    if (finalBuffer) {
      // Ensure the bucket exists before uploading
      try {
        const { error: getBucketErr } = await storageClient.storage.getBucket('generated-images')
        if (getBucketErr) {
          await storageClient.storage.createBucket('generated-images', { public: true, fileSizeLimit: 50 * 1024 * 1024 })
        }
      } catch { /* ignore */ }

      const filename = `${user.id}/generated_${Date.now()}.png`
      const { error: uploadError } = await storageClient.storage
        .from('generated-images')
        .upload(filename, finalBuffer, {
          contentType: 'image/png',
          cacheControl: '31536000',
          upsert: true,
        })

      if (!uploadError) {
        const { data: urlData } = storageClient.storage
          .from('generated-images')
          .getPublicUrl(filename)
        permanentUrl = urlData.publicUrl
      } else {
        console.error('Storage upload error:', uploadError.message)
        // Fallback: convert buffer to data URI so the image is still usable
        permanentUrl = `data:image/png;base64,${finalBuffer.toString('base64')}`
      }
    }

    if (!permanentUrl) {
      return NextResponse.json({ error: 'Failed to persist generated image' }, { status: 500 })
    }

    // ── Save record + update quota ─────────────────────────────────────
    const { data: imgRow } = await supabase
      .from('generated_images')
      .insert({
        user_id: user.id,
        image_url: permanentUrl,
        topic,
        business_name: businessName,
        industry,
        style: finalStyle,
        content_type: contentType,
        size: imageSize,
        full_prompt: imageFullPrompt,
        revised_prompt: imageRevisedPrompt,
        prompt_version: 'v2',
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
      url: permanentUrl,
      style: finalStyle,
      size: imageSize,
      generated_image_id: imgRow?.id ?? null,
      cost: totalCost,
      personality: personality?.personality || 'neutral',
      removalMethod,
      model,
      hasProduct: !!productImage,
    })
  } catch (err) {
    console.error('Generate image error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate image' },
      { status: 500 }
    )
  }
}
