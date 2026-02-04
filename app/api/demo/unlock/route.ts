import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Store demo emails (in production, save to database)
const demoEmails = new Set<string>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }
    
    // Store email (in production, save to Supabase)
    demoEmails.add(email.toLowerCase())
    console.log(`Demo email captured: ${email}`)
    
    // Update cookie to mark email as provided
    const cookieStore = await cookies()
    const demoUsageCookie = cookieStore.get('demo_usage')
    let demoUsage = demoUsageCookie ? JSON.parse(demoUsageCookie.value) : { count: 0, hasEmail: false }
    
    demoUsage.hasEmail = true
    demoUsage.email = email.toLowerCase()
    
    const response = NextResponse.json({
      success: true,
      message: 'Email saved! You now have 5 more free demos.',
      remainingDemos: 8 - demoUsage.count,
      usage: {
        demoCount: demoUsage.count,
        remainingDemos: 8 - demoUsage.count,
        hasEmail: true
      }
    })
    
    // Set updated cookie
    response.cookies.set('demo_usage', JSON.stringify(demoUsage), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return response
    
  } catch (error) {
    console.error('Email capture error:', error)
    return NextResponse.json(
      { error: 'Failed to save email. Please try again.' },
      { status: 500 }
    )
  }
}
