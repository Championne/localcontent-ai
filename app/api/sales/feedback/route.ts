import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'
import type { CreateFeedback } from '@/types/sales'

/**
 * GET /api/sales/feedback - List all feedback
 */
export async function GET(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('feedback')
      .select(`
        *,
        submitter:sales_team!feedback_submitted_by_fkey(id, name, email, avatar_url),
        lead:leads(id, company_name, contact_name),
        reviewer:sales_team!feedback_reviewed_by_fkey(id, name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (type) query = query.eq('type', type)
    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category', category)
    if (priority) query = query.eq('priority', priority)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (error) {
    console.error('List feedback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/sales/feedback - Create new feedback
 */
export async function POST(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const supabase = createClient()
    const body: CreateFeedback = await request.json()

    if (!body.title || !body.type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        submitted_by: access.salesMember!.id,
        type: body.type,
        title: body.title,
        description: body.description || null,
        priority: body.priority || 'medium',
        category: body.category || null,
        client_quote: body.client_quote || null,
        client_name: body.client_name || null,
        client_company: body.client_company || null,
        lead_id: body.lead_id || null,
        deal_id: body.deal_id || null,
        call_id: body.call_id || null,
        tags: body.tags || null,
        status: 'new',
      })
      .select(`
        *,
        submitter:sales_team!feedback_submitted_by_fkey(id, name, email)
      `)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Create feedback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
