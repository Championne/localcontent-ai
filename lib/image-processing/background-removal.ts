/**
 * Smart Background Removal
 *
 * Free method: Sharp-based colour-distance alpha masking (works well for
 * clean / solid backgrounds). Falls back to Remove.bg for complex images
 * when the REMOVE_BG_API_KEY env var is set.
 */

import sharp from 'sharp'

export interface BackgroundRemovalResult {
  buffer: Buffer
  method: 'free' | 'paid'
  cost: number
  quality: number
}

export async function smartBackgroundRemoval(
  imageBuffer: Buffer
): Promise<BackgroundRemovalResult> {
  console.log('Starting smart background removal…')

  // Always try the free Sharp method first
  const simpleResult = await sharpBackgroundRemoval(imageBuffer)
  const quality = await assessRemovalQuality(simpleResult)

  console.log(`Free removal quality: ${quality.toFixed(2)}`)

  if (quality >= 0.7) {
    console.log('Using free Sharp method')
    return { buffer: simpleResult, method: 'free', cost: 0, quality }
  }

  // Fallback to Remove.bg when available and quality is low
  if (!process.env.REMOVE_BG_API_KEY) {
    console.warn('Remove.bg not configured, using free method anyway')
    return { buffer: simpleResult, method: 'free', cost: 0, quality }
  }

  console.log('Using Remove.bg ($0.20)')

  try {
    const removeBgResult = await removeBgAPI(imageBuffer)
    return { buffer: removeBgResult, method: 'paid', cost: 0.20, quality: 0.95 }
  } catch (error) {
    console.error('Remove.bg failed, using free method:', error)
    return { buffer: simpleResult, method: 'free', cost: 0, quality }
  }
}

// ---------------------------------------------------------------------------
// Free: Sharp colour-distance masking
// ---------------------------------------------------------------------------
async function sharpBackgroundRemoval(imageBuffer: Buffer): Promise<Buffer> {
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()
  const width = metadata.width!
  const height = metadata.height!

  // Sample a 10×10 block from the top-left corner for background colour
  const { data: cornerData } = await image
    .clone()
    .extract({ left: 0, top: 0, width: Math.min(10, width), height: Math.min(10, height) })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const avgR = cornerData[0]
  const avgG = cornerData[1]
  const avgB = cornerData[2]

  // Build raw pixel data without alpha
  const channels = 3
  const rawData = await image
    .clone()
    .removeAlpha()
    .toColourspace('srgb')
    .raw()
    .toBuffer()

  const totalPixels = width * height
  const maskData = Buffer.alloc(totalPixels)

  for (let i = 0; i < totalPixels; i++) {
    const off = i * channels
    const r = rawData[off]
    const g = rawData[off + 1]
    const b = rawData[off + 2]

    const distance = Math.sqrt(
      (r - avgR) ** 2 + (g - avgG) ** 2 + (b - avgB) ** 2
    )

    maskData[i] = distance < 40 ? 0 : 255
  }

  // Create single-channel mask and join onto original image
  const mask = await sharp(maskData, {
    raw: { width, height, channels: 1 },
  }).toBuffer()

  return sharp(imageBuffer)
    .removeAlpha()
    .joinChannel(mask)
    .png()
    .toBuffer()
}

// ---------------------------------------------------------------------------
// Paid: Remove.bg API
// ---------------------------------------------------------------------------
async function removeBgAPI(imageBuffer: Buffer): Promise<Buffer> {
  const FormData = (await import('form-data')).default

  const formData = new FormData()
  formData.append('image_file', imageBuffer, {
    filename: 'image.png',
    contentType: 'image/png',
  })
  formData.append('size', 'auto')

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.REMOVE_BG_API_KEY!,
      ...formData.getHeaders(),
    },
    // @ts-expect-error — form-data stream is compatible with fetch body
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Remove.bg error: ${response.status}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

// ---------------------------------------------------------------------------
// Quality assessment heuristic
// ---------------------------------------------------------------------------
async function assessRemovalQuality(resultBuffer: Buffer): Promise<number> {
  try {
    const resultImage = sharp(resultBuffer)
    const metadata = await resultImage.metadata()

    if (!metadata.hasAlpha) return 0.3

    const { data } = await resultImage
      .extractChannel(3) // alpha channel
      .raw()
      .toBuffer({ resolveWithObject: true })

    let transparentPixels = 0
    let opaquePixels = 0

    for (let i = 0; i < data.length; i++) {
      if (data[i] < 10) transparentPixels++
      else if (data[i] > 245) opaquePixels++
    }

    const total = data.length
    const transparencyRatio = transparentPixels / total
    const opaqueRatio = opaquePixels / total

    // Good removal: reasonable mix of transparent + opaque
    if (transparencyRatio > 0.3 && transparencyRatio < 0.7 && opaqueRatio > 0.5) {
      return 0.85
    }
    if (transparencyRatio > 0.2 && transparencyRatio < 0.8 && opaqueRatio > 0.3) {
      return 0.65
    }

    return 0.4
  } catch {
    return 0.5
  }
}
