/**
 * Spark Narrative Templates
 *
 * Template pools for each touchpoint. Each function picks a random variant
 * and injects the user's business name, topic, framework, and brand data
 * so every interaction feels fresh and personal.
 */

// ---------------------------------------------------------------------------
// Plain-language framework names (never show abbreviations to the user)
// ---------------------------------------------------------------------------

export const FRAMEWORK_FULL_NAMES: Record<string, string> = {
  aida: 'Attention-Interest-Desire-Action',
  pas: 'Problem-Agitation-Solution',
  bab: 'Before-After-Bridge',
  fab: 'Features-Advantages-Benefits',
  '4ps': 'Promise-Picture-Proof-Push',
}

export function frameworkName(fw: string): string {
  return FRAMEWORK_FULL_NAMES[fw] || fw.toUpperCase()
}

// Helper: pick a random element from an array (stable within a session render)
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ---------------------------------------------------------------------------
// Step 1 — Greeting
// ---------------------------------------------------------------------------

export function getGreeting(
  learningLevel: string,
  businessName?: string,
  topFramework?: string,
  totalRated?: number,
): string {
  const name = businessName || 'your business'

  if (!learningLevel || learningLevel === 'new') {
    return pick([
      `Hi! I'm Spark, your marketing strategist. Tell me what ${name} wants to share today and I'll build the perfect strategy for you.`,
      `Welcome! I'm Spark — I help local businesses like ${name} create posts that actually attract customers. Pick a content type to get started.`,
      `Hey there! I'm Spark. I'll figure out the best marketing approach for ${name} based on your topic. Just choose a content type above.`,
      `Hello! I'm your AI marketing partner. Whatever ${name} needs to share, I'll craft a strategy that connects with your audience. Let's go!`,
      `Great to meet you! I'm Spark. I study marketing psychology so ${name} doesn't have to. Pick what you want to create and I'll handle the rest.`,
    ])
  }

  if (learningLevel === 'learning') {
    return pick([
      `Welcome back! I've been learning from your ${totalRated || 'recent'} ratings. Let me put that to work for ${name} today.`,
      `Hey again! Every rating you give teaches me more about what works for ${name}. I'm getting better — let's create something great.`,
      `Good to see you! I'm still learning your style, but I'm already starting to understand what ${name}'s audience responds to.`,
      `Back for more? Perfect. I've been studying your preferences since last time. Let's make something ${name}'s customers will love.`,
    ])
  }

  if (learningLevel === 'familiar') {
    const fwHint = topFramework ? ` The ${frameworkName(topFramework)} approach has been working really well for you.` : ''
    return pick([
      `Welcome back! After working together on many posts, I know what resonates with ${name}'s audience.${fwHint} Let's create something great.`,
      `Hey! I've got a solid read on ${name}'s style now.${fwHint} What do you want to share today?`,
      `Good to see you again! I've learned a lot about what makes ${name}'s content perform.${fwHint}`,
    ])
  }

  // expert
  const fwHint = topFramework ? ` Your audience loves the ${frameworkName(topFramework)} approach.` : ''
  return pick([
    `Your personal strategist is ready. After all our work together, I know ${name}'s winning formula.${fwHint} Let's make magic.`,
    `Welcome back, partner. I know exactly what works for ${name} now.${fwHint} Tell me the topic and I'll craft the perfect strategy.`,
    `Hey! We've built something great together. ${name}'s content gets better every time.${fwHint} What's on your mind today?`,
  ])
}

// ---------------------------------------------------------------------------
// Step 2 — Live Analysis (as user types)
// ---------------------------------------------------------------------------

export function getLiveAnalysis(
  framework: string,
  topic: string,
  businessName?: string,
  brandPersonality?: string | null,
): string {
  const name = businessName || 'your business'
  const fw = frameworkName(framework)
  const topicShort = topic.length > 40 ? topic.slice(0, 40).trim() + '...' : topic
  const personality = brandPersonality ? `, ${brandPersonality}` : ''

  const templates: Record<string, string[]> = {
    aida: [
      `For "${topicShort}" I'd grab your audience's attention first, then build interest in ${name}, create desire, and end with a clear call to action. This is the ${fw} approach — perfect when people don't know about you yet.`,
      `Your audience probably hasn't thought about this yet. I'll hook them with a bold opener, show why ${name} matters, and guide them to take action. That's the ${fw} approach.`,
      `"${topicShort}" is a great awareness topic. I'll use the ${fw} approach — start with a scroll-stopping hook for ${name}, build curiosity, then drive action.`,
    ],
    pas: [
      `I can see this is about solving a real problem. I'll highlight the pain your customers feel, show why it matters, then position ${name} as the solution. This is the ${fw} approach.`,
      `"${topicShort}" — people feeling this pain need to know ${name} can help. I'll agitate the problem first, then present your solution. That's the ${fw} approach.`,
      `Your customers are probably frustrated about this. I'll validate their pain, make it feel urgent, and show how ${name} fixes it. That's the ${fw} approach.`,
    ],
    bab: [
      `I'll paint a picture: life before ${name} helps (the struggle), life after (the transformation), and how you bridge that gap. This is the ${fw} approach — great for showing transformation.`,
      `"${topicShort}" is perfect for a transformation story. I'll show the "before" frustration, the "after" result, and how ${name} makes it happen.`,
      `Your audience knows they need a change. I'll show them what life looks like before and after ${name} — the ${fw} approach is powerful for this.`,
    ],
    fab: [
      `Your audience is comparing options. I'll highlight what makes ${name} special — the features, why they matter, and the real benefit to the customer. This is the ${fw} approach.`,
      `"${topicShort}" — people are shopping around. I'll help ${name} stand out by connecting your features to real customer benefits.`,
    ],
    '4ps': [
      `Your audience is almost ready to buy. I'll make a clear promise, paint a picture of the result, back it up with proof, and push them to act. This is the ${fw} approach.`,
      `"${topicShort}" — time to close the deal for ${name}. I'll use promise, picture, proof, and a push to action.`,
    ],
  }

  const pool = templates[framework] || templates.aida!
  const base = pick(pool)

  if (personality) {
    return base + ` Since ${name} has a${personality} personality, I'll match that energy in the image and tone.`
  }
  return base
}

