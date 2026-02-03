'use client'

import { useState, useEffect } from 'react'
import { usePhoneDialer } from '@/components/sales/PhoneDialerProvider'
import { CallButton } from '@/components/sales/CallButton'
import { AICoachPanel } from '@/components/sales/AICoachPanel'
import { LiveTranscriptPanel } from '@/components/sales/LiveTranscriptPanel'
import { CallScriptPanel } from '@/components/sales/CallScriptPanel'
import { BattleCardsPanel } from '@/components/sales/BattleCardsPanel'
import { CallMetricsPanel } from '@/components/sales/CallMetricsPanel'
import { EmailComposer } from '@/components/sales/EmailComposer'
import type { Lead, DialerQueueItem } from '@/types/sales'

interface Briefing {
  lead_id: string
  lead_name: string
  company: string
  phone: string
  briefing: string
  context: {
    status: string
    priority: string
    industry: string
    location: string
    callCount: number
  }
}

export default function PowerDialerPage() {
  const { isReady, isConnecting, connect, activeCall, error: dialerError } = usePhoneDialer()
  const [queue, setQueue] = useState<DialerQueueItem[]>([])
  const [availableLeads, setAvailableLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [isAutoDialing, setIsAutoDialing] = useState(false)
  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [loadingBriefing, setLoadingBriefing] = useState(false)
  const [briefingError, setBriefingError] = useState<string | null>(null)
  const [emailLead, setEmailLead] = useState<Lead | null>(null)

  // Fetch queue and available leads
  useEffect(() => {
    Promise.all([
      fetch('/api/sales/dialer-queue').then(r => r.json()),
      fetch('/api/sales/leads?status=new,contacted,qualified&limit=100').then(r => r.json())
    ]).then(([queueData, leadsData]) => {
      setQueue(queueData.data || [])
      // Filter out leads already in queue
      const queueLeadIds = new Set((queueData.data || []).map((q: DialerQueueItem) => q.lead_id))
      const available = (leadsData.data || []).filter((l: Lead) => 
        !queueLeadIds.has(l.id) && l.contact_phone
      )
      setAvailableLeads(available)
    }).finally(() => setLoading(false))
  }, [])

  // Add selected leads to queue
  const addToQueue = async () => {
    if (selectedLeads.size === 0) return

    await fetch('/api/sales/dialer-queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_ids: Array.from(selectedLeads) })
    })

    // Refresh
    const queueData = await fetch('/api/sales/dialer-queue').then(r => r.json())
    setQueue(queueData.data || [])
    
    const queueLeadIds = new Set((queueData.data || []).map((q: DialerQueueItem) => q.lead_id))
    setAvailableLeads(prev => prev.filter(l => !queueLeadIds.has(l.id)))
    setSelectedLeads(new Set())
  }

  // Remove from queue
  const removeFromQueue = async (itemId: string) => {
    await fetch(`/api/sales/dialer-queue?item_id=${itemId}`, { method: 'DELETE' })
    setQueue(prev => prev.filter(q => q.id !== itemId))
  }

  // Clear queue
  const clearQueue = async () => {
    await fetch('/api/sales/dialer-queue?clear_all=true', { method: 'DELETE' })
    setQueue([])
  }

  // Current lead in queue (first pending)
  const currentQueueItem = queue.find(q => q.status === 'pending')

  // Load pre-call briefing
  const loadBriefing = async (leadId: string) => {
    setLoadingBriefing(true)
    setBriefing(null)
    setBriefingError(null)
    try {
      const res = await fetch('/api/sales/ai-coach/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId })
      })
      const data = await res.json()
      if (res.ok) {
        setBriefing(data)
      } else {
        setBriefingError(data.error || 'Failed to generate briefing')
      }
    } catch (error) {
      console.error('Failed to load briefing:', error)
      setBriefingError('Network error - please try again')
    } finally {
      setLoadingBriefing(false)
    }
  }

  // Auto-load briefing when current queue item changes
  useEffect(() => {
    if (currentQueueItem?.lead?.id && !activeCall) {
      loadBriefing(currentQueueItem.lead.id)
    } else if (!currentQueueItem) {
      setBriefing(null)
    }
  }, [currentQueueItem?.lead?.id, activeCall])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Power Dialer</h1>
          <p className="text-gray-500">Call through your lead list efficiently</p>
        </div>
        <div className="flex items-center gap-3">
          {!isReady && (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect Phone'}
            </button>
          )}
          {isReady && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Phone Ready
            </span>
          )}
        </div>
      </div>

      {dialerError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {dialerError}
        </div>
      )}

      {/* Pre-Call Briefing Panel */}
      {(briefing || loadingBriefing) && !activeCall && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h2 className="font-semibold text-gray-900">Pre-Call Briefing</h2>
                {briefing && (
                  <p className="text-sm text-gray-600">{briefing.company} • {briefing.context.industry || 'Unknown industry'}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setBriefing(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          {loadingBriefing ? (
            <div className="p-8 flex items-center justify-center">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                <span>Preparing your briefing...</span>
              </div>
            </div>
          ) : briefing ? (
            <div className="p-6">
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  briefing.context.priority === 'high' || briefing.context.priority === 'urgent'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {briefing.context.priority} priority
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                  {briefing.context.status}
                </span>
                {briefing.context.callCount > 0 && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                    {briefing.context.callCount} previous call{briefing.context.callCount > 1 ? 's' : ''}
                  </span>
                )}
                {briefing.context.location && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    📍 {briefing.context.location}
                  </span>
                )}
              </div>

              {/* Briefing Content */}
              <div className="prose prose-sm max-w-none prose-headings:text-base prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:mt-4 prose-headings:mb-2 prose-p:text-gray-700 prose-li:text-gray-700 prose-ul:my-1 prose-li:my-0">
                <div 
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: briefing.briefing
                      .replace(/## /g, '<h3 class="text-indigo-700 font-semibold mt-4 mb-2">')
                      .replace(/\n(?=##)/g, '</h3>\n')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n- /g, '<br/>• ')
                      .replace(/\n\n/g, '<br/><br/>')
                  }}
                />
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Ready to call {briefing.lead_name}?
                </p>
                {currentQueueItem?.lead && (
                  <CallButton 
                    lead={currentQueueItem.lead} 
                    size="lg"
                    variant="primary"
                  />
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Queue */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Call Queue ({queue.length})</h2>
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Current Call Target */}
          {currentQueueItem?.lead && (
            <div className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-100">
              <p className="text-xs font-medium text-teal-600 uppercase tracking-wide mb-2">Next Call</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentQueueItem.lead.contact_name || currentQueueItem.lead.company_name}
                  </p>
                  <p className="text-sm text-gray-600">{currentQueueItem.lead.company_name}</p>
                  <p className="text-sm text-gray-500 mt-1">{currentQueueItem.lead.contact_phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!briefing && !loadingBriefing && (
                    <button
                      onClick={() => loadBriefing(currentQueueItem.lead!.id)}
                      className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      📋 Prepare
                    </button>
                  )}
                  {loadingBriefing && (
                    <span className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                      Loading...
                    </span>
                  )}
                  {briefingError && (
                    <span className="px-3 py-2 text-sm text-red-600">
                      {briefingError}
                    </span>
                  )}
                  <CallButton 
                    lead={currentQueueItem.lead} 
                    size="lg"
                    variant="primary"
                  />
                  {currentQueueItem.lead.contact_email && (
                    <button
                      onClick={() => setEmailLead(currentQueueItem.lead!)}
                      className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Send Email"
                    >
                      📧
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Queue List */}
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {queue.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <PhoneIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Queue is empty</p>
                <p className="text-sm">Add leads from the list on the right</p>
              </div>
            ) : (
              queue.map((item, index) => (
                <div
                  key={item.id}
                  className={`px-6 py-3 flex items-center justify-between ${
                    index === 0 ? 'bg-teal-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {item.lead?.contact_name || item.lead?.company_name}
                      </p>
                      <p className="text-xs text-gray-500">{item.lead?.contact_phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromQueue(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Leads */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Available Leads ({availableLeads.length})</h2>
            {selectedLeads.size > 0 && (
              <button
                onClick={addToQueue}
                className="px-3 py-1.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700"
              >
                Add {selectedLeads.size} to Queue
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {availableLeads.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No leads available with phone numbers</p>
              </div>
            ) : (
              availableLeads.map(lead => (
                <label
                  key={lead.id}
                  className="px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedLeads.has(lead.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedLeads)
                      if (e.target.checked) {
                        newSelected.add(lead.id)
                      } else {
                        newSelected.delete(lead.id)
                      }
                      setSelectedLeads(newSelected)
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {lead.contact_name || lead.company_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{lead.company_name} • {lead.contact_phone}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    lead.priority === 'high' || lead.priority === 'urgent' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {lead.priority}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Call History */}
      <RecentCalls />

      {/* AI Coach Panel - appears during active calls */}
      <AICoachPanel />

      {/* Live Transcript Panel - real-time transcription during calls */}
      <LiveTranscriptPanel />

      {/* Call Script Panel - step-by-step guide during calls */}
      <CallScriptPanel />

      {/* Battle Cards Panel - objection handling reference */}
      <BattleCardsPanel />

      {/* Call Metrics Panel - talk ratio and scoring */}
      <CallMetricsPanel />

      {/* Email Composer Modal */}
      {emailLead && (
        <EmailComposer
          leadId={emailLead.id}
          leadName={emailLead.contact_name || emailLead.company_name}
          leadEmail={emailLead.contact_email!}
          companyName={emailLead.company_name}
          onClose={() => setEmailLead(null)}
        />
      )}
    </div>
  )
}

function RecentCalls() {
  const [calls, setCalls] = useState<Array<{
    id: string
    lead?: { company_name: string; contact_name?: string }
    duration_seconds: number
    outcome?: string
    initiated_at: string
    status: string
  }>>([])

  useEffect(() => {
    fetch('/api/sales/calls?limit=10')
      .then(r => r.json())
      .then(data => setCalls(data.data || []))
  }, [])

  if (calls.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Recent Calls</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {calls.map(call => (
          <div key={call.id} className="px-6 py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {call.lead?.contact_name || call.lead?.company_name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(call.initiated_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono text-gray-600">
                {Math.floor(call.duration_seconds / 60)}:{(call.duration_seconds % 60).toString().padStart(2, '0')}
              </p>
              <p className={`text-xs ${
                call.outcome === 'demo_booked' || call.outcome === 'qualified' 
                  ? 'text-green-600' 
                  : 'text-gray-500'
              }`}>
                {call.outcome?.replace('_', ' ') || call.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
