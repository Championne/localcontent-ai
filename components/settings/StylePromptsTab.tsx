'use client'

import { useState, useEffect, useCallback } from 'react'

interface AiPromptOverride {
  override_type: 'scene_hint' | 'style_prefix'
  key: string
  prompt_text: string
}

const DEFAULT_STYLE_PREFIXES: Record<string, { name: string; description: string; keywords: string[]; prefix: string }> = {
  promotional: {
    name: 'Promotional',
    description: 'Playful or stylized images for sales and offers',
    keywords: ['sale', 'discount', 'off', 'special', 'deal', 'offer', 'limited', 'save', 'price', 'free'],
    prefix: 'Promotional-style image that clearly shows the business type: technician at work, equipment, vehicle, or service in context. Inviting but with natural, muted colours—no oversaturation or neon. Suitable for a sale or offer. No generic interiors, no furniture showrooms, no pedestals, no abstract decor or mood boards. Single clear subject from the business world. All surfaces and objects free of text or signage',
  },
  professional: {
    name: 'Professional',
    description: 'Authentic business photography',
    keywords: ['tips', 'how to', 'guide', 'advice', 'learn', 'info', 'update', 'news', 'service'],
    prefix: 'Authentic professional photograph with realistic lighting and natural, muted colour palette—avoid oversaturated or intense colours. Simple clean composition showing only physical objects and environments. All surfaces blank and unmarked. No signage in scene',
  },
  friendly: {
    name: 'Friendly',
    description: 'Warm, approachable photography',
    keywords: ['thank', 'welcome', 'community', 'team', 'family', 'customer', 'appreciate', 'love'],
    prefix: 'Warm natural photograph with soft lighting, candid authentic feel. Colours should be soft and natural, not vivid or intense. Shows only physical objects and people. All clothing is plain solid colors. All surfaces blank. No signage anywhere',
  },
  seasonal: {
    name: 'Seasonal',
    description: 'Subtle seasonal themed photography',
    keywords: ['holiday', 'christmas', 'summer', 'spring', 'fall', 'winter', 'new year', 'valentine', 'easter', 'thanksgiving', 'halloween'],
    prefix: 'Tasteful seasonal photograph with subtle holiday elements. Muted, natural colour palette—no oversaturated or garish colours. Only physical decorations and objects. All surfaces blank and unmarked. No signage, no greeting cards, no written messages',
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
          When GeoSpark generates an AI image, it automatically picks a style based on the topic keywords. For example, posts about "sales" or "discounts" get the <strong>Promotional</strong> style, while "tips" or "how to" content gets <strong>Professional</strong>. Each style has a prompt prefix that tells DALL-E what kind of photograph to create. You can override these prompts to fine-tune the look of your generated images.
        </p>
      </div>

      {/* Style Cards */}
      {Object.entries(DEFAULT_STYLE_PREFIXES).map(([key, style]) => {
        const override = getOverrideValue(key)
        const isEditing = editingStyle?.key === key
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
          </div>
        )
      })}
    </div>
  )
}
