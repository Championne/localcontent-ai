import { NextResponse } from 'next/server'
import { getStockImageOptions, isStockImageConfigured } from '@/lib/stock-images'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/stock-images?topic=...&industry=...&contentType=...&page=1&usedUrls=url1,url2
 * Returns 3 stock image options for Step 3 "Choose your image".
 * usedUrls: comma-separated list of previously-shown URLs for session dedup.
 * If user is logged in, applies their image query overrides from Supabase.
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
  const usedUrlsRaw = searchParams.get('usedUrls')?.trim() || ''
  const usedUrls = usedUrlsRaw ? usedUrlsRaw.split(',').filter(Boolean) : []
  if (!topic || !industry) {
    return NextResponse.json({ error: 'topic and industry are required' }, { status: 400 })
  }

  // Optionally fetch user's query overrides for this industry
  let queryOverrides: { primary?: string[]; secondary?: string[]; generic?: string[] } | undefined
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const industryKey = industry.trim().toLowerCase()
      const { data: overrides } = await supabase
        .from('image_query_overrides')
        .select('tier, queries')
        .eq('user_id', user.id)
        .eq('industry_key', industryKey)
      if (overrides && overrides.length > 0) {
        queryOverrides = {}
        for (const ov of overrides) {
          if (ov.tier === 'primary') queryOverrides.primary = ov.queries
          else if (ov.tier === 'secondary') queryOverrides.secondary = ov.queries
          else if (ov.tier === 'generic') queryOverrides.generic = ov.queries
        }
      }
    }
  } catch {
    // Non-critical: continue without overrides
  }

  try {
    const options = await getStockImageOptions(
      { topic, industry, contentType },
      3,
      page,
      usedUrls,
      queryOverrides
    )
    return NextResponse.json({ options })
  } catch (e) {
    console.error('Stock images fetch error:', e)
    return NextResponse.json({ options: [] })
  }
}
