'use client'

import { motion } from 'framer-motion'
import { viewportConfig } from './animations'
import { LandingPageDemo } from '@/components/marketing/LiveContentDemo'

export default function LiveDemoEmbed() {
  return (
    <section id="demo" className="relative bg-gradient-to-b from-spark-50/60 via-amber-50/40 to-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-spark-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportConfig}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <LandingPageDemo />
      </motion.div>
    </section>
  )
}
