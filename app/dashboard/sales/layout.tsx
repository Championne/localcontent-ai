import { redirect } from 'next/navigation'
import { checkSalesAccess } from '@/lib/auth/salesAccess'
import SalesLayoutClient from './SalesLayoutClient'

export default async function SalesLayout({ children }: { children: React.ReactNode }) {
  // Server-side access check - redirect non-sales users
  const salesAccess = await checkSalesAccess()
  
  if (!salesAccess.isSalesUser) {
    redirect('/dashboard')
  }

  return <SalesLayoutClient>{children}</SalesLayoutClient>
}
