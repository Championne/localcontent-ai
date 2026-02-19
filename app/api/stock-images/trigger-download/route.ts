import { NextResponse } from 'next/server'

/**
 * POST /api/stock-images/trigger-download — DISABLED.
 * Unsplash download tracking removed.
 */
export async function POST() {
  return NextResponse.json({ ok: true })
}
