'use client'

import { useState, useEffect, useRef } from 'react'

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
  created_at: string
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
  { value: 'Other', label: 'Other' },
]

const TONE_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
]

const BRAND_FIELDS_TOTAL = 13

function getBrandCompleteness(b: Business): number {
  let set = 0
  if (b.name?.trim()) set++
  if (b.industry?.trim()) set++
  if (b.location?.trim()) set++
  if (b.website?.trim()) set++
  if (b.logo_url) set++
  if (b.profile_photo_url) set++
  if (b.brand_primary_color?.trim()) set++
  if (b.tagline?.trim()) set++
  if (b.default_cta_primary?.trim()) set++
  if (b.default_tone?.trim()) set++
  if (b.seo_keywords?.trim()) set++
  if (b.social_handles?.trim()) set++
  if (b.short_about?.trim()) set++
  return set
}

function getSetBadges(b: Business): { label: string }[] {
  const badges: { label: string }[] = []
  const toneLabel = TONE_OPTIONS.find((o) => o.value === b.default_tone)?.label
  if (b.default_tone && toneLabel && toneLabel !== 'Not set') badges.push({ label: `Tone: ${toneLabel}` })
  if (b.default_cta_primary?.trim()) badges.push({ label: 'CTA ✓' })
  if (b.logo_url) badges.push({ label: 'Logo ✓' })
  if (b.profile_photo_url) badges.push({ label: 'Photo ✓' })
  if (b.brand_primary_color?.trim()) badges.push({ label: 'Colours ✓' })
  if (b.seo_keywords?.trim()) badges.push({ label: 'SEO ✓' })
  return badges
}

