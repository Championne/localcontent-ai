'use client'

import { useState, useEffect } from 'react'
import { 
  FEEDBACK_TYPE_LABELS, 
  FEEDBACK_CATEGORY_LABELS,
  type Feedback, 
  type FeedbackType, 
  type FeedbackStatus,
  type FeedbackCategory,
  type FeedbackPriority,
  type CreateFeedback 
} from '@/types/sales'

const statusColors: Record<FeedbackStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  reviewed: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-purple-100 text-purple-800',
  implemented: 'bg-green-100 text-green-800',
  declined: 'bg-gray-100 text-gray-600',
}

const priorityColors: Record<FeedbackPriority, string> = {
  low: 'text-gray-500',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<{ type?: string; status?: string }>({})
  const [form, setForm] = useState<CreateFeedback>({
    type: 'insight',
    title: '',
    priority: 'medium',
  })

  const fetchFeedback = async () => {
    const params = new URLSearchParams()
    if (filter.type) params.set('type', filter.type)
    if (filter.status) params.set('status', filter.status)
    
    const res = await fetch(`/api/sales/feedback?${params}`)
    const data = await res.json()
    setFeedback(data.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchFeedback()
  }, [filter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/sales/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setShowModal(false)
    setForm({ type: 'insight', title: '', priority: 'medium' })
    fetchFeedback()
  }

  const handleStatusChange = async (id: string, status: FeedbackStatus) => {
    await fetch(`/api/sales/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchFeedback()
  }

  const handleUpvote = async (id: string) => {
    await fetch(`/api/sales/feedback/${id}/vote`, { method: 'POST' })
    fetchFeedback()
  }

  // Stats
  const stats = {
    total: feedback.length,
    new: feedback.filter(f => f.status === 'new').length,
    feature_requests: feedback.filter(f => f.type === 'feature_request').length,
    objections: feedback.filter(f => f.type === 'objection').length,
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback & Ideas</h1>
          <p className="text-gray-500">Insights from client conversations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
        >
          + Add Feedback
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Items</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
          <p className="text-sm text-gray-500">New / Unreviewed</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-2xl font-bold text-purple-600">{stats.feature_requests}</p>
          <p className="text-sm text-gray-500">Feature Requests</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-2xl font-bold text-orange-600">{stats.objections}</p>
          <p className="text-sm text-gray-500">Objections Logged</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filter.type || ''}
          onChange={(e) => setFilter({ ...filter, type: e.target.value || undefined })}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Types</option>
          {Object.entries(FEEDBACK_TYPE_LABELS).map(([key, { label, emoji }]) => (
            <option key={key} value={key}>{emoji} {label}</option>
          ))}
        </select>
        <select
          value={filter.status || ''}
          onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="in_progress">In Progress</option>
          <option value="implemented">Implemented</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedback.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No feedback yet</p>
            <p className="text-sm">Start capturing insights from your sales conversations!</p>
          </div>
        ) : (
          feedback.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Type badge and title */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${FEEDBACK_TYPE_LABELS[item.type].color}`}>
                      {FEEDBACK_TYPE_LABELS[item.type].emoji} {FEEDBACK_TYPE_LABELS[item.type].label}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[item.status]}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    {item.priority !== 'medium' && (
                      <span className={`text-xs font-medium ${priorityColors[item.priority]}`}>
                        {item.priority.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}

                  {/* Client quote */}
                  {item.client_quote && (
                    <blockquote className="border-l-4 border-teal-200 pl-3 py-1 my-2 italic text-gray-600 text-sm">
                      "{item.client_quote}"
                      {item.client_name && (
                        <span className="block text-xs text-gray-500 mt-1 not-italic">
                          - {item.client_name}{item.client_company && `, ${item.client_company}`}
                        </span>
                      )}
                    </blockquote>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>By {item.submitter?.name || 'Unknown'}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    {item.category && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded">
                        {FEEDBACK_CATEGORY_LABELS[item.category]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2">
                  {/* Upvote */}
                  <button
                    onClick={() => handleUpvote(item.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-lg">👍</span>
                    <span className="text-sm font-medium text-gray-700">{item.upvotes}</span>
                  </button>

                  {/* Status change */}
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as FeedbackStatus)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="implemented">Implemented</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Feedback</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(FEEDBACK_TYPE_LABELS).map(([key, { label, emoji }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, type: key as FeedbackType })}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        form.type === key 
                          ? 'border-teal-500 bg-teal-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg mr-2">{emoji}</span>
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  placeholder="Brief summary..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Details</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border rounded-lg p-2"
                  placeholder="More context about this feedback..."
                />
              </div>

              {/* Client Quote */}
              <div>
                <label className="block text-sm font-medium mb-1">Client Quote (optional)</label>
                <textarea
                  value={form.client_quote || ''}
                  onChange={(e) => setForm({ ...form, client_quote: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg p-2 italic"
                  placeholder="What exactly did they say?"
                />
              </div>

              {/* Client info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client Name</label>
                  <input
                    type="text"
                    value={form.client_name || ''}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    type="text"
                    value={form.client_company || ''}
                    onChange={(e) => setForm({ ...form, client_company: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Priority & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as FeedbackPriority })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={form.category || ''}
                    onChange={(e) => setForm({ ...form, category: e.target.value as FeedbackCategory || undefined })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Select...</option>
                    {Object.entries(FEEDBACK_CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
