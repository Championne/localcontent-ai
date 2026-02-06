'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Safe parse: never throw so we don't trigger the dashboard error boundary
async function safeJson<T = unknown>(res: Response): Promise<T | null> {
  const text = await res.text()
  try {
    return text ? (JSON.parse(text) as T) : null
  } catch {
    return null
  }
}

interface Lead {
  id: string
  business_name: string
  contact_name: string | null
  email: string | null
  contact_email: string | null
  contact_phone: string | null
  city: string | null
  state: string | null
  status: string
  score: number
  google_rating: number | null
  google_reviews_count: number | null
  created_at: string
  last_contacted_at: string | null
  sales_lead_id: string | null
  emails_sent: number
  emails_opened: number
  emails_replied: number
  temperature?: string
  temperature_emoji?: string
  recommended_action?: string
  industry?: {
    id: string
    name: string
    icon: string
    color: string
  }
}

interface Campaign {
  id: string
  name: string
  status: string
  total_leads: number
  emails_sent: number
  emails_replied: number
  created_at: string
}

interface InstantlyCampaign {
  id: string
  name: string
  status: string
  stats?: {
    total_leads: number
    emails_sent: number
    emails_opened: number
    emails_replied: number
    emails_bounced: number
  }
}

interface Stats {
  total_leads: number
  new_leads: number
  contacted: number
  replied: number
  interested: number
  converted: number
}

interface PriorityQueue {
  leads: Lead[]
  summary: {
    hot: number
    warm: number
    warming: number
    cold: number
    total: number
  }
  actionCounts: {
    call_now: number
    call_today: number
    call_soon: number
    send_email: number
    start_sequence: number
  }
}

interface Industry {
  id: string
  name: string
  icon: string
  color: string
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-gray-100 text-gray-800',
  contacted: 'bg-blue-100 text-blue-800',
  replied: 'bg-yellow-100 text-yellow-800',
  interested: 'bg-purple-100 text-purple-800',
  demo_scheduled: 'bg-indigo-100 text-indigo-800',
  converted: 'bg-green-100 text-green-800',
  not_interested: 'bg-red-100 text-red-800',
  bounced: 'bg-orange-100 text-orange-800',
  unsubscribed: 'bg-gray-100 text-gray-600',
}

