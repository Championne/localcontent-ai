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
      .from('generated_texts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query
    if (error) {
      console.error('Generated texts fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let list = data || []
    if (sort === 'unrated_first') {
      list = [...list].sort((a, b) => {
        const aUnrated = a.rating == null ? 1 : 0
        const bUnrated = b.rating == null ? 1 : 0
        if (bUnrated !== aUnrated) return bUnrated - aUnrated
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    }

    return NextResponse.json({ texts: list })
  } catch (e) {
    console.error('Generated texts API error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
