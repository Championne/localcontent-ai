import { NextRequest, NextResponse } from 'next/server'
import { generateImage, IMAGE_STYLES, ImageStyle } from '@/lib/openai/images'
import { put } from '@vercel/blob'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// POST - Generate or save image for a blog post
// If `previewUrl` is provided, saves that existing image instead of generating new
export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  try {
    const { slug, title, style, category, previewUrl } = await request.json()

    if (!slug || !title) {
      return NextResponse.json({ error: 'slug and title are required' }, { status: 400 })
    }

    // Use specified style or detect from category
    let imageStyle: ImageStyle = style || 'professional'
    
    if (!style && category) {
      // Auto-detect style based on category
      switch (category) {
        case 'Local SEO':
          imageStyle = 'professional'
          break
        case 'Marketing':
          imageStyle = 'promotional'
          break
        case 'AI & Content':
          imageStyle = 'friendly'
          break
        case 'Business Growth':
          imageStyle = 'professional'
          break
      }
    }

    let imageUrl: string

    // If previewUrl is provided, use that instead of generating new
    if (previewUrl) {
      console.log(`Saving existing preview image for: ${title} (${imageStyle})`)
      imageUrl = previewUrl
    } else {
      console.log(`Generating ${imageStyle} image for: ${title}`)

      // Generate the image using GeoSpark's image generation
      const result = await generateImage({
        topic: title,
        businessName: 'GeoSpark',
        industry: 'local business marketing',
        style: imageStyle,
        contentType: 'blog-post' // This gives us landscape 1792x1024
      })
      imageUrl = result.url
    }

    // Download the image from OpenAI
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Upload to Vercel Blob storage
    const blob = await put(`blog/images/${slug}.webp`, imageBuffer, {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: false, // Keep clean URLs
    })

    console.log(`Uploaded to Vercel Blob: ${blob.url}`)

    // Store the image URL in Supabase for persistence
    // Uses upsert to update if exists, insert if not
    const { error: dbError } = await supabase
      .from('blog_images')
      .upsert({
        slug,
        image_url: blob.url,
        style: imageStyle,
        updated_at: new Date().toISOString()
      }, { onConflict: 'slug' })

    if (dbError) {
      console.log('Could not save to Supabase (table may not exist):', dbError.message)
      // Continue anyway - image was uploaded successfully
    }

    return NextResponse.json({
      success: true,
      slug,
      style: imageStyle,
      styleName: IMAGE_STYLES[imageStyle].name,
      imagePath: blob.url
    })
  } catch (error) {
    console.error('Blog image generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    )
  }
}

// Generate preview images in all 4 styles (for comparison)
export async function PUT(request: NextRequest) {
  try {
    const { slug, title } = await request.json()

    if (!slug || !title) {
      return NextResponse.json({ error: 'slug and title are required' }, { status: 400 })
    }

    const styles: ImageStyle[] = ['promotional', 'professional', 'friendly', 'seasonal']
    const results: Array<{ style: ImageStyle; url: string; error?: string }> = []

    for (const style of styles) {
      try {
        console.log(`Generating ${style} preview for: ${title}`)
        
        const result = await generateImage({
          topic: title,
          businessName: 'GeoSpark',
          industry: 'local business marketing',
          style,
          contentType: 'blog-post'
        })

        results.push({
          style,
          url: result.url
        })

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        results.push({
          style,
          url: '',
          error: error instanceof Error ? error.message : 'Failed'
        })
      }
    }

    return NextResponse.json({
      success: true,
      slug,
      title,
      previews: results
    })
  } catch (error) {
    console.error('Preview generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate previews' },
      { status: 500 }
    )
  }
}
