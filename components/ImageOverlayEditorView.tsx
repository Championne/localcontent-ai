'use client'

import React from 'react'
import type { OverlayItem, TextOverlayItem, FrameStyle, FrameColorKey, OverlayApplyPayload, TextOverlayFont } from './ImageOverlayEditor'
import { TEXT_FONT_OPTIONS } from './ImageOverlayEditor'

export interface ImageOverlayEditorViewProps {
  imageUrl: string
  containerRef: React.RefObject<HTMLDivElement | null>
  overlays: OverlayItem[]
  setOverlays: React.Dispatch<React.SetStateAction<OverlayItem[]>>
  overlayBorderColors: Record<string, string>
  setOverlayBorderColors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  tintOverlay: { colorKey: 'primary' | 'secondary' | 'accent'; opacity: number } | null
  setTintOverlay: React.Dispatch<React.SetStateAction<{ colorKey: 'primary' | 'secondary' | 'accent'; opacity: number } | null>>
  frame: { style: FrameStyle; colorKey: FrameColorKey } | null
  setFrame: React.Dispatch<React.SetStateAction<{ style: FrameStyle; colorKey: FrameColorKey } | null>>
  textOverlays: TextOverlayItem[]
  setTextOverlays: React.Dispatch<React.SetStateAction<TextOverlayItem[]>>
  draggingNew: 'logo' | 'photo' | 'tagline' | 'website' | 'social' | null
  dragPosition: { x: number; y: number }
  effectiveLogoUrl: string | null
  effectivePhotoUrl: string | null
  getHex: (key: 'primary' | 'secondary' | 'accent') => string
  getFrameHex: (key: FrameColorKey) => string
  hasLogo: boolean
  hasPhoto: boolean
  totalItems: number
  onApply: (payload: OverlayApplyPayload) => void
  onSkip: () => void
  applying?: boolean
  handleSidebarDragStart: (type: 'logo' | 'photo' | 'tagline' | 'website' | 'social', e: React.MouseEvent | React.TouchEvent) => void
  handleOverlayDragStart: (id: string, e: React.MouseEvent | React.TouchEvent) => void
  handleScaleChange: (id: string, delta: number) => void
  handleRemove: (id: string) => void
  handleFileInput: (type: 'logo' | 'photo', e: React.ChangeEvent<HTMLInputElement>) => void
  handleDropOnZone: (type: 'logo' | 'photo', e: React.DragEvent) => void
  logoInputRef: React.RefObject<HTMLInputElement | null>
  photoInputRef: React.RefObject<HTMLInputElement | null>
  uploading: 'logo' | 'photo' | null
  tagline?: string | null
  website?: string | null
  socialHandles?: string | null
  onUploadLogo?: (file: File) => Promise<string | null>
  onUploadPhoto?: (file: File) => Promise<string | null>
}

function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0')
  return hex + a
}

function darkenHex(hex: string, factor: number): string {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor)
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor)
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor)
  return '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('')
}

