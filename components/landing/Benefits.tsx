'use client'

import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, viewportConfig } from './animations'

const benefits = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Dual Learning Engine',
    description: 'Learns from your feedback (what you like) AND real analytics (what performs). Two data streams, one compounding intelligence.',
    color: 'from-spark-500 to-amber-500',
    bg: 'bg-spark-50',
    border: 'border-spark-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: 'Brand Voice Memory',
    description: 'Your tone, style, and vocabulary are remembered and refined. By month 3, the AI sounds like you wrote it.',
    color: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Performance Analytics',
    description: 'Content doesn\'t just match your voice — it\'s optimized for what actually drives engagement and conversions.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: '6 Platforms, One Click',
    description: 'Instagram, Facebook, LinkedIn, Twitter/X, TikTok, and Nextdoor — all perfectly formatted from a single idea.',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Hyper-Local Intelligence',
    description: 'Knows your neighborhood, local events, and community language. Content that resonates with customers who live nearby.',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Compound Intelligence',
    description: 'Like compound interest for your marketing. Every post, every like, every metric makes the next piece of content better.',
    color: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
]

export default function Benefits() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center mb-16"
        >
          <span className="inline-block text-spark-600 font-bold text-sm uppercase tracking-widest mb-3">Features</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
            AI That Gets Smarter, So You Don&apos;t Have&nbsp;To
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Six capabilities powered by dual learning — preference intelligence meets performance analytics.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`${b.bg} border ${b.border} rounded-2xl p-6 group cursor-default transition-shadow hover:shadow-xl`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                {b.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
