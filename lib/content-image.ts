import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'generated-images'

/** Returns true if the URL is likely temporary (e.g. DALL-E) and should be persisted. */
export function isTemporaryImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return false
  // Already stored in our Supabase storage — don't re-upload
  if (url.includes('supabase.co/storage') || url.includes('supabase.com/storage')) return false
  // Data URLs are permanent
  if (url.startsWith('data:')) return false
  return true
}

/**
 * Fetches an image from a URL and uploads it to Supabase Storage so the URL is permanent.
 * Returns the public URL, or null on failure (caller can keep the original URL).
 */
export async function persistContentImage(
  supabase: SupabaseClient,
  userId: string,
  imageUrl: string
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, { next: { revalidate: 0 } })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || 'image/png'
    const buffer = Buffer.from(await res.arrayBuffer())
    const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png'
    const filename = `${userId}/content_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: contentType.startsWith('image/') ? contentType : 'image/png',
        cacheControl: '31536000',
        upsert: true,
      })

    if (uploadError) {
      console.error('Content image persist upload error:', uploadError)
      return null
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename)
    return urlData.publicUrl
  } catch (e) {
    console.error('Content image persist error:', e)
    return null
  }
}
