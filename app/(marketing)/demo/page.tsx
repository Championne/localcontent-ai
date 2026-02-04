'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SingleContentDemo } from '@/components/marketing/LiveContentDemo'

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

export default function ExamplesPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('random')

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

      {/* 4 Live Demos Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Social Media Pack Demo */}
          <SingleContentDemo
            contentType="social-pack"
            title="📱 Social Media Pack"
            description="6 platform-optimized posts (Twitter, Facebook, Instagram, LinkedIn, TikTok, Nextdoor) generated in one click"
            industry={selectedIndustry !== 'random' ? selectedIndustry : undefined}
          />

          {/* Blog Post Demo */}
          <SingleContentDemo
            contentType="blog-post"
            title="📝 Blog Post"
            description="SEO-optimized, 600-800 word articles that help you rank for local searches"
            industry={selectedIndustry !== 'random' ? selectedIndustry : undefined}
          />

          {/* Google Business Post Demo */}
          <SingleContentDemo
            contentType="gmb-post"
            title="📍 Google Business Post"
            description="Engaging updates for your Google Business Profile that drive local traffic"
            industry={selectedIndustry !== 'random' ? selectedIndustry : undefined}
          />

          {/* Email Newsletter Demo */}
          <SingleContentDemo
            contentType="email"
            title="📧 Email Newsletter"
            description="Professional newsletters with compelling subject lines and clear CTAs"
            industry={selectedIndustry !== 'random' ? selectedIndustry : undefined}
          />
        </div>
      </section>

      {/* Auto-Generated Examples Section */}
      <section className="container mx-auto px-4 py-16 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Live AI Examples</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            More AI-Generated Content
          </h2>
          <p className="text-xl text-gray-600">
            Real examples across different industries — generated fresh by our AI when you load this page.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Blog Post Example - Restaurant */}
          <SingleContentDemo
            contentType="blog-post"
            title="📝 Blog Post"
            description="Restaurant industry example"
            industry="restaurant"
            autoGenerate={true}
            compact={true}
          />

          {/* Google Business Post Example - Fitness */}
          <SingleContentDemo
            contentType="gmb-post"
            title="📍 Google Business"
            description="Fitness industry example"
            industry="fitness"
            autoGenerate={true}
            compact={true}
          />

          {/* Email Newsletter Example - Real Estate */}
          <SingleContentDemo
            contentType="email"
            title="📧 Email Newsletter"
            description="Real Estate industry example"
            industry="real-estate"
            autoGenerate={true}
            compact={true}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Content Like This?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Generate a month of local content in minutes. Blog posts, newsletters, social media — all tailored for your business.
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
