import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/webhooks/email/inbound
 * 
 * Webhook endpoint for SendGrid Inbound Parse
 * Receives incoming emails and routes them to the appropriate lead/sales rep
 * 
 * SendGrid sends multipart/form-data with fields:
 * - from: sender email
 * - to: recipient email  
 * - subject: email subject
 * - text: plain text body
 * - html: HTML body
 * - headers: email headers (JSON string)
 * - envelope: envelope info (JSON string)
 * - attachments: number of attachments
 * - attachment-info: attachment metadata (JSON string)
 * - attachment1, attachment2, etc: actual attachments
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data from SendGrid
    const formData = await request.formData()
    
    const from = formData.get('from')?.toString() || ''
    const to = formData.get('to')?.toString() || ''
    const subject = formData.get('subject')?.toString() || ''
    const text = formData.get('text')?.toString() || ''
    const html = formData.get('html')?.toString() || ''
    const headersStr = formData.get('headers')?.toString() || '{}'
    const envelopeStr = formData.get('envelope')?.toString() || '{}'
    
    // Parse sender email from "Name <email@example.com>" format
    const senderEmail = extractEmail(from)
    const senderName = extractName(from)
    
    // Parse headers to find tracking ID for reply matching
    let trackingId: string | null = null
    let inReplyTo: string | null = null
    
    try {
      // Headers come as a string with each header on a new line
      const headerLines = headersStr.split('\n')
      for (const line of headerLines) {
        if (line.toLowerCase().startsWith('x-geospark-tracking-id:')) {
          trackingId = line.split(':')[1]?.trim()
        }
        if (line.toLowerCase().startsWith('in-reply-to:')) {
          inReplyTo = line.split(':')[1]?.trim()
          // Extract tracking ID from Message-ID format
          const match = inReplyTo?.match(/<(gs-[^@]+)@/)
          if (match) trackingId = match[1]
        }
        if (line.toLowerCase().startsWith('references:')) {
          const refs = line.split(':')[1]?.trim()
          const match = refs?.match(/<(gs-[^@]+)@/)
          if (match && !trackingId) trackingId = match[1]
        }
      }
    } catch (e) {
      console.error('Error parsing headers:', e)
    }

    const supabase = createClient()

    // Try to match email to existing lead by sender email
    const { data: lead } = await supabase
      .from('leads')
      .select('id, company_name, contact_name, assigned_to, status')
      .eq('contact_email', senderEmail)
      .single()

    // Try to match by tracking ID (reply to our email)
    let originalEmail = null
    if (trackingId) {
      const { data } = await supabase
        .from('emails')
        .select('*, lead:leads(id, company_name, assigned_to)')
        .eq('tracking_id', trackingId)
        .single()
      originalEmail = data
    }

    // Determine inbox assignment
    let inboxType: 'lead' | 'shared' = 'shared'
    let leadId: string | null = lead?.id || originalEmail?.lead_id || null
    let assignedTo: string | null = lead?.assigned_to || originalEmail?.lead?.assigned_to || null
    
    if (leadId) {
      inboxType = 'lead'
    }

    // Store the email
    const { data: email, error } = await supabase
      .from('emails')
      .insert({
        direction: 'inbound',
        from_email: senderEmail,
        from_name: senderName,
        to_email: to,
        subject,
        body_text: text,
        body_html: html,
        lead_id: leadId,
        assigned_to: assignedTo,
        inbox_type: inboxType,
        tracking_id: trackingId,
        in_reply_to: originalEmail?.id,
        thread_id: originalEmail?.thread_id || null,
        status: 'unread',
        received_at: new Date().toISOString(),
        raw_headers: headersStr
      })
      .select()
      .single()

    if (error) {
      console.error('Error storing email:', error)
      return NextResponse.json({ error: 'Failed to store email' }, { status: 500 })
    }

    // If this starts a new thread, set thread_id to self
    if (!originalEmail?.thread_id) {
      await supabase
        .from('emails')
        .update({ thread_id: email.id })
        .eq('id', email.id)
    }

    // Log as activity if lead is known
    if (leadId) {
      await supabase.from('activities').insert({
        lead_id: leadId,
        type: 'email',
        subject: `Email received: ${subject}`,
        description: `Inbound email from ${senderName || senderEmail}`,
        outcome: 'received'
      })

      // Update lead's last activity
      await supabase
        .from('leads')
        .update({ 
          last_contacted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
    }

    // TODO: Send notification to assigned sales rep (push notification, email, etc.)

    console.log(`Inbound email stored: ${email.id} from ${senderEmail} - ${inboxType} inbox`)

    return NextResponse.json({ 
      success: true, 
      email_id: email.id,
      inbox: inboxType,
      lead_id: leadId
    })
  } catch (error) {
    console.error('Inbound email webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Extract email from "Name <email@example.com>" format
 */
function extractEmail(str: string): string {
  const match = str.match(/<([^>]+)>/)
  if (match) return match[1].toLowerCase()
  // If no angle brackets, assume it's just an email
  return str.toLowerCase().trim()
}

/**
 * Extract name from "Name <email@example.com>" format
 */
function extractName(str: string): string {
  const match = str.match(/^([^<]+)</)
  if (match) return match[1].trim().replace(/"/g, '')
  return ''
}
