import { NextResponse } from 'next/server'

/**
 * GET /api/image-queries/preview — DISABLED.
 * Unsplash preview integration removed. Returns empty.
 */
export async function GET() {
  return NextResponse.json({ images: [], totalHits: 0 })
}
