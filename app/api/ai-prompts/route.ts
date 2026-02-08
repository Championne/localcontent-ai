import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/ai-prompts
 * Returns all AI prompt overrides for the current user.
 *
 * PUT /api/ai-prompts
 * Body: { override_type: 'scene_hint' | 'style_prefix', key: string, prompt_text: string }
 *
 * DELETE /api/ai-prompts
 * Body: { override_type, key }
 */
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: overrides } = await supabase
    .from('ai_prompt_overrides')
    .select('override_type, key, prompt_text')
    .eq('user_id', user.id)

  return NextResponse.json({ overrides: overrides ?? [] })
}

export async function PUT(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { override_type, key, prompt_text } = body as { override_type: string; key: string; prompt_text: string }
  if (!override_type || !key || typeof prompt_text !== 'string') {
    return NextResponse.json({ error: 'override_type, key, and prompt_text are required' }, { status: 400 })
  }
  if (!['scene_hint', 'style_prefix'].includes(override_type)) {
    return NextResponse.json({ error: 'override_type must be scene_hint or style_prefix' }, { status: 400 })
  }

  const { error } = await supabase
    .from('ai_prompt_overrides')
    .upsert({
      user_id: user.id,
      override_type,
      key,
      prompt_text,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,override_type,key' })

  if (error) {
    console.error('Upsert ai_prompt_overrides error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { override_type, key } = body as { override_type: string; key: string }
  if (!override_type || !key) {
    return NextResponse.json({ error: 'override_type and key are required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('ai_prompt_overrides')
    .delete()
    .eq('user_id', user.id)
    .eq('override_type', override_type)
    .eq('key', key)

  if (error) {
    console.error('Delete ai_prompt_overrides error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
