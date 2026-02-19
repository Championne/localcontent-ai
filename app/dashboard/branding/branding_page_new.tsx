'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { detectBrandPersonality } from '@/lib/branding/personality-detection'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Business {
  id: string
  name: string
  industry: string | null
  location: string | null
  website: string | null
  logo_url: string | null
  profile_photo_url: string | null
  brand_primary_color: string | null
  brand_secondary_color: string | null
  brand_accent_color: string | null
  tagline: string | null
  default_cta_primary: string | null
  default_cta_secondary: string | null
  seo_keywords: string | null
  default_tone: string | null
  social_handles: string | null
  short_about: string | null
  preferred_image_styles: string[]
  avoid_image_styles: string[]
  created_at: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { value: 'Restaurant', label: '🍽️ Restaurant / Food Service' },
  { value: 'Plumber', label: '🔧 Plumber' },
  { value: 'Electrician', label: '⚡ Electrician' },
  { value: 'HVAC', label: '❄️ HVAC / Heating & Cooling' },
  { value: 'Salon', label: '💇 Salon / Spa / Beauty' },
  { value: 'Dentist', label: '🦷 Dentist / Dental Practice' },
  { value: 'Real Estate', label: '🏡 Real Estate' },
  { value: 'Landscaping', label: '🌿 Landscaping / Lawn Care' },
  { value: 'Auto Repair', label: '🚗 Auto Repair / Mechanic' },
  { value: 'Fitness', label: '💪 Fitness / Gym' },
  { value: 'Retail', label: '🛍️ Retail / Shop' },
  { value: 'Contractor', label: '🏗️ General Contractor' },
  { value: 'Cleaning', label: '🧹 Cleaning Service' },
  { value: 'Other', label: '📦 Other' },
]

const ESSENTIAL_FIELDS = [
  'name', 'industry', 'location', 'logo_url',
  'brand_primary_color', 'tagline', 'default_cta_primary',
  'default_tone', 'seo_keywords'
] as const

function getCompleteness(b: Business): number {
  let count = 0
  if (b.name?.trim()) count++
  if (b.industry?.trim()) count++
  if (b.location?.trim()) count++
  if (b.logo_url) count++
  if (b.brand_primary_color?.trim()) count++
  if (b.tagline?.trim()) count++
  if (b.default_cta_primary?.trim()) count++
  if (b.default_tone?.trim()) count++
  if (b.seo_keywords?.trim()) count++
  return Math.round((count / ESSENTIAL_FIELDS.length) * 100)
}

function isValidHex(hex: string | null | undefined): hex is string {
  return !!hex && /^#[0-9A-Fa-f]{6}$/.test(hex)
}

// ─── Step 1: Basics ───────────────────────────────────────────────────────────

