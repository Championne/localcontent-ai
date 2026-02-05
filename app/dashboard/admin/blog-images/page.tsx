'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface BlogPost {
  slug: string
  title: string
  category: string
  hasImage: boolean
  imagePath: string | null
  imageStyle?: string
}

interface BlogPostFull {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  publishedAt: string
  readingTime: number
  keywords: string[]
  image: string | null
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
  const [fullPost, setFullPost] = useState<BlogPostFull | null>(null)
  const [previews, setPreviews] = useState<Preview[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'missing' | 'has'>('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  // Fetch full post content when selected
  useEffect(() => {
    if (selectedPost && viewMode === 'detail') {
      fetchFullPost(selectedPost.slug)
      // Set initial preview image
      setPreviewImage(selectedPost.imagePath)
    }
  }, [selectedPost, viewMode])

  async function fetchFullPost(slug: string) {
    try {
      const res = await fetch(`/api/admin/blog-images/${slug}`)
      const data = await res.json()
      if (data.success) {
        setFullPost(data.post)
      }
    } catch (error) {
      console.error('Failed to fetch full post:', error)
    }
  }

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

  async function selectAndSaveImage(style: string, previewUrl?: string) {
    if (!selectedPost) return
    
    // Find the preview URL if not provided
    const url = previewUrl || previews.find(p => p.style === style)?.url
    
    if (!url) {
      setMessage({ type: 'error', text: 'No preview image found. Please generate previews first.' })
      return
    }
    
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
          category: selectedPost.category,
          previewUrl: url  // Pass the already-generated preview URL
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        // Store the style
        setStoredStyle(selectedPost.slug, style)
        
        const newImagePath = data.imagePath + '?t=' + Date.now()
        
        setMessage({ type: 'success', text: `Saved ${STYLES.find(s => s.id === style)?.name} image for "${selectedPost.title}"` })
        
        // Update the post in the list
        setPosts(prev => prev.map(p => 
          p.slug === selectedPost.slug 
            ? { ...p, hasImage: true, imagePath: newImagePath, imageStyle: style }
            : p
        ))
        
        // Update preview image in article preview
        setPreviewImage(newImagePath)
        
        if (stats && !selectedPost.hasImage) {
          setStats({
            ...stats,
            withImages: stats.withImages + 1,
            withoutImages: stats.withoutImages - 1
          })
        }
        
        // Update selectedPost with new image info (don't go back to list)
        setSelectedPost(prev => prev ? { ...prev, hasImage: true, imagePath: newImagePath, imageStyle: style } : null)
        
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

  // Detail View - Generate & Select from 4 styles + Article Preview
  if (viewMode === 'detail' && selectedPost) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => { setViewMode('list'); setSelectedPost(null); setPreviews([]); setFullPost(null); setPreviewImage(null) }}
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

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Current Image & Controls */}
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Current Image</h3>
            {selectedPost.hasImage && (
              <button
                onClick={() => deleteImage(selectedPost)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Delete Image
              </button>
            )}
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-80 h-48 bg-gray-100 rounded-lg overflow-hidden">
              {selectedPost.imagePath ? (
                <img 
                  src={selectedPost.imagePath} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              {selectedPost.imageStyle && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStyleInfo(selectedPost.imageStyle)?.color}`}>
                  {getStyleInfo(selectedPost.imageStyle)?.name} Style
                </span>
              )}
              {!selectedPost.hasImage && (
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  No Image Yet
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Generate All 4 Styles */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">Generate New Images</h3>
          <p className="text-gray-500 text-sm mb-6">Generate all 4 styles at once, then pick the one you like best. Click &quot;Preview&quot; to see how it looks in the article.</p>

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
                const isSelectedForPreview = previewImage === preview.url
                return (
                  <div 
                    key={idx} 
                    className={`border-2 rounded-xl overflow-hidden transition-all hover:shadow-lg ${isSelectedForPreview ? 'ring-4 ring-teal-400' : ''} ${styleInfo?.borderColor || 'border-gray-200'}`}
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
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPreviewImage(preview.url)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isSelectedForPreview ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              {isSelectedForPreview ? 'Previewing' : 'Preview'}
                            </button>
                            <button
                              onClick={() => selectAndSaveImage(preview.style, preview.url)}
                              disabled={generating === selectedPost.slug}
                              className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                            >
                              {generating === selectedPost.slug ? 'Saving...' : 'Use This'}
                            </button>
                          </div>
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

        {/* Article Preview */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Article Preview</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Preview image:</span>
              <select
                value={previewImage || ''}
                onChange={(e) => setPreviewImage(e.target.value || null)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">No image</option>
                {selectedPost.imagePath && (
                  <option value={selectedPost.imagePath}>Current saved image</option>
                )}
                {previews.filter(p => p.url).map(preview => (
                  <option key={preview.style} value={preview.url}>
                    {getStyleInfo(preview.style)?.name} preview
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Simulated Blog Article */}
          <article className="bg-white">
            {/* Hero Image */}
            {previewImage && (
              <div className="w-full h-64 md:h-80 overflow-hidden">
                <img 
                  src={previewImage} 
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Article Header */}
            <header className="py-10 px-6 border-b border-gray-100">
              <div className="max-w-3xl mx-auto">
                <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full mb-4">
                  {selectedPost.category}
                </span>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {selectedPost.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mt-6 text-gray-500 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      GS
                    </div>
                    <span>GeoSpark Team</span>
                  </div>
                  <span>•</span>
                  <span>{fullPost ? new Date(fullPost.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Loading...'}</span>
                  <span>•</span>
                  <span>{fullPost?.readingTime || '...'} min read</span>
                </div>
              </div>
            </header>

            {/* Content Preview */}
            <div className="max-w-3xl mx-auto px-6 py-12">
              {fullPost ? (
                <div className="prose prose-lg prose-gray max-w-none 
                  prose-headings:font-bold prose-headings:text-gray-900 
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-2
                  prose-h3:text-xl prose-h3:mt-8
                  prose-p:text-gray-600 prose-p:leading-relaxed
                  prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900
                  prose-ul:my-4 prose-li:text-gray-600
                  prose-blockquote:border-l-teal-500 prose-blockquote:bg-teal-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                ">
                  <ReactMarkdown>{fullPost.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    )
  }

  // List View
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog Image Manager</h1>
        <p className="text-gray-600 mt-2">Preview how blog posts look on the website. Click any card to generate images and see the full article preview.</p>
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

      {/* Posts Grid - Matches Real Blog Layout */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map(post => {
          const styleInfo = getStyleInfo(post.imageStyle)
          return (
            <div 
              key={post.slug} 
              className="group cursor-pointer"
              onClick={() => { setSelectedPost(post); setViewMode('detail'); setPreviews([]) }}
            >
              <article className={`bg-white rounded-xl border-2 overflow-hidden hover:shadow-lg transition-all h-full flex flex-col ${styleInfo?.borderColor || 'border-gray-200'} ${!post.hasImage ? 'border-dashed border-orange-300' : ''}`}>
                {/* Image - Same height as real blog */}
                <div className="h-40 overflow-hidden relative">
                  {post.imagePath ? (
                    <img 
                      src={post.imagePath} 
                      alt={post.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-400 mt-1 block">No image</span>
                      </div>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {post.hasImage ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full shadow">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Needs Image
                      </span>
                    )}
                  </div>
                  {/* Style Badge */}
                  {styleInfo && (
                    <div className="absolute top-2 left-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium shadow ${styleInfo.color}`}>
                        {styleInfo.name}
                      </span>
                    </div>
                  )}
                </div>
                {/* Content - Same structure as real blog */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">{post.category}</span>
                  <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="flex-1"></div>
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedPost(post); setViewMode('detail'); setPreviews([]) }}
                      className="flex-1 px-3 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      {post.hasImage ? 'Change Image' : 'Generate Image'}
                    </button>
                    {post.hasImage && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteImage(post) }}
                        className="px-3 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            </div>
          )
        })}
      </div>
    </div>
  )
}
