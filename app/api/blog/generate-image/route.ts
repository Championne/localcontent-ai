import { NextRequest, NextResponse } from 'next/server'
import { generateImage, ImageStyle } from '@/lib/openai/images'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// API to generate a blog post image
export async function POST(request: NextRequest) {
  try {
    // Check for admin/internal access (simple API key check)
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.BLOG_IMAGE_API_KEY || process.env.OPENAI_API_KEY
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, slug, category } = await request.json()

    if (!title || !slug) {
      return NextResponse.json({ error: 'title and slug are required' }, { status: 400 })
    }

    // Determine style based on category
    let style: ImageStyle = 'professional'
    if (category?.toLowerCase().includes('seo') || category?.toLowerCase().includes('local')) {
      style = 'professional'
    } else if (category?.toLowerCase().includes('marketing')) {
      style = 'promotional'
    } else if (category?.toLowerCase().includes('ai') || category?.toLowerCase().includes('content')) {
      style = 'friendly'
    }

    // Generate the image
    const result = await generateImage({
      topic: title,
      businessName: 'GeoSpark',
      industry: 'local business marketing',
      style,
      contentType: 'blog-post' // This gives us landscape 1792x1024
    })

    // Download and save the image
    const imageResponse = await fetch(result.url)
    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Ensure directory exists
    const imagesDir = path.join(process.cwd(), 'public', 'blog', 'images')
    await mkdir(imagesDir, { recursive: true })
    
    // Save the image
    const imagePath = path.join(imagesDir, `${slug}.webp`)
    await writeFile(imagePath, Buffer.from(imageBuffer))

    return NextResponse.json({
      success: true,
      slug,
      imagePath: `/blog/images/${slug}.webp`,
      style: result.style,
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

// GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    message: 'Blog image generation API',
    usage: 'POST with { title, slug, category } to generate an image'
  })
}