function StepBasics({ business, onChange }: { business: Business; onChange: (updates: Partial<Business>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Business name *</label>
        <input type="text" value={business.name || ''} onChange={(e) => onChange({ name: e.target.value })} placeholder="e.g. Mike's HVAC" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2" style={{ '--tw-ring-color': 'var(--brand-primary-20)' } as React.CSSProperties} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Industry *</label>
        <select value={business.industry || ''} onChange={(e) => onChange({ industry: e.target.value || null })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2">
          <option value="">Choose your industry…</option>
          {INDUSTRIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
        </select>
        <p className="text-xs text-gray-400 mt-1">This is the most important setting — it shapes every AI output.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Service area *</label>
        <input type="text" value={business.location || ''} onChange={(e) => onChange({ location: e.target.value || null })} placeholder="e.g. Austin, TX · Round Rock · Cedar Park" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2" />
        <p className="text-xs text-gray-400 mt-1">Include neighbourhoods — the more specific, the better your local SEO.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Website</label>
        <input type="text" inputMode="url" value={business.website || ''} onChange={(e) => onChange({ website: e.target.value?.trim() || null })} placeholder="www.example.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2" />
      </div>
    </div>
  )
}

// ─── Step 2: Look ─────────────────────────────────────────────────────────────

function StepLook({
  business, onChange, onUploadLogo, uploadingLogo, onRemoveLogo,
}: {
  business: Business
  onChange: (updates: Partial<Business>) => void
  onUploadLogo: (file: File) => void
  uploadingLogo: boolean
  onRemoveLogo: () => void
}) {
  const logoRef = useRef<HTMLInputElement>(null)
  const primaryHex = isValidHex(business.brand_primary_color) ? business.brand_primary_color : '#0d9488'

  const personality = useMemo(() => {
    if (!isValidHex(business.brand_primary_color)) return null
    try { return detectBrandPersonality(business.brand_primary_color!, business.brand_secondary_color || undefined) }
    catch { return null }
  }, [business.brand_primary_color, business.brand_secondary_color])

  const personalityIcons: Record<string, string> = { energetic: '⚡', professional: '💼', friendly: '😊', luxury: '✨' }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Logo *</label>
        <div className="flex items-center gap-4">
          {business.logo_url ? (
            <div className="relative">
              <img src={business.logo_url} alt="Logo" className="w-20 h-20 rounded-xl object-contain border-2 bg-white p-1" style={{ borderColor: primaryHex }} />
              <button type="button" onClick={onRemoveLogo} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors">×</button>
            </div>
          ) : (
            <button type="button" onClick={() => logoRef.current?.click()} disabled={uploadingLogo} className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-gray-400 transition-colors group">
              {uploadingLogo ? <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <><span className="text-2xl opacity-50 group-hover:opacity-80 transition-opacity">🖼️</span><span className="text-[10px] text-gray-400">Upload</span></>}
            </button>
          )}
          <input type="file" accept="image/*" ref={logoRef} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadLogo(f); e.target.value = '' }} />
          <div className="text-sm text-gray-600 leading-relaxed">
            <p className="font-medium text-gray-900">Your logo</p>
            <p className="text-xs text-gray-500 mt-0.5">PNG or SVG with transparent background works best. Max 2MB.</p>
            {business.logo_url && <button type="button" onClick={() => logoRef.current?.click()} className="text-xs font-medium mt-1 transition-colors" style={{ color: 'var(--brand-primary)' }}>Replace</button>}
          </div>
        </div>
      </div>

      {/* Primary colour */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Brand colour *</label>
        <div className="flex items-center gap-3">
          <input type="color" value={primaryHex} onChange={(e) => onChange({ brand_primary_color: e.target.value })} className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer p-0.5" />
          <input type="text" value={business.brand_primary_color || ''} onChange={(e) => onChange({ brand_primary_color: e.target.value || null })} placeholder="#0d9488" maxLength={7} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:ring-2" />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">This colour is used everywhere — your sidebar, buttons, and every AI-generated image.</p>
      </div>

      {/* Live preview */}
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-2">Live preview</p>
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: `${primaryHex}12` }}>
          {business.logo_url ? (
            <img src={business.logo_url} alt="" className="w-9 h-9 object-contain rounded-lg bg-white p-0.5 shadow-sm" />
          ) : (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: primaryHex }}>{business.name?.charAt(0)?.toUpperCase() || '?'}</div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{business.name || 'Your business'}</p>
            {business.industry && <p className="text-xs text-gray-500">{business.industry}</p>}
          </div>
          <div className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: primaryHex }}>{business.default_cta_primary || 'Get a quote'}</div>
        </div>
      </div>

      {/* Brand personality */}
      {personality && (
        <div className="rounded-xl p-3 border flex items-start gap-2.5" style={{ backgroundColor: `${primaryHex}08`, borderColor: `${primaryHex}20` }}>
          <span className="text-xl mt-0.5">{personalityIcons[personality.personality]}</span>
          <div>
            <p className="text-sm font-semibold capitalize text-gray-900">{personality.personality} brand vibe detected</p>
            <p className="text-xs text-gray-500 mt-0.5">{personality.mood} · Images will automatically match this vibe</p>
          </div>
        </div>
      )}

      {/* Advanced colours (collapsed) */}
      <details className="group">
        <summary className="text-xs font-semibold text-gray-400 cursor-pointer select-none hover:text-gray-600 transition-colors list-none flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          Advanced colours (optional)
        </summary>
        <div className="mt-4 space-y-4 pl-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Secondary colour</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={isValidHex(business.brand_secondary_color) ? business.brand_secondary_color! : '#6b7280'} onChange={(e) => onChange({ brand_secondary_color: e.target.value })} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <input type="text" value={business.brand_secondary_color || ''} onChange={(e) => onChange({ brand_secondary_color: e.target.value || null })} placeholder="#hex" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Accent colour</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={isValidHex(business.brand_accent_color) ? business.brand_accent_color! : '#f59e0b'} onChange={(e) => onChange({ brand_accent_color: e.target.value })} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <input type="text" value={business.brand_accent_color || ''} onChange={(e) => onChange({ brand_accent_color: e.target.value || null })} placeholder="#hex" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}

