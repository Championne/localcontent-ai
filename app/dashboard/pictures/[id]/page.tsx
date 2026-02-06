'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import RatingStars from '@/components/RatingStars'

interface ImageRecord {
  id: string
  image_url: string
  topic: string | null
  business_name: string | null
  industry: string | null
  style: string | null
  content_type: string | null
  size: string | null
  full_prompt: string | null
  revised_prompt: string | null
  prompt_version: string | null
  rating: number | null
  rated_at: string | null
  feedback_reasons: string[] | null
  content_id: string | null
  source?: 'ai' | 'stock' | 'composite' | null
  created_at: string
}

export default function PictureDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [image, setImage] = useState<ImageRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/generated-images/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.image) setImage(data.image)
      })
      .catch(() => setImage(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleRating = async (rating: number, feedbackReasons?: string[]) => {
    if (!id) return
    setSaving(true)
    try {
      const res = await fetch(`/api/generated-images/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback_reasons: feedbackReasons || [] })
      })
      const data = await res.json()
      if (res.ok && data.image) setImage(data.image)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />
  if (!image) return <div className="text-muted-foreground">Image not found.</div>

  const inputs = [
    { label: 'Topic', value: image.topic },
    { label: 'Business name', value: image.business_name },
    { label: 'Industry', value: image.industry },
    { label: 'Style', value: image.style },
    { label: 'Content type', value: image.content_type },
    { label: 'Size', value: image.size },
    { label: 'Prompt version', value: image.prompt_version }
  ].filter((i) => i.value)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        {image.content_id && (
          <Link
            href={`/dashboard/content?edit=${image.content_id}`}
            className="text-sm text-teal-600 hover:underline"
          >
            View in Spark Library
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <img
            src={image.image_url}
            alt={image.topic || 'Generated'}
            className="w-full rounded-lg border border-gray-200 shadow-sm"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Generation inputs</h2>
          <dl className="space-y-2 text-sm">
            {inputs.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {image.full_prompt && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Full prompt (sent to model)</h3>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                {image.full_prompt}
              </pre>
            </div>
          )}
          {image.revised_prompt && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Revised prompt (from API)</h3>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                {image.revised_prompt}
              </pre>
            </div>
          )}

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {image.source === 'stock' || image.source === 'composite'
                ? 'Did this image work for your post?'
                : 'Rate this image'}
            </h3>
            <RatingStars
              type="image"
              value={image.rating}
              feedbackReasons={image.feedback_reasons || []}
              onChange={handleRating}
              disabled={saving}
              showSkip={false}
              variant={image.source === 'stock' || image.source === 'composite' ? 'fit' : 'full'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
