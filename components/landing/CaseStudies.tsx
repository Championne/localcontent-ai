'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp, viewportConfig } from './animations'

const cases = [
  {
    business: "The Daily Grind Cafe",
    owner: "Sarah M.",
    location: "Portland, OR",
    avatar: "SM",
    industry: "Food & Beverage",
    timeline: "3 months",
    before: { engagement: "1.2%", postsPerWeek: 2, timeSpent: "8 hrs/week" },
    after: { engagement: "4.9%", postsPerWeek: 14, timeSpent: "45 min/week" },
    quote: "By month 3, the AI was writing posts that sounded more like me than my old agency ever did. My regulars actually comment more because the voice feels authentic.",
    highlight: "+312% engagement",
    highlightColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    business: "Rapid Plumbers",
    owner: "David L.",
    location: "Denver, CO (3 locations)",
    avatar: "DL",
    industry: "Home Services",
    timeline: "6 months",
    before: { engagement: "0.8%", postsPerWeek: 1, timeSpent: "12 hrs/week" },
    after: { engagement: "3.2%", postsPerWeek: 21, timeSpent: "1 hr/week" },
    quote: "Each location gets hyper-local content that mentions real neighborhoods and local events. We went from 1 generic post to 7 unique posts per location per week.",
    highlight: "+40% service requests",
    highlightColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    business: "Emily Rose Realty",
    owner: "Emily R.",
    location: "Austin, TX",
    avatar: "ER",
    industry: "Real Estate",
    timeline: "9 months",
    before: { engagement: "2.1%", postsPerWeek: 3, timeSpent: "6 hrs/week" },
    after: { engagement: "7.8%", postsPerWeek: 14, timeSpent: "30 min/week" },
    quote: "I'm a solo agent competing with teams of 20. GeoSpark learned my neighborhood expertise and now generates market insights I'd never have time to write myself.",
    highlight: "10+ hrs saved/week",
    highlightColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
]

export default function CaseStudies() {
  const [active, setActive] = useState(0)

  return (
    <section id="case-studies" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center mb-14"
        >
          <span className="inline-block text-spark-600 font-bold text-sm uppercase tracking-widest mb-3">Case Studies</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
            Real Businesses. Real&nbsp;Results.
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            See how local businesses are building irreplaceable brand intelligence with GeoSpark.
          </p>
        </motion.div>

        {/* Tab Selectors */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {cases.map((c, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active === i
                  ? 'bg-gradient-to-r from-spark-500 to-amber-500 text-white shadow-lg shadow-spark-500/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.business}
            </button>
          ))}
        </div>

        {/* Active Case */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="max-w-5xl mx-auto"
          >
            {(() => {
              const c = cases[active]
              return (
                <div className="bg-gray-50 rounded-3xl p-6 md:p-10 border border-gray-100">
                  <div className="flex flex-col md:flex-row gap-8 mb-8">
                    {/* Business Info */}
                    <div className="md:w-1/3">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-spark-400 to-amber-500 flex items-center justify-center text-white font-bold">
                          {c.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{c.owner}</p>
                          <p className="text-sm text-gray-500">{c.business}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-500">
                        <p><span className="font-medium text-gray-700">Location:</span> {c.location}</p>
                        <p><span className="font-medium text-gray-700">Industry:</span> {c.industry}</p>
                        <p><span className="font-medium text-gray-700">Using GeoSpark:</span> {c.timeline}</p>
                      </div>
                      <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-full border text-sm font-bold ${c.highlightColor}`}>
                        {c.highlight}
                      </div>
                    </div>

                    {/* Before / After */}
                    <div className="md:w-2/3 grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-2xl p-5 border border-gray-200">
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-4">Before GeoSpark</p>
                        <div className="space-y-3">
                          <div>
                            <p className="text-2xl font-black text-gray-300">{c.before.engagement}</p>
                            <p className="text-xs text-gray-400">Engagement Rate</p>
                          </div>
                          <div>
                            <p className="text-2xl font-black text-gray-300">{c.before.postsPerWeek}</p>
                            <p className="text-xs text-gray-400">Posts / Week</p>
                          </div>
                          <div>
                            <p className="text-2xl font-black text-gray-300">{c.before.timeSpent}</p>
                            <p className="text-xs text-gray-400">Time on Content</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-spark-50 to-amber-50 rounded-2xl p-5 border-2 border-spark-200">
                        <p className="text-xs uppercase tracking-wider text-spark-600 font-bold mb-4">After GeoSpark</p>
                        <div className="space-y-3">
                          <div>
                            <p className="text-2xl font-black text-spark-600">{c.after.engagement}</p>
                            <p className="text-xs text-spark-500/60">Engagement Rate</p>
                          </div>
                          <div>
                            <p className="text-2xl font-black text-spark-600">{c.after.postsPerWeek}</p>
                            <p className="text-xs text-spark-500/60">Posts / Week</p>
                          </div>
                          <div>
                            <p className="text-2xl font-black text-spark-600">{c.after.timeSpent}</p>
                            <p className="text-xs text-spark-500/60">Time on Content</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="border-l-4 border-spark-400 pl-5 italic text-gray-600 leading-relaxed">
                    &ldquo;{c.quote}&rdquo;
                  </blockquote>
                </div>
              )
            })()}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
