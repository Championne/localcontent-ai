import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

/**
 * POST /api/sales/feedback/[id]/vote - Upvote feedback
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const supabase = createClient()

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('feedback_votes')
      .select('id')
      .eq('feedback_id', params.id)
      .eq('voter_id', access.salesMember!.id)
      .single()

    if (existingVote) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 })
    }

    // Add vote
    const { error: voteError } = await supabase
      .from('feedback_votes')
      .insert({
        feedback_id: params.id,
        voter_id: access.salesMember!.id,
      })

    if (voteError) return NextResponse.json({ error: voteError.message }, { status: 500 })

    // Increment upvotes count
    const { data, error } = await supabase.rpc('increment_feedback_upvotes', { feedback_id: params.id })
    
    // Fallback if RPC doesn't exist - manual increment
    if (error) {
      const { data: feedback } = await supabase
        .from('feedback')
        .select('upvotes')
        .eq('id', params.id)
        .single()
      
      await supabase
        .from('feedback')
        .update({ upvotes: (feedback?.upvotes || 0) + 1 })
        .eq('id', params.id)
    }

    return NextResponse.json({ message: 'Voted', upvoted: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/sales/feedback/[id]/vote - Remove upvote
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const supabase = createClient()

    // Remove vote
    const { error: deleteError } = await supabase
      .from('feedback_votes')
      .delete()
      .eq('feedback_id', params.id)
      .eq('voter_id', access.salesMember!.id)

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

    // Decrement upvotes count
    const { data: feedback } = await supabase
      .from('feedback')
      .select('upvotes')
      .eq('id', params.id)
      .single()
    
    await supabase
      .from('feedback')
      .update({ upvotes: Math.max((feedback?.upvotes || 1) - 1, 0) })
      .eq('id', params.id)

    return NextResponse.json({ message: 'Vote removed', upvoted: false })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
