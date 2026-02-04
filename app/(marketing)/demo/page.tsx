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

      {/* Static Examples Section */}
      <section className="container mx-auto px-4 py-16 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Example Output</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            See What GeoSpark Creates
          </h2>
          <p className="text-xl text-gray-600">
            Real examples across different industries — this is what your content could look like.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Blog Post Example - Restaurant */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Hero Image */}
            <div className="relative h-40 bg-gradient-to-br from-blue-100 to-blue-50">
              <img 
                src="/examples/restaurant-farm-to-table.png" 
                alt="Fresh vegetables on wooden table" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <span className="absolute top-3 left-3 bg-blue-600/70 text-white px-2 py-1 rounded text-xs font-semibold">Blog Post • Restaurant</span>
            </div>
            
            {/* Content */}
            <div className="p-5 max-h-72 overflow-y-auto">
              <h4 className="font-bold text-gray-900 text-lg mb-3">Savor the Season: Discover Harvest Kitchen&apos;s New Farm-to-Table Spring Menu</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                As the flowers bloom and the weather warms up, nothing excites food lovers quite like the arrival of spring! At Harvest Kitchen in Austin, TX, we&apos;re thrilled to announce our new farm-to-table spring menu...
              </p>
              <h5 className="text-sm font-semibold text-gray-900 mb-2 pb-1 border-b border-gray-100">Fresh Ingredients, Bold Flavors</h5>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                This spring, we&apos;ve partnered with local farmers to bring you the freshest produce and meats:
              </p>
              <ul className="text-sm text-gray-600 mb-3 ml-4 list-disc space-y-1">
                <li>Seasonal Vegetables: asparagus, radishes, and spring peas</li>
                <li>Locally-Sourced Proteins: grass-fed beef, sustainable seafood</li>
                <li>House-Made Sauces and Dressings</li>
              </ul>
              <p className="text-sm text-gray-500 italic">
                Book your table today and let the flavors of spring inspire your dining experience!
              </p>
            </div>
            
            {/* Author Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">H</div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Harvest Kitchen</p>
                <p className="text-xs text-gray-500">Feb 2, 2026</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
              <span>~500 words</span>
              <span>•</span>
              <span>SEO optimized</span>
              <span>•</span>
              <span className="text-green-600 font-medium">Ready to publish</span>
            </div>
          </div>

          {/* Google Business Post Example - Fitness */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* GMB Header */}
            <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold">I</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm">Iron Peak Gym</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="text-green-600">✓ Verified</span>
                  <span>•</span>
                  <span>Just now</span>
                </div>
              </div>
              <span className="bg-green-600/70 text-white px-2 py-1 rounded text-xs font-semibold">Fitness</span>
            </div>
            
            {/* Image */}
            <img 
              src="/examples/fitness-gym.png" 
              alt="Modern gym with exercise equipment" 
              className="w-full aspect-video object-cover"
            />
            
            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                🎉 Kickstart your fitness journey with a FREE personal training session at Iron Peak Gym! 💪 Limited spots available—don&apos;t miss out! Claim yours now by calling us or visiting our website!
              </p>
              
              {/* CTA Button */}
              <button className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm">
                Learn More
              </button>
            </div>
            
            {/* Engagement */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  Like
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  Share
                </span>
              </div>
              <span className="text-green-600 font-medium">Ready to post</span>
            </div>
          </div>

          {/* Email Newsletter Example - Real Estate */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Email Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">W</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">Westside Realty</div>
                  <div className="text-xs text-gray-500 truncate">to: subscriber@email.com</div>
                </div>
                <span className="bg-orange-600/70 text-white px-2 py-1 rounded text-xs font-semibold">Real Estate</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-500">Subject: </span>
                <span className="text-sm font-medium text-gray-900">What&apos;s Happening in Seattle&apos;s Housing Market This February?</span>
              </div>
            </div>
            
            {/* Image */}
            <img 
              src="/examples/real-estate-home.png" 
              alt="Modern home exterior" 
              className="w-full aspect-video object-cover"
            />
            
            {/* Email Body */}
            <div className="p-5 max-h-60 overflow-y-auto">
              <p className="text-sm text-gray-600 leading-relaxed mb-2">Hi there,</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                As we step into February, we&apos;re excited to share some intriguing insights about the Seattle housing market.
              </p>
              <ul className="text-sm text-gray-600 mb-3 ml-4 list-disc space-y-1">
                <li><strong>Inventory Levels:</strong> More homes for sale</li>
                <li><strong>Home Prices:</strong> Stabilizing after growth</li>
                <li><strong>Interest Rates:</strong> Still competitive</li>
              </ul>
              <p className="text-sm text-gray-600 leading-relaxed">Ready to explore your options?</p>
              
              {/* CTA Button */}
              <div className="mt-4 text-center">
                <button className="px-5 py-2 bg-orange-500 text-white rounded-lg font-medium text-sm">
                  Learn More
                </button>
              </div>
              
              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 text-center text-xs text-gray-400">
                <p>Sent with ❤️ from Westside Realty</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
              <span>~250 words</span>
              <span>•</span>
              <span>Mobile optimized</span>
              <span>•</span>
              <span className="text-green-600 font-medium">Ready to send</span>
            </div>
          </div>
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
