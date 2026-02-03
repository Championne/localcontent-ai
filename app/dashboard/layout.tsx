import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from './DashboardLayoutClient'
import { checkSalesAccess } from '@/lib/auth/salesAccess'

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

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  
  // Check if user has access to sales module
  const salesAccess = await checkSalesAccess()

  return (
    <DashboardLayoutClient 
      userName={userName} 
      isSalesUser={salesAccess.isSalesUser}
    >
      {children}
    </DashboardLayoutClient>
  )
}