// ---------------------------------------------------------------------------
// Step 2 — Generation Animation Steps
// ---------------------------------------------------------------------------

export function getGenerationSteps(
  topic: string,
  businessName?: string,
  frameworkFullName?: string,
): string[] {
  const name = businessName || 'your business'
  const topicShort = topic.length > 35 ? topic.slice(0, 35).trim() + '...' : topic
  const fw = frameworkFullName || 'the best marketing approach'

  return [
    pick([
      `Let me read your topic about "${topicShort}"...`,
      `Looking at "${topicShort}" for ${name}...`,
      `Analyzing "${topicShort}" to find the right angle for ${name}...`,
    ]),
    pick([
      `I'm going with the ${fw} approach — it's the best fit for this topic and your audience.`,
      `The ${fw} approach will work perfectly here. Let me build your content around it.`,
      `This topic calls for the ${fw} approach. Your audience will respond to this.`,
    ]),
    pick([
      `Now I'm writing posts tailored for each platform — short and punchy for Twitter, more detailed for LinkedIn...`,
      `Crafting platform-perfect posts for ${name}. Each one is optimized for where it'll be seen.`,
      `Writing content that sounds like ${name} on every platform — from Twitter to Instagram to LinkedIn...`,
    ]),
    pick([
      `Creating an image that tells ${name}'s story — matching your brand personality and the mood of this topic...`,
      `Building a visual that matches the energy of this post. Your brand colors and style are guiding the image.`,
      `Generating an image that'll make people stop scrolling. It'll feel like ${name}.`,
    ]),
    pick([
      `Almost done! Putting the finishing touches on your content pack...`,
      `Final polish — making sure everything is ready for ${name} to shine.`,
      `Wrapping up! Your content pack is almost ready.`,
    ]),
  ]
}

// ---------------------------------------------------------------------------
// Step 3 — Fallback narrative (used when LLM doesn't provide one)
// ---------------------------------------------------------------------------

export function getFallbackNarrative(
  framework: string,
  topic: string,
  businessName?: string,
  imageStyle?: string,
  brandPersonality?: string | null,
): string {
  const name = businessName || 'your business'
  const fw = frameworkName(framework)
  const topicShort = topic.length > 50 ? topic.slice(0, 50).trim() + '...' : topic

  let base = pick([
    `I used the ${fw} approach for "${topicShort}." `,
    `For this post about "${topicShort}," I chose the ${fw} approach. `,
    `"${topicShort}" — I went with the ${fw} approach for ${name}. `,
  ])

  const fwExplain: Record<string, string> = {
    aida: `This means we grab attention first, build interest, create desire, and end with a clear call to action — perfect for getting new customers to notice ${name}.`,
    pas: `This means we acknowledge the problem your customers face, show why it matters, and present ${name} as the solution — great for driving action.`,
    bab: `This shows your audience what life looks like before and after working with ${name}, and how you bridge that gap.`,
    fab: `This highlights what makes ${name} special — your features, why they matter, and the real benefit to the customer.`,
    '4ps': `This makes a promise, paints a picture of the result, backs it up with proof, and pushes the customer to act.`,
  }
  base += fwExplain[framework] || `This is designed to connect with your audience in the most effective way.`

  if (imageStyle || brandPersonality) {
    base += ` The image uses`
    if (brandPersonality) base += ` a ${brandPersonality} mood`
    if (imageStyle) base += `${brandPersonality ? ' with' : ''} a ${imageStyle} style`
    base += ` to match ${name}'s brand.`
  }

  base += ` Each post is tailored for its platform, so it feels native wherever your customers see it.`

  return base
}

// ---------------------------------------------------------------------------
// Post-Rating Reactions
// ---------------------------------------------------------------------------

export function getPostRatingReaction(isGood: boolean): string {
  if (isGood) {
    return pick([
      "Nice! I'll lean into this style more for your future posts.",
      "Glad you liked it! I'm noting what worked so your content keeps getting better.",
      "Great taste! I'll remember this preference for next time.",
      "Love it! This tells me a lot about what your audience will respond to.",
      "Awesome! The more you rate, the better I get at nailing your brand.",
    ])
  }
  return pick([
    "Got it — I'll adjust next time. Every bit of feedback helps me improve.",
    "Thanks for being honest. I'll learn from this and try a different approach next time.",
    "Noted! I'll steer away from this direction for your future content.",
    "Appreciate the feedback. I'm learning what doesn't work just as much as what does.",
  ])
}