// ─── Step 3: Voice ────────────────────────────────────────────────────────────

function StepVoice({ business, onChange }: { business: Business; onChange: (updates: Partial<Business>) => void }) {
  const isProfessional = business.default_tone === 'professional'
  const isFriendly = business.default_tone === 'friendly'

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tagline *</label>
        <input type="text" value={business.tagline || ''} onChange={(e) => onChange({ tagline: e.target.value || null })} placeholder="e.g. Your neighbourhood HVAC experts" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2" />
        <p className="text-xs text-gray-400 mt-1">One sentence that captures what makes you different.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Call to action button *</label>
        <input type="text" value={business.default_cta_primary || ''} onChange={(e) => { const v = e.target.value || null; onChange({ default_cta_primary: v, default_cta_secondary: v }) }} placeholder="e.g. Book now · Get a free quote · Call us" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2" />
        <p className="text-xs text-gray-400 mt-1">Used on GMB posts, social posts, emails — everywhere.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Content tone *</label>
        <div className="flex gap-3">
          <button type="button" onClick={() => onChange({ default_tone: 'professional' })} className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${isProfessional ? 'text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`} style={isProfessional ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' } : {}}>
            💼 Professional
          </button>
          <button type="button" onClick={() => onChange({ default_tone: 'friendly' })} className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${isFriendly ? 'text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`} style={isFriendly ? { backgroundColor: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' } : {}}>
            😊 Friendly
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {isProfessional && 'Formal, authoritative, trust-focused. Great for healthcare, finance, legal.'}
          {isFriendly && 'Warm, conversational, approachable. Great for restaurants, salons, retail.'}
          {!isProfessional && !isFriendly && 'Choose how your content sounds.'}
        </p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">SEO keywords *</label>
        <input type="text" value={business.seo_keywords || ''} onChange={(e) => onChange({ seo_keywords: e.target.value || null })} placeholder="HVAC repair Austin, AC installation, emergency heating" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2" />
        <p className="text-xs text-gray-400 mt-1">Comma-separated. Include your city name for local SEO.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Short about (2–4 sentences)</label>
        <textarea value={business.short_about || ''} onChange={(e) => onChange({ short_about: e.target.value || null })} placeholder="Used in blog author boxes, Google Business About section, and email footers." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 resize-none" />
      </div>
    </div>
  )
}

// ─── Completeness ring ────────────────────────────────────────────────────────

function CompletenessRing({ pct }: { pct: number }) {
  const r = 20
  const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference - (pct / 100) * circumference
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 52, height: 52 }}>
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle cx="26" cy="26" r={r} fill="none" stroke="var(--brand-primary)" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform="rotate(-90 26 26)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <span className="absolute text-[11px] font-bold text-gray-900">{pct}%</span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const STEPS = ['Basics', 'Look', 'Voice'] as const
type Step = 0 | 1 | 2

