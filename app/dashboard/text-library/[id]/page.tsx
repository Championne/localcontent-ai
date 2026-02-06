'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import RatingStars from '@/components/RatingStars'
import { SocialPackCards, type SocialPackResult } from '@/components/SocialPackCards'

interface TextRecord {
  id: string
  template: string
  topic: string | null
  business_name: string | null
  industry: string | null
  tone: string | null
  content_preview: string | null
  content_full: string | null
  prompt_summary: string | null
  prompt_version: string | null
  rating: number | null
  rated_at: string | null
  feedback_reasons: string[] | null
  content_id: string | null
  created_at: string
}

export default function TextDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [text, setText] = useState<TextRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/generated-texts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.text) setText(data.text)
      })
      .catch(() => setText(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleRating = async (rating: number, feedbackReasons?: string[]) => {
    if (!id) return
    setSaving(true)
    try {
      const res = await fetch(`/api/generated-texts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback_reasons: feedbackReasons || [] })
      })
      const data = await res.json()
      if (res.ok && data.text) setText(data.text)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />
  if (!text) return <div className="text-muted-foreground">Not found.</div>

  const inputs = [
    { label: 'Template', value: text.template },
    { label: 'Topic', value: text.topic },
    { label: 'Business name', value: text.business_name },
    { label: 'Industry', value: text.industry },
    { label: 'Tone', value: text.tone },
    { label: 'Prompt version', value: text.prompt_version }
  ].filter((i) => i.value)

  const parsedSocialPack = useMemo((): SocialPackResult | null => {
    if (text.template !== 'social-pack' || !text.content_full) return null
    try {
      const parsed = JSON.parse(text.content_full) as SocialPackResult
      if (parsed && typeof parsed.twitter?.content === 'string') return parsed
    } catch {
      // ignore
    }
    return null
  }, [text.template, text.content_full])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-600 hover:text-gray-900">
          ← Back
        </button>
        {text.content_id && (
          <Link href={`/dashboard/content?edit=${text.content_id}`} className="text-sm text-teal-600 hover:underline">
            View in Spark Library
          </Link>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Generation inputs</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm bg-gray-50 p-4 rounded-lg">
            {inputs.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        {text.prompt_summary && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Prompt summary</h3>
            <p className="text-sm bg-gray-50 p-3 rounded">{text.prompt_summary}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Content</h3>
          {parsedSocialPack ? (
            <SocialPackCards
              pack={parsedSocialPack}
              businessName={text.business_name || 'Business'}
              industry={text.industry || ''}
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed overflow-auto max-h-[32rem]">
                {text.content_full || text.content_preview || '-'}
              </pre>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Rate this copy</h3>
          <RatingStars
            type="text"
            value={text.rating}
            feedbackReasons={text.feedback_reasons || []}
            onChange={handleRating}
            disabled={saving}
            showSkip={false}
          />
        </div>
      </div>
    </div>
  )
}
