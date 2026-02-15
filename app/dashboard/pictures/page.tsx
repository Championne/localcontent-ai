'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CostAnalyticsWidget } from '@/components/CostAnalyticsWidget'

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

const RATING_REMINDER_KEY = 'quality-rating-reminder-dismissed'

export default function PictureLibraryPage() {
  const router = useRouter()
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReminder, setShowReminder] = useState(false)
  const [unratedCount, setUnratedCount] = useState(0)

  useEffect(() => {
    fetchImages()
    fetchUnratedCount()
  }, [])

  useEffect(() => {
    if (unratedCount > 0 && typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(RATING_REMINDER_KEY)) {
      setShowReminder(true)
    }
  }, [unratedCount])

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/generated-images?sort=unrated_first&limit=100')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch')
      setImages(data.images || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load images')
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
    try { sessionStorage.setItem(RATING_REMINDER_KEY, '1') } catch (_) {}
  }

  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
        ))}
      </div>
    )
  }

  const imageGrid = images.length > 0 ? (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((img) => {
        const isFromContent = typeof img.id === 'string' && img.id.startsWith('content-')
        const href = isFromContent && img.content_id
          ? `/dashboard/content?edit=${img.content_id}`
          : `/dashboard/pictures/${img.id}`
        const showRating = !isFromContent && (img.source === 'ai' || img.source == null)
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
              {showRating && (img.rating != null ? (
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
    <div className="border rounded-lg p-12 text-center bg-card">
      <p className="text-muted-foreground">No images yet. Create content with images to see them here.</p>
      <Link href="/dashboard/content" className="mt-4 inline-block text-primary hover:underline">
        Create your first spark
      </Link>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Picture Library</h1>
        <Link
          href="/dashboard/content"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm"
        >
          Create New
        </Link>
      </div>

      {showReminder && unratedCount > 0 && (
        <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between gap-4">
          <p className="text-sm text-teal-800">
            Rate a few to help us improve what we generate. Your feedback shapes the engine.
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/pictures?unrated=1"
              className="text-sm font-medium text-teal-700 hover:underline"
            >
              Show unrated
            </Link>
            <button
              type="button"
              onClick={dismissReminder}
              className="text-sm text-teal-600 hover:text-teal-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
          {error}
        </div>
      )}

      {imageGrid}

      {/* Cost analytics */}
      <div className="mt-8">
        <CostAnalyticsWidget />
      </div>
    </div>
  )
}
