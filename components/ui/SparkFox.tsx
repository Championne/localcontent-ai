'use client'

/**
 * Spark Fox — AI Marketing Strategist avatar.
 * 80x80 viewBox SVG with upper body, bushy tail with lightning bolt,
 * pointed snout, and 8 expression states via CSS transitions.
 */

export type SparkExpression = 'idle' | 'thinking' | 'happy' | 'encouraging' | 'analyzing' | 'celebrating' | 'nudge' | 'learning'
export type SparkSize = 'sm' | 'md' | 'lg' | 'xl'

interface SparkFoxProps {
  expression?: SparkExpression
  size?: SparkSize
  className?: string
  /** Brand accent color for the spark/lightning motif. Default: #f59e0b (amber) */
  accentColor?: string
}

const SIZES: Record<SparkSize, number> = { sm: 24, md: 32, lg: 48, xl: 64 }

// Eye shapes per expression (positioned for 80x80 viewBox)
const EYES: Record<SparkExpression, { left: string; right: string }> = {
  idle:        { left: 'M30 30a3 3 0 100-6 3 3 0 000 6z', right: 'M50 30a3 3 0 100-6 3 3 0 000 6z' },
  thinking:    { left: 'M30 29a2.5 3 0 100-6 2.5 3 0 000 6z', right: 'M50 29q1.5 0 1.5-1.5t-1.5-1.5-1.5 1.5 1.5 1.5z' },
  happy:       { left: 'M26 28q4-4 8 0', right: 'M46 28q4-4 8 0' },
  encouraging: { left: 'M30 30a3 3 0 100-6 3 3 0 000 6z', right: 'M50 30a3 3 0 100-6 3 3 0 000 6z' },
  analyzing:   { left: 'M30 29a2.5 2 0 100-4 2.5 2 0 000 4z', right: 'M50 29a2.5 2 0 100-4 2.5 2 0 000 4z' },
  celebrating: { left: 'M26 28q4-4 8 0', right: 'M46 28q4-4 8 0' },
  nudge:       { left: 'M30 30a3 3 0 100-6 3 3 0 000 6z', right: 'M50 29a2 2 0 100-4 2 2 0 000 4z' },
  learning:    { left: 'M30 29.5a3 2.5 0 100-5 3 2.5 0 000 5z', right: 'M50 29.5a3 2.5 0 100-5 3 2.5 0 000 5z' },
}

// Mouth shapes
const MOUTHS: Record<SparkExpression, string> = {
  idle:        'M35 40q5 3 10 0',
  thinking:    'M37 41h6',
  happy:       'M33 39q7 7 14 0',
  encouraging: 'M34 40q6 4 12 0',
  analyzing:   'M36 41h8',
  celebrating: 'M32 39q8 8 16 0',
  nudge:       'M35 40q5 3 10 0',
  learning:    'M35 40q5 2 10 0',
}

// Ear tilt (rotation for right ear)
const EAR_TILTS: Record<SparkExpression, number> = {
  idle: 0, thinking: -6, happy: 5, encouraging: 3,
  analyzing: -4, celebrating: 8, nudge: 6, learning: -3,
}

