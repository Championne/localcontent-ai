'use client'

import { useState, Suspense, lazy } from 'react'

const ImageQueriesTab = lazy(() => import('@/components/settings/ImageQueriesTab'))
const AiPromptsTab = lazy(() => import('@/components/settings/AiPromptsTab'))
const LivePlaygroundTab = lazy(() => import('@/components/settings/LivePlaygroundTab'))
const StylePromptsTab = lazy(() => import('@/components/settings/StylePromptsTab'))

type StudioTab = 'image-queries' | 'ai-prompts' | 'style-prompts' | 'playground'

export default function ImageStudioPage() {
  const [activeTab, setActiveTab] = useState<StudioTab>('playground')

  const tabs: { id: StudioTab; label: string; icon: string }[] = [
    { id: 'playground', label: 'Live Playground', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
    { id: 'image-queries', label: 'Search Prompts', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: 'ai-prompts', label: 'AI Prompts', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'style-prompts', label: 'Style Prompts', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  ]

  return (
    <div className={activeTab === 'playground' ? 'max-w-6xl mx-auto' : 'max-w-4xl mx-auto'}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Image Studio</h1>
        <p className="text-gray-500 mt-1">Fine-tune how AI images are generated for your content</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-teal-500 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Suspense fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      }>
        {activeTab === 'playground' && <LivePlaygroundTab />}
        {activeTab === 'image-queries' && <ImageQueriesTab />}
        {activeTab === 'ai-prompts' && <AiPromptsTab />}
        {activeTab === 'style-prompts' && <StylePromptsTab />}
      </Suspense>
    </div>
  )
}
