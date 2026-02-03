'use client'

import { useState, useRef, useEffect } from 'react'

interface OverlayItem {
  id: string
  url: string
  x: number // percentage
  y: number // percentage
  scale: number // percentage of image width
  type: 'logo' | 'photo'
}

interface ImageOverlayEditorProps {
  imageUrl: string
  logoUrl?: string | null
  photoUrl?: string | null
  onApply: (overlays: OverlayItem[]) => void
  onSkip: () => void
  applying?: boolean
}

export default function ImageOverlayEditor({
  imageUrl,
  logoUrl,
  photoUrl,
  onApply,
  onSkip,
  applying
}: ImageOverlayEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [overlays, setOverlays] = useState<OverlayItem[]>([])
  const [draggingNew, setDraggingNew] = useState<'logo' | 'photo' | null>(null)
  const [draggingExisting, setDraggingExisting] = useState<string | null>(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })

  // Handle starting drag from sidebar
  const handleSidebarDragStart = (type: 'logo' | 'photo', e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setDraggingNew(type)
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setDragPosition({ x: clientX, y: clientY })
  }

  // Handle dragging existing overlay
  const handleOverlayDragStart = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingExisting(id)
  }

  // Handle mouse/touch move
  const handleMove = (e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setDragPosition({ x: clientX, y: clientY })

    if (draggingExisting && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 100
      const y = ((clientY - rect.top) / rect.height) * 100
      
      setOverlays(prev => prev.map(o => {
        if (o.id === draggingExisting) {
          return {
            ...o,
            x: Math.max(0, Math.min(100 - o.scale, x - o.scale / 2)),
            y: Math.max(0, Math.min(100 - o.scale, y - o.scale / 2))
          }
        }
        return o
      }))
    }
  }

  // Handle drop
  const handleEnd = (e: MouseEvent | TouchEvent) => {
    if (draggingNew && containerRef.current) {
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY
      
      const rect = containerRef.current.getBoundingClientRect()
      
      // Check if dropped on the image
      if (clientX >= rect.left && clientX <= rect.right && 
          clientY >= rect.top && clientY <= rect.bottom) {
        const x = ((clientX - rect.left) / rect.width) * 100
        const y = ((clientY - rect.top) / rect.height) * 100
        const scale = draggingNew === 'photo' ? 20 : 15
        
        const url = draggingNew === 'logo' ? logoUrl : photoUrl
        if (url) {
          // Check if this type already exists
          const existing = overlays.find(o => o.type === draggingNew)
          if (existing) {
            // Update position
            setOverlays(prev => prev.map(o => 
              o.type === draggingNew 
                ? { ...o, x: Math.max(0, Math.min(100 - scale, x - scale / 2)), y: Math.max(0, Math.min(100 - scale, y - scale / 2)) }
                : o
            ))
          } else {
            // Add new
            setOverlays(prev => [...prev, {
              id: `${draggingNew}-${Date.now()}`,
              url,
              x: Math.max(0, Math.min(100 - scale, x - scale / 2)),
              y: Math.max(0, Math.min(100 - scale, y - scale / 2)),
              scale,
              type: draggingNew
            }])
          }
        }
      }
    }
    
    setDraggingNew(null)
    setDraggingExisting(null)
  }

  // Remove overlay
  const handleRemove = (id: string) => {
    setOverlays(prev => prev.filter(o => o.id !== id))
  }

  // Adjust scale
  const handleScaleChange = (id: string, delta: number) => {
    setOverlays(prev => prev.map(o => {
      if (o.id === id) {
        const newScale = Math.max(5, Math.min(40, o.scale + delta))
        return { ...o, scale: newScale }
      }
      return o
    }))
  }

  useEffect(() => {
    if (draggingNew || draggingExisting) {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleEnd)
      document.addEventListener('touchmove', handleMove)
      document.addEventListener('touchend', handleEnd)
      return () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleEnd)
        document.removeEventListener('touchmove', handleMove)
        document.removeEventListener('touchend', handleEnd)
      }
    }
  }, [draggingNew, draggingExisting])

  const hasLogo = overlays.some(o => o.type === 'logo')
  const hasPhoto = overlays.some(o => o.type === 'photo')

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Customize Your Image</h3>
        <p className="text-sm text-gray-500">Drag your logo or photo onto the image</p>
      </div>
      
      <div className="flex">
        {/* Sidebar with draggable items */}
        <div className="w-24 bg-gray-50 border-r border-gray-200 p-3 flex flex-col gap-3">
          {logoUrl && (
            <div className="text-center">
              <div
                onMouseDown={(e) => handleSidebarDragStart('logo', e)}
                onTouchStart={(e) => handleSidebarDragStart('logo', e)}
                className={`w-16 h-16 mx-auto rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing transition-all ${
                  hasLogo ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block">Logo</span>
              {hasLogo && <span className="text-[10px] text-teal-600">✓ Added</span>}
            </div>
          )}
          
          {photoUrl && (
            <div className="text-center">
              <div
                onMouseDown={(e) => handleSidebarDragStart('photo', e)}
                onTouchStart={(e) => handleSidebarDragStart('photo', e)}
                className={`w-16 h-16 mx-auto rounded-full border-2 border-dashed cursor-grab active:cursor-grabbing transition-all overflow-hidden ${
                  hasPhoto ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block">Photo</span>
              {hasPhoto && <span className="text-[10px] text-teal-600">✓ Added</span>}
            </div>
          )}
          
          {!logoUrl && !photoUrl && (
            <p className="text-xs text-gray-400 text-center">Add logo or photo in Settings</p>
          )}
        </div>
        
        {/* Main image canvas */}
        <div className="flex-1 p-4">
          <div 
            ref={containerRef}
            className="relative bg-gray-100 rounded-lg overflow-hidden"
            style={{ aspectRatio: '1' }}
          >
            <img 
              src={imageUrl} 
              alt="Generated" 
              className="w-full h-full object-cover"
              draggable={false}
            />
            
            {/* Rendered overlays */}
            {overlays.map(overlay => (
              <div
                key={overlay.id}
                onMouseDown={(e) => handleOverlayDragStart(overlay.id, e)}
                onTouchStart={(e) => handleOverlayDragStart(overlay.id, e)}
                className="absolute cursor-move group"
                style={{
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  width: `${overlay.scale}%`,
                  height: `${overlay.scale}%`,
                }}
              >
                <img 
                  src={overlay.url} 
                  alt="" 
                  className={`w-full h-full object-${overlay.type === 'photo' ? 'cover' : 'contain'} ${overlay.type === 'photo' ? 'rounded-full' : 'rounded-lg'} shadow-lg ring-2 ring-white`}
                  draggable={false}
                />
                {/* Controls */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white rounded-lg shadow-lg p-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleScaleChange(overlay.id, -2) }}
                    className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold"
                  >−</button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleScaleChange(overlay.id, 2) }}
                    className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold"
                  >+</button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemove(overlay.id) }}
                    className="w-6 h-6 rounded bg-red-100 hover:bg-red-200 text-red-600 text-xs"
                  >✕</button>
                </div>
              </div>
            ))}
            
            {/* Drop zone indicator */}
            {draggingNew && (
              <div className="absolute inset-0 bg-teal-500/10 border-2 border-dashed border-teal-500 flex items-center justify-center">
                <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Drop here
                </span>
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <p className="text-xs text-gray-400 text-center mt-2">
            {overlays.length === 0 
              ? 'Drag logo or photo from the left onto the image' 
              : 'Drag to reposition • Hover for size controls'}
          </p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Skip
        </button>
        <button
          onClick={() => onApply(overlays)}
          disabled={applying || overlays.length === 0}
          className="px-6 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {applying ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Applying...
            </>
          ) : (
            <>Apply {overlays.length > 0 && `(${overlays.length})`}</>
          )}
        </button>
      </div>
      
      {/* Drag preview */}
      {draggingNew && (
        <div 
          className="fixed pointer-events-none z-50 opacity-70"
          style={{ 
            left: dragPosition.x - 30, 
            top: dragPosition.y - 30,
            width: 60,
            height: 60
          }}
        >
          <img 
            src={draggingNew === 'logo' ? logoUrl! : photoUrl!} 
            alt="" 
            className={`w-full h-full object-${draggingNew === 'photo' ? 'cover' : 'contain'} ${draggingNew === 'photo' ? 'rounded-full' : 'rounded-lg'} shadow-xl`}
          />
        </div>
      )}
    </div>
  )
}
