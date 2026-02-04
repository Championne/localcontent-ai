import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Webhook endpoint for Instantly.ai events
 * 
 * Events received:
 * - email_sent
 * - email_opened  
 * - email_clicked
 * - email_replied
 * - email_bounced
 * - lead_unsubscribed
 */

interface InstantlyWebhookPayload {
  event_type: string
  timestamp: string
  campaign_id: string
  campaign_name?: string
  lead: {
    email: string
    first_name?: string
    last_name?: string
    company_name?: string
  }
  email_account?: string
  email_subject?: string
  reply_text?: string
  link_clicked?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload: InstantlyWebhookPayload = await request.json()
    
    console.log('Instantly webhook received:', payload.event_type, payload.lead?.email)

    const supabase = await createClient()

    // Find the lead by email
    const { data: lead } = await supabase
      .from('outreach_leads')
      .select('id, status, emails_sent, emails_opened, emails_replied')
      .eq('email', payload.lead?.email)
      .single()

    if (!lead) {
      // Lead not found in our system - could be added directly in Instantly
      console.log('Lead not found in GeoSpark:', payload.lead?.email)
      return NextResponse.json({ received: true, lead_found: false })
    }

    // Prepare update data based on event type
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }
    
    let activityType = ''
    let activityNotes = ''

    switch (payload.event_type) {
      case 'email_sent':
        updateData.emails_sent = (lead.emails_sent || 0) + 1
        updateData.last_email_sent_at = payload.timestamp
        activityType = 'email_sent'
        activityNotes = `Email sent: "${payload.email_subject || 'No subject'}"`
        break

      case 'email_opened':
        updateData.emails_opened = (lead.emails_opened || 0) + 1
        updateData.last_email_opened_at = payload.timestamp
        activityType = 'email_opened'
        activityNotes = `Email opened: "${payload.email_subject || 'No subject'}"`
        
        // Boost lead score for engagement
        updateData.score = supabase.rpc('increment_score', { lead_id: lead.id, points: 5 })
        break

      case 'email_clicked':
        activityType = 'email_clicked'
        activityNotes = `Link clicked: ${payload.link_clicked || 'unknown link'}`
        
        // Higher score boost for clicks
        updateData.score = supabase.rpc('increment_score', { lead_id: lead.id, points: 15 })
        break

      case 'email_replied':
        updateData.emails_replied = (lead.emails_replied || 0) + 1
        updateData.last_email_replied_at = payload.timestamp
        updateData.status = 'replied' // Auto-update status
        activityType = 'email_replied'
        activityNotes = `Reply received: "${payload.reply_text?.substring(0, 200) || 'No text'}..."`
        
        // Big score boost for replies - this is a hot lead!
        updateData.score = supabase.rpc('increment_score', { lead_id: lead.id, points: 50 })
        break

      case 'email_bounced':
        updateData.status = 'bounced'
        updateData.bounced = true
        activityType = 'email_bounced'
        activityNotes = 'Email bounced - invalid address'
        
        // Negative score for bounces
        updateData.score = supabase.rpc('increment_score', { lead_id: lead.id, points: -50 })
        break

      case 'lead_unsubscribed':
        updateData.status = 'unsubscribed'
        updateData.unsubscribed = true
        updateData.unsubscribed_at = payload.timestamp
        activityType = 'unsubscribed'
        activityNotes = 'Lead unsubscribed from emails'
        
        // Remove from active consideration
        updateData.score = -100
        break

      default:
        console.log('Unknown Instantly event type:', payload.event_type)
        return NextResponse.json({ received: true, processed: false })
    }

    // Update lead
    await supabase
      .from('outreach_leads')
      .update(updateData)
      .eq('id', lead.id)

    // Log activity
    if (activityType) {
      await supabase.from('outreach_activities').insert({
        lead_id: lead.id,
        type: activityType,
        notes: activityNotes,
        metadata: {
          instantly_campaign_id: payload.campaign_id,
          instantly_campaign_name: payload.campaign_name,
          email_account: payload.email_account,
          timestamp: payload.timestamp
        },
        created_at: new Date().toISOString()
      })
    }

    // If lead replied, also add to lead_touchpoints for unified tracking
    if (payload.event_type === 'email_replied' || payload.event_type === 'email_opened') {
      // Check if this lead has been converted to a sales lead
      const { data: salesLead } = await supabase
        .from('leads')
        .select('id')
        .eq('contact_email', payload.lead?.email)
        .single()

      if (salesLead) {
        await supabase.from('lead_touchpoints').insert({
          lead_id: salesLead.id,
          channel: 'email',
          type: payload.event_type === 'email_replied' ? 'email_replied' : 'email_opened',
          subject: payload.email_subject,
          content: payload.reply_text,
          external_id: payload.campaign_id,
          metadata: {
            source: 'instantly',
            campaign_name: payload.campaign_name
          },
          created_at: payload.timestamp
        })
      }
    }

    return NextResponse.json({ 
      received: true, 
      processed: true,
      lead_id: lead.id,
      event: payload.event_type
    })
  } catch (error) {
    console.error('Instantly webhook error:', error)
    // Return 200 to prevent Instantly from retrying
    return NextResponse.json({ received: true, error: String(error) })
  }
}

// Instantly may send GET requests to verify webhook URL
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'GeoSpark Instantly Webhook',
    timestamp: new Date().toISOString()
  })
}
