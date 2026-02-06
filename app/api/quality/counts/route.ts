import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [imgRes, textRes] = await Promise.all([
      supabase.from('generated_images').select('id', { count: 'exact', head: true }).eq('user_id', user.id).is('rating', null),
      supabase.from('generated_texts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).is('rating', null)
    ])

    return NextResponse.json({
      unratedImages: imgRes.count ?? 0,
      unratedTexts: textRes.count ?? 0
    })
  } catch (e) {
    console.error('Quality counts error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
