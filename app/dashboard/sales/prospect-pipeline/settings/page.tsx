'use client'

import { useEffect, useState } from 'react'

interface SettingEntry {
  value: unknown
  description: string
  updated_at: string
}

const SETTING_CONFIG: Record<string, { label: string; type: 'number' | 'text' | 'boolean' | 'select' | 'textarea'; options?: string[] }> = {
  pipeline_enabled: { label: 'Pipeline Enabled', type: 'boolean' },
  daily_scrape_target: { label: 'Daily Scrape Target', type: 'number' },
  target_category: { label: 'Target Category', type: 'select', options: [
    'All Categories',
    'Hair Salon', 'Barber Shop', 'Nail Salon', 'Spa & Wellness',
    'Dental Practice', 'Chiropractor', 'Veterinarian', 'Optometrist',
    'Restaurant', 'Cafe & Coffee Shop', 'Bar & Nightclub', 'Bakery',
    'Gym & Fitness', 'Yoga Studio', 'Martial Arts',
    'Auto Repair', 'Car Wash', 'Auto Detailing',
    'Plumber', 'Electrician', 'HVAC', 'Roofing', 'Landscaping', 'Cleaning Service',
    'Real Estate Agent', 'Insurance Agent', 'Accountant', 'Lawyer',
    'Photography Studio', 'Tattoo Shop', 'Pet Grooming',
  ] },
  target_location: { label: 'Target Location (city, country)', type: 'text' },
  fresh_sources_enabled: { label: 'Fresh Sources (directories, awards)', type: 'boolean' },
  engagement_enabled: { label: 'Engagement Targeting (Lead Magnet Thief)', type: 'boolean' },
  engagement_target_creators: { label: 'Target Creators (comma-separated @usernames)', type: 'textarea' },
  sender_first_name: { label: 'Sender Name (email sign-off)', type: 'text' },
  social_proof_stage: { label: 'Social Proof Stage', type: 'select', options: ['1', '2', '3'] },
  learning_mode: { label: 'Learning Mode', type: 'select', options: ['passive', 'active', 'autonomous'] },
  tier_1_min: { label: 'Tier 1 Min Score', type: 'number' },
  tier_2_min: { label: 'Tier 2 Min Score', type: 'number' },
  instagram_delay_seconds: { label: 'Instagram Delay (seconds)', type: 'number' },
  max_competitors_per_lead: { label: 'Competitors per Lead', type: 'number' },
  ab_test_subject_lines: { label: 'A/B Test Subject Lines', type: 'boolean' },
  schedule_cron: { label: 'Cron Schedule (display only)', type: 'text' },
}

const SECTION_ORDER = [
  { title: 'Pipeline Control', keys: ['pipeline_enabled', 'daily_scrape_target', 'schedule_cron'] },
  { title: 'Targeting', keys: ['target_category', 'target_location'] },
  { title: 'Source Mix (60% Google Maps + 20% Fresh + 20% Engagement)', keys: ['fresh_sources_enabled', 'engagement_enabled', 'engagement_target_creators'] },
  { title: 'Email Settings', keys: ['sender_first_name', 'social_proof_stage', 'ab_test_subject_lines'] },
  { title: 'Scoring', keys: ['tier_1_min', 'tier_2_min'] },
  { title: 'Advanced', keys: ['learning_mode', 'instagram_delay_seconds', 'max_competitors_per_lead'] },
]

export default function PipelineSettingsPage() {
  const [settings, setSettings] = useState<Record<string, SettingEntry>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sales/prospect-pipeline/settings')
      .then(r => r.json())
      .then(d => setSettings(d.settings || {}))
      .finally(() => setLoading(false))
  }, [])

  const updateSetting = async (key: string, value: unknown) => {
    setSaving(key)
    try {
      await fetch('/api/sales/prospect-pipeline/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      setSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value, updated_at: new Date().toISOString() },
      }))
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
    } catch {
      // silently fail
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pipeline Settings</h1>
        <p className="text-gray-600">
          Control the autonomous sales pipeline. Changes take effect on the next pipeline run.
        </p>
      </div>

      {SECTION_ORDER.map(section => (
        <div key={section.title} className="bg-white rounded-xl border p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
          {section.keys.map(key => {
            const entry = settings[key]
            const config = SETTING_CONFIG[key]
            if (!entry || !config) return null

            return (
              <SettingRow
                key={key}
                settingKey={key}
                config={config}
                entry={entry}
                saving={saving === key}
                saved={saved === key}
                onUpdate={updateSetting}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

function SettingRow({
  settingKey,
  config,
  entry,
  saving,
  saved,
  onUpdate,
}: {
  settingKey: string
  config: { label: string; type: string; options?: string[] }
  entry: SettingEntry
  saving: boolean
  saved: boolean
  onUpdate: (key: string, value: unknown) => void
}) {
  const rawValue = entry.value
  const value = typeof rawValue === 'string' ? rawValue.replace(/^"|"$/g, '') : rawValue

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{config.label}</p>
        <p className="text-xs text-gray-500">{entry.description}</p>
      </div>
      <div className="flex items-center gap-2">
        {config.type === 'boolean' ? (
          <button
            onClick={() => onUpdate(settingKey, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-teal-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        ) : config.type === 'select' ? (
          <select
            value={String(value)}
            onChange={(e) => onUpdate(settingKey, e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm bg-white min-w-[120px]"
          >
            {config.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : config.type === 'number' ? (
          <input
            type="number"
            value={String(value)}
            onChange={(e) => onUpdate(settingKey, parseInt(e.target.value) || 0)}
            className="px-3 py-1.5 border rounded-lg text-sm w-24 text-right"
          />
        ) : config.type === 'textarea' ? (
          <TextAreaInput
            initialValue={
              Array.isArray(value) ? value.join(', ') : String(value)
            }
            onSave={(v) => {
              const items = v.split(',').map((s: string) => s.trim().replace('@', '')).filter(Boolean)
              onUpdate(settingKey, items)
            }}
          />
        ) : (
          <TextInput
            initialValue={String(value)}
            onSave={(v) => onUpdate(settingKey, v)}
          />
        )}

        {saving && <span className="text-xs text-gray-400">saving...</span>}
        {saved && <span className="text-xs text-green-600">saved</span>}
      </div>
    </div>
  )
}

function TextInput({ initialValue, onSave }: { initialValue: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState(initialValue)
  return (
    <input
      type="text"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => { if (val !== initialValue) onSave(val) }}
      onKeyDown={(e) => { if (e.key === 'Enter') onSave(val) }}
      className="px-3 py-1.5 border rounded-lg text-sm w-48"
    />
  )
}

function TextAreaInput({ initialValue, onSave }: { initialValue: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState(initialValue)
  return (
    <textarea
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => { if (val !== initialValue) onSave(val) }}
      rows={2}
      placeholder="salonownershub, instagramforsalons, modernsalon"
      className="px-3 py-1.5 border rounded-lg text-sm w-64 resize-none"
    />
  )
}
