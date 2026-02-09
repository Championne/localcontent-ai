'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SingleContentDemo, DemoResultView, type GeneratedDemo } from '@/components/marketing/LiveContentDemo'

// Pre-defined showcase examples — generated dynamically via AI on page load
const SHOWCASE_EXAMPLES = [
  { contentType: 'blog-post' as const, industry: 'Restaurant', label: 'Blog Post', color: 'blue', icon: '📝' },
  { contentType: 'gmb-post' as const, industry: 'Fitness', label: 'Google Business Post', color: 'green', icon: '📍' },
  { contentType: 'email' as const, industry: 'Real Estate', label: 'Email Newsletter', color: 'orange', icon: '📧' },
]

interface ShowcaseData {
  loading: boolean
  data: GeneratedDemo | null
  error: boolean
}

// Industry options
const INDUSTRY_OPTIONS = [
  { value: 'random', label: '🎲 Surprise Me (Random)' },
  { value: 'restaurant', label: '🍽️ Restaurant / Cafe' },
  { value: 'fitness', label: '💪 Fitness / Gym' },
  { value: 'salon', label: '💇 Salon / Beauty' },
  { value: 'real-estate', label: '🏠 Real Estate' },
  { value: 'plumbing', label: '🔧 Plumbing / HVAC' },
  { value: 'dental', label: '🦷 Dental / Medical' },
  { value: 'legal', label: '⚖️ Legal Services' },
  { value: 'retail', label: '🛍️ Retail / Shop' },
  { value: 'automotive', label: '🚗 Automotive' },
  { value: 'pet', label: '🐕 Pet Services' },
  { value: 'cleaning', label: '🧹 Cleaning Services' },
]

type DemoContentType = 'social-pack' | 'blog-post' | 'gmb-post' | 'email'

