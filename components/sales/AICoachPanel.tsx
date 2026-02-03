'use client'

import { useState, useRef, useEffect } from 'react'
import { usePhoneDialer } from './PhoneDialerProvider'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AICoachPanel() {
  const { activeCall } = usePhoneDialer()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Quick prompts for common situations
  const quickPrompts = [
    { label: 'Objection help', prompt: 'They said it\'s too expensive, what should I say?' },
    { label: 'Pricing', prompt: 'What are our pricing tiers?' },
    { label: 'Close now', prompt: 'Give me a closing line to use right now' },
    { label: 'Handle silence', prompt: 'The prospect went quiet, what should I say?' },
  ]

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Reset messages when call changes
  useEffect(() => {
    if (activeCall?.id) {
      setMessages([])
    }
  }, [activeCall?.id])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/sales/ai-coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          lead_id: activeCall?.lead?.id,
          conversation_history: messages.slice(-6)
        })
      })

      const data = await response.json()
      
      if (data.reply) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('AI Coach error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I couldn\'t process that. Try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  // Only show when there's an active call
  if (!activeCall) return null

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 left-4 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50"
        title="Open AI Coach"
      >
        <SparklesIcon className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5" />
          <span className="font-medium">AI Coach</span>
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

      {/* Lead Context */}
      {activeCall.lead && (
        <div className="px-3 py-2 bg-purple-50 border-b border-purple-100 text-xs text-purple-700">
          Coaching for: <span className="font-medium">{activeCall.lead.company_name}</span>
          {activeCall.lead.business_type && (
            <span className="text-purple-500"> ({activeCall.lead.business_type})</span>
          )}
        </div>
      )}

      {/* Quick Prompts */}
      {messages.length === 0 && (
        <div className="p-3 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Quick help:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => sendMessage(qp.prompt)}
                disabled={isLoading}
                className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px]">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            Ask me anything during your call!
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for help..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )
}
