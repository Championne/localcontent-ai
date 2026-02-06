/**
 * Derive search keywords from topic + industry for stock photo APIs.
 * Keeps queries short and relevant so results are usable (no text-heavy images).
 */

export function getSearchQueryForTopic(topic: string, industry: string): string {
  const t = topic.trim().toLowerCase()
  const ind = industry.trim().toLowerCase()

  // If topic is already a short phrase (e.g. "plumber at work"), use it with industry as context
  const words = t.split(/\s+/)
  if (words.length <= 4 && t.length <= 40) {
    return `${t} ${ind}`.trim()
  }

  // Long topic: take first few meaningful words and add industry
  const short = words.slice(0, 3).join(' ')
  return `${short} ${ind}`.trim()
}

/** Optional: return multiple query variants for fallback search */
export function getSearchQueryVariants(topic: string, industry: string): string[] {
  const primary = getSearchQueryForTopic(topic, industry)
  const variants: string[] = [primary]
  if (industry && !primary.toLowerCase().includes(industry.toLowerCase())) {
    variants.push(`${industry} professional`)
  }
  return [...new Set(variants)]
}
