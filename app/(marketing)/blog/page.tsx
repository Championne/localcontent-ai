import Link from 'next/link'
import { getAllPostsWithImages, getCategories } from '@/lib/blog'
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

export default async function BlogPage() {
  const posts = await getAllPostsWithImages()
  const categories = getCategories()
  
  // Featured posts (first 3)
  const featuredPosts = posts.slice(0, 3)
  const remainingPosts = posts.slice(3)
  
  return (
    <div className="min-h-screen bg-amber-50/30">
      {/* Hero - Warm & Welcoming */}
      <section className="bg-gradient-to-br from-amber-600 via-orange-500 to-rose-500 py-16 px-4 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto max-w-4xl text-center relative">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white font-medium text-sm px-4 py-1.5 rounded-full mb-4">
            Free Tips & Guides
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
            Real Advice for Real Business Owners
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            No fancy jargon, just practical tips to get more customers through your door. 
            Written by people who get what it&apos;s like to run a local business.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-3">
          <Link 
            href="/blog"
            className="px-5 py-2.5 rounded-full bg-orange-500 text-white text-sm font-medium shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-200 transition-all"
          >
            All Posts
          </Link>
          {categories.map(category => (
            <Link 
              key={category}
              href={`/blog/category/${encodeURIComponent(category.toLowerCase().replace(/ /g, '-'))}`}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-orange-50 text-gray-700 text-sm font-medium transition-colors border border-orange-200 hover:border-orange-300"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Posts - 3 Equal Cards */}
      {featuredPosts.length > 0 && (
        <section className="container mx-auto px-4 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🔥</span>
            <h2 className="text-2xl font-bold text-gray-800">Popular This Week</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`}
                className="group"
              >
                <article className="bg-white rounded-2xl shadow-md shadow-orange-100/50 overflow-hidden hover:shadow-xl hover:shadow-orange-100 transition-all h-full flex flex-col border border-orange-100">
                  <div className="h-48 overflow-hidden">
                    {post.image ? (
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                        <span className="text-6xl opacity-80">
                          {post.category === 'Local SEO' ? '📍' : 
                           post.category === 'Marketing' ? '📣' :
                           post.category === 'AI & Content' ? '🤖' : '📈'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">{post.category}</span>
                    <h3 className="font-bold text-gray-800 mt-2 group-hover:text-orange-600 transition-colors text-lg line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-2 flex-1 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {post.readingTime} min
                      </span>
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
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📚</span>
          <h2 className="text-2xl font-bold text-gray-800">More Helpful Guides</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {remainingPosts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="bg-white rounded-xl shadow-sm shadow-orange-100/50 overflow-hidden hover:shadow-md hover:shadow-orange-100 transition-all h-full flex flex-col border border-orange-100/50">
                <div className="h-40 overflow-hidden">
                  {post.image ? (
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                      <span className="text-4xl opacity-70">
                        {post.category === 'Local SEO' ? '📍' : 
                         post.category === 'Marketing' ? '📣' :
                         post.category === 'AI & Content' ? '🤖' : '📈'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">{post.category}</span>
                  <h3 className="font-semibold text-gray-800 mt-1 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-2 flex-1 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {post.readingTime} min
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA - Friendly & Personal */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 py-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Tired of Spending Hours on Marketing?
          </h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto text-lg">
            GeoSpark creates a week&apos;s worth of content in 2 minutes. More time for what matters - your customers and your family.
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-orange-600 px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30"
          >
            Try It Free - No Credit Card
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-white/70 text-sm mt-4">Join 500+ local business owners</p>
        </div>
      </section>
    </div>
  )
}
