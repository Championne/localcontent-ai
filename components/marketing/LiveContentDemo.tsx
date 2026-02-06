'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { GenerationProgress } from '@/components/ui/GenerationProgress'

// Reusable Demo Image component with loading/error handling
function DemoImage({ 
  src, 
  alt = "AI Generated", 
  className = "",
  containerClassName = "",
  showBadge = false 
}: { 
  src?: string
  alt?: string
  className?: string
  containerClassName?: string
  showBadge?: boolean
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  // Reset state when src changes
  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [src])

  if (!src || error) return null

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Loading placeholder */}
      {!loaded && (
        <div className={`bg-gray-100 animate-pulse flex items-center justify-center ${className}`} style={{ minHeight: '128px' }}>
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`${className} ${loaded ? '' : 'hidden'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {showBadge && loaded && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Generated
        </div>
      )}
    </div>
  )
}

// Industry options for demo
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

// Types for generated content
interface SocialPackContent {
  twitter: { content: string; charCount: number }
  facebook: { content: string; charCount: number }
  instagram: { content: string; hashtags: string; charCount: number }
  linkedin: { content: string; charCount: number }
  tiktok: { content: string; charCount: number }
  nextdoor: { content: string; charCount: number }
}

interface UsageInfo {
  demoCount: number
  remainingDemos: number
  hasEmail: boolean
  requiresEmail?: boolean
  requiresSignup?: boolean
  freeLimit: number
  emailLimit: number
}

export interface GeneratedDemo {
  success: boolean
  businessName: string
  industry: string
  topic: string
  contentType: string
  displayType: string
  content: string | SocialPackContent
  aiPowered: boolean
  usage?: UsageInfo
  imageUrl?: string
}

interface DemoError {
  error: string
  limitReached?: boolean
  requiresEmail?: boolean
  requiresSignup?: boolean
  demoCount?: number
  message?: string
}

// Email Capture Modal Component
function EmailCaptureModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  remainingAfterEmail = 5 
}: { 
  isOpen: boolean
  onClose: () => void
  onSubmit: (email: string) => Promise<void>
  remainingAfterEmail?: number
}) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      await onSubmit(email)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock {remainingAfterEmail} More Demos</h3>
          <p className="text-gray-600">
            You've seen what GeoSpark can do! Enter your email to get {remainingAfterEmail} more free demos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:bg-gray-300"
          >
            {isSubmitting ? 'Saving...' : 'Unlock More Demos'}
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            We'll send you tips on local marketing. Unsubscribe anytime.
          </p>
        </form>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Signup Prompt Modal
function SignupPromptModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">You've Used All Free Demos!</h3>
          <p className="text-gray-600 mb-4">
            Sign up free to generate <strong>unlimited content</strong> for your business. No credit card required.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/auth/signup"
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-center transition-colors"
          >
            Start Free 14-Day Trial
          </Link>
          <button
            onClick={onClose}
            className="block w-full text-gray-500 hover:text-gray-700 py-2 text-sm"
          >
            Maybe later
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Demo Counter Badge
function DemoCounter({ usage }: { usage: UsageInfo | null }) {
  if (!usage) return null
  
  const { demoCount, remainingDemos, hasEmail, freeLimit, emailLimit } = usage
  const totalUsed = demoCount
  const totalLimit = hasEmail ? emailLimit : freeLimit
  
  return (
    <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm shadow-sm border border-gray-200">
      <div className="flex gap-1">
        {[...Array(totalLimit)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < totalUsed ? 'bg-teal-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-gray-600 font-medium">
        {remainingDemos} demo{remainingDemos !== 1 ? 's' : ''} left
      </span>
      {!hasEmail && demoCount > 0 && (
        <span className="text-teal-600 text-xs">
          +5 with email
        </span>
      )}
    </div>
  )
}

// Regenerate Button Component
function RegenerateButton({ 
  onClick, 
  isGenerating,
  hasContent 
}: { 
  onClick: () => void
  isGenerating: boolean
  hasContent: boolean
}) {
  if (!hasContent) return null
  
  return (
    <button
      onClick={onClick}
      disabled={isGenerating}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isGenerating
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 border border-gray-200 shadow-sm'
      }`}
    >
      <svg className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {isGenerating ? 'Regenerating...' : 'Regenerate'}
    </button>
  )
}

