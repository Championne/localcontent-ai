'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface GeneratedText {
  id: string
  template: string
  topic: string | null
  content_preview: string | null
  rating: number | null
  created_at: string
}

const RATING_REMINDER_KEY = 'quality-rating-reminder-dismissed'

export default function TextLibraryPage() {
  const router = useRouter()
  const [texts, setTexts] = useState<GeneratedText[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReminder, setShowReminder] = useState(false)
  const [unratedCount, setUnratedCount] = useState(0)

  useEffect(() => {
    fetchTexts()
    fetchUnratedCount()
  }, [])

  useEffect(() => {
    if (unratedCount > 0 && typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(RATING_REMINDER_KEY)) {
      setShowReminder(true)
    }
  }, [unratedCount])

  const fetchTexts = async () => {
    try {
      const res = await fetch('/api/generated-texts?sort=unrated_first&limit=100')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch')
      setTexts(data.texts || [])
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
    try { sessionStorage.setItem(RATING_REMINDER_KEY, '1') } catch (_) {}
  }

  const templateLabel: Record<string, string> = {
    'social-pack': 'Social pack',
    'blog-post': 'Blog post',
    'gmb-post': 'Google Business',
    'email': 'Email'
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Copy Library</h1>
        <Link href="/dashboard/content" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm">
          Create New
        </Link>
      </div>

      {showReminder && unratedCount > 0 && (
        <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between gap-4">
          <p className="text-sm text-teal-800">Rate a few to help us improve what we generate.</p>
          <button type="button" onClick={dismissReminder} className="text-sm text-teal-600 hover:text-teal-800">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>
      )}

      {texts.length > 0 ? (
        <div className="border rounded-lg divide-y bg-card">
          {texts.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => router.push(`/dashboard/text-library/${t.id}`)}
              className="w-full p-4 flex items-start gap-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">{templateLabel[t.template] || t.template} • {new Date(t.created_at).toLocaleDateString()}</p>
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
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-12 text-center bg-card">
          <p className="text-muted-foreground">No copy yet. Create content to see it here.</p>
          <Link href="/dashboard/content" className="mt-4 inline-block text-primary hover:underline">
            Create your first spark
          </Link>
        </div>
      )}
    </div>
  )
}
