'use client'

import { useEffect, useState } from 'react'
import type { Commission } from '@/types/sales'

function formatCurrency(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n) }

const statusColors = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-blue-100 text-blue-800', paid: 'bg-green-100 text-green-800', disputed: 'bg-red-100 text-red-800' }

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => { fetch('/api/sales/commissions').then(r => r.json()).then(d => { setCommissions(d.data || []); setLoading(false) }) }, [])

  async function handleAction(action: 'approve' | 'pay') {
    if (!selected.length) return alert('Select commissions first')
    await fetch('/api/sales/commissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commission_ids: selected, action }) })
    setSelected([])
    const res = await fetch('/api/sales/commissions')
    setCommissions((await res.json()).data || [])
  }

  const totals = commissions.reduce((a, c) => { a.total += c.commission_amount; a[c.status] = (a[c.status]||0) + c.commission_amount; return a }, { total: 0, pending: 0, approved: 0, paid: 0, disputed: 0 } as Record<string, number>)

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Commissions</h1><p className="text-gray-600">Track and manage sales commissions</p></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border"><p className="text-sm text-gray-600">Pending</p><p className="text-xl font-bold text-yellow-600">{formatCurrency(totals.pending||0)}</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-sm text-gray-600">Approved</p><p className="text-xl font-bold text-blue-600">{formatCurrency(totals.approved||0)}</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-sm text-gray-600">Paid</p><p className="text-xl font-bold text-green-600">{formatCurrency(totals.paid||0)}</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-sm text-gray-600">Total</p><p className="text-xl font-bold">{formatCurrency(totals.total)}</p></div>
      </div>

      {selected.length > 0 && (
        <div className="flex gap-2">
          <button onClick={() => handleAction('approve')} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Approve ({selected.length})</button>
          <button onClick={() => handleAction('pay')} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Mark Paid ({selected.length})</button>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="p-3 text-left"><input type="checkbox" checked={selected.length === commissions.length && commissions.length > 0} onChange={() => setSelected(selected.length === commissions.length ? [] : commissions.map(c => c.id))} /></th>
            <th className="p-3 text-left text-sm font-medium text-gray-600">Salesperson</th>
            <th className="p-3 text-left text-sm font-medium text-gray-600">Deal</th>
            <th className="p-3 text-right text-sm font-medium text-gray-600">Revenue</th>
            <th className="p-3 text-center text-sm font-medium text-gray-600">Rate</th>
            <th className="p-3 text-right text-sm font-medium text-gray-600">Commission</th>
            <th className="p-3 text-center text-sm font-medium text-gray-600">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {commissions.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-3"><input type="checkbox" checked={selected.includes(c.id)} onChange={() => setSelected(selected.includes(c.id) ? selected.filter(i => i !== c.id) : [...selected, c.id])} /></td>
                <td className="p-3 text-sm">{c.salesperson?.name || '-'}</td>
                <td className="p-3 text-sm">{c.deal?.deal_name || '-'} {c.is_new_business && <span className="ml-1 text-xs bg-green-100 text-green-700 px-1 rounded">New</span>}</td>
                <td className="p-3 text-sm text-right">{formatCurrency(c.revenue_amount)}</td>
                <td className="p-3 text-sm text-center">{(c.commission_rate * 100).toFixed(0)}%</td>
                <td className="p-3 text-right font-semibold text-teal-600">{formatCurrency(c.commission_amount)}</td>
                <td className="p-3 text-center"><span className={`text-xs px-2 py-1 rounded ${statusColors[c.status]}`}>{c.status}</span></td>
              </tr>
            ))}
            {commissions.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-gray-500">No commissions yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
