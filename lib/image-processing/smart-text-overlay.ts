/**
 * Smart Text Overlay
 *
 * Adds a branded text bar (headline + business name) on top of a generated
 * image using Sharp + inline SVG.
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

  const barPadding = 20
  const barHeight = 90
  let barY: number

  if (position === 'bottom') {
    barY = height - barHeight - barPadding
  } else if (position === 'top') {
    barY = barPadding
  } else {
    barY = (height - barHeight) / 2
  }

  const scaleFactor = width / 1024
  const headlineFontSize = Math.round(48 * scaleFactor)
  const businessNameFontSize = Math.round(24 * scaleFactor)

  const svgOverlay = createTextBarSVG({
    width,
    height,
    barY,
    barHeight,
    barPadding,
    barColor,
    textColor,
    headline,
    businessName,
    headlineFontSize,
    businessNameFontSize,
  })

  return sharp(imageBuffer)
    .composite([{ input: svgOverlay, blend: 'over' }])
    .toBuffer()
}

// ---------------------------------------------------------------------------
// SVG builder
// ---------------------------------------------------------------------------
function createTextBarSVG(params: {
  width: number
  height: number
  barY: number
  barHeight: number
  barPadding: number
  barColor: string
  textColor: string
  headline: string
  businessName: string
  headlineFontSize: number
  businessNameFontSize: number
}): Buffer {
  const {
    width,
    height,
    barY,
    barHeight,
    barPadding,
    barColor,
    textColor,
    headline,
    businessName,
    headlineFontSize,
    businessNameFontSize,
  } = params

  const barX = barPadding
  const barWidth = width - barPadding * 2
  const textCenterX = width / 2
  const headlineY = barY + barHeight * 0.4
  const businessNameY = barY + barHeight * 0.75

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="barShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
          <feOffset dx="0" dy="2"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect
        x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}"
        rx="12" fill="${barColor}" filter="url(#barShadow)"
      />

      <text
        x="${textCenterX}" y="${headlineY}"
        font-family="Inter, Helvetica, Arial, sans-serif"
        font-size="${headlineFontSize}" font-weight="900"
        fill="${textColor}" text-anchor="middle" dominant-baseline="middle"
      >${escapeXml(headline)}</text>

      <text
        x="${textCenterX}" y="${businessNameY}"
        font-family="Inter, Helvetica, Arial, sans-serif"
        font-size="${businessNameFontSize}" font-weight="600"
        fill="${textColor}" text-anchor="middle" dominant-baseline="middle" opacity="0.95"
      >${escapeXml(businessName.toUpperCase())}</text>
    </svg>
  `)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function escapeXml(text: string): string {
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
 * Priority:
 * 1. If `generatedContent` is provided (e.g. a Twitter post), use its first meaningful sentence
 * 2. Match promotional patterns (20% OFF, $49.99, etc.)
 * 3. Title-case the topic, max 6 words
 */
export function extractHeadline(topic: string, generatedContent?: string | null): string {
  // 1. Try to extract from generated content (e.g. the Twitter post)
  if (generatedContent) {
    const lines = generatedContent
      .split('\n')
      .map(l => l.replace(/^[#@🔥⚡💡🚀✨🏠🔧🎉📢💪🙌]+\s*/g, '').trim())
      .filter(l => l.length > 5 && l.length < 70 && !l.startsWith('#') && !l.startsWith('@') && !l.startsWith('http'))
    if (lines.length > 0) {
      // Pick the shortest impactful line (often the hook)
      const best = lines.reduce((a, b) => a.length < b.length && a.length > 10 ? a : b)
      return best.length > 50 ? best.slice(0, 47) + '...' : best
    }
  }

  // 2. Promotional patterns
  const percentMatch = topic.match(/(\d+%\s*(?:off|discount))/i)
  if (percentMatch) return percentMatch[1].toUpperCase()

  const dollarMatch = topic.match(/(\$\d+(?:\.\d{2})?)/)
  if (dollarMatch) return dollarMatch[1]

  // 3. Title-case topic, max 6 words
  const cleaned = topic.replace(/[^\w\s''-]/g, '').trim()
  const words = cleaned.split(/\s+/).slice(0, 6)
  const titleCase = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  return titleCase.length > 50 ? titleCase.slice(0, 47) + '...' : titleCase
}
