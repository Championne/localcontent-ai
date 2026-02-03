import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender - update domain after verifying in Resend
const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'GeoSpark <noreply@geospark.app>'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: { name: string; value: string }[]
}

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      tags: options.tags,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

/**
 * Send a batch of emails
 */
export async function sendBatchEmails(
  emails: Array<SendEmailOptions & { to: string }>
): Promise<{ success: boolean; results: EmailResult[] }> {
  const results: EmailResult[] = []
  
  for (const email of emails) {
    const result = await sendEmail(email)
    results.push(result)
  }

  return {
    success: results.every(r => r.success),
    results
  }
}
