import { NextRequest, NextResponse } from 'next/server'
import { getPostBySlug } from '@/lib/blog'

// GET - Fetch single blog post for preview
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  
  const post = getPostBySlug(slug)
  
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
  
  return NextResponse.json({
    success: true,
    post: {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      publishedAt: post.publishedAt,
      readingTime: post.readingTime,
      keywords: post.keywords,
      image: post.image
    }
  })
}
