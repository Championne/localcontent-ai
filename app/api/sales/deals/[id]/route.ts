import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { UpdateDeal } from '@/types/sales'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase.from('deals')
      .select(`*, lead:leads(*), salesperson:sales_team!deals_salesperson_id_fkey(*)`)
      .eq('id', params.id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: UpdateDeal = await request.json()
    const { data, error } = await supabase.from('deals')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.id).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Create commission if closed won
    if (body.stage === 'closed_won' && data) {
      const { data: sp } = await supabase.from('sales_team')
        .select('commission_rate_new, commission_rate_renewal')
        .eq('id', data.salesperson_id).single()

      if (sp) {
        const rate = data.is_new_business ? sp.commission_rate_new : sp.commission_rate_renewal
        await supabase.from('commissions').insert({
          salesperson_id: data.salesperson_id,
          deal_id: data.id,
          period_start: new Date().toISOString().split('T')[0],
          period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
          revenue_amount: data.mrr_value,
          commission_rate: rate,
          commission_amount: data.mrr_value * rate,
          is_new_business: data.is_new_business,
          status: 'pending',
        })
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
