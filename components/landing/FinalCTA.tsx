'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeInUp, viewportConfig } from './animations'

export default function FinalCTA() {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-br from-spark-500 via-spark-600 to-amber-600 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 max-w-4xl mx-auto">
            Start Building Your Brand Intelligence&nbsp;Today
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Every day without GeoSpark is a day your competitors are building data points you&apos;ll never catch up to.
            Start your free trial now — no credit card required.
          </p>

          <Link
            href="/auth/signup"
            className="group inline-flex items-center justify-center gap-3 bg-white text-spark-600 hover:text-spark-700 px-10 py-5 md:px-14 md:py-6 rounded-2xl text-xl md:text-2xl font-black transition-all shadow-2xl shadow-black/20 hover:shadow-black/30 hover:scale-105"
          >
            Start Sparking — It&apos;s Free
            <svg className="w-6 h-6 md:w-7 md:h-7 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/60 font-medium">
            <span>No credit card required</span>
            <span>·</span>
            <span>14-day free trial</span>
            <span>·</span>
            <span>Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
