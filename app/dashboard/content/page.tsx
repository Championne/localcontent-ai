'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const templates = [
    { 
      id: 'blog-post', 
      name: 'Blog Post', 
      description: 'SEO-optimized blog article for your website',
      color: 'teal'
    },
    { 
      id: 'social-post', 
      name: 'Social Media Post', 
      description: 'Engaging content for Facebook, Instagram, or X',
      color: 'orange'
    },
    { 
      id: 'gmb-post', 
      name: 'Google Business Post', 
      description: 'Updates, offers, or events for your GMB profile',
      color: 'blue'
    },
    { 
      id: 'email', 
      name: 'Email Newsletter', 
      description: 'Professional email content for your customers',
      color: 'purple'
    },
  ]

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

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    
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
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content')
      }

      setGeneratedContent(data.content)
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
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          title: topic,
          content: generatedContent,
          metadata: { businessName, industry, tone },
          status: 'draft',
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

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'blog-post':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )
      case 'social-post':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-2">What type of content do you want to create?</h2>
          <p className="text-gray-500 mb-6">Choose a template to get started</p>
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
                  className={`p-5 border-2 rounded-xl text-left transition-all ${colors.bg} ${colors.border}`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${colors.icon}`}>
                    {getTemplateIcon(template.id)}
                  </div>
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
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
                {['professional', 'friendly', 'casual', 'formal'].map((t) => (
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
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={!businessName || !industry || !topic || generating}
                className="flex-1 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
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

      {/* Step 3: Review & Edit */}
      {step === 3 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Review your content</h2>
              <p className="text-gray-500 text-sm">Edit as needed, then save or copy</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              AI Generated
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">Content Editor</span>
              <span className="text-xs text-gray-400">{generatedContent.length} characters</span>
            </div>
            <textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              rows={16}
              className="w-full p-4 resize-none focus:outline-none text-gray-700 leading-relaxed"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-5 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {generating ? 'Regenerating...' : 'Regenerate'}
            </button>
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600">Copied!</span>
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
    </div>
  )
}
