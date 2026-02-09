'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ImageOverlayEditorView } from './ImageOverlayEditorView'

export interface OverlayItem {
  id: string
  url: string
  x: number
  y: number
  scale: number
  type: 'logo' | 'photo'
}

export type TextOverlayFont = 'Inter' | 'Georgia' | 'Playfair Display' | 'system-ui'

export const TEXT_FONT_OPTIONS: { value: TextOverlayFont; label: string }[] = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Playfair Display', label: 'Playfair' },
  { value: 'system-ui', label: 'System' },
]

export interface TextOverlayItem {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: TextOverlayFont
  colorKey: 'primary' | 'secondary' | 'accent'
}

export interface BrandColors {
  primary: string
  secondary: string
  accent: string
}

export type FrameStyle =
  | 'thin'
  | 'solid'
  | 'thick'
  | 'double'
  | 'classic'
  | 'wooden'
  | 'filmstrip'
  | 'vignette'
  | 'neon'
  | 'shadow'
  | 'gold'
  | 'silver'
  | 'copper'

export type FrameColorKey = 'primary' | 'secondary' | 'accent' | 'silver' | 'gold' | 'copper' | 'neutral'

export const FRAME_PRESET_COLORS: Record<'silver' | 'gold' | 'copper' | 'neutral', string> = {
  silver: '#C0C0C0',
  gold: '#D4AF37',
  copper: '#B87333',
  neutral: '#9CA3AF',
}

export interface OverlayApplyPayload {
  imageOverlays: OverlayItem[]
  overlayBorderColors: Record<string, string>
  tintOverlay: { colorKey: 'primary' | 'secondary' | 'accent'; opacity: number } | null
  textOverlays: TextOverlayItem[]
  frame: { style: FrameStyle; colorKey: FrameColorKey } | null
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
  /** Pre-fill overlay state (e.g. from applied branding recommendation) so user can fine-tune */
  initialState?: OverlayApplyPayload | null
}

const DEFAULT_BRAND: BrandColors = { primary: '#0d9488', secondary: '#6b7280', accent: '#6b7280' }

