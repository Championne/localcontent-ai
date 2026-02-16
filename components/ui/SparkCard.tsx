'use client'

import SparkFox from '@/components/ui/SparkFox'
import type { SparkExpression } from '@/components/ui/SparkFox'

interface SparkCardProps {
  expression?: SparkExpression
  children: React.ReactNode
  accentColor?: string
  className?: string
  /** Compact mode uses smaller fox (md) and less padding */
  compact?: boolean
}

/**
 * Consistent narration card used at the top of every step.
 * Fox avatar on the left, speech content on the right.
 * Same visual styling everywhere for a persistent companion feel.
 */
export default function SparkCard({
  expression = 'idle',
  children,
  accentColor,
  className = '',
  compact = false,
}: SparkCardProps) {
  return (
    <div className={`flex items-start gap-3 ${compact ? 'gap-2.5' : 'sm:gap-4'} bg-gradient-to-r from-amber-50/80 to-orange-50/60 border border-amber-100/80 rounded-xl ${compact ? 'px-3 py-2.5' : 'px-4 py-3 sm:px-5 sm:py-4'} shadow-sm ${className}`}>
      <SparkFox
        expression={expression}
        size={compact ? 'lg' : 'xl'}
        accentColor={accentColor}
      />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
