import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 6900, // $69.00 in cents
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
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
    price: 12900, // $129.00 in cents
    priceId: process.env.STRIPE_GROWTH_PRICE_ID,
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
    price: 19900, // $199.00 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID,
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
