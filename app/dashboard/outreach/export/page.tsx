'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
}

export default function ExportLeadsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [statusFilter, setStatusFilter] = useState('new')
  const [format, setFormat] = useState('instantly')
  const [markAsContacted, setMarkAsContacted] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [result, setResult] = useState<{ csv: string; filename: string; count: number } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/outreach/campaigns')
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch (err) {
      console.error('Error fetching campaigns:', err)
    }
  }

  async function handleExport() {
    setExporting(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/outreach/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: selectedCampaign || undefined,
          status_filter: statusFilter,
          format,
          mark_as_contacted: markAsContacted
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Export failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  function downloadCSV() {
    if (!result) return

    const blob = new Blob([result.csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/outreach" className="text-teal-600 hover:text-teal-700 text-sm mb-2 inline-block">
          ← Back to Outreach
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Export Leads</h1>
        <p className="text-gray-600">Export leads to use with email outreach tools</p>
      </div>

      {!result ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'instantly', name: 'Instantly.ai', desc: 'Recommended' },
                { id: 'smartlead', name: 'Smartlead', desc: 'Alternative' },
                { id: 'lemlist', name: 'Lemlist', desc: 'With image support' },
                { id: 'generic', name: 'Generic CSV', desc: 'For other tools' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    format === f.id 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{f.name}</div>
                  <div className="text-xs text-gray-500">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign (optional)
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Campaigns</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lead Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="new">New (not contacted yet)</option>
              <option value="all">All Leads</option>
              <option value="contacted">Contacted (for re-export)</option>
              <option value="replied">Replied</option>
              <option value="interested">Interested</option>
            </select>
          </div>

          {/* Options */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={markAsContacted}
                onChange={(e) => setMarkAsContacted(e.target.checked)}
                className="rounded border-gray-300 text-teal-600"
              />
              <span className="text-sm text-gray-700">
                Mark exported leads as "Contacted"
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Prevents accidentally exporting the same leads twice
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
          >
            {exporting ? 'Exporting...' : 'Export Leads'}
          </button>

          {/* Instructions */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Next Steps:</h3>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>1. Export leads from here</li>
              <li>2. Log into <a href="https://instantly.ai" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Instantly.ai</a></li>
              <li>3. Go to Leads → Upload</li>
              <li>4. Upload the CSV file</li>
              <li>5. Create or select a campaign</li>
              <li>6. Start sending!</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Export Ready!</h2>
          <p className="text-gray-600 mb-6">
            {result.count} leads exported for {format === 'instantly' ? 'Instantly.ai' : format}
          </p>

          <button
            onClick={downloadCSV}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
          >
            Download CSV
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setResult(null)}
              className="text-teal-600 hover:text-teal-700 text-sm"
            >
              Export More Leads
            </button>
          </div>

          {/* Preview */}
          <div className="mt-6 text-left">
            <h3 className="font-medium text-gray-900 mb-2">CSV Preview:</h3>
            <pre className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 overflow-x-auto max-h-48">
              {result.csv.split('\n').slice(0, 6).join('\n')}
              {result.csv.split('\n').length > 6 && '\n...'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