export default function ExamplesPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('random')
  const [lastGenerated, setLastGenerated] = useState<{ contentType: DemoContentType; data: GeneratedDemo } | null>(null)

  // Dynamic showcase examples — generated via AI on page load
  const [showcaseExamples, setShowcaseExamples] = useState<ShowcaseData[]>(
    SHOWCASE_EXAMPLES.map(() => ({ loading: true, data: null, error: false }))
  )

  const generateShowcase = useCallback(async (index: number) => {
    const example = SHOWCASE_EXAMPLES[index]
    setShowcaseExamples(prev => prev.map((s, i) => i === index ? { ...s, loading: true, error: false } : s))
    try {
      const res = await fetch('/api/demo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: example.contentType, industry: example.industry }),
      })
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      setShowcaseExamples(prev => prev.map((s, i) => i === index ? { loading: false, data: json, error: false } : s))
    } catch {
      setShowcaseExamples(prev => prev.map((s, i) => i === index ? { loading: false, data: null, error: true } : s))
    }
  }, [])

  // Generate all 3 showcases on mount
  useEffect(() => {
    SHOWCASE_EXAMPLES.forEach((_, i) => generateShowcase(i))
  }, [generateShowcase])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Live AI Demos</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-6">
            Watch GeoSpark Create Content
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Select your industry and click any button to see our AI generate real content in real-time.
          </p>
          
          {/* Industry Selector */}
          <div className="max-w-xs mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose your industry:
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none cursor-pointer"
            >
              {INDUSTRY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 4 Live Demos Grid + full-width result */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Social Media Pack Demo */}
          <SingleContentDemo
            contentType="social-pack"
            title="📱 Social Media Pack"
            description="6 platform-optimized posts (Twitter, Facebook, Instagram, LinkedIn, TikTok, Nextdoor) generated in one click"
            industry={selectedIndustry !== 'random' ? selectedIndustry : undefined}
            onGenerated={(data) => setLastGenerated({ contentType: 'social-pack', data })}
          />

          {/* Blog Post Demo */}
          <SingleContentDemo
            contentType="blog-post"
            title="📝 Blog Post"
            description="SEO-optimized, 600-800 word articles that help you rank for local searches"
            industry={selectedIndustry !== 'random' ? selectedIndustry : undefined}
            onGenerated={(data) => setLastGenerated({ contentType: 'blog-post', data })}
          />

          {/* Google Business Post Demo */}
          <SingleContentDemo
            contentType="gmb-post"
            title="📍 Google Business Post"
            description="Engaging updates for your Google Business Profile that drive local traffic"
            industry={selectedIndustry !== 'random' ? selectedIndustry : undefined}
            onGenerated={(data) => setLastGenerated({ contentType: 'gmb-post', data })}
          />

          {/* Email Newsletter Demo */}
          <SingleContentDemo
            contentType="email"
            title="📧 Email Newsletter"
            description="Professional newsletters with compelling subject lines and clear CTAs"
            industry={selectedIndustry !== 'random' ? selectedIndustry : undefined}
            onGenerated={(data) => setLastGenerated({ contentType: 'email', data })}
          />
        </div>

        {/* Full-width generated result below all cards */}
        {lastGenerated && (
          <div className="max-w-6xl mx-auto mt-8 w-full">
            <DemoResultView
              contentType={lastGenerated.contentType}
              demo={lastGenerated.data}
              className="w-full"
            />
          </div>
        )}
      </section>

      {/* AI-Generated Examples Section — generated dynamically on page load */}
      <section className="container mx-auto px-4 py-16 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">AI-Generated Examples</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            See What GeoSpark Creates
          </h2>
          <p className="text-xl text-gray-600">
            These examples are generated live by our AI — text, images, everything. Refresh to see new ones.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {SHOWCASE_EXAMPLES.map((example, idx) => {
            const showcase = showcaseExamples[idx]
            const colorMap: Record<string, { bg: string; badge: string; accent: string; light: string }> = {
              blue: { bg: 'from-blue-100 to-blue-50', badge: 'bg-blue-600/70', accent: 'bg-blue-600', light: 'bg-blue-100 text-blue-600' },
              green: { bg: 'from-green-100 to-green-50', badge: 'bg-green-600/70', accent: 'bg-green-600', light: 'bg-green-100 text-green-600' },
              orange: { bg: 'from-orange-100 to-orange-50', badge: 'bg-orange-600/70', accent: 'bg-orange-500', light: 'bg-orange-100 text-orange-600' },
            }
            const colors = colorMap[example.color] || colorMap.blue

            // Loading skeleton
            if (showcase.loading) {
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div className={`h-40 bg-gradient-to-br ${colors.bg}`} />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                    <div className="h-3 bg-gray-200 rounded w-4/6" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 bg-gray-200 rounded w-24" />
                      <div className="h-2 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                  <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <span className="text-xs text-gray-400">Generating with AI...</span>
                  </div>
                </div>
              )
            }

            // Error state
            if (showcase.error || !showcase.data) {
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col items-center justify-center py-16 px-6 text-center">
                  <p className="text-gray-500 text-sm mb-3">Could not generate this example</p>
                  <button
                    onClick={() => generateShowcase(idx)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )
            }

            const { data } = showcase
            const contentStr = typeof data.content === 'string' ? data.content : ''
            const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

            // Blog Post card
            if (example.contentType === 'blog-post') {
              // Parse markdown title from content
              const titleMatch = contentStr.match(/^#\s+(.+)/m)
              const title = titleMatch ? titleMatch[1] : data.topic || 'Blog Post'
              const bodyText = contentStr.replace(/^#.*\n*/m, '').replace(/\*.*?\*/g, '').trim()
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-br from-blue-100 to-blue-50">
                    {data.imageUrl && <img src={data.imageUrl} alt="AI Generated" className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <span className={`absolute top-3 left-3 ${colors.badge} text-white px-2 py-1 rounded text-xs font-semibold`}>{example.icon} {example.label} • {data.industry}</span>
                    <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      AI Generated
                    </div>
                  </div>
                  <div className="p-5 max-h-72 overflow-y-auto">
                    <h4 className="font-bold text-gray-900 text-lg mb-3">{title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{bodyText.slice(0, 400)}{bodyText.length > 400 ? '...' : ''}</p>
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${colors.light} flex items-center justify-center font-semibold text-sm`}>{(data.businessName || 'B')[0]}</div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{data.businessName}</p>
                      <p className="text-xs text-gray-500">{today}</p>
                    </div>
                  </div>
                  <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                    <span>AI text + image</span>
                    <span>•</span>
                    <span>SEO optimized</span>
                    <span>•</span>
                    <span className="text-green-600 font-medium">Ready to publish</span>
                  </div>
                </div>
              )
            }

            // Google Business Post card
            if (example.contentType === 'gmb-post') {
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold">{(data.businessName || 'B')[0]}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">{data.businessName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="text-green-600">✓ Verified</span>
                        <span>•</span>
                        <span>Just now</span>
                      </div>
                    </div>
                    <span className={`${colors.badge} text-white px-2 py-1 rounded text-xs font-semibold`}>{data.industry}</span>
                  </div>
                  <div className="relative">
                    {data.imageUrl && <img src={data.imageUrl} alt="AI Generated" className="w-full aspect-video object-cover" />}
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      AI Generated
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{contentStr.slice(0, 300)}{contentStr.length > 300 ? '...' : ''}</p>
                    <button className={`mt-4 w-full py-2.5 ${colors.accent} text-white rounded-lg font-medium text-sm`}>Learn More</button>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>AI text + image</span>
                    <span className="text-green-600 font-medium">Ready to post</span>
                  </div>
                </div>
              )
            }

            // Email Newsletter card
            if (example.contentType === 'email') {
              const subjectMatch = contentStr.match(/Subject:\s*(.+)/i)
              const subject = subjectMatch ? subjectMatch[1].trim() : data.topic || 'Newsletter'
              const emailBody = contentStr.replace(/Subject:.*\n*/i, '').trim()
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full ${colors.light} flex items-center justify-center font-semibold`}>{(data.businessName || 'B')[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">{data.businessName}</div>
                        <div className="text-xs text-gray-500 truncate">to: subscriber@email.com</div>
                      </div>
                      <span className={`${colors.badge} text-white px-2 py-1 rounded text-xs font-semibold`}>{data.industry}</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-500">Subject: </span>
                      <span className="text-sm font-medium text-gray-900">{subject}</span>
                    </div>
                  </div>
                  <div className="relative">
                    {data.imageUrl && <img src={data.imageUrl} alt="AI Generated" className="w-full aspect-video object-cover" />}
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      AI Generated
                    </div>
                  </div>
                  <div className="p-5 max-h-60 overflow-y-auto">
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{emailBody.slice(0, 350)}{emailBody.length > 350 ? '...' : ''}</p>
                    <div className="mt-4 text-center">
                      <button className={`px-5 py-2 ${colors.accent} text-white rounded-lg font-medium text-sm`}>Learn More</button>
                    </div>
                  </div>
                  <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                    <span>AI text + image</span>
                    <span>•</span>
                    <span>Mobile optimized</span>
                    <span>•</span>
                    <span className="text-green-600 font-medium">Ready to send</span>
                  </div>
                </div>
              )
            }

            return null
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Content Like This?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Generate a month of local content in minutes. Blog posts, newsletters, social media, all tailored for your business.
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Start Your Free 14-Day Trial
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-teal-200 text-sm mt-4">No credit card required</p>
        </div>
      </section>
    </div>
  )
}
