'use client'

import { motion } from 'framer-motion'
import { fadeInUp, viewportConfig } from './animations'

const steps = [
  {
    step: '01',
    title: 'Create Your First Content',
    description: 'Describe your topic in a sentence. GeoSpark generates platform-perfect posts for 6 social networks with a matching image.',
    detail: 'Even the first output is good. But watch what happens next.',
    color: 'from-spark-500 to-amber-500',
    ring: 'ring-spark-500/20',
  },
  {
    step: '02',
    title: 'Give Feedback',
    description: 'Love a post? Thumbs up. Want changes? Edit and save. Every interaction teaches the AI your preferences, tone, and style.',
    detail: 'This is Preference Learning — the AI learns what you like.',
    color: 'from-purple-500 to-indigo-500',
    ring: 'ring-purple-500/20',
  },
  {
    step: '03',
    title: 'Analytics Feed Back In',
    description: 'Connect your accounts and GeoSpark tracks which posts get the most engagement, clicks, and conversions.',
    detail: 'This is Performance Learning — the AI learns what works.',
    color: 'from-blue-500 to-cyan-500',
    ring: 'ring-blue-500/20',
  },
  {
    step: '04',
    title: 'Watch It Compound',
    description: 'By month 3, the AI sounds like you. By month 6, it outperforms your best manual work. By month 12, you have 2,400 irreplaceable data points.',
    detail: 'Your competitors can\'t replicate this. It\'s your moat.',
    color: 'from-green-500 to-emerald-500',
    ring: 'ring-green-500/20',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center mb-16"
        >
          <span className="inline-block text-spark-600 font-bold text-sm uppercase tracking-widest mb-3">How It Works</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
            The Flywheel That Makes You&nbsp;Unstoppable
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Every step feeds the next. Every post makes the system smarter. This is compound intelligence for your brand.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto relative">
          {/* Timeline Line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-spark-200 via-purple-200 via-blue-200 to-green-200 hidden md:block" />

          <div className="space-y-8 md:space-y-12">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-5 md:gap-8 relative"
              >
                {/* Step Number */}
                <div className="relative z-10 shrink-0">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg ring-4 ${s.ring}`}>
                    <span className="text-white font-black text-sm md:text-base">{s.step}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm flex-1 hover:shadow-md transition-shadow">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{s.description}</p>
                  <p className={`text-sm font-semibold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                    {s.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
