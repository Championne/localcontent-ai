import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/sales/agents - List all agents/sales team members
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const language = searchParams.get('language')
    const marketId = searchParams.get('market_id')

    let query = supabase
      .from('sales_team')
      .select(`
        *,
        agent_markets(
          market:markets(id, name, code, language)
        ),
        email_accounts(id, email, status, current_daily_limit)
      `)
      .order('name')

    if (role) {
      query = query.eq('role', role)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (language) {
      query = query.contains('languages', [language])
    }

    const { data: agents, error } = await query

    if (error) throw error

    // Filter by market if specified (after query due to join complexity)
    let filteredAgents = agents
    if (marketId) {
      filteredAgents = agents?.filter(agent => 
        agent.agent_markets?.some((am: { market: { id: string } }) => am.market?.id === marketId)
      )
    }

    // Calculate stats for each agent
    const agentsWithStats = filteredAgents?.map(agent => {
      const activeAccounts = (agent.email_accounts || []).filter(
        (a: { status: string }) => ['limited', 'ramping', 'active'].includes(a.status)
      )
      const totalCapacity = activeAccounts.reduce(
        (sum: number, a: { current_daily_limit: number }) => sum + (a.current_daily_limit || 0), 
        0
      )
      
      return {
        ...agent,
        stats: {
          total_accounts: agent.email_accounts?.length || 0,
          active_accounts: activeAccounts.length,
          daily_capacity: totalCapacity,
          markets_count: agent.agent_markets?.length || 0
        }
      }
    })

    return NextResponse.json({ agents: agentsWithStats })
  } catch (error) {
    console.error('Agents API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/sales/agents - Create new agent (invite)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const { data: currentAgent } = await supabase
      .from('sales_team')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (currentAgent?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create agents' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      name,
      email,
      role,
      languages,
      market_ids,
      partner_company,
      commission_rate,
      notes
    } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
    }

    // Create the agent
    const { data: agent, error } = await supabase
      .from('sales_team')
      .insert({
        name,
        email,
        role: role || 'agent',
        languages: languages || ['en'],
        status: 'pending', // Pending until they accept invite
        partner_company,
        commission_rate,
        notes
      })
      .select()
      .single()

    if (error) throw error

    // Assign to markets if provided
    if (market_ids && market_ids.length > 0) {
      const marketAssignments = market_ids.map((marketId: string, index: number) => ({
        agent_id: agent.id,
        market_id: marketId,
        is_primary: index === 0
      }))

      await supabase.from('agent_markets').insert(marketAssignments)
    }

    // TODO: Send invitation email

    return NextResponse.json({ 
      agent,
      message: 'Agent created. Invitation email will be sent.'
    }, { status: 201 })
  } catch (error) {
    console.error('Create agent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
