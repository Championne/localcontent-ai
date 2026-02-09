/**
 * Frame style computation — extracted to .ts (not .tsx) to avoid SWC JSX parser issues
 * with template literals inside Record/object initializers.
 */
import type { CSSProperties } from 'react'
import type { FrameColorKey } from './ImageOverlayEditorTypes'

interface FrameStyleInput {
  frameStyle: string | undefined
  getFrameHex: (key: FrameColorKey) => string
  frameColorKey: FrameColorKey | undefined
}

export function computeFrameWrapperStyle(input: FrameStyleInput): CSSProperties {
  const fs = input.frameStyle
  if (!fs) {
    return { aspectRatio: '1', borderRadius: 0 }
  }

  const base: CSSProperties = {
    aspectRatio: '1',
    borderRadius: (fs === 'thin' || fs === 'solid' || fs === 'thick' || fs === 'neon') ? 12 : 0,
  }

  // Padding
  {
    const padMap: Record<string, number> = {
      thin: 3,
      double: 3,
      classic: 20,
      wooden: 20,
      thick: 16,
      gold: 16,
      silver: 16,
      copper: 16,
      filmstrip: 0,
      neon: 18,
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
  } else if (fs === 'filmstrip') {
    // no outer bg – the left/right strip divs supply the dark areas
  } else if (fs === 'neon') {
    const nHex = input.frameColorKey ? input.getFrameHex(input.frameColorKey) : '#00ff88'
    // Dark background with subtle ambient glow from neon reflecting off surfaces
    base.background = `radial-gradient(ellipse 85% 85% at 50% 50%, ${nHex}12 0%, ${nHex}06 50%, transparent 78%), #08080c`
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
    aspectRatio: '1',
    borderRadius: (fs === 'thin' || fs === 'solid' || fs === 'thick' || fs === 'neon') ? 12 : 0,
  }

  if (fs === 'double') {
    base.padding = '4px'
    base.background = '#ffffff'
    base.boxSizing = 'border-box'
  } else {
    const borderMap: Record<string, string | undefined> = {
      classic: undefined,
      wooden: undefined,
      gold: '2px solid rgba(255,248,220,0.9)',
      silver: '2px solid rgba(255,255,255,0.95)',
      copper: '2px solid rgba(253,240,224,0.9)',
      filmstrip: 'none',
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
  }

  if (fs === 'neon') {
    // White-hot core border (simulates gas-filled tube intensity)
    base.border = '2px solid rgba(255,255,255,0.88)'
    // Layered glow: white core → saturated color → wide bloom → color spill → inner glow
    base.boxShadow = [
      // White-hot core glow (innermost, nearly white)
      '0 0 2px #fff',
      '0 0 4px rgba(255,255,255,0.75)',
      // Saturated color bands (structural layer)
      '0 0 8px ' + fHex,
      '0 0 16px ' + fHex,
      // Bloom (soft glow, atmosphere)
      '0 0 32px ' + fHex + 'cc',
      '0 0 60px ' + fHex + '80',
      '0 0 100px ' + fHex + '50',
      // Wide color spill (light hitting nearby surfaces)
      '0 0 160px ' + fHex + '28',
      // Inner glow (light spilling onto image content)
      'inset 0 0 20px ' + fHex + '35',
      'inset 0 0 6px ' + fHex + '55',
    ].join(', ')
  } else if (fs && fs in shadowMap) {
    base.boxShadow = shadowMap[fs]
  }

  return base
}
