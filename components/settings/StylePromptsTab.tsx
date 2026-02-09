'use client'

import { useState, useEffect, useCallback } from 'react'

interface AiPromptOverride {
  override_type: 'scene_hint' | 'style_prefix'
  key: string
  prompt_text: string
}

const DEFAULT_STYLE_PREFIXES: Record<string, { name: string; description: string; keywords: string[]; prefix: string; subVariations?: Record<string, { name: string; prefix: string }> }> = {
  promotional: {
    name: 'Promotional',
    description: 'Cinematic images for sales and offers',
    keywords: ['sale', 'discount', 'off', 'special', 'deal', 'offer', 'limited', 'save', 'price', 'free', 'promo', 'promotion', 'coupon'],
    prefix: 'Inviting promotional photograph with cinematic lighting, warm highlights and shallow depth of field. Natural but vibrant tones matching an energetic mood. Single clear subject from the business world, premium focus on the product or service.',
  },
  professional: {
    name: 'Professional',
    description: 'Editorial documentary-style photography',
    keywords: ['tips', 'how to', 'guide', 'advice', 'learn', 'info', 'update', 'news', 'service', 'announcement', 'launch'],
    prefix: 'High-end editorial photograph with soft natural window light and clean minimal composition. Documentary-style realism with a muted, sophisticated colour palette. DSLR quality with subtle depth of field.',
  },
  friendly: {
    name: 'Friendly',
    description: 'Warm candid lifestyle photography',
    keywords: ['thank', 'welcome', 'community', 'team', 'family', 'customer', 'appreciate', 'love', 'happy', 'together'],
    prefix: 'Candid lifestyle photograph with golden hour warmth and soft bokeh background. Genuine, approachable feel. Soft diffused lighting, warm colour tones.',
  },
  seasonal: {
    name: 'Seasonal',
    description: 'Subtle seasonal themes with nature',
    keywords: ['holiday', 'christmas', 'summer', 'spring', 'fall', 'winter', 'new year', 'valentine', 'easter', 'thanksgiving', 'halloween', 'season'],
    prefix: 'Tasteful seasonal photograph with subtle holiday elements and biophilic accents. Muted, natural colour palette. Only physical decorations and objects.',
  },
  artistic: {
    name: 'Artistic',
    description: 'Painterly illustrative styles',
    keywords: ['creative', 'inspire', 'transform', 'journey', 'dream', 'vision', 'art', 'style', 'unique', 'elevate', 'design', 'craft'],
    prefix: 'Artistic stylized illustration with a painterly quality, soft brush strokes and dreamy atmosphere. Vibrant yet harmonious colors, high detail, cinematic composition.',
    subVariations: {
      watercolor: { name: 'Watercolor', prefix: 'Soft dreamy watercolor illustration with translucent washes, gentle colour bleeding and delicate brush strokes.' },
      'oil-painting': { name: 'Oil Painting', prefix: 'Rich textured oil painting illustration with visible thick brush strokes, deep saturated colors and dramatic lighting.' },
      sketch: { name: 'Sketch', prefix: 'Clean modern line art sketch illustration with confident pen strokes on a light background. Minimal colour accents.' },
    },
  },
  graffiti: {
    name: 'Graffiti',
    description: 'Bold urban street art energy',
    keywords: ['urban', 'street', 'bold', 'edgy', 'fun', 'rebel', 'standout', 'loud', 'colorful', 'mural'],
    prefix: 'Dynamic graffiti street art style illustration with vibrant spray paint colors. Bold lines and energetic composition, urban artistic vibe with high contrast.',
    subVariations: {
      full: { name: 'Full Graffiti', prefix: 'Immersive full graffiti mural illustration covering the entire scene with vibrant spray paint colors, bold dripping lines, and explosive energy.' },
      'subtle-accents': { name: 'Subtle Accents', prefix: 'Clean professional photograph with subtle graffiti-style accent elements at the edges. Main subject is photographically realistic.' },
    },
  },
  lifestyle: {
    name: 'Lifestyle',
    description: 'Candid real-people everyday moments',
    keywords: ['everyday', 'real', 'life', 'experience', 'home', 'moment', 'routine', 'authentic', 'people', 'living'],
    prefix: 'Candid lifestyle photograph capturing natural candid moments with warm inviting atmosphere. Soft natural light, relatable and aspirational feel, DSLR quality.',
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Clean premium modern aesthetic',
    keywords: ['clean', 'modern', 'minimal', 'sleek', 'premium', 'sophisticated', 'elegant', 'simple', 'refined', 'luxury'],
    prefix: 'Minimalist high-end photograph with clean lines, generous negative space and soft neutral tones. Premium feel with matte textures and geometric simplicity.',
  },
  vintage: {
    name: 'Vintage',
    description: 'Film grain nostalgic retro feel',
    keywords: ['vintage', 'retro', 'classic', 'old-school', 'nostalgia', 'heritage', 'tradition', 'throwback', 'timeless'],
    prefix: 'Warm vintage aesthetic photograph with gentle film grain, soft sepia undertones and nostalgic lighting. Slightly faded colours reminiscent of 35mm film photography.',
  },
  wellness: {
    name: 'Wellness',
    description: 'Serene spa-like calming atmosphere',
    keywords: ['wellness', 'calm', 'relax', 'peace', 'health', 'comfort', 'spa', 'zen', 'mindful', 'healing', 'self-care', 'yoga'],
    prefix: 'Spa-like serene photograph with calming biophilic elements. Soft diffused lighting creating a peaceful mood. Muted earth tones with hints of sage green and warm ivory.',
  },
}

