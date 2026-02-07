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

    // Optional: transparent brand colour overlay over whole image
    const tint = tintOverlay && typeof tintOverlay.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(tintOverlay.color)
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
    const frameStyles = ['thin', 'solid', 'thick', 'double', 'rounded', 'classic', 'polaroid', 'dashed', 'dotted', 'filmstrip', 'vignette', 'neon', 'shadow', 'gold', 'silver', 'copper'] as const
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
      // Polaroid: warm paper, thick top/sides, large bottom lip, inner photo edge, drop shadow
      else if (style === 'polaroid') {
        const topPad = 28
        const leftPad = 28
        const rightPad = 28
        const bottomLip = 80
        const polaroidW = imgWidth + leftPad + rightPad
        const polaroidH = imgHeight + topPad + bottomLip
        const polaroidWhite = { r: 252, g: 249, b: 242 }
        const shadowMargin = 24
        const shadowOffset = 12
        const shadowBlur = 20
        const totalW = polaroidW + 2 * shadowMargin + shadowBlur + shadowOffset
        const totalH = polaroidH + 2 * shadowMargin + shadowBlur + shadowOffset
        const bg = await sharp({
          create: { width: totalW, height: totalH, channels: 3, background: { r: 238, g: 240, b: 242 } },
        })
          .jpeg()
          .toBuffer()
        const shadowSvg = Buffer.from(
          `<svg width="${polaroidW + shadowBlur * 2}" height="${polaroidH + shadowBlur * 2}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="ps"><feGaussianBlur in="SourceGraphic" stdDeviation="${shadowBlur}"/></filter></defs><rect x="${shadowBlur}" y="${shadowBlur}" width="${polaroidW}" height="${polaroidH}" rx="2" ry="2" fill="black" opacity="0.24" filter="url(#ps)"/></svg>`
        )
        const polaroidBg = await sharp({
          create: { width: polaroidW, height: polaroidH, channels: 3, background: polaroidWhite },
        })
          .jpeg()
          .toBuffer()
        const withPhoto = await sharp(polaroidBg)
          .composite([{ input: composited, left: leftPad, top: topPad }])
          .toBuffer()
        const innerStroke = 1.5
        const innerRectSvg = Buffer.from(
          `<svg width="${polaroidW}" height="${polaroidH}" xmlns="http://www.w3.org/2000/svg"><rect x="${leftPad}" y="${topPad}" width="${imgWidth}" height="${imgHeight}" fill="none" stroke="#c9c4b8" stroke-width="${innerStroke}"/></svg>`
        )
        const withInner = await sharp(withPhoto)
          .composite([{ input: innerRectSvg, left: 0, top: 0 }])
          .toBuffer()
        const outerStroke = 2
        const outerRectSvg = Buffer.from(
          `<svg width="${polaroidW}" height="${polaroidH}" xmlns="http://www.w3.org/2000/svg"><rect x="${outerStroke / 2}" y="${outerStroke / 2}" width="${polaroidW - outerStroke}" height="${polaroidH - outerStroke}" rx="2" ry="2" fill="none" stroke="#e6e2d8" stroke-width="${outerStroke}"/></svg>`
        )
        const polaroidFinal = await sharp(withInner)
          .composite([{ input: outerRectSvg, left: 0, top: 0 }])
          .toBuffer()
        composited = await sharp(bg)
          .composite([
            { input: shadowSvg, left: shadowMargin + shadowOffset - shadowBlur, top: shadowMargin + shadowOffset - shadowBlur },
            { input: polaroidFinal, left: shadowMargin, top: shadowMargin },
          ])
          .toBuffer()
      }
      // Floating shadow: card lift with soft shadow + subtle top-edge highlight
      else if (style === 'shadow') {
        const borderPad = 5
        const margin = 32
        const shadowOffset = 14
        const shadowBlur = 24
        const shadowOpacity = 0.52
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
      // Gold / Silver / Copper: metallic tint + high-contrast gradient frame for real shine
      else if (style === 'gold' || style === 'silver' || style === 'copper') {
        const metal = style === 'gold'
          ? { tint: { r: 212, g: 175, b: 55 }, tintOpacity: 0.15, dark: '#4a3a0a', mid: '#b8860b', light: '#f8ecd0', highlight: '#fffef5' }
          : style === 'silver'
          ? { tint: { r: 200, g: 200, b: 208 }, tintOpacity: 0.13, dark: '#303030', mid: '#9a9a9a', light: '#f5f5f5', highlight: '#ffffff' }
          : { tint: { r: 184, g: 115, b: 51 }, tintOpacity: 0.15, dark: '#3d2508', mid: '#8b4513', light: '#f0d4b8', highlight: '#fdf0e0' }
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
                <stop offset="0%" stop-color="${metal.light}"/>
                <stop offset="45%" stop-color="${metal.mid}"/>
                <stop offset="100%" stop-color="${metal.dark}"/>
              </linearGradient>
            </defs>
            <path fill-rule="evenodd" fill="url(#metalGrad)" d="${donutPath}"/>
            <rect x="${inner}" y="${inner}" width="${iw}" height="${ih}" fill="none" stroke="${metal.highlight}" stroke-width="1.5"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: metalSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Neon: full-on neon – user's color for tint + glow, near-black bg, multi-layer glow, bright core
      else if (style === 'neon') {
        const neonTintOpacity = 0.18
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

        const neonPad = 44
        composited = await sharp(composited)
          .extend({ top: neonPad, bottom: neonPad, left: neonPad, right: neonPad, background: { r: 4, g: 4, b: 8, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const inner = 10
        const strokeW = 4
        const glowW = 28
        const blur1 = 16
        const blur2 = 8
        const blur3 = 4
        const neonGlowSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg"><defs>
            <filter id="ng1"><feGaussianBlur stdDeviation="${blur1}" result="b1"/><feMerge><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="ng2"><feGaussianBlur stdDeviation="${blur2}" result="b2"/><feMerge><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="ng3"><feGaussianBlur stdDeviation="${blur3}" result="b3"/><feMerge><feMergeNode in="b3"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <rect x="${inner}" y="${inner}" width="${fw - 2 * inner}" height="${fh - 2 * inner}" fill="none" stroke="${frameOpt.color}" stroke-width="${glowW}" opacity="0.85" filter="url(#ng1)"/>
          <rect x="${inner}" y="${inner}" width="${fw - 2 * inner}" height="${fh - 2 * inner}" fill="none" stroke="${frameOpt.color}" stroke-width="${glowW * 0.6}" opacity="0.7" filter="url(#ng2)"/>
          <rect x="${inner}" y="${inner}" width="${fw - 2 * inner}" height="${fh - 2 * inner}" fill="none" stroke="${frameOpt.color}" stroke-width="${glowW * 0.25}" opacity="0.6" filter="url(#ng3)"/>
          <rect x="${inner}" y="${inner}" width="${fw - 2 * inner}" height="${fh - 2 * inner}" fill="none" stroke="white" stroke-width="${strokeW}" opacity="0.5"/>
          <rect x="${inner}" y="${inner}" width="${fw - 2 * inner}" height="${fh - 2 * inner}" fill="none" stroke="${frameOpt.color}" stroke-width="${strokeW}"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: neonGlowSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Film strip: real 35mm look – slight desaturation, black strip, sprocket holes with rim, film edge line
      else if (style === 'filmstrip') {
        composited = await sharp(composited)
          .modulate({ saturation: 0.88 })
          .toBuffer()
        const edgePad = 32
        const holeRows = 10
        const holeR = 5
        const holeSpacing = Math.floor((imgHeight + 2 * edgePad) / (holeRows + 1))
        const filmBlack = { r: 18, g: 18, b: 18 }
        composited = await sharp(composited)
          .extend({ top: edgePad, bottom: edgePad, left: edgePad, right: edgePad, background: filmBlack })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        let holes = ''
        for (let row = 0; row < holeRows; row++) {
          const y = holeSpacing * (row + 1)
          const cxL = edgePad / 2
          const cxR = fw - edgePad / 2
          holes += `<circle cx="${cxL}" cy="${y}" r="${holeR}" fill="#000" stroke="#3a3a3a" stroke-width="1"/>`
          holes += `<circle cx="${cxR}" cy="${y}" r="${holeR}" fill="#000" stroke="#3a3a3a" stroke-width="1"/>`
        }
        const filmSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">${holes}<rect x="1" y="1" width="${fw - 2}" height="${fh - 2}" fill="none" stroke="#2a2a2a" stroke-width="1"/><rect x="${edgePad}" y="${edgePad}" width="${fw - 2 * edgePad}" height="${fh - 2 * edgePad}" fill="none" stroke="#4a4a4a" stroke-width="0.8"/></svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: filmSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Classic art / painting frame: 4-edge bevel (light inner, dark outer), inner liner like a gallery frame
      else if (style === 'classic') {
        const frameWidth = 28
        const darken = 0.35
        const lighten = 1.7
        const dr = Math.round(Math.min(255, fr * darken))
        const dg = Math.round(Math.min(255, fg * darken))
        const db = Math.round(Math.min(255, fb * darken))
        const lr = Math.round(Math.min(255, fr * lighten + 42))
        const lg = Math.round(Math.min(255, fg * lighten + 42))
        const lb = Math.round(Math.min(255, fb * lighten + 42))
        const darkHex = `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`
        const lightHex = `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`
        composited = await sharp(composited)
          .extend({ top: frameWidth, bottom: frameWidth, left: frameWidth, right: frameWidth, background: { r: dr, g: dg, b: db, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const inner = frameWidth
        const iw = fw - 2 * inner
        const ih = fh - 2 * inner
        // Four rectangles (top, right, bottom, left) each with linear gradient: inner edge light, outer edge dark = 3D bevel
        const paintingSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bevelTop" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="${darkHex}"/><stop offset="100%" stop-color="${lightHex}"/></linearGradient>
              <linearGradient id="bevelRight" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${lightHex}"/><stop offset="100%" stop-color="${darkHex}"/></linearGradient>
              <linearGradient id="bevelBottom" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${lightHex}"/><stop offset="100%" stop-color="${darkHex}"/></linearGradient>
              <linearGradient id="bevelLeft" x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stop-color="${lightHex}"/><stop offset="100%" stop-color="${darkHex}"/></linearGradient>
            </defs>
            <rect x="0" y="0" width="${fw}" height="${inner}" fill="url(#bevelTop)"/>
            <rect x="${fw - inner}" y="0" width="${inner}" height="${fh}" fill="url(#bevelRight)"/>
            <rect x="0" y="${fh - inner}" width="${fw}" height="${inner}" fill="url(#bevelBottom)"/>
            <rect x="0" y="0" width="${inner}" height="${fh}" fill="url(#bevelLeft)"/>
            <rect x="${inner}" y="${inner}" width="${iw}" height="${ih}" fill="none" stroke="${lightHex}" stroke-width="2"/>
          </svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: paintingSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Dotted: padding + actual circles along the border (Sharp often ignores stroke-dasharray)
      else if (style === 'dotted') {
        const dotPad = 14
        const dotRadius = 3.5
        const dotSpacing = 12
        composited = await sharp(composited)
          .extend({ top: dotPad, bottom: dotPad, left: dotPad, right: dotPad, background: { r: fr, g: fg, b: fb, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const innerW = fw - 2 * dotPad
        const innerH = fh - 2 * dotPad
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
      // Dashed: padding + explicit dash segments (Sharp often ignores stroke-dasharray)
      else if (style === 'dashed') {
        const dashPad = 14
        const dashLen = 18
        const gapLen = 10
        const strokeW = 4
        const period = dashLen + gapLen
        composited = await sharp(composited)
          .extend({ top: dashPad, bottom: dashPad, left: dashPad, right: dashPad, background: { r: fr, g: fg, b: fb, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const segments: string[] = []
        const half = strokeW / 2
        // Top: horizontal dashes
        for (let x = dashPad; x + dashLen <= fw - dashPad; x += period) {
          segments.push(`<rect x="${x}" y="${dashPad - half}" width="${dashLen}" height="${strokeW}" fill="${frameOpt.color}"/>`)
        }
        // Right: vertical dashes
        for (let y = dashPad; y + dashLen <= fh - dashPad; y += period) {
          segments.push(`<rect x="${fw - dashPad - half}" y="${y}" width="${strokeW}" height="${dashLen}" fill="${frameOpt.color}"/>`)
        }
        // Bottom: horizontal dashes
        for (let x = dashPad; x + dashLen <= fw - dashPad; x += period) {
          segments.push(`<rect x="${x}" y="${fh - dashPad - half}" width="${dashLen}" height="${strokeW}" fill="${frameOpt.color}"/>`)
        }
        // Left: vertical dashes
        for (let y = dashPad; y + dashLen <= fh - dashPad; y += period) {
          segments.push(`<rect x="${dashPad - half}" y="${y}" width="${strokeW}" height="${dashLen}" fill="${frameOpt.color}"/>`)
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
        const doublePad = style === 'double' ? 18 : pad
        const extendPad = style === 'double' ? doublePad : pad
        // For double frame use white background so the gap between the two lines is visible (not same as frame color)
        const extendBg = style === 'double' ? { r: 255, g: 255, b: 255, alpha: 1 } : { r: fr, g: fg, b: fb, alpha: 1 }
        composited = await sharp(composited)
          .extend({ top: extendPad, bottom: extendPad, left: extendPad, right: extendPad, background: extendBg })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width || imgWidth + 2 * extendPad
        const fh = meta.height || imgHeight + 2 * extendPad
        if (style === 'double') {
          const lineWidth = 3
          const gap = 6
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
