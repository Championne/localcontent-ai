import { NextResponse } from 'next/server'
import { addSmartTextOverlay } from '@/lib/image-processing/smart-text-overlay'

/**
 * GET /api/debug/text-overlay — Returns the actual rendered overlay image as PNG.
 * This lets us see exactly what Sharp produces on Vercel.
 * Remove after debugging.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('mode') // 'image' returns PNG, default returns JSON

  try {
    const sharp = (await import('sharp')).default

    // Create a 512x512 grey test image
    const testImg = await sharp({
      create: { width: 512, height: 512, channels: 4, background: { r: 180, g: 180, b: 180, alpha: 1 } }
    }).png().toBuffer()

    // Apply our text overlay
    const result = await addSmartTextOverlay(testImg, {
      headline: 'Gourmet Tacos And Burgers',
      businessName: 'FairPlay',
      brandColor: '#0d9488',
    })

    if (mode === 'image') {
      // Return the actual PNG image
      return new Response(result, {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' },
      })
    }

    // Also test a raw SVG composite to isolate the issue
    const svgTest = Buffer.from(`
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="380" width="472" height="90" rx="12" fill="rgba(13,148,136,0.9)"/>
        <text x="256" y="415" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="central">Test Headline Text</text>
        <text x="256" y="445" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="central" opacity="0.95">FAIRPLAY</text>
      </svg>
    `)
    const svgResult = await sharp(testImg).composite([{ input: svgTest, blend: 'over' }]).png().toBuffer()

    // Also test with Pango text input (Sharp's built-in text rendering)
    let pangoResult: Buffer | null = null
    let pangoError: string | null = null
    try {
      const textImage = await sharp({
        text: {
          text: '<span foreground="white" font_desc="sans-serif bold 28">Gourmet Tacos And Burgers</span>',
          rgba: true,
          width: 472,
          height: 50,
        }
      }).png().toBuffer()
      pangoResult = await sharp(testImg)
        .composite([
          { input: svgTest, blend: 'over' },  // bar background
        ])
        .png().toBuffer()
      // Just check if pango text renders
      const pangoMeta = await sharp(textImage).metadata()
      pangoError = null
      return NextResponse.json({
        svgOverlay: { size: result.length, changed: result.length !== testImg.length },
        rawSvgOverlay: { size: svgResult.length, changed: svgResult.length !== testImg.length },
        pangoText: { success: true, width: pangoMeta.width, height: pangoMeta.height, size: textImage.length },
        viewImage: '?mode=image  — open this URL to see the actual rendered image',
        viewSvgRaw: '?mode=svgraw — see raw SVG composite',
        viewPango: '?mode=pango — see Pango text rendering',
      })
    } catch (e) {
      pangoError = e instanceof Error ? e.message : String(e)
    }

    return NextResponse.json({
      svgOverlay: { size: result.length, changed: result.length !== testImg.length },
      rawSvgOverlay: { size: svgResult.length, changed: svgResult.length !== testImg.length },
      pangoText: pangoError ? { success: false, error: pangoError } : { success: true },
      viewImage: '?mode=image  — append to URL to see the actual rendered image',
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
