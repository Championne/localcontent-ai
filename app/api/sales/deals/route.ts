import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { CreateDeal } from '@/types/sales'
import { PLAN_PRICING } from '@/types/sales'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

export async function GET(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!
    
    const supabase = createClient()

    const { data, error } = await supabase.from('deals')
      .select(`*, lead:leads(id, company_name), salesperson:sales_team!deals_salesperson_id_fkey(id, name, email)`)
      .order('created_at', { ascending: false })

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
    const body: CreateDeal = await request.json()
    if (!body.deal_name || !body.salesperson_id || !body.plan) {
      return NextResponse.json({ error: 'Deal name, salesperson, and plan required' }, { status: 400 })
    }

    const mrr = body.mrr_value || PLAN_PRICING[body.plan]?.monthly || 0

    const { data, error } = await supabase.from('deals').insert({
      lead_id: body.lead_id || null,
      salesperson_id: body.salesperson_id,
      deal_name: body.deal_name,
      plan: body.plan,
      billing_cycle: body.billing_cycle || 'monthly',
      mrr_value: mrr,
      is_new_business: body.is_new_business ?? true,
      expected_close_date: body.expected_close_date || null,
      notes: body.notes || null,
      stage: 'qualification',
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
