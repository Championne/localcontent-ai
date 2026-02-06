'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import WelcomeModal from '@/components/WelcomeModal'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  userName: string
  isSalesUser?: boolean
}

export default function DashboardLayoutClient({ children, userName, isSalesUser = false }: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [checkingBusiness, setCheckingBusiness] = useState(true)
  const [usage, setUsage] = useState<{
    content: { used: number; limit: number; unlimited: boolean; percentage: number }
    subscription: { plan: string }
  } | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Check if user has any businesses and fetch usage on mount
  useEffect(() => {
    async function checkBusiness() {
      try {
        const response = await fetch('/api/business')
        if (response.ok) {
          const data = await response.json()
          // Show welcome modal if no businesses
          if (!data.businesses || data.businesses.length === 0) {
            setShowWelcome(true)
          }
        }
      } catch (err) {
        console.error('Failed to check business:', err)
      } finally {
        setCheckingBusiness(false)
      }
    }
    
    async function fetchUsage() {
      try {
        const response = await fetch('/api/usage')
        if (response.ok) {
          const data = await response.json()
          setUsage(data)
        }
      } catch (err) {
        console.error('Failed to fetch usage:', err)
      }
    }
    
    checkBusiness()
    fetchUsage()
  }, [])

  const handleWelcomeComplete = () => {
    setShowWelcome(false)
    // Redirect to Create Content page after onboarding
    // Use window.location for a full page reload to ensure fresh data
    window.location.href = '/dashboard/content'
  }

  // Build nav items - Sales only visible to sales team members
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/dashboard/content', label: 'Create a spark', icon: 'M12 4v16m8-8H4' },
    { href: '/dashboard/templates', label: 'Need a spark?', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { href: '/dashboard/library', label: 'Spark Library', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { href: '/dashboard/generations', label: 'Generations', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    // Sales-only: Outreach, Sales
    ...(isSalesUser ? [
      { href: '/dashboard/outreach', label: 'Outreach', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { href: '/dashboard/sales', label: 'Sales', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    ] : []),
    { href: '/dashboard/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Modal for first-time users */}
      {showWelcome && !checkingBusiness && (
        <WelcomeModal onComplete={handleWelcomeComplete} />
      )}

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
        <Link href="/dashboard" className="flex items-center">
          <Image 
            src="/logo-geospark.png" 
            alt="GeoSpark" 
            width={200} 
            height={56} 
            className="h-12 w-auto"
            priority
          />
        </Link>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center justify-center" onClick={() => setSidebarOpen(false)}>
            <Image 
              src="/logo-geospark.png" 
              alt="GeoSpark" 
              width={240} 
              height={80} 
              className="w-full max-w-[220px] h-auto"
              priority
            />
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="px-3 mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Menu</span>
          </div>
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname?.startsWith(item.href)
            return (
              <Link 
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Usage Card */}
        <div className="mx-3 mb-4 p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-teal-800 capitalize">
              {usage?.subscription?.plan || 'Free'} Plan
            </span>
            <span className="text-xs text-teal-600">
              {usage?.content?.unlimited 
                ? 'Unlimited' 
                : `${usage?.content?.used || 0}/${usage?.content?.limit || 5} posts`
              }
            </span>
          </div>
          <div className="w-full bg-teal-200 rounded-full h-2 mb-3">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all" 
              style={{ width: `${Math.min(usage?.content?.percentage || 0, 100)}%` }}
            />
          </div>
          {!usage?.content?.unlimited && (
            <Link 
              href="/pricing" 
              className="block text-center text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              Upgrade for unlimited
            </Link>
          )}
        </div>

        {/* User Section (Mobile) */}
        <div className="lg:hidden border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
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
              className="w-full text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span className="text-lg font-semibold text-gray-700">Spark your local content</span>
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
        <main className="p-4 lg:p-6 pt-20 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