export default function BrandingPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showAddBusiness, setShowAddBusiness] = useState(false)
  const [newBusiness, setNewBusiness] = useState({ name: '', industry: '', location: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState<Step>(0)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const businessesRef = useRef<Business[]>([])

  useEffect(() => { fetchBusinesses() }, [])
  useEffect(() => { businessesRef.current = businesses }, [businesses])

  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/business')
      if (res.ok) { const data = await res.json(); setBusinesses(data.businesses || []) }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleAddBusiness = async () => {
    if (!newBusiness.name.trim()) { showMsg('error', 'Business name is required'); return }
    setSaving('add')
    try {
      const res = await fetch('/api/business', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newBusiness) })
      if (res.ok) {
        const data = await res.json()
        setBusinesses([data.business, ...businesses])
        setNewBusiness({ name: '', industry: '', location: '' })
        setShowAddBusiness(false)
        setEditingId(data.business.id)
        setActiveStep(0)
        showMsg('success', 'Business added — now complete your brand profile')
      } else { showMsg('error', 'Failed to add business') }
    } catch { showMsg('error', 'Failed to add business') }
    finally { setSaving(null) }
  }

  const handleSave = async (businessId: string) => {
    const business = businessesRef.current.find((b) => b.id === businessId)
    if (!business) return
    setSaving(businessId)
    try {
      const res = await fetch('/api/business', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: business.id, name: business.name, industry: business.industry,
          location: business.location, website: business.website,
          brand_primary_color: business.brand_primary_color, brand_secondary_color: business.brand_secondary_color,
          brand_accent_color: business.brand_accent_color, tagline: business.tagline,
          default_cta_primary: business.default_cta_primary, default_cta_secondary: business.default_cta_secondary,
          seo_keywords: business.seo_keywords, default_tone: business.default_tone,
          social_handles: business.social_handles, short_about: business.short_about,
          preferred_image_styles: business.preferred_image_styles || [],
          avoid_image_styles: business.avoid_image_styles || [],
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.business) {
        setBusinesses((prev) => prev.map((b) => (b.id === business.id ? data.business : b)))
        window.dispatchEvent(new CustomEvent('geospark:business-updated', { detail: { business: data.business } }))
        showMsg('success', 'Brand saved ✓')
        if (activeStep < 2) setActiveStep((s) => (s + 1) as Step)
        else setEditingId(null)
      } else { showMsg('error', data.details || data.error || 'Failed to save') }
    } catch { showMsg('error', 'Failed to save') }
    finally { setSaving(null) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this business? This cannot be undone.')) return
    setSaving(id)
    try {
      const res = await fetch(`/api/business/${id}`, { method: 'DELETE' })
      if (res.ok) { setBusinesses((prev) => prev.filter((b) => b.id !== id)); if (editingId === id) setEditingId(null); showMsg('success', 'Business deleted') }
      else { showMsg('error', 'Failed to delete') }
    } catch { showMsg('error', 'Failed to delete') }
    finally { setSaving(null) }
  }

  const handleLogoUpload = async (businessId: string, file: File) => {
    if (!file?.type.startsWith('image/')) { showMsg('error', 'Please upload an image'); return }
    if (file.size > 2 * 1024 * 1024) { showMsg('error', 'Image must be under 2MB'); return }
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', file); formData.append('businessId', businessId); formData.append('type', 'logo')
      const res = await fetch('/api/business/logo', { method: 'POST', body: formData })
      if (res.ok) { const data = await res.json(); updateBusiness(businessId, { logo_url: data.url }); showMsg('success', 'Logo uploaded') }
      else { const err = await res.json(); showMsg('error', err.error || 'Upload failed') }
    } catch { showMsg('error', 'Upload failed') }
    finally { setUploadingLogo(false) }
  }

  const handleRemoveLogo = async (businessId: string) => {
    if (!confirm('Remove logo?')) return
    try {
      const res = await fetch('/api/business/logo', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId, type: 'logo' }) })
      if (res.ok) { updateBusiness(businessId, { logo_url: null }); showMsg('success', 'Logo removed') }
    } catch { /* ignore */ }
  }

  const updateBusiness = (id: string, updates: Partial<Business>) => {
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 animate-pulse space-y-4">
        <div className="h-7 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pt-4 sm:pt-6">

      {message && (
        <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-7">
        <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--brand-primary)' }}>Brand identity</p>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Your brand, one place</h1>
        <p className="text-gray-500 text-sm mt-1">Set it once — every post, image and CTA will match automatically.</p>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">Your businesses</h2>
        {!showAddBusiness && !editingId && (
          <button type="button" onClick={() => { setShowAddBusiness(true); setEditingId(null) }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add business
          </button>
        )}
      </div>

      {showAddBusiness && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
          <h3 className="font-semibold text-gray-900 mb-4">New business</h3>
          <div className="space-y-3">
            <input type="text" value={newBusiness.name} onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })} placeholder="Business name *" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2" />
            <select value={newBusiness.industry} onChange={(e) => setNewBusiness({ ...newBusiness, industry: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white outline-none">
              <option value="">Industry…</option>
              {INDUSTRIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
            </select>
            <input type="text" value={newBusiness.location} onChange={(e) => setNewBusiness({ ...newBusiness, location: e.target.value })} placeholder="Service area (city, neighbourhoods)" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2" />
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={handleAddBusiness} disabled={saving === 'add'} className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--brand-primary)' }}>
                {saving === 'add' ? 'Adding…' : 'Add business'}
              </button>
              <button type="button" onClick={() => { setShowAddBusiness(false); setNewBusiness({ name: '', industry: '', location: '' }) }} className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {businesses.length === 0 && !showAddBusiness ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="text-4xl mb-3">🏢</div>
          <p className="font-semibold text-gray-700 mb-1">No businesses yet</p>
          <p className="text-sm text-gray-500 mb-4">Add your first business to start generating on-brand content.</p>
          <button type="button" onClick={() => setShowAddBusiness(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: 'var(--brand-primary)' }}>Add your first business</button>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map((b) => {
            const pct = getCompleteness(b)
            const primaryHex = isValidHex(b.brand_primary_color) ? b.brand_primary_color : null
            const isEditing = editingId === b.id

            return (
              <div key={b.id} className="rounded-2xl border-2 overflow-hidden shadow-sm transition-all duration-300" style={primaryHex ? { borderColor: `${primaryHex}30` } : { borderColor: '#e5e7eb' }}>

                {/* Card header */}
                <div className="px-4 py-4 flex items-center gap-3 bg-white">
                  {b.logo_url ? (
                    <img src={b.logo_url} alt="" className="w-11 h-11 rounded-xl object-contain bg-gray-50 border border-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: primaryHex || '#9ca3af' }}>{b.name.charAt(0).toUpperCase()}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{b.name}</p>
                    <p className="text-xs text-gray-500 truncate">{b.industry || 'No industry'}{b.location ? ` · ${b.location}` : ''}</p>
                  </div>
                  {!isEditing && <CompletenessRing pct={pct} />}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onClick={() => { if (isEditing) { setEditingId(null) } else { setEditingId(b.id); setActiveStep(0) } }} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditing ? 'M6 18L18 6M6 6l12 12' : 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'} /></svg>
                    </button>
                    <button type="button" onClick={() => handleDelete(b.id)} className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>

                {/* Completeness nudge (view mode) */}
                {!isEditing && (
                  <button type="button" onClick={() => { setEditingId(b.id); setActiveStep(0) }} className="w-full px-4 py-2.5 border-t border-gray-100 bg-white flex items-center justify-between gap-3 text-left hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[140px]">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: 'var(--brand-primary)' }} />
                      </div>
                      <span className="text-xs text-gray-500">{pct === 100 ? '✓ Profile complete' : `${pct}% complete — tap to improve`}</span>
                    </div>
                    {pct < 100 && <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--brand-primary)' }}>Edit →</span>}
                  </button>
                )}

                {/* Editor */}
                {isEditing && (
                  <div className="border-t border-gray-100">
                    {/* Step tabs */}
                    <div className="flex border-b border-gray-100 bg-gray-50">
                      {STEPS.map((label, idx) => (
                        <button key={label} type="button" onClick={() => setActiveStep(idx as Step)} className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeStep === idx ? 'text-gray-900 bg-white' : 'text-gray-400 hover:text-gray-600'}`}>
                          <span className="mr-1.5 text-xs">{idx + 1}</span>{label}
                          {activeStep === idx && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: 'var(--brand-primary)' }} />}
                        </button>
                      ))}
                    </div>

                    <div className="p-5 bg-white">
                      {activeStep === 0 && <StepBasics business={b} onChange={(u) => updateBusiness(b.id, u)} />}
                      {activeStep === 1 && <StepLook business={b} onChange={(u) => updateBusiness(b.id, u)} onUploadLogo={(file) => handleLogoUpload(b.id, file)} uploadingLogo={uploadingLogo} onRemoveLogo={() => handleRemoveLogo(b.id)} />}
                      {activeStep === 2 && <StepVoice business={b} onChange={(u) => updateBusiness(b.id, u)} />}

                      {/* Step navigation */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                        <div>
                          {activeStep > 0 && (
                            <button type="button" onClick={() => setActiveStep((s) => (s - 1) as Step)} className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">← Back</button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { setEditingId(null); fetchBusinesses() }} className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</button>
                          <button type="button" onClick={() => handleSave(b.id)} disabled={saving === b.id} className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 disabled:opacity-50 shadow-sm" style={{ backgroundColor: 'var(--brand-primary)' }}>
                            {saving === b.id ? 'Saving…' : activeStep < 2 ? 'Save & continue →' : 'Save & done ✓'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