export function ImageOverlayEditorView(p: ImageOverlayEditorViewProps) {
  const primary = p.getHex('primary')
  const primaryDark = darkenHex(primary, 0.5)
  const headerBg = hexWithAlpha(primary, 0.08)
  const sidebarBg = hexWithAlpha(primary, 0.06)
  const buttonBg = hexWithAlpha(primary, 0.12)
  const buttonBorder = hexWithAlpha(primary, 0.35)

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200" style={{ backgroundColor: hexWithAlpha(primary, 0.03) }}>
      {/* Header: prominent logo top-left so user is immersed in their brand */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200/80" style={{ backgroundColor: headerBg }}>
        <div className="flex-shrink-0">
          {p.effectiveLogoUrl ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 shadow-sm" style={{ borderColor: buttonBorder }}>
              <img src={p.effectiveLogoUrl} alt="Your brand" className="w-full h-full object-contain bg-white" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 bg-white/80" style={{ borderColor: buttonBorder }}>
              <span className="text-[10px] font-medium text-gray-400 text-center px-1">Your logo</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900">Customize Your Image</h3>
          <p className="text-sm text-gray-600 mt-0.5">Drag logo, photo, tagline, website or social onto the image. Add a brand border or tint.</p>
        </div>
      </div>

      <div className="flex">
        <div className="w-32 sm:w-36 border-r border-gray-200/80 p-3 flex flex-col gap-3 overflow-y-auto max-h-[420px]" style={{ backgroundColor: sidebarBg }}>
          <div className="text-center">
            {p.effectiveLogoUrl ? (
              <div
                onMouseDown={(e) => p.handleSidebarDragStart('logo', e)}
                onTouchStart={(e) => p.handleSidebarDragStart('logo', e)}
                className="w-14 h-14 mx-auto rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all overflow-hidden flex items-center justify-center"
                style={{ borderColor: p.hasLogo ? primary : buttonBorder, backgroundColor: p.hasLogo ? hexWithAlpha(primary, 0.15) : 'white' }}
              >
                <img src={p.effectiveLogoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : p.onUploadLogo ? (
              <div
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.boxShadow = `0 0 0 2px ${primary}` }}
                onDragLeave={(e) => { e.currentTarget.style.boxShadow = '' }}
                onDrop={(e) => p.handleDropOnZone('logo', e)}
                onClick={() => p.logoInputRef.current?.click()}
                className="w-14 h-14 mx-auto rounded-lg border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-0.5 transition-all bg-white"
                style={{ borderColor: buttonBorder }}
              >
                {p.uploading === 'logo' ? (
                  <svg className="animate-spin w-5 h-5" style={{ color: primary }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                    <span className="text-[8px] text-gray-500">Drop or click</span>
                  </>
                )}
              </div>
            ) : (
              <div className="w-14 h-14 mx-auto rounded-lg border-2 border-dashed border-gray-200 bg-white/60 flex items-center justify-center">
                <span className="text-[8px] text-gray-400 text-center">No logo</span>
              </div>
            )}
            <input ref={p.logoInputRef as React.RefObject<HTMLInputElement>} type="file" accept="image/*" className="hidden" onChange={(e) => p.handleFileInput('logo', e)} />
            <span className="text-[10px] font-medium mt-1 block" style={{ color: primaryDark }}>Logo</span>
            {p.hasLogo && <span className="text-[9px] font-medium" style={{ color: primaryDark }}>✓ On image</span>}
          </div>

          <div className="text-center">
            {p.effectivePhotoUrl ? (
              <div
                onMouseDown={(e) => p.handleSidebarDragStart('photo', e)}
                onTouchStart={(e) => p.handleSidebarDragStart('photo', e)}
                className="w-14 h-14 mx-auto rounded-full border-2 cursor-grab active:cursor-grabbing transition-all overflow-hidden flex items-center justify-center"
                style={{ borderColor: p.hasPhoto ? primary : buttonBorder, backgroundColor: p.hasPhoto ? hexWithAlpha(primary, 0.15) : 'white' }}
              >
                <img src={p.effectivePhotoUrl} alt="Photo" className="w-full h-full object-cover" />
              </div>
            ) : p.onUploadPhoto ? (
              <div
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.boxShadow = `0 0 0 2px ${primary}` }}
                onDragLeave={(e) => { e.currentTarget.style.boxShadow = '' }}
                onDrop={(e) => p.handleDropOnZone('photo', e)}
                onClick={() => p.photoInputRef.current?.click()}
                className="w-14 h-14 mx-auto rounded-full border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-0.5 transition-all bg-white"
                style={{ borderColor: buttonBorder }}
              >
                {p.uploading === 'photo' ? (
                  <svg className="animate-spin w-5 h-5" style={{ color: primary }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="text-[8px] text-gray-500">Drop or click</span>
                  </>
                )}
              </div>
            ) : (
              <div className="w-14 h-14 mx-auto rounded-full border-2 border-dashed border-gray-200 bg-white/60 flex items-center justify-center">
                <span className="text-[8px] text-gray-400">No photo</span>
              </div>
            )}
            <input ref={p.photoInputRef as React.RefObject<HTMLInputElement>} type="file" accept="image/*" className="hidden" onChange={(e) => p.handleFileInput('photo', e)} />
            <span className="text-[10px] font-medium mt-1 block" style={{ color: primaryDark }}>Photo</span>
            {p.hasPhoto && <span className="text-[9px] font-medium" style={{ color: primaryDark }}>✓ On image</span>}
          </div>

          {(p.tagline || p.website || p.socialHandles) && (
            <div className="space-y-2">
              {p.tagline && (
                <div
                  onMouseDown={(e) => p.handleSidebarDragStart('tagline', e)}
                  onTouchStart={(e) => p.handleSidebarDragStart('tagline', e)}
                  className="cursor-grab active:cursor-grabbing p-2.5 rounded-lg transition-all hover:shadow-md border-2 bg-white text-left"
                  style={{ borderColor: buttonBorder }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryDark }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                    <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: primaryDark }}>Tagline</span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-800 block truncate" title={p.tagline}>{p.tagline}</span>
                </div>
              )}
              {p.website && (
                <div
                  onMouseDown={(e) => p.handleSidebarDragStart('website', e)}
                  onTouchStart={(e) => p.handleSidebarDragStart('website', e)}
                  className="cursor-grab active:cursor-grabbing p-2.5 rounded-lg transition-all hover:shadow-md border-2 bg-white text-left"
                  style={{ borderColor: buttonBorder }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryDark }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: primaryDark }}>Website</span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-800 block truncate" title={p.website}>{p.website}</span>
                </div>
              )}
              {p.socialHandles && (
                <div
                  onMouseDown={(e) => p.handleSidebarDragStart('social', e)}
                  onTouchStart={(e) => p.handleSidebarDragStart('social', e)}
                  className="cursor-grab active:cursor-grabbing p-2.5 rounded-lg transition-all hover:shadow-md border-2 bg-white text-left"
                  style={{ borderColor: buttonBorder }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryDark }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-3-4H9a2 2 0 01-2-2v-2H5a2 2 0 01-2-2V6a2 2 0 012-2h2v4l3 4h4v2z" /></svg>
                    <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: primaryDark }}>Social</span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-800 block truncate" title={p.socialHandles}>{p.socialHandles}</span>
                </div>
              )}
            </div>
          )}

          {!p.effectiveLogoUrl && !p.effectivePhotoUrl && !p.onUploadLogo && !p.onUploadPhoto && !p.tagline && !p.website && !p.socialHandles && (
            <p className="text-xs text-gray-400 text-center">Add logo or photo in Brand Identity, or use drop zones above.</p>
          )}
          <p className="text-xs text-gray-400 text-center mt-3 pt-2 border-t border-gray-200/60">
            {p.totalItems === 0 ? 'Drag from the left onto the image' : 'Drag to reposition • Hover for border/colour controls'}
          </p>
        </div>

        <div className="flex-1 p-4 flex flex-col items-center min-w-0 max-w-[360px]">
          <div
            className="relative bg-gray-100 rounded-lg overflow-hidden w-full"
            style={{
              aspectRatio: '1',
              ...(p.frame?.style === 'polaroid' ? { paddingTop: 12, paddingLeft: 12, paddingRight: 12, paddingBottom: 28 } : { padding: p.frame ? (p.frame.style === 'thin' ? 3 : p.frame.style === 'classic' || p.frame.style === 'wooden' ? 20 : p.frame.style === 'thick' || p.frame.style === 'gold' || p.frame.style === 'silver' || p.frame.style === 'copper' ? 16 : p.frame.style === 'filmstrip' ? 32 : p.frame.style === 'neon' ? 32 : p.frame.style === 'shadow' ? 40 : p.frame.style === 'vignette' ? 0 : 8) : 0 }),
              ...(p.frame?.style === 'classic'
                ? {
                    background: 'linear-gradient(135deg, #f5e6a8 0%, #e8c547 25%, #b8860b 55%, #7d6510 85%, #5c4a1a 100%), linear-gradient(315deg, rgba(0,0,0,0.15) 0%, transparent 40%)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,254,248,0.4)',
                  }
                : p.frame?.style === 'wooden'
                ? {
                    background: 'linear-gradient(135deg, #d4a574 0%, #a67c52 30%, #7d5a3a 60%, #5c3d2e 85%, #3d2817 100%), linear-gradient(315deg, rgba(0,0,0,0.12) 0%, transparent 45%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,235,215,0.25), inset 0 -1px 0 rgba(0,0,0,0.2)',
                  }
                : p.frame?.style === 'gold'
                ? { background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.2) 25%, transparent 45%), linear-gradient(135deg, #fffce0 0%, #f0d84a 8%, #d4a817 25%, #a67c0a 45%, #5c4a0a 75%, #3d3008 100%)' }
                : p.frame?.style === 'silver'
                ? { background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.25) 25%, transparent 45%), linear-gradient(135deg, #ffffff 0%, #e8e8e8 12%, #c0c0c0 35%, #808080 60%, #404040 85%, #1a1a1a 100%)' }
                : p.frame?.style === 'copper'
                ? { background: 'linear-gradient(135deg, rgba(255,253,248,0.5) 0%, rgba(255,240,220,0.15) 25%, transparent 45%), linear-gradient(135deg, #fdf5eb 0%, #e8b878 15%, #c48450 40%, #8b4513 68%, #5c2e0a 88%, #2d1804 100%)' }
                : {
                    backgroundColor: p.frame ? (p.frame.style === 'polaroid' ? '#fcf9f2' : p.frame.style === 'filmstrip' ? '#121212' : p.frame.style === 'neon' ? '#0a0a0e' : p.frame.style === 'shadow' ? '#f5f7fa' : p.frame.style === 'vignette' ? undefined : p.getFrameHex(p.frame.colorKey)) : undefined,
                  }),
              borderRadius: p.frame?.style === 'rounded' ? 12 : 0,
            }}
          >
            <div
              ref={p.containerRef as React.RefObject<HTMLDivElement>}
              className="relative w-full h-full overflow-hidden"
                style={{
                aspectRatio: '1',
                borderRadius: p.frame?.style === 'rounded' ? 12 : 0,
                ...(p.frame?.style === 'double'
                  ? {
                      padding: '8px',
                      background: '#ffffff',
                      border: `2px solid ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#e5e7eb'}`,
                      boxSizing: 'border-box',
                    }
                  : {}),
                ...(p.frame?.style !== 'double' && {
                  border: p.frame?.style === 'classic' || p.frame?.style === 'wooden' ? undefined : p.frame?.style === 'gold' ? '2px solid rgba(255,248,220,0.9)' : p.frame?.style === 'silver' ? '2px solid rgba(255,255,255,0.95)' : p.frame?.style === 'copper' ? '2px solid rgba(253,240,224,0.9)' : p.frame?.style === 'dashed' ? `3px dashed ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#e5e7eb'}` : p.frame?.style === 'dotted' ? `3px dotted ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#e5e7eb'}` : p.frame?.style === 'polaroid' ? '2px solid #e6e2d8' : p.frame?.style === 'filmstrip' ? '1px solid #2a2a2a' : undefined,
                }),
                boxShadow: p.frame?.style === 'classic' ? 'inset 0 0 0 2px rgba(255,255,255,0.5)' : p.frame?.style === 'wooden' ? 'inset 0 0 0 1px rgba(0,0,0,0.15)' : p.frame?.style === 'shadow' ? '0 24px 48px rgba(0,0,0,0.4), 0 12px 24px rgba(0,0,0,0.25)' : p.frame?.style === 'neon' ? `0 0 40px ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#0d9488'}, 0 0 20px ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#0d9488'}99, 0 0 8px ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#0d9488'}` : p.frame?.style === 'gold' ? 'inset 0 1px 0 rgba(255,252,224,0.9), inset 0 3px 8px -2px rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.25)' : p.frame?.style === 'silver' ? 'inset 0 1px 0 rgba(255,255,255,0.98), inset 0 3px 8px -2px rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.3)' : p.frame?.style === 'copper' ? 'inset 0 1px 0 rgba(253,245,235,0.95), inset 0 3px 8px -2px rgba(255,248,235,0.25), inset 0 -2px 0 rgba(0,0,0,0.25)' : p.frame?.style === 'polaroid' ? '0 6px 16px rgba(0,0,0,0.12)' : undefined,
              }}
            >
              <div
                className="relative w-full h-full overflow-hidden"
                style={
                  p.frame?.style === 'double'
                    ? {
                        border: `2px solid ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#e5e7eb'}`,
                        boxSizing: 'border-box',
                        borderRadius: 0,
                      }
                    : {}
                }
              >
              <img src={p.imageUrl} alt="Generated" className="w-full h-full object-cover" draggable={false} style={p.frame?.style === 'filmstrip' ? { filter: 'saturate(0.88)' } : p.frame?.style === 'polaroid' ? { filter: 'saturate(0.88) contrast(0.97)' } : undefined} />
              {p.frame?.style === 'vignette' && (
                <div
                  className="absolute inset-0 pointer-events-none z-[2]"
                  style={{
                    background: 'radial-gradient(ellipse 72% 72% at 50% 50%, transparent 0%, transparent 50%, rgba(0,0,0,0.28) 72%, rgba(0,0,0,0.72) 100%)',
                  }}
                  aria-hidden
                />
              )}
              {(p.frame?.style === 'gold' || p.frame?.style === 'silver' || p.frame?.style === 'copper') && (
                <div
                  className="absolute inset-0 pointer-events-none z-[2]"
                  style={{
                    backgroundColor: p.frame.style === 'gold' ? 'rgba(212,175,55,0.12)' : p.frame.style === 'silver' ? 'rgba(192,192,192,0.1)' : 'rgba(184,115,51,0.12)',
                    boxShadow: p.frame.style === 'gold' ? 'inset 0 0 40px rgba(255,248,220,0.08)' : p.frame.style === 'silver' ? 'inset 0 0 40px rgba(255,255,255,0.06)' : 'inset 0 0 40px rgba(253,240,224,0.06)',
                  }}
                  aria-hidden
                />
              )}
              {p.frame?.style === 'filmstrip' && (
                <>
                  {/* Left film strip overlay: dark strip + oval perforations (35mm style), overlaid on picture */}
                  <div
                    className="absolute top-0 left-0 bottom-0 w-8 pointer-events-none z-[2]"
                    style={{
                      backgroundColor: '#0a0a0a',
                      backgroundImage: 'radial-gradient(ellipse 45% 55% at 50% 50%, #1c1c1c 0%, #0a0a0a 58%)',
                      backgroundSize: '100% 16.666%',
                      backgroundRepeat: 'repeat-y',
                      backgroundPosition: '0 0',
                      boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.08)',
                    }}
                    aria-hidden
                  />
                  {/* Right film strip overlay */}
                  <div
                    className="absolute top-0 right-0 bottom-0 w-8 pointer-events-none z-[2]"
                    style={{
                      backgroundColor: '#0a0a0a',
                      backgroundImage: 'radial-gradient(ellipse 45% 55% at 50% 50%, #1c1c1c 0%, #0a0a0a 58%)',
                      backgroundSize: '100% 16.666%',
                      backgroundRepeat: 'repeat-y',
                      backgroundPosition: '0 0',
                      boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.08)',
                    }}
                    aria-hidden
                  />
                </>
              )}
              {p.tintOverlay && (
                <div
                  className="absolute inset-0 pointer-events-none z-[1]"
                  style={{
                    backgroundColor: p.getHex(p.tintOverlay.colorKey),
                    opacity: typeof p.tintOverlay.opacity === 'number' ? p.tintOverlay.opacity : 0.25,
                  }}
                />
              )}

              {p.overlays.map(overlay => {
                const borderHex = p.overlayBorderColors[overlay.id] || p.getHex('primary')
                const showPanelLeft = overlay.x > 55
                const isPhoto = overlay.type === 'photo'
                return (
                  <div
                    key={overlay.id}
                    onMouseDown={(e) => p.handleOverlayDragStart(overlay.id, e)}
                    onTouchStart={(e) => p.handleOverlayDragStart(overlay.id, e)}
                    className="absolute cursor-move group z-10"
                    style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, width: `${overlay.scale}%`, height: `${overlay.scale}%` }}
                  >
                    <span className={`block w-full h-full ${isPhoto ? 'rounded-full' : 'rounded-lg'}`} style={{ boxShadow: `0 0 0 2px ${borderHex}` }}>
                      <img src={overlay.url} alt="" className={`w-full h-full object-${isPhoto ? 'cover' : 'contain'} ${isPhoto ? 'rounded-full' : 'rounded-lg'} shadow-lg`} draggable={false} />
                    </span>
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex flex-col gap-2.5 w-44 rounded-xl p-3 shadow-xl border bg-white/95 backdrop-blur-sm ${showPanelLeft ? 'right-full mr-2' : 'left-full ml-2'}`}
                      style={{ borderColor: hexWithAlpha(primary, 0.25), boxShadow: `0 10px 40px rgba(0,0,0,0.12), 0 0 0 1px ${hexWithAlpha(primary, 0.08)}` }}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{isPhoto ? 'Edit photo' : 'Edit logo'}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); p.handleRemove(overlay.id) }} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Remove">✕</button>
                      </div>
                      <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5">
                        <span className="text-[10px] font-medium text-gray-600">Border</span>
                        <div className="flex gap-1.5">
                          {(['primary', 'secondary', 'accent'] as const).map((key) => (
                            <button key={key} type="button" onClick={(e) => { e.stopPropagation(); p.setOverlayBorderColors(prev => ({ ...prev, [overlay.id]: p.getHex(key) })) }} className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${(p.overlayBorderColors[overlay.id] || p.getHex('primary')) === p.getHex(key) ? 'ring-2 ring-offset-1' : 'border-gray-200'}`} style={{ borderColor: (p.overlayBorderColors[overlay.id] || p.getHex('primary')) === p.getHex(key) ? primary : undefined, backgroundColor: p.getHex(key) }} title={key} />
                          ))}
                        </div>
                        <span className="text-[10px] font-medium text-gray-600">Size</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={(e) => { e.stopPropagation(); p.handleScaleChange(overlay.id, -2) }} className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-colors" style={{ color: primary }}>−</button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); p.handleScaleChange(overlay.id, 2) }} className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-colors" style={{ color: primary }}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {p.textOverlays.map((t) => {
                const showPanelLeft = t.x > 60
                return (
                <div key={t.id} onMouseDown={(e) => p.handleOverlayDragStart(t.id, e)} onTouchStart={(e) => p.handleOverlayDragStart(t.id, e)} className="absolute cursor-move group z-10" style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}>
                  <span className="font-bold drop-shadow-lg px-1" style={{ color: p.getHex(t.colorKey), fontSize: Math.min(32, Math.max(10, t.fontSize)), fontFamily: t.fontFamily || 'Inter' }}>{t.text}</span>
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex flex-col gap-2.5 w-44 rounded-xl p-3 shadow-xl border bg-white/95 backdrop-blur-sm ${showPanelLeft ? 'right-full mr-2' : 'left-full ml-2'}`}
                    style={{ borderColor: hexWithAlpha(primary, 0.25), boxShadow: `0 10px 40px rgba(0,0,0,0.12), 0 0 0 1px ${hexWithAlpha(primary, 0.08)}` }}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Edit text</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); p.handleRemove(t.id) }} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Remove">✕</button>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5">
                      <span className="text-[10px] font-medium text-gray-600">Color</span>
                      <div className="flex gap-1.5">
                        {(['primary', 'secondary', 'accent'] as const).map((key) => (
                          <button key={key} type="button" onClick={(e) => { e.stopPropagation(); p.setTextOverlays(prev => prev.map(x => x.id === t.id ? { ...x, colorKey: key } : x)) }} className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${t.colorKey === key ? 'ring-2 ring-offset-1' : 'border-gray-200'}`} style={{ borderColor: t.colorKey === key ? primary : undefined, backgroundColor: p.getHex(key) }} title={key} />
                        ))}
                      </div>
                      <span className="text-[10px] font-medium text-gray-600">Size</span>
                      <div className="flex items-center gap-2">
                        <input type="range" min="10" max="32" value={Math.min(32, Math.max(10, t.fontSize))} onChange={(e) => { const v = parseInt(e.target.value, 10); if (!Number.isNaN(v)) p.setTextOverlays(prev => prev.map(x => x.id === t.id ? { ...x, fontSize: v } : x)) }} onClick={(e) => e.stopPropagation()} className="flex-1 h-2 rounded-full accent-gray-600" style={{ accentColor: primary }} />
                        <span className="text-[10px] tabular-nums text-gray-500 w-6">{t.fontSize}</span>
                      </div>
                      <span className="text-[10px] font-medium text-gray-600">Font</span>
                      <select value={t.fontFamily || 'Inter'} onChange={(e) => { const v = e.target.value as TextOverlayFont; p.setTextOverlays(prev => prev.map(x => x.id === t.id ? { ...x, fontFamily: v } : x)) }} onClick={(e) => e.stopPropagation()} className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-offset-0 outline-none" style={{ borderColor: hexWithAlpha(primary, 0.2) }}>
                        {TEXT_FONT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              );
              })}

              {p.draggingNew && (
                <div className="absolute inset-0 border-2 border-dashed flex items-center justify-center" style={{ backgroundColor: hexWithAlpha(primary, 0.1), borderColor: primary }}>
                  <span className="text-white px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: primary }}>Drop here</span>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Colour tint */}
          <div className="mt-4 rounded-xl border border-gray-200/80 bg-gray-50/80 p-3">
            <p className="text-xs font-medium text-gray-600 mb-2">Colour tint</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => p.setTintOverlay(prev => prev?.colorKey === 'primary' && prev?.opacity === 0.15 ? null : { colorKey: 'primary', opacity: 0.15 })}
                className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-all hover:shadow-sm"
                style={{ borderColor: buttonBorder, backgroundColor: buttonBg, color: primary }}
                title="Apply a light brand tint (15% primary colour)"
              >
                Light brand tint
              </button>
              <span className="text-xs text-gray-400">or</span>
              <div className="flex items-center gap-1.5">
                {(['primary', 'secondary', 'accent'] as const).map((key) => (
                  <button key={key} type="button" onClick={() => p.setTintOverlay(prev => prev?.colorKey === key ? null : { colorKey: key, opacity: prev?.opacity ?? 0.25 })} className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-105 ${p.tintOverlay?.colorKey === key ? 'border-gray-800 ring-2 ring-offset-1 ring-gray-400' : 'border-gray-200'}`} style={{ backgroundColor: p.getHex(key) }} title={`Tint with ${key}`} />
                ))}
              </div>
              {p.tintOverlay && (
                <label className="flex items-center gap-2 text-xs text-gray-600 ml-1">
                  <span>Opacity</span>
                  <input type="range" min="0.1" max="0.8" step="0.05" value={typeof p.tintOverlay.opacity === 'number' ? p.tintOverlay.opacity : 0.25} onChange={(e) => { const v = parseFloat(e.target.value); if (!Number.isNaN(v)) p.setTintOverlay(prev => prev ? { ...prev, opacity: v } : null) }} className="w-24 h-1.5 accent-gray-600" />
                  <span className="tabular-nums w-8">{Math.round((typeof p.tintOverlay.opacity === 'number' ? p.tintOverlay.opacity : 0.25) * 100)}%</span>
                </label>
              )}
            </div>
            {p.frame && ['gold', 'silver', 'copper', 'neon', 'polaroid', 'filmstrip', 'vignette'].includes(p.frame.style) && (
              <p className="text-xs text-gray-500 italic mt-2">Tint is set by the {p.frame.style === 'filmstrip' ? 'film strip' : p.frame.style} effect</p>
            )}
          </div>

          {/* Special effects */}
          <div className="mt-3 rounded-xl border border-gray-200/80 bg-gray-50/80 p-3">
            <p className="text-xs font-medium text-gray-600 mb-2">Special effects</p>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={p.frame?.style ?? ''}
                onChange={(e) => { const v = e.target.value as FrameStyle | ''; if (v === 'gold' || v === 'silver' || v === 'copper' || v === 'neon' || v === 'polaroid' || v === 'filmstrip' || v === 'vignette') p.setTintOverlay(null); if (!v) p.setFrame(null); else if (v === 'gold' || v === 'silver' || v === 'copper') p.setFrame({ style: v, colorKey: v }); else p.setFrame(prev => ({ style: v, colorKey: prev?.colorKey ?? 'primary' })) }}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-gray-300 focus:border-gray-400 outline-none min-w-[160px]"
              >
                <option value="">None</option>
                <optgroup label="Borders">
                  <option value="thin">Thin line</option>
                  <option value="solid">Solid border</option>
                  <option value="thick">Thick border</option>
                  <option value="double">Double line</option>
                  <option value="rounded">Rounded corners</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </optgroup>
                <optgroup label="Frames">
                  <option value="classic">Painting frame</option>
                  <option value="wooden">Wooden frame</option>
                  <option value="polaroid">Polaroid</option>
                  <option value="shadow">Floating shadow</option>
                </optgroup>
                <optgroup label="Mood">
                  <option value="vignette">Vignette</option>
                  <option value="neon">Neon glow</option>
                  <option value="filmstrip">Film strip</option>
                </optgroup>
                <optgroup label="Metallic">
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="copper">Copper</option>
                </optgroup>
              </select>
              <span className="text-xs text-gray-400 hidden sm:inline">or quick pick:</span>
              {(['gold', 'silver', 'copper'] as const).map((metal) => {
                const isSelected = p.frame?.style === metal
                const grad = metal === 'gold'
                  ? 'linear-gradient(135deg, #fffce0 0%, #f0d84a 15%, #a67c0a 50%, #3d3008 100%)'
                  : metal === 'silver'
                  ? 'linear-gradient(135deg, #fff 0%, #c0c0c0 35%, #808080 70%, #1a1a1a 100%)'
                  : 'linear-gradient(135deg, #fdf5eb 0%, #c48450 40%, #5c2e0a 80%, #2d1804 100%)'
                const metallicShine = metal === 'gold'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.2) 25%, transparent 45%)'
                  : metal === 'silver'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.25) 25%, transparent 45%)'
                  : 'linear-gradient(135deg, rgba(255,253,248,0.5) 0%, rgba(255,240,220,0.15) 25%, transparent 45%)'
                const selectedGlow = metal === 'gold' ? '0 0 14px rgba(184,134,11,0.45)' : metal === 'silver' ? '0 0 14px rgba(192,192,192,0.5)' : '0 0 14px rgba(184,115,51,0.45)'
                return (
                  <button
                    key={metal}
                    type="button"
                    onClick={() => { if (!isSelected) p.setTintOverlay(null); p.setFrame(isSelected ? null : { style: metal, colorKey: metal }) }}
                    className={`w-8 h-8 rounded-full border-2 flex-shrink-0 transition-all ${isSelected ? 'ring-2 ring-offset-1 scale-110' : 'border-gray-200 hover:scale-105'}`}
                    style={{
                      background: isSelected ? `${metallicShine}, ${grad}` : grad,
                      boxShadow: isSelected
                        ? `inset 0 1px 0 rgba(255,255,255,0.65), inset 0 2px 4px -1px rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15), ${selectedGlow}, 0 2px 8px rgba(0,0,0,0.2)`
                        : 'inset 0 1px 0 rgba(255,255,255,0.25)',
                      borderColor: isSelected ? (metal === 'gold' ? '#8b6914' : metal === 'silver' ? '#505050' : '#5c2e0a') : undefined,
                    }}
                    title={metal.charAt(0).toUpperCase() + metal.slice(1)}
                  />
                )
              })}
            </div>
            {p.frame && !['gold', 'silver', 'copper'].includes(p.frame.style) && (
              <div className="mt-2 pt-2 border-t border-gray-200/60">
                <p className="text-xs text-gray-500 mb-1.5">Frame colour</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['primary', 'secondary', 'accent', 'silver', 'gold', 'copper', 'neutral'] as const).map((key) => (
                    <button key={key} type="button" onClick={() => p.setFrame(prev => prev ? { ...prev, colorKey: key } : null)} className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-105 ${p.frame?.colorKey === key ? 'border-gray-800 ring-2 ring-offset-0.5 ring-gray-500' : 'border-gray-200'}`} style={{ backgroundColor: p.getFrameHex(key) }} title={key} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex justify-between" style={{ backgroundColor: headerBg }}>
        <button onClick={p.onSkip} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Skip</button>
        <button
          onClick={() => p.onApply({ imageOverlays: p.overlays, overlayBorderColors: p.overlayBorderColors, tintOverlay: p.tintOverlay, textOverlays: p.textOverlays, frame: p.frame })}
          disabled={p.applying || (p.overlays.length === 0 && p.textOverlays.length === 0 && !p.frame && !p.tintOverlay)}
          className="px-6 py-2 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 hover:opacity-95"
          style={{ backgroundColor: (p.applying || (p.overlays.length === 0 && p.textOverlays.length === 0 && !p.frame && !p.tintOverlay)) ? undefined : primary }}
        >
          {p.applying ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Applying...</>) : (<>Apply {p.totalItems > 0 && `(${p.totalItems})`}</>)}
        </button>
      </div>

      {p.draggingNew && (p.effectiveLogoUrl || p.effectivePhotoUrl) && (
        <div className="fixed pointer-events-none z-50 opacity-70" style={{ left: p.dragPosition.x - 30, top: p.dragPosition.y - 30, width: 60, height: 60 }}>
          <img src={p.draggingNew === 'logo' ? p.effectiveLogoUrl! : p.effectivePhotoUrl!} alt="" className={`w-full h-full object-${p.draggingNew === 'photo' ? 'cover' : 'contain'} ${p.draggingNew === 'photo' ? 'rounded-full' : 'rounded-lg'} shadow-xl`} />
        </div>
      )}
    </div>
  )
}
