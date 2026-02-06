import { NextRequest, NextResponse } from 'next/server'

/**
 * Trigger Unsplash download event when a user uses a photo (required for production).
 * Unsplash API guidelines: GET the photo's download_location URL with client_id when the user uses the image.
 * @see https://unsplash.com/documentation#track-a-photo-download
 */
export async function POST(request: NextRequest) {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) {
    return NextResponse.json({ error: 'Unsplash not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const downloadLocation = body?.downloadLocation as string | undefined
    if (!downloadLocation || typeof downloadLocation !== 'string') {
      return NextResponse.json({ error: 'downloadLocation required' }, { status: 400 })
    }
    if (!downloadLocation.startsWith('https://api.unsplash.com/')) {
      return NextResponse.json({ error: 'Invalid downloadLocation' }, { status: 400 })
    }

    const url = `${downloadLocation}?client_id=${key}`
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      console.warn('Unsplash trigger-download non-OK:', res.status)
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Unsplash trigger-download error:', e)
    return NextResponse.json({ error: 'Failed to trigger download' }, { status: 500 })
  }
}
