import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from './DashboardLayoutClient'

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

  return <DashboardLayoutClient userName={userName}>{children}</DashboardLayoutClient>
}
