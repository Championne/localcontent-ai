'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

interface SocialPackResult {
  twitter: { content: string; charCount: number }
  facebook: { content: string; charCount: number }
  instagram: { content: string; hashtags: string; charCount: number }
  linkedin: { content: string; charCount: number }
  tiktok: { content: string; charCount: number }
  nextdoor: { content: string; charCount: number }
}

interface GeneratedImage {
  url: string
  style: string
  generatedAt: string
}

interface Business {
  id: string
  name: string
  industry: string | null
}

// Image style definitions (must match backend)
const IMAGE_STYLES = {
  promotional: {
    name: 'Promotional',
    description: 'Bold graphics for sales and offers',
    keywords: ['sale', 'discount', 'off', 'special', 'deal', 'offer', 'limited', 'save', 'price', 'free']
  },
  professional: {
    name: 'Professional',
    description: 'Clean, polished images',
    keywords: ['tips', 'how to', 'guide', 'advice', 'learn', 'info', 'update', 'news', 'service']
  },
  friendly: {
    name: 'Friendly',
    description: 'Warm, approachable illustrations',
    keywords: ['thank', 'welcome', 'community', 'team', 'family', 'customer', 'appreciate', 'love']
  },
  seasonal: {
    name: 'Seasonal',
    description: 'Holiday themed graphics',
    keywords: ['holiday', 'christmas', 'summer', 'spring', 'fall', 'winter', 'new year', 'valentine', 'easter', 'thanksgiving', 'halloween']
  }
} as const

type ImageStyleKey = keyof typeof IMAGE_STYLES

function detectBestStyle(topic: string): ImageStyleKey {
  const topicLower = topic.toLowerCase()
  for (const [style, config] of Object.entries(IMAGE_STYLES)) {
    if (config.keywords.some(kw => topicLower.includes(kw))) {
      return style as ImageStyleKey
    }
  }
  return 'professional'
}

