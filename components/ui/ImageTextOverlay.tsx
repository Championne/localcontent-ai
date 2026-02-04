'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Download, RotateCcw, Type, Move } from 'lucide-react'

interface TextOverlay {
  id: string
  text: string
  x: number // percentage from left
  y: number // percentage from top
  fontSize: number // in pixels
  color: string
  shadowColor: string
  fontWeight: 'normal' | 'bold'
}

interface ImageTextOverlayProps {
  imageUrl: string
  suggestedTexts: string[] // AI-suggested texts based on content
  industry?: string
  businessName?: string
  onSave?: (imageWithText: Blob) => void
  onClose?: () => void
  className?: string
}

// Smart color selection based on image brightness analysis
async function analyzeImageBrightness(imageUrl: string): Promise<{ 
  avgBrightness: number
  topBrightness: number
  bottomBrightness: number
  bestPosition: 'top' | 'bottom' | 'center'
}> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve({ avgBrightness: 128, topBrightness: 128, bottomBrightness: 128, bestPosition: 'bottom' })
        return
      }
      
      // Sample at lower resolution for performance
      const sampleWidth = 100
      const sampleHeight = 100
      canvas.width = sampleWidth
      canvas.height = sampleHeight
      ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight)
      
      const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight)
      const data = imageData.data
      
      let totalBrightness = 0
      let topBrightness = 0
      let bottomBrightness = 0
      const topThird = Math.floor(sampleHeight / 3)
      const bottomThird = Math.floor(sampleHeight * 2 / 3)
      
      for (let y = 0; y < sampleHeight; y++) {
        for (let x = 0; x < sampleWidth; x++) {
          const i = (y * sampleWidth + x) * 4
          const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
          totalBrightness += brightness
          
          if (y < topThird) {
            topBrightness += brightness
          } else if (y >= bottomThird) {
            bottomBrightness += brightness
          }
        }
      }
      
      const pixelCount = sampleWidth * sampleHeight
      const thirdPixels = sampleWidth * topThird
      
      const avgBrightness = totalBrightness / pixelCount
      const topAvg = topBrightness / thirdPixels
      const bottomAvg = bottomBrightness / thirdPixels
      
      // Prefer placing text on darker areas (better contrast)
      let bestPosition: 'top' | 'bottom' | 'center' = 'bottom'
      if (topAvg < bottomAvg - 20) {
        bestPosition = 'top'
      } else if (bottomAvg < topAvg - 20) {
        bestPosition = 'bottom'
      }
      
      resolve({
        avgBrightness,
        topBrightness: topAvg,
        bottomBrightness: bottomAvg,
        bestPosition
      })
    }
    img.onerror = () => {
      resolve({ avgBrightness: 128, topBrightness: 128, bottomBrightness: 128, bestPosition: 'bottom' })
    }
    img.src = imageUrl
  })
}

// Get optimal text styling based on background brightness
function getTextStyle(brightness: number, industry?: string) {
  // Use white text on dark backgrounds, dark text on light backgrounds
  const isDark = brightness < 128
  
  return {
    color: isDark ? '#FFFFFF' : '#1F2937',
    shadowColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
    fontWeight: 'bold' as const
  }
}

// Get initial Y position based on analysis
function getInitialY(position: 'top' | 'bottom' | 'center'): number {
  switch (position) {
    case 'top': return 12
    case 'center': return 45
    case 'bottom': return 82
  }
}

