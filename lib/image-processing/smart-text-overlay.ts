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

/** Extract a short headline from the topic string. */
export function extractHeadline(topic: string): string {
  const percentMatch = topic.match(/(\d+%\s*(?:off|discount))/i)
  if (percentMatch) return percentMatch[1].toUpperCase()

  const dollarMatch = topic.match(/(\$\d+(?:\.\d{2})?)/)
  if (dollarMatch) return dollarMatch[1]

  const promoKeywords = ['new', 'sale', 'special', 'limited', 'free', 'today', 'now']
  const words = topic.toLowerCase().split(/\s+/)
  const promoWords = words.filter((w) =>
    promoKeywords.some((kw) => w.includes(kw))
  )

  if (promoWords.length > 0) {
    return promoWords.slice(0, 3).join(' ').toUpperCase()
  }

  const significantWords = words.filter(
    (w) => w.length > 3 && !['the', 'and', 'for', 'with'].includes(w)
  )

  if (significantWords.length > 0) {
    return significantWords.slice(0, 2).join(' ').toUpperCase()
  }

  return topic.slice(0, 20).toUpperCase()
}
