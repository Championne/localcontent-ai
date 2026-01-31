'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Business {
  id: string
  name: string
  industry: string | null
  location: string | null
  logo_url: string | null
  profile_photo_url: string | null
  created_at: string
}

interface UserProfile {
  email: string
  full_name: string
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

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({ email: '', full_name: '' })
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // New business form
  const [showAddBusiness, setShowAddBusiness] = useState(false)
  const [newBusiness, setNewBusiness] = useState({ name: '', industry: '', location: '' })
  
  // Edit business
  const [editingBusiness, setEditingBusiness] = useState<string | null>(null)
  
  // File uploads
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
  const logoInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const photoInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const profileRes = await fetch('/api/auth/profile')
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
      }

      const bizRes = await fetch('/api/business')
      if (bizRes.ok) {
        const bizData = await bizRes.json()
        setBusinesses(bizData.businesses || [])
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleSaveProfile = async () => {
    setSaving('profile')
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: profile.full_name }),
      })
      if (res.ok) {
        showMessage('success', 'Profile saved successfully!')
      } else {
        showMessage('error', 'Failed to save profile')
      }
    } catch {
      showMessage('error', 'Failed to save profile')
    } finally {
      setSaving(null)
    }
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
        showMessage('success', 'Business added successfully!')
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
        }),
      })
      if (res.ok) {
        setEditingBusiness(null)
        showMessage('success', 'Business updated successfully!')
      } else {
        showMessage('error', 'Failed to update business')
      }
    } catch {
      showMessage('error', 'Failed to update business')
    } finally {
      setSaving(null)
    }
  }

  const handleDeleteBusiness = async (id: string) => {
    if (!confirm('Are you sure you want to delete this business?')) return
    
    setSaving(id)
    try {
      const res = await fetch(`/api/business/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setBusinesses(businesses.filter(b => b.id !== id))
        showMessage('success', 'Business deleted successfully!')
      } else {
        showMessage('error', 'Failed to delete business')
      }
    } catch {
      showMessage('error', 'Failed to delete business')
    } finally {
      setSaving(null)
    }
  }

  const handleFileUpload = async (businessId: string, file: File, type: 'logo' | 'profile_photo') => {
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please upload an image file')
      return
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', 'Image must be under 2MB')
      return
    }

    if (type === 'logo') {
      setUploadingLogo(businessId)
    } else {
      setUploadingPhoto(businessId)
    }
    
    try {
      const formData = new FormData()
      formData.append(type, file)
      formData.append('businessId', businessId)
      formData.append('type', type)

      const res = await fetch('/api/business/logo', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setBusinesses(businesses.map(b => 
          b.id === businessId 
            ? { ...b, [type === 'logo' ? 'logo_url' : 'profile_photo_url']: data.url } 
            : b
        ))
        showMessage('success', `${type === 'logo' ? 'Logo' : 'Profile photo'} uploaded successfully!`)
      } else {
        const err = await res.json()
        showMessage('error', err.error || 'Failed to upload')
      }
    } catch {
      showMessage('error', 'Failed to upload')
    } finally {
      if (type === 'logo') {
        setUploadingLogo(null)
      } else {
        setUploadingPhoto(null)
      }
    }
  }

  const handleRemoveFile = async (businessId: string, type: 'logo' | 'profile_photo') => {
    if (!confirm(`Remove ${type === 'logo' ? 'logo' : 'profile photo'}?`)) return
    
    if (type === 'logo') {
      setUploadingLogo(businessId)
    } else {
      setUploadingPhoto(businessId)
    }
    
    try {
      const res = await fetch('/api/business/logo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, type }),
      })

      if (res.ok) {
        setBusinesses(businesses.map(b => 
          b.id === businessId 
            ? { ...b, [type === 'logo' ? 'logo_url' : 'profile_photo_url']: null } 
            : b
        ))
        showMessage('success', `${type === 'logo' ? 'Logo' : 'Profile photo'} removed`)
      } else {
        showMessage('error', 'Failed to remove')
      }
    } catch {
      showMessage('error', 'Failed to remove')
    } finally {
      if (type === 'logo') {
        setUploadingLogo(null)
      } else {
        setUploadingPhoto(null)
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              placeholder="Your name"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving === 'profile'}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
          >
            {saving === 'profile' ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Businesses Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Businesses</h2>
          <button
            onClick={() => setShowAddBusiness(true)}
            className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Business
          </button>
        </div>

        {/* Add Business Form */}
        {showAddBusiness && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Add New Business</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newBusiness.name}
                onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                placeholder="Business Name *"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
              <select
                value={newBusiness.industry}
                onChange={(e) => setNewBusiness({ ...newBusiness, industry: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
              >
                <option value="">Select Industry...</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={newBusiness.location}
                onChange={(e) => setNewBusiness({ ...newBusiness, location: e.target.value })}
                placeholder="Location (City, State)"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddBusiness}
                  disabled={saving === 'add-business'}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-300 transition-colors text-sm"
                >
                  {saving === 'add-business' ? 'Adding...' : 'Add Business'}
                </button>
                <button
                  onClick={() => {
                    setShowAddBusiness(false)
                    setNewBusiness({ name: '', industry: '', location: '' })
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Business List */}
        {businesses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p>No businesses added yet</p>
            <button
              onClick={() => setShowAddBusiness(true)}
              className="mt-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
            >
              Add your first business
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map((business) => (
              <div key={business.id} className="p-4 border border-gray-200 rounded-lg">
                {editingBusiness === business.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={business.name}
                      onChange={(e) => setBusinesses(businesses.map(b => 
                        b.id === business.id ? { ...b, name: e.target.value } : b
                      ))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                    />
                    <select
                      value={business.industry || ''}
                      onChange={(e) => setBusinesses(businesses.map(b => 
                        b.id === business.id ? { ...b, industry: e.target.value } : b
                      ))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white"
                    >
                      <option value="">Select Industry...</option>
                      {INDUSTRIES.map(ind => (
                        <option key={ind.value} value={ind.value}>{ind.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={business.location || ''}
                      onChange={(e) => setBusinesses(businesses.map(b => 
                        b.id === business.id ? { ...b, location: e.target.value } : b
                      ))}
                      placeholder="Location"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateBusiness(business)}
                        disabled={saving === business.id}
                        className="px-3 py-1.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-300 text-sm"
                      >
                        {saving === business.id ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingBusiness(null)
                          fetchData()
                        }}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Business Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{business.name}</h3>
                        <p className="text-sm text-gray-500">
                          {business.industry || 'No industry set'}
                          {business.location && ` • ${business.location}`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingBusiness(business.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteBusiness(business.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Logo and Profile Photo Section */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      {/* Logo Upload */}
                      <div className="text-center">
                        <div className="mb-2">
                          {business.logo_url ? (
                            <div className="relative inline-block group">
                              <img 
                                src={business.logo_url} 
                                alt="Logo"
                                onClick={() => logoInputRefs.current[business.id]?.click()}
                                className="w-16 h-16 rounded-lg object-contain border border-gray-200 bg-white mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                              />
                              <button
                                onClick={() => handleRemoveFile(business.id, 'logo')}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                title="Remove"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => logoInputRefs.current[business.id]?.click()}
                              className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-50 hover:border-teal-300 transition-colors"
                            >
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          ref={el => { logoInputRefs.current[business.id] = el }}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(business.id, file, 'logo')
                            e.target.value = ''
                          }}
                          className="hidden"
                        />
                        <button
                          onClick={() => logoInputRefs.current[business.id]?.click()}
                          disabled={uploadingLogo === business.id}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium disabled:text-gray-400"
                        >
                          {uploadingLogo === business.id ? 'Uploading...' : (business.logo_url ? 'Change logo' : 'Upload logo')}
                        </button>
                        <p className="text-[10px] text-gray-400 mt-1">Business logo</p>
                      </div>

                      {/* Profile Photo Upload */}
                      <div className="text-center">
                        <div className="mb-2">
                          {business.profile_photo_url ? (
                            <div className="relative inline-block group">
                              <img 
                                src={business.profile_photo_url} 
                                alt="Profile"
                                onClick={() => photoInputRefs.current[business.id]?.click()}
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                              />
                              <button
                                onClick={() => handleRemoveFile(business.id, 'profile_photo')}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                title="Remove"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => photoInputRefs.current[business.id]?.click()}
                              className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-50 hover:border-teal-300 transition-colors"
                            >
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          ref={el => { photoInputRefs.current[business.id] = el }}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(business.id, file, 'profile_photo')
                            e.target.value = ''
                          }}
                          className="hidden"
                        />
                        <button
                          onClick={() => photoInputRefs.current[business.id]?.click()}
                          disabled={uploadingPhoto === business.id}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium disabled:text-gray-400"
                        >
                          {uploadingPhoto === business.id ? 'Uploading...' : (business.profile_photo_url ? 'Change photo' : 'Upload photo')}
                        </button>
                        <p className="text-[10px] text-gray-400 mt-1">Your photo for posts</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Current Plan: Free</p>
            <p className="text-sm text-gray-500">Upgrade for more content and features</p>
          </div>
          <Link
            href="/pricing"
            className="px-5 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Upgrade Plan
          </Link>
        </div>
      </div>
    </div>
  )
}