export default function BrandingPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showAddBusiness, setShowAddBusiness] = useState(false)
  const [newBusiness, setNewBusiness] = useState({ name: '', industry: '', location: '' })
  const [editingBusiness, setEditingBusiness] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)
  const logoInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const photoInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const businessesRef = useRef<Business[]>([])
  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchBusinesses()
  }, [])
  useEffect(() => {
    businessesRef.current = businesses
  }, [businesses])



  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/business')
      if (res.ok) {
        const data = await res.json()
        setBusinesses(data.businesses || [])
      }
    } catch (err) {
      console.error('Failed to fetch businesses:', err)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
    setTimeout(() => messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }

  const handleAddBusiness = async () => {
    if (!newBusiness.name.trim()) {
      showMessage('error', 'Business name is required')
      return
    }
    setSaving('add-business')
    try {
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBusiness),
      })
      if (res.ok) {
        const data = await res.json()
        setBusinesses([data.business, ...businesses])
        setNewBusiness({ name: '', industry: '', location: '' })
        setShowAddBusiness(false)
        showMessage('success', 'Business added')
      } else {
        showMessage('error', 'Failed to add business')
      }
    } catch {
      showMessage('error', 'Failed to add business')
    } finally {
      setSaving(null)
    }
  }

  const handleUpdateBusiness = async (businessId: string) => {
    const business = businessesRef.current.find((b) => b.id === businessId)
    if (!business?.id) return
    setSaving(business.id)
    try {
      const res = await fetch('/api/business', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: business.id,
          name: business.name,
          industry: business.industry,
          location: business.location,
          website: business.website,
          brand_primary_color: business.brand_primary_color,
          brand_secondary_color: business.brand_secondary_color,
          brand_accent_color: business.brand_accent_color,
          tagline: business.tagline,
          default_cta_primary: business.default_cta_primary,
          default_cta_secondary: business.default_cta_secondary,
          seo_keywords: business.seo_keywords,
          default_tone: business.default_tone,
          social_handles: business.social_handles,
          short_about: business.short_about,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.business) {
        setBusinesses((prev) => prev.map((b) => (b.id === business.id ? data.business : b)))
        setEditingBusiness(null)
        showMessage('success', 'Saved')
      } else {
        const msg = data.details || data.error || 'Failed to save'
        showMessage('error', msg)
      }
    } catch (err) {
      console.error('Save business error:', err)
      showMessage('error', 'Failed to save')
    } finally {
      setSaving(null)
    }
  }

  const handleDeleteBusiness = async (id: string) => {
    if (!confirm('Delete this business? This cannot be undone.')) return
    setSaving(id)
    try {
      const res = await fetch(`/api/business/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setBusinesses((prev) => prev.filter((b) => b.id !== id))
        showMessage('success', 'Business deleted')
      } else {
        showMessage('error', 'Failed to delete')
      }
    } catch {
      showMessage('error', 'Failed to delete')
    } finally {
      setSaving(null)
    }
  }

  const handleFileUpload = async (businessId: string, file: File, type: 'logo' | 'profile_photo') => {
    if (!file?.type.startsWith('image/')) {
      showMessage('error', 'Please upload an image')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', 'Image must be under 2MB')
      return
    }
    if (type === 'logo') setUploadingLogo(businessId)
    else setUploadingPhoto(businessId)
    try {
      const formData = new FormData()
      formData.append(type, file)
      formData.append('businessId', businessId)
      formData.append('type', type)
      const res = await fetch('/api/business/logo', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === businessId
              ? { ...b, [type === 'logo' ? 'logo_url' : 'profile_photo_url']: data.url }
              : b
          )
        )
        showMessage('success', type === 'logo' ? 'Logo uploaded' : 'Profile photo uploaded')
      } else {
        const err = await res.json()
        showMessage('error', err.error || 'Upload failed')
      }
    } catch {
      showMessage('error', 'Upload failed')
    } finally {
      if (type === 'logo') setUploadingLogo(null)
      else setUploadingPhoto(null)
    }
  }

  const handleRemoveFile = async (businessId: string, type: 'logo' | 'profile_photo') => {
    if (!confirm(`Remove ${type === 'logo' ? 'logo' : 'profile photo'}?`)) return
    if (type === 'logo') setUploadingLogo(businessId)
    else setUploadingPhoto(businessId)
    try {
      const res = await fetch('/api/business/logo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, type }),
      })
      if (res.ok) {
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === businessId
              ? { ...b, [type === 'logo' ? 'logo_url' : 'profile_photo_url']: null }
              : b
          )
        )
        showMessage('success', 'Removed')
      } else {
        showMessage('error', 'Failed to remove')
      }
    } catch {
      showMessage('error', 'Failed to remove')
    } finally {
      if (type === 'logo') setUploadingLogo(null)
      else setUploadingPhoto(null)
    }
  }

  const updateBusiness = (id: string, updates: Partial<Business>) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    )
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  const pagePrimary = businesses[0]?.brand_primary_color && /^#[0-9A-Fa-f]{6}$/.test(businesses[0].brand_primary_color) ? businesses[0].brand_primary_color : '#0d9488'
    const pageSecondary = businesses[0]?.brand_secondary_color && /^#[0-9A-Fa-f]{6}$/.test(businesses[0].brand_secondary_color) ? businesses[0].brand_secondary_color : '#0f766e'

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        background: `linear-gradient(160deg, ${pagePrimary}08 0%, ${pageSecondary}06 40%, transparent 70%)`,
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        {message && (
          <div
            ref={messageRef}
            className={`mb-6 p-4 rounded-xl flex items-center gap-2 shadow-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-8">
          <p className="font-medium text-sm mb-1 transition-colors" style={{ color: pagePrimary }}>Brand identity</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Your brand, one place</h1>
          <p className="text-gray-500 text-sm">Make every post unmistakably yours. Set your logo, colours and voice here.</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your businesses</h2>
          <button
            type="button"
            onClick={() => setShowAddBusiness(true)}
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            style={{ backgroundColor: pagePrimary }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add business
          </button>
        </div>

      {showAddBusiness && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">New business</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newBusiness.name}
              onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
              placeholder="Business name *"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <select
              value={newBusiness.industry}
              onChange={(e) => setNewBusiness({ ...newBusiness, industry: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">Industry...</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>{ind.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={newBusiness.location}
              onChange={(e) => setNewBusiness({ ...newBusiness, location: e.target.value })}
              placeholder="Location (city, neighbourhoods)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddBusiness}
                disabled={saving === 'add-business'}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 text-sm"
              >
                {saving === 'add-business' ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddBusiness(false)
                  setNewBusiness({ name: '', industry: '', location: '' })
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {businesses.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-xl">
          <p>No businesses yet.</p>
          <button
            type="button"
            onClick={() => setShowAddBusiness(true)}
            className="mt-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
          >
            Add your first business
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {businesses.map((business) => {
            const completeness = getBrandCompleteness(business)
            const pct = Math.round((100 * completeness) / BRAND_FIELDS_TOTAL)
            const primaryHex = business.brand_primary_color && /^#[0-9A-Fa-f]{6}$/.test(business.brand_primary_color) ? business.brand_primary_color : null
            return (
            <div
              key={business.id}
              className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2"
              style={primaryHex ? { borderColor: primaryHex, backgroundColor: `${primaryHex}06` } : { borderColor: '#e5e7eb', backgroundColor: '#fff' }}
            >
              {/* Header: name, industry, location, edit/delete */}
              <div className="p-4 border-b flex items-start justify-between gap-4" style={{ borderColor: primaryHex ? `${primaryHex}20` : '#f3f4f6' }}>
                <div className="flex gap-3 min-w-0 flex-1">
                  {/* Logo + profile photo in view — borders in brand colour */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {business.logo_url ? (
                      <img src={business.logo_url} alt="" className="w-11 h-11 rounded-xl object-contain bg-white shadow-inner" style={{ border: `2px solid ${primaryHex || '#e5e7eb'}` }} />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-lg border-2 border-dashed" style={{ borderColor: primaryHex ? `${primaryHex}50` : '#d1d5db' }} title="Logo">🖼️</div>
                    )}
                    {business.profile_photo_url ? (
                      <img src={business.profile_photo_url} alt="" className="w-11 h-11 rounded-full object-cover shadow-inner" style={{ border: `2px solid ${primaryHex || '#e5e7eb'}` }} />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg border-2 border-dashed" style={{ borderColor: primaryHex ? `${primaryHex}50` : '#d1d5db' }} title="Profile photo">👤</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{business.name}</h3>
                    <p className="text-sm text-gray-500">
                      {business.industry || 'No industry'}
                      {business.location && ` • ${business.location}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingBusiness(editingBusiness === business.id ? null : business.id)
                    }
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Edit brand identity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBusiness(business.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* View mode: completeness, colour strip, badges, micro-summary, empty state */}
              {editingBusiness !== business.id && (
                <>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setEditingBusiness(business.id)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingBusiness(business.id)}
                    className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 cursor-pointer hover:bg-gray-100/80 transition-colors"
                  >
                    {/* Completeness indicator */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-600">
                        {completeness} of {BRAND_FIELDS_TOTAL} set
                        <span className="text-teal-600 font-semibold ml-1">({pct}%)</span>
                      </span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className={`flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-[120px] transition-all ${pct === 100 ? 'ring-2 ring-teal-300 ring-offset-1 rounded-full' : ''}`}
                        >
                          <div
                            className="h-full bg-teal-500 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%`, boxShadow: pct === 100 ? '0 0 8px rgba(20, 184, 166, 0.5)' : undefined }}
                          />
                        </div>
                        {pct === 100 && (
                          <span className="text-xs font-semibold text-teal-600 whitespace-nowrap" title="All fields filled">
                            Profile complete
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Milestone message */}
                    {pct >= 45 && pct <= 55 && pct !== 100 && (
                      <p className="text-xs text-teal-600 font-medium mb-2">Halfway there — keep going!</p>
                    )}
                    {pct === 100 && (
                      <p className="text-xs text-teal-600 font-medium mb-2">Ready for consistent, on-brand content.</p>
                    )}
                    {/* Set badges */}
                    {getSetBadges(business).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {getSetBadges(business).map((badge) => (
                          <span
                            key={badge.label}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-teal-50 text-teal-700"
                          >
                            {badge.label}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Inline micro-summary */}
                    <p className="text-xs text-gray-500">
                      Tagline, tone, SEO, colours & more — Edit to add or change.
                    </p>
                    {/* Empty state when logo and profile photo both missing */}
                    {!business.logo_url && !business.profile_photo_url && (
                      <p className="text-xs text-amber-600 mt-1.5">
                        Add a logo and profile photo so your content feels personal.
                      </p>
                    )}
                  </div>
                  {/* Your palette strip — always show so every card has the same layout */}
                  <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100">
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">Your palette</p>
                    {business.brand_primary_color?.trim() && /^#[0-9A-Fa-f]{6}$/.test(business.brand_primary_color) ? (
                      <>
                        <div className="flex gap-1.5 h-3 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                          {[business.brand_primary_color, business.brand_secondary_color || '#e5e7eb', business.brand_accent_color || '#e5e7eb'].map((hex, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(hex).then(() => {
                                  setCopiedHex(hex)
                                  setTimeout(() => setCopiedHex(null), 1500)
                                })
                              }}
                              className={`flex-1 transition-all hover:opacity-90 relative ${copiedHex === hex ? 'ring-2 ring-teal-500 ring-offset-1' : ''}`}
                              style={{ backgroundColor: hex }}
                              title={`Copy ${hex}`}
                            >
                              {copiedHex === hex && (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">Copied!</span>
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{copiedHex ? 'Copied to clipboard' : 'Click a colour to copy hex'}</p>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-1.5 h-3 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                          {['#e5e7eb', '#d1d5db', '#9ca3af'].map((hex, i) => (
                            <div key={i} className="flex-1" style={{ backgroundColor: hex }} />
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Set your brand colours in Edit to see your palette</p>
                      </>
                    )}
                  </div>
                </>
              )}

              {editingBusiness === business.id ? (
                <form
                  className="p-4 bg-gray-50 space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleUpdateBusiness(business.id)
                  }}
                >
                  {/* Identity */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-medium">1</span>
                      <h4 className="font-medium text-gray-900">Identity</h4>
                    </div>
                    <div className="space-y-3 pl-10">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={business.name}
                        onChange={(e) => updateBusiness(business.id, { name: e.target.value })}
                        placeholder="Business name"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <label className="block text-xs font-medium text-gray-500 mb-1">Industry</label>
                      <select
                        value={business.industry || ''}
                        onChange={(e) => updateBusiness(business.id, { industry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                      >
                        <option value="">Industry...</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind.value} value={ind.value}>{ind.label}</option>
                        ))}
                      </select>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                      <input
                        type="text"
                        value={business.location || ''}
                        onChange={(e) => updateBusiness(business.id, { location: e.target.value })}
                        placeholder="City, neighbourhoods"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <label className="block text-xs font-medium text-gray-500 mb-1">Website URL</label>
                      <input
                        type="text"
                        inputMode="url"
                        autoComplete="url"
                        value={business.website || ''}
                        onChange={(e) => updateBusiness(business.id, { website: e.target.value?.trim() || null })}
                        placeholder="www.example.com or https://..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Visuals */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">2</span>
                      <h4 className="font-medium text-gray-900">Visuals</h4>
                    </div>
                    <div className="space-y-3 pl-10">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Logo</label>
                  <div className="flex items-center gap-3">
                    {business.logo_url ? (
                      <div className="relative inline-block group">
                        <img src={business.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-contain border border-gray-200 bg-white" />
                        <button type="button" onClick={() => handleRemoveFile(business.id, 'logo')} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs">×</button>
                      </div>
                    ) : (
                      <div onClick={() => logoInputRefs.current[business.id]?.click()} className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-teal-300">
                        <span className="text-xl text-gray-400">🖼️</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" ref={(el) => { logoInputRefs.current[business.id] = el }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(business.id, f, 'logo'); e.target.value = '' }} className="hidden" />
                    <span className="text-xs text-gray-500">{uploadingLogo === business.id ? 'Uploading...' : 'Click to upload'}</span>
                  </div>

                  <label className="block text-xs font-medium text-gray-500 mb-1">Profile photo</label>
                  <div className="flex items-center gap-3">
                    {business.profile_photo_url ? (
                      <div className="relative inline-block group">
                        <img src={business.profile_photo_url} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                        <button type="button" onClick={() => handleRemoveFile(business.id, 'profile_photo')} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs">×</button>
                      </div>
                    ) : (
                      <div onClick={() => photoInputRefs.current[business.id]?.click()} className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-teal-300">
                        <span className="text-xl text-gray-400">👤</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" ref={(el) => { photoInputRefs.current[business.id] = el }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(business.id, f, 'profile_photo'); e.target.value = '' }} className="hidden" />
                    <span className="text-xs text-gray-500">{uploadingPhoto === business.id ? 'Uploading...' : 'Click to upload'}</span>
                  </div>

                  {/* Example palette bar so roles are visible when choosing colours */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5">Example: Primary · Secondary · Accent</p>
                    <div className="flex gap-1 h-10 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                      <div className="flex-1 flex flex-col items-center justify-end pb-1" style={{ backgroundColor: '#0d9488' }} title="Primary (e.g. teal)"><span className="text-[10px] font-medium text-white drop-shadow">Primary</span></div>
                      <div className="flex-1 flex flex-col items-center justify-end pb-1" style={{ backgroundColor: '#6b7280' }} title="Secondary (e.g. gray)"><span className="text-[10px] font-medium text-white drop-shadow">Secondary</span></div>
                      <div className="flex-1 flex flex-col items-center justify-end pb-1" style={{ backgroundColor: '#f59e0b' }} title="Accent (e.g. amber)"><span className="text-[10px] font-medium text-white drop-shadow">Accent</span></div>
                    </div>
                  </div>

                  <label className="block text-xs font-medium text-gray-500 mb-1">Primary colour</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(business.brand_primary_color || '') ? business.brand_primary_color! : '#0d9488'} onChange={(e) => updateBusiness(business.id, { brand_primary_color: e.target.value })} className="w-10 h-10 rounded border border-gray-200 cursor-pointer" />
                    <input type="text" value={business.brand_primary_color || ''} onChange={(e) => updateBusiness(business.id, { brand_primary_color: e.target.value || null })} placeholder="#0d9488" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Secondary colour (optional)</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(business.brand_secondary_color || '') ? business.brand_secondary_color! : '#6b7280'} onChange={(e) => updateBusiness(business.id, { brand_secondary_color: e.target.value })} className="w-10 h-10 rounded border border-gray-200 cursor-pointer" />
                    <input type="text" value={business.brand_secondary_color || ''} onChange={(e) => updateBusiness(business.id, { brand_secondary_color: e.target.value || null })} placeholder="#hex" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Accent colour (optional)</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(business.brand_accent_color || '') ? business.brand_accent_color! : '#6b7280'} onChange={(e) => updateBusiness(business.id, { brand_accent_color: e.target.value })} className="w-10 h-10 rounded border border-gray-200 cursor-pointer" />
                    <input type="text" value={business.brand_accent_color || ''} onChange={(e) => updateBusiness(business.id, { brand_accent_color: e.target.value || null })} placeholder="#hex" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div className="flex gap-1 h-8 rounded-lg overflow-hidden border border-gray-200">
                    <div className="flex-1" style={{ backgroundColor: business.brand_primary_color || '#0d9488' }} title="Your primary" />
                    <div className="flex-1" style={{ backgroundColor: business.brand_secondary_color || '#e5e7eb' }} title="Your secondary" />
                    <div className="flex-1" style={{ backgroundColor: business.brand_accent_color || '#e5e7eb' }} title="Your accent" />
                  </div>
                    </div>
                  </div>

                  {/* Voice */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-medium">3</span>
                      <h4 className="font-medium text-gray-900">Voice</h4>
                    </div>
                    <div className="space-y-3 pl-10">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tagline</label>
                  <input type="text" value={business.tagline || ''} onChange={(e) => updateBusiness(business.id, { tagline: e.target.value || null })} placeholder="e.g. Your neighbourhood plumber" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <p className="text-xs text-gray-400 -mt-1">A clear tagline helps every post sound like you.</p>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Default call to action (button text)</label>
                  <input
                    type="text"
                    value={business.default_cta_primary ?? business.default_cta_secondary ?? ''}
                    onChange={(e) => {
                      const v = e.target.value || null
                      updateBusiness(business.id, { default_cta_primary: v, default_cta_secondary: v })
                    }}
                    placeholder="e.g. Book now"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <p className="text-xs text-gray-400 -mt-1">Used as primary and link CTA everywhere (e.g. GMB, emails).</p>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Default tone</label>
                  <select value={business.default_tone || ''} onChange={(e) => updateBusiness(business.id, { default_tone: e.target.value || null })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    {TONE_OPTIONS.map((o) => (<option key={o.value || 'none'} value={o.value}>{o.label}</option>))}
                  </select>
                  <p className="text-xs text-gray-400 -mt-1">How your content should sound: professional or friendly.</p>
                    </div>
                  </div>

                  {/* Online presence */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">4</span>
                      <h4 className="font-medium text-gray-900">Online presence</h4>
                    </div>
                    <div className="space-y-3 pl-10">
                  <label className="block text-xs font-medium text-gray-500 mb-1">SEO keywords (comma-separated)</label>
                  <input type="text" value={business.seo_keywords || ''} onChange={(e) => updateBusiness(business.id, { seo_keywords: e.target.value || null })} placeholder="plumber near me, drain cleaning [city]" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <label className="block text-xs font-medium text-gray-500 mb-1">Social handles</label>
                  <input type="text" value={business.social_handles || ''} onChange={(e) => updateBusiness(business.id, { social_handles: e.target.value || null })} placeholder="@mybusiness" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <label className="block text-xs font-medium text-gray-500 mb-1">Short About (2–4 sentences)</label>
                  <textarea value={business.short_about || ''} onChange={(e) => updateBusiness(business.id, { short_about: e.target.value || null })} placeholder="Used in Google Business Profile, blog author box, About sections" rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={saving === business.id}
                      className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 disabled:opacity-50 shadow-sm hover:shadow transition-all"
                    >
                      {saving === business.id ? 'Saving...' : 'Save & done'}
                    </button>
                    <button type="button" onClick={() => { setEditingBusiness(null); fetchBusinesses() }} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          )})}
        </div>
      )}
      </div>
    </div>
  )
}
