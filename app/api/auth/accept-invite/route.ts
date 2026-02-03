import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/accept-invite - Accept a sales team invite
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Must be logged in to accept invite' }, { status: 401 })
    }

    // Fetch and verify invite
    const { data: invite, error: inviteError } = await supabase
      .from('sales_invites')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from('sales_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id)
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
    }

    // Check if user email matches invite email (optional - you can remove this for flexibility)
    // if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    //   return NextResponse.json({ 
    //     error: `This invite was sent to ${invite.email}. Please sign in with that email.` 
    //   }, { status: 400 })
    // }

    // Check if already a team member
    const { data: existing } = await supabase
      .from('sales_team')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // Update invite status
      await supabase
        .from('sales_invites')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', invite.id)

      return NextResponse.json({ 
        success: true,
        message: 'You are already on the sales team'
      })
    }

    // Add user to sales team
    const { error: teamError } = await supabase
      .from('sales_team')
      .insert({
        user_id: user.id,
        name: invite.name,
        email: user.email || invite.email,
        role: invite.role,
        status: 'active'
      })

    if (teamError) {
      console.error('Failed to add to team:', teamError)
      return NextResponse.json({ error: 'Failed to join team' }, { status: 500 })
    }

    // Update invite status
    await supabase
      .from('sales_invites')
      .update({ 
        status: 'accepted', 
        accepted_at: new Date().toISOString(),
        accepted_by: user.id
      })
      .eq('id', invite.id)

    return NextResponse.json({ 
      success: true,
      message: 'Welcome to the team!'
    })
  } catch (error) {
    console.error('Accept invite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
