import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/outreach/accounts - List email accounts with capacity
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
    const status = searchParams.get('status')

    let query = supabase
      .from('email_accounts')
      .select(`
        *,
        agent:sales_team(id, name, email),
        market:markets(id, name, code, language)
      `)
      .order('email')

    if (marketId) {
      query = query.eq('market_id', marketId)
    }
    if (agentId) {
      query = query.eq('agent_id', agentId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: accounts, error } = await query

    if (error) throw error

    // Add computed fields
    const accountsWithComputed = (accounts || []).map(account => {
      const remaining = Math.max(0, (account.current_daily_limit || 0) - (account.sent_today || 0))
      
      let statusEmoji = '❓'
      switch (account.status) {
        case 'warmup': statusEmoji = '🔴'; break
        case 'limited': statusEmoji = '🟡'; break
        case 'ramping': statusEmoji = '🟠'; break
        case 'active': statusEmoji = '🟢'; break
        case 'paused': statusEmoji = '⏸️'; break
        case 'suspended': statusEmoji = '❌'; break
      }

      // Calculate days until next phase
      const daysSinceWarmup = account.days_since_warmup || 0
      let daysUntilNextPhase = null
      let nextPhase = null
      
      if (daysSinceWarmup < 14) {
        daysUntilNextPhase = 14 - daysSinceWarmup
        nextPhase = 'limited'
      } else if (daysSinceWarmup < 21) {
        daysUntilNextPhase = 21 - daysSinceWarmup
        nextPhase = 'ramping'
      } else if (daysSinceWarmup < 35) {
        daysUntilNextPhase = 35 - daysSinceWarmup
        nextPhase = 'active'
      }

      return {
        ...account,
        remaining_today: remaining,
        status_emoji: statusEmoji,
        days_until_next_phase: daysUntilNextPhase,
        next_phase: nextPhase,
        capacity_percentage: account.current_daily_limit > 0 
          ? Math.round((account.sent_today / account.current_daily_limit) * 100)
          : 0
      }
    })

    // Calculate totals
    const totals = {
      total_accounts: accountsWithComputed.length,
      active_accounts: accountsWithComputed.filter(a => ['limited', 'ramping', 'active'].includes(a.status)).length,
      warming_accounts: accountsWithComputed.filter(a => a.status === 'warmup').length,
      total_capacity: accountsWithComputed.reduce((sum, a) => sum + (a.current_daily_limit || 0), 0),
      used_today: accountsWithComputed.reduce((sum, a) => sum + (a.sent_today || 0), 0),
      remaining_today: accountsWithComputed.reduce((sum, a) => sum + (a.remaining_today || 0), 0)
    }

    return NextResponse.json({ 
      accounts: accountsWithComputed,
      totals
    })
  } catch (error) {
    console.error('Email accounts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/outreach/accounts - Add new email account
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      email, 
      display_name,
      domain,
      agent_id, 
      market_id,
      provider,
      instantly_connected,
      instantly_account_id,
      warmup_started_at,
      base_daily_limit
    } = body

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    // Extract domain from email if not provided
    const emailDomain = domain || email.split('@')[1]

    const { data: account, error } = await supabase
      .from('email_accounts')
      .insert({
        email: email.toLowerCase(),
        display_name,
        domain: emailDomain,
        agent_id,
        market_id,
        provider: provider || 'zoho',
        instantly_connected: instantly_connected || false,
        instantly_account_id,
        warmup_started_at: warmup_started_at || new Date().toISOString(),
        base_daily_limit: base_daily_limit || 50
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    console.error('Create email account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
