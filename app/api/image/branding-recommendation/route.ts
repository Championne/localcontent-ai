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
  | 'gold'
  | 'silver'
  | 'copper'
type FrameColorKey = 'primary' | 'secondary' | 'accent' | 'silver' | 'gold' | 'copper' | 'neutral'

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
    { style: 'gold', colorKey: 'gold' },
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
  { style: 'gold', colorKey: 'gold' },
  { style: 'silver', colorKey: 'silver' },
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
 * Returns suggested branding to optimize the image for social: logo/photo position, frame, tint, text overlays.
 * Body: { template?, hasLogo?: boolean, hasPhoto?: boolean, tagline?, businessName?, defaultCtaPrimary? }
 * Always suggests frame + tint so something is applied; adds logo/photo positions and text (tagline, business name, CTA) for social.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const {
      template,
      hasLogo = false,
      hasPhoto = false,
      tagline,
      businessName,
      defaultCtaPrimary,
    } = body as { template?: string; hasLogo?: boolean; hasPhoto?: boolean; tagline?: string; businessName?: string; defaultCtaPrimary?: string }

    await new Promise((r) => setTimeout(r, 400))

    const recommendation: {
      logoPosition?: { x: number; y: number; scale: number }
      photoPosition?: { x: number; y: number; scale: number }
      frame: { style: FrameStyle; colorKey: FrameColorKey }
      tint: { colorKey: 'primary' | 'secondary' | 'accent'; opacity: number }
      textOverlays: Array<{ text: string; x: number; y: number; fontSize: number; fontFamily: 'Inter' | 'Georgia' | 'Playfair Display' | 'system-ui'; colorKey: 'primary' | 'secondary' | 'accent' }>
    } = {
      frame: pickFrame(template),
      tint: { colorKey: 'primary', opacity: 0.12 },
      textOverlays: [],
    }

    if (hasLogo) {
      recommendation.logoPosition = { x: 84, y: 14, scale: 12 }
    }
    if (hasPhoto) {
      recommendation.photoPosition = { x: 16, y: 82, scale: 16 }
    }

    const isSocial = template === 'social-pack' || template === 'gmb-post'
    if (tagline && String(tagline).trim()) {
      recommendation.textOverlays.push({
        text: String(tagline).trim().slice(0, 50),
        x: 50,
        y: isSocial ? 88 : 90,
        fontSize: isSocial ? 18 : 20,
        fontFamily: 'Inter',
        colorKey: 'primary',
      })
    }
    if (businessName && String(businessName).trim() && isSocial) {
      recommendation.textOverlays.push({
        text: String(businessName).trim().slice(0, 40),
        x: 50,
        y: 12,
        fontSize: 16,
        fontFamily: 'Inter',
        colorKey: 'secondary',
      })
    }
    if (defaultCtaPrimary && String(defaultCtaPrimary).trim() && isSocial) {
      recommendation.textOverlays.push({
        text: String(defaultCtaPrimary).trim().slice(0, 30),
        x: 50,
        y: 94,
        fontSize: 14,
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
