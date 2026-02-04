/**
 * Blog Image Generation Script
 * 
 * This script generates AI images for all blog posts.
 * Run with: npx ts-node scripts/generate-blog-images.ts
 * 
 * Or use the API directly for individual posts.
 */

import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')
const IMAGES_DIR = path.join(process.cwd(), 'public/blog/images')

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface BlogPost {
  slug: string
  title: string
  category: string
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

async function getAllPosts(): Promise<BlogPost[]> {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') && f !== 'article_manifest.md')
  
  return files.map(filename => {
    const content = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8')
    const title = extractTitle(content, filename)
    const slug = filename.replace('.md', '')
    const category = detectCategory(title, content)
    
    return { slug, title, category }
  })
}

function getStyleForCategory(category: string): string {
  switch (category) {
    case 'Local SEO':
      return 'Professional photograph showing a local business storefront or map/location concept'
    case 'Marketing':
      return 'Marketing and promotional photography, business growth concept'
    case 'AI & Content':
      return 'Modern technology and digital content creation concept'
    case 'Business Growth':
      return 'Business success and growth concept, professional setting'
    default:
      return 'Professional business photography'
  }
}

async function generateImageForPost(post: BlogPost): Promise<string | null> {
  const imagePath = path.join(IMAGES_DIR, `${post.slug}.webp`)
  
  // Skip if image already exists
  if (fs.existsSync(imagePath)) {
    console.log(`⏭️  Skipping ${post.slug} - image already exists`)
    return imagePath
  }

  const styleHint = getStyleForCategory(post.category)
  
  const prompt = `${styleHint}.

Create a realistic, professional photograph visually representing: "${post.title}"

This is for a blog about local business marketing and SEO.
Keep it simple: one main subject, clean background, no clutter.

CRITICAL: ABSOLUTELY NO TEXT, WORDS, LETTERS, OR WRITING ANYWHERE IN THE IMAGE.
No signs, no labels, no logos with text, no watermarks.

Style: Natural, authentic photograph. Wide landscape format (16:9).`

  try {
    console.log(`🎨 Generating image for: ${post.title}`)
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      style: 'natural',
    })

    const imageUrl = response.data[0]?.url
    if (!imageUrl) {
      throw new Error('No image URL returned')
    }

    // Download the image
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Ensure directory exists
    fs.mkdirSync(IMAGES_DIR, { recursive: true })
    
    // Save as webp
    fs.writeFileSync(imagePath, Buffer.from(imageBuffer))
    
    console.log(`✅ Saved: ${post.slug}.webp`)
    return imagePath
  } catch (error) {
    console.error(`❌ Failed to generate image for ${post.slug}:`, error)
    return null
  }
}

async function main() {
  console.log('🚀 Starting blog image generation...\n')
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required')
    process.exit(1)
  }

  const posts = await getAllPosts()
  console.log(`📝 Found ${posts.length} blog posts\n`)

  let generated = 0
  let skipped = 0
  let failed = 0

  for (const post of posts) {
    const result = await generateImageForPost(post)
    
    if (result) {
      if (fs.existsSync(path.join(IMAGES_DIR, `${post.slug}.webp`))) {
        // Check if it was just created or already existed
        const stats = fs.statSync(path.join(IMAGES_DIR, `${post.slug}.webp`))
        const isNew = (Date.now() - stats.mtimeMs) < 60000 // Created in last minute
        if (isNew) {
          generated++
        } else {
          skipped++
        }
      }
    } else {
      failed++
    }

    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('\n📊 Summary:')
  console.log(`   ✅ Generated: ${generated}`)
  console.log(`   ⏭️  Skipped (existing): ${skipped}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log('\n🎉 Done!')
}

main().catch(console.error)
