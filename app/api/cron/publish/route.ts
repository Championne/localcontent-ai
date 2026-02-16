import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { processDueContent } from '@/lib/scheduler'

/**
 * GET /api/cron/publish
 *
 * Vercel Cron job endpoint. Runs every 5 minutes.
 * Processes all pending scheduled_content rows whose scheduled_for <= now.
 *
 * Protected by CRON_SECRET — set this in Vercel env vars and in vercel.json.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })
  }

  try {
    const result = await processDueContent(supabase)
    return NextResponse.json({
      success: true,
      ...result,
      processedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Cron publish error:', err)
    return NextResponse.json({ error: 'Cron processing failed' }, { status: 500 })
  }
}
