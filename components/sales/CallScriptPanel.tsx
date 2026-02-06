'use client'

import { useState, useEffect } from 'react'
import { usePhoneDialer } from './PhoneDialerProvider'

interface ScriptSection {
  id: string
  title: string
  icon: string
  items: {
    id: string
    text: string
    type: 'say' | 'ask' | 'do' | 'tip'
    checked: boolean
  }[]
  expanded: boolean
}

const DEFAULT_SCRIPT: ScriptSection[] = [
  {
    id: 'opening',
    title: 'Opening',
    icon: '👋',
    expanded: true,
    items: [
      { id: 'o1', text: 'Hi [Name], this is [Your Name] from GeoSpark. How are you today?', type: 'say', checked: false },
      { id: 'o2', text: 'I noticed [Company] and wanted to share how we help [industry] businesses grow their online presence.', type: 'say', checked: false },
      { id: 'o3', text: 'Do you have 2 minutes to chat about your social media?', type: 'ask', checked: false },
    ]
  },
  {
    id: 'discovery',
    title: 'Discovery Questions',
    icon: '🔍',
    expanded: false,
    items: [
      { id: 'd1', text: 'How are you currently handling your social media marketing?', type: 'ask', checked: false },
      { id: 'd2', text: 'How much time do you spend on social media each week?', type: 'ask', checked: false },
      { id: 'd3', text: 'What\'s been your biggest challenge with social media?', type: 'ask', checked: false },
      { id: 'd4', text: 'Where do most of your new customers find you?', type: 'ask', checked: false },
      { id: 'd5', text: 'Listen for pain points: time, consistency, content ideas, results', type: 'tip', checked: false },
    ]
  },
  {
    id: 'pitch',
    title: 'Value Proposition',
    icon: '💡',
    expanded: false,
    items: [
      { id: 'p1', text: 'GeoSpark uses AI to write and schedule social media posts for you automatically.', type: 'say', checked: false },
      { id: 'p2', text: 'It takes just 5 minutes a week - you review posts and click approve.', type: 'say', checked: false },
      { id: 'p3', text: 'We create content specific to your business and local area.', type: 'say', checked: false },
      { id: 'p4', text: 'Our customers see 20-40% more inquiries after consistent posting.', type: 'say', checked: false },
      { id: 'p5', text: 'Match benefits to their specific pain points from discovery', type: 'tip', checked: false },
    ]
  },
  {
    id: 'pricing',
    title: 'Pricing & Plans',
    icon: '💰',
    expanded: false,
    items: [
      { id: 'pr1', text: 'Starter: $29/month - 30 content pieces, 1 business', type: 'say', checked: false },
      { id: 'pr2', text: 'Pro: $79/month - 100 content pieces, 3 businesses (most popular)', type: 'say', checked: false },
      { id: 'pr3', text: 'Premium: $199/month - Unlimited content, 10 businesses', type: 'say', checked: false },
      { id: 'pr4', text: 'Based on what you told me, [Plan] would be perfect because...', type: 'say', checked: false },
      { id: 'pr5', text: 'Start with value, then price. Never lead with pricing.', type: 'tip', checked: false },
    ]
  },
  {
    id: 'objections',
    title: 'Handle Objections',
    icon: '🛡️',
    expanded: false,
    items: [
      { id: 'obj1', text: 'See Battle Cards for detailed objection responses →', type: 'tip', checked: false },
      { id: 'obj2', text: '"I understand. What specifically concerns you about [objection]?"', type: 'say', checked: false },
      { id: 'obj3', text: 'Acknowledge → Clarify → Respond → Confirm', type: 'tip', checked: false },
    ]
  },
  {
    id: 'close',
    title: 'Close',
    icon: '🎯',
    expanded: false,
    items: [
      { id: 'c1', text: 'Based on our conversation, I think [Plan] would work great. Should we get you started today?', type: 'say', checked: false },
      { id: 'c2', text: 'I can set up a quick demo right now - takes 10 minutes. Want to see what your posts would look like?', type: 'ask', checked: false },
      { id: 'c3', text: 'We have a 30-day money-back guarantee, so there\'s no risk to try it.', type: 'say', checked: false },
      { id: 'c4', text: 'What would need to happen for you to give this a try?', type: 'ask', checked: false },
      { id: 'c5', text: 'If not closing: Schedule follow-up, send info, set clear next step', type: 'do', checked: false },
    ]
  },
]

