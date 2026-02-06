/**
 * Stock image provider: Unsplash by default.
 * Use for "Free stock photo" option in content creation (Option C hybrid).
 */

import { getSearchQueryForTopic } from './keywords'
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

/** Get multiple stock image options for the picker (e.g. 5). */
export async function getStockImageOptions(
  params: GetStockImageParams,
  count = 5
): Promise<StockImageResult[]> {
  const { topic, industry, contentType } = params
  const query = getSearchQueryForTopic(topic, industry)
  let orientation: Orientation = 'landscape'
  if (contentType === 'social-pack' || contentType === 'social-post' || contentType === 'gmb-post') {
    orientation = 'squarish'
  } else if (contentType === 'email' || contentType === 'blog-post') {
    orientation = 'landscape'
  }
  return searchStockImageOptions(query, orientation, count)
}
