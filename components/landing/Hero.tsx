'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const samplePosts = [
  "Weekend brunch special! Join us for bottomless mimosas and our NEW avocado benedict. Book your table — link in bio! 🥂🍳 #BrunchGoals #WeekendVibes",
  "Beat the summer heat with our refreshing new iced lavender latte! ☀️ Made with locally-sourced honey from Willow Creek Farm. #LocalLove #CoffeeLovers",
  "HUGE thanks to everyone who came to our 5-year anniversary! Your support means everything to our family. Here's to 5 more! 🎉 #SmallBizLove",
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

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 overflow-hidden flex items-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-spark-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-28 pb-20 relative z-10">
        <div className="grid lg:grid-cols-10 gap-12 lg:gap-8 items-center">
          {/* Left: Copy — 40% */}
          <div className="lg:col-span-4 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-spark-500/10 border border-spark-500/20 rounded-full px-4 py-1.5 mb-6"
            >
              <span className="w-2 h-2 bg-spark-400 rounded-full animate-pulse" />
              <span className="text-spark-300 text-sm font-medium">AI That Actually Learns</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl xl:text-6xl font-black text-white leading-[1.08] mb-6"
            >
              After 100 Posts,{' '}
              <span className="text-gradient-spark">Knows Your Brand</span>{' '}
              Better Than a New&nbsp;Hire
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-blue-100/60 mb-8 leading-relaxed"
            >
              Most AI tools start from zero every time. GeoSpark learns from what you{' '}
              <span className="text-spark-400 font-semibold">like</span> and what{' '}
              <span className="text-amber-400 font-semibold">works</span>, building
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
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-spark-500 to-amber-500 hover:from-spark-600 hover:to-amber-600 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-2xl shadow-spark-500/30 hover:shadow-spark-500/50 hover:scale-105"
              >
                Start Free Trial
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 hover:text-white hover:bg-white/10 px-6 py-4 rounded-2xl text-lg font-medium transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                See It In Action
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-200/40 justify-center lg:justify-start"
            >
              {['No credit card', '14-day free trial', 'Cancel anytime'].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
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
            <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-5 md:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <span className="text-xs text-white/30 font-mono">geospark.app — Brand Intelligence</span>
              </div>

              {/* Intelligence Meter */}
              <div className="bg-white/[0.04] rounded-2xl p-4 mb-5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white/50">Brand Intelligence Score</span>
                  <motion.span
                    key={intelligenceScore}
                    initial={{ scale: 1.4, color: '#fb923c' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-2xl font-black text-white tabular-nums"
                  >
                    {intelligenceScore}%
                  </motion.span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-spark-500 to-amber-400 rounded-full"
                    animate={{ width: `${intelligenceScore}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-white/25 mt-2">
                  {feedbackCount > 0 ? `${feedbackCount} feedback signals — learning in real time` : 'Try it! Click the buttons below to teach the AI'}
                </p>
              </div>

              {/* Dual Learning Badges */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-spark-500/10 border border-spark-500/20 rounded-xl px-3 py-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-spark-300/60 font-semibold mb-0.5">Preference Learning</p>
                  <p className="text-sm font-bold text-spark-400">What You Like</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-blue-300/60 font-semibold mb-0.5">Analytics Learning</p>
                  <p className="text-sm font-bold text-blue-400">What Works</p>
                </div>
              </div>

              {/* Sample Post */}
              <motion.div
                key={currentPost}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.06] rounded-xl p-4 mb-4 border border-white/5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">GS</div>
                  <div>
                    <p className="text-sm font-medium text-white/90">Your Business</p>
                    <p className="text-xs text-white/30">Instagram · Generated by GeoSpark</p>
                  </div>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{samplePosts[currentPost]}</p>
              </motion.div>

              {/* Feedback Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleFeedback(true)}
                  className="flex items-center justify-center gap-2 bg-green-500/15 hover:bg-green-500/25 border border-green-500/20 text-green-400 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Love It (+8)
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate (+3)
                </button>
              </div>

              <motion.p
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="text-center mt-4 text-xs text-spark-400/40 flex items-center justify-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 bg-spark-400 rounded-full" />
                Every interaction makes the AI smarter for your brand
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
