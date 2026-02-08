/**
 * Types for ImageOverlayEditor — in a .ts file so SWC doesn't parse
 * complex generic types in JSX mode which can trigger parser bugs.
 */
import type React from 'react'
import type { OverlayItem, TextOverlayItem, FrameStyle, FrameColorKey, OverlayApplyPayload, TextOverlayFont } from './ImageOverlayEditor'

export type { OverlayItem, TextOverlayItem, FrameStyle, FrameColorKey, OverlayApplyPayload, TextOverlayFont }

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
  onArrangeAll?: () => void
}

export function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0')
  return hex + a
}

export interface ViewComputed {
  primary: string
  primaryDark: string
  headerBg: string
  sidebarBg: string
  buttonBg: string
  buttonBorder: string
  rootBg: string
  frameWrapperStyle: React.CSSProperties
  containerStyle: React.CSSProperties
}