export default function SparkFox({
  expression = 'idle',
  size = 'md',
  className = '',
  accentColor = '#f59e0b',
}: SparkFoxProps) {
  const px = SIZES[size]
  const eyes = EYES[expression]
  const mouth = MOUTHS[expression]
  const earTilt = EAR_TILTS[expression]

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 transition-transform duration-300 ${expression === 'celebrating' ? 'animate-bounce' : ''} ${className}`}
      role="img"
      aria-label={`Spark fox — ${expression}`}
    >
      {/* ── Tail (bushy, behind body) ── */}
      <path
        d="M60 58c4-2 12-6 16-14s2-16-2-20c-3-3-6 1-5 5s-1 10-4 14c-2 3-5 6-8 8z"
        fill="#ea580c"
        className="transition-all duration-300"
      />
      <path
        d="M64 56c3-2 9-5 12-11s1-12-1-15c-2-2-4 1-3 4s-1 8-3 11c-2 3-4 5-6 6z"
        fill="#fb923c"
      />
      {/* Lightning bolt on tail */}
      <path
        d="M72 30l-3 6h4l-5 8 2-5h-3.5l4.5-9z"
        fill={accentColor}
        stroke={accentColor}
        strokeWidth="0.5"
        strokeLinejoin="round"
        className="transition-opacity duration-300"
        style={{ opacity: expression === 'celebrating' || expression === 'happy' ? 1 : 0.75 }}
      />

      {/* ── Body (torso visible below head) ── */}
      <ellipse cx="40" cy="60" rx="18" ry="14" fill="#fb923c" />
      {/* Chest / belly lighter area */}
      <ellipse cx="40" cy="62" rx="12" ry="10" fill="#fed7aa" />

      {/* ── Left Ear ── */}
      <path d="M22 22L14 4l16 12z" fill="#ea580c" />
      <path d="M22 22L16 7l10 9z" fill="#fdba74" />

      {/* ── Right Ear (tilts with expression) ── */}
      <g
        className="transition-transform duration-300 origin-[58px_22px]"
        style={{ transform: `rotate(${earTilt}deg)` }}
      >
        <path d="M58 22l8-18-16 12z" fill="#ea580c" />
        <path d="M58 22l6-15-10 9z" fill="#fdba74" />
      </g>

      {/* ── Head ── */}
      <ellipse cx="40" cy="32" rx="22" ry="20" fill="#fb923c" />

      {/* ── Face (lighter muzzle area, pointed snout shape) ── */}
      <path
        d="M40 48c-10 0-16-6-16-14s6-14 16-14 16 6 16 14-6 14-16 14z"
        fill="#fed7aa"
      />
      {/* Snout bump */}
      <ellipse cx="40" cy="36" rx="8" ry="6" fill="#fef3c7" opacity="0.5" />

      {/* ── Eyes ── */}
      <path d={eyes.left} fill="#1e293b" className="transition-all duration-300" />
      <path d={eyes.right} fill="#1e293b" className="transition-all duration-300" />

      {/* Eye shine (skip for happy-arc eyes) */}
      {!['happy', 'celebrating'].includes(expression) && (
        <>
          <circle cx="29" cy="26" r="1" fill="white" />
          <circle cx="49" cy="26" r="1" fill="white" />
        </>
      )}

      {/* ── Nose (triangular fox nose) ── */}
      <path d="M40 34l-2.5 2.5h5z" fill="#1e293b" />

      {/* ── Mouth ── */}
      <path
        d={mouth}
        stroke="#92400e"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        className="transition-all duration-300"
      />

      {/* ── Whisker lines ── */}
      <g stroke="#d97706" strokeWidth="0.6" opacity="0.4" strokeLinecap="round">
        <line x1="24" y1="35" x2="14" y2="33" />
        <line x1="24" y1="37" x2="13" y2="38" />
        <line x1="56" y1="35" x2="66" y2="33" />
        <line x1="56" y1="37" x2="67" y2="38" />
      </g>

      {/* ── Expression-specific overlays ── */}

      {/* Celebration sparkles */}
      {expression === 'celebrating' && (
        <g className="animate-pulse">
          <path d="M8 12l1.5-3 1.5 3-3-1.5h3z" fill={accentColor} opacity="0.9" />
          <path d="M70 8l1-2.5 1 2.5-2.5-1h2.5z" fill={accentColor} opacity="0.8" />
          <path d="M6 50l1-2 1 2-2-.8h2z" fill={accentColor} opacity="0.7" />
          <circle cx="74" cy="45" r="1.5" fill={accentColor} opacity="0.6" />
        </g>
      )}

      {/* Thinking bubbles */}
      {expression === 'thinking' && (
        <g className="animate-pulse" opacity="0.4">
          <circle cx="68" cy="14" r="2" fill="#94a3b8" />
          <circle cx="73" cy="8" r="3" fill="#94a3b8" />
        </g>
      )}

      {/* Analyzing — small glasses hint */}
      {expression === 'analyzing' && (
        <g stroke="#475569" strokeWidth="1" fill="none" opacity="0.5">
          <circle cx="29" cy="27" r="5" />
          <circle cx="49" cy="27" r="5" />
          <path d="M34 27h12" />
        </g>
      )}
    </svg>
  )
}

/** Inline SparkFox message bubble */
export function SparkMessage({
  expression = 'idle',
  message,
  size = 'md',
  className = '',
  accentColor,
}: {
  expression?: SparkExpression
  message: string
  size?: SparkSize
  className?: string
  accentColor?: string
}) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <SparkFox expression={expression} size={size} accentColor={accentColor} />
      <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{message}</p>
    </div>
  )
}
