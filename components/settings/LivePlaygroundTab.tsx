'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface TierResult {
  tier: string
  query: string
  images: Array<{ url: string; photographer: string }>
  totalHits: number
}

interface AIResult {
  url: string
  style: string
  size: string
  revisedPrompt?: string
  fullPrompt?: string
}

interface PromptPreview {
  sceneHint: string
  stylePrefix: string
  topic: string
  industry: string
  style: string
}

interface StyleOption {
  key: string
  name: string
  description: string
}

interface HistoryEntry {
  id: string
  timestamp: Date
  industry: string
  topic: string
  style: string
  stockResults: TierResult[]
  aiResult: AIResult | null
  promptPreview: PromptPreview
}

export default function LivePlaygroundTab() {
  // Form state
  const [industries, setIndustries] = useState<string[]>([])
  const [styles, setStyles] = useState<StyleOption[]>([])
  const [industry, setIndustry] = useState('')
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('professional')
  const [includeAI, setIncludeAI] = useState(false)
  const [brandColor, setBrandColor] = useState('')

  // Override editing
  const [sceneHintOverride, setSceneHintOverride] = useState('')
  const [stylePrefixOverride, setStylePrefixOverride] = useState('')
  const [editingSceneHint, setEditingSceneHint] = useState(false)
  const [editingStylePrefix, setEditingStylePrefix] = useState(false)

  // Results state
  const [loading, setLoading] = useState(false)
  const [stockResults, setStockResults] = useState<TierResult[]>([])
  const [aiResult, setAiResult] = useState<AIResult | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [promptPreview, setPromptPreview] = useState<PromptPreview | null>(null)
  const [tierTerms, setTierTerms] = useState<{ primary: string[]; secondary: string[]; generic: string[] } | null>(null)
  const [currentSceneHint, setCurrentSceneHint] = useState('')

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [selectedHistory, setSelectedHistory] = useState<HistoryEntry | null>(null)

  // Prompt detail
  const [showFullPrompt, setShowFullPrompt] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  // Load industries + styles on mount
  useEffect(() => {
    fetch('/api/playground/test?industry=hvac')
      .then(r => r.json())
      .then(data => {
        setIndustries(data.allIndustries || [])
        setStyles(data.styles || [])
        if (data.allIndustries?.length) setIndustry(data.allIndustries[0])
        if (data.sceneHint) setCurrentSceneHint(data.sceneHint)
        if (data.tierTerms) setTierTerms(data.tierTerms)
      })
      .catch(() => {})
  }, [])

  // Update scene hint + tier terms when industry changes
  useEffect(() => {
    if (!industry) return
    fetch(`/api/playground/test?industry=${encodeURIComponent(industry)}`)
      .then(r => r.json())
      .then(data => {
        if (data.sceneHint) setCurrentSceneHint(data.sceneHint)
        if (data.tierTerms) setTierTerms(data.tierTerms)
        setSceneHintOverride('')
        setEditingSceneHint(false)
      })
      .catch(() => {})
  }, [industry])

  const handleRunTest = useCallback(async () => {
    if (!industry.trim() || !topic.trim()) return
    setLoading(true)
    setAiError(null)
    setSelectedHistory(null)

    try {
      const res = await fetch('/api/playground/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry,
          topic,
          style,
          includeAI,
          sceneHintOverride: sceneHintOverride.trim() || undefined,
          stylePrefixOverride: stylePrefixOverride.trim() || undefined,
          brandPrimaryColor: brandColor.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Test failed')

      setStockResults(data.stockResults || [])
      setAiResult(data.aiResult || null)
      setAiError(data.aiError || null)
      setPromptPreview(data.promptPreview || null)
      if (data.tierTerms) setTierTerms(data.tierTerms)

      // Add to history
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        industry,
        topic,
        style,
        stockResults: data.stockResults || [],
        aiResult: data.aiResult || null,
        promptPreview: data.promptPreview || null,
      }
      setHistory(prev => [entry, ...prev].slice(0, 20))
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Test failed')
    } finally {
      setLoading(false)
    }
  }, [industry, topic, style, includeAI, sceneHintOverride, stylePrefixOverride, brandColor])

  const loadHistoryEntry = (entry: HistoryEntry) => {
    setSelectedHistory(entry)
    setStockResults(entry.stockResults)
    setAiResult(entry.aiResult)
    setPromptPreview(entry.promptPreview)
  }

  const totalStockImages = stockResults.reduce((acc, r) => acc + r.images.length, 0)
  const totalHits = stockResults.reduce((acc, r) => acc + r.totalHits, 0)

  // Group stock results by tier
  const groupedByTier: Record<string, TierResult[]> = {}
  for (const r of stockResults) {
    if (!groupedByTier[r.tier]) groupedByTier[r.tier] = []
    groupedByTier[r.tier].push(r)
  }

  const tierOrder = ['primary', 'secondary', 'generic']
  const tierColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
    primary: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Primary' },
    secondary: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Secondary' },
    generic: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', label: 'Generic' },
  }

  return (
    <div className="space-y-6">
      {/* Config Panel */}
      <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleRunTest() }} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Industry */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none"
            >
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind.charAt(0).toUpperCase() + ind.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Style */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none"
            >
              {styles.map(s => (
                <option key={s.key} value={s.key}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Spring maintenance tips, 20% off pizza..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none"
            />
          </div>
        </div>

        {/* Advanced options row */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeAI}
              onChange={(e) => setIncludeAI(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-gray-700">Include AI generation</span>
            <span className="text-[10px] text-gray-400">(uses 1 credit)</span>
          </label>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Brand colour:</label>
            <input
              type="color"
              value={brandColor || '#3b82f6'}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
            />
            {brandColor && (
              <button type="button" onClick={() => setBrandColor('')} className="text-[10px] text-gray-400 hover:text-gray-600">clear</button>
            )}
          </div>
        </div>

        {/* Run button */}
        <button
          type="submit"
          disabled={loading || !topic.trim() || !industry.trim()}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Testing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Run Test
            </>
          )}
        </button>
      </form>

      {/* Results */}
      {(stockResults.length > 0 || aiResult || aiError) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Results (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Stock Results
                <span className="ml-2 text-xs font-normal text-gray-500">
                  {totalStockImages} images · {totalHits.toLocaleString()} total hits
                </span>
              </h3>
            </div>

            {tierOrder.map(tier => {
              const results = groupedByTier[tier]
              if (!results?.length) return null
              const tc = tierColors[tier]
              const tierHits = results.reduce((a, r) => a + r.totalHits, 0)

              return (
                <div key={tier} className={`rounded-lg border ${tc.border} overflow-hidden`}>
                  <div className={`px-3 py-2 ${tc.bg} flex items-center justify-between`}>
                    <span className={`text-xs font-semibold ${tc.text} uppercase tracking-wide`}>{tc.label}</span>
                    <span className="text-[10px] text-gray-500">{tierHits.toLocaleString()} total hits</span>
                  </div>
                  <div className="p-3 space-y-3 bg-white">
                    {results.map((r, i) => (
                      <div key={`${r.query}-${i}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <code className="text-[11px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded font-mono truncate max-w-[70%]">{r.query}</code>
                          <span className="text-[10px] text-gray-400">{r.totalHits.toLocaleString()} hits</span>
                        </div>
                        {r.images.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {r.images.map((img, j) => (
                              <div key={j} className="relative group">
                                <img
                                  src={img.url}
                                  alt={r.query}
                                  className="w-full aspect-square object-cover rounded-md border border-gray-100"
                                  loading="lazy"
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                  {img.photographer}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No images found</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Current tier terms reference */}
            {tierTerms && (
              <details className="text-xs">
                <summary className="text-gray-500 cursor-pointer hover:text-gray-700 font-medium">View all search terms for {industry}</summary>
                <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200">
                  {(['primary', 'secondary', 'generic'] as const).map(tier => (
                    <div key={tier}>
                      <span className={`font-semibold ${tierColors[tier].text}`}>{tierColors[tier].label}:</span>
                      <span className="text-gray-600 ml-1">{tierTerms[tier]?.join(' · ') || 'none'}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* AI Result + Prompt (1/3 width) */}
          <div className="space-y-4">
            {/* AI Image */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-3 py-2 bg-purple-50 flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">AI Result</span>
                {!includeAI && <span className="text-[10px] text-gray-400">Skipped (free mode)</span>}
              </div>
              <div className="p-3 bg-white">
                {aiResult ? (
                  <div>
                    <img src={aiResult.url} alt="AI generated" className="w-full aspect-square object-cover rounded-md border border-gray-100 mb-2" />
                    {aiResult.revisedPrompt && (
                      <details className="text-[11px]">
                        <summary className="text-purple-600 cursor-pointer hover:underline font-medium">DALL-E revised prompt</summary>
                        <p className="mt-1 text-gray-600 leading-relaxed bg-purple-50 rounded p-2">{aiResult.revisedPrompt}</p>
                      </details>
                    )}
                  </div>
                ) : aiError ? (
                  <p className="text-xs text-red-600 py-4">{aiError}</p>
                ) : includeAI && loading ? (
                  <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-8 text-center">
                    {includeAI ? 'Run a test to see AI results' : 'Enable "Include AI generation" above'}
                  </p>
                )}
              </div>
            </div>

            {/* Prompt Preview (always shown after test) */}
            {promptPreview && (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-3 py-2 bg-amber-50 flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Prompt Construction</span>
                  <button
                    type="button"
                    onClick={() => setShowFullPrompt(!showFullPrompt)}
                    className="text-[10px] text-amber-600 hover:underline"
                  >
                    {showFullPrompt ? 'Collapse' : 'Expand'}
                  </button>
                </div>
                <div className="p-3 bg-white space-y-2.5">
                  {/* Scene Hint */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-emerald-600 uppercase">Scene Hint</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSceneHint(!editingSceneHint)
                          if (!editingSceneHint && !sceneHintOverride) setSceneHintOverride(currentSceneHint)
                        }}
                        className="text-[10px] text-teal-600 hover:underline"
                      >
                        {editingSceneHint ? 'Done' : 'Edit'}
                      </button>
                    </div>
                    {editingSceneHint ? (
                      <textarea
                        value={sceneHintOverride}
                        onChange={(e) => setSceneHintOverride(e.target.value)}
                        rows={2}
                        className="w-full text-[11px] border border-teal-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-teal-300 outline-none resize-none"
                      />
                    ) : (
                      <p className="text-[11px] text-gray-700 leading-relaxed bg-emerald-50 rounded px-2 py-1.5">
                        {sceneHintOverride || currentSceneHint || promptPreview.sceneHint}
                      </p>
                    )}
                  </div>

                  {/* Style Prefix */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-blue-600 uppercase">Style Prefix</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStylePrefix(!editingStylePrefix)
                          if (!editingStylePrefix && !stylePrefixOverride) setStylePrefixOverride(promptPreview.stylePrefix)
                        }}
                        className="text-[10px] text-teal-600 hover:underline"
                      >
                        {editingStylePrefix ? 'Done' : 'Edit'}
                      </button>
                    </div>
                    {editingStylePrefix ? (
                      <textarea
                        value={stylePrefixOverride}
                        onChange={(e) => setStylePrefixOverride(e.target.value)}
                        rows={3}
                        className="w-full text-[11px] border border-teal-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-teal-300 outline-none resize-none"
                      />
                    ) : (
                      <p className="text-[11px] text-gray-700 leading-relaxed bg-blue-50 rounded px-2 py-1.5">
                        {stylePrefixOverride || promptPreview.stylePrefix}
                      </p>
                    )}
                  </div>

                  {/* Topic */}
                  <div>
                    <span className="text-[10px] font-semibold text-amber-600 uppercase">Topic (sanitized)</span>
                    <p className="text-[11px] text-gray-700 bg-amber-50 rounded px-2 py-1.5 mt-1">{promptPreview.topic}</p>
                  </div>

                  {showFullPrompt && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase">Full assembled prompt</span>
                      <div className="mt-1 text-[10px] text-gray-600 bg-gray-50 rounded p-2 leading-relaxed font-mono max-h-48 overflow-y-auto">
                        <span className="text-red-600">[NO TEXT BLOCK]</span>{' '}
                        <span className="text-orange-600">[SINGLE PHOTO BLOCK]</span>{' '}
                        Photograph for a <span className="font-semibold text-gray-900">{promptPreview.industry}</span> business.
                        Subject must be clearly related: <span className="text-emerald-700 font-medium">{sceneHintOverride || currentSceneHint || promptPreview.sceneHint}</span>.{' '}
                        <span className="text-blue-700 font-medium">{stylePrefixOverride || promptPreview.stylePrefix}</span>.{' '}
                        Visual theme: <span className="text-amber-700 font-medium">{promptPreview.topic}</span>.{' '}
                        Single main subject, clean uncluttered background, natural lighting. Colour palette: natural and muted...{' '}
                        <span className="text-orange-600">[SINGLE PHOTO BLOCK]</span>{' '}
                        <span className="text-red-600">[NO TEXT BLOCK]</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Session History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Session History</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {history.map(entry => {
              const firstImg = entry.stockResults.find(r => r.images.length > 0)?.images[0]
              const isActive = selectedHistory?.id === entry.id
              return (
                <button
                  key={entry.id}
                  onClick={() => loadHistoryEntry(entry)}
                  className={`flex-shrink-0 w-20 group transition-all ${isActive ? 'ring-2 ring-teal-400 rounded-lg' : ''}`}
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    {entry.aiResult ? (
                      <img src={entry.aiResult.url} alt="" className="w-full h-full object-cover" />
                    ) : firstImg ? (
                      <img src={firstImg.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No img</div>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1 truncate text-center">{entry.industry}</p>
                  <p className="text-[9px] text-gray-400 truncate text-center">{entry.topic.slice(0, 20)}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {stockResults.length === 0 && !aiResult && !loading && (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-sm font-medium">Enter a topic and click Run Test</p>
          <p className="text-xs mt-1">Stock images are free — enable AI generation to preview DALL-E results (uses 1 credit)</p>
        </div>
      )}
    </div>
  )
}
