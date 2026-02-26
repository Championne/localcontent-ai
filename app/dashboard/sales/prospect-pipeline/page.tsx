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
  country: string
  website: string
  contact_name: string
  contact_email: string
  owner_name: string
  owner_email: string
  google_rating: number
  google_reviews_count: number
  geospark_score: number
  score_tier: string
  pipeline_status: string
  prospect_source: string
  enrichment_status: string
  created_at: string
}

interface ProspectDetail {
  lead: Record<string, unknown>
  social_profiles: Record<string, unknown>[]
  insights: Record<string, unknown>[]
  email_sequence: Record<string, unknown>[]
  competitors: Record<string, unknown>[]
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
  const [locations, setLocations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [view, setView] = useState<'overview' | 'prospects'>('overview')
  const [selectedProspect, setSelectedProspect] = useState<string | null>(null)
  const [prospectDetail, setProspectDetail] = useState<ProspectDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

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
    if (selectedLocation) params.set('location', selectedLocation)
    fetch(`/api/sales/prospect-pipeline?${params}`)
      .then(r => r.json())
      .then(d => {
        setProspects(d.prospects || [])
        if (d.locations) setLocations(d.locations)
      })
  }, [view, selectedTier, selectedStatus, selectedLocation])

  useEffect(() => {
    if (!selectedProspect) { setProspectDetail(null); return }
    setDetailLoading(true)
    fetch(`/api/sales/prospect-pipeline?view=prospect-detail&id=${selectedProspect}`)
      .then(r => r.json())
      .then(setProspectDetail)
      .finally(() => setDetailLoading(false))
  }, [selectedProspect])

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
          locations={locations}
          selectedTier={selectedTier}
          setSelectedTier={setSelectedTier}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          onSelectProspect={setSelectedProspect}
        />
      )}

      {selectedProspect && (
        <ProspectDetailPanel
          detail={prospectDetail}
          loading={detailLoading}
          onClose={() => setSelectedProspect(null)}
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
  locations,
  selectedTier,
  setSelectedTier,
  selectedStatus,
  setSelectedStatus,
  selectedLocation,
  setSelectedLocation,
  onSelectProspect,
}: {
  prospects: Prospect[]
  locations: string[]
  selectedTier: string | null
  setSelectedTier: (t: string | null) => void
  selectedStatus: string | null
  setSelectedStatus: (s: string | null) => void
  selectedLocation: string | null
  setSelectedLocation: (l: string | null) => void
  onSelectProspect: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={selectedLocation || ''}
          onChange={(e) => setSelectedLocation(e.target.value || null)}
          className="px-3 py-2 border rounded-lg text-sm bg-white"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
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
        <span className="self-center text-xs text-gray-400">{prospects.length} results</span>
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
                <tr
                  key={p.id}
                  className="hover:bg-teal-50 cursor-pointer transition-colors"
                  onClick={() => onSelectProspect(p.id)}
                >
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

function ProspectDetailPanel({
  detail,
  loading,
  onClose,
}: {
  detail: ProspectDetail | null
  loading: boolean
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            {loading ? 'Loading...' : (detail?.lead as Record<string, unknown>)?.business_name as string || 'Prospect Detail'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 text-xl leading-none">&times;</button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
        )}

        {!loading && detail && (
          <div className="p-6 space-y-6">
            <DetailSection title="Business Info" data={detail.lead} fields={[
              ['business_name', 'Business Name'],
              ['category', 'Category'],
              ['city', 'City'],
              ['state', 'State'],
              ['country', 'Country'],
              ['address', 'Address'],
              ['zip', 'ZIP'],
              ['contact_name', 'Contact Name'],
              ['contact_email', 'Email'],
              ['contact_phone', 'Phone'],
              ['owner_name', 'Owner Name'],
              ['owner_email', 'Owner Email'],
              ['owner_phone', 'Owner Phone'],
              ['website', 'Website'],
            ]} />

            <DetailSection title="Google & Scoring" data={detail.lead} fields={[
              ['google_rating', 'Google Rating'],
              ['google_reviews_count', 'Reviews'],
              ['google_maps_url', 'Google Maps'],
              ['geospark_score', 'GeoSpark Score'],
              ['score_tier', 'Tier'],
              ['pipeline_status', 'Pipeline Status'],
              ['enrichment_status', 'Enrichment'],
              ['prospect_source', 'Source'],
              ['email_source', 'Email Source'],
              ['created_at', 'Created'],
            ]} />

            <ScoreBreakdown data={detail.lead} />

            <DetailSection title="Social Links" data={detail.lead} fields={[
              ['instagram_url', 'Instagram'],
              ['facebook_url', 'Facebook'],
              ['yelp_url', 'Yelp'],
            ]} />

            {detail.social_profiles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Instagram Profile</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {detail.social_profiles.filter(s => s.platform === 'instagram').map((sp, i) => (
                    <div key={i} className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {[
                        ['username', 'Username'],
                        ['followers', 'Followers'],
                        ['following', 'Following'],
                        ['posts_count', 'Posts'],
                        ['engagement_rate', 'Engagement Rate'],
                        ['posts_last_30_days', 'Posts (30d)'],
                        ['posting_frequency', 'Posts/Month'],
                        ['is_business_account', 'Business Account'],
                        ['bio', 'Bio'],
                      ].map(([key, label]) => {
                        const val = sp[key]
                        if (val == null || val === '') return null
                        return (
                          <div key={key} className="contents">
                            <span className="text-gray-500">{label}</span>
                            <span className="text-gray-900 break-all">
                              {typeof val === 'number' ? val.toLocaleString() : String(val)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.competitors.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Competitors ({detail.competitors.length})</h3>
                <div className="space-y-2">
                  {detail.competitors.map((c, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <span className="font-medium text-gray-900">{c.competitor_name as string}</span>
                      {c.follower_count && <span className="text-gray-500 ml-2">{(c.follower_count as number).toLocaleString()} followers</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.insights.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Marketing Insights ({detail.insights.length})</h3>
                <div className="space-y-2">
                  {detail.insights.map((ins, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="font-medium text-gray-900">{ins.insight_type as string}</div>
                      <div className="text-gray-600 mt-1">{ins.insight_text as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.email_sequence.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Email Sequence ({detail.email_sequence.length})</h3>
                <div className="space-y-2">
                  {detail.email_sequence.map((em, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="font-medium text-gray-900">
                        #{em.email_number as number}: {em.subject_line as string}
                      </div>
                      <div className="text-gray-600 mt-1 whitespace-pre-wrap text-xs">
                        {em.body_text as string}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DetailSection({
  title,
  data,
  fields,
}: {
  title: string
  data: Record<string, unknown>
  fields: string[][]
}) {
  const rows = fields.filter(([key]) => data[key] != null && data[key] !== '')
  if (rows.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {rows.map(([key, label]) => {
          let val = data[key]
          if (typeof val === 'boolean') val = val ? 'Yes' : 'No'
          const isUrl = typeof val === 'string' && (val.startsWith('http') || val.startsWith('www'))
          return (
            <div key={key} className="contents">
              <span className="text-gray-500">{label}</span>
              {isUrl ? (
                <a href={val as string} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline break-all">
                  {(val as string).replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}
                </a>
              ) : (
                <span className="text-gray-900 break-all">{String(val)}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ScoreBreakdown({ data }: { data: Record<string, unknown> }) {
  const breakdown = data.score_breakdown as Record<string, { points: number; reason: string }> | undefined
  if (!breakdown) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Score Breakdown ({data.geospark_score as number}/100)</h3>
      <div className="bg-gray-50 rounded-lg p-4 space-y-1.5">
        {Object.entries(breakdown).map(([key, { points, reason }]) => (
          <div key={key} className="flex items-start gap-2 text-sm">
            <span className={`shrink-0 w-8 text-right font-mono font-medium ${points > 0 ? 'text-teal-600' : 'text-gray-400'}`}>
              +{points}
            </span>
            <span className="text-gray-500">{key.replace(/_/g, ' ')}</span>
            <span className="text-gray-400 ml-auto text-xs max-w-[50%] text-right">{reason}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
