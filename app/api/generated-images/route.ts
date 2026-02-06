import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const searchParams = request.nextUrl.searchParams
    const sort = searchParams.get('sort') || 'unrated_first'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let query = supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query
    if (error) {
      console.error('Generated images fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let list: Array<Record<string, unknown>> = (data || []) as Array<Record<string, unknown>>
    const linkedContentIds = new Set((list.map((i) => i.content_id).filter(Boolean) as string[]))

    // Include images from content that have image_url but no row in generated_images (e.g. stock images from before we synced)
    const { data: contentWithImages } = await supabase
      .from('content')
      .select('id, title, template, updated_at, metadata')
      .eq('user_id', user.id)
      .not('metadata', 'is', null)

    if (contentWithImages?.length) {
      const fromContent: Array<Record<string, unknown>> = []
      for (const row of contentWithImages) {
        const meta = (row.metadata as Record<string, unknown>) || {}
        const imageUrl = (meta.image_url as string) ?? (row as Record<string, unknown>).image_url
        if (imageUrl && !linkedContentIds.has(row.id)) {
          fromContent.push({
            id: `content-${row.id}`,
            image_url: imageUrl,
            topic: row.title,
            style: meta.image_style ?? null,
            content_type: row.template,
            rating: null,
            created_at: row.updated_at,
            content_id: row.id,
            source: 'stock',
          })
        }
      }
      list = [...fromContent, ...list]
    }

    if (sort === 'unrated_first') {
      list = [...list].sort((a, b) => {
        const aUnrated = (a.rating == null) ? 1 : 0
        const bUnrated = (b.rating == null) ? 1 : 0
        if (bUnrated !== aUnrated) return bUnrated - aUnrated
        return new Date((b.created_at as string) || 0).getTime() - new Date((a.created_at as string) || 0).getTime()
      })
    }

    return NextResponse.json({ images: list })
  } catch (e) {
    console.error('Generated images API error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
