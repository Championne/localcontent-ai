'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import ImageOverlayEditor, { type OverlayApplyPayload, type BrandColors, FRAME_PRESET_COLORS } from '@/components/ImageOverlayEditor'
import RatingStars from '@/components/RatingStars'
import { SafeImage } from '@/components/ui/SafeImage'
import { ImageTextOverlay } from '@/components/ui/ImageTextOverlay'
import { GenerationProgress } from '@/components/ui/GenerationProgress'

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
  style?: string
  generatedAt?: string
  source?: 'stock' | 'ai' | 'upload' | 'library'
  attribution?: string
  photographerName?: string
  photographerUrl?: string
}

interface Business {
  id: string
  name: string
  industry: string | null
  location?: string | null
  website?: string | null
  logo_url: string | null
  profile_photo_url: string | null
  brand_primary_color?: string | null
  brand_secondary_color?: string | null
  brand_accent_color?: string | null
  tagline?: string | null
  short_about?: string | null
  social_handles?: string | null
  default_cta_primary?: string | null
  default_cta_secondary?: string | null
  seo_keywords?: string | null
  default_tone?: string | null
  service_areas?: string | null
  preferred_image_styles?: string[]
  avoid_image_styles?: string[]
}

// Image style definitions (must match backend lib/openai/images.ts)
const IMAGE_STYLES = {
  promotional: {
    name: 'Promotional',
    description: 'Cinematic images for sales & offers',
    icon: '🎯',
    subVariations: {} as Record<string, { name: string }>,
  },
  professional: {
    name: 'Professional',
    description: 'Editorial documentary style',
    icon: '📸',
    subVariations: {} as Record<string, { name: string }>,
  },
  friendly: {
    name: 'Friendly',
    description: 'Warm candid lifestyle',
    icon: '🤝',
    subVariations: {} as Record<string, { name: string }>,
  },
  seasonal: {
    name: 'Seasonal',
    description: 'Subtle seasonal themes',
    icon: '🍂',
    subVariations: {} as Record<string, { name: string }>,
  },
  artistic: {
    name: 'Artistic',
    description: 'Painterly illustrative styles',
    icon: '🎨',
    subVariations: {
      watercolor: { name: 'Watercolor' },
      'oil-painting': { name: 'Oil Painting' },
      sketch: { name: 'Sketch' },
    } as Record<string, { name: string }>,
  },
  graffiti: {
    name: 'Graffiti',
    description: 'Bold urban street art energy',
    icon: '🏙️',
    subVariations: {
      full: { name: 'Full Graffiti' },
      'subtle-accents': { name: 'Subtle Accents' },
    } as Record<string, { name: string }>,
  },
  lifestyle: {
    name: 'Lifestyle',
    description: 'Candid real-people moments',
    icon: '🏡',
    subVariations: {} as Record<string, { name: string }>,
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Clean premium modern',
    icon: '✨',
    subVariations: {} as Record<string, { name: string }>,
  },
  vintage: {
    name: 'Vintage',
    description: 'Film grain retro nostalgia',
    icon: '📷',
    subVariations: {} as Record<string, { name: string }>,
  },
  wellness: {
    name: 'Wellness',
    description: 'Serene spa-like calm',
    icon: '🧘',
    subVariations: {} as Record<string, { name: string }>,
  },
} as const

type ImageStyleKey = keyof typeof IMAGE_STYLES
// GBP Post Types with descriptions
const GBP_POST_TYPES = {
  offer: {
    name: 'Special Offer',
    emoji: '🏷️',
    description: 'Promotions, discounts, or deals with an expiration. Best for driving immediate action.',
    cta: 'Get Offer',
  },
  event: {
    name: 'Event',
    emoji: '📅',
    description: 'Workshops, open days, or limited-time happenings. Supports up to 10 images (720×540, 4:3, JPG/PNG, 10 KB–5 MB).',
    cta: 'Book',
  },
  update: {
    name: 'Update / News',
    emoji: '📢',
    description: 'Announcements, new services, team news, or helpful tips. Great for staying visible.',
    cta: 'Learn More',
  },
} as const

type GbpPostType = keyof typeof GBP_POST_TYPES

// Offer expiration options
const OFFER_EXPIRATION_OPTIONS = [
  { value: '3', label: '3 days' },
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: 'custom', label: 'Custom date' },
]

// Character limits for platforms
const PLATFORM_LIMITS: Record<string, { optimal: { min: number; max: number }; max: number }> = {
  twitter: { optimal: { min: 71, max: 100 }, max: 280 },
  facebook: { optimal: { min: 40, max: 80 }, max: 63206 },
  instagram: { optimal: { min: 100, max: 150 }, max: 2200 },
  linkedin: { optimal: { min: 100, max: 200 }, max: 3000 },
  tiktok: { optimal: { min: 80, max: 150 }, max: 2200 },
  nextdoor: { optimal: { min: 100, max: 200 }, max: 2000 },
  gmb: { optimal: { min: 150, max: 300 }, max: 1500 },
  email: { optimal: { min: 200, max: 400 }, max: 2000 },
}

// Character count indicator component
function CharacterCount({ count, platform }: { count: number; platform: string }) {
  const limits = PLATFORM_LIMITS[platform]
  if (!limits) return null
  
  const { optimal, max } = limits
  
  let status: 'optimal' | 'okay' | 'warning' | 'error' = 'okay'
  let label = ''
  
  if (count >= optimal.min && count <= optimal.max) {
    status = 'optimal'
    label = 'Optimal'
  } else if (count < optimal.min) {
    status = 'okay'
    label = 'Short'
  } else if (count > max) {
    status = 'error'
    label = 'Too long!'
  } else if (count > optimal.max) {
    status = 'warning'
    label = 'Long'
  }
  
  const colors: Record<string, string> = {
    optimal: 'text-green-600 bg-green-50',
    okay: 'text-gray-500 bg-gray-50',
    warning: 'text-amber-600 bg-amber-50',
    error: 'text-red-600 bg-red-50',
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>
      {count} chars · {label}
    </span>
  )
}

