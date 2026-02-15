import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { CreateActivity } from '@/types/sales'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

export async function GET(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!
    
    const supabase = createClient()

    const { data, error } = await supabase.from('activities')
      .select(`*, salesperson:sales_team!activities_salesperson_id_fkey(id, name), lead:leads(id, company_name), deal:deals(id, deal_name)`)
      .order('created_at', { ascending: false }).limit(100)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!
    
    const supabase = createClient()
    const body: CreateActivity = await request.json()
    if (!body.salesperson_id || !body.type) {
      return NextResponse.json({ error: 'Salesperson and type required' }, { status: 400 })
    }

    const { data, error } = await supabase.from('activities').insert({
      salesperson_id: body.salesperson_id,
      lead_id: body.lead_id || null,
      deal_id: body.deal_id || null,
      type: body.type,
      subject: body.subject || null,
      description: body.description || null,
      duration_minutes: body.duration_minutes || null,
      outcome: body.outcome || null,
      is_completed: !!body.outcome,
      completed_at: body.outcome ? new Date().toISOString() : null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (body.lead_id && ['call', 'email', 'meeting'].includes(body.type)) {
      await supabase.from('leads').update({ last_contacted_at: new Date().toISOString() }).eq('id', body.lead_id)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
