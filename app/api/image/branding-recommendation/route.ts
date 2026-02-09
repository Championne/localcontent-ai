import { NextResponse } from 'next/server'

type FrameStyle =
  | 'thin'
  | 'solid'
  | 'thick'
  | 'double'
  | 'classic'
  | 'wooden'
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
    { style: 'solid', colorKey: 'neutral' },
    { style: 'neon', colorKey: 'primary' },
    { style: 'thick', colorKey: 'primary' },
    { style: 'shadow', colorKey: 'neutral' },
    { style: 'thin', colorKey: 'primary' },
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
    { style: 'thin', colorKey: 'primary' },
  ],
  email: [
    { style: 'solid', colorKey: 'neutral' },
    { style: 'thin', colorKey: 'primary' },
    { style: 'solid', colorKey: 'secondary' },
    { style: 'thick', colorKey: 'accent' },
  ],
}

const DEFAULT_FRAMES: Array<{ style: FrameStyle; colorKey: FrameColorKey }> = [
  { style: 'solid', colorKey: 'neutral' },
  { style: 'classic', colorKey: 'gold' },
  { style: 'gold', colorKey: 'gold' },
  { style: 'silver', colorKey: 'silver' },
  { style: 'vignette', colorKey: 'neutral' },
  { style: 'shadow', colorKey: 'neutral' },
]

/** Pick the single best suggested frame for the template (deterministic so every image gets same style). */
function pickBestFrame(template?: string): { style: FrameStyle; colorKey: FrameColorKey } {
  const options = template && FRAME_BY_TEMPLATE[template] ? FRAME_BY_TEMPLATE[template] : DEFAULT_FRAMES
  return options[0]
}

/**
 * POST /api/image/branding-recommendation
 * Returns one best suggested branding: logo/photo position, frame, tint, text overlays (tagline, business name, website, social, CTA).
 * Body: { template?, hasLogo?, hasPhoto?, tagline?, businessName?, website?, socialHandles?, defaultCtaPrimary? }
 * Uses a single best format per template so switching images always gets the same recommended style.
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
      website,
      socialHandles,
      defaultCtaPrimary,
    } = body as {
      template?: string
      hasLogo?: boolean
      hasPhoto?: boolean
      tagline?: string
      businessName?: string
      website?: string
      socialHandles?: string
      defaultCtaPrimary?: string
    }

    await new Promise((r) => setTimeout(r, 400))

    const recommendation: {
      logoPosition?: { x: number; y: number; scale: number }
      photoPosition?: { x: number; y: number; scale: number }
      frame: { style: FrameStyle; colorKey: FrameColorKey }
      tint: { colorKey: 'primary' | 'secondary' | 'accent'; opacity: number }
      textOverlays: Array<{ text: string; x: number; y: number; fontSize: number; fontFamily: 'Inter' | 'Georgia' | 'Playfair Display' | 'system-ui'; colorKey: 'primary' | 'secondary' | 'accent' }>
    } = {
      frame: pickBestFrame(template),
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
    if (businessName && String(businessName).trim() && isSocial) {
      recommendation.textOverlays.push({
        text: String(businessName).trim().slice(0, 40),
        x: 50,
        y: 10,
        fontSize: 16,
        fontFamily: 'Inter',
        colorKey: 'secondary',
      })
    }
    if (defaultCtaPrimary && String(defaultCtaPrimary).trim() && isSocial) {
      recommendation.textOverlays.push({
        text: String(defaultCtaPrimary).trim().slice(0, 30),
        x: 50,
        y: 68,
        fontSize: 14,
        fontFamily: 'Inter',
        colorKey: 'primary',
      })
    }
    if (tagline && String(tagline).trim()) {
      recommendation.textOverlays.push({
        text: String(tagline).trim().slice(0, 50),
        x: 50,
        y: isSocial ? 80 : 90,
        fontSize: isSocial ? 18 : 20,
        fontFamily: 'Inter',
        colorKey: 'primary',
      })
    }
    if (website && String(website).trim() && isSocial) {
      const displayUrl = String(website).trim().replace(/^https?:\/\//i, '').slice(0, 32)
      recommendation.textOverlays.push({
        text: displayUrl,
        x: 50,
        y: 88,
        fontSize: 12,
        fontFamily: 'Inter',
        colorKey: 'accent',
      })
    }
    if (socialHandles && String(socialHandles).trim() && isSocial) {
      recommendation.textOverlays.push({
        text: String(socialHandles).trim().slice(0, 28),
        x: 50,
        y: 95,
        fontSize: 11,
        fontFamily: 'Inter',
        colorKey: 'secondary',
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
