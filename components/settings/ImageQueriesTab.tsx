'use client'

import { useState, useEffect, useCallback } from 'react'

interface IndustryConfig {
  key: string
  primary: string[]
  secondary: string[]
  generic: string[]
  hasOverrides: { primary: boolean; secondary: boolean; generic: boolean }
}

interface PreviewImage {
  url: string
  photographer: string
}

type Tier = 'primary' | 'secondary' | 'generic'

export default function ImageQueriesTab() {
  const [industries, setIndustries] = useState<IndustryConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingTier, setEditingTier] = useState<{ tier: Tier; queries: string[] } | null>(null)
  const [newTag, setNewTag] = useState('')
  const [preview, setPreview] = useState<{ query: string; images: PreviewImage[]; totalHits: number; loading: boolean } | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchIndustries = useCallback(async () => {
    try {
      const res = await fetch('/api/image-queries')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setIndustries(data.industries)
      if (!selectedKey && data.industries.length > 0) {
        setSelectedKey(data.industries[0].key)
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load image queries' })
    } finally {
      setLoading(false)
    }
  }, [selectedKey])

  useEffect(() => { fetchIndustries() }, [fetchIndustries])

  const selected = industries.find(i => i.key === selectedKey) ?? null

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSaveTier = async (tier: Tier, queries: string[]) => {
    if (!selectedKey) return
    setSaving(true)
    try {
      const res = await fetch('/api/image-queries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry_key: selectedKey, tier, queries }),
      })
      if (!res.ok) throw new Error('Failed to save')
      showMsg('success', `Saved ${tier} queries for ${selectedKey}`)
      await fetchIndustries()
      setEditingTier(null)
    } catch {
      showMsg('error', 'Failed to save override')
    } finally {
      setSaving(false)
    }
  }

  const handleResetTier = async (tier: Tier) => {
    if (!selectedKey) return
    setSaving(true)
    try {
      const res = await fetch('/api/image-queries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry_key: selectedKey, tier }),
      })
      if (!res.ok) throw new Error('Failed to reset')
      showMsg('success', `Reset ${tier} queries to defaults`)
      await fetchIndustries()
      setEditingTier(null)
    } catch {
      showMsg('error', 'Failed to reset')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = async (query: string) => {
    setPreview({ query, images: [], totalHits: 0, loading: true })
    try {
      const res = await fetch(`/api/image-queries/preview?query=${encodeURIComponent(query)}&orientation=squarish`)
      if (!res.ok) throw new Error('Preview failed')
      const data = await res.json()
      setPreview({ query, images: data.images, totalHits: data.totalHits, loading: false })
    } catch {
      setPreview(prev => prev ? { ...prev, loading: false } : null)
    }
  }

  const filteredIndustries = industries.filter(i =>
    i.key.toLowerCase().includes(filter.toLowerCase())
  )

  const hitBadgeColor = (hits: number) => {
    if (hits >= 100) return 'bg-green-100 text-green-700'
    if (hits >= 10) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-4 min-h-[500px]">
        {/* Left panel: Industry list */}
        <div className="w-64 flex-shrink-0 border border-gray-200 rounded-xl bg-white overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Filter industries..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div className="overflow-y-auto max-h-[460px]">
            {filteredIndustries.map(ind => {
              const totalQueries = ind.primary.length + ind.secondary.length + ind.generic.length
              const hasAnyOverride = ind.hasOverrides.primary || ind.hasOverrides.secondary || ind.hasOverrides.generic
              return (
                <button
                  key={ind.key}
                  onClick={() => { setSelectedKey(ind.key); setEditingTier(null); setPreview(null) }}
                  className={`w-full text-left px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedKey === ind.key ? 'bg-teal-50 border-l-2 border-l-teal-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 capitalize">{ind.key}</span>
                    <span className="text-xs text-gray-400">{totalQueries}</span>
                  </div>
                  {hasAnyOverride && (
                    <span className="text-[10px] text-teal-600 font-medium">customized</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right panel: Tier editor + Preview */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">{selected.key}</h3>

              {(['primary', 'secondary', 'generic'] as Tier[]).map(tier => {
                const queries = selected[tier]
                const hasOverride = selected.hasOverrides[tier]
                const isEditing = editingTier?.tier === tier

                return (
                  <div key={tier} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-700 capitalize">{tier}</h4>
                        {hasOverride ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-medium">override</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">default</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {hasOverride && (
                          <button onClick={() => handleResetTier(tier)} disabled={saving} className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
                            Reset to default
                          </button>
                        )}
                        {!isEditing ? (
                          <button onClick={() => setEditingTier({ tier, queries: [...queries] })} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                            Edit
                          </button>
                        ) : (
                          <div className="flex gap-1">
                            <button onClick={() => handleSaveTier(tier, editingTier.queries)} disabled={saving} className="text-xs text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50">
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => setEditingTier(null)} className="text-xs text-gray-500 hover:text-gray-700">
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(isEditing ? editingTier.queries : queries).map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => !isEditing ? handlePreview(q) : undefined}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            preview?.query === q && !isEditing
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {q}
                          {isEditing && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingTier(prev => prev ? { ...prev, queries: prev.queries.filter((_, i) => i !== idx) } : null)
                              }}
                              className="ml-0.5 text-gray-400 hover:text-red-500 cursor-pointer"
                            >
                              &times;
                            </span>
                          )}
                        </button>
                      ))}
                      {isEditing && (
                        <form onSubmit={(e) => {
                          e.preventDefault()
                          if (newTag.trim()) {
                            setEditingTier(prev => prev ? { ...prev, queries: [...prev.queries, newTag.trim()] } : null)
                            setNewTag('')
                          }
                        }} className="inline-flex">
                          <input
                            type="text"
                            value={newTag}
                            onChange={e => setNewTag(e.target.value)}
                            placeholder="Add query..."
                            className="px-2 py-1 text-xs border border-dashed border-gray-300 rounded-full w-28 focus:ring-1 focus:ring-teal-500 outline-none"
                          />
                        </form>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Preview panel */}
              {preview && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Preview: &quot;{preview.query}&quot;
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${hitBadgeColor(preview.totalHits)}`}>
                      {preview.totalHits.toLocaleString()} results
                    </span>
                  </div>
                  {preview.loading ? (
                    <div className="flex gap-2">
                      {[1,2,3,4].map(i => <div key={i} className="w-20 h-20 bg-gray-200 rounded animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {preview.images.map((img, i) => (
                        <div key={i} className="relative group">
                          <img src={img.url} alt={img.photographer} className="w-20 h-20 object-cover rounded" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {img.photographer}
                          </div>
                        </div>
                      ))}
                      {preview.images.length === 0 && (
                        <p className="text-xs text-gray-400">No results found</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select an industry to edit its search queries
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
