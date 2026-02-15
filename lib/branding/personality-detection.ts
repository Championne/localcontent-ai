/**
 * Brand Personality Detection System
 * Analyzes brand colors to determine personality and guide image generation
 */

export interface HSL {
  h: number // Hue: 0-360
  s: number // Saturation: 0-100
  l: number // Lightness: 0-100
}

export interface BrandPersonality {
  personality: 'energetic' | 'professional' | 'friendly' | 'luxury'
  mood: string
  colorDescription: string
  lightingStyle: string
  promptModifiers: string
}

export function hexToHSL(hex: string): HSL {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / delta + 2) / 6
        break
      case b:
        h = ((r - g) / delta + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function detectBrandPersonality(
  primaryColor: string,
  secondaryColor?: string
): BrandPersonality {
  const hsl = hexToHSL(primaryColor)
  const { h, s, l } = hsl

  // LUXURY: Dark + Saturated (overrides hue)
  if (l < 30 && s > 50) {
    return {
      personality: 'luxury',
      mood: 'sophisticated, premium, exclusive',
      colorDescription: 'deep rich colors with dramatic intensity',
      lightingStyle: 'dramatic moody lighting with deep shadows and selective highlights',
      promptModifiers: 'elegant premium aesthetic, refined sophisticated atmosphere',
    }
  }

  // PROFESSIONAL: Low Saturation (overrides hue)
  if (s < 20) {
    return {
      personality: 'professional',
      mood: 'clean, minimal, sophisticated',
      colorDescription: 'neutral subtle tones and muted grays',
      lightingStyle: 'clean even lighting with soft diffusion',
      promptModifiers: 'corporate professional setting, trustworthy reliable feel',
    }
  }

  // RED/ORANGE (0-60deg)
  if (h >= 0 && h < 60) {
    if (s > 60 && l > 40 && l < 70) {
      return {
        personality: 'energetic',
        mood: 'vibrant, dynamic, bold',
        colorDescription: 'warm reds and oranges with high energy',
        lightingStyle: 'bright warm lighting with strong highlights',
        promptModifiers: 'energetic vibrant atmosphere, bold confident feel',
      }
    } else {
      return {
        personality: 'professional',
        mood: 'confident, reliable, strong',
        colorDescription: 'muted warm tones',
        lightingStyle: 'balanced natural lighting',
        promptModifiers: 'professional dependable setting, confident atmosphere',
      }
    }
  }

  // YELLOW/GREEN (60-150deg)
  if (h >= 60 && h < 150) {
    return {
      personality: 'friendly',
      mood: 'welcoming, approachable, optimistic',
      colorDescription: 'warm sunny tones and fresh greens',
      lightingStyle: 'soft golden hour glow with warm natural light',
      promptModifiers: 'welcoming friendly atmosphere, approachable cheerful mood',
    }
  }

  // BLUE/CYAN (150-250deg)
  if (h >= 150 && h < 250) {
    if (s < 30 || l > 70) {
      return {
        personality: 'professional',
        mood: 'calm, trustworthy, clean',
        colorDescription: 'cool blue-gray tones',
        lightingStyle: 'clean diffused light with even illumination',
        promptModifiers: 'professional calm setting, trustworthy clean aesthetic',
      }
    } else {
      return {
        personality: 'friendly',
        mood: 'fresh, reliable, inviting',
        colorDescription: 'bright blues and teals',
        lightingStyle: 'bright natural light with crisp clarity',
        promptModifiers: 'fresh inviting atmosphere, reliable friendly feel',
      }
    }
  }

  // PURPLE/MAGENTA (250-330deg)
  if (h >= 250 && h < 330) {
    if (s > 40 && l < 50) {
      return {
        personality: 'luxury',
        mood: 'sophisticated, premium, elegant',
        colorDescription: 'deep rich purples and magentas',
        lightingStyle: 'dramatic lighting with rich shadows',
        promptModifiers: 'sophisticated elegant atmosphere, premium exclusive feel',
      }
    } else {
      return {
        personality: 'friendly',
        mood: 'creative, unique, approachable',
        colorDescription: 'soft lavenders and pinks',
        lightingStyle: 'soft diffused lighting with gentle warmth',
        promptModifiers: 'creative approachable atmosphere, unique friendly feel',
      }
    }
  }

  return {
    personality: 'friendly',
    mood: 'welcoming, creative, approachable',
    colorDescription: 'balanced warm tones',
    lightingStyle: 'natural even lighting',
    promptModifiers: 'welcoming friendly atmosphere',
  }
}

export function isLightColor(hexColor: string): boolean {
  const hsl = hexToHSL(hexColor)
  return hsl.l > 50
}

export function getContrastColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF'
}

export function adjustAlpha(hexColor: string, alpha: number): string {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
