import sgMail from '@sendgrid/mail'

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

// Default sender - use verified domain
const DEFAULT_FROM = process.env.SENDGRID_FROM_EMAIL || 'sales@geospark.app'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  from?: string
  headers?: Record<string, string>
  trackingId?: string // For matching replies
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Generate a unique tracking ID for email threading
 */
export function generateTrackingId(): string {
  return `gs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  try {
    if (!SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const trackingId = options.trackingId || generateTrackingId()
    
    // Add tracking ID to headers for reply matching
    const customHeaders: Record<string, string> = {
      'X-GeoSpark-Tracking-ID': trackingId,
      ...options.headers
    }

    const msg = {
      to: Array.isArray(options.to) ? options.to : [options.to],
      from: options.from || DEFAULT_FROM,
      replyTo: options.replyTo || DEFAULT_FROM,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
      headers: customHeaders,
    }

    const [response] = await sgMail.send(msg)
    
    return { 
      success: response.statusCode >= 200 && response.statusCode < 300,
      messageId: trackingId
    }
  } catch (error: any) {
    console.error('SendGrid error:', error?.response?.body || error)
    return { 
      success: false, 
      error: error?.response?.body?.errors?.[0]?.message || 'Failed to send email' 
    }
  }
}

/**
 * Send email with automatic threading/reply tracking
 */
export async function sendTrackedEmail(
  options: SendEmailOptions & { 
    leadId?: string
    salesMemberId?: string 
  }
): Promise<EmailResult & { trackingId: string }> {
  const trackingId = generateTrackingId()
  
  const result = await sendEmail({
    ...options,
    trackingId,
    // Add References header for threading
    headers: {
      ...options.headers,
      'References': `<${trackingId}@geospark.app>`,
      'Message-ID': `<${trackingId}@geospark.app>`
    }
  })

  return { ...result, trackingId }
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