export default function OutreachDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [hotLeads, setHotLeads] = useState<Lead[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [instantlyCampaigns, setInstantlyCampaigns] = useState<InstantlyCampaign[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [priorityQueue, setPriorityQueue] = useState<PriorityQueue | null>(null)
  const [instantlyConnected, setInstantlyConnected] = useState<boolean | null>(null)
  const [stats, setStats] = useState<Stats>({
    total_leads: 0,
    new_leads: 0,
    contacted: 0,
    replied: 0,
    interested: 0,
    converted: 0
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [pushingToInstantly, setPushingToInstantly] = useState(false)

  useEffect(() => {
    Promise.all([
      fetchData(),
      fetchInstantlyStatus(),
      fetchPriorityQueue(),
      fetchIndustries(),
    ]).catch((err) => console.error('Outreach initial load error:', err))
  }, [])

  useEffect(() => {
    fetchLeads().catch((err) => console.error('Outreach fetchLeads error:', err))
  }, [selectedStatus, selectedIndustry, searchQuery])

  async function fetchData() {
    setLoading(true)
    try {
      await Promise.all([
        fetchLeads(),
        fetchCampaigns(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLeads() {
    try {
      const params = new URLSearchParams()
      if (selectedStatus !== 'all') params.set('status', selectedStatus)
      if (selectedIndustry) params.set('industry_id', selectedIndustry)
      if (searchQuery) params.set('search', searchQuery)
      params.set('limit', '20')

      const res = await fetch(`/api/outreach/leads?${params}`)
      const data = await safeJson<{ leads?: Lead[] }>(res)
      setLeads(data?.leads ?? [])
    } catch (error) {
      console.error('Error fetching leads:', error)
      setLeads([])
    }
  }

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/outreach/campaigns')
      const data = await safeJson<{ campaigns?: Campaign[] }>(res)
      setCampaigns(data?.campaigns ?? [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      setCampaigns([])
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/outreach/leads?limit=1000')
      const data = await safeJson<{ leads?: Lead[] }>(res)
      const allLeads = data?.leads ?? []

      setStats({
        total_leads: allLeads.length,
        new_leads: allLeads.filter((l: Lead) => l.status === 'new').length,
        contacted: allLeads.filter((l: Lead) => l.status === 'contacted').length,
        replied: allLeads.filter((l: Lead) => l.status === 'replied').length,
        interested: allLeads.filter((l: Lead) => l.status === 'interested').length,
        converted: allLeads.filter((l: Lead) => l.status === 'converted').length,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({ total_leads: 0, new_leads: 0, contacted: 0, replied: 0, interested: 0, converted: 0 })
    }
  }

  async function fetchInstantlyStatus() {
    try {
      const res = await fetch('/api/outreach/instantly/sync')
      const data = await safeJson<{ connected?: boolean; campaigns?: InstantlyCampaign[] }>(res)
      setInstantlyConnected(data?.connected ?? false)
      if (data?.campaigns) {
        setInstantlyCampaigns(data.campaigns)
      }
    } catch {
      setInstantlyConnected(false)
    }
  }

  async function fetchPriorityQueue() {
    try {
      const res = await fetch('/api/outreach/priority-queue?limit=10')
      const data = await safeJson<PriorityQueue>(res)
      if (data) {
        setPriorityQueue(data)
        setHotLeads(data.leads?.filter((l: Lead) => l.temperature === 'hot' || l.temperature === 'warm').slice(0, 5) ?? [])
      }
    } catch (error) {
      console.error('Error fetching priority queue:', error)
      setPriorityQueue(null)
      setHotLeads([])
    }
  }

  async function fetchIndustries() {
    try {
      const res = await fetch('/api/sales/industries')
      const data = await safeJson<{ industries?: Industry[] }>(res)
      setIndustries(data?.industries ?? [])
    } catch (error) {
      console.error('Error fetching industries:', error)
      setIndustries([])
    }
  }

  async function syncInstantly() {
    setSyncing(true)
    try {
      await fetch('/api/outreach/instantly/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      await fetchData()
      await fetchPriorityQueue()
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setSyncing(false)
    }
  }

  async function pushToInstantly(campaignId: string) {
    if (selectedLeads.length === 0) {
      alert('Select leads to push to Instantly')
      return
    }

    setPushingToInstantly(true)
    try {
      const res = await fetch('/api/outreach/instantly/push-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          lead_ids: selectedLeads
        })
      })
      const data = await res.json()
      
      if (res.ok) {
        alert(`Pushed ${data.uploaded} leads to Instantly (${data.skipped} skipped)`)
        setSelectedLeads([])
        await fetchData()
      } else {
        alert(data.error || 'Failed to push leads')
      }
    } catch (error) {
      console.error('Push error:', error)
      alert('Failed to push leads to Instantly')
    } finally {
      setPushingToInstantly(false)
    }
  }

  async function updateLeadStatus(leadId: string, newStatus: string) {
    try {
      await fetch(`/api/outreach/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      fetchData()
      fetchPriorityQueue()
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  async function convertToSalesLead(leadId: string) {
    if (!confirm('Convert this lead to a Sales lead?')) return
    
    try {
      const res = await fetch(`/api/outreach/leads/${leadId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert(data.was_existing 
          ? 'Linked to existing sales lead!' 
          : 'Successfully converted to sales lead!'
        )
        fetchData()
      } else {
        alert(data.error || 'Failed to convert lead')
      }
    } catch (error) {
      console.error('Error converting lead:', error)
      alert('Failed to convert lead')
    }
  }

  function toggleLeadSelection(leadId: string) {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  function selectAllLeads() {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map(l => l.id))
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outreach CRM</h1>
          <p className="text-gray-600">Manage leads, campaigns, and email outreach</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/outreach/import"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Import Leads
          </Link>
          <Link
            href="/dashboard/sales/overview"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sales Overview
          </Link>
        </div>
      </div>

      {/* Instantly Connection Status */}
      <div className={`mb-6 p-4 rounded-xl border ${
        instantlyConnected === null ? 'bg-gray-50 border-gray-200' :
        instantlyConnected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              instantlyConnected === null ? 'bg-gray-400' :
              instantlyConnected ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <div>
              <p className="font-medium">
                {instantlyConnected === null ? 'Checking Instantly.ai connection...' :
                 instantlyConnected ? 'Connected to Instantly.ai' : 'Instantly.ai not configured'}
              </p>
              {instantlyConnected && instantlyCampaigns.length > 0 && (
                <p className="text-sm text-gray-600">
                  {instantlyCampaigns.length} active campaign{instantlyCampaigns.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          {instantlyConnected && (
            <button
              onClick={syncInstantly}
              disabled={syncing}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : '🔄 Sync Now'}
            </button>
          )}
        </div>
      </div>

      {/* Priority Queue - Hot Leads */}
      {hotLeads.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              🔥 Hot Leads - Action Required
            </h2>
            <div className="flex gap-2 text-sm">
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
                {priorityQueue?.summary.hot || 0} hot
              </span>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                {priorityQueue?.summary.warm || 0} warm
              </span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {hotLeads.map(lead => (
              <div 
                key={lead.id}
                className="bg-white p-3 rounded-lg border border-orange-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{lead.business_name}</p>
                    <p className="text-sm text-gray-500">{lead.contact_name || lead.email}</p>
                  </div>
                  <span className="text-xl">{lead.temperature_emoji || '🔥'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    Score: {lead.score}
                  </span>
                  <div className="flex gap-2">
                    {lead.recommended_action === 'call_now' && (
                      <Link 
                        href={`tel:${lead.contact_phone}`}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        📞 Call Now
                      </Link>
                    )}
                    <Link
                      href={`/dashboard/outreach/leads/${lead.id}`}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total_leads}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">New</p>
          <p className="text-2xl font-bold text-gray-900">{stats.new_leads}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Contacted</p>
          <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Replied</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.replied}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Interested</p>
          <p className="text-2xl font-bold text-purple-600">{stats.interested}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Converted</p>
          <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leads Section - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Leads</h2>
              <div className="flex items-center gap-2">
                {selectedLeads.length > 0 && instantlyCampaigns.length > 0 && (
                  <select
                    onChange={(e) => e.target.value && pushToInstantly(e.target.value)}
                    disabled={pushingToInstantly}
                    className="text-sm px-3 py-1.5 border border-teal-300 bg-teal-50 text-teal-700 rounded-lg"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {pushingToInstantly ? 'Pushing...' : `Push ${selectedLeads.length} to Instantly →`}
                    </option>
                    {instantlyCampaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
                <Link 
                  href="/dashboard/outreach/leads"
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  View All →
                </Link>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Industries</option>
                {industries.map(ind => (
                  <option key={ind.id} value={ind.id}>{ind.icon} {ind.name}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="replied">Replied</option>
                <option value="interested">Interested</option>
                <option value="demo_scheduled">Demo Scheduled</option>
                <option value="converted">Converted</option>
                <option value="not_interested">Not Interested</option>
              </select>
            </div>
          </div>

          {/* Leads Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : leads.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No leads yet</p>
                <Link
                  href="/dashboard/outreach/import"
                  className="text-teal-600 hover:text-teal-700"
                >
                  Import your first leads →
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedLeads.length === leads.length && leads.length > 0}
                        onChange={selectAllLeads}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className={`hover:bg-gray-50 ${selectedLeads.includes(lead.id) ? 'bg-teal-50' : ''}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => toggleLeadSelection(lead.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {lead.industry && (
                            <span title={lead.industry.name}>{lead.industry.icon}</span>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{lead.business_name}</div>
                            {lead.google_rating && (
                              <div className="text-xs text-gray-500">
                                ⭐ {lead.google_rating} ({lead.google_reviews_count} reviews)
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{lead.contact_name || '-'}</div>
                        <div className="text-xs text-gray-500">{lead.email || lead.contact_email || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{lead.temperature_emoji || '🔵'}</span>
                          <span className="text-sm font-medium">{lead.score || 0}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {lead.emails_sent || 0} sent · {lead.emails_opened || 0} opened
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 ${STATUS_COLORS[lead.status] || 'bg-gray-100'}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="replied">Replied</option>
                          <option value="interested">Interested</option>
                          <option value="demo_scheduled">Demo Scheduled</option>
                          <option value="converted">Converted</option>
                          <option value="not_interested">Not Interested</option>
                          <option value="bounced">Bounced</option>
                          <option value="unsubscribed">Unsubscribed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/outreach/leads/${lead.id}`}
                            className="text-teal-600 hover:text-teal-700 text-sm"
                          >
                            View
                          </Link>
                          {lead.sales_lead_id ? (
                            <Link
                              href={`/dashboard/sales/leads/${lead.sales_lead_id}`}
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              In Sales
                            </Link>
                          ) : ['replied', 'interested', 'demo_scheduled'].includes(lead.status) && (
                            <button
                              onClick={() => convertToSalesLead(lead.id)}
                              className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                            >
                              → Sales
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Instantly Campaigns */}
          {instantlyConnected && instantlyCampaigns.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-sm">⚡</span> Instantly Campaigns
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {instantlyCampaigns.slice(0, 5).map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 text-sm">{campaign.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    {campaign.stats && (
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <span>📧 {campaign.stats.emails_sent} sent</span>
                        <span>👁 {campaign.stats.emails_opened} opened</span>
                        <span>💬 {campaign.stats.emails_replied} replied</span>
                        <span>❌ {campaign.stats.emails_bounced} bounced</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Campaigns */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sequences</h2>
              <Link
                href="/dashboard/outreach/campaigns/new"
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                + New
              </Link>
            </div>
            
            <div className="p-4 space-y-3">
              {campaigns.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-3">No sequences yet</p>
                  <Link
                    href="/dashboard/outreach/campaigns/new"
                    className="text-teal-600 hover:text-teal-700 text-sm"
                  >
                    Create sequence →
                  </Link>
                </div>
              ) : (
                campaigns.slice(0, 5).map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/dashboard/outreach/campaigns/${campaign.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 text-sm">{campaign.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>{campaign.total_leads} leads</span>
                      <span>{campaign.emails_sent} sent</span>
                      <span>{campaign.emails_replied} replied</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Action Counts */}
          {priorityQueue && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold mb-3">Today's Tasks</h3>
              <div className="space-y-2">
                {priorityQueue.actionCounts.call_now > 0 && (
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                    <span className="text-sm">🔥 Call Now</span>
                    <span className="font-bold text-red-600">{priorityQueue.actionCounts.call_now}</span>
                  </div>
                )}
                {priorityQueue.actionCounts.call_today > 0 && (
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                    <span className="text-sm">📞 Call Today</span>
                    <span className="font-bold text-orange-600">{priorityQueue.actionCounts.call_today}</span>
                  </div>
                )}
                {priorityQueue.actionCounts.send_email > 0 && (
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm">📧 Send Email</span>
                    <span className="font-bold text-blue-600">{priorityQueue.actionCounts.send_email}</span>
                  </div>
                )}
                {priorityQueue.actionCounts.start_sequence > 0 && (
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm">🚀 Start Sequence</span>
                    <span className="font-bold text-gray-600">{priorityQueue.actionCounts.start_sequence}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/outreach/import"
                className="block p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                📥 Import Leads (CSV)
              </Link>
              <Link
                href="/dashboard/outreach/export"
                className="block p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                📤 Export for Instantly
              </Link>
              <Link
                href="/dashboard/sales/overview"
                className="block p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                📊 Sales Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