export function CallScriptPanel() {
  const { activeCall } = usePhoneDialer()
  const [script, setScript] = useState<ScriptSection[]>(DEFAULT_SCRIPT)
  const [isMinimized, setIsMinimized] = useState(false)

  // Reset script when new call starts
  useEffect(() => {
    if (activeCall?.id) {
      setScript(DEFAULT_SCRIPT.map(s => ({
        ...s,
        expanded: s.id === 'opening',
        items: s.items.map(i => ({ ...i, checked: false }))
      })))
    }
  }, [activeCall?.id])

  const toggleSection = (sectionId: string) => {
    setScript(prev => prev.map(s => 
      s.id === sectionId ? { ...s, expanded: !s.expanded } : s
    ))
  }

  const toggleItem = (sectionId: string, itemId: string) => {
    setScript(prev => prev.map(s => 
      s.id === sectionId 
        ? { 
            ...s, 
            items: s.items.map(i => 
              i.id === itemId ? { ...i, checked: !i.checked } : i
            )
          } 
        : s
    ))
  }

  const getProgress = () => {
    const total = script.reduce((acc, s) => acc + s.items.filter(i => i.type !== 'tip').length, 0)
    const checked = script.reduce((acc, s) => acc + s.items.filter(i => i.checked && i.type !== 'tip').length, 0)
    return { total, checked, percent: total > 0 ? Math.round((checked / total) * 100) : 0 }
  }

  const progress = getProgress()

  if (!activeCall) return null

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed top-4 left-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center gap-2"
        title="Open Call Script"
      >
        <ScriptIcon className="w-5 h-5" />
        <span className="text-xs font-medium">{progress.percent}%</span>
      </button>
    )
  }

  return (
    <div className="fixed top-4 left-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-40 flex flex-col max-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <ScriptIcon className="w-5 h-5" />
          <span className="font-medium">Call Script</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {progress.percent}% complete
          </span>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <MinimizeIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 flex-shrink-0">
        <div 
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      {/* Script Sections */}
      <div className="flex-1 overflow-y-auto">
        {script.map((section, sectionIndex) => {
          const sectionChecked = section.items.filter(i => i.checked && i.type !== 'tip').length
          const sectionTotal = section.items.filter(i => i.type !== 'tip').length
          const isComplete = sectionTotal > 0 && sectionChecked === sectionTotal

          return (
            <div key={section.id} className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  isComplete ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{section.icon}</span>
                  <span className={`font-medium text-sm ${isComplete ? 'text-green-700' : 'text-gray-900'}`}>
                    {section.title}
                  </span>
                  {isComplete && <CheckCircleIcon className="w-4 h-4 text-green-600" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{sectionChecked}/{sectionTotal}</span>
                  <ChevronIcon className={`w-4 h-4 text-gray-400 transition-transform ${section.expanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {section.expanded && (
                <div className="px-4 pb-3 space-y-2">
                  {section.items.map(item => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        item.type === 'tip' 
                          ? 'bg-amber-50 border border-amber-100' 
                          : item.checked 
                            ? 'bg-green-50 border border-green-100' 
                            : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {item.type !== 'tip' && (
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(section.id, item.id)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          {item.type === 'say' && <span className="text-xs text-blue-600 font-medium">SAY:</span>}
                          {item.type === 'ask' && <span className="text-xs text-purple-600 font-medium">ASK:</span>}
                          {item.type === 'do' && <span className="text-xs text-green-600 font-medium">DO:</span>}
                          {item.type === 'tip' && <span className="text-xs text-amber-600 font-medium">💡 TIP:</span>}
                        </div>
                        <p className={`text-sm ${item.checked ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                          {item.text}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ScriptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  )
}
