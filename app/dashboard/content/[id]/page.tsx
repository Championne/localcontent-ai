'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ContentItem {
  id: string
  title: string
  template: string
  content: string
  metadata: {
    image_url?: string
    platforms?: string[]
    tone?: string
    [key: string]: unknown
  }
  image_url?: string | null
  status: 'draft' | 'published' | 'scheduled'
  created_at: string
  updated_at: string
}

export default function EditContentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [content, setContent] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [contentText, setContentText] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft')

  useEffect(() => {
    fetchContent()
  }, [params.id])

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/content/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch content')
      }

      const item = data.content
      setContent(item)
      setTitle(item.title || '')
      setContentText(item.content || '')
      setStatus(item.status || 'draft')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/content/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: contentText,
          status,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      router.push('/dashboard/library')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const response = await fetch(`/api/content/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete')
      }

      router.push('/dashboard/library')
    } catch (err) {
      setError('Failed to delete content')
    }
  }

  const getTemplateLabel = (template: string) => {
    const labels: Record<string, string> = {
      'blog-post': 'Blog Post',
      'social-post': 'Social Media',
      'gmb-post': 'Google Business',
      'email': 'Email',
    }
    return labels[template] || template
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    )
  }

  if (error && !content) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/dashboard/library" className="text-teal-600 hover:underline">
          Back to Library
        </Link>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Content not found</p>
        <Link href="/dashboard/library" className="text-teal-600 hover:underline">
          Back to Library
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link 
            href="/dashboard/library" 
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Library
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Content</h1>
          <p className="text-sm text-gray-500">
            {getTemplateLabel(content.template)} • Created {new Date(content.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Enter content..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'scheduled')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href="/dashboard/library"
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>

        {/* Preview / Image */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Preview</h2>
          
          {/* Image Preview */}
          {(content.metadata?.image_url ?? content.image_url) && (
            <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={content.metadata?.image_url ?? content.image_url ?? ''}
                alt={title || 'Content image'}
                className="w-full h-auto object-contain max-h-80"
              />
            </div>
          )}

          {/* Platforms */}
          {content.metadata?.platforms && content.metadata.platforms.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {content.metadata.platforms.map((platform: string) => (
                  <span
                    key={platform}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content Preview */}
          <div className="prose prose-sm max-w-none">
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-700">
              {contentText || 'No content yet...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
