'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

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

interface GeneratedDemo {
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

// Social Pack Display Component - Image integrated into each post
function SocialPackDisplay({ pack, imageUrl }: { pack: SocialPackContent; imageUrl?: string }) {
  // Reusable post image component - show full image without awkward cropping
  const PostImage = ({ className = "" }: { className?: string }) => (
    <DemoImage 
      src={imageUrl} 
      className={`w-full rounded-lg`}
      containerClassName={`${className} bg-gray-100 rounded-lg overflow-hidden`}
    />
  )

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Twitter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-black text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          X/Twitter
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700 leading-relaxed"><TypeWriter text={pack.twitter.content} /></p>
          <PostImage className="mt-3" />
        </div>
      </div>
      
      {/* Facebook */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#1877F2] text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700 leading-relaxed"><TypeWriter text={pack.facebook.content} speed={15} /></p>
          <PostImage className="mt-3" />
        </div>
      </div>
      
      {/* Instagram - Image first (like real Instagram) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          Instagram
        </div>
        <div className="p-4">
          <PostImage className="mb-3" />
          <p className="text-sm text-gray-700 leading-relaxed"><TypeWriter text={pack.instagram.content} speed={15} /></p>
          <p className="text-xs text-blue-500 mt-2">{pack.instagram.hashtags}</p>
        </div>
      </div>
      
      {/* LinkedIn */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#0A66C2] text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          LinkedIn
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700 leading-relaxed"><TypeWriter text={pack.linkedin.content} speed={15} /></p>
          <PostImage className="mt-3" />
        </div>
      </div>

      {/* TikTok */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-black text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
          TikTok
        </div>
        <div className="p-4">
          <PostImage className="mb-3" />
          <p className="text-sm text-gray-700 leading-relaxed"><TypeWriter text={pack.tiktok.content} speed={15} /></p>
        </div>
      </div>

      {/* Nextdoor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#00B246] text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          Nextdoor
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700 leading-relaxed"><TypeWriter text={pack.nextdoor.content} speed={15} /></p>
          <PostImage className="mt-3" />
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
}

// Single Content Type Demo
export function SingleContentDemo({ contentType, title, description, compact = false, industry, autoGenerate = false, showIndustryBadge = false }: SingleDemoProps) {
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
        if (!silent) {
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
      case 'social-pack': return { bg: 'from-purple-600/70 to-purple-700/70', badge: 'bg-purple-100 text-purple-700' }
      case 'blog-post': return { bg: 'from-blue-600/70 to-blue-700/70', badge: 'bg-blue-100 text-blue-700' }
      case 'gmb-post': return { bg: 'from-green-600/70 to-green-700/70', badge: 'bg-green-100 text-green-700' }
      case 'email': return { bg: 'from-orange-600/70 to-orange-700/70', badge: 'bg-orange-100 text-orange-700' }
    }
  }

  const styles = getTypeStyles()

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Card - Always visible */}
        <div className={`bg-gradient-to-br ${styles.bg} rounded-2xl overflow-hidden`}>
          <div className={`${compact ? 'p-6' : 'p-8'} text-center`}>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-white/80 text-sm mb-4">{description}</p>
            
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => generateDemo()}
                disabled={isGenerating}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  isGenerating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl'
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
              <div className="mt-3">
                <DemoCounter usage={usage} />
              </div>
            )}
            {error && <p className="mt-3 text-red-200 text-sm">{error}</p>}
          </div>
        </div>

        {/* Generated Content - Shown below the card */}
        {demo && (
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
                  <SocialPackDisplay pack={demo.content as SocialPackContent} imageUrl={demo.imageUrl} />
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
              ? 'This was just generated by GeoSpark AI. Hit regenerate to see another business example — or start your free trial to create your own!'
              : 'See GeoSpark generate a complete social media pack — 6 platform-optimized posts with an AI image, in seconds.'
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
            <SocialPackDisplay pack={demo.content as SocialPackContent} imageUrl={demo.imageUrl} />
          )}
          
          <p className="text-center text-gray-500 text-sm mt-6">
            ↑ Generated in seconds — each post optimized for its platform's style and audience
          </p>
        </div>
      )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link 
            href="/demo" 
            className="inline-flex items-center gap-2 bg-white border-2 border-teal-500 text-teal-600 hover:bg-teal-50 px-8 py-4 rounded-xl text-lg font-semibold transition-all"
          >
            See All 4 Content Types + More Examples
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
