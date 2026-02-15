'use client'

/**
 * Spark Fox — AI Marketing Strategist avatar.
 * Pure SVG with CSS transitions for expression states.
 */

export type SparkExpression = 'idle' | 'thinking' | 'happy' | 'encouraging' | 'analyzing' | 'celebrating' | 'nudge' | 'learning'
export type SparkSize = 'sm' | 'md' | 'lg'

interface SparkFoxProps {
  expression?: SparkExpression
  size?: SparkSize
  className?: string
  /** Brand accent color for the spark motif. Default: #f59e0b (amber) */
  accentColor?: string
}

const SIZES: Record<SparkSize, number> = { sm: 24, md: 32, lg: 48 }

// Eye variations per expression
const EYES: Record<SparkExpression, { left: string; right: string }> = {
  idle:         { left: 'M11.5 14.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z', right: 'M18.5 14.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' },
  thinking:     { left: 'M10.5 13.5a1 1.5 0 100-3 1 1.5 0 000 3z',     right: 'M19 13q.8 0 .8-.5t-.8-.5-.8.5.8.5z' }, // squint right
  happy:        { left: 'M10 13q1.5-2 3 0',                              right: 'M17 13q1.5-2 3 0' }, // happy arcs
  encouraging:  { left: 'M11.5 14.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z', right: 'M18.5 14.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' },
  analyzing:    { left: 'M10.5 13.5a1 1.5 0 100-3 1 1.5 0 000 3z',     right: 'M17.5 13.5a1 1.5 0 100-3 1 1.5 0 000 3z' }, // narrowed
  celebrating:  { left: 'M10 13q1.5-2 3 0',                              right: 'M17 13q1.5-2 3 0' }, // happy arcs
  nudge:        { left: 'M11.5 14.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z', right: 'M18 14a1 1 0 100-2 1 1 0 000 2z' }, // wink right
  learning:     { left: 'M11.5 14a1.5 1.2 0 100-2.4 1.5 1.2 0 000 2.4z', right: 'M18.5 14a1.5 1.2 0 100-2.4 1.5 1.2 0 000 2.4z' },
}

// Mouth shapes
const MOUTHS: Record<SparkExpression, string> = {
  idle:         'M13 18.5q2 1 4 0',        // gentle smile
  thinking:     'M14 19h2',                  // neutral line
  happy:        'M12.5 18q2.5 2.5 5 0',     // big smile
  encouraging:  'M13 18q2 1.5 4 0',         // warm smile
  analyzing:    'M13.5 19h3',               // neutral line
  celebrating:  'M12 18q3 3 6 0',           // huge grin
  nudge:        'M13 18.5q2 1.2 4 0',      // slight smile
  learning:     'M13 18q2 1 4 0',           // small smile
}

// Ear tilt (rotation in degrees for the right ear tip)
const EAR_TILTS: Record<SparkExpression, number> = {
  idle: 0, thinking: -8, happy: 5, encouraging: 3,
  analyzing: -5, celebrating: 10, nudge: 8, learning: -3,
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
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 transition-transform duration-300 ${expression === 'celebrating' ? 'animate-bounce' : ''} ${className}`}
      role="img"
      aria-label={`Spark fox — ${expression}`}
    >
      {/* Left Ear */}
      <path
        d="M8 12L5 4l7 5z"
        fill="#f97316"
        className="transition-all duration-300"
      />
      <path d="M8 12L6 5.5l4 3z" fill="#fdba74" />

      {/* Right Ear — tilts with expression */}
      <g
        className="transition-transform duration-300 origin-[22px_12px]"
        style={{ transform: `rotate(${earTilt}deg)` }}
      >
        <path d="M22 12l3-8-7 5z" fill="#f97316" />
        <path d="M22 12l2-6.5-4 3z" fill="#fdba74" />
        {/* Spark motif on right ear */}
        <path
          d="M24.2 5.5l-.5 1.8.9-1.2.1 1.6.6-1.4"
          stroke={accentColor}
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-opacity duration-300"
          style={{ opacity: expression === 'celebrating' || expression === 'happy' ? 1 : 0.6 }}
        />
      </g>

      {/* Head shape */}
      <ellipse cx="15" cy="16" rx="9" ry="10" fill="#fb923c" />
      {/* Face (lighter belly/face area) */}
      <ellipse cx="15" cy="17" rx="6.5" ry="7.5" fill="#fed7aa" />

      {/* Eyes */}
      <path
        d={eyes.left}
        fill="#1e293b"
        stroke="none"
        className="transition-all duration-300"
      />
      <path
        d={eyes.right}
        fill="#1e293b"
        stroke="none"
        className="transition-all duration-300"
      />

      {/* Eye shine (for non-arc eyes) */}
      {!['happy', 'celebrating'].includes(expression) && (
        <>
          <circle cx="12" cy="12.5" r="0.4" fill="white" />
          <circle cx="19" cy="12.5" r="0.4" fill="white" />
        </>
      )}

      {/* Nose */}
      <ellipse cx="15" cy="16.2" rx="1.2" ry="0.8" fill="#1e293b" />

      {/* Mouth */}
      <path
        d={mouth}
        stroke="#92400e"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        className="transition-all duration-300"
      />

      {/* Whisker dots */}
      <circle cx="9" cy="16.5" r="0.4" fill="#f97316" opacity="0.5" />
      <circle cx="9.5" cy="18" r="0.4" fill="#f97316" opacity="0.5" />
      <circle cx="21" cy="16.5" r="0.4" fill="#f97316" opacity="0.5" />
      <circle cx="20.5" cy="18" r="0.4" fill="#f97316" opacity="0.5" />

      {/* Celebration sparkles */}
      {expression === 'celebrating' && (
        <g className="animate-pulse">
          <circle cx="4" cy="8" r="1" fill={accentColor} opacity="0.8" />
          <circle cx="26" cy="6" r="0.8" fill={accentColor} opacity="0.7" />
          <circle cx="3" cy="20" r="0.6" fill={accentColor} opacity="0.6" />
          <circle cx="27" cy="18" r="0.7" fill={accentColor} opacity="0.7" />
        </g>
      )}

      {/* Thinking indicator */}
      {expression === 'thinking' && (
        <g className="animate-pulse" opacity="0.5">
          <circle cx="25" cy="8" r="0.8" fill="#94a3b8" />
          <circle cx="27" cy="5" r="1.2" fill="#94a3b8" />
        </g>
      )}

      {/* Analyzing — glasses */}
      {expression === 'analyzing' && (
        <g stroke="#475569" strokeWidth="0.6" fill="none" opacity="0.7">
          <circle cx="11.5" cy="13" r="2.5" />
          <circle cx="18.5" cy="13" r="2.5" />
          <path d="M14 13h2" />
          <path d="M9 13H7" />
          <path d="M21 13h2" />
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
