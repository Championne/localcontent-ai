import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/sales/calls/recording-webhook - Twilio recording callback
 * Receives recording URL when recording is complete
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const callSid = formData.get('CallSid') as string
    const recordingSid = formData.get('RecordingSid') as string
    const recordingUrl = formData.get('RecordingUrl') as string
    const recordingDuration = formData.get('RecordingDuration') as string

    if (!callSid || !recordingUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient()

    // Update call record with recording info
    const { error } = await supabase
      .from('calls')
      .update({
        recording_url: `${recordingUrl}.mp3`, // Add .mp3 extension for playback
        recording_sid: recordingSid,
        recording_duration_seconds: recordingDuration ? parseInt(recordingDuration, 10) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('twilio_call_sid', callSid)

    if (error) {
      console.error('Recording webhook update error:', error)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Recording webhook error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
