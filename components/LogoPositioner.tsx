'use client'

import { useState, useRef, useEffect } from 'react'

interface LogoPositionerProps {
  imageUrl: string
  logoUrl: string
  onApply: (position: { x: number; y: number; scale: number }) => void
  onSkip: () => void
  applying?: boolean
  title?: string
  subtitle?: string
  isCircular?: boolean
}

type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export default function LogoPositioner({ 
  imageUrl, 
  logoUrl, 
  onApply, 
  onSkip, 
  applying,
  title = "Add Your Logo",
  subtitle = "Drag to position or use quick buttons",
  isCircular = false
}: LogoPositionerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 85, y: 85 }) // % from top-left
  const [scale, setScale] = useState(15) // Logo size as % of image width
  const [dragging, setDragging] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleCornerClick = (corner: CornerPosition) => {
    const padding = 5 // % padding from edges
    const positions: Record<CornerPosition, { x: number; y: number }> = {
      'top-left': { x: padding, y: padding },
      'top-right': { x: 100 - padding - scale, y: padding },
      'bottom-left': { x: padding, y: 100 - padding - scale },
      'bottom-right': { x: 100 - padding - scale, y: 100 - padding - scale },
    }
    setPosition(positions[corner])
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    // Keep logo within bounds
    const boundedX = Math.max(0, Math.min(100 - scale, x - scale / 2))
    const boundedY = Math.max(0, Math.min(100 - scale, y - scale / 2))
    
    setPosition({ x: boundedX, y: boundedY })
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!dragging || !containerRef.current) return
    
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    const y = ((touch.clientY - rect.top) / rect.height) * 100
    
    const boundedX = Math.max(0, Math.min(100 - scale, x - scale / 2))
    const boundedY = Math.max(0, Math.min(100 - scale, y - scale / 2))
    
    setPosition({ x: boundedX, y: boundedY })
  }

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [dragging, scale])

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b border-gray-200 ${isCircular ? 'bg-gradient-to-r from-blue-50 to-cyan-50' : 'bg-gradient-to-r from-purple-50 to-pink-50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCircular ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
            {isCircular ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Image with Logo Overlay */}
      <div className="p-4 bg-gray-50">
        <div 
          ref={containerRef}
          className="relative mx-auto max-w-md rounded-lg overflow-hidden shadow-sm select-none"
          style={{ cursor: dragging ? 'grabbing' : 'default' }}
        >
          <img 
            src={imageUrl} 
            alt="Generated content" 
            className="w-full"
            onLoad={() => setImageLoaded(true)}
            draggable={false}
          />
          
          {/* Logo/Photo Overlay */}
          {imageLoaded && (
            <div
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${scale}%`,
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <img 
                src={logoUrl} 
                alt={isCircular ? "Your photo" : "Your logo"}
                className={`w-full h-auto drop-shadow-lg ${isCircular ? 'rounded-full aspect-square object-cover' : ''}`}
                draggable={false}
              />
              {/* Drag indicator ring */}
              <div className={`absolute inset-0 border-2 border-dashed border-white/70 pointer-events-none ${isCircular ? 'rounded-full' : 'rounded'}`} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 space-y-4">
          {/* Quick Position Buttons */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Quick Position</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleCornerClick('top-left')}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                Top Left
              </button>
              <button
                onClick={() => handleCornerClick('top-right')}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
              >
                Top Right
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleCornerClick('bottom-left')}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                Bottom Left
              </button>
              <button
                onClick={() => handleCornerClick('bottom-right')}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
              >
                Bottom Right
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Size Slider */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Logo Size: {scale}%</label>
            <input
              type="range"
              min="5"
              max="35"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 flex gap-3">
        <button
          onClick={onSkip}
          disabled={applying}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Skip Logo
        </button>
        <button
          onClick={() => onApply({ x: position.x, y: position.y, scale })}
          disabled={applying}
          className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
        >
          {applying ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Applying...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Apply Logo
            </>
          )}
        </button>
      </div>
    </div>
  )
}
