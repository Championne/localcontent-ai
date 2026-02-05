'use client'

import { useState, useEffect } from 'react'

interface BlogPost {
  slug: string
  title: string
  category: string
  hasImage: boolean
  imagePath: string | null
  imageStyle?: string
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
  { id: 'promotional', name: 'Promotional', description: 'Clean marketing images', color: 'bg-orange-100 text-orange-700', borderColor: 'border-orange-400', bgLight: 'bg-orange-50' },
  { id: 'professional', name: 'Professional', description: 'Authentic business photos', color: 'bg-blue-100 text-blue-700', borderColor: 'border-blue-400', bgLight: 'bg-blue-50' },
  { id: 'friendly', name: 'Friendly', description: 'Warm, approachable', color: 'bg-green-100 text-green-700', borderColor: 'border-green-400', bgLight: 'bg-green-50' },
  { id: 'seasonal', name: 'Seasonal', description: 'Holiday themed', color: 'bg-purple-100 text-purple-700', borderColor: 'border-purple-400', bgLight: 'bg-purple-50' },
]

// Simple metadata storage for image styles (stored in localStorage)
function getStoredStyle(slug: string): string | null {
  if (typeof window === 'undefined') return null
  const styles = JSON.parse(localStorage.getItem('blogImageStyles') || '{}')
  return styles[slug] || null
}

