'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePhoneDialer } from './PhoneDialerProvider'

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface TranscriptEntry {
  id: string
  speaker: 'agent' | 'customer'
  text: string
  timestamp: Date
}

interface AISuggestion {
  type: 'response' | 'warning' | 'opportunity'
  text: string
  timestamp: Date
}

export function LiveTranscriptPanel() {
  const { activeCall } = usePhoneDialer()
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [lastAnalyzedLength, setLastAnalyzedLength] = useState(0)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.log('Speech Recognition not supported')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1]
      const text = lastResult[0].transcript

      if (lastResult.isFinal && text.trim()) {
        setTranscript(prev => [...prev, {
          id: `agent-${Date.now()}`,
          speaker: 'agent',
          text: text.trim(),
          timestamp: new Date()
        }])
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      if (event.error !== 'no-speech') {
        setIsListening(false)
      }
    }

    recognition.onend = () => {
      // Auto-restart if still in call
      if (activeCall && isListening) {
        try {
          recognition.start()
        } catch (e) {
          // Already started
        }
      }
    }

    recognitionRef.current = recognition
    
    return () => {
      recognition.stop()
    }
  }, [activeCall, isListening])

  // Start/stop listening based on active call
  useEffect(() => {
    if (activeCall && !isListening) {
      startListening()
    } else if (!activeCall && isListening) {
      stopListening()
      // Clear transcript when call ends
      setTranscript([])
      setSuggestions([])
      setLastAnalyzedLength(0)
    }
  }, [activeCall])

  // Scroll to bottom when new entries
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript, suggestions])

  // Analyze transcript periodically and generate suggestions
  useEffect(() => {
    if (transcript.length <= lastAnalyzedLength || transcript.length < 2) return

    const analyzeDebounce = setTimeout(async () => {
      await analyzeTranscript()
      setLastAnalyzedLength(transcript.length)
    }, 3000) // Analyze every 3 seconds of new content

    return () => clearTimeout(analyzeDebounce)
  }, [transcript, lastAnalyzedLength])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        console.error('Failed to start listening:', e)
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [])

  const analyzeTranscript = async () => {
    if (transcript.length < 2) return

    const recentTranscript = transcript.slice(-6).map(t => 
      `${t.speaker === 'agent' ? 'You' : 'Customer'}: ${t.text}`
    ).join('\n')

    try {
      const response = await fetch('/api/sales/ai-coach/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: recentTranscript,
          lead_id: activeCall?.lead?.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.suggestion) {
          setSuggestions(prev => [...prev.slice(-4), {
            type: data.type || 'response',
            text: data.suggestion,
            timestamp: new Date()
          }])
        }
      }
    } catch (error) {
      console.error('Failed to analyze transcript:', error)
    }
  }

  // Simulate customer input (user can type what they hear)
  const addCustomerText = (text: string) => {
    if (text.trim()) {
      setTranscript(prev => [...prev, {
        id: `customer-${Date.now()}`,
        speaker: 'customer',
        text: text.trim(),
        timestamp: new Date()
      }])
    }
  }

  if (!activeCall) return null

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed top-4 right-4 p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors z-50 flex items-center gap-2"
        title="Open Live Transcript"
      >
        <MicIcon className="w-5 h-5" />
        {isListening && <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />}
      </button>
    )
  }

  return (
    <div className="fixed top-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-40 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MicIcon className="w-5 h-5" />
          <span className="font-medium">Live Transcript</span>
          {isListening && (
            <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Listening
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Minimize"
          >
            <MinimizeIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instructions */}
      {transcript.length === 0 && (
        <div className="p-4 bg-green-50 text-sm text-green-700 border-b border-green-100">
          <p className="font-medium mb-1">🎤 Speak naturally</p>
          <p className="text-xs text-green-600">Your speech is transcribed automatically. Type customer responses below for AI suggestions.</p>
        </div>
      )}

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[150px] max-h-[250px]">
        {transcript.map((entry) => (
          <div
            key={entry.id}
            className={`flex ${entry.speaker === 'agent' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                entry.speaker === 'agent'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-xs opacity-70 mb-0.5">
                {entry.speaker === 'agent' ? 'You' : 'Customer'}
              </p>
              <p>{entry.text}</p>
            </div>
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-t border-gray-100 bg-amber-50 p-3 max-h-[150px] overflow-y-auto">
          <p className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1">
            <SparklesIcon className="w-4 h-4" />
            AI Suggestions
          </p>
          <div className="space-y-2">
            {suggestions.slice(-2).map((suggestion, i) => (
              <div
                key={i}
                className={`text-sm p-2 rounded-lg ${
                  suggestion.type === 'warning' 
                    ? 'bg-red-100 text-red-800 border-l-2 border-red-400'
                    : suggestion.type === 'opportunity'
                    ? 'bg-green-100 text-green-800 border-l-2 border-green-400'
                    : 'bg-white text-gray-800 border-l-2 border-amber-400'
                }`}
              >
                {suggestion.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Input */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.target as HTMLFormElement
            const input = form.elements.namedItem('customerInput') as HTMLInputElement
            addCustomerText(input.value)
            input.value = ''
          }}
          className="flex gap-2"
        >
          <input
            name="customerInput"
            type="text"
            placeholder="Type what customer says..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Add
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-1">
          Type key phrases you hear from the customer for better AI suggestions
        </p>
      </div>
    </div>
  )
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  )
}

function MinimizeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
