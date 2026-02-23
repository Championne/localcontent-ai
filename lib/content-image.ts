import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

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

/** Ensure the storage bucket exists. Creates it (public, 50MB limit) if missing. */
async function ensureBucket(client: SupabaseClient): Promise<boolean> {
  try {
    const { error } = await client.storage.getBucket(BUCKET)
    if (!error) return true
    // Bucket doesn't exist — create it
    const { error: createErr } = await client.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024, // 50 MB
    })
    if (createErr) {
      console.error('Failed to create storage bucket:', createErr.message)
      return false
    }
    console.log(`Created storage bucket: ${BUCKET}`)
    return true
  } catch (e) {
    console.error('ensureBucket error:', e)
    return false
  }
}

/**
 * Fetches an image from a URL and uploads it to Supabase Storage so the URL is permanent.
 * Uses the service-role admin client when available (bypasses RLS for storage).
 * Returns the public URL, or null on failure (caller can keep the original URL).
 */
export async function persistContentImage(
  supabase: SupabaseClient,
  userId: string,
  imageUrl: string
): Promise<string | null> {
  // Prefer the admin client for storage operations (bypasses RLS, can create bucket)
  const storageClient = getSupabaseAdmin() || supabase

  try {
    // Ensure the bucket exists before attempting upload
    const bucketReady = await ensureBucket(storageClient)
    if (!bucketReady) {
      console.error('Storage bucket not available, cannot persist image')
      return null
    }

    let buffer: Buffer
    let contentType: string

    if (imageUrl.startsWith('data:')) {
      // Decode data URL directly — no fetch needed
      const match = imageUrl.match(/^data:(image\/\w+);base64,(.+)$/)
      if (!match) {
        console.error('persistContentImage: invalid data URL format')
        return null
      }
      contentType = match[1]
      buffer = Buffer.from(match[2], 'base64')
    } else {
      const res = await fetch(imageUrl, {
        headers: { 'User-Agent': 'GeoSpark-ContentImage/1.0 (https://geospark.app)' },
        cache: 'no-store',
      })
      if (!res.ok) {
        console.error(`persistContentImage: download failed (${res.status}) for ${imageUrl.slice(0, 120)}`)
        return null
      }
      contentType = res.headers.get('content-type') || 'image/png'
      buffer = Buffer.from(await res.arrayBuffer())
    }
    if (buffer.length === 0) {
      console.error('persistContentImage: downloaded image is empty')
      return null
    }
    const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : contentType.includes('webp') ? 'webp' : 'png'
    const filename = `${userId}/content_${Date.now()}.${ext}`

    const { error: uploadError } = await storageClient.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: contentType.startsWith('image/') ? contentType : 'image/png',
        cacheControl: '31536000',
        upsert: true,
      })

    if (uploadError) {
      console.error('Content image persist upload error:', uploadError.message)
      return null
    }

    const { data: urlData } = storageClient.storage.from(BUCKET).getPublicUrl(filename)
    return urlData.publicUrl
  } catch (e) {
    console.error('Content image persist error:', e)
    return null
  }
}
