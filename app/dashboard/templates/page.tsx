'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Business {
  id: string
  name: string
  industry: string | null
}

// Upcoming events/holidays - would be dynamic in production
const getUpcomingEvents = () => {
  const today = new Date()
  const events = [
    { date: new Date(2026, 1, 14), name: "Valentine's Day", emoji: '💝', topic: "Valentine's Day special offer" },
    { date: new Date(2026, 1, 9), name: 'National Pizza Day', emoji: '🍕', industries: ['Restaurant'], topic: 'National Pizza Day celebration' },
    { date: new Date(2026, 2, 17), name: "St. Patrick's Day", emoji: '🍀', topic: "St. Patrick's Day special" },
    { date: new Date(2026, 3, 12), name: 'Easter', emoji: '🐣', topic: 'Easter holiday special' },
    { date: new Date(2026, 4, 11), name: "Mother's Day", emoji: '💐', topic: "Mother's Day special offer" },
    { date: new Date(2026, 5, 15), name: "Father's Day", emoji: '👔', topic: "Father's Day special offer" },
    { date: new Date(2026, 6, 4), name: 'Independence Day', emoji: '🇺🇸', topic: 'July 4th celebration' },
    { date: new Date(2026, 9, 31), name: 'Halloween', emoji: '🎃', topic: 'Halloween special' },
    { date: new Date(2026, 10, 26), name: 'Thanksgiving', emoji: '🦃', topic: 'Thanksgiving special' },
    { date: new Date(2026, 11, 25), name: 'Christmas', emoji: '🎄', topic: 'Christmas/holiday special' },
    { date: new Date(2026, 11, 31), name: "New Year's Eve", emoji: '🎆', topic: 'New Year celebration' },
  ]
  
  return events
    .filter(e => {
      const daysUntil = Math.ceil((e.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil > 0 && daysUntil <= 60
    })
    .map(e => ({
      ...e,
      daysUntil: Math.ceil((e.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
}

// Industry-specific trending topics
const getIndustryTrends = (industry: string | null) => {
  const trends: Record<string, Array<{ emoji: string; title: string; topic: string; badge?: string }>> = {
    'Restaurant': [
      { emoji: '📸', title: 'Behind-the-scenes kitchen tour', topic: 'Behind the scenes in our kitchen' },
      { emoji: '👨‍🍳', title: 'Meet the chef', topic: 'Meet our head chef and their story' },
      { emoji: '⭐', title: 'Customer favorites post', topic: 'Our most popular dishes this month' },
      { emoji: '🥗', title: 'New menu item tease', topic: 'Sneak peek of our new menu item' },
    ],
    'Plumber': [
      { emoji: '❄️', title: 'Winter pipe protection tips', topic: 'How to prevent frozen pipes this winter', badge: 'Seasonal' },
      { emoji: '🚿', title: 'Water heater maintenance', topic: 'Signs your water heater needs attention' },
      { emoji: '💧', title: 'Leak detection guide', topic: 'How to spot hidden water leaks' },
    ],
    'Electrician': [
      { emoji: '💡', title: 'Energy saving tips', topic: 'How to reduce your electricity bill' },
      { emoji: '🔌', title: 'Safety check reminder', topic: 'When to get your electrical system inspected' },
      { emoji: '⚡', title: 'Storm preparation', topic: 'Protecting your home from power surges' },
    ],
    'Salon': [
      { emoji: '💇', title: 'Trending styles this season', topic: 'Hair trends everyone is asking for' },
      { emoji: '✨', title: 'Transformation Tuesday', topic: 'Amazing before and after transformation' },
      { emoji: '💅', title: 'Self-care tips', topic: 'Self-care routine for busy people' },
    ],
    'Dentist': [
      { emoji: '😁', title: 'Smile transformation', topic: 'Patient smile transformation story' },
      { emoji: '🦷', title: 'Dental health tips', topic: 'Daily habits for healthier teeth' },
      { emoji: '👨‍👩‍👧', title: 'Family dental care', topic: 'Making dental visits fun for kids' },
    ],
    'Fitness': [
      { emoji: '💪', title: 'Member success story', topic: 'Member transformation and success story' },
      { emoji: '🏋️', title: 'Workout of the week', topic: 'This week\'s featured workout routine' },
      { emoji: '🥗', title: 'Nutrition tips', topic: 'Simple nutrition tips for better results' },
    ],
    'Real Estate': [
      { emoji: '🏠', title: 'New listing showcase', topic: 'Featured property of the week' },
      { emoji: '📈', title: 'Market update', topic: 'Local real estate market trends' },
      { emoji: '🔑', title: 'First-time buyer tips', topic: 'Tips for first-time home buyers' },
    ],
  }
  
  const defaultTrends = [
    { emoji: '⭐', title: 'Customer spotlight', topic: 'Featuring a happy customer story' },
    { emoji: '📸', title: 'Behind the scenes', topic: 'A day in the life at our business' },
    { emoji: '💡', title: 'Tips & tricks', topic: 'Helpful tips from our experts' },
    { emoji: '🎉', title: 'Special announcement', topic: 'Exciting news to share with customers' },
  ]
  
  return trends[industry || ''] || defaultTrends
}

// Goal-based actions - harmonized colors (all use subtle gray/white with teal accents)
const goals = [
  {
    id: 'promo',
    emoji: '🎁',
    title: 'Promote an Offer',
    description: 'Drive sales with a special deal',
    topic: 'Special limited-time offer for our customers',
    template: 'social-pack',
  },
  {
    id: 'reviews',
    emoji: '⭐',
    title: 'Get More Reviews',
    description: 'Boost your online reputation',
    topic: 'We would love to hear your feedback',
    template: 'social-pack',
  },
  {
    id: 'news',
    emoji: '📢',
    title: 'Share News',
    description: 'Announce something exciting',
    topic: 'Exciting announcement from our business',
    template: 'social-pack',
  },
  {
    id: 'showcase',
    emoji: '📸',
    title: 'Show Off Your Work',
    description: 'Display your best results',
    topic: 'Check out our latest work',
    template: 'social-pack',
  },
  {
    id: 'welcome',
    emoji: '👋',
    title: 'Welcome Customers',
    description: 'Make newcomers feel at home',
    topic: 'Welcome to our business family',
    template: 'social-pack',
  },
  {
    id: 'educate',
    emoji: '💡',
    title: 'Share Tips & Advice',
    description: 'Position yourself as an expert',
    topic: 'Helpful tips and advice from our experts',
    template: 'blog-post',
  },
]

export default function IdeasPage() {
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [scrollIndex, setScrollIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Combine events and trends for the scrollable section
  const upcomingEvents = getUpcomingEvents()
  const industryTrends = getIndustryTrends(business?.industry || null)
  
  // All timely items combined
  const timelyItems = [
    ...upcomingEvents.map(e => ({
      type: 'event' as const,
      emoji: e.emoji,
      title: e.name,
      subtitle: e.daysUntil === 1 ? 'Tomorrow!' : `${e.daysUntil} days away`,
      description: 'Create a post to celebrate',
      topic: e.topic,
    })),
    ...industryTrends.map(t => ({
      type: 'trend' as const,
      emoji: t.emoji,
      title: t.title,
      subtitle: t.badge || 'Trending',
      description: 'Popular in your industry',
      topic: t.topic,
    }))
  ]

  const maxScrollIndex = Math.max(0, timelyItems.length - 3)

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const response = await fetch('/api/business')
        if (response.ok) {
          const data = await response.json()
          if (data.businesses && data.businesses.length > 0) {
            setBusiness(data.businesses[0])
          }
        }
      } catch (err) {
        console.error('Failed to fetch business:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBusiness()
  }, [])

  const handleCreateContent = (topic: string, template: string = 'social-pack') => {
    const params = new URLSearchParams({
      template,
      topic: encodeURIComponent(topic),
    })
    router.push(`/dashboard/content?${params.toString()}`)
  }

  const scrollLeft = () => {
    setScrollIndex(prev => Math.max(0, prev - 1))
  }

  const scrollRight = () => {
    setScrollIndex(prev => Math.min(maxScrollIndex, prev + 1))
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
        <div className="h-8 bg-gray-100 rounded w-1/4"></div>
        <div className="h-4 bg-gray-100 rounded w-1/3"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-40 bg-gray-100 rounded-xl"></div>
          <div className="h-40 bg-gray-100 rounded-xl"></div>
          <div className="h-40 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  const visibleItems = timelyItems.slice(scrollIndex, scrollIndex + 3)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2"><svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Need a spark?</h1>
        <p className="text-gray-500">
          {business ? `Content suggestions for ${business.name}` : 'Find inspiration for your next post'}
        </p>
      </div>

      {/* Timely Section with Scroll Arrows */}
      <div className="mb-10">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Perfect for you right now</h2>
        
        <div className="relative">
          {/* Left Arrow - positioned outside */}
          <button
            onClick={scrollLeft}
            disabled={scrollIndex === 0}
            className={`absolute -left-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
              scrollIndex === 0 
                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                : 'border-gray-300 text-gray-500 hover:bg-teal-50 hover:border-teal-400 hover:text-teal-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Cards - full width grid aligned with bottom section */}
          <div ref={scrollContainerRef} className="grid grid-cols-3 gap-4">
          {visibleItems.map((item, idx) => (
            <button
              key={`${item.type}-${scrollIndex}-${idx}`}
              onClick={() => handleCreateContent(item.topic)}
              className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-lg hover:border-teal-300 hover:-translate-y-1 transition-all group min-h-[140px]"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                  {item.subtitle}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1 group-hover:text-teal-700 transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </button>
          ))}
          </div>
          
          {/* Right Arrow - positioned outside */}
          <button
            onClick={scrollRight}
            disabled={scrollIndex >= maxScrollIndex}
            className={`absolute -right-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
              scrollIndex >= maxScrollIndex 
                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                : 'border-gray-300 text-gray-500 hover:bg-teal-50 hover:border-teal-400 hover:text-teal-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Scroll indicators */}
        {timelyItems.length > 3 && (
          <div className="flex justify-center gap-1.5 mt-4">
            {Array.from({ length: Math.ceil(timelyItems.length / 3) }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  Math.floor(scrollIndex / 3) === i ? 'bg-teal-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-8"></div>

      {/* Goal-Based Actions */}
      <div className="mb-10">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">What do you want to achieve?</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => handleCreateContent(goal.topic, goal.template)}
              className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-lg hover:border-teal-300 hover:-translate-y-1 transition-all group min-h-[140px]"
            >
              <span className="text-2xl mb-3 block">{goal.emoji}</span>
              <h3 className="font-medium text-gray-900 mb-1 group-hover:text-teal-700 transition-colors">{goal.title}</h3>
              <p className="text-sm text-gray-500">{goal.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Simple CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => router.push('/dashboard/content')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-teal-500/25"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create a spark
        </button>
      </div>
    </div>
  )
}