// Predefined positions (percent) for "Auto-position all" — logo top-left, photo top-right, tagline bottom-left, social + website bottom-right at same height
const DEFAULT_LOGO = { x: 5, y: 5, scale: 16 }
const DEFAULT_PHOTO = { x: 77, y: 5, scale: 18 }
const DEFAULT_TAGLINE = { x: 3, y: 92, fontSize: 20 }
const DEFAULT_SOCIAL = { x: 97, y: 90, fontSize: 13 }
const DEFAULT_WEBSITE = { x: 97, y: 94, fontSize: 12 }

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
  initialState,
}: ImageOverlayEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [overlays, setOverlays] = useState<OverlayItem[]>(() => initialState?.imageOverlays ?? [])
  const [overlayBorderColors, setOverlayBorderColors] = useState<Record<string, string>>(() => initialState?.overlayBorderColors ?? {})
  const [tintOverlay, setTintOverlay] = useState<{ colorKey: 'primary' | 'secondary' | 'accent'; opacity: number } | null>(() => initialState?.tintOverlay ?? null)
  const [frame, setFrame] = useState<{ style: FrameStyle; colorKey: FrameColorKey } | null>(() => initialState?.frame ?? null)
  const [textOverlays, setTextOverlays] = useState<TextOverlayItem[]>(() => initialState?.textOverlays ?? [])
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

  const getFrameHex = (key: FrameColorKey): string => {
    if (key === 'silver' || key === 'gold' || key === 'copper' || key === 'neutral') return FRAME_PRESET_COLORS[key]
    return getHex(key)
  }

  const handleArrangeAll = () => {
    const primaryHex = /^#[0-9A-Fa-f]{6}$/.test(colors.primary) ? colors.primary : '#0d9488'

    // --- Image overlays: reposition existing ones, or add missing ones ---
    setOverlays(prev => {
      const result: OverlayItem[] = []
      const existingLogo = prev.find(o => o.type === 'logo')
      const existingPhoto = prev.find(o => o.type === 'photo')

      if (effectiveLogoUrl) {
        if (existingLogo) {
          // Keep scale + id, only update position
          result.push({ ...existingLogo, x: DEFAULT_LOGO.x, y: DEFAULT_LOGO.y, url: effectiveLogoUrl })
        } else {
          result.push({ id: 'logo-default', url: effectiveLogoUrl, x: DEFAULT_LOGO.x, y: DEFAULT_LOGO.y, scale: DEFAULT_LOGO.scale, type: 'logo' })
        }
      }
      if (effectivePhotoUrl) {
        if (existingPhoto) {
          result.push({ ...existingPhoto, x: DEFAULT_PHOTO.x, y: DEFAULT_PHOTO.y, url: effectivePhotoUrl })
        } else {
          result.push({ id: 'photo-default', url: effectivePhotoUrl, x: DEFAULT_PHOTO.x, y: DEFAULT_PHOTO.y, scale: DEFAULT_PHOTO.scale, type: 'photo' })
        }
      }
      return result
    })

    // Keep existing border colours — only set defaults for newly added overlays
    setOverlayBorderColors(prev => {
      const next = { ...prev }
      if (effectiveLogoUrl && !next['logo-default']) next['logo-default'] = primaryHex
      if (effectivePhotoUrl && !next['photo-default']) next['photo-default'] = primaryHex
      return next
    })

    // --- Text overlays: reposition existing ones (keep font, size, colour), or add missing ---
    setTextOverlays(prev => {
      const existingTagline = prev.find(t => t.id === 'text-tagline-default')
      const existingSocial = prev.find(t => t.id === 'text-social-default')
      const existingWebsite = prev.find(t => t.id === 'text-website-default')
      const result: TextOverlayItem[] = []

      if (tagline?.trim()) {
        if (existingTagline) {
          result.push({ ...existingTagline, x: DEFAULT_TAGLINE.x, y: DEFAULT_TAGLINE.y, text: tagline.trim() })
        } else {
          result.push({ id: 'text-tagline-default', text: tagline.trim(), x: DEFAULT_TAGLINE.x, y: DEFAULT_TAGLINE.y, fontSize: DEFAULT_TAGLINE.fontSize, fontFamily: 'Inter', colorKey: 'primary' })
        }
      }
      if (socialHandles?.trim()) {
        if (existingSocial) {
          result.push({ ...existingSocial, x: DEFAULT_SOCIAL.x, y: DEFAULT_SOCIAL.y, text: socialHandles.trim() })
        } else {
          result.push({ id: 'text-social-default', text: socialHandles.trim(), x: DEFAULT_SOCIAL.x, y: DEFAULT_SOCIAL.y, fontSize: DEFAULT_SOCIAL.fontSize, fontFamily: 'Inter', colorKey: 'primary' })
        }
      }
      if (website?.trim()) {
        if (existingWebsite) {
          result.push({ ...existingWebsite, x: DEFAULT_WEBSITE.x, y: DEFAULT_WEBSITE.y, text: website.trim() })
        } else {
          result.push({ id: 'text-website-default', text: website.trim(), x: DEFAULT_WEBSITE.x, y: DEFAULT_WEBSITE.y, fontSize: DEFAULT_WEBSITE.fontSize, fontFamily: 'Inter', colorKey: 'primary' })
        }
      }
      return result
    })
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
        if (onImage) setTextOverlays(prev => [...prev, { id: `text-${draggingNew}-${Date.now()}`, text, x, y, fontSize: 24, fontFamily: 'Inter', colorKey: 'primary' }])
      } else if (draggingNew === 'logo' || draggingNew === 'photo') {
        const url = draggingNew === 'logo' ? effectiveLogoUrl : effectivePhotoUrl
        if (url && onImage) {
          const scale = draggingNew === 'photo' ? 20 : 15
          const dropType = draggingNew
          const newId = `${dropType}-${Date.now()}`
          // Use functional update to always check against latest state
          // (avoids stale closure causing duplicate overlays)
          setOverlays(prev => {
            const existing = prev.find(o => o.type === dropType)
            if (existing) {
              return prev.map(o => o.type === dropType ? { ...o, x: Math.max(0, Math.min(100 - scale, x - scale / 2)), y: Math.max(0, Math.min(100 - scale, y - scale / 2)) } : o)
            }
            return [...prev, { id: newId, url, x: Math.max(0, Math.min(100 - scale, x - scale / 2)), y: Math.max(0, Math.min(100 - scale, y - scale / 2)), scale, type: dropType }]
          })
          setOverlayBorderColors(prev => ({ ...prev, [newId]: getHex('primary') }))
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

  return React.createElement(ImageOverlayEditorView, {
    imageUrl,
    containerRef,
    overlays,
    setOverlays,
    overlayBorderColors,
    setOverlayBorderColors,
    tintOverlay,
    setTintOverlay,
    frame,
    setFrame,
    textOverlays,
    setTextOverlays,
    draggingNew,
    dragPosition,
    effectiveLogoUrl,
    effectivePhotoUrl,
    getHex,
    getFrameHex,
    hasLogo,
    hasPhoto,
    totalItems,
    onApply,
    onSkip,
    applying,
    handleSidebarDragStart,
    handleOverlayDragStart,
    handleScaleChange,
    handleRemove,
    handleFileInput,
    handleDropOnZone,
    logoInputRef,
    photoInputRef,
    uploading,
    tagline,
    website,
    socialHandles,
    onUploadLogo,
    onUploadPhoto,
    onArrangeAll: handleArrangeAll,
  })
}
