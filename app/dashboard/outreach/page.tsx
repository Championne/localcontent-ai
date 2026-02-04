'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Lead {
  id: string
  business_name: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  city: string | null
  state: string | null
  status: string
  google_rating: number | null
  google_reviews_count: number | null
  created_at: string
  last_contacted_at: string | null
  sales_lead_id: string | null
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

interface Stats {
  total_leads: number
  new_leads: number
  contacted: number
  replied: number
  interested: number
  converted: number
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<Stats>({
    total_leads: 0,
    new_leads: 0,
    contacted: 0,
    replied: 0,
    interested: 0,
    converted: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [selectedStatus, searchQuery])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch leads
      const params = new URLSearchParams()
      if (selectedStatus !== 'all') params.set('status', selectedStatus)
      if (searchQuery) params.set('search', searchQuery)
      params.set('limit', '20')

      const leadsRes = await fetch(`/api/outreach/leads?${params}`)
      const leadsData = await leadsRes.json()
      setLeads(leadsData.leads || [])

      // Calculate stats from all leads
      const allLeadsRes = await fetch('/api/outreach/leads?limit=1000')
      const allLeadsData = await allLeadsRes.json()
      const allLeads = allLeadsData.leads || []
      
      setStats({
        total_leads: allLeads.length,
        new_leads: allLeads.filter((l: Lead) => l.status === 'new').length,
        contacted: allLeads.filter((l: Lead) => l.status === 'contacted').length,
        replied: allLeads.filter((l: Lead) => l.status === 'replied').length,
        interested: allLeads.filter((l: Lead) => l.status === 'interested').length,
        converted: allLeads.filter((l: Lead) => l.status === 'converted').length,
      })

      // Fetch campaigns
      const campaignsRes = await fetch('/api/outreach/campaigns')
      const campaignsData = await campaignsRes.json()
      setCampaigns(campaignsData.campaigns || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outreach CRM</h1>
          <p className="text-gray-600">Manage leads and email campaigns</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/outreach/import"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Import Leads
          </Link>
          <Link
            href="/dashboard/outreach/campaigns/new"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            New Campaign
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
              <Link 
                href="/dashboard/outreach/leads"
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                View All →
              </Link>
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{lead.business_name}</div>
                        {lead.google_rating && (
                          <div className="text-xs text-gray-500">
                            ⭐ {lead.google_rating} ({lead.google_reviews_count} reviews)
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{lead.contact_name || '-'}</div>
                        <div className="text-xs text-gray-500">{lead.contact_email || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {lead.city}{lead.state ? `, ${lead.state}` : ''}
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

        {/* Campaigns Section - 1 column */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Campaigns</h2>
            <Link
              href="/dashboard/outreach/campaigns/new"
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              + New
            </Link>
          </div>
          
          <div className="p-4 space-y-3">
            {campaigns.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No campaigns yet</p>
                <Link
                  href="/dashboard/outreach/campaigns/new"
                  className="text-teal-600 hover:text-teal-700 text-sm"
                >
                  Create your first campaign →
                </Link>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/dashboard/outreach/campaigns/${campaign.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{campaign.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                      campaign.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{campaign.total_leads} leads</span>
                    <span>{campaign.emails_sent} sent</span>
                    <span>{campaign.emails_replied} replied</span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Quick Export */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Export</h3>
            <Link
              href="/dashboard/outreach/export"
              className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Export to Instantly.ai
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
