'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import RatingStars from '@/components/RatingStars'

interface GeneratedImage {
  id: string
  image_url: string | null
  topic: string | null
  style: string | null
  content_type: string | null
  rating: number | null
  feedback_reasons?: string[] | null
  source?: 'ai' | 'stock' | 'composite' | null
  created_at: string
  content_id?: string | null
}

interface GeneratedText {
  id: string
  template: string
  topic: string | null
  content_preview: string | null
  content_full?: string | null
  content_id?: string | null
  rating: number | null
  created_at: string
}

/** One card = one spark (image + text when both from same content_id) */
interface Spark {
  id: string
  contentId: string | null
  image: GeneratedImage | null
  text: GeneratedText | null
  created_at: string
}

const RATING_REMINDER_KEY = 'quality-rating-reminder-dismissed'
const TEMPLATE_LABEL: Record<string, string> = {
  'social-pack': 'Social pack',
  'blog-post': 'Blog post',
  'gmb-post': 'Google Business',
  'email': 'Email',
}

type ViewFilter = 'all' | 'images' | 'copy'
type ImageSourceFilter = 'all' | 'ai' | 'stock'
type SortBy = 'newest' | 'image_rating' | 'text_rating'

function getTextPreview(text: GeneratedText): string {
  const raw = text.content_preview || text.content_full || ''
  if (!raw || raw === 'null') return '-'
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, { content?: string }>
      const first = parsed.twitter?.content || parsed.facebook?.content || parsed.instagram?.content
      if (first) return first.length > 120 ? first.slice(0, 120) + '…' : first
    } catch {
      // ignore
    }
    return (TEMPLATE_LABEL[text.template] || text.template) + ', multiple platforms'
  }
  return trimmed.length > 120 ? trimmed.slice(0, 120) + '…' : trimmed
}

