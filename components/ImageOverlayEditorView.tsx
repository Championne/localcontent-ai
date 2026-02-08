'use client'

import ImageOverlayEditorViewRoot from './ImageOverlayEditorViewRoot'
import { hexWithAlpha } from './ImageOverlayEditorTypes'
import { computeFrameWrapperStyle, computeContainerStyle } from './frameStyles'
import type { ImageOverlayEditorViewProps, ViewComputed } from './ImageOverlayEditorTypes'
export type { ImageOverlayEditorViewProps } from './ImageOverlayEditorTypes'

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
  const rootBg = hexWithAlpha(primary, 0.03)
  const frameWrapperStyle = computeFrameWrapperStyle({
    frameStyle: p.frame?.style,
    getFrameHex: p.getFrameHex,
    frameColorKey: p.frame?.colorKey,
  })
  const containerStyle = computeContainerStyle({
    frameStyle: p.frame?.style,
    getFrameHex: p.getFrameHex,
    frameColorKey: p.frame?.colorKey,
  })
  const computed: ViewComputed = { primary, primaryDark, headerBg, sidebarBg, buttonBg, buttonBorder, rootBg, frameWrapperStyle, containerStyle }
  return <ImageOverlayEditorViewRoot p={p} c={computed} />
}
