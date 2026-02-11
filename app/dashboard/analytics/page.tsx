'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface Business {
  id: string
  name: string
}

interface Integration {
  id: string
  business_id: string
  platform: string
  account_name: string | null
  connected_at: string
}

interface MetricSnapshot {
  value: number | null
  source: string | null
  captured_at?: string
  recorded_date?: string
}

interface AnalyticsData {
  businessId: string
  baseline: Record<string, MetricSnapshot>
  current: Record<string, MetricSnapshot>
  lastSync: string | null
}

const METRIC_LABELS: Record<string, string> = {
  gmb_views: 'GMB Views',
  search_impressions: 'Search Impressions',
  reviews: 'Reviews',
  avg_rating: 'Avg Rating',
  social_followers: 'Social Followers',
  social_engagement: 'Social Engagement',
  website_sessions: 'Website Sessions',
}

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
        if (list.length > 0 && !selectedBusinessId) {
          setSelectedBusinessId(list[0].id)
        }
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

  const connectedGmb = integrations.some((i) => i.platform === 'google_business')
  const connectedLate = integrations.some((i) => i.platform === 'late_aggregator')
  const connectUrl = selectedBusinessId
    ? `/api/integrations/gmb/connect?businessId=${encodeURIComponent(selectedBusinessId)}`
    : '#'
  const connectLateUrl = (platform: string) =>
    selectedBusinessId
      ? `/api/integrations/late/connect?businessId=${encodeURIComponent(selectedBusinessId)}&platform=${platform}`
      : '#'
  const successParam = searchParams.get('connected')
  const errorParam = searchParams.get('error')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <p className="text-muted-foreground mb-6">
        Track your content performance and see the impact on your business. Connect Google Business
        Profile (GMB) and social accounts (Facebook, Instagram, LinkedIn, X) via Late.
      </p>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {businesses.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Business
          </label>
          <select
            value={selectedBusinessId ?? ''}
            onChange={(e) => setSelectedBusinessId(e.target.value || null)}
            className="w-full max-w-xs px-3 py-2 border border-input rounded-md bg-background"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {successParam === 'gmb' && (
        <div className="mb-4 p-4 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
          Google Business Profile connected successfully.
        </div>
      )}
      {successParam === 'late' && (
        <div className="mb-4 p-4 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
          Social account connected. You can connect more platforms (Facebook, Instagram, etc.) from the link below.
        </div>
      )}
      {errorParam && (
        <div className="mb-4 p-4 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm">
          {errorParam === 'gmb_denied' && 'Connection was cancelled or denied.'}
          {errorParam === 'gmb_missing_params' && 'Missing parameters. Try connecting again.'}
          {errorParam === 'gmb_invalid_state' && 'Session expired. Try connecting again.'}
          {errorParam === 'gmb_missing_business' && 'Session expired. Please select a business and try again.'}
          {errorParam === 'gmb_business_invalid' && 'Business not found. Please try again.'}
          {errorParam === 'gmb_token_failed' && 'Could not complete connection. Try again.'}
          {errorParam === 'gmb_save_failed' && 'Connection succeeded but saving failed. Contact support.'}
          {errorParam === 'late_denied' && 'Social connection was cancelled or denied.'}
          {errorParam === 'late_missing_business' && 'Session expired. Try connecting again.'}
          {errorParam === 'late_business_invalid' && 'Business not found. Try again.'}
          {errorParam === 'late_save_failed' && 'Connection succeeded but saving failed. Contact support.'}
          {!['gmb_denied', 'gmb_missing_params', 'gmb_invalid_state', 'gmb_missing_business', 'gmb_business_invalid', 'gmb_token_failed', 'gmb_save_failed', 'late_denied', 'late_missing_business', 'late_business_invalid', 'late_save_failed'].includes(errorParam) && `Error: ${errorParam}`}
        </div>
      )}

      {/* Connected integrations */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Connected accounts</h2>
        {integrations.length === 0 ? (
          <p className="text-muted-foreground text-sm">No accounts connected for this business.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {integrations.map((i) => (
              <li
                key={i.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm"
              >
                <span>
                  {i.platform === 'google_business'
                    ? 'Google Business'
                    : i.platform === 'late_aggregator'
                      ? 'Social (Late)'
                      : i.platform.replace(/_/g, ' ')}
                </span>
                {i.account_name && (
                  <span className="text-muted-foreground">({i.account_name})</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">GMB Views</p>
          <p className="text-3xl font-bold mt-1">
            {analytics?.current?.gmb_views?.value != null
              ? Number(analytics.current.gmb_views.value).toLocaleString()
              : '-'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {connectedGmb ? 'From connected GMB' : 'Connect GMB to track'}
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">Search Impressions</p>
          <p className="text-3xl font-bold mt-1">
            {analytics?.current?.search_impressions?.value != null
              ? Number(analytics.current.search_impressions.value).toLocaleString()
              : '-'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Connect Search Console later</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">Reviews</p>
          <p className="text-3xl font-bold mt-1">
            {analytics?.current?.reviews?.value != null
              ? analytics.current.reviews.value
              : '-'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {connectedGmb ? 'From GMB' : 'Connect GMB to track'}
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">Avg Rating</p>
          <p className="text-3xl font-bold mt-1">
            {analytics?.current?.avg_rating?.value != null
              ? Number(analytics.current.avg_rating.value).toFixed(1)
              : '-'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {connectedGmb ? 'From GMB' : 'Connect GMB to track'}
          </p>
        </div>
      </div>

      {/* Impact Dashboard */}
      <div className="bg-card border rounded-lg p-8">
        <h2 className="text-lg font-semibold mb-4">Impact Dashboard</h2>
        <p className="text-muted-foreground mb-6">
          Connect Google Business Profile to capture a baseline and see before/after metrics. Connect
          social channels (Facebook, Instagram, LinkedIn, X) via the buttons below.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium mb-4">Before GeoSpark</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              {analytics?.baseline && Object.keys(analytics.baseline).length > 0 ? (
                Object.entries(analytics.baseline).map(([key, v]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{METRIC_LABELS[key] ?? key}</span>
                    <span className="font-medium">{v.value != null ? v.value : '-'}</span>
                  </div>
                ))
              ) : (
                <>
                  <p className="text-muted-foreground">Baseline metrics will appear here</p>
                  <p className="text-sm mt-2">Connect GMB to capture baseline</p>
                </>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-4">Current</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              {analytics?.current && Object.keys(analytics.current).length > 0 ? (
                Object.entries(analytics.current).map(([key, v]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{METRIC_LABELS[key] ?? key}</span>
                    <span className="font-medium">{v.value != null ? v.value : '-'}</span>
                  </div>
                ))
              ) : (
                <>
                  <p className="text-muted-foreground">Growth metrics will appear here</p>
                  <p className="text-sm mt-2">Sync runs after you connect integrations</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={connectUrl}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
          >
            {connectedGmb ? 'Reconnect Google Business Profile' : 'Connect Google Business Profile'}
          </a>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Social:</span>
            <a
              href={connectLateUrl('facebook')}
              className="px-4 py-2 border border-input rounded-md hover:bg-muted text-sm font-medium"
            >
              Facebook
            </a>
            <a
              href={connectLateUrl('instagram')}
              className="px-4 py-2 border border-input rounded-md hover:bg-muted text-sm font-medium"
            >
              Instagram
            </a>
            <a
              href={connectLateUrl('linkedin')}
              className="px-4 py-2 border border-input rounded-md hover:bg-muted text-sm font-medium"
            >
              LinkedIn
            </a>
            <a
              href={connectLateUrl('twitter')}
              className="px-4 py-2 border border-input rounded-md hover:bg-muted text-sm font-medium"
            >
              X (Twitter)
            </a>
            {connectedLate && (
              <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
            )}
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="bg-muted/30 border border-dashed rounded-lg p-4 text-center">
          <h3 className="font-medium mb-2">Growth Trends</h3>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </div>
        <div className="bg-muted/30 border border-dashed rounded-lg p-4 text-center">
          <h3 className="font-medium mb-2">Competitor Benchmark</h3>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </div>
        <div className="bg-muted/30 border border-dashed rounded-lg p-4 text-center">
          <h3 className="font-medium mb-2">Shareable Reports</h3>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading analytics…</div>}>
      <AnalyticsContent />
    </Suspense>
  )
}
