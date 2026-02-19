'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { fadeInUp, staggerContainer, viewportConfig } from './animations'

function AnimatedCounter({ target, suffix = '', label }: { target: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <div ref={ref} className="text-center">
      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, type: 'spring' }}
        className="text-4xl md:text-5xl font-black text-white tabular-nums"
      >
        {inView ? target.toLocaleString() : '0'}{suffix}
      </motion.p>
      <p className="text-sm text-white/40 mt-1 font-medium">{label}</p>
    </div>
  )
}

const testimonials = [
  {
    quote: "After 3 months, GeoSpark writes posts that sound more like me than my old agency did. The learning is real.",
    name: "Sarah M.",
    role: "Owner, The Daily Grind Cafe",
    metric: "+312% engagement",
    avatar: "SM",
  },
  {
    quote: "Managing content for 3 plumbing locations was a nightmare. Now each branch gets unique local content and our leads are up 40%.",
    name: "David L.",
    role: "Marketing Manager, Rapid Plumbers",
    metric: "+40% leads",
    avatar: "DL",
  },
  {
    quote: "I'm a solo agent competing with big agencies now. Month 6 content is night-and-day better than month 1.",
    name: "Emily R.",
    role: "Real Estate Agent, Austin TX",
    metric: "10+ hrs saved/week",
    avatar: "ER",
  },
]

export default function SocialProof() {
  return (
    <section className="bg-navy-900 py-20 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-spark-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20"
        >
          <AnimatedCounter target={5000} suffix="+" label="Local Businesses" />
          <AnimatedCounter target={100} suffix="K+" label="Posts Generated" />
          <AnimatedCounter target={2400} suffix="" label="Avg Data Points / Year" />
          <AnimatedCounter target={10} suffix="+" label="Hours Saved / Month" />
        </motion.div>

        {/* Testimonials */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.07] transition-all group"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-spark-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white/90 text-sm">{t.name}</p>
                    <p className="text-xs text-white/30">{t.role}</p>
                  </div>
                </div>
                <span className="bg-spark-500/15 text-spark-400 px-3 py-1 rounded-full text-xs font-bold border border-spark-500/20">
                  {t.metric}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
