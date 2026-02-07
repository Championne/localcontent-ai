'use client'

import { useState, useRef, useEffect } from 'react'

interface OverlayItem {
  id: string
  url: string
  x: number
  y: number
  scale: number
  type: 'logo' | 'photo'
}

export interface TextOverlayItem {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  colorKey: 'primary' | 'secondary' | 'accent'
}

export interface BrandColors {
  primary: string
  secondary: string
  accent: string
}

export type FrameStyle = 'thin' | 'solid' | 'thick' | 'double' | 'rounded'

export interface OverlayApplyPayload {
  imageOverlays: OverlayItem[]
  overlayBorderColors: Record<string, string>
  tintOverlay: { colorKey: 'primary' | 'secondary' | 'accent'; opacity: number } | null
  textOverlays: TextOverlayItem[]
  frame: { style: FrameStyle; colorKey: 'primary' | 'secondary' | 'accent' } | null
}

interface ImageOverlayEditorProps {
  imageUrl: string
  logoUrl?: string | null
  photoUrl?: string | null
  brandColors?: BrandColors | null
  tagline?: string | null
  website?: string | null
  socialHandles?: string | null
  onApply: (payload: OverlayApplyPayload) => void
  onSkip: () => void
  applying?: boolean
  onUploadLogo?: (file: File) => Promise<string | null>
  onUploadPhoto?: (file: File) => Promise<string | null>
}

const DEFAULT_BRAND: BrandColors = { primary: '#0d9488', secondary: '#6b7280', accent: '#6b7280' }

