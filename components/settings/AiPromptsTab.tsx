'use client'

import { useState, useEffect, useCallback } from 'react'

// Default scene hints and styles — fetched from server via API
interface AiPromptOverride {
  override_type: 'scene_hint' | 'style_prefix'
  key: string
  prompt_text: string
}

// Hardcoded defaults (mirrored from lib/openai/images.ts — first variation shown).
// The backend randomly picks from 4 variations per industry on each generation.
const DEFAULT_SCENE_HINTS: Record<string, string> = {
  hvac: 'skilled HVAC technician installing an energy-efficient air conditioner in a cozy family home during summer, with professional tools and safety gear',
  plumbing: 'experienced plumber repairing a leaky faucet under a kitchen sink in a busy family home, using high-quality tools and wearing protective gloves',
  electrical: 'certified electrician safely upgrading a home electrical panel in a modern kitchen, with multimeter and insulated tools',
  roofing: 'professional roofer laying durable shingles on a suburban house roof under clear skies, using harness and safety equipment',
  landscaping: 'dedicated landscaper shaping hedges and planting vibrant flowers in a welcoming backyard garden, with wheelbarrow and pruning shears',
  cleaning: 'efficient cleaning specialist deep-cleaning a kitchen countertop in a spotless home, using eco-friendly sprays and microfiber cloths',
  pest: 'trained pest control expert applying safe targeted treatments in a home attic, wearing protective suit and using humane methods',
  'real estate': 'enthusiastic real estate agent touring a charming family home with potential buyers, pointing out bright living room features',
  restaurant: 'talented chef expertly grilling fresh ingredients in a lively restaurant kitchen, steam rising and aromas implied',
  dental: 'gentle dentist performing a check-up on a relaxed patient in a bright modern clinic with state-of-the-art chairs and calming decor',
  legal: 'knowledgeable attorney discussing case details with a client in a confidential office setting, open law books on shelves',
  accounting: 'expert accountant analysing financial spreadsheets on a dual-monitor setup in a tidy organised office, with charts and a coffee mug',
  auto: 'skilled mechanic performing a precise engine tune-up under a lifted vehicle in a well-lit auto shop, with diagnostic tools on a cart',
  salon: 'talented hairstylist crafting a modern cut on a smiling client in a chic salon with large mirrors and warm lighting',
  fitness: 'personal trainer guiding a motivated client through a kettlebell workout in a bright modern gym, encouraging form',
  retail: 'welcoming shopkeeper arranging artisan products on wooden shelves in a cozy boutique storefront with warm lighting',
  contractor: 'general contractor reviewing blueprints at a residential construction site with framing visible, hard hat and vest on',
  photography: 'photographer capturing a portrait session in a studio with professional lighting, softboxes and backdrop visible',
  insurance: 'friendly insurance agent explaining coverage options to a family across a desk, brochures and laptop open',
  veterinary: 'caring veterinarian gently examining a golden retriever on a clinic table, stethoscope around neck, reassuring the pet',
  moving: 'professional movers carefully loading wrapped furniture into a branded moving truck on a residential street',
  tutoring: 'patient tutor helping a student work through a maths problem at a well-lit desk, books and notebooks spread out',
  bakery: 'baker pulling a tray of golden fresh-baked bread from a commercial oven, flour dusted apron and warm glow',
  childcare: 'friendly childcare provider reading a colourful storybook to a small group of engaged toddlers on a play mat',
  therapy: 'therapist in a calm comfortable office having a supportive conversation with a client, soft lighting and plants',
  'it services': 'IT specialist setting up a network server rack in a clean data room, cables neatly organised and labelled',
  'event planning': 'event planner arranging elegant floral centrepieces on round tables in a beautifully decorated wedding venue',
}

