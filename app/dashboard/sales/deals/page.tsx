'use client'

import { useEffect, useState } from 'react'
import type { Deal, CreateDeal, DealStage, SalesTeamMember, Lead } from '@/types/sales'
import { PLAN_PRICING, DEAL_STAGE_ORDER } from '@/types/sales'

const stageLabels: Record<DealStage, string> = {
  qualification: 'Qualification', discovery: 'Discovery', demo: 'Demo', proposal: 'Proposal',
  negotiation: 'Negotiation', closed_won: 'Closed Won', closed_lost: 'Closed Lost',
}

function formatCurrency(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n) }

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [team, setTeam] = useState<SalesTeamMember[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CreateDeal>({ deal_name: '', salesperson_id: '', plan: 'starter', mrr_value: 29 })

  useEffect(() => {
    Promise.all([
      fetch('/api/sales/deals').then(r => r.json()),
      fetch('/api/sales/team?status=active').then(r => r.json()),
      fetch('/api/sales/leads').then(r => r.json())
    ]).then(([d, t, l]) => { setDeals(d.data || []); setTeam(t); setLeads(l.data || []); setLoading(false) })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/sales/deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowModal(false)
    setForm({ deal_name: '', salesperson_id: '', plan: 'starter', mrr_value: 29 })
    const res = await fetch('/api/sales/deals')
    setDeals((await res.json()).data || [])
  }

  async function updateStage(id: string, stage: DealStage) {
    await fetch(`/api/sales/deals/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage }) })
    const res = await fetch('/api/sales/deals')
    setDeals((await res.json()).data || [])
  }

  const dealsByStage = DEAL_STAGE_ORDER.reduce((acc, s) => { acc[s] = deals.filter(d => d.stage === s); return acc }, {} as Record<DealStage, Deal[]>)
  const pipelineValue = deals.filter(d => !['closed_won','closed_lost'].includes(d.stage)).reduce((s,d) => s + d.mrr_value, 0)

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Sales Pipeline</h1><p className="text-gray-600">{formatCurrency(pipelineValue)} in pipeline</p></div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">+ Add Deal</button>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {DEAL_STAGE_ORDER.filter(s => !['closed_won','closed_lost'].includes(s)).map(stage => (
            <div key={stage} className="w-72 flex-shrink-0">
              <div className="rounded-t-lg p-3 bg-gray-100 border-t border-l border-r">
                <div className="flex justify-between"><h3 className="font-semibold">{stageLabels[stage]}</h3><span className="text-sm text-gray-600">{dealsByStage[stage].length}</span></div>
                <p className="text-sm font-medium text-teal-600">{formatCurrency(dealsByStage[stage].reduce((s,d) => s + d.mrr_value, 0))}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-b-lg border min-h-[300px] space-y-2">
                {dealsByStage[stage].map(deal => (
                  <div key={deal.id} className="bg-white p-3 rounded-lg border hover:shadow-md cursor-pointer">
                    <h4 className="font-medium text-sm mb-1">{deal.deal_name}</h4>
                    <div className="flex justify-between text-xs text-gray-500"><span className="capitalize">{deal.plan}</span><span className="font-semibold text-teal-600">{formatCurrency(deal.mrr_value)}/mo</span></div>
                    {deal.salesperson && <p className="text-xs text-gray-400 mt-1">{deal.salesperson.name}</p>}
                  </div>
                ))}
                {dealsByStage[stage].length === 0 && <p className="text-center text-gray-400 text-sm py-8">No deals</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border-green-200 border p-4 rounded-xl"><h3 className="font-semibold text-green-800">Closed Won</h3><p className="text-2xl font-bold text-green-600">{formatCurrency(dealsByStage.closed_won.reduce((s,d)=>s+d.mrr_value,0))}</p><p className="text-sm text-green-600">{dealsByStage.closed_won.length} deals</p></div>
        <div className="bg-red-50 border-red-200 border p-4 rounded-xl"><h3 className="font-semibold text-red-800">Closed Lost</h3><p className="text-2xl font-bold text-red-600">{formatCurrency(dealsByStage.closed_lost.reduce((s,d)=>s+d.mrr_value,0))}</p><p className="text-sm text-red-600">{dealsByStage.closed_lost.length} deals</p></div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Deal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Deal Name *</label><input className="w-full border rounded-lg p-2" value={form.deal_name} onChange={e => setForm({...form, deal_name: e.target.value})} required /></div>
              <div><label className="block text-sm font-medium mb-1">Salesperson *</label><select className="w-full border rounded-lg p-2" value={form.salesperson_id} onChange={e => setForm({...form, salesperson_id: e.target.value})} required><option value="">Select...</option>{team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Plan</label><select className="w-full border rounded-lg p-2" value={form.plan} onChange={e => { const p = e.target.value as keyof typeof PLAN_PRICING; setForm({...form, plan: p, mrr_value: PLAN_PRICING[p].monthly}) }}><option value="starter">Starter ($29)</option><option value="growth">Growth ($49)</option><option value="pro">Pro ($79)</option><option value="premium">Premium ($179)</option><option value="enterprise">Enterprise ($499)</option></select></div>
                <div><label className="block text-sm font-medium mb-1">MRR Value</label><input type="number" className="w-full border rounded-lg p-2" value={form.mrr_value} onChange={e => setForm({...form, mrr_value: parseFloat(e.target.value)||0})} /></div>
              </div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg">Add Deal</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
