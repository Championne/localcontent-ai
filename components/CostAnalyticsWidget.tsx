'use client'

import { useEffect, useState } from 'react'

interface CostData {
  totalImages: number
  totalCost: number
  costPerImage: number
  sdxlCost: number
  dalle3Cost: number
  backgroundRemovalCost: number
  modelUsageRatio: { sdxl: number; dalle3: number }
  timeSavedHours: number
}

export function CostAnalyticsWidget() {
  const [data, setData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics/costs')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
        <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Image Generation — This Month</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Stat label="Total images" value={String(data.totalImages)} />
        <Stat label="Total cost" value={`$${data.totalCost.toFixed(2)}`} />
        <Stat label="Avg per image" value={`$${data.costPerImage.toFixed(3)}`} />
        <Stat label="Time saved" value={`${data.timeSavedHours}h`} sub="vs manual editing" />
      </div>

      {data.totalImages > 0 && (
        <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>DALL-E 3</span>
            <span className="font-mono">${data.dalle3Cost.toFixed(2)} ({data.modelUsageRatio.dalle3}%)</span>
          </div>
          <div className="flex justify-between">
            <span>SDXL</span>
            <span className="font-mono">${data.sdxlCost.toFixed(2)} ({data.modelUsageRatio.sdxl}%)</span>
          </div>
          {data.backgroundRemovalCost > 0 && (
            <div className="flex justify-between">
              <span>Background removal</span>
              <span className="font-mono">${data.backgroundRemovalCost.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-[11px] text-gray-500 mb-0.5">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </div>
  )
}
