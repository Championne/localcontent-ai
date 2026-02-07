'use client'

import React from 'react'
import type { OverlayItem, TextOverlayItem, FrameStyle, OverlayApplyPayload } from './ImageOverlayEditor'

export interface ImageOverlayEditorViewProps {
  imageUrl: string
  containerRef: React.RefObject<HTMLDivElement | null>
  overlays: OverlayItem[]
  setOverlays: React.Dispatch<React.SetStateAction<OverlayItem[]>>
  overlayBorderColors: Record<string, string>
  setOverlayBorderColors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  tintOverlay: { colorKey: 'primary' | 'secondary' | 'accent'; opacity: number } | null
  setTintOverlay: React.Dispatch<React.SetStateAction<{ colorKey: 'primary' | 'secondary' | 'accent'; opacity: number } | null>>
  frame: { style: FrameStyle; colorKey: 'primary' | 'secondary' | 'accent' } | null
  setFrame: React.Dispatch<React.SetStateAction<{ style: FrameStyle; colorKey: 'primary' | 'secondary' | 'accent' } | null>>
  textOverlays: TextOverlayItem[]
  setTextOverlays: React.Dispatch<React.SetStateAction<TextOverlayItem[]>>
  draggingNew: 'logo' | 'photo' | 'tagline' | 'website' | 'social' | null
  dragPosition: { x: number; y: number }
  effectiveLogoUrl: string | null
  effectivePhotoUrl: string | null
  getHex: (key: 'primary' | 'secondary' | 'accent') => string
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

export function ImageOverlayEditorView(p: ImageOverlayEditorViewProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Customize Your Image</h3>
        <p className="text-sm text-gray-500">Drag logo, photo, tagline, website or social onto the image. Add a brand border or tint.</p>
      </div>

      <div className="flex">
        <div className="w-28 bg-gray-50 border-r border-gray-200 p-3 flex flex-col gap-3 overflow-y-auto max-h-[420px]">
          <div className="text-center">
            {p.effectiveLogoUrl ? (
              <div
                onMouseDown={(e) => p.handleSidebarDragStart('logo', e)}
                onTouchStart={(e) => p.handleSidebarDragStart('logo', e)}
                className={`w-16 h-16 mx-auto rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing transition-all ${
                  p.hasLogo ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                <img src={p.effectiveLogoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
            ) : p.onUploadLogo ? (
              <div
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-teal-400') }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('ring-2', 'ring-teal-400') }}
                onDrop={(e) => p.handleDropOnZone('logo', e)}
                onClick={() => p.logoInputRef.current?.click()}
                className="w-16 h-16 mx-auto rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer flex flex-col items-center justify-center gap-0.5 transition-all"
              >
                {p.uploading === 'logo' ? (
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
            <input ref={p.logoInputRef as React.RefObject<HTMLInputElement>} type="file" accept="image/*" className="hidden" onChange={(e) => p.handleFileInput('logo', e)} />
            <span className="text-[10px] text-gray-500 mt-1 block">Logo</span>
            {p.hasLogo && <span className="text-[10px] text-teal-600">✓ On image</span>}
          </div>

          <div className="text-center">
            {p.effectivePhotoUrl ? (
              <div
                onMouseDown={(e) => p.handleSidebarDragStart('photo', e)}
                onTouchStart={(e) => p.handleSidebarDragStart('photo', e)}
                className={`w-16 h-16 mx-auto rounded-full border-2 border-dashed cursor-grab active:cursor-grabbing transition-all overflow-hidden ${
                  p.hasPhoto ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                <img src={p.effectivePhotoUrl} alt="Photo" className="w-full h-full object-cover" />
              </div>
            ) : p.onUploadPhoto ? (
              <div
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-teal-400') }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('ring-2', 'ring-teal-400') }}
                onDrop={(e) => p.handleDropOnZone('photo', e)}
                onClick={() => p.photoInputRef.current?.click()}
                className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer flex flex-col items-center justify-center gap-0.5 transition-all"
              >
                {p.uploading === 'photo' ? (
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
            <input ref={p.photoInputRef as React.RefObject<HTMLInputElement>} type="file" accept="image/*" className="hidden" onChange={(e) => p.handleFileInput('photo', e)} />
            <span className="text-[10px] text-gray-500 mt-1 block">Photo</span>
            {p.hasPhoto && <span className="text-[10px] text-teal-600">✓ On image</span>}
          </div>

          {(p.tagline || p.website || p.socialHandles) && (
            <>
              {p.tagline && (
                <div
                  onMouseDown={(e) => p.handleSidebarDragStart('tagline', e)}
                  onTouchStart={(e) => p.handleSidebarDragStart('tagline', e)}
                  className="text-center cursor-grab active:cursor-grabbing p-1.5 rounded border border-dashed border-gray-300 hover:border-teal-400 bg-white"
                >
                  <span className="text-[9px] text-gray-600 block truncate" title={p.tagline}>{p.tagline}</span>
                  <span className="text-[9px] text-gray-400">Add Tagline</span>
                </div>
              )}
              {p.website && (
                <div
                  onMouseDown={(e) => p.handleSidebarDragStart('website', e)}
                  onTouchStart={(e) => p.handleSidebarDragStart('website', e)}
                  className="text-center cursor-grab active:cursor-grabbing p-1.5 rounded border border-dashed border-gray-300 hover:border-teal-400 bg-white"
                >
                  <span className="text-[9px] text-gray-600 block truncate" title={p.website}>{p.website}</span>
                  <span className="text-[9px] text-gray-400">Add website</span>
                </div>
              )}
              {p.socialHandles && (
                <div
                  onMouseDown={(e) => p.handleSidebarDragStart('social', e)}
                  onTouchStart={(e) => p.handleSidebarDragStart('social', e)}
                  className="text-center cursor-grab active:cursor-grabbing p-1.5 rounded border border-dashed border-gray-300 hover:border-teal-400 bg-white"
                >
                  <span className="text-[9px] text-gray-600 block truncate" title={p.socialHandles}>{p.socialHandles}</span>
                  <span className="text-[9px] text-gray-400">Add social</span>
                </div>
              )}
            </>
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
              padding: p.frame ? (p.frame.style === 'thin' ? 3 : p.frame.style === 'thick' ? 16 : 8) : 0,
              backgroundColor: p.frame ? p.getHex(p.frame.colorKey) : undefined,
              borderRadius: p.frame?.style === 'rounded' ? 12 : 0,
            }}
          >
            <div
              ref={p.containerRef as React.RefObject<HTMLDivElement>}
              className="relative w-full h-full overflow-hidden"
              style={{
                aspectRatio: '1',
                borderRadius: p.frame?.style === 'rounded' ? 12 : 0,
                border: p.frame?.style === 'double' ? `2px solid ${p.frame ? p.getHex(p.frame.colorKey) : '#e5e7eb'}` : undefined,
              }}
            >
              <img src={p.imageUrl} alt="Generated" className="w-full h-full object-cover" draggable={false} />
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
                  <span className="font-bold drop-shadow-lg px-1" style={{ color: p.getHex(t.colorKey), fontSize: Math.min(24, Math.max(12, t.fontSize)) }}>{t.text}</span>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 flex gap-0.5 bg-white rounded shadow p-0.5">
                    {(['primary', 'secondary', 'accent'] as const).map((key) => (
                      <button key={key} type="button" onClick={(e) => { e.stopPropagation(); p.setTextOverlays(prev => prev.map(x => x.id === t.id ? { ...x, colorKey: key } : x)) }} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: p.getHex(key) }} title={key} />
                    ))}
                    <button onClick={(e) => { e.stopPropagation(); p.handleRemove(t.id) }} className="w-5 h-5 rounded bg-red-100 text-red-600 text-[10px]">✕</button>
                  </div>
                </div>
              ))}

              {p.draggingNew && (
                <div className="absolute inset-0 bg-teal-500/10 border-2 border-dashed border-teal-500 flex items-center justify-center">
                  <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">Drop here</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => p.setTintOverlay(prev => prev?.colorKey === 'primary' && prev?.opacity === 0.15 ? null : { colorKey: 'primary', opacity: 0.15 })} className="text-xs px-2 py-1 rounded border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100" title="Apply a light brand tint (15% primary colour)">Light brand tint</button>
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
            <span className="text-xs text-gray-500">Frame:</span>
            <select value={p.frame?.style ?? ''} onChange={(e) => { const v = e.target.value as FrameStyle | ''; if (!v) p.setFrame(null); else p.setFrame(prev => ({ style: v, colorKey: prev?.colorKey ?? 'primary' })) }} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
              <option value="">None</option>
              <option value="thin">Thin</option>
              <option value="solid">Solid</option>
              <option value="thick">Thick</option>
              <option value="double">Double</option>
              <option value="rounded">Rounded</option>
            </select>
            {p.frame && (['primary', 'secondary', 'accent'] as const).map((key) => (
              <button key={key} type="button" onClick={() => p.setFrame(prev => prev ? { ...prev, colorKey: key } : null)} className={`w-5 h-5 rounded-full border-2 ${p.frame.colorKey === key ? 'border-gray-800' : 'border-gray-200'}`} style={{ backgroundColor: p.getHex(key) }} title={key} />
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">{p.totalItems === 0 ? 'Drag from the left onto the image' : 'Drag to reposition • Hover for border/colour controls'}</p>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
        <button onClick={p.onSkip} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Skip</button>
        <button onClick={() => p.onApply({ imageOverlays: p.overlays, overlayBorderColors: p.overlayBorderColors, tintOverlay: p.tintOverlay, textOverlays: p.textOverlays, frame: p.frame })} disabled={p.applying || (p.overlays.length === 0 && p.textOverlays.length === 0 && !p.frame && !p.tintOverlay)} className="px-6 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
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
