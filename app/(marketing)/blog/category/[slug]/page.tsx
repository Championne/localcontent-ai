import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPosts, getCategories } from '@/lib/blog'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

// Map slug back to category name
function slugToCategory(slug: string): string | null {
  const categories = getCategories()
  const decoded = decodeURIComponent(slug).replace(/-/g, ' ')
  
  // Find matching category (case-insensitive)
  return categories.find(
    cat => cat.toLowerCase() === decoded.toLowerCase()
  ) || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = slugToCategory(params.slug)
  
  if (!category) {
    return { title: 'Category Not Found' }
  }

  return {
    title: `${category} Articles - GeoSpark Blog`,
    description: `Read our latest ${category.toLowerCase()} articles and guides for local businesses. Expert tips to help grow your business.`,
  }
}

export async function generateStaticParams() {
  const categories = getCategories()
  return categories.map(category => ({
    slug: category.toLowerCase().replace(/ /g, '-')
  }))
}

export default function CategoryPage({ params }: Props) {
  const category = slugToCategory(params.slug)
  
  if (!category) {
    notFound()
  }

  const allPosts = getAllPosts()
  const posts = allPosts.filter(p => p.category === category)
  const categories = getCategories()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Link href="/blog" className="text-teal-400 hover:text-teal-300 font-semibold text-sm uppercase tracking-wide">
            ← Back to Blog
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
            {category}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {posts.length} article{posts.length !== 1 ? 's' : ''} to help grow your local business
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-3">
          <Link 
            href="/blog"
            className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
          >
            All Posts
          </Link>
          {categories.map(cat => (
            <Link 
              key={cat}
              href={`/blog/category/${encodeURIComponent(cat.toLowerCase().replace(/ /g, '-'))}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                cat === category 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 pb-16">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No articles found in this category yet.</p>
            <Link href="/blog" className="text-teal-600 hover:text-teal-700 mt-4 inline-block">
              View all articles
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
                  <div className="h-44 overflow-hidden">
                    {post.image ? (
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                        <span className="text-5xl opacity-80">
                          {category === 'Local SEO' ? '📍' : 
                           category === 'Marketing' ? '📣' :
                           category === 'AI & Content' ? '🤖' : '📈'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">{post.category}</span>
                    <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-teal-600 transition-colors line-clamp-2 text-lg">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-2 flex-1 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
                      <span>{post.readingTime} min read</span>
                      <span>•</span>
                      <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Put These Tips Into Action?
          </h2>
          <p className="text-teal-100 mb-6 max-w-xl mx-auto">
            GeoSpark helps you create SEO-optimized content for 6 platforms in under 2 minutes.
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            Start Free Trial
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
