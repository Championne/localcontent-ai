'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const samplePosts = [
  {
    business: 'The Daily Grind Cafe',
    handle: 'thedailygrind',
    initials: 'DG',
    platform: 'Instagram',
    text: "Weekend brunch special! Join us for bottomless mimosas and our NEW avocado benedict. Book your table — link in bio! 🥂🍳 #BrunchGoals #WeekendVibes",
    imageUrl: '/demo/brunch.jpg',
  },
  {
    business: 'Bloom & Petal Florist',
    handle: 'bloomandpetal',
    initials: 'BP',
    platform: 'Facebook',
    text: "Spring arrangements are HERE! 🌸 Hand-tied bouquets starting at $35 — perfect for Mother's Day. Order by Friday for free local delivery. #ShopLocal #SpringFlowers",
    imageUrl: '/demo/flowers.jpg',
  },
  {
    business: 'Summit Fitness Studio',
    handle: 'summitfitness',
    initials: 'SF',
    platform: 'Instagram',
    text: "New 6AM HIIT class dropping Monday! 🔥 First class FREE for new members. Limited spots — DM us to reserve yours. #FitnessGoals #MondayMotivation",
    imageUrl: '/demo/gym.jpg',
  },
]

export default function Hero() {
  const [intelligenceScore, setIntelligenceScore] = useState(42)
  const [currentPost, setCurrentPost] = useState(0)
  const [feedbackCount, setFeedbackCount] = useState(0)

  const handleFeedback = (positive: boolean) => {
    setIntelligenceScore((prev) => Math.min(prev + (positive ? 8 : 3), 99))
    setFeedbackCount((prev) => prev + 1)
    setCurrentPost((prev) => (prev + 1) % samplePosts.length)
  }

  const post = samplePosts[currentPost]

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-white via-spark-50/30 to-white overflow-hidden flex items-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-spark-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-100/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-10 gap-12 lg:gap-8 items-center">
          {/* Left: Copy — 40% */}
          <div className="lg:col-span-4 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-spark-500/10 border border-spark-500/20 rounded-full px-4 py-1.5 mb-6"
            >
              <span className="w-2 h-2 bg-spark-500 rounded-full animate-pulse" />
              <span className="text-spark-600 text-sm font-medium">AI That Actually Learns</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl xl:text-6xl font-black text-gray-900 leading-[1.08] mb-6"
            >
              After 100 Posts,{' '}
              <span className="text-gradient-spark">Knows Your Brand</span>{' '}
              Better Than a New&nbsp;Hire
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-500 mb-8 leading-relaxed"
            >
              Most AI tools start from zero every time. GeoSpark learns from what you{' '}
              <span className="text-spark-600 font-semibold">like</span> and what{' '}
              <span className="text-amber-600 font-semibold">works</span>, building
              irreplaceable brand intelligence with every post.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start"
            >
              <Link
                href="/auth/signup"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-spark-500 to-amber-500 hover:from-spark-600 hover:to-amber-600 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-2xl shadow-spark-500/20 hover:shadow-spark-500/40 hover:scale-105"
              >
                Start Free Trial
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:text-spark-600 hover:border-spark-200 hover:bg-spark-50 px-6 py-4 rounded-2xl text-lg font-medium transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                See It In Action
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 justify-center lg:justify-start"
            >
              {['No credit card', '14-day free trial', 'Cancel anytime'].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Interactive Demo — 60% */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-6"
          >
            <div className="bg-white rounded-3xl p-5 md:p-8 shadow-2xl shadow-gray-200/60 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-gray-400 font-mono">geospark.app — Brand Intelligence</span>
              </div>

              {/* Intelligence Meter */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Brand Intelligence Score</span>
                  <motion.span
                    key={intelligenceScore}
                    initial={{ scale: 1.4, color: '#f97316' }}
                    animate={{ scale: 1, color: '#111827' }}
                    className="text-2xl font-black text-gray-900 tabular-nums"
                  >
                    {intelligenceScore}%
                  </motion.span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-spark-500 to-amber-400 rounded-full"
                    animate={{ width: `${intelligenceScore}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {feedbackCount > 0 ? `${feedbackCount} feedback signals — learning in real time` : 'Try it! Click the buttons below to teach the AI'}
                </p>
              </div>

              {/* Dual Learning Badges */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-spark-50 border border-spark-100 rounded-xl px-3 py-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-spark-400 font-semibold mb-0.5">Preference Learning</p>
                  <p className="text-sm font-bold text-spark-600">What You Like</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold mb-0.5">Analytics Learning</p>
                  <p className="text-sm font-bold text-blue-600">What Works</p>
                </div>
              </div>

              {/* Sample Post with Image */}
              <motion.div
                key={currentPost}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-xl overflow-hidden mb-4 border border-gray-100"
              >
                {/* Post Image */}
                <img
                  src={post.imageUrl}
                  alt={`${post.business} post`}
                  className="w-full aspect-[16/9] object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark-400 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">{post.initials}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{post.business}</p>
                      <p className="text-xs text-gray-400">{post.platform} · Generated by GeoSpark</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{post.text}</p>
                </div>
              </motion.div>

              {/* Feedback Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleFeedback(true)}
                  className="flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Love It (+8)
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate (+3)
                </button>
              </div>

              <motion.p
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="text-center mt-4 text-xs text-spark-500/60 flex items-center justify-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 bg-spark-500 rounded-full" />
                Every interaction makes the AI smarter for your brand
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
