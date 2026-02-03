import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { disconnectGoogle } from '@/lib/oauth/google'

// POST - Disconnect Google integration
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await disconnectGoogle(supabase, user.id)

    if (!success) {
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Google Business Profile disconnected'
    })

  } catch (error) {
    console.error('Google disconnect error:', error)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}
