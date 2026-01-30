'use client'

import { useState } from 'react'

export default function CreateContentPage() {
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')

  const templates = [
    { id: 'blog-post', name: 'Blog Post', description: 'SEO-optimized blog article' },
    { id: 'social-post', name: 'Social Media Post', description: 'Engaging social content' },
    { id: 'gmb-post', name: 'Google Business Post', description: 'GMB update or offer' },
    { id: 'email', name: 'Email Newsletter', description: 'Customer email content' },
  ]

  const handleGenerate = async () => {
    setGenerating(true)
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setGeneratedContent(`# ${topic}

Here is your AI-generated content for ${businessName} in the ${industry} industry.

This is a sample output. In production, this would call the OpenAI API to generate actual content based on your inputs.

## Key Points
- Point 1 about your topic
- Point 2 with industry-specific insights
- Point 3 with a call to action

Contact ${businessName} today to learn more!`)
    setGenerating(false)
    setStep(3)
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
                <option value="restaurant">Restaurant</option>
                <option value="plumber">Plumber</option>
                <option value="electrician">Electrician</option>
                <option value="salon">Salon</option>
                <option value="dentist">Dentist</option>
                <option value="real-estate">Real Estate</option>
                <option value="other">Other</option>
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
              rows={15}
              className="w-full bg-transparent resize-none focus:outline-none"
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
              className="px-4 py-2 border rounded-md hover:bg-muted"
            >
              Regenerate
            </button>
            <button
              onClick={() => alert('Content saved! (In production, this would save to database)')}
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
