/**
 * Smart Text Overlay
 *
 * Adds a branded text bar (headline + business name) on top of a generated
 * image. Uses Sharp's Pango text rendering for text (works on Vercel Lambda
 * where librsvg has no fonts) and SVG only for the background bar shape.
 */

import sharp from 'sharp'
import { getContrastColor, adjustAlpha } from '@/lib/branding/personality-detection'

export interface TextOverlayOptions {
  headline: string
  businessName: string
  brandColor: string
  position?: 'top' | 'bottom' | 'center'
  barOpacity?: number
}

export async function addSmartTextOverlay(
  imageBuffer: Buffer,
  options: TextOverlayOptions
): Promise<Buffer> {
  const {
    headline,
    businessName,
    brandColor,
    position = 'bottom',
    barOpacity = 0.9,
  } = options

  const meta = await sharp(imageBuffer).metadata()
  const width = meta.width || 1024
  const height = meta.height || 1024

  const barColor = adjustAlpha(brandColor, barOpacity)
  const textColor = getContrastColor(brandColor)

  const barPadding = Math.round(20 * (width / 1024))
  const barHeight = Math.round(90 * (width / 1024))
  const barWidth = width - barPadding * 2

  let barY: number
  if (position === 'bottom') {
    barY = height - barHeight - barPadding
  } else if (position === 'top') {
    barY = barPadding
  } else {
    barY = Math.round((height - barHeight) / 2)
  }

  // 1. Create the background bar as SVG (no text — librsvg has no fonts on Vercel)
  const barSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="s" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
          <feOffset dx="0" dy="2"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect x="${barPadding}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="12" fill="${barColor}" filter="url(#s)"/>
    </svg>
  `)

  // 2. Render headline text using Sharp's Pango engine (has fonts on Lambda)
  const headlineFontSize = Math.max(16, Math.round(36 * (width / 1024)))
  const bizFontSize = Math.max(10, Math.round(18 * (width / 1024)))

  const headlineText = await sharp({
    text: {
      text: `<span foreground="${textColor}" font_desc="Sans Bold ${headlineFontSize}">${escapePango(headline)}</span>`,
      rgba: true,
      width: barWidth - 20,
      height: Math.round(barHeight * 0.55),
      align: 'centre',
    },
  }).png().toBuffer()

  const bizText = await sharp({
    text: {
      text: `<span foreground="${textColor}" font_desc="Sans Bold ${bizFontSize}">${escapePango(businessName.toUpperCase())}</span>`,
      rgba: true,
      width: barWidth - 20,
      height: Math.round(barHeight * 0.35),
      align: 'centre',
    },
  }).png().toBuffer()

  // Get rendered text dimensions for centering
  const headlineMeta = await sharp(headlineText).metadata()
  const bizMeta = await sharp(bizText).metadata()

  const headlineLeft = Math.round(barPadding + (barWidth - (headlineMeta.width || 0)) / 2)
  const headlineTop = Math.round(barY + barHeight * 0.08)
  const bizLeft = Math.round(barPadding + (barWidth - (bizMeta.width || 0)) / 2)
  const bizTop = Math.round(barY + barHeight * 0.55)

  // 3. Composite: image → bar → headline → business name
  return sharp(imageBuffer)
    .composite([
      { input: barSvg, blend: 'over' },
      { input: headlineText, left: headlineLeft, top: headlineTop, blend: 'over' },
      { input: bizText, left: bizLeft, top: bizTop, blend: 'over' },
    ])
    .toBuffer()
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape text for Pango markup */
function escapePango(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Extract a short headline for text overlay.
 *
 * Uses sentence case (modern marketing standard for social media).
 * Priority:
 * 1. If `generatedContent` is provided, extract the best hook line
 * 2. Match promotional patterns (20% OFF, $49.99, etc.)
 * 3. Use the topic as-is in sentence case, truncated to ~50 chars
 */
export function extractHeadline(topic: string, generatedContent?: string | null): string {
  const topicLower = topic.toLowerCase().trim()

  // 1. Try to extract a punchy line from generated content that differs from the topic
  if (generatedContent) {
    const lines = generatedContent
      .split('\n')
      .map(l => l
        .replace(/^[#@🔥⚡💡🚀✨🏠🔧🎉📢💪🙌🍔🌮🎯❤️👉]+\s*/g, '')
        .replace(/[#@]\w+/g, '')
        .trim()
      )
      .filter(l =>
        l.length > 8 && l.length < 70
        && !l.startsWith('http')
        && !l.startsWith('---')
        && l.toLowerCase() !== topicLower
      )

    if (lines.length > 0) {
      // Score lines: prefer short, punchy, different from topic
      const scored = lines.map(line => {
        let score = 0
        const lineLower = line.toLowerCase()
        // Penalize if line is just the topic rephrased minimally
        if (lineLower.includes(topicLower) || topicLower.includes(lineLower)) score -= 10
        // Prefer lines 15-45 chars (ideal for overlay)
        if (line.length >= 15 && line.length <= 45) score += 5
        // Bonus for action words / hooks
        if (/\b(discover|try|taste|experience|love|best|new|fresh|ultimate|craving|delicious|amazing)\b/i.test(line)) score += 3
        // Bonus for questions or calls to action
        if (/[?!]$/.test(line)) score += 2
        // Penalty for overly generic filler
        if (/^(here|this|that|the|our|we|i )/i.test(line)) score -= 2
        return { line, score }
      })
      scored.sort((a, b) => b.score - a.score)
      const best = scored[0].line
      return best.length > 50 ? best.slice(0, 47) + '...' : best
    }
  }

  // 2. Promotional patterns (keep uppercase for emphasis — industry standard)
  const percentMatch = topic.match(/(\d+%\s*(?:off|discount))/i)
  if (percentMatch) return percentMatch[1].toUpperCase()

  const dollarMatch = topic.match(/(\$\d+(?:\.\d{2})?)/)
  if (dollarMatch) return dollarMatch[1]

  // 3. Fall back to topic — sentence case, truncated
  const cleaned = topic.replace(/[!?]+$/, '').trim()
  if (cleaned.length <= 50) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  }
  const truncated = cleaned.slice(0, 50).replace(/\s+\S*$/, '')
  return truncated.charAt(0).toUpperCase() + truncated.slice(1) + '...'
}
