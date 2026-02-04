import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/outreach/accounts/capacity - Get sending capacity
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get('market_id')
    const agentId = searchParams.get('agent_id')

    // Fetch accounts
    let query = supabase
      .from('email_accounts')
      .select('*')
      .eq('is_active', true)

    if (marketId) {
      query = query.eq('market_id', marketId)
    }
    if (agentId) {
      query = query.eq('agent_id', agentId)
    }

    const { data: accounts, error } = await query

    if (error) throw error

    // Calculate capacity by status
    const byStatus = {
      warmup: { count: 0, capacity: 0, used: 0 },
      limited: { count: 0, capacity: 0, used: 0 },
      ramping: { count: 0, capacity: 0, used: 0 },
      active: { count: 0, capacity: 0, used: 0 },
      paused: { count: 0, capacity: 0, used: 0 },
      suspended: { count: 0, capacity: 0, used: 0 }
    }

    const readyAccounts: Array<{
      id: string
      email: string
      status: string
      limit: number
      sent: number
      remaining: number
    }> = []

    for (const account of accounts || []) {
      const status = account.status as keyof typeof byStatus
      if (byStatus[status]) {
        byStatus[status].count++
        byStatus[status].capacity += account.current_daily_limit || 0
        byStatus[status].used += account.sent_today || 0
      }

      // Only include accounts that can send
      if (['limited', 'ramping', 'active'].includes(status)) {
        const remaining = Math.max(0, (account.current_daily_limit || 0) - (account.sent_today || 0))
        if (remaining > 0) {
          readyAccounts.push({
            id: account.id,
            email: account.email,
            status,
            limit: account.current_daily_limit || 0,
            sent: account.sent_today || 0,
            remaining
          })
        }
      }
    }

    // Sort by remaining capacity (highest first) for optimal distribution
    readyAccounts.sort((a, b) => b.remaining - a.remaining)

    // Calculate totals
    const totalCapacity = Object.values(byStatus).reduce((sum, s) => sum + s.capacity, 0)
    const totalUsed = Object.values(byStatus).reduce((sum, s) => sum + s.used, 0)
    const totalRemaining = readyAccounts.reduce((sum, a) => sum + a.remaining, 0)

    // Health check
    const warnings: string[] = []
    
    if (byStatus.warmup.count > 0) {
      warnings.push(`${byStatus.warmup.count} account(s) still warming up`)
    }
    if (byStatus.suspended.count > 0) {
      warnings.push(`${byStatus.suspended.count} account(s) suspended - check bounce rates`)
    }
    if (totalRemaining === 0 && totalCapacity > 0) {
      warnings.push('Daily capacity exhausted - wait until tomorrow')
    }
    if (readyAccounts.length === 0) {
      warnings.push('No accounts ready for sending')
    }

    // Recommendations
    const recommendations: string[] = []
    
    if (totalCapacity < 100) {
      recommendations.push('Consider adding more domains to increase capacity')
    }
    if (byStatus.warmup.count > byStatus.active.count) {
      recommendations.push('Most accounts are still warming up - be patient')
    }

    return NextResponse.json({
      capacity: {
        total: totalCapacity,
        used: totalUsed,
        remaining: totalRemaining,
        percentage_used: totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0
      },
      by_status: byStatus,
      ready_accounts: readyAccounts,
      can_send: totalRemaining > 0,
      warnings,
      recommendations
    })
  } catch (error) {
    console.error('Capacity API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/outreach/accounts/capacity - Check if specific number of leads can be sent
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      lead_count, 
      market_id, 
      agent_id 
    } = body

    if (!lead_count || lead_count <= 0) {
      return NextResponse.json({ error: 'lead_count must be positive' }, { status: 400 })
    }

    // Fetch available accounts
    let query = supabase
      .from('email_accounts')
      .select('id, email, status, current_daily_limit, sent_today')
      .eq('is_active', true)
      .in('status', ['limited', 'ramping', 'active'])

    if (market_id) {
      query = query.eq('market_id', market_id)
    }
    if (agent_id) {
      query = query.eq('agent_id', agent_id)
    }

    const { data: accounts, error } = await query

    if (error) throw error

    // Calculate distribution
    const distribution: Array<{
      account_id: string
      account_email: string
      leads_to_assign: number
    }> = []

    let leadsLeft = lead_count
    
    // Sort by remaining capacity
    const sortedAccounts = (accounts || [])
      .map(a => ({
        ...a,
        remaining: Math.max(0, (a.current_daily_limit || 0) - (a.sent_today || 0))
      }))
      .filter(a => a.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining)

    for (const account of sortedAccounts) {
      if (leadsLeft <= 0) break
      
      const toAssign = Math.min(leadsLeft, account.remaining)
      if (toAssign > 0) {
        distribution.push({
          account_id: account.id,
          account_email: account.email,
          leads_to_assign: toAssign
        })
        leadsLeft -= toAssign
      }
    }

    const canSendAll = leadsLeft === 0
    const canSendPartial = distribution.length > 0
    const totalCanSend = lead_count - leadsLeft

    return NextResponse.json({
      requested: lead_count,
      can_send: totalCanSend,
      cannot_send: leadsLeft,
      can_send_all: canSendAll,
      can_send_partial: canSendPartial,
      distribution,
      message: canSendAll 
        ? `All ${lead_count} leads can be sent today`
        : canSendPartial
          ? `Only ${totalCanSend} of ${lead_count} leads can be sent today (${leadsLeft} must wait)`
          : 'No capacity available - all accounts are at limit or warming up'
    })
  } catch (error) {
    console.error('Capacity check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
