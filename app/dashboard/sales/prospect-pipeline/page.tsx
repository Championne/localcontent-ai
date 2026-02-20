'use client'

import { useEffect, useState } from 'react'

interface PipelineOverview {
  total_prospects: number
  status_counts: Record<string, number>
  tier_counts: Record<string, number>
  recent_runs: PipelineRun[]
}

interface PipelineRun {
  id: string
  run_date: string
  status: string
  prospects_scraped: number
  prospects_enriched: number
  prospects_scored: number
  insights_generated: number
  emails_generated: number
  uploaded_to_instantly: number
  duration_seconds: number
  started_at: string
  completed_at: string
}

interface Prospect {
  id: string
  business_name: string
  category: string
  city: string
  state: string
  contact_email: string
  owner_email: string
  google_rating: number
  google_reviews_count: number
  geospark_score: number
  score_tier: string
  pipeline_status: string
  prospect_source: string
  created_at: string
}

const TIER_COLORS: Record<string, string> = {
  TIER_1: 'bg-green-100 text-green-800',
  TIER_2: 'bg-blue-100 text-blue-800',
  TIER_3: 'bg-yellow-100 text-yellow-800',
  TIER_4: 'bg-orange-100 text-orange-800',
  TIER_5: 'bg-gray-100 text-gray-600',
}

const TIER_LABELS: Record<string, string> = {
  TIER_1: 'Tier 1 — Perfect Fit',
  TIER_2: 'Tier 2 — Excellent',
  TIER_3: 'Tier 3 — Good',
  TIER_4: 'Tier 4 — Fair',
  TIER_5: 'Tier 5 — Skip',
}

const STATUS_LABELS: Record<string, string> = {
  scraped: 'Scraped',
  enriched: 'Enriched',
  scored: 'Scored',
  insights_generated: 'Insights',
  emails_generated: 'Emails Ready',
  uploaded_to_instantly: 'Uploaded',
  sending: 'Sending',
  completed: 'Completed',
}

export default function ProspectPipelinePage() {
  const [overview, setOverview] = useState<PipelineOverview | null>(null)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [view, setView] = useState<'overview' | 'prospects'>('overview')

  useEffect(() => {
    fetch('/api/sales/prospect-pipeline?view=overview')
      .then(r => r.json())
      .then(setOverview)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (view !== 'prospects') return
    const params = new URLSearchParams({ view: 'prospects' })
    if (selectedTier) params.set('tier', selectedTier)
    if (selectedStatus) params.set('status', selectedStatus)
    fetch(`/api/sales/prospect-pipeline?${params}`)
      .then(r => r.json())
      .then(d => setProspects(d.prospects || []))
  }, [view, selectedTier, selectedStatus])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospect Pipeline</h1>
          <p className="text-gray-600">Autonomous sales machine monitoring</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'overview' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setView('prospects')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'prospects' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Prospects
          </button>
          <a
            href="/dashboard/sales/prospect-pipeline/settings"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Settings
          </a>
        </div>
      </div>

      {view === 'overview' && overview && <OverviewView overview={overview} />}
      {view === 'prospects' && (
        <ProspectsView
          prospects={prospects}
          selectedTier={selectedTier}
          setSelectedTier={setSelectedTier}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
      )}
    </div>
  )
}

function OverviewView({ overview }: { overview: PipelineOverview }) {
  const sc = overview.status_counts
  const tc = overview.tier_counts

  return (
    <div className="space-y-6">
      {/* Total */}
      <div className="bg-white p-6 rounded-xl border">
        <p className="text-sm text-gray-600">Total Prospects in Pipeline</p>
        <p className="text-3xl font-bold text-teal-600">{overview.total_prospects.toLocaleString()}</p>
      </div>

      {/* Pipeline funnel */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Pipeline Funnel</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="bg-white p-4 rounded-xl border text-center">
              <p className="text-2xl font-bold text-gray-900">{(sc[key] || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tier distribution */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Score Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(TIER_LABELS).map(([tier, label]) => (
            <div key={tier} className="bg-white p-4 rounded-xl border">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[tier]}`}>
                  {tier.replace('_', ' ')}
                </span>
                <span className="text-xl font-bold text-gray-900">{tc[tier] || 0}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{label.split('—')[1]?.trim()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent runs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Pipeline Runs</h2>
        {overview.recent_runs.length === 0 ? (
          <p className="text-gray-500 text-sm">No pipeline runs yet. Start the pipeline on your VPS.</p>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600">Date</th>
                  <th className="px-4 py-3 text-right text-gray-600">Scraped</th>
                  <th className="px-4 py-3 text-right text-gray-600">Enriched</th>
                  <th className="px-4 py-3 text-right text-gray-600">Scored</th>
                  <th className="px-4 py-3 text-right text-gray-600">Emails</th>
                  <th className="px-4 py-3 text-right text-gray-600">Uploaded</th>
                  <th className="px-4 py-3 text-right text-gray-600">Duration</th>
                  <th className="px-4 py-3 text-center text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overview.recent_runs.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(run.started_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{run.prospects_scraped}</td>
                    <td className="px-4 py-3 text-right">{run.prospects_enriched}</td>
                    <td className="px-4 py-3 text-right">{run.prospects_scored}</td>
                    <td className="px-4 py-3 text-right">{run.emails_generated}</td>
                    <td className="px-4 py-3 text-right">{run.uploaded_to_instantly}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {run.duration_seconds ? `${Math.round(run.duration_seconds / 60)}m` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        run.status === 'completed' ? 'bg-green-100 text-green-800' :
                        run.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        run.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {run.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function ProspectsView({
  prospects,
  selectedTier,
  setSelectedTier,
  selectedStatus,
  setSelectedStatus,
}: {
  prospects: Prospect[]
  selectedTier: string | null
  setSelectedTier: (t: string | null) => void
  selectedStatus: string | null
  setSelectedStatus: (s: string | null) => void
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={selectedTier || ''}
          onChange={(e) => setSelectedTier(e.target.value || null)}
          className="px-3 py-2 border rounded-lg text-sm bg-white"
        >
          <option value="">All Tiers</option>
          {Object.entries(TIER_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={selectedStatus || ''}
          onChange={(e) => setSelectedStatus(e.target.value || null)}
          className="px-3 py-2 border rounded-lg text-sm bg-white"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Prospects table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600">Business</th>
              <th className="px-4 py-3 text-left text-gray-600">Location</th>
              <th className="px-4 py-3 text-center text-gray-600">Score</th>
              <th className="px-4 py-3 text-center text-gray-600">Tier</th>
              <th className="px-4 py-3 text-center text-gray-600">Google</th>
              <th className="px-4 py-3 text-left text-gray-600">Email</th>
              <th className="px-4 py-3 text-center text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-gray-600">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {prospects.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No prospects found. Run the pipeline on your VPS to start scraping.
                </td>
              </tr>
            ) : (
              prospects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.business_name}</div>
                    <div className="text-xs text-gray-500">{p.category}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.city}{p.state ? `, ${p.state}` : ''}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-lg font-bold text-gray-900">{p.geospark_score || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.score_tier && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[p.score_tier] || ''}`}>
                        {p.score_tier?.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {p.google_rating ? `${p.google_rating}★` : '—'}
                    {p.google_reviews_count ? ` (${p.google_reviews_count})` : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px] truncate">
                    {p.contact_email || p.owner_email || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-gray-500">
                      {STATUS_LABELS[p.pipeline_status] || p.pipeline_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {p.prospect_source || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
