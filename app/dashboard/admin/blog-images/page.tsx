'use client'

import { useState, useEffect } from 'react'

interface BlogPost {
  slug: string
  title: string
  category: string
  hasImage: boolean
  imagePath: string | null
}

interface Stats {
  total: number
  withImages: number
  withoutImages: number
}

interface Preview {
  style: string
  url: string
  error?: string
}

const STYLES = [
  { id: 'promotional', name: 'Promotional', description: 'Clean marketing images', color: 'bg-orange-100 text-orange-700' },
  { id: 'professional', name: 'Professional', description: 'Authentic business photos', color: 'bg-blue-100 text-blue-700' },
  { id: 'friendly', name: 'Friendly', description: 'Warm, approachable', color: 'bg-green-100 text-green-700' },
  { id: 'seasonal', name: 'Seasonal', description: 'Holiday themed', color: 'bg-purple-100 text-purple-700' },
]

export default function BlogImagesAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [previews, setPreviews] = useState<Preview[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'missing' | 'has'>('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const res = await fetch('/api/admin/blog-images')
      const data = await res.json()
      setPosts(data.posts || [])
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function generateImage(post: BlogPost, style: string) {
    setGenerating(post.slug)
    setMessage(null)
    
    try {
      const res = await fetch('/api/admin/blog-images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: post.slug,
          title: post.title,
          style,
          category: post.category
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: `Generated ${data.styleName} image for "${post.title}"` })
        // Update the post in the list
        setPosts(prev => prev.map(p => 
          p.slug === post.slug 
            ? { ...p, hasImage: true, imagePath: data.imagePath + '?t=' + Date.now() }
            : p
        ))
        if (stats) {
          setStats({
            ...stats,
            withImages: stats.withImages + (post.hasImage ? 0 : 1),
            withoutImages: stats.withoutImages - (post.hasImage ? 0 : 1)
          })
        }
        setSelectedPost(null)
        setPreviews([])
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to generate image' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate image' })
    } finally {
      setGenerating(null)
    }
  }

  async function generateAllPreviews(post: BlogPost) {
    setSelectedPost(post)
    setPreviews([])
    setPreviewLoading(true)
    
    try {
      const res = await fetch('/api/admin/blog-images/generate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: post.slug,
          title: post.title
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setPreviews(data.previews)
      }
    } catch (error) {
      console.error('Failed to generate previews:', error)
    } finally {
      setPreviewLoading(false)
    }
  }

  async function savePreview(style: string, url: string) {
    if (!selectedPost) return
    
    setGenerating(selectedPost.slug)
    
    try {
      // Download and save the preview
      const res = await fetch('/api/admin/blog-images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedPost.slug,
          title: selectedPost.title,
          style,
          category: selectedPost.category
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: `Saved ${style} image for "${selectedPost.title}"` })
        setPosts(prev => prev.map(p => 
          p.slug === selectedPost.slug 
            ? { ...p, hasImage: true, imagePath: data.imagePath + '?t=' + Date.now() }
            : p
        ))
        if (stats && !selectedPost.hasImage) {
          setStats({
            ...stats,
            withImages: stats.withImages + 1,
            withoutImages: stats.withoutImages - 1
          })
        }
        setSelectedPost(null)
        setPreviews([])
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save image' })
    } finally {
      setGenerating(null)
    }
  }

  async function deleteImage(post: BlogPost) {
    if (!confirm(`Delete image for "${post.title}"?`)) return
    
    try {
      const res = await fetch('/api/admin/blog-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: post.slug })
      })
      
      if (res.ok) {
        setPosts(prev => prev.map(p => 
          p.slug === post.slug 
            ? { ...p, hasImage: false, imagePath: null }
            : p
        ))
        if (stats) {
          setStats({
            ...stats,
            withImages: stats.withImages - 1,
            withoutImages: stats.withoutImages + 1
          })
        }
        setMessage({ type: 'success', text: `Deleted image for "${post.title}"` })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete image' })
    }
  }

  const filteredPosts = posts.filter(p => {
    if (filter === 'missing') return !p.hasImage
    if (filter === 'has') return p.hasImage
    return true
  })

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog Image Manager</h1>
        <p className="text-gray-600 mt-2">Generate and manage images for blog posts using GeoSpark AI</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Posts</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-3xl font-bold text-green-600">{stats.withImages}</div>
            <div className="text-sm text-gray-500">With Images</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-3xl font-bold text-orange-600">{stats.withoutImages}</div>
            <div className="text-sm text-gray-500">Need Images</div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Style Legend */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Available Styles</h3>
        <div className="flex flex-wrap gap-3">
          {STYLES.map(style => (
            <span key={style.id} className={`px-3 py-1 rounded-full text-sm ${style.color}`}>
              {style.name} - {style.description}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All ({posts.length})
        </button>
        <button
          onClick={() => setFilter('missing')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'missing' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Need Images ({stats?.withoutImages || 0})
        </button>
        <button
          onClick={() => setFilter('has')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'has' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Has Images ({stats?.withImages || 0})
        </button>
      </div>

      {/* Preview Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedPost.title}</h2>
                  <span className="text-sm text-gray-500">{selectedPost.category}</span>
                </div>
                <button
                  onClick={() => { setSelectedPost(null); setPreviews([]) }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-600">Generating all 4 styles...</p>
                  <p className="text-sm text-gray-400">This takes about 30 seconds</p>
                </div>
              ) : previews.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {previews.map((preview, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="aspect-video bg-gray-100">
                        {preview.url ? (
                          <img src={preview.url} alt={preview.style} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-red-500">
                            {preview.error || 'Failed'}
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex items-center justify-between bg-gray-50">
                        <span className={`px-2 py-1 rounded text-sm ${STYLES.find(s => s.id === preview.style)?.color || 'bg-gray-100'}`}>
                          {STYLES.find(s => s.id === preview.style)?.name || preview.style}
                        </span>
                        {preview.url && (
                          <button
                            onClick={() => savePreview(preview.style, preview.url)}
                            disabled={generating === selectedPost.slug}
                            className="px-3 py-1 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50"
                          >
                            {generating === selectedPost.slug ? 'Saving...' : 'Use This'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Generate previews in all 4 styles to compare</p>
                  <button
                    onClick={() => generateAllPreviews(selectedPost)}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700"
                  >
                    Generate All 4 Styles
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Image</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Title</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Category</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-right p-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPosts.map(post => (
              <tr key={post.slug} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {post.imagePath ? (
                      <img 
                        src={post.imagePath} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900 line-clamp-2">{post.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{post.slug}</div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-600">{post.category}</span>
                </td>
                <td className="p-4">
                  {post.hasImage ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Has Image
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Needs Image
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedPost(post)}
                      disabled={generating === post.slug}
                      className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50"
                    >
                      {generating === post.slug ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </span>
                      ) : (
                        post.hasImage ? 'Regenerate' : 'Generate'
                      )}
                    </button>
                    {post.hasImage && (
                      <button
                        onClick={() => deleteImage(post)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
