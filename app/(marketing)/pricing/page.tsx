// app/(marketing)/pricing/page.tsx
// Pricing matches Stripe: Starter $29/$290yr, Pro $79/$790yr, Premium $199/$1990yr

import React from 'react'
import Link from 'next/link'

const tiers = [
  {
    name: 'Free',
    price: 0,
    annualTotal: 0,
    description: 'Try it out, no credit card required',
    cta: 'Get Started Free',
    ctaLink: '/auth/signup',
    highlighted: false,
    features: [
      { text: '1 business', included: true },
      { text: '5 content pieces/month', included: true },
      { text: '5 AI images/month', included: true },
      { text: '2 platforms', included: true },
      { text: '1 user', included: true },
      { text: 'All content types', included: true },
      { text: 'Platform mockup previews', included: true },
      { text: 'Saved content library', included: false },
      { text: 'Analytics dashboard', included: false },
    ],
  },
  {
    name: 'Starter',
    price: 29,
    annualTotal: 290,
    description: 'Perfect for solo business owners',
    cta: 'Start 14-Day Free Trial',
    ctaLink: '/auth/signup?plan=starter',
    highlighted: false,
    features: [
      { text: '1 business', included: true },
      { text: '30 content pieces/month', included: true },
      { text: '30 AI images/month', included: true },
      { text: 'All 6 platforms', included: true },
      { text: '1 user', included: true },
      { text: 'All content types', included: true },
      { text: 'Platform mockup previews', included: true },
      { text: 'Saved content library', included: true },
      { text: 'Analytics dashboard', included: false },
    ],
  },
  {
    name: 'Pro',
    price: 79,
    annualTotal: 790,
    description: 'For growing businesses with multiple locations',
    cta: 'Start 14-Day Free Trial',
    ctaLink: '/auth/signup?plan=pro',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      { text: '3 businesses', included: true },
      { text: '100 content pieces/month', included: true },
      { text: '100 AI images/month', included: true },
      { text: 'All 6 platforms', included: true },
      { text: '1 user', included: true },
      { text: 'All content types', included: true },
      { text: 'Platform mockup previews', included: true },
      { text: 'Saved content library', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Priority support', included: true },
    ],
  },
  {
    name: 'Premium',
    price: 199,
    annualTotal: 1990,
    description: 'For agencies and multi-location businesses',
    cta: 'Start 14-Day Free Trial',
    ctaLink: '/auth/signup?plan=premium',
    highlighted: false,
    features: [
      { text: '10 businesses', included: true },
      { text: 'Unlimited content', included: true },
      { text: 'Unlimited AI images', included: true },
      { text: 'All 6 platforms', included: true },
      { text: '3 users', included: true },
      { text: 'All content types', included: true },
      { text: 'Platform mockup previews', included: true },
      { text: 'Saved content library', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Priority support', included: true },
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Simple pricing. Powerful results.
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            From hours to minutes: generate a month of content for less than one freelance article.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-spark-50 text-spark-700 px-4 py-2 rounded-full text-sm font-medium border border-spark-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Save with annual billing
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-lg ${
                tier.highlighted
                  ? 'border-spark-500 scale-105 shadow-lg'
                  : 'border-gray-200'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-spark-500 to-amber-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900">{tier.name}</h2>
                <p className="mt-1 text-sm text-gray-500 h-10">{tier.description}</p>

                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      ${tier.price}
                    </span>
                    <span className="ml-1 text-gray-500">/month</span>
                  </div>
                  {tier.price > 0 && (
                    <p className="mt-1 text-sm text-spark-600 font-medium">
                      or ${tier.annualTotal}/year
                    </p>
                  )}
                </div>

                <Link
                  href={tier.ctaLink}
                  className={`mt-6 block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-spark-500 to-amber-500 text-white hover:from-spark-600 hover:to-amber-600'
                      : tier.price === 0
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-spark-500 text-white hover:bg-spark-600'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>

              <div className="border-t border-gray-100 p-6">
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <svg
                          className="w-5 h-5 text-spark-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-gray-700' : 'text-gray-400'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
      
      {/* FAQ Section */}
      <section className="bg-gray-50 py-20 mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-spark-600 font-semibold text-sm uppercase tracking-wide">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                Pricing Questions
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "What counts as a content piece?",
                  a: "Each generation counts as 1 piece, whether it's a blog post, email, Google Business post, or a Social Media Pack (which gives you 6 platform-optimized posts in one generation)."
                },
                {
                  q: "Can I upgrade or downgrade anytime?",
                  a: "Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the end of your billing cycle."
                },
                {
                  q: "What happens if I run out of content or images?",
                  a: "You can upgrade to a higher tier anytime, or wait until your limits reset at the start of your next billing cycle. We'll notify you when you're running low."
                },
                {
                  q: "Do you offer refunds?",
                  a: "We offer a 14-day free trial on all paid plans so you can try before you commit. If you're not satisfied within the first 30 days of a paid subscription, contact us for a full refund."
                }
              ].map((faq, i) => (
                <details key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                    <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
            
            {/* CTA */}
            <div className="mt-12 text-center">
              <p className="text-gray-600">
                More questions? <Link href="/contact" className="text-spark-600 font-medium hover:underline">Contact us</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
