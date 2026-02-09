import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getIndustryTiers, getSearchQueryForTopic, getAllIndustryKeys } from '@/lib/stock-images/keywords'
import {
  generateImage,
  isImageGenerationConfigured,
  hasImageQuota,
  IMAGE_STYLES,
  getIndustrySceneHint,
  INDUSTRY_SCENE_HINTS,
  type ImageStyle,
  type GenerateImageResult,
} from '@/lib/openai/images'

const UNSPLASH_API = 'https://api.unsplash.com'

interface TierResult {
  tier: string
  query: string
  images: Array<{ url: string; photographer: string }>
  totalHits: number
}

/**
 * POST /api/playground/test
 * Run a playground test: fetch stock images for all tiers + optionally generate an AI image.
 * Body: { industry, topic, style, includeAI, sceneHintOverride?, stylePrefixOverride?, brandPrimaryColor? }
 */
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  try {
    const body = await request.json()
    const {
      industry,
      topic,
      style = 'professional',
      includeAI = false,
      sceneHintOverride,
      stylePrefixOverride,
      brandPrimaryColor,
    } = body

    if (!industry?.trim() || !topic?.trim()) {
      return NextResponse.json({ error: 'industry and topic are required' }, { status: 400 })
    }

    // 1. Fetch user overrides for this industry
    const { data: overrides } = await supabase
      .from('image_query_overrides')
      .select('tier, terms')
      .eq('user_id', user.id)
      .eq('industry', industry.trim().toLowerCase())

    const userOverrides: { primary?: string[]; secondary?: string[]; generic?: string[] } = {}
    if (overrides?.length) {
      for (const o of overrides) {
        if (o.tier === 'primary' || o.tier === 'secondary' || o.tier === 'generic') {
          userOverrides[o.tier] = o.terms
        }
      }
    }

    // 2. Get tiered search terms
    const tiers = getIndustryTiers(industry)
    const tierData: Record<string, string[]> = {
      primary: userOverrides.primary || tiers?.primary || [],
      secondary: userOverrides.secondary || tiers?.secondary || [],
      generic: userOverrides.generic || tiers?.generic || [],
    }

    // 3. Fetch stock images for each tier (in parallel)
    const stockResults: TierResult[] = []
    if (accessKey) {
      const tierEntries = Object.entries(tierData).filter(([, terms]) => terms.length > 0)
      const fetches = tierEntries.flatMap(([tier, terms]) => {
        // Pick up to 3 terms per tier for variety
        const selectedTerms = terms.slice(0, 3)
        return selectedTerms.map(async (term) => {
          const query = `${term} ${topic}`.slice(0, 100)
          const params = new URLSearchParams({ query, per_page: '3', orientation: 'squarish' })
          try {
            const res = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
              headers: { Authorization: `Client-ID ${accessKey}` },
              next: { revalidate: 60 },
            })
            if (!res.ok) return { tier, query: term, images: [], totalHits: 0 } as TierResult
            const data = await res.json()
            const images = (data.results ?? []).slice(0, 3).map((photo: { urls: { small: string }; user: { name: string } }) => ({
              url: photo.urls?.small,
              photographer: photo.user?.name || 'Unknown',
            }))
            return { tier, query: term, images, totalHits: data.total ?? 0 } as TierResult
          } catch {
            return { tier, query: term, images: [], totalHits: 0 } as TierResult
          }
        })
      })
      const results = await Promise.all(fetches)
      stockResults.push(...results)
    }

    // 4. Optionally generate AI image
    let aiResult: (GenerateImageResult & { fullPrompt?: string }) | null = null
    let aiError: string | null = null
    if (includeAI) {
      if (!isImageGenerationConfigured()) {
        aiError = 'AI image generation is not configured (missing OPENAI_API_KEY)'
      } else {
        // Check quota
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan, images_generated_this_month')
          .eq('user_id', user.id)
          .single()
        const plan = subscription?.plan || 'free'
        const used = subscription?.images_generated_this_month || 0
        if (!hasImageQuota(plan, used)) {
          aiError = `Image quota reached (${used} used on ${plan} plan)`
        } else {
          try {
            // Fetch AI prompt overrides
            const { data: aiOverrides } = await supabase
              .from('ai_prompt_overrides')
              .select('override_key, override_value')
              .eq('user_id', user.id)
              .in('override_key', [`scene_hint_${industry.trim().toLowerCase()}`, `style_prefix_${style}`])

            let finalSceneHint = sceneHintOverride || undefined
            let finalStylePrefix = stylePrefixOverride || undefined
            if (aiOverrides?.length) {
              for (const o of aiOverrides) {
                if (o.override_key.startsWith('scene_hint_') && !sceneHintOverride) finalSceneHint = o.override_value
                if (o.override_key.startsWith('style_prefix_') && !stylePrefixOverride) finalStylePrefix = o.override_value
              }
            }

            aiResult = await generateImage({
              topic,
              businessName: 'Test',
              industry,
              style: style as ImageStyle,
              contentType: 'social-post',
              brandPrimaryColor,
              sceneHintOverride: finalSceneHint,
              stylePrefixOverride: finalStylePrefix,
            })

            // Increment usage counter
            await supabase
              .from('subscriptions')
              .update({ images_generated_this_month: used + 1 })
              .eq('user_id', user.id)
          } catch (e) {
            aiError = e instanceof Error ? e.message : 'AI generation failed'
          }
        }
      }
    }

    // 5. Build full prompt preview (without actually calling DALL-E)
    const sceneHint = sceneHintOverride || getIndustrySceneHint(industry)
    const styleConfig = IMAGE_STYLES[style as ImageStyle] || IMAGE_STYLES.professional
    const stylePrefix = stylePrefixOverride || styleConfig.promptPrefix

    return NextResponse.json({
      stockResults,
      aiResult,
      aiError,
      promptPreview: {
        sceneHint,
        stylePrefix,
        topic,
        industry,
        style,
      },
      tierTerms: tierData,
      allIndustries: getAllIndustryKeys(),
    })
  } catch (e) {
    console.error('Playground test error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/playground/test?industry=...
 * Returns available industries and tier terms for the dropdown + quick preview.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const industry = searchParams.get('industry')

  const allIndustries = getAllIndustryKeys()
  let tierTerms: { primary: string[]; secondary: string[]; generic: string[] } | null = null
  let sceneHint: string | null = null

  if (industry) {
    const tiers = getIndustryTiers(industry)
    if (tiers) tierTerms = tiers
    sceneHint = getIndustrySceneHint(industry)
  }

  return NextResponse.json({
    allIndustries,
    tierTerms,
    sceneHint,
    styles: Object.entries(IMAGE_STYLES).map(([key, val]) => ({ key, name: val.name, description: val.description })),
  })
}
