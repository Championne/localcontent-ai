'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface GeneratedImage {
  id: string
  image_url: string
  topic: string | null
  style: string | null
  content_type: string | null
  rating: number | null
  source?: 'ai' | 'stock' | 'composite' | null
  created_at: string
  content_id?: string | null
}

interface GeneratedText {
  id: string
  template: string
  topic: string | null
  content_preview: string | null
  rating: number | null
  created_at: string
}

type GenerationItem =
  | { type: 'image'; created_at: string; data: GeneratedImage }
  | { type: 'text'; created_at: string; data: GeneratedText }

const RATING_REMINDER_KEY = 'quality-rating-reminder-dismissed'
const TEMPLATE_LABEL: Record<string, string> = {
  'social-pack': 'Social pack',
  'blog-post': 'Blog post',
  'gmb-post': 'Google Business',
  'email': 'Email',
}

type Filter = 'all' | 'images' | 'copy'

export default function GenerationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter') as Filter | null
  const [filter, setFilter] = useState<Filter>(
    filterParam === 'images' || filterParam === 'copy' ? filterParam : 'all'
  )

  // Sync filter from URL (e.g. redirect from /dashboard/pictures or /dashboard/text-library)
  useEffect(() => {
    if (filterParam === 'images' || filterParam === 'copy') setFilter(filterParam)
  }, [filterParam])
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [texts, setTexts] = useState<GeneratedText[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReminder, setShowReminder] = useState(false)
  const [unratedCount, setUnratedCount] = useState(0)

  useEffect(() => {
    fetchAll()
    fetchUnratedCount()
  }, [])

  useEffect(() => {
    if (unratedCount > 0 && typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(RATING_REMINDER_KEY)) {
      setShowReminder(true)
    }
  }, [unratedCount])

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [imgRes, textRes] = await Promise.all([
        fetch('/api/generated-images?sort=unrated_first&limit=100'),
        fetch('/api/generated-texts?sort=unrated_first&limit=100'),
      ])
      const imgData = await imgRes.json()
      const textData = await textRes.json()
      if (!imgRes.ok) throw new Error(imgData.error || 'Failed to fetch images')
      if (!textRes.ok) throw new Error(textData.error || 'Failed to fetch copy')
      setImages(imgData.images || [])
      setTexts(textData.texts || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnratedCount = async () => {
    try {
      const res = await fetch('/api/quality/counts')
      const data = await res.json()
      if (res.ok) setUnratedCount((data.unratedImages ?? 0) + (data.unratedTexts ?? 0))
    } catch (_) {}
  }

  const dismissReminder = () => {
    setShowReminder(false)
    try {
      sessionStorage.setItem(RATING_REMINDER_KEY, '1')
    } catch (_) {}
  }

  // Merge and sort by created_at (newest first) for "All" view
  const mergedItems: GenerationItem[] = [
    ...images.map((data) => ({ type: 'image' as const, created_at: data.created_at, data })),
    ...texts.map((data) => ({ type: 'text' as const, created_at: data.created_at, data })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const filteredItems =
    filter === 'all'
      ? mergedItems
      : filter === 'images'
        ? mergedItems.filter((i) => i.type === 'image')
        : mergedItems.filter((i) => i.type === 'text')

  const hasImages = images.length > 0
  const hasTexts = texts.length > 0
  const isEmpty = !hasImages && !hasTexts

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-64 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Generations</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            {(['all', 'images', 'copy'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f === 'all' ? 'All' : f === 'images' ? 'Images' : 'Copy'}
              </button>
            ))}
          </div>
          <Link
            href="/dashboard/content"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm font-medium whitespace-nowrap"
          >
            Create New
          </Link>
        </div>
      </div>

      {showReminder && unratedCount > 0 && (
        <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between gap-4">
          <p className="text-sm text-teal-800">
            Rate a few to help us improve what we generate. Your feedback shapes the engine.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="text-sm font-medium text-teal-700 hover:underline"
            >
              Show unrated
            </button>
            <button type="button" onClick={dismissReminder} className="text-sm text-teal-600 hover:text-teal-800">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>
      )}

      {isEmpty ? (
        <div className="border rounded-lg p-12 text-center bg-card">
          <p className="text-muted-foreground">No generations yet. Create content to see images and copy here.</p>
          <Link href="/dashboard/content" className="mt-4 inline-block text-primary hover:underline">
            Create your first spark
          </Link>
        </div>
      ) : filter === 'all' ? (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            if (item.type === 'image') {
              const img = item.data
              const isFromContent = typeof img.id === 'string' && img.id.startsWith('content-')
              const href =
                isFromContent && img.content_id
                  ? `/dashboard/content?edit=${img.content_id}`
                  : `/dashboard/pictures/${img.id}`
              return (
                <button
                  key={`img-${img.id}`}
                  type="button"
                  onClick={() => router.push(href)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-card hover:border-teal-300 hover:bg-gray-50/50 transition-all text-left"
                >
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={img.image_url}
                      alt={img.topic || 'Image'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">Image</span>
                    <p className="font-medium truncate">{img.topic || 'Untitled'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(img.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {!isFromContent && (img.source === 'ai' || img.source == null) &&
                      (img.rating != null ? (
                        <span className="text-muted-foreground">{img.rating >= 3 ? '👍' : '👎'}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">Rate</span>
                      ))}
                  </div>
                </button>
              )
            }
            const t = item.data
            return (
              <button
                key={`text-${t.id}`}
                type="button"
                onClick={() => router.push(`/dashboard/text-library/${t.id}`)}
                className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-card hover:border-teal-300 hover:bg-gray-50/50 transition-all text-left"
              >
                <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-400">📝</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">Copy</span>
                  <p className="text-sm text-gray-500">
                    {TEMPLATE_LABEL[t.template] || t.template} • {new Date(t.created_at).toLocaleDateString()}
                  </p>
                  <p className="font-medium truncate">{t.topic || 'Untitled'}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{t.content_preview || '—'}</p>
                </div>
                <div className="flex-shrink-0">
                  {t.rating != null ? (
                    <span className="text-muted-foreground">{t.rating >= 3 ? '👍' : '👎'}</span>
                  ) : (
                    <span className="text-gray-400 text-sm">Rate</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      ) : filter === 'images' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(filteredItems as GenerationItem[]).map((item) => {
            if (item.type !== 'image') return null
            const img = item.data
            const isFromContent = typeof img.id === 'string' && img.id.startsWith('content-')
            const href =
              isFromContent && img.content_id
                ? `/dashboard/content?edit=${img.content_id}`
                : `/dashboard/pictures/${img.id}`
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => router.push(href)}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 hover:border-teal-400 hover:ring-2 hover:ring-teal-200 transition-all text-left"
              >
                <img
                  src={img.image_url}
                  alt={img.topic || 'Generated image'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-xs flex items-center justify-between">
                  <span className="truncate">{img.topic || 'Untitled'}</span>
                  {!isFromContent && (img.source === 'ai' || img.source == null) &&
                    (img.rating != null ? (
                      <span className="text-white/90">{img.rating >= 3 ? '👍' : '👎'}</span>
                    ) : (
                      <span className="text-white/70">Rate</span>
                    ))}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="border rounded-lg divide-y bg-card">
          {(filteredItems as GenerationItem[]).map((item) => {
            if (item.type !== 'text') return null
            const t = item.data
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => router.push(`/dashboard/text-library/${t.id}`)}
                className="w-full p-4 flex items-start gap-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500">
                    {TEMPLATE_LABEL[t.template] || t.template} • {new Date(t.created_at).toLocaleDateString()}
                  </p>
                  <p className="font-medium truncate">{t.topic || 'Untitled'}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{t.content_preview || '—'}</p>
                </div>
                <div className="flex-shrink-0">
                  {t.rating != null ? (
                    <span className="text-muted-foreground">{t.rating >= 3 ? '👍' : '👎'}</span>
                  ) : (
                    <span className="text-gray-400 text-sm">Rate</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
