import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canCreateContent } from '@/lib/usage-tracker'

// POST - Check if user can create specific content type
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contentType } = await request.json()

    if (!contentType || !['blog', 'social', 'gmb', 'email'].includes(contentType)) {
      return NextResponse.json({ 
        error: 'Invalid content type. Must be: blog, social, gmb, or email' 
      }, { status: 400 })
    }

    const result = await canCreateContent(supabase, user.id, contentType)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Check usage error:', error)
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 })
  }
}
