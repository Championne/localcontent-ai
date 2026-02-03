import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listLocations, getInsights, getReviews } from '@/lib/google-business'

// GET - Get GMB data (locations, insights, reviews)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    // Check if GMB is connected
    const { data: integration } = await supabase
      .from('integrations')
      .select('id, metadata, connected_at')
      .eq('user_id', user.id)
      .eq('platform', 'google_business')
      .single()

    if (!integration) {
      return NextResponse.json({ 
        connected: false,
        message: 'Google Business Profile not connected' 
      })
    }

    switch (action) {
      case 'status':
        return NextResponse.json({
          connected: true,
          locationName: integration.metadata?.locationName,
          connectedAt: integration.connected_at,
        })

      case 'locations':
        const locations = await listLocations(supabase, user.id)
        return NextResponse.json({ locations })

      case 'insights':
        const days = parseInt(searchParams.get('days') || '30')
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        
        const insights = await getInsights(supabase, user.id, startDate, endDate)
        return NextResponse.json({ insights, period: { startDate, endDate } })

      case 'reviews':
        const reviews = await getReviews(supabase, user.id)
        return NextResponse.json(reviews)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('GMB API error:', error)
    return NextResponse.json({ error: 'Failed to fetch GMB data' }, { status: 500 })
  }
}
