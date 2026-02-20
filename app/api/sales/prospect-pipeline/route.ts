import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view') || 'overview'

  try {
    if (view === 'overview') {
      const [pipeline, runs, tiers, sources] = await Promise.all([
        supabase
          .from('outreach_leads')
          .select('pipeline_status', { count: 'exact', head: true })
          .not('pipeline_status', 'is', null),
        supabase
          .from('pipeline_runs')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(5),
        supabase.rpc('get_pipeline_tier_counts'),
        supabase.rpc('get_pipeline_source_counts'),
      ])

      // Get counts per pipeline status
      const statuses = [
        'scraped', 'enriched', 'scored', 'insights_generated',
        'emails_generated', 'uploaded_to_instantly', 'sending', 'completed',
      ]
      const statusCounts: Record<string, number> = {}
      for (const status of statuses) {
        const { count } = await supabase
          .from('outreach_leads')
          .select('*', { count: 'exact', head: true })
          .eq('pipeline_status', status)
        statusCounts[status] = count || 0
      }

      // Get tier counts
      const tierCounts: Record<string, number> = {}
      for (const tier of ['TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5']) {
        const { count } = await supabase
          .from('outreach_leads')
          .select('*', { count: 'exact', head: true })
          .eq('score_tier', tier)
        tierCounts[tier] = count || 0
      }

      // Total prospects
      const { count: totalProspects } = await supabase
        .from('outreach_leads')
        .select('*', { count: 'exact', head: true })
        .not('pipeline_status', 'is', null)

      return NextResponse.json({
        total_prospects: totalProspects || 0,
        status_counts: statusCounts,
        tier_counts: tierCounts,
        recent_runs: runs.data || [],
      })
    }

    if (view === 'prospects') {
      const tier = searchParams.get('tier')
      const status = searchParams.get('status')
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')

      let query = supabase
        .from('outreach_leads')
        .select(`
          id, business_name, category, city, state, website,
          contact_name, contact_email, owner_name, owner_email,
          google_rating, google_reviews_count,
          geospark_score, score_tier, pipeline_status, prospect_source,
          enrichment_status, created_at
        `)
        .not('pipeline_status', 'is', null)
        .order('geospark_score', { ascending: false })
        .range(offset, offset + limit - 1)

      if (tier) query = query.eq('score_tier', tier)
      if (status) query = query.eq('pipeline_status', status)

      const { data, error } = await query
      if (error) throw error

      return NextResponse.json({ prospects: data || [] })
    }

    if (view === 'prospect-detail') {
      const id = searchParams.get('id')
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

      const [lead, social, insights, emails, competitors] = await Promise.all([
        supabase.from('outreach_leads').select('*').eq('id', id).single(),
        supabase.from('prospect_social_profiles').select('*').eq('lead_id', id),
        supabase.from('prospect_marketing_insights').select('*').eq('lead_id', id).order('priority_score', { ascending: false }),
        supabase.from('prospect_email_sequences').select('*').eq('lead_id', id).order('email_number'),
        supabase.from('prospect_competitors').select('*').eq('lead_id', id),
      ])

      return NextResponse.json({
        lead: lead.data,
        social_profiles: social.data || [],
        insights: insights.data || [],
        email_sequence: emails.data || [],
        competitors: competitors.data || [],
      })
    }

    if (view === 'learnings') {
      const { data } = await supabase
        .from('pipeline_learnings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      return NextResponse.json({ learnings: data || [] })
    }

    return NextResponse.json({ error: 'Invalid view' }, { status: 400 })
  } catch (error) {
    console.error('Prospect pipeline API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
