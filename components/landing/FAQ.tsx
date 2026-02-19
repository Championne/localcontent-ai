'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp, viewportConfig } from './animations'

const faqs = [
  {
    q: 'How does the "dual learning" actually work?',
    a: 'GeoSpark has two learning streams. Preference Learning tracks every thumbs-up, edit, and regeneration to understand your style and tone. Performance Learning connects to your social analytics to see which posts get the most engagement, clicks, and conversions. Both streams feed into your Brand Intelligence Score, which compounds over time.',
  },
  {
    q: "What makes this different from just using ChatGPT?",
    a: "ChatGPT starts from zero every conversation. It has no memory of your brand, no learning from your feedback, and no connection to your analytics. GeoSpark builds a persistent, compounding intelligence unique to your business. After 100 posts, it knows your brand voice better than a new hire would.",
  },
  {
    q: 'What are "irreplaceable data points"?',
    a: "Every piece of feedback you give, every edit you make, and every analytics insight creates a data point in your brand profile. After 12 months of regular use, you'll have approximately 2,400 data points. This intelligence can't be replicated by switching tools — it's your competitive moat.",
  },
  {
    q: "How long until I see the AI improving?",
    a: "The improvement is measurable from week 1. By month 1, you'll notice fewer edits needed. By month 3, the AI sounds like you wrote it. By month 6, it routinely outperforms your best manual work. The longer you use it, the wider the gap becomes.",
  },
  {
    q: "What platforms does GeoSpark create content for?",
    a: "Every content pack includes posts optimized for Instagram, Facebook, LinkedIn, Twitter/X, TikTok, and Nextdoor — each formatted for that platform's best practices, character limits, and audience expectations. Plus a matching image (stock or AI-generated).",
  },
  {
    q: "How much does it cost?",
    a: "Plans start at $29/month for solo businesses, with Pro at $79/month for multi-location businesses. All paid plans include a 14-day free trial, no credit card required. We also have a free tier with 5 content packs/month so you can test it with zero risk.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. Your brand intelligence data is encrypted at rest and in transit. We never share your data with other customers or use it to train models for others. Your brand intelligence is yours alone — that's what makes it irreplaceable.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no cancellation fees. If you cancel, your brand intelligence data is retained for 90 days in case you return. After that, it's permanently deleted per your request.",
  },
]

export default function FAQ() {
  const [search, setSearch] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const filtered = search.trim()
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
      )
    : faqs

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center mb-12"
        >
          <span className="inline-block text-spark-600 font-bold text-sm uppercase tracking-widest mb-3">FAQ</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
            Got Questions?
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
            Everything you need to know about GeoSpark&apos;s dual learning engine.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpenIndex(null) }}
              placeholder="Search questions..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-spark-500/30 focus:border-spark-400 transition-all"
            />
          </div>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-8">No matching questions. Try different keywords.</p>
          )}
          {filtered.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="border border-gray-100 rounded-2xl overflow-hidden bg-white hover:border-spark-200 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex items-center justify-between w-full p-5 md:p-6 text-left gap-4"
                >
                  <span className="font-semibold text-gray-900 text-sm md:text-base">{faq.q}</span>
                  <motion.svg
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-5 h-5 text-gray-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-gray-600 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
