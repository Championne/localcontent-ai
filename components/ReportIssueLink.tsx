'use client'

import Link from 'next/link'

const FEEDBACK_HREF = '/contact?subject=Feedback%20or%20issue'

export default function ReportIssueLink() {
  return (
    <Link
      href={FEEDBACK_HREF}
      className="fixed bottom-4 right-4 z-30 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800/90 text-gray-200 text-xs font-medium hover:bg-gray-700 hover:text-white transition-colors shadow-lg border border-gray-700/50"
      aria-label="Give feedback or report an issue"
    >
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      Feedback &amp; issues
    </Link>
  )
}
