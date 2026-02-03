'use client'

import { useEffect, useState } from 'react'
import { CallButton } from '@/components/sales/CallButton'
import type { Lead, CreateLead, LeadStatus, SalesTeamMember } from '@/types/sales'

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800', contacted: 'bg-yellow-100 text-yellow-800', qualified: 'bg-purple-100 text-purple-800',
  demo_scheduled: 'bg-indigo-100 text-indigo-800', demo_completed: 'bg-teal-100 text-teal-800', proposal_sent: 'bg-orange-100 text-orange-800',
  negotiation: 'bg-pink-100 text-pink-800', won: 'bg-green-100 text-green-800', lost: 'bg-red-100 text-red-800',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [team, setTeam] = useState<SalesTeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CreateLead>({ company_name: '', source: 'manual', priority: 'medium' })

  useEffect(() => {
    Promise.all([
      fetch('/api/sales/leads').then(r => r.json()),
      fetch('/api/sales/team?status=active').then(r => r.json())
    ]).then(([l, t]) => { setLeads(l.data || []); setTeam(t); setLoading(false) })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/sales/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowModal(false)
    setForm({ company_name: '', source: 'manual', priority: 'medium' })
    const res = await fetch('/api/sales/leads')
    setLeads((await res.json()).data || [])
  }

  async function updateStatus(id: string, status: LeadStatus) {
    await fetch(`/api/sales/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    const res = await fetch('/api/sales/leads')
    setLeads((await res.json()).data || [])
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Leads</h1><p className="text-gray-600">{leads.length} total leads</p></div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">+ Add Lead</button>
      </div>

      <div className="space-y-3">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-white p-4 rounded-xl border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold">{lead.company_name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[lead.status]}`}>{lead.status.replace('_', ' ')}</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  {lead.contact_name && <span>{lead.contact_name}</span>}
                  {lead.contact_phone && <span className="font-mono">{lead.contact_phone}</span>}
                  {lead.contact_email && <span>{lead.contact_email}</span>}
                  {lead.location && <span>{lead.location}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lead.contact_phone && <CallButton lead={lead} size="sm" variant="icon" />}
                <select className="text-xs border rounded px-2 py-1" value={lead.status} onChange={e => updateStatus(lead.id, e.target.value as LeadStatus)}>
                  {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
        {leads.length === 0 && <div className="text-center py-12 text-gray-500">No leads yet</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Lead</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Company *</label><input className="w-full border rounded-lg p-2" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Contact Name</label><input className="w-full border rounded-lg p-2" value={form.contact_name||''} onChange={e => setForm({...form, contact_name: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="w-full border rounded-lg p-2" value={form.contact_email||''} onChange={e => setForm({...form, contact_email: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Phone</label><input className="w-full border rounded-lg p-2" value={form.contact_phone||''} onChange={e => setForm({...form, contact_phone: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Location</label><input className="w-full border rounded-lg p-2" value={form.location||''} onChange={e => setForm({...form, location: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Business Type</label><select className="w-full border rounded-lg p-2" value={form.business_type||''} onChange={e => setForm({...form, business_type: e.target.value})}><option value="">Select...</option><option value="hvac">HVAC</option><option value="plumber">Plumber</option><option value="electrician">Electrician</option><option value="salon">Salon</option><option value="restaurant">Restaurant</option><option value="other">Other</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Assign To</label><select className="w-full border rounded-lg p-2" value={form.assigned_to||''} onChange={e => setForm({...form, assigned_to: e.target.value||undefined})}><option value="">Unassigned</option>{team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              </div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg">Add Lead</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
