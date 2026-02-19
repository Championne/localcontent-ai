import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TEMPLATE_LABELS: Record<string, string> = {
  'blog-post': 'Blog Post',
  'social-pack': 'Social Pack',
  'social-post': 'Social',
  'gmb-post': 'Google Business',
  'email': 'Email',
}

const TEMPLATE_ICONS: Record<string, string> = {
  'blog-post': '✍️',
  'social-pack': '📱',
  'social-post': '📱',
  'gmb-post': '📍',
  'email': '✉️',
}

function isPermanentUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false
  return url.includes('supabase.co/storage') || url.includes('supabase.com/storage')
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDailySpark(contentCount: number, dayOfWeek: number): {
  headline: string
  body: string
  cta: string
  href: string
  type: 'content' | 'brand' | 'image'
} {
  if (contentCount === 0) {
    return {
      headline: 'Set up your brand identity first',
      body: 'Your first post will be dramatically better with your logo, colours and tone locked in. It only takes 3 minutes.',
      cta: 'Complete brand setup →',
      href: '/dashboard/branding',
      type: 'brand',
    }
  }
  if (dayOfWeek <= 2) {
    return {
      headline: 'Great day to publish a blog post',
      body: 'Monday and Tuesday posts get 30% more organic reach. A local SEO blog post can rank for months.',
      cta: 'Write a blog post →',
      href: '/dashboard/content',
      type: 'content',
    }
  }
  if (dayOfWeek <= 4) {
    return {
      headline: 'Mid-week social posts perform best',
      body: 'Wednesday and Thursday are peak engagement days. Create a social pack to stay visible this week.',
      cta: 'Create social content →',
      href: '/dashboard/content',
      type: 'content',
    }
  }
  if (dayOfWeek === 5) {
    return {
      headline: 'Post to Google Business before the weekend',
      body: 'Weekend searches spike. A Friday GMB post gets seen by people actively looking for local services right now.',
      cta: 'Create a GMB post →',
      href: '/dashboard/content',
      type: 'content',
    }
  }
  return {
    headline: 'Build your brand image library',
    body: 'Great visuals make every post more credible. Add a few brand images to your library while things are quieter.',
    cta: 'Generate brand images →',
    href: '/dashboard/image-library',
    type: 'image',
  }
}

