/**
 * Frame style computation — extracted to .ts (not .tsx) to avoid SWC JSX parser issues
 * with template literals inside Record/object initializers.
 */
import type { CSSProperties } from 'react'

interface FrameStyleInput {
  frameStyle: string | undefined
  getFrameHex: (key: string) => string
  frameColorKey: string | undefined
}

export function computeFrameWrapperStyle(input: FrameStyleInput): CSSProperties {
  const fs = input.frameStyle
  if (!fs) {
    return { aspectRatio: '1', borderRadius: 0 }
  }

  const base: CSSProperties = {
    aspectRatio: fs === 'polaroid' ? '3/4' : '1',
    borderRadius: fs === 'rounded' ? 12 : 0,
  }

  // Padding
  if (fs !== 'polaroid') {
    const padMap: Record<string, number> = {
      thin: 3,
      classic: 20,
      wooden: 20,
      thick: 16,
      gold: 16,
      silver: 16,
      copper: 16,
      filmstrip: 32,
      neon: 32,
      shadow: 40,
      vignette: 0,
    }
    base.padding = padMap[fs] ?? 8
  }

  // Background
  if (fs === 'classic') {
    base.background =
      'linear-gradient(135deg, #f5e6a8 0%, #e8c547 25%, #b8860b 55%, #7d6510 85%, #5c4a1a 100%), ' +
      'linear-gradient(315deg, rgba(0,0,0,0.15) 0%, transparent 40%)'
    base.boxShadow =
      'inset 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,254,248,0.4)'
  } else if (fs === 'wooden') {
    base.background =
      'linear-gradient(135deg, #d4a574 0%, #a67c52 30%, #7d5a3a 60%, #5c3d2e 85%, #3d2817 100%), ' +
      'linear-gradient(315deg, rgba(0,0,0,0.12) 0%, transparent 45%)'
    base.boxShadow =
      'inset 0 1px 0 rgba(255,235,215,0.25), inset 0 -1px 0 rgba(0,0,0,0.2)'
  } else if (fs === 'gold') {
    base.background =
      'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.2) 25%, transparent 45%), ' +
      'linear-gradient(135deg, #fffce0 0%, #f0d84a 8%, #d4a817 25%, #a67c0a 45%, #5c4a0a 75%, #3d3008 100%)'
  } else if (fs === 'silver') {
    base.background =
      'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.25) 25%, transparent 45%), ' +
      'linear-gradient(135deg, #ffffff 0%, #e8e8e8 12%, #c0c0c0 35%, #808080 60%, #404040 85%, #1a1a1a 100%)'
  } else if (fs === 'copper') {
    base.background =
      'linear-gradient(135deg, rgba(255,253,248,0.5) 0%, rgba(255,240,220,0.15) 25%, transparent 45%), ' +
      'linear-gradient(135deg, #fdf5eb 0%, #e8b878 15%, #c48450 40%, #8b4513 68%, #5c2e0a 88%, #2d1804 100%)'
  } else if (fs === 'polaroid') {
    base.backgroundColor = 'transparent'
  } else if (fs === 'filmstrip') {
    base.backgroundColor = '#121212'
  } else if (fs === 'neon') {
    base.backgroundColor = '#0a0a0e'
  } else if (fs === 'shadow') {
    base.backgroundColor = '#f5f7fa'
  } else if (fs === 'vignette') {
    // no bg
  } else if (input.frameColorKey) {
    base.backgroundColor = input.getFrameHex(input.frameColorKey)
  }

  return base
}

export function computeContainerStyle(input: FrameStyleInput): CSSProperties {
  const fs = input.frameStyle
  const fHex = input.frameColorKey
    ? input.getFrameHex(input.frameColorKey)
    : '#e5e7eb'

  const base: CSSProperties = {
    aspectRatio: fs === 'polaroid' ? '3/4' : '1',
    borderRadius: fs === 'rounded' ? 12 : 0,
  }

  if (fs === 'double') {
    base.padding = '8px'
    base.background = '#ffffff'
    base.border = '2px solid ' + fHex
    base.boxSizing = 'border-box'
  } else {
    const borderMap: Record<string, string | undefined> = {
      classic: undefined,
      wooden: undefined,
      gold: '2px solid rgba(255,248,220,0.9)',
      silver: '2px solid rgba(255,255,255,0.95)',
      copper: '2px solid rgba(253,240,224,0.9)',
      dashed: '3px dashed ' + fHex,
      dotted: '3px dotted ' + fHex,
      polaroid: 'none',
      filmstrip: '1px solid #2a2a2a',
    }
    if (fs && fs in borderMap) {
      base.border = borderMap[fs]
    }
  }

  const shadowMap: Record<string, string> = {
    classic: 'inset 0 0 0 2px rgba(255,255,255,0.5)',
    wooden: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
    shadow: '0 24px 48px rgba(0,0,0,0.4), 0 12px 24px rgba(0,0,0,0.25)',
    gold: 'inset 0 1px 0 rgba(255,252,224,0.9), inset 0 3px 8px -2px rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.25)',
    silver: 'inset 0 1px 0 rgba(255,255,255,0.98), inset 0 3px 8px -2px rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.3)',
    copper: 'inset 0 1px 0 rgba(253,245,235,0.95), inset 0 3px 8px -2px rgba(255,248,235,0.25), inset 0 -2px 0 rgba(0,0,0,0.25)',
    polaroid: 'none',
  }

  if (fs === 'neon') {
    base.boxShadow = '0 0 40px ' + fHex + ', 0 0 20px ' + fHex + '99, 0 0 8px ' + fHex
  } else if (fs && fs in shadowMap) {
    base.boxShadow = shadowMap[fs]
  }

  return base
}
