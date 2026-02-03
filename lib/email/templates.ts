/**
 * Email Templates for GeoSpark Sales
 * 
 * Variables use {{variable}} syntax for replacement
 */

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html: string
  text: string
  category: 'invite' | 'follow-up' | 'demo' | 'onboarding' | 'general'
  variables: string[]
}

// Brand colors
const BRAND_COLOR = '#0d9488' // teal-600
const BRAND_LIGHT = '#ccfbf1' // teal-100

// Common email wrapper
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GeoSpark</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 30px;">
          <span style="font-size: 24px; font-weight: bold; color: ${BRAND_COLOR};">⚡ GeoSpark</span>
        </div>
        
        ${content}
        
        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
          <p>GeoSpark - AI-Powered Content for Local Businesses</p>
          <p>© ${new Date().getFullYear()} GeoSpark. All rights reserved.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`

// Button component
const button = (text: string, url: string) => `
<table role="presentation" cellspacing="0" cellpadding="0" style="margin: 30px auto;">
  <tr>
    <td style="background-color: ${BRAND_COLOR}; border-radius: 8px;">
      <a href="${url}" style="display: inline-block; padding: 14px 30px; color: white; text-decoration: none; font-weight: 600; font-size: 16px;">${text}</a>
    </td>
  </tr>
</table>
`

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  // ============== INVITE TEMPLATES ==============
  {
    id: 'sales-team-invite',
    name: 'Sales Team Invite',
    subject: 'You\'re invited to join GeoSpark Sales Team',
    category: 'invite',
    variables: ['invitee_name', 'inviter_name', 'invite_link'],
    html: emailWrapper(`
      <h1 style="color: #111827; font-size: 24px; margin-bottom: 20px;">You're Invited! 🎉</h1>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi {{invitee_name}},
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        {{inviter_name}} has invited you to join the <strong>GeoSpark Sales Team</strong> as a Sales Partner.
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        As a Sales Partner, you'll have access to:
      </p>
      
      <ul style="color: #4b5563; font-size: 16px; line-height: 1.8;">
        <li>📞 Power Dialer with AI coaching</li>
        <li>📊 Real-time performance dashboard</li>
        <li>💰 Commission tracking</li>
        <li>📚 Sales training materials</li>
      </ul>
      
      ${button('Accept Invitation', '{{invite_link}}')}
      
      <p style="color: #6b7280; font-size: 14px; text-align: center;">
        This invitation expires in 7 days.
      </p>
    `),
    text: `You're Invited to GeoSpark Sales Team!

Hi {{invitee_name}},

{{inviter_name}} has invited you to join the GeoSpark Sales Team as a Sales Partner.

Click here to accept: {{invite_link}}

This invitation expires in 7 days.`
  },

  // ============== FOLLOW-UP TEMPLATES ==============
  {
    id: 'post-call-followup',
    name: 'Post-Call Follow-up',
    subject: 'Great speaking with you, {{contact_name}}!',
    category: 'follow-up',
    variables: ['contact_name', 'company_name', 'rep_name', 'key_points', 'next_steps', 'calendar_link'],
    html: emailWrapper(`
      <h1 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Thanks for Your Time!</h1>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi {{contact_name}},
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Thank you for taking the time to chat with me today about how GeoSpark can help {{company_name}} with your social media presence.
      </p>
      
      <div style="background-color: ${BRAND_LIGHT}; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: ${BRAND_COLOR}; margin-top: 0;">Key Points We Discussed:</h3>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; white-space: pre-line;">{{key_points}}</p>
      </div>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        <strong>Next Steps:</strong><br>
        {{next_steps}}
      </p>
      
      ${button('Schedule a Demo', '{{calendar_link}}')}
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        If you have any questions, feel free to reply to this email or give me a call.
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Best regards,<br>
        <strong>{{rep_name}}</strong><br>
        GeoSpark Sales Team
      </p>
    `),
    text: `Hi {{contact_name}},

Thank you for taking the time to chat with me today about how GeoSpark can help {{company_name}} with your social media presence.

Key Points We Discussed:
{{key_points}}

Next Steps:
{{next_steps}}

Schedule a demo: {{calendar_link}}

If you have any questions, feel free to reply to this email or give me a call.

Best regards,
{{rep_name}}
GeoSpark Sales Team`
  },

  {
    id: 'no-answer-followup',
    name: 'Missed Call Follow-up',
    subject: 'Sorry I missed you, {{contact_name}}',
    category: 'follow-up',
    variables: ['contact_name', 'company_name', 'rep_name', 'calendar_link'],
    html: emailWrapper(`
      <h1 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Let's Connect!</h1>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi {{contact_name}},
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        I tried reaching you today to discuss how GeoSpark can help {{company_name}} save 10+ hours per month on social media content.
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Our AI creates professional, engaging posts specifically for local businesses like yours - no marketing experience needed!
      </p>
      
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="color: #92400e; font-size: 14px; margin: 0;">
          💡 <strong>Quick win:</strong> Most of our customers see a 20-40% increase in local engagement within the first month.
        </p>
      </div>
      
      ${button('Pick a Time That Works', '{{calendar_link}}')}
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Or just reply to this email with a good time to call.
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Best,<br>
        <strong>{{rep_name}}</strong>
      </p>
    `),
    text: `Hi {{contact_name}},

