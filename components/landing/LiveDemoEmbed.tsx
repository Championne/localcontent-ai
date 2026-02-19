'use client'

import { motion } from 'framer-motion'
import { fadeInUp, viewportConfig } from './animations'
import { LandingPageDemo } from '@/components/marketing/LiveContentDemo'

export default function LiveDemoEmbed() {
  return (
    <section id="demo" className="py-20 md:py-28 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-spark-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center mb-12"
        >
          <span className="inline-block text-spark-400 font-bold text-sm uppercase tracking-widest mb-3">Live Demo</span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Try It Right Now. <span className="text-gradient-spark">No Sign-Up&nbsp;Needed.</span>
          </h2>
          <p className="text-lg text-blue-100/50 max-w-2xl mx-auto">
            Enter any topic below and watch GeoSpark create a full content pack for 6 platforms with a matching image — in&nbsp;seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <LandingPageDemo />
        </motion.div>
      </div>
    </section>
  )
}
