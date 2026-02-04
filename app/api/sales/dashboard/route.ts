import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/sales/dashboard - Unified sales dashboard data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const industryId = searchParams.get('industry_id')
    const dateRange = searchParams.get('date_range') || '30' // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(dateRange))

    // Base query filter
    let industryFilter = ''
    if (industryId) {
      industryFilter = `AND industry_id = '${industryId}'`
    }

    // Get overall stats
    const { data: leads } = await supabase
      .from('leads')
      .select('id, status, channel_source, emails_sent, emails_opened, emails_replied, calls_made, calls_connected, created_at, converted_at, days_to_convert, industry_id')

    const filteredLeads = industryId 
      ? leads?.filter(l => l.industry_id === industryId)
      : leads

    // Calculate stats
    const stats = {
      total_leads: filteredLeads?.length || 0,
      new_leads: filteredLeads?.filter(l => l.status === 'new').length || 0,
      contacted: filteredLeads?.filter(l => ['contacted', 'qualified'].includes(l.status)).length || 0,
      in_progress: filteredLeads?.filter(l => ['demo_scheduled', 'demo_completed', 'proposal_sent', 'negotiation'].includes(l.status)).length || 0,
      won: filteredLeads?.filter(l => l.status === 'won').length || 0,
      lost: filteredLeads?.filter(l => l.status === 'lost').length || 0,
      
      // Email stats
      total_emails_sent: filteredLeads?.reduce((sum, l) => sum + (l.emails_sent || 0), 0) || 0,
      total_emails_opened: filteredLeads?.reduce((sum, l) => sum + (l.emails_opened || 0), 0) || 0,
      total_emails_replied: filteredLeads?.reduce((sum, l) => sum + (l.emails_replied || 0), 0) || 0,
      
      // Call stats
      total_calls_made: filteredLeads?.reduce((sum, l) => sum + (l.calls_made || 0), 0) || 0,
      total_calls_connected: filteredLeads?.reduce((sum, l) => sum + (l.calls_connected || 0), 0) || 0,
      
      // Conversion stats
      conversion_rate: filteredLeads?.length 
        ? ((filteredLeads.filter(l => l.status === 'won').length / filteredLeads.length) * 100).toFixed(1)
        : 0,
      avg_days_to_convert: filteredLeads?.filter(l => l.days_to_convert)
        .reduce((sum, l, _, arr) => sum + (l.days_to_convert || 0) / arr.length, 0).toFixed(1) || null
    }

    // Get industry breakdown
    const { data: industryStats } = await supabase
      .from('industry_performance')
      .select('*')
      .order('total_leads', { ascending: false })

    // Get channel breakdown
    const channelStats = {
      cold_email: filteredLeads?.filter(l => l.channel_source === 'cold_email').length || 0,
      cold_call: filteredLeads?.filter(l => l.channel_source === 'cold_call').length || 0,
      inbound: filteredLeads?.filter(l => ['website', 'inbound_call'].includes(l.channel_source || '')).length || 0,
      referral: filteredLeads?.filter(l => l.channel_source === 'referral').length || 0,
      other: filteredLeads?.filter(l => !['cold_email', 'cold_call', 'website', 'inbound_call', 'referral'].includes(l.channel_source || '')).length || 0
    }

    // Get recent activity (last 10 touchpoints)
    const { data: recentActivity } = await supabase
      .from('lead_touchpoints')
      .select(`
        *,
        lead:leads(id, company_name, contact_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get pipeline by stage
    const pipeline = [
      { stage: 'New', count: stats.new_leads, color: '#6B7280' },
      { stage: 'Contacted', count: filteredLeads?.filter(l => l.status === 'contacted').length || 0, color: '#3B82F6' },
      { stage: 'Qualified', count: filteredLeads?.filter(l => l.status === 'qualified').length || 0, color: '#8B5CF6' },
      { stage: 'Demo', count: filteredLeads?.filter(l => ['demo_scheduled', 'demo_completed'].includes(l.status)).length || 0, color: '#F59E0B' },
      { stage: 'Proposal', count: filteredLeads?.filter(l => l.status === 'proposal_sent').length || 0, color: '#EC4899' },
      { stage: 'Negotiation', count: filteredLeads?.filter(l => l.status === 'negotiation').length || 0, color: '#10B981' },
      { stage: 'Won', count: stats.won, color: '#22C55E' },
      { stage: 'Lost', count: stats.lost, color: '#EF4444' },
    ]

    // Get leads needing attention (no activity in 3+ days)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    
    const { data: staleLeads } = await supabase
      .from('leads')
      .select('id, company_name, contact_name, status, last_contacted_at, industry_id')
      .in('status', ['new', 'contacted', 'qualified', 'demo_scheduled'])
      .or(`last_contacted_at.is.null,last_contacted_at.lt.${threeDaysAgo.toISOString()}`)
      .order('last_contacted_at', { ascending: true, nullsFirst: true })
      .limit(10)

    return NextResponse.json({
      stats,
      industryStats: industryStats || [],
      channelStats,
      pipeline,
      recentActivity: recentActivity || [],
      staleLeads: staleLeads || []
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
