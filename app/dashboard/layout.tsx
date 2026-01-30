import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0]

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <Link href="/dashboard" className="text-xl font-bold text-teal-600">
            LocalContent.ai
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="px-3 mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Menu</span>
          </div>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 mx-2 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
          <Link 
            href="/dashboard/content" 
            className="flex items-center gap-3 mx-2 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Content
          </Link>
          <Link 
            href="/dashboard/library" 
            className="flex items-center gap-3 mx-2 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Content Library
          </Link>
          <Link 
            href="/dashboard/templates" 
            className="flex items-center gap-3 mx-2 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Templates
          </Link>
          <Link 
            href="/dashboard/settings" 
            className="flex items-center gap-3 mx-2 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </nav>

        {/* Usage Card */}
        <div className="mx-3 mb-4 p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-teal-800">Free Plan</span>
            <span className="text-xs text-teal-600">3/5 posts</span>
          </div>
          <div className="w-full bg-teal-200 rounded-full h-2 mb-3">
            <div className="bg-teal-600 h-2 rounded-full" style={{ width: '60%' }}></div>
          </div>
          <Link 
            href="/pricing" 
            className="block text-center text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
          >
            Upgrade for unlimited
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="text-sm text-gray-500">
            From hours to minutes
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-teal-700">
                  {userName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{userName}</span>
            </div>
            <form action="/auth/signout" method="post">
              <button 
                type="submit" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
