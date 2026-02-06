import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Trial period configuration
export const TRIAL_PERIOD_DAYS = 14

/**
 * Pricing (matches Stripe Dashboard):
 * - Starter: $29/mo, $290/yr
 * - Pro: $79/mo, $790/yr
 * - Premium: $199/mo, $1990/yr
 */
export const PLANS = {
  starter: {
    name: 'Starter',
    price: 2900, // $29.00 in cents (monthly)
    annualTotal: 29000, // $290.00 in cents (total per year)
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: [
      '30 content pieces/month',
      '30 AI images/month',
      '1 business',
      'All 6 platforms',
      'Saved content library',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 7900, // $79.00 in cents (monthly)
    annualTotal: 79000, // $790.00 in cents (total per year)
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      '100 content pieces/month',
      '100 AI images/month',
      '3 businesses',
      'All 6 platforms',
      'Analytics dashboard',
      'Priority support',
    ],
    popular: true,
  },
  premium: {
    name: 'Premium',
    price: 19900, // $199.00 in cents (monthly)
    annualTotal: 199000, // $1990.00 in cents (total per year)
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    features: [
      'Unlimited content',
      'Unlimited AI images',
      '10 businesses',
      '3 users',
      'All 6 platforms',
      'Advanced analytics',
      'Priority support',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS

// Helper to get plan by Stripe price ID
export function getPlanByPriceId(priceId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return key as PlanKey
    }
  }
  return null
}
