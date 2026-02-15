'use client'

import { useState } from 'react'
import { usePhoneDialer } from './PhoneDialerProvider'

interface BattleCard {
  id: string
  objection: string
  emoji: string
  category: 'price' | 'time' | 'trust' | 'need' | 'competition'
  response: string
  followUp: string
  tips: string[]
}

const BATTLE_CARDS: BattleCard[] = [
  {
    id: 'too-expensive',
    objection: "It's too expensive",
    emoji: '💰',
    category: 'price',
    response: "I completely understand budget is important. Let me ask - what does one new customer bring you? $200? $500? One customer from social media covers 3-7 months of GeoSpark. Plus, what's your time worth if you're doing this yourself?",
    followUp: "Would it help if I showed you exactly how other [industry] businesses are getting results?",
    tips: [
      'Focus on ROI, not cost',
      'Compare to alternatives (agency = $1000+/mo)',
      'Mention the 30-day money-back guarantee'
    ]
  },
  {
    id: 'no-time',
    objection: "I don't have time for this",
    emoji: '⏰',
    category: 'time',
    response: "That's exactly why this exists! GeoSpark takes just 5 minutes a week - you review AI-written posts and click approve. Most customers do it on their phone during lunch. We handle the hard part.",
    followUp: "Would 5 minutes a week be manageable if it meant consistent social media presence?",
    tips: [
      'Emphasize automation',
      'Compare to DIY time (5-10 hrs/week)',
      "They're already spending time worrying about it"
    ]
  },
  {
    id: 'doesnt-work',
    objection: "Social media doesn't work for my business",
    emoji: '🤷',
    category: 'trust',
    response: "I hear that a lot, and I get the skepticism. But here's the thing - 70% of people check a business's social media before calling. When yours is active and professional, you get more calls. Our [industry] customers see 20-40% more inquiries.",
    followUp: "Would you be open to trying it for 30 days and seeing the results yourself?",
    tips: [
      'Share industry-specific success stories',
      'Focus on visibility, not vanity metrics',
      'Offer the trial period'
    ]
  },
  {
    id: 'think-about-it',
    objection: "I need to think about it",
    emoji: '🤔',
    category: 'trust',
    response: "Totally understand - it's a decision worth considering. What specific aspects are you weighing? I want to make sure I've given you all the info you need.",
    followUp: "If I could address those concerns, would you be ready to move forward today?",
    tips: [
      'Uncover the real objection',
      'Create urgency without pressure',
      'Offer to schedule a follow-up call'
    ]
  },
  {
    id: 'tried-before',
    objection: "I tried social media before and it didn't work",
    emoji: '😞',
    category: 'trust',
    response: "I appreciate you sharing that. Can I ask what happened? Usually it comes down to consistency - posting once a week for 3 months then stopping doesn't build visibility. GeoSpark posts 2-3x per week automatically. That consistency is what makes the difference.",
    followUp: "What if we could guarantee that consistency without any effort from you?",
    tips: [
      'Acknowledge their experience',
      'Diagnose what went wrong',
      'Position GeoSpark as the solution'
    ]
  },
  {
    id: 'nephew-does-it',
    objection: "My nephew/friend handles my social media",
    emoji: '👨‍👩‍👦',
    category: 'competition',
    response: "That's great you have help! How consistent are they posting? GeoSpark can actually complement that - we handle the regular 2-3x weekly posting so they can focus on special content, photos from jobs, and personal touches.",
    followUp: "Would having reliable backup posting help take pressure off them?",
    tips: [
      "Don't dismiss their current setup",
      'Position as complement, not replacement',
      'Highlight consistency advantage'
    ]
  },
  {
    id: 'using-competitor',
    objection: "I'm already using another tool",
    emoji: '🔄',
    category: 'competition',
    response: "That's good you're already investing in social media! What tool are you using? Most scheduling tools require you to create all the content yourself. GeoSpark actually writes the posts for you using AI - that's the big difference.",
    followUp: "Would having AI write your content save you significant time?",
    tips: [
      'Learn what they use (Hootsuite, Buffer)',
      'Differentiate: we create, not just schedule',
      "If they're happy, ask what's missing"
    ]
  },
  {
    id: 'not-decision-maker',
    objection: "I need to talk to my partner/spouse",
    emoji: '👥',
    category: 'trust',
    response: "Of course, important decisions should involve everyone. What questions do you think they'll have? I can give you the info to share, or I'd be happy to schedule a quick call with both of you.",
    followUp: "Would a 10-minute call tomorrow work for all of you?",
    tips: [
      'Offer to include the decision maker',
      'Provide materials they can share',
      'Get commitment for next step'
    ]
  },
  {
    id: 'bad-timing',
    objection: "Now is not a good time / Call back later",
    emoji: '📅',
    category: 'time',
    response: "I completely understand. When would be a better time to chat? I can call back at your convenience. Just so you know, we're running a [special offer] this month that I'd hate for you to miss.",
    followUp: "How about [specific day/time]? I'll put it in my calendar.",
    tips: [
      'Always get a specific callback time',
      'Create gentle urgency if appropriate',
      'Respect their time'
    ]
  },
]

export function BattleCardsPanel() {
  const { activeCall } = usePhoneDialer()
  const [selectedCard, setSelectedCard] = useState<BattleCard | null>(null)
  const [isMinimized, setIsMinimized] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCards = BATTLE_CARDS.filter(card =>
    card.objection.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.category.includes(searchTerm.toLowerCase())
  )

  if (!activeCall) return null

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-32 left-4 p-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors z-50"
        title="Open Battle Cards"
      >
        <ShieldIcon className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-[340px] w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-40 flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShieldIcon className="w-5 h-5" />
          <span className="font-medium">Battle Cards</span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <MinimizeIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-100 flex-shrink-0">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search objections..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Card Detail View */}
      {selectedCard ? (
        <div className="flex-1 overflow-y-auto p-4">
          <button
            onClick={() => setSelectedCard(null)}
            className="text-sm text-red-600 hover:text-red-700 mb-3 flex items-center gap-1"
          >
            ← Back to all cards
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedCard.emoji}</span>
              <h3 className="font-semibold text-gray-900">"{selectedCard.objection}"</h3>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-700 mb-1">📣 YOUR RESPONSE:</p>
              <p className="text-sm text-blue-900">{selectedCard.response}</p>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
              <p className="text-xs font-medium text-purple-700 mb-1">➡️ FOLLOW UP WITH:</p>
              <p className="text-sm text-purple-900">{selectedCard.followUp}</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-xs font-medium text-amber-700 mb-2">💡 TIPS:</p>
              <ul className="space-y-1">
                {selectedCard.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Card List View */
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {filteredCards.map(card => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 border border-transparent hover:border-gray-200"
              >
                <span className="text-xl">{card.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    "{card.objection}"
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{card.category}</p>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}
