import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isTemporaryImageUrl, persistContentImage } from '@/lib/content-image'

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

    let query = supabase
      .from('content')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (template) {
      query = query.eq('template', template)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: contentList, error } = await query

    if (error) {
      console.error('Content fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const list = contentList || []

    // For content missing metadata.image_url, get thumbnail from linked generated_images so Spark Library shows images
    const idsWithoutImage = list.filter((c: { metadata?: { image_url?: string }; image_url?: string }) => {
      const meta = c.metadata as { image_url?: string } | undefined
      return !meta?.image_url && !(c as { image_url?: string }).image_url
    }).map((c: { id: string }) => c.id)

    if (idsWithoutImage.length > 0) {
      const { data: images } = await supabase
        .from('generated_images')
        .select('content_id, image_url')
        .eq('user_id', user.id)
        .in('content_id', idsWithoutImage)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })

      const imageByContentId = new Map<string, string>()
      for (const row of images || []) {
        if (row.content_id && !imageByContentId.has(row.content_id)) {
          imageByContentId.set(row.content_id, row.image_url)
        }
      }

      const enriched = list.map((c: { id: string; metadata?: Record<string, unknown> }) => {
        const url = imageByContentId.get(c.id)
        if (url) return { ...c, metadata: { ...(c.metadata || {}), image_url: url } }
        return c
      })
      return NextResponse.json({ content: enriched })
    }

    return NextResponse.json({ content: list })
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
