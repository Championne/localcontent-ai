import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=Could not authenticate`)
    }

    // Send welcome email for new users (only if this is email confirmation, not password reset)
    if (data?.user && !requestUrl.searchParams.get('type')?.includes('recovery')) {
      const user = data.user
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'
      
      // Check if welcome email was already sent (avoid duplicate on re-login)
      const { data: profile } = await supabase
        .from('profiles')
        .select('welcome_email_sent')
        .eq('id', user.id)
        .single()
      
      if (!profile?.welcome_email_sent) {
        // Send welcome email
        sendWelcomeEmail(user.email!, name).catch(err => {
          console.error('Failed to send welcome email:', err)
        })
        
        // Mark welcome email as sent
        try {
          await supabase
            .from('profiles')
            .update({ welcome_email_sent: true })
            .eq('id', user.id)
        } catch {
          // Ignore if column doesn't exist
        }
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}

async function sendWelcomeEmail(email: string, name: string) {
  const welcomeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: white; padding: 40px 32px; border-radius: 12px 12px 0 0; text-align: center; }
        .content { background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; }
        .footer { background: #f9fafb; padding: 24px 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center; }
        .cta { display: inline-block; background: #f97316; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .feature { display: flex; align-items: flex-start; gap: 12px; margin: 16px 0; }
        .feature-icon { width: 24px; height: 24px; background: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .feature-icon span { color: #059669; font-size: 14px; }
        .step-box { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .step { display: flex; align-items: center; gap: 12px; margin: 12px 0; }
        .step-number { width: 28px; height: 28px; background: #0d9488; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">Welcome to GeoSpark! 🎉</h1>
          <p style="margin: 12px 0 0 0; opacity: 0.9; font-size: 16px;">Your content creation journey starts now</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">Hi ${name}! 👋</p>
          
          <p>Thanks for joining GeoSpark. You're about to save <strong>10+ hours every week</strong> on content creation!</p>
          
          <p>With GeoSpark, you can turn one simple idea into 6 platform-ready posts with a matching AI image, all in under 2 minutes.</p>
          
          <div class="step-box">
            <p style="font-weight: 600; margin: 0 0 12px 0; color: #065f46;">Here's how to get started:</p>
            <div class="step">
              <div class="step-number">1</div>
              <span>Go to your dashboard and click "Create Content"</span>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <span>Describe your topic in a sentence or two</span>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <span>Watch as 6 posts + an image appear in seconds!</span>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="https://geospark.app/dashboard" class="cta">Go to My Dashboard →</a>
          </div>
          
          <p style="margin-top: 24px;"><strong>What you get with your free trial:</strong></p>
          
          <div class="feature">
            <div class="feature-icon"><span>✓</span></div>
            <span><strong>5 content pieces</strong>: Create social packs, blogs, GMB posts & emails</span>
          </div>
          <div class="feature">
            <div class="feature-icon"><span>✓</span></div>
            <span><strong>5 AI-generated images</strong>: Professional visuals, no design skills needed</span>
          </div>
          <div class="feature">
            <div class="feature-icon"><span>✓</span></div>
            <span><strong>6 platforms</strong>: Twitter, Facebook, Instagram, LinkedIn, TikTok, Nextdoor</span>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          
          <p style="color: #6b7280; font-size: 14px;">
            Have questions? Just reply to this email. We read every message and typically respond within a few hours.
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">
            Ready to spark some content? 🚀
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            © 2026 GeoSpark • <a href="https://geospark.app" style="color: #0d9488;">geospark.app</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const welcomeText = `
Welcome to GeoSpark! 🎉

Hi ${name}! 👋

Thanks for joining GeoSpark. You're about to save 10+ hours every week on content creation!

With GeoSpark, you can turn one simple idea into 6 platform-ready posts with a matching AI image, all in under 2 minutes.

HERE'S HOW TO GET STARTED:
1. Go to your dashboard and click "Create Content"
2. Describe your topic in a sentence or two
3. Watch as 6 posts + an image appear in seconds!

Go to your dashboard: https://geospark.app/dashboard

WHAT YOU GET WITH YOUR FREE TRIAL:
✓ 5 content pieces: Create social packs, blogs, GMB posts & emails
✓ 5 AI-generated images: Professional visuals, no design skills needed
✓ 6 platforms: Twitter, Facebook, Instagram, LinkedIn, TikTok, Nextdoor

Have questions? Just reply to this email. We read every message and typically respond within a few hours.

Ready to spark some content? 🚀

The GeoSpark Team
https://geospark.app
  `.trim()

  await sendEmail({
    to: email,
    subject: 'Welcome to GeoSpark! Let\'s create your first content 🚀',
    html: welcomeHtml,
    text: welcomeText,
    tags: [
      { name: 'type', value: 'welcome-email' }
    ]
  })
}