import { NextResponse } from 'next/server'
import { getStockImageOptions, isStockImageConfigured } from '@/lib/stock-images'

/**
 * GET /api/stock-images?topic=...&industry=...&contentType=...
 * Returns 3 stock image options for Step 3 "Choose your image".
 */
export async function GET(request: Request) {
  if (!isStockImageConfigured()) {
    return NextResponse.json({ options: [] })
  }
  const { searchParams } = new URL(request.url)
  const topic = searchParams.get('topic')?.trim()
  const industry = searchParams.get('industry')?.trim()
  const contentType = searchParams.get('contentType')?.trim() || 'social-post'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  if (!topic || !industry) {
    return NextResponse.json({ error: 'topic and industry are required' }, { status: 400 })
  }
  try {
    const options = await getStockImageOptions(
      { topic, industry, contentType },
      3,
      page
    )
    return NextResponse.json({ options })
  } catch (e) {
    console.error('Stock images fetch error:', e)
    return NextResponse.json({ options: [] })
  }
}
