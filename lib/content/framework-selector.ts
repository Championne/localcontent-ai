/**
 * Marketing Framework Selector
 *
 * Automatically chooses the best persuasion framework (AIDA, PAS, BAB, FAB, 4Ps)
 * based on topic keywords, campaign goal, content type, and industry context.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MarketingFramework = 'aida' | 'pas' | 'bab' | 'fab' | '4ps'
export type AwarenessLevel = 'unaware' | 'problem-aware' | 'solution-aware' | 'product-aware' | 'most-aware'
export type CampaignGoal = 'awareness' | 'consideration' | 'conversion' | 'retention'

export interface FrameworkSelectionContext {
  topic: string
  industry: string
  contentType: string // 'social-post' | 'email' | 'blog-post' | 'gmb-post' | 'social-pack' | etc.
  campaignGoal?: CampaignGoal
  urgency?: 'low' | 'medium' | 'high'
}

export interface FrameworkRecommendation {
  framework: MarketingFramework
  confidence: number // 0-100
  reasoning: string
  awarenessLevel: AwarenessLevel
  structure: {
    sections: string[]
    prompts: string[]
  }
}

// ---------------------------------------------------------------------------
// Awareness level detection
// ---------------------------------------------------------------------------

const EMERGENCY_KEYWORDS = /\b(emergency|urgent|broken|leak|flood|fire|no heat|no ac|no hot water|burst|clogged|stuck|won't start|not working|help)\b/i
const PROBLEM_KEYWORDS = /\b(problem|issue|trouble|struggling|frustrated|annoyed|worried|concern|complaint|pain|headache|nightmare)\b/i
const SOLUTION_KEYWORDS = /\b(how to|solution|fix|repair|service|maintain|prevent|upgrade|improve|install|replace|tips|guide|advice)\b/i
const PRODUCT_KEYWORDS = /\b(discount|sale|offer|deal|special|promo|coupon|package|bundle|pricing|compare|vs|versus|review)\b/i
const URGENCY_KEYWORDS = /\b(limited time|today only|last chance|ends? (soon|today|friday|sunday)|hurry|while supplies|act now|don't miss|final|closing|deadline|expires?)\b/i
const NEW_LAUNCH_KEYWORDS = /\b(new|launch|introducing|announcing|grand opening|just opened|now available|coming soon|reveal|debut)\b/i
const TRUST_PROOF_KEYWORDS = /\b(guarantee|warranty|certified|licensed|insured|proven|rated|award|years of experience|\d+ reviews?|testimonial|case study)\b/i
const TRANSFORMATION_KEYWORDS = /\b(before and after|transform|imagine|picture this|what if|tired of|dream|vision|upgrade your|refresh)\b/i

/** Industry sub-topic patterns that override generic detection */
const INDUSTRY_EMERGENCY_MAP: Record<string, RegExp> = {
  hvac: /\b(ac (broke|down|out)|no (heat|cooling|ac)|furnace (broke|out|not)|frozen pipe|thermostat)\b/i,
  plumber: /\b(burst pipe|overflow|sewage|backed up|water damage|no hot water|toilet (broke|clog|overflow))\b/i,
  plumbing: /\b(burst pipe|overflow|sewage|backed up|water damage|no hot water|toilet (broke|clog|overflow))\b/i,
  electrician: /\b(power out|sparking|electrical fire|tripped breaker|no power|shock|outage)\b/i,
  electrical: /\b(power out|sparking|electrical fire|tripped breaker|no power|shock|outage)\b/i,
  roofing: /\b(roof leak|storm damage|missing shingles|water coming in|emergency roof)\b/i,
  auto: /\b(won't start|broke down|flat tire|overheating|check engine|tow)\b/i,
  'auto repair': /\b(won't start|broke down|flat tire|overheating|check engine|tow)\b/i,
}

export function detectAwarenessLevel(topic: string, industry: string): AwarenessLevel {
  const t = topic.toLowerCase()
  const indKey = industry.trim().toLowerCase()

  // Industry-specific emergency detection (highest priority)
  const industryPattern = INDUSTRY_EMERGENCY_MAP[indKey] || INDUSTRY_EMERGENCY_MAP[indKey.split(/[\s/]/)[0]]
  if (industryPattern?.test(t)) return 'most-aware' // emergency = ready to buy NOW

  // Generic keyword cascades
  if (URGENCY_KEYWORDS.test(t)) return 'most-aware'
  if (TRUST_PROOF_KEYWORDS.test(t)) return 'product-aware'
  if (PRODUCT_KEYWORDS.test(t)) return 'product-aware'
  if (SOLUTION_KEYWORDS.test(t)) return 'solution-aware'
  if (EMERGENCY_KEYWORDS.test(t)) return 'problem-aware'
  if (PROBLEM_KEYWORDS.test(t)) return 'problem-aware'
  if (NEW_LAUNCH_KEYWORDS.test(t)) return 'unaware' // new things target cold audiences
  if (TRANSFORMATION_KEYWORDS.test(t)) return 'solution-aware'

  return 'unaware' // default: educational content
}

/** Detect urgency from topic text */
function detectUrgency(topic: string): 'low' | 'medium' | 'high' {
  if (EMERGENCY_KEYWORDS.test(topic) || URGENCY_KEYWORDS.test(topic)) return 'high'
  if (PRODUCT_KEYWORDS.test(topic) || PROBLEM_KEYWORDS.test(topic)) return 'medium'
  return 'low'
}

// ---------------------------------------------------------------------------
// Framework selection
// ---------------------------------------------------------------------------

export function selectOptimalFramework(context: FrameworkSelectionContext): FrameworkRecommendation {
  const { topic, industry, contentType, campaignGoal } = context
  const awarenessLevel = detectAwarenessLevel(topic, industry)
  const urgency = context.urgency ?? detectUrgency(topic)

  // ── RULE 1: Awareness level is strongest signal ─────────────────────
  if (awarenessLevel === 'most-aware') {
    // Ready to buy — need proof + push
    if (EMERGENCY_KEYWORDS.test(topic) || INDUSTRY_EMERGENCY_MAP[industry.toLowerCase()]?.test(topic)) {
      return buildRecommendation('pas', awarenessLevel, 92,
        'Emergency/urgent language detected — PAS agitates the pain and drives immediate action',
        context)
    }
    return buildRecommendation('4ps', awarenessLevel, 90,
      'Audience is most-aware and ready to buy — 4Ps provides proof and urgency for final conversion',
      context)
  }

  if (awarenessLevel === 'product-aware') {
    if (TRUST_PROOF_KEYWORDS.test(topic)) {
      return buildRecommendation('4ps', awarenessLevel, 88,
        'Trust/proof language detected — 4Ps leverages social proof and guarantees',
        context)
    }
    return buildRecommendation('fab', awarenessLevel, 82,
      'Product-aware audience comparing options — FAB highlights features, advantages, and benefits',
      context)
  }

  if (awarenessLevel === 'solution-aware') {
    if (TRANSFORMATION_KEYWORDS.test(topic)) {
      return buildRecommendation('bab', awarenessLevel, 85,
        'Transformation language detected — BAB paints the before/after story',
        context)
    }
    if (urgency === 'high') {
      return buildRecommendation('pas', awarenessLevel, 80,
        'Solution-aware audience with urgency — PAS agitates to drive faster action',
        context)
    }
    return buildRecommendation('bab', awarenessLevel, 78,
      'Solution-aware audience responds to transformation stories — BAB shows the journey',
      context)
  }

  if (awarenessLevel === 'problem-aware') {
    return buildRecommendation('pas', awarenessLevel, 85,
      'Problem-aware audience — PAS validates their pain and presents the solution',
      context)
  }

  // awarenessLevel === 'unaware'
  // Fall through to campaign goal / content type rules

  // ── RULE 2: Campaign goal ──────────────────────────────────────────
  if (campaignGoal) {
    switch (campaignGoal) {
      case 'awareness':
        return buildRecommendation('aida', awarenessLevel, 78,
          'Awareness goal — AIDA grabs attention and builds interest for cold audiences',
          context)
      case 'consideration':
        return buildRecommendation('bab', awarenessLevel, 72,
          'Consideration goal — BAB shows the transformation to move prospects forward',
          context)
      case 'conversion':
        if (urgency === 'high') {
          return buildRecommendation('pas', awarenessLevel, 80,
            'Conversion goal with urgency — PAS drives immediate action',
            context)
        }
        return buildRecommendation('4ps', awarenessLevel, 75,
          'Conversion goal — 4Ps provides proof and pushes for the close',
          context)
      case 'retention':
        return buildRecommendation('bab', awarenessLevel, 70,
          'Retention goal — BAB reinforces value by showing ongoing transformation',
          context)
    }
  }

  // ── RULE 3: Content type fallback ──────────────────────────────────
  switch (contentType) {
    case 'social-post':
    case 'social-pack':
      return buildRecommendation('aida', awarenessLevel, 65,
        'Social media default — AIDA hooks attention quickly in the feed',
        context)
    case 'gmb-post':
      return buildRecommendation('pas', awarenessLevel, 70,
        'Google Business posts reach high-intent searchers — PAS addresses their active need',
        context)
    case 'email':
      return buildRecommendation('aida', awarenessLevel, 65,
        'Email default — AIDA structures the subject line through CTA flow',
        context)
    case 'blog-post':
      return buildRecommendation('aida', awarenessLevel, 62,
        'Blog default — AIDA educates and guides readers to action',
        context)
    default:
      return buildRecommendation('aida', awarenessLevel, 60,
        'General content — AIDA provides reliable attention-to-action structure',
        context)
  }
}

// ---------------------------------------------------------------------------
// Framework structures
// ---------------------------------------------------------------------------

function getFrameworkStructure(framework: MarketingFramework, context: FrameworkSelectionContext): {
  sections: string[]
  prompts: string[]
} {
  const ind = context.industry

  switch (framework) {
    case 'aida':
      return {
        sections: ['Attention', 'Interest', 'Desire', 'Action'],
        prompts: [
          `Write an attention-grabbing hook for ${ind} that stops the scroll`,
          'Build curiosity with a surprising benefit or little-known fact',
          'Create desire by painting a vivid picture of the outcome',
          'End with a clear, compelling call-to-action',
        ],
      }
    case 'pas':
      return {
        sections: ['Problem', 'Agitate', 'Solution'],
        prompts: [
          `Identify the specific pain point ${ind} customers face right now`,
          'Make the problem vivid and urgent — what happens if they do nothing?',
          'Present the solution with clear benefits and an immediate next step',
        ],
      }
    case 'bab':
      return {
        sections: ['Before', 'After', 'Bridge'],
        prompts: [
          `Describe the frustrating "before" state ${ind} customers experience`,
          'Paint a vivid picture of the transformed "after" state',
          `Explain how this ${ind} service bridges the gap`,
        ],
      }
    case 'fab':
      return {
        sections: ['Features', 'Advantages', 'Benefits'],
        prompts: [
          `State the key feature or capability of this ${ind} offering`,
          'Explain why this is better than alternatives',
          'Show how it concretely improves the customer\'s life',
        ],
      }
    case '4ps':
      return {
        sections: ['Promise', 'Picture', 'Proof', 'Push'],
        prompts: [
          'Make a bold, specific promise about results',
          'Help the reader visualize the outcome in detail',
          'Provide proof: reviews, guarantees, credentials, or numbers',
          'Create urgency and push for immediate action',
        ],
      }
  }
}

// ---------------------------------------------------------------------------
// Prompt block builder
// ---------------------------------------------------------------------------

const FRAMEWORK_LABELS: Record<MarketingFramework, string> = {
  aida: 'AIDA (Attention → Interest → Desire → Action)',
  pas: 'PAS (Problem → Agitate → Solution)',
  bab: 'BAB (Before → After → Bridge)',
  fab: 'FAB (Features → Advantages → Benefits)',
  '4ps': '4Ps (Promise → Picture → Proof → Push)',
}

/** Returns a prompt block ready to inject into the user prompt sent to the LLM. */
export function getFrameworkPromptBlock(rec: FrameworkRecommendation): string {
  const label = FRAMEWORK_LABELS[rec.framework]
  const steps = rec.structure.sections
    .map((s, i) => `- ${s}: ${rec.structure.prompts[i]}`)
    .join('\n')

  return `
MARKETING FRAMEWORK: Use the ${label} framework to structure this content.
${steps}
Follow this framework structure naturally — don't label the sections explicitly unless the format calls for headers.`
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function buildRecommendation(
  framework: MarketingFramework,
  awarenessLevel: AwarenessLevel,
  confidence: number,
  reasoning: string,
  context: FrameworkSelectionContext,
): FrameworkRecommendation {
  return {
    framework,
    confidence,
    reasoning,
    awarenessLevel,
    structure: getFrameworkStructure(framework, context),
  }
}
