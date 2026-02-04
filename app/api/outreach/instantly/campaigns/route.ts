import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { instantly } from '@/lib/instantly'

// GET /api/outreach/instantly/campaigns - List all Instantly campaigns
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await instantly.listCampaigns()
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Get stats for each campaign
    const campaignsWithStats = await Promise.all(
      (result.data || []).map(async (campaign) => {
        const statsResult = await instantly.getCampaignStats(campaign.id)
        return {
          ...campaign,
          stats: statsResult.success ? statsResult.data : null
        }
      })
    )

    return NextResponse.json({ campaigns: campaignsWithStats })
  } catch (error) {
    console.error('List Instantly campaigns error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
