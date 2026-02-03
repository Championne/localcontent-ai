import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { replyToReview } from '@/lib/google-business'

// POST - Reply to a GMB review
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reviewId, comment } = await request.json()

    if (!reviewId || !comment) {
      return NextResponse.json({ 
        error: 'reviewId and comment are required' 
      }, { status: 400 })
    }

    const result = await replyToReview(supabase, user.id, reviewId, comment)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Reply posted successfully'
    })

  } catch (error) {
    console.error('GMB review reply error:', error)
    return NextResponse.json({ error: 'Failed to reply to review' }, { status: 500 })
  }
}
