/**
 * Unsplash API client for stock photos.
 * Requires UNSPLASH_ACCESS_KEY in env. Attribution: "Photo by X on Unsplash".
 */

const UNSPLASH_API = 'https://api.unsplash.com'

export interface StockImageResult {
  url: string
  attribution: string
  photographerName: string
  photographerUrl: string
  downloadLocation?: string
}

export type Orientation = 'landscape' | 'portrait' | 'squarish'

function getClient(): string {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) throw new Error('UNSPLASH_ACCESS_KEY is not set')
  return key
}

export async function searchStockImage(
  query: string,
  orientation?: Orientation
): Promise<StockImageResult | null> {
  const accessKey = getClient()
  const params = new URLSearchParams({
    query: query.slice(0, 100),
    per_page: '10',
    orientation: orientation || 'landscape',
  })
  const res = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${accessKey}` },
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    console.error('Unsplash API error:', res.status, await res.text())
    return null
  }
  const data = await res.json()
  const results = data.results as Array<{
    urls: { regular: string; small: string }
    user: { name: string; links: { html: string } }
    links: { download_location?: string }
  }>
  if (!results?.length) return null
  const photo = results[0]
  const url = photo.urls.regular || photo.urls.small
  const name = photo.user?.name || 'Unknown'
  const userLink = photo.user?.links?.html || 'https://unsplash.com'
  return {
    url,
    attribution: `Photo by ${name} on Unsplash`,
    photographerName: name,
    photographerUrl: userLink,
    downloadLocation: photo.links?.download_location,
  }
}

/** Return multiple results for a picker (e.g. 5). Same shape as searchStockImage. */
export async function searchStockImageOptions(
  query: string,
  orientation?: Orientation,
  count = 5
): Promise<StockImageResult[]> {
  const accessKey = getClient()
  const params = new URLSearchParams({
    query: query.slice(0, 100),
    per_page: String(Math.min(10, Math.max(1, count))),
    orientation: orientation || 'landscape',
  })
  const res = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${accessKey}` },
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    console.error('Unsplash API error:', res.status, await res.text())
    return []
  }
  const data = await res.json()
  const results = data.results as Array<{
    urls: { regular: string; small: string }
    user: { name: string; links: { html: string } }
    links: { download_location?: string }
  }>
  if (!results?.length) return []
  return results.slice(0, count).map((photo) => {
    const url = photo.urls.regular || photo.urls.small
    const name = photo.user?.name || 'Unknown'
    const userLink = photo.user?.links?.html || 'https://unsplash.com'
    return {
      url,
      attribution: `Photo by ${name} on Unsplash`,
      photographerName: name,
      photographerUrl: userLink,
      downloadLocation: photo.links?.download_location,
    }
  })
}