function toAgencyValue(count: number): string {
  const val = count * 25
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`
  return `$${val}`
}

const QUICK_LAUNCHES = [
  { href: '/dashboard/content', emoji: '✍️', label: 'Blog Post', sub: 'Local SEO · long-form' },
  { href: '/dashboard/content', emoji: '📱', label: 'Social Pack', sub: 'Instagram · Facebook' },
  { href: '/dashboard/content', emoji: '📍', label: 'GMB Post', sub: 'Google Business Profile' },
  { href: '/dashboard/content', emoji: '✉️', label: 'Email', sub: 'Newsletter · promo' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  const [
    { count: contentCount },
    { count: imageCount },
    { data: recentContent },
  ] = await Promise.all([
    supabase.from('content').select('id', { count: 'exact', head: true }).eq('user_id', user?.id ?? ''),
    supabase.from('generated_images').select('id', { count: 'exact', head: true }).eq('user_id', user?.id ?? ''),
    supabase.from('content').select('id, title, template, status, created_at, metadata, image_url').eq('user_id', user?.id ?? '').order('created_at', { ascending: false }).limit(4),
  ])

  const total = contentCount ?? 0
  const images = imageCount ?? 0
  const recentItems = recentContent || []

  const idsNeedingImage = recentItems
    .filter((c) => {
      const metaUrl = (c.metadata as { image_url?: string } | undefined)?.image_url
      return !isPermanentUrl(metaUrl || c.image_url)
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
      if (row.content_id && row.image_url && !imageMap.has(row.content_id)) {
        imageMap.set(row.content_id, row.image_url)
      }
    }
  }

  const resolvedItems = recentItems.map((c) => {
    const metaUrl = (c.metadata as { image_url?: string } | undefined)?.image_url
    const currentUrl = metaUrl || c.image_url
    const thumbnailUrl = isPermanentUrl(currentUrl) ? currentUrl : (imageMap.get(c.id) || currentUrl || null)
    return { ...c, thumbnailUrl }
  })

  const greeting = getTimeGreeting()
  const dayOfWeek = new Date().getDay()
  const spark = getDailySpark(total, dayOfWeek)

  const milestone = Math.max(10, Math.ceil(total / 10) * 10)
  const momentumPct = Math.round((total / milestone) * 100)
  const postsToMilestone = milestone - total

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Hero greeting ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--brand-primary)' }}>
            {greeting}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {firstName}, let&apos;s spark something.
          </h1>
          {total > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              You&apos;ve created <span className="font-semibold text-gray-700">{total} piece{total !== 1 ? 's' : ''}</span> of content — worth <span className="font-semibold" style={{ color: 'var(--brand-primary)' }}>{toAgencyValue(total)}</span> at agency rates.
            </p>
          )}
        </div>
        <Link
          href="/dashboard/content"
          className="hidden sm:inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create a Spark
        </Link>
      </div>

      {/* ── Today's Spark ─────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl p-5 overflow-hidden border"
        style={{
          background: 'linear-gradient(135deg, var(--brand-primary-10) 0%, var(--brand-primary-20) 100%)',
          borderColor: 'var(--brand-primary-20)',
        }}
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none" aria-hidden style={{ fontSize: 96, lineHeight: 1 }}>⚡</div>
        <div className="flex items-start gap-3 relative">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--brand-primary)' }}>Today&apos;s Spark</p>
            <h2 className="font-semibold text-gray-900 text-base leading-snug mb-1">{spark.headline}</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{spark.body}</p>
            <Link href={spark.href} className="inline-flex items-center text-sm font-semibold gap-1.5 transition-opacity hover:opacity-80" style={{ color: 'var(--brand-primary)' }}>
              {spark.cta}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
          <span className="text-2xl font-bold text-gray-900">{total}</span>
          <span className="text-xs text-gray-500">Sparks created</span>
          {total > 0 && <span className="text-[11px] font-medium" style={{ color: 'var(--brand-primary)' }}>{toAgencyValue(total)} agency value</span>}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
          <span className="text-2xl font-bold text-gray-900">{images}</span>
          <span className="text-xs text-gray-500">Brand images</span>
          {images > 0 && <span className="text-[11px] text-gray-400">in your library</span>}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
          <span className="text-2xl font-bold text-gray-900">{momentumPct}%</span>
          <span className="text-xs text-gray-500">To next milestone</span>
          <div className="h-1.5 rounded-full bg-gray-100 mt-1 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${momentumPct}%`, backgroundColor: 'var(--brand-primary)' }} />
          </div>
          {postsToMilestone > 0 && <span className="text-[11px] text-gray-400">{postsToMilestone} more to unlock</span>}
        </div>
        <div className="rounded-xl border shadow-sm p-4 flex flex-col gap-1" style={{ backgroundColor: 'var(--brand-primary-10)', borderColor: 'var(--brand-primary-20)' }}>
          <span className="text-2xl">🏆</span>
          <span className="text-xs font-medium text-gray-700">SparkFox</span>
          <span className="text-[11px] text-gray-500">{total === 0 ? 'Create your first Spark!' : `${Math.min(100, Math.round((total / 25) * 100))}% trained`}</span>
        </div>
      </div>

      {/* ── Quick Launches ─────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Launch a new Spark</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LAUNCHES.map((item) => (
            <Link key={item.label} href={item.href} className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 flex flex-col gap-2">
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </div>
              <div className="mt-auto flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--brand-primary)' }}>Start →</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Sparks ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Sparks</h2>
          <Link href="/dashboard/library" className="text-xs font-semibold transition-colors" style={{ color: 'var(--brand-primary)' }}>View library →</Link>
        </div>

        {resolvedItems.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {resolvedItems.map((item) => (
              <Link key={item.id} href={`/dashboard/content?edit=${item.id}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors group">
                {item.thumbnailUrl ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-xl" style={{ backgroundColor: 'var(--brand-primary-10)' }}>
                    {TEMPLATE_ICONS[item.template] || '📄'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{TEMPLATE_LABELS[item.template] || item.template} · {formatDate(item.created_at)}</p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${item.status === 'published' ? 'bg-emerald-50 text-emerald-700' : item.status === 'scheduled' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{item.status}</span>
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
            <Link href="/dashboard/library" className="flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors" style={{ color: 'var(--brand-primary)' }}>
              Browse all in Spark Library →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl" style={{ backgroundColor: 'var(--brand-primary-10)' }}>⚡</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">Your first Spark awaits</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-5 leading-relaxed">Create locally-optimised content in minutes — blog posts, social packs, GMB updates, and more.</p>
            <Link href="/dashboard/content" className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200" style={{ backgroundColor: 'var(--brand-primary)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create your first Spark
            </Link>
          </div>
        )}
      </div>

      {/* ── Brand nudge (new users only) ─────────────────────────────── */}
      {total === 0 && (
        <Link href="/dashboard/branding" className="flex items-center gap-4 bg-white rounded-2xl border border-dashed p-4 hover:shadow-md transition-all" style={{ borderColor: 'var(--brand-primary-20)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ backgroundColor: 'var(--brand-primary-10)' }}>🎨</div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Set up your brand identity</p>
            <p className="text-xs text-gray-500 mt-0.5">Logo, colours and tone — makes every post unmistakably yours</p>
          </div>
          <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      )}

    </div>
  )
}
