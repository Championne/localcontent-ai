import { NextResponse } from 'next/server'

type FrameStyle =
  | 'thin'
  | 'solid'
  | 'thick'
  | 'double'
  | 'rounded'
  | 'classic'
  | 'polaroid'
  | 'dashed'
  | 'dotted'
  | 'filmstrip'
  | 'vignette'
  | 'neon'
  | 'shadow'
type FrameColorKey = 'primary' | 'secondary' | 'accent' | 'silver' | 'gold' | 'neutral'

/** Frame suggestions per template: style + colorKey for auto branding */
const FRAME_BY_TEMPLATE: Record<string, Array<{ style: FrameStyle; colorKey: FrameColorKey }>> = {
  'social-pack': [
    { style: 'polaroid', colorKey: 'neutral' },
    { style: 'solid', colorKey: 'neutral' },
    { style: 'neon', colorKey: 'primary' },
    { style: 'rounded', colorKey: 'primary' },
    { style: 'shadow', colorKey: 'neutral' },
  ],
  'blog-post': [
    { style: 'classic', colorKey: 'gold' },
    { style: 'vignette', colorKey: 'neutral' },
    { style: 'solid', colorKey: 'neutral' },
    { style: 'thin', colorKey: 'primary' },
  ],
  'gmb-post': [
    { style: 'solid', colorKey: 'primary' },
    { style: 'shadow', colorKey: 'neutral' },
    { style: 'classic', colorKey: 'neutral' },
    { style: 'dashed', colorKey: 'primary' },
  ],
  email: [
    { style: 'solid', colorKey: 'neutral' },
    { style: 'thin', colorKey: 'primary' },
    { style: 'rounded', colorKey: 'secondary' },
    { style: 'dotted', colorKey: 'accent' },
  ],
}

const DEFAULT_FRAMES: Array<{ style: FrameStyle; colorKey: FrameColorKey }> = [
  { style: 'solid', colorKey: 'neutral' },
  { style: 'classic', colorKey: 'gold' },
  { style: 'polaroid', colorKey: 'neutral' },
  { style: 'vignette', colorKey: 'neutral' },
  { style: 'shadow', colorKey: 'neutral' },
]

function pickFrame(template?: string): { style: FrameStyle; colorKey: FrameColorKey } {
  const options = template && FRAME_BY_TEMPLATE[template] ? FRAME_BY_TEMPLATE[template] : DEFAULT_FRAMES
  return options[Math.floor(Math.random() * options.length)]
}

/**
 * POST /api/image/branding-recommendation
 * Returns suggested branding for a chosen image: logo/photo position, frame, tint, optional text overlays.
 * Body: { template?, hasLogo?: boolean, hasPhoto?: boolean, tagline?: string }
 * Uses new frame options (classic, polaroid, dashed, dotted, filmstrip, vignette, neon, shadow) by template.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const {
      template,
      hasLogo = false,
      hasPhoto = false,
      tagline,
    } = body as { template?: string; hasLogo?: boolean; hasPhoto?: boolean; tagline?: string }

    await new Promise((r) => setTimeout(r, 600))

    const recommendation: {
      logoPosition?: { x: number; y: number; scale: number }
      photoPosition?: { x: number; y: number; scale: number }
      frame: { style: FrameStyle; colorKey: FrameColorKey }
      tint: { colorKey: 'primary' | 'secondary' | 'accent'; opacity: number }
      textOverlays: Array<{ text: string; x: number; y: number; fontSize: number; fontFamily: 'Inter' | 'Georgia' | 'Playfair Display' | 'system-ui'; colorKey: 'primary' | 'secondary' | 'accent' }>
    } = {
      frame: pickFrame(template),
      tint: { colorKey: 'primary', opacity: 0.15 },
      textOverlays: [],
    }

    if (hasLogo) {
      recommendation.logoPosition = { x: 82, y: 82, scale: 14 }
    }
    if (hasPhoto) {
      recommendation.photoPosition = { x: 18, y: 82, scale: 18 }
    }
    if (tagline && String(tagline).trim()) {
      recommendation.textOverlays.push({
        text: String(tagline).trim().slice(0, 60),
        x: 50,
        y: 88,
        fontSize: 20,
        fontFamily: 'Inter',
        colorKey: 'primary',
      })
    }

    return NextResponse.json(recommendation)
  } catch (e) {
    console.error('Branding recommendation error:', e)
    return NextResponse.json(
      { error: 'Failed to get branding recommendation' },
      { status: 500 }
    )
  }
}
