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
  const [customText, setCustomText] = React.useState('')
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
  const isMetalFrame = p.frame?.style === 'gold' || p.frame?.style === 'silver' || p.frame?.style === 'copper'
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm" style={{ backgroundColor: rootBg }}>
      {/* Floating shadow: elliptical contact shadow CSS */}
      {p.frame?.style === 'shadow' && (
        <style>{`
          .float-shadow-container { position: relative; }
          .float-shadow-container::after {
            content: '';
            position: absolute;
            bottom: 6px;
            left: 12%;
            width: 76%;
            height: 18px;
            background: rgba(0,0,0,0.18);
            border-radius: 50%;
            filter: blur(12px);
            z-index: 0;
            pointer-events: none;
          }
        `}</style>
      )}
      {/* Metallic frame shine animation */}
      {isMetalFrame && (
        <style>{`
          @keyframes metalShine {
            0%   { left: -120%; }
            100% { left: 120%; }
          }
          .metal-shine-wrapper { overflow: hidden; position: relative; }
          .metal-shine-wrapper::after {
            content: '';
            position: absolute;
            top: -10%;
            left: -120%;
            width: 45%;
            height: 120%;
            background: linear-gradient(
              105deg,
              transparent 30%,
              rgba(255,255,255,0.25) 45%,
              rgba(255,255,255,0.45) 50%,
              rgba(255,255,255,0.25) 55%,
              transparent 70%
            );
            z-index: 5;
            pointer-events: none;
            animation: metalShine 4s ease-in-out infinite;
          }
        `}</style>
      )}
      {/* Header: compact */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200/80 rounded-t-xl" style={{ backgroundColor: headerBg }}>
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm">
            <img src="/favicon-512.png" alt="GeoSpark" className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">Customize Your Image</h3>
          <p className="text-xs text-gray-600 mt-0.5">Drag items onto the image · Special effects on the right</p>
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
              Auto-position all
            </button>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col items-center justify-center min-w-0" style={{ backgroundColor: sidebarBg }}>
          <div
            className={`relative rounded-lg w-full max-w-[480px] aspect-square shadow-sm${isMetalFrame ? ' metal-shine-wrapper' : ''}${p.frame?.style === 'shadow' ? ' float-shadow-container' : ''}`}
            style={frameWrapperStyle}
          >
            <div
              ref={p.containerRef as React.RefObject<HTMLDivElement>}
              className="relative w-full h-full"
              style={containerStyle}
            >
              <div
                className="relative w-full h-full overflow-hidden rounded-lg"
                style={
                  p.frame?.style === 'double'
                    ? {
                        border: `6px solid ${p.frame ? p.getFrameHex(p.frame.colorKey) : '#e5e7eb'}`,
                        boxSizing: 'border-box',
                        borderRadius: 0,
                      }
                    : {}
                }
              >
              <img src={p.imageUrl} alt="Generated" className="w-full h-full object-cover" draggable={false} style={p.frame?.style === 'filmstrip' ? { filter: 'saturate(0.88)' } : p.frame?.style === 'polaroid' ? { filter: 'sepia(0.15) contrast(1.08) brightness(1.05) saturate(0.9)' } : undefined} />
              {p.frame?.style === 'vignette' && (() => {
                const intensity = p.vignetteIntensity ?? 0.35
                return (
                  <>
                    {/* Layer 1: Smooth radial vignette — organic lens-falloff curve */}
                    <div
                      className="absolute inset-0 pointer-events-none z-[2]"
                      style={{
                        background: `radial-gradient(ellipse 68% 68% at 50% 48%, transparent 0%, transparent 35%, rgba(0,0,0,${0.06 * intensity / 0.65}) 50%, rgba(0,0,0,${0.18 * intensity / 0.65}) 65%, rgba(0,0,0,${0.38 * intensity / 0.65}) 80%, rgba(0,0,0,${intensity}) 100%)`,
                      }}
                      aria-hidden
                    />
                    {/* Layer 2: Secondary soft circle for depth + corner emphasis */}
                    <div
                      className="absolute inset-0 pointer-events-none z-[2]"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, transparent 0%, transparent 55%, rgba(0,0,0,${0.10 * intensity / 0.65}) 75%, rgba(0,0,0,${0.22 * intensity / 0.65}) 100%)`,
                      }}
                      aria-hidden
                    />
                    {/* Layer 3: SVG feColorMatrix for smooth banding-free light falloff */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-[2]" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                      <defs>
                        <radialGradient id="vigSmooth" cx="50%" cy="48%" r="50%" fx="50%" fy="48%">
                          <stop offset="0%" stopColor="black" stopOpacity="0" />
                          <stop offset="40%" stopColor="black" stopOpacity="0" />
                          <stop offset="65%" stopColor="black" stopOpacity={0.12 * intensity / 0.65} />
                          <stop offset="80%" stopColor="black" stopOpacity={0.28 * intensity / 0.65} />
                          <stop offset="95%" stopColor="black" stopOpacity={0.50 * intensity / 0.65} />
                          <stop offset="100%" stopColor="black" stopOpacity={intensity * 0.85} />
                        </radialGradient>
                        <filter id="vigBlur">
                          <feGaussianBlur stdDeviation="2" />
                        </filter>
                      </defs>
                      <rect width="100" height="100" fill="url(#vigSmooth)" filter="url(#vigBlur)" />
                    </svg>
                  </>
                )
              })()}
              {/* Polaroid overlays: warm vignette + film grain texture */}
              {p.frame?.style === 'polaroid' && (
                <>
                  {/* Soft warm vignette — lighter than the standalone vignette effect */}
                  <div
                    className="absolute inset-0 pointer-events-none z-[2]"
                    style={{
                      background: 'radial-gradient(ellipse 80% 80% at 50% 48%, transparent 0%, transparent 55%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.35) 100%)',
                    }}
                    aria-hidden
                  />
                  {/* Warm tint overlay — slight amber cast */}
                  <div
                    className="absolute inset-0 pointer-events-none z-[2]"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,248,230,0.10) 0%, rgba(255,235,200,0.08) 100%)',
                    }}
                    aria-hidden
                  />
                  {/* Film grain — SVG noise pattern */}
                  <div
                    className="absolute inset-0 pointer-events-none z-[3]"
                    style={{
                      opacity: 0.06,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'repeat',
                      backgroundSize: '128px 128px',
                      mixBlendMode: 'overlay',
                    }}
                    aria-hidden
                  />
                </>
              )}
              {/* Classic painting frame: glass reflection effect */}
              {p.frame?.style === 'classic' && (
                <div
                  className="absolute inset-0 pointer-events-none z-[2]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 35%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.02) 70%, rgba(255,255,255,0) 100%)',
                    mixBlendMode: 'screen',
                  }}
                  aria-hidden
                />
              )}
              {/* Classic painting frame: SVG ornate moulding overlay on the frame border */}
              {p.frame?.style === 'classic' && (
                <style>{`
                  .classic-frame-ornate {
                    position: absolute;
                    inset: -26px;
                    pointer-events: none;
                    z-index: 3;
                    overflow: visible;
                  }
                  .classic-frame-ornate svg {
                    width: 100%;
                    height: 100%;
                    display: block;
                  }
                `}</style>
              )}
              {p.frame?.style === 'classic' && (
                <div className="classic-frame-ornate" aria-hidden>
                  <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      {/* Repeating bead/egg pattern for carved moulding along edges */}
                      <pattern id="cBeadH" patternUnits="userSpaceOnUse" width="24" height="8" patternTransform="translate(0,0)">
                        <ellipse cx="12" cy="4" rx="8" ry="3.5" fill="#c9a227" opacity="0.6"/>
                        <ellipse cx="12" cy="3.5" rx="6" ry="2.5" fill="#f5e6a8" opacity="0.35"/>
                      </pattern>
                      <pattern id="cBeadV" patternUnits="userSpaceOnUse" width="8" height="24" patternTransform="translate(0,0)">
                        <ellipse cx="4" cy="12" rx="3.5" ry="8" fill="#c9a227" opacity="0.6"/>
                        <ellipse cx="3.5" cy="12" rx="2.5" ry="6" fill="#f5e6a8" opacity="0.35"/>
                      </pattern>
                      {/* Outer stepped moulding gradient (top-lit) */}
                      <linearGradient id="cMouldOuter" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f5e6a8" stopOpacity="0.9"/>
                        <stop offset="30%" stopColor="#d4af37" stopOpacity="0.7"/>
                        <stop offset="70%" stopColor="#8b6914" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#5c4a1a" stopOpacity="0.8"/>
                      </linearGradient>
                      {/* Inner concave cove shadow */}
                      <linearGradient id="cCove" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3d2b1f" stopOpacity="0.5"/>
                        <stop offset="50%" stopColor="#7d6510" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#c9a227" stopOpacity="0.15"/>
                      </linearGradient>
                      {/* Specular highlight sweep */}
                      <linearGradient id="cSpec" x1="0" y1="0" x2="0.55" y2="0.55">
                        <stop offset="0%" stopColor="white" stopOpacity="0.30"/>
                        <stop offset="25%" stopColor="white" stopOpacity="0.10"/>
                        <stop offset="50%" stopColor="white" stopOpacity="0"/>
                        <stop offset="100%" stopColor="white" stopOpacity="0"/>
                      </linearGradient>
                      {/* Clip to frame band only (exclude inner image area) */}
                      <clipPath id="cFrameMask">
                        <path fillRule="evenodd" d="M0,0 H1000 V1000 H0Z M52,52 V948 H948 V52Z"/>
                      </clipPath>
                    </defs>
                    <g clipPath="url(#cFrameMask)">
                      {/* Outer bead moulding band — carved egg pattern */}
                      <rect x="0" y="4" width="1000" height="10" fill="url(#cBeadH)" opacity="0.7"/>
                      <rect x="0" y="986" width="1000" height="10" fill="url(#cBeadH)" opacity="0.5"/>
                      <rect x="4" y="0" width="10" height="1000" fill="url(#cBeadV)" opacity="0.7"/>
                      <rect x="986" y="0" width="10" height="1000" fill="url(#cBeadV)" opacity="0.5"/>
                      {/* Stepped moulding profile lines */}
                      <rect x="16" y="16" width="968" height="968" fill="none" stroke="#f5e6a8" strokeWidth="1.5" opacity="0.5"/>
                      <rect x="20" y="20" width="960" height="960" fill="none" stroke="#5c4a1a" strokeWidth="1" opacity="0.35"/>
                      {/* Concave cove channel */}
                      <rect x="24" y="24" width="952" height="952" fill="none" stroke="#3d2b1f" strokeWidth="2" opacity="0.25"/>
                      {/* Inner bead moulding band */}
                      <rect x="0" y="38" width="1000" height="8" fill="url(#cBeadH)" opacity="0.5"/>
                      <rect x="0" y="954" width="1000" height="8" fill="url(#cBeadH)" opacity="0.35"/>
                      <rect x="38" y="0" width="8" height="1000" fill="url(#cBeadV)" opacity="0.5"/>
                      <rect x="954" y="0" width="8" height="1000" fill="url(#cBeadV)" opacity="0.35"/>
                      {/* Inner gold fillet (bright edge where frame meets mat) */}
                      <rect x="48" y="48" width="904" height="904" fill="none" stroke="#f5e6a8" strokeWidth="1.5" opacity="0.6"/>
                      {/* Corner rosette decorations */}
                      <circle cx="26" cy="26" r="14" fill="none" stroke="#d4af37" strokeWidth="1.5" opacity="0.55"/>
                      <circle cx="26" cy="26" r="7" fill="#c9a227" opacity="0.3"/>
                      <circle cx="974" cy="26" r="14" fill="none" stroke="#d4af37" strokeWidth="1.5" opacity="0.45"/>
                      <circle cx="974" cy="26" r="7" fill="#c9a227" opacity="0.25"/>
                      <circle cx="26" cy="974" r="14" fill="none" stroke="#d4af37" strokeWidth="1.5" opacity="0.45"/>
                      <circle cx="26" cy="974" r="7" fill="#c9a227" opacity="0.25"/>
                      <circle cx="974" cy="974" r="14" fill="none" stroke="#d4af37" strokeWidth="1.5" opacity="0.35"/>
                      <circle cx="974" cy="974" r="7" fill="#c9a227" opacity="0.2"/>
                      {/* Specular highlight sweep across entire frame */}
                      <rect width="1000" height="1000" fill="url(#cSpec)"/>
                    </g>
                  </svg>
                </div>
              )}
              {(p.frame?.style === 'gold' || p.frame?.style === 'silver' || p.frame?.style === 'copper') && (
                <div
                  className="absolute inset-0 pointer-events-none z-[2]"
                  style={{
                    background: p.frame.style === 'gold'
                      ? 'linear-gradient(135deg, rgba(191,149,63,0.08) 0%, rgba(252,246,186,0.12) 40%, rgba(170,119,29,0.08) 100%)'
                      : p.frame.style === 'silver'
                      ? 'linear-gradient(135deg, rgba(189,195,199,0.06) 0%, rgba(230,233,240,0.10) 40%, rgba(149,165,166,0.06) 100%)'
                      : 'linear-gradient(135deg, rgba(128,74,0,0.08) 0%, rgba(237,201,175,0.12) 40%, rgba(93,58,26,0.08) 100%)',
                    boxShadow: p.frame.style === 'gold'
                      ? 'inset 2px 2px 8px rgba(0,0,0,0.20), inset -1px -1px 4px rgba(0,0,0,0.08)'
                      : p.frame.style === 'silver'
                      ? 'inset 2px 2px 8px rgba(0,0,0,0.16), inset -1px -1px 4px rgba(0,0,0,0.06)'
                      : 'inset 2px 2px 8px rgba(0,0,0,0.20), inset -1px -1px 4px rgba(0,0,0,0.08)',
                  }}
                  aria-hidden
                />
              )}
              {/* Neon: atmospheric overlays — color spill, bloom, subtle darkening */}
              {p.frame?.style === 'neon' && (
                <>
                  {/* Subtle image darkening so neon glow pops */}
                  <div className="absolute inset-0 pointer-events-none z-[2] rounded-[10px]" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }} aria-hidden />
                  {/* Strong inner edge glow — neon light bleeding onto the image surface */}
                  <div className="absolute inset-0 pointer-events-none z-[3] rounded-[10px]" style={{
                    boxShadow: `inset 0 0 40px ${p.getFrameHex(p.frame.colorKey)}55, inset 0 0 80px ${p.getFrameHex(p.frame.colorKey)}30, inset 0 0 120px ${p.getFrameHex(p.frame.colorKey)}18`,
                  }} aria-hidden />
                  {/* Color spill from neon border onto image edges */}
                  <div className="absolute inset-0 pointer-events-none z-[3] rounded-[10px]" style={{
                    background: [
                      `linear-gradient(to right, ${p.getFrameHex(p.frame.colorKey)}40 0%, transparent 20%)`,
                      `linear-gradient(to left, ${p.getFrameHex(p.frame.colorKey)}40 0%, transparent 20%)`,
                      `linear-gradient(to bottom, ${p.getFrameHex(p.frame.colorKey)}40 0%, transparent 20%)`,
                      `linear-gradient(to top, ${p.getFrameHex(p.frame.colorKey)}40 0%, transparent 20%)`,
                    ].join(', '),
                  }} aria-hidden />
                  {/* Corner bloom reflections — light concentrating in corners */}
                  <div className="absolute inset-0 pointer-events-none z-[3] rounded-[10px]" style={{
                    background: [
                      `radial-gradient(circle at 0% 0%, ${p.getFrameHex(p.frame.colorKey)}38 0%, transparent 28%)`,
                      `radial-gradient(circle at 100% 0%, ${p.getFrameHex(p.frame.colorKey)}30 0%, transparent 25%)`,
                      `radial-gradient(circle at 0% 100%, ${p.getFrameHex(p.frame.colorKey)}30 0%, transparent 25%)`,
                      `radial-gradient(circle at 100% 100%, ${p.getFrameHex(p.frame.colorKey)}38 0%, transparent 28%)`,
                    ].join(', '),
                  }} aria-hidden />
                </>
              )}
              {p.frame?.style === 'filmstrip' && (
                <>
                  {/* Left film strip: dark strip with rectangular sprocket holes */}
                  <div className="absolute top-0 left-0 bottom-0 w-8 pointer-events-none z-[2] flex flex-col items-center justify-around py-2" style={{ backgroundColor: '#1a1a1a' }} aria-hidden>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={`l${i}`} style={{ width: '10px', height: '16px', backgroundColor: '#ffffff', borderRadius: '1px', flexShrink: 0 }} />
                    ))}
                  </div>
                  {/* Right film strip: dark strip with rectangular sprocket holes */}
                  <div className="absolute top-0 right-0 bottom-0 w-8 pointer-events-none z-[2] flex flex-col items-center justify-around py-2" style={{ backgroundColor: '#1a1a1a' }} aria-hidden>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={`r${i}`} style={{ width: '10px', height: '16px', backgroundColor: '#ffffff', borderRadius: '1px', flexShrink: 0 }} />
                    ))}
                  </div>

                  {/* ── Atmospheric & Texture Overlays (Vintage Look) ── */}

                  {/* 1. Film grain & noise — organic texture that breaks digital sharpness */}
                  <div className="absolute inset-0 pointer-events-none z-[3]" style={{ mixBlendMode: 'overlay' as const, opacity: 0.55 }} aria-hidden>
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <filter id="filmGrainCSS" x="0%" y="0%" width="100%" height="100%">
                          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={4} stitchTiles="stitch" result="noise" />
                          <feColorMatrix type="saturate" values="0" in="noise" />
                        </filter>
                      </defs>
                      <rect x="0" y="0" width="100%" height="100%" filter="url(#filmGrainCSS)" opacity="1" />
                    </svg>
                  </div>

                  {/* 2. Dust and scratches — physical wear-and-tear of old celluloid */}
                  <div className="absolute inset-0 pointer-events-none z-[3]" style={{ mixBlendMode: 'screen' as const, opacity: 0.35 }} aria-hidden>
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      {/* Vertical scratches — thicker, more visible */}
                      <line x1="15%" y1="0" x2="14%" y2="100%" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
                      <line x1="42%" y1="5%" x2="43%" y2="85%" stroke="rgba(255,255,255,0.65)" strokeWidth="0.8" />
                      <line x1="67%" y1="10%" x2="66%" y2="95%" stroke="rgba(255,255,255,0.7)" strokeWidth="0.9" />
                      <line x1="88%" y1="0" x2="89%" y2="70%" stroke="rgba(255,255,255,0.55)" strokeWidth="0.7" />
                      <line x1="30%" y1="3%" x2="31%" y2="60%" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />
                      <line x1="55%" y1="8%" x2="54%" y2="92%" stroke="rgba(255,255,255,0.45)" strokeWidth="0.5" />
                      <line x1="78%" y1="12%" x2="79%" y2="75%" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                      {/* Dust specks — larger */}
                      <circle cx="25%" cy="30%" r="2" fill="rgba(255,255,255,0.6)" />
                      <circle cx="55%" cy="15%" r="1.5" fill="rgba(255,255,255,0.55)" />
                      <circle cx="80%" cy="60%" r="2.5" fill="rgba(255,255,255,0.5)" />
                      <circle cx="35%" cy="75%" r="1.2" fill="rgba(255,255,255,0.6)" />
                      <circle cx="70%" cy="45%" r="1.8" fill="rgba(255,255,255,0.5)" />
                      <circle cx="10%" cy="85%" r="2.2" fill="rgba(255,255,255,0.45)" />
                      <circle cx="48%" cy="52%" r="1" fill="rgba(255,255,255,0.5)" />
                      <circle cx="92%" cy="20%" r="1.5" fill="rgba(255,255,255,0.4)" />
                    </svg>
                  </div>

                  {/* 3. Light leaks — red/orange/white streaks simulating light hitting the film */}
                  <div className="absolute inset-0 pointer-events-none z-[3]" style={{
                    background: 'linear-gradient(105deg, rgba(255,120,50,0.35) 0%, rgba(255,180,80,0.15) 18%, transparent 42%), linear-gradient(250deg, rgba(255,60,60,0.25) 0%, rgba(255,140,60,0.10) 14%, transparent 36%)',
                    mixBlendMode: 'screen' as const,
                  }} aria-hidden />

                  {/* 4. Film burns — "hot" spots / orange flares at edges of reel */}
                  <div className="absolute inset-0 pointer-events-none z-[3]" style={{
                    background: 'radial-gradient(ellipse 45% 65% at 2% 50%, rgba(255,140,40,0.40) 0%, rgba(255,100,20,0.12) 50%, transparent 75%), radial-gradient(ellipse 30% 40% at 98% 22%, rgba(255,180,80,0.25) 0%, transparent 65%), radial-gradient(ellipse 40% 30% at 50% 98%, rgba(255,120,40,0.18) 0%, transparent 55%)',
                    mixBlendMode: 'screen' as const,
                  }} aria-hidden />

                  {/* 5. Warm vintage color cast — sepia tint */}
                  <div className="absolute inset-0 pointer-events-none z-[3]" style={{
                    backgroundColor: 'rgba(160,120,60,0.12)',
                    mixBlendMode: 'multiply' as const,
                  }} aria-hidden />

                  {/* 6. Overall desaturation + warmth via CSS gradient */}
                  <div className="absolute inset-0 pointer-events-none z-[3]" style={{
                    background: 'linear-gradient(180deg, rgba(180,140,80,0.08) 0%, rgba(120,80,30,0.10) 100%)',
                    mixBlendMode: 'color' as const,
                  }} aria-hidden />
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
                const isNearBottom = overlay.y > 55
                const isNearTop = overlay.y < 20
                const showAbove = isNearBottom && !isNearTop
                const showPanelLeft = !showAbove && overlay.x > 55
                const isPhoto = overlay.type === 'photo'
                return (
                  <div
                    key={overlay.id}
                    onMouseDown={(e) => p.handleOverlayDragStart(overlay.id, e)}
                    onTouchStart={(e) => p.handleOverlayDragStart(overlay.id, e)}
                    className="absolute cursor-move group z-10"
                    style={{
                      left: `${overlay.x}%`,
                      top: `${overlay.y}%`,
                      width: `${overlay.scale}%`,
                      ...(isPhoto ? { height: `${overlay.scale}%` } : {}),
                    }}
                  >
                    <span
                      className={`block ${isPhoto ? 'w-full h-full rounded-full' : 'inline-block'}`}
                      style={{
                        boxShadow: `0 0 0 3px ${borderHex}, 0 2px 8px rgba(0,0,0,0.15)`,
                        borderRadius: isPhoto ? '9999px' : '6px',
                        ...(isPhoto ? {} : { display: 'block', overflow: 'hidden' }),
                      }}
                    >
                      <img
                        src={overlay.url}
                        alt=""
                        className={`${isPhoto ? 'w-full h-full object-cover rounded-full' : 'w-full h-auto'}`}
                        style={isPhoto ? {} : { borderRadius: '6px', display: 'block' }}
                        draggable={false}
                      />
                    </span>
                    <div
                      className={`absolute opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 z-[60] flex flex-col gap-2.5 w-44 rounded-xl p-3 border bg-white backdrop-blur-sm ${showAbove ? 'bottom-full mb-2 left-0' : showPanelLeft ? 'right-full mr-2 top-1/2 -translate-y-1/2' : 'left-full ml-2 top-1/2 -translate-y-1/2'}`}
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
                const isRightAnchored = t.x > 50
                const isNearBottom = t.y > 60
                const isNearTop = t.y < 25
                // Show panel above when near bottom, below when near top, otherwise to the side
                const showAbove = isNearBottom && !isNearTop
                const showPanelLeft = !showAbove && t.x > 60
                return (
                <div key={t.id} onMouseDown={(e) => p.handleOverlayDragStart(t.id, e)} onTouchStart={(e) => p.handleOverlayDragStart(t.id, e)} className="absolute cursor-move group z-10" style={{ left: `${t.x}%`, top: `${t.y}%`, transform: `translate(${isRightAnchored ? '-100%' : '0'}, -50%)`, whiteSpace: 'nowrap' }}>
                  <span className="font-bold px-1" style={{ color: p.getHex(t.colorKey), fontSize: Math.min(48, Math.max(8, t.fontSize)), fontFamily: t.fontFamily || 'Inter', WebkitTextStroke: '0.5px rgba(0,0,0,0.5)', textShadow: '0 1px 3px rgba(0,0,0,0.6), 0 0px 8px rgba(0,0,0,0.3)' }}>{t.text}</span>
                  <div
                    className={`absolute opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 z-[60] flex flex-col gap-2.5 w-44 rounded-xl p-3 border bg-white backdrop-blur-sm ${showAbove ? 'bottom-full mb-2 left-0' : showPanelLeft ? 'right-full mr-2 top-1/2 -translate-y-1/2' : 'left-full ml-2 top-1/2 -translate-y-1/2'}`}
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
                        <button type="button" onClick={(e) => { e.stopPropagation(); p.setTextOverlays(prev => prev.map(x => x.id === t.id ? { ...x, fontSize: Math.max(8, x.fontSize - 1) } : x)) }} className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-colors" style={{ color: primary }}>−</button>
                        <span className="text-[10px] tabular-nums text-gray-500 w-5 text-center">{t.fontSize}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); p.setTextOverlays(prev => prev.map(x => x.id === t.id ? { ...x, fontSize: Math.min(48, x.fontSize + 1) } : x)) }} className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-colors" style={{ color: primary }}>+</button>
                      </div>
                      <span className="text-[10px] font-medium text-gray-600">Font</span>
                      <select value={t.fontFamily || 'Inter'} onChange={(e) => { e.stopPropagation(); const v = e.target.value as TextOverlayFont; p.setTextOverlays(prev => prev.map(x => x.id === t.id ? { ...x, fontFamily: v } : x)) }} onClick={(e) => e.stopPropagation()} className="text-[10px] border border-gray-200 rounded-md px-1.5 py-1 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-offset-0 outline-none w-full max-w-[110px]" style={{ borderColor: hexWithAlpha(primary, 0.2) }}>
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

        {/* Right panel: Special Effects (Tint + Frame) */}
        <div className="w-44 sm:w-52 border-l border-gray-200/80 p-3 hidden md:block" style={{ backgroundColor: sidebarBg }}>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Special Effects</p>

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
                <button type="button" onClick={() => p.setTintOverlay(null)} className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-105 relative ${!p.tintOverlay ? 'border-gray-800 ring-1 ring-offset-1 ring-gray-400' : 'border-gray-200'}`} style={{ background: 'linear-gradient(135deg, #fff 40%, #e5e7eb 60%)' }} title="No tint">
                  <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-bold leading-none">✕</span>
                </button>
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
              onChange={(e) => { const v = e.target.value as FrameStyle | ''; if (v === 'gold' || v === 'silver' || v === 'copper' || v === 'neon' || v === 'filmstrip' || v === 'vignette' || v === 'polaroid') p.setTintOverlay(null); if (!v) p.setFrame(null); else if (v === 'gold' || v === 'silver' || v === 'copper') p.setFrame({ style: v, colorKey: v }); else p.setFrame(prev => ({ style: v, colorKey: prev?.colorKey ?? 'primary' })) }}
              className="text-[11px] border border-gray-200 rounded-md px-2.5 py-1.5 bg-white text-gray-800 focus:ring-2 focus:ring-gray-200 outline-none w-full mb-2"
            >
              <option value="">None</option>
              <optgroup label="Borders">
                <option value="thin">Thin line</option>
                <option value="solid">Solid border</option>
                <option value="thick">Thick border</option>
                <option value="double">Double line</option>
              </optgroup>
              <optgroup label="Frames">
                <option value="classic">Painting frame</option>
                <option value="wooden">Wooden frame</option>
                <option value="shadow">Floating shadow</option>
              </optgroup>
              <optgroup label="Mood">
                <option value="polaroid">Polaroid</option>
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
            {/* Vignette intensity slider — only visible when vignette frame is selected */}
            {p.frame?.style === 'vignette' && (
              <div className="mb-2">
                <label className="flex items-center gap-2 text-[11px] text-gray-600">
                  <span className="whitespace-nowrap">Softness</span>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={p.vignetteIntensity}
                    onChange={(e) => { const v = parseFloat(e.target.value); if (!Number.isNaN(v)) p.setVignetteIntensity(v) }}
                    className="w-full h-1 accent-gray-600"
                  />
                  <span className="tabular-nums w-10 text-right text-[10px]">{Math.round(p.vignetteIntensity * 100)}%</span>
                </label>
              </div>
            )}
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

          {/* Add Text */}
          <div className="mt-4 pt-3 border-t border-gray-200/60">
            <p className="text-[11px] font-medium text-gray-600 mb-1.5">Add Text</p>
            <div className="flex gap-1">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customText.trim()) {
                    p.setTextOverlays(prev => [...prev, { id: `text-custom-${Date.now()}`, text: customText.trim(), x: 50, y: 50, fontSize: 24, fontFamily: 'Inter', colorKey: 'primary' }])
                    setCustomText('')
                  }
                }}
                placeholder="Type text..."
                className="flex-1 min-w-0 text-[11px] border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-800 focus:ring-2 focus:ring-gray-200 outline-none placeholder-gray-400"
              />
              <button
                type="button"
                disabled={!customText.trim()}
                onClick={() => {
                  if (customText.trim()) {
                    p.setTextOverlays(prev => [...prev, { id: `text-custom-${Date.now()}`, text: customText.trim(), x: 50, y: 50, fontSize: 24, fontFamily: 'Inter', colorKey: 'primary' }])
                    setCustomText('')
                  }
                }}
                className="px-2.5 py-1.5 text-[11px] font-medium rounded-md text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                style={{ backgroundColor: customText.trim() ? primary : '#9CA3AF' }}
              >
                Add
              </button>
            </div>
            {p.textOverlays.length > 0 && (
              <p className="text-[10px] text-gray-400 mt-1.5">{p.textOverlays.length} text item{p.textOverlays.length !== 1 ? 's' : ''} on image</p>
            )}
          </div>
        </div>

        {/* Mobile: Special Effects below image (visible only on small screens) */}
        <div className="md:hidden border-t border-gray-200/80 p-3 space-y-3" style={{ backgroundColor: sidebarBg }}>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Special Effects</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-medium text-gray-600 mr-1">Tint</p>
            <button type="button" onClick={() => p.setTintOverlay(prev => prev?.colorKey === 'primary' && prev?.opacity === 0.15 ? null : { colorKey: 'primary', opacity: 0.15 })} className="text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all" style={{ borderColor: buttonBorder, backgroundColor: buttonBg, color: primary }}>Light</button>
            <button type="button" onClick={() => p.setTintOverlay(null)} className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-105 relative ${!p.tintOverlay ? 'border-gray-800 ring-1 ring-offset-1 ring-gray-400' : 'border-gray-200'}`} style={{ background: 'linear-gradient(135deg, #fff 40%, #e5e7eb 60%)' }} title="No tint">
              <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-[9px] font-bold leading-none">✕</span>
            </button>
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
            <select value={p.frame?.style ?? ''} onChange={(e) => { const v = e.target.value as FrameStyle | ''; if (v === 'gold' || v === 'silver' || v === 'copper' || v === 'neon' || v === 'filmstrip' || v === 'vignette' || v === 'polaroid') p.setTintOverlay(null); if (!v) p.setFrame(null); else if (v === 'gold' || v === 'silver' || v === 'copper') p.setFrame({ style: v, colorKey: v }); else p.setFrame(prev => ({ style: v, colorKey: prev?.colorKey ?? 'primary' })) }} className="text-[11px] border border-gray-200 rounded-md px-2.5 py-1.5 bg-white text-gray-800 focus:ring-2 focus:ring-gray-200 outline-none flex-1 min-w-[120px]">
              <option value="">None</option>
              <option value="thin">Thin</option><option value="solid">Solid</option><option value="thick">Thick</option>
              <option value="classic">Painting</option><option value="wooden">Wooden</option>
              <option value="polaroid">Polaroid</option><option value="vignette">Vignette</option><option value="neon">Neon</option><option value="filmstrip">Film strip</option>
              <option value="gold">Gold</option><option value="silver">Silver</option><option value="copper">Copper</option>
            </select>
          </div>
          {p.frame?.style === 'vignette' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-600 whitespace-nowrap">Softness</span>
              <input type="range" min="0.2" max="1.0" step="0.05" value={p.vignetteIntensity} onChange={(e) => { const v = parseFloat(e.target.value); if (!Number.isNaN(v)) p.setVignetteIntensity(v) }} className="flex-1 h-1 accent-gray-600" />
              <span className="text-[10px] text-gray-500 tabular-nums w-8 text-right">{Math.round(p.vignetteIntensity * 100)}%</span>
            </div>
          )}
          {/* Add Text (mobile) */}
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-medium text-gray-600 mr-1">Text</p>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customText.trim()) {
                  p.setTextOverlays(prev => [...prev, { id: `text-custom-${Date.now()}`, text: customText.trim(), x: 50, y: 50, fontSize: 24, fontFamily: 'Inter', colorKey: 'primary' }])
                  setCustomText('')
                }
              }}
              placeholder="Type text..."
              className="flex-1 min-w-0 text-[11px] border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-800 focus:ring-2 focus:ring-gray-200 outline-none placeholder-gray-400"
            />
            <button
              type="button"
              disabled={!customText.trim()}
              onClick={() => {
                if (customText.trim()) {
                  p.setTextOverlays(prev => [...prev, { id: `text-custom-${Date.now()}`, text: customText.trim(), x: 50, y: 50, fontSize: 24, fontFamily: 'Inter', colorKey: 'primary' }])
                  setCustomText('')
                }
              }}
              className="px-2.5 py-1.5 text-[11px] font-medium rounded-md text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: customText.trim() ? primary : '#9CA3AF' }}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center rounded-b-xl" style={{ backgroundColor: headerBg }}>
        <button onClick={p.onSkip} className="text-sm text-gray-600 hover:text-gray-800 font-medium">Skip</button>
        <button
          onClick={() => p.onApply({ imageOverlays: p.overlays, overlayBorderColors: p.overlayBorderColors, tintOverlay: p.tintOverlay, textOverlays: p.textOverlays, frame: p.frame, vignetteIntensity: p.vignetteIntensity })}
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
