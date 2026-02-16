'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import SparkCard from '@/components/ui/SparkCard'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns'

// --- Types ---

interface ScheduledItem {
  id: string
  platform: string
  post_text: string
  media_url: string | null
  scheduled_for: string
  status: 'pending' | 'processing' | 'published' | 'failed' | 'cancelled'
  content_id: string | null
  error_message: string | null
}

interface ContentItem {
  id: string
  title: string
  status: string
  scheduled_for: string | null
  published_at: string | null
  image_url: string | null
  content_type: string
}

type CalendarEvent = {
  id: string
  date: Date
  title: string
  platform: string
  status: string
  type: 'scheduled' | 'published' | 'draft'
  imageUrl?: string | null
  sourceId?: string
}

// Platform colors
const PLATFORM_COLORS: Record<string, string> = {
  gmb: '#4285F4',
  facebook: '#1877F2',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  tiktok: '#000000',
  youtube: '#FF0000',
  threads: '#000000',
  reddit: '#FF5700',
  pinterest: '#E60023',
  bluesky: '#0085FF',
  default: '#6B7280',
}

const PLATFORM_LABELS: Record<string, string> = {
  gmb: 'GMB',
  facebook: 'FB',
  instagram: 'IG',
  linkedin: 'LI',
  twitter: 'X',
  tiktok: 'TT',
  youtube: 'YT',
  threads: 'TH',
  reddit: 'RD',
  pinterest: 'PIN',
  bluesky: 'BS',
}

