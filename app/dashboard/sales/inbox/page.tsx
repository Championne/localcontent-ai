'use client'

import { useState, useEffect } from 'react'
import { EmailComposer } from '@/components/sales/EmailComposer'

interface Email {
  id: string
  direction: 'inbound' | 'outbound'
  from_email: string
  from_name: string | null
  to_email: string
  subject: string
  body_text: string | null
  body_html: string | null
  status: 'unread' | 'read' | 'replied' | 'archived'
  is_starred: boolean
  inbox_type: 'lead' | 'shared' | 'archived'
  created_at: string
  lead?: {
    id: string
    company_name: string
    contact_name: string | null
    contact_email: string | null
  } | null
  assigned_member?: {
    id: string
    name: string
    email: string
  } | null
}

interface UnreadCounts {
  my: number
  shared: number
  total: number
}

interface Lead {
  id: string
  company_name: string
  contact_name: string | null
  contact_email: string | null
}

export default function SalesInboxPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my')
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({ my: 0, shared: 0, total: 0 })
  const [showComposer, setShowComposer] = useState(false)
  const [replyTo, setReplyTo] = useState<Email | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [leadSearch, setLeadSearch] = useState('')
  const [loadingLeads, setLoadingLeads] = useState(false)

  useEffect(() => {
    fetchEmails()
  }, [activeTab])

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/sales/inbox?type=${activeTab}`)
      const data = await res.json()
      setEmails(data.data || [])
      setUnreadCounts(data.unread || { my: 0, shared: 0, total: 0 })
    } catch (e) {
      console.error('Failed to fetch emails:', e)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (emailId: string) => {
    await fetch('/api/sales/inbox', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_ids: [emailId], action: 'read' })
    })
    setEmails(prev => prev.map(e => 
      e.id === emailId ? { ...e, status: 'read' } : e
    ))
  }

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email)
    if (email.status === 'unread') {
      markAsRead(email.id)
    }
  }

  const handleReply = () => {
    if (selectedEmail) {
      setReplyTo(selectedEmail)
      setShowComposer(true)
    }
  }

  const handleArchive = async () => {
    if (!selectedEmail) return
    await fetch('/api/sales/inbox', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_ids: [selectedEmail.id], action: 'archive' })
    })
    setSelectedEmail(null)
    fetchEmails()
  }

  const fetchLeads = async () => {
    setLoadingLeads(true)
    try {
      const res = await fetch('/api/sales/leads?limit=100')
      const data = await res.json()
      // Filter leads with email addresses
      const leadsWithEmail = (data.data || []).filter((l: Lead) => l.contact_email)
      setLeads(leadsWithEmail)
    } catch (e) {
      console.error('Failed to fetch leads:', e)
    } finally {
      setLoadingLeads(false)
    }
  }

  const handleOpenComposer = () => {
    setShowComposer(true)
    setSelectedLead(null)
    setLeadSearch('')
    fetchLeads()
  }

  const filteredLeads = leads.filter(lead => 
    lead.company_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
    (lead.contact_name?.toLowerCase() || '').includes(leadSearch.toLowerCase()) ||
    (lead.contact_email?.toLowerCase() || '').includes(leadSearch.toLowerCase())
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-500">Manage all your email communications</p>
        </div>
        <button
          onClick={handleOpenComposer}
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700"
        >
          ✉️ Compose
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
            activeTab === 'my' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Inbox
          {unreadCounts.my > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-teal-100 text-teal-700 rounded-full">
              {unreadCounts.my}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('shared')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
            activeTab === 'shared' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Shared Inbox
          {unreadCounts.shared > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
              {unreadCounts.shared}
            </span>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Email List */}
        <div className="w-96 border-r border-gray-200 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600" />
              </div>
            ) : emails.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p>No emails in this inbox</p>
              </div>
            ) : (
              emails.map(email => (
                <div
                  key={email.id}
                  onClick={() => handleEmailClick(email)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    selectedEmail?.id === email.id 
                      ? 'bg-teal-50 border-l-2 border-l-teal-500' 
                      : 'hover:bg-gray-50'
                  } ${email.status === 'unread' ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {email.status === 'unread' && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                        {email.is_starred && (
                          <span className="text-amber-500">⭐</span>
                        )}
                        <span className={`text-sm truncate ${
                          email.status === 'unread' ? 'font-semibold text-gray-900' : 'text-gray-700'
                        }`}>
                          {email.direction === 'inbound' 
                            ? (email.from_name || email.from_email)
                            : `To: ${email.lead?.contact_name || email.to_email}`
                          }
                        </span>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${
                        email.status === 'unread' ? 'font-medium text-gray-900' : 'text-gray-600'
                      }`}>
                        {email.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {email.body_text?.slice(0, 80)}...
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {formatDate(email.created_at)}
                      </span>
                      {email.direction === 'inbound' && (
                        <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                          IN
                        </span>
                      )}
                      {email.direction === 'outbound' && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                          OUT
                        </span>
                      )}
                    </div>
                  </div>
                  {email.lead && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">🏢</span>
                      {email.lead.company_name}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Email Detail */}
        <div className="flex-1 flex flex-col">
          {selectedEmail ? (
            <>
              {/* Email Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedEmail.subject}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <span className="font-medium">
                        {selectedEmail.direction === 'inbound' ? 'From:' : 'To:'}
                      </span>
                      <span>
                        {selectedEmail.direction === 'inbound'
                          ? `${selectedEmail.from_name || ''} <${selectedEmail.from_email}>`
                          : selectedEmail.to_email
                        }
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(selectedEmail.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedEmail.direction === 'inbound' && (
                      <button
                        onClick={handleReply}
                        className="px-3 py-1.5 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100"
                      >
                        ↩️ Reply
                      </button>
                    )}
                    <button
                      onClick={handleArchive}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      📥 Archive
                    </button>
                  </div>
                </div>

                {/* Lead info if linked */}
                {selectedEmail.lead && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedEmail.lead.company_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedEmail.lead.contact_name} • {selectedEmail.lead.contact_email}
                      </p>
                    </div>
                    <a
                      href={`/dashboard/sales/leads/${selectedEmail.lead.id}`}
                      className="text-sm text-teal-600 hover:text-teal-700"
                    >
                      View Lead →
                    </a>
                  </div>
                )}
              </div>

              {/* Email Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                {selectedEmail.body_html ? (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                    {selectedEmail.body_text}
                  </pre>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-5xl mb-4">📧</div>
                <p>Select an email to view</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose/Reply Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {replyTo ? `Reply to: ${replyTo.subject}` : selectedLead ? `Email to ${selectedLead.contact_name || selectedLead.company_name}` : 'New Email'}
              </h2>
              <button 
                onClick={() => { setShowComposer(false); setReplyTo(null); setSelectedLead(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {/* Reply to existing email */}
              {replyTo && replyTo.lead ? (
                <EmailComposer
                  leadId={replyTo.lead.id}
                  leadName={replyTo.lead.contact_name || replyTo.lead.company_name}
                  leadEmail={replyTo.from_email}
                  companyName={replyTo.lead.company_name}
                  onClose={() => { setShowComposer(false); setReplyTo(null); }}
                  onSent={() => {
                    setShowComposer(false)
                    setReplyTo(null)
                    fetchEmails()
                  }}
                />
              ) : selectedLead ? (
                /* Compose to selected lead */
                <EmailComposer
                  leadId={selectedLead.id}
                  leadName={selectedLead.contact_name || selectedLead.company_name}
                  leadEmail={selectedLead.contact_email!}
                  companyName={selectedLead.company_name}
                  onClose={() => { setShowComposer(false); setSelectedLead(null); }}
                  onSent={() => {
                    setShowComposer(false)
                    setSelectedLead(null)
                    fetchEmails()
                  }}
                />
              ) : (
                /* Lead selector */
                <div>
                  <p className="text-sm text-gray-600 mb-4">Select a lead to send an email to:</p>
                  
                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search leads by name, company, or email..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />

                  {/* Lead list */}
                  {loadingLeads ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600" />
                    </div>
                  ) : filteredLeads.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No leads with email addresses found.</p>
                      <a 
                        href="/dashboard/sales/leads"
                        className="text-teal-600 hover:underline text-sm mt-2 inline-block"
                      >
                        Go to Leads →
                      </a>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                      {filteredLeads.map(lead => (
                        <button
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <p className="font-medium text-gray-900">
                            {lead.contact_name || lead.company_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {lead.company_name} • {lead.contact_email}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setShowComposer(false)}
                      className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
