import { NextResponse } from 'next/server'
import { addSmartTextOverlay } from '@/lib/image-processing/smart-text-overlay'

/**
 * GET /api/debug/text-overlay — Returns the actual rendered overlay image as PNG.
 * ?mode=image returns PNG directly. Default returns JSON diagnostics.
 * Remove after debugging.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('mode')

  try {
    const sharp = (await import('sharp')).default

    const testImg = await sharp({
      create: { width: 512, height: 512, channels: 4, background: { r: 180, g: 180, b: 180, alpha: 1 } }
    }).png().toBuffer()

    const result = await addSmartTextOverlay(testImg, {
      headline: 'Gourmet Tacos And Burgers',
      businessName: 'FairPlay',
      brandColor: '#0d9488',
    })

    if (mode === 'image') {
      return new Response(new Uint8Array(result), {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' },
      })
    }

    return NextResponse.json({
      inputSize: testImg.length,
      outputSize: result.length,
      sizeChanged: result.length !== testImg.length,
      viewImage: 'Append ?mode=image to see the rendered PNG',
    })
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack?.split('\n').slice(0, 8) : undefined,
    }, { status: 500 })
  }
}
