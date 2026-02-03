import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

/**
 * GET /api/sales/inbox - List emails in inbox
 * 
 * Query params:
 * - type: 'my' | 'shared' | 'all' (default: 'my')
 * - status: 'unread' | 'read' | 'replied' | 'archived' | 'all' (default: 'all')
 * - lead_id: filter by lead
 * - search: search in subject/body
 * - limit: number of results (default: 50)
 * - offset: pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const { searchParams } = request.nextUrl
    const type = searchParams.get('type') || 'my'
    const status = searchParams.get('status') || 'all'
    const leadId = searchParams.get('lead_id')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createClient()
    const isAdmin = access.salesMember?.role === 'admin'

    let query = supabase
      .from('emails')
      .select(`
        *,
        lead:leads(id, company_name, contact_name, contact_email),
        assigned_member:sales_team!emails_assigned_to_fkey(id, name, email),
        sender:sales_team!emails_sent_by_fkey(id, name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Filter by inbox type
    if (type === 'my') {
      // My inbox: assigned to me OR sent by me
      query = query.or(`assigned_to.eq.${access.salesMember?.id},sent_by.eq.${access.salesMember?.id}`)
    } else if (type === 'shared') {
      // Shared inbox: not assigned to anyone
      query = query.is('assigned_to', null).eq('inbox_type', 'shared')
    } else if (type === 'all' && isAdmin) {
      // Admin can see all
    } else {
      // Non-admin trying to see all - only show their emails + shared
      query = query.or(`assigned_to.eq.${access.salesMember?.id},inbox_type.eq.shared`)
    }

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status)
    } else {
      // Exclude archived by default
      query = query.neq('status', 'archived')
    }

    // Filter by lead
    if (leadId) {
      query = query.eq('lead_id', leadId)
    }

    // Search
    if (search) {
      query = query.or(`subject.ilike.%${search}%,body_text.ilike.%${search}%,from_email.ilike.%${search}%`)
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Inbox query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get unread counts
    const { data: counts } = await supabase
      .from('emails')
      .select('inbox_type, status')
      .eq('status', 'unread')
      .or(`assigned_to.eq.${access.salesMember?.id},inbox_type.eq.shared`)

    const unreadCounts = {
      my: counts?.filter(e => e.inbox_type === 'lead').length || 0,
      shared: counts?.filter(e => e.inbox_type === 'shared').length || 0,
      total: counts?.length || 0
    }

    return NextResponse.json({
      data,
      total: count,
      unread: unreadCounts,
      pagination: {
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Inbox error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/sales/inbox - Bulk update emails
 * 
 * Body: { email_ids: string[], action: 'read' | 'unread' | 'archive' | 'star' | 'unstar' | 'assign', assign_to?: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const { email_ids, action, assign_to } = await request.json()

    if (!email_ids || !Array.isArray(email_ids) || email_ids.length === 0) {
      return NextResponse.json({ error: 'email_ids required' }, { status: 400 })
    }

    const supabase = createClient()
    let updateData: Record<string, any> = { updated_at: new Date().toISOString() }

    switch (action) {
      case 'read':
        updateData.status = 'read'
        updateData.read_at = new Date().toISOString()
        break
      case 'unread':
        updateData.status = 'unread'
        updateData.read_at = null
        break
      case 'archive':
        updateData.status = 'archived'
        updateData.inbox_type = 'archived'
        break
      case 'star':
        updateData.is_starred = true
        break
      case 'unstar':
        updateData.is_starred = false
        break
      case 'assign':
        if (!assign_to) {
          return NextResponse.json({ error: 'assign_to required for assign action' }, { status: 400 })
        }
        updateData.assigned_to = assign_to
        updateData.inbox_type = 'lead'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { error } = await supabase
      .from('emails')
      .update(updateData)
      .in('id', email_ids)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: email_ids.length })
  } catch (error) {
    console.error('Inbox update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
