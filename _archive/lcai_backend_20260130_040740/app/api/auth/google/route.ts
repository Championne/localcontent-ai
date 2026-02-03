import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAuthUrl } from '@/lib/oauth/google'
import { randomBytes } from 'crypto'

// GET - Initiate Google OAuth flow
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.redirect(new URL('/login?redirect=/dashboard/integrations', request.url))
    }

    // Generate state token for CSRF protection
    const state = randomBytes(32).toString('hex')
    
    // Store state in cookie for verification
    const response = NextResponse.redirect(getGoogleAuthUrl(state))
    response.cookies.set('google_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    })
    
    // Store user ID for callback
    response.cookies.set('google_oauth_user', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
    })

    return response

  } catch (error) {
    console.error('Google OAuth initiation error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=oauth_failed', request.url)
    )
  }
}
