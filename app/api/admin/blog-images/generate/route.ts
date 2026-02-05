import { NextRequest, NextResponse } from 'next/server'
import { generateImage, IMAGE_STYLES, ImageStyle } from '@/lib/openai/images'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import fs from 'fs'

const IMAGES_DIR = path.join(process.cwd(), 'public/blog/images')

// POST - Generate image for a blog post
export async function POST(request: NextRequest) {
  try {
    const { slug, title, style, category } = await request.json()

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

    console.log(`Generating ${imageStyle} image for: ${title}`)

    // Generate the image using GeoSpark's image generation
    const result = await generateImage({
      topic: title,
      businessName: 'GeoSpark',
      industry: 'local business marketing',
      style: imageStyle,
      contentType: 'blog-post' // This gives us landscape 1792x1024
    })

    // Download the image
    const imageResponse = await fetch(result.url)
    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Ensure directory exists
    await mkdir(IMAGES_DIR, { recursive: true })
    
    // Save the image
    const imagePath = path.join(IMAGES_DIR, `${slug}.webp`)
    await writeFile(imagePath, Buffer.from(imageBuffer))

    return NextResponse.json({
      success: true,
      slug,
      style: imageStyle,
      styleName: IMAGE_STYLES[imageStyle].name,
      imagePath: `/blog/images/${slug}.webp`,
      revisedPrompt: result.revisedPrompt
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
