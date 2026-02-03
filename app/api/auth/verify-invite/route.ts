import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/auth/verify-invite?token=xxx - Verify an invite token
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const supabase = createClient()

    const { data: invite, error } = await supabase
      .from('sales_invites')
      .select('id, email, name, role, expires_at, status')
      .eq('token', token)
      .single()

    if (error || !invite) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 })
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ 
        error: invite.status === 'accepted' 
          ? 'This invitation has already been accepted' 
          : 'This invitation is no longer valid'
      }, { status: 400 })
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
    }

    return NextResponse.json({ invite })
  } catch (error) {
    console.error('Verify invite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
