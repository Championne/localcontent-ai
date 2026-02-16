'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SparkCard from '@/components/ui/SparkCard'

interface Business {
  id: string
  name: string
}

interface Integration {
  id: string
  business_id: string
  platform: string
  account_id: string | null
  account_name: string | null
  connected_at: string
  metadata?: { connectedPlatforms?: string[]; lastConnectedPlatform?: string } | null
}

interface MetricSnapshot {
  value: number | null
  source: string | null
}

interface AnalyticsData {
  businessId: string
  baseline: Record<string, MetricSnapshot>
  current: Record<string, MetricSnapshot>
  lastSync: string | null
}

// Platform definitions with colors and SVG icons
const PLATFORMS = [
  { id: 'google_business', label: 'Google Business', color: '#4285F4', icon: 'G', type: 'gmb' },
  { id: 'facebook', label: 'Facebook', color: '#1877F2', icon: 'f', type: 'late' },
  { id: 'instagram', label: 'Instagram', color: '#E4405F', icon: 'IG', type: 'late' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', icon: 'in', type: 'late' },
  { id: 'twitter', label: 'X (Twitter)', color: '#000000', icon: '𝕏', type: 'late' },
  { id: 'tiktok', label: 'TikTok', color: '#000000', icon: 'TT', type: 'late' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000', icon: '▶', type: 'late' },
] as const

function AnalyticsContent() {
  const searchParams = useSearchParams()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/business')
      .then((r) => r.json())
      .then((data) => {
        const list = data.businesses ?? []
        setBusinesses(list)
        if (list.length > 0 && !selectedBusinessId) setSelectedBusinessId(list[0].id)
      })
      .catch(() => setError('Failed to load businesses'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedBusinessId) return
    setLoading(true)
    Promise.all([
      fetch(`/api/integrations?businessId=${selectedBusinessId}`).then((r) => r.json()),
      fetch(`/api/analytics/current?businessId=${selectedBusinessId}`).then((r) => r.json()),
    ])
      .then(([intRes, anaRes]) => {
        if (intRes.integrations) setIntegrations(intRes.integrations)
        if (!anaRes.error) setAnalytics(anaRes)
        else setAnalytics(null)
      })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [selectedBusinessId])

  // Derive connected platforms
  const connectedGmb = integrations.some((i) => i.platform === 'google_business')
  const lateIntegration = integrations.find((i) => i.platform === 'late_aggregator')
  const connectedSocialPlatforms: string[] = (lateIntegration?.metadata?.connectedPlatforms || []) as string[]

  const isPlatformConnected = (platformId: string) => {
    if (platformId === 'google_business') return connectedGmb
    return connectedSocialPlatforms.includes(platformId)
  }

  const connectUrl = selectedBusinessId
    ? `/api/integrations/gmb/connect?businessId=${encodeURIComponent(selectedBusinessId)}`
    : '#'
  const connectLateUrl = (platform: string) =>
    selectedBusinessId
      ? `/api/integrations/late/connect?businessId=${encodeURIComponent(selectedBusinessId)}&platform=${platform}`
      : '#'

  const successParam = searchParams.get('connected')
  const errorParam = searchParams.get('error')

  const totalConnected = (connectedGmb ? 1 : 0) + connectedSocialPlatforms.length
  const hasAnyData = analytics?.current && Object.keys(analytics.current).length > 0

  return (
    <div className="max-w-5xl mx-auto">
      {/* SparkFox Greeting */}
      <SparkCard
        expression={totalConnected > 0 ? 'happy' : 'encouraging'}
        className="mb-6"
      >
        <p className="text-sm text-gray-800 leading-relaxed">
          {totalConnected === 0
            ? "Welcome to your performance hub! Connect your accounts below and I'll start tracking what's working. The more data I have, the smarter your content strategy becomes."
            : totalConnected === 1
              ? `Great start! You've connected ${connectedGmb ? 'Google Business Profile' : connectedSocialPlatforms[0]}. Connect more platforms so I can see the full picture of how your content performs.`
              : `You've got ${totalConnected} platforms connected — I'm learning from real data now. Keep posting and I'll help you understand what resonates with your audience.`}
        </p>
      </SparkCard>

      {/* Business selector */}
      {businesses.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Business</label>
          <select
            value={selectedBusinessId ?? ''}
            onChange={(e) => setSelectedBusinessId(e.target.value || null)}
            className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Success / Error banners */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      {successParam === 'gmb' && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Google Business Profile connected successfully!
        </div>
      )}
      {successParam === 'late' && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Social account connected! You can connect more platforms below.
        </div>
      )}
      {errorParam && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          {errorParam === 'gmb_denied' && 'Connection was cancelled. Try again when ready.'}
          {errorParam === 'late_denied' && 'Social connection was cancelled. Try again when ready.'}
          {!errorParam.includes('denied') && `Something went wrong. Please try again.`}
        </div>
      )}

      {/* ── Connect Your Platforms ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Platforms</h2>
          {totalConnected > 0 && (
            <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
              {totalConnected} connected
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {PLATFORMS.map((platform) => {
            const connected = isPlatformConnected(platform.id)
            const href = platform.type === 'gmb' ? connectUrl : connectLateUrl(platform.id)

            return (
              <a
                key={platform.id}
                href={href}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center group
                  ${connected
                    ? 'border-green-200 bg-green-50/50 hover:border-green-300'
                    : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/30 hover:shadow-sm'
                  }`}
              >
                {/* Platform icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  style={{ backgroundColor: platform.color }}
                >
                  {platform.icon}
                </div>

                <span className="text-sm font-medium text-gray-900">{platform.label}</span>

                {connected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 group-hover:text-teal-600 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Connect
                  </span>
                )}
              </a>
            )
          })}
        </div>
      </div>

      {/* ── Performance Metrics ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>

        {!connectedGmb && !hasAnyData ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <p className="text-sm text-gray-500 mb-1">No performance data yet</p>
            <p className="text-xs text-gray-400">Connect Google Business Profile above to start tracking views, reviews, and ratings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'gmb_views', label: 'GMB Views', icon: '👁️', source: 'Google Business' },
              { key: 'search_impressions', label: 'Search Impressions', icon: '🔍', source: 'Search Console' },
              { key: 'reviews', label: 'Reviews', icon: '⭐', source: 'Google Business' },
              { key: 'avg_rating', label: 'Avg Rating', icon: '📊', source: 'Google Business' },
            ].map(metric => {
              const val = analytics?.current?.[metric.key]?.value
              return (
                <div key={metric.key} className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{metric.icon}</span>
                    <span className="text-xs font-medium text-gray-500">{metric.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {val != null
                      ? metric.key === 'avg_rating' ? Number(val).toFixed(1) : Number(val).toLocaleString()
                      : '—'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">{metric.source}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Growth Insights (only when data exists) ── */}
      {hasAnyData && (
        <SparkCard expression="analyzing" className="mb-6">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Growth Insights</p>
          <p className="text-sm text-gray-800 leading-relaxed">
            I&apos;m tracking your performance data now. As you create and publish more content, I&apos;ll identify patterns — which topics drive the most views, what posting times work best, and how your audience is growing. Keep creating sparks and the insights will build over time!
          </p>
        </SparkCard>
      )}

      {/* ── Coming Soon ── */}
      <div className="grid md:grid-cols-3 gap-3">
        {[
          { title: 'Growth Trends', desc: 'See how your metrics change over time', icon: '📈' },
          { title: 'Content Performance', desc: 'Which posts drive the most engagement', icon: '🎯' },
          { title: 'Shareable Reports', desc: 'Download reports for your records', icon: '📄' },
        ].map(item => (
          <div key={item.title} className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center">
            <span className="text-2xl mb-2 block">{item.icon}</span>
            <h3 className="text-sm font-semibold text-gray-700">{item.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
            <span className="inline-block mt-2 text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Coming soon</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-center py-8">Loading analytics…</div>}>
      <AnalyticsContent />
    </Suspense>
  )
}
