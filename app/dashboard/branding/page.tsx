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
  service_areas: string | null
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
  { value: 'casual', label: 'Casual' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'warm', label: 'Warm' },
]

export default function BrandingPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showAddBusiness, setShowAddBusiness] = useState(false)
  const [newBusiness, setNewBusiness] = useState({ name: '', industry: '', location: '' })
  const [editingBusiness, setEditingBusiness] = useState<string | null>(null)
  const [expandedBranding, setExpandedBranding] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
  const logoInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const photoInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    fetchBusinesses()
  }, [])

  // Auto-expand branding when there's only one business
  useEffect(() => {
    if (businesses.length === 1) {
      setExpandedBranding((prev) => (prev === businesses[0].id ? prev : businesses[0].id))
    }
  }, [businesses])

  // Auto-expand branding when there's only one business
  useEffect(() => {
    if (businesses.length === 1 && !expandedBranding) {
      setExpandedBranding(businesses[0].id)
    }
  }, [businesses.length])

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

  const handleUpdateBusiness = async (business: Business) => {
    setSaving(business.id)
    try {
      const res = await fetch('/api/business', {
        method: 'PATCH',
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
          service_areas: business.service_areas,
          short_about: business.short_about,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setBusinesses((prev) => prev.map((b) => (b.id === business.id ? data.business : b)))
        setEditingBusiness(null)
        setExpandedBranding(null)
        showMessage('success', 'Saved')
      } else {
        showMessage('error', 'Failed to save')
      }
    } catch {
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

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Brand identity</h1>
      <p className="text-gray-600 text-sm mb-6">
        Set up each business: name, logo, colours, tagline, and CTAs. Used in content, overlays, and AI prompts.
      </p>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your businesses</h2>
        <button
          type="button"
          onClick={() => setShowAddBusiness(true)}
          className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
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
          {businesses.map((business) => (
            <div
              key={business.id}
              className="border border-gray-200 rounded-xl bg-white overflow-hidden"
            >
              {/* Header: name, industry, location, edit/delete */}
              <div className="p-4 border-b border-gray-100 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{business.name}</h3>
                  <p className="text-sm text-gray-500">
                    {business.industry || 'No industry'}
                    {business.location && ` • ${business.location}`}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingBusiness(editingBusiness === business.id ? null : business.id)
                    }
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Edit basics"
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

              {editingBusiness === business.id ? (
                <div className="p-4 bg-gray-50 space-y-3">
                  <input
                    type="text"
                    value={business.name}
                    onChange={(e) => updateBusiness(business.id, { name: e.target.value })}
                    placeholder="Business name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <select
                    value={business.industry || ''}
                    onChange={(e) => updateBusiness(business.id, { industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="">Industry...</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind.value} value={ind.value}>{ind.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={business.location || ''}
                    onChange={(e) => updateBusiness(business.id, { location: e.target.value })}
                    placeholder="Location"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateBusiness(business)}
                      disabled={saving === business.id}
                      className="px-3 py-1.5 bg-teal-600 text-white rounded-lg font-medium text-sm disabled:opacity-50"
                    >
                      {saving === business.id ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingBusiness(null); fetchBusinesses() }}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Logo + profile photo */}
                  <div className="p-4 grid grid-cols-2 gap-6 border-b border-gray-100">
                    <div className="text-center">
                      <div className="mb-2">
                        {business.logo_url ? (
                          <div className="relative inline-block group">
                            <img
                              src={business.logo_url}
                              alt="Logo"
                              className="w-20 h-20 rounded-lg object-contain border border-gray-200 bg-white mx-auto cursor-pointer hover:opacity-80"
                              onClick={() => logoInputRefs.current[business.id]?.click()}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(business.id, 'logo')}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center"
                            >
                              <span className="text-xs">×</span>
                            </button>
                          </div>
                        ) : (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => logoInputRefs.current[business.id]?.click()}
                            onKeyDown={(e) => e.key === 'Enter' && logoInputRefs.current[business.id]?.click()}
                            className="w-20 h-20 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto cursor-pointer hover:border-teal-300"
                          >
                            <span className="text-2xl text-gray-400">🖼️</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => { logoInputRefs.current[business.id] = el }}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) handleFileUpload(business.id, f, 'logo')
                          e.target.value = ''
                        }}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500">
                        {uploadingLogo === business.id ? 'Uploading...' : 'Logo (overlay)'}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="mb-2">
                        {business.profile_photo_url ? (
                          <div className="relative inline-block group">
                            <img
                              src={business.profile_photo_url}
                              alt="Profile"
                              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 mx-auto cursor-pointer hover:opacity-80"
                              onClick={() => photoInputRefs.current[business.id]?.click()}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(business.id, 'profile_photo')}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center"
                            >
                              <span className="text-xs">×</span>
                            </button>
                          </div>
                        ) : (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => photoInputRefs.current[business.id]?.click()}
                            onKeyDown={(e) => e.key === 'Enter' && photoInputRefs.current[business.id]?.click()}
                            className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto cursor-pointer hover:border-teal-300"
                          >
                            <span className="text-2xl text-gray-400">👤</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => { photoInputRefs.current[business.id] = el }}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) handleFileUpload(business.id, f, 'profile_photo')
                          e.target.value = ''
                        }}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500">
                        {uploadingPhoto === business.id ? 'Uploading...' : 'Profile photo (overlay)'}
                      </p>
                    </div>
                  </div>

                  {/* Branding fields (expandable) */}
                  <div className="p-4">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedBranding(expandedBranding === business.id ? null : business.id)
                      }
                      className="w-full flex items-center justify-between text-left text-sm font-medium text-gray-700 py-1"
                    >
                      Brand colours, tagline, CTA, SEO, tone, website, social, about
                      <span className="text-gray-400">
                        {expandedBranding === business.id ? '▼' : '▶'}
                      </span>
                    </button>
                    {expandedBranding === business.id && (
                      <div className="mt-4 space-y-6 pt-4 border-t border-gray-100">
                        {/* Visual identity */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Visual identity</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Primary colour</label>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="color"
                                  value={/^#[0-9A-Fa-f]{6}$/.test(business.brand_primary_color || '') ? business.brand_primary_color! : '#0d9488'}
                                  onChange={(e) =>
                                    updateBusiness(business.id, { brand_primary_color: e.target.value })
                                  }
                                  className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={business.brand_primary_color || ''}
                                  onChange={(e) =>
                                    updateBusiness(business.id, { brand_primary_color: e.target.value || null })
                                  }
                                  placeholder="#0d9488"
                                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm"
                                />
                              </div>
                              <p className="mt-1 text-xs text-gray-400">Used on image overlays, borders, and in content.</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Secondary (optional)</label>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="color"
                                  value={/^#[0-9A-Fa-f]{6}$/.test(business.brand_secondary_color || '') ? business.brand_secondary_color! : '#6b7280'}
                                  onChange={(e) =>
                                    updateBusiness(business.id, { brand_secondary_color: e.target.value })
                                  }
                                  className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={business.brand_secondary_color || ''}
                                  onChange={(e) =>
                                    updateBusiness(business.id, { brand_secondary_color: e.target.value || null })
                                  }
                                  placeholder="#hex"
                                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Accent (optional)</label>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="color"
                                  value={/^#[0-9A-Fa-f]{6}$/.test(business.brand_accent_color || '') ? business.brand_accent_color! : '#6b7280'}
                                  onChange={(e) =>
                                    updateBusiness(business.id, { brand_accent_color: e.target.value })
                                  }
                                  className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={business.brand_accent_color || ''}
                                  onChange={(e) =>
                                    updateBusiness(business.id, { brand_accent_color: e.target.value || null })
                                  }
                                  placeholder="#hex"
                                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-1 h-8 rounded-lg overflow-hidden border border-gray-200">
                            <div className="flex-1" style={{ backgroundColor: business.brand_primary_color || '#0d9488' }} title="Primary" />
                            <div className="flex-1" style={{ backgroundColor: business.brand_secondary_color || '#e5e7eb' }} title="Secondary" />
                            <div className="flex-1" style={{ backgroundColor: business.brand_accent_color || '#e5e7eb' }} title="Accent" />
                          </div>
                        </div>

                        {/* Voice & messaging */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Voice & messaging</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Tagline (one line)</label>
                              <input
                                type="text"
                                value={business.tagline || ''}
                                onChange={(e) => updateBusiness(business.id, { tagline: e.target.value || null })}
                                placeholder="e.g. Your neighbourhood plumber"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                              />
                              <p className="mt-1 text-xs text-gray-400">Used in social posts, GMB, and overlay suggestions.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Primary CTA</label>
                                <input
                                  type="text"
                                  value={business.default_cta_primary || ''}
                                  onChange={(e) =>
                                    updateBusiness(business.id, { default_cta_primary: e.target.value || null })
                                  }
                                  placeholder="e.g. Book now"
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Secondary CTA</label>
                                <input
                                  type="text"
                                  value={business.default_cta_secondary || ''}
                                  onChange={(e) =>
                                    updateBusiness(business.id, { default_cta_secondary: e.target.value || null })
                                  }
                                  placeholder="e.g. Contact us"
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Default tone</label>
                              <select
                                value={business.default_tone || ''}
                                onChange={(e) =>
                                  updateBusiness(business.id, { default_tone: e.target.value || null })
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                              >
                                {TONE_OPTIONS.map((o) => (
                                  <option key={o.value || 'none'} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Discoverability */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Discoverability</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">SEO keywords (comma-separated)</label>
                              <input
                                type="text"
                                value={business.seo_keywords || ''}
                                onChange={(e) =>
                                  updateBusiness(business.id, { seo_keywords: e.target.value || null })
                                }
                                placeholder="plumber near me, drain cleaning [city]"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                              />
                              <p className="mt-1 text-xs text-gray-400">Used in blog meta, headings, and social hashtags.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Website URL</label>
                                <input
                                  type="url"
                                  value={business.website || ''}
                                  onChange={(e) => updateBusiness(business.id, { website: e.target.value || null })}
                                  placeholder="https://..."
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Social handles</label>
                                <input
                                  type="text"
                                  value={business.social_handles || ''}
                                  onChange={(e) =>
                                    updateBusiness(business.id, { social_handles: e.target.value || null })
                                  }
                                  placeholder="@mybusiness"
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Service areas (cities, neighbourhoods)</label>
                              <input
                                type="text"
                                value={business.service_areas || ''}
                                onChange={(e) =>
                                  updateBusiness(business.id, { service_areas: e.target.value || null })
                                }
                                placeholder="Austin, Round Rock, Pflugerville"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* About */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">About</h4>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Short About (2–4 sentences)</label>
                          <textarea
                            value={business.short_about || ''}
                            onChange={(e) =>
                              updateBusiness(business.id, { short_about: e.target.value || null })
                            }
                            placeholder="Used in GMB, blog author box, About sections"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateBusiness(business)}
                            disabled={saving === business.id}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 disabled:opacity-50"
                          >
                            {saving === business.id ? 'Saving...' : 'Save branding'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
