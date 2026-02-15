import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

export async function GET(request: NextRequest) {
  try {
    // Check sales team membership
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!
    
    const supabase = createClient()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [leadsResult, dealsResult, openDealsResult, wonDealsResult, commissionsResult, teamResult] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact' }),
      supabase.from('deals').select('*', { count: 'exact' }),
      supabase.from('deals').select('mrr_value').not('stage', 'in', '("closed_won","closed_lost")'),
      supabase.from('deals').select('mrr_value').eq('stage', 'closed_won').gte('actual_close_date', startOfMonth.split('T')[0]),
      supabase.from('commissions').select('commission_amount, status'),
      supabase.from('sales_team').select('*', { count: 'exact' }).eq('status', 'active'),
    ])

    const pipelineValue = openDealsResult.data?.reduce((sum, d) => sum + (d.mrr_value || 0), 0) || 0
    const wonRevenue = wonDealsResult.data?.reduce((sum, d) => sum + (d.mrr_value || 0), 0) || 0
    const pendingCommissions = commissionsResult.data?.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0

    return NextResponse.json({
      overview: {
        total_leads: leadsResult.count || 0,
        total_deals: dealsResult.count || 0,
        open_deals: openDealsResult.data?.length || 0,
        pipeline_value: pipelineValue,
        won_revenue_this_month: wonRevenue,
        won_deals_this_month: wonDealsResult.data?.length || 0,
        pending_commissions: pendingCommissions,
        team_members: teamResult.count || 0,
      },
      deals_by_stage: {},
      leads_by_source: {},
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
