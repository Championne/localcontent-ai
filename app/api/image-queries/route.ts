import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllIndustryKeys, getIndustryTiers } from '@/lib/stock-images/keywords'

/**
 * GET /api/image-queries
 * Returns merged config (code defaults + user overrides) for all industries.
 *
 * PUT /api/image-queries
 * Body: { industry_key, tier, queries: string[] }
 * Saves override for a specific industry + tier.
 *
 * DELETE /api/image-queries
 * Body: { industry_key, tier }
 * Removes override (reverts to code default).
 */
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch user overrides
  const { data: overrides } = await supabase
    .from('image_query_overrides')
    .select('industry_key, tier, queries')
    .eq('user_id', user.id)

  // Build merged config for every industry
  const allKeys = getAllIndustryKeys()
  const overrideMap = new Map<string, Record<string, string[]>>()
  for (const ov of overrides ?? []) {
    if (!overrideMap.has(ov.industry_key)) overrideMap.set(ov.industry_key, {})
    overrideMap.get(ov.industry_key)![ov.tier] = ov.queries
  }

  const industries = allKeys.map(key => {
    const defaults = getIndustryTiers(key)
    const userOv = overrideMap.get(key) ?? {}
    return {
      key,
      primary: userOv.primary ?? defaults?.primary ?? [],
      secondary: userOv.secondary ?? defaults?.secondary ?? [],
      generic: userOv.generic ?? defaults?.generic ?? [],
      hasOverrides: {
        primary: !!userOv.primary,
        secondary: !!userOv.secondary,
        generic: !!userOv.generic,
      },
    }
  })

  return NextResponse.json({ industries })
}

export async function PUT(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { industry_key, tier, queries } = body as { industry_key: string; tier: string; queries: string[] }
  if (!industry_key || !tier || !Array.isArray(queries)) {
    return NextResponse.json({ error: 'industry_key, tier, and queries[] are required' }, { status: 400 })
  }
  if (!['primary', 'secondary', 'generic'].includes(tier)) {
    return NextResponse.json({ error: 'tier must be primary, secondary, or generic' }, { status: 400 })
  }

  const { error } = await supabase
    .from('image_query_overrides')
    .upsert({
      user_id: user.id,
      industry_key,
      tier,
      queries,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,industry_key,tier' })

  if (error) {
    console.error('Upsert image_query_overrides error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { industry_key, tier } = body as { industry_key: string; tier: string }
  if (!industry_key || !tier) {
    return NextResponse.json({ error: 'industry_key and tier are required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('image_query_overrides')
    .delete()
    .eq('user_id', user.id)
    .eq('industry_key', industry_key)
    .eq('tier', tier)

  if (error) {
    console.error('Delete image_query_overrides error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
