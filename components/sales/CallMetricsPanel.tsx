'use client'

import { useState, useEffect, useRef } from 'react'
import { usePhoneDialer } from './PhoneDialerProvider'

interface CallMetrics {
  talkTime: number // seconds agent is talking
  listenTime: number // seconds customer is talking (estimated)
  totalTime: number
  talkRatio: number // percentage 0-100
  longestMonologue: number // seconds
  questionsAsked: number
}

interface CallScore {
  category: string
  score: number // 1-5
  weight: number
}

const SCORING_CRITERIA: { id: string; label: string; description: string; weight: number }[] = [
  { id: 'opening', label: 'Opening', description: 'Did you introduce yourself and state purpose clearly?', weight: 1 },
  { id: 'discovery', label: 'Discovery', description: 'Did you ask good questions to understand their needs?', weight: 2 },
  { id: 'listening', label: 'Active Listening', description: 'Did you listen and respond to their concerns?', weight: 2 },
  { id: 'value', label: 'Value Proposition', description: 'Did you clearly communicate the benefits?', weight: 2 },
  { id: 'objections', label: 'Objection Handling', description: 'Did you address concerns effectively?', weight: 2 },
  { id: 'closing', label: 'Closing', description: 'Did you ask for the next step or commitment?', weight: 1 },
]

