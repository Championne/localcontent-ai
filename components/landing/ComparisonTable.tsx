'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp, viewportConfig } from './animations'

type CellValue = true | false | string

const features: { label: string; geo: CellValue; chatgpt: CellValue; agency: CellValue; diy: CellValue }[] = [
  { label: 'Learns your brand voice', geo: true, chatgpt: false, agency: 'Partially', diy: false },
  { label: 'Uses real analytics to improve', geo: true, chatgpt: false, agency: 'Rarely', diy: false },
  { label: 'Multi-platform formatting', geo: true, chatgpt: false, agency: true, diy: false },
  { label: 'Hyper-local optimization', geo: true, chatgpt: false, agency: 'Sometimes', diy: 'Maybe' },
  { label: 'Improves over time', geo: true, chatgpt: false, agency: 'Inconsistent', diy: false },
  { label: 'Brand intelligence that compounds', geo: true, chatgpt: false, agency: false, diy: false },
  { label: 'AI-generated images included', geo: true, chatgpt: false, agency: 'Extra cost', diy: false },
  { label: 'Time investment', geo: '2 min/post', chatgpt: '15 min/post', agency: '1 hr/week', diy: '10+ hrs/week' },
  { label: 'Monthly cost', geo: 'From $29', chatgpt: '$20', agency: '$2,000+', diy: 'Free (your time)' },
]

const columns = [
  { key: 'geo' as const, label: 'GeoSpark', highlight: true },
  { key: 'chatgpt' as const, label: 'ChatGPT' },
  { key: 'agency' as const, label: 'Agency' },
  { key: 'diy' as const, label: 'DIY' },
]

function CellContent({ value }: { value: CellValue }) {
  if (value === true)
    return (
      <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    )
  if (value === false)
    return (
      <svg className="w-5 h-5 text-red-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    )
  return <span className="text-sm text-gray-500">{value}</span>
}

export default function ComparisonTable() {
  const [hoveredCol, setHoveredCol] = useState<string | null>(null)

  return (
    <section id="pricing" className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center mb-14"
        >
          <span className="inline-block text-spark-600 font-bold text-sm uppercase tracking-widest mb-3">Compare</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
            Why GeoSpark Wins
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            See how compound brand intelligence stacks up against the alternatives.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto overflow-x-auto"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-400 w-1/3" />
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onMouseEnter={() => setHoveredCol(col.key)}
                    onMouseLeave={() => setHoveredCol(null)}
                    className={`p-4 text-center text-sm font-bold transition-colors ${
                      col.highlight
                        ? 'text-spark-600 bg-spark-50 rounded-t-2xl'
                        : hoveredCol === col.key
                          ? 'text-gray-700 bg-gray-100 rounded-t-2xl'
                          : 'text-gray-500'
                    }`}
                  >
                    {col.label}
                    {col.highlight && (
                      <span className="block text-[10px] uppercase tracking-wider text-spark-400 font-bold mt-0.5">Recommended</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={i} className="border-t border-gray-100 group">
                  <td className="p-4 text-sm font-medium text-gray-700">{f.label}</td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      onMouseEnter={() => setHoveredCol(col.key)}
                      onMouseLeave={() => setHoveredCol(null)}
                      className={`p-4 text-center transition-colors ${
                        col.highlight
                          ? 'bg-spark-50'
                          : hoveredCol === col.key
                            ? 'bg-gray-100'
                            : ''
                      } ${
                        col.highlight && f[col.key] === true ? 'font-bold' : ''
                      }`}
                    >
                      <CellContent value={f[col.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="p-4" />
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`p-4 text-center ${col.highlight ? 'bg-spark-50 rounded-b-2xl' : ''}`}
                  >
                    {col.highlight && (
                      <a
                        href="/auth/signup"
                        className="inline-flex items-center justify-center bg-gradient-to-r from-spark-500 to-amber-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-spark-500/20 hover:shadow-xl hover:scale-105 transition-all"
                      >
                        Start Free
                      </a>
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </motion.div>
      </div>
    </section>
  )
}
