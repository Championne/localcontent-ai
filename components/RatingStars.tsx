'use client'

import { useState } from 'react'

export const FEEDBACK_REASONS_IMAGE = [
  'Wrong style / mood',
  'Unwanted text in image',
  'Off-topic / doesn\'t match idea',
  'Blurry or low quality',
  'Other'
] as const

export const FEEDBACK_REASONS_TEXT = [
  'Wrong tone',
  'Off-topic',
  'Poor quality / unclear',
  'Too short / too long',
  'Other'
] as const

type FeedbackReasonsImage = typeof FEEDBACK_REASONS_IMAGE[number]
type FeedbackReasonsText = typeof FEEDBACK_REASONS_TEXT[number]

export interface RatingStarsProps {
  type: 'image' | 'text'
  value: number | null
  feedbackReasons?: string[]
  onChange: (rating: number, feedbackReasons?: string[]) => void
  onSkip?: () => void
  disabled?: boolean
  label?: string
  showSkip?: boolean
}

export default function RatingStars({
  type,
  value,
  feedbackReasons = [],
  onChange,
  onSkip,
  disabled,
  label,
  showSkip = true
}: RatingStarsProps) {
  const [localRating, setLocalRating] = useState<number | null>(value)
  const [localReasons, setLocalReasons] = useState<string[]>(feedbackReasons)
  const reasons = type === 'image' ? FEEDBACK_REASONS_IMAGE : FEEDBACK_REASONS_TEXT

  const handleStarClick = (rating: number) => {
    if (disabled) return
    setLocalRating(rating)
    onChange(rating, rating <= 2 ? localReasons : undefined)
  }

  const toggleReason = (r: string) => {
    if (disabled) return
    const next = localReasons.includes(r) ? localReasons.filter(x => x !== r) : [...localReasons, r]
    setLocalReasons(next)
    if (localRating != null) onChange(localRating, next)
  }

  const displayRating = localRating ?? value

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => handleStarClick(star)}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <svg
              className="w-8 h-8"
              fill={displayRating != null && star <= displayRating ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        ))}
        {showSkip && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={disabled}
            className="ml-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            Skip
          </button>
        )}
      </div>
      {displayRating != null && displayRating <= 2 && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">What was wrong? (optional)</p>
          <div className="flex flex-wrap gap-2">
            {reasons.map((r) => (
              <label key={r} className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localReasons.includes(r)}
                  onChange={() => toggleReason(r)}
                  disabled={disabled}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{r}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
