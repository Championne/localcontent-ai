import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/sales/calls/webhook - Twilio status callback
 * Receives call status updates from Twilio
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const callSid = formData.get('CallSid') as string
    const callStatus = formData.get('CallStatus') as string
    const callDuration = formData.get('CallDuration') as string
    const timestamp = formData.get('Timestamp') as string

    if (!callSid) {
      return NextResponse.json({ error: 'Missing CallSid' }, { status: 400 })
    }

    const supabase = createClient()

    // Map Twilio status to our status
    const statusMap: Record<string, string> = {
      'queued': 'initiated',
      'initiated': 'initiated',
      'ringing': 'ringing',
      'in-progress': 'in-progress',
      'completed': 'completed',
      'busy': 'busy',
      'no-answer': 'no-answer',
      'failed': 'failed',
      'canceled': 'canceled',
    }

    const updateData: Record<string, unknown> = {
      status: statusMap[callStatus] || callStatus,
      updated_at: new Date().toISOString(),
    }

    // Set timing based on status
    if (callStatus === 'in-progress') {
      updateData.answered_at = timestamp || new Date().toISOString()
    }

    if (['completed', 'busy', 'no-answer', 'failed', 'canceled'].includes(callStatus)) {
      updateData.ended_at = timestamp || new Date().toISOString()
      if (callDuration) {
        updateData.duration_seconds = parseInt(callDuration, 10)
      }
    }

    // Update call record
    const { error } = await supabase
      .from('calls')
      .update(updateData)
      .eq('twilio_call_sid', callSid)

    if (error) {
      console.error('Webhook update error:', error)
    }

    // If call completed, auto-create activity log
    if (callStatus === 'completed' && callDuration) {
      const { data: call } = await supabase
        .from('calls')
        .select('id, salesperson_id, lead_id, deal_id, duration_seconds')
        .eq('twilio_call_sid', callSid)
        .single()

      if (call && call.salesperson_id) {
        await supabase.from('activities').insert({
          salesperson_id: call.salesperson_id,
          lead_id: call.lead_id,
          deal_id: call.deal_id,
          type: 'call',
          subject: 'Phone call',
          duration_minutes: Math.ceil((call.duration_seconds || 0) / 60),
          is_completed: true,
          completed_at: new Date().toISOString(),
          metadata: { call_id: call.id, twilio_call_sid: callSid }
        })

        // Update lead's last_contacted_at
        if (call.lead_id) {
          await supabase
            .from('leads')
            .update({ last_contacted_at: new Date().toISOString() })
            .eq('id', call.lead_id)
        }
      }
    }

    // Twilio expects 200 OK
    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
