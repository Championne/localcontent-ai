import { NextResponse } from 'next/server'

const UNSPLASH_API = 'https://api.unsplash.com'

/**
 * GET /api/image-queries/preview?query=...&orientation=squarish
 * Returns 4 sample images + total hit count from Unsplash.
 * Used by the dashboard preview panel.
 */
export async function GET(request: Request) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    return NextResponse.json({ images: [], totalHits: 0 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.trim()
  const orientation = searchParams.get('orientation') || 'squarish'
  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  try {
    const params = new URLSearchParams({
      query: query.slice(0, 100),
      per_page: '4',
      orientation,
    })
    const res = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 120 },
    })
    if (!res.ok) {
      console.error('Unsplash preview error:', res.status)
      return NextResponse.json({ images: [], totalHits: 0 })
    }
    const data = await res.json()
    const totalHits = data.total ?? 0
    const images = (data.results ?? []).slice(0, 4).map((photo: { urls: { small: string }; user: { name: string } }) => ({
      url: photo.urls?.small,
      photographer: photo.user?.name || 'Unknown',
    }))

    return NextResponse.json({ images, totalHits })
  } catch (e) {
    console.error('Preview fetch error:', e)
    return NextResponse.json({ images: [], totalHits: 0 })
  }
}
