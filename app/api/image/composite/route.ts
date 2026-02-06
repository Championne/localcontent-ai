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
    const { imageUrl, logoUrl, position, isCircular = false } = await request.json()
    // position: { x: number, y: number, scale: number } - all in percentages
    // isCircular: boolean - if true, crop overlay image to circle (for profile photos)

    if (!imageUrl || !logoUrl || !position) {
      return NextResponse.json(
        { error: 'imageUrl, logoUrl, and position are required' },
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
    const composited = await baseImage
      .composite([
        {
          input: resizedLogo,
          left: boundedLeft,
          top: boundedTop,
        },
      ])
      .jpeg({ quality: 90 })
      .toBuffer()

    // Upload to Supabase Storage (generated-images bucket)
    const filename = `${user.id}/branded_${Date.now()}.jpg`
    
    const { error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(filename, composited, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to save image' }, { status: 500 })
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
