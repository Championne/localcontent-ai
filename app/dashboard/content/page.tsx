'use client'

import { useState } from 'react'

export default function CreateContentPage() {
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [error, setError] = useState('')

  const templates = [
    { id: 'blog-post', name: 'Blog Post', description: 'SEO-optimized blog article' },
    { id: 'social-post', name: 'Social Media Post', description: 'Engaging social content' },
    { id: 'gmb-post', name: 'Google Business Post', description: 'GMB update or offer' },
    { id: 'email', name: 'Email Newsletter', description: 'Customer email content' },
  ]

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
    // In production, this would save to the database
    alert('Content saved! (In production, this would save to your content library)')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
    alert('Content copied to clipboard!')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Content</h1>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>1</div>
          <span className="ml-2 font-medium">Choose Template</span>
        </div>
        <div className="flex-1 h-px bg-muted mx-4"></div>
        <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>2</div>
          <span className="ml-2 font-medium">Add Details</span>
        </div>
        <div className="flex-1 h-px bg-muted mx-4"></div>
        <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-muted'}`}>3</div>
          <span className="ml-2 font-medium">Review & Edit</span>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Step 1: Choose Template */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Select a template</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template.id)
                  setStep(2)
                }}
                className={`p-4 border rounded-lg text-left hover:border-primary transition-colors ${
                  selectedTemplate === template.id ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Add Details */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Tell us about your content</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Your Business Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select industry...</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Plumber">Plumber</option>
                <option value="Electrician">Electrician</option>
                <option value="HVAC">HVAC</option>
                <option value="Salon">Salon / Spa</option>
                <option value="Dentist">Dentist</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Landscaping">Landscaping</option>
                <option value="Auto Repair">Auto Repair</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Topic / What to write about</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Spring cleaning tips, New menu items, Special promotion..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
              </select>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border rounded-md hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={!businessName || !industry || !topic || generating}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Content'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review & Edit */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Review your content</h2>
          <div className="bg-card border rounded-lg p-4 mb-4">
            <textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              rows={20}
              className="w-full bg-transparent resize-none focus:outline-none font-mono text-sm"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 border rounded-md hover:bg-muted"
            >
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 border rounded-md hover:bg-muted"
            >
              {generating ? 'Regenerating...' : 'Regenerate'}
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 border rounded-md hover:bg-muted"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Save Content
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
