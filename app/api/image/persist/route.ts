import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const BUCKET = 'generated-images'

/**
 * POST /api/image/persist
 *
 * Takes an external image URL (e.g. DALL-E, Unsplash), downloads it server-side,
 * uploads it to Supabase Storage, and returns a persistent public URL that never
 * expires.  This prevents "Failed to fetch base image" errors when re-applying
 * branding to an image whose original URL has expired.
 */
export async function POST(request: Request) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { imageUrl } = await request.json()

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    // If already a Supabase Storage URL, return it as-is (already persistent)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    if (supabaseUrl && imageUrl.includes(supabaseUrl)) {
      return NextResponse.json({ url: imageUrl })
    }

    // Fetch the external image
    const fetchOpts: RequestInit = {
      headers: { 'User-Agent': 'GeoSpark-ImagePersist/1.0 (https://geospark.ai)' },
    }
    const response = await fetch(imageUrl, fetchOpts)
    if (!response.ok) {
      console.error('Persist: failed to fetch external image', response.status, imageUrl.slice(0, 120))
      return NextResponse.json(
        { error: `Failed to fetch image (HTTP ${response.status}). The image URL may have expired.` },
        { status: 502 },
      )
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Image is empty' }, { status: 400 })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const filename = `${user.id}/base_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, { contentType, cacheControl: '3600', upsert: true })

    if (uploadError) {
      console.error('Persist: upload error', uploadError.message ?? uploadError)
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload image to storage' },
        { status: 500 },
      )
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename)
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Persist: unexpected error', error)
    return NextResponse.json({ error: 'Failed to persist image' }, { status: 500 })
  }
}
