import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isTemporaryImageUrl, persistContentImage } from '@/lib/content-image'

/** Returns true if a URL points to permanent Supabase storage */
function isPermanentUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false
  return url.includes('supabase.co/storage') || url.includes('supabase.com/storage')
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const template = searchParams.get('template')
    const status = searchParams.get('status')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let query = supabase
      .from('content')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (template) {
      query = query.eq('template', template)
    }
    if (status) {
      // Support comma-separated statuses
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean)
      if (statuses.length === 1) {
        query = query.eq('status', statuses[0])
      } else if (statuses.length > 1) {
        query = query.in('status', statuses)
      }
    }
    if (from) {
      query = query.or(`scheduled_for.gte.${from},published_at.gte.${from}`)
    }
    if (to) {
      query = query.or(`scheduled_for.lte.${to},published_at.lte.${to}`)
    }

    const { data: contentList, error } = await query

    if (error) {
      console.error('Content fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const list = contentList || []

    // --- Resolve image URLs: ensure every content item has a permanent, loadable image ---
    // Step 1: Identify items missing an image or having a non-permanent URL
    const allIds = list.map((c: { id: string }) => c.id)
    const idsNeedingImage = list.filter((c: { metadata?: { image_url?: string }; image_url?: string }) => {
      const meta = c.metadata as { image_url?: string } | undefined
      const url = meta?.image_url || (c as { image_url?: string }).image_url
      return !url || !isPermanentUrl(url)
    }).map((c: { id: string }) => c.id)

    // Step 2: Look up ALL generated_images for this user's content (not just missing ones)
    // so we can always prefer a permanent URL over a possibly-expired one
    let imageByContentId = new Map<string, string>()
    if (allIds.length > 0) {
      const { data: images } = await supabase
        .from('generated_images')
        .select('content_id, image_url')
        .eq('user_id', user.id)
        .in('content_id', allIds)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })

      // Build map: strongly prefer permanent (Supabase) URLs
      for (const row of images || []) {
        if (row.content_id && !imageByContentId.has(row.content_id) && isPermanentUrl(row.image_url)) {
          imageByContentId.set(row.content_id, row.image_url)
        }
      }
      // Fallback pass: if no permanent URL found yet, use any URL from generated_images
      for (const row of images || []) {
        if (row.content_id && !imageByContentId.has(row.content_id) && row.image_url) {
          imageByContentId.set(row.content_id, row.image_url)
        }
      }
    }

    // Step 3: Merge best image URLs into the content list
    const result = list.map((c: { id: string; metadata?: Record<string, unknown>; image_url?: string }) => {
      const meta = (c.metadata || {}) as { image_url?: string }
      const currentUrl = meta.image_url || c.image_url || null
      const genImgUrl = imageByContentId.get(c.id)

      // Determine the best URL: permanent current > permanent generated > any current > any generated
      let bestUrl = currentUrl
      if (!bestUrl || !isPermanentUrl(bestUrl)) {
        if (genImgUrl && isPermanentUrl(genImgUrl)) {
          bestUrl = genImgUrl
        } else if (!bestUrl && genImgUrl) {
          bestUrl = genImgUrl
        }
      }

      // If we found a better URL, update metadata (and persist to DB in background)
      if (bestUrl && bestUrl !== currentUrl) {
        const updatedMeta = { ...(c.metadata || {}), image_url: bestUrl }
        // Fire-and-forget: update the metadata in the DB so next load is instant
        supabase.from('content').update({ metadata: updatedMeta, updated_at: new Date().toISOString() }).eq('id', c.id).then(() => {})
        return { ...c, metadata: updatedMeta }
      }
      return c
    })

    // Step 4: Ensure every item has top-level image_url for Spark Library / clients
    const withTopLevelImage = (result as { metadata?: { image_url?: string }; image_url?: string }[]).map((c) => ({
      ...c,
      image_url: (c.metadata as { image_url?: string } | undefined)?.image_url ?? c.image_url ?? null,
    }))
    return NextResponse.json({ content: withTopLevelImage })
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, template, metadata = {}, status = 'draft', business_id, image_url, image_style, platforms, generated_image_id, generated_text_id } = body

    if (!content || !template) {
      return NextResponse.json({ error: 'Content and template are required' }, { status: 400 })
    }

    // Persist temporary image URLs (e.g. DALL-E) to storage so they don't expire
    let finalImageUrl = image_url
    if (image_url && isTemporaryImageUrl(image_url)) {
      const persisted = await persistContentImage(supabase, user.id, image_url)
      if (persisted) finalImageUrl = persisted
    }

    // When saving with generated_image_id, ensure we have the image URL in metadata (e.g. client didn't send image_url)
    if (generated_image_id && !finalImageUrl) {
      const { data: genImg } = await supabase
        .from('generated_images')
        .select('image_url')
        .eq('id', generated_image_id)
        .eq('user_id', user.id)
        .single()
      if (genImg?.image_url) finalImageUrl = genImg.image_url
    }

    // Build metadata including image if provided
    const fullMetadata = {
      ...metadata,
      ...(finalImageUrl && { image_url: finalImageUrl }),
      ...(image_style && { image_style }),
      ...(platforms && { platforms }),
    }

    const { data, error } = await supabase
      .from('content')
      .insert({
        user_id: user.id,
        title: title || `${template} - ${new Date().toLocaleDateString()}`,
        content,
        template,
        metadata: fullMetadata,
        status,
        business_id: business_id || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Content save error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (data?.id) {
      if (generated_image_id) {
        await supabase.from('generated_images').update({ content_id: data.id }).eq('id', generated_image_id).eq('user_id', user.id)
      } else if (finalImageUrl) {
        // Stock or other image: add to Picture Library so it shows up there
        const title = body.title || data.title || `${template} - ${new Date().toLocaleDateString()}`
        await supabase.from('generated_images').insert({
          user_id: user.id,
          image_url: finalImageUrl,
          topic: title,
          business_name: metadata.businessName ?? null,
          industry: metadata.industry ?? null,
          style: image_style ?? null,
          content_type: template,
          content_id: data.id,
          source: 'stock',
        })
      }
      if (generated_text_id) {
        await supabase.from('generated_texts').update({ content_id: data.id }).eq('id', generated_text_id).eq('user_id', user.id)
      }
    }

    return NextResponse.json({ message: 'Content saved successfully', data }, { status: 201 })
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