// SparkFox tips for the calendar
const CALENDAR_TIPS = [
  "Consistency is key! Aim to post at least 3 times per week on your main platforms.",
  "Tuesday to Thursday between 10am-2pm usually gets the most engagement for local businesses.",
  "Mix it up — alternate between promotional, educational, and behind-the-scenes content.",
  "Leave gaps between posts on the same platform. Your audience needs time to absorb each message.",
  "Scheduled posts free up your time so you can focus on running your business!",
  "Pro tip: Plan your whole week on Monday. It takes 15 minutes and saves hours.",
  "Keep an eye on which days your posts perform best — I'll help you learn from the data.",
]

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([])
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const sparkTip = useMemo(() => CALENDAR_TIPS[currentMonth.getMonth() % CALENDAR_TIPS.length], [currentMonth])

  // Fetch scheduled items and content for the visible range
  const fetchData = useCallback(async () => {
    setLoading(true)
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    const from = calStart.toISOString()
    const to = calEnd.toISOString()

    try {
      const [schedRes, contentRes] = await Promise.all([
        fetch(`/api/schedule?from=${from}&to=${to}`),
        fetch(`/api/content?from=${from}&to=${to}&status=scheduled,published`),
      ])
      if (schedRes.ok) {
        const data = await schedRes.json()
        setScheduledItems(data.items || [])
      }
      if (contentRes.ok) {
        const data = await contentRes.json()
        setContentItems(data.items || data.content || [])
      }
    } catch {}
    setLoading(false)
  }, [currentMonth])

  useEffect(() => { fetchData() }, [fetchData])

  // Merge scheduled items + content into calendar events
  const events: CalendarEvent[] = useMemo(() => {
    const evts: CalendarEvent[] = []
    const seenContentIds = new Set<string>()

    for (const item of scheduledItems) {
      evts.push({
        id: `s-${item.id}`,
        date: parseISO(item.scheduled_for),
        title: item.post_text.slice(0, 60) + (item.post_text.length > 60 ? '...' : ''),
        platform: item.platform,
        status: item.status,
        type: item.status === 'published' ? 'published' : 'scheduled',
        imageUrl: item.media_url,
        sourceId: item.id,
      })
      if (item.content_id) seenContentIds.add(item.content_id)
    }

    for (const item of contentItems) {
      if (seenContentIds.has(item.id)) continue
      const dateStr = item.scheduled_for || item.published_at
      if (!dateStr) continue
      evts.push({
        id: `c-${item.id}`,
        date: parseISO(dateStr),
        title: item.title || 'Untitled',
        platform: item.content_type || 'content',
        status: item.status,
        type: item.status === 'published' ? 'published' : item.status === 'scheduled' ? 'scheduled' : 'draft',
        imageUrl: item.image_url,
        sourceId: item.id,
      })
    }

    return evts.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [scheduledItems, contentItems])

  // Calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const eventsForDay = (day: Date) => events.filter(e => isSameDay(e.date, day))

  const selectedDayEvents = selectedDay ? eventsForDay(selectedDay) : []

  const handleCancel = async (scheduleId: string) => {
    setCancellingId(scheduleId)
    try {
      await fetch('/api/schedule', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId }),
      })
      await fetchData()
    } catch {}
    setCancellingId(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* SparkFox Tip */}
      <SparkCard expression="encouraging" className="mb-6">
        <p className="text-sm text-gray-800 leading-relaxed">{sparkTip}</p>
      </SparkCard>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayEvents = eventsForDay(day)
            const inMonth = isSameMonth(day, currentMonth)
            const today = isToday(day)
            const isSelected = selectedDay && isSameDay(day, selectedDay)

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`
                  relative min-h-[90px] sm:min-h-[100px] p-1.5 border-b border-r border-gray-100 text-left transition-colors
                  ${!inMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-teal-50/30'}
                  ${isSelected ? 'ring-2 ring-inset ring-teal-500 bg-teal-50/40' : ''}
                `}
              >
                <span className={`
                  inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                  ${today ? 'bg-teal-600 text-white' : inMonth ? 'text-gray-900' : 'text-gray-300'}
                `}>
                  {format(day, 'd')}
                </span>

                {/* Event dots / chips */}
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 3).map(evt => (
                    <div
                      key={evt.id}
                      className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] leading-tight truncate"
                      style={{ backgroundColor: `${PLATFORM_COLORS[evt.platform] || PLATFORM_COLORS.default}15` }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PLATFORM_COLORS[evt.platform] || PLATFORM_COLORS.default }}
                      />
                      <span className="truncate font-medium" style={{ color: PLATFORM_COLORS[evt.platform] || PLATFORM_COLORS.default }}>
                        {PLATFORM_LABELS[evt.platform] || evt.platform}
                      </span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 3} more</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="mt-4 text-center text-sm text-gray-400">Loading scheduled content...</div>
      )}

      {/* Selected Day Detail Panel */}
      {selectedDay && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              {format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </h3>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/content"
                className="text-xs font-medium text-teal-600 hover:text-teal-800 flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create Spark
              </Link>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <svg className="w-10 h-10 text-gray-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-sm text-gray-400">No posts scheduled for this day</p>
              <Link
                href="/dashboard/content"
                className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-teal-600 hover:text-teal-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create a Spark for this day
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {selectedDayEvents.map(evt => (
                <div key={evt.id} className="flex items-start gap-3 px-4 py-3">
                  {/* Platform badge */}
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: PLATFORM_COLORS[evt.platform] || PLATFORM_COLORS.default }}
                  >
                    {PLATFORM_LABELS[evt.platform] || evt.platform.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide
                        ${evt.status === 'published' ? 'bg-green-100 text-green-700' :
                          evt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          evt.status === 'failed' ? 'bg-red-100 text-red-700' :
                          evt.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                          'bg-blue-100 text-blue-700'}`}
                      >
                        {evt.status}
                      </span>
                      <span className="text-[10px] text-gray-400">{format(evt.date, 'h:mm a')}</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-snug line-clamp-2">{evt.title}</p>
                  </div>

                  {/* Thumbnail */}
                  {evt.imageUrl && (
                    <img src={evt.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}

                  {/* Cancel button for pending scheduled items */}
                  {evt.type === 'scheduled' && evt.status === 'pending' && evt.id.startsWith('s-') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCancel(evt.sourceId!) }}
                      disabled={cancellingId === evt.sourceId}
                      className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      {cancellingId === evt.sourceId ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Scheduled
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Published
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Failed
        </span>
        {Object.entries(PLATFORM_LABELS).slice(0, 6).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[key] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
