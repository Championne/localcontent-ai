'use client'

import { useState } from 'react'
import { SAMPLE_BUSINESSES } from '@/scripts/generate-examples'

interface GeneratedContent {
  id: string
  type: string
  businessName: string
  industry: string
  topic: string
  content: string | Record<string, unknown>
  imageUrl?: string
  generatedAt: string
}

interface GenerationResult {
  success: boolean
  message: string
  data?: {
    frontPageSocialPack: GeneratedContent
    examples: {
      blogPost: GeneratedContent
      socialPack: GeneratedContent
      googleBusinessPost: GeneratedContent
      emailNewsletter: GeneratedContent
    }
  }
  stats?: {
    totalGenerated: number
    withImages: number
    aiPowered: boolean
  }
  error?: string
}

export default function GenerateExamplesPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [progress, setProgress] = useState('')

  const handleGenerate = async () => {
    setIsGenerating(true)
    setResult(null)
    setProgress('Starting AI content generation...')

    try {
      setProgress('Generating 5 pieces of content with GeoSpark AI...')
      
      const response = await fetch('/api/examples/generate?secret=generate-examples-2024')
      const data = await response.json()

      if (data.success) {
        setProgress('Done!')
        setResult(data)
      } else {
        setResult({ success: false, message: data.error || 'Generation failed' })
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const formatContent = (content: string | Record<string, unknown>) => {
    if (typeof content === 'string') {
      return content.substring(0, 500) + (content.length > 500 ? '...' : '')
    }
    return JSON.stringify(content, null, 2).substring(0, 500) + '...'
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Example Content</h1>
        <p className="text-gray-600">
          Use GeoSpark's AI engine to generate authentic examples for the landing page and examples page.
        </p>
      </div>

      {/* Sample Businesses Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content to Generate</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_BUSINESSES.map((business, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  business.type === 'blog-post' ? 'bg-blue-100 text-blue-700' :
                  business.type === 'social-pack' ? 'bg-purple-100 text-purple-700' :
                  business.type === 'gmb-post' ? 'bg-green-100 text-green-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {business.type.replace('-', ' ')}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{business.businessName}</h3>
              <p className="text-xs text-gray-500">{business.industry}</p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{business.topic}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="bg-gradient-to-r from-teal-50 to-orange-50 rounded-xl border border-teal-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate?</h2>
            <p className="text-gray-600 text-sm">
              This will create 5 unique pieces of content using your AI engine. 
              {result?.stats?.aiPowered === false && ' (Currently using mock data - configure OPENAI_API_KEY for real AI)'}
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              isGenerating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              '🚀 Generate Examples'
            )}
          </button>
        </div>
        
        {progress && isGenerating && (
          <div className="mt-4 text-sm text-teal-700 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {progress}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className={`rounded-xl border p-6 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            {result.success ? (
              <>
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-semibold text-green-800">{result.message}</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-semibold text-red-800">{result.message}</span>
              </>
            )}
          </div>

          {result.stats && (
            <div className="flex gap-4 mb-6">
              <div className="bg-white rounded-lg px-4 py-2">
                <p className="text-2xl font-bold text-gray-900">{result.stats.totalGenerated}</p>
                <p className="text-sm text-gray-500">Content pieces</p>
              </div>
              <div className="bg-white rounded-lg px-4 py-2">
                <p className="text-2xl font-bold text-gray-900">{result.stats.withImages}</p>
                <p className="text-sm text-gray-500">With images</p>
              </div>
              <div className="bg-white rounded-lg px-4 py-2">
                <p className="text-2xl font-bold text-gray-900">{result.stats.aiPowered ? '✓' : '×'}</p>
                <p className="text-sm text-gray-500">AI Powered</p>
              </div>
            </div>
          )}

          {result.data && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Generated Content Preview:</h3>
              
              {/* Blog Post */}
              {result.data.examples.blogPost && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">Blog Post</span>
                    <span className="text-sm text-gray-500">{result.data.examples.blogPost.businessName}</span>
                  </div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {formatContent(result.data.examples.blogPost.content)}
                  </pre>
                </div>
              )}

              {/* Social Pack */}
              {result.data.examples.socialPack && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">Social Pack</span>
                    <span className="text-sm text-gray-500">{result.data.examples.socialPack.businessName}</span>
                  </div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {formatContent(result.data.examples.socialPack.content)}
                  </pre>
                </div>
              )}

              {/* Google Business Post */}
              {result.data.examples.googleBusinessPost && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">Google Business</span>
                    <span className="text-sm text-gray-500">{result.data.examples.googleBusinessPost.businessName}</span>
                  </div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {formatContent(result.data.examples.googleBusinessPost.content)}
                  </pre>
                </div>
              )}

              {/* Email Newsletter */}
              {result.data.examples.emailNewsletter && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-medium">Email Newsletter</span>
                    <span className="text-sm text-gray-500">{result.data.examples.emailNewsletter.businessName}</span>
                  </div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {formatContent(result.data.examples.emailNewsletter.content)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {result.success && (
            <div className="mt-6 p-4 bg-teal-100 rounded-lg">
              <p className="text-sm text-teal-800">
                <strong>Next steps:</strong> The generated content has been saved to <code className="bg-teal-200 px-1 rounded">data/generated-examples.json</code>. 
                You can now update the examples page to use this dynamic content, or manually copy the best examples into the page.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Manual Usage Instructions */}
      <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Alternative: API Usage</h3>
        <p className="text-sm text-gray-600 mb-4">
          You can also generate examples directly via API call:
        </p>
        <code className="block bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
          GET /api/examples/generate?secret=generate-examples-2024
        </code>
      </div>
    </div>
  )
}
