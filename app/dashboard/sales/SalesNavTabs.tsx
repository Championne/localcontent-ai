'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard/sales', label: 'Overview' },
  { href: '/dashboard/sales/dialer', label: 'Call List' },
  { href: '/dashboard/sales/inbox', label: 'Inbox' },
  { href: '/dashboard/sales/team', label: 'Team' },
  { href: '/dashboard/sales/leads', label: 'Leads' },
  { href: '/dashboard/sales/deals', label: 'Pipeline' },
  { href: '/dashboard/sales/commissions', label: 'Commissions' },
  { href: '/dashboard/sales/feedback', label: 'Feedback' },
]

export default function SalesNavTabs() {
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard/sales' && pathname?.startsWith(item.href))
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                isActive 
                  ? 'border-teal-500 text-teal-600' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
