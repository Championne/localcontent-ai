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
    const frameStyles = ['thin', 'solid', 'thick', 'double', 'rounded', 'classic', 'polaroid', 'dashed', 'dotted', 'filmstrip', 'vignette', 'neon', 'shadow'] as const
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

      // Vignette: no extend, just overlay radial gradient
      if (style === 'vignette') {
        const vw = imgWidth
        const vh = imgHeight
        const cx = vw / 2
        const cy = vh / 2
        const r = Math.max(vw, vh) * 0.7
        const vignetteSvg = Buffer.from(
          `<svg width="${vw}" height="${vh}"><defs><radialGradient id="vg" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="transparent"/><stop offset="100%" stop-color="black" stop-opacity="0.5"/></radialGradient></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#vg)"/></svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: vignetteSvg, left: 0, top: 0, blend: 'over' }])
          .toBuffer()
      }
      // Polaroid: white frame, extra bottom lip
      else if (style === 'polaroid') {
        const sidePad = 12
        const bottomLip = 48
        const topPad = sidePad
        const leftPad = sidePad
        const rightPad = sidePad
        const bottomPad = sidePad + bottomLip
        composited = await sharp(composited)
          .extend({ top: topPad, bottom: bottomPad, left: leftPad, right: rightPad, background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width || imgWidth + leftPad + rightPad
        const fh = meta.height || imgHeight + topPad + bottomPad
        const strokeSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}"><rect x="0" y="0" width="${fw}" height="${fh}" fill="none" stroke="#e5e7eb" stroke-width="2"/></svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: strokeSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Shadow (lifted): light background, drop shadow behind, image with thin border on top
      else if (style === 'shadow') {
        const borderPad = 4
        const margin = 24
        const shadowOffset = 10
        const shadowBlur = 14
        const imgWithBorder = await sharp(composited)
          .extend({ top: borderPad, bottom: borderPad, left: borderPad, right: borderPad, background: { r: fr, g: fg, b: fb, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(imgWithBorder).metadata()
        const iw = meta.width!
        const ih = meta.height!
        const fullW = iw + 2 * margin
        const fullH = ih + 2 * margin
        const shadowSvg = Buffer.from(
          `<svg width="${iw + shadowBlur * 2}" height="${ih + shadowBlur * 2}"><defs><filter id="blur"><feGaussianBlur in="SourceGraphic" stdDeviation="${shadowBlur}"/></filter></defs><rect x="${shadowBlur}" y="${shadowBlur}" width="${iw}" height="${ih}" fill="black" opacity="0.4" filter="url(#blur)"/></svg>`
        )
        const bg = await sharp({
          create: { width: fullW, height: fullH, channels: 3, background: { r: 248, g: 250, b: 252 } },
        })
          .jpeg()
          .toBuffer()
        composited = await sharp(bg)
          .composite([
            { input: shadowSvg, left: margin + shadowOffset, top: margin + shadowOffset },
            { input: imgWithBorder, left: margin, top: margin },
          ])
          .toBuffer()
      }
      // Neon: dark extend + thick glow (blurred stroke) + sharp inner stroke
      else if (style === 'neon') {
        const neonPad = 28
        composited = await sharp(composited)
          .extend({ top: neonPad, bottom: neonPad, left: neonPad, right: neonPad, background: { r: 30, g: 30, b: 35, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const inner = 10
        const glowSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}"><defs><filter id="glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x="${inner}" y="${inner}" width="${fw - 2 * inner}" height="${fh - 2 * inner}" fill="none" stroke="${frameOpt.color}" stroke-width="14" opacity="0.9" filter="url(#glow)"/><rect x="${inner}" y="${inner}" width="${fw - 2 * inner}" height="${fh - 2 * inner}" fill="none" stroke="${frameOpt.color}" stroke-width="2"/></svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: glowSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Film strip: white border, sprocket holes on left/right
      else if (style === 'filmstrip') {
        const edgePad = 20
        const holeRows = 6
        const holeR = 5
        const holeSpacing = Math.floor(imgHeight / (holeRows + 1))
        composited = await sharp(composited)
          .extend({ top: edgePad, bottom: edgePad, left: edgePad, right: edgePad, background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        let holes = ''
        for (let row = 0; row < holeRows; row++) {
          const y = edgePad + holeSpacing * (row + 1)
          holes += `<circle cx="${edgePad / 2}" cy="${y}" r="${holeR}" fill="black"/>`
          holes += `<circle cx="${fw - edgePad / 2}" cy="${y}" r="${holeR}" fill="black"/>`
        }
        const filmSvg = Buffer.from(`<svg width="${fw}" height="${fh}">${holes}</svg>`)
        composited = await sharp(composited)
          .composite([{ input: filmSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Classic (gallery): thick border with inner and outer line
      else if (style === 'classic') {
        const classicPad = 20
        composited = await sharp(composited)
          .extend({ top: classicPad, bottom: classicPad, left: classicPad, right: classicPad, background: { r: fr, g: fg, b: fb, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const inner = 6
        const outer = 2
        const classicSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}"><rect x="${outer}" y="${outer}" width="${fw - 2 * outer}" height="${fh - 2 * outer}" fill="none" stroke="${frameOpt.color}" stroke-width="${outer * 2}"/><rect x="${inner}" y="${inner}" width="${fw - 2 * inner}" height="${fh - 2 * inner}" fill="none" stroke="${frameOpt.color}" stroke-width="1" opacity="0.6"/></svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: classicSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Dashed / Dotted: solid extend + SVG stroke-dasharray
      else if (style === 'dashed' || style === 'dotted') {
        composited = await sharp(composited)
          .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: fr, g: fg, b: fb, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width!
        const fh = meta.height!
        const dashArray = style === 'dashed' ? '12,8' : '2,6'
        const strokeSvg = Buffer.from(
          `<svg width="${fw}" height="${fh}"><rect x="${pad}" y="${pad}" width="${fw - 2 * pad}" height="${fh - 2 * pad}" fill="none" stroke="${frameOpt.color}" stroke-width="${style === 'dotted' ? 3 : 4}" stroke-dasharray="${dashArray}"/></svg>`
        )
        composited = await sharp(composited)
          .composite([{ input: strokeSvg, left: 0, top: 0 }])
          .toBuffer()
      }
      // Default: thin, solid, thick, double, rounded
      else {
        composited = await sharp(composited)
          .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: fr, g: fg, b: fb, alpha: 1 } })
          .toBuffer()
        const meta = await sharp(composited).metadata()
        const fw = meta.width || imgWidth + 2 * pad
        const fh = meta.height || imgHeight + 2 * pad
        if (style === 'double') {
          const innerPad = pad
          const strokeSvg = Buffer.from(
            `<svg width="${fw}" height="${fh}"><rect x="${innerPad}" y="${innerPad}" width="${fw - 2 * innerPad}" height="${fh - 2 * innerPad}" fill="none" stroke="${frameOpt.color}" stroke-width="2"/></svg>`
          )
          composited = await sharp(composited)
            .composite([{ input: strokeSvg, left: 0, top: 0 }])
            .toBuffer()
        } else if (style === 'rounded') {
          const radius = Math.min(24, pad * 2)
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