const DEFAULT_STYLE_PREFIXES: Record<string, { name: string; description: string; prefix: string }> = {
  promotional: { name: 'Promotional', description: 'Cinematic images for sales and offers', prefix: 'Inviting promotional photograph with cinematic lighting, warm highlights and shallow depth of field.' },
  professional: { name: 'Professional', description: 'Editorial documentary-style photography', prefix: 'High-end editorial photograph with soft natural window light and clean minimal composition.' },
  friendly: { name: 'Friendly', description: 'Warm candid lifestyle photography', prefix: 'Candid lifestyle photograph with golden hour warmth and soft bokeh background.' },
  seasonal: { name: 'Seasonal', description: 'Subtle seasonal themes with nature', prefix: 'Tasteful seasonal photograph with subtle holiday elements and biophilic accents.' },
  artistic: { name: 'Artistic', description: 'Painterly illustrative styles', prefix: 'Artistic stylized illustration with a painterly quality, soft brush strokes and dreamy atmosphere.' },
  graffiti: { name: 'Graffiti', description: 'Bold urban street art energy', prefix: 'Dynamic graffiti street art style illustration with vibrant spray paint colors.' },
  lifestyle: { name: 'Lifestyle', description: 'Candid real-people everyday moments', prefix: 'Candid lifestyle photograph capturing natural candid moments with warm inviting atmosphere.' },
  minimalist: { name: 'Minimalist', description: 'Clean premium modern aesthetic', prefix: 'Minimalist high-end photograph with clean lines, generous negative space and soft neutral tones.' },
  vintage: { name: 'Vintage', description: 'Film grain nostalgic retro feel', prefix: 'Warm vintage aesthetic photograph with gentle film grain, soft sepia undertones and nostalgic lighting.' },
  wellness: { name: 'Wellness', description: 'Serene spa-like calming atmosphere', prefix: 'Spa-like serene photograph with calming biophilic elements and soft diffused lighting.' },
}