function setStoredStyle(slug: string, style: string) {
  if (typeof window === 'undefined') return
  const styles = JSON.parse(localStorage.getItem('blogImageStyles') || '{}')
  styles[slug] = style
  localStorage.setItem('blogImageStyles', JSON.stringify(styles))
}

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
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const res = await fetch('/api/admin/blog-images')
      const data = await res.json()
      // Add stored styles to posts
      const postsWithStyles = (data.posts || []).map((p: BlogPost) => ({
        ...p,
        imageStyle: getStoredStyle(p.slug)
      }))
      setPosts(postsWithStyles)
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function generateAllPreviews(post: BlogPost) {
    setSelectedPost(post)
    setViewMode('detail')
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

  async function selectAndSaveImage(style: string) {
    if (!selectedPost) return
    
    setGenerating(selectedPost.slug)
    setMessage(null)
    
    try {
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
        // Store the style
        setStoredStyle(selectedPost.slug, style)
        
        setMessage({ type: 'success', text: `Saved ${STYLES.find(s => s.id === style)?.name} image for "${selectedPost.title}"` })
        
        // Update the post in the list
        setPosts(prev => prev.map(p => 
          p.slug === selectedPost.slug 
            ? { ...p, hasImage: true, imagePath: data.imagePath + '?t=' + Date.now(), imageStyle: style }
            : p
        ))
        
        if (stats && !selectedPost.hasImage) {
          setStats({
            ...stats,
            withImages: stats.withImages + 1,
            withoutImages: stats.withoutImages - 1
          })
        }
        
        // Go back to list
        setViewMode('list')
        setSelectedPost(null)
        setPreviews([])
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save image' })
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
            ? { ...p, hasImage: false, imagePath: null, imageStyle: undefined }
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

  const getStyleInfo = (styleId: string | undefined) => {
    return STYLES.find(s => s.id === styleId) || null
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Detail View - Generate & Select from 4 styles
  if (viewMode === 'detail' && selectedPost) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => { setViewMode('list'); setSelectedPost(null); setPreviews([]) }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to List
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h1>
          <p className="text-gray-500 mt-1">{selectedPost.category} • {selectedPost.slug}</p>
        </div>

        {/* Current Image */}
        {selectedPost.hasImage && (
          <div className="mb-8 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Current Image</h3>
            <div className="flex gap-4 items-start">
              <img 
                src={selectedPost.imagePath || ''} 
                alt="" 
                className="w-64 h-40 object-cover rounded-lg"
              />
              <div>
                {selectedPost.imageStyle && (
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStyleInfo(selectedPost.imageStyle)?.color}`}>
                    {getStyleInfo(selectedPost.imageStyle)?.name} Style
                  </span>
                )}
                <button
                  onClick={() => deleteImage(selectedPost)}
                  className="block mt-3 text-red-600 hover:text-red-700 text-sm"
                >
                  Delete Current Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generate All 4 Styles */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Generate New Images</h3>
          <p className="text-gray-500 text-sm mb-6">Generate all 4 styles at once, then pick the one you like best.</p>

          {previewLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600 font-medium">Generating all 4 styles...</p>
              <p className="text-sm text-gray-400 mt-1">This takes about 30-60 seconds</p>
            </div>
          ) : previews.length > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              {previews.map((preview, idx) => {
                const styleInfo = getStyleInfo(preview.style)
                return (
                  <div 
                    key={idx} 
                    className={`border-2 rounded-xl overflow-hidden transition-all hover:shadow-lg ${styleInfo?.borderColor || 'border-gray-200'}`}
                  >
                    <div className="aspect-video bg-gray-100">
                      {preview.url ? (
                        <img src={preview.url} alt={preview.style} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-red-500">
                          {preview.error || 'Failed to generate'}
                        </div>
                      )}
                    </div>
                    <div className={`p-4 ${styleInfo?.bgLight || 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${styleInfo?.color}`}>
                            {styleInfo?.name}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{styleInfo?.description}</p>
                        </div>
                        {preview.url && (
                          <button
                            onClick={() => selectAndSaveImage(preview.style)}
                            disabled={generating === selectedPost.slug}
                            className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                          >
                            {generating === selectedPost.slug ? 'Saving...' : 'Use This Image'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="grid grid-cols-4 gap-4 mb-8">
                {STYLES.map(style => (
                  <div key={style.id} className={`p-4 rounded-xl ${style.bgLight} border-2 ${style.borderColor}`}>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${style.color}`}>
                      {style.name}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">{style.description}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => generateAllPreviews(selectedPost)}
                className="px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors text-lg"
              >
                Generate All 4 Styles
              </button>
              <p className="text-sm text-gray-400 mt-3">~$0.32 for 4 landscape images</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // List View
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog Image Manager</h1>
        <p className="text-gray-600 mt-2">Click on any post to generate images in all 4 styles and choose your favorite</p>
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
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Style Legend */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Image Styles</h3>
        <div className="flex flex-wrap gap-3">
          {STYLES.map(style => (
            <div key={style.id} className={`px-4 py-2 rounded-lg border-2 ${style.borderColor} ${style.bgLight}`}>
              <span className={`font-medium ${style.color.replace('bg-', 'text-').replace('-100', '-700')}`}>{style.name}</span>
              <span className="text-gray-500 text-sm ml-2">- {style.description}</span>
            </div>
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

      {/* Posts List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Image</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Title</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Category</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Style</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-right p-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPosts.map(post => {
              const styleInfo = getStyleInfo(post.imageStyle)
              return (
                <tr 
                  key={post.slug} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => { setSelectedPost(post); setViewMode('detail'); setPreviews([]) }}
                >
                  <td className="p-4">
                    <div className={`w-28 h-18 bg-gray-100 rounded-lg overflow-hidden border-2 ${styleInfo?.borderColor || 'border-transparent'}`}>
                      {post.imagePath ? (
                        <img 
                          src={post.imagePath} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-16 flex items-center justify-center text-gray-400">
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
                    {styleInfo ? (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${styleInfo.color}`}>
                        {styleInfo.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    {post.hasImage ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Ready
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
                  <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedPost(post); setViewMode('detail'); setPreviews([]) }}
                        className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700"
                      >
                        {post.hasImage ? 'Change' : 'Generate'}
                      </button>
                      {post.hasImage && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteImage(post) }}
                          className="px-3 py-1.5 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
