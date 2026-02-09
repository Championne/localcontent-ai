'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import WelcomeModal from '@/components/WelcomeModal'

interface Business {
  id: string
  name: string
  industry: string | null
  logo_url: string | null
  brand_primary_color?: string | null
}

interface DashboardLayoutClientProps {
  children: React.ReactNode
  userName: string
  isSalesUser?: boolean
}

/** Key used to persist the selected business ID across sessions */
const BUSINESS_STORAGE_KEY = 'geospark_selected_business_id'

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function DashboardLayoutClient({ children, userName, isSalesUser = false }: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [checkingBusiness, setCheckingBusiness] = useState(true)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false)
  const businessDropdownRef = useRef<HTMLDivElement>(null)
  const [usage, setUsage] = useState<{
    content: { used: number; limit: number; unlimited: boolean; percentage: number }
    subscription: { plan: string }
  } | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Close business dropdown when clicking outside
  useEffect(() => {
    if (!businessDropdownOpen) return
    const close = (e: MouseEvent) => {
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(e.target as Node)) {
        setBusinessDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [businessDropdownOpen])

  // Check if user has any businesses and fetch usage on mount
  useEffect(() => {
    async function checkBusiness() {
      try {
        const response = await fetch('/api/business')
        if (response.ok) {
          const data = await response.json()
          const list: Business[] = data.businesses || []
          setBusinesses(list)
          // Show welcome modal if no businesses
          if (list.length === 0) {
            setShowWelcome(true)
          } else {
            // Restore last selected business from localStorage, or default to first
            const stored = localStorage.getItem(BUSINESS_STORAGE_KEY)
            const match = list.find(b => b.id === stored)
            setSelectedBusinessId(match ? match.id : list[0].id)
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

  // Listen for brand updates from child pages (e.g. Brand Identity page saves new colors)
  useEffect(() => {
    const handleBusinessUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.business) {
        setBusinesses((prev) =>
          prev.map((b) => (b.id === detail.business.id ? { ...b, ...detail.business } : b))
        )
      }
    }
    window.addEventListener('geospark:business-updated', handleBusinessUpdated)
    return () => window.removeEventListener('geospark:business-updated', handleBusinessUpdated)
  }, [])

  // Listen for business selection changes from child pages (e.g. Details page dropdown)
  useEffect(() => {
    const onDetailsBusinessChanged = (e: Event) => {
      const id = (e as CustomEvent).detail?.businessId
      if (id && id !== selectedBusinessId) {
        setSelectedBusinessId(id)
        // localStorage already updated by the dispatching page
      }
    }
    window.addEventListener('geospark:details-business-changed', onDetailsBusinessChanged)
    return () => window.removeEventListener('geospark:details-business-changed', onDetailsBusinessChanged)
  }, [selectedBusinessId])

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId)
  const brandPrimary = (selectedBusiness?.brand_primary_color && /^#[0-9A-Fa-f]{6}$/.test(selectedBusiness.brand_primary_color)) ? selectedBusiness.brand_primary_color : '#0d9488'

  const handleSelectBusiness = (id: string) => {
    setSelectedBusinessId(id)
    setBusinessDropdownOpen(false)
    localStorage.setItem(BUSINESS_STORAGE_KEY, id)
    // Dispatch a custom event so pages can react to the change
    window.dispatchEvent(new CustomEvent('geospark:business-changed', { detail: { businessId: id } }))
  }

  const handleWelcomeComplete = () => {
    setShowWelcome(false)
    // Redirect to Create Content page after onboarding
    // Use window.location for a full page reload to ensure fresh data
    window.location.href = '/dashboard/content'
  }

  // Main menu (all users) — "Need a spark?" (templates) hidden until further notice
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/dashboard/content', label: 'Create a spark', icon: 'M12 4v16m8-8H4' },
    // { href: '/dashboard/templates', label: 'Need a spark?', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }, // hidden
    { href: '/dashboard/library', label: 'Spark Library', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { href: '/dashboard/branding', label: 'Brand Identity', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { href: '/dashboard/image-library', label: 'Brand Images', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { href: '/dashboard/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ]

  // GeoSpark internal (sales users only)
  const internalNavItems = isSalesUser
    ? [
        { href: '/dashboard/outreach', label: 'Email campaign', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { href: '/dashboard/sales', label: 'Sales', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { href: '/dashboard/generations', label: 'Generations', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { href: '/dashboard/image-studio', label: 'Image Studio', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z' },
      ]
    : []

  return (
    <div className="min-h-screen bg-gray-50" style={{ '--brand-primary': brandPrimary, '--brand-primary-10': hexToRgba(brandPrimary, 0.08), '--brand-primary-20': hexToRgba(brandPrimary, 0.15) } as React.CSSProperties}>
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
        flex flex-col
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <Link href="/dashboard" className="flex flex-col items-center" onClick={() => setSidebarOpen(false)}>
            <Image 
              src="/logo-geospark.png" 
              alt="GeoSpark" 
              width={240} 
              height={80} 
              className="w-full max-w-[220px] h-auto"
              priority
            />
            <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-gray-400 mt-1">Click · Spark · Post</span>
          </Link>
        </div>

        {/* Business Selector */}
        {businesses.length > 0 && (
          <div className="px-3 pt-3 pb-1" ref={businessDropdownRef}>
            {/* Prominent brand logo */}
            {selectedBusiness?.logo_url && (
              <div className="mb-2 flex items-center justify-center">
                <img src={selectedBusiness.logo_url} alt={selectedBusiness.name || ''} className="max-h-12 max-w-[180px] w-auto object-contain rounded-lg" />
              </div>
            )}
            <button
              onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border bg-white hover:bg-gray-50 transition-all text-left group"
              style={{ borderColor: hexToRgba(brandPrimary, 0.25) }}
            >
              {selectedBusiness?.logo_url ? (
                <img src={selectedBusiness.logo_url} alt="" className="w-7 h-7 rounded-md object-cover flex-shrink-0 ring-1 ring-gray-100" />
              ) : (
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ backgroundColor: brandPrimary }}
                >
                  {selectedBusiness?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{selectedBusiness?.name || 'Select business'}</p>
                {selectedBusiness?.industry && (
                  <p className="text-[10px] text-gray-400 truncate leading-tight">{selectedBusiness.industry}</p>
                )}
              </div>
              <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${businessDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {businessDropdownOpen && (
              <div className="mt-1 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden z-50 relative">
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBusiness(b.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                      selectedBusinessId === b.id ? '' : 'hover:bg-gray-50'
                    }`}
                    style={selectedBusinessId === b.id ? { backgroundColor: hexToRgba(brandPrimary, 0.08) } : {}}
                  >
                    {b.logo_url ? (
                      <img src={b.logo_url} alt="" className="w-6 h-6 rounded-md object-cover flex-shrink-0" />
                    ) : (
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
                        style={{ backgroundColor: b.brand_primary_color || '#0d9488' }}
                      >
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={selectedBusinessId === b.id ? { fontWeight: 600, color: brandPrimary } : { color: '#374151' }}>{b.name}</p>
                      {b.industry && <p className="text-[10px] text-gray-400 truncate leading-tight">{b.industry}</p>}
                    </div>
                    {selectedBusinessId === b.id && (
                      <svg className="w-4 h-4 flex-shrink-0" style={{ color: brandPrimary }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
                <Link
                  href="/dashboard/settings"
                  onClick={() => { setBusinessDropdownOpen(false); setSidebarOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 border-t border-gray-100 transition-colors"
                  style={{ '--tw-text-opacity': 1 } as React.CSSProperties}
                  onMouseEnter={e => (e.currentTarget.style.color = brandPrimary)}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add business
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 min-h-0 py-4 overflow-y-auto">
          <div className="px-3 mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Menu</span>
          </div>
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname?.startsWith(item.href) === true
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? '' : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive ? { backgroundColor: hexToRgba(brandPrimary, 0.1), color: brandPrimary } : {}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            )
          })}
          {internalNavItems.length > 0 && (
            <>
              <div className="px-3 mt-6 mb-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">GeoSpark internal</span>
              </div>
              {internalNavItems.map((item) => {
                const isActive = pathname?.startsWith(item.href) === true
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 mx-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive ? '' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={isActive ? { backgroundColor: hexToRgba(brandPrimary, 0.1), color: brandPrimary } : {}}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.label}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* Usage Card */}
        <div className="mx-3 mb-4 p-4 rounded-xl" style={{ background: `linear-gradient(135deg, ${hexToRgba(brandPrimary, 0.08)}, ${hexToRgba(brandPrimary, 0.16)})` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium capitalize" style={{ color: brandPrimary }}>
              {usage?.subscription?.plan || 'Free'} Plan
            </span>
            <span className="text-xs" style={{ color: hexToRgba(brandPrimary, 0.7) }}>
              {usage?.content?.unlimited 
                ? 'Unlimited' 
                : `${usage?.content?.used || 0}/${usage?.content?.limit || 5} posts`
              }
            </span>
          </div>
          <div className="w-full rounded-full h-2 mb-3" style={{ backgroundColor: hexToRgba(brandPrimary, 0.2) }}>
            <div 
              className="h-2 rounded-full transition-all" 
              style={{ width: `${Math.min(usage?.content?.percentage || 0, 100)}%`, backgroundColor: brandPrimary }}
            />
          </div>
          {!usage?.content?.unlimited && (
            <Link 
              href="/pricing" 
              className="block text-center text-sm font-medium transition-colors"
              style={{ color: brandPrimary }}
              onClick={() => setSidebarOpen(false)}
            >
              Upgrade for unlimited
            </Link>
          )}
        </div>

        {/* User Section (Mobile) */}
        <div className="lg:hidden border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: hexToRgba(brandPrimary, 0.15) }}>
              <span className="text-sm font-medium" style={{ color: brandPrimary }}>
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
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: hexToRgba(brandPrimary, 0.15) }}>
                <span className="text-sm font-medium" style={{ color: brandPrimary }}>
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
        <main
          className="p-4 lg:p-6 pt-20 lg:pt-6 min-h-[calc(100vh-4rem)]"
          style={{ background: `linear-gradient(180deg, ${hexToRgba(brandPrimary, 0.13)} 0%, ${hexToRgba(brandPrimary, 0.06)} 50%, ${hexToRgba(brandPrimary, 0.10)} 100%)` }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
