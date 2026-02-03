import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { processDueContent } from '@/lib/scheduler'

// POST - Process due scheduled content (called by cron)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client for cron operations
    const supabase = createServiceClient()

    const result = await processDueContent(supabase)

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Cron publish error:', error)
    return NextResponse.json({ error: 'Failed to process scheduled content' }, { status: 500 })
  }
}

// Also allow GET for easy testing
export async function GET(request: NextRequest) {
  return POST(request)
}
