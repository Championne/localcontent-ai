'use client'

import { PhoneDialerProvider } from '@/components/sales/PhoneDialerProvider'
import { ActiveCallPanel } from '@/components/sales/ActiveCallPanel'
import SalesNavTabs from './SalesNavTabs'

interface SalesLayoutClientProps {
  children: React.ReactNode
}

export default function SalesLayoutClient({ children }: SalesLayoutClientProps) {
  return (
    <PhoneDialerProvider>
      <div className="space-y-6">
        <SalesNavTabs />
        {children}
      </div>
      <ActiveCallPanel />
    </PhoneDialerProvider>
  )
}
