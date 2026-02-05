import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  publishedAt: string
  readingTime: number
  keywords: string[]
  image: string | null
}

// Category mapping based on article content
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Local SEO': ['seo', 'google maps', 'google business', 'local search', 'citations', 'rankings', 'visibility'],
  'Marketing': ['marketing', 'promotion', 'campaign', 'email', 'reviews', 'loyalty', 'events'],
  'AI & Content': ['ai', 'content', 'blog', 'social media', 'generate', 'automation'],
  'Business Growth': ['growth', 'scale', 'e-commerce', 'digital', 'customer journey', 'automation', 'data']
}

function detectCategory(title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase()
  
  let bestMatch = 'Business Growth'
  let maxScore = 0
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => text.includes(kw)).length
    if (score > maxScore) {
      maxScore = score
      bestMatch = category
    }
  }
  
  return bestMatch
}

function extractKeywords(title: string, content: string): string[] {
  const keywords: string[] = []
  const text = (title + ' ' + content).toLowerCase()
  
  const importantTerms = [
    'local seo', 'google maps', 'google business profile', 'small business',
    'local business', 'seo', 'marketing', 'ai content', 'content creation',
    'social media', 'customer reviews', 'local search', 'digital marketing',
    'foot traffic', 'online presence', 'local marketing', 'geospark'
  ]
  
  for (const term of importantTerms) {
    if (text.includes(term)) {
      keywords.push(term)
    }
  }
  
  return keywords.slice(0, 10)
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

function extractExcerpt(content: string): string {
  // Remove markdown headers and get first paragraph
  const cleaned = content
    .replace(/^#.*$/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .trim()
  
  const firstParagraph = cleaned.split('\n\n')[0] || cleaned.substring(0, 200)
  return firstParagraph.substring(0, 250).trim() + (firstParagraph.length > 250 ? '...' : '')
}

function extractTitle(content: string, filename: string): string {
  // Try to get title from first H1
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) {
    return h1Match[1].trim()
  }
  
  // Fallback to filename
  return filename
    .replace('.md', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// Check if blog image exists
function getBlogImage(slug: string): string | null {
  const imagePath = path.join(process.cwd(), 'public', 'blog', 'images', `${slug}.webp`)
  if (fs.existsSync(imagePath)) {
    return `/blog/images/${slug}.webp`
  }
  // Also check for jpg/png
  const jpgPath = path.join(process.cwd(), 'public', 'blog', 'images', `${slug}.jpg`)
  if (fs.existsSync(jpgPath)) {
    return `/blog/images/${slug}.jpg`
  }
  const pngPath = path.join(process.cwd(), 'public', 'blog', 'images', `${slug}.png`)
  if (fs.existsSync(pngPath)) {
    return `/blog/images/${slug}.png`
  }
  return null
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return []
  }
  
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') && f !== 'article_manifest.md')
  
  const posts: BlogPost[] = files.map((filename, index) => {
    const filePath = path.join(BLOG_DIR, filename)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    
    // Parse frontmatter if exists, otherwise extract from content
    const { data, content } = matter(fileContent)
    
    const title = data.title || extractTitle(content, filename)
    const slug = filename.replace('.md', '')
    
    // Generate a publish date spread over past months for SEO freshness
    const daysAgo = index * 2 // Spread articles over time
    const publishDate = new Date()
    publishDate.setDate(publishDate.getDate() - daysAgo)
    
    return {
      slug,
      title,
      excerpt: data.excerpt || extractExcerpt(content),
      content,
      category: data.category || detectCategory(title, content),
      publishedAt: data.publishedAt || publishDate.toISOString().split('T')[0],
      readingTime: calculateReadingTime(content),
      keywords: data.keywords || extractKeywords(title, content),
      image: data.image || getBlogImage(slug)
    }
  })
  
  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts()
  return posts.find(p => p.slug === slug) || null
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter(p => p.category === category)
}

export function getRelatedPosts(post: BlogPost, limit: number = 3): BlogPost[] {
  const allPosts = getAllPosts().filter(p => p.slug !== post.slug)
  
  // Score posts by keyword overlap
  const scored = allPosts.map(p => {
    const overlap = post.keywords.filter(k => p.keywords.includes(k)).length
    const sameCategory = p.category === post.category ? 2 : 0
    return { post: p, score: overlap + sameCategory }
  })
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.post)
}

export function getCategories(): string[] {
  const posts = getAllPosts()
  const categories = new Set(posts.map(p => p.category))
  return Array.from(categories)
}

export function searchPosts(query: string): BlogPost[] {
  const posts = getAllPosts()
  const lowerQuery = query.toLowerCase()
  
  return posts.filter(p => 
    p.title.toLowerCase().includes(lowerQuery) ||
    p.excerpt.toLowerCase().includes(lowerQuery) ||
    p.keywords.some(k => k.includes(lowerQuery))
  )
}

// Fetch blog images from Supabase (for production use with Vercel Blob)
export async function getBlogImagesFromDB(): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>()
  
  try {
    // Use fetch to avoid importing supabase client in this shared module
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/blog_images?select=slug,image_url`,
      {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
        next: { revalidate: 60 } // Cache for 60 seconds
      }
    )
    
    if (response.ok) {
      const images = await response.json()
      for (const img of images) {
        imageMap.set(img.slug, img.image_url)
      }
    }
  } catch (error) {
    console.log('Could not fetch blog images from DB:', error)
  }
  
  return imageMap
}

// Async version of getAllPosts that includes Supabase/Blob images
export async function getAllPostsWithImages(): Promise<BlogPost[]> {
  const posts = getAllPosts()
  const dbImages = await getBlogImagesFromDB()
  
  // Override images with DB values where available
  return posts.map(post => ({
    ...post,
    image: dbImages.get(post.slug) || post.image
  }))
}

// Async version of getPostBySlug that includes Supabase/Blob images  
export async function getPostBySlugWithImage(slug: string): Promise<BlogPost | null> {
  const post = getPostBySlug(slug)
  if (!post) return null
  
  const dbImages = await getBlogImagesFromDB()
  const dbImage = dbImages.get(slug)
  
  return {
    ...post,
    image: dbImage || post.image
  }
}
