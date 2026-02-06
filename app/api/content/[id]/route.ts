import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isTemporaryImageUrl, persistContentImage } from '@/lib/content-image'

// GET /api/content/[id] - Get single content item
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Resolve generated_image_id so the client can show image rating when editing
    const { data: genImg } = await supabase
      .from('generated_images')
      .select('id')
      .eq('content_id', params.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const content = {
      ...data,
      generated_image_id: genImg?.id ?? null,
      image_url: (data.metadata as { image_url?: string })?.image_url ?? (data as { image_url?: string }).image_url ?? null,
    }
    return NextResponse.json({ content })

  } catch (error) {
    console.error('Get content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/content/[id] - Update content
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    let { title, content, status, scheduled_for, metadata } = body

    // Persist temporary image URL (e.g. DALL-E) so library thumbnails don't expire
    if (metadata?.image_url && isTemporaryImageUrl(metadata.image_url)) {
      const persisted = await persistContentImage(supabase, user.id, metadata.image_url)
      if (persisted) {
        metadata = { ...metadata, image_url: persisted }
      }
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('content')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (status !== undefined) updates.status = status
    if (scheduled_for !== undefined) updates.scheduled_for = scheduled_for
    if (metadata !== undefined) updates.metadata = metadata

    // If publishing, set published_at
    if (status === 'published') {
      updates.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating content:', error)
      return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
    }

    // Ensure image appears in Picture Library when content has an image
    if (data?.metadata?.image_url) {
      const { data: existingImg } = await supabase
        .from('generated_images')
        .select('id')
        .eq('content_id', params.id)
        .eq('user_id', user.id)
        .maybeSingle()
      if (!existingImg) {
        await supabase.from('generated_images').insert({
          user_id: user.id,
          image_url: data.metadata.image_url,
          topic: (data.title as string) || null,
          business_name: (data.metadata.businessName as string) ?? null,
          industry: (data.metadata.industry as string) ?? null,
          style: (data.metadata.image_style as string) ?? null,
          content_type: data.template,
          content_id: data.id,
          source: 'stock',
        })
      }
    }

    return NextResponse.json({
      success: true,
      content: data
    })

  } catch (error) {
    console.error('Update content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/content/[id] - Delete content
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify ownership and delete
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting content:', error)
      return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
