'use client'

import { useState } from 'react'

interface WelcomeModalProps {
  onComplete: () => void
}

const INDUSTRIES = [
  { value: 'Restaurant', label: 'Restaurant / Food Service' },
  { value: 'Plumber', label: 'Plumber' },
  { value: 'Electrician', label: 'Electrician' },
  { value: 'HVAC', label: 'HVAC / Heating & Cooling' },
  { value: 'Salon', label: 'Salon / Spa / Beauty' },
  { value: 'Dentist', label: 'Dentist / Dental Practice' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Landscaping', label: 'Landscaping / Lawn Care' },
  { value: 'Auto Repair', label: 'Auto Repair / Mechanic' },
  { value: 'Fitness', label: 'Fitness / Gym' },
  { value: 'Retail', label: 'Retail / Shop' },
  { value: 'Contractor', label: 'General Contractor' },
  { value: 'Cleaning', label: 'Cleaning Service' },
  { value: 'Photography', label: 'Photography' },
  { value: 'Consulting', label: 'Consulting / Professional Services' },
  { value: 'Other', label: 'Other' },
]

const REFERRAL_SOURCES = [
  { value: 'google', label: 'Google Search' },
  { value: 'social', label: 'Social Media' },
  { value: 'friend', label: 'Friend or Colleague' },
  { value: 'blog', label: 'Blog or Article' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'ad', label: 'Online Ad' },
  { value: 'other', label: 'Other' },
]

export default function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [referralSource, setReferralSource] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!businessName.trim()) {
      setError('Please enter your business name')
      return
    }
    if (!industry) {
      setError('Please select your industry')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName.trim(),
          industry,
          location: location.trim() || null,
          referral_source: referralSource || null,
        }),
      })

      if (response.ok) {
        onComplete()
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 px-8 py-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to GeoSpark!</h2>
          <p className="text-teal-100 text-sm">
            Let's personalize your experience in just 30 seconds
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <p className="text-gray-600 text-sm mb-6 text-center">
            We'll use this to create content that sounds authentically <em>you</em>.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                What's your business called? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., Joe's Pizza, Sunrise Dental"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                autoFocus
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                What type of business? <span className="text-red-500">*</span>
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white transition-all"
              >
                <option value="">Select your industry...</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Where are you located?
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Austin, TX"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            {/* How did you hear about us */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                How did you hear about us?
              </label>
              <select
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white transition-all"
              >
                <option value="">Select an option...</option>
                {REFERRAL_SOURCES.map(src => (
                  <option key={src.value} value={src.value}>{src.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full mt-6 px-6 py-3.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting up...
              </>
            ) : (
              <>
                Let's Create Content
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          {/* Settings note */}
          <p className="text-center text-xs text-gray-400 mt-4">
            You can always change this in Settings
          </p>
        </form>
      </div>
    </div>
  )
}
