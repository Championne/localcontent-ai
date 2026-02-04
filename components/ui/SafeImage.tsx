'use client'

import { useState, useEffect } from 'react'

interface SafeImageProps {
  src?: string | null
  alt?: string
  className?: string
  containerClassName?: string
  fallbackClassName?: string
  showBadge?: boolean
  badgeText?: string
  onLoad?: () => void
  onError?: () => void
}

/**
 * SafeImage component that handles:
 * - Loading states with placeholder
 * - Error handling (gracefully hides broken images)
 * - Expired DALL-E URLs
 * - Optional AI badge
 */
export function SafeImage({ 
  src, 
  alt = "Image", 
  className = "",
  containerClassName = "",
  fallbackClassName = "",
  showBadge = false,
  badgeText = "AI Generated",
  onLoad,
  onError
}: SafeImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  // Reset state when src changes
  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [src])

  if (!src || error) {
    // Return fallback placeholder if specified, otherwise null
    if (fallbackClassName) {
      return (
        <div className={`${fallbackClassName} flex items-center justify-center bg-gray-100`}>
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )
    }
    return null
  }

  const handleLoad = () => {
    setLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    onError?.()
  }

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Loading placeholder */}
      {!loaded && (
        <div className={`${className} bg-gray-100 animate-pulse flex items-center justify-center`} style={{ minHeight: '100px' }}>
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`${className} ${loaded ? '' : 'hidden'}`}
        onLoad={handleLoad}
        onError={handleError}
      />
      {showBadge && loaded && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {badgeText}
        </div>
      )}
    </div>
  )
}

export default SafeImage
