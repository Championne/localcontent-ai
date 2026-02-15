import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

export async function GET(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!
    
    const supabase = createClient()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const salesperson_id = searchParams.get('salesperson_id')

    let query = supabase.from('commissions')
      .select(`*, salesperson:sales_team!commissions_salesperson_id_fkey(id, name, email), deal:deals(id, deal_name, plan)`)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (salesperson_id) query = query.eq('salesperson_id', salesperson_id)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only admins/managers can approve commissions
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!
    
    const { commission_ids, action } = await request.json()
    if (!commission_ids?.length) return NextResponse.json({ error: 'Commission IDs required' }, { status: 400 })

    if (!access.salesMember || !['admin', 'manager'].includes(access.salesMember.role)) {
      return NextResponse.json({ error: 'Only admins/managers can approve commissions' }, { status: 403 })
    }
    
    const supabase = createClient()

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (action === 'approve') {
      updateData.status = 'approved'
      updateData.approved_at = new Date().toISOString()
      updateData.approved_by = access.salesMember!.id
    } else if (action === 'pay') {
      updateData.status = 'paid'
    }

    const { data, error } = await supabase.from('commissions').update(updateData).in('id', commission_ids).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
