/**
 * Spark Adaptive Preference Engine
 *
 * Aggregates thumbs-up/down rating history into a user preference profile.
 * Profiles are used to bias style selection and framework choice toward
 * what the user has responded positively to in the past.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// Rating values used by the thumbs-up/down UI
const RATING_GOOD = 4
const RATING_BAD = 2

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StylePreference {
  style: string
  thumbsUp: number
  thumbsDown: number
  /** Net score: thumbsUp - thumbsDown. Higher = more preferred. */
  score: number
  total: number
}

export interface FrameworkPreference {
  framework: string
  thumbsUp: number
  thumbsDown: number
  score: number
  total: number
}

export type LearningLevel = 'new' | 'learning' | 'familiar' | 'expert'

export interface UserPreferenceProfile {
  topStyles: StylePreference[]
  topFrameworks: FrameworkPreference[]
  preferredContentTypes: string[]
  totalRated: number
  totalGenerated: number
  learningLevel: LearningLevel
  /** Human-readable "I've learned..." insight strings for Spark messages */
  insights: string[]
}

// ---------------------------------------------------------------------------
// Learning level thresholds
// ---------------------------------------------------------------------------

function getLearningLevel(totalRated: number): LearningLevel {
  if (totalRated <= 2) return 'new'
  if (totalRated <= 9) return 'learning'
  if (totalRated <= 24) return 'familiar'
  return 'expert'
}

const LEVEL_LABELS: Record<LearningLevel, string> = {
  new: 'Just getting started',
  learning: 'Learning your preferences',
  familiar: 'Knows your style',
  expert: 'Your personal strategist',
}

export { LEVEL_LABELS }

// ---------------------------------------------------------------------------
// Core: getUserPreferences
// ---------------------------------------------------------------------------

export async function getUserPreferences(
  supabase: SupabaseClient,
  userId: string,
  _businessId?: string,
): Promise<UserPreferenceProfile> {
  // Run queries in parallel
  const [imageRatings, textRatings, totalImages, totalTexts] = await Promise.all([
    // Image ratings grouped by style
    supabase
      .from('generated_images')
      .select('style, rating')
      .eq('user_id', userId)
      .not('rating', 'is', null),

    // Text ratings grouped by framework
    supabase
      .from('generated_texts')
      .select('framework, rating')
      .eq('user_id', userId)
      .not('rating', 'is', null),

    // Total image generations (for learning progress)
    supabase
      .from('generated_images')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),

    // Total text generations
    supabase
      .from('generated_texts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])

  // ── Aggregate image style preferences ────────────────────────────
  const styleMap = new Map<string, { up: number; down: number }>()
  for (const row of imageRatings.data || []) {
    if (!row.style) continue
    const entry = styleMap.get(row.style) || { up: 0, down: 0 }
    if (row.rating === RATING_GOOD) entry.up++
    else if (row.rating === RATING_BAD) entry.down++
    styleMap.set(row.style, entry)
  }

  const topStyles: StylePreference[] = Array.from(styleMap.entries())
    .map(([style, { up, down }]) => ({
      style,
      thumbsUp: up,
      thumbsDown: down,
      score: up - down,
      total: up + down,
    }))
    .sort((a, b) => b.score - a.score)

  // ── Aggregate framework preferences ──────────────────────────────
  const frameworkMap = new Map<string, { up: number; down: number }>()
  for (const row of textRatings.data || []) {
    if (!row.framework) continue
    const entry = frameworkMap.get(row.framework) || { up: 0, down: 0 }
    if (row.rating === RATING_GOOD) entry.up++
    else if (row.rating === RATING_BAD) entry.down++
    frameworkMap.set(row.framework, entry)
  }

  const topFrameworks: FrameworkPreference[] = Array.from(frameworkMap.entries())
    .map(([framework, { up, down }]) => ({
      framework,
      thumbsUp: up,
      thumbsDown: down,
      score: up - down,
      total: up + down,
    }))
    .sort((a, b) => b.score - a.score)

  // ── Preferred content types (by volume) ──────────────────────────
  const contentTypeMap = new Map<string, number>()
  for (const row of (imageRatings.data || [])) {
    // content_type isn't in our select — use a fallback from text data
  }
  // Use text data for template preference
  const templateMap = new Map<string, number>()
  for (const row of (textRatings.data || []) as Array<{ framework: string; rating: number; template?: string }>) {
    const tmpl = row.template
    if (tmpl) templateMap.set(tmpl, (templateMap.get(tmpl) || 0) + 1)
  }
  const preferredContentTypes = Array.from(templateMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t)

  // ── Totals ───────────────────────────────────────────────────────
  const totalRated = (imageRatings.data?.length || 0) + (textRatings.data?.length || 0)
  const totalGenerated = (totalImages.count || 0) + (totalTexts.count || 0)
  const learningLevel = getLearningLevel(totalRated)

  // ── Generate human-readable insights ─────────────────────────────
  const insights: string[] = []

  if (topStyles.length > 0 && topStyles[0].score > 0) {
    const best = topStyles[0]
    insights.push(`Your top-rated image style is ${best.style} (${best.thumbsUp} thumbs up).`)
  }

  if (topFrameworks.length > 0 && topFrameworks[0].score > 0) {
    const best = topFrameworks[0]
    const fwName = best.framework.toUpperCase()
    insights.push(`${fwName} framework works best for your content (${best.thumbsUp} thumbs up).`)
  }

  if (totalRated >= 10) {
    insights.push(`I've learned from ${totalRated} of your ratings — my recommendations are getting more accurate.`)
  } else if (totalRated >= 3) {
    insights.push(`I'm still learning — ${totalRated} ratings so far. The more you rate, the smarter I get.`)
  }

  if (topStyles.length > 0 && topStyles[topStyles.length - 1].score < 0) {
    const worst = topStyles[topStyles.length - 1]
    insights.push(`I've noticed you don't prefer ${worst.style} images — I'll avoid that style.`)
  }

  return {
    topStyles,
    topFrameworks,
    preferredContentTypes,
    totalRated,
    totalGenerated,
    learningLevel,
    insights,
  }
}

// ---------------------------------------------------------------------------
// Helpers for generation routes
// ---------------------------------------------------------------------------

/** Get the style boost map for detectBestStyle() */
export function getStyleBoosts(prefs: UserPreferenceProfile): Record<string, number> {
  const boosts: Record<string, number> = {}
  for (let i = 0; i < prefs.topStyles.length; i++) {
    const s = prefs.topStyles[i]
    if (s.score > 0 && i === 0) boosts[s.style] = 0.4       // top-rated: strong boost
    else if (s.score > 0) boosts[s.style] = 0.2              // other positive: mild boost
    else if (s.score < 0) boosts[s.style] = -0.3             // disliked: penalize
  }
  return boosts
}

/** Get the framework confidence boost for selectOptimalFramework() */
export function getFrameworkBoost(prefs: UserPreferenceProfile, framework: string): { boost: number; reason: string | null } {
  const pref = prefs.topFrameworks.find(f => f.framework === framework)
  if (!pref) return { boost: 0, reason: null }

  if (pref.score >= 3) {
    return { boost: 10, reason: `Your top-rated framework (${pref.thumbsUp} thumbs up)` }
  }
  if (pref.score >= 1) {
    return { boost: 5, reason: `You've responded well to this framework before` }
  }
  if (pref.score <= -2) {
    return { boost: -8, reason: null }
  }
  return { boost: 0, reason: null }
}
