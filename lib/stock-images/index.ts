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

/** Get multiple stock image options for the picker (e.g. 5). Uses fallback queries if the first returns fewer than 3. */
export async function getStockImageOptions(
  params: GetStockImageParams,
  count = 5
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

  for (const query of variants) {
    if (results.length >= count) break
    const options = await searchStockImageOptions(query, orientation, count)
    for (const opt of options) {
      if (seen.has(opt.url)) continue
      seen.add(opt.url)
      results.push(opt)
      if (results.length >= count) break
    }
  }

  return results.slice(0, count)
}