// Preprocess AI-generated markdown so ReactMarkdown renders it correctly.
// Fixes missing blank lines before headers, converts • bullets to markdown lists, etc.
function preprocessMarkdown(raw: string): string {
  let s = raw
  // Normalise Windows line-endings
  s = s.replace(/\r\n/g, '\n')
  // Ensure a blank line before every markdown header (# … ######)
  s = s.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')
  // Also catch headers that follow text on the SAME line (no newline at all)
  s = s.replace(/([^\n])(\s?#{1,6}\s)/g, '$1\n\n$2')
  // Convert Unicode bullet (•) lines into markdown list items
  s = s.replace(/(^|\n)\s*•\s*/g, '$1- ')
  // Collapse 3+ consecutive blank lines into 2
  s = s.replace(/\n{3,}/g, '\n\n')
  return s.trim()
}

// Word count for blog posts
function WordCount({ count }: { count: number }) {
  let status: 'optimal' | 'okay' | 'warning' = 'okay'
  let label = ''
  
  if (count >= 800 && count <= 1500) {
    status = 'optimal'
    label = 'Great for SEO'
  } else if (count < 800) {
    status = 'okay'
    label = count < 400 ? 'Short' : 'Good'
  } else {
    status = 'warning'
    label = 'Detailed'
  }
  
  const colors: Record<string, string> = {
    optimal: 'text-green-600 bg-green-50',
    okay: 'text-gray-500 bg-gray-50',
    warning: 'text-amber-600 bg-amber-50',
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>
      {count} words · {label}
    </span>
  )
}



// Motivational tips for impact card
const MOTIVATIONAL_TIPS = [
  { icon: '📈', text: 'Businesses posting 3x/week see 40% more customer inquiries' },
  { icon: '🎯', text: 'Consistent local content builds trust with your community' },
  { icon: '💡', text: 'Posts with images get 2.3x more engagement than text-only' },
  { icon: '🏆', text: 'You\'re already ahead of 70% of local businesses who don\'t post regularly' },
  { icon: '🚀', text: 'Regular posting keeps you top-of-mind when customers need your services' },
  { icon: '⭐', text: 'Local businesses with active social presence get 58% more website visits' },
]

export default function CreateContentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [generating, setGenerating] = useState(false)
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
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
  const [aiRegenerateMenuOpen, setAiRegenerateMenuOpen] = useState(false)
  
  // Image generation options (Option C: stock default, AI optional)
  const [generateImageFlag] = useState(true) // Always generate images
  const [imageSource, setImageSource] = useState<'stock' | 'ai'>('stock') // 'stock' = free Unsplash, 'ai' = DALL-E
  const [imageStyle, setImageStyle] = useState<ImageStyleKey>('professional')
  const [subVariation, setSubVariation] = useState<string | null>(null)
  const [imagesRemaining, setImagesRemaining] = useState<number | null>(null)
  
  // Multi-business support
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)
  const currentBusiness = businesses.find(b => b.id === selectedBusinessId)
  const currentBusinessLogo = currentBusiness?.logo_url || null
  const currentBusinessPhoto = currentBusiness?.profile_photo_url || null
  
  // Logo positioning
  const [showOverlayEditor, setShowOverlayEditor] = useState(false)
  const [applyingLogo, setApplyingLogo] = useState(false)
  const [logoSkipped, setLogoSkipped] = useState(false)
  
  // Profile photo positioning
  const [showPhotoPositioner, setShowPhotoPositioner] = useState(false)
  const [applyingPhoto, setApplyingPhoto] = useState(false)
  const [photoSkipped, setPhotoSkipped] = useState(false)
  
  // Text overlay editor
  const [showTextOverlay, setShowTextOverlay] = useState(false)
  const [overlayError, setOverlayError] = useState<string | null>(null)

  // Auto branding recommendation: applied when user selects an image in Step 3
  const [brandingRecommendationLoading, setBrandingRecommendationLoading] = useState(false)
  const [appliedBrandingForImageUrl, setAppliedBrandingForImageUrl] = useState<string | null>(null)
  const [initialOverlayState, setInitialOverlayState] = useState<OverlayApplyPayload | null>(null)
  // Base image URL that suggested branding was applied to (so "Revert to suggested branding" can re-apply)
  const [suggestedBrandingBaseImageUrl, setSuggestedBrandingBaseImageUrl] = useState<string | null>(null)

  // GBP-specific state
  const [gbpPostType, setGbpPostType] = useState<GbpPostType>('update')
  const [offerExpiration, setOfferExpiration] = useState('7')
  const [offerCustomDate, setOfferCustomDate] = useState('')
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0])
  const [eventTime, setEventTime] = useState('18:00')

  // Step 3: Choose your image (3 stock + 1 AI + 1 upload)
  type StockOption = { url: string; attribution: string; photographerName: string; photographerUrl: string; downloadLocation?: string }
  const dedupeStockOptionsByUrl = (opts: StockOption[] | undefined): StockOption[] => {
    if (!Array.isArray(opts) || opts.length === 0) return []
    const seen = new Set<string>()
    return opts.filter((o) => {
      if (seen.has(o.url)) return false
      seen.add(o.url)
      return true
    })
  }
  const [stockImageOptions, setStockImageOptions] = useState<StockOption[]>([])
  const [selectedStockImage, setSelectedStockImage] = useState<StockOption | null>(null)
  const [step3StockLoading, setStep3StockLoading] = useState(false)
  const [regeneratingStockIndex, setRegeneratingStockIndex] = useState<number | null>(null)
  // Session dedup: track all stock image URLs shown so regenerate never repeats
  const usedStockUrlsRef = useRef<Set<string>>(new Set())
  const [step3AIImage, setStep3AIImage] = useState<{ url: string; style: string; size: string; generated_image_id?: string | null } | null>(null)
  const [generatingAiImage, setGeneratingAiImage] = useState(false)
  const step3UploadInputRef = useRef<HTMLInputElement>(null)
  const step3CameraInputRef = useRef<HTMLInputElement>(null)
  const aiRegenerateMenuRef = useRef<HTMLDivElement>(null)

  // A/B Style Compare
  const [compareImages, setCompareImages] = useState<Array<{ url: string; style: string; loading: boolean }>>([])
  const [showCompare, setShowCompare] = useState(false)
  const [comparingStyles, setComparingStyles] = useState(false)

  // Image Library: recent user images for Step 3 picker
  const [libraryImages, setLibraryImages] = useState<Array<{ id: string; public_url: string; filename: string }>>([])
  const [libraryLoading, setLibraryLoading] = useState(false)

  // Quality ratings: link to generated_images / generated_texts when saving
  const [generatedImageId, setGeneratedImageId] = useState<string | null>(null)
  const [generatedTextId, setGeneratedTextId] = useState<string | null>(null)
  const [imageRating, setImageRating] = useState<number | null>(null)
  const [textRating, setTextRating] = useState<number | null>(null)

  // Edit existing content from library (?edit=contentId)
  const searchParams = useSearchParams()
  const [editingContentId, setEditingContentId] = useState<string | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(false)

  // Fetch user's businesses on mount, sync with sidebar selection
  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const response = await fetch('/api/business')
        if (response.ok) {
          const data = await response.json()
          if (data.businesses && data.businesses.length > 0) {
            setBusinesses(data.businesses)
            // Sync with sidebar: read from localStorage
            const stored = localStorage.getItem('geospark_selected_business_id')
            const match = data.businesses.find((b: Business) => b.id === stored)
            const target = match || data.businesses[0]
            setSelectedBusinessId(target.id)
            setBusinessName(target.name || '')
            setIndustry(target.industry || '')
            if (target.default_tone) setTone(target.default_tone)
          }
        }
      } catch (err) {
        console.error('Failed to fetch businesses:', err)
      }
    }
    fetchBusinesses()
  }, [])

  // Listen for sidebar business changes and update immediately
  useEffect(() => {
    const onBusinessChanged = (e: Event) => {
      const businessId = (e as CustomEvent).detail?.businessId
      if (businessId && businessId !== selectedBusinessId) {
        handleBusinessChange(businessId)
      }
    }
    window.addEventListener('geospark:business-changed', onBusinessChanged)
    return () => window.removeEventListener('geospark:business-changed', onBusinessChanged)
  }, [businesses, selectedBusinessId])

  // Close AI regenerate style dropdown when clicking outside
  useEffect(() => {
    if (!aiRegenerateMenuOpen) return
    const close = (e: MouseEvent) => {
      if (aiRegenerateMenuRef.current && !aiRegenerateMenuRef.current.contains(e.target as Node)) setAiRegenerateMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [aiRegenerateMenuOpen])

  // Step 3: fetch 3 stock image options only when we don't already have any (e.g. from generate response)
  useEffect(() => {
    if (step !== 3 || !topic?.trim() || !industry?.trim() || !selectedTemplate) return
    if (stockImageOptions.length > 0) return // keep options from generate, don't overwrite with GET
    setStep3StockLoading(true)
    const usedArr = Array.from(usedStockUrlsRef.current)
    const params = new URLSearchParams({ topic: topic.trim(), industry: industry.trim(), contentType: selectedTemplate })
    if (usedArr.length > 0) params.set('usedUrls', usedArr.join(','))
    fetch(`/api/stock-images?${params}`)
      .then(res => res.json())
      .then(data => {
        const deduped = dedupeStockOptionsByUrl(data.options)
        if (deduped.length > 0) {
          setStockImageOptions(deduped)
          deduped.forEach((o: StockOption) => usedStockUrlsRef.current.add(o.url))
        }
      })
      .catch(() => {})
      .finally(() => setStep3StockLoading(false))
  }, [step, topic, industry, selectedTemplate, stockImageOptions.length])

  // Step 3: fetch recent library images
  useEffect(() => {
    if (step !== 3) return
    if (libraryImages.length > 0) return
    setLibraryLoading(true)
    fetch('/api/image-library?limit=4')
      .then(res => res.json())
      .then(data => { if (data.images) setLibraryImages(data.images) })
      .catch(() => {})
      .finally(() => setLibraryLoading(false))
  }, [step, libraryImages.length])

  // Run auto-branding: fetch recommendation and apply to given image URL
  const runAutoBranding = async (imageUrlToApply: string) => {
    setBrandingRecommendationLoading(true)
    try {
      const res = await fetch('/api/image/branding-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          hasLogo: !!(currentBusiness?.logo_url),
          hasPhoto: !!(currentBusiness?.profile_photo_url),
          tagline: currentBusiness?.tagline?.trim() || undefined,
          businessName: currentBusiness?.name?.trim() || undefined,
          website: currentBusiness?.website?.trim() || undefined,
          socialHandles: currentBusiness?.social_handles?.trim() || undefined,
          defaultCtaPrimary: currentBusiness?.default_cta_primary?.trim() || undefined,
        }),
      })
      const rec = await res.json()
      const primaryHex = getBrandColors()?.primary || currentBusiness?.brand_primary_color || '#0d9488'
      const imageOverlays: OverlayApplyPayload['imageOverlays'] = []
      const overlayBorderColors: Record<string, string> = {}
      if (rec.logoPosition && currentBusiness?.logo_url) {
        const id = 'rec-logo'
        imageOverlays.push({
          id,
          url: currentBusiness.logo_url,
          x: rec.logoPosition.x,
          y: rec.logoPosition.y,
          scale: rec.logoPosition.scale,
          type: 'logo',
        })
        overlayBorderColors[id] = primaryHex
      }
      if (rec.photoPosition && currentBusiness?.profile_photo_url) {
        const id = 'rec-photo'
        imageOverlays.push({
          id,
          url: currentBusiness.profile_photo_url,
          x: rec.photoPosition.x,
          y: rec.photoPosition.y,
          scale: rec.photoPosition.scale,
          type: 'photo',
        })
        overlayBorderColors[id] = primaryHex
      }
      const textOverlays: OverlayApplyPayload['textOverlays'] = (rec.textOverlays || []).map(
        (t: { text: string; x: number; y: number; fontSize?: number; fontFamily?: string; colorKey: 'primary' | 'secondary' | 'accent' }, i: number) => ({
          id: `rec-text-${i}`,
          text: t.text,
          x: t.x,
          y: t.y,
          fontSize: t.fontSize ?? 20,
          fontFamily: (t.fontFamily as 'Inter' | 'Georgia' | 'Playfair Display' | 'system-ui') || 'Inter',
          colorKey: t.colorKey,
        })
      )
      const payload: OverlayApplyPayload = {
        imageOverlays,
        overlayBorderColors,
        tintOverlay: rec.tint ? { colorKey: rec.tint.colorKey, opacity: rec.tint.opacity } : null,
        textOverlays,
        frame: rec.frame ? { style: rec.frame.style, colorKey: rec.frame.colorKey } : null,
      }
      setSuggestedBrandingBaseImageUrl(imageUrlToApply)
      const newUrl = await applyPayloadToImage(imageUrlToApply, payload)
      if (newUrl) {
        setGeneratedImage((prev) => (prev ? { ...prev, url: newUrl } : null))
        setInitialOverlayState(payload)
        // Store the BRANDED url so the auto-branding useEffect guard matches
        // generatedImage.url and does not re-trigger (preventing double-branding)
        setAppliedBrandingForImageUrl(newUrl)
        setLogoSkipped(true)
        setPhotoSkipped(true)
      } else {
        // Apply failed (e.g. CORS on text); still save suggestion so overlay editor and Revert can use it
        setInitialOverlayState(payload)
        setSuggestedBrandingBaseImageUrl(imageUrlToApply)
        setAppliedBrandingForImageUrl(imageUrlToApply)
        setShowOverlayEditor(true)
      }
    } catch {
      // ignore
    } finally {
      setBrandingRecommendationLoading(false)
    }
  }

  // Revert to the last suggested branding (re-apply saved payload to base image)
  const revertToSuggestedBranding = async () => {
    if (!generatedImage?.url) return
    const baseUrl = suggestedBrandingBaseImageUrl || generatedImage.url
    const payload = initialOverlayState
    if (!payload) {
      // Use the original base URL (not the branded one) to avoid double-branding
      await runAutoBranding(suggestedBrandingBaseImageUrl || generatedImage.url)
      return
    }
    setBrandingRecommendationLoading(true)
    try {
      const newUrl = await applyPayloadToImage(baseUrl, payload)
      if (newUrl) {
        setGeneratedImage((prev) => (prev ? { ...prev, url: newUrl } : null))
        setAppliedBrandingForImageUrl(newUrl)
      }
    } catch {
      // ignore
    } finally {
      setBrandingRecommendationLoading(false)
    }
  }

  // Auto-branding disabled: user now customizes branding manually via the overlay editor.
  // The editor opens blank (no pre-suggested layout) and users can use "Arrange all" to quickly place items.

  // Load content when opening from library (?edit=id)
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId) return

    let cancelled = false
    setLoadingEdit(true)
    fetch(`/api/content/${editId}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled || !data.content) return
        const item = data.content
        setTopic(item.title || '')
        setSelectedTemplate((item.template === 'social-pack' || item.template === 'blog-post' || item.template === 'gmb-post' || item.template === 'email') ? item.template : 'social-pack')
        if (item.template === 'social-pack') {
          try {
            const pack = typeof item.content === 'string' ? JSON.parse(item.content) : item.content
            setSocialPack(pack)
          } catch {
            setSocialPack(null)
          }
        } else {
          setGeneratedContent(item.content || '')
        }
        const meta = item.metadata || {}
        if (meta.businessName) setBusinessName(meta.businessName)
        if (meta.industry) setIndustry(meta.industry)
        if (meta.tone) setTone(meta.tone)
        const imageUrl = meta.image_url ?? (item as { image_url?: string }).image_url
        if (imageUrl) {
          setGeneratedImage({
            url: imageUrl,
            style: (meta.image_style as string) || 'professional',
            generatedAt: item.updated_at || new Date().toISOString(),
            ...(meta.image_source === 'stock' && {
              source: 'stock',
              photographerName: meta.photographer_name as string | undefined,
              photographerUrl: meta.photographer_url as string | undefined,
              attribution: meta.photographer_name ? `Photo by ${meta.photographer_name} on Unsplash` : undefined,
            }),
          })
          setAppliedBrandingForImageUrl(imageUrl)
        }
        const genImageId = (item as { generated_image_id?: string }).generated_image_id ?? null
        if (genImageId) setGeneratedImageId(genImageId)
        setEditingContentId(item.id)
        setStep(3)
      })
      .catch(() => { if (!cancelled) setError('Failed to load content') })
      .finally(() => { if (!cancelled) setLoadingEdit(false) })
    return () => { cancelled = true }
  }, [searchParams])

  // Update business name/industry when selected business changes
  const handleBusinessChange = (businessId: string) => {
    setSelectedBusinessId(businessId)
    const business = businesses.find(b => b.id === businessId)
    if (business) {
      setBusinessName(business.name || '')
      setIndustry(business.industry || '')
      if (business.default_tone) setTone(business.default_tone)
    }
  }

  // Upload logo or profile photo from overlay editor (drag-and-drop or click)
  const handleUploadLogoInEditor = async (file: File): Promise<string | null> => {
    if (!selectedBusinessId) return null
    const formData = new FormData()
    formData.set('businessId', selectedBusinessId)
    formData.set('type', 'logo')
    formData.set('logo', file)
    const res = await fetch('/api/business/logo', { method: 'POST', body: formData })
    if (!res.ok) return null
    const data = await res.json()
    setBusinesses(prev => prev.map(b => b.id === selectedBusinessId ? { ...b, logo_url: data.url } : b))
    return data.url
  }
  const handleUploadPhotoInEditor = async (file: File): Promise<string | null> => {
    if (!selectedBusinessId) return null
    const formData = new FormData()
    formData.set('businessId', selectedBusinessId)
    formData.set('type', 'profile_photo')
    formData.set('profile_photo', file)
    const res = await fetch('/api/business/logo', { method: 'POST', body: formData })
    if (!res.ok) return null
    const data = await res.json()
    setBusinesses(prev => prev.map(b => b.id === selectedBusinessId ? { ...b, profile_photo_url: data.url } : b))
    return data.url
  }

  // Calculate expiration date for offers
  
  // Count words in text
  const countWords = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0).length

  const getExpirationDate = () => {
    if (offerExpiration === 'custom' && offerCustomDate) {
      return offerCustomDate
    }
    const days = parseInt(offerExpiration)
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }
  
  // Handle logo apply
  const handleApplyLogo = async (position: { x: number; y: number; scale: number }) => {
    if (!generatedImage || !currentBusinessLogo) return
    
    setApplyingLogo(true)
    try {
      const response = await fetch('/api/image/composite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: generatedImage.url,
          logoUrl: currentBusinessLogo,
          position,
          brandPrimaryColor: currentBusiness?.brand_primary_color ?? undefined,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        const newUrl = data.url ? `${data.url}${data.url.includes('?') ? '&' : '?'}_=${Date.now()}` : null
        if (newUrl) {
          setGeneratedImage((prev) => (prev ? { ...prev, url: newUrl } : null))
        }
        setShowOverlayEditor(false)
        // Show profile photo positioner next if available
        if (currentBusinessPhoto && !photoSkipped) {
          setShowPhotoPositioner(true)
        }
      } else {
        console.error('Failed to apply logo')
      }
    } catch (error) {
      console.error('Logo apply error:', error)
    } finally {
      setApplyingLogo(false)
    }
  }

  const getBrandColors = (): BrandColors | null => {
    if (!currentBusiness) return null
    const p = currentBusiness.brand_primary_color && /^#[0-9A-Fa-f]{6}$/.test(currentBusiness.brand_primary_color) ? currentBusiness.brand_primary_color : '#0d9488'
    const s = currentBusiness.brand_secondary_color && /^#[0-9A-Fa-f]{6}$/.test(currentBusiness.brand_secondary_color) ? currentBusiness.brand_secondary_color : '#6b7280'
    const a = currentBusiness.brand_accent_color && /^#[0-9A-Fa-f]{6}$/.test(currentBusiness.brand_accent_color) ? currentBusiness.brand_accent_color : '#6b7280'
    return { primary: p, secondary: s, accent: a }
  }

  const brand = getBrandColors()
  const primary = brand?.primary ?? '#0d9488'
  const secondary = brand?.secondary ?? '#6b7280'
  const accent = brand?.accent ?? '#6b7280'
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  // Apply overlay payload to an image URL; returns the new image URL or null on failure
  const applyPayloadToImage = async (baseImageUrl: string, payload: OverlayApplyPayload): Promise<string | null> => {
    const { imageOverlays, overlayBorderColors, tintOverlay, textOverlays, frame } = payload
    if (imageOverlays.length === 0 && textOverlays.length === 0 && !frame && !tintOverlay) return baseImageUrl
    let currentImageUrl = baseImageUrl
    const colors = getBrandColors()
    try {
      for (const overlay of imageOverlays) {
        const borderHex = overlayBorderColors[overlay.id] || currentBusiness?.brand_primary_color
        const res = await fetch('/api/image/composite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: currentImageUrl,
            logoUrl: overlay.url,
            position: { x: overlay.x, y: overlay.y, scale: overlay.scale },
            isCircular: overlay.type === 'photo',
            overlayBorderColor: borderHex || undefined,
          }),
        })
        if (!res.ok) return null
        const data = await res.json()
        if (!data.url) return null
        currentImageUrl = data.url
      }
      // Tint and frame: send in one composite request when no logo/photo (more reliable than two round-trips)
      if ((tintOverlay || frame) && colors) {
        const body: Record<string, unknown> = { imageUrl: currentImageUrl }
        const frameOverridesTint = frame && ['gold', 'silver', 'copper', 'neon', 'filmstrip', 'vignette'].includes(frame.style)
        if (tintOverlay && !frameOverridesTint) {
          const tintHex = tintOverlay.colorKey === 'primary' ? colors.primary : tintOverlay.colorKey === 'secondary' ? colors.secondary : colors.accent
          body.tintOverlay = { color: tintHex, opacity: tintOverlay.opacity }
        }
        if (frame) {
          const frameHex = frame.colorKey === 'silver' || frame.colorKey === 'gold' || frame.colorKey === 'copper' || frame.colorKey === 'neutral'
            ? (FRAME_PRESET_COLORS[frame.colorKey] ?? '#e5e7eb')
            : frame.colorKey === 'primary' ? colors.primary : frame.colorKey === 'secondary' ? colors.secondary : colors.accent
          body.frame = { style: frame.style, color: frameHex }
        }
        const res = await fetch('/api/image/composite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) return null
        const data = await res.json()
        if (data.url) currentImageUrl = data.url
        else return null
      }
      if (textOverlays.length > 0 && colors) {
        const img = await fetch(currentImageUrl).then(r => r.blob())
        const bitmap = await createImageBitmap(img)
        const canvas = document.createElement('canvas')
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return null
        ctx.drawImage(bitmap, 0, 0)
        const scale = bitmap.width / 1024
        for (const t of textOverlays) {
          const hex = t.colorKey === 'primary' ? colors.primary : t.colorKey === 'secondary' ? colors.secondary : colors.accent
          const fontSize = Math.round(Math.min(72, Math.max(14, (t.fontSize ?? 24) * scale)))
          const fontFamily = (t as { fontFamily?: string }).fontFamily || 'Inter'
          ctx.font = `bold ${fontSize}px "${fontFamily}", system-ui, sans-serif`
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = hex
          ctx.strokeStyle = 'rgba(0,0,0,0.5)'
          ctx.lineWidth = Math.max(1, fontSize / 16)
          const px = (t.x / 100) * canvas.width
          const py = (t.y / 100) * canvas.height
          ctx.strokeText(t.text, px, py)
          ctx.fillText(t.text, px, py)
        }
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
        if (!blob) return null
        const form = new FormData()
        form.append('file', blob, 'content-image.png')
        const uploadRes = await fetch('/api/image/upload-overlay', { method: 'POST', body: form })
        if (!uploadRes.ok) return null
        const uploadData = await uploadRes.json()
        if (uploadData.url) currentImageUrl = uploadData.url
      }
      return `${currentImageUrl}${currentImageUrl.includes('?') ? '&' : '?'}_=${Date.now()}`
    } catch {
      return null
    }
  }

  const handleApplyOverlays = async (payload: OverlayApplyPayload) => {
    if (!generatedImage) return
    const { imageOverlays, overlayBorderColors, tintOverlay, textOverlays, frame } = payload
    if (imageOverlays.length === 0 && textOverlays.length === 0 && !frame && !tintOverlay) return
    setOverlayError(null)
    setApplyingLogo(true)
    try {
      // Use the original (pre-branding) base image to avoid double-branding
      const baseUrl = suggestedBrandingBaseImageUrl || generatedImage.url
      const newUrl = await applyPayloadToImage(baseUrl, payload)
      if (newUrl) {
        setGeneratedImage((prev) => (prev ? { ...prev, url: newUrl } : null))
        setShowOverlayEditor(false)
        setLogoSkipped(true)
        setPhotoSkipped(true)
      } else {
        setOverlayError('Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Overlay apply error:', error)
      setOverlayError('Something went wrong. Please try again.')
    } finally {
      setApplyingLogo(false)
    }
  }

  
  // Handle logo skip
  const handleSkipLogo = () => {
    setShowOverlayEditor(false)
    setLogoSkipped(true)
    // Show profile photo positioner if available
    if (currentBusinessPhoto && !photoSkipped) {
      setShowPhotoPositioner(true)
    }
  }
  
  // Handle profile photo apply
  const handleApplyPhoto = async (position: { x: number; y: number; scale: number }) => {
    if (!generatedImage || !currentBusinessPhoto) return
    
    setApplyingPhoto(true)
    try {
      const response = await fetch('/api/image/composite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: generatedImage.url,
          logoUrl: currentBusinessPhoto,
          position,
          isCircular: true, // Profile photos are circular
          brandPrimaryColor: currentBusiness?.brand_primary_color ?? undefined,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        const newUrl = data.url ? `${data.url}${data.url.includes('?') ? '&' : '?'}_=${Date.now()}` : null
        if (newUrl) {
          setGeneratedImage((prev) => (prev ? { ...prev, url: newUrl } : null))
        }
        setShowPhotoPositioner(false)
      } else {
        console.error('Failed to apply photo')
      }
    } catch (error) {
      console.error('Photo apply error:', error)
    } finally {
      setApplyingPhoto(false)
    }
  }
  
  // Handle profile photo skip
  const handleSkipPhoto = () => {
    setShowPhotoPositioner(false)
    setPhotoSkipped(true)
  }

  // Apply text-overlay image to content (upload blob, set as generated image, close overlay)
  const handleTextOverlaySave = async (blob: Blob) => {
    if (!generatedImage) return
    try {
      const form = new FormData()
      form.append('file', blob, 'content-image.png')
      const res = await fetch('/api/image/upload-overlay', { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setOverlayError(err.error || 'Failed to apply text to image.')
        return
      }
      const data = await res.json()
      if (data.url) {
        setGeneratedImage((prev) => (prev ? { ...prev, url: data.url } : prev))
        setShowTextOverlay(false)
        setOverlayError(null)
      }
    } catch (e) {
      console.error('Text overlay save error:', e)
      setOverlayError('Failed to apply text to image.')
    }
  }

  // Image style is set only by the user on Step 2 (Details) and kept for regeneration

  const templates = [
    { 
      id: 'blog-post', 
      name: 'Blog Post', 
      description: 'SEO-optimized blog article for your website',
      benefit: 'Drive traffic and show expertise',
      color: 'teal',
      time: '~30 sec'
    },
    { 
      id: 'social-pack', 
      name: 'Social Media Pack', 
      description: '6 optimized posts for all major platforms',
      benefit: 'One idea, six ready-to-publish posts',
      color: 'orange',
      badge: '6 platforms',
      popular: true,
      time: '~45 sec'
    },
    { 
      id: 'gmb-post', 
      name: 'Google Business Post', 
      description: 'Updates, offers, or events for your GBP profile (4:3 image)',
      benefit: 'Stay visible to local searchers',
      color: 'blue',
      time: '~20 sec'
    },
    { 
      id: 'email', 
      name: 'Email Newsletter', 
      description: 'Professional email content for your customers',
      benefit: 'Keep your list engaged with value',
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

  const getColorClasses = (color: string, isSelected: boolean): { bg: string; border: string; icon: string; iconStyle?: React.CSSProperties; borderStyle?: React.CSSProperties; bgStyle?: React.CSSProperties } => {
    const useBrand = color === 'teal' || color === 'orange'
    if (useBrand) {
      return {
        bg: isSelected ? '' : 'bg-white',
        border: isSelected ? '' : 'border-gray-200',
        icon: '',
        bgStyle: isSelected ? { backgroundColor: hexToRgba(primary, 0.12) } : undefined,
        borderStyle: isSelected ? { borderColor: primary, borderWidth: 2 } : undefined,
        iconStyle: { backgroundColor: hexToRgba(primary, 0.2), color: primary },
      }
    }
    const colors: Record<string, { bg: string; border: string; icon: string }> = {
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
    return colors[color] || { bg: isSelected ? '' : 'bg-white', border: isSelected ? '' : 'border-gray-200', icon: '', bgStyle: isSelected ? { backgroundColor: hexToRgba(primary, 0.12) } : undefined, borderStyle: isSelected ? { borderColor: primary } : undefined, iconStyle: { backgroundColor: hexToRgba(primary, 0.2), color: primary } }
  }

  const handleQuickStart = (quickStart: typeof quickStarts[0]) => {
    setSelectedTemplate(quickStart.template)
    setTopic(quickStart.topic)
    setStep(2)
  }

  const handleGenerate = async (mode: 'all' | 'text' | 'image' = 'all', imageSourceOverride?: 'stock' | 'ai') => {
    setGenerationStartTime(Date.now())
    setGenerating(true)
    setError('')
    setRegenerateMenuOpen(false)
    
    if (mode === 'all') {
      setGeneratedImage(null)
      setStockImageOptions([])
      setSelectedStockImage(null)
      setGeneratedImageId(null)
      setStep3AIImage(null)
    }
    // For mode === 'image' we clear after we get a successful response with new options/image below
    
    setViewMode('preview') // Reset to preview mode on new generation
    
    const effectiveImageSource = mode === 'image' && imageSourceOverride != null ? imageSourceOverride : imageSource
    
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
          location: currentBusiness?.location ?? undefined,
          generateImageFlag: mode === 'text' ? false : true,
          imageSource: mode === 'image' ? effectiveImageSource : 'stock',
          imageStyle,
          subVariation: subVariation ?? undefined,
          postType: selectedTemplate,
          preferredStyles: currentBusiness?.preferred_image_styles ?? undefined,
          avoidStyles: currentBusiness?.avoid_image_styles ?? undefined,
          regenerateMode: mode,
          tagline: currentBusiness?.tagline ?? undefined,
          defaultCtaPrimary: currentBusiness?.default_cta_primary ?? undefined,
          defaultCtaSecondary: currentBusiness?.default_cta_secondary ?? undefined,
          seoKeywords: currentBusiness?.seo_keywords ?? undefined,
          shortAbout: currentBusiness?.short_about ?? undefined,
          website: currentBusiness?.website ?? undefined,
          socialHandles: currentBusiness?.social_handles ?? undefined,
          serviceAreas: currentBusiness?.service_areas ?? undefined,
          brandPrimaryColor: currentBusiness?.brand_primary_color ?? undefined,
          brandSecondaryColor: currentBusiness?.brand_secondary_color ?? undefined,
          brandAccentColor: currentBusiness?.brand_accent_color ?? undefined,
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

      // Only update image-related state when we requested image (all or image). When regenerating text only, preserve current image.
      if (mode === 'all' || mode === 'image') {
        if (data.stockImageOptions?.length) {
          const deduped = dedupeStockOptionsByUrl(data.stockImageOptions)
          setStockImageOptions(deduped)
          const firstStock = deduped[0]
          setSelectedStockImage(firstStock)
          setGeneratedImage({
            url: firstStock.url,
            style: imageStyle,
            generatedAt: new Date().toISOString(),
            source: 'stock',
            attribution: firstStock.attribution,
            photographerName: firstStock.photographerName,
            photographerUrl: firstStock.photographerUrl,
          })
          setGeneratedImageId(null)
          setAppliedBrandingForImageUrl(null)
        } else {
          setStockImageOptions([])
          setSelectedStockImage(null)
        }
        if (data.image) {
          const isAi = (data.image as { source?: string }).source === 'ai'
          setStep3AIImage(isAi ? {
            url: data.image.url,
            style: data.image.style || 'professional',
            size: (data.image as { size?: string }).size || '1024x1024',
            generated_image_id: data.generated_image_id ?? null,
          } : null)
          if (!data.stockImageOptions?.length) {
            setGeneratedImage(data.image)
            setAppliedBrandingForImageUrl(null)
            if (data.generated_image_id) { setGeneratedImageId(data.generated_image_id); setImageRating(null) }
          }
          const businessLogo = businesses.find(b => b.id === selectedBusinessId)?.logo_url
          if (businessLogo && !logoSkipped) {
            setShowOverlayEditor(true)
          }
        }
        if (data.generated_image_id && !data.stockImageOptions?.length) {
          setGeneratedImageId(data.generated_image_id)
          setImageRating(null)
        }
      }
      if (data.generated_text_id) { setGeneratedTextId(data.generated_text_id); setTextRating(null) }
      if (data.usage) {
        setImagesRemaining(data.usage.imagesRemaining)
      }
      setGenerating(false)
      setGenerationStartTime(null)
      setTimeout(() => setStep(3), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
      setGenerationStartTime(null)
    }
  }

  // Regenerate both stock options and AI image (keep text unchanged)
  const handleRegenerateAllImages = async () => {
    setRegenerateMenuOpen(false)
    setGenerating(true)
    setError('')
    setStockImageOptions([])
    setSelectedStockImage(null)
    setGeneratedImage(null)
    setStep3AIImage(null)
    setGeneratedImageId(null)
    setAppliedBrandingForImageUrl(null)
    setInitialOverlayState(null)
    const body = {
      template: selectedTemplate,
      businessName,
      industry,
      topic,
      tone,
      location: currentBusiness?.location ?? undefined,
      generateImageFlag: true,
      imageStyle,
      regenerateMode: 'image' as const,
      tagline: currentBusiness?.tagline ?? undefined,
      defaultCtaPrimary: currentBusiness?.default_cta_primary ?? undefined,
      defaultCtaSecondary: currentBusiness?.default_cta_secondary ?? undefined,
      seoKeywords: currentBusiness?.seo_keywords ?? undefined,
      shortAbout: currentBusiness?.short_about ?? undefined,
      website: currentBusiness?.website ?? undefined,
      socialHandles: currentBusiness?.social_handles ?? undefined,
      serviceAreas: currentBusiness?.service_areas ?? undefined,
      brandPrimaryColor: currentBusiness?.brand_primary_color ?? undefined,
      brandSecondaryColor: currentBusiness?.brand_secondary_color ?? undefined,
      brandAccentColor: currentBusiness?.brand_accent_color ?? undefined,
    }
    try {
      const stockRes = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, imageSource: 'stock' }),
      })
      const stockData = await stockRes.json()
      if (!stockRes.ok) throw new Error(stockData.error || 'Failed to fetch stock images')
      if (stockData.stockImageOptions?.length) {
        setStockImageOptions(dedupeStockOptionsByUrl(stockData.stockImageOptions))
      }
      if (stockData.usage?.imagesRemaining != null) setImagesRemaining(stockData.usage.imagesRemaining)

      const aiRes = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, imageSource: 'ai' }),
      })
      const aiData = await aiRes.json()
      if (!aiRes.ok) throw new Error(aiData.error || 'Failed to generate AI image')
      if (aiData.image) {
        setStep3AIImage({
          url: aiData.image.url,
          style: aiData.image.style || 'professional',
          size: (aiData.image as { size?: string }).size || '1024x1024',
          generated_image_id: aiData.generated_image_id ?? null,
        })
        setGeneratedImage(aiData.image)
        if (aiData.generated_image_id) {
          setGeneratedImageId(aiData.generated_image_id)
          setImageRating(null)
        }
      }
      if (aiData.usage?.imagesRemaining != null) setImagesRemaining(aiData.usage.imagesRemaining)
      setGenerating(false)
      setGenerationStartTime(null)
      setTimeout(() => setStep(3), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
      setGenerationStartTime(null)
    }
  }

  // Regenerate a single stock slot with a new image (uses page param + usedUrls for dedup).
  const stockRegenerateCountRef = useRef(1)
  const handleRegenerateStockSlot = async (slotIndex: number) => {
    if (!topic?.trim() || !industry?.trim()) return
    setRegeneratingStockIndex(slotIndex)
    setError('')
    const contentType = selectedTemplate === 'social-pack' ? 'social-pack' : (selectedTemplate === 'blog-post' ? 'blog-post' : 'social-post')
    stockRegenerateCountRef.current += 1
    const page = stockRegenerateCountRef.current
    const usedArr = Array.from(usedStockUrlsRef.current)
    try {
      const params = new URLSearchParams({ topic: topic.trim(), industry: industry.trim(), contentType, page: String(page) })
      if (usedArr.length > 0) params.set('usedUrls', usedArr.join(','))
      const res = await fetch(`/api/stock-images?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch stock image')
      const options = data.options as StockOption[]
      if (options?.length) {
        setStockImageOptions((prev) => {
          const existingUrls = new Set(prev.map((o) => o.url))
          const chosen = options.find((o) => !existingUrls.has(o.url))
          if (!chosen) return prev
          usedStockUrlsRef.current.add(chosen.url)
          const next = [...prev]
          next[slotIndex] = chosen
          return next
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get new stock image')
    } finally {
      setRegeneratingStockIndex(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const content = selectedTemplate === 'social-pack' 
        ? JSON.stringify(socialPack) 
        : generatedContent

      const payload = {
        template: selectedTemplate,
        title: topic,
        content,
        metadata: {
          businessName,
          industry,
          tone,
          type: selectedTemplate,
          image_url: generatedImage?.url || null,
          image_style: generatedImage?.style || null,
          ...(generatedImage?.source === 'stock' && {
            image_source: 'stock',
            photographer_name: generatedImage.photographerName,
            photographer_url: generatedImage.photographerUrl,
          }),
        },
        status: 'draft' as const,
        image_url: generatedImage?.url || null,
        image_style: generatedImage?.style || null,
        ...(generatedImageId && { generated_image_id: generatedImageId }),
        ...(generatedTextId && { generated_text_id: generatedTextId }),
      }

      const url = editingContentId ? `/api/content/${editingContentId}` : '/api/content'
      const method = editingContentId ? 'PATCH' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingContentId ? { title: payload.title, content: payload.content, status: payload.status, metadata: payload.metadata } : payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save content')
      }

      setSaveSuccess(true)
      setTimeout(() => router.push('/dashboard/library'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const handleRateImage = async (rating: number, feedbackReasons?: string[]) => {
    if (!generatedImageId) return
    try {
      await fetch(`/api/generated-images/${generatedImageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback_reasons: feedbackReasons || [] })
      })
      setImageRating(rating)
    } catch (_) {}
  }

  const handlePickStockImage = async (opt: StockOption) => {
    setSelectedStockImage(opt)
    // Keep step3AIImage so user can switch back to AI without losing it
    setAppliedBrandingForImageUrl(null)
    setGeneratedImage({
      url: opt.url,
      style: imageStyle,
      generatedAt: new Date().toISOString(),
      source: 'stock',
      attribution: opt.attribution,
      photographerName: opt.photographerName,
      photographerUrl: opt.photographerUrl,
    })
    if (opt.downloadLocation) {
      try {
        await fetch('/api/stock-images/trigger-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ downloadLocation: opt.downloadLocation }),
        })
      } catch (_) {}
    }
  }

  const handleGenerateStep3AiImage = async (styleOverride?: ImageStyleKey) => {
    setGeneratingAiImage(true)
    setError('')
    const styleToUse = styleOverride ?? imageStyle
    try {
      const res = await fetch('/api/content/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          industry,
          businessName,
          style: styleToUse,
          subVariation: subVariation ?? undefined,
          contentType: selectedTemplate,
          postType: selectedTemplate,
          brandPrimaryColor: currentBusiness?.brand_primary_color ?? undefined,
          brandSecondaryColor: currentBusiness?.brand_secondary_color ?? undefined,
          brandAccentColor: currentBusiness?.brand_accent_color ?? undefined,
          preferredStyles: currentBusiness?.preferred_image_styles ?? undefined,
          avoidStyles: currentBusiness?.avoid_image_styles ?? undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate image')
      setStep3AIImage({ url: data.url, style: data.style, size: data.size, generated_image_id: data.generated_image_id })
      setSelectedStockImage(null)
      setGeneratedImage({
        url: data.url,
        style: data.style,
        generatedAt: new Date().toISOString(),
        source: 'ai',
      })
      if (data.generated_image_id) setGeneratedImageId(data.generated_image_id)
      if (data.imagesRemaining != null) setImagesRemaining(data.imagesRemaining)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate image')
    } finally {
      setGeneratingAiImage(false)
    }
  }

  // A/B Style Compare: generate 3 images in parallel with different styles
  const handleCompareStyles = async () => {
    if (comparingStyles) return
    setComparingStyles(true)
    setShowCompare(true)
    // Pick 3 different styles to compare (current + 2 random others)
    const allStyles = Object.keys(IMAGE_STYLES) as ImageStyleKey[]
    const stylesToCompare: ImageStyleKey[] = [imageStyle]
    const otherStyles = allStyles.filter(s => s !== imageStyle)
    for (let i = 0; i < 2 && otherStyles.length > 0; i++) {
      const idx = Math.floor(Math.random() * otherStyles.length)
      stylesToCompare.push(otherStyles.splice(idx, 1)[0])
    }
    setCompareImages(stylesToCompare.map(s => ({ url: '', style: s, loading: true })))
    // Generate in parallel
    const results = await Promise.allSettled(
      stylesToCompare.map(async (s) => {
        const res = await fetch('/api/content/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            industry,
            businessName,
            style: s,
            contentType: selectedTemplate,
            brandPrimaryColor: currentBusiness?.brand_primary_color ?? undefined,
            brandSecondaryColor: currentBusiness?.brand_secondary_color ?? undefined,
            brandAccentColor: currentBusiness?.brand_accent_color ?? undefined,
          }),
        })
        const data = await res.json()
        return { url: data.url || '', style: s }
      })
    )
    const finalImages = results.map((r, i) => {
      if (r.status === 'fulfilled' && r.value.url) {
        return { url: r.value.url, style: r.value.style, loading: false }
      }
      return { url: '', style: stylesToCompare[i], loading: false }
    })
    setCompareImages(finalImages)
    setComparingStyles(false)
    if (finalImages.some(img => img.url)) {
      setImagesRemaining(prev => prev !== null ? Math.max(0, prev - finalImages.filter(img => img.url).length) : null)
    }
  }

  const handlePickCompareImage = (img: { url: string; style: string }) => {
    if (!img.url) return
    setStep3AIImage({ url: img.url, style: img.style, size: '1024x1024', generated_image_id: null })
    setGeneratedImage({ url: img.url, style: img.style, generatedAt: new Date().toISOString(), source: 'ai' })
    setSelectedStockImage(null)
    setAppliedBrandingForImageUrl(null)
    setShowCompare(false)
    setImageStyle(img.style as ImageStyleKey)
  }

  const handleStep3Upload = async (file: File) => {
    if (!file?.type.startsWith('image/')) return
    const form = new FormData()
    form.append('file', file, file.name)
    try {
      const res = await fetch('/api/image/upload-overlay', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed')
      setSelectedStockImage(null)
      // Keep step3AIImage so user can switch back to AI without losing it
      setAppliedBrandingForImageUrl(null)
      setGeneratedImage({ url: data.url, source: 'upload' })
      setGeneratedImageId(null)
      // Auto-save to image library in background
      const libForm = new FormData()
      libForm.append('file', file, file.name)
      fetch('/api/image-library', { method: 'POST', body: libForm }).catch(() => {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  const handlePickLibraryImage = (url: string) => {
    setSelectedStockImage(null)
    setAppliedBrandingForImageUrl(null)
    setGeneratedImage({ url, source: 'library' })
    setGeneratedImageId(null)
  }

  const handleRateText = async (rating: number, feedbackReasons?: string[]) => {
    if (!generatedTextId) return
    try {
      await fetch(`/api/generated-texts/${generatedTextId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback_reasons: feedbackReasons || [] })
      })
      setTextRating(rating)
    } catch (_) {}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h10M7 16h6" />
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
          <span className="w-6 h-6 flex items-center justify-center text-teal-600 font-bold text-2xl leading-none">G</span>
        )
      case 'email':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="-m-4 -mt-20 lg:-m-6 lg:-mt-6 p-4 pt-20 lg:p-6 lg:pt-6 min-h-screen"
      style={
        {
          ['--brand-primary']: primary,
          ['--brand-secondary']: secondary,
          ['--brand-accent']: accent,
          background: `linear-gradient(180deg, ${hexToRgba(primary, 0.14)} 0%, ${hexToRgba(secondary, 0.10)} 50%, ${hexToRgba(primary, 0.12)} 100%)`,
        } as React.CSSProperties
      }
    >
    <div className="pt-8 sm:pt-10 pb-20 sm:pb-28 px-4 sm:px-6">
      {/* Top bar: client logo (top-left, as big as fits) + page title */}
      <div className={`flex items-start gap-4 mb-6 pb-6 pt-4 px-4 sm:px-5 ${step === 3 ? 'border-b border-gray-200/60' : 'border-b rounded-xl'}`} style={step === 3 ? undefined : { backgroundColor: hexToRgba(primary, 0.16), borderColor: hexToRgba(primary, 0.35) }}>
        <div className="flex-shrink-0 w-24 sm:w-28 md:w-32">
          {currentBusinessLogo ? (
            <img
              src={currentBusinessLogo}
              alt={currentBusiness?.name ? `${currentBusiness.name} logo` : 'Brand logo'}
              className="w-full h-auto object-contain"
              style={{ maxHeight: 80 }}
            />
          ) : (
            <div
              className="w-full aspect-square max-h-20 rounded-lg flex items-center justify-center text-gray-300 text-xs font-medium border border-dashed border-gray-200"
              style={{ backgroundColor: hexToRgba(primary, 0.14) }}
            >
              Your logo
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Content</h1>
          <p className="text-gray-500 text-sm">Generate AI-powered, locally-optimized content in minutes</p>
        </div>
      </div>

    <div className={`pb-12 sm:pb-16 ${step === 3 ? 'w-full max-w-full' : 'max-w-4xl mx-auto'}`}>
      {/* Progress Steps */}
      <div className={`flex items-center mb-8 p-4 transition-all duration-300 ${step === 3 ? '' : 'rounded-xl border shadow-sm'}`} style={step === 3 ? undefined : { backgroundColor: hexToRgba(primary, 0.14), borderColor: hexToRgba(primary, 0.35) }}>
        <div className={`flex items-center transition-colors duration-300 ${step >= 1 ? '' : 'text-gray-400'}`} style={step >= 1 ? { color: primary } : undefined}>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${step >= 1 ? 'text-white' : 'bg-gray-100 text-gray-500'}`}
            style={step >= 1 ? { backgroundColor: primary } : undefined}
          >
            {step > 1 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : '1'}
          </div>
          <span className="ml-3 font-medium hidden sm:block">Template</span>
        </div>
        <div className="flex-1 h-1 mx-4 rounded transition-colors duration-300 bg-gray-200" style={step >= 2 ? { backgroundColor: primary } : undefined}></div>
        <div className={`flex items-center transition-colors duration-300 ${step >= 2 ? '' : 'text-gray-400'}`} style={step >= 2 ? { color: primary } : undefined}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${step >= 2 ? 'text-white' : 'bg-gray-100 text-gray-500'}`} style={step >= 2 ? { backgroundColor: primary } : undefined}>
            {step > 2 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : '2'}
          </div>
          <span className="ml-3 font-medium hidden sm:block">Details</span>
        </div>
        <div className="flex-1 h-1 mx-4 rounded transition-colors duration-300 bg-gray-200" style={step >= 3 ? { backgroundColor: primary } : undefined}></div>
        <div className={`flex items-center transition-colors duration-300 ${step >= 3 ? '' : 'text-gray-400'}`} style={step >= 3 ? { color: primary } : undefined}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${step >= 3 ? 'text-white' : 'bg-gray-100 text-gray-500'}`} style={step >= 3 ? { backgroundColor: primary } : undefined}>3</div>
          <span className="ml-3 font-medium hidden sm:block">Branding</span>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-xl mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Saved! Taking you to your library…</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {loadingEdit && (
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-500">Loading content...</p>
        </div>
      )}

      {/* Step 1: Choose Template */}
      {!loadingEdit && step === 1 && (
        <div>
          {/* Inspiring Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              What do you want to create today?
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" style={{ color: accent }}>
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </h2>
            <p className="text-gray-500">Pick a content type and we’ll guide you through the rest</p>
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
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 transition-all hover:shadow-md"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.backgroundColor = hexToRgba(primary, 0.08) }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.backgroundColor = '' }}
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
              const colorClasses = getColorClasses(template.color, selectedTemplate === template.id)
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    setStep(2)
                  }}
                  className={`p-5 border-2 rounded-xl text-left transition-all duration-200 ${colorClasses.bg} ${colorClasses.border} relative hover:-translate-y-1 hover:shadow-lg`}
                  style={{ ...colorClasses.bgStyle, ...colorClasses.borderStyle }}
                >
                  {/* Badges - use brand accent/primary */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {template.popular && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1" style={{ backgroundColor: hexToRgba(accent, 0.9), color: '#fff' }}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        Most Popular
                      </span>
                    )}
                    {template.badge && (
                      <span className="px-2 py-0.5 text-white text-xs font-medium rounded-full" style={{ backgroundColor: primary }}>
                        {template.badge}
                      </span>
                    )}
                  </div>

                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${colorClasses.icon}`} style={colorClasses.iconStyle}>
                    {getTemplateIcon(template.id)}
                  </div>
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  {'benefit' in template && (template as { benefit?: string }).benefit && (
                    <p className="text-xs mt-1 font-medium" style={{ color: primary }}>{(template as { benefit: string }).benefit}</p>
                  )}
                  {/* Time Estimate */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5" style={{ color: accent }} fill="currentColor" viewBox="0 0 24 24">
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
      {!loadingEdit && step === 2 && (
        <div className="rounded-xl border shadow-sm p-6" style={{ backgroundColor: hexToRgba(primary, 0.12), borderColor: hexToRgba(primary, 0.4) }}>
          <p className="text-sm font-medium mb-0.5" style={{ color: primary }}>You're creating a {templates.find(t => t.id === selectedTemplate)?.name || 'piece of content'}</p>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Tell us what it's about</h2>
          
          {/* Business Selection */}
          {businesses.length > 1 ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Business</label>
              <select
                value={selectedBusinessId || ''}
                onChange={(e) => handleBusinessChange(e.target.value)}
                className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 outline-none bg-white focus:border-transparent"
                style={{ ['--tw-ring-color' as string]: primary } as React.CSSProperties}
              >
                {businesses.map((biz) => (
                  <option key={biz.id} value={biz.id}>
                    {biz.name} {biz.industry ? `(${biz.industry})` : ''}
                  </option>
                ))}
              </select>
              <a href="/dashboard/branding" className="text-xs mt-1 pl-2 inline-block hover:opacity-90" style={{ color: primary }}>
                Brand Identity
              </a>
            </div>
          ) : businessName ? (
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
              <span>Creating for:</span>
              <span className="font-medium text-gray-900">{businessName}</span>
              {industry && <span className="text-gray-400">({industry})</span>}
              <a href="/dashboard/settings" className="ml-1 hover:opacity-90" style={{ color: primary }}>edit</a>
            </div>
          ) : (
            <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: hexToRgba(accent, 0.12), borderWidth: 1, borderColor: hexToRgba(accent, 0.4), color: '#92400e' }}>
              <a href="/dashboard/settings" className="font-medium underline">Set up your business profile</a> to get personalized content
            </div>
          )}
          
          <div className="space-y-5 max-w-lg">
            <div>
              {/* GBP Post Type Selector */}
            {selectedTemplate === 'gmb-post' && (
              <>
                {/* Info tip */}
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 -mt-2 mb-4">
                  💡 GBP posts are optimized for searchers ready to act: short, direct, benefit-first.
                  {gbpPostType === 'event' && (
                    <span className="block mt-1 text-xs text-blue-600">📸 Event posts support image uploads — Google recommends 720×540px (4:3 aspect ratio), JPG or PNG, 10 KB – 5 MB. You can add up to 10 images per event.</span>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
                  <select
                    value={gbpPostType}
                    onChange={(e) => setGbpPostType(e.target.value as GbpPostType)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none bg-white"
                  >
                    {Object.entries(GBP_POST_TYPES).map(([key, type]) => (
                      <option key={key} value={key}>
                        {type.emoji} {type.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-gray-500">
                    {GBP_POST_TYPES[gbpPostType].description}
                  </p>
                </div>
                
                {/* Offer Expiration */}
                {gbpPostType === 'offer' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Offer Expires In</label>
                    <select
                      value={offerExpiration}
                      onChange={(e) => setOfferExpiration(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none bg-white"
                    >
                      {OFFER_EXPIRATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {offerExpiration === 'custom' && (
                      <input
                        type="date"
                        value={offerCustomDate}
                        onChange={(e) => setOfferCustomDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-2 w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none"
                      />
                    )}
                    <p className="mt-1.5 text-xs text-gray-500">
                      Expires: {getExpirationDate()}
                    </p>
                  </div>
                )}
                
                {/* Event Date/Time */}
                {gbpPostType === 'event' && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Time</label>
                      <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            
            <label className="block text-sm font-medium text-gray-700 mb-2">What should the content be about?</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none transition-shadow resize-none"
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
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm' 
                        : 'bg-white border-gray-300 text-gray-700 shadow-sm hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* AI image style: used when user picks "Generate with AI" in Step 3 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI image style</label>
              <p className="text-xs text-gray-500 mb-3">Choose the look for AI-generated images (used when you select &quot;Generate with AI&quot; in the next step).</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(Object.entries(IMAGE_STYLES) as Array<[ImageStyleKey, typeof IMAGE_STYLES[ImageStyleKey]]>).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setImageStyle(key); setSubVariation(null) }}
                    className={`px-2.5 py-2.5 rounded-xl border-2 text-left transition-all ${
                      imageStyle === key
                        ? 'border-[var(--brand-primary)] shadow-sm'
                        : 'bg-white border-gray-200 text-gray-700 shadow-sm hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    style={imageStyle === key ? { backgroundColor: hexToRgba(primary, 0.08), borderColor: primary } : undefined}
                  >
                    <span className="block text-base mb-0.5">{config.icon}</span>
                    <span className="block font-medium text-xs">{config.name}</span>
                    <span className="block text-[10px] mt-0.5 opacity-70 leading-tight">{config.description}</span>
                  </button>
                ))}
              </div>
              {/* Sub-variation picker */}
              {Object.keys(IMAGE_STYLES[imageStyle].subVariations).length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">Sub-style for {IMAGE_STYLES[imageStyle].name}:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSubVariation(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${!subVariation ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                      style={!subVariation ? { backgroundColor: primary } : undefined}
                    >
                      Auto / Default
                    </button>
                    {Object.entries(IMAGE_STYLES[imageStyle].subVariations).map(([svKey, svConfig]) => (
                      <button
                        key={svKey}
                        type="button"
                        onClick={() => setSubVariation(svKey)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${subVariation === svKey ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                        style={subVariation === svKey ? { backgroundColor: primary } : undefined}
                      >
                        {svConfig.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 border-t border-gray-100 pt-5 mt-5">
              Next: choose your image (stock, AI, or upload), then add your branding.
            </p>

            <div className="flex flex-col gap-3 pt-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerate('all')}
                  disabled={
                    !businessName?.trim() ||
                    !industry?.trim() ||
                    !topic?.trim() ||
                    generating ||
                    (selectedTemplate === 'gmb-post' && gbpPostType === 'event' && !eventDate)
                  }
                  title={
                    generating
                      ? 'Generating...'
                      : !topic?.trim()
                        ? 'Enter what the content should be about (topic) above'
                        : !businessName?.trim()
                          ? 'Select or set up your business first'
                          : !industry?.trim()
                            ? 'Business industry is required'
                            : selectedTemplate === 'gmb-post' && gbpPostType === 'event' && !eventDate
                              ? 'Set event date and time for GBP event posts'
                              : undefined
                  }
                  className="flex-1 px-5 py-2.5 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 hover:opacity-95 disabled:hover:opacity-100"
                  style={{ backgroundColor: accent }}
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {selectedTemplate === 'social-pack' ? 'Generating 6 posts & images...' : 'Generating content & image...'}
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
              {!generating && (!businessName?.trim() || !industry?.trim() || !topic?.trim()) && (
                <p className="text-xs text-gray-500">
                  {!topic?.trim()
                    ? 'Enter what the content should be about above to enable Generate Content.'
                    : !businessName?.trim()
                      ? 'Set up or select a business to continue.'
                      : 'Add your business industry in Brand Identity or settings.'}
                </p>
              )}
            </div>
            
            {/* Progress Bar */}
            {generating && (
              <div className="mt-6">
                <GenerationProgress 
                  isGenerating={generating} 
                  contentType={selectedTemplate as 'social-pack' | 'blog-post' | 'gmb-post' | 'email' || 'general'}
                  startTime={generationStartTime ?? undefined}
                  size="lg"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Branding - Social Pack */}
      {!loadingEdit && step === 3 && selectedTemplate === 'social-pack' && socialPack && (
        <div className="w-full">
          {/* Header with Actions at Top */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 pt-4">
            <div className="flex items-center gap-3">
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
            
            {/* Action Buttons at Top */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
              >
                Back
              </button>
              {/* Regenerate Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRegenerateMenuOpen(!regenerateMenuOpen)}
                  disabled={generating}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {generating ? 'Regenerating...' : 'Regenerate'}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {regenerateMenuOpen && !generating && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => { setRegenerateMenuOpen(false); handleGenerate('text') }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h10M7 16h6" />
                      </svg>
                      Text only
                    </button>
                    <button
                      onClick={() => { setRegenerateMenuOpen(false); handleRegenerateAllImages() }}
                      disabled={imagesRemaining === 0}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100 rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      All images
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !generatedImage}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
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
          
          {/* Step 3: Choose your image (3 stock + 1 AI + 1 upload), then branding overlays */}
          <div className="mb-6 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Choose your image</h3>
                <p className="text-xs text-gray-500">Then add your logo, colours and text below.</p>
              </div>
              <button
                type="button"
                onClick={() => handleRegenerateAllImages()}
                disabled={generating}
                className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-white"
                style={{ backgroundColor: primary }}
              >
                {generating ? (
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                )}
                Generate all (images)
              </button>
            </div>
            {/* Row 1: Suggested — 3 stock + 1 AI */}
            <div className="mb-3">
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Suggested</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {step3StockLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
                  ))
                ) : (
                  stockImageOptions.slice(0, 3).map((opt, i) => (
                    <div key={i} className="flex flex-col">
                      <button type="button" onClick={() => handlePickStockImage(opt)} className={`relative aspect-square w-full rounded-t-lg overflow-hidden border-2 border-b-0 transition-all ${generatedImage?.source === 'stock' && selectedStockImage?.url === opt.url ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-gray-300'}`}>
                        {regeneratingStockIndex === i && <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40 z-10"><svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>}
                        <img src={opt.url} alt="" className="w-full h-full object-cover" />
                        {generatedImage?.source === 'stock' && selectedStockImage?.url === opt.url && <span className="absolute top-1 right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>}
                      </button>
                      <div className="flex items-center justify-between px-2 py-1.5 rounded-b-lg border-2 border-t-0 border-gray-200 bg-gray-50">
                        <span className="text-[10px] font-medium text-gray-600">Stock</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRegenerateStockSlot(i) }} disabled={regeneratingStockIndex === i} className="text-[10px] font-medium text-gray-700 hover:text-teal-600 disabled:opacity-50">New</button>
                      </div>
                    </div>
                  ))
                )}
                {/* AI image */}
                <div className="flex flex-col">
                  <button type="button" onClick={() => { if (step3AIImage) { setAppliedBrandingForImageUrl(null); setGeneratedImage({ url: step3AIImage.url, style: step3AIImage.style, generatedAt: new Date().toISOString(), source: 'ai' }); setGeneratedImageId(step3AIImage.generated_image_id || null); setSelectedStockImage(null) } else { handleGenerateStep3AiImage() } }} disabled={generatingAiImage || imagesRemaining === 0} className={`relative aspect-square w-full rounded-t-lg overflow-hidden border-2 border-b-0 transition-all flex flex-col items-center justify-center bg-white ${generatedImage?.source === 'ai' ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-gray-300'} ${(generatingAiImage || imagesRemaining === 0) ? 'opacity-70' : ''}`}>
                    {generatingAiImage ? (
                      <svg className="animate-spin w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    ) : step3AIImage ? (
                      <>
                        <img src={step3AIImage.url} alt="" className="w-full h-full object-cover absolute inset-0" />
                        {generatedImage?.source === 'ai' && <span className="absolute top-1 right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white z-10"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>}
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-xs text-gray-600">AI</span>
                        {imagesRemaining === 0 && <span className="text-[10px] text-red-600 mt-0.5">Limit reached</span>}
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-b-lg border-2 border-t-0 border-gray-200 bg-gray-50">
                    <span className="text-[10px] font-medium text-gray-600">AI</span>
                    {step3AIImage && !generatingAiImage && imagesRemaining !== 0 ? (
                      <div ref={aiRegenerateMenuRef} className="relative">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setAiRegenerateMenuOpen(!aiRegenerateMenuOpen) }} className="text-[10px] font-medium text-gray-700 hover:text-teal-600 flex items-center gap-0.5">New <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                        {aiRegenerateMenuOpen && (
                          <div className="absolute right-0 top-full mt-0.5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 max-h-64 overflow-y-auto">
                            <button type="button" onClick={() => { setAiRegenerateMenuOpen(false); handleGenerateStep3AiImage() }} className="w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-50 font-medium">Same style</button>
                            <div className="border-t border-gray-100 my-0.5" />
                            {(Object.entries(IMAGE_STYLES) as Array<[ImageStyleKey, typeof IMAGE_STYLES[ImageStyleKey]]>).map(([key, config]) => (
                              <button key={key} type="button" onClick={() => { setAiRegenerateMenuOpen(false); handleGenerateStep3AiImage(key) }} className="w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-50">
                                <span className="mr-1">{config.icon}</span> {config.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : !step3AIImage && !generatingAiImage && imagesRemaining !== 0 ? (
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleGenerateStep3AiImage() }} className="text-[10px] font-medium text-teal-600 hover:underline">Generate</button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Compare Styles */}
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCompareStyles}
                disabled={comparingStyles || imagesRemaining === 0 || !topic?.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                {comparingStyles ? 'Comparing...' : 'Compare 3 AI Styles'}
              </button>
              <span className="text-[10px] text-amber-600">Uses 3 AI image credits</span>
            </div>
            {showCompare && compareImages.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Style Comparison</p>
                  <button type="button" onClick={() => setShowCompare(false)} className="text-[10px] text-gray-400 hover:text-gray-600">Close</button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {compareImages.map((img, i) => (
                    <div key={i} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => handlePickCompareImage(img)}
                        disabled={!img.url || img.loading}
                        className={`relative aspect-square w-full rounded-t-lg overflow-hidden border-2 transition-all ${img.url && generatedImage?.url === img.url ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-gray-300'} ${!img.url && !img.loading ? 'bg-red-50' : 'bg-white'}`}
                      >
                        {img.loading ? (
                          <div className="flex items-center justify-center h-full">
                            <svg className="animate-spin w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          </div>
                        ) : img.url ? (
                          <img src={img.url} alt={img.style} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-red-400">Failed</div>
                        )}
                      </button>
                      <div className="px-2 py-1.5 rounded-b-lg border-2 border-t-0 border-gray-200 bg-white text-center">
                        <span className="text-[10px] font-medium text-gray-700">
                          {(IMAGE_STYLES[img.style as ImageStyleKey]?.icon || '')} {IMAGE_STYLES[img.style as ImageStyleKey]?.name || img.style}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">Click an image to select it</p>
              </div>
            )}

            {/* Row 2: My Library */}
            {(libraryImages.length > 0 || libraryLoading) && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">My Library</p>
                  <a href="/dashboard/image-library" className="text-[11px] font-medium text-teal-600 hover:underline">Browse all</a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {libraryLoading ? (
                    [...Array(4)].map((_, i) => <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />)
                  ) : (
                    libraryImages.slice(0, 4).map(img => (
                      <button key={img.id} type="button" onClick={() => handlePickLibraryImage(img.public_url)} className={`relative aspect-square w-full rounded-lg overflow-hidden border-2 transition-all ${generatedImage?.url === img.public_url ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-gray-300'}`}>
                        <img src={img.public_url} alt={img.filename} className="w-full h-full object-cover" />
                        {generatedImage?.url === img.public_url && <span className="absolute top-1 right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Row 3: Upload + Take Photo */}
            <div className="mb-2">
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Your own</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Upload */}
                <div className="flex flex-col">
                  <button type="button" onClick={() => step3UploadInputRef.current?.click()} className={`relative aspect-square w-full rounded-t-lg overflow-hidden border-2 border-b-0 border-dashed transition-all flex flex-col items-center justify-center bg-white ${generatedImage?.source === 'upload' ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50/30'}`}>
                    <input ref={step3UploadInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleStep3Upload(f); e.target.value = '' }} />
                    {generatedImage?.source === 'upload' ? (
                      <img src={generatedImage.url} alt="" className="w-full h-full object-cover absolute inset-0" />
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="text-xs text-gray-600">Upload</span>
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-b-lg border-2 border-t-0 border-gray-200 bg-gray-50">
                    <span className="text-[10px] font-medium text-gray-600">{generatedImage?.source === 'upload' ? 'Your image' : 'Upload'}</span>
                    {generatedImage?.source === 'upload' && <button type="button" onClick={(e) => { e.stopPropagation(); step3UploadInputRef.current?.click() }} className="text-[10px] font-medium text-gray-700 hover:text-teal-600">Replace</button>}
                  </div>
                </div>
                {/* Take Photo */}
                <div className="flex flex-col">
                  <button type="button" onClick={() => step3CameraInputRef.current?.click()} className="relative aspect-square w-full rounded-t-lg overflow-hidden border-2 border-b-0 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50/30 transition-all flex flex-col items-center justify-center bg-white">
                    <input ref={step3CameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleStep3Upload(f); e.target.value = '' }} />
                    <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-xs text-gray-600">Take photo</span>
                  </button>
                  <div className="px-2 py-1.5 rounded-b-lg border-2 border-t-0 border-gray-200 bg-gray-50">
                    <span className="text-[10px] font-medium text-gray-600">Camera</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Stock from Unsplash · AI uses your quota · Uploads auto-save to your library.</p>
          </div>
          
          {/* Progress Bar for Regeneration */}
          {generating && (
            <div className="mb-6">
              <GenerationProgress 
                isGenerating={generating} 
                contentType="social-pack"
                startTime={generationStartTime ?? undefined}
                size="md"
              />
            </div>
          )}

          {/* Progress: Applying recommended branding */}
          {brandingRecommendationLoading && (
            <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: hexToRgba(primary, 0.08), borderColor: hexToRgba(primary, 0.3) }}>
              <p className="text-sm font-medium mb-2" style={{ color: primary }}>Applying branding…</p>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: hexToRgba(primary, 0.2) }}>
                <div className="h-full rounded-full animate-pulse w-3/4" style={{ backgroundColor: primary, animationDuration: '1.2s' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: primary }}>Preparing your recommended logo, overlay and tint…</p>
            </div>
          )}

          {/* Image Overlay Editor - Drag & Drop Logo/Photo (or upload here) */}
          {generatedImage && showOverlayEditor ? (
            <div className="mb-6">
              {overlayError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {overlayError}
                </div>
              )}
              <ImageOverlayEditor
                key={suggestedBrandingBaseImageUrl || generatedImage.url}
                imageUrl={suggestedBrandingBaseImageUrl || generatedImage.url}
                logoUrl={currentBusinessLogo}
                photoUrl={currentBusinessPhoto}
                brandColors={getBrandColors()}
                tagline={currentBusiness?.tagline ?? undefined}
                website={currentBusiness?.website ?? undefined}
                socialHandles={currentBusiness?.social_handles ?? undefined}
                onApply={handleApplyOverlays}
                onSkip={() => { setShowOverlayEditor(false); setLogoSkipped(true); setPhotoSkipped(true); }}
                applying={applyingLogo}
                onUploadLogo={selectedBusinessId ? handleUploadLogoInEditor : undefined}
                onUploadPhoto={selectedBusinessId ? handleUploadPhotoInEditor : undefined}
                initialState={suggestedBrandingBaseImageUrl && initialOverlayState ? initialOverlayState : (appliedBrandingForImageUrl === generatedImage.url ? initialOverlayState : null)}
              />
            </div>
          ) : generatedImage && showTextOverlay ? (
            <div className="mb-6">
              {overlayError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {overlayError}
                </div>
              )}
              <ImageTextOverlay
                imageUrl={generatedImage.url}
                suggestedTexts={[
                  topic || 'Your headline here',
                  businessName || 'Business Name',
                  `${topic} - ${businessName}`,
                  'Follow Us'
                ].filter(Boolean)}
                industry={industry}
                businessName={businessName}
                onSave={handleTextOverlaySave}
                onClose={() => { setShowTextOverlay(false); setOverlayError(null) }}
                matchPreviewSize
              />
            </div>
          ) : generatedImage && (
            <div className="mb-6 rounded-xl border overflow-hidden" style={{ backgroundColor: hexToRgba(primary, 0.06), borderColor: hexToRgba(primary, 0.25) }}>
              <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: hexToRgba(primary, 0.2) }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm">{generatedImage.source === 'upload' ? 'Your image' : 'Generated Image'}</h3>
                    {generatedImage.source !== 'upload' && (
                      <p className="text-xs text-gray-500">Style: {IMAGE_STYLES[generatedImage.style as ImageStyleKey]?.name || generatedImage.style || '—'}</p>
                    )}
                    {generatedImage.source === 'stock' && (generatedImage.photographerName || generatedImage.attribution) && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        Photo by{' '}
                        {generatedImage.photographerUrl ? (
                          <a href={generatedImage.photographerUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{generatedImage.photographerName || 'Photographer'}</a>
                        ) : (
                          <span>{generatedImage.photographerName || 'Photographer'}</span>
                        )}{' '}
                        on <a href="https://unsplash.com?utm_source=geospark&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Unsplash</a>
                      </p>
                    )}
                    {generatedImage.source === 'ai' && generatedImage.attribution && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{generatedImage.attribution}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowTextOverlay(true)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Add Text
                  </button>
                  <button
                    onClick={() => setShowOverlayEditor(true)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 flex items-center gap-1"
                style={{ backgroundColor: hexToRgba(primary, 0.15), color: primary }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Customize
                  </button>
                  <button
                    onClick={() => revertToSuggestedBranding()}
                    disabled={brandingRecommendationLoading}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                style={{ backgroundColor: hexToRgba(accent, 0.2), color: '#92400e' }}
                    title="Re-apply the suggested branding (logo, overlay, tint, text)"
                  >
                    {brandingRecommendationLoading ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    Revert
                  </button>
                  <button
                    onClick={handleDownloadImage}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
              <div className="p-4 flex flex-col items-center rounded-b-xl" style={{ backgroundColor: hexToRgba(secondary, 0.08) }}>
                <SafeImage 
                  key={generatedImage.url}
                  src={generatedImage.url} 
                  alt="Generated content image" 
                  className="max-w-[280px] w-full rounded-lg shadow-sm aspect-square object-cover"
                  fallbackClassName="max-w-[280px] w-full aspect-square rounded-lg bg-gray-200"
                />
                {appliedBrandingForImageUrl === generatedImage.url && (
                  <p className="mt-2 text-xs text-teal-600">Recommended branding applied. Customize or add text below.</p>
                )}
              </div>
            </div>
          )}

          {/* In-flow rating: between customize-your-image and example blocks */}
          {(generatedTextId || generatedImageId || generatedImage) && (
            <div className="mb-6 p-4 rounded-lg border max-w-4xl mx-auto" style={{ backgroundColor: hexToRgba(accent, 0.08), borderColor: hexToRgba(accent, 0.2) }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <p className="text-sm font-medium text-gray-700">How was this?</p>
                <div className="flex flex-wrap items-center gap-8">
                  {generatedTextId && (
                    <div className="min-w-[200px]">
                      <RatingStars
                        type="text"
                        label="Rate this text"
                        value={textRating}
                        onChange={handleRateText}
                        onSkip={() => {}}
                        showSkip
                      />
                    </div>
                  )}
                  {generatedTextId && (generatedImageId || generatedImage) && (
                    <div className="hidden sm:block w-px h-8 bg-gray-300/60" />
                  )}
                  {(generatedImageId || generatedImage) && (
                    <div className="min-w-[200px]">
                      <RatingStars
                        type="image"
                        label="Rate this image"
                        value={imageRating}
                        onChange={handleRateImage}
                        onSkip={() => {}}
                        showSkip
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-6 max-w-4xl mx-auto">
            {(Object.keys(socialPack) as Array<keyof SocialPackResult>).map((platform) => {
              const info = platformInfo[platform]
              const post = socialPack[platform]
              const fullContent = platform === 'instagram' 
                ? `${post.content}\n\n${(post as typeof socialPack.instagram).hashtags}`
                : post.content

              // Platform-specific mockup rendering
              const renderPlatformMockup = () => {
                switch (platform) {
                  case 'twitter':
                    return (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* X/Twitter Mockup */}
                        <div className="p-4">
                          <div className="flex gap-3">
                            {currentBusinessLogo ? (
                              <img src={currentBusinessLogo} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                {businessName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-gray-900 text-sm truncate">{businessName}</span>
                                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/></svg>
                              </div>
                              <span className="text-gray-500 text-sm">@{businessName.toLowerCase().replace(/\s+/g, '')} · 1m</span>
                              <p className="mt-2 text-gray-900 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                              {generatedImage && (
                                <div className="mt-3 w-full aspect-[16/9] rounded-2xl overflow-hidden border border-gray-200">
                                  <img key={generatedImage.url} src={generatedImage.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                              )}
                              <div className="flex justify-between mt-3 text-gray-500">
                                <button className="flex items-center gap-1 hover:text-blue-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg><span className="text-xs">12</span></button>
                                <button className="flex items-center gap-1 hover:text-green-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg><span className="text-xs">48</span></button>
                                <button className="flex items-center gap-1 hover:text-pink-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg><span className="text-xs">156</span></button>
                                <button className="flex items-center gap-1 hover:text-blue-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )

                  case 'facebook':
                    return (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Facebook Mockup */}
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            {currentBusinessLogo ? (
                              <img src={currentBusinessLogo} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                {businessName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900 text-[15px]">{businessName}</div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>Just now</span>
                                <span>·</span>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14.5c-.28.28-.72.28-1 0L12 13l-3.5 3.5c-.28.28-.72.28-1 0s-.28-.72 0-1L11 12 7.5 8.5c-.28-.28-.28-.72 0-1s.72-.28 1 0L12 11l3.5-3.5c.28-.28.72-.28 1 0s.28.72 0 1L13 12l3.5 3.5c.28.28.28.72 0 1z"/></svg>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-900 text-[15px] leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>
                        </div>
                        {generatedImage && (
                          <div className="w-full aspect-[1.91/1] overflow-hidden">
                            <img key={generatedImage.url} src={generatedImage.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div className="px-4 pt-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500 pb-2 border-b border-gray-100">
                            <span className="flex -space-x-1">
                              <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px]">👍</span>
                              <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px]">❤️</span>
                            </span>
                            <span className="ml-1">24</span>
                          </div>
                          <div className="flex justify-around pt-2">
                            <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg><span className="text-sm font-medium">Like</span></button>
                            <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg><span className="text-sm font-medium">Comment</span></button>
                            <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg><span className="text-sm font-medium">Share</span></button>
                          </div>
                        </div>
                      </div>
                    )

                  case 'instagram':
                    return (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Instagram Mockup */}
                        <div className="flex items-center justify-between p-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            {currentBusinessLogo ? (
                              <img src={currentBusinessLogo} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-500" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700">
                                  {businessName.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            )}
                            <span className="font-semibold text-sm text-gray-900">{businessName.toLowerCase().replace(/\s+/g, '')}</span>
                          </div>
                          <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>
                        </div>
                        {generatedImage ? (
                          <div className="w-full aspect-square">
                            <img key={generatedImage.url} src={generatedImage.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="w-full aspect-square bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center">
                            <span className="text-4xl">📸</span>
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex justify-between mb-3">
                            <div className="flex gap-4">
                              <svg className="w-6 h-6 text-gray-900 hover:text-gray-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                              <svg className="w-6 h-6 text-gray-900 hover:text-gray-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                              <svg className="w-6 h-6 text-gray-900 hover:text-gray-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            </div>
                            <svg className="w-6 h-6 text-gray-900 hover:text-gray-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                          </div>
                          <div className="font-semibold text-sm text-gray-900 mb-1">127 likes</div>
                          <p className="text-sm text-gray-900"><span className="font-semibold">{businessName.toLowerCase().replace(/\s+/g, '')}</span> {post.content}</p>
                          {(post as typeof socialPack.instagram).hashtags && (
                            <p className="text-sm text-blue-900 mt-1">{(post as typeof socialPack.instagram).hashtags}</p>
                          )}
                        </div>
                      </div>
                    )

                  case 'linkedin':
                    return (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* LinkedIn Mockup */}
                        <div className="p-4">
                          <div className="flex gap-3 mb-3">
                            {currentBusinessLogo ? (
                              <img src={currentBusinessLogo} alt="" className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold">
                                {businessName.charAt(0).toUpperCase()}
                              </div>
                            )}
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
                          <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>
                        </div>
                        {generatedImage && (
                          <div className="w-full aspect-[1.91/1] overflow-hidden">
                            <img key={generatedImage.url} src={generatedImage.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div className="px-4 pt-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500 pb-3 border-b border-gray-100">
                            <span className="flex -space-x-1">
                              <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px]">👍</span>
                              <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px]">👏</span>
                              <span className="w-4 h-4 rounded-full bg-red-400 flex items-center justify-center text-white text-[8px]">❤️</span>
                            </span>
                            <span>42</span>
                            <span className="ml-auto">8 comments</span>
                          </div>
                          <div className="flex justify-around pt-2">
                            <button className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded transition-colors text-sm font-medium"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>Like</button>
                            <button className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded transition-colors text-sm font-medium"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>Comment</button>
                            <button className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded transition-colors text-sm font-medium"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Repost</button>
                            <button className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded transition-colors text-sm font-medium"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>Send</button>
                          </div>
                        </div>
                      </div>
                    )

                  case 'tiktok':
                    return (
                      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                        {/* TikTok Mockup - Vertical style */}
                        <div className="relative">
                          {generatedImage ? (
                            <div className="w-full aspect-[9/16]">
                              <img key={generatedImage.url} src={generatedImage.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          ) : (
                            <div className="w-full aspect-[9/16] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                              <span className="text-6xl">🎵</span>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex items-end gap-3">
                              <div className="flex-1">
                                <div className="font-semibold text-white text-sm mb-1">@{businessName.toLowerCase().replace(/\s+/g, '')}</div>
                                <p className="text-white text-sm leading-relaxed">{post.content}</p>
                                <div className="flex items-center gap-2 mt-2 text-white/80 text-xs">
                                  <span>🎵</span>
                                  <span className="truncate">Original sound - {businessName}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-center gap-4 text-white">
                                <div className="text-center"><svg className="w-8 h-8 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12.1 18.55l-.1.1-.11-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04 1 3.57 2.36h1.86C13.46 6 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg><span className="text-xs">2.4K</span></div>
                                <div className="text-center"><svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg><span className="text-xs">89</span></div>
                                <div className="text-center"><svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg><span className="text-xs">Share</span></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )

                  case 'nextdoor':
                    return (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Nextdoor Mockup */}
                        <div className="bg-green-600 px-4 py-2 flex items-center gap-2">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>
                          <span className="text-white font-semibold text-sm">Nextdoor</span>
                        </div>
                        <div className="p-4">
                          <div className="flex gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                              {businessName.charAt(0).toUpperCase()}
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
                          <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>
                        </div>
                        {generatedImage && (
                          <div className="w-full aspect-[1.91/1] overflow-hidden">
                            <img key={generatedImage.url} src={generatedImage.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div className="px-4 py-2">
                          <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
                            <button className="flex items-center gap-1 hover:text-green-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>Thank</button>
                            <button className="flex items-center gap-1 hover:text-green-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>Reply</button>
                            <button className="flex items-center gap-1 hover:text-green-600 transition-colors ml-auto"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>Share</button>
                          </div>
                        </div>
                      </div>
                    )

                  default:
                    return null
                }
              }

              return (
                <div key={platform} className="relative group">
                  {/* Platform Badge */}
                  <div className={`absolute -top-3 left-4 z-10 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm ${info.bgColor} ${info.color} border border-white`}>
                    {info.icon}
                    <span>{info.name}</span>
                  </div>
                  {renderPlatformMockup()}
                  {/* Copy button overlay */}
                  <button
                    onClick={() => handleCopy(fullContent, platform)}
                    className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 shadow-lg ${
                      copied === platform 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white/90 backdrop-blur text-gray-700 hover:bg-white opacity-0 group-hover:opacity-100'
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
              )
            })}
          </div>
        </div>
      )}

      {/* Step 3: Branding - Regular Content (Blog, GMB, Email) */}
      {!loadingEdit && step === 3 && selectedTemplate !== 'social-pack' && (
        <div>
          {/* Header with Actions at Top */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Review your content</h2>
                <p className="text-gray-500 text-sm">Copy, edit, or save to your library</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AI Generated
              </span>
            </div>
            
            {/* Action Buttons at Top */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
              >
                Back
              </button>
              {/* Regenerate Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRegenerateMenuOpen(!regenerateMenuOpen)}
                  disabled={generating}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {generating ? 'Regenerating...' : 'Regenerate'}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {regenerateMenuOpen && !generating && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => { setRegenerateMenuOpen(false); handleGenerate('text') }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Text only
                    </button>
                    <button
                      onClick={() => { setRegenerateMenuOpen(false); handleRegenerateAllImages() }}
                      disabled={imagesRemaining === 0}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100 rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      All images
                    </button>
                  </div>
                )}
              </div>
              {/* Main Copy Button */}
              <button
                onClick={viewMode === 'preview' ? handleCopyFormatted : () => handleCopy(generatedContent)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
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
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !generatedImage}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                title="Save to library"
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
                    Save to library
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Ready to save to your library when you're done.</p>
          </div>
          
          {/* Step 3: Choose your image — row-based layout */}
          <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: hexToRgba(primary, 0.1), borderColor: hexToRgba(primary, 0.28) }}>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Pick the look that fits your message</h3>
            <p className="text-xs text-gray-500 mb-4">Then add your logo, colours and text below.</p>

            {/* Row 1: Suggested — 3 stock + 1 AI */}
            <div className="mb-3">
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Suggested</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {step3StockLoading ? [...Array(3)].map((_, i) => <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />) : stockImageOptions.slice(0, 3).map((opt, i) => (
                  <div key={i} className="flex flex-col">
                    <button type="button" onClick={() => handlePickStockImage(opt)} className={`relative aspect-square w-full rounded-t-lg overflow-hidden border-2 border-b-0 transition-all ${generatedImage?.source === 'stock' && selectedStockImage?.url === opt.url ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-gray-300'}`}>
                      {regeneratingStockIndex === i && <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40 z-10"><svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>}
                      <img src={opt.url} alt="" className="w-full h-full object-cover" />
                      {generatedImage?.source === 'stock' && selectedStockImage?.url === opt.url && <span className="absolute top-1 right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>}
                    </button>
                    <div className="flex items-center justify-between px-2 py-1.5 rounded-b-lg border-2 border-t-0 border-gray-200 bg-gray-50">
                      <span className="text-[10px] font-medium text-gray-600">Stock</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleRegenerateStockSlot(i) }} disabled={regeneratingStockIndex === i} className="text-[10px] font-medium text-gray-700 hover:text-teal-600 disabled:opacity-50">New</button>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col">
                  <button type="button" onClick={() => { if (step3AIImage) { setAppliedBrandingForImageUrl(null); setGeneratedImage({ url: step3AIImage.url, style: step3AIImage.style, generatedAt: new Date().toISOString(), source: 'ai' }); setGeneratedImageId(step3AIImage.generated_image_id || null); setSelectedStockImage(null) } else { handleGenerateStep3AiImage() } }} disabled={generatingAiImage || imagesRemaining === 0} className={`relative aspect-square w-full rounded-t-lg overflow-hidden border-2 border-b-0 transition-all flex flex-col items-center justify-center bg-white ${generatedImage?.source === 'ai' ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-gray-300'} ${(generatingAiImage || imagesRemaining === 0) ? 'opacity-70' : ''}`}>
                    {generatingAiImage ? <svg className="animate-spin w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : step3AIImage ? <><img src={step3AIImage.url} alt="" className="w-full h-full object-cover absolute inset-0" />{generatedImage?.source === 'ai' && <span className="absolute top-1 right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white z-10"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>}</> : <><svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span className="text-xs text-gray-600">AI</span>{imagesRemaining === 0 && <span className="text-[10px] text-red-600 mt-0.5">Limit reached</span>}</>}
                  </button>
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-b-lg border-2 border-t-0 border-gray-200 bg-gray-50">
                    <span className="text-[10px] font-medium text-gray-600">AI</span>
                    {step3AIImage && !generatingAiImage && imagesRemaining !== 0 ? <button type="button" onClick={(e) => { e.stopPropagation(); handleGenerateStep3AiImage() }} className="text-[10px] font-medium text-teal-600 hover:underline">New</button> : !step3AIImage && !generatingAiImage && imagesRemaining !== 0 ? <button type="button" onClick={(e) => { e.stopPropagation(); handleGenerateStep3AiImage() }} className="text-[10px] font-medium text-teal-600 hover:underline">Generate</button> : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: My Library */}
            {(libraryImages.length > 0 || libraryLoading) && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">My Library</p>
                  <a href="/dashboard/image-library" className="text-[11px] font-medium text-teal-600 hover:underline">Browse all</a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {libraryLoading ? [...Array(4)].map((_, i) => <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />) : libraryImages.slice(0, 4).map(img => (
                    <button key={img.id} type="button" onClick={() => handlePickLibraryImage(img.public_url)} className={`relative aspect-square w-full rounded-lg overflow-hidden border-2 transition-all ${generatedImage?.url === img.public_url ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-gray-300'}`}>
                      <img src={img.public_url} alt={img.filename} className="w-full h-full object-cover" />
                      {generatedImage?.url === img.public_url && <span className="absolute top-1 right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Row 3: Upload + Take Photo */}
            <div className="mb-2">
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Your own</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex flex-col">
                  <button type="button" onClick={() => step3UploadInputRef.current?.click()} className={`relative aspect-square w-full rounded-t-lg overflow-hidden border-2 border-b-0 border-dashed transition-all flex flex-col items-center justify-center bg-white ${generatedImage?.source === 'upload' ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50/30'}`}>
                    <input ref={step3UploadInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleStep3Upload(f); e.target.value = '' }} />
                    {generatedImage?.source === 'upload' ? <img src={generatedImage.url} alt="" className="w-full h-full object-cover absolute inset-0" /> : <><svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg><span className="text-xs text-gray-600">Upload</span></>}
                  </button>
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-b-lg border-2 border-t-0 border-gray-200 bg-gray-50">
                    <span className="text-[10px] font-medium text-gray-600">{generatedImage?.source === 'upload' ? 'Your image' : 'Upload'}</span>
                    {generatedImage?.source === 'upload' && <button type="button" onClick={(e) => { e.stopPropagation(); step3UploadInputRef.current?.click() }} className="text-[10px] font-medium text-gray-700 hover:text-teal-600">Replace</button>}
                  </div>
                </div>
                <div className="flex flex-col">
                  <button type="button" onClick={() => step3CameraInputRef.current?.click()} className="relative aspect-square w-full rounded-t-lg overflow-hidden border-2 border-b-0 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50/30 transition-all flex flex-col items-center justify-center bg-white">
                    <input ref={step3CameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleStep3Upload(f); e.target.value = '' }} />
                    <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-xs text-gray-600">Take photo</span>
                  </button>
                  <div className="px-2 py-1.5 rounded-b-lg border-2 border-t-0 border-gray-200 bg-gray-50">
                    <span className="text-[10px] font-medium text-gray-600">Camera</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Stock from Unsplash · AI uses your quota · Uploads auto-save to your library.</p>
          </div>
          
          {/* Progress Bar for Regeneration */}
          {generating && (
            <div className="mb-6">
              <GenerationProgress 
                isGenerating={generating} 
                contentType={selectedTemplate as 'social-pack' | 'blog-post' | 'gmb-post' | 'email' || 'general'}
                startTime={generationStartTime ?? undefined}
                size="md"
              />
            </div>
          )}

          {/* Progress: Applying recommended branding */}
          {brandingRecommendationLoading && (
            <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: hexToRgba(primary, 0.08), borderColor: hexToRgba(primary, 0.3) }}>
              <p className="text-sm font-medium mb-2" style={{ color: primary }}>Applying branding…</p>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: hexToRgba(primary, 0.2) }}>
                <div className="h-full rounded-full animate-pulse w-3/4" style={{ backgroundColor: primary, animationDuration: '1.2s' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: primary }}>Preparing your recommended logo, overlay and tint…</p>
            </div>
          )}

          {/* Image Overlay Editor - same as social-pack flow */}
          {generatedImage && showOverlayEditor && (
            <div className="mb-6">
              {overlayError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {overlayError}
                </div>
              )}
              <ImageOverlayEditor
                key={suggestedBrandingBaseImageUrl || generatedImage.url}
                imageUrl={suggestedBrandingBaseImageUrl || generatedImage.url}
                logoUrl={currentBusinessLogo}
                photoUrl={currentBusinessPhoto}
                brandColors={getBrandColors()}
                tagline={currentBusiness?.tagline ?? undefined}
                website={currentBusiness?.website ?? undefined}
                socialHandles={currentBusiness?.social_handles ?? undefined}
                onApply={handleApplyOverlays}
                onSkip={() => { setShowOverlayEditor(false); setLogoSkipped(true); setPhotoSkipped(true); }}
                applying={applyingLogo}
                onUploadLogo={selectedBusinessId ? handleUploadLogoInEditor : undefined}
                onUploadPhoto={selectedBusinessId ? handleUploadPhotoInEditor : undefined}
                initialState={suggestedBrandingBaseImageUrl && initialOverlayState ? initialOverlayState : (appliedBrandingForImageUrl === generatedImage.url ? initialOverlayState : null)}
              />
            </div>
          )}
          {/* Generated Image Preview - hidden for blog posts (uses hero image) */}
          {generatedImage && !showOverlayEditor && selectedTemplate !== 'blog-post' && showTextOverlay && (
            <div className="mb-4">
              {overlayError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {overlayError}
                </div>
              )}
              <ImageTextOverlay
                imageUrl={generatedImage.url}
                suggestedTexts={[
                  topic || 'Your headline here',
                  businessName || 'Business Name',
                  selectedTemplate === 'gmb-post' ? 'Learn More' : 'Contact Us Today',
                  `${topic} - ${businessName}`
                ].filter(Boolean)}
                industry={industry}
                businessName={businessName}
                onSave={handleTextOverlaySave}
                onClose={() => { setShowTextOverlay(false); setOverlayError(null) }}
                matchPreviewSize
              />
            </div>
          )}
          {generatedImage && !showOverlayEditor && selectedTemplate !== 'blog-post' && !showTextOverlay && (
            <div className="mb-4 rounded-xl border overflow-hidden" style={{ backgroundColor: hexToRgba(primary, 0.06), borderColor: hexToRgba(primary, 0.25) }}>
              <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: hexToRgba(primary, 0.2) }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm">{generatedImage.source === 'upload' ? 'Your image' : 'Generated Image'}</h3>
                    {appliedBrandingForImageUrl === generatedImage.url && (
                      <p className="text-xs text-teal-600 font-medium mt-0.5">Your brand is on it</p>
                    )}
                    {generatedImage.source !== 'upload' && (
                      <p className="text-xs text-gray-500">Style: {IMAGE_STYLES[generatedImage.style as ImageStyleKey]?.name || generatedImage.style || '—'}</p>
                    )}
                    {generatedImage.source === 'stock' && (generatedImage.photographerName || generatedImage.attribution) && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        Photo by{' '}
                        {generatedImage.photographerUrl ? (
                          <a href={generatedImage.photographerUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{generatedImage.photographerName || 'Photographer'}</a>
                        ) : (
                          <span>{generatedImage.photographerName || 'Photographer'}</span>
                        )}{' '}
                        on <a href="https://unsplash.com?utm_source=geospark&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Unsplash</a>
                      </p>
                    )}
                    {generatedImage.source === 'ai' && generatedImage.attribution && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{generatedImage.attribution}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowTextOverlay(true)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Add Text
                  </button>
                  <button
                    onClick={() => setShowOverlayEditor(true)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 flex items-center gap-1"
                style={{ backgroundColor: hexToRgba(primary, 0.15), color: primary }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Customize
                  </button>
                  <button
                    onClick={() => revertToSuggestedBranding()}
                    disabled={brandingRecommendationLoading}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                style={{ backgroundColor: hexToRgba(accent, 0.2), color: '#92400e' }}
                    title="Re-apply the suggested branding (logo, overlay, tint, text)"
                  >
                    {brandingRecommendationLoading ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    Revert
                  </button>
                  <button
                    onClick={handleDownloadImage}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
              <div className="p-4 flex flex-col items-center rounded-b-xl" style={{ backgroundColor: hexToRgba(secondary, 0.08) }}>
                <SafeImage 
                  key={generatedImage.url}
                  src={generatedImage.url} 
                  alt="Generated content image" 
                  className="max-w-[280px] w-full rounded-lg shadow-sm aspect-square object-cover"
                  fallbackClassName="max-w-[280px] w-full aspect-square rounded-lg bg-gray-200"
                />
                {appliedBrandingForImageUrl === generatedImage.url && (
                  <p className="mt-2 text-xs text-teal-600">Recommended branding applied. Customize or add text below.</p>
                )}
              </div>
            </div>
          )}

          {/* In-flow rating: between customize-your-image and content/example blocks */}
          {(generatedTextId || generatedImageId || generatedImage) && (
            <div className="mb-6 p-4 rounded-lg border max-w-4xl mx-auto" style={{ backgroundColor: hexToRgba(accent, 0.08), borderColor: hexToRgba(accent, 0.2) }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <p className="text-sm font-medium text-gray-700">How was this?</p>
                <div className="flex flex-wrap items-center gap-8">
                  {generatedTextId && (
                    <div className="min-w-[200px]">
                      <RatingStars type="text" label="Rate this text" value={textRating} onChange={handleRateText} onSkip={() => {}} showSkip />
                    </div>
                  )}
                  {generatedTextId && (generatedImageId || generatedImage) && (
                    <div className="hidden sm:block w-px h-8 bg-gray-300/60" />
                  )}
                  {(generatedImageId || generatedImage) && (
                    <div className="min-w-[200px]">
                      <RatingStars type="image" label="Rate this image" value={imageRating} onChange={handleRateImage} onSkip={() => {}} showSkip />
                    </div>
                  )}
                </div>
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

            {/* Preview Mode - Enhanced Blog Style */}
            {viewMode === 'preview' && (
              <div ref={contentPreviewRef} className="overflow-hidden">
                {/* Hero Image for Blog Posts */}
                {selectedTemplate === 'blog-post' && generatedImage && (
                  <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200">
                    <img 
                      key={generatedImage.url}
                      src={generatedImage.url} 
                      alt="Blog hero" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}
                
                {/* Enhanced Typography Content */}
                <div className={selectedTemplate === 'blog-post' ? "px-8 py-6" : "p-6"}>
                  <article className="prose prose-lg prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-3xl prose-h1:mb-6 prose-h1:leading-tight prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100 prose-h3:text-xl prose-h3:mt-6 prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-5 prose-strong:text-gray-900 prose-ul:my-4 prose-ul:space-y-2 prose-li:text-gray-600" style={{ '--tw-prose-bullets': 'var(--brand-primary)', '--tw-prose-links': 'var(--brand-primary)' } as React.CSSProperties}>
                    <ReactMarkdown>{preprocessMarkdown(generatedContent)}</ReactMarkdown>
                  </article>
                  
                  {/* Author Footer for Blog */}
                  {selectedTemplate === 'blog-post' && (
                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: hexToRgba(primary, 0.15), color: primary }}>
                        {businessName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{businessName}</p>
                        <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  )}
                </div>
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
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 bg-teal-50 px-4 py-2.5 rounded-lg border border-teal-100">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Tip:</strong> Click "Copy" to copy formatted text that pastes perfectly into WordPress, Wix, or any blog editor.</span>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
    </div>
  )
}
