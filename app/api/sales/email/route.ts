import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'
import { sendTrackedEmail, generateTrackingId } from '@/lib/email/sendgrid'
import { getTemplate, renderTemplate, EMAIL_TEMPLATES } from '@/lib/email/templates'

// Fallback to Resend if SendGrid not configured
import { sendEmail as sendResendEmail } from '@/lib/email/resend'

/**
 * GET /api/sales/email/templates - Get available email templates
 */
export async function GET(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const category = request.nextUrl.searchParams.get('category')
    
    let templates = EMAIL_TEMPLATES
    if (category) {
      templates = templates.filter(t => t.category === category)
    }

    // Return templates without full HTML for listing
    const summaries = templates.map(t => ({
      id: t.id,
      name: t.name,
      subject: t.subject,
      category: t.category,
      variables: t.variables
    }))

    return NextResponse.json({ templates: summaries })
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/sales/email - Send an email to a lead
 */
export async function POST(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    const { 
      lead_id, 
      template_id, 
      variables = {},
      custom_subject,
      custom_body 
    } = await request.json()

    if (!lead_id) {
      return NextResponse.json({ error: 'lead_id required' }, { status: 400 })
    }

    const supabase = createClient()

    // Fetch lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (!lead.contact_email) {
      return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 })
    }

    let subject: string
    let html: string
    let text: string

    // Build email content
    if (template_id) {
      const template = getTemplate(template_id)
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }

      // Merge lead data with provided variables
      const allVariables = {
        contact_name: lead.contact_name || lead.company_name,
        company_name: lead.company_name,
        rep_name: access.salesMember?.name || 'GeoSpark Sales',
        calendar_link: process.env.CALENDLY_LINK || 'https://calendly.com/geospark',
        ...variables
      }

      const rendered = renderTemplate(template, allVariables)
      subject = rendered.subject
      html = rendered.html
      text = rendered.text
    } else if (custom_subject && custom_body) {
      // Custom email
      const template = getTemplate('custom-email')!
      const rendered = renderTemplate(template, {
        contact_name: lead.contact_name || lead.company_name,
        subject: custom_subject,
        body: custom_body,
        rep_name: access.salesMember?.name || 'GeoSpark Sales'
      })
      subject = custom_subject
      html = rendered.html
      text = rendered.text
    } else {
      return NextResponse.json({ 
        error: 'Either template_id or custom_subject/custom_body required' 
      }, { status: 400 })
    }

    // Generate tracking ID for reply matching
    const trackingId = generateTrackingId()

    // Try SendGrid first, fallback to Resend
    let result
    if (process.env.SENDGRID_API_KEY) {
      result = await sendTrackedEmail({
        to: lead.contact_email,
        subject,
        html,
        text,
        replyTo: access.salesMember?.email,
        leadId: lead_id,
        salesMemberId: access.salesMember?.id
      })
    } else {
      // Fallback to Resend
      result = await sendResendEmail({
        to: lead.contact_email,
        subject,
        html,
        text,
        replyTo: access.salesMember?.email,
        tags: [
          { name: 'type', value: 'sales-email' },
          { name: 'lead_id', value: lead_id },
          { name: 'template', value: template_id || 'custom' }
        ]
      })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Store sent email in database
    const { data: storedEmail } = await supabase.from('emails').insert({
      direction: 'outbound',
      from_email: process.env.SENDGRID_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'sales@geospark.app',
      from_name: access.salesMember?.name || 'GeoSpark Sales',
      to_email: lead.contact_email,
      to_name: lead.contact_name,
      subject,
      body_text: text,
      body_html: html,
      lead_id,
      assigned_to: lead.assigned_to,
      sent_by: access.salesMember?.id,
      inbox_type: 'lead',
      tracking_id: 'trackingId' in result ? result.trackingId : trackingId,
      template_id: template_id || null,
      status: 'read', // Outbound emails are already "read"
      sent_at: new Date().toISOString()
    }).select().single()

    // Log email as activity
    await supabase.from('activities').insert({
      lead_id,
      sales_member_id: access.salesMember?.id,
      type: 'email',
      subject: `Email: ${subject}`,
      description: template_id 
        ? `Sent "${getTemplate(template_id)?.name}" email template`
        : 'Sent custom email',
      outcome: 'sent',
      metadata: {
        email_id: storedEmail?.id || ('messageId' in result ? result.messageId : undefined),
        template_id,
        recipient: lead.contact_email
      }
    })

    // Update lead's last_contacted_at
    await supabase
      .from('leads')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', lead_id)

    return NextResponse.json({ 
      success: true,
      email_id: storedEmail?.id || ('messageId' in result ? result.messageId : undefined)
    })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
