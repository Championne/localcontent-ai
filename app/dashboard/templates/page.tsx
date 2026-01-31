'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
      return daysUntil > 0 && daysUntil <= 30
    })
    .map(e => ({
      ...e,
      daysUntil: Math.ceil((e.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3)
}

// Industry-specific trending topics
const getIndustryTrends = (industry: string | null) => {
  const trends: Record<string, Array<{ emoji: string; title: string; topic: string; urgency?: string }>> = {
    'Restaurant': [
      { emoji: '📸', title: 'Behind-the-scenes kitchen tour', topic: 'Behind the scenes in our kitchen' },
      { emoji: '👨‍🍳', title: 'Meet the chef', topic: 'Meet our head chef and their story' },
      { emoji: '⭐', title: 'Customer favorites post', topic: 'Our most popular dishes this month' },
      { emoji: '🥗', title: 'New menu item tease', topic: 'Sneak peek of our new menu item' },
    ],
    'Plumber': [
      { emoji: '❄️', title: 'Winter pipe protection tips', topic: 'How to prevent frozen pipes this winter', urgency: 'Seasonal' },
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

// Goal-based actions
const goals = [
  {
    id: 'promo',
    emoji: '🎁',
    title: 'Promote an Offer',
    description: 'Drive sales with a special deal',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    topic: 'Special limited-time offer for our customers',
    template: 'social-pack',
  },
  {
    id: 'reviews',
    emoji: '⭐',
    title: 'Get More Reviews',
    description: 'Boost your online reputation',
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    topic: 'We would love to hear your feedback',
    template: 'social-pack',
  },
  {
    id: 'news',
    emoji: '📢',
    title: 'Share News',
    description: 'Announce something exciting',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    topic: 'Exciting announcement from our business',
    template: 'social-pack',
  },
  {
    id: 'showcase',
    emoji: '📸',
    title: 'Show Off Your Work',
    description: 'Display your best results',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    topic: 'Check out our latest work',
    template: 'social-pack',
  },
  {
    id: 'welcome',
    emoji: '👋',
    title: 'Welcome Customers',
    description: 'Make newcomers feel at home',
    color: 'from-teal-500 to-green-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    topic: 'Welcome to our business family',
    template: 'social-pack',
  },
  {
    id: 'educate',
    emoji: '💡',
    title: 'Share Tips & Advice',
    description: 'Position yourself as an expert',
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    topic: 'Helpful tips and advice from our experts',
    template: 'blog-post',
  },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  
  const upcomingEvents = getUpcomingEvents()
  const industryTrends = getIndustryTrends(business?.industry || null)

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

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
        <div className="h-60 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Inspiration</h1>
        <p className="text-gray-600">
          {business ? `Ideas tailored for ${business.name}` : 'Discover what to post today'}
        </p>
      </div>

      {/* Section B: Timely/Trending - Perfect Right Now */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔥</span>
          <h2 className="text-lg font-semibold text-gray-900">Perfect for You Right Now</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Upcoming Events */}
          {upcomingEvents.map((event, idx) => (
            <div 
              key={idx}
              className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{event.emoji}</span>
                <span className="text-xs font-medium text-rose-600 bg-rose-100 px-2 py-1 rounded-full">
                  {event.daysUntil === 1 ? 'Tomorrow!' : `${event.daysUntil} days`}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{event.name}</h3>
              <p className="text-sm text-gray-600 mb-3">Create a post to celebrate!</p>
              <button
                onClick={() => handleCreateContent(event.topic)}
                className="w-full py-2 bg-white border border-rose-200 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Create Post
              </button>
            </div>
          ))}
          
          {/* Industry Trends */}
          {industryTrends.slice(0, 3 - upcomingEvents.length).map((trend, idx) => (
            <div 
              key={idx}
              className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{trend.emoji}</span>
                {trend.urgency && (
                  <span className="text-xs font-medium text-teal-600 bg-teal-100 px-2 py-1 rounded-full">
                    {trend.urgency}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{trend.title}</h3>
              <p className="text-sm text-gray-600 mb-3">Trending in your industry</p>
              <button
                onClick={() => handleCreateContent(trend.topic)}
                className="w-full py-2 bg-white border border-teal-200 rounded-lg text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors"
              >
                Create Post
              </button>
            </div>
          ))}
        </div>

        {/* More trending ideas */}
        {industryTrends.length > (3 - upcomingEvents.length) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">More ideas:</span>
            {industryTrends.slice(3 - upcomingEvents.length).map((trend, idx) => (
              <button
                key={idx}
                onClick={() => handleCreateContent(trend.topic)}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
              >
                {trend.emoji} {trend.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Section A: Goal-Based Actions */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🎯</span>
          <h2 className="text-lg font-semibold text-gray-900">What Do You Want to Achieve?</h2>
        </div>
        
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => handleCreateContent(goal.topic, goal.template)}
              className={`${goal.bgColor} ${goal.borderColor} border rounded-xl p-4 text-left hover:shadow-md transition-all hover:scale-[1.02] group`}
            >
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{goal.emoji}</span>
              <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
              <p className="text-sm text-gray-600">{goal.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links to Traditional Templates */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📚</span>
          <h2 className="text-lg font-semibold text-gray-900">Or Create by Type</h2>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/content?template=social-pack"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            📱 Social Media Pack
          </Link>
          <Link
            href="/dashboard/content?template=blog-post"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            📝 Blog Post
          </Link>
          <Link
            href="/dashboard/content?template=gmb-post"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            📍 Google Business Post
          </Link>
          <Link
            href="/dashboard/content?template=email"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            ✉️ Email Newsletter
          </Link>
        </div>
      </div>

      {/* Start Fresh CTA */}
      <div className="mt-8 text-center">
        <Link
          href="/dashboard/content"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start Fresh - Create Any Content
        </Link>
      </div>
    </div>
  )
}
