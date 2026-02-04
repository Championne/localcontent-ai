'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stats {
  total_leads: number
  new_leads: number
  contacted: number
  in_progress: number
  won: number
  lost: number
  total_emails_sent: number
  total_emails_opened: number
  total_emails_replied: number
  total_calls_made: number
  total_calls_connected: number
  conversion_rate: string
  avg_days_to_convert: string | null
}

interface IndustryStats {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  total_leads: number
  new_leads: number
  active_leads: number
  won_leads: number
  conversion_rate: number
}

interface PipelineStage {
  stage: string
  count: number
  color: string
}

interface StaleLead {
  id: string
  company_name: string
  contact_name: string | null
  status: string
  last_contacted_at: string | null
}

export default function SalesOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [industryStats, setIndustryStats] = useState<IndustryStats[]>([])
  const [pipeline, setPipeline] = useState<PipelineStage[]>([])
  const [staleLeads, setStaleLeads] = useState<StaleLead[]>([])
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [selectedIndustry])

  async function fetchDashboard() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedIndustry) params.set('industry_id', selectedIndustry)
      
      const res = await fetch(`/api/sales/dashboard?${params}`)
      const data = await res.json()
      
      setStats(data.stats)
      setIndustryStats(data.industryStats || [])
      setPipeline(data.pipeline || [])
      setStaleLeads(data.staleLeads || [])
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPipeline = pipeline.reduce((sum, p) => sum + p.count, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Overview</h1>
          <p className="text-gray-600">Unified view of all sales channels</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Industries</option>
            {industryStats.map(ind => (
              <option key={ind.id} value={ind.id}>{ind.icon} {ind.name}</option>
            ))}
          </select>
          <Link
            href="/dashboard/outreach"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Outreach CRM
          </Link>
          <Link
            href="/dashboard/sales/leads"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            View All Leads
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading dashboard...</div>
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_leads || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.in_progress || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">Won</p>
              <p className="text-2xl font-bold text-green-600">{stats?.won || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.conversion_rate || 0}%</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">Emails Sent</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.total_emails_sent || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">Calls Made</p>
              <p className="text-2xl font-bold text-indigo-600">{stats?.total_calls_made || 0}</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Pipeline */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Pipeline</h2>
              
              {/* Visual pipeline bar */}
              <div className="h-8 rounded-lg overflow-hidden flex mb-4">
                {pipeline.filter(p => p.count > 0).map((stage, i) => (
                  <div
                    key={stage.stage}
                    style={{ 
                      width: `${(stage.count / totalPipeline) * 100}%`,
                      backgroundColor: stage.color
                    }}
                    className="flex items-center justify-center text-white text-xs font-medium"
                    title={`${stage.stage}: ${stage.count}`}
                  >
                    {stage.count > 0 && totalPipeline > 0 && (stage.count / totalPipeline) > 0.08 ? stage.count : ''}
                  </div>
                ))}
              </div>
              
              {/* Pipeline details */}
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {pipeline.map(stage => (
                  <div key={stage.stage} className="text-center">
                    <div 
                      className="w-3 h-3 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: stage.color }}
                    />
                    <p className="text-xs text-gray-500">{stage.stage}</p>
                    <p className="text-sm font-semibold">{stage.count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Channel Performance */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Email Performance</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Sent</span>
                    <span className="font-medium">{stats?.total_emails_sent || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Opened</span>
                    <span className="font-medium">{stats?.total_emails_opened || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full" 
                      style={{ width: stats?.total_emails_sent ? `${(stats.total_emails_opened / stats.total_emails_sent) * 100}%` : '0%' }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Replied</span>
                    <span className="font-medium">{stats?.total_emails_replied || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: stats?.total_emails_sent ? `${(stats.total_emails_replied / stats.total_emails_sent) * 100}%` : '0%' }} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Call Performance</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Calls Made</span>
                  <span className="font-semibold">{stats?.total_calls_made || 0}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Connected</span>
                  <span className="font-semibold text-green-600">{stats?.total_calls_connected || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Industry Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">By Industry</h2>
                <Link href="/dashboard/sales/industries" className="text-sm text-teal-600 hover:text-teal-700">
                  Manage →
                </Link>
              </div>
              <div className="space-y-3">
                {industryStats.slice(0, 8).map(ind => (
                  <Link
                    key={ind.id}
                    href={`/dashboard/sales/leads?industry=${ind.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{ind.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{ind.name}</p>
                        <p className="text-xs text-gray-500">{ind.total_leads} leads</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{ind.won_leads} won</p>
                      <p className="text-xs text-gray-500">{ind.conversion_rate || 0}% conv.</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Needs Attention */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">⚠️ Needs Attention</h2>
              <p className="text-sm text-gray-500 mb-4">Leads with no activity in 3+ days</p>
              
              {staleLeads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-3xl">🎉</span>
                  <p className="mt-2">All leads are being worked!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {staleLeads.map(lead => (
                    <Link
                      key={lead.id}
                      href={`/dashboard/sales/leads/${lead.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{lead.company_name}</p>
                        <p className="text-xs text-gray-500">{lead.contact_name || 'No contact'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs px-2 py-1 bg-orange-200 text-orange-800 rounded-full">
                          {lead.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {lead.last_contacted_at 
                            ? `Last: ${new Date(lead.last_contacted_at).toLocaleDateString()}`
                            : 'Never contacted'
                          }
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
