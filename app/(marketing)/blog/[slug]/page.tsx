import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug, getPostBySlugWithImage, getRelatedPosts } from '@/lib/blog'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post) {
    return { title: 'Post Not Found' }
  }
  
  return {
    title: `${post.title} | GeoSpark Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    authors: [{ name: 'GeoSpark Team' }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: ['GeoSpark'],
      tags: post.keywords,
      url: `https://geospark.app/blog/${slug}`,
      images: post.image ? [`https://geospark.app${post.image}`] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.image ? [`https://geospark.app${post.image}`] : undefined,
    },
    alternates: {
      canonical: `https://geospark.app/blog/${slug}`,
    },
  }
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

// Add internal links to content
function addInternalLinks(content: string): string {
  const linkMap: Record<string, string> = {
    'Google Business Profile': '/blog/the_ultimate_guide_to_optimizing_your_google_business_profile',
    'Google Maps': '/blog/how_local_businesses_can_dominate_google_maps_in_2024',
    'local SEO': '/blog/a_step_by_step_local_seo_checklist_for_businesses',
    'local citations': '/blog/why_your_small_business_needs_local_citations',
    'customer reviews': '/blog/how_to_get_5_star_reviews_and_boost_your_local_reputation_today',
    'email marketing': '/blog/simple_email_marketing_strategies_for_local_businesses_that_convert',
    'AI content': '/blog/ai_for_busy_business_owners_crafting_content_in_minutes_not_hours',
    'content strategy': '/blog/content_strategy_simplified_building_a_6_month_plan_with_ai',
    'social media': '/blog/social_media_gold_auto_generate_engaging_posts_with_ai',
  }
  
  let processed = content
  for (const [term, url] of Object.entries(linkMap)) {
    // Only link first occurrence to avoid over-linking
    const regex = new RegExp(`(?<!\\[)\\b(${term})\\b(?!\\])`, 'i')
    processed = processed.replace(regex, `[$1](${url})`)
  }
  
  return processed
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlugWithImage(slug)
  
  if (!post) {
    notFound()
  }
  
  const relatedPosts = getRelatedPosts(post, 3)
  const processedContent = addInternalLinks(post.content)
  
  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image ? `https://geospark.app${post.image}` : 'https://geospark.app/logo-geospark.png',
    author: {
      '@type': 'Organization',
      name: 'GeoSpark',
      url: 'https://geospark.app'
    },
    publisher: {
      '@type': 'Organization',
      name: 'GeoSpark',
      logo: {
        '@type': 'ImageObject',
        url: 'https://geospark.app/logo-geospark.png'
      }
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://geospark.app/blog/${slug}`
    },
    keywords: post.keywords.join(', '),
    articleSection: post.category,
    wordCount: post.content.split(/\s+/).length,
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <article className="min-h-screen bg-white">
        {/* Hero Image - Clean, no text overlay */}
        {post.image && (
          <div className="w-full h-64 md:h-80 overflow-hidden">
            <img 
              src={post.image} 
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Article Header - Below image */}
        <header className="bg-white py-10 px-4 border-b border-gray-100">
          <div className="container mx-auto max-w-3xl">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 text-sm mb-6 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
            
            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full mb-4">
              {post.category}
            </span>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mt-6 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  GS
                </div>
                <span>GeoSpark Team</span>
              </div>
              <span>•</span>
              <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <div className="prose prose-lg prose-gray max-w-none 
            prose-headings:font-bold prose-headings:text-gray-900 
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-2
            prose-h3:text-xl prose-h3:mt-8
            prose-p:text-gray-600 prose-p:leading-relaxed
            prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900
            prose-ul:my-4 prose-li:text-gray-600
            prose-blockquote:border-l-teal-500 prose-blockquote:bg-teal-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
          ">
            <ReactMarkdown>{processedContent}</ReactMarkdown>
          </div>
          
          {/* Keywords/Tags */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {post.keywords.map(keyword => (
                <span 
                  key={keyword}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          
          {/* CTA Box */}
          <div className="mt-12 bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Put These Tips Into Action with GeoSpark
            </h3>
            <p className="text-gray-600 mb-6">
              Create SEO-optimized content for 6 platforms in under 2 minutes. No design skills needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup" 
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
              <Link 
                href="/demo" 
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:border-teal-500 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Try Live Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 py-12">
            <div className="container mx-auto max-w-5xl px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="group">
                    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all h-full">
                      <div className="h-24 bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                        <span className="text-3xl opacity-80">
                          {relatedPost.category === 'Local SEO' ? '📍' : 
                           relatedPost.category === 'Marketing' ? '📣' :
                           relatedPost.category === 'AI & Content' ? '🤖' : '📈'}
                        </span>
                      </div>
                      <div className="p-4">
                        <span className="text-xs font-semibold text-teal-600 uppercase">{relatedPost.category}</span>
                        <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-teal-600 transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-500 text-sm mt-2">{relatedPost.readingTime} min read</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  )
}
