'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface LibraryImage {
  id: string
  public_url: string
  filename: string
  tags: string[]
  file_size: number
  mime_type: string
  created_at: string
  business_id: string | null
}

interface Business {
  id: string
  name: string
  logo_url: string | null
  brand_primary_color?: string | null
}

const SUGGESTED_TAGS = ['product', 'team', 'storefront', 'event', 'food', 'service', 'seasonal', 'logo', 'banner']

export default function ImageLibraryPage() {
  const [images, setImages] = useState<LibraryImage[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [editingTags, setEditingTags] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const [dragOver, setDragOver] = useState(false)

  // Business selector
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)
  const [businessesLoading, setBusinessesLoading] = useState(true)

  // Fetch businesses on mount
  useEffect(() => {
    async function loadBusinesses() {
      try {
        const res = await fetch('/api/business')
        if (res.ok) {
          const data = await res.json()
          const list: Business[] = data.businesses || []
          setBusinesses(list)
          if (list.length > 0) {
            setSelectedBusinessId(list[0].id)
          }
        }
      } catch { /* ignore */ }
      finally { setBusinessesLoading(false) }
    }
    loadBusinesses()
  }, [])

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId)
  const primaryColor = selectedBusiness?.brand_primary_color || '#0d9488'

  const fetchImages = useCallback(async () => {
    if (businessesLoading) return // wait until businesses are loaded
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (selectedBusinessId) params.set('business_id', selectedBusinessId)
      if (filterTag) params.set('tag', filterTag)
      const res = await fetch(`/api/image-library?${params}`)
      const data = await res.json()
      if (res.ok) {
        setImages(data.images || [])
        setTotal(data.total || 0)
      } else {
        setError(data.error || 'Failed to load images')
      }
    } catch {
      setError('Failed to load images')
    } finally {
      setLoading(false)
    }
  }, [filterTag, selectedBusinessId, businessesLoading])

  useEffect(() => { fetchImages() }, [fetchImages])

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true)
    setError('')
    setSuccess('')
    let uploaded = 0
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const form = new FormData()
      form.append('file', file)
      if (selectedBusinessId) form.append('business_id', selectedBusinessId)
      try {
        const res = await fetch('/api/image-library', { method: 'POST', body: form })
        if (res.ok) {
          uploaded++
        } else {
          const data = await res.json()
          setError(data.error || 'Upload failed')
        }
      } catch {
        setError('Upload failed')
      }
    }
    if (uploaded > 0) {
      setSuccess(`${uploaded} image${uploaded > 1 ? 's' : ''} uploaded`)
      setTimeout(() => setSuccess(''), 3000)
      fetchImages()
    }
    setUploading(false)
  }

  const handleDelete = async () => {
    if (selectedIds.size === 0) return
    setDeleting(true)
    try {
      const res = await fetch('/api/image-library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setSuccess(`${selectedIds.size} image${selectedIds.size > 1 ? 's' : ''} deleted`)
        setTimeout(() => setSuccess(''), 3000)
        fetchImages()
      }
    } catch {
      setError('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const handleTagUpdate = async (imageId: string, tags: string[]) => {
    try {
      await fetch('/api/image-library', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: imageId, tags }),
      })
      setImages(prev => prev.map(img => img.id === imageId ? { ...img, tags } : img))
    } catch { /* ignore */ }
    setEditingTags(null)
    setTagInput('')
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const allTags = Array.from(new Set(images.flatMap(img => img.tags)))

  const handleBusinessChange = (id: string) => {
    setSelectedBusinessId(id)
    setSelectedIds(new Set())
    setFilterTag(null)
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Image Library</h1>
          <p className="text-gray-500 text-sm mt-1">{total} image{total !== 1 ? 's' : ''} · Upload photos of your business to reuse across posts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Take Photo
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            {uploading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            )}
            Upload Images
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) uploadFiles(e.target.files); e.target.value = '' }} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { if (e.target.files?.length) uploadFiles(e.target.files); e.target.value = '' }} />
      </div>

      {/* Business Selector */}
      {businesses.length > 0 && (
        <div className="mb-5 flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Business:
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {businesses.map(b => (
              <button
                key={b.id}
                onClick={() => handleBusinessChange(b.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
                  selectedBusinessId === b.id
                    ? 'text-white border-transparent shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                style={selectedBusinessId === b.id ? { backgroundColor: b.brand_primary_color || '#0d9488' } : undefined}
              >
                {b.logo_url ? (
                  <img src={b.logo_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-[8px] text-white font-bold">{b.name.charAt(0).toUpperCase()}</span>
                )}
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error} <button onClick={() => setError('')} className="ml-2 underline">dismiss</button></div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

      {/* Filter tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setFilterTag(null)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${!filterTag ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`} style={!filterTag ? { backgroundColor: primaryColor } : undefined}>All</button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setFilterTag(filterTag === tag ? null : tag)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterTag === tag ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`} style={filterTag === tag ? { backgroundColor: primaryColor } : undefined}>{tag}</button>
          ))}
        </div>
      )}

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-700">{selectedIds.size} selected</span>
          <button onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50">
            {deleting ? 'Deleting...' : 'Delete selected'}
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-500 hover:underline">Clear</button>
        </div>
      )}

      {/* Drag-and-drop zone + grid */}
      <div
        ref={dragRef}
        className={`relative rounded-xl border-2 border-dashed transition-colors p-1 ${dragOver ? 'border-teal-400 bg-teal-50/50' : 'border-transparent'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files) }}
      >
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(8)].map((_, i) => <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />)}
          </div>
        ) : images.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-gray-500 mb-2">No images yet</p>
            <p className="text-gray-400 text-sm mb-4">Upload photos of your shop, team, products, or events</p>
            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: primaryColor }}>Upload your first image</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map(img => (
              <div key={img.id} className="group relative">
                <button
                  type="button"
                  onClick={() => toggleSelect(img.id)}
                  className={`relative aspect-square w-full rounded-lg overflow-hidden border-2 transition-all ${
                    selectedIds.has(img.id) ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img.public_url} alt={img.filename} className="w-full h-full object-cover" />
                  {selectedIds.has(img.id) && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </span>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
                {/* Info bar */}
                <div className="mt-1 px-1">
                  <p className="text-[11px] text-gray-600 truncate">{img.filename}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-gray-400">{formatSize(img.file_size)}</span>
                    {img.tags.length > 0 && (
                      <>
                        <span className="text-gray-300">·</span>
                        {img.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{t}</span>
                        ))}
                        {img.tags.length > 2 && <span className="text-[10px] text-gray-400">+{img.tags.length - 2}</span>}
                      </>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditingTags(editingTags === img.id ? null : img.id); setTagInput(img.tags.join(', ')) }}
                      className="ml-auto text-[10px] text-gray-400 hover:text-teal-600"
                    >
                      {img.tags.length > 0 ? 'edit' : '+ tag'}
                    </button>
                  </div>
                  {/* Tag editor */}
                  {editingTags === img.id && (
                    <div className="mt-1.5 flex gap-1">
                      <input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        placeholder="product, team..."
                        className="flex-1 min-w-0 text-[11px] px-2 py-1 border border-gray-300 rounded"
                        onKeyDown={e => { if (e.key === 'Enter') handleTagUpdate(img.id, tagInput.split(',').map(t => t.trim()).filter(Boolean)) }}
                      />
                      <button onClick={() => handleTagUpdate(img.id, tagInput.split(',').map(t => t.trim()).filter(Boolean))} className="text-[10px] px-2 py-1 bg-teal-600 text-white rounded">Save</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Upload more tile */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50/30 transition-colors flex flex-col items-center justify-center gap-1"
            >
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span className="text-xs text-gray-500">Add more</span>
            </button>
          </div>
        )}

        {/* Drag overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-teal-50/80 rounded-xl flex items-center justify-center z-10">
            <div className="text-center">
              <svg className="w-12 h-12 text-teal-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <p className="text-teal-700 font-medium">Drop images here</p>
            </div>
          </div>
        )}
      </div>

      {/* Suggested tags hint */}
      {images.length > 0 && images.some(img => img.tags.length === 0) && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Tip: Tag your images (e.g. {SUGGESTED_TAGS.slice(0, 5).join(', ')}) so you can find them quickly when creating posts.
        </div>
      )}
    </div>
  )
}
