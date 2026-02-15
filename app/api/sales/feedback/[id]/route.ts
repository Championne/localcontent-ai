import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

/**
 * GET /api/sales/feedback/[id] - Get single feedback
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const supabase = createClient()

    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        submitter:sales_team!feedback_submitted_by_fkey(id, name, email, avatar_url),
        lead:leads(id, company_name, contact_name),
        reviewer:sales_team!feedback_reviewed_by_fkey(id, name)
      `)
      .eq('id', params.id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/sales/feedback/[id] - Update feedback (status, review, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const supabase = createClient()
    const body = await request.json()

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Allowed fields to update
    const allowedFields = [
      'title', 'description', 'type', 'priority', 'category', 
      'client_quote', 'client_name', 'client_company', 'tags',
      'status', 'review_notes', 'action_taken'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // If status is changing to 'reviewed', set reviewer info
    if (body.status === 'reviewed' || body.status === 'in_progress' || body.status === 'implemented' || body.status === 'declined') {
      const { data: existing } = await supabase
        .from('feedback')
        .select('reviewed_by')
        .eq('id', params.id)
        .single()

      if (!existing?.reviewed_by) {
        updateData.reviewed_by = access.salesMember!.id
        updateData.reviewed_at = new Date().toISOString()
      }
    }

    // If implemented
    if (body.status === 'implemented') {
      updateData.implemented_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/sales/feedback/[id] - Delete feedback (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    // Only admins can delete
    if (access.salesMember?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete feedback' }, { status: 403 })
    }

    const supabase = createClient()

    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
