import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

// Twilio credentials from environment
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_API_KEY = process.env.TWILIO_API_KEY
const TWILIO_API_SECRET = process.env.TWILIO_API_SECRET
const TWILIO_TWIML_APP_SID = process.env.TWILIO_TWIML_APP_SID

/**
 * Generate Twilio access token for browser-based calling
 * Uses Twilio's Voice SDK for WebRTC calling
 */
export async function GET(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) {
      return NextResponse.json(
        { error: 'Not authorized for sales access. Make sure you are in the sales_team table.' },
        { status: 401 }
      )
    }

    // Check Twilio config - provide specific error about which var is missing
    const missingVars = []
    if (!TWILIO_ACCOUNT_SID) missingVars.push('TWILIO_ACCOUNT_SID')
    if (!TWILIO_API_KEY) missingVars.push('TWILIO_API_KEY')
    if (!TWILIO_API_SECRET) missingVars.push('TWILIO_API_SECRET')
    if (!TWILIO_TWIML_APP_SID) missingVars.push('TWILIO_TWIML_APP_SID')
    
    if (missingVars.length > 0) {
      return NextResponse.json(
        { error: `Twilio not configured. Missing: ${missingVars.join(', ')}` },
        { status: 500 }
      )
    }

    // Dynamic import of Twilio (server-side only)
    const twilioModule = await import('twilio')
    const twilio = twilioModule.default || twilioModule
    const AccessToken = twilio.jwt.AccessToken
    const VoiceGrant = AccessToken.VoiceGrant

    // Create access token with voice grant
    const token = new AccessToken(
      TWILIO_ACCOUNT_SID!,
      TWILIO_API_KEY!,
      TWILIO_API_SECRET!,
      { 
        identity: access.salesMember!.id,
        ttl: 3600 // 1 hour
      }
    )

    // Grant the token voice capabilities
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: TWILIO_TWIML_APP_SID!,
      incomingAllow: true, // Allow incoming calls
    })
    token.addGrant(voiceGrant)

    return NextResponse.json({
      token: token.toJwt(),
      identity: access.salesMember!.id,
      expires_in: 3600
    })
  } catch (error) {
    console.error('Token generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to generate token: ${message}` }, { status: 500 })
  }
}
