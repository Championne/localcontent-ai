'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface UserProfile {
  email: string
  full_name: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({ email: '', full_name: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const profileRes = await fetch('/api/auth/profile')
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
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
          <p className="text-sm text-gray-500 mt-2">
            Businesses, logo, and Brand Identity → <Link href="/dashboard/branding" className="text-teal-600 hover:underline">Brand Identity</Link>
          </p>
        </div>
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
