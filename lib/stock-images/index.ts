/**
 * Stock image provider: Unsplash by default.
 * Uses tiered query rotation so regenerate always returns fresh images.
 */

import { getSearchQueryForTopic, getSearchQueryVariants } from './keywords'
import { searchStockImage, searchStockImageOptions, type Orientation, type StockImageResult } from './unsplash'

export { getSearchQueryForTopic, getSearchQueryVariants } from './keywords'
export { getAllIndustryKeys, getIndustryTiers, getIndustrySearchTerms } from './keywords'
export type { IndustryQueryConfig } from './keywords'
export type { StockImageResult } from './unsplash'

export function isStockImageConfigured(): boolean {
  return !!process.env.UNSPLASH_ACCESS_KEY
}

function getOrientation(contentType?: string): Orientation {
  if (contentType === 'social-pack' || contentType === 'social-post') return 'squarish'
  if (contentType === 'gmb-post') return 'landscape' // Google recommends 4:3 (720x540) for GBP posts
  if (contentType === 'email' || contentType === 'blog-post') return 'landscape'
  return 'landscape'
}

export interface GetStockImageParams {
  topic: string
  industry: string
  contentType?: string
}

/**
 * Get one stock image for the given topic + industry.
 */
export async function getStockImage(params: GetStockImageParams): Promise<StockImageResult | null> {
  const { topic, industry, contentType } = params
  const query = getSearchQueryForTopic(topic, industry)
  return searchStockImage(query, getOrientation(contentType))
}

/** Max results to request per query (Unsplash allows 10 per request). */
const PER_QUERY_PAGE_SIZE = 10

/**
 * Get multiple stock image options for the picker.
 * Uses tiered rotation: each page offset selects different query terms.
 * usedUrls: URLs the client has already seen (session dedup).
 */
export async function getStockImageOptions(
  params: GetStockImageParams,
  count = 3,
  page = 1,
  usedUrls: string[] = [],
  queryOverrides?: { primary?: string[]; secondary?: string[]; generic?: string[] }
): Promise<StockImageResult[]> {
  const { topic, industry, contentType } = params
  const variants = getSearchQueryVariants(topic, industry, page, queryOverrides)
  const orientation = getOrientation(contentType)

  const seen = new Set<string>(usedUrls)
  const results: StockImageResult[] = []

  // Take 1 result per variant for maximum diversity across terms
  for (const query of variants) {
    if (results.length >= count) break
    // Use different Unsplash pages for variety: page 1 for first request, higher for regenerate
    const unsplashPage = Math.max(1, Math.ceil(page / 2))
    const options = await searchStockImageOptions(query, orientation, 3, unsplashPage)
    for (const opt of options) {
      if (seen.has(opt.url)) continue
      seen.add(opt.url)
      results.push(opt)
      if (results.length >= count) break
    }
  }

  // If we still need more, try a broader search with the first variant on a different page
  if (results.length < count && variants.length > 0) {
    const fallbackPage = page + 2
    const options = await searchStockImageOptions(variants[0], orientation, PER_QUERY_PAGE_SIZE, fallbackPage)
    for (const opt of options) {
      if (seen.has(opt.url)) continue
      seen.add(opt.url)
      results.push(opt)
      if (results.length >= count) break
    }
  }

  return results.slice(0, count)
}