export default function AiPromptsTab() {
  const [overrides, setOverrides] = useState<AiPromptOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingScene, setEditingScene] = useState<{ key: string; text: string } | null>(null)
  const [editingStyle, setEditingStyle] = useState<{ key: string; text: string } | null>(null)
  const [testConfig, setTestConfig] = useState({ industry: 'hvac', style: 'professional', topic: 'Spring maintenance tips' })
  const [testResult, setTestResult] = useState<{ prompt: string; imageUrl?: string; loading: boolean } | null>(null)

  const fetchOverrides = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-prompts')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setOverrides(data.overrides)
    } catch {
      setMessage({ type: 'error', text: 'Failed to load AI prompt overrides' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOverrides() }, [fetchOverrides])

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const getOverrideValue = (type: 'scene_hint' | 'style_prefix', key: string): string | null => {
    const ov = overrides.find(o => o.override_type === type && o.key === key)
    return ov?.prompt_text ?? null
  }

  const handleSave = async (overrideType: 'scene_hint' | 'style_prefix', key: string, promptText: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/ai-prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ override_type: overrideType, key, prompt_text: promptText }),
      })
      if (!res.ok) throw new Error('Failed to save')
      showMsg('success', `Saved ${overrideType === 'scene_hint' ? 'scene hint' : 'style prefix'} for ${key}`)
      await fetchOverrides()
      setEditingScene(null)
      setEditingStyle(null)
    } catch {
      showMsg('error', 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async (overrideType: 'scene_hint' | 'style_prefix', key: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/ai-prompts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ override_type: overrideType, key }),
      })
      if (!res.ok) throw new Error('Failed to reset')
      showMsg('success', 'Reset to default')
      await fetchOverrides()
      setEditingScene(null)
      setEditingStyle(null)
    } catch {
      showMsg('error', 'Failed to reset')
    } finally {
      setSaving(false)
    }
  }

  const buildPreviewPrompt = () => {
    const sceneOverride = getOverrideValue('scene_hint', testConfig.industry)
    const styleOverride = getOverrideValue('style_prefix', testConfig.style)
    const scene = sceneOverride ?? DEFAULT_SCENE_HINTS[testConfig.industry] ?? `${testConfig.industry} professional at work`
    const stylePrefix = styleOverride ?? DEFAULT_STYLE_PREFIXES[testConfig.style]?.prefix ?? ''
    return `Photograph for a ${testConfig.industry} business. Subject must be clearly related: ${scene}. ${stylePrefix}. Theme or mood: ${testConfig.topic}. Single main subject, clean uncluttered background, natural lighting.`
  }

  const handlePreviewPrompt = () => {
    setTestResult({ prompt: buildPreviewPrompt(), loading: false })
  }

  const handleGenerateTest = async () => {
    setTestResult({ prompt: buildPreviewPrompt(), loading: true })
    try {
      const res = await fetch('/api/content/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: testConfig.topic,
          industry: testConfig.industry,
          style: testConfig.style,
          contentType: 'social-post',
        }),
      })
      const data = await res.json()
      if (data.url) {
        setTestResult(prev => prev ? { ...prev, imageUrl: data.url, loading: false } : null)
      } else {
        showMsg('error', data.error || 'Image generation failed')
        setTestResult(prev => prev ? { ...prev, loading: false } : null)
      }
    } catch {
      showMsg('error', 'Failed to generate test image')
      setTestResult(prev => prev ? { ...prev, loading: false } : null)
    }
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
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Explanation */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">How AI prompts work</h3>
        <p className="text-xs text-blue-700 leading-relaxed">
          When GeoSpark generates an AI image, the final DALL-E prompt is built from two parts: a <strong>scene hint</strong> (what to show for this industry) and a <strong>style prefix</strong> (how it should look). Scene hints have 4 vivid variations per industry — one is randomly picked each time for natural diversity. Style prefixes are set in the Style Prompts tab. You can override any scene hint below to lock in a custom description.
        </p>
      </div>

      {/* Industry Scene Hints */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Industry Scene Hints</h3>
        <p className="text-xs text-gray-500 mb-4">These describe what the AI image should show for each industry. The system randomly picks from 4 vivid variations per industry on each generation. Override below to use a fixed hint instead.</p>
        <div className="space-y-3">
          {Object.entries(DEFAULT_SCENE_HINTS).map(([key, defaultHint]) => {
            const override = getOverrideValue('scene_hint', key)
            const isEditing = editingScene?.key === key
            return (
              <div key={key} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 capitalize">{key}</span>
                    {override ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-medium">override</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">default</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {override && !isEditing && (
                      <button onClick={() => handleReset('scene_hint', key)} disabled={saving} className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
                        Reset
                      </button>
                    )}
                    {!isEditing ? (
                      <button onClick={() => setEditingScene({ key, text: override ?? defaultHint })} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-1">
                        <button onClick={() => handleSave('scene_hint', key, editingScene.text)} disabled={saving} className="text-xs text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50">
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setEditingScene(null)} className="text-xs text-gray-500 hover:text-gray-700">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {isEditing ? (
                  <textarea
                    value={editingScene.text}
                    onChange={e => setEditingScene({ ...editingScene, text: e.target.value })}
                    rows={2}
                    className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-y"
                  />
                ) : (
                  <p className="text-xs text-gray-600">{override ?? defaultHint}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Image Styles */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Image Styles</h3>
        <p className="text-xs text-gray-500 mb-4">Style prefixes define the overall look and feel of AI-generated images.</p>
        <div className="space-y-4">
          {Object.entries(DEFAULT_STYLE_PREFIXES).map(([key, style]) => {
            const override = getOverrideValue('style_prefix', key)
            const isEditing = editingStyle?.key === key
            return (
              <div key={key} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-800">{style.name}</h4>
                    {override ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-medium">override</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">default</span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {override && !isEditing && (
                      <button onClick={() => handleReset('style_prefix', key)} disabled={saving} className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
                        Reset
                      </button>
                    )}
                    {!isEditing ? (
                      <button onClick={() => setEditingStyle({ key, text: override ?? style.prefix })} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-1">
                        <button onClick={() => handleSave('style_prefix', key, editingStyle.text)} disabled={saving} className="text-xs text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50">
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setEditingStyle(null)} className="text-xs text-gray-500 hover:text-gray-700">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mb-2">{style.description}</p>
                {isEditing ? (
                  <textarea
                    value={editingStyle.text}
                    onChange={e => setEditingStyle({ ...editingStyle, text: e.target.value })}
                    rows={4}
                    className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-y"
                  />
                ) : (
                  <p className="text-xs text-gray-600 line-clamp-3">{override ?? style.prefix}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Test Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Test AI Image Generation</h3>
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Industry</label>
            <select
              value={testConfig.industry}
              onChange={e => setTestConfig(p => ({ ...p, industry: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {Object.keys(DEFAULT_SCENE_HINTS).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Style</label>
            <select
              value={testConfig.style}
              onChange={e => setTestConfig(p => ({ ...p, style: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {Object.entries(DEFAULT_STYLE_PREFIXES).map(([k, v]) => (
                <option key={k} value={k}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Topic</label>
            <input
              type="text"
              value={testConfig.topic}
              onChange={e => setTestConfig(p => ({ ...p, topic: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="e.g. Spring maintenance tips"
            />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            onClick={handlePreviewPrompt}
            className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
          >
            Preview Prompt
          </button>
          <button
            onClick={handleGenerateTest}
            disabled={testResult?.loading}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
          >
            {testResult?.loading ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Generating...
              </>
            ) : 'Generate Test Image'}
          </button>
          <span className="text-xs text-amber-600 self-center">Uses 1 AI image credit</span>
        </div>

        {testResult && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-gray-600 mb-1">Full Prompt</h4>
              <p className="text-xs text-gray-700 font-mono whitespace-pre-wrap">{testResult.prompt}</p>
            </div>
            {testResult.imageUrl && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 mb-1">Generated Image</h4>
                <img src={testResult.imageUrl} alt="Test generation" className="w-48 h-48 object-cover rounded-lg border border-gray-200" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