export default function CreateContentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [socialPack, setSocialPack] = useState<SocialPackResult | null>(null)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  
  // View mode for blog content (preview vs edit)
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview')
  const contentPreviewRef = useRef<HTMLDivElement>(null)
  
  // Regenerate dropdown menu
  const [regenerateMenuOpen, setRegenerateMenuOpen] = useState(false)
  
  // Image generation options
  const [generateImageFlag, setGenerateImageFlag] = useState(false)
  const [imageStyle, setImageStyle] = useState<ImageStyleKey>('professional')
  const [imagesRemaining, setImagesRemaining] = useState<number | null>(null)

  // Fetch user's business on mount (for pre-filling)
  useEffect(() => {
    async function fetchBusiness() {
      try {
        const response = await fetch('/api/business')
        if (response.ok) {
          const data = await response.json()
          if (data.businesses && data.businesses.length > 0) {
            const business = data.businesses[0] as Business
            setBusinessName(business.name || '')
            setIndustry(business.industry || '')
          }
        }
      } catch (err) {
        // Silently fail - user can enter manually
        console.error('Failed to fetch business:', err)
      }
    }
    fetchBusiness()
  }, [])

  // Auto-detect best image style when topic changes
  useEffect(() => {
    if (topic) {
      setImageStyle(detectBestStyle(topic))
    }
  }, [topic])

  const templates = [
    { 
      id: 'blog-post', 
      name: 'Blog Post', 
      description: 'SEO-optimized blog article for your website',
      color: 'teal',
      time: '~30 sec'
    },
    { 
      id: 'social-pack', 
      name: 'Social Media Pack', 
      description: '6 optimized posts for all major platforms',
      color: 'orange',
      badge: '6 platforms',
      popular: true,
      time: '~45 sec'
    },
    { 
      id: 'gmb-post', 
      name: 'Google Business Post', 
      description: 'Updates, offers, or events for your GMB profile',
      color: 'blue',
      time: '~20 sec'
    },
    { 
      id: 'email', 
      name: 'Email Newsletter', 
      description: 'Professional email content for your customers',
      color: 'purple',
      time: '~30 sec'
    },
  ]

  // Quick-start scenarios
  const quickStarts = [
    { 
      id: 'promotion',
      icon: '🏷️',
      label: 'Running a promotion?',
      template: 'social-pack',
      topic: 'Special limited-time offer'
    },
    { 
      id: 'traffic',
      icon: '📈',
      label: 'Need more website traffic?',
      template: 'blog-post',
      topic: 'Expert tips and advice'
    },
    { 
      id: 'feedback',
      icon: '⭐',
      label: 'Got great feedback?',
      template: 'gmb-post',
      topic: 'Customer success story'
    },
  ]

  const platformInfo: Record<string, { name: string; icon: JSX.Element; color: string; bgColor: string; optimal: string }> = {
    twitter: {
      name: 'X (Twitter)',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
      color: 'text-gray-900',
      bgColor: 'bg-gray-100',
      optimal: '71-100 chars'
    },
    facebook: {
      name: 'Facebook',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      optimal: '40-80 chars'
    },
    instagram: {
      name: 'Instagram',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
      color: 'text-pink-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      optimal: '138 + hashtags'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      optimal: '150 chars visible'
    },
    tiktok: {
      name: 'TikTok',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
      color: 'text-gray-900',
      bgColor: 'bg-gray-50',
      optimal: '100-150 chars'
    },
    nextdoor: {
      name: 'Nextdoor',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      optimal: '200-400 chars'
    }
  }

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, { bg: string; border: string; icon: string }> = {
      teal: {
        bg: isSelected ? 'bg-teal-50' : 'bg-white',
        border: isSelected ? 'border-teal-500' : 'border-gray-200 hover:border-teal-300',
        icon: 'bg-teal-100 text-teal-600'
      },
      orange: {
        bg: isSelected ? 'bg-orange-50' : 'bg-white',
        border: isSelected ? 'border-orange-500' : 'border-gray-200 hover:border-orange-300',
        icon: 'bg-orange-100 text-orange-600'
      },
      blue: {
        bg: isSelected ? 'bg-blue-50' : 'bg-white',
        border: isSelected ? 'border-blue-500' : 'border-gray-200 hover:border-blue-300',
        icon: 'bg-blue-100 text-blue-600'
      },
      purple: {
        bg: isSelected ? 'bg-purple-50' : 'bg-white',
        border: isSelected ? 'border-purple-500' : 'border-gray-200 hover:border-purple-300',
        icon: 'bg-purple-100 text-purple-600'
      }
    }
    return colors[color] || colors.teal
  }

  const handleQuickStart = (quickStart: typeof quickStarts[0]) => {
    setSelectedTemplate(quickStart.template)
    setTopic(quickStart.topic)
    setStep(2)
  }

  const handleGenerate = async (mode: 'all' | 'text' | 'image' = 'all') => {
    setGenerating(true)
    setError('')
    setRegenerateMenuOpen(false)
    
    // Only clear image if regenerating all or image
    if (mode === 'all' || mode === 'image') {
      setGeneratedImage(null)
    }
    
    setViewMode('preview') // Reset to preview mode on new generation
    
    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          businessName,
          industry,
          topic,
          tone,
          generateImageFlag: mode === 'text' ? false : generateImageFlag,
          imageStyle,
          regenerateMode: mode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content')
      }

      // Only update content if we're regenerating all or text
      if (mode === 'all' || mode === 'text') {
        if (selectedTemplate === 'social-pack') {
          setSocialPack(data.socialPack)
        } else {
          setGeneratedContent(data.content)
        }
      }
      
      if (data.image) {
        setGeneratedImage(data.image)
      }
      
      if (data.usage) {
        setImagesRemaining(data.usage.imagesRemaining)
      }
      
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const content = selectedTemplate === 'social-pack' 
        ? JSON.stringify(socialPack) 
        : generatedContent

      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          title: topic,
          content,
          metadata: { businessName, industry, tone, type: selectedTemplate },
          status: 'draft',
          image_url: generatedImage?.url || null,
          image_style: generatedImage?.style || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save content')
      }

      router.push('/dashboard/library')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = (text: string, platform?: string) => {
    navigator.clipboard.writeText(text)
    setCopied(platform || 'main')
    setTimeout(() => setCopied(''), 2000)
  }

  // Copy formatted content (rich text) for blog posts
  const handleCopyFormatted = async () => {
    if (!contentPreviewRef.current) return
    
    try {
      const html = contentPreviewRef.current.innerHTML
      const text = generatedContent
      
      // Use the Clipboard API to copy both HTML and plain text
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ])
      
      setCopied('formatted')
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      // Fallback to plain text if rich text copy fails
      navigator.clipboard.writeText(generatedContent)
      setCopied('formatted')
      setTimeout(() => setCopied(''), 2000)
    }
  }

  const handleDownloadImage = () => {
    if (generatedImage?.url) {
      const link = document.createElement('a')
      link.href = generatedImage.url
      link.download = `geospark-image-${Date.now()}.png`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'blog-post':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )
      case 'social-pack':
        return (
          <div className="flex items-center gap-0.5">
            {/* X/Twitter */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            {/* Facebook */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            {/* Instagram */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </div>
        )
      case 'gmb-post':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case 'email':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Content</h1>
        <p className="text-gray-500">Generate AI-powered, locally-optimized content in minutes</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className={`flex items-center ${step >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {step > 1 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : '1'}
          </div>
          <span className="ml-3 font-medium hidden sm:block">Template</span>
        </div>
        <div className={`flex-1 h-1 mx-4 rounded ${step >= 2 ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {step > 2 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : '2'}
          </div>
          <span className="ml-3 font-medium hidden sm:block">Details</span>
        </div>
        <div className={`flex-1 h-1 mx-4 rounded ${step >= 3 ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 3 ? 'text-teal-600' : 'text-gray-400'}`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium ${step >= 3 ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'}`}>3</div>
          <span className="ml-3 font-medium hidden sm:block">Review</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Step 1: Choose Template */}
      {step === 1 && (
        <div>
          {/* Inspiring Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              What will you spark today?
              <svg className="w-7 h-7 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </h2>
            <p className="text-gray-500">Create content that connects with your community</p>
          </div>

          {/* Quick Starts */}
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-600 mb-3">
              Quick starts
            </p>
            <div className="flex flex-wrap gap-3">
              {quickStarts.map((qs) => (
                <button
                  key={qs.id}
                  onClick={() => handleQuickStart(qs)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-teal-400 hover:bg-teal-50 transition-all hover:shadow-md"
                >
                  <span>{qs.icon}</span>
                  {qs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template Cards */}
          <p className="text-sm text-gray-500 mb-4">Or choose a content type:</p>
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map((template) => {
              const colors = getColorClasses(template.color, selectedTemplate === template.id)
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    setStep(2)
                  }}
                  className={`p-5 border-2 rounded-xl text-left transition-all duration-200 ${colors.bg} ${colors.border} relative hover:-translate-y-1 hover:shadow-lg`}
                >
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {template.popular && (
                      <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-medium rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        Most Popular
                      </span>
                    )}
                    {template.badge && (
                      <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full">
                        {template.badge}
                      </span>
                    )}
                  </div>

                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${colors.icon}`}>
                    {getTemplateIcon(template.id)}
                  </div>
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  
                  {/* Time Estimate */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Ready in {template.time}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 2: Add Details */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Tell us about your content</h2>
          <p className="text-gray-500 mb-6">This helps our AI create personalized, locally-relevant content</p>
          <div className="space-y-5 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                placeholder="e.g., Joe's Plumbing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow bg-white"
              >
                <option value="">Select your industry...</option>
                <option value="Restaurant">Restaurant / Food Service</option>
                <option value="Plumber">Plumber</option>
                <option value="Electrician">Electrician</option>
                <option value="HVAC">HVAC / Heating & Cooling</option>
                <option value="Salon">Salon / Spa / Beauty</option>
                <option value="Dentist">Dentist / Dental Practice</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Landscaping">Landscaping / Lawn Care</option>
                <option value="Auto Repair">Auto Repair / Mechanic</option>
                <option value="Fitness">Fitness / Gym</option>
                <option value="Retail">Retail / Shop</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What should the content be about?</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow resize-none"
                placeholder="e.g., Spring cleaning tips for homeowners, our new seasonal menu, 20% off promotion this week..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Writing Tone</label>
              <div className="grid grid-cols-2 gap-3">
                {['professional', 'friendly'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-4 py-2.5 border-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      tone === t 
                        ? 'border-teal-500 bg-teal-50 text-teal-700' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Generation Option */}
            <div className="border-t border-gray-100 pt-5 mt-5">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="generateImage"
                  checked={generateImageFlag}
                  onChange={(e) => setGenerateImageFlag(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <label htmlFor="generateImage" className="block text-sm font-medium text-gray-700 cursor-pointer">
                    Generate matching image
                    {imagesRemaining !== null && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({imagesRemaining} remaining this month)
                      </span>
                    )}
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">AI will create a custom image for your content</p>
                </div>
              </div>
              
              {generateImageFlag && (
                <div className="mt-4 ml-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Style</label>
                  <select
                    value={imageStyle}
                    onChange={(e) => setImageStyle(e.target.value as ImageStyleKey)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow bg-white"
                  >
                    {Object.entries(IMAGE_STYLES).map(([key, style]) => (
                      <option key={key} value={key}>
                        {style.name} - {style.description}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-selected based on your topic. Change if needed.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => handleGenerate('all')}
                disabled={!businessName || !industry || !topic || generating}
                className="flex-1 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {generateImageFlag ? 'Generating content & image...' : selectedTemplate === 'social-pack' ? 'Generating 6 posts...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review & Edit - Social Pack */}
      {step === 3 && selectedTemplate === 'social-pack' && socialPack && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Social Media Pack</h2>
              <p className="text-gray-500 text-sm">6 platform-optimized posts ready to copy</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              AI Generated
            </span>
          </div>

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Generated Image</h3>
                    <p className="text-xs text-gray-500">Style: {IMAGE_STYLES[generatedImage.style as ImageStyleKey]?.name || generatedImage.style}</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadImage}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
              <div className="p-4 flex justify-center bg-gray-50">
                <img 
                  src={generatedImage.url} 
                  alt="Generated content image" 
                  className="max-w-md w-full rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {(Object.keys(socialPack) as Array<keyof SocialPackResult>).map((platform) => {
              const info = platformInfo[platform]
              const post = socialPack[platform]
              const fullContent = platform === 'instagram' 
                ? `${post.content}\n\n${(post as typeof socialPack.instagram).hashtags}`
                : post.content

              return (
                <div key={platform} className={`rounded-xl border border-gray-200 overflow-hidden ${info.bgColor}`}>
                  <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${info.bgColor} ${info.color}`}>
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{info.name}</h3>
                        <p className="text-xs text-gray-500">{info.optimal}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(fullContent, platform)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                        copied === platform 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {copied === platform ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{post.content}</p>
                    {platform === 'instagram' && (post as typeof socialPack.instagram).hashtags && (
                      <p className="mt-3 text-xs text-blue-600 break-all">
                        {(post as typeof socialPack.instagram).hashtags}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{post.charCount} characters</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            {/* Regenerate Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRegenerateMenuOpen(!regenerateMenuOpen)}
                disabled={generating}
                className="px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {generating ? 'Regenerating...' : 'Regenerate'}
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {regenerateMenuOpen && !generating && (
                <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleGenerate('all')}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate All
                  </button>
                  <button
                    onClick={() => handleGenerate('text')}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Text Only
                  </button>
                  <button
                    onClick={() => handleGenerate('image')}
                    disabled={!generateImageFlag}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100 rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Image Only
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="ml-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save to Library
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Edit - Regular Content (Blog, GMB, Email) */}
      {step === 3 && selectedTemplate !== 'social-pack' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Review your content</h2>
              <p className="text-gray-500 text-sm">Copy formatted or edit as needed</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              AI Generated
            </span>
          </div>

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="mb-4 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Generated Image</h3>
                    <p className="text-xs text-gray-500">Style: {IMAGE_STYLES[generatedImage.style as ImageStyleKey]?.name || generatedImage.style}</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadImage}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
              <div className="p-4 flex justify-center bg-gray-50">
                <img 
                  src={generatedImage.url} 
                  alt="Generated content image" 
                  className="max-w-md w-full rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Content Card with Preview/Edit Tabs */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
            {/* Tab Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'preview' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'edit' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Edit
                </button>
              </div>
              <span className="text-xs text-gray-400">{generatedContent.length} characters</span>
            </div>

            {/* Preview Mode */}
            {viewMode === 'preview' && (
              <div 
                ref={contentPreviewRef}
                className="p-6 prose prose-gray max-w-none prose-headings:text-gray-900 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-600 prose-strong:text-gray-900 prose-ul:text-gray-600 prose-li:marker:text-gray-400"
              >
                <ReactMarkdown>{generatedContent}</ReactMarkdown>
              </div>
            )}

            {/* Edit Mode */}
            {viewMode === 'edit' && (
              <textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                rows={20}
                className="w-full p-4 resize-none focus:outline-none text-gray-700 leading-relaxed font-mono text-sm"
              />
            )}
          </div>

          {/* Hint for copying */}
          {viewMode === 'preview' && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 bg-teal-50 px-4 py-2.5 rounded-lg border border-teal-100">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Tip:</strong> Click "Copy" to copy formatted text that pastes perfectly into WordPress, Wix, or any blog editor.</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            {/* Regenerate Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRegenerateMenuOpen(!regenerateMenuOpen)}
                disabled={generating}
                className="px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {generating ? 'Regenerating...' : 'Regenerate'}
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {regenerateMenuOpen && !generating && (
                <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleGenerate('all')}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate All
                  </button>
                  <button
                    onClick={() => handleGenerate('text')}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Text Only
                  </button>
                  <button
                    onClick={() => handleGenerate('image')}
                    disabled={!generateImageFlag}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100 rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Image Only
                  </button>
                </div>
              )}
            </div>
            
            {/* Main Copy Button */}
            <button
              onClick={viewMode === 'preview' ? handleCopyFormatted : () => handleCopy(generatedContent)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                copied === 'formatted' || copied === 'main'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              {copied === 'formatted' || copied === 'main' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {viewMode === 'preview' ? 'Copy' : 'Copy Text'}
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="ml-auto px-6 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save to Library
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
