'use client'

import { useEffect, useState } from 'react'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

export default function SalesDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sales/stats').then(r => r.json()).then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>
  if (!stats) return <div className="text-center py-12 text-red-600">Failed to load stats</div>

  const { overview } = stats

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1><p className="text-gray-600">Overview of your sales performance</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-gray-600">Pipeline Value</p>
          <p className="text-2xl font-bold text-teal-600">{formatCurrency(overview.pipeline_value)}</p>
          <p className="text-xs text-gray-500">{overview.open_deals} open deals</p>
        </div>
        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-gray-600">Won This Month</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(overview.won_revenue_this_month)}</p>
          <p className="text-xs text-gray-500">{overview.won_deals_this_month} deals</p>
        </div>
        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-gray-600">Pending Commissions</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(overview.pending_commissions)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border">
          <p className="text-sm text-gray-600">Total Leads</p>
          <p className="text-2xl font-bold text-blue-600">{overview.total_leads}</p>
          <p className="text-xs text-gray-500">{overview.team_members} team members</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border flex items-center justify-between">
        <div><p className="text-lg font-semibold">Quick Actions</p><p className="text-sm text-gray-600">Get started with your sales workflow</p></div>
        <div className="flex gap-3">
          <a href="/dashboard/sales/team" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Add Team Member</a>
          <a href="/dashboard/sales/leads" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">Add Lead</a>
        </div>
      </div>
    </div>
  )
}
