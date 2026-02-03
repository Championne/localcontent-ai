import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || 'LocalContent.ai <noreply@localcontent.ai>'

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

// Send email via Resend
export async function sendEmail(template: EmailTemplate): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: template.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    return { success: false, error: 'Failed to send email' }
  }
}

// Email Templates
export const emailTemplates = {
  welcome: (name: string, loginUrl: string) => ({
    subject: 'Welcome to LocalContent.ai! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .content { padding: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">LocalContent.ai</div>
          </div>
          <div class="content">
            <h1>Welcome, ${name}! 👋</h1>
            <p>Thank you for joining LocalContent.ai. We're excited to help you create amazing content for your local business.</p>
            <p>Here's what you can do:</p>
            <ul>
              <li>Generate SEO-optimized blog posts</li>
              <li>Create engaging social media content</li>
              <li>Auto-post to Google Business Profile</li>
              <li>Generate AI-powered review responses</li>
              <li>Track your content performance</li>
            </ul>
            <a href="${loginUrl}" class="button">Get Started</a>
            <p>If you have any questions, just reply to this email - we're here to help!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} LocalContent.ai. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to LocalContent.ai, ${name}! Visit ${loginUrl} to get started.`,
  }),

  usageAlert: (name: string, usagePercent: number, contentType: string, upgradeUrl: string) => ({
    subject: `⚠️ You've used ${usagePercent}% of your ${contentType} limit`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hi ${name},</h1>
          <div class="alert">
            <strong>Usage Alert:</strong> You've used ${usagePercent}% of your monthly ${contentType} limit.
          </div>
          <p>To continue creating great content without interruption, consider upgrading your plan.</p>
          <a href="${upgradeUrl}" class="button">Upgrade Now</a>
          <p>Your limit will reset at the start of next month.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} LocalContent.ai</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${name}, you've used ${usagePercent}% of your ${contentType} limit. Upgrade at ${upgradeUrl}`,
  }),

  newReview: (name: string, reviewerName: string, rating: number, reviewText: string, respondUrl: string) => ({
    subject: `⭐ New ${rating}-star review from ${reviewerName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .review-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .stars { color: #f59e0b; font-size: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hi ${name},</h1>
          <p>You received a new review!</p>
          <div class="review-box">
            <div class="stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>
            <p><strong>${reviewerName}</strong></p>
            <p>"${reviewText}"</p>
          </div>
          <p>Respond quickly to show your customers you care.</p>
          <a href="${respondUrl}" class="button">Respond with AI</a>
          <div class="footer">
            <p>© ${new Date().getFullYear()} LocalContent.ai</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `New ${rating}-star review from ${reviewerName}: "${reviewText}". Respond at ${respondUrl}`,
  }),

  weeklyDigest: (name: string, stats: { contentCreated: number; views: number; trend: number }, dashboardUrl: string) => ({
    subject: `📊 Your weekly content performance digest`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .stats { display: flex; gap: 20px; margin: 20px 0; }
          .stat-box { flex: 1; background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #2563eb; }
          .stat-label { color: #666; }
          .trend { color: ${stats.trend >= 0 ? '#10b981' : '#ef4444'}; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hi ${name},</h1>
          <p>Here's your weekly performance summary:</p>
          <table width="100%" cellpadding="10">
            <tr>
              <td style="background: #f3f4f6; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #2563eb;">${stats.contentCreated}</div>
                <div style="color: #666;">Content Created</div>
              </td>
              <td style="background: #f3f4f6; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #2563eb;">${stats.views}</div>
                <div style="color: #666;">Total Views</div>
              </td>
              <td style="background: #f3f4f6; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: ${stats.trend >= 0 ? '#10b981' : '#ef4444'};">${stats.trend >= 0 ? '+' : ''}${stats.trend}%</div>
                <div style="color: #666;">vs Last Week</div>
              </td>
            </tr>
          </table>
          <a href="${dashboardUrl}" class="button">View Full Dashboard</a>
          <div class="footer">
            <p>© ${new Date().getFullYear()} LocalContent.ai</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Weekly digest: ${stats.contentCreated} content created, ${stats.views} views, ${stats.trend}% change. View at ${dashboardUrl}`,
  }),

  subscriptionConfirm: (name: string, planName: string, features: string[], dashboardUrl: string) => ({
    subject: `✅ Welcome to ${planName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .features { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Hi ${name},</h1>
          <div class="success">
            <strong>🎉 Your subscription to ${planName} is now active!</strong>
          </div>
          <div class="features">
            <p><strong>Your plan includes:</strong></p>
            <ul>
              ${features.map(f => `<li>${f}</li>`).join('')}
            </ul>
          </div>
          <a href="${dashboardUrl}" class="button">Start Creating Content</a>
          <div class="footer">
            <p>© ${new Date().getFullYear()} LocalContent.ai</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Your ${planName} subscription is active! Features: ${features.join(', ')}. Start at ${dashboardUrl}`,
  }),
}

// Send welcome email
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const template = emailTemplates.welcome(
    name,
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  )
  await sendEmail({ to: email, ...template })
}

// Send usage alert
export async function sendUsageAlert(
  email: string,
  name: string,
  usagePercent: number,
  contentType: string
): Promise<void> {
  const template = emailTemplates.usageAlert(
    name,
    usagePercent,
    contentType,
    `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
  )
  await sendEmail({ to: email, ...template })
}

// Send subscription confirmation
export async function sendSubscriptionConfirmation(
  email: string,
  name: string,
  planName: string,
  features: string[]
): Promise<void> {
  const template = emailTemplates.subscriptionConfirm(
    name,
    planName,
    features,
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  )
  await sendEmail({ to: email, ...template })
}
