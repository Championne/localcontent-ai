import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, emailTemplates } from '@/lib/email'

// POST - Send notification email
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const name = profile?.full_name || 'there'
    const email = profile?.email || user.email!

    let template
    switch (type) {
      case 'test':
        template = emailTemplates.welcome(name, `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)
        break

      case 'usage_alert':
        template = emailTemplates.usageAlert(
          name,
          data.usagePercent,
          data.contentType,
          `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
        )
        break

      case 'new_review':
        template = emailTemplates.newReview(
          name,
          data.reviewerName,
          data.rating,
          data.reviewText,
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reviews`
        )
        break

      case 'weekly_digest':
        template = emailTemplates.weeklyDigest(
          name,
          data.stats,
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/analytics`
        )
        break

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    const result = await sendEmail({ to: email, ...template })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailId: result.id })

  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
