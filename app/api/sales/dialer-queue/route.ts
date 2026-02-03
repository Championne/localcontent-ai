import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'
import type { AddToDialerQueue } from '@/types/sales'

/**
 * GET /api/sales/dialer-queue - Get current user's dialer queue
 */
export async function GET(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'pending'

    const { data, error } = await supabase
      .from('dialer_queue')
      .select(`
        *,
        lead:leads(
          id, company_name, contact_name, contact_phone, contact_email,
          status, priority, location, last_contacted_at, business_type, industry, notes
        )
      `)
      .eq('salesperson_id', access.salesMember!.id)
      .eq('status', status)
      .order('priority', { ascending: false })
      .order('position', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/sales/dialer-queue - Add leads to queue
 */
export async function POST(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const supabase = createClient()
    const body: AddToDialerQueue = await request.json()

    if (!body.lead_ids?.length) {
      return NextResponse.json({ error: 'lead_ids required' }, { status: 400 })
    }

    // Get current max position
    const { data: maxPos } = await supabase
      .from('dialer_queue')
      .select('position')
      .eq('salesperson_id', access.salesMember!.id)
      .eq('status', 'pending')
      .order('position', { ascending: false })
      .limit(1)
      .single()

    let position = (maxPos?.position || 0) + 1

    // Insert each lead (upsert to handle duplicates)
    const inserts = body.lead_ids.map((lead_id, index) => ({
      salesperson_id: access.salesMember!.id,
      lead_id,
      position: position + index,
      priority: body.priority || 0,
      scheduled_for: body.scheduled_for || null,
      status: 'pending',
    }))

    const { data, error } = await supabase
      .from('dialer_queue')
      .upsert(inserts, { 
        onConflict: 'salesperson_id,lead_id',
        ignoreDuplicates: true 
      })
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ 
      message: `Added ${body.lead_ids.length} leads to queue`,
      data 
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/sales/dialer-queue - Clear queue or remove items
 */
export async function DELETE(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams
    const item_id = searchParams.get('item_id')
    const clear_all = searchParams.get('clear_all') === 'true'

    if (clear_all) {
      // Clear entire pending queue
      await supabase
        .from('dialer_queue')
        .delete()
        .eq('salesperson_id', access.salesMember!.id)
        .eq('status', 'pending')

      return NextResponse.json({ message: 'Queue cleared' })
    }

    if (item_id) {
      // Remove single item
      await supabase
        .from('dialer_queue')
        .delete()
        .eq('id', item_id)
        .eq('salesperson_id', access.salesMember!.id)

      return NextResponse.json({ message: 'Item removed from queue' })
    }

    return NextResponse.json({ error: 'Specify item_id or clear_all=true' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
