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

    // 1. Get ALL user businesses and brand colors
    const { data: allBusinesses } = await supabase
      .from('businesses')
      .select('id, name, brand_primary_color, brand_secondary_color, brand_accent_color')
      .eq('user_id', user.id)

    diagnostics.allBusinesses = (allBusinesses || []).map(b => ({
      id: b.id,
      name: b.name,
      brand_primary_color: b.brand_primary_color,
      brand_secondary_color: b.brand_secondary_color,
      brand_accent_color: b.brand_accent_color,
      hasPrimaryColor: !!b.brand_primary_color,
    }))

    const business = allBusinesses?.[0]
    if (!business) {
      diagnostics.conclusion = 'No business found for this user'
      return NextResponse.json(diagnostics)
    }

    // Test with the LAST business (FairPlay) to match the user's active business
    const testBusiness = allBusinesses?.find(b => b.name === 'FairPlay') || business
    diagnostics.testingBusiness = testBusiness.name

    const brandColor = testBusiness.brand_primary_color
    diagnostics.rawBrandColor = brandColor
    diagnostics.effectiveBrandColor = brandColor || '#0d9488'
    diagnostics.brandPrimaryColorTruthy = !!brandColor
    diagnostics.brandPrimaryColorValue = brandColor

    // 2. Test extractHeadline
    const testTopic = 'gourmet tacos and burgers in Maxvorstadt'
    const headline = extractHeadline(testTopic)
    diagnostics.extractHeadline = { topic: testTopic, result: headline, truthy: !!headline }

    // 3. Test color functions with effective color (fallback to teal like generate route does)
    const effectiveColor = brandColor || '#0d9488'
    try {
      const barColor = adjustAlpha(effectiveColor, 0.9)
      const textColor = getContrastColor(effectiveColor)
      diagnostics.colors = { effectiveColor, barColor, textColor, rawWasNull: !brandColor }
    } catch (e) {
      diagnostics.colors = { error: e instanceof Error ? e.message : String(e) }
    }

    // 4. Test sharp overlay on a test image
    if (headline) {
      try {
        const sharp = (await import('sharp')).default
        const testImg = await sharp({
          create: { width: 256, height: 256, channels: 4, background: { r: 200, g: 200, b: 200, alpha: 1 } }
        }).png().toBuffer()

        diagnostics.sharpTestImageSize = testImg.length

        const result = await addSmartTextOverlay(testImg, {
          headline,
          businessName: testBusiness.name,
          brandColor: effectiveColor,
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
