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

export function ImageOverlayEditorView(p: ImageOverlayEditorViewProps) {
  const primary = p.getHex('primary')
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
            <span className="text-[10px] font-medium mt-1 block" style={{ color: primary }}>Logo</span>
            {p.hasLogo && <span className="text-[9px] font-medium" style={{ color: primary }}>✓ On image</span>}
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
            <span className="text-[10px] font-medium mt-1 block" style={{ color: primary }}>Photo</span>
            {p.hasPhoto && <span className="text-[9px] font-medium" style={{ color: primary }}>✓ On image</span>}
          </div>

          {(p.tagline || p.website || p.socialHandles) && (
            <div className="space-y-2">
              {p.tagline && (
                <div
                  onMouseDown={(e) => p.handleSidebarDragStart('tagline', e)}
                  onTouchStart={(e) => p.handleSidebarDragStart('tagline', e)}
                  className="cursor-grab active:cursor-grabbing p-2.5 rounded-lg transition-all hover:shadow-sm border text-left"
                  style={{ backgroundColor: buttonBg, borderColor: buttonBorder }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                    <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: primary }}>Tagline</span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-800 block truncate" title={p.tagline}>{p.tagline}</span>
                </div>
              )}
              {p.website && (
                <div
                  onMouseDown={(e) => p.handleSidebarDragStart('website', e)}
                  onTouchStart={(e) => p.handleSidebarDragStart('website', e)}
                  className="cursor-grab active:cursor-grabbing p-2.5 rounded-lg transition-all hover:shadow-sm border text-left"
                  style={{ backgroundColor: buttonBg, borderColor: buttonBorder }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: primary }}>Website</span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-800 block truncate" title={p.website}>{p.website}</span>
                </div>
              )}
              {p.socialHandles && (
                <div
                  onMouseDown={(e) => p.handleSidebarDragStart('social', e)}
                  onTouchStart={(e) => p.handleSidebarDragStart('social', e)}
                  className="cursor-grab active:cursor-grabbing p-2.5 rounded-lg transition-all hover:shadow-sm border text-left"
                  style={{ backgroundColor: buttonBg, borderColor: buttonBorder }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-3-4H9a2 2 0 01-2-2v-2H5a2 2 0 01-2-2V6a2 2 0 012-2h2v4l3 4h4v2z" /></svg>
                    <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: primary }}>Social</span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-800 block truncate" title={p.socialHandles}>{p.socialHandles}</span>
                </div>
              )}
            </div>
          )}

          {!p.effectiveLogoUrl && !p.effectivePhotoUrl && !p.onUploadLogo && !p.onUploadPhoto && !p.tagline && !p.website && !p.socialHandles && (
            <p className="text-xs text-gray-400 text-center">Add logo or photo in Brand Identity, or use drop zones above.</p>
          )}
        </div>

        <div className="flex-1 p-4">
          <div
            className="relative bg-gray-100 rounded-lg overflow-hidden"
            style={{
              aspectRatio: '1',
              padding: p.frame ? (p.frame.style === 'thin' ? 3 : p.frame.style === 'thick' || p.frame.style === 'classic' || p.frame.style === 'gold' || p.frame.style === 'silver' || p.frame.style === 'copper' ? 16 : p.frame.style === 'polaroid' ? 14 : p.frame.style === 'filmstrip' ? 28 : p.frame.style === 'neon' ? 24 : p.frame.style === 'shadow' ? 32 : p.frame.style === 'vignette' ? 0 : 8) : 0,
              ...(p.frame?.style === 'classic'
                ? {
                    background: `linear-gradient(135deg, rgba(255,255,255,0.28) 0%, transparent 50%), linear-gradient(315deg, rgba(0,0,0,0.3) 0%, transparent 50%), ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#e5e7eb'}`,
                  }
                : {
                    backgroundColor: p.frame ? (p.frame.style === 'polaroid' ? '#fcf9f2' : p.frame.style === 'filmstrip' ? '#121212' : p.frame.style === 'neon' ? '#0a0a0e' : p.frame.style === 'shadow' ? '#f5f7fa' : p.frame.style === 'vignette' ? undefined : p.frame.style === 'gold' ? '#b8860b' : p.frame.style === 'silver' ? '#a0a0a0' : p.frame.style === 'copper' ? '#8b4513' : p.getFrameHex(p.frame.colorKey)) : undefined,
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
                      boxSizing: 'border-box',
                    }
                  : {}),
                ...(p.frame?.style !== 'double' && {
                  border: p.frame?.style === 'classic' ? undefined : p.frame?.style === 'gold' ? '2px solid #fff8dc' : p.frame?.style === 'silver' ? '2px solid #ffffff' : p.frame?.style === 'copper' ? '2px solid #f5d0b0' : p.frame?.style === 'dashed' ? `3px dashed ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#e5e7eb'}` : p.frame?.style === 'dotted' ? `3px dotted ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#e5e7eb'}` : p.frame?.style === 'polaroid' ? '2px solid #e6e2d8' : p.frame?.style === 'filmstrip' ? '1px solid #2a2a2a' : undefined,
                }),
                boxShadow: p.frame?.style === 'classic' ? 'inset 0 0 0 2px rgba(255,255,255,0.5)' : p.frame?.style === 'shadow' ? '0 16px 32px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.12)' : p.frame?.style === 'neon' ? `0 0 28px ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#0d9488'}, 0 0 12px ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#0d9488'}80` : p.frame?.style === 'gold' ? 'inset 0 1px 0 rgba(255,248,220,0.4)' : p.frame?.style === 'silver' ? 'inset 0 1px 0 rgba(255,255,255,0.5)' : p.frame?.style === 'copper' ? 'inset 0 1px 0 rgba(245,208,176,0.4)' : p.frame?.style === 'polaroid' ? '0 6px 16px rgba(0,0,0,0.12)' : undefined,
              }}
            >
              <div
                className="relative w-full h-full overflow-hidden"
                style={
                  p.frame?.style === 'double'
                    ? {
                        border: `2px solid ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#e5e7eb'}`,
                        outline: `2px solid ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#e5e7eb'}`,
                        outlineOffset: 6,
                        boxSizing: 'border-box',
                        borderRadius: p.frame?.style === 'rounded' ? 10 : 0,
                      }
                    : {}
                }
              >
              <img src={p.imageUrl} alt="Generated" className="w-full h-full object-cover" draggable={false} style={p.frame?.style === 'filmstrip' ? { filter: 'saturate(0.88)' } : undefined} />
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
                    backgroundColor: p.frame.style === 'gold' ? 'rgba(212,175,55,0.14)' : p.frame.style === 'silver' ? 'rgba(192,192,192,0.12)' : 'rgba(184,115,51,0.14)',
                  }}
                  aria-hidden
                />
              )}
              {p.frame?.style === 'filmstrip' && (
                <>
                  <div
                    className="absolute top-0 left-0 bottom-0 w-5 pointer-events-none z-[2]"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 10px 14px, #000 2.5px, #2a2a2a 3px, #121212 3.5px)',
                      backgroundSize: '20px 22px',
                      backgroundRepeat: 'repeat',
                      backgroundPosition: '0 2px',
                    }}
                    aria-hidden
                  />
                  <div
                    className="absolute top-0 right-0 bottom-0 w-5 pointer-events-none z-[2]"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 10px 14px, #000 2.5px, #2a2a2a 3px, #121212 3.5px)',
                      backgroundSize: '20px 22px',
                      backgroundRepeat: 'repeat',
                      backgroundPosition: '0 2px',
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
                return (
                  <div
                    key={overlay.id}
                    onMouseDown={(e) => p.handleOverlayDragStart(overlay.id, e)}
                    onTouchStart={(e) => p.handleOverlayDragStart(overlay.id, e)}
                    className="absolute cursor-move group"
                    style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, width: `${overlay.scale}%`, height: `${overlay.scale}%` }}
                  >
                    <span className={`block w-full h-full ${overlay.type === 'photo' ? 'rounded-full' : 'rounded-lg'}`} style={{ boxShadow: `0 0 0 2px ${borderHex}` }}>
                      <img src={overlay.url} alt="" className={`w-full h-full object-${overlay.type === 'photo' ? 'cover' : 'contain'} ${overlay.type === 'photo' ? 'rounded-full' : 'rounded-lg'} shadow-lg`} draggable={false} />
                    </span>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-1 bg-white rounded-lg shadow-lg p-1">
                      <span className="text-[9px] text-gray-500 mr-0.5">Border:</span>
                      {(['primary', 'secondary', 'accent'] as const).map((key) => (
                        <button key={key} type="button" onClick={(e) => { e.stopPropagation(); p.setOverlayBorderColors(prev => ({ ...prev, [overlay.id]: p.getHex(key) })) }} className={`w-5 h-5 rounded-full border-2 ${(p.overlayBorderColors[overlay.id] || p.getHex('primary')) === p.getHex(key) ? 'border-gray-800 ring-1 ring-offset-1' : 'border-gray-200'}`} style={{ backgroundColor: p.getHex(key) }} title={key} />
                      ))}
                      <button onClick={(e) => { e.stopPropagation(); p.handleScaleChange(overlay.id, -2) }} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold">−</button>
                      <button onClick={(e) => { e.stopPropagation(); p.handleScaleChange(overlay.id, 2) }} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold">+</button>
                      <button onClick={(e) => { e.stopPropagation(); p.handleRemove(overlay.id) }} className="w-6 h-6 rounded bg-red-100 hover:bg-red-200 text-red-600 text-xs">✕</button>
                    </div>
                  </div>
                )
              })}
              {p.textOverlays.map((t) => (
                <div key={t.id} onMouseDown={(e) => p.handleOverlayDragStart(t.id, e)} onTouchStart={(e) => p.handleOverlayDragStart(t.id, e)} className="absolute cursor-move group" style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}>
                  <span className="font-bold drop-shadow-lg px-1" style={{ color: p.getHex(t.colorKey), fontSize: Math.min(32, Math.max(10, t.fontSize)), fontFamily: t.fontFamily || 'Inter' }}>{t.text}</span>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 flex flex-wrap items-center gap-1 bg-white rounded-lg shadow-lg p-1.5 border border-gray-200 min-w-[140px]">
                    <span className="text-[9px] text-gray-500 w-full">Color:</span>
                    {(['primary', 'secondary', 'accent'] as const).map((key) => (
                      <button key={key} type="button" onClick={(e) => { e.stopPropagation(); p.setTextOverlays(prev => prev.map(x => x.id === t.id ? { ...x, colorKey: key } : x)) }} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: p.getHex(key) }} title={key} />
                    ))}
                    <span className="text-[9px] text-gray-500 w-full mt-0.5">Size:</span>
                    <input type="range" min="10" max="32" value={Math.min(32, Math.max(10, t.fontSize))} onChange={(e) => { const v = parseInt(e.target.value, 10); if (!Number.isNaN(v)) p.setTextOverlays(prev => prev.map(x => x.id === t.id ? { ...x, fontSize: v } : x)) }} onClick={(e) => e.stopPropagation()} className="w-16 h-1.5" />
                    <span className="text-[9px] text-gray-500 w-full">Font:</span>
                    <select value={t.fontFamily || 'Inter'} onChange={(e) => { const v = e.target.value as TextOverlayFont; p.setTextOverlays(prev => prev.map(x => x.id === t.id ? { ...x, fontFamily: v } : x)) }} onClick={(e) => e.stopPropagation()} className="text-[10px] border border-gray-200 rounded px-1 py-0.5 bg-white max-w-full">
                      {TEXT_FONT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button onClick={(e) => { e.stopPropagation(); p.handleRemove(t.id) }} className="w-5 h-5 rounded bg-red-100 text-red-600 text-[10px] ml-auto">✕</button>
                  </div>
                </div>
              ))}

              {p.draggingNew && (
                <div className="absolute inset-0 border-2 border-dashed flex items-center justify-center" style={{ backgroundColor: hexWithAlpha(primary, 0.1), borderColor: primary }}>
                  <span className="text-white px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: primary }}>Drop here</span>
                </div>
              )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => p.setTintOverlay(prev => prev?.colorKey === 'primary' && prev?.opacity === 0.15 ? null : { colorKey: 'primary', opacity: 0.15 })}
              className="text-xs px-2 py-1 rounded border font-medium transition-colors"
              style={{ borderColor: buttonBorder, backgroundColor: buttonBg, color: primary }}
              title="Apply a light brand tint (15% primary colour)"
            >
              Light brand tint
            </button>
            <span className="text-xs text-gray-500">or pick colour:</span>
            {(['primary', 'secondary', 'accent'] as const).map((key) => (
              <button key={key} type="button" onClick={() => p.setTintOverlay(prev => prev?.colorKey === key ? null : { colorKey: key, opacity: prev?.opacity ?? 0.25 })} className={`w-6 h-6 rounded-full border-2 ${p.tintOverlay?.colorKey === key ? 'border-gray-800' : 'border-gray-200'}`} style={{ backgroundColor: p.getHex(key) }} title={`Tint with ${key}`} />
            ))}
            {p.tintOverlay && (
              <label className="flex items-center gap-1 text-xs text-gray-600">
                Opacity:
                <input type="range" min="0.1" max="0.8" step="0.05" value={typeof p.tintOverlay.opacity === 'number' ? p.tintOverlay.opacity : 0.25} onChange={(e) => { const v = parseFloat(e.target.value); if (!Number.isNaN(v)) p.setTintOverlay(prev => prev ? { ...prev, opacity: v } : null) }} className="w-20" />
                <span>{Math.round((typeof p.tintOverlay.opacity === 'number' ? p.tintOverlay.opacity : 0.25) * 100)}%</span>
              </label>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Overlay options:</span>
            <select value={p.frame?.style ?? ''} onChange={(e) => { const v = e.target.value as FrameStyle | ''; if (!v) p.setFrame(null); else if (v === 'gold' || v === 'silver' || v === 'copper') p.setFrame({ style: v, colorKey: v }); else p.setFrame(prev => ({ style: v, colorKey: prev?.colorKey ?? 'primary' })) }} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white max-w-[180px]">
              <option value="">None</option>
              <option value="thin">Thin line</option>
              <option value="solid">Solid border</option>
              <option value="thick">Thick border</option>
              <option value="double">Double line</option>
              <option value="rounded">Rounded corners</option>
              <option value="classic">Painting frame</option>
              <option value="polaroid">Polaroid</option>
              <option value="dashed">Dashed border</option>
              <option value="dotted">Dotted border</option>
              <option value="filmstrip">Film strip</option>
              <option value="vignette">Vignette</option>
              <option value="neon">Neon glow</option>
              <option value="shadow">Floating shadow</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="copper">Copper</option>
            </select>
            {p.frame && !['gold', 'silver', 'copper'].includes(p.frame.style) && (['primary', 'secondary', 'accent', 'silver', 'gold', 'copper', 'neutral'] as const).map((key) => (
              <button key={key} type="button" onClick={() => p.setFrame(prev => prev ? { ...prev, colorKey: key } : null)} className={`w-5 h-5 rounded-full border-2 ${p.frame?.colorKey === key ? 'border-gray-800' : 'border-gray-200'}`} style={{ backgroundColor: p.getFrameHex(key) }} title={key} />
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">{p.totalItems === 0 ? 'Drag from the left onto the image' : 'Drag to reposition • Hover for border/colour controls'}</p>
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
