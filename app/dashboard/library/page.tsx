'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const UNSPLASH_UTM = 'https://unsplash.com?utm_source=geospark&utm_medium=referral'

interface ContentItem {
  id: string
  title: string
  template: string
  content: string
  metadata?: {
    image_url?: string
    image_source?: string
    photographer_name?: string
    photographer_url?: string
    platforms?: string[]
    [key: string]: unknown
  }
  image_url?: string | null
  status: 'draft' | 'published' | 'scheduled'
  created_at: string
  updated_at: string
}

export default function ContentLibraryPage() {
  const router = useRouter()
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ type: '', status: '', search: '' })
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({})
  const [retryCount, setRetryCount] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.type) params.set('template', filter.type)
      if (filter.status) params.set('status', filter.status)
      
      const response = await fetch(`/api/content?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch content')
      }

      setContent(data.content || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete content')
      }

      setContent(content.filter(item => item.id !== id))
    } catch (err) {
      alert('Failed to delete content')
    }
  }

  const filteredContent = content.filter(item => {
    if (filter.search && !item.title.toLowerCase().includes(filter.search.toLowerCase())) {
      return false
    }
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTemplateLabel = (template: string) => {
    const labels: Record<string, string> = {
      'blog-post': 'Blog Post',
      'social-pack': 'Social Media Pack',
      'social-post': 'Social Media',
      'gmb-post': 'Google Business',
      'email': 'Email',
    }
    return labels[template] || template
  }

  const getThumbnailUrl = (item: ContentItem): string | null => {
    const url = item.metadata?.image_url ?? item.image_url ?? null
    if (!url) return null
    // Add cache-bust for Supabase storage URLs to avoid stale CDN responses
    if (url.includes('supabase') && !url.includes('_t=')) {
      return `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`
    }
    return url
  }

  if (loading) {
    return (
      <div className='animate-pulse'>
        <div className='h-8 w-48 bg-muted rounded mb-6'></div>
        <div className='space-y-4'>
          {[1, 2, 3].map(i => (
            <div key={i} className='h-20 bg-muted rounded'></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4 sm:pt-6">
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Spark Library</h1>
        <Link
          href='/dashboard/content'
          className='px-5 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-sm flex items-center gap-2'
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New
        </Link>
      </div>

      {error && (
        <div className='bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4'>
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className='flex gap-3 mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100 shadow-sm'>
        <select 
          className='px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm'
          value={filter.type}
          onChange={(e) => {
            setFilter({ ...filter, type: e.target.value })
            fetchContent()
          }}
        >
          <option value=''>All Types</option>
          <option value='social-pack'>Social Media Pack</option>
          <option value='blog-post'>Blog Posts</option>
          <option value='social-post'>Social Media</option>
          <option value='gmb-post'>Google Business</option>
          <option value='email'>Email</option>
        </select>
        <select 
          className='px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm'
          value={filter.status}
          onChange={(e) => {
            setFilter({ ...filter, status: e.target.value })
            fetchContent()
          }}
        >
          <option value=''>All Status</option>
          <option value='draft'>Draft</option>
          <option value='published'>Published</option>
          <option value='scheduled'>Scheduled</option>
        </select>
        <input
          type='text'
          placeholder='Search content...'
          className='flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm'
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
      </div>

      {/* Content List */}
      {filteredContent.length > 0 ? (
        <div className='bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100'>
          {filteredContent.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/dashboard/content?edit=${item.id}`)}
              className='p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors'
            >
              {/* Thumbnail: show image if we have a URL and it hasn't failed to load */}
              {getThumbnailUrl(item) && !failedThumbnails[item.id] ? (
                <div className='w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0'>
                  <img
                    src={getThumbnailUrl(item)!}
                    alt={item.title || 'Content'}
                    className='w-full h-full object-cover'
                    referrerPolicy='no-referrer'
                    onError={(e) => {
                      const attempts = retryCount[item.id] || 0
                      if (attempts < 1) {
                        // Retry once with a cache-busted URL
                        setRetryCount((prev) => ({ ...prev, [item.id]: attempts + 1 }))
                        const img = e.currentTarget
                        const baseUrl = item.metadata?.image_url ?? item.image_url ?? ''
                        if (baseUrl) {
                          setTimeout(() => {
                            img.src = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}_retry=${Date.now()}`
                          }, 500)
                        }
                      } else {
                        setFailedThumbnails((prev) => ({ ...prev, [item.id]: true }))
                      }
                    }}
                  />
                </div>
              ) : (
                <div className='w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0' style={{ background: 'linear-gradient(135deg, var(--brand-primary-10), var(--brand-primary-20))' }}>
                  <svg className='w-6 h-6' style={{ color: 'var(--brand-primary)' }} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <h3 className='font-medium text-gray-900 truncate text-sm'>{item.title}</h3>
                <p className='text-xs text-gray-500 mt-0.5'>
                  {getTemplateLabel(item.template)} • {formatDate(item.created_at)}
                </p>
                {getThumbnailUrl(item) && (item.metadata?.image_source === 'stock' || item.metadata?.photographer_url) && (
                  <p className='text-xs text-muted-foreground mt-1'>
                    Photo by{' '}
                    {item.metadata.photographer_url ? (
                      <a href={item.metadata.photographer_url} target='_blank' rel='noopener noreferrer' className='hover:underline' style={{ color: 'var(--brand-primary)' }} onClick={(e) => e.stopPropagation()}>
                        {item.metadata.photographer_name || 'Photographer'}
                      </a>
                    ) : (
                      <span>{item.metadata.photographer_name || 'Photographer'}</span>
                    )}{' '}
                    on <a href={UNSPLASH_UTM} target='_blank' rel='noopener noreferrer' className='hover:underline' style={{ color: 'var(--brand-primary)' }} onClick={(e) => e.stopPropagation()}>Unsplash</a>
                  </p>
                )}
              </div>
              <div className='flex items-center gap-4 ml-4'>
                <span
                  className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    item.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : item.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.status}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id)
                  }}
                  className='text-sm text-destructive hover:underline'
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>No content yet</h3>
          <p className='text-gray-500 mb-4'>
            Start creating content to build your library
          </p>
          <Link
            href='/dashboard/content'
            className='inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-sm'
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Content
          </Link>
        </div>
      )}
    </div>
  )
}
