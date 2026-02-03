import { NextRequest, NextResponse } from 'next/server'

/**
 * GET/POST /api/sales/calls/twiml - TwiML instructions for Twilio
 * Tells Twilio how to handle the call (connect to browser client)
 */
export async function GET(request: NextRequest) {
  return handleTwiml(request)
}

export async function POST(request: NextRequest) {
  return handleTwiml(request)
}

async function handleTwiml(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  // Get parameters from URL or form body
  let To = searchParams.get('To')
  let callId = searchParams.get('callId')
  
  // Twilio sends params as form-urlencoded in POST body
  if (request.method === 'POST') {
    try {
      const formData = await request.formData()
      To = To || formData.get('To')?.toString() || null
      callId = callId || formData.get('callId')?.toString() || null
    } catch (e) {
      // Form parsing failed, continue with URL params
      console.log('TwiML: Could not parse form data', e)
    }
  }

  console.log('TwiML request - To:', To, 'callId:', callId)

  // TwiML response
  let twiml: string

  if (To) {
    // Browser is initiating a call to a phone number
    const callerId = process.env.TWILIO_PHONE_NUMBER || ''
    twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${callerId}" record="record-from-answer-dual" timeout="30">
    <Number>${To}</Number>
  </Dial>
</Response>`
    console.log('TwiML: Dialing', To, 'from', callerId)
  } else {
    // No phone number provided - just acknowledge
    twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">No destination number provided.</Say>
</Response>`
    console.log('TwiML: No To number provided')
  }

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
