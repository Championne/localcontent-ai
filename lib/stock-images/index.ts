/**
 * Stock image provider: Unsplash by default.
 * Use for "Free stock photo" option in content creation (Option C hybrid).
 */

import { getSearchQueryForTopic, getSearchQueryVariants } from './keywords'
import { searchStockImage, searchStockImageOptions, type Orientation, type StockImageResult } from './unsplash'

export { getSearchQueryForTopic, getSearchQueryVariants } from './keywords'
export type { StockImageResult } from './unsplash'

export function isStockImageConfigured(): boolean {
  return !!process.env.UNSPLASH_ACCESS_KEY
}

export interface GetStockImageParams {
  topic: string
  industry: string
  contentType?: string // blog-post -> landscape, social-post -> squarish
}

/**
 * Get one stock image for the given topic + industry.
 * Maps content type to orientation (blog = landscape, social = squarish).
 */
export async function getStockImage(params: GetStockImageParams): Promise<StockImageResult | null> {
  const { topic, industry, contentType } = params
  const query = getSearchQueryForTopic(topic, industry)
  let orientation: Orientation = 'landscape'
  if (contentType === 'social-pack' || contentType === 'social-post' || contentType === 'gmb-post') {
    orientation = 'squarish'
  } else if (contentType === 'email' || contentType === 'blog-post') {
    orientation = 'landscape'
  }
  return searchStockImage(query, orientation)
}

/** Max results to request per query (Unsplash allows 10 per request). */
const PER_QUERY_PAGE_SIZE = 10

/**
 * Get multiple stock image options for the picker.
 * Uses multiple query variants and takes a few results from each so variety is better
 * (e.g. for HVAC we mix "HVAC technician", "air conditioning unit", "furnace" instead of 3 from one search).
 * page > 1 returns different results.
 */
export async function getStockImageOptions(
  params: GetStockImageParams,
  count = 5,
  page = 1
): Promise<StockImageResult[]> {
  const { topic, industry, contentType } = params
  const variants = getSearchQueryVariants(topic, industry)
  let orientation: Orientation = 'landscape'
  if (contentType === 'social-pack' || contentType === 'social-post' || contentType === 'gmb-post') {
    orientation = 'squarish'
  } else if (contentType === 'email' || contentType === 'blog-post') {
    orientation = 'landscape'
  }

  const seen = new Set<string>()
  const results: StockImageResult[] = []

  // Take up to 2 results per variant so we mix different search phrases (e.g. HVAC technician + AC unit + furnace)
  const perVariant = Math.max(1, Math.min(2, count))
  for (const query of variants) {
    if (results.length >= count) break
    const need = count - results.length
    const toFetch = Math.min(perVariant, need, PER_QUERY_PAGE_SIZE)
    const options = await searchStockImageOptions(query, orientation, toFetch, page)
    for (const opt of options) {
      if (seen.has(opt.url)) continue
      seen.add(opt.url)
      results.push(opt)
      if (results.length >= count) break
    }
  }

  // If we still need more, do a second pass with larger per-query fetch from first variant
  if (results.length < count && variants.length > 0) {
    const options = await searchStockImageOptions(variants[0], orientation, PER_QUERY_PAGE_SIZE, page)
    for (const opt of options) {
      if (seen.has(opt.url)) continue
      seen.add(opt.url)
      results.push(opt)
      if (results.length >= count) break
    }
  }

  // Final dedupe by URL so we never return duplicates (e.g. from API quirks)
  const byUrl = new Map<string, StockImageResult>()
  for (const r of results) byUrl.set(r.url, r)
  return Array.from(byUrl.values()).slice(0, count)
}
