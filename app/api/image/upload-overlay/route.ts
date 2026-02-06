import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const BUCKET = 'generated-images'

/** POST: upload an overlay image (e.g. text-on-image) and return public URL */
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Missing or invalid image file' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.type.includes('png') ? 'png' : 'jpg'
    const filename = `${user.id}/overlay_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload overlay error:', uploadError)
      return NextResponse.json({ error: 'Failed to save image' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename)
    return NextResponse.json({ url: urlData.publicUrl, success: true })
  } catch (error) {
    console.error('Upload overlay error:', error)
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
  }
}
