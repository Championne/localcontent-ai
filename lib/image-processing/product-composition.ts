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
// Drop shadow via SVG filter rendered by Sharp
// ---------------------------------------------------------------------------
async function addNaturalShadow(
  productBuffer: Buffer,
  width: number,
  height: number,
  intensity: number = 0.3
): Promise<Buffer> {
  const shadowOffset = Math.round(Math.max(width, height) * 0.02)
  const shadowBlur = Math.round(Math.max(width, height) * 0.04)

  const canvasW = width + shadowOffset * 3
  const canvasH = height + shadowOffset * 3

  const svgOverlay = Buffer.from(`
    <svg width="${canvasW}" height="${canvasH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="${shadowBlur}"/>
          <feOffset dx="${shadowOffset}" dy="${shadowOffset}" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="${intensity}"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <image
          href="data:image/png;base64,${productBuffer.toString('base64')}"
          x="${shadowOffset}"
          y="${shadowOffset}"
          width="${width}"
          height="${height}"
        />
      </g>
    </svg>
  `)

  return sharp(svgOverlay).png().toBuffer()
}