// Typing effect component
function TypeWriter({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  
  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1))
        i++
      } else {
        setIsComplete(true)
        clearInterval(timer)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])
  
  return (
    <span>
      {displayedText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  )
}

// Social Pack Display Component - Realistic platform mockups matching dashboard
function SocialPackDisplay({ pack, imageUrl, businessName = 'Local Business', industry = 'Business' }: { pack: SocialPackContent; imageUrl?: string; businessName?: string; industry?: string }) {
  const businessInitial = businessName.charAt(0).toUpperCase()
  const handle = businessName.toLowerCase().replace(/\s+/g, '')

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* X/Twitter - Realistic Mockup */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {businessInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-900 text-sm truncate">{businessName}</span>
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/></svg>
              </div>
              <span className="text-gray-500 text-sm">@{handle} · 1m</span>
              <p className="mt-2 text-gray-900 text-[15px] leading-relaxed"><TypeWriter text={pack.twitter.content} /></p>
              {imageUrl && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
                  <DemoImage src={imageUrl} className="w-full" containerClassName="w-full" />
                </div>
              )}
              <div className="flex justify-between mt-3 text-gray-500 max-w-[280px]">
                <span className="flex items-center gap-1 text-xs"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>12</span>
                <span className="flex items-center gap-1 text-xs"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>48</span>
                <span className="flex items-center gap-1 text-xs"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>156</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Facebook - Realistic Mockup */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {businessInitial}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-[15px]">{businessName}</div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>Just now</span>
                <span>·</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/></svg>
              </div>
            </div>
          </div>
          <p className="text-gray-900 text-[15px] leading-relaxed mb-3"><TypeWriter text={pack.facebook.content} speed={15} /></p>
          {imageUrl && (
            <div className="-mx-4 mb-3">
              <DemoImage src={imageUrl} className="w-full" containerClassName="w-full" />
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-gray-500 pb-2 border-b border-gray-100">
            <span className="flex -space-x-1">
              <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px]">👍</span>
              <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px]">❤️</span>
            </span>
            <span className="ml-1">24</span>
          </div>
          <div className="flex justify-around pt-2 text-gray-600 text-sm">
            <span className="flex items-center gap-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>Like</span>
            <span className="flex items-center gap-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>Comment</span>
            <span className="flex items-center gap-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>Share</span>
          </div>
        </div>
      </div>
      
      {/* Instagram - Realistic Mockup */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700">
                {businessInitial}
              </div>
            </div>
            <span className="font-semibold text-sm text-gray-900">{handle}</span>
          </div>
          <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>
        </div>
        {imageUrl ? (
          <DemoImage src={imageUrl} className="w-full aspect-square object-cover" containerClassName="w-full" />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center">
            <span className="text-4xl">📸</span>
          </div>
        )}
        <div className="p-3">
          <div className="flex justify-between mb-3">
            <div className="flex gap-4">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </div>
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
          </div>
          <div className="font-semibold text-sm text-gray-900 mb-1">127 likes</div>
          <p className="text-sm text-gray-900"><span className="font-semibold">{handle}</span> <TypeWriter text={pack.instagram.content} speed={15} /></p>
          <p className="text-sm text-blue-900 mt-1">{pack.instagram.hashtags}</p>
        </div>
      </div>
      
      {/* LinkedIn - Realistic Mockup */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="flex gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold">
              {businessInitial}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{businessName}</div>
              <div className="text-xs text-gray-500">Local {industry} Expert</div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <span>1h</span>
                <span>·</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/></svg>
              </div>
            </div>
          </div>
          <p className="text-gray-900 text-sm leading-relaxed mb-3"><TypeWriter text={pack.linkedin.content} speed={15} /></p>
          {imageUrl && (
            <div className="-mx-4 mb-3">
              <DemoImage src={imageUrl} className="w-full" containerClassName="w-full" />
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500 pb-3 border-b border-gray-100">
            <span className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px]">👍</span>
              <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px]">👏</span>
              <span className="w-4 h-4 rounded-full bg-red-400 flex items-center justify-center text-white text-[8px]">❤️</span>
            </span>
            <span>42</span>
            <span className="ml-auto">8 comments</span>
          </div>
          <div className="flex justify-around pt-2 text-gray-600 text-sm">
            <span className="flex items-center gap-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>Like</span>
            <span className="flex items-center gap-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>Comment</span>
            <span className="flex items-center gap-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Repost</span>
          </div>
        </div>
      </div>

      {/* TikTok - Realistic Mockup */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="relative">
          {imageUrl ? (
            <DemoImage src={imageUrl} className="w-full aspect-[9/12] object-cover" containerClassName="w-full" />
          ) : (
            <div className="w-full aspect-[9/12] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-6xl">🎵</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="font-semibold text-white text-sm mb-1">@{handle}</div>
                <p className="text-white text-sm leading-relaxed"><TypeWriter text={pack.tiktok.content} speed={15} /></p>
                <div className="flex items-center gap-2 mt-2 text-white/80 text-xs">
                  <span>🎵</span>
                  <span className="truncate">Original sound - {businessName}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 text-white">
                <div className="text-center"><svg className="w-7 h-7 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12.1 18.55l-.1.1-.11-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04 1 3.57 2.36h1.86C13.46 6 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg><span className="text-xs">2.4K</span></div>
                <div className="text-center"><svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg><span className="text-xs">89</span></div>
                <div className="text-center"><svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg><span className="text-xs">Share</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nextdoor - Realistic Mockup */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-green-600 px-4 py-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/></svg>
          <span className="text-white font-semibold text-sm">Nextdoor</span>
        </div>
        <div className="p-4">
          <div className="flex gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
              {businessInitial}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{businessName}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span className="text-green-600">✓ Verified Business</span>
                <span>·</span>
                <span>Your neighborhood</span>
              </div>
            </div>
          </div>
          <p className="text-gray-900 text-sm leading-relaxed mb-3"><TypeWriter text={pack.nextdoor.content} speed={15} /></p>
          {imageUrl && (
            <div className="rounded-lg overflow-hidden mb-3">
              <DemoImage src={imageUrl} className="w-full" containerClassName="w-full" />
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>Thank</span>
            <span className="flex items-center gap-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>Reply</span>
            <span className="flex items-center gap-1 ml-auto"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>Share</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Blog Post Display Component - Matches dashboard styling
function BlogPostDisplay({ content, imageUrl, businessName }: { content: string; imageUrl?: string; businessName: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Hero Image */}
      {imageUrl && (
        <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-50">
          <DemoImage 
            src={imageUrl} 
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      
      {/* Content */}
      <div className="p-6">
        <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-2xl prose-h1:mb-4 prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100 prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-gray-900 prose-ul:my-3 prose-li:text-gray-600">
          <TypeWriter text={content} speed={3} />
        </div>
        
        {/* Author Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{businessName}</p>
            <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
      
      {/* Footer Stats */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-500">
        <span>~600 words</span>
        <span>•</span>
        <span>SEO optimized</span>
        <span>•</span>
        <span className="text-green-600 font-medium">Ready to publish</span>
      </div>
    </div>
  )
}

// Google Business Post Display Component - Matches dashboard styling
function GMBPostDisplay({ content, imageUrl, businessName }: { content: string; imageUrl?: string; businessName: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Google Business Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-lg">
          {businessName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{businessName}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <span className="text-green-600">✓ Verified</span>
            <span>•</span>
            <span>Just now</span>
          </div>
        </div>
        <img src="/google-g.svg" alt="" className="w-6 h-6 opacity-60" onError={(e) => e.currentTarget.style.display = 'none'} />
      </div>
      
      {/* Image */}
      {imageUrl && (
        <DemoImage 
          src={imageUrl} 
          className="w-full aspect-video object-cover"
          containerClassName="w-full"
        />
      )}
      
      {/* Content */}
      <div className="p-4">
        <p className="text-gray-700 leading-relaxed text-sm">
          <TypeWriter text={content} speed={8} />
        </p>
        
        {/* CTA Button */}
        <button className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
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
  )
}

// Email Newsletter Display Component - Matches dashboard styling
function EmailDisplay({ content, imageUrl, businessName }: { content: string; imageUrl?: string; businessName: string }) {
  // Extract subject line from content if it starts with "Subject:"
  const lines = content.split('\n')
  const subjectLine = lines[0]?.toLowerCase().startsWith('subject:') 
    ? lines[0].replace(/^subject:\s*/i, '') 
    : `Update from ${businessName}`
  const bodyContent = lines[0]?.toLowerCase().startsWith('subject:') 
    ? lines.slice(1).join('\n').trim() 
    : content
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Email Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm">{businessName}</div>
            <div className="text-xs text-gray-500 truncate">to: subscriber@email.com</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
          <span className="text-xs text-gray-500">Subject: </span>
          <span className="text-sm font-medium text-gray-900">{subjectLine}</span>
        </div>
      </div>
      
      {/* Image */}
      {imageUrl && (
        <DemoImage 
          src={imageUrl} 
          className="w-full aspect-video object-cover"
          containerClassName="w-full"
        />
      )}
      
      {/* Email Body */}
      <div className="p-6">
        <div className="prose prose-sm max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-3 prose-strong:text-gray-900 prose-ul:my-3 prose-li:text-gray-600">
          <TypeWriter text={bodyContent} speed={5} />
        </div>
        
        {/* CTA Button */}
        <div className="mt-6 text-center">
          <button className="px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors">
            Learn More
          </button>
        </div>
        
        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>Sent with ❤️ from {businessName}</p>
          <p className="mt-1">Unsubscribe | Update preferences</p>
        </div>
      </div>
      
      {/* Stats Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-500">
        <span>~250 words</span>
        <span>•</span>
        <span>Mobile optimized</span>
        <span>•</span>
        <span className="text-green-600 font-medium">Ready to send</span>
      </div>
    </div>
  )
}

// Single content type demo props
interface SingleDemoProps {
  contentType: 'social-pack' | 'blog-post' | 'gmb-post' | 'email'
  title: string
  description: string
  compact?: boolean
  industry?: string
  autoGenerate?: boolean // Auto-generate on mount (for static examples)
  showIndustryBadge?: boolean // Show industry badge in header
  /** When set, generated result is not rendered here; parent should render it in a full-width area */
  onGenerated?: (data: GeneratedDemo) => void
}

// Single Content Type Demo
export function SingleContentDemo({ contentType, title, description, compact = false, industry, autoGenerate = false, showIndustryBadge = false, onGenerated }: SingleDemoProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [demo, setDemo] = useState<GeneratedDemo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [hasAutoGenerated, setHasAutoGenerated] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  
  // Auto-generate on mount if enabled
  useEffect(() => {
    if (autoGenerate && !hasAutoGenerated && !demo && !isGenerating) {
      setHasAutoGenerated(true)
      // Small delay to allow page to render
      const timer = setTimeout(() => {
        generateDemoInternal(false, true) // silent mode - no scrolling
      }, 500 + Math.random() * 1000) // Stagger the requests
      return () => clearTimeout(timer)
    }
  }, [autoGenerate, hasAutoGenerated, demo, isGenerating])
  
  const generateDemoInternal = async (hasEmail = false, silent = false) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/demo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, hasEmail, industry })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setDemo(data)
        if (data.usage) setUsage(data.usage)
        if (onGenerated) onGenerated(data)
        else if (!silent) {
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }, 100)
        }
      } else {
        // Handle limit errors - but silently for auto-generate
        if (!silent) {
          const errorData = data as DemoError
          if (errorData.requiresEmail) {
            setShowEmailModal(true)
          } else if (errorData.requiresSignup) {
            setShowSignupModal(true)
          } else {
            setError(errorData.message || errorData.error || 'Something went wrong')
          }
        }
        if (data.demoCount !== undefined) {
          setUsage(prev => prev ? { ...prev, demoCount: data.demoCount! } : null)
        }
      }
    } catch (err) {
      if (!silent) {
        setError('Failed to generate. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const generateDemo = async (hasEmail = false) => {
    await generateDemoInternal(hasEmail, false)
  }

  const handleEmailSubmit = async (email: string) => {
    const response = await fetch('/api/demo/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    
    const data = await response.json()
    if (data.success) {
      setShowEmailModal(false)
      if (data.usage) setUsage(data.usage)
      // Now generate with email flag
      generateDemo(true)
    } else {
      throw new Error(data.error)
    }
  }

  const getTypeStyles = () => {
    switch (contentType) {
      case 'social-pack': return { 
        gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
        glow: 'shadow-purple-500/25',
        icon: '📱',
        badge: 'bg-purple-100 text-purple-700',
        accent: 'bg-purple-400'
      }
      case 'blog-post': return { 
        gradient: 'from-blue-600 via-indigo-600 to-violet-600',
        glow: 'shadow-blue-500/25',
        icon: '📝',
        badge: 'bg-blue-100 text-blue-700',
        accent: 'bg-blue-400'
      }
      case 'gmb-post': return { 
        gradient: 'from-emerald-500 via-green-500 to-teal-500',
        glow: 'shadow-green-500/25',
        icon: '📍',
        badge: 'bg-green-100 text-green-700',
        accent: 'bg-green-400'
      }
      case 'email': return { 
        gradient: 'from-orange-500 via-amber-500 to-yellow-500',
        glow: 'shadow-orange-500/25',
        icon: '📧',
        badge: 'bg-orange-100 text-orange-700',
        accent: 'bg-orange-400'
      }
    }
  }

  const styles = getTypeStyles()

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Card - Always visible */}
        <div className={`relative bg-gradient-to-br ${styles.gradient} rounded-3xl overflow-hidden shadow-xl ${styles.glow} hover:shadow-2xl transition-all duration-300 group`}>
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Glowing orbs */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 ${styles.accent} rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity`} />
            <div className={`absolute -bottom-20 -left-20 w-40 h-40 ${styles.accent} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-10" style={{ 
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />
          </div>
          
          <div className={`relative ${compact ? 'p-6' : 'p-8'} text-center`}>
            {/* Icon */}
            <div className="text-4xl mb-3 drop-shadow-lg">{styles.icon}</div>
            
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow-sm">{title.replace(/^[^\s]+\s/, '')}</h3>
            <p className="text-white/80 text-sm mb-6 max-w-xs mx-auto leading-relaxed">{description}</p>
            
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => generateDemo()}
                disabled={isGenerating}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform ${
                  isGenerating
                    ? 'bg-white/20 text-white/60 cursor-not-allowed backdrop-blur-sm'
                    : 'bg-white text-gray-900 hover:bg-gray-50 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : demo ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Example
                  </>
                )}
              </button>
            </div>
            {usage && (
              <div className="mt-4">
                <DemoCounter usage={usage} />
              </div>
            )}
            {error && <p className="mt-3 text-red-200 text-sm bg-red-500/20 backdrop-blur-sm rounded-lg px-3 py-2">{error}</p>}
          </div>
        </div>

        {/* Progress Bar - Shown while generating */}
        {isGenerating && (
          <div className="mt-4">
            <GenerationProgress 
              isGenerating={isGenerating} 
              contentType={contentType}
              size="md"
            />
          </div>
        )}

        {/* Generated Content - Shown below the card when parent does not render it */}
        {demo && !onGenerated && (
          <div ref={resultRef} className="mt-6">
            {contentType === 'social-pack' && typeof demo.content === 'object' ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles.badge}`}>
                    {demo.displayType}
                  </span>
                  <span className="text-sm text-gray-500">{demo.businessName} • {demo.industry}</span>
                </div>
                <div className="p-4">
                  <SocialPackDisplay pack={demo.content as SocialPackContent} imageUrl={demo.imageUrl} businessName={demo.businessName} industry={demo.industry} />
                </div>
              </div>
            ) : contentType === 'blog-post' ? (
              <BlogPostDisplay 
                content={demo.content as string} 
                imageUrl={demo.imageUrl} 
                businessName={demo.businessName}
              />
            ) : contentType === 'gmb-post' ? (
              <GMBPostDisplay 
                content={demo.content as string} 
                imageUrl={demo.imageUrl} 
                businessName={demo.businessName}
              />
            ) : contentType === 'email' ? (
              <EmailDisplay 
                content={demo.content as string} 
                imageUrl={demo.imageUrl} 
                businessName={demo.businessName}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Modals */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        remainingAfterEmail={5}
      />
      <SignupPromptModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
      />
    </>
  )
}

const BADGE_BY_CONTENT_TYPE: Record<string, string> = {
  'social-pack': 'bg-purple-100 text-purple-700',
  'blog-post': 'bg-blue-100 text-blue-700',
  'gmb-post': 'bg-green-100 text-green-700',
  email: 'bg-orange-100 text-orange-700',
}

/** Renders generated demo result (for use in parent, e.g. full-width below cards). */
export function DemoResultView({
  contentType,
  demo,
  className = '',
}: {
  contentType: 'social-pack' | 'blog-post' | 'gmb-post' | 'email'
  demo: GeneratedDemo
  className?: string
}) {
  const badgeClass = BADGE_BY_CONTENT_TYPE[contentType] ?? 'bg-gray-100 text-gray-700'
  return (
    <div className={className}>
      {contentType === 'social-pack' && typeof demo.content === 'object' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeClass}`}>
              {demo.displayType}
            </span>
            <span className="text-sm text-gray-500">{demo.businessName} • {demo.industry}</span>
          </div>
          <div className="p-4">
            <SocialPackDisplay pack={demo.content as SocialPackContent} imageUrl={demo.imageUrl} businessName={demo.businessName} industry={demo.industry} />
          </div>
        </div>
      ) : contentType === 'blog-post' ? (
        <BlogPostDisplay
          content={demo.content as string}
          imageUrl={demo.imageUrl}
          businessName={demo.businessName}
        />
      ) : contentType === 'gmb-post' ? (
        <GMBPostDisplay
          content={demo.content as string}
          imageUrl={demo.imageUrl}
          businessName={demo.businessName}
        />
      ) : contentType === 'email' ? (
        <EmailDisplay
          content={demo.content as string}
          imageUrl={demo.imageUrl}
          businessName={demo.businessName}
        />
      ) : null}
    </div>
  )
}

// Full Demo Section for Landing Page (Social Pack Only)
export function LandingPageDemo() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [demo, setDemo] = useState<GeneratedDemo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [hasAutoGenerated, setHasAutoGenerated] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState('random')
  const resultRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Auto-generate when section scrolls into view
  useEffect(() => {
    if (hasAutoGenerated) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Trigger when at least 30% of section is visible
        if (entry.isIntersecting && !hasAutoGenerated && !demo && !isGenerating) {
          setHasAutoGenerated(true)
          // Small delay so user sees the "Watch AI Create" state first
          setTimeout(() => {
            generateDemoInternal(false, true)
          }, 300)
        }
      },
      { threshold: 0.3 } // Trigger when 30% visible
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [hasAutoGenerated, demo, isGenerating])

  const generateDemoInternal = async (hasEmail = false, autoGenerate = false, industry?: string) => {
    setIsGenerating(true)
    setError(null)
    
    // Use provided industry or selectedIndustry state (but not for auto-generate, use random)
    const industryToUse = autoGenerate ? undefined : (industry || (selectedIndustry !== 'random' ? selectedIndustry : undefined))
    
    try {
      const response = await fetch('/api/demo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'social-pack', hasEmail, industry: industryToUse })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setDemo(data)
        if (data.usage) setUsage(data.usage)
        // Only scroll if user clicked the button (not auto-generated)
        if (!autoGenerate) {
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 100)
        }
      } else {
        // Handle limit errors (but not for auto-generate)
        if (!autoGenerate) {
          const errorData = data as DemoError
          if (errorData.requiresEmail) {
            setShowEmailModal(true)
          } else if (errorData.requiresSignup) {
            setShowSignupModal(true)
          } else {
            setError(errorData.message || errorData.error || 'Something went wrong')
          }
        }
      }
    } catch (err) {
      if (!autoGenerate) {
        setError('Failed to generate. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Wrapper for user-triggered generation
  const generateDemo = (hasEmail = false) => {
    generateDemoInternal(hasEmail, false)
  }

  const handleEmailSubmit = async (email: string) => {
    const response = await fetch('/api/demo/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    
    const data = await response.json()
    if (data.success) {
      setShowEmailModal(false)
      if (data.usage) setUsage(data.usage)
      generateDemo(true)
    } else {
      throw new Error(data.error)
    }
  }

  return (
    <>
      <section ref={sectionRef} id="examples" className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">See It In Action</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            {demo ? 'Real AI-Generated Content' : 'Watch AI Create Content in Real-Time'}
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            {demo 
              ? 'This was just generated by GeoSpark AI. Hit regenerate to see another business example, or start your free trial to create your own!'
              : 'See GeoSpark generate a complete social media pack: 6 platform-optimized posts with a matching image, in seconds.'
            }
          </p>
          
          {/* Industry Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose your industry:
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full max-w-xs mx-auto block px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none cursor-pointer"
            >
              {INDUSTRY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => generateDemo()}
            disabled={isGenerating}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg ${
              isGenerating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-xl hover:shadow-orange-500/25'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                AI is writing 6 posts...
              </>
            ) : demo ? (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Social Media Pack
              </>
            )}
          </button>
          
          {usage && (
            <div className="mt-4">
              <DemoCounter usage={usage} />
            </div>
          )}
          
          {/* Progress Bar */}
          {isGenerating && (
            <div className="mt-6 max-w-md mx-auto">
              <GenerationProgress 
                isGenerating={isGenerating} 
                contentType="social-pack"
                size="lg"
              />
            </div>
          )}
          
          {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>

      {/* Generated Result */}
      {demo && (
        <div ref={resultRef} className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                    Social Media Pack
                  </span>
                  <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs font-medium">
                    AI Generated
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{demo.businessName}</h3>
                <p className="text-sm text-gray-600">{demo.industry} • "{demo.topic}"</p>
              </div>
              <button
                onClick={() => generateDemo()}
                disabled={isGenerating}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isGenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
          </div>
          
          {typeof demo.content === 'object' && (
            <SocialPackDisplay pack={demo.content as SocialPackContent} imageUrl={demo.imageUrl} businessName={demo.businessName} industry={demo.industry} />
          )}
          
          <p className="text-center text-gray-500 text-sm mt-6">
            ↑ Generated in seconds. Each post optimized for its platform's style and audience.
          </p>
        </div>
      )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link 
            href="/demo" 
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
          >
            Explore all content types
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Modals */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        remainingAfterEmail={5}
      />
      <SignupPromptModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
      />
    </>
  )
}
