'use client'

import { motion } from 'framer-motion'
import { fadeInLeft, fadeInRight, fadeInUp, viewportConfig } from './animations'

const otherAI = [
  { label: 'Starts from zero every time', icon: '🔄' },
  { label: 'Generic, one-size-fits-all output', icon: '📋' },
  { label: 'No memory of your preferences', icon: '🧠' },
  { label: 'Ignores what actually performs', icon: '📉' },
  { label: 'Same quality on day 365 as day 1', icon: '📊' },
]

const geoSpark = [
  { label: 'Remembers every preference & edit', icon: '💡' },
  { label: 'Learns your unique brand voice', icon: '🎯' },
  { label: '2,400 data points after 12 months', icon: '🧬' },
  { label: 'Optimizes based on real analytics', icon: '📈' },
  { label: 'Gets measurably better every month', icon: '🚀' },
]

export default function Differentiator() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center mb-16"
        >
          <span className="inline-block text-spark-600 font-bold text-sm uppercase tracking-widest mb-3">The Dual Learning Engine</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Learns From What You <span className="text-gradient-spark">Like</span>{' '}
            <span className="text-gray-400">+</span>{' '}
            What <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Works</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Other AI tools are a blank slate every session. GeoSpark builds a compounding intelligence
            that becomes irreplaceable over time.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Other AI Tools */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="bg-gray-100 border border-gray-200 rounded-3xl p-6 md:p-8 relative"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-300 rounded-t-3xl" />
            <h3 className="text-xl font-bold text-gray-400 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Other AI Tools
            </h3>
            <div className="space-y-4">
              {otherAI.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 text-gray-500"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 bg-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">After 12 Months</p>
              <p className="text-2xl font-black text-gray-400">0 data points</p>
              <p className="text-xs text-gray-400 mt-1">Still a blank slate</p>
            </div>
          </motion.div>

          {/* GeoSpark */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="bg-gradient-to-br from-spark-50 to-amber-50 border-2 border-spark-200 rounded-3xl p-6 md:p-8 relative shadow-xl shadow-spark-500/10"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-spark-500 to-amber-400 rounded-t-3xl" />
            <h3 className="text-xl font-bold text-spark-700 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-spark-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              GeoSpark AI
            </h3>
            <div className="space-y-4">
              {geoSpark.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 bg-gradient-to-r from-spark-500 to-amber-500 rounded-xl p-4 text-center shadow-lg shadow-spark-500/20">
              <p className="text-xs text-white/70 uppercase tracking-wider font-semibold mb-1">After 12 Months</p>
              <p className="text-2xl font-black text-white">2,400 data points</p>
              <p className="text-xs text-white/70 mt-1">Irreplaceable brand intelligence</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
