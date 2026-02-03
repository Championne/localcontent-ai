import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'
import type { UpdateCallOutcome } from '@/types/sales'

/**
 * GET /api/sales/calls/[id] - Get a single call
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
      .from('calls')
      .select(`
        *,
        salesperson:sales_team!calls_salesperson_id_fkey(id, name, email),
        lead:leads(id, company_name, contact_name, contact_phone, contact_email)
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
 * PATCH /api/sales/calls/[id] - Update call outcome
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const supabase = createClient()
    const body: UpdateCallOutcome = await request.json()

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (body.outcome) updateData.outcome = body.outcome
    if (body.outcome_notes !== undefined) updateData.outcome_notes = body.outcome_notes
    if (body.follow_up_date !== undefined) updateData.follow_up_date = body.follow_up_date
    if (body.follow_up_notes !== undefined) updateData.follow_up_notes = body.follow_up_notes

    const { data, error } = await supabase
      .from('calls')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // If follow-up scheduled, update lead's next_follow_up
    if (body.follow_up_date && data.lead_id) {
      await supabase
        .from('leads')
        .update({ next_follow_up: body.follow_up_date })
        .eq('id', data.lead_id)
    }

    // Update lead status based on outcome
    if (body.outcome && data.lead_id) {
      const leadStatusMap: Record<string, string> = {
        'qualified': 'qualified',
        'demo_booked': 'demo_scheduled',
        'not_interested': 'lost',
      }
      
      if (leadStatusMap[body.outcome]) {
        await supabase
          .from('leads')
          .update({ 
            status: leadStatusMap[body.outcome],
            lost_reason: body.outcome === 'not_interested' ? 'Not interested after call' : null
          })
          .eq('id', data.lead_id)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/sales/calls/[id] - End/hang up a call
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const supabase = createClient()

    // Get the call to find Twilio SID
    const { data: call } = await supabase
      .from('calls')
      .select('twilio_call_sid, status')
      .eq('id', params.id)
      .single()

    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 })
    }

    // If call is active and has Twilio SID, hang up via Twilio
    if (call.twilio_call_sid && ['initiated', 'ringing', 'in-progress'].includes(call.status)) {
      const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
      const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN

      if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
        try {
          const twilio = await import('twilio')
          const client = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
          await client.calls(call.twilio_call_sid).update({ status: 'completed' })
        } catch (twilioError) {
          console.error('Twilio hangup error:', twilioError)
        }
      }
    }

    // Update call status to canceled/completed
    const { error } = await supabase
      .from('calls')
      .update({ 
        status: call.status === 'in-progress' ? 'completed' : 'canceled',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ message: 'Call ended' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
