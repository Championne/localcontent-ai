'use client'

import React from 'react'
import { TEXT_FONT_OPTIONS } from './ImageOverlayEditor'
import { hexWithAlpha } from './ImageOverlayEditorTypes'
import type { ImageOverlayEditorViewProps, ViewComputed } from './ImageOverlayEditorTypes'
import type { TextOverlayFont, FrameStyle } from './ImageOverlayEditorTypes'
export type { ImageOverlayEditorViewProps, ViewComputed } from './ImageOverlayEditorTypes'
export { hexWithAlpha } from './ImageOverlayEditorTypes'

export default function ImageOverlayEditorViewRoot(props: {
  p: ImageOverlayEditorViewProps
  c: ViewComputed
}) {
  const p = props.p
  const c = props.c
  const primary = c.primary
  const primaryDark = c.primaryDark
  const headerBg = c.headerBg
  const sidebarBg = c.sidebarBg
  const buttonBg = c.buttonBg
  const buttonBorder = c.buttonBorder
  const rootBg = c.rootBg
  const frameWrapperStyle = c.frameWrapperStyle
  const containerStyle = c.containerStyle
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ backgroundColor: rootBg }}>
      {/* Header: compact */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200/80" style={{ backgroundColor: headerBg }}>
        <div className="flex-shrink-0">
          {p.effectiveLogoUrl ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden border-2 shadow-sm" style={{ borderColor: buttonBorder }}>
              <img src={p.effectiveLogoUrl} alt="Your brand" className="w-full h-full object-contain bg-white" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 bg-white/80" style={{ borderColor: buttonBorder }}>
              <span className="text-[9px] font-medium text-gray-400 text-center px-0.5">Logo</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">Customize Your Image</h3>
          <p className="text-xs text-gray-600 mt-0.5">Drag items onto the image · Effects on the right</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-28 lg:w-32 border-r border-gray-200/80 p-2.5 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible flex-shrink-0" style={{ backgroundColor: sidebarBg }}>
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
          {p.onArrangeAll && (p.effectiveLogoUrl || p.effectivePhotoUrl || (p.tagline && p.tagline.trim()) || (p.website && p.website.trim()) || (p.socialHandles && p.socialHandles.trim())) && (
            <button
              type="button"
              onClick={p.onArrangeAll}
              className="w-full mt-2 py-2 rounded-lg text-[11px] font-medium border-2 transition-colors"
              style={{ borderColor: buttonBorder, backgroundColor: buttonBg, color: primary }}
            >
              Arrange all
            </button>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col items-center justify-center min-w-0" style={{ backgroundColor: sidebarBg }}>
          <div
            className="relative rounded-lg overflow-hidden w-full max-w-[480px] aspect-square shadow-sm"
            style={frameWrapperStyle}
          >
            <div
              ref={p.containerRef as React.RefObject<HTMLDivElement>}
              className="relative w-full h-full overflow-hidden"
              style={containerStyle}
            >
              <div
                className="relative w-full h-full overflow-hidden"
                style={
                  p.frame?.style === 'double'
                    ? {
                        border: `3px solid ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#e5e7eb'}`,
                        boxSizing: 'border-box',
                        borderRadius: 0,
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
                    backgroundColor: p.frame.style === 'gold' ? 'rgba(212,175,55,0.12)' : p.frame.style === 'silver' ? 'rgba(192,192,192,0.1)' : 'rgba(184,115,51,0.12)',
                    boxShadow: p.frame.style === 'gold' ? 'inset 0 0 40px rgba(255,248,220,0.08)' : p.frame.style === 'silver' ? 'inset 0 0 40px rgba(255,255,255,0.06)' : 'inset 0 0 40px rgba(253,240,224,0.06)',
                  }}
                  aria-hidden
                />
              )}
              {p.frame?.style === 'filmstrip' && (
                <>
                  {/* Left film strip: dark strip with bright white perforation holes */}
                  <div
                    className="absolute top-0 left-0 bottom-0 w-8 pointer-events-none z-[2]"
                    style={{
                      backgroundColor: '#1a1a1a',
                      backgroundImage: 'radial-gradient(ellipse 40% 50% at 50% 50%, #ffffff 0%, #ffffff 70%, transparent 71%)',
                      backgroundSize: '100% 14.28%',
                      backgroundRepeat: 'repeat-y',
                      backgroundPosition: '0 7.14%',
                    }}
                    aria-hidden
                  />
                  {/* Right film strip: dark strip with bright white perforation holes */}
                  <div
                    className="absolute top-0 right-0 bottom-0 w-8 pointer-events-none z-[2]"
                    style={{
                      backgroundColor: '#1a1a1a',
                      backgroundImage: 'radial-gradient(ellipse 40% 50% at 50% 50%, #ffffff 0%, #ffffff 70%, transparent 71%)',
                      backgroundSize: '100% 14.28%',
                      backgroundRepeat: 'repeat-y',
                      backgroundPosition: '0 7.14%',
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
                    opacity: typeof p.tintOverlay.opacity === 'number' ? p.tintOverlay.opacity : 0.15,
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
                      className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 z-20 flex flex-col gap-2.5 w-44 rounded-xl p-3 border bg-white backdrop-blur-sm ${showPanelLeft ? 'right-full mr-2' : 'left-full ml-2'}`}
                      style={{ borderColor: hexWithAlpha(primary, 0.25), boxShadow: `0 8px 30px rgba(0,0,0,0.18), 0 0 0 1px ${hexWithAlpha(primary, 0.12)}` }}
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
                    className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 z-20 flex flex-col gap-2.5 w-44 rounded-xl p-3 border bg-white backdrop-blur-sm ${showPanelLeft ? 'right-full mr-2' : 'left-full ml-2'}`}
                    style={{ borderColor: hexWithAlpha(primary, 0.25), boxShadow: `0 8px 30px rgba(0,0,0,0.18), 0 0 0 1px ${hexWithAlpha(primary, 0.12)}` }}
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

        </div>

        {/* Right panel: Effects (Tint + Frame) */}
        <div className="w-44 sm:w-52 border-l border-gray-200/80 p-3 hidden md:block" style={{ backgroundColor: sidebarBg }}>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Effects</p>

          {/* Tint */}
          <div className="mb-4">
            <p className="text-[11px] font-medium text-gray-600 mb-1.5">Tint</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => p.setTintOverlay(prev => prev?.colorKey === 'primary' && prev?.opacity === 0.15 ? null : { colorKey: 'primary', opacity: 0.15 })}
                className="text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all w-full text-left"
                style={{ borderColor: buttonBorder, backgroundColor: buttonBg, color: primary }}
                title="Light brand tint"
              >
                Light
              </button>
              <div className="flex items-center gap-1.5">
                {(['primary', 'secondary', 'accent'] as const).map((key) => (
                  <button key={key} type="button" onClick={() => p.setTintOverlay(prev => prev?.colorKey === key ? null : { colorKey: key, opacity: prev?.opacity ?? 0.15 })} className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-105 ${p.tintOverlay?.colorKey === key ? 'border-gray-800 ring-1 ring-offset-1 ring-gray-400' : 'border-gray-200'}`} style={{ backgroundColor: p.getHex(key) }} title={key} />
                ))}
              </div>
              {p.tintOverlay && (
                <label className="flex items-center gap-1.5 text-[11px] text-gray-600">
                  <input type="range" min="0.1" max="0.8" step="0.05" value={typeof p.tintOverlay.opacity === 'number' ? p.tintOverlay.opacity : 0.15} onChange={(e) => { const v = parseFloat(e.target.value); if (!Number.isNaN(v)) p.setTintOverlay(prev => prev ? { ...prev, opacity: v } : null) }} className="w-full h-1 accent-gray-600" />
                  <span className="tabular-nums w-8 text-right">{Math.round((typeof p.tintOverlay.opacity === 'number' ? p.tintOverlay.opacity : 0.15) * 100)}%</span>
                </label>
              )}
              {p.frame && ['gold', 'silver', 'copper', 'neon', 'filmstrip', 'vignette'].includes(p.frame.style) && (
                <p className="text-[10px] text-gray-500 italic">Tint from frame</p>
              )}
            </div>
          </div>

          {/* Frame */}
          <div>
            <p className="text-[11px] font-medium text-gray-600 mb-1.5">Frame</p>
            <select
              value={p.frame?.style ?? ''}
              onChange={(e) => { const v = e.target.value as FrameStyle | ''; if (v === 'gold' || v === 'silver' || v === 'copper' || v === 'neon' || v === 'filmstrip' || v === 'vignette') p.setTintOverlay(null); if (!v) p.setFrame(null); else if (v === 'gold' || v === 'silver' || v === 'copper') p.setFrame({ style: v, colorKey: v }); else p.setFrame(prev => ({ style: v, colorKey: prev?.colorKey ?? 'primary' })) }}
              className="text-[11px] border border-gray-200 rounded-md px-2.5 py-1.5 bg-white text-gray-800 focus:ring-2 focus:ring-gray-200 outline-none w-full mb-2"
            >
              <option value="">None</option>
              <optgroup label="Borders">
                <option value="thin">Thin line</option>
                <option value="solid">Solid border</option>
                <option value="thick">Thick border</option>
                <option value="double">Double line</option>
                <option value="rounded">Rounded corners</option>
              </optgroup>
              <optgroup label="Frames">
                <option value="classic">Painting frame</option>
                <option value="wooden">Wooden frame</option>
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
            <div className="flex items-center gap-1.5 mb-2">
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
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.15) 25%, transparent 45%)'
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
                        : 'inset 0 1px 0 rgba(255,255,255,0.15)',
                      borderColor: isSelected ? (metal === 'gold' ? '#8b6914' : metal === 'silver' ? '#505050' : '#5c2e0a') : undefined,
                    }}
                    title={metal.charAt(0).toUpperCase() + metal.slice(1)}
                  />
                )
              })}
            </div>
            {p.frame && !['gold', 'silver', 'copper'].includes(p.frame.style) && (
              <div className="pt-2 border-t border-gray-200/60">
                <p className="text-[10px] text-gray-500 mb-1.5">Frame colour</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['primary', 'secondary', 'accent', 'silver', 'gold', 'copper', 'neutral'] as const).map((key) => (
                    <button key={key} type="button" onClick={() => p.setFrame(prev => prev ? { ...prev, colorKey: key } : null)} className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-105 ${p.frame?.colorKey === key ? 'border-gray-800 ring-2 ring-offset-0.5 ring-gray-500' : 'border-gray-200'}`} style={{ backgroundColor: p.getFrameHex(key) }} title={key} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Effects below image (visible only on small screens) */}
        <div className="md:hidden border-t border-gray-200/80 p-3 space-y-3" style={{ backgroundColor: sidebarBg }}>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Effects</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-medium text-gray-600 mr-1">Tint</p>
            <button type="button" onClick={() => p.setTintOverlay(prev => prev?.colorKey === 'primary' && prev?.opacity === 0.15 ? null : { colorKey: 'primary', opacity: 0.15 })} className="text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all" style={{ borderColor: buttonBorder, backgroundColor: buttonBg, color: primary }}>Light</button>
            {(['primary', 'secondary', 'accent'] as const).map((key) => (
              <button key={key} type="button" onClick={() => p.setTintOverlay(prev => prev?.colorKey === key ? null : { colorKey: key, opacity: prev?.opacity ?? 0.15 })} className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-105 ${p.tintOverlay?.colorKey === key ? 'border-gray-800 ring-1 ring-offset-1 ring-gray-400' : 'border-gray-200'}`} style={{ backgroundColor: p.getHex(key) }} title={key} />
            ))}
            {p.tintOverlay && (
              <label className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <input type="range" min="0.1" max="0.8" step="0.05" value={typeof p.tintOverlay.opacity === 'number' ? p.tintOverlay.opacity : 0.15} onChange={(e) => { const v = parseFloat(e.target.value); if (!Number.isNaN(v)) p.setTintOverlay(prev => prev ? { ...prev, opacity: v } : null) }} className="w-20 h-1 accent-gray-600" />
                <span className="tabular-nums w-6">{Math.round((typeof p.tintOverlay.opacity === 'number' ? p.tintOverlay.opacity : 0.15) * 100)}%</span>
              </label>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-medium text-gray-600 mr-1">Frame</p>
            <select value={p.frame?.style ?? ''} onChange={(e) => { const v = e.target.value as FrameStyle | ''; if (v === 'gold' || v === 'silver' || v === 'copper' || v === 'neon' || v === 'filmstrip' || v === 'vignette') p.setTintOverlay(null); if (!v) p.setFrame(null); else if (v === 'gold' || v === 'silver' || v === 'copper') p.setFrame({ style: v, colorKey: v }); else p.setFrame(prev => ({ style: v, colorKey: prev?.colorKey ?? 'primary' })) }} className="text-[11px] border border-gray-200 rounded-md px-2.5 py-1.5 bg-white text-gray-800 focus:ring-2 focus:ring-gray-200 outline-none flex-1 min-w-[120px]">
              <option value="">None</option>
              <option value="thin">Thin</option><option value="solid">Solid</option><option value="thick">Thick</option><option value="rounded">Rounded</option>
              <option value="classic">Painting</option><option value="wooden">Wooden</option>
              <option value="vignette">Vignette</option><option value="neon">Neon</option><option value="filmstrip">Film strip</option>
              <option value="gold">Gold</option><option value="silver">Silver</option><option value="copper">Copper</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center" style={{ backgroundColor: headerBg }}>
        <button onClick={p.onSkip} className="text-sm text-gray-600 hover:text-gray-800 font-medium">Skip</button>
        <button
          onClick={() => p.onApply({ imageOverlays: p.overlays, overlayBorderColors: p.overlayBorderColors, tintOverlay: p.tintOverlay, textOverlays: p.textOverlays, frame: p.frame })}
          disabled={p.applying || (p.overlays.length === 0 && p.textOverlays.length === 0 && !p.frame && !p.tintOverlay)}
          className="px-5 py-2 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 hover:opacity-95"
          style={{ backgroundColor: (p.applying || (p.overlays.length === 0 && p.textOverlays.length === 0 && !p.frame && !p.tintOverlay)) ? undefined : primary }}
        >
          {p.applying ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Applying...
            </>
          ) : (
            <>Apply {p.totalItems > 0 && `(${p.totalItems})`}</>
          )}
        </button>
      </div>

      {p.draggingNew && (p.effectiveLogoUrl || p.effectivePhotoUrl) && (
        <div className="fixed pointer-events-none z-50 opacity-70" style={{ left: p.dragPosition.x - 30, top: p.dragPosition.y - 30, width: 60, height: 60 }}>
          <img
            src={p.draggingNew === 'logo' ? p.effectiveLogoUrl! : p.effectivePhotoUrl!}
            alt=""
            className={`w-full h-full ${p.draggingNew === 'photo' ? 'object-cover rounded-full' : 'object-contain rounded-lg'} shadow-xl`}
          />
        </div>
      )}
    </div>
  )
}
