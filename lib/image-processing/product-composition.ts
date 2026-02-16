/**
 * Product Composition
 *
 * Composites a product image (with transparent background) onto a generated
 * branded background. Adds a natural drop shadow via SVG filter.
 */

import sharp from 'sharp'

export interface CompositionOptions {
  productScale?: number
  position?: 'center' | 'rule-of-thirds'
  addShadow?: boolean
  shadowIntensity?: number
}

export async function compositeProduct(
  backgroundBuffer: Buffer,
  productBuffer: Buffer,
  _brandColor: string,
  options: CompositionOptions = {}
): Promise<Buffer> {
  const {
    productScale = 0.6,
    position = 'center',
    addShadow = true,
    shadowIntensity = 0.3,
  } = options

  const bgMeta = await sharp(backgroundBuffer).metadata()
  const prodMeta = await sharp(productBuffer).metadata()

  const bgWidth = bgMeta.width || 1024
  const bgHeight = bgMeta.height || 1024
  const prodWidth = prodMeta.width || 512
  const prodHeight = prodMeta.height || 512

  const maxProductWidth = Math.round(bgWidth * productScale)
  const aspectRatio = prodHeight / prodWidth
  const scaledHeight = Math.round(maxProductWidth * aspectRatio)

  let finalWidth = maxProductWidth
  let finalHeight = scaledHeight

  if (scaledHeight > bgHeight * productScale) {
    finalHeight = Math.round(bgHeight * productScale)
    finalWidth = Math.round(finalHeight / aspectRatio)
  }

  const resizedProduct = await sharp(productBuffer)
    .resize(finalWidth, finalHeight, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer()

  let posX: number
  let posY: number

  if (position === 'center') {
    posX = Math.round((bgWidth - finalWidth) / 2)
    posY = Math.round((bgHeight - finalHeight) / 2)
  } else {
    posX = Math.round((bgWidth - finalWidth) / 2)
    posY = Math.round(bgHeight * 0.4 - finalHeight / 2)
  }

  let productWithShadow = resizedProduct
  if (addShadow) {
    productWithShadow = await addNaturalShadow(
      resizedProduct,
      finalWidth,
      finalHeight,
      shadowIntensity
    )
  }

  return sharp(backgroundBuffer)
    .composite([
      {
        input: productWithShadow,
        left: Math.max(0, posX),
        top: Math.max(0, posY),
        blend: 'over',
      },
    ])
    .toBuffer()
}

// ---------------------------------------------------------------------------
// Drop shadow using Sharp-native operations (no SVG/librsvg dependency)
// ---------------------------------------------------------------------------
async function addNaturalShadow(
  productBuffer: Buffer,
  width: number,
  height: number,
  intensity: number = 0.3
): Promise<Buffer> {
  const shadowOffset = Math.round(Math.max(width, height) * 0.02)
  const blurSigma = Math.max(1, Math.round(Math.max(width, height) * 0.02))

  const canvasW = width + shadowOffset * 3
  const canvasH = height + shadowOffset * 3

  // Extract alpha channel from product → use as shadow mask
  const productImage = sharp(productBuffer).ensureAlpha()
  const { data: alphaData } = await productImage
    .clone()
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extractChannel(3)
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Build shadow: black pixels where product is opaque, scaled by intensity
  const shadowPixels = Buffer.alloc(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    const a = Math.round(alphaData[i] * intensity)
    shadowPixels[i * 4] = 0     // R
    shadowPixels[i * 4 + 1] = 0 // G
    shadowPixels[i * 4 + 2] = 0 // B
    shadowPixels[i * 4 + 3] = a // A
  }

  // Blur the shadow
  const blurredShadow = await sharp(shadowPixels, { raw: { width, height, channels: 4 } })
    .blur(blurSigma)
    .png()
    .toBuffer()

  // Create transparent canvas, composite shadow (offset) then product
  const canvas = await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer()

  const resizedProduct = await sharp(productBuffer)
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  return sharp(canvas)
    .composite([
      { input: blurredShadow, left: shadowOffset * 2, top: shadowOffset * 2, blend: 'over' },
      { input: resizedProduct, left: shadowOffset, top: shadowOffset, blend: 'over' },
    ])
    .png()
    .toBuffer()
}
