import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

const BUCKET = 'user-images'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_LIBRARY_IMAGES = 100 // free tier limit

/** Ensure the user-images bucket exists — returns diagnostic info */
async function ensureBucket(): Promise<{ ok: boolean; detail?: string }> {
  const admin = getSupabaseAdmin()
  if (!admin) return { ok: false, detail: 'No admin client (SUPABASE_SERVICE_ROLE_KEY missing?)' }
  try {
    const { error } = await admin.storage.getBucket(BUCKET)
    if (error) {
      const { error: createErr } = await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 50 * 1024 * 1024 })
      if (createErr) return { ok: false, detail: `Bucket create failed: ${createErr.message}` }
      return { ok: true, detail: 'Bucket created' }
    }
    return { ok: true, detail: 'Bucket exists' }
  } catch (e) {
    return { ok: false, detail: `ensureBucket error: ${e instanceof Error ? e.message : String(e)}` }
  }
}

/** GET /api/image-library — list user's images (optionally scoped to a business) */
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const searchParams = request.nextUrl.searchParams
  const tag = searchParams.get('tag')
  const businessId = searchParams.get('business_id')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  let query = supabase
    .from('user_image_library')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (businessId) {
    query = query.eq('business_id', businessId)
  }

  if (tag) {
    query = query.contains('tags', [tag])
  }

  let { data, count, error } = await query

  // Graceful fallback: if the business_id column doesn't exist yet, retry without it
  if (error && businessId && error.message?.includes('business_id')) {
    const retryQuery = supabase
      .from('user_image_library')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (tag) retryQuery.contains('tags', [tag])
    const retry = await retryQuery
    data = retry.data
    count = retry.count
    error = retry.error
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ images: data || [], total: count || 0 })
}

/** POST /api/image-library — upload a new image (multipart/form-data) */
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check library limit
  const { count } = await supabase
    .from('user_image_library')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  if ((count ?? 0) >= MAX_LIBRARY_IMAGES) {
    return NextResponse.json({ error: `Library limit reached (${MAX_LIBRARY_IMAGES} images). Delete some to upload more.` }, { status: 403 })
  }

  const bucketStatus = await ensureBucket()

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const tags = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean)
  const businessId = formData.get('business_id') as string | null

  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'A valid image file is required' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Image must be under 10 MB' }, { status: 400 })
  }

  const ext = file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg'
  const filename = file.name || `image_${Date.now()}.${ext}`
  const storagePath = `${user.id}/${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  const buffer = Buffer.from(await file.arrayBuffer())

  // Use admin client for storage (bypasses RLS)
  const storageClient = getSupabaseAdmin() || supabase
  const { error: uploadError } = await storageClient.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    console.error('Image library upload error:', uploadError)
    // #region agent log
    return NextResponse.json({ error: 'Failed to upload image', _debug: { message: uploadError.message, statusCode: (uploadError as unknown as Record<string,unknown>).statusCode, bucket: BUCKET, path: storagePath, adminAvailable: !!getSupabaseAdmin(), bucketStatus } }, { status: 500 })
    // #endregion
  }

  const { data: urlData } = storageClient.storage.from(BUCKET).getPublicUrl(storagePath)
  const publicUrl = urlData.publicUrl

  // Insert metadata row (try with business_id first, fall back without if column doesn't exist)
  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    storage_path: storagePath,
    public_url: publicUrl,
    filename,
    tags,
    file_size: file.size,
    mime_type: file.type,
  }
  if (businessId) insertPayload.business_id = businessId

  let { data: row, error: insertError } = await supabase
    .from('user_image_library')
    .insert(insertPayload)
    .select()
    .single()

  // Graceful fallback: if business_id column doesn't exist, retry without it
  if (insertError && insertError.message?.includes('business_id')) {
    const { business_id: _removed, ...payloadWithout } = insertPayload
    void _removed
    const retry = await supabase.from('user_image_library').insert(payloadWithout).select().single()
    row = retry.data
    insertError = retry.error
  }

  if (insertError) {
    console.error('Image library insert error:', insertError)
    // Clean up uploaded file
    await storageClient.storage.from(BUCKET).remove([storagePath])
    return NextResponse.json({ error: 'Failed to save image metadata' }, { status: 500 })
  }

  return NextResponse.json({ image: row }, { status: 201 })
}

/** DELETE /api/image-library — delete images by IDs */
export async function DELETE(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const ids: string[] = Array.isArray(body.ids) ? body.ids : [body.id].filter(Boolean)
  if (ids.length === 0) return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })

  // Get storage paths before deleting rows
  const { data: rows } = await supabase
    .from('user_image_library')
    .select('id, storage_path')
    .eq('user_id', user.id)
    .in('id', ids)

  if (!rows?.length) return NextResponse.json({ error: 'No images found' }, { status: 404 })

  // Delete storage files
  const storageClient = getSupabaseAdmin() || supabase
  const paths = rows.map(r => r.storage_path)
  await storageClient.storage.from(BUCKET).remove(paths)

  // Delete metadata rows
  const { error } = await supabase
    .from('user_image_library')
    .delete()
    .eq('user_id', user.id)
    .in('id', ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: ids.length })
}

/** PATCH /api/image-library — update tags for an image */
export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, tags } = body
  if (!id) return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('user_image_library')
    .update({ tags: tags || [], updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ image: data })
}
