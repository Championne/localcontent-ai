/**
 * Derive search keywords from topic + industry for stock photo APIs.
 * Keeps queries short and relevant so results are usable (no text-heavy images).
 * Uses industry-specific search terms so e.g. HVAC returns equipment/technicians, not generic business photos.
 */

/** Industry-normalized key to Unsplash-friendly search phrases (tried first for better relevance). */
const INDUSTRY_SEARCH_TERMS: Record<string, string[]> = {
  hvac: ['HVAC technician', 'air conditioning unit', 'heating cooling repair', 'HVAC equipment'],
  'hvac / heating & cooling': ['HVAC technician', 'air conditioning unit', 'heating cooling repair', 'HVAC equipment'],
  plumbing: ['plumber at work', 'plumbing repair', 'plumber technician', 'plumbing tools'],
  electrical: ['electrician at work', 'electrical repair', 'electrician technician', 'electrical panel'],
  roofing: ['roofer at work', 'roofing repair', 'roof installation', 'roofing contractor'],
  landscaping: ['landscaping garden', 'landscaper at work', 'garden maintenance', 'lawn care'],
  cleaning: ['cleaning service', 'professional cleaner', 'cleaning supplies', 'house cleaning'],
  pest: ['pest control', 'exterminator', 'pest control technician', 'termite inspection'],
  'real estate': ['real estate agent', 'house for sale', 'real estate professional', 'home showing'],
  restaurant: ['restaurant kitchen', 'chef cooking', 'restaurant food', 'restaurant interior'],
  dental: ['dental office', 'dentist patient', 'dental care', 'dental clinic'],
  legal: ['lawyer office', 'legal professional', 'law firm', 'attorney'],
  accounting: ['accountant office', 'accounting professional', 'tax preparation', 'financial advisor'],
  auto: ['auto repair', 'car mechanic', 'auto shop', 'car maintenance'],
  'auto repair': ['auto repair', 'car mechanic', 'auto shop', 'car maintenance'],
}

function getIndustrySearchTerms(industry: string): string[] {
  const key = industry.trim().toLowerCase()
  if (!key) return []
  return INDUSTRY_SEARCH_TERMS[key] ?? INDUSTRY_SEARCH_TERMS[key.replace(/\s*&\s*/g, ' and ')] ?? []
}

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

/** Return multiple query variants for fallback search. Puts industry-specific terms first so e.g. HVAC returns relevant photos. */
export function getSearchQueryVariants(topic: string, industry: string): string[] {
  const ind = industry.trim().toLowerCase()
  const industryTerms = getIndustrySearchTerms(industry)
  const primary = getSearchQueryForTopic(topic, industry)
  const variants: string[] = []

  // Try industry-specific queries first (e.g. "HVAC technician", "air conditioning unit") so stock results match the business
  for (const term of industryTerms) {
    variants.push(term)
  }
  variants.push(primary)
  if (ind && !primary.toLowerCase().includes(ind)) {
    variants.push(`${industry} professional`)
  }
  if (ind) {
    variants.push(`${industry} work`, `${industry} team`)
  }
  return [...new Set(variants)]
}
