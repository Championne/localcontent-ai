import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const TEMPLATE_LABELS: Record<string, string> = {
  'blog-post': 'Blog Post',
  'social-pack': 'Social Media Pack',
  'social-post': 'Social Media',
  'gmb-post': 'Google Business',
  'email': 'Email',
}

function isPermanentUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false
  return url.includes('supabase.co/storage') || url.includes('supabase.com/storage')
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  // Fetch real stats
  const { count: contentCount } = await supabase
    .from('content')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user?.id ?? '')

  const { count: imageCount } = await supabase
    .from('generated_images')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user?.id ?? '')

  // Fetch recent content (up to 5)
  const { data: recentContent } = await supabase
    .from('content')
    .select('id, title, template, status, created_at, metadata, image_url')
    .eq('user_id', user?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentItems = recentContent || []

  // For items without permanent image URLs, look up generated_images
  const idsNeedingImage = recentItems
    .filter((c) => {
      const metaUrl = (c.metadata as { image_url?: string } | undefined)?.image_url
      const url = metaUrl || c.image_url
      return !url || !isPermanentUrl(url)
    })
    .map((c) => c.id)

  let imageMap = new Map<string, string>()
  if (idsNeedingImage.length > 0) {
    const { data: imgs } = await supabase
      .from('generated_images')
      .select('content_id, image_url')
      .eq('user_id', user?.id ?? '')
      .in('content_id', idsNeedingImage)
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false })
    for (const row of imgs || []) {
      if (row.content_id && !imageMap.has(row.content_id) && isPermanentUrl(row.image_url)) {
        imageMap.set(row.content_id, row.image_url)
      }
    }
    // fallback: any URL
    for (const row of imgs || []) {
      if (row.content_id && !imageMap.has(row.content_id) && row.image_url) {
        imageMap.set(row.content_id, row.image_url)
      }
    }
  }

  // Resolve thumbnail for each item
  const resolvedItems = recentItems.map((c) => {
    const metaUrl = (c.metadata as { image_url?: string } | undefined)?.image_url
    const currentUrl = metaUrl || c.image_url
    const betterUrl = imageMap.get(c.id)
    const thumbnailUrl = (currentUrl && isPermanentUrl(currentUrl)) ? currentUrl : (betterUrl || currentUrl || null)
    return { ...c, thumbnailUrl }
  })

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome back, {userName}!
        </h1>
        <p className="text-gray-500">Ready to create something amazing for your business?</p>
      </div>

      {/* Primary CTA Card */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Create Your Next Piece of Content</h2>
            <p className="text-teal-100">From hours to minutes - generate locally-optimized content with AI</p>
          </div>
          <Link 
            href="/dashboard/content"
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-orange-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create a spark
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{contentCount ?? 0}</p>
          <p className="text-sm text-gray-500">Content Created</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{imageCount ?? 0}</p>
          <p className="text-sm text-gray-500">Images Generated</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">-</p>
          <p className="text-sm text-gray-500">Engagement</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">Free</p>
          <p className="text-sm text-gray-500">Current Plan</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link 
            href="/dashboard/content" 
            className="group bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-teal-200 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-teal-200 transition-colors">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Create Blog Post</h3>
            <p className="text-sm text-gray-500">AI-powered local SEO content</p>
          </Link>
          <Link 
            href="/dashboard/content" 
            className="group bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-teal-200 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Social Media Post</h3>
            <p className="text-sm text-gray-500">Engaging posts for your audience</p>
          </Link>
        </div>
      </div>

      {/* Recent Content */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Content</h2>
          <Link href="/dashboard/library" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            View all
          </Link>
        </div>

        {resolvedItems.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            {resolvedItems.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/content?edit=${item.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Thumbnail */}
                {item.thumbnailUrl ? (
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title || 'Content'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {TEMPLATE_LABELS[item.template] || item.template} · {formatDate(item.created_at)}
                  </p>
                </div>
                {/* Status badge */}
                <span className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                  item.status === 'published' ? 'bg-green-100 text-green-700'
                  : item.status === 'scheduled' ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.status}
                </span>
                {/* Arrow */}
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
            {/* Footer link */}
            <Link
              href="/dashboard/library"
              className="flex items-center justify-center gap-1.5 py-3 text-sm text-teal-600 hover:text-teal-700 font-medium hover:bg-teal-50/50 transition-colors"
            >
              View all in Spark Library
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Create your first piece of AI-generated, locally-optimized content in minutes.
            </p>
            <Link 
              href="/dashboard/content"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create a spark
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