export function ImageTextOverlay({
  imageUrl,
  suggestedTexts,
  industry,
  businessName,
  onSave,
  onClose,
  className = ''
}: ImageTextOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [overlays, setOverlays] = useState<TextOverlay[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [textStyle, setTextStyle] = useState({ color: '#FFFFFF', shadowColor: 'rgba(0,0,0,0.8)', fontWeight: 'bold' as const })
  const [editingId, setEditingId] = useState<string | null>(null)

  // Analyze image and set up initial overlays
  useEffect(() => {
    async function setup() {
      setIsAnalyzing(true)
      const analysis = await analyzeImageBrightness(imageUrl)
      
      // Determine text style based on where text will be placed
      const positionBrightness = analysis.bestPosition === 'top' 
        ? analysis.topBrightness 
        : analysis.bottomBrightness
      const style = getTextStyle(positionBrightness, industry)
      setTextStyle(style)
      
      // Create initial overlay with first suggested text
      if (suggestedTexts.length > 0) {
        const initialOverlay: TextOverlay = {
          id: 'overlay-1',
          text: suggestedTexts[0],
          x: 50, // centered
          y: getInitialY(analysis.bestPosition),
          fontSize: 24,
          ...style
        }
        setOverlays([initialOverlay])
        setSelectedId(initialOverlay.id)
      }
      
      setIsAnalyzing(false)
    }
    setup()
  }, [imageUrl, suggestedTexts, industry])

  // Handle mouse down on overlay
  const handleMouseDown = useCallback((e: React.MouseEvent, overlayId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const overlay = overlays.find(o => o.id === overlayId)
    if (!overlay || !containerRef.current) return
    
    setSelectedId(overlayId)
    setIsDragging(true)
    
    const rect = containerRef.current.getBoundingClientRect()
    const currentX = (overlay.x / 100) * rect.width
    const currentY = (overlay.y / 100) * rect.height
    
    setDragOffset({
      x: e.clientX - rect.left - currentX,
      y: e.clientY - rect.top - currentY
    })
  }, [overlays])

  // Handle mouse move
  useEffect(() => {
    if (!isDragging || !selectedId) return
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const newX = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100
      const newY = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100
      
      setOverlays(prev => prev.map(o => 
        o.id === selectedId 
          ? { ...o, x: Math.max(-20, Math.min(120, newX)), y: Math.max(-10, Math.min(110, newY)) }
          : o
      ))
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, selectedId, dragOffset])

  // Handle touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent, overlayId: string) => {
    e.preventDefault()
    const touch = e.touches[0]
    
    const overlay = overlays.find(o => o.id === overlayId)
    if (!overlay || !containerRef.current) return
    
    setSelectedId(overlayId)
    setIsDragging(true)
    
    const rect = containerRef.current.getBoundingClientRect()
    const currentX = (overlay.x / 100) * rect.width
    const currentY = (overlay.y / 100) * rect.height
    
    setDragOffset({
      x: touch.clientX - rect.left - currentX,
      y: touch.clientY - rect.top - currentY
    })
  }, [overlays])

  useEffect(() => {
    if (!isDragging || !selectedId) return
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current) return
      const touch = e.touches[0]
      
      const rect = containerRef.current.getBoundingClientRect()
      const newX = ((touch.clientX - rect.left - dragOffset.x) / rect.width) * 100
      const newY = ((touch.clientY - rect.top - dragOffset.y) / rect.height) * 100
      
      setOverlays(prev => prev.map(o => 
        o.id === selectedId 
          ? { ...o, x: Math.max(-20, Math.min(120, newX)), y: Math.max(-10, Math.min(110, newY)) }
          : o
      ))
    }
    
    const handleTouchEnd = () => {
      setIsDragging(false)
    }
    
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, selectedId, dragOffset])

  // Update text content
  const updateText = (id: string, newText: string) => {
    setOverlays(prev => prev.map(o => 
      o.id === id ? { ...o, text: newText } : o
    ))
  }

  // Remove overlay (drag out of bounds)
  const removeOverlay = (id: string) => {
    setOverlays(prev => prev.filter(o => o.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  // Reset to original suggested text
  const resetOverlay = () => {
    if (suggestedTexts.length > 0) {
      setOverlays([{
        id: 'overlay-1',
        text: suggestedTexts[0],
        x: 50,
        y: 82,
        fontSize: 24,
        ...textStyle
      }])
      setSelectedId('overlay-1')
    }
  }

  // Add text back if removed
  const addTextBack = () => {
    if (overlays.length === 0 && suggestedTexts.length > 0) {
      const newOverlay: TextOverlay = {
        id: `overlay-${Date.now()}`,
        text: suggestedTexts[0],
        x: 50,
        y: 82,
        fontSize: 24,
        ...textStyle
      }
      setOverlays([newOverlay])
      setSelectedId(newOverlay.id)
    }
  }

  // Download image with text overlay
  const downloadImage = async () => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      // Render text overlays
      overlays.forEach(overlay => {
        // Only render if within bounds
        if (overlay.x < 0 || overlay.x > 100 || overlay.y < 0 || overlay.y > 100) return
        
        const x = (overlay.x / 100) * canvas.width
        const y = (overlay.y / 100) * canvas.height
        const fontSize = Math.round((overlay.fontSize / 400) * canvas.width) // Scale font to image size
        
        ctx.font = `${overlay.fontWeight} ${fontSize}px Inter, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Draw shadow/outline for readability
        ctx.shadowColor = overlay.shadowColor
        ctx.shadowBlur = fontSize / 4
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 2
        
        // Draw text
        ctx.fillStyle = overlay.color
        ctx.fillText(overlay.text, x, y)
        
        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
      })
      
      canvas.toBlob((blob) => {
        if (!blob) return
        
        if (onSave) {
          onSave(blob)
        }
        
        // Also trigger download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${businessName || 'geospark'}-content.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 'image/png')
    }
    
    img.src = imageUrl
  }

  // Check if overlay is out of bounds (for removal indicator)
  const isOutOfBounds = (overlay: TextOverlay) => {
    return overlay.x < 5 || overlay.x > 95 || overlay.y < 5 || overlay.y > 95
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Add Text to Image</span>
        </div>
        <div className="flex items-center gap-2">
          {overlays.length === 0 && (
            <button
              onClick={addTextBack}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Type className="w-4 h-4" />
              Add Text
            </button>
          )}
          <button
            onClick={resetOverlay}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Image with overlay */}
      <div 
        ref={containerRef}
        className="relative bg-gray-100 select-none"
        style={{ touchAction: 'none' }}
        onClick={() => setSelectedId(null)}
      >
        {isAnalyzing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              <span>Analyzing image...</span>
            </div>
          </div>
        )}
        
        <img
          src={imageUrl}
          alt="Content"
          className="w-full h-auto"
          onLoad={() => setImageLoaded(true)}
          draggable={false}
        />
        
        {/* Drop zone indicators */}
        {isDragging && (
          <>
            <div className="absolute inset-x-0 top-0 h-8 bg-red-500/20 border-b-2 border-red-400 border-dashed flex items-center justify-center">
              <span className="text-xs text-red-600 font-medium">Drag here to remove</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-8 bg-red-500/20 border-t-2 border-red-400 border-dashed flex items-center justify-center">
              <span className="text-xs text-red-600 font-medium">Drag here to remove</span>
            </div>
          </>
        )}
        
        {/* Text overlays */}
        {overlays.map((overlay) => (
          <div
            key={overlay.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move transition-opacity ${
              isOutOfBounds(overlay) ? 'opacity-40' : ''
            } ${selectedId === overlay.id ? 'ring-2 ring-blue-500 ring-offset-2 rounded' : ''}`}
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              fontSize: `${overlay.fontSize}px`,
              fontWeight: overlay.fontWeight,
              color: overlay.color,
              textShadow: `0 2px 8px ${overlay.shadowColor}, 0 1px 3px ${overlay.shadowColor}`,
              maxWidth: '90%'
            }}
            onMouseDown={(e) => handleMouseDown(e, overlay.id)}
            onTouchStart={(e) => handleTouchStart(e, overlay.id)}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedId(overlay.id)
            }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              setEditingId(overlay.id)
            }}
          >
            {editingId === overlay.id ? (
              <input
                type="text"
                value={overlay.text}
                onChange={(e) => updateText(overlay.id, e.target.value)}
                onBlur={() => setEditingId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingId(null)
                }}
                autoFocus
                className="bg-white/90 text-gray-900 px-2 py-1 rounded border-2 border-blue-500 outline-none min-w-[200px] text-center"
                style={{ fontSize: `${overlay.fontSize}px` }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="whitespace-nowrap">{overlay.text}</span>
            )}
          </div>
        ))}
        
        {/* Drag hint */}
        {overlays.length > 0 && !isDragging && selectedId && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Move className="w-3 h-3" />
            <span>Drag to move • Double-click to edit</span>
          </div>
        )}
      </div>

      {/* Text editing section */}
      {selectedId && overlays.length > 0 && (
        <div className="px-4 py-3 border-t bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">Edit Text</label>
          <input
            type="text"
            value={overlays.find(o => o.id === selectedId)?.text || ''}
            onChange={(e) => updateText(selectedId, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Enter your text..."
          />
          
          {/* Suggested texts */}
          {suggestedTexts.length > 1 && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Suggestions:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {suggestedTexts.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => updateText(selectedId, text)}
                    className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors truncate max-w-[150px]"
                    title={text}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer with actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
        <div className="text-sm text-gray-500">
          {overlays.length === 0 
            ? 'No text added • Download clean image or add text'
            : isOutOfBounds(overlays[0]) 
              ? 'Text will be removed on download'
              : 'Text will be embedded in image'
          }
        </div>
        <button
          onClick={downloadImage}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  )
}

export default ImageTextOverlay
