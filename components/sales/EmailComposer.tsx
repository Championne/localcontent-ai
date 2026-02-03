'use client'

import { useState, useEffect } from 'react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  category: string
  variables: string[]
}

interface EmailComposerProps {
  leadId: string
  leadName: string
  leadEmail: string
  companyName: string
  onClose: () => void
  onSent?: () => void
  defaultTemplate?: string
  defaultVariables?: Record<string, string>
}

export function EmailComposer({
  leadId,
  leadName,
  leadEmail,
  companyName,
  onClose,
  onSent,
  defaultTemplate,
  defaultVariables = {}
}: EmailComposerProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>(defaultTemplate || '')
  const [customSubject, setCustomSubject] = useState('')
  const [customBody, setCustomBody] = useState('')
  const [variables, setVariables] = useState<Record<string, string>>(defaultVariables)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Fetch available templates
    fetch('/api/sales/email?category=follow-up')
      .then(r => r.json())
      .then(data => setTemplates(data.templates || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)

  const handleSend = async () => {
    setSending(true)
    setError(null)

    try {
      const payload: any = { lead_id: leadId }

      if (selectedTemplate && selectedTemplate !== 'custom') {
        payload.template_id = selectedTemplate
        payload.variables = {
          ...variables,
          contact_name: leadName,
          company_name: companyName
        }
      } else {
        if (!customSubject || !customBody) {
          throw new Error('Subject and message are required')
        }
        payload.custom_subject = customSubject
        payload.custom_body = customBody
      }

      const res = await fetch('/api/sales/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      setSuccess(true)
      onSent?.()
      
      // Close after showing success
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-gray-900">Email Sent!</h2>
          <p className="text-gray-500 mt-2">Your email to {leadName} has been sent successfully.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Send Email</h2>
            <p className="text-sm text-gray-500">To: {leadName} ({leadEmail})</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Template Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="custom">Write custom email</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Template Variables */}
          {selectedTemplate && selectedTemplate !== 'custom' && selectedTemplateData && (
            <div className="mb-4 space-y-3">
              <p className="text-sm text-gray-500">
                Fill in the template variables:
              </p>
              {selectedTemplateData.variables
                .filter(v => !['contact_name', 'company_name', 'rep_name', 'calendar_link'].includes(v))
                .map(variable => (
                  <div key={variable}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {variable.replace(/_/g, ' ')}
                    </label>
                    {variable.includes('points') || variable.includes('steps') || variable === 'body' ? (
                      <textarea
                        value={variables[variable] || ''}
                        onChange={(e) => setVariables(prev => ({ ...prev, [variable]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        rows={3}
                        placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                      />
                    ) : (
                      <input
                        type={variable.includes('link') ? 'url' : 'text'}
                        value={variables[variable] || ''}
                        onChange={(e) => setVariables(prev => ({ ...prev, [variable]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder={variable.includes('link') ? 'https://...' : `Enter ${variable.replace(/_/g, ' ')}`}
                      />
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Custom Email */}
          {(!selectedTemplate || selectedTemplate === 'custom') && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Email subject..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  rows={8}
                  placeholder="Write your message here..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  The email will automatically include your signature.
                </p>
              </div>
            </>
          )}

          {/* Quick Templates */}
          {(!selectedTemplate || selectedTemplate === 'custom') && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Quick templates:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomSubject(`Great speaking with you, ${leadName}!`)
                    setCustomBody(`Thank you for taking the time to chat with me today.\n\nAs discussed, GeoSpark can help ${companyName} save 10+ hours per month on social media content creation.\n\nWould you be available for a quick demo this week? I'd love to show you how it works for businesses like yours.`)
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                >
                  Follow-up after call
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomSubject(`Missed you earlier, ${leadName}`)
                    setCustomBody(`I tried calling you today but wasn't able to reach you.\n\nI wanted to briefly discuss how GeoSpark can help ${companyName} with your social media presence.\n\nWould you have 10 minutes this week for a quick call?`)
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                >
                  No answer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomSubject(`Your demo is confirmed!`)
                    setCustomBody(`Great news! I've scheduled your GeoSpark demo.\n\nDuring the call, I'll show you:\n• How to generate AI-powered content for ${companyName}\n• Platform-specific formatting for all social channels\n• Time-saving automation features\n\nLooking forward to it!`)
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                >
                  Demo confirmation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Email will be sent from noreply@geospark.app
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Sending...
                </>
              ) : (
                <>📧 Send Email</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
