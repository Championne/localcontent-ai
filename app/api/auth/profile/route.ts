import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/auth/profile - Get user profile
export async function GET() {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    email: user.email || '',
    full_name: user.user_metadata?.full_name || '',
  })
}

// PATCH /api/auth/profile - Update user profile
export async function PATCH(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { full_name } = body

    const { error } = await supabase.auth.updateUser({
      data: { full_name }
    })

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