export function CallMetricsPanel() {
  const { activeCall } = usePhoneDialer()
  const [metrics, setMetrics] = useState<CallMetrics>({
    talkTime: 0,
    listenTime: 0,
    totalTime: 0,
    talkRatio: 50,
    longestMonologue: 0,
    questionsAsked: 0
  })
  const [scores, setScores] = useState<Record<string, number>>({})
  const [showScoring, setShowScoring] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  
  const isTalkingRef = useRef(false)
  const talkStartRef = useRef<number | null>(null)
  const currentMonologueRef = useRef(0)

  // Track talk time based on speech recognition
  useEffect(() => {
    if (!activeCall) {
      // Reset when call ends
      setMetrics({
        talkTime: 0,
        listenTime: 0,
        totalTime: 0,
        talkRatio: 50,
        longestMonologue: 0,
        questionsAsked: 0
      })
      return
    }

    // Simple timer to estimate listen time (total - talk)
    const interval = setInterval(() => {
      setMetrics(prev => {
        const newTotal = prev.totalTime + 1
        const newListenTime = Math.max(0, newTotal - prev.talkTime)
        const newRatio = newTotal > 0 ? Math.round((prev.talkTime / newTotal) * 100) : 50
        
        return {
          ...prev,
          totalTime: newTotal,
          listenTime: newListenTime,
          talkRatio: newRatio
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeCall])

  // Listen for speech recognition events (from LiveTranscriptPanel)
  useEffect(() => {
    const handleSpeechStart = () => {
      if (!isTalkingRef.current) {
        isTalkingRef.current = true
        talkStartRef.current = Date.now()
      }
    }

    const handleSpeechEnd = () => {
      if (isTalkingRef.current && talkStartRef.current) {
        const duration = (Date.now() - talkStartRef.current) / 1000
        isTalkingRef.current = false
        
        setMetrics(prev => ({
          ...prev,
          talkTime: prev.talkTime + duration,
          longestMonologue: Math.max(prev.longestMonologue, duration)
        }))
        
        talkStartRef.current = null
      }
    }

    // Custom events from speech recognition
    window.addEventListener('agent-speech-start', handleSpeechStart)
    window.addEventListener('agent-speech-end', handleSpeechEnd)

    return () => {
      window.removeEventListener('agent-speech-start', handleSpeechStart)
      window.removeEventListener('agent-speech-end', handleSpeechEnd)
    }
  }, [])

  const getRatioColor = (ratio: number) => {
    if (ratio >= 40 && ratio <= 60) return 'text-green-600'
    if (ratio >= 30 && ratio <= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRatioFeedback = (ratio: number) => {
    if (ratio < 30) return 'Great listening! Make sure to also share value.'
    if (ratio >= 30 && ratio < 40) return 'Good balance, slight listening focus.'
    if (ratio >= 40 && ratio <= 60) return 'Perfect balance! Keep it up.'
    if (ratio > 60 && ratio <= 70) return 'Talking a bit much. Ask more questions.'
    return 'Too much talking. Let them speak more.'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleScore = (criteriaId: string, score: number) => {
    setScores(prev => ({ ...prev, [criteriaId]: score }))
  }

  const getOverallScore = () => {
    let totalWeight = 0
    let weightedSum = 0
    
    SCORING_CRITERIA.forEach(criteria => {
      if (scores[criteria.id]) {
        weightedSum += scores[criteria.id] * criteria.weight
        totalWeight += criteria.weight
      }
    })
    
    return totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : '-'
  }

  const saveScores = async () => {
    if (!activeCall?.id) return
    
    try {
      await fetch(`/api/sales/calls/${activeCall.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_score: getOverallScore(),
          score_breakdown: scores,
          talk_ratio: metrics.talkRatio
        })
      })
      setShowScoring(false)
    } catch (e) {
      console.error('Failed to save scores:', e)
    }
  }

  if (!activeCall) return null

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed top-20 right-4 bg-white rounded-full shadow-lg border border-gray-200 p-2 z-30 flex items-center gap-2"
        title="Call Metrics"
      >
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke={metrics.talkRatio >= 40 && metrics.talkRatio <= 60 ? '#22c55e' : metrics.talkRatio >= 30 && metrics.talkRatio <= 70 ? '#eab308' : '#ef4444'}
              strokeWidth="4"
              strokeDasharray={`${(metrics.talkRatio / 100) * 100} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
            {metrics.talkRatio}%
          </span>
        </div>
      </button>
    )
  }

  return (
    <div className="fixed top-20 right-4 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-30">
      {/* Header */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Call Metrics</span>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-gray-400 hover:text-gray-600"
        >
          <MinimizeIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Talk-to-Listen Ratio */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Talk-to-Listen Ratio</span>
            <span className={`text-lg font-bold ${getRatioColor(metrics.talkRatio)}`}>
              {metrics.talkRatio}%
            </span>
          </div>
          
          {/* Ratio Bar */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
            <div 
              className="bg-blue-500 transition-all duration-300"
              style={{ width: `${metrics.talkRatio}%` }}
              title="You talking"
            />
            <div 
              className="bg-green-500 transition-all duration-300"
              style={{ width: `${100 - metrics.talkRatio}%` }}
              title="Customer talking"
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>You: {formatTime(metrics.talkTime)}</span>
            <span>Them: {formatTime(metrics.listenTime)}</span>
          </div>
          
          <p className={`text-xs mt-2 ${getRatioColor(metrics.talkRatio)}`}>
            {getRatioFeedback(metrics.talkRatio)}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-gray-900">{formatTime(metrics.totalTime)}</p>
            <p className="text-xs text-gray-500">Total Time</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-gray-900">{formatTime(metrics.longestMonologue)}</p>
            <p className="text-xs text-gray-500">Longest Talk</p>
          </div>
        </div>

        {/* Call Scoring Button */}
        {!showScoring ? (
          <button
            onClick={() => setShowScoring(true)}
            className="w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            📊 Score This Call
          </button>
        ) : (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-700">Rate your performance:</p>
            
            {SCORING_CRITERIA.map(criteria => (
              <div key={criteria.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700">{criteria.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        onClick={() => handleScore(criteria.id, score)}
                        className={`w-6 h-6 text-xs rounded ${
                          scores[criteria.id] === score
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400">{criteria.description}</p>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium">
                Overall: <span className="text-blue-600">{getOverallScore()}/5</span>
              </span>
              <button
                onClick={saveScores}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save Score
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MinimizeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}