I tried reaching you today to discuss how GeoSpark can help {{company_name}} save 10+ hours per month on social media content.

Our AI creates professional, engaging posts specifically for local businesses like yours - no marketing experience needed!

Most of our customers see a 20-40% increase in local engagement within the first month.

Pick a time that works: {{calendar_link}}

Or just reply to this email with a good time to call.

Best,
{{rep_name}}`
  },

  // ============== DEMO TEMPLATES ==============
  {
    id: 'demo-confirmation',
    name: 'Demo Confirmation',
    subject: 'Your GeoSpark Demo is Confirmed! 🎉',
    category: 'demo',
    variables: ['contact_name', 'demo_date', 'demo_time', 'meeting_link', 'rep_name'],
    html: emailWrapper(`
      <h1 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Demo Confirmed! 🎉</h1>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi {{contact_name}},
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Great news! Your personalized GeoSpark demo is confirmed.
      </p>
      
      <div style="background-color: ${BRAND_LIGHT}; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="color: ${BRAND_COLOR}; font-size: 14px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">Demo Details</p>
        <p style="color: #111827; font-size: 20px; font-weight: bold; margin: 0;">{{demo_date}}</p>
        <p style="color: #4b5563; font-size: 16px; margin: 5px 0 0 0;">{{demo_time}}</p>
      </div>
      
      ${button('Join Demo Meeting', '{{meeting_link}}')}
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        <strong>What to expect:</strong>
      </p>
      <ul style="color: #4b5563; font-size: 16px; line-height: 1.8;">
        <li>Live demo of AI content generation for YOUR business</li>
        <li>Q&A session</li>
        <li>Special offer (demo attendees only)</li>
      </ul>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        See you there!<br>
        <strong>{{rep_name}}</strong>
      </p>
    `),
    text: `Demo Confirmed!

Hi {{contact_name}},

Your personalized GeoSpark demo is confirmed.

Date: {{demo_date}}
Time: {{demo_time}}
Link: {{meeting_link}}

What to expect:
- Live demo of AI content generation for YOUR business
- Q&A session
- Special offer (demo attendees only)

See you there!
{{rep_name}}`
  },

  {
    id: 'demo-reminder',
    name: 'Demo Reminder (1 hour before)',
    subject: 'Starting soon: Your GeoSpark Demo ⏰',
    category: 'demo',
    variables: ['contact_name', 'demo_time', 'meeting_link'],
    html: emailWrapper(`
      <h1 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Your Demo Starts Soon! ⏰</h1>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi {{contact_name}},
      </p>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Just a quick reminder that your GeoSpark demo is starting in about an hour at <strong>{{demo_time}}</strong>.
      </p>
      
      ${button('Join Demo Now', '{{meeting_link}}')}
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Can't make it? Just reply to reschedule.
      </p>
    `),
    text: `Your Demo Starts Soon!

Hi {{contact_name}},

Just a quick reminder that your GeoSpark demo is starting in about an hour at {{demo_time}}.

Join here: {{meeting_link}}

Can't make it? Just reply to reschedule.`
  },

  // ============== GENERAL TEMPLATES ==============
  {
    id: 'custom-email',
    name: 'Custom Email',
    subject: '{{subject}}',
    category: 'general',
    variables: ['contact_name', 'subject', 'body', 'rep_name'],
    html: emailWrapper(`
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi {{contact_name}},
      </p>
      
      <div style="color: #4b5563; font-size: 16px; line-height: 1.6; white-space: pre-line;">{{body}}</div>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 30px;">
        Best regards,<br>
        <strong>{{rep_name}}</strong><br>
        GeoSpark Sales Team
      </p>
    `),
    text: `Hi {{contact_name}},

{{body}}

Best regards,
{{rep_name}}
GeoSpark Sales Team`
  }
]

/**
 * Get a template by ID
 */
export function getTemplate(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find(t => t.id === id)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[] {
  return EMAIL_TEMPLATES.filter(t => t.category === category)
}

/**
 * Replace template variables with actual values
 */
export function renderTemplate(
  template: EmailTemplate,
  variables: Record<string, string>
): { subject: string; html: string; text: string } {
  let subject = template.subject
  let html = template.html
  let text = template.text

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    subject = subject.replace(regex, value)
    html = html.replace(regex, value)
    text = text.replace(regex, value)
  }

  return { subject, html, text }
}