export default function StylePromptsTab() {
  const [overrides, setOverrides] = useState<AiPromptOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingStyle, setEditingStyle] = useState<{ key: string; text: string } | null>(null)

  const fetchOverrides = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-prompts')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setOverrides(data.overrides)
    } catch {
      setMessage({ type: 'error', text: 'Failed to load style prompt overrides' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOverrides() }, [fetchOverrides])

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const getOverrideValue = (key: string): string | null => {
    const ov = overrides.find(o => o.override_type === 'style_prefix' && o.key === key)
    return ov?.prompt_text ?? null
  }

  const handleSave = async (key: string, promptText: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/ai-prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ override_type: 'style_prefix', key, prompt_text: promptText }),
      })
      if (!res.ok) throw new Error('Failed to save')
      showMsg('success', `Saved style prompt for "${key}"`)
      await fetchOverrides()
      setEditingStyle(null)
    } catch {
      showMsg('error', 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async (key: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/ai-prompts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ override_type: 'style_prefix', key }),
      })
      if (!res.ok) throw new Error('Failed to reset')
      showMsg('success', 'Reset to default')
      await fetchOverrides()
      setEditingStyle(null)
    } catch {
      showMsg('error', 'Failed to reset')
    } finally {
      setSaving(false)
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
        <h3 className="text-sm font-semibold text-blue-900 mb-1">How style prompts work</h3>
        <p className="text-xs text-blue-700 leading-relaxed">
          When GeoSpark generates an AI image, it picks a style based on weighted scoring: topic keywords (50%), industry bias (30%), and post type (20%). You can also set preferred/avoided styles per business in Brand Identity. Each style has a prompt prefix that tells DALL-E what kind of image to create. Styles with sub-variations (Artistic, Graffiti) offer additional refinement. You can override any prompt below.
        </p>
      </div>

      {/* Style Cards */}
      {Object.entries(DEFAULT_STYLE_PREFIXES).map(([key, style]) => {
        const override = getOverrideValue(key)
        const isEditing = editingStyle?.key === key
        const hasSubVars = style.subVariations && Object.keys(style.subVariations).length > 0
        return (
          <div key={key} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900">{style.name}</h3>
                  {override ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-medium">custom</span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">default</span>
                  )}
                  {hasSubVars && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">has sub-styles</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{style.description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-4">
                {override && !isEditing && (
                  <button onClick={() => handleReset(key)} disabled={saving} className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
                    Reset
                  </button>
                )}
                {!isEditing ? (
                  <button onClick={() => setEditingStyle({ key, text: override ?? style.prefix })} className="text-xs font-medium" style={{ color: 'var(--brand-primary)' }}>
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => handleSave(key, editingStyle.text)} disabled={saving} className="text-xs font-medium disabled:opacity-50" style={{ color: 'var(--brand-primary)' }}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingStyle(null)} className="text-xs text-gray-500 hover:text-gray-700">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Keywords */}
            <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Auto-detected keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {style.keywords.map(kw => (
                  <span key={kw} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{kw}</span>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div className="px-5 py-4">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Prompt prefix</p>
              {isEditing ? (
                <textarea
                  value={editingStyle.text}
                  onChange={e => setEditingStyle({ ...editingStyle, text: e.target.value })}
                  rows={5}
                  className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:outline-none resize-y"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                />
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">{override ?? style.prefix}</p>
              )}
            </div>

            {/* Sub-variations */}
            {hasSubVars && (
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/30">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-3">Sub-style variations</p>
                <div className="space-y-3">
                  {Object.entries(style.subVariations!).map(([svKey, sv]) => {
                    const svOverrideKey = `${key}:${svKey}`
                    const svOverride = getOverrideValue(svOverrideKey)
                    return (
                      <div key={svKey} className="bg-white rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-800">{sv.name}</span>
                            {svOverride ? (
                              <span className="text-[9px] px-1 py-0.5 rounded bg-teal-100 text-teal-700 font-medium">custom</span>
                            ) : (
                              <span className="text-[9px] px-1 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">default</span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{svOverride ?? sv.prefix}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
