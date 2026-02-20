import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pipeline_settings')
    .select('key, value, description, updated_at')
    .order('key')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const settings: Record<string, { value: unknown; description: string; updated_at: string }> = {}
  for (const row of data || []) {
    settings[row.key] = {
      value: row.value,
      description: row.description,
      updated_at: row.updated_at,
    }
  }

  return NextResponse.json({ settings })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { key, value } = body

  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 })
  }

  const { error } = await supabase
    .from('pipeline_settings')
    .update({ value: JSON.parse(JSON.stringify(value)), updated_at: new Date().toISOString() })
    .eq('key', key)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
