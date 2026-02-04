import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

const SALES_TEAM_EMAIL = process.env.SALES_TEAM_EMAIL || 'sales@geospark.app'

/**
 * POST /api/contact - Handle contact form submissions
 */
export async function POST(request: NextRequest) {
  try {
    const { name, email, company, phone, message, subject } = await request.json()

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Check if this email exists as a lead
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, assigned_to, company_name')
      .eq('contact_email', email)
      .single()

    // Store the contact submission
    const { data: contactSubmission, error: insertError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        company: company || null,
        phone: phone || null,
        message,
        subject: subject || 'General Inquiry',
        lead_id: existingLead?.id || null,
        status: 'new'
      })
      .select()
      .single()

    // If table doesn't exist, still proceed with email
    if (insertError && !insertError.message.includes('does not exist')) {
      console.error('Error storing contact submission:', insertError)
    }

    // Build the notification email for sales team
    const emailSubject = `[GeoSpark Contact] ${subject || 'New inquiry'} from ${name}`
    
    const leadInfo = existingLead 
      ? `<p style="background: #d1fae5; padding: 12px; border-radius: 8px; color: #065f46;">
          <strong>✓ Existing Lead Found:</strong> ${existingLead.company_name || 'Unknown Company'} (ID: ${existingLead.id})
         </p>`
      : `<p style="background: #fef3c7; padding: 12px; border-radius: 8px; color: #92400e;">
          <strong>New Contact</strong> - Not yet in lead database
         </p>`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; }
          .content { background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
          .field { margin-bottom: 16px; }
          .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { margin-top: 4px; color: #111827; }
          .message-box { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 8px; }
          .cta { display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 20px;">New Contact Form Submission</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Someone reached out via the website</p>
          </div>
          <div class="content">
            ${leadInfo}
            
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            
            ${company ? `
            <div class="field">
              <div class="label">Company</div>
              <div class="value">${company}</div>
            </div>
            ` : ''}
            
            ${phone ? `
            <div class="field">
              <div class="label">Phone</div>
              <div class="value"><a href="tel:${phone}">${phone}</a></div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${subject || 'General Inquiry'}</div>
            </div>
            
            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>
            
            <a href="mailto:${email}?subject=Re: ${subject || 'Your inquiry to GeoSpark'}" class="cta">
              Reply to ${name.split(' ')[0]}
            </a>
          </div>
        </div>
      </body>
      </html>
    `

    const textVersion = `
New Contact Form Submission
===========================

${existingLead ? `✓ EXISTING LEAD: ${existingLead.company_name} (ID: ${existingLead.id})` : 'NEW CONTACT - Not in lead database'}

Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ''}
${phone ? `Phone: ${phone}` : ''}
Subject: ${subject || 'General Inquiry'}

Message:
${message}

---
Reply directly to this email or click: mailto:${email}
    `.trim()

    // Send notification to sales team
    const emailResult = await sendEmail({
      to: SALES_TEAM_EMAIL,
      subject: emailSubject,
      html: emailHtml,
      text: textVersion,
      replyTo: email,
      tags: [
        { name: 'type', value: 'contact-form' },
        { name: 'lead_id', value: existingLead?.id || 'new' }
      ]
    })

    if (!emailResult.success) {
      console.error('Failed to send notification email:', emailResult.error)
      // Don't fail the request, submission was still stored
    }

    // Send confirmation email to the client
    const clientConfirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: white; padding: 32px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; }
          .footer { background: #f9fafb; padding: 24px 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center; }
          .highlight-box { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 16px; margin: 20px 0; }
          .cta { display: inline-block; background: #f97316; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
          .timeline { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
          .timeline-icon { width: 40px; height: 40px; background: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Thanks for reaching out!</h1>
            <p style="margin: 12px 0 0 0; opacity: 0.9;">We've received your message</p>
          </div>
          <div class="content">
            <p>Hi ${name.split(' ')[0]},</p>
            
            <p>Thank you for contacting GeoSpark! We've received your inquiry and a member of our team will get back to you shortly.</p>
            
            <div class="highlight-box">
              <div class="timeline">
                <div class="timeline-icon">
                  <span style="color: #059669; font-size: 18px;">⏱️</span>
                </div>
                <div>
                  <strong style="color: #065f46;">Expected Response Time</strong>
                  <p style="margin: 4px 0 0 0; color: #047857;">Within 24 hours (usually much faster!)</p>
                </div>
              </div>
            </div>
            
            <p><strong>Here's what you sent us:</strong></p>
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
              <p style="margin: 0; color: #6b7280;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>In the meantime, why not explore what GeoSpark can do for your business?</p>
            
            <div style="text-align: center;">
              <a href="https://geospark.app/demo" class="cta">Try Our Live Demo</a>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
              Need immediate help? Reply directly to this email.
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              © 2026 GeoSpark • <a href="https://geospark.app" style="color: #0d9488;">geospark.app</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const clientConfirmationText = `
Hi ${name.split(' ')[0]},

Thank you for contacting GeoSpark! We've received your inquiry and a member of our team will get back to you shortly.

EXPECTED RESPONSE TIME: Within 24 hours (usually much faster!)

Here's what you sent us:
------------------------
Subject: ${subject || 'General Inquiry'}

${message}
------------------------

In the meantime, why not explore what GeoSpark can do for your business?
Try our live demo: https://geospark.app/demo

Need immediate help? Reply directly to this email.

Best,
The GeoSpark Team
https://geospark.app
    `.trim()

    // Send confirmation to client
    await sendEmail({
      to: email,
      subject: `We've received your message - GeoSpark`,
      html: clientConfirmationHtml,
      text: clientConfirmationText,
      tags: [
        { name: 'type', value: 'contact-confirmation' }
      ]
    }).catch(err => {
      console.error('Failed to send client confirmation:', err)
      // Don't fail the request
    })

    // If this is an existing lead, log as activity
    if (existingLead) {
      await supabase.from('activities').insert({
        lead_id: existingLead.id,
        type: 'email',
        subject: `Contact form: ${subject || 'General Inquiry'}`,
        description: `${name} submitted a contact form inquiry`,
        outcome: 'received',
        metadata: {
          source: 'contact_form',
          submission_id: contactSubmission?.id,
          message_preview: message.substring(0, 200)
        }
      }).catch(() => {}) // Don't fail if activities table doesn't exist
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! We\'ll get back to you within 24 hours.'
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
