import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/sales/markets - List all markets with stats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeCapacity = searchParams.get('include_capacity') === 'true'
    const language = searchParams.get('language')
    const activeOnly = searchParams.get('active_only') !== 'false'

    let query = supabase
      .from('markets')
      .select('*')
      .order('name')

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (language) {
      query = query.eq('language', language)
    }

    const { data: markets, error } = await query

    if (error) throw error

    // If capacity requested, fetch from view
    if (includeCapacity) {
      const { data: capacityData } = await supabase
        .from('market_capacity')
        .select('*')

      // Merge capacity data with markets
      const marketsWithCapacity = markets?.map(market => {
        const capacity = capacityData?.find(c => c.id === market.id)
        return {
          ...market,
          capacity: capacity ? {
            total_accounts: capacity.total_accounts,
            active_accounts: capacity.active_accounts,
            total_daily_capacity: capacity.total_daily_capacity,
            total_sent_today: capacity.total_sent_today,
            total_remaining_today: capacity.total_remaining_today,
            total_agents: capacity.total_agents,
            total_leads: capacity.total_leads
          } : null
        }
      })

      return NextResponse.json({ markets: marketsWithCapacity })
    }

    return NextResponse.json({ markets })
  } catch (error) {
    console.error('Markets API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/sales/markets - Create new market
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      code, 
      language, 
      countries, 
      timezone, 
      currency,
      send_start_hour,
      send_end_hour,
      send_days
    } = body

    if (!name || !code || !language || !countries || !timezone) {
      return NextResponse.json({ 
        error: 'name, code, language, countries, and timezone are required' 
      }, { status: 400 })
    }

    const { data: market, error } = await supabase
      .from('markets')
      .insert({
        name,
        code: code.toLowerCase(),
        language: language.toLowerCase(),
        countries,
        timezone,
        currency: currency || 'USD',
        send_start_hour: send_start_hour || 8,
        send_end_hour: send_end_hour || 17,
        send_days: send_days || ['mon', 'tue', 'wed', 'thu', 'fri']
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ market }, { status: 201 })
  } catch (error) {
    console.error('Create market error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
