import Link from 'next/link'
import { getAllPosts, getCategories } from '@/lib/blog'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Local SEO & Marketing Tips for Small Businesses | GeoSpark',
  description: 'Expert tips on local SEO, Google Maps optimization, AI content creation, and marketing strategies to help your small business grow. Free guides and actionable advice.',
  keywords: ['local seo blog', 'small business marketing', 'google maps optimization', 'ai content creation', 'local business tips', 'seo guide'],
  openGraph: {
    title: 'GeoSpark Blog - Local Business Marketing & SEO Tips',
    description: 'Expert tips on local SEO, Google Maps optimization, AI content creation, and marketing strategies for small businesses.',
    type: 'website',
    url: 'https://geospark.app/blog',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()
  const categories = getCategories()
  
  // Featured posts (first 3)
  const featuredPosts = posts.slice(0, 3)
  const remainingPosts = posts.slice(3)
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-teal-400 font-semibold text-sm uppercase tracking-wide">GeoSpark Blog</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
            Grow Your Local Business
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Expert tips on local SEO, Google Maps optimization, AI-powered content creation, 
            and proven marketing strategies for small businesses.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-3">
          <Link 
            href="/blog"
            className="px-4 py-2 rounded-full bg-teal-600 text-white text-sm font-medium"
          >
            All Posts
          </Link>
          {categories.map(category => (
            <Link 
              key={category}
              href={`/blog/category/${encodeURIComponent(category.toLowerCase().replace(/ /g, '-'))}`}
              className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="container mx-auto px-4 pb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredPosts.map((post, index) => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`}
                className={`group ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
              >
                <article className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all h-full flex flex-col ${index === 0 ? 'md:flex-row' : ''}`}>
                  <div className={`relative ${index === 0 ? 'md:w-1/2 h-48 md:h-auto' : 'h-44'} overflow-hidden`}>
                    {post.image ? (
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                        <span className="text-6xl opacity-80">
                          {post.category === 'Local SEO' ? '📍' : 
                           post.category === 'Marketing' ? '📣' :
                           post.category === 'AI & Content' ? '🤖' : '📈'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`p-6 flex flex-col flex-1 ${index === 0 ? 'md:w-1/2' : ''}`}>
                    <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">{post.category}</span>
                    <h3 className={`font-bold text-gray-900 mt-2 group-hover:text-teal-600 transition-colors ${index === 0 ? 'text-2xl' : 'text-lg'}`}>
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-2 flex-1 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <span>{post.readingTime} min read</span>
                      <span>•</span>
                      <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {remainingPosts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
                <div className="h-40 overflow-hidden">
                  {post.image ? (
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-4xl opacity-60">
                        {post.category === 'Local SEO' ? '📍' : 
                         post.category === 'Marketing' ? '📣' :
                         post.category === 'AI & Content' ? '🤖' : '📈'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">{post.category}</span>
                  <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-2 flex-1 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span>{post.readingTime} min</span>
                    <span>•</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
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
