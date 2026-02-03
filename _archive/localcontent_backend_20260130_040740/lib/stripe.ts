import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 6900,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    limits: {
      blogPosts: 25,
      socialPosts: 75,
      gmbUpdates: 15,
      templates: 5,
    },
    features: [
      '25 blog posts/month',
      '75 social media posts/month', 
      '15 Google Business updates/month',
      '5 industry templates',
      'Basic local event integration',
      'Email support',
    ],
  },
  growth: {
    name: 'Growth',
    price: 12900,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID,
    limits: {
      blogPosts: 50,
      socialPosts: 150,
      gmbUpdates: 25,
      templates: 15,
      locations: 3,
    },
    features: [
      '50 blog posts/month',
      '150 social media posts/month',
      '25 Google Business updates/month',
      '15 industry templates',
      'Advanced local integration',
      'Multi-location support (up to 3)',
      'Competitor content analysis',
      'Priority support',
    ],
    popular: true,
  },
  pro: {
    name: 'Pro',
    price: 19900,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    limits: {
      blogPosts: -1, // unlimited
      socialPosts: -1,
      gmbUpdates: -1,
      templates: -1,
      locations: 10,
    },
    features: [
      'Unlimited blog posts',
      'Unlimited social media posts',
      'Unlimited Google Business updates',
      'All templates + custom requests',
      'Full local intelligence suite',
      'Multi-location support (up to 10)',
      'Advanced analytics & ROI tracking',
      'White-label reports',
      'Dedicated account manager',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS

export function getPlanByPriceId(priceId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return key as PlanKey
    }
  }
  return null
}

export function canUserPerformAction(
  userPlan: PlanKey,
  action: 'blogPost' | 'socialPost' | 'gmbUpdate',
  currentUsage: number
): boolean {
  const plan = PLANS[userPlan]
  const limitKey = action === 'blogPost' ? 'blogPosts' 
    : action === 'socialPost' ? 'socialPosts' 
    : 'gmbUpdates'
  
  const limit = plan.limits[limitKey]
  return limit === -1 || currentUsage < limit
}
