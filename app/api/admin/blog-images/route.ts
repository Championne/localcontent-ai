import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')
const IMAGES_DIR = path.join(process.cwd(), 'public/blog/images')

interface BlogPost {
  slug: string
  title: string
  category: string
  hasImage: boolean
  imagePath: string | null
}

function extractTitle(content: string, filename: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) {
    return h1Match[1].trim()
  }
  return filename
    .replace('.md', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function detectCategory(title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase()
  
  if (text.includes('seo') || text.includes('google') || text.includes('maps') || text.includes('citation')) {
    return 'Local SEO'
  }
  if (text.includes('marketing') || text.includes('email') || text.includes('review') || text.includes('event')) {
    return 'Marketing'
  }
  if (text.includes('ai') || text.includes('content') || text.includes('generate') || text.includes('automat')) {
    return 'AI & Content'
  }
  return 'Business Growth'
}

// GET - List all blog posts with image status
export async function GET() {
  try {
    if (!fs.existsSync(BLOG_DIR)) {
      return NextResponse.json({ posts: [], error: 'Blog directory not found' })
    }

    const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') && f !== 'article_manifest.md')
    
    const posts: BlogPost[] = files.map(filename => {
      const content = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8')
      const title = extractTitle(content, filename)
      const slug = filename.replace('.md', '')
      const category = detectCategory(title, content)
      
      // Check if image exists
      const imagePath = path.join(IMAGES_DIR, `${slug}.webp`)
      const hasImage = fs.existsSync(imagePath)
      
      return {
        slug,
        title,
        category,
        hasImage,
        imagePath: hasImage ? `/blog/images/${slug}.webp` : null
      }
    })

    // Sort: posts without images first, then alphabetically
    posts.sort((a, b) => {
      if (a.hasImage !== b.hasImage) return a.hasImage ? 1 : -1
      return a.title.localeCompare(b.title)
    })

    const stats = {
      total: posts.length,
      withImages: posts.filter(p => p.hasImage).length,
      withoutImages: posts.filter(p => !p.hasImage).length
    }

    return NextResponse.json({ posts, stats })
  } catch (error) {
    console.error('Error listing blog posts:', error)
    return NextResponse.json({ error: 'Failed to list posts' }, { status: 500 })
  }
}

// DELETE - Remove an image
export async function DELETE(request: NextRequest) {
  try {
    const { slug } = await request.json()
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const imagePath = path.join(IMAGES_DIR, `${slug}.webp`)
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath)
      return NextResponse.json({ success: true, message: `Deleted ${slug}.webp` })
    }
    
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
