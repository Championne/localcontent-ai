'use client'

import { useState, useEffect } from 'react'

interface SummaryData {
  summary: string
  keyPoints: string[]
  customerSentiment: string
  objections: string[]
  nextSteps: string[]
  notesToAdd: string
  leadUpdated: boolean
}

interface PostCallSummaryProps {
  callId: string | null
  leadId: string | null
  transcript: string
  duration: number
  outcome: string
  onClose: () => void
}

export function PostCallSummary({ callId, leadId, transcript, duration, outcome, onClose }: PostCallSummaryProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    generateSummary()
  }, [])

  const generateSummary = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/sales/ai-coach/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_id: callId,
          lead_id: leadId,
          transcript,
          duration_seconds: duration,
          outcome
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      } else {
        setError('Failed to generate summary')
      }
    } catch (e) {
      setError('Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
      case 'interested':
        return 'bg-green-100 text-green-700'
      case 'negative':
      case 'skeptical':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600" />
          <span className="text-sm text-gray-600">Generating call summary...</span>
        </div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-sm text-red-600">{error || 'Unable to generate summary'}</p>
        <button
          onClick={generateSummary}
          className="mt-2 text-sm text-red-700 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-teal-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DocumentIcon className="w-5 h-5" />
          <span className="font-medium">Call Summary</span>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary */}
        <div>
          <p className="text-sm text-gray-700">{summary.summary}</p>
        </div>

        {/* Sentiment */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Customer sentiment:</span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getSentimentColor(summary.customerSentiment)}`}>
            {summary.customerSentiment}
          </span>
        </div>

        {/* Key Points */}
        {summary.keyPoints?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Key Points:</p>
            <ul className="space-y-1">
              {summary.keyPoints.map((point, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-teal-500">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Objections */}
        {summary.objections?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Objections Raised:</p>
            <div className="flex flex-wrap gap-1">
              {summary.objections.map((obj, i) => (
                <span key={i} className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                  {obj}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {summary.nextSteps?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Suggested Next Steps:</p>
            <ul className="space-y-1">
              {summary.nextSteps.map((step, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-blue-500">→</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lead Updated */}
        {summary.leadUpdated && (
          <div className="flex items-center gap-2 pt-2 border-t border-teal-100">
            <CheckIcon className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600">Lead notes automatically updated</span>
          </div>
        )}
      </div>
    </div>
  )
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}