export default function GenerationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter') as ViewFilter | null
  const [viewFilter, setViewFilter] = useState<ViewFilter>(
    filterParam === 'images' || filterParam === 'copy' ? filterParam : 'all'
  )
  const [imageSourceFilter, setImageSourceFilter] = useState<ImageSourceFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')

  const [images, setImages] = useState<GeneratedImage[]>([])
  const [texts, setTexts] = useState<GeneratedText[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReminder, setShowReminder] = useState(false)
  const [unratedCount, setUnratedCount] = useState(0)
  const [ratingSaving, setRatingSaving] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const markImageError = (id: string) => {
    setImageErrors((prev) => new Set(prev).add(id))
  }

  useEffect(() => {
    if (filterParam === 'images' || filterParam === 'copy') setViewFilter(filterParam)
  }, [filterParam])

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
      // Normalize image_url (API may return snake_case or camelCase)
      const normalizedImages = (imgData.images || []).map((img: Record<string, unknown>) => ({
        ...img,
        image_url: img.image_url ?? img.imageUrl ?? null,
      })) as GeneratedImage[]
      setImages(normalizedImages)
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

  const handleRateImage = async (imageId: string, rating: number, feedbackReasons?: string[]) => {
    if (typeof imageId !== 'string' || imageId.startsWith('content-')) return
    setRatingSaving(`img-${imageId}`)
    try {
      const res = await fetch(`/api/generated-images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback_reasons: feedbackReasons ?? [] }),
      })
      if (res.ok) {
        const data = await res.json()
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, rating: data.image?.rating ?? rating, feedback_reasons: data.image?.feedback_reasons ?? feedbackReasons ?? img.feedback_reasons }
              : img
          )
        )
      }
    } catch (_) {}
    finally {
      setRatingSaving(null)
    }
  }

  const handleRateText = async (textId: string, rating: number) => {
    setRatingSaving(`text-${textId}`)
    try {
      const res = await fetch(`/api/generated-texts/${textId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback_reasons: [] }),
      })
      if (res.ok) {
        const data = await res.json()
        setTexts((prev) =>
          prev.map((t) => (t.id === textId ? { ...t, rating: data.text?.rating ?? rating } : t))
        )
      }
    } catch (_) {}
    finally {
      setRatingSaving(null)
    }
  }

  // One card per image so bad-rated and regenerated images both stay visible; text-only sparks for content with no image
  const sparks = useMemo((): Spark[] => {
    const contentIdsWithImages = new Set(images.map((img) => img.content_id).filter(Boolean) as string[])
    const textByContentId = new Map<string, GeneratedText>()
    for (const t of texts) {
      if (!t.content_id) continue
      const existing = textByContentId.get(t.content_id)
      if (!existing || new Date(t.created_at) > new Date(existing.created_at)) {
        textByContentId.set(t.content_id, t)
      }
    }

    const result: Spark[] = []
    for (const img of images) {
      result.push({
        id: String(img.id),
        contentId: img.content_id ?? null,
        image: img,
        text: img.content_id ? textByContentId.get(img.content_id) ?? null : null,
        created_at: img.created_at,
      })
    }
    for (const t of texts) {
      if (!t.content_id || !contentIdsWithImages.has(t.content_id)) {
        result.push({
          id: `text-${t.id}`,
          contentId: t.content_id ?? null,
          image: null,
          text: t,
          created_at: t.created_at,
        })
      }
    }
    return result
  }, [images, texts])

  // Apply filters and sort
  const filteredSparks = useMemo(() => {
    let list = [...sparks]
    if (viewFilter === 'images') list = list.filter((s) => s.image != null)
    if (viewFilter === 'copy') list = list.filter((s) => s.text != null)
    if (imageSourceFilter === 'ai') list = list.filter((s) => s.image && (s.image.source === 'ai' || s.image.source == null))
    if (imageSourceFilter === 'stock') list = list.filter((s) => s.image && s.image.source === 'stock')
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'image_rating') {
      list.sort((a, b) => {
        const ar = a.image?.rating ?? -1
        const br = b.image?.rating ?? -1
        if (ar !== br) return br - ar
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    } else {
      list.sort((a, b) => {
        const ar = a.text?.rating ?? -1
        const br = b.text?.rating ?? -1
        if (ar !== br) return br - ar
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    }
    return list
  }, [sparks, viewFilter, imageSourceFilter, sortBy])

  const isEmpty = sparks.length === 0

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-64 bg-gray-200 rounded" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Generations</h1>
          <Link
            href="/dashboard/content"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm font-medium whitespace-nowrap"
          >
            Create New
          </Link>
        </div>

        {/* Filters: View, Image source (AI/Stock), Sort */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">View</span>
            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
              {(['all', 'images', 'copy'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setViewFilter(f)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'images' ? 'With image' : 'Copy only'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Image source</span>
            <select
              value={imageSourceFilter}
              onChange={(e) => setImageSourceFilter(e.target.value as ImageSourceFilter)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm"
            >
              <option value="all">All</option>
              <option value="ai">AI only</option>
              <option value="stock">Stock only</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="image_rating">Image rating (high first)</option>
              <option value="text_rating">Text rating (high first)</option>
            </select>
          </div>
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
              onClick={() => setViewFilter('all')}
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
          <p className="text-muted-foreground">No generations yet. Create content to see sparks here.</p>
          <Link href="/dashboard/content" className="mt-4 inline-block text-primary hover:underline">
            Create your first spark
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {filteredSparks.map((spark) => {
            const { image, text, contentId } = spark
            const topic = image?.topic || text?.topic || 'Untitled'
            const template = text?.template
            const href = contentId ? `/dashboard/content?edit=${contentId}` : text ? `/dashboard/text-library/${text.id}` : image ? `/dashboard/pictures/${image.id}` : '#'
            const isImageFromContent = image && typeof image.id === 'string' && image.id.startsWith('content-')
            const canRateImage = image && !isImageFromContent && (image.source === 'ai' || image.source == null)
            const imageUrl = image?.image_url ?? null
            const imageKey = image?.id ?? spark.id
            const showImage = imageUrl && !imageErrors.has(imageKey)

            return (
              <div
                key={spark.id}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-200 bg-card hover:border-teal-300 transition-colors"
              >
                {/* Image: prominent, fixed aspect ratio, with fallback */}
                <div
                  className="w-full sm:w-44 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer aspect-[4/3] sm:aspect-square max-h-52 sm:max-h-none"
                  onClick={() => href !== '#' && router.push(href)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && href !== '#' && router.push(href)}
                >
                  {showImage ? (
                    <img
                      src={imageUrl}
                      alt={topic}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => markImageError(imageKey)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">{image ? '🖼️' : '📝'}</span>
                    </div>
                  )}
                </div>

                {/* Text + meta */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-xs font-medium text-teal-600 uppercase tracking-wide">
                    {template ? TEMPLATE_LABEL[template] || template : 'Image'}
                    {image?.source === 'stock' && ' • Stock'}
                    {image?.source === 'ai' && ' • AI'}
                  </p>
                  <p className="font-medium truncate">{topic}</p>
                  <p className="text-sm text-muted-foreground mb-1">{new Date(spark.created_at).toLocaleDateString()}</p>
                  {text && (
                    <p className="text-sm text-gray-600 line-clamp-2">{getTextPreview(text)}</p>
                  )}
                </div>

                {/* Two ratings: Text + Image */}
                <div className="flex flex-row sm:flex-col gap-3 flex-shrink-0 justify-center border-l border-gray-100 pl-4">
                  {text && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Text</span>
                      {text.rating != null ? (
                        <span className="text-muted-foreground" title={`Rated ${text.rating >= 3 ? 'good' : 'poor'}`}>
                          {text.rating >= 3 ? '👍' : '👎'}
                        </span>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            disabled={ratingSaving !== null}
                            onClick={(e) => { e.stopPropagation(); handleRateText(text.id, 4) }}
                            className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50 border border-transparent hover:border-gray-200"
                            title="Good"
                          >
                            👍
                          </button>
                          <button
                            type="button"
                            disabled={ratingSaving !== null}
                            onClick={(e) => { e.stopPropagation(); handleRateText(text.id, 2) }}
                            className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50 border border-transparent hover:border-gray-200"
                            title="Not great"
                          >
                            👎
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {image && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap pt-1">Image</span>
                      {!canRateImage ? (
                        <span className="text-gray-400 text-xs">-</span>
                      ) : image.rating != null ? (
                        <span className="text-muted-foreground" title={`Rated ${image.rating >= 3 ? 'good' : 'poor'}`}>
                          {image.rating >= 3 ? '👍' : '👎'}
                        </span>
                      ) : (
                        <div onClick={(e) => e.stopPropagation()} className="min-w-0">
                          <RatingStars
                            type="image"
                            value={image.rating}
                            feedbackReasons={image.feedback_reasons ?? undefined}
                            onChange={(rating, reasons) => handleRateImage(image.id, rating, reasons)}
                            disabled={ratingSaving !== null}
                            showSkip={false}
                            variant="full"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
