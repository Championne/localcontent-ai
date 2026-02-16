import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { addSmartTextOverlay, extractHeadline } from '@/lib/image-processing/smart-text-overlay'
import { adjustAlpha, getContrastColor } from '@/lib/branding/personality-detection'

/**
 * GET /api/debug/text-overlay — Temporary debug endpoint.
 * Returns diagnostic info about text overlay pipeline for the current user's business.
 * Remove after debugging.
 */
export async function GET() {
  const diagnostics: Record<string, unknown> = {}

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // 1. Get user's business and brand colors
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, brand_primary_color, brand_secondary_color, brand_accent_color')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    diagnostics.business = business
      ? {
          id: business.id,
          name: business.name,
          brand_primary_color: business.brand_primary_color,
          brand_secondary_color: business.brand_secondary_color,
          brand_accent_color: business.brand_accent_color,
          hasPrimaryColor: !!business.brand_primary_color,
        }
      : null

    if (!business) {
      diagnostics.conclusion = 'No business found for this user'
      return NextResponse.json(diagnostics)
    }

    const brandColor = business.brand_primary_color
    diagnostics.brandPrimaryColorTruthy = !!brandColor
    diagnostics.brandPrimaryColorValue = brandColor

    // 2. Test extractHeadline
    const testTopic = 'gourmet tacos and burgers in Maxvorstadt'
    const headline = extractHeadline(testTopic)
    diagnostics.extractHeadline = { topic: testTopic, result: headline, truthy: !!headline }

    // 3. Test color functions
    if (brandColor) {
      try {
        const barColor = adjustAlpha(brandColor, 0.9)
        const textColor = getContrastColor(brandColor)
        diagnostics.colors = { brandColor, barColor, textColor }
      } catch (e) {
        diagnostics.colors = { error: e instanceof Error ? e.message : String(e) }
      }
    } else {
      diagnostics.colors = 'SKIPPED — no brand_primary_color'
      diagnostics.conclusion = 'H1 CONFIRMED: brandPrimaryColor is falsy, overlay is skipped entirely'
    }

    // 4. Test sharp overlay on a tiny test image (1x1 white pixel PNG)
    if (brandColor && headline) {
      try {
        const sharp = (await import('sharp')).default
        const testImg = await sharp({
          create: { width: 256, height: 256, channels: 4, background: { r: 200, g: 200, b: 200, alpha: 1 } }
        }).png().toBuffer()

        diagnostics.sharpTestImageSize = testImg.length

        const result = await addSmartTextOverlay(testImg, {
          headline,
          businessName: business.name,
          brandColor,
        })
        diagnostics.overlayResult = {
          success: true,
          inputSize: testImg.length,
          outputSize: result.length,
          sizeChanged: result.length !== testImg.length,
        }
      } catch (e) {
        diagnostics.overlayResult = {
          success: false,
          error: e instanceof Error ? e.message : String(e),
          stack: e instanceof Error ? e.stack?.split('\n').slice(0, 5) : undefined,
        }
      }
    }

    diagnostics.conclusion = diagnostics.conclusion || 'Check results above to identify the failing step'
  } catch (e) {
    diagnostics.fatalError = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json(diagnostics, { status: 200 })
}
