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

/** Thumbs: good = 4, bad = 2 (stored in DB; reasons only when bad) */
export const RATING_GOOD = 4
export const RATING_BAD = 2

export interface RatingStarsProps {
  type: 'image' | 'text'
  value: number | null
  feedbackReasons?: string[]
  onChange: (rating: number, feedbackReasons?: string[]) => void
  onSkip?: () => void
  disabled?: boolean
  label?: string
  showSkip?: boolean
  /** 'fit' = thumbs only, no reasons (e.g. "Did this image work?" for stock). Default 'full' = thumbs + reasons on 👎 */
  variant?: 'full' | 'fit'
}

export default function RatingStars({
  type,
  value,
  feedbackReasons = [],
  onChange,
  onSkip,
  disabled,
  label,
  showSkip = true,
  variant = 'full',
}: RatingStarsProps) {
  const [localRating, setLocalRating] = useState<number | null>(value)
  const [localReasons, setLocalReasons] = useState<string[]>(feedbackReasons)
  const reasons = type === 'image' ? FEEDBACK_REASONS_IMAGE : FEEDBACK_REASONS_TEXT
  const showReasons = variant === 'full' && localRating === RATING_BAD

  const handleThumb = (rating: number) => {
    if (disabled) return
    setLocalRating(rating)
    onChange(rating, rating === RATING_BAD ? localReasons : undefined)
  }

  const toggleReason = (r: string) => {
    if (disabled) return
    const next = localReasons.includes(r) ? localReasons.filter((x) => x !== r) : [...localReasons, r]
    setLocalReasons(next)
    if (localRating != null) onChange(localRating, next)
  }

  const displayRating = localRating ?? value
  const isGood = displayRating != null && displayRating >= 3
  const isBad = displayRating != null && displayRating <= 2

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleThumb(RATING_GOOD)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isGood ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
          aria-label="Good"
        >
          <span className="text-lg" aria-hidden>👍</span>
          <span className="text-sm font-medium">Good</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleThumb(RATING_BAD)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isBad ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
          aria-label="Not great"
        >
          <span className="text-lg" aria-hidden>👎</span>
          <span className="text-sm font-medium">Not great</span>
        </button>
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
      {showReasons && (
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
