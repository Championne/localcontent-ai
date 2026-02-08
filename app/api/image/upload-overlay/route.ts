import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const BUCKET = 'generated-images'
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

function getUploadErrorMessage(err: unknown): string {
  const msg =
    typeof err === 'object' && err !== null
      ? (err as { message?: string; error?: string }).message ??
        (err as { message?: string; error?: string }).error ??
        ''
      : String(err ?? '')
  const s = (typeof msg === 'string' ? msg : '').toLowerCase()
  if (s.includes('bucket') && (s.includes('not found') || s.includes('not exist'))) {
    return 'Storage bucket is not set up. Create a bucket named "generated-images" in Supabase Storage (Public) and run the storage RLS policy script.'
  }
  if (s.includes('row-level security') || s.includes('policy') || s.includes('violates')) {
    return 'Permission denied. Ensure storage RLS policies for "generated-images" are applied, then try signing out and back in.'
  }
  if (s.includes('payload too large') || s.includes('entity too large') || s.includes('file size')) {
    return 'Image is too large. Use an image under 10 MB.'
  }
  if (s.includes('unauthorized') || s.includes('jwt') || s.includes('session')) {
    return 'Session expired. Please sign out and sign back in, then try again.'
  }
  return msg && msg.length > 0 ? msg : 'Failed to save image'
}

/** POST: upload an overlay image (e.g. text-on-image or "Upload your own") and return public URL */
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file || !(file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp)$/i.test(file.name))) {
      return NextResponse.json({ error: 'Please choose an image file (JPEG, PNG, GIF, or WebP).' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    if (buffer.length > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image is too large. Use an image under 10 MB.' }, { status: 400 })
    }
    if (buffer.length === 0) {
      return NextResponse.json({ error: 'File is empty.' }, { status: 400 })
    }

    const ext = file.type.includes('png') ? 'png' : file.type.includes('gif') ? 'gif' : file.type.includes('webp') ? 'webp' : 'jpg'
    const contentType = file.type.startsWith('image/') ? file.type : ext === 'png' ? 'image/png' : 'image/jpeg'
    const filename = `${user.id}/overlay_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload overlay error:', uploadError.message ?? uploadError, uploadError)
      const message = getUploadErrorMessage(uploadError)
      return NextResponse.json({ error: message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename)
    return NextResponse.json({ url: urlData.publicUrl, success: true })
  } catch (error) {
    console.error('Upload overlay error:', error)
    const message = getUploadErrorMessage(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
