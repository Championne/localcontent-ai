import { NextResponse } from 'next/server'
import { smartBackgroundRemoval } from '@/lib/image-processing/background-removal'

/**
 * POST /api/debug/product-image — Test product image processing.
 * Send a small test image and see if background removal works on Vercel.
 * Remove after debugging.
 */
export async function POST(request: Request) {
  const diagnostics: Record<string, unknown> = {}

  try {
    const body = await request.json()
    const { productImage } = body as { productImage?: string }

    diagnostics.hasProductImage = !!productImage
    diagnostics.productImageLength = productImage?.length || 0

    if (!productImage) {
      diagnostics.error = 'No productImage in request body'
      return NextResponse.json(diagnostics)
    }

    // Step 1: Decode base64
    try {
      const base64Data = productImage.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      diagnostics.decodedBufferSize = buffer.length
      diagnostics.step1_decode = 'OK'
    } catch (e) {
      diagnostics.step1_decode = { error: e instanceof Error ? e.message : String(e) }
      return NextResponse.json(diagnostics)
    }

    // Step 2: Background removal
    try {
      const base64Data = productImage.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const { buffer: transparent, method } = await smartBackgroundRemoval(buffer)
      diagnostics.step2_bgRemoval = {
        success: true,
        method,
        inputSize: buffer.length,
        outputSize: transparent.length,
      }
    } catch (e) {
      diagnostics.step2_bgRemoval = {
        success: false,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack?.split('\n').slice(0, 5) : undefined,
      }
    }

    diagnostics.conclusion = 'Check step2_bgRemoval for the issue'
  } catch (e) {
    diagnostics.fatalError = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json(diagnostics)
}

/**
 * GET — simple check that the endpoint exists and background-removal module loads.
 */
export async function GET() {
  try {
    // Just check if the module loads
    await import('@/lib/image-processing/background-removal')
    return NextResponse.json({ status: 'ok', message: 'Product image debug endpoint ready. POST with { productImage: "data:image/..." } to test.' })
  } catch (e) {
    return NextResponse.json({ status: 'error', error: e instanceof Error ? e.message : String(e) })
  }
}
