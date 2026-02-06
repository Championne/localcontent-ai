'use client'

import { useState, useEffect, useRef } from 'react'

interface GenerationProgressProps {
  isGenerating: boolean
  contentType?: 'social-pack' | 'blog-post' | 'gmb-post' | 'email' | 'image' | 'general'
  /** If set, progress is computed from this timestamp so it never resets on remount (e.g. when generating text then image). */
  startTime?: number
  className?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// Estimated generation times in seconds for each content type
const ESTIMATED_TIMES: Record<string, number> = {
  'social-pack': 25,
  'blog-post': 20,
  'gmb-post': 15,
  'email': 18,
  'image': 12,
  'general': 20,
}

// Progress messages for different stages
const PROGRESS_MESSAGES: Record<number, string[]> = {
  0: ['Starting AI engine...', 'Initializing...', 'Connecting to AI...'],
  15: ['Analyzing your business...', 'Understanding context...', 'Processing request...'],
  30: ['Generating content...', 'AI is writing...', 'Creating your content...'],
  50: ['Crafting engaging copy...', 'Optimizing for engagement...', 'Fine-tuning message...'],
  70: ['Generating image...', 'Creating visuals...', 'Adding finishing touches...'],
  85: ['Polishing content...', 'Almost ready...', 'Final optimizations...'],
  95: ['Wrapping up...', 'Nearly there...', 'Just a moment...'],
}

export function GenerationProgress({ 
  isGenerating, 
  contentType = 'general',
  startTime: startTimeProp,
  className = '',
  showPercentage = true,
  size = 'md'
}: GenerationProgressProps) {
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const prevGenerating = useRef(false)
  const internalStartTime = useRef<number | null>(null)
  const estimatedTime = ESTIMATED_TIMES[contentType] || 20

  useEffect(() => {
    if (!isGenerating) {
      prevGenerating.current = false
      internalStartTime.current = null
      // When generation completes, quickly animate to 100%
      if (progress > 0 && progress < 100) {
        setProgress(100)
        setMessage('Complete!')
        const timeout = setTimeout(() => {
          setProgress(0)
          setMessage('')
        }, 500)
        return () => clearTimeout(timeout)
      }
      return
    }

    const justStarted = !prevGenerating.current
    prevGenerating.current = true
    const intervalStart = startTimeProp ?? internalStartTime.current ?? Date.now()
    if (justStarted) {
      if (startTimeProp == null) {
        internalStartTime.current = intervalStart
        setProgress(0)
        setMessage('')
      } else {
        const elapsed = (Date.now() - intervalStart) / 1000
        const raw = (elapsed / estimatedTime) * 100
        const eased = Math.min(95, raw * (1 - raw / 200))
        setProgress(Math.round(eased))
      }
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - intervalStart) / 1000
      const rawProgress = (elapsed / estimatedTime) * 100
      const easedProgress = Math.min(95, rawProgress * (1 - rawProgress / 200))
      setProgress((prev) => Math.max(prev, Math.round(easedProgress)))
      const progressThresholds = Object.keys(PROGRESS_MESSAGES)
        .map(Number)
        .sort((a, b) => b - a)
      for (const threshold of progressThresholds) {
        if (easedProgress >= threshold) {
          const messages = PROGRESS_MESSAGES[threshold]
          const messageIndex = Math.floor(elapsed / 3) % messages.length
          setMessage(messages[messageIndex])
          break
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isGenerating, startTimeProp, estimatedTime])

  if (!isGenerating && progress === 0) return null

  const sizeClasses = {
    sm: { bar: 'h-1.5', text: 'text-xs', padding: 'py-2 px-3' },
    md: { bar: 'h-2', text: 'text-sm', padding: 'py-3 px-4' },
    lg: { bar: 'h-3', text: 'text-base', padding: 'py-4 px-5' },
  }

  const styles = sizeClasses[size]

  return (
    <div className={`bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-100 ${styles.padding} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Animated spinner */}
          <svg className="animate-spin h-4 w-4 text-teal-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className={`font-medium text-teal-800 ${styles.text}`}>
            {message || 'Generating...'}
          </span>
        </div>
        {showPercentage && (
          <span className={`font-semibold text-teal-700 ${styles.text}`}>
            {progress}%
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <div className={`w-full bg-white/60 rounded-full overflow-hidden ${styles.bar}`}>
        <div 
          className={`${styles.bar} bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Compact inline version for smaller spaces
export function GenerationProgressInline({ 
  isGenerating,
  className = ''
}: { 
  isGenerating: boolean
  className?: string 
}) {
  const [progress, setProgress] = useState(0)
  const prevGenerating = useRef(false)

  useEffect(() => {
    if (!isGenerating) {
      prevGenerating.current = false
      if (progress > 0) {
        setProgress(100)
        const timeout = setTimeout(() => setProgress(0), 300)
        return () => clearTimeout(timeout)
      }
      return
    }
    const justStarted = !prevGenerating.current
    prevGenerating.current = true
    if (justStarted) setProgress(0)
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const rawProgress = (elapsed / 20) * 100
      const easedProgress = Math.min(95, rawProgress * (1 - rawProgress / 200))
      setProgress((prev) => Math.max(prev, Math.round(easedProgress)))
    }, 100)
    return () => clearInterval(interval)
  }, [isGenerating])

  if (!isGenerating && progress === 0) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-teal-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 font-medium">{progress}%</span>
    </div>
  )
}

export default GenerationProgress
