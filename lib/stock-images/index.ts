/**
 * Stock image provider — DISABLED.
 * Unsplash integration has been removed. All functions return empty results.
 * AI image generation (DALL-E) is the sole image source.
 */

export { getSearchQueryForTopic, getSearchQueryVariants } from './keywords'
export { getAllIndustryKeys, getIndustryTiers, getIndustrySearchTerms } from './keywords'
export type { IndustryQueryConfig } from './keywords'

export interface StockImageResult {
  url: string
  attribution: string
  photographerName: string
  photographerUrl: string
  downloadLocation?: string
}

export function isStockImageConfigured(): boolean {
  return false
}

export interface GetStockImageParams {
  topic: string
  industry: string
  contentType?: string
}

export async function getStockImage(_params: GetStockImageParams): Promise<StockImageResult | null> {
  return null
}

export async function getStockImageOptions(
  _params: GetStockImageParams,
  _count = 3,
  _page = 1,
  _usedUrls: string[] = [],
  _queryOverrides?: { primary?: string[]; secondary?: string[]; generic?: string[] }
): Promise<StockImageResult[]> {
  return []
}
