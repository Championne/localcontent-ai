import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import sharp from 'sharp'

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
    // frame: optional { style: 'thin'|'solid'|'thick'|'double'|'rounded', color: hex } - border around whole image

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

      // Optional: ring around overlay (profile/logo) in brand colour
      const ringHex = (typeof overlayBorderColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(overlayBorderColor))
        ? overlayBorderColor
        : (typeof brandPrimaryColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(brandPrimaryColor) ? brandPrimaryColor : null)
      if (ringHex) {
        const ringPx = Math.max(2, Math.min(8, Math.round(logoWidth / 32)))
        const cx = boundedLeft + (logoMeta.width || logoWidth) / 2
        const cy = boundedTop + logoHeight / 2
        const r = (logoMeta.width || logoWidth) / 2 + ringPx / 2
        const ringSvg = Buffer.from(
          `<svg width="${imgWidth}" height="${imgHeight}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ringHex}" stroke-width="${ringPx}"/></svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: ringSvg, left: 0, top: 0 }])
          .toBuffer()
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
    const frameOverridesTint = frame && ['gold', 'silver', 'copper', 'neon', 'filmstrip', 'vignette'].includes(frame.style as string)
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
    const frameStyles = ['thin', 'solid', 'thick', 'double', 'rounded', 'classic', 'wooden', 'filmstrip', 'vignette', 'neon', 'shadow', 'gold', 'silver', 'copper'] as const
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

      // Vignette: cinematic edge darkening (elliptical, stronger at corners)
      if (style === 'vignette') {
        const vw = imgWidth
        const vh = imgHeight
        const cx = vw / 2
        const cy = vh / 2
        const r = Math.max(vw, vh) * 0.72
        const vignetteSvg = Buffer.from(
          `<svg width="${vw}" height="${vh}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="vg" cx="${cx}" cy="${cy}" r="${r}" fx="${cx}" fy="${cy}"><stop offset="0%" stop-color="transparent"/><stop offset="50%" stop-color="black" stop-opacity="0"/><stop offset="72%" stop-color="black" stop-opacity="0.3"/><stop offset="100%" stop-color="black" stop-opacity="0.72"/></radialGradient></defs><rect x="0" y="0" width="${vw}" height="${vh}" fill="url(#vg)"/></svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: vignetteSvg, left: 0, top: 0, blend: 'over' }])
          .toBuffer()
      }
      // Floating shadow: card lift with strong visible shadow + subtle top-edge highlight
      else if (style === 'shadow') {
        const borderPad = 5
        const margin = 48
        const shadowOffset = 22
        const shadowBlur = 38
        const shadowOpacity = 0.78
        const imgWithBorder = await sharp(composited)
          .extend({ top: borderPad, bottom: borderPad, left: borderPad, right: borderPad, background: { r: fr, g: fg, b: fb, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(imgWithBorder).metadata()
        const iw = meta.width!
        const ih = meta.height!
        const fullW = iw + 2 * margin
        const fullH = ih + 2 * margin
        const shadowSvg = Buffer.from(
          `<svg width="${iw + shadowBlur * 2}" height="${ih + shadowBlur * 2}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="blur"><feGaussianBlur in="SourceGraphic" stdDeviation="${shadowBlur}"/></filter></defs><rect x="${shadowBlur}" y="${shadowBlur}" width="${iw}" height="${ih}" rx="2" ry="2" fill="black" opacity="${shadowOpacity}" filter="url(#blur)"/></svg>`
        )
        const highlightSvg = Buffer.from(
          `<svg width="${iw}" height="${ih}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${iw}" height="1" fill="white" opacity="0.25"/><rect x="0" y="0" width="1" height="${ih}" fill="white" opacity="0.15"/></svg>`
        )
        const bg = await sharp({
          create: { width: fullW, height: fullH, channels: 3, background: { r: 242, g: 244, b: 248 } },
        })
          .jpeg()
          .toBuffer()
        const withHighlight = await sharp(imgWithBorder)
          .composite([{ input: highlightSvg, left: 0, top: 0, blend: 'over' }])
          .toBuffer()
        composited = await sharp(bg)
          .composite([
            { input: shadowSvg, left: margin + shadowOffset, top: margin + shadowOffset },
            { input: withHighlight, left: margin, top: margin },
          ])
          .toBuffer()
      }
      // Gold / Silver / Copper: polished metallic look – strong directional light, highlight sheen, per-edge shading
      else if (style === 'gold' || style === 'silver' || style === 'copper') {
        const metal = style === 'gold'
          ? { tint: { r: 212, g: 175, b: 55 }, tintOpacity: 0.22, dark: '#3d3008', midDark: '#5c4a0a', mid: '#a67c0a', midLight: '#d4a817', light: '#f0d84a', highlight: '#fffce0', edge: '#fffef5' }
          : style === 'silver'
          ? { tint: { r: 200, g: 200, b: 208 }, tintOpacity: 0.18, dark: '#1a1a1a', midDark: '#404040', mid: '#808080', midLight: '#c0c0c0', light: '#e8e8e8', highlight: '#ffffff', edge: '#fafafa' }
          : { tint: { r: 184, g: 115, b: 51 }, tintOpacity: 0.22, dark: '#2d1804', midDark: '#5c2e0a', mid: '#8b4513', midLight: '#c48450', light: '#e8b878', highlight: '#fdf5eb', edge: '#fdf0e0' }
        const tintSvg = Buffer.from(
          `<svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="rgb(${metal.tint.r},${metal.tint.g},${metal.tint.b})" opacity="${metal.tintOpacity}"/></svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: tintSvg, left: 0, top: 0, blend: 'over' }])
          .toBuffer()
        const frameWidth = 26
        const [dr, dg, db] = [parseInt(metal.dark.slice(1, 3), 16), parseInt(metal.dark.slice(3, 5), 16), parseInt(metal.dark.slice(5, 7), 16)]
        composited = await sharp(composited)
          .extend({ top: frameWidth, bottom: frameWidth, left: frameWidth, right: frameWidth, background: { r: dr, g: dg, b: db, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const inner = frameWidth
        const iw = fw - 2 * inner
        const ih = fh - 2 * inner
        const donutPath = `M 0 0 h ${fw} v ${fh} h -${fw} Z M ${inner} ${inner} v ${ih} h ${iw} v -${ih} Z`
        const metalSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${metal.highlight}"/>
                <stop offset="5%" stop-color="${metal.light}"/>
                <stop offset="18%" stop-color="${metal.midLight}"/>
                <stop offset="40%" stop-color="${metal.mid}"/>
                <stop offset="65%" stop-color="${metal.midDark}"/>
                <stop offset="88%" stop-color="${metal.dark}"/>
                <stop offset="100%" stop-color="${metal.dark}"/>
              </linearGradient>
              <linearGradient id="metalShine" x1="0%" y1="0%" x2="45%" y2="45%">
                <stop offset="0%" stop-color="white" stop-opacity="0.55"/>
                <stop offset="25%" stop-color="white" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="white" stop-opacity="0"/>
              </linearGradient>
              <linearGradient id="metalEdge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${metal.highlight}"/>
                <stop offset="100%" stop-color="${metal.midLight}"/>
              </linearGradient>
            </defs>
            <path fill-rule="evenodd" fill="url(#metalGrad)" d="${donutPath}"/>
            <path fill-rule="evenodd" fill="url(#metalShine)" d="${donutPath}"/>
            <rect x="${inner}" y="${inner}" width="${iw}" height="${ih}" fill="none" stroke="url(#metalEdge)" stroke-width="2"/>
            <rect x="${inner}" y="${inner}" width="${iw}" height="${ih}" fill="none" stroke="${metal.edge}" stroke-width="1"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: metalSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Neon: neon sign effect – dark background, wide luminous glow halo, bright core (like reference)
      else if (style === 'neon') {
        const neonTintOpacity = 0.12
        const [ntR, ntG, ntB] = [
          parseInt(frameOpt.color.slice(1, 3), 16),
          parseInt(frameOpt.color.slice(3, 5), 16),
          parseInt(frameOpt.color.slice(5, 7), 16),
        ]
        const neonTintSvg = Buffer.from(
          `<svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="rgb(${ntR},${ntG},${ntB})" opacity="${neonTintOpacity}"/></svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: neonTintSvg, left: 0, top: 0, blend: 'over' }])
          .toBuffer()

        const neonPad = 56
        composited = await sharp(composited)
          .extend({ top: neonPad, bottom: neonPad, left: neonPad, right: neonPad, background: { r: 2, g: 2, b: 6, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const inner = 12
        const rx = 8
        const strokeW = 3
        const neonColor = frameOpt.color
        const blurOuter = 24
        const blurMid = 12
        const blurInner = 5
        const neonGlowSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="neonBlurOut" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="${blurOuter}"/></filter>
              <filter id="neonBlurMid" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="${blurMid}"/></filter>
              <filter id="neonBlurIn" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="${blurInner}"/></filter>
            </defs>
            <rect x="${inner}" y="${inner}" width="${fw - 2 * inner}" height="${fh - 2 * inner}" rx="${rx}" ry="${rx}" fill="none" stroke="${neonColor}" stroke-width="32" opacity="0.5" filter="url(#neonBlurOut)"/>
            <rect x="${inner}" y="${inner}" width="${fw - 2 * inner}" height="${fh - 2 * inner}" rx="${rx}" ry="${rx}" fill="none" stroke="${neonColor}" stroke-width="20" opacity="0.65" filter="url(#neonBlurMid)"/>
            <rect x="${inner}" y="${inner}" width="${fw - 2 * inner}" height="${fh - 2 * inner}" rx="${rx}" ry="${rx}" fill="none" stroke="${neonColor}" stroke-width="10" opacity="0.85" filter="url(#neonBlurIn)"/>
            <rect x="${inner}" y="${inner}" width="${fw - 2 * inner}" height="${fh - 2 * inner}" rx="${rx}" ry="${rx}" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="${strokeW + 1}"/>
            <rect x="${inner}" y="${inner}" width="${fw - 2 * inner}" height="${fh - 2 * inner}" rx="${rx}" ry="${rx}" fill="none" stroke="${neonColor}" stroke-width="${strokeW}"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: neonGlowSvg, left: 0, top: 0 }])
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
            <rect x="${sidePad}" y="${stripH}" width="${fw - 2 * sidePad}" height="${fh - 2 * stripH}" fill="none" stroke="#000" stroke-width="1"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: filmSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Classic painting frame: layered antique gold (outer dark band, main ornate band, inner smooth band, rabbet)
      else if (style === 'classic') {
        const outerBand = 4
        const mainBand = 18
        const transitionBand = 2
        const innerBand = 8
        const innerDeco = 2
        const rabbet = 1
        const frameWidth = outerBand + mainBand + transitionBand + innerBand + innerDeco + rabbet
        const antiqueGold = {
          dark: '#5c4a1a',
          midDark: '#7d6510',
          mid: '#a67c32',
          midLight: '#c9a227',
          light: '#e8c547',
          highlight: '#f5e6a8',
          rabbet: '#3d3208',
        }
        composited = await sharp(composited)
          .extend({ top: frameWidth, bottom: frameWidth, left: frameWidth, right: frameWidth, background: { r: 61, g: 50, b: 26, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const paintingSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldMain" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${antiqueGold.highlight}"/><stop offset="35%" stop-color="${antiqueGold.light}"/><stop offset="70%" stop-color="${antiqueGold.mid}"/><stop offset="100%" stop-color="${antiqueGold.midDark}"/></linearGradient>
              <linearGradient id="goldInner" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${antiqueGold.light}"/><stop offset="100%" stop-color="${antiqueGold.mid}"/></linearGradient>
              <linearGradient id="goldTop" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="${antiqueGold.midDark}"/><stop offset="100%" stop-color="${antiqueGold.highlight}"/></linearGradient>
              <linearGradient id="goldRight" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${antiqueGold.light}"/><stop offset="100%" stop-color="${antiqueGold.dark}"/></linearGradient>
              <linearGradient id="goldBottom" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${antiqueGold.midLight}"/><stop offset="100%" stop-color="${antiqueGold.dark}"/></linearGradient>
              <linearGradient id="goldLeft" x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stop-color="${antiqueGold.highlight}"/><stop offset="100%" stop-color="${antiqueGold.midDark}"/></linearGradient>
            </defs>
            <!-- Outer dark band -->
            <rect x="0" y="0" width="${fw}" height="${frameWidth}" fill="${antiqueGold.dark}"/>
            <rect x="${fw - frameWidth}" y="0" width="${frameWidth}" height="${fh}" fill="${antiqueGold.dark}"/>
            <rect x="0" y="${fh - frameWidth}" width="${fw}" height="${frameWidth}" fill="${antiqueGold.dark}"/>
            <rect x="0" y="0" width="${frameWidth}" height="${fh}" fill="${antiqueGold.dark}"/>
            <!-- Main ornate band (gradient per side for 3D) -->
            <rect x="${outerBand}" y="${outerBand}" width="${fw - 2 * outerBand}" height="${mainBand}" fill="url(#goldTop)"/>
            <rect x="${fw - outerBand - mainBand}" y="${outerBand}" width="${mainBand}" height="${fh - 2 * outerBand}" fill="url(#goldRight)"/>
            <rect x="${outerBand}" y="${fh - outerBand - mainBand}" width="${fw - 2 * outerBand}" height="${mainBand}" fill="url(#goldBottom)"/>
            <rect x="${outerBand}" y="${outerBand}" width="${mainBand}" height="${fh - 2 * outerBand}" fill="url(#goldLeft)"/>
            <!-- Transition band (recessed) -->
            <rect x="${outerBand + mainBand}" y="${outerBand + mainBand}" width="${fw - 2 * (outerBand + mainBand)}" height="${transitionBand}" fill="${antiqueGold.midDark}"/>
            <rect x="${fw - outerBand - mainBand - transitionBand}" y="${outerBand + mainBand}" width="${transitionBand}" height="${fh - 2 * (outerBand + mainBand)}" fill="${antiqueGold.midDark}"/>
            <rect x="${outerBand + mainBand}" y="${fh - outerBand - mainBand - transitionBand}" width="${fw - 2 * (outerBand + mainBand)}" height="${transitionBand}" fill="${antiqueGold.midDark}"/>
            <rect x="${outerBand + mainBand}" y="${outerBand + mainBand}" width="${transitionBand}" height="${fh - 2 * (outerBand + mainBand)}" fill="${antiqueGold.midDark}"/>
            <!-- Inner smooth band -->
            <rect x="${outerBand + mainBand + transitionBand}" y="${outerBand + mainBand + transitionBand}" width="${fw - 2 * (outerBand + mainBand + transitionBand)}" height="${innerBand}" fill="url(#goldInner)"/>
            <rect x="${fw - outerBand - mainBand - transitionBand - innerBand}" y="${outerBand + mainBand + transitionBand}" width="${innerBand}" height="${fh - 2 * (outerBand + mainBand + transitionBand)}" fill="url(#goldInner)"/>
            <rect x="${outerBand + mainBand + transitionBand}" y="${fh - outerBand - mainBand - transitionBand - innerBand}" width="${fw - 2 * (outerBand + mainBand + transitionBand)}" height="${innerBand}" fill="url(#goldInner)"/>
            <rect x="${outerBand + mainBand + transitionBand}" y="${outerBand + mainBand + transitionBand}" width="${innerBand}" height="${fh - 2 * (outerBand + mainBand + transitionBand)}" fill="url(#goldInner)"/>
            <!-- Inner decorative edge (thin light line) -->
            <rect x="${frameWidth - innerDeco - rabbet}" y="${frameWidth - innerDeco - rabbet}" width="${fw - 2 * (frameWidth - innerDeco - rabbet)}" height="${innerDeco}" fill="${antiqueGold.highlight}"/>
            <rect x="${fw - frameWidth + rabbet}" y="${frameWidth - innerDeco - rabbet}" width="${innerDeco}" height="${fh - 2 * (frameWidth - innerDeco - rabbet)}" fill="${antiqueGold.highlight}"/>
            <rect x="${frameWidth - innerDeco - rabbet}" y="${fh - frameWidth + rabbet}" width="${fw - 2 * (frameWidth - innerDeco - rabbet)}" height="${innerDeco}" fill="${antiqueGold.highlight}"/>
            <rect x="${frameWidth - innerDeco - rabbet}" y="${frameWidth - innerDeco - rabbet}" width="${innerDeco}" height="${fh - 2 * (frameWidth - innerDeco - rabbet)}" fill="${antiqueGold.highlight}"/>
            <!-- Rabbet (inner lip) -->
            <rect x="${frameWidth - rabbet}" y="${frameWidth - rabbet}" width="${fw - 2 * (frameWidth - rabbet)}" height="${rabbet}" fill="${antiqueGold.rabbet}"/>
            <rect x="${fw - frameWidth}" y="${frameWidth - rabbet}" width="${rabbet}" height="${fh - 2 * (frameWidth - rabbet)}" fill="${antiqueGold.rabbet}"/>
            <rect x="${frameWidth - rabbet}" y="${fh - frameWidth}" width="${fw - 2 * (frameWidth - rabbet)}" height="${rabbet}" fill="${antiqueGold.rabbet}"/>
            <rect x="${frameWidth - rabbet}" y="${frameWidth - rabbet}" width="${rabbet}" height="${fh - 2 * (frameWidth - rabbet)}" fill="${antiqueGold.rabbet}"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: paintingSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Wooden frame: molded profile (outer edge, concave groove, convex bead, inner bevel, rabbet), dark wood tones
      else if (style === 'wooden') {
        const outerBand = 5
        const grooveBand = 4
        const beadBand = 6
        const innerBand = 8
        const rabbet = 1
        const frameWidth = outerBand + grooveBand + beadBand + innerBand + rabbet
        const wood = {
          dark: '#3d2817',
          midDark: '#5c3d2e',
          mid: '#7d5a3a',
          midLight: '#a67c52',
          light: '#c49a6c',
          highlight: '#d4a574',
          rabbet: '#2a1a0f',
        }
        composited = await sharp(composited)
          .extend({ top: frameWidth, bottom: frameWidth, left: frameWidth, right: frameWidth, background: { r: 42, g: 26, b: 15, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const woodenSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="woodOuter" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${wood.highlight}"/><stop offset="50%" stop-color="${wood.mid}"/><stop offset="100%" stop-color="${wood.midDark}"/></linearGradient>
              <linearGradient id="woodGroove" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="${wood.midDark}"/><stop offset="100%" stop-color="${wood.dark}"/></linearGradient>
              <linearGradient id="woodBead" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${wood.light}"/><stop offset="60%" stop-color="${wood.mid}"/><stop offset="100%" stop-color="${wood.midDark}"/></linearGradient>
              <linearGradient id="woodInner" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${wood.midLight}"/><stop offset="100%" stop-color="${wood.mid}"/></linearGradient>
              <linearGradient id="woodTop" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="${wood.midDark}"/><stop offset="100%" stop-color="${wood.highlight}"/></linearGradient>
              <linearGradient id="woodRight" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${wood.light}"/><stop offset="100%" stop-color="${wood.dark}"/></linearGradient>
              <linearGradient id="woodBottom" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${wood.midLight}"/><stop offset="100%" stop-color="${wood.dark}"/></linearGradient>
              <linearGradient id="woodLeft" x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stop-color="${wood.highlight}"/><stop offset="100%" stop-color="${wood.midDark}"/></linearGradient>
            </defs>
            <!-- Outer rounded edge (lighter) -->
            <rect x="0" y="0" width="${fw}" height="${outerBand}" fill="url(#woodTop)"/>
            <rect x="${fw - outerBand}" y="0" width="${outerBand}" height="${fh}" fill="url(#woodRight)"/>
            <rect x="0" y="${fh - outerBand}" width="${fw}" height="${outerBand}" fill="url(#woodBottom)"/>
            <rect x="0" y="0" width="${outerBand}" height="${fh}" fill="url(#woodLeft)"/>
            <!-- Concave groove (darker) -->
            <rect x="${outerBand}" y="${outerBand}" width="${fw - 2 * outerBand}" height="${grooveBand}" fill="url(#woodGroove)"/>
            <rect x="${fw - outerBand - grooveBand}" y="${outerBand}" width="${grooveBand}" height="${fh - 2 * outerBand}" fill="url(#woodGroove)"/>
            <rect x="${outerBand}" y="${fh - outerBand - grooveBand}" width="${fw - 2 * outerBand}" height="${grooveBand}" fill="url(#woodGroove)"/>
            <rect x="${outerBand}" y="${outerBand}" width="${grooveBand}" height="${fh - 2 * outerBand}" fill="url(#woodGroove)"/>
            <!-- Convex bead -->
            <rect x="${outerBand + grooveBand}" y="${outerBand + grooveBand}" width="${fw - 2 * (outerBand + grooveBand)}" height="${beadBand}" fill="url(#woodBead)"/>
            <rect x="${fw - outerBand - grooveBand - beadBand}" y="${outerBand + grooveBand}" width="${beadBand}" height="${fh - 2 * (outerBand + grooveBand)}" fill="url(#woodBead)"/>
            <rect x="${outerBand + grooveBand}" y="${fh - outerBand - grooveBand - beadBand}" width="${fw - 2 * (outerBand + grooveBand)}" height="${beadBand}" fill="url(#woodBead)"/>
            <rect x="${outerBand + grooveBand}" y="${outerBand + grooveBand}" width="${beadBand}" height="${fh - 2 * (outerBand + grooveBand)}" fill="url(#woodBead)"/>
            <!-- Inner bevel -->
            <rect x="${outerBand + grooveBand + beadBand}" y="${outerBand + grooveBand + beadBand}" width="${fw - 2 * (outerBand + grooveBand + beadBand)}" height="${innerBand}" fill="url(#woodInner)"/>
            <rect x="${fw - outerBand - grooveBand - beadBand - innerBand}" y="${outerBand + grooveBand + beadBand}" width="${innerBand}" height="${fh - 2 * (outerBand + grooveBand + beadBand)}" fill="url(#woodInner)"/>
            <rect x="${outerBand + grooveBand + beadBand}" y="${fh - outerBand - grooveBand - beadBand - innerBand}" width="${fw - 2 * (outerBand + grooveBand + beadBand)}" height="${innerBand}" fill="url(#woodInner)"/>
            <rect x="${outerBand + grooveBand + beadBand}" y="${outerBand + grooveBand + beadBand}" width="${innerBand}" height="${fh - 2 * (outerBand + grooveBand + beadBand)}" fill="url(#woodInner)"/>
            <!-- Rabbet -->
            <rect x="${frameWidth - rabbet}" y="${frameWidth - rabbet}" width="${fw - 2 * (frameWidth - rabbet)}" height="${rabbet}" fill="${wood.rabbet}"/>
            <rect x="${fw - frameWidth}" y="${frameWidth - rabbet}" width="${rabbet}" height="${fh - 2 * (frameWidth - rabbet)}" fill="${wood.rabbet}"/>
            <rect x="${frameWidth - rabbet}" y="${fh - frameWidth}" width="${fw - 2 * (frameWidth - rabbet)}" height="${rabbet}" fill="${wood.rabbet}"/>
            <rect x="${frameWidth - rabbet}" y="${frameWidth - rabbet}" width="${rabbet}" height="${fh - 2 * (frameWidth - rabbet)}" fill="${wood.rabbet}"/>
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
        const doublePad = style === 'double' ? 20 : pad
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
          const lineWidth = 2
          const gap = 8
          const outerInset = 1
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
        } else if (style === 'rounded') {
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
    const filename = `${user.id}/branded_${Date.now()}.jpg`
    
    const { error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(filename, finalBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Composite upload error:', uploadError.message, uploadError)
      const message = uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')
        ? 'Storage bucket is not set up. Please create a bucket named "generated-images" in Supabase Storage and allow authenticated uploads.'
        : uploadError.message || 'Failed to save image'
      return NextResponse.json({ error: message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
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
