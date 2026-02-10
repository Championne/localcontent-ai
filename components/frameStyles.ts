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
      double: 6,
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
      polaroid: 0, // handled specially below
    }
    base.padding = padMap[fs] ?? 8
  }

  // Background
  if (fs === 'classic') {
    // Gallery painting frame: dark ornate outer frame with gold tones
    base.border = '18px solid #3d2b1f'
    base.borderImage = 'linear-gradient(135deg, #f5e6a8 0%, #c9a227 15%, #8b6914 35%, #5c4a1a 55%, #7d6510 70%, #b8860b 85%, #e8c547 100%) 1'
    base.padding = '12px' // White mat area between frame and image
    base.background = '#faf8f2' // Off-white mat colour
    base.boxShadow = [
      // Shadow on the mat (inner)
      'inset 0 0 12px rgba(0,0,0,0.15)',
      'inset 0 0 3px rgba(0,0,0,0.08)',
      // Wall shadow (outer depth)
      '0 10px 30px rgba(0,0,0,0.45)',
      '0 4px 12px rgba(0,0,0,0.25)',
    ].join(', ')
  } else if (fs === 'wooden') {
    // Realistic wooden frame: grain texture + miter joint borders + wall shadow
    base.background = [
      // Procedural grain lines (thin horizontal repeating stripes)
      'repeating-linear-gradient(180deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px, transparent 4px, transparent 7px)',
      // Secondary knot/variation grain at slight angle
      'repeating-linear-gradient(174deg, transparent, transparent 11px, rgba(210,180,140,0.12) 11px, rgba(210,180,140,0.12) 13px, transparent 13px, transparent 23px)',
      // Light source highlight (top-left lighter, bottom-right darker)
      'linear-gradient(135deg, rgba(255,235,215,0.22) 0%, transparent 40%, rgba(0,0,0,0.18) 100%)',
      // Base wood colour gradient
      'linear-gradient(160deg, #d2b48c 0%, #a67c52 18%, #7d5a3a 40%, #63412e 68%, #3d2b1f 100%)',
    ].join(', ')
    // Miter-joint simulation: top/left lighter (light hits), bottom/right darker (shadow)
    base.borderStyle = 'solid'
    base.borderWidth = '3px'
    base.borderColor = '#7d5239 #543726 #402a1d #63412e'
    // Wall shadow + inner highlight/shadow
    base.boxShadow = [
      '0 10px 30px rgba(0,0,0,0.45)',
      '0 4px 12px rgba(0,0,0,0.25)',
      'inset 0 1px 0 rgba(255,235,215,0.30)',
      'inset 0 -1px 0 rgba(0,0,0,0.25)',
    ].join(', ')
  } else if (fs === 'gold') {
    // Polished gold: multi-stop gradient with hard stops for metallic sheen
    base.border = '16px solid transparent'
    base.borderImage = 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771d) 1'
    base.padding = 0
    // Outer glow (wall shadow) + inner highlight
    base.boxShadow = [
      '0 6px 20px rgba(0,0,0,0.35)',
      '0 2px 8px rgba(0,0,0,0.2)',
      'inset 0 1px 0 rgba(255,252,224,0.6)',
      'inset 0 -1px 0 rgba(0,0,0,0.2)',
    ].join(', ')
    base.background = 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771d 100%)'
  } else if (fs === 'silver') {
    // Polished silver: cool metallic gradient
    base.border = '16px solid transparent'
    base.borderImage = 'linear-gradient(135deg, #e6e9f0, #bdc3c7, #95a5a6, #bdc3c7, #eef1f5) 1'
    base.padding = 0
    base.boxShadow = [
      '0 6px 20px rgba(0,0,0,0.30)',
      '0 2px 8px rgba(0,0,0,0.18)',
      'inset 0 1px 0 rgba(255,255,255,0.7)',
      'inset 0 -1px 0 rgba(0,0,0,0.15)',
    ].join(', ')
    base.background = 'linear-gradient(135deg, #e6e9f0 0%, #bdc3c7 25%, #95a5a6 50%, #bdc3c7 75%, #eef1f5 100%)'
  } else if (fs === 'copper') {
    // Polished bronze: warm metallic gradient
    base.border = '16px solid transparent'
    base.borderImage = 'linear-gradient(135deg, #804a00, #edc9af, #a0522d, #d4a76a, #5d3a1a) 1'
    base.padding = 0
    base.boxShadow = [
      '0 6px 20px rgba(0,0,0,0.35)',
      '0 2px 8px rgba(0,0,0,0.22)',
      'inset 0 1px 0 rgba(237,201,175,0.5)',
      'inset 0 -1px 0 rgba(0,0,0,0.2)',
    ].join(', ')
    base.background = 'linear-gradient(135deg, #804a00 0%, #edc9af 25%, #a0522d 50%, #d4a76a 75%, #5d3a1a 100%)'
  } else if (fs === 'polaroid') {
    // Authentic Polaroid: off-white paper, unequal padding (wider bottom for caption area), slight rotation, soft shadow
    base.background = '#fefefe'
    base.padding = '14px 14px 48px 14px'
    base.boxShadow = [
      '0 6px 16px rgba(0,0,0,0.18)',
      '0 2px 6px rgba(0,0,0,0.12)',
      '1px 1px 0 rgba(0,0,0,0.04)',
    ].join(', ')
    base.transform = 'rotate(-1.5deg)'
    base.borderRadius = 2
    base.aspectRatio = undefined // polaroid is taller than square
  } else if (fs === 'filmstrip') {
    // no outer bg – the left/right strip divs supply the dark areas
  } else if (fs === 'neon') {
    const nHex = input.frameColorKey ? input.getFrameHex(input.frameColorKey) : '#00ff88'
    // Dark background with subtle ambient glow from neon reflecting off surfaces
    base.background = `radial-gradient(ellipse 85% 85% at 50% 50%, ${nHex}12 0%, ${nHex}06 50%, transparent 78%), #08080c`
  } else if (fs === 'shadow') {
    // Floating shadow: light background, generous padding for shadow space
    base.backgroundColor = '#f5f7fa'
    base.borderRadius = 4
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
    base.padding = '8px'
    base.background = '#ffffff'
    base.boxSizing = 'border-box'
  } else {
    const borderMap: Record<string, string | undefined> = {
      classic: undefined,
      wooden: undefined,
      gold: '2px solid rgba(191,149,63,0.5)',
      silver: '2px solid rgba(189,195,199,0.5)',
      copper: '2px solid rgba(160,82,45,0.5)',
      filmstrip: 'none',
      polaroid: '1px solid rgba(0,0,0,0.08)',
    }
    if (fs && fs in borderMap) {
      base.border = borderMap[fs]
    }
  }

  const shadowMap: Record<string, string> = {
    classic: 'inset 2px 2px 6px rgba(0,0,0,0.25), inset -1px -1px 3px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(92,74,26,0.20)',
    wooden: 'inset 2px 2px 5px rgba(0,0,0,0.50), inset -1px -1px 3px rgba(0,0,0,0.20), inset 0 0 0 1px rgba(0,0,0,0.15)',
    shadow: [
      // Layered smooth shadows: stacked for a natural, non-muddy transition
      '0 2px 4px rgba(0,0,0,0.06)',
      '0 4px 8px rgba(0,0,0,0.08)',
      '0 8px 16px rgba(0,0,0,0.10)',
      '0 16px 32px rgba(0,0,0,0.12)',
      '0 32px 64px rgba(0,0,0,0.14)',
      // Top-edge highlight (simulates light reflection on raised surface)
      'inset 0 1px 0 rgba(255,255,255,0.25)',
      'inset 1px 0 0 rgba(255,255,255,0.12)',
    ].join(', '),
    gold: 'inset 2px 2px 6px rgba(0,0,0,0.4), inset -1px -1px 4px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(191,149,63,0.3)',
    silver: 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(189,195,199,0.3)',
    copper: 'inset 2px 2px 6px rgba(0,0,0,0.4), inset -1px -1px 4px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(160,82,45,0.3)',
    polaroid: 'inset 0 1px 3px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.04)',
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
