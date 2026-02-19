import { NextResponse } from 'next/server'

/**
 * GET /api/stock-images — DISABLED.
 * Stock image integration has been removed. Always returns empty.
 */
export async function GET() {
  return NextResponse.json({ options: [] })
}
