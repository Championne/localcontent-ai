'use client'

import { useState } from 'react'
import { usePhoneDialer } from './PhoneDialerProvider'
import { CALL_OUTCOME_LABELS, FEEDBACK_TYPE_LABELS, type CallOutcome, type FeedbackType } from '@/types/sales'

export function ActiveCallPanel() {
  const { activeCall, hangUp, toggleMute, saveOutcome } = usePhoneDialer()
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | ''>('')
  const [notes, setNotes] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('insight')
  const [feedbackTitle, setFeedbackTitle] = useState('')
  const [feedbackQuote, setFeedbackQuote] = useState('')

  if (!activeCall) return null

  const isCallActive = activeCall.status === 'connecting' || activeCall.status === 'in-progress' || activeCall.twilioCall !== null
  const isCallEnded = activeCall.status === 'completed' || activeCall.status === 'rejected'

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSaveOutcome = async () => {
    if (!selectedOutcome) return
    setIsSaving(true)
    try {
      await saveOutcome(selectedOutcome, notes, followUpDate || undefined)
      setSelectedOutcome('')
      setNotes('')
      setFollowUpDate('')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkip = () => {
    saveOutcome('no_answer', 'Skipped')
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className={`px-4 py-3 ${isCallActive ? 'bg-green-600' : 'bg-gray-600'} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isCallActive ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
            <div>
              <p className="font-medium">{activeCall.lead?.contact_name || activeCall.lead?.company_name || 'Unknown'}</p>
              <p className="text-sm opacity-80">{activeCall.lead?.company_name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-mono">{formatDuration(activeCall.duration)}</p>
            <p className="text-xs opacity-80 capitalize">{activeCall.status.replace('-', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Call Controls (during call) */}
      {isCallActive && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-colors ${
                activeCall.isMuted 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={activeCall.isMuted ? 'Unmute' : 'Mute'}
            >
              {activeCall.isMuted ? <MicOffIcon /> : <MicIcon />}
            </button>
            <button
              onClick={hangUp}
              className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              title="End Call"
            >
              <PhoneOffIcon />
            </button>
          </div>
        </div>
      )}

      {/* Outcome Form (after call) */}
      {isCallEnded && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Call Outcome
            </label>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value as CallOutcome)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select outcome...</option>
              {Object.entries(CALL_OUTCOME_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              placeholder="Add notes about the call..."
            />
          </div>

          {(selectedOutcome === 'callback_scheduled' || selectedOutcome === 'qualified') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Quick Feedback Button */}
          {!showFeedbackForm && (
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <span>💡</span> Log insight or feedback from this call
            </button>
          )}

          {/* Quick Feedback Form */}
          {showFeedbackForm && (
            <div className="p-3 bg-purple-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-800">Quick Feedback</span>
                <button 
                  onClick={() => setShowFeedbackForm(false)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  ✕
                </button>
              </div>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                className="w-full px-2 py-1.5 text-sm border border-purple-200 rounded-lg"
              >
                {Object.entries(FEEDBACK_TYPE_LABELS).map(([key, { label, emoji }]) => (
                  <option key={key} value={key}>{emoji} {label}</option>
                ))}
              </select>
              <input
                type="text"
                value={feedbackTitle}
                onChange={(e) => setFeedbackTitle(e.target.value)}
                placeholder="Brief summary..."
                className="w-full px-2 py-1.5 text-sm border border-purple-200 rounded-lg"
              />
              <input
                type="text"
                value={feedbackQuote}
                onChange={(e) => setFeedbackQuote(e.target.value)}
                placeholder="Client quote (optional)..."
                className="w-full px-2 py-1.5 text-sm border border-purple-200 rounded-lg italic"
              />
              <button
                onClick={async () => {
                  if (feedbackTitle) {
                    await fetch('/api/sales/feedback', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: feedbackType,
                        title: feedbackTitle,
                        client_quote: feedbackQuote || undefined,
                        client_name: activeCall?.lead?.contact_name,
                        client_company: activeCall?.lead?.company_name,
                        lead_id: activeCall?.lead?.id,
                        call_id: activeCall?.id,
                      })
                    })
                    setFeedbackTitle('')
                    setFeedbackQuote('')
                    setShowFeedbackForm(false)
                  }
                }}
                disabled={!feedbackTitle}
                className="w-full px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Save Feedback
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleSaveOutcome}
              disabled={!selectedOutcome || isSaving}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save & Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MicIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  )
}

function MicOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  )
}

function PhoneOffIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
    </svg>
  )
}
