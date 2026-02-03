import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'
import type { CreateCall } from '@/types/sales'

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

/**
 * GET /api/sales/calls - List calls
 */
export async function GET(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams
    const lead_id = searchParams.get('lead_id')
    const salesperson_id = searchParams.get('salesperson_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('calls')
      .select(`
        *,
        salesperson:sales_team!calls_salesperson_id_fkey(id, name, email),
        lead:leads(id, company_name, contact_name, contact_phone)
      `)
      .order('initiated_at', { ascending: false })
      .limit(limit)

    if (lead_id) query = query.eq('lead_id', lead_id)
    if (salesperson_id) query = query.eq('salesperson_id', salesperson_id)
    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (error) {
    console.error('List calls error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/sales/calls - Initiate a new call
 * This creates a call record and initiates via Twilio
 */
export async function POST(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const supabase = createClient()
    const body: CreateCall = await request.json()

    if (!body.lead_id || !body.to_number) {
      return NextResponse.json({ error: 'lead_id and to_number are required' }, { status: 400 })
    }

    // Validate lead exists
    const { data: lead } = await supabase
      .from('leads')
      .select('id, company_name, contact_name')
      .eq('id', body.lead_id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Create call record in database (status: initiated)
    const { data: callRecord, error: insertError } = await supabase
      .from('calls')
      .insert({
        salesperson_id: access.salesMember!.id,
        lead_id: body.lead_id,
        deal_id: body.deal_id || null,
        direction: 'outbound',
        from_number: TWILIO_PHONE_NUMBER || '+1000000000',
        to_number: body.to_number,
        status: 'initiated',
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Return the call record - browser handles actual call via Twilio Voice SDK
    return NextResponse.json(callRecord, { status: 201 })
  } catch (error) {
    console.error('Create call error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
