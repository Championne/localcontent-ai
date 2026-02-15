/**
 * Image Quality Rating System
 *
 * Evaluates generated images on brand integration, composition, and technical quality.
 * Designed to work server-side with Sharp — call from API routes only.
 */

import sharp from 'sharp'
import { hexToHSL } from '@/lib/branding/personality-detection'

export interface ImageQualityRating {
  brandColorMatch: number       // 0-100
  brandPersonalityFit: number   // 0-100
  focalPointClarity: number     // 0-100
  textContrast: number          // 0-100
  overallScore: number          // weighted average
}

/**
 * Rate image quality. Pass the raw image buffer (fetched from URL)
 * and the brand primary color for comparison.
 */
export async function rateImageQuality(
  imageBuffer: Buffer,
  brandPrimaryColor?: string,
): Promise<ImageQualityRating> {
  const brandColorMatch = brandPrimaryColor
    ? await analyzeBrandColorMatch(imageBuffer, brandPrimaryColor)
    : 75 // neutral default

  const focalPointClarity = await analyzeFocalPointClarity(imageBuffer)
  const textContrast = await analyzeTextContrast(imageBuffer)

  // Personality fit is hard to compute without ML, give a baseline
  const brandPersonalityFit = 80

  const overallScore = Math.round(
    brandColorMatch * 0.25 +
    focalPointClarity * 0.30 +
    textContrast * 0.20 +
    brandPersonalityFit * 0.25,
  )

  return {
    brandColorMatch,
    brandPersonalityFit,
    focalPointClarity,
    textContrast,
    overallScore,
  }
}

/** Compare the dominant hue of the image to the brand primary hue. */
async function analyzeBrandColorMatch(imageBuffer: Buffer, brandPrimaryColor: string): Promise<number> {
  try {
    const { dominant } = await sharp(imageBuffer).stats()
    const brandHSL = hexToHSL(brandPrimaryColor)

    // Convert RGB dominant to HSL (simplified)
    const hex = `#${dominant.r.toString(16).padStart(2, '0')}${dominant.g.toString(16).padStart(2, '0')}${dominant.b.toString(16).padStart(2, '0')}`
    const imageHSL = hexToHSL(hex)

    // Circular hue distance (max 180)
    const hueDist = Math.min(Math.abs(brandHSL.h - imageHSL.h), 360 - Math.abs(brandHSL.h - imageHSL.h))

    // Score: 100 = perfect match, 0 = opposite colours
    return Math.max(0, Math.round(100 - hueDist / 1.8))
  } catch {
    return 70 // fallback
  }
}

/** Edge-detection based focal-point clarity estimate. */
async function analyzeFocalPointClarity(imageBuffer: Buffer): Promise<number> {
  try {
    const edges = await sharp(imageBuffer)
      .greyscale()
      .convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] })
      .raw()
      .toBuffer()

    const avg = edges.reduce((sum, v) => sum + v, 0) / edges.length
    // Higher avg edge value = sharper subject
    return Math.min(100, Math.round(avg * 2.5))
  } catch {
    return 75
  }
}

/** Check contrast in the bottom 20% where text bars typically sit. */
async function analyzeTextContrast(imageBuffer: Buffer): Promise<number> {
  try {
    const meta = await sharp(imageBuffer).metadata()
    const h = meta.height ?? 1024
    const w = meta.width ?? 1024
    const cropH = Math.max(1, Math.floor(h * 0.2))

    const bottom = await sharp(imageBuffer)
      .extract({ left: 0, top: h - cropH, width: w, height: cropH })
      .greyscale()
      .raw()
      .toBuffer()

    const avg = bottom.reduce((sum, v) => sum + v, 0) / bottom.length
    // Very dark or very light = good contrast zone for text overlay
    return avg < 50 || avg > 200 ? 90 : 60
  } catch {
    return 75
  }
}
