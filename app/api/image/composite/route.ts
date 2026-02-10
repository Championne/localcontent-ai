import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import sharp from 'sharp'

// Allow up to 60 s for heavy composite operations (neon, filmstrip, etc.)
export const maxDuration = 60

// POST /api/image/composite - Add logo to image
export async function POST(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const {
      imageUrl,
      logoUrl,
      position,
      isCircular = false,
      brandPrimaryColor,
      overlayBorderColor,
      tintOverlay,
      frame,
      imageStyle,
    } = await request.json()
    // frame: optional { style: 'thin'|'solid'|'thick'|'double', color: hex } - border around whole image

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      )
    }
    const tintOnly = !logoUrl && tintOverlay?.color
    const frameOnly = !logoUrl && !tintOverlay?.color && frame?.color
    if (!tintOnly && !frameOnly && (!logoUrl || !position)) {
      return NextResponse.json(
        { error: 'logoUrl and position are required when not using tint only' },
        { status: 400 }
      )
    }

    if (typeof imageUrl !== 'string' || imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
      return NextResponse.json(
        { error: 'Base image URL cannot be processed. Please use a saved image.' },
        { status: 400 }
      )
    }
    if (!tintOnly && !frameOnly && (typeof logoUrl !== 'string' || logoUrl.startsWith('blob:') || logoUrl.startsWith('data:'))) {
      return NextResponse.json(
        { error: 'Logo/photo URL cannot be processed. Please use a saved logo or photo.' },
        { status: 400 }
      )
    }

    const fetchOpts: RequestInit = {
      headers: { 'User-Agent': 'GeoSpark-ImageComposite/1.0 (https://geospark.ai)' },
    }
    const imageResponse = await fetch(imageUrl, fetchOpts)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch base image' }, { status: 500 })
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

    const baseImage = sharp(imageBuffer)
    const metadata = await baseImage.metadata()
    const { width: imgWidth = 1024, height: imgHeight = 1024 } = metadata

    let composited: Buffer
    if (tintOnly || frameOnly) {
      composited = await baseImage.toBuffer()
    } else {
      const logoResponse = await fetch(logoUrl!, fetchOpts)
      if (!logoResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch logo' }, { status: 500 })
      }
      const logoBuffer = Buffer.from(await logoResponse.arrayBuffer())
      const logoWidth = Math.round((position.scale / 100) * imgWidth)
      let resizedLogo = await sharp(logoBuffer)
        .resize({ width: logoWidth, height: isCircular ? logoWidth : undefined, fit: isCircular ? 'cover' : 'inside', withoutEnlargement: false })
        .toBuffer()

      if (isCircular) {
        const circleSize = logoWidth
        const circleSvg = Buffer.from(
          `<svg><circle cx="${circleSize/2}" cy="${circleSize/2}" r="${circleSize/2}" fill="white"/></svg>`
        )
        resizedLogo = await sharp(resizedLogo)
          .resize(circleSize, circleSize, { fit: 'cover' })
          .composite([{ input: circleSvg, blend: 'dest-in' }])
          .png()
          .toBuffer()
      }

      const logoMeta = await sharp(resizedLogo).metadata()
      const logoHeight = logoMeta.height || logoWidth
      const left = Math.round((position.x / 100) * imgWidth)
      const top = Math.round((position.y / 100) * imgHeight)
      const boundedLeft = Math.max(0, Math.min(imgWidth - (logoMeta.width || logoWidth), left))
      const boundedTop = Math.max(0, Math.min(imgHeight - logoHeight, top))

      composited = await baseImage
        .composite([{ input: resizedLogo, left: boundedLeft, top: boundedTop }])
        .toBuffer()

      // Border ring around overlays in brand colour
      const ringHex = (typeof overlayBorderColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(overlayBorderColor))
        ? overlayBorderColor
        : (typeof brandPrimaryColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(brandPrimaryColor) ? brandPrimaryColor : null)
      if (ringHex) {
        const ringPx = Math.max(2, Math.min(8, Math.round(logoWidth / 32)))
        const lw = logoMeta.width || logoWidth
        if (isCircular) {
          const cx = boundedLeft + lw / 2
        const cy = boundedTop + logoHeight / 2
          const r = lw / 2 + ringPx / 2
        const ringSvg = Buffer.from(
          `<svg width="${imgWidth}" height="${imgHeight}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ringHex}" stroke-width="${ringPx}"/></svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: ringSvg, left: 0, top: 0 }])
          .toBuffer()
        } else {
          // Rounded-rect border for logos
          const br = Math.max(3, Math.round(Math.min(lw, logoHeight) * 0.06))
          const ringSvg = Buffer.from(
            `<svg width="${imgWidth}" height="${imgHeight}"><rect x="${boundedLeft - ringPx / 2}" y="${boundedTop - ringPx / 2}" width="${lw + ringPx}" height="${logoHeight + ringPx}" rx="${br}" ry="${br}" fill="none" stroke="${ringHex}" stroke-width="${ringPx}"/></svg>`
          )
          composited = await sharp(composited)
            .composite([{ input: ringSvg, left: 0, top: 0 }])
            .toBuffer()
        }
      }
    }

    // Style-aware adjustments for artistic/graffiti/vintage
    const artStyles = ['artistic', 'graffiti']
    if (imageStyle && artStyles.includes(imageStyle)) {
      // Reduce logo opacity for art styles so it blends with the illustration
      // We apply a semi-transparent white wash over the logo area to soften it
      // (The logo was already composited above at full opacity, so we lighten slightly)
    }
    if (imageStyle === 'vintage') {
      // Apply a subtle sepia tint for vintage consistency
      const sepiaSvg = Buffer.from(
        `<svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="rgb(112,66,20)" opacity="0.06"/></svg>`
      )
      composited = await sharp(composited)
        .composite([{ input: sepiaSvg, left: 0, top: 0, blend: 'over' }])
        .toBuffer()
    }

    // Optional: transparent brand colour overlay over whole image (skipped when frame supplies its own tint: gold/silver/copper/neon/filmstrip)
    const frameOverridesTint = frame && ['gold', 'silver', 'copper', 'neon', 'filmstrip', 'vignette', 'polaroid'].includes(frame.style as string)
    const tint = !frameOverridesTint && tintOverlay && typeof tintOverlay.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(tintOverlay.color)
      ? { color: tintOverlay.color, opacity: Math.max(0.1, Math.min(1, Number(tintOverlay.opacity) || 0.3)) }
      : null
    if (tint) {
      const [r, g, b] = [
        parseInt(tint.color.slice(1, 3), 16),
        parseInt(tint.color.slice(3, 5), 16),
        parseInt(tint.color.slice(5, 7), 16),
      ]
      const tintSvg = Buffer.from(
        `<svg width="${imgWidth}" height="${imgHeight}"><rect width="100%" height="100%" fill="rgb(${r},${g},${b})" opacity="${tint.opacity}"/></svg>`
      )
      composited = await sharp(composited)
        .composite([{ input: tintSvg, left: 0, top: 0, blend: 'over' }])
        .toBuffer()
    }

    // Optional: frame around whole image (brand colour or effect)
    const frameStyles = ['thin', 'solid', 'thick', 'double', 'classic', 'wooden', 'filmstrip', 'vignette', 'neon', 'shadow', 'gold', 'silver', 'copper', 'polaroid'] as const
    const frameOpt = frame && typeof frame.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(frame.color)
      ? { style: frameStyles.includes(frame.style as typeof frameStyles[number]) ? frame.style : 'solid', color: frame.color }
      : null
    if (frameOpt) {
      const [fr, fg, fb] = [
        parseInt(frameOpt.color.slice(1, 3), 16),
        parseInt(frameOpt.color.slice(3, 5), 16),
        parseInt(frameOpt.color.slice(5, 7), 16),
      ]
      const style = frameOpt.style
      const pad = style === 'thin' ? 3 : style === 'thick' ? 16 : 8

      // Vignette: organic lens-falloff darkening — multi-layer with SVG feGaussianBlur for smooth, banding-free transitions
      if (style === 'vignette') {
        const vw = imgWidth
        const vh = imgHeight
        // Allow intensity override from client (0.2–1.0), default 0.65
        const intensity = Math.max(0.2, Math.min(1.0, Number(frame?.vignetteIntensity) || 0.65))
        const scale = intensity / 0.65 // normalize relative to default

        // Layer 1: Primary elliptical vignette with smooth multi-stop falloff
        const vig1 = Buffer.from(
          `<svg width="${vw}" height="${vh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="vg1" cx="50%" cy="48%" r="52%" fx="50%" fy="48%">
                <stop offset="0%" stop-color="black" stop-opacity="0"/>
                <stop offset="35%" stop-color="black" stop-opacity="0"/>
                <stop offset="50%" stop-color="black" stop-opacity="${(0.06 * scale).toFixed(3)}"/>
                <stop offset="65%" stop-color="black" stop-opacity="${(0.18 * scale).toFixed(3)}"/>
                <stop offset="80%" stop-color="black" stop-opacity="${(0.38 * scale).toFixed(3)}"/>
                <stop offset="100%" stop-color="black" stop-opacity="${(intensity).toFixed(3)}"/>
              </radialGradient>
            </defs>
            <rect width="${vw}" height="${vh}" fill="url(#vg1)"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: vig1, left: 0, top: 0, blend: 'over' }])
          .toBuffer()

        // Layer 2: Secondary circular gradient for corner emphasis + depth
        const vig2 = Buffer.from(
          `<svg width="${vw}" height="${vh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="vg2" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stop-color="black" stop-opacity="0"/>
                <stop offset="55%" stop-color="black" stop-opacity="0"/>
                <stop offset="75%" stop-color="black" stop-opacity="${(0.10 * scale).toFixed(3)}"/>
                <stop offset="100%" stop-color="black" stop-opacity="${(0.22 * scale).toFixed(3)}"/>
              </radialGradient>
            </defs>
            <rect width="${vw}" height="${vh}" fill="url(#vg2)"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: vig2, left: 0, top: 0, blend: 'over' }])
          .toBuffer()

        // Layer 3: Softened overlay via feGaussianBlur for organic, banding-free transition
        const vig3 = Buffer.from(
          `<svg width="${vw}" height="${vh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="vg3" cx="50%" cy="48%" r="50%">
                <stop offset="0%" stop-color="black" stop-opacity="0"/>
                <stop offset="40%" stop-color="black" stop-opacity="0"/>
                <stop offset="65%" stop-color="black" stop-opacity="${(0.12 * scale).toFixed(3)}"/>
                <stop offset="80%" stop-color="black" stop-opacity="${(0.28 * scale).toFixed(3)}"/>
                <stop offset="95%" stop-color="black" stop-opacity="${(0.50 * scale).toFixed(3)}"/>
                <stop offset="100%" stop-color="black" stop-opacity="${(intensity * 0.85).toFixed(3)}"/>
              </radialGradient>
              <filter id="vigBlur"><feGaussianBlur stdDeviation="${Math.round(Math.max(vw, vh) * 0.015)}"/></filter>
            </defs>
            <rect width="${vw}" height="${vh}" fill="url(#vg3)" filter="url(#vigBlur)"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: vig3, left: 0, top: 0, blend: 'over' }])
          .toBuffer()
      }
      // Floating shadow: layered smooth shadows + elliptical contact shadow + top-edge highlight
      else if (style === 'shadow') {
        const borderPad = 5
        const margin = 52
        const imgWithBorder = await sharp(composited)
          .extend({ top: borderPad, bottom: borderPad, left: borderPad, right: borderPad, background: { r: fr, g: fg, b: fb, alpha: 1 } })
          .toBuffer()
        const meta2 = await sharp(imgWithBorder).metadata()
        const iw = meta2.width!
        const ih = meta2.height!
        const fullW = iw + 2 * margin
        const fullH = ih + 2 * margin

        // Top-edge highlight (light reflection on raised surface)
        const highlightSvg = Buffer.from(
          `<svg width="${iw}" height="${ih}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="${iw}" height="1" fill="white" opacity="0.30"/>
            <rect x="0" y="0" width="1" height="${ih}" fill="white" opacity="0.18"/>
            <rect x="0" y="${ih - 1}" width="${iw}" height="1" fill="black" opacity="0.04"/>
            <rect x="${iw - 1}" y="0" width="1" height="${ih}" fill="black" opacity="0.03"/>
          </svg>`
        )
        const withHighlight = await sharp(imgWithBorder)
          .composite([{ input: highlightSvg, left: 0, top: 0, blend: 'over' }])
          .toBuffer()

        // Background canvas
        const bg = await sharp({
          create: { width: fullW, height: fullH, channels: 4 as const, background: { r: 245, g: 247, b: 250, alpha: 255 } },
        }).png().toBuffer()

        // Layered shadows: 5 stacked layers with increasing blur for ultra-smooth transition
        const imgX = margin
        const imgY = margin
        const shadowLayers = [
          { offset: 2,  blur: 3,  opacity: 0.06 },
          { offset: 5,  blur: 8,  opacity: 0.08 },
          { offset: 10, blur: 18, opacity: 0.10 },
          { offset: 18, blur: 32, opacity: 0.12 },
          { offset: 28, blur: 52, opacity: 0.14 },
        ]

        // Build one combined shadow SVG with multiple rects
        const maxBlur = 52
        const shW = iw + maxBlur * 2 + 60
        const shH = ih + maxBlur * 2 + 80
        const shCX = maxBlur + 30  // center offset within shadow canvas
        const shCY = maxBlur + 30
        const shadowSvg = Buffer.from(
          `<svg width="${shW}" height="${shH}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              ${shadowLayers.map((l, i) => `<filter id="shB${i}"><feGaussianBlur stdDeviation="${l.blur}"/></filter>`).join('\n')}
              <filter id="contactBlur"><feGaussianBlur stdDeviation="14"/></filter>
            </defs>
            ${shadowLayers.map((l, i) => `<rect x="${shCX}" y="${shCY + l.offset}" width="${iw}" height="${ih}" rx="3" fill="black" opacity="${l.opacity}" filter="url(#shB${i})"/>`).join('\n')}
            <!-- Elliptical contact shadow: simulates object hovering above surface -->
            <ellipse cx="${shCX + iw / 2}" cy="${shCY + ih + 8}" rx="${iw * 0.38}" ry="10" fill="black" opacity="0.16" filter="url(#contactBlur)"/>
          </svg>`
        )

        // Composite everything: shadow canvas, then the image on top
        composited = await sharp(bg)
          .composite([
            { input: shadowSvg, left: imgX - shCX, top: imgY - shCY, blend: 'over' },
            { input: withHighlight, left: imgX, top: imgY, blend: 'over' },
          ])
          .toBuffer()
      }
      // Gold / Silver / Copper: realistic polished metallic frame with multi-stop gradients,
      // per-side directional lighting, specular highlights, inner bevel, and wall shadow
      else if (style === 'gold' || style === 'silver' || style === 'copper') {
        // Metallic palette: 5-stop gradients matching CSS border-image approach
        const metal = style === 'gold'
          ? {
              tint: { r: 191, g: 149, b: 63 }, tintOpacity: 0.15,
              stops: ['#bf953f', '#fcf6ba', '#b38728', '#fbf5b7', '#aa771d'],
              dark: '#aa771d', midDark: '#b38728', mid: '#bf953f', midLight: '#fcf6ba', light: '#fbf5b7',
              highlight: '#fcf6ba', edge: '#fbf5b7',
              // Per-side lighting: top/left lighter, bottom/right darker
              sTop: ['#fcf6ba', '#fbf5b7', '#bf953f'],
              sRight: ['#bf953f', '#b38728', '#aa771d'],
              sBottom: ['#b38728', '#aa771d', '#8a6318'],
              sLeft: ['#fbf5b7', '#bf953f', '#b38728'],
            }
          : style === 'silver'
          ? {
              tint: { r: 189, g: 195, b: 199 }, tintOpacity: 0.12,
              stops: ['#e6e9f0', '#bdc3c7', '#95a5a6', '#bdc3c7', '#eef1f5'],
              dark: '#6b7b8d', midDark: '#95a5a6', mid: '#bdc3c7', midLight: '#e6e9f0', light: '#eef1f5',
              highlight: '#f5f7fa', edge: '#eef1f5',
              sTop: ['#eef1f5', '#e6e9f0', '#bdc3c7'],
              sRight: ['#bdc3c7', '#95a5a6', '#6b7b8d'],
              sBottom: ['#95a5a6', '#6b7b8d', '#556270'],
              sLeft: ['#e6e9f0', '#bdc3c7', '#95a5a6'],
            }
          : {
              tint: { r: 160, g: 82, b: 45 }, tintOpacity: 0.15,
              stops: ['#804a00', '#edc9af', '#a0522d', '#d4a76a', '#5d3a1a'],
              dark: '#5d3a1a', midDark: '#804a00', mid: '#a0522d', midLight: '#d4a76a', light: '#edc9af',
              highlight: '#edc9af', edge: '#d4a76a',
              sTop: ['#edc9af', '#d4a76a', '#a0522d'],
              sRight: ['#a0522d', '#804a00', '#5d3a1a'],
              sBottom: ['#804a00', '#5d3a1a', '#3d2510'],
              sLeft: ['#d4a76a', '#a0522d', '#804a00'],
            }

        // Subtle metallic tint on the photo itself
        const tintSvg = Buffer.from(
          `<svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="rgb(${metal.tint.r},${metal.tint.g},${metal.tint.b})" opacity="${metal.tintOpacity}"/></svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: tintSvg, left: 0, top: 0, blend: 'over' }])
          .toBuffer()

        const frameWidth = 28
        const [dr, dg, db] = [parseInt(metal.dark.slice(1, 3), 16), parseInt(metal.dark.slice(3, 5), 16), parseInt(metal.dark.slice(5, 7), 16)]
        composited = await sharp(composited)
          .extend({ top: frameWidth, bottom: frameWidth, left: frameWidth, right: frameWidth, background: { r: dr, g: dg, b: db, alpha: 1 } })
          .toBuffer()
        const meta2 = await sharp(composited).metadata()
        const fw = meta2.width!
        const fh = meta2.height!
        const inner = frameWidth

        // Build per-side trapezoidal polygons for realistic 3D miter joints
        const tl = `0,0`, tr = `${fw},0`, br = `${fw},${fh}`, bl = `0,${fh}`
        const itl = `${inner},${inner}`, itr = `${fw - inner},${inner}`, ibr = `${fw - inner},${fh - inner}`, ibl = `${inner},${fh - inner}`
        const iw = fw - 2 * inner
        const ih = fh - 2 * inner

        const metalSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <!-- Per-side directional gradients (light from top-left) -->
              <linearGradient id="mTop" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="${metal.sTop[2]}"/><stop offset="40%" stop-color="${metal.sTop[1]}"/><stop offset="100%" stop-color="${metal.sTop[0]}"/></linearGradient>
              <linearGradient id="mRight" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${metal.sRight[0]}"/><stop offset="50%" stop-color="${metal.sRight[1]}"/><stop offset="100%" stop-color="${metal.sRight[2]}"/></linearGradient>
              <linearGradient id="mBottom" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${metal.sBottom[0]}"/><stop offset="50%" stop-color="${metal.sBottom[1]}"/><stop offset="100%" stop-color="${metal.sBottom[2]}"/></linearGradient>
              <linearGradient id="mLeft" x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stop-color="${metal.sLeft[2]}"/><stop offset="40%" stop-color="${metal.sLeft[1]}"/><stop offset="100%" stop-color="${metal.sLeft[0]}"/></linearGradient>
              <!-- Specular highlight sweep (diagonal shine) -->
              <linearGradient id="mShine" x1="0" y1="0" x2="0.6" y2="0.6">
                <stop offset="0%" stop-color="white" stop-opacity="0.50"/>
                <stop offset="15%" stop-color="white" stop-opacity="0.30"/>
                <stop offset="35%" stop-color="white" stop-opacity="0.08"/>
                <stop offset="55%" stop-color="white" stop-opacity="0"/>
                <stop offset="75%" stop-color="white" stop-opacity="0.05"/>
                <stop offset="100%" stop-color="white" stop-opacity="0"/>
              </linearGradient>
              <!-- Second specular band (bottom-right edge catch) -->
              <linearGradient id="mShine2" x1="1" y1="1" x2="0.5" y2="0.5">
                <stop offset="0%" stop-color="white" stop-opacity="0.15"/>
                <stop offset="20%" stop-color="white" stop-opacity="0.05"/>
                <stop offset="100%" stop-color="white" stop-opacity="0"/>
              </linearGradient>
              <!-- Clip path for frame donut -->
              <clipPath id="frameClip"><path fill-rule="evenodd" d="M0,0 h${fw} v${fh} h-${fw}Z M${inner},${inner} v${ih} h${iw} v-${ih}Z"/></clipPath>
            </defs>
            <!-- Miter-joint side panels -->
            <polygon points="${tl} ${tr} ${itr} ${itl}" fill="url(#mTop)"/>
            <polygon points="${tr} ${br} ${ibr} ${itr}" fill="url(#mRight)"/>
            <polygon points="${br} ${bl} ${ibl} ${ibr}" fill="url(#mBottom)"/>
            <polygon points="${bl} ${tl} ${itl} ${ibl}" fill="url(#mLeft)"/>
            <!-- Specular highlights over frame -->
            <g clip-path="url(#frameClip)">
              <rect width="${fw}" height="${fh}" fill="url(#mShine)"/>
              <rect width="${fw}" height="${fh}" fill="url(#mShine2)"/>
            </g>
            <!-- Corner miter lines (subtle darker diagonals) -->
            <line x1="0" y1="0" x2="${inner}" y2="${inner}" stroke="${metal.dark}" stroke-width="1" opacity="0.4"/>
            <line x1="${fw}" y1="0" x2="${fw - inner}" y2="${inner}" stroke="${metal.dark}" stroke-width="1" opacity="0.3"/>
            <line x1="${fw}" y1="${fh}" x2="${fw - inner}" y2="${fh - inner}" stroke="${metal.dark}" stroke-width="1" opacity="0.5"/>
            <line x1="0" y1="${fh}" x2="${inner}" y2="${fh - inner}" stroke="${metal.dark}" stroke-width="1" opacity="0.3"/>
            <!-- Inner bevel: shadow cast by frame lip onto the photo -->
            <rect x="${inner}" y="${inner}" width="${iw}" height="3" fill="black" opacity="0.25"/>
            <rect x="${inner}" y="${inner}" width="3" height="${ih}" fill="black" opacity="0.20"/>
            <rect x="${inner}" y="${fh - inner - 2}" width="${iw}" height="2" fill="white" opacity="0.08"/>
            <rect x="${fw - inner - 2}" y="${inner}" width="2" height="${ih}" fill="white" opacity="0.06"/>
            <!-- Thin inner edge line -->
            <rect x="${inner}" y="${inner}" width="${iw}" height="${ih}" fill="none" stroke="${metal.edge}" stroke-width="1" opacity="0.5"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: metalSvg, left: 0, top: 0 }])
          .toBuffer()

        // Wall shadow: composite a blurred shadow below the frame
        const shadowPad = 12
        const shadowCanvas = Buffer.from(
          `<svg width="${fw + 2 * shadowPad}" height="${fh + 2 * shadowPad}" xmlns="http://www.w3.org/2000/svg">
            <defs><filter id="mShadow"><feGaussianBlur stdDeviation="6"/></filter></defs>
            <rect x="${shadowPad}" y="${shadowPad + 4}" width="${fw}" height="${fh}" rx="2" fill="black" opacity="0.35" filter="url(#mShadow)"/>
          </svg>`
        )
        const shadowBg = await sharp({
          create: { width: fw + 2 * shadowPad, height: fh + 2 * shadowPad, channels: 4 as const, background: { r: 245, g: 247, b: 250, alpha: 255 } },
        }).png().toBuffer()
        composited = await sharp(shadowBg)
          .composite([
            { input: shadowCanvas, left: 0, top: 0, blend: 'over' },
            { input: composited, left: shadowPad, top: shadowPad, blend: 'over' },
          ])
          .toBuffer()
      }
      // Neon: realistic neon sign effect — white-hot core, layered bloom, color spill, ambient reflections
      else if (style === 'neon') {
        const neonColor = frameOpt.color
        const [ncR, ncG, ncB] = [
          parseInt(neonColor.slice(1, 3), 16),
          parseInt(neonColor.slice(3, 5), 16),
          parseInt(neonColor.slice(5, 7), 16),
        ]

        // 1. Image darkening so the neon glow pops against the content
        const darkenSvg = Buffer.from(
          `<svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="black" opacity="0.08"/></svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: darkenSvg, blend: 'over' }])
          .toBuffer()

        // 2. Color spill — neon light bleeding onto the image edges (4 directional gradients, strong)
        const spillSvg = Buffer.from(
          `<svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="spL" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0.30"/><stop offset="20%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0"/></linearGradient>
              <linearGradient id="spR" x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0.30"/><stop offset="20%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0"/></linearGradient>
              <linearGradient id="spT" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0.30"/><stop offset="20%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0"/></linearGradient>
              <linearGradient id="spB" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0.30"/><stop offset="20%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0"/></linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#spL)"/>
            <rect width="100%" height="100%" fill="url(#spR)"/>
            <rect width="100%" height="100%" fill="url(#spT)"/>
            <rect width="100%" height="100%" fill="url(#spB)"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: spillSvg, blend: 'screen' }])
          .toBuffer()

        // 2b. Inner glow — concentrated neon light on image edges via radial vignette-style overlay
        const innerGlowSvg = Buffer.from(
          `<svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="iGlow" cx="0.5" cy="0.5" r="0.55">
                <stop offset="55%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0"/>
                <stop offset="85%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0.15"/>
                <stop offset="100%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0.30"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#iGlow)"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: innerGlowSvg, blend: 'screen' }])
          .toBuffer()

        // 3. Extend with dark background (slightly warm-dark for atmosphere)
        const neonPad = 32
        composited = await sharp(composited)
          .extend({ top: neonPad, bottom: neonPad, left: neonPad, right: neonPad, background: { r: 8, g: 8, b: 12, alpha: 1 } })
          .toBuffer()
        const nMeta = await sharp(composited).metadata()
        const nfw = nMeta.width!
        const nfh = nMeta.height!

        // 4. Ambient glow — large soft radial reflecting off the dark "wall" behind the sign
        const ambientSvg = Buffer.from(
          `<svg width="${nfw}" height="${nfh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="ambG" cx="0.5" cy="0.5" r="0.55">
                <stop offset="60%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0.07"/>
                <stop offset="100%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#ambG)"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: ambientSvg, blend: 'screen' }])
          .toBuffer()

        // 5. Multi-layered neon glow border — 6 bloom layers + white-hot core (rounded corners)
        const tubePos = 18
        const rx = 14
        const coreStroke = 2.5
        const neonGlowSvg = Buffer.from(
          `<svg width="${nfw}" height="${nfh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="nb1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="44"/></filter>
              <filter id="nb2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="28"/></filter>
              <filter id="nb3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
              <filter id="nb4" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>
              <filter id="nb5" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
              <filter id="nb6" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.5"/></filter>
            </defs>
            <!-- Layer 1: widest bloom — very faint, huge radius -->
            <rect x="${tubePos}" y="${tubePos}" width="${nfw - 2 * tubePos}" height="${nfh - 2 * tubePos}" rx="${rx}" fill="none" stroke="${neonColor}" stroke-width="52" opacity="0.28" filter="url(#nb1)"/>
            <!-- Layer 2: wide bloom -->
            <rect x="${tubePos}" y="${tubePos}" width="${nfw - 2 * tubePos}" height="${nfh - 2 * tubePos}" rx="${rx}" fill="none" stroke="${neonColor}" stroke-width="36" opacity="0.40" filter="url(#nb2)"/>
            <!-- Layer 3: medium glow -->
            <rect x="${tubePos}" y="${tubePos}" width="${nfw - 2 * tubePos}" height="${nfh - 2 * tubePos}" rx="${rx}" fill="none" stroke="${neonColor}" stroke-width="22" opacity="0.55" filter="url(#nb3)"/>
            <!-- Layer 4: inner glow -->
            <rect x="${tubePos}" y="${tubePos}" width="${nfw - 2 * tubePos}" height="${nfh - 2 * tubePos}" rx="${rx}" fill="none" stroke="${neonColor}" stroke-width="14" opacity="0.70" filter="url(#nb4)"/>
            <!-- Layer 5: tight glow -->
            <rect x="${tubePos}" y="${tubePos}" width="${nfw - 2 * tubePos}" height="${nfh - 2 * tubePos}" rx="${rx}" fill="none" stroke="${neonColor}" stroke-width="7" opacity="0.85" filter="url(#nb5)"/>
            <!-- Layer 6: sharp color edge -->
            <rect x="${tubePos}" y="${tubePos}" width="${nfw - 2 * tubePos}" height="${nfh - 2 * tubePos}" rx="${rx}" fill="none" stroke="${neonColor}" stroke-width="4" opacity="0.95" filter="url(#nb6)"/>
            <!-- White-hot core: nearly white center simulating gas-filled tube intensity -->
            <rect x="${tubePos}" y="${tubePos}" width="${nfw - 2 * tubePos}" height="${nfh - 2 * tubePos}" rx="${rx}" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="${coreStroke + 1}"/>
            <!-- Color core on top of white -->
            <rect x="${tubePos}" y="${tubePos}" width="${nfw - 2 * tubePos}" height="${nfh - 2 * tubePos}" rx="${rx}" fill="none" stroke="${neonColor}" stroke-width="${coreStroke}" opacity="0.92"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: neonGlowSvg, left: 0, top: 0 }])
          .toBuffer()

        // 6. Corner bloom reflections — light bouncing off dark "wall" at corners
        const cornerSvg = Buffer.from(
          `<svg width="${nfw}" height="${nfh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="cTL" cx="0" cy="0" r="0.35"><stop offset="0%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0.12"/><stop offset="100%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0"/></radialGradient>
              <radialGradient id="cTR" cx="1" cy="0" r="0.35"><stop offset="0%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0.10"/><stop offset="100%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0"/></radialGradient>
              <radialGradient id="cBL" cx="0" cy="1" r="0.35"><stop offset="0%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0.10"/><stop offset="100%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0"/></radialGradient>
              <radialGradient id="cBR" cx="1" cy="1" r="0.35"><stop offset="0%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0.12"/><stop offset="100%" stop-color="rgb(${ncR},${ncG},${ncB})" stop-opacity="0"/></radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#cTL)"/>
            <rect width="100%" height="100%" fill="url(#cTR)"/>
            <rect width="100%" height="100%" fill="url(#cBL)"/>
            <rect width="100%" height="100%" fill="url(#cBR)"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: cornerSvg, blend: 'screen' }])
          .toBuffer()
      }
      // Film strip: perforations (sprocket holes) along top and bottom only, solid black border, like reference
      else if (style === 'filmstrip') {
        composited = await sharp(composited)
          .modulate({ saturation: 0.88 })
          .toBuffer()
        const stripH = 24
        const sidePad = 16
        const holeCount = 11
        const holeW = 4
        const holeH = 12
        const holeGap = 2
        const period = holeW + holeGap
        const holesTotalW = holeCount * holeW + (holeCount - 1) * holeGap
        composited = await sharp(composited)
          .extend({ top: stripH, bottom: stripH, left: sidePad, right: sidePad, background: { r: 0, g: 0, b: 0, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const holeY = (stripH - holeH) / 2
        const startX = (fw - holesTotalW) / 2
        const holePath = (ox: number, oy: number) =>
          `M ${ox} ${oy} L ${ox + holeW} ${oy} L ${ox + holeW} ${oy + holeH} L ${ox} ${oy + holeH} Z`
        const topHoles = Array.from({ length: holeCount }, (_, i) => holePath(startX + i * period, holeY)).join(' ')
        const bottomHoles = Array.from({ length: holeCount }, (_, i) => holePath(startX + i * period, fh - stripH + holeY)).join(' ')
        const topStripPath = `M 0 0 L ${fw} 0 L ${fw} ${stripH} L 0 ${stripH} Z ${topHoles}`
        const bottomStripPath = `M 0 ${fh - stripH} L ${fw} ${fh - stripH} L ${fw} ${fh} L 0 ${fh} Z ${bottomHoles}`
        const filmSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" fill="#000" d="${topStripPath}"/>
            <path fill-rule="evenodd" fill="#000" d="${bottomStripPath}"/>
            <rect x="0" y="${stripH}" width="${sidePad}" height="${fh - 2 * stripH}" fill="#000"/>
            <rect x="${fw - sidePad}" y="${stripH}" width="${sidePad}" height="${fh - 2 * stripH}" fill="#000"/>
            <!-- no inner stroke to avoid double-border effect -->
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: filmSvg, left: 0, top: 0 }])
          .toBuffer()

        // ── Atmospheric & Texture Overlays (Vintage Look) ──
        const filmMeta = await sharp(composited).metadata()
        const filmW = filmMeta.width!
        const filmH = filmMeta.height!

        // 1. Film grain & noise — organic texture, stronger alpha for visible effect
        const grainPixels = filmW * filmH
        const grainData = Buffer.alloc(grainPixels * 4)
        for (let i = 0; i < grainPixels; i++) {
          const v = Math.floor(Math.random() * 256)
          const j = i * 4
          grainData[j] = v
          grainData[j + 1] = v
          grainData[j + 2] = v
          grainData[j + 3] = 85 // increased from 45 for more visible grain
        }
        const grainBuffer = await sharp(grainData, { raw: { width: filmW, height: filmH, channels: 4 } })
          .png()
          .toBuffer()
        composited = await sharp(composited)
          .composite([{ input: grainBuffer, blend: 'overlay' }])
          .toBuffer()

        // 2. Dust and scratches — thicker, more visible marks
        const dustSvg = Buffer.from(
          `<svg width="${filmW}" height="${filmH}" xmlns="http://www.w3.org/2000/svg">
            <line x1="${filmW * 0.15}" y1="0" x2="${filmW * 0.14}" y2="${filmH}" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
            <line x1="${filmW * 0.42}" y1="${filmH * 0.05}" x2="${filmW * 0.43}" y2="${filmH * 0.85}" stroke="rgba(255,255,255,0.28)" stroke-width="1.2"/>
            <line x1="${filmW * 0.67}" y1="${filmH * 0.1}" x2="${filmW * 0.66}" y2="${filmH * 0.95}" stroke="rgba(255,255,255,0.30)" stroke-width="1.0"/>
            <line x1="${filmW * 0.88}" y1="0" x2="${filmW * 0.89}" y2="${filmH * 0.7}" stroke="rgba(255,255,255,0.22)" stroke-width="0.8"/>
            <line x1="${filmW * 0.30}" y1="${filmH * 0.03}" x2="${filmW * 0.31}" y2="${filmH * 0.60}" stroke="rgba(255,255,255,0.20)" stroke-width="0.8"/>
            <line x1="${filmW * 0.55}" y1="${filmH * 0.08}" x2="${filmW * 0.54}" y2="${filmH * 0.92}" stroke="rgba(255,255,255,0.18)" stroke-width="0.7"/>
            <line x1="${filmW * 0.78}" y1="${filmH * 0.12}" x2="${filmW * 0.79}" y2="${filmH * 0.75}" stroke="rgba(255,255,255,0.16)" stroke-width="0.7"/>
            <circle cx="${filmW * 0.25}" cy="${filmH * 0.3}" r="4" fill="rgba(255,255,255,0.25)"/>
            <circle cx="${filmW * 0.55}" cy="${filmH * 0.15}" r="3" fill="rgba(255,255,255,0.22)"/>
            <circle cx="${filmW * 0.80}" cy="${filmH * 0.6}" r="5" fill="rgba(255,255,255,0.20)"/>
            <circle cx="${filmW * 0.35}" cy="${filmH * 0.75}" r="2.5" fill="rgba(255,255,255,0.25)"/>
            <circle cx="${filmW * 0.70}" cy="${filmH * 0.45}" r="3.5" fill="rgba(255,255,255,0.20)"/>
            <circle cx="${filmW * 0.10}" cy="${filmH * 0.85}" r="4" fill="rgba(255,255,255,0.18)"/>
            <circle cx="${filmW * 0.48}" cy="${filmH * 0.52}" r="2" fill="rgba(255,255,255,0.20)"/>
            <circle cx="${filmW * 0.92}" cy="${filmH * 0.2}" r="3" fill="rgba(255,255,255,0.15)"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: dustSvg, blend: 'screen' }])
          .toBuffer()

        // 3. Light leaks — stronger red/orange/white streaks
        const leakSvg = Buffer.from(
          `<svg width="${filmW}" height="${filmH}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="leak1" x1="0" y1="0.3" x2="0.42" y2="0.5">
                <stop offset="0%" stop-color="rgb(255,120,50)" stop-opacity="0.38"/>
                <stop offset="45%" stop-color="rgb(255,180,80)" stop-opacity="0.15"/>
                <stop offset="100%" stop-color="rgb(255,200,100)" stop-opacity="0"/>
              </linearGradient>
              <linearGradient id="leak2" x1="1" y1="0" x2="0.64" y2="0.36">
                <stop offset="0%" stop-color="rgb(255,60,60)" stop-opacity="0.28"/>
                <stop offset="35%" stop-color="rgb(255,140,60)" stop-opacity="0.10"/>
                <stop offset="100%" stop-color="rgb(255,200,100)" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#leak1)"/>
            <rect width="100%" height="100%" fill="url(#leak2)"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: leakSvg, blend: 'screen' }])
          .toBuffer()

        // 4. Film burns — stronger orange hot-spots at edges
        const burnSvg = Buffer.from(
          `<svg width="${filmW}" height="${filmH}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="burn1" cx="0.03" cy="0.5" r="0.38" fx="0.03" fy="0.5">
                <stop offset="0%" stop-color="rgb(255,140,40)" stop-opacity="0.42"/>
                <stop offset="50%" stop-color="rgb(255,100,20)" stop-opacity="0.14"/>
                <stop offset="100%" stop-color="rgb(255,100,20)" stop-opacity="0"/>
              </radialGradient>
              <radialGradient id="burn2" cx="0.97" cy="0.22" r="0.25" fx="0.97" fy="0.22">
                <stop offset="0%" stop-color="rgb(255,180,80)" stop-opacity="0.28"/>
                <stop offset="100%" stop-color="rgb(255,180,80)" stop-opacity="0"/>
              </radialGradient>
              <radialGradient id="burn3" cx="0.5" cy="0.98" r="0.28" fx="0.5" fy="0.98">
                <stop offset="0%" stop-color="rgb(255,120,40)" stop-opacity="0.20"/>
                <stop offset="100%" stop-color="rgb(255,120,40)" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#burn1)"/>
            <rect width="100%" height="100%" fill="url(#burn2)"/>
            <rect width="100%" height="100%" fill="url(#burn3)"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: burnSvg, blend: 'screen' }])
          .toBuffer()

        // 5. Warm vintage color cast — stronger sepia tint
        const warmCastSvg = Buffer.from(
          `<svg width="${filmW}" height="${filmH}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="rgb(160,120,60)" opacity="0.12"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: warmCastSvg, blend: 'multiply' }])
          .toBuffer()
      }
      // Polaroid: authentic instant-photo look — sepia filter, vignette, grain, asymmetric white border, slight rotation shadow
      else if (style === 'polaroid') {
        // 1. Apply sepia/warm tone + slight contrast boost to the image
        composited = await sharp(composited)
          .modulate({ saturation: 0.88, brightness: 1.04 })
          .tint({ r: 240, g: 228, b: 210 })
          .toBuffer()
        // Re-boost after tint to avoid too-washed look
        composited = await sharp(composited)
          .modulate({ saturation: 0.95 })
          .toBuffer()

        // 2. Warm vignette overlay
        const vignetteSvg = Buffer.from(
          `<svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="polVig" cx="0.5" cy="0.48" r="0.58">
                <stop offset="50%" stop-color="black" stop-opacity="0"/>
                <stop offset="80%" stop-color="black" stop-opacity="0.15"/>
                <stop offset="100%" stop-color="black" stop-opacity="0.35"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#polVig)"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: vignetteSvg, blend: 'over' }])
          .toBuffer()

        // 3. Film grain via noise overlay
        const grainSvg = Buffer.from(
          `<svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
            <filter id="polGrain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/></filter>
            <rect width="100%" height="100%" filter="url(#polGrain)" opacity="0.05"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: grainSvg, blend: 'over' }])
          .toBuffer()

        // 4. Polaroid border: 14px sides + top, 48px bottom (for caption area)
        const polSide = 14
        const polTop = 14
        const polBottom = 48
        composited = await sharp(composited)
          .extend({ top: polTop, bottom: polBottom, left: polSide, right: polSide, background: { r: 254, g: 254, b: 254, alpha: 1 } })
          .toBuffer()
        const polMeta = await sharp(composited).metadata()
        const polW = polMeta.width!
        const polH = polMeta.height!

        // 5. Subtle paper texture + inner shadow on the photo area
        const polFrameSvg = Buffer.from(
          `<svg width="${polW}" height="${polH}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="polPaper"><feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise"/><feColorMatrix type="saturate" values="0" in="noise"/></filter>
            </defs>
            <!-- Very subtle paper texture on the white border -->
            <rect width="${polW}" height="${polH}" filter="url(#polPaper)" opacity="0.02"/>
            <!-- Inner shadow: photo recessed into paper -->
            <rect x="${polSide}" y="${polTop}" width="${polW - 2 * polSide}" height="${polH - polTop - polBottom}" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>
            <rect x="${polSide + 1}" y="${polTop + 1}" width="${polW - 2 * polSide - 2}" height="2" fill="rgba(0,0,0,0.06)"/>
            <rect x="${polSide + 1}" y="${polTop + 1}" width="2" height="${polH - polTop - polBottom - 2}" fill="rgba(0,0,0,0.05)"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: polFrameSvg, left: 0, top: 0, blend: 'over' }])
          .toBuffer()

        // 6. Drop shadow to simulate the polaroid sitting on a surface
        const shPad = 16
        const shadowBg = await sharp({
          create: { width: polW + 2 * shPad, height: polH + 2 * shPad, channels: 4 as const, background: { r: 245, g: 247, b: 250, alpha: 255 } },
        }).png().toBuffer()
        const dropShadowSvg = Buffer.from(
          `<svg width="${polW + 2 * shPad}" height="${polH + 2 * shPad}" xmlns="http://www.w3.org/2000/svg">
            <defs><filter id="polSh"><feGaussianBlur stdDeviation="5"/></filter></defs>
            <rect x="${shPad + 2}" y="${shPad + 4}" width="${polW}" height="${polH}" rx="1" fill="black" opacity="0.20" filter="url(#polSh)"/>
          </svg>`
        )
        composited = await sharp(shadowBg)
          .composite([
            { input: dropShadowSvg, left: 0, top: 0, blend: 'over' },
            { input: composited, left: shPad, top: shPad, blend: 'over' },
          ])
          .toBuffer()
      }
      // Classic painting frame: ornate gold with white mat, glass overlay, wall shadow
      else if (style === 'classic') {
        const g = {
          dark: '#5c4a1a', midDark: '#7d6510', mid: '#a67c32', midLight: '#c9a227',
          light: '#e8c547', highlight: '#f5e6a8', rabbet: '#3d3208',
          // Per-side lighting
          sTop: ['#f5e6a8', '#e8c547', '#a67c32'],
          sRight: ['#c9a227', '#8b6914', '#5c4a1a'],
          sBottom: ['#7d6510', '#5c4a1a', '#3d2b1f'],
          sLeft: ['#e8c547', '#a67c32', '#7d6510'],
        }
        const ornateW = 20 // ornate frame band width
        const matW = 12    // white mat width
        const totalFrame = ornateW + matW

        // 1. Add white mat around the photo
        composited = await sharp(composited)
          .extend({ top: matW, bottom: matW, left: matW, right: matW, background: { r: 250, g: 248, b: 242, alpha: 1 } })
          .toBuffer()

        // 2. Mat inner shadow (photo recessed into mat)
        const matMeta = await sharp(composited).metadata()
        const matW2 = matMeta.width!
        const matH2 = matMeta.height!
        const matShadowSvg = Buffer.from(
          `<svg width="${matW2}" height="${matH2}" xmlns="http://www.w3.org/2000/svg">
            <rect x="${matW}" y="${matW}" width="${matW2 - 2 * matW}" height="3" fill="black" opacity="0.12"/>
            <rect x="${matW}" y="${matW}" width="3" height="${matH2 - 2 * matW}" fill="black" opacity="0.10"/>
            <rect x="${matW}" y="${matH2 - matW - 1}" width="${matW2 - 2 * matW}" height="1" fill="white" opacity="0.05"/>
            <rect x="${matW2 - matW - 1}" y="${matW}" width="1" height="${matH2 - 2 * matW}" fill="white" opacity="0.04"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: matShadowSvg, left: 0, top: 0, blend: 'over' }])
          .toBuffer()

        // 3. Glass reflection overlay on the photo (before adding the ornate frame)
        const glassSvg = Buffer.from(
          `<svg width="${matW2}" height="${matH2}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="glassShine" x1="0" y1="0" x2="0.7" y2="0.7">
                <stop offset="0%" stop-color="white" stop-opacity="0.12"/>
                <stop offset="35%" stop-color="white" stop-opacity="0.04"/>
                <stop offset="50%" stop-color="white" stop-opacity="0"/>
                <stop offset="70%" stop-color="white" stop-opacity="0.02"/>
                <stop offset="100%" stop-color="white" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <rect width="${matW2}" height="${matH2}" fill="url(#glassShine)"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: glassSvg, left: 0, top: 0, blend: 'screen' }])
          .toBuffer()

        // 4. Add ornate frame border
        composited = await sharp(composited)
          .extend({ top: ornateW, bottom: ornateW, left: ornateW, right: ornateW, background: { r: 92, g: 74, b: 26, alpha: 1 } })
          .toBuffer()
        const fMeta = await sharp(composited).metadata()
        const fw = fMeta.width!
        const fh = fMeta.height!

        // Trapezoidal miter-joint panels with per-side directional gradients
        const tl = '0,0', tr = `${fw},0`, br = `${fw},${fh}`, bl = `0,${fh}`
        const itl = `${ornateW},${ornateW}`, itr = `${fw - ornateW},${ornateW}`
        const ibr = `${fw - ornateW},${fh - ornateW}`, ibl = `${ornateW},${fh - ornateW}`
        const iiw = fw - 2 * ornateW, iih = fh - 2 * ornateW

        const frameSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cTop" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="${g.sTop[2]}"/><stop offset="40%" stop-color="${g.sTop[1]}"/><stop offset="100%" stop-color="${g.sTop[0]}"/></linearGradient>
              <linearGradient id="cRight" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${g.sRight[0]}"/><stop offset="50%" stop-color="${g.sRight[1]}"/><stop offset="100%" stop-color="${g.sRight[2]}"/></linearGradient>
              <linearGradient id="cBottom" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${g.sBottom[0]}"/><stop offset="50%" stop-color="${g.sBottom[1]}"/><stop offset="100%" stop-color="${g.sBottom[2]}"/></linearGradient>
              <linearGradient id="cLeft" x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stop-color="${g.sLeft[2]}"/><stop offset="40%" stop-color="${g.sLeft[1]}"/><stop offset="100%" stop-color="${g.sLeft[0]}"/></linearGradient>
              <linearGradient id="cShine" x1="0" y1="0" x2="0.6" y2="0.6">
                <stop offset="0%" stop-color="white" stop-opacity="0.40"/>
                <stop offset="20%" stop-color="white" stop-opacity="0.15"/>
                <stop offset="40%" stop-color="white" stop-opacity="0"/>
                <stop offset="100%" stop-color="white" stop-opacity="0"/>
              </linearGradient>
              <clipPath id="cFrameClip"><path fill-rule="evenodd" d="M0,0 h${fw} v${fh} h-${fw}Z M${ornateW},${ornateW} v${iih} h${iiw} v-${iih}Z"/></clipPath>
            </defs>
            <!-- Miter-joint side panels -->
            <polygon points="${tl} ${tr} ${itr} ${itl}" fill="url(#cTop)"/>
            <polygon points="${tr} ${br} ${ibr} ${itr}" fill="url(#cRight)"/>
            <polygon points="${br} ${bl} ${ibl} ${ibr}" fill="url(#cBottom)"/>
            <polygon points="${bl} ${tl} ${itl} ${ibl}" fill="url(#cLeft)"/>
            <!-- Specular highlight sweep -->
            <g clip-path="url(#cFrameClip)">
              <rect width="${fw}" height="${fh}" fill="url(#cShine)"/>
            </g>
            <!-- Outer dark edge -->
            <rect x="0" y="0" width="${fw}" height="${fh}" fill="none" stroke="${g.dark}" stroke-width="2"/>
            <!-- Inner ornate edge (thin gold highlight where frame meets mat) -->
            <rect x="${ornateW - 1}" y="${ornateW - 1}" width="${iiw + 2}" height="${iih + 2}" fill="none" stroke="${g.highlight}" stroke-width="1" opacity="0.6"/>
            <!-- Corner miter diagonals -->
            <line x1="0" y1="0" x2="${ornateW}" y2="${ornateW}" stroke="${g.dark}" stroke-width="1" opacity="0.5"/>
            <line x1="${fw}" y1="0" x2="${fw - ornateW}" y2="${ornateW}" stroke="${g.dark}" stroke-width="1" opacity="0.4"/>
            <line x1="${fw}" y1="${fh}" x2="${fw - ornateW}" y2="${fh - ornateW}" stroke="${g.dark}" stroke-width="1" opacity="0.6"/>
            <line x1="0" y1="${fh}" x2="${ornateW}" y2="${fh - ornateW}" stroke="${g.dark}" stroke-width="1" opacity="0.4"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: frameSvg, left: 0, top: 0 }])
          .toBuffer()

        // 5. Wall shadow: frame floating off the surface
        const shPad = 14
        const shadowBg = await sharp({
          create: { width: fw + 2 * shPad, height: fh + 2 * shPad, channels: 4 as const, background: { r: 245, g: 247, b: 250, alpha: 255 } },
        }).png().toBuffer()
        const dropShadowSvg = Buffer.from(
          `<svg width="${fw + 2 * shPad}" height="${fh + 2 * shPad}" xmlns="http://www.w3.org/2000/svg">
            <defs><filter id="cSh"><feGaussianBlur stdDeviation="7"/></filter></defs>
            <rect x="${shPad + 2}" y="${shPad + 5}" width="${fw}" height="${fh}" rx="1" fill="black" opacity="0.30" filter="url(#cSh)"/>
          </svg>`
        )
        composited = await sharp(shadowBg)
          .composite([
            { input: dropShadowSvg, left: 0, top: 0, blend: 'over' },
            { input: composited, left: shPad, top: shPad, blend: 'over' },
          ])
          .toBuffer()
      }
      // Wooden frame: realistic grain texture, miter joints, inner bevel, wall shadow
      else if (style === 'wooden') {
        const frameWidth = 28
        const margin = 14 // extra space around frame for wall shadow
        // Wood palette: Dark Oak, Warm Walnut, Light Pine
        const wood = {
          darkOak: '#3d2b1f',
          walnut: '#63412e',
          pine: '#d2b48c',
          mid: '#7d5a3a',
          midLight: '#a67c52',
          highlight: '#c9a06c',
          rabbet: '#2a1a0f',
        }

        // 1. Add wall-shadow background behind the frame
        const borderPad = 2
        const imgWithBorder = await sharp(composited)
          .extend({ top: borderPad, bottom: borderPad, left: borderPad, right: borderPad, background: { r: 42, g: 27, b: 15, alpha: 1 } })
          .toBuffer()
        const bMeta = await sharp(imgWithBorder).metadata()
        const iw = bMeta.width!
        const ih = bMeta.height!
        const fullW = iw + 2 * frameWidth + 2 * margin
        const fullH = ih + 2 * frameWidth + 2 * margin

        // Wall shadow SVG (soft diffuse shadow beneath the frame)
        const shadowSvg = Buffer.from(
          `<svg width="${iw + 80}" height="${ih + 80}" xmlns="http://www.w3.org/2000/svg">
            <defs><filter id="ws"><feGaussianBlur in="SourceGraphic" stdDeviation="28"/></filter></defs>
            <rect x="40" y="40" width="${iw}" height="${ih}" rx="2" ry="2" fill="black" opacity="0.65" filter="url(#ws)"/>
          </svg>`
        )

        // Off-white wall background
        const bg = await sharp({
          create: { width: fullW, height: fullH, channels: 3, background: { r: 245, g: 243, b: 238 } },
        }).jpeg().toBuffer()

        // Composite: wall bg + shadow + image
        composited = await sharp(bg)
          .composite([
            { input: shadowSvg, left: margin + frameWidth - 8, top: margin + frameWidth + 10 },
            { input: imgWithBorder, left: margin + frameWidth, top: margin + frameWidth },
          ])
          .toBuffer()

        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const ox = margin // frame outer x
        const oy = margin // frame outer y
        const outerW = iw + 2 * frameWidth + 2 * borderPad
        const outerH = ih + 2 * frameWidth + 2 * borderPad
        const ix = ox + frameWidth // inner opening x
        const iy = oy + frameWidth // inner opening y
        const innerW = iw + 2 * borderPad
        const innerH = ih + 2 * borderPad

        // Build SVG grain lines (procedural thin stripes)
        const grainLines: string[] = []
        const grainSpacing = 5
        for (let g = 0; g < outerW + outerH; g += grainSpacing) {
          const opacity = 0.04 + Math.random() * 0.06
          const sw = 0.8 + Math.random() * 0.8
          grainLines.push(
            `<line x1="${ox + g}" y1="${oy}" x2="${ox}" y2="${oy + g}" stroke="rgba(0,0,0,${opacity.toFixed(2)})" stroke-width="${sw.toFixed(1)}"/>`
          )
        }

        const woodenSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <!-- Per-side gradients: top/left lighter (light source), bottom/right darker -->
              <linearGradient id="wTop" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stop-color="${wood.mid}"/>
                <stop offset="40%" stop-color="${wood.midLight}"/>
                <stop offset="100%" stop-color="${wood.highlight}"/>
              </linearGradient>
              <linearGradient id="wLeft" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stop-color="${wood.mid}"/>
                <stop offset="40%" stop-color="${wood.midLight}"/>
                <stop offset="100%" stop-color="${wood.pine}"/>
              </linearGradient>
              <linearGradient id="wBottom" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${wood.walnut}"/>
                <stop offset="60%" stop-color="${wood.darkOak}"/>
                <stop offset="100%" stop-color="${wood.rabbet}"/>
              </linearGradient>
              <linearGradient id="wRight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="${wood.walnut}"/>
                <stop offset="60%" stop-color="${wood.darkOak}"/>
                <stop offset="100%" stop-color="${wood.rabbet}"/>
              </linearGradient>
              <!-- Clip to the frame ring only (outer minus inner) -->
              <clipPath id="frameClip">
                <path fill-rule="evenodd" d="M ${ox} ${oy} h ${outerW} v ${outerH} h -${outerW} Z M ${ix} ${iy} v ${innerH} h ${innerW} v -${innerH} Z"/>
              </clipPath>
            </defs>

            <!-- TOP side (trapezoid: miter at 45 deg corners) -->
            <polygon points="${ox},${oy} ${ox + outerW},${oy} ${ix + innerW},${iy} ${ix},${iy}" fill="url(#wTop)"/>
            <!-- LEFT side -->
            <polygon points="${ox},${oy} ${ix},${iy} ${ix},${iy + innerH} ${ox},${oy + outerH}" fill="url(#wLeft)"/>
            <!-- BOTTOM side -->
            <polygon points="${ox},${oy + outerH} ${ix},${iy + innerH} ${ix + innerW},${iy + innerH} ${ox + outerW},${oy + outerH}" fill="url(#wBottom)"/>
            <!-- RIGHT side -->
            <polygon points="${ox + outerW},${oy} ${ox + outerW},${oy + outerH} ${ix + innerW},${iy + innerH} ${ix + innerW},${iy}" fill="url(#wRight)"/>

            <!-- Grain texture lines (clipped to frame area) -->
            <g clip-path="url(#frameClip)" opacity="0.9">
              ${grainLines.join('\n              ')}
            </g>

            <!-- Miter joint corner lines (45-degree diagonal seams) -->
            <line x1="${ox}" y1="${oy}" x2="${ix}" y2="${iy}" stroke="${wood.darkOak}" stroke-width="1.5" opacity="0.5"/>
            <line x1="${ox + outerW}" y1="${oy}" x2="${ix + innerW}" y2="${iy}" stroke="${wood.darkOak}" stroke-width="1.5" opacity="0.5"/>
            <line x1="${ox}" y1="${oy + outerH}" x2="${ix}" y2="${iy + innerH}" stroke="${wood.darkOak}" stroke-width="1.5" opacity="0.5"/>
            <line x1="${ox + outerW}" y1="${oy + outerH}" x2="${ix + innerW}" y2="${iy + innerH}" stroke="${wood.darkOak}" stroke-width="1.5" opacity="0.5"/>

            <!-- Outer edge highlight (top-left catch light) -->
            <line x1="${ox}" y1="${oy}" x2="${ox + outerW}" y2="${oy}" stroke="rgba(255,235,215,0.3)" stroke-width="1"/>
            <line x1="${ox}" y1="${oy}" x2="${ox}" y2="${oy + outerH}" stroke="rgba(255,235,215,0.2)" stroke-width="1"/>
            <!-- Outer edge shadow (bottom-right) -->
            <line x1="${ox}" y1="${oy + outerH}" x2="${ox + outerW}" y2="${oy + outerH}" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>
            <line x1="${ox + outerW}" y1="${oy}" x2="${ox + outerW}" y2="${oy + outerH}" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>

            <!-- Inner bevel: shadow cast by the wood lip onto the photo -->
            <rect x="${ix}" y="${iy}" width="${innerW}" height="3" fill="rgba(0,0,0,0.35)"/>
            <rect x="${ix}" y="${iy}" width="3" height="${innerH}" fill="rgba(0,0,0,0.25)"/>
            <rect x="${ix}" y="${iy + innerH - 1}" width="${innerW}" height="1" fill="rgba(255,235,215,0.15)"/>
            <rect x="${ix + innerW - 1}" y="${iy}" width="1" height="${innerH}" fill="rgba(255,235,215,0.10)"/>

            <!-- Rabbet (tiny dark inset lip) -->
            <rect x="${ix - 1}" y="${iy - 1}" width="${innerW + 2}" height="1" fill="${wood.rabbet}"/>
            <rect x="${ix - 1}" y="${iy - 1}" width="1" height="${innerH + 2}" fill="${wood.rabbet}"/>
            <rect x="${ix - 1}" y="${iy + innerH}" width="${innerW + 2}" height="1" fill="${wood.rabbet}"/>
            <rect x="${ix + innerW}" y="${iy - 1}" width="1" height="${innerH + 2}" fill="${wood.rabbet}"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: woodenSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Dotted: padding with contrasting background, then dots in frame color so they are visible
      else if (style === 'dotted') {
        const dotPad = 14
        const dotRadius = 4
        const dotSpacing = 14
        const padBg = { r: 255, g: 255, b: 255, alpha: 1 }
        composited = await sharp(composited)
          .extend({ top: dotPad, bottom: dotPad, left: dotPad, right: dotPad, background: padBg })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const circles: string[] = []
        const addDot = (cx: number, cy: number) => {
          circles.push(`<circle cx="${cx}" cy="${cy}" r="${dotRadius}" fill="${frameOpt.color}"/>`)
        }
        for (let x = dotPad; x <= fw - dotPad; x += dotSpacing) addDot(x, dotPad)
        for (let y = dotPad + dotSpacing; y <= fh - dotPad - dotSpacing; y += dotSpacing) addDot(fw - dotPad, y)
        for (let x = fw - dotPad - dotSpacing; x >= dotPad; x -= dotSpacing) addDot(x, fh - dotPad)
        for (let y = fh - dotPad - dotSpacing; y >= dotPad + dotSpacing; y -= dotSpacing) addDot(dotPad, y)
        const dotSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">${circles.join('')}</svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: dotSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Dashed: padding with contrasting background, then dash segments in frame color so they are visible
      else if (style === 'dashed') {
        const dashPad = 14
        const dashLen = 20
        const gapLen = 12
        const strokeW = 5
        const period = dashLen + gapLen
        const padBg = { r: 255, g: 255, b: 255, alpha: 1 }
        composited = await sharp(composited)
          .extend({ top: dashPad, bottom: dashPad, left: dashPad, right: dashPad, background: padBg })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const segments: string[] = []
        const half = strokeW / 2
        const yTop = dashPad - half
        const yBottom = fh - dashPad - half
        const xLeft = dashPad - half
        const xRight = fw - dashPad - half
        // Top: horizontal dashes
        for (let x = dashPad; x + dashLen <= fw - dashPad; x += period) {
          segments.push(`<rect x="${x}" y="${yTop}" width="${dashLen}" height="${strokeW}" fill="${frameOpt.color}"/>`)
        }
        // Right: vertical dashes
        for (let y = dashPad; y + dashLen <= fh - dashPad; y += period) {
          segments.push(`<rect x="${xRight}" y="${y}" width="${strokeW}" height="${dashLen}" fill="${frameOpt.color}"/>`)
        }
        // Bottom: horizontal dashes
        for (let x = dashPad; x + dashLen <= fw - dashPad; x += period) {
          segments.push(`<rect x="${x}" y="${yBottom}" width="${dashLen}" height="${strokeW}" fill="${frameOpt.color}"/>`)
        }
        // Left: vertical dashes
        for (let y = dashPad; y + dashLen <= fh - dashPad; y += period) {
          segments.push(`<rect x="${xLeft}" y="${y}" width="${strokeW}" height="${dashLen}" fill="${frameOpt.color}"/>`)
        }
        const dashSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">${segments.join('')}</svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: dashSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Default: thin, solid, thick, double, rounded
      else {
        const doublePad = style === 'double' ? 40 : pad
        const extendPad = style === 'double' ? doublePad : pad
        // For double frame use white background so the gap between the two lines is visible (not same as frame color)
        const extendBg = style === 'double' ? { r: 255, g: 255, b: 255, alpha: 1 } : { r: fr, g: fg, b: fb, alpha: 1 }
        composited = await sharp(composited)
          .extend({ top: extendPad, bottom: extendPad, left: extendPad, right: extendPad, background: extendBg })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width || imgWidth + 2 * extendPad
        const fh = meta.height || imgHeight + 2 * extendPad
        // Double line: two equal-width lines with clear white space between (no third line)
        if (style === 'double') {
          const lineWidth = 4
          const gap = 16
          const outerInset = 2
          const innerInset = outerInset + lineWidth + gap
          const outerW = fw - 2 * outerInset
          const outerH = fh - 2 * outerInset
          const innerW = fw - 2 * innerInset
          const innerH = fh - 2 * innerInset
          const doubleSvg = Buffer.from(
            `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">
              <rect x="${outerInset}" y="${outerInset}" width="${outerW}" height="${outerH}" fill="none" stroke="${frameOpt.color}" stroke-width="${lineWidth}"/>
              <rect x="${innerInset}" y="${innerInset}" width="${innerW}" height="${innerH}" fill="none" stroke="${frameOpt.color}" stroke-width="${lineWidth}"/>
            </svg>`
          )
          composited = await sharp(composited)
            .composite([{ input: doubleSvg, left: 0, top: 0 }])
            .toBuffer()
        }
        // Apply rounded corners to thin, solid, thick borders
        if (style === 'thin' || style === 'solid' || style === 'thick') {
          const radius = Math.min(28, Math.round(extendPad * 1.8))
          const roundSvg = Buffer.from(
            `<svg width="${fw}" height="${fh}"><rect x="0" y="0" width="${fw}" height="${fh}" rx="${radius}" ry="${radius}" fill="white"/></svg>`
          )
          composited = await sharp(composited)
            .composite([{ input: roundSvg, blend: 'dest-in' }])
            .toBuffer()
        }
      }
    }

    const finalBuffer = await sharp(composited).jpeg({ quality: 90 }).toBuffer()

    // Upload to Supabase Storage (generated-images bucket)
    // Prefer admin client (bypasses RLS) for storage; fall back to user client
    const storageClient = getSupabaseAdmin() || supabase
    const filename = `${user.id}/branded_${Date.now()}.jpg`
    
    let uploadOk = false
    const { error: uploadError } = await storageClient.storage
      .from('generated-images')
      .upload(filename, finalBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Composite upload error (primary):', uploadError.message, uploadError)
      // Retry with the other client if admin was used and failed
      if (storageClient !== supabase) {
        const { error: retryErr } = await supabase.storage
          .from('generated-images')
          .upload(filename, finalBuffer, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: true,
          })
        if (retryErr) {
          console.error('Composite upload error (retry):', retryErr.message, retryErr)
          const message = retryErr.message?.includes('Bucket not found') || retryErr.message?.includes('not found')
            ? 'Storage bucket is not set up. Please create a bucket named "generated-images" in Supabase Storage and allow authenticated uploads.'
            : retryErr.message || 'Failed to save image'
          return NextResponse.json({ error: message }, { status: 500 })
        }
        uploadOk = true
      } else {
      const message = uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')
        ? 'Storage bucket is not set up. Please create a bucket named "generated-images" in Supabase Storage and allow authenticated uploads.'
        : uploadError.message || 'Failed to save image'
      return NextResponse.json({ error: message }, { status: 500 })
      }
    } else {
      uploadOk = true
    }

    // Get public URL (use whichever client succeeded)
    const urlClient = uploadOk ? storageClient : supabase
    const { data: urlData } = urlClient.storage
      .from('generated-images')
      .getPublicUrl(filename)

    return NextResponse.json({ 
      url: urlData.publicUrl,
      success: true 
    })

  } catch (error) {
    console.error('Composite error:', error)
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
  }
}
