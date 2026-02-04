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
            <div className="bg-blue-600/70 text-white px-4 py-3 flex items-center gap-2">
              <span className="text-lg">📝</span>
              <span className="font-semibold">Blog Post</span>
              <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded">Restaurant</span>
            </div>
            <img 
              src="/examples/restaurant-farm-to-table.png" 
              alt="Fresh vegetables on wooden table" 
              className="w-full aspect-video object-cover"
            />
            <div className="p-5 max-h-80 overflow-y-auto">
              <h4 className="font-bold text-gray-900 mb-2">Savor the Season: Discover Harvest Kitchen&apos;s New Farm-to-Table Spring Menu</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                As the flowers bloom and the weather warms up, nothing excites food lovers quite like the arrival of spring! At Harvest Kitchen in Austin, TX, we&apos;re thrilled to announce our new farm-to-table spring menu...
              </p>
              <p className="text-sm text-gray-700 font-semibold mb-1">## Fresh Ingredients, Bold Flavors</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                This spring, we&apos;ve partnered with local farmers to bring you the freshest produce and meats:
              </p>
              <ul className="text-sm text-gray-600 mb-2 ml-4 list-disc">
                <li>Seasonal Vegetables: asparagus, radishes, and spring peas</li>
                <li>Locally-Sourced Proteins: grass-fed beef, sustainable seafood</li>
                <li>House-Made Sauces and Dressings</li>
              </ul>
              <p className="text-sm text-gray-500 italic">
                Book your table today and let the flavors of spring inspire your dining experience!
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-3 pt-3 border-t">
                <span>~500 words</span>
                <span>•</span>
                <span>SEO optimized</span>
                <span>•</span>
                <span className="text-green-600">Ready to publish</span>
              </div>
            </div>
          </div>

          {/* Google Business Post Example - Fitness */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-600/70 text-white px-4 py-3 flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span className="font-semibold">Google Business</span>
              <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded">Fitness</span>
            </div>
            <img 
              src="/examples/fitness-gym.png" 
              alt="Modern gym with exercise equipment" 
              className="w-full aspect-video object-cover"
            />
            <div className="p-5">
              <p className="text-sm text-gray-700 leading-relaxed">
                🎉 Kickstart your fitness journey with a FREE personal training session at Iron Peak Gym! 💪 Limited spots available—don&apos;t miss out! Claim yours now by calling us or visiting our website!
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-3 pt-3 border-t">
                <span>186 characters</span>
                <span>•</span>
                <span>CTA: Learn More</span>
                <span>•</span>
                <span className="text-green-600">Ready to post</span>
              </div>
            </div>
          </div>

          {/* Email Newsletter Example - Real Estate */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-orange-600/70 text-white px-4 py-3 flex items-center gap-2">
              <span className="text-lg">📧</span>
              <span className="font-semibold">Email Newsletter</span>
              <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded">Real Estate</span>
            </div>
            <img 
              src="/examples/real-estate-home.png" 
              alt="Modern home exterior" 
              className="w-full aspect-video object-cover"
            />
            <div className="p-5 max-h-80 overflow-y-auto">
              <div className="bg-gray-100 rounded px-2 py-1 text-xs text-gray-600 mb-3 inline-block">
                Subject: What&apos;s Happening in Seattle&apos;s Housing Market This February?
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                Hi there,
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                As we step into February, we&apos;re excited to share some intriguing insights about the Seattle housing market. Whether you&apos;re considering buying, selling, or simply curious about local trends, staying informed can help you make the best decisions.
              </p>
              <ul className="text-sm text-gray-600 mb-2 ml-4 list-disc">
                <li><strong>Inventory Levels:</strong> More homes for sale, giving buyers more options</li>
                <li><strong>Home Prices:</strong> Stabilizing after steady growth</li>
                <li><strong>Interest Rates:</strong> Still competitive, but expected to fluctuate</li>
              </ul>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                Ready to explore your options? Reach out to us today!
              </p>
              <p className="text-sm text-gray-500 italic">
                Warm regards,<br/>The Westside Realty Team
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-3 pt-3 border-t">
                <span>~250 words</span>
                <span>•</span>
                <span className="text-green-600">Ready to send</span>
              </div>
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
