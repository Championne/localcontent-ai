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
    const { imageUrl, logoUrl, position, isCircular = false, brandPrimaryColor } = await request.json()
    // position: { x: number, y: number, scale: number } - all in percentages
    // isCircular: boolean - if true, crop overlay image to circle (for profile photos)
    // brandPrimaryColor: optional hex e.g. #0d9488 - add subtle border/tint

    if (!imageUrl || !logoUrl || !position) {
      return NextResponse.json(
        { error: 'imageUrl, logoUrl, and position are required' },
        { status: 400 }
      )
    }

    if (typeof imageUrl !== 'string' || imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
      return NextResponse.json(
        { error: 'Base image URL cannot be processed. Please use a saved image.' },
        { status: 400 }
      )
    }
    if (typeof logoUrl !== 'string' || logoUrl.startsWith('blob:') || logoUrl.startsWith('data:')) {
      return NextResponse.json(
        { error: 'Logo/photo URL cannot be processed. Please use a saved logo or photo.' },
        { status: 400 }
      )
    }

    const fetchOpts: RequestInit = {
      headers: { 'User-Agent': 'GeoSpark-ImageComposite/1.0 (https://geospark.ai)' },
    }
    // Fetch the base image
    const imageResponse = await fetch(imageUrl, fetchOpts)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch base image' }, { status: 500 })
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

    // Fetch the logo/overlay
    const logoResponse = await fetch(logoUrl, fetchOpts)
    if (!logoResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch logo' }, { status: 500 })
    }
    const logoBuffer = Buffer.from(await logoResponse.arrayBuffer())

    // Get base image dimensions
    const baseImage = sharp(imageBuffer)
    const metadata = await baseImage.metadata()
    const { width: imgWidth = 1024, height: imgHeight = 1024 } = metadata

    // Calculate logo dimensions based on scale percentage
    const logoWidth = Math.round((position.scale / 100) * imgWidth)
    
    // Resize logo maintaining aspect ratio
    let resizedLogo = await sharp(logoBuffer)
      .resize({ width: logoWidth, height: isCircular ? logoWidth : undefined, fit: isCircular ? 'cover' : 'inside', withoutEnlargement: false })
      .toBuffer()

    // If circular, apply circular mask
    if (isCircular) {
      const circleSize = logoWidth
      const circleSvg = Buffer.from(
        `<svg><circle cx="${circleSize/2}" cy="${circleSize/2}" r="${circleSize/2}" fill="white"/></svg>`
      )
      resizedLogo = await sharp(resizedLogo)
        .resize(circleSize, circleSize, { fit: 'cover' })
        .composite([{
          input: circleSvg,
          blend: 'dest-in'
        }])
        .png()
        .toBuffer()
    }

    // Get resized logo dimensions
    const logoMeta = await sharp(resizedLogo).metadata()
    const logoHeight = logoMeta.height || logoWidth

    // Calculate position in pixels from percentages
    const left = Math.round((position.x / 100) * imgWidth)
    const top = Math.round((position.y / 100) * imgHeight)

    // Ensure logo stays within bounds
    const boundedLeft = Math.max(0, Math.min(imgWidth - (logoMeta.width || logoWidth), left))
    const boundedTop = Math.max(0, Math.min(imgHeight - logoHeight, top))

    // Composite the images
    let composited = await baseImage
      .composite([
        {
          input: resizedLogo,
          left: boundedLeft,
          top: boundedTop,
        },
      ])
      .toBuffer()

    // Optional: add brand colour border
    const borderHex = typeof brandPrimaryColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(brandPrimaryColor)
      ? brandPrimaryColor
      : null
    if (borderHex) {
      const borderPx = Math.max(2, Math.min(12, Math.round(imgWidth / 256)))
      const [r, g, b] = [
        parseInt(borderHex.slice(1, 3), 16),
        parseInt(borderHex.slice(3, 5), 16),
        parseInt(borderHex.slice(5, 7), 16),
      ]
      composited = await sharp(composited)
        .extend({ top: borderPx, bottom: borderPx, left: borderPx, right: borderPx, background: { r, g, b, alpha: 1 } })
        .toBuffer()
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