export default function ImageOverlayEditor({
  imageUrl,
  logoUrl,
  photoUrl,
  brandColors,
  tagline,
  website,
  socialHandles,
  onApply,
  onSkip,
  applying,
  onUploadLogo,
  onUploadPhoto,
}: ImageOverlayEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [overlays, setOverlays] = useState<OverlayItem[]>([])
  const [overlayBorderColors, setOverlayBorderColors] = useState<Record<string, string>>({})
  const [tintOverlay, setTintOverlay] = useState<{ colorKey: 'primary' | 'secondary' | 'accent'; opacity: number } | null>(null)
  const [frame, setFrame] = useState<{ style: FrameStyle; colorKey: 'primary' | 'secondary' | 'accent' } | null>(null)
  const [textOverlays, setTextOverlays] = useState<TextOverlayItem[]>([])
  const [draggingNew, setDraggingNew] = useState<'logo' | 'photo' | 'tagline' | 'website' | 'social' | null>(null)
  const [draggingExisting, setDraggingExisting] = useState<string | null>(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null)
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState<'logo' | 'photo' | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const colors = brandColors || DEFAULT_BRAND
  const effectiveLogoUrl = logoUrl || uploadedLogoUrl
  const effectivePhotoUrl = photoUrl || uploadedPhotoUrl

  const getHex = (key: 'primary' | 'secondary' | 'accent') => {
    const hex = colors[key]
    return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : colors.primary
  }

  const handleFileUpload = async (type: 'logo' | 'photo', file: File) => {
    if (!file.type.startsWith('image/')) return
    const upload = type === 'logo' ? onUploadLogo : onUploadPhoto
    if (!upload) return
    setUploading(type)
    try {
      const url = await upload(file)
      if (url) {
        if (type === 'logo') setUploadedLogoUrl(url)
        else setUploadedPhotoUrl(url)
      }
    } finally {
      setUploading(null)
    }
  }

  const handleDropOnZone = (type: 'logo' | 'photo', e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFileUpload(type, file)
  }

  const handleFileInput = (type: 'logo' | 'photo', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(type, file)
    e.target.value = ''
  }

  const handleSidebarDragStart = (type: 'logo' | 'photo' | 'tagline' | 'website' | 'social', e: React.MouseEvent | React.TouchEvent) => {
    if ((type === 'logo' || type === 'photo') && !(type === 'logo' ? effectiveLogoUrl : effectivePhotoUrl)) return
    e.preventDefault()
    setDraggingNew(type)
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
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
      if (draggingExisting.startsWith('text-')) {
        setTextOverlays(prev => prev.map(t => t.id === draggingExisting ? { ...t, x, y } : t))
      } else {
        setOverlays(prev => prev.map(o => {
          if (o.id === draggingExisting) {
            return { ...o, x: Math.max(0, Math.min(100 - o.scale, x - o.scale / 2)), y: Math.max(0, Math.min(100 - o.scale, y - o.scale / 2)) }
          }
          return o
        }))
      }
    }
  }

  const handleEnd = (e: MouseEvent | TouchEvent) => {
    if (draggingNew && containerRef.current) {
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY
      const rect = containerRef.current.getBoundingClientRect()
      const onImage = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
      const x = ((clientX - rect.left) / rect.width) * 100
      const y = ((clientY - rect.top) / rect.height) * 100

      if (draggingNew === 'tagline' || draggingNew === 'website' || draggingNew === 'social') {
        const text = draggingNew === 'tagline' ? (tagline || 'Your tagline') : draggingNew === 'website' ? (website || 'yoursite.com') : (socialHandles || '@yourhandle')
        if (onImage) setTextOverlays(prev => [...prev, { id: `text-${draggingNew}-${Date.now()}`, text, x, y, fontSize: 24, colorKey: 'primary' }])
      } else if (draggingNew === 'logo' || draggingNew === 'photo') {
        const url = draggingNew === 'logo' ? effectiveLogoUrl : effectivePhotoUrl
        if (url && onImage) {
          const scale = draggingNew === 'photo' ? 20 : 15
          const existing = overlays.find(o => o.type === draggingNew)
          if (existing) {
            setOverlays(prev => prev.map(o => o.type === draggingNew ? { ...o, x: Math.max(0, Math.min(100 - scale, x - scale / 2)), y: Math.max(0, Math.min(100 - scale, y - scale / 2)) } : o))
          } else {
            const id = `${draggingNew}-${Date.now()}`
            setOverlays(prev => [...prev, { id, url, x: Math.max(0, Math.min(100 - scale, x - scale / 2)), y: Math.max(0, Math.min(100 - scale, y - scale / 2)), scale, type: draggingNew }])
            setOverlayBorderColors(prev => ({ ...prev, [id]: getHex('primary') }))
          }
        }
      }
    }
    setDraggingNew(null)
    setDraggingExisting(null)
  }

  const handleRemove = (id: string) => {
    if (id.startsWith('text-')) {
      setTextOverlays(prev => prev.filter(t => t.id !== id))
    } else {
      setOverlays(prev => prev.filter(o => o.id !== id))
      setOverlayBorderColors(prev => { const next = { ...prev }; delete next[id]; return next })
    }
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
  const totalItems = overlays.length + textOverlays.length + (frame ? 1 : 0)

  const content = (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Customize Your Image</h3>
        <p className="text-sm text-gray-500">Drag logo, photo, tagline, website or social onto the image. Add a brand border or tint.</p>
      </div>
      
      <div className="flex">
        <div className="w-28 bg-gray-50 border-r border-gray-200 p-3 flex flex-col gap-3 overflow-y-auto max-h-[420px]">
          {/* Logo: show existing or drop zone to upload */}
          <div className="text-center">
            {effectiveLogoUrl ? (
              <div
                onMouseDown={(e) => handleSidebarDragStart('logo', e)}
                onTouchStart={(e) => handleSidebarDragStart('logo', e)}
                className={`w-16 h-16 mx-auto rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing transition-all ${
                  hasLogo ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                <img src={effectiveLogoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
            ) : onUploadLogo ? (
              <div
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-teal-400') }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('ring-2', 'ring-teal-400') }}
                onDrop={(e) => handleDropOnZone('logo', e)}
                onClick={() => logoInputRef.current?.click()}
                className="w-16 h-16 mx-auto rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer flex flex-col items-center justify-center gap-0.5 transition-all"
              >
                {uploading === 'logo' ? (
                  <svg className="animate-spin w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                    <span className="text-[9px] text-gray-500">Drop or click</span>
                  </>
                )}
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto rounded-lg border-2 border-dashed border-gray-200 bg-gray-100 flex items-center justify-center">
                <span className="text-[9px] text-gray-400 text-center">No logo</span>
              </div>
            )}
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileInput('logo', e)} />
            <span className="text-[10px] text-gray-500 mt-1 block">Logo</span>
            {hasLogo && <span className="text-[10px] text-teal-600">✓ On image</span>}
          </div>

          {/* Profile photo: show existing or drop zone to upload */}
          <div className="text-center">
            {effectivePhotoUrl ? (
              <div
                onMouseDown={(e) => handleSidebarDragStart('photo', e)}
                onTouchStart={(e) => handleSidebarDragStart('photo', e)}
                className={`w-16 h-16 mx-auto rounded-full border-2 border-dashed cursor-grab active:cursor-grabbing transition-all overflow-hidden ${
                  hasPhoto ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                <img src={effectivePhotoUrl} alt="Photo" className="w-full h-full object-cover" />
              </div>
            ) : onUploadPhoto ? (
              <div
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-teal-400') }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('ring-2', 'ring-teal-400') }}
                onDrop={(e) => handleDropOnZone('photo', e)}
                onClick={() => photoInputRef.current?.click()}
                className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer flex flex-col items-center justify-center gap-0.5 transition-all"
              >
                {uploading === 'photo' ? (
                  <svg className="animate-spin w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="text-[9px] text-gray-500">Drop or click</span>
                  </>
                )}
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-gray-200 bg-gray-100 flex items-center justify-center">
                <span className="text-[9px] text-gray-400">No photo</span>
              </div>
            )}
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileInput('photo', e)} />
            <span className="text-[10px] text-gray-500 mt-1 block">Photo</span>
            {hasPhoto && <span className="text-[10px] text-teal-600">✓ On image</span>}
          </div>

          {(tagline || website || socialHandles) && (
            <>
              {tagline && (
                <div
                  onMouseDown={(e) => handleSidebarDragStart('tagline', e)}
                  onTouchStart={(e) => handleSidebarDragStart('tagline', e)}
                  className="text-center cursor-grab active:cursor-grabbing p-1.5 rounded border border-dashed border-gray-300 hover:border-teal-400 bg-white"
                >
                  <span className="text-[9px] text-gray-600 block truncate" title={tagline}>{tagline}</span>
                  <span className="text-[9px] text-gray-400">Add Tagline</span>
                </div>
              )}
              {website && (
                <div
                  onMouseDown={(e) => handleSidebarDragStart('website', e)}
                  onTouchStart={(e) => handleSidebarDragStart('website', e)}
                  className="text-center cursor-grab active:cursor-grabbing p-1.5 rounded border border-dashed border-gray-300 hover:border-teal-400 bg-white"
                >
                  <span className="text-[9px] text-gray-600 block truncate" title={website}>{website}</span>
                  <span className="text-[9px] text-gray-400">Add website</span>
                </div>
              )}
              {socialHandles && (
                <div
                  onMouseDown={(e) => handleSidebarDragStart('social', e)}
                  onTouchStart={(e) => handleSidebarDragStart('social', e)}
                  className="text-center cursor-grab active:cursor-grabbing p-1.5 rounded border border-dashed border-gray-300 hover:border-teal-400 bg-white"
                >
                  <span className="text-[9px] text-gray-600 block truncate" title={socialHandles}>{socialHandles}</span>
                  <span className="text-[9px] text-gray-400">Add social</span>
                </div>
              )}
            </>
          )}

          {!effectiveLogoUrl && !effectivePhotoUrl && !onUploadLogo && !onUploadPhoto && !tagline && !website && !socialHandles && (
            <p className="text-xs text-gray-400 text-center">Add logo or photo in Brand Identity, or use drop zones above.</p>
          )}
        </div>
        
        {/* Main image canvas */}
        <div className="flex-1 p-4">
          {/* Frame live preview: padding + background color */}
          <div
            className="relative bg-gray-100 rounded-lg overflow-hidden"
            style={{
              aspectRatio: '1',
              padding: frame ? (frame.style === 'thin' ? 3 : frame.style === 'thick' ? 16 : 8) : 0,
              backgroundColor: frame ? getHex(frame.colorKey) : undefined,
              borderRadius: frame?.style === 'rounded' ? 12 : 0,
            }}
          >
            <div
              ref={containerRef}
              className="relative w-full h-full overflow-hidden"
              style={{
                aspectRatio: '1',
                borderRadius: frame?.style === 'rounded' ? 12 : 0,
                border: frame?.style === 'double' ? `2px solid ${frame ? getHex(frame.colorKey) : '#e5e7eb'}` : undefined,
              }}
            >
              <img 
                src={imageUrl} 
                alt="Generated" 
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Tint overlay - live preview */}
              {tintOverlay && (
                <div
                  className="absolute inset-0 pointer-events-none z-[1]"
                  style={{
                    backgroundColor: getHex(tintOverlay.colorKey),
                    opacity: typeof tintOverlay.opacity === 'number' ? tintOverlay.opacity : 0.25,
                  }}
                />
              )}
            
            {/* Rendered overlays - border color updates live */}
            {overlays.map(overlay => {
              const borderHex = overlayBorderColors[overlay.id] || getHex('primary')
              return (
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
                <span
                  className={`block w-full h-full ${overlay.type === 'photo' ? 'rounded-full' : 'rounded-lg'}`}
                  style={{ boxShadow: `0 0 0 2px ${borderHex}` }}
                >
                  <img 
                    src={overlay.url} 
                    alt="" 
                    className={`w-full h-full object-${overlay.type === 'photo' ? 'cover' : 'contain'} ${overlay.type === 'photo' ? 'rounded-full' : 'rounded-lg'} shadow-lg`}
                    draggable={false}
                  />
                </span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-1 bg-white rounded-lg shadow-lg p-1">
                  <span className="text-[9px] text-gray-500 mr-0.5">Border:</span>
                  {(['primary', 'secondary', 'accent'] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setOverlayBorderColors(prev => ({ ...prev, [overlay.id]: getHex(key) })) }}
                      className={`w-5 h-5 rounded-full border-2 ${(overlayBorderColors[overlay.id] || getHex('primary')) === getHex(key) ? 'border-gray-800 ring-1 ring-offset-1' : 'border-gray-200'}`}
                      style={{ backgroundColor: getHex(key) }}
                      title={key}
                    />
                  ))}
                  <button onClick={(e) => { e.stopPropagation(); handleScaleChange(overlay.id, -2) }} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold">−</button>
                  <button onClick={(e) => { e.stopPropagation(); handleScaleChange(overlay.id, 2) }} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold">+</button>
                  <button onClick={(e) => { e.stopPropagation(); handleRemove(overlay.id) }} className="w-6 h-6 rounded bg-red-100 hover:bg-red-200 text-red-600 text-xs">✕</button>
                </div>
              </div>
            );
            })}
            {textOverlays.map((t) => (
              <div
                key={t.id}
                onMouseDown={(e) => handleOverlayDragStart(t.id, e)}
                onTouchStart={(e) => handleOverlayDragStart(t.id, e)}
                className="absolute cursor-move group"
                style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <span
                  className="font-bold drop-shadow-lg px-1"
                  style={{ color: getHex(t.colorKey), fontSize: Math.min(24, Math.max(12, t.fontSize)) }}
                >
                  {t.text}
                </span>
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 flex gap-0.5 bg-white rounded shadow p-0.5">
                  {(['primary', 'secondary', 'accent'] as const).map((key) => (
                    <button key={key} type="button" onClick={(e) => { e.stopPropagation(); setTextOverlays(prev => prev.map(x => x.id === t.id ? { ...x, colorKey: key } : x)) }} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: getHex(key) }} title={key} />
                  ))}
                  <button onClick={(e) => { e.stopPropagation(); handleRemove(t.id) }} className="w-5 h-5 rounded bg-red-100 text-red-600 text-[10px]">✕</button>
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
          
          {/* Tint overlay */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTintOverlay(prev => prev?.colorKey === 'primary' && prev?.opacity === 0.15 ? null : { colorKey: 'primary', opacity: 0.15 })}
              className="text-xs px-2 py-1 rounded border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
              title="Apply a light brand tint (15% primary colour)"
            >
              Light brand tint
            </button>
            <span className="text-xs text-gray-500">or pick colour:</span>
            {(['primary', 'secondary', 'accent'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTintOverlay(prev => prev?.colorKey === key ? null : { colorKey: key, opacity: prev?.opacity ?? 0.25 })}
                className={`w-6 h-6 rounded-full border-2 ${tintOverlay?.colorKey === key ? 'border-gray-800' : 'border-gray-200'}`}
                style={{ backgroundColor: getHex(key) }}
                title={`Tint with ${key}`}
              />
            ))}
            {tintOverlay && (
              <label className="flex items-center gap-1 text-xs text-gray-600">
                Opacity:
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={typeof tintOverlay.opacity === 'number' ? tintOverlay.opacity : 0.25}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    if (!Number.isNaN(v)) setTintOverlay(prev => prev ? { ...prev, opacity: v } : null)
                  }}
                  className="w-20"
                />
                <span>{Math.round((typeof tintOverlay.opacity === 'number' ? tintOverlay.opacity : 0.25) * 100)}%</span>
              </label>
            )}
          </div>
          {/* Frame around picture */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Frame:</span>
            <select
              value={frame?.style ?? ''}
              onChange={(e) => {
                const v = e.target.value as FrameStyle | ''
                if (!v) setFrame(null)
                else setFrame(prev => ({ style: v, colorKey: prev?.colorKey ?? 'primary' }))
              }}
              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
            >
              <option value="">None</option>
              <option value="thin">Thin</option>
              <option value="solid">Solid</option>
              <option value="thick">Thick</option>
              <option value="double">Double</option>
              <option value="rounded">Rounded</option>
            </select>
            {frame && (
              <>
                {(['primary', 'secondary', 'accent'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFrame(prev => prev ? { ...prev, colorKey: key } : null)}
                    className={`w-5 h-5 rounded-full border-2 ${frame.colorKey === key ? 'border-gray-800' : 'border-gray-200'}`}
                    style={{ backgroundColor: getHex(key) }}
                    title={key}
                  />
                ))}
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            {totalItems === 0 ? 'Drag from the left onto the image' : 'Drag to reposition • Hover for border/colour controls'}
          </p>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
        <button onClick={onSkip} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Skip</button>
        <button
          onClick={() => onApply({
            imageOverlays: overlays,
            overlayBorderColors,
            tintOverlay,
            textOverlays,
            frame
          })}
          disabled={applying || (overlays.length === 0 && textOverlays.length === 0 && !frame && !tintOverlay)}
          className="px-6 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {applying ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Applying...
            </>
          ) : (
            <>Apply {totalItems > 0 && `(${totalItems})`}</>
          )}
        </button>
      </div>
      
      {/* Drag preview */}
      {draggingNew && (effectiveLogoUrl || effectivePhotoUrl) && (
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
            src={draggingNew === 'logo' ? effectiveLogoUrl! : effectivePhotoUrl!} 
            alt="" 
            className={`w-full h-full object-${draggingNew === 'photo' ? 'cover' : 'contain'} ${draggingNew === 'photo' ? 'rounded-full' : 'rounded-lg'} shadow-xl`}
          />
        </div>
      )}
    </div>
  )

  return content
}
